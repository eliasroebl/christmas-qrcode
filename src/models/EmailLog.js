const { query, run, isPostgres } = require('../config/database');

class EmailLog {
  /**
   * Log an email send attempt
   */
  static async create(qrCodeId, recipientEmail, subject, status = 'sent', errorMessage = null) {
    if (isPostgres) {
      // PostgreSQL: Use RETURNING to get the inserted ID
      const sql = `
        INSERT INTO email_log (qr_code_id, recipient_email, subject, status, error_message)
        VALUES (?, ?, ?, ?, ?)
        RETURNING id
      `;
      const rows = await query(sql, [qrCodeId, recipientEmail, subject, status, errorMessage]);
      return { id: rows[0].id };
    } else {
      // SQLite: Use lastID
      const sql = `
        INSERT INTO email_log (qr_code_id, recipient_email, subject, status, error_message)
        VALUES (?, ?, ?, ?, ?)
      `;
      const result = await run(sql, [qrCodeId, recipientEmail, subject, status, errorMessage]);
      return { id: result.lastID };
    }
  }

  /**
   * Get logs for a specific QR code
   */
  static async getByQRCodeId(qrCodeId) {
    const sql = `SELECT * FROM email_log WHERE qr_code_id = ? ORDER BY sent_at DESC`;
    return await query(sql, [qrCodeId]);
  }
}

module.exports = EmailLog;
