const db = require('../config/database');

class EmailLog {
  /**
   * Log an email send attempt
   */
  static create(qrCodeId, recipientEmail, subject, status = 'sent', errorMessage = null) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO email_log (qr_code_id, recipient_email, subject, status, error_message)
        VALUES (?, ?, ?, ?, ?)
      `;
      db.run(sql, [qrCodeId, recipientEmail, subject, status, errorMessage], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
  }

  /**
   * Get logs for a specific QR code
   */
  static getByQRCodeId(qrCodeId) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM email_log WHERE qr_code_id = ? ORDER BY sent_at DESC`;
      db.all(sql, [qrCodeId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

module.exports = EmailLog;
