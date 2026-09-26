const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function key() {
  const source = String(process.env.BRAVE_STORAGE_KEY || process.env.ADMIN_PASSWORD || '').trim();
  if (!source) throw new Error('BRAVE_STORAGE_KEY is required for encrypted user storage.');
  return crypto.createHash('sha256').update(source).digest();
}
function encrypt(value) {
  const iv=crypto.randomBytes(12);
  const cipher=crypto.createCipheriv('aes-256-gcm',key(),iv);
  const body=Buffer.concat([cipher.update(JSON.stringify(value),'utf8'),cipher.final()]);
  return [iv.toString('base64'),cipher.getAuthTag().toString('base64'),body.toString('base64')].join('.');
}
function decrypt(value) {
  const [ivB64,tagB64,bodyB64]=String(value||'').split('.');
  if(!ivB64||!tagB64||!bodyB64) throw new Error('Invalid encrypted snapshot.');
  const decipher=crypto.createDecipheriv('aes-256-gcm',key(),Buffer.from(ivB64,'base64'));
  decipher.setAuthTag(Buffer.from(tagB64,'base64'));
  return JSON.parse(Buffer.concat([decipher.update(Buffer.from(bodyB64,'base64')),decipher.final()]).toString('utf8'));
}
function snapshot(db,userId) {
  const u=db.prepare(`SELECT brave_id,username,fullname,email,country,phone,account_type,profile_image,account_status,
    verification_status,email_verified,phone_verified,created_at,updated_at,last_login_at,preferred_language
    FROM users WHERE brave_id=?`).get(userId);
  if(!u) throw new Error('User not found.');
  return {
    schema:'BRAVE-MIGRATED-1',
    exportedAt:new Date().toISOString(),
    user:u,
    records:db.prepare('SELECT * FROM records WHERE user_id=? ORDER BY id').all(userId),
    timeline:db.prepare('SELECT * FROM timeline_posts WHERE user_id=? ORDER BY id').all(userId),
    products:db.prepare('SELECT * FROM products WHERE owner_id=? ORDER BY id').all(userId),
    services:db.prepare('SELECT * FROM services WHERE owner_id=? ORDER BY id').all(userId),
    orders:db.prepare('SELECT * FROM orders WHERE buyer_id=? ORDER BY id').all(userId).map(o=>({
      ...o,items:db.prepare('SELECT * FROM order_items WHERE order_id=? ORDER BY id').all(o.public_id)
    })),
    receipts:db.prepare('SELECT * FROM receipts WHERE user_id=? ORDER BY id').all(userId),
    notifications:db.prepare('SELECT * FROM notifications WHERE user_id=? ORDER BY id').all(userId),
    workshop:db.prepare('SELECT * FROM workshop_documents WHERE user_id=? ORDER BY id').all(userId)
  };
}
function save(db,userId) {
  const data=snapshot(db,userId);
  const enc=encrypt(data);
  db.prepare(`INSERT INTO user_storage(user_id,encrypted_snapshot,snapshot_version,updated_at)
    VALUES(?,?,?,CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET encrypted_snapshot=excluded.encrypted_snapshot,
    snapshot_version=excluded.snapshot_version,updated_at=CURRENT_TIMESTAMP`).run(userId,enc,data.schema);
  // Keep an encrypted, versioned copy outside the live database so updates/migrations
  // have a recoverable user-data snapshot. Password hashes, sessions and API secrets
  // are intentionally excluded from snapshot().
  try {
    const base=process.env.BRAVE_MIGRATED_DIR || path.join(__dirname,'..','storage','migrated');
    const dir=path.join(base,'users');
    fs.mkdirSync(dir,{recursive:true});
    const safeName=String(data.user.username||userId).replace(/[^a-z0-9_-]/gi,'_');
    const target=path.join(dir,`user-${safeName}.brave.enc`);
    fs.writeFileSync(target,enc,'utf8');
  } catch(e) { console.error('[STORAGE] migration-file snapshot warning:',e.message); }
  return {schema:data.schema,updatedAt:new Date().toISOString()};
}
function read(db,userId) {
  const row=db.prepare('SELECT encrypted_snapshot,snapshot_version,updated_at FROM user_storage WHERE user_id=?').get(userId);
  if(!row)return null;
  return {data:decrypt(row.encrypted_snapshot),snapshotVersion:row.snapshot_version,updatedAt:row.updated_at};
}
function writeMigrationFile(db,userId,dir) {
  fs.mkdirSync(dir,{recursive:true});
  const data=snapshot(db,userId);
  const safeName=String(data.user.username||userId).replace(/[^a-z0-9_-]/gi,'_');
  const target=path.join(dir,`user-${safeName}.brave.enc`);
  // Migration exports stay encrypted; never write passwords, OTPs or raw credentials to disk.
  fs.writeFileSync(target,encrypt(data),'utf8');
  return target;
}
module.exports={snapshot,save,read,writeMigrationFile};
