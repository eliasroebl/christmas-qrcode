require('dotenv').config();
const db = require('../config/database');

const schema = `
  CREATE TABLE IF NOT EXISTS qr_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'UNUSED' CHECK(status IN ('UNUSED', 'DONOR_REGISTERED', 'COMPLETED', 'EXPIRED')),

    -- Donor information
    donor_email TEXT,
    donor_verified INTEGER DEFAULT 0,
    verification_token TEXT,

    -- Recipient information
    recipient_photo_path TEXT,
    recipient_message TEXT,

    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    donor_scanned_at DATETIME,
    recipient_scanned_at DATETIME,
    email_sent_at DATETIME,
    expires_at DATETIME,

    -- Optional tracking
    language_preference TEXT DEFAULT 'de'
  );

  CREATE INDEX IF NOT EXISTS idx_token ON qr_codes(token);
  CREATE INDEX IF NOT EXISTS idx_status ON qr_codes(status);
  CREATE INDEX IF NOT EXISTS idx_verification_token ON qr_codes(verification_token);

  CREATE TABLE IF NOT EXISTS email_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    qr_code_id INTEGER NOT NULL,
    recipient_email TEXT NOT NULL,
    subject TEXT,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'sent' CHECK(status IN ('sent', 'failed', 'bounced')),
    error_message TEXT,
    FOREIGN KEY (qr_code_id) REFERENCES qr_codes(id)
  );

  CREATE INDEX IF NOT EXISTS idx_email_qr ON email_log(qr_code_id);
`;

db.exec(schema, (err) => {
  if (err) {
    console.error('❌ Error creating tables:', err.message);
    process.exit(1);
  } else {
    console.log('✓ Database tables created successfully');
    db.close();
  }
});
