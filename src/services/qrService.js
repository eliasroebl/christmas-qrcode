const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const QRCodeModel = require('../models/QRCode');

class QRService {
  /**
   * Generate multiple QR codes and store in database
   * @param {number} count - Number of QR codes to generate
   * @returns {Promise<Array>} Array of generated tokens
   */
  static async generateTokens(count = 100) {
    const tokens = [];
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 18); // 18 months expiry

    for (let i = 0; i < count; i++) {
      const token = uuidv4();
      await QRCodeModel.create(token, expiresAt.toISOString());
      tokens.push(token);
    }

    return tokens;
  }

  /**
   * Generate PDF with QR codes (15 per page)
   * @param {Array} tokens - Array of tokens to generate QR codes for
   * @returns {Promise<Buffer>} PDF buffer
   */
  static async generatePDF(tokens) {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 40 });
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        const appUrl = process.env.APP_URL || 'http://localhost:3000';
        const codesPerPage = 15;
        const codesPerRow = 3;
        const codesPerColumn = 5;

        // Layout settings
        const pageWidth = 595; // A4 width in points
        const pageHeight = 842; // A4 height in points
        const margin = 40;
        const usableWidth = pageWidth - (margin * 2);
        const usableHeight = pageHeight - (margin * 2);

        const qrSize = 120;
        const horizontalSpacing = (usableWidth - (codesPerRow * qrSize)) / (codesPerRow + 1);
        const verticalSpacing = (usableHeight - (codesPerColumn * qrSize)) / (codesPerColumn + 1);

        for (let i = 0; i < tokens.length; i++) {
          const token = tokens[i];
          const url = `${appUrl}/scan?code=${token}`;

          // Generate QR code as data URL
          const qrDataUrl = await QRCode.toDataURL(url, {
            width: qrSize * 2,
            margin: 1,
            errorCorrectionLevel: 'M'
          });

          // Calculate position
          const pageIndex = i % codesPerPage;
          const row = Math.floor(pageIndex / codesPerRow);
          const col = pageIndex % codesPerRow;

          const x = margin + horizontalSpacing * (col + 1) + qrSize * col;
          const y = margin + verticalSpacing * (row + 1) + qrSize * row;

          // Add new page if needed
          if (i > 0 && i % codesPerPage === 0) {
            doc.addPage();
          }

          // Draw QR code
          doc.image(qrDataUrl, x, y, { width: qrSize, height: qrSize });

          // Add token below QR code (small text)
          doc.fontSize(6)
             .text(token.slice(0, 8), x, y + qrSize + 2, {
               width: qrSize,
               align: 'center'
             });
        }

        // Add footer on first page
        doc.fontSize(10)
           .text(`Generated: ${new Date().toLocaleDateString('de-DE')} | Total codes: ${tokens.length}`,
                 margin, pageHeight - margin + 10, {
                   width: usableWidth,
                   align: 'center'
                 });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate QR codes and return PDF
   * @param {number} count - Number of QR codes to generate
   * @returns {Promise<Buffer>} PDF buffer
   */
  static async generateQRCodesPDF(count = 100) {
    const tokens = await this.generateTokens(count);
    const pdfBuffer = await this.generatePDF(tokens);
    return pdfBuffer;
  }
}

module.exports = QRService;
