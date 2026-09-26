module.exports = function migrateUserDataProtection(db){
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_storage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT UNIQUE NOT NULL,
      encrypted_snapshot TEXT NOT NULL,
      snapshot_version TEXT DEFAULT 'BRAVE-MIGRATED-1',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS brave_migration_backups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      backup_type TEXT NOT NULL,
      target TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      note TEXT DEFAULT ''
    );
    CREATE INDEX IF NOT EXISTS idx_user_storage_user ON user_storage(user_id);
    CREATE INDEX IF NOT EXISTS idx_migration_backups_created ON brave_migration_backups(created_at);
  `);
  return true;
};
