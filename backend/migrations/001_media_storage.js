module.exports = function migrateMediaStorage(db){
  const add=(table,def)=>{try{db.exec(`ALTER TABLE ${table} ADD COLUMN ${def}`)}catch(_){}};
  ['products','services','timeline_posts'].forEach(t=>{
    add(t,"audio_data TEXT DEFAULT ''");
    add(t,"file_data TEXT DEFAULT ''");
    add(t,"file_name TEXT DEFAULT ''");
    add(t,"file_type TEXT DEFAULT ''");
  });
  add('products',"variants_json TEXT DEFAULT '[]'");
  add('services',"variants_json TEXT DEFAULT '[]'");
  db.exec(`CREATE TABLE IF NOT EXISTS platform_settings(
    key TEXT PRIMARY KEY, value TEXT NOT NULL DEFAULT '', updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`);
  db.exec(`CREATE TABLE IF NOT EXISTS brave_migrations(
    name TEXT PRIMARY KEY, applied_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`);
  return true;
};
