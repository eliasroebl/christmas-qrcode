const express = require('express');
const router = express.Router();
const QRCodeModel = require('../models/QRCode');

// Simple authentication middleware (you should enhance this!)
const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (!authHeader || authHeader !== `Bearer ${adminPassword}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
};

/**
 * GET /api/admin/statistics
 * Get overall statistics
 */
router.get('/statistics', adminAuth, async (req, res) => {
  try {
    const stats = await QRCodeModel.getStatistics();
    res.json(stats);
  } catch (error) {
    console.error('Error getting statistics:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

/**
 * GET /api/admin/qr-codes
 * Get all QR codes
 */
router.get('/qr-codes', adminAuth, async (req, res) => {
  try {
    const qrCodes = await QRCodeModel.getAll();
    res.json(qrCodes);
  } catch (error) {
    console.error('Error getting QR codes:', error);
    res.status(500).json({ error: 'Failed to get QR codes' });
  }
});

module.exports = router;
