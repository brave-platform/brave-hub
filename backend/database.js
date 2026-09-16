const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dir = __dirname;
fs.mkdirSync(dir, { recursive: true });
const db = new Database(path.join(dir, 'brave.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 brave_id TEXT UNIQUE NOT NULL,
 username TEXT UNIQUE NOT NULL,
 fullname TEXT NOT NULL,
 email TEXT UNIQUE NOT NULL,
 country TEXT NOT NULL DEFAULT 'Nigeria',
 phone TEXT,
 password_hash TEXT NOT NULL,
 profile_image TEXT DEFAULT '',
 account_status TEXT DEFAULT 'active',
 verification_status TEXT DEFAULT 'unverified',
 email_verified INTEGER DEFAULT 0,
 phone_verified INTEGER DEFAULT 0,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS products (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 public_id TEXT UNIQUE NOT NULL,
 owner_id TEXT,
 owner_name TEXT NOT NULL,
 owner_username TEXT,
 name TEXT NOT NULL,
 category TEXT DEFAULT 'General',
 description TEXT,
 price REAL,
 delivery_price REAL,
 payment_method TEXT DEFAULT 'pay_on_delivery',
 image_data TEXT DEFAULT '',
 video_data TEXT DEFAULT '',
 featured INTEGER DEFAULT 0,
 status TEXT DEFAULT 'active',
 created_at TEXT DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS services (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 public_id TEXT UNIQUE NOT NULL,
 owner_id TEXT,
 owner_name TEXT NOT NULL,
 owner_username TEXT,
 name TEXT NOT NULL,
 category TEXT DEFAULT 'Professional service',
 description TEXT,
 price REAL,
 image_data TEXT DEFAULT '',
 video_data TEXT DEFAULT '',
 status TEXT DEFAULT 'active',
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS timeline_posts (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 public_id TEXT UNIQUE NOT NULL,
 user_id TEXT,
 username TEXT,
 fullname TEXT,
 text TEXT,
 media_data TEXT DEFAULT '',
 media_type TEXT DEFAULT '',
 status TEXT DEFAULT 'active',
 views INTEGER DEFAULT 0,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS records (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 public_id TEXT UNIQUE NOT NULL,
 user_id TEXT NOT NULL,
 record_type TEXT NOT NULL,
 title TEXT,
 details TEXT,
 amount REAL,
 reference TEXT,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS receipts (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 public_id TEXT UNIQUE NOT NULL,
 user_id TEXT,
 type TEXT NOT NULL,
 sender TEXT,
 recipient TEXT,
 reference TEXT,
 work TEXT,
 amount REAL,
 delivery REAL,
 payment_status TEXT,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS businesses (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 public_id TEXT UNIQUE NOT NULL,
 owner_id TEXT NOT NULL,
 username TEXT,
 name TEXT NOT NULL,
 category TEXT,
 description TEXT,
 phone TEXT,
 email TEXT,
 address TEXT,
 website TEXT,
 logo_data TEXT DEFAULT '',
 status TEXT DEFAULT 'active',
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS customers (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 public_id TEXT UNIQUE NOT NULL,
 user_id TEXT NOT NULL,
 name TEXT NOT NULL,
 contact TEXT,
 notes TEXT,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS messages (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 public_id TEXT UNIQUE NOT NULL,
 sender_id TEXT,
 receiver_id TEXT,
 message TEXT NOT NULL,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS notifications (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 public_id TEXT UNIQUE NOT NULL,
 user_id TEXT,
 title TEXT NOT NULL,
 message TEXT NOT NULL,
 is_read INTEGER DEFAULT 0,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS protected_requests (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 public_id TEXT UNIQUE NOT NULL,
 user_id TEXT NOT NULL,
 type TEXT NOT NULL,
 reason TEXT,
 requested_value TEXT,
 status TEXT DEFAULT 'pending',
 admin_note TEXT,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS advertising_requests (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 public_id TEXT UNIQUE NOT NULL,
 user_id TEXT,
 title TEXT NOT NULL,
 category TEXT,
 description TEXT,
 contact TEXT,
 status TEXT DEFAULT 'pending',
 created_at TEXT DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS reports (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 public_id TEXT UNIQUE NOT NULL,
 reporter_id TEXT,
 content_type TEXT,
 content_id TEXT,
 reason TEXT,
 status TEXT DEFAULT 'pending',
 admin_note TEXT,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS security_events (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 public_id TEXT UNIQUE NOT NULL,
 user_id TEXT,
 event_type TEXT NOT NULL,
 ip TEXT,
 user_agent TEXT,
 details TEXT,
 risk_score INTEGER DEFAULT 0,
 status TEXT DEFAULT 'review',
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS ai_conversations (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 public_id TEXT UNIQUE NOT NULL,
 user_id TEXT,
 message TEXT NOT NULL,
 reply TEXT NOT NULL,
 locale TEXT DEFAULT 'ng',
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reset_tokens (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 token_hash TEXT UNIQUE NOT NULL,
 user_id TEXT NOT NULL,
 expires_at TEXT NOT NULL,
 used_at TEXT,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS reviews (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 public_id TEXT UNIQUE NOT NULL,
 reviewer_id TEXT NOT NULL,
 reviewed_user_id TEXT NOT NULL,
 product_id TEXT,
 service_id TEXT,
 rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
 review_text TEXT,
 status TEXT DEFAULT 'approved',
 flag_status TEXT DEFAULT 'none',
 created_at TEXT DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS review_flags (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 public_id TEXT UNIQUE NOT NULL,
 review_id INTEGER NOT NULL,
 reporter_id TEXT,
 reason TEXT NOT NULL,
 status TEXT DEFAULT 'pending',
 created_at TEXT DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(review_id) REFERENCES reviews(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS moderation (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 public_id TEXT UNIQUE NOT NULL,
 content_type TEXT NOT NULL,
 content_id TEXT NOT NULL,
 status TEXT DEFAULT 'pending',
 reason TEXT,
 admin_id TEXT,
 notes TEXT,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS admin_audit (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 public_id TEXT UNIQUE NOT NULL,
 action TEXT NOT NULL,
 target_type TEXT,
 target_id TEXT,
 details TEXT,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

// Upgrade older databases safely.
for (const sql of [
  "ALTER TABLE users ADD COLUMN username TEXT",
  "ALTER TABLE users ADD COLUMN profile_image TEXT DEFAULT ''",
  "ALTER TABLE users ADD COLUMN updated_at TEXT DEFAULT CURRENT_TIMESTAMP"
]) { try { db.exec(sql); } catch (_) {} }

console.log('BRAVE database connected successfully.');
module.exports = db;
