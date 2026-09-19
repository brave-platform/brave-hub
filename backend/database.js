const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const stagedCatalogue = require('./staged_products_100');

const dir = __dirname;
fs.mkdirSync(dir, { recursive: true });
const dbPath = process.env.BRAVE_DB_PATH || path.join(dir, 'brave.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new Database(dbPath);
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
  "ALTER TABLE users ADD COLUMN account_type TEXT DEFAULT 'Buyer'"
]) { try { db.exec(sql); } catch (_) {} }


// Seed safe demo marketplace content and plans once. These are demo listings, not fulfilled orders.
try {
 const demoProducts = [
  ['LONTOR 6 Inches Rechargeable Table Fan CTL-MF037-6','Home & Office','6-inch rechargeable table fan with portable design. Demo listing price reference.',9950],
  ['COLASOLAR Colahome 16-inch Rechargeable Solar Fan','Home & Office','16-inch rechargeable solar fan with panel. Demo listing price reference.',46800],
  ['AEON 18-inch Rechargeable Fan ARF-18B','Home & Office','18-inch rechargeable fan. Demo listing price reference.',59275],
  ['itel 4000mAh Foldable Rechargeable Fan','Electronics','Foldable rechargeable fan with LED light. Demo listing price reference.',19650],
  ['6-inch Rechargeable Mini Fan with Power Bank','Electronics','Portable mini rechargeable fan with power-bank function. Demo listing price reference.',12445]
 ];
 const ins=db.prepare("INSERT OR IGNORE INTO products(public_id,owner_id,owner_name,owner_username,name,category,description,price,delivery_price,payment_method,featured,status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)");
 for(const [name,cat,desc,price] of demoProducts) ins.run('demo-'+crypto.randomBytes(6).toString('hex'),'demo', 'UNIQUE BRAVE Demo Store','',name,cat,desc,price,0,'bank_transfer',1,'active');
 // Public test catalogue: real product-family images already referenced by the project. Clearly marked as catalogue/demo until a real seller owns the listing.
 const catIns=db.prepare("INSERT OR IGNORE INTO products(public_id,owner_id,owner_name,owner_username,name,category,description,price,delivery_price,payment_method,image_data,featured,status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)");
 for(const item of stagedCatalogue.slice(0,50)){
   if(!item.image_url) continue;
   catIns.run('catalog-'+item.sku,'catalog','UNIQUE BRAVE Catalogue','uniquebrave',item.name,item.category,item.description,item.price||0,0,item.payment_method||'bank_transfer',item.image_url,item.featured?1:0,'active');
 }
 const serviceSeeds=[
  ['Phone Repair & Diagnostics','Electronics Services','Phone diagnostics, software setup and repair consultation.',15000,'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80'],
  ['Graphic Design & Branding','Creative Services','Flyers, logos, social media graphics and business branding.',20000,'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=900&q=80'],
  ['Hair Styling & Wig Installation','Beauty','Professional hair styling and wig installation.',25000,'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=80'],
  ['Home Cleaning Service','Home Services','Residential and office cleaning service.',18000,'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80'],
  ['Web Design & Development','Technology','Responsive business website design and development.',75000,'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=900&q=80'],
  ['Photography Session','Creative Services','Portrait and product photography sessions.',30000,'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=900&q=80'],
  ['Fashion Tailoring','Fashion','Custom sewing, alterations and native wear.',25000,'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=900&q=80'],
  ['Catering & Small Events','Food & Events','Food trays and small event catering.',40000,'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=900&q=80'],
  ['Tutoring & Academic Support','Education','One-on-one tutoring and academic support.',10000,'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80'],
  ['Social Media Management','Business Services','Content planning, captions and social media management.',30000,'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=900&q=80']
 ];
 const sins=db.prepare("INSERT OR IGNORE INTO services(public_id,owner_id,owner_name,owner_username,name,category,description,price,image_data,status) VALUES(?,?,?,?,?,?,?,?,?,?)");
 for(const [name,cat,desc,price,img] of serviceSeeds) sins.run('service-demo-'+crypto.createHash('md5').update(name).digest('hex').slice(0,10),'catalog','UNIQUE BRAVE Service Directory','uniquebrave',name,cat,desc,price,img,'active');
 const plans=[
  ['basic','Basic',0,'monthly',JSON.stringify(['Marketplace access','Timeline posting','Basic workshop tools','Standard records'])],
  ['premium','Premium',2500,'monthly',JSON.stringify(['Everything in Basic','Featured profile options','Expanded workshop tools','Priority support'])],
  ['luxury','Luxury',7500,'monthly',JSON.stringify(['Everything in Premium','Business growth tools','Advanced records','Priority admin support'])]
 ];
 const pi=db.prepare("INSERT OR IGNORE INTO plans(code,name,price,billing,features) VALUES(?,?,?,?,?)");
 for(const p of plans) pi.run(...p);
 db.prepare("INSERT OR IGNORE INTO bank_settings(id,bank_name,account_name,account_number,instructions) VALUES(1,'','','','Payment details are managed by the UNIQUE BRAVE administrator.')").run();
} catch(e) { console.error('Demo seed warning:', e.message); }

console.log('BRAVE database connected successfully.');
module.exports = db;
