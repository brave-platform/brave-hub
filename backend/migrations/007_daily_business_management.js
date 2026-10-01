module.exports = function up(db){
  db.exec(`
    CREATE TABLE IF NOT EXISTS business_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      public_id TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      details TEXT DEFAULT '',
      due_date TEXT DEFAULT '',
      priority TEXT DEFAULT 'normal',
      status TEXT DEFAULT 'open',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS business_daily_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      public_id TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      note_date TEXT NOT NULL,
      title TEXT NOT NULL,
      note TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id,note_date)
    );
    CREATE INDEX IF NOT EXISTS idx_business_tasks_user_status ON business_tasks(user_id,status);
    CREATE INDEX IF NOT EXISTS idx_business_tasks_due ON business_tasks(user_id,due_date);
  `);
};
