const fs=require('fs');
const path=require('path');
const Database=require('better-sqlite3');
const dbPath=process.env.BRAVE_DB_PATH||path.join(__dirname,'..','backend','brave.db');
const outDir=process.env.BRAVE_MIGRATED_DIR||path.join(__dirname,'..','storage','migrated');
if(!fs.existsSync(dbPath)) throw new Error(`Database not found: ${dbPath}`);
fs.mkdirSync(outDir,{recursive:true});
const db=new Database(dbPath);
try{db.pragma('wal_checkpoint(TRUNCATE)');}catch(_){}
const stamp=new Date().toISOString().replace(/[:.]/g,'-');
const target=path.join(outDir,`brave-${stamp}.db`);
fs.copyFileSync(dbPath,target);
console.log(`BRAVE database backup created: ${target}`);
db.close();
