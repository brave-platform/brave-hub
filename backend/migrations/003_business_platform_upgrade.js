module.exports=function(db){
db.exec(`
CREATE TABLE IF NOT EXISTS saved_listings (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 public_id TEXT UNIQUE NOT NULL,
 user_id TEXT NOT NULL,
 listing_type TEXT NOT NULL,
 listing_id TEXT NOT NULL,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(user_id,listing_type,listing_id)
);
CREATE TABLE IF NOT EXISTS creative_designs (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 public_id TEXT UNIQUE NOT NULL,
 user_id TEXT NOT NULL,
 title TEXT NOT NULL,
 design_type TEXT DEFAULT 'social',
 content TEXT NOT NULL,
 status TEXT DEFAULT 'private',
 created_at TEXT DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS user_preferences (
 user_id TEXT PRIMARY KEY,
 language TEXT DEFAULT 'en',
 theme TEXT DEFAULT 'light',
 business_mode INTEGER DEFAULT 1,
 notifications INTEGER DEFAULT 1,
 updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id,created_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id,created_at);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON ai_conversations(user_id,created_at);
CREATE INDEX IF NOT EXISTS idx_saved_listings_user ON saved_listings(user_id,created_at);
CREATE INDEX IF NOT EXISTS idx_creative_designs_user ON creative_designs(user_id,updated_at);
`);
};
