const fs=require('fs');
const path=require('path');
module.exports=function runMigrations(db){
  db.exec(`CREATE TABLE IF NOT EXISTS brave_migrations(name TEXT PRIMARY KEY, applied_at TEXT DEFAULT CURRENT_TIMESTAMP)`);
  const dir=path.join(__dirname,'migrations');
  const files=fs.readdirSync(dir).filter(f=>/^\d+_.*\.js$/.test(f)).sort();
  for(const file of files){
    const done=db.prepare('SELECT 1 FROM brave_migrations WHERE name=?').get(file);
    if(done) continue;
    const fn=require(path.join(dir,file));
    fn(db);
    db.prepare('INSERT INTO brave_migrations(name) VALUES(?)').run(file);
  }
};
