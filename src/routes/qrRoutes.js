const express = require('express');
const router = express.Router();
const QRService = require('../services/qrService');

/**
 * POST /api/qr/generate
 * Generate QR codes as PDF
 * Body: { count: number }
 */
router.post('/generate', async (req, res) => {
  try {
    const count = parseInt(req.body.count) || 100;

    if (count < 1 || count > 500) {
      return res.status(400).json({ error: 'Count must be between 1 and 500' });
    }

    const pdfBuffer = await QRService.generateQRCodesPDF(count);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="qr-codes-${Date.now()}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating QR codes:', error);
    res.status(500).json({ error: 'Failed to generate QR codes' });
  }
});

module.exports = router;
