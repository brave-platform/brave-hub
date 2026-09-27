const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const dir = __dirname;
fs.mkdirSync(dir, { recursive: true });
const dbPath = process.env.BRAVE_DB_PATH || path.join(dir, 'brave.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const native = new DatabaseSync(dbPath);
const db = {
  name: dbPath,
  exec: (sql) => native.exec(sql),
  prepare: (sql) => native.prepare(sql),
  pragma: (sql) => native.exec(`PRAGMA ${sql}`),
  transaction: (fn) => () => { native.exec('BEGIN'); try { const out=fn(); native.exec('COMMIT'); return out; } catch(e) { try{native.exec('ROLLBACK')}catch(_){} throw e; } },
  close: () => native.close()
};
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
 account_type TEXT DEFAULT 'Buyer',
 password_hash TEXT NOT NULL,
 profile_image TEXT DEFAULT '',
 account_status TEXT DEFAULT 'active',
 verification_status TEXT DEFAULT 'unverified',
 email_verified INTEGER DEFAULT 0,
 phone_verified INTEGER DEFAULT 0,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
 terms_accepted_at TEXT
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
 payment_method TEXT DEFAULT 'pay_after_service',
 image_data TEXT DEFAULT '',
 video_data TEXT DEFAULT '',
 status TEXT DEFAULT 'active',
 created_at TEXT DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT DEFAULT CURRENT_TIMESTAMP
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
CREATE TABLE IF NOT EXISTS login_events (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 public_id TEXT UNIQUE NOT NULL,
 user_id TEXT,
 identifier TEXT,
 success INTEGER DEFAULT 0,
 ip TEXT,
 user_agent TEXT,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS workshop_documents (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 public_id TEXT UNIQUE NOT NULL,
 user_id TEXT NOT NULL,
 tool_type TEXT NOT NULL,
 title TEXT,
 content TEXT,
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
CREATE TABLE IF NOT EXISTS customer_requests (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 public_id TEXT UNIQUE NOT NULL,
 user_id TEXT NOT NULL,
 subject TEXT NOT NULL,
 description TEXT NOT NULL,
 status TEXT DEFAULT 'pending',
 admin_note TEXT DEFAULT '',
 created_at TEXT DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS advisor_messages (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 public_id TEXT UNIQUE NOT NULL,
 user_id TEXT NOT NULL,
 sender_role TEXT NOT NULL DEFAULT 'user',
 message TEXT NOT NULL,
 image_data TEXT DEFAULT '',
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS announcements (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 public_id TEXT UNIQUE NOT NULL,
 title TEXT NOT NULL,
 body TEXT NOT NULL,
 active INTEGER DEFAULT 1,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 public_id TEXT UNIQUE NOT NULL,
 buyer_id TEXT NOT NULL,
 status TEXT DEFAULT 'pending_payment',
 subtotal REAL NOT NULL DEFAULT 0,
 delivery REAL NOT NULL DEFAULT 0,
 total REAL NOT NULL DEFAULT 0,
 delivery_address TEXT NOT NULL,
 payment_method TEXT DEFAULT 'bank_transfer',
 payment_status TEXT DEFAULT 'pending',
 payment_evidence TEXT DEFAULT '',
 created_at TEXT DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS order_items (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 order_id TEXT NOT NULL,
 product_id TEXT NOT NULL,
 seller_id TEXT,
 seller_name TEXT,
 product_name TEXT NOT NULL,
 quantity INTEGER NOT NULL DEFAULT 1,
 unit_price REAL NOT NULL DEFAULT 0,
 total REAL NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS plans (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 code TEXT UNIQUE NOT NULL,
 name TEXT NOT NULL,
 price REAL NOT NULL,
 billing TEXT NOT NULL,
 features TEXT NOT NULL,
 active INTEGER DEFAULT 1
);
CREATE TABLE IF NOT EXISTS subscriptions (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 public_id TEXT UNIQUE NOT NULL,
 user_id TEXT NOT NULL,
 plan_code TEXT NOT NULL,
 status TEXT DEFAULT 'pending',
 starts_at TEXT,
 ends_at TEXT,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS bank_settings (
 id INTEGER PRIMARY KEY CHECK(id=1),
 bank_name TEXT DEFAULT '',
 account_name TEXT DEFAULT '',
 account_number TEXT DEFAULT '',
 instructions TEXT DEFAULT '',
 updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS timeline_likes (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 post_id TEXT NOT NULL,
 user_id TEXT NOT NULL,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(post_id,user_id)
);
CREATE TABLE IF NOT EXISTS timeline_comments (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 public_id TEXT UNIQUE NOT NULL,
 post_id TEXT NOT NULL,
 user_id TEXT NOT NULL,
 username TEXT,
 fullname TEXT,
 comment TEXT NOT NULL,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS daily_reports (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 public_id TEXT UNIQUE NOT NULL,
 user_id TEXT NOT NULL,
 report_date TEXT NOT NULL,
 title TEXT NOT NULL,
 summary TEXT NOT NULL,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS password_reset_tokens (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 token_hash TEXT UNIQUE NOT NULL,
 user_id TEXT NOT NULL,
 expires_at TEXT NOT NULL,
 used_at TEXT,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS admin_chat_sessions (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 public_id TEXT UNIQUE NOT NULL,
 user_id TEXT UNIQUE NOT NULL,
 started_at TEXT NOT NULL,
 last_activity_at TEXT NOT NULL,
 expires_at TEXT NOT NULL,
 status TEXT DEFAULT 'open',
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_products_status_random ON products(status);
CREATE INDEX IF NOT EXISTS idx_services_status_random ON services(status);
CREATE INDEX IF NOT EXISTS idx_messages_pair ON messages(sender_id,receiver_id,created_at);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_expiry ON password_reset_tokens(expires_at);
`);

// Upgrade older databases safely.
for (const sql of [
  "ALTER TABLE users ADD COLUMN username TEXT",
  "ALTER TABLE users ADD COLUMN verification_serial TEXT",
  "ALTER TABLE products ADD COLUMN pdf_data TEXT DEFAULT ''",
  "ALTER TABLE services ADD COLUMN pdf_data TEXT DEFAULT ''",
  "ALTER TABLE services ADD COLUMN payment_method TEXT DEFAULT 'pay_after_service'",
  "ALTER TABLE users ADD COLUMN profile_image TEXT DEFAULT ''",
  "ALTER TABLE users ADD COLUMN updated_at TEXT DEFAULT CURRENT_TIMESTAMP",
  "ALTER TABLE users ADD COLUMN terms_accepted_at TEXT",
"ALTER TABLE users ADD COLUMN account_type TEXT DEFAULT 'Buyer'",
  "ALTER TABLE users ADD COLUMN location TEXT DEFAULT ''",
  "ALTER TABLE users ADD COLUMN rating REAL DEFAULT 0",
  "ALTER TABLE users ADD COLUMN rating_count INTEGER DEFAULT 0",
  "ALTER TABLE admin_chat_sessions ADD COLUMN admin_responded_at TEXT",
  "ALTER TABLE admin_chat_sessions ADD COLUMN response_deadline_at TEXT",
  "ALTER TABLE admin_chat_sessions ADD COLUMN response_required INTEGER DEFAULT 1",
  "ALTER TABLE products ADD COLUMN image_url TEXT DEFAULT ''",
  "ALTER TABLE services ADD COLUMN image_url TEXT DEFAULT ''",
  "ALTER TABLE products ADD COLUMN stock INTEGER",
  "ALTER TABLE products ADD COLUMN quantity INTEGER",
  "ALTER TABLE products ADD COLUMN sku TEXT",
  "ALTER TABLE products ADD COLUMN brand TEXT DEFAULT ''",
  "ALTER TABLE products ADD COLUMN condition TEXT DEFAULT 'new'",
  "ALTER TABLE products ADD COLUMN location TEXT DEFAULT ''",
  "ALTER TABLE products ADD COLUMN delivery_estimate TEXT DEFAULT ''",
  "ALTER TABLE products ADD COLUMN return_policy TEXT DEFAULT ''",
  "ALTER TABLE products ADD COLUMN tags TEXT DEFAULT ''",
  "ALTER TABLE products ADD COLUMN published_at TEXT"
]) { try { db.exec(sql); } catch (_) {} }


// Seed official UNIQUE BRAVE catalogue and plans once. Existing user data is never overwritten.
try {
  require('./catalog_seed')({db});
} catch (e) {
  console.error('Catalogue seed warning:', e.message);
}

console.log('BRAVE database connected successfully.');
module.exports = db;
