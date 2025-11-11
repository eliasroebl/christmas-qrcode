const { query, get, run, isPostgres } = require('../config/database');

class QRCode {
  /**
   * Create a new QR code
   */
  static async create(token, expiresAt) {
    if (isPostgres) {
      // PostgreSQL: Use RETURNING to get the inserted ID
      const sql = `INSERT INTO qr_codes (token, expires_at) VALUES (?, ?) RETURNING id`;
      const rows = await query(sql, [token, expiresAt]);
      return { id: rows[0].id, token };
    } else {
      // SQLite: Use lastID
      const sql = `INSERT INTO qr_codes (token, expires_at) VALUES (?, ?)`;
      const result = await run(sql, [token, expiresAt]);
      return { id: result.lastID, token };
    }
  }

  /**
   * Find QR code by token
   */
  static async findByToken(token) {
    const sql = `SELECT * FROM qr_codes WHERE token = ?`;
    return await get(sql, [token]);
  }

  /**
   * Find QR code by verification token
   */
  static async findByVerificationToken(verificationToken) {
    const sql = `SELECT * FROM qr_codes WHERE verification_token = ?`;
    return await get(sql, [verificationToken]);
  }

  /**
   * Register donor email
   */
  static async registerDonor(token, email, verificationToken) {
    const sql = `
      UPDATE qr_codes
      SET donor_email = ?,
          verification_token = ?,
          status = 'DONOR_REGISTERED'
      WHERE token = ? AND status = 'UNUSED'
    `;
    const result = await run(sql, [email, verificationToken, token]);

    if (result.changes === 0) {
      throw new Error('QR code not found or already used');
    }

    return { success: true };
  }

  /**
   * Verify donor email
   */
  static async verifyDonor(verificationToken) {
    const sql = `
      UPDATE qr_codes
      SET donor_verified = ${isPostgres ? 'TRUE' : '1'}
      WHERE verification_token = ?
    `;
    const result = await run(sql, [verificationToken]);

    if (result.changes === 0) {
      throw new Error('Verification token not found');
    }

    return { success: true };
  }

  /**
   * Upload recipient content (photo + message)
   */
  static async uploadRecipientContent(token, photoPath, message) {
    const sql = `
      UPDATE qr_codes
      SET recipient_photo_path = ?,
          recipient_message = ?,
          status = 'COMPLETED',
          completed_at = ${isPostgres ? 'CURRENT_TIMESTAMP' : 'CURRENT_TIMESTAMP'}
      WHERE token = ? AND status = 'DONOR_REGISTERED' AND donor_verified = ${isPostgres ? 'TRUE' : '1'}
    `;
    const result = await run(sql, [photoPath, message, token]);

    if (result.changes === 0) {
      throw new Error('QR code not ready for recipient upload');
    }

    return { success: true };
  }

  /**
   * Mark email as sent
   */
  static async markEmailSent(token) {
    const sql = `UPDATE qr_codes SET email_sent_at = CURRENT_TIMESTAMP WHERE token = ?`;
    await run(sql, [token]);
    return { success: true };
  }

  /**
   * Get all QR codes (for admin)
   */
  static async getAll() {
    const sql = `SELECT * FROM qr_codes ORDER BY created_at DESC`;
    return await query(sql);
  }

  /**
   * Get statistics
   */
  static async getStatistics() {
    const sql = `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'UNUSED' THEN 1 ELSE 0 END) as unused,
        SUM(CASE WHEN status = 'DONOR_REGISTERED' THEN 1 ELSE 0 END) as waiting_for_recipient,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN donor_verified = ${isPostgres ? 'TRUE' : '1'} THEN 1 ELSE 0 END) as verified_donors
      FROM qr_codes
    `;
    return await get(sql);
  }
}

module.exports = QRCode;
