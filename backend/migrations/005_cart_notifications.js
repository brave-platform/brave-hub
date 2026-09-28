module.exports=function(db){
 db.exec(`
 CREATE TABLE IF NOT EXISTS cart_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  public_id TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  variant_json TEXT DEFAULT '',
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id,product_id,variant_json)
 );
 CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id,updated_at);
 CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id,is_read,id);
 `);
};
