module.exports=function(db){
 db.exec(`
 CREATE TABLE IF NOT EXISTS chat_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  public_id TEXT UNIQUE NOT NULL,
  requester_id TEXT NOT NULL,
  recipient_id TEXT NOT NULL,
  listing_type TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  listing_name TEXT DEFAULT '',
  initial_message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  accepted_at TEXT,
  rejected_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(requester_id,recipient_id,listing_type,listing_id,status)
 );
 CREATE TABLE IF NOT EXISTS admin_control_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  public_id TEXT UNIQUE NOT NULL,
  admin_token_hash TEXT NOT NULL,
  target_user_id TEXT NOT NULL,
  purpose TEXT DEFAULT 'account_review',
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT NOT NULL
 );
 UPDATE products SET owner_username='' WHERE owner_id IN ('ADMIN','BRAVE_SHOWCASE','CATALOGUE_STAGING','catalog','demo');
 UPDATE services SET owner_username='' WHERE owner_id IN ('ADMIN','BRAVE_SHOWCASE','CATALOGUE_STAGING','catalog','demo');
 CREATE INDEX IF NOT EXISTS idx_chat_requests_recipient ON chat_requests(recipient_id,status,created_at);
 CREATE INDEX IF NOT EXISTS idx_chat_requests_requester ON chat_requests(requester_id,status,created_at);
 `);
};
