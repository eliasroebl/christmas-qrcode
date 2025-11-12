const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const path = require('path');

// Determine database type from environment
const isPostgres = !!process.env.DATABASE_URL;
const dbType = isPostgres ? 'postgres' : 'sqlite';

let db;
let pool;

if (isPostgres) {
  // PostgreSQL configuration
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  pool.on('error', (err) => {
    console.error('PostgreSQL pool error:', err);
  });

  console.log('✓ Connected to PostgreSQL database');
} else {
  // SQLite configuration
  const dbPath = process.env.DB_PATH || path.join(__dirname, '../../database.sqlite');

  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    } else {
      console.log('✓ Connected to SQLite database');
    }
  });
}

/**
 * Unified query interface that works with both SQLite and PostgreSQL
 * Automatically converts ? placeholders to $1, $2 for PostgreSQL
 */
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (isPostgres) {
      // Convert ? placeholders to $1, $2, etc. for PostgreSQL
      let paramIndex = 1;
      const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);

      pool.query(pgSql, params, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.rows);
        }
      });
    } else {
      // SQLite query
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      } else {
        db.run(sql, params, function(err) {
          if (err) reject(err);
          else resolve({ lastID: this.lastID, changes: this.changes });
        });
      }
    }
  });
}

/**
 * Get a single row
 */
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (isPostgres) {
      let paramIndex = 1;
      const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);

      pool.query(pgSql, params, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.rows[0] || null);
        }
      });
    } else {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    }
  });
}

/**
 * Run a query (INSERT, UPDATE, DELETE)
 */
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (isPostgres) {
      let paramIndex = 1;
      const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);

      pool.query(pgSql, params, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            lastID: result.rows[0]?.id || null,
            changes: result.rowCount
          });
        }
      });
    } else {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    }
  });
}

/**
 * Initialize database tables
 */
async function initializeTables() {
  try {
    if (isPostgres) {
      // PostgreSQL table creation
      await query(`
        CREATE TABLE IF NOT EXISTS qr_codes (
          id SERIAL PRIMARY KEY,
          token VARCHAR(255) UNIQUE NOT NULL,
          status VARCHAR(50) DEFAULT 'UNUSED',
          donor_email VARCHAR(255),
          donor_verified BOOLEAN DEFAULT FALSE,
          verification_token VARCHAR(255),
          recipient_photo_path TEXT,
          recipient_message TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP NOT NULL,
          completed_at TIMESTAMP,
          email_sent_at TIMESTAMP
        )
      `);

      await query(`
        CREATE TABLE IF NOT EXISTS email_log (
          id SERIAL PRIMARY KEY,
          qr_code_id INTEGER REFERENCES qr_codes(id),
          recipient_email VARCHAR(255) NOT NULL,
          subject VARCHAR(255) NOT NULL,
          status VARCHAR(50) DEFAULT 'sent',
          error_message TEXT,
          sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create indexes
      await query(`CREATE INDEX IF NOT EXISTS idx_qr_codes_token ON qr_codes(token)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_qr_codes_status ON qr_codes(status)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_email_log_qr_code_id ON email_log(qr_code_id)`);

      // Add missing column if it doesn't exist (migration)
      try {
        await query(`ALTER TABLE qr_codes ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMP`);
      } catch (err) {
        // Column might already exist, ignore error
        console.log('Note: email_sent_at column already exists or could not be added');
      }
    } else {
      // SQLite table creation
      await query(`
        CREATE TABLE IF NOT EXISTS qr_codes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          token TEXT UNIQUE NOT NULL,
          status TEXT DEFAULT 'UNUSED',
          donor_email TEXT,
          donor_verified INTEGER DEFAULT 0,
          verification_token TEXT,
          recipient_photo_path TEXT,
          recipient_message TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          expires_at DATETIME NOT NULL,
          completed_at DATETIME,
          email_sent_at DATETIME
        )
      `);

      await query(`
        CREATE TABLE IF NOT EXISTS email_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          qr_code_id INTEGER,
          recipient_email TEXT NOT NULL,
          subject TEXT NOT NULL,
          status TEXT DEFAULT 'sent',
          error_message TEXT,
          sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (qr_code_id) REFERENCES qr_codes(id)
        )
      `);

      // Create indexes
      await query(`CREATE INDEX IF NOT EXISTS idx_qr_codes_token ON qr_codes(token)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_qr_codes_status ON qr_codes(status)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_email_log_qr_code_id ON email_log(qr_code_id)`);
    }

    console.log('✓ Database tables initialized');
  } catch (error) {
    console.error('Error initializing tables:', error);
    throw error;
  }
}

module.exports = {
  db,
  pool,
  query,
  get,
  run,
  initializeTables,
  isPostgres,
  dbType
};
