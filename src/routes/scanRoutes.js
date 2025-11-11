const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const QRCodeModel = require('../models/QRCode');
const emailService = require('../services/emailService');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.env.UPLOAD_PATH || './uploads');
  },
  filename: function (req, file, cb) {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  }
});

/**
 * GET /api/scan/status/:token
 * Get status of a QR code
 */
router.get('/status/:token', async (req, res) => {
  try {
    const qrCode = await QRCodeModel.findByToken(req.params.token);

    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    // Check if expired
    if (new Date(qrCode.expires_at) < new Date()) {
      return res.json({ status: 'EXPIRED' });
    }

    res.json({
      status: qrCode.status,
      donorVerified: !!qrCode.donor_verified, // Works for both PostgreSQL (true/false) and SQLite (1/0)
      hasPhoto: !!qrCode.recipient_photo_path,
      emailSent: !!qrCode.email_sent_at
    });
  } catch (error) {
    console.error('Error getting status:', error);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

/**
 * POST /api/scan/register-donor
 * Register donor email (first scan)
 * Body: { token, email, gdprConsent }
 */
router.post('/register-donor', async (req, res) => {
  try {
    const { token, email, gdprConsent } = req.body;

    if (!token || !email || !gdprConsent) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const qrCode = await QRCodeModel.findByToken(token);

    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    if (qrCode.status !== 'UNUSED') {
      return res.status(400).json({ error: 'QR code already registered' });
    }

    // Check expiry
    if (new Date(qrCode.expires_at) < new Date()) {
      return res.status(400).json({ error: 'QR code has expired' });
    }

    // Generate verification token
    const verificationToken = uuidv4();

    // Update database
    await QRCodeModel.registerDonor(token, email, verificationToken);

    // Send verification email
    await emailService.sendVerificationEmail(email, verificationToken, token);

    res.json({
      success: true,
      message: 'Verification email sent. Please check your inbox.'
    });
  } catch (error) {
    console.error('Error registering donor:', error);
    res.status(500).json({ error: 'Failed to register donor' });
  }
});

/**
 * GET /api/scan/verify/:token
 * Verify donor email
 */
router.get('/verify/:token', async (req, res) => {
  try {
    const qrCode = await QRCodeModel.findByVerificationToken(req.params.token);

    if (!qrCode) {
      return res.status(404).json({ error: 'Verification token not found' });
    }

    await QRCodeModel.verifyDonor(req.params.token);

    res.json({
      success: true,
      message: 'Email verified successfully! Your QR code is now active.'
    });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ error: 'Failed to verify email' });
  }
});

/**
 * POST /api/scan/upload-recipient
 * Upload recipient photo and message (second scan)
 * Body: FormData with photo, message, token
 */
router.post('/upload-recipient', upload.single('photo'), async (req, res) => {
  try {
    const { token, message } = req.body;

    // Debug logging
    console.log('Upload recipient - req.body:', req.body);
    console.log('Upload recipient - message value:', message);
    console.log('Upload recipient - message type:', typeof message);

    if (!token) {
      return res.status(400).json({ error: 'Missing token' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Photo is required' });
    }

    const qrCode = await QRCodeModel.findByToken(token);

    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    if (qrCode.status !== 'DONOR_REGISTERED') {
      if (qrCode.status === 'UNUSED') {
        return res.status(400).json({ error: 'QR code has not been activated by donor yet' });
      }
      return res.status(400).json({ error: 'QR code already completed' });
    }

    if (!qrCode.donor_verified) { // Works for both PostgreSQL (true/false) and SQLite (1/0)
      return res.status(400).json({ error: 'Donor email not yet verified' });
    }

    // Update database with photo and message
    // Handle empty message or whitespace-only message
    const recipientMessage = (message && message.trim()) ? message.trim() : null;
    console.log('Saving message to DB:', recipientMessage);

    await QRCodeModel.uploadRecipientContent(token, req.file.path, recipientMessage);

    // Get updated QR code data
    const updatedQRCode = await QRCodeModel.findByToken(token);

    // Send thank you email to donor
    await emailService.sendThankYouEmail(updatedQRCode);

    // Mark email as sent
    await QRCodeModel.markEmailSent(token);

    res.json({
      success: true,
      message: 'Thank you! Your message has been sent to the donor.'
    });
  } catch (error) {
    console.error('Error uploading recipient content:', error);
    res.status(500).json({ error: 'Failed to upload content' });
  }
});

module.exports = router;
