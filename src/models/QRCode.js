const db = require('../config/database');

class QRCode {
  /**
   * Create a new QR code
   */
  static create(token, expiresAt) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO qr_codes (token, expires_at) VALUES (?, ?)`;
      db.run(sql, [token, expiresAt], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, token });
      });
    });
  }

  /**
   * Find QR code by token
   */
  static findByToken(token) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM qr_codes WHERE token = ?`;
      db.get(sql, [token], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  /**
   * Find QR code by verification token
   */
  static findByVerificationToken(verificationToken) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM qr_codes WHERE verification_token = ?`;
      db.get(sql, [verificationToken], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  /**
   * Register donor email
   */
  static registerDonor(token, email, verificationToken) {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE qr_codes
        SET donor_email = ?,
            verification_token = ?,
            donor_scanned_at = CURRENT_TIMESTAMP,
            status = 'DONOR_REGISTERED'
        WHERE token = ? AND status = 'UNUSED'
      `;
      db.run(sql, [email, verificationToken, token], function(err) {
        if (err) reject(err);
        else if (this.changes === 0) reject(new Error('QR code not found or already used'));
        else resolve({ success: true });
      });
    });
  }

  /**
   * Verify donor email
   */
  static verifyDonor(verificationToken) {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE qr_codes
        SET donor_verified = 1
        WHERE verification_token = ?
      `;
      db.run(sql, [verificationToken], function(err) {
        if (err) reject(err);
        else if (this.changes === 0) reject(new Error('Verification token not found'));
        else resolve({ success: true });
      });
    });
  }

  /**
   * Upload recipient content (photo + message)
   */
  static uploadRecipientContent(token, photoPath, message) {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE qr_codes
        SET recipient_photo_path = ?,
            recipient_message = ?,
            recipient_scanned_at = CURRENT_TIMESTAMP,
            status = 'COMPLETED'
        WHERE token = ? AND status = 'DONOR_REGISTERED' AND donor_verified = 1
      `;
      db.run(sql, [photoPath, message, token], function(err) {
        if (err) reject(err);
        else if (this.changes === 0) reject(new Error('QR code not ready for recipient upload'));
        else resolve({ success: true });
      });
    });
  }

  /**
   * Mark email as sent
   */
  static markEmailSent(token) {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE qr_codes SET email_sent_at = CURRENT_TIMESTAMP WHERE token = ?`;
      db.run(sql, [token], (err) => {
        if (err) reject(err);
        else resolve({ success: true });
      });
    });
  }

  /**
   * Get all QR codes (for admin)
   */
  static getAll() {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM qr_codes ORDER BY created_at DESC`;
      db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  /**
   * Get statistics
   */
  static getStatistics() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN status = 'UNUSED' THEN 1 ELSE 0 END) as unused,
          SUM(CASE WHEN status = 'DONOR_REGISTERED' THEN 1 ELSE 0 END) as waiting_for_recipient,
          SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN donor_verified = 1 THEN 1 ELSE 0 END) as verified_donors
        FROM qr_codes
      `;
      db.get(sql, [], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
}

module.exports = QRCode;
