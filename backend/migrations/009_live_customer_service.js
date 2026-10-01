module.exports=function(db){
  db.exec(`
    CREATE TABLE IF NOT EXISTS customer_service_threads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      public_id TEXT UNIQUE NOT NULL,
      access_hash TEXT NOT NULL,
      user_id TEXT DEFAULT '',
      requester_name TEXT DEFAULT '',
      requester_email TEXT DEFAULT '',
      requester_phone TEXT DEFAULT '',
      subject TEXT NOT NULL,
      status TEXT DEFAULT 'waiting',
      assigned_to TEXT DEFAULT '',
      assigned_role TEXT DEFAULT '',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      last_message_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS customer_service_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      public_id TEXT UNIQUE NOT NULL,
      thread_id TEXT NOT NULL,
      sender_type TEXT NOT NULL,
      sender_id TEXT DEFAULT '',
      sender_name TEXT DEFAULT '',
      message TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS customer_service_presence (
      user_id TEXT PRIMARY KEY,
      status TEXT DEFAULT 'offline',
      last_seen_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_cst_status ON customer_service_threads(status,updated_at);
    CREATE INDEX IF NOT EXISTS idx_csm_thread ON customer_service_messages(thread_id,id);
  `);
};
