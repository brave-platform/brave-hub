module.exports=function registerPlatformFinal({app,db,helpers}){
 const {requireUser,requireAdmin,clean,base64,id,now,audit,safeUser}=helpers;
 const add=(t,d)=>{try{db.exec(`ALTER TABLE ${t} ADD COLUMN ${d}`)}catch(_){}};
 ['products','services','timeline_posts'].forEach(t=>{add(t,"audio_data TEXT DEFAULT ''");add(t,"file_data TEXT DEFAULT ''");add(t,"file_name TEXT DEFAULT ''");add(t,"file_type TEXT DEFAULT ''");});
 add('products',"variants_json TEXT DEFAULT '[]'"); add('services',"variants_json TEXT DEFAULT '[]'");
 db.exec(`CREATE TABLE IF NOT EXISTS platform_settings(key TEXT PRIMARY KEY,value TEXT NOT NULL DEFAULT '',updated_at TEXT DEFAULT CURRENT_TIMESTAMP);`);
 const media=(v)=>base64(v);
 const variants=(v)=>{try{const x=JSON.parse(v||'[]');return Array.isArray(x)?x.slice(0,30):[]}catch{return[]}};
 app.get('/api/admin/platform-settings',requireAdmin,(req,res)=>{
   const rows=db.prepare('SELECT key,value,updated_at FROM platform_settings ORDER BY key').all();
   const settings=Object.fromEntries(rows.map(x=>[x.key,x.value]));
   res.json({settings,sessionDays:Number(process.env.BRAVE_SESSION_DAYS||90),mediaLimitMB:15,wallet:'coming_soon'});
 });
 app.patch('/api/admin/platform-settings',requireAdmin,(req,res)=>{
   const allowed=['marketplaceEnabled','productCheckoutEnabled','serviceRequestsEnabled','timelineUploadsEnabled','audioUploadsEnabled','fileUploadsEnabled','adminChatTimeoutMinutes','defaultDeliveryMethod','resendSenderReady','paymentInstructions','defaultDeliveryPrice'];
   const up=db.prepare(`INSERT INTO platform_settings(key,value,updated_at) VALUES(?,?,CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=CURRENT_TIMESTAMP`);
   for(const k of allowed)if(req.body[k]!==undefined)up.run(k,String(req.body[k]));
   audit('admin_platform_settings_updated','platform','settings');
   res.json({message:'Platform settings saved.',settings:Object.fromEntries(db.prepare('SELECT key,value FROM platform_settings').all().map(x=>[x.key,x.value]))});
 });
 app.get('/api/admin/storage/migration-status',requireAdmin,(req,res)=>{
   const migrations=db.prepare('SELECT * FROM brave_migrations ORDER BY applied_at').all();
   const users=db.prepare('SELECT COUNT(*) c FROM user_storage').get().c;
   res.json({migrations,userSnapshots:users,migratedFolder:'storage/migrated',encrypted:true,passwordsStored:false});
 });
 app.post('/api/account/storage/migrate',requireUser,(req,res)=>{
   try{
     const storage=require('./storage_service');
     const base=process.env.BRAVE_MIGRATED_DIR || require('path').join(__dirname,'..','storage','migrated'); const dir=require('path').join(base,'users');
     const target=storage.writeMigrationFile(db,req.user.brave_id,dir);
     res.json({message:'Encrypted user migration snapshot created.',file:require('path').basename(target),encrypted:true});
   }catch(e){res.status(500).json({message:'Migration snapshot could not be created. Check BRAVE_STORAGE_KEY.'});}
 });
 // Admin variant/media editor for existing public catalogue and user listings.
 app.patch('/api/admin/public-listing/:type/:id/media',requireAdmin,(req,res)=>{
   const type=clean(req.params.type),table=type==='product'?'products':type==='service'?'services':null;if(!table)return res.status(400).json({message:'Invalid listing type.'});
   const row=db.prepare(`SELECT * FROM ${table} WHERE public_id=?`).get(req.params.id);if(!row)return res.status(404).json({message:'Listing not found.'});
   const sets=['image_data=?','video_data=?','audio_data=?','file_data=?','file_name=?','file_type=?','variants_json=?','updated_at=?'];
   const vals=[req.body.imageData===undefined?row.image_data:media(req.body.imageData),req.body.videoData===undefined?row.video_data:media(req.body.videoData),req.body.audioData===undefined?(row.audio_data||''):media(req.body.audioData),req.body.fileData===undefined?(row.file_data||''):media(req.body.fileData),clean(req.body.fileName===undefined?row.file_name:req.body.fileName).slice(0,180),clean(req.body.fileType===undefined?row.file_type:req.body.fileType).slice(0,120),JSON.stringify(variants(req.body.variantsJson===undefined?row.variants_json:req.body.variantsJson)),now(),row.public_id];
   db.prepare(`UPDATE ${table} SET ${sets.join(',')} WHERE public_id=?`).run(...vals);audit('admin_public_listing_media_edited',type,row.public_id);res.json({message:'Listing media and variants updated.',listing:db.prepare(`SELECT * FROM ${table} WHERE public_id=?`).get(row.public_id)});
 });
 // User-owned listing media/variants: owner can manage only their own listing.
 for(const [type,table] of [['product','products'],['service','services']]){
   app.patch(`/api/${type}s/:id/media`,requireUser,(req,res)=>{
     const row=db.prepare(`SELECT * FROM ${table} WHERE public_id=?`).get(req.params.id);if(!row)return res.status(404).json({message:'Listing not found.'});if(row.owner_id!==req.user.brave_id)return res.status(403).json({message:'Only the listing owner can edit this media.'});
     const image=req.body.imageData===undefined?row.image_data:media(req.body.imageData),video=req.body.videoData===undefined?row.video_data:media(req.body.videoData),audio=req.body.audioData===undefined?(row.audio_data||''):media(req.body.audioData),file=req.body.fileData===undefined?(row.file_data||''):media(req.body.fileData),fn=clean(req.body.fileName===undefined?row.file_name:req.body.fileName).slice(0,180),ft=clean(req.body.fileType===undefined?row.file_type:req.body.fileType).slice(0,120),vars=JSON.stringify(variants(req.body.variantsJson===undefined?row.variants_json:req.body.variantsJson));
     db.prepare(`UPDATE ${table} SET image_data=?,video_data=?,audio_data=?,file_data=?,file_name=?,file_type=?,variants_json=?,updated_at=? WHERE public_id=?`).run(image,video,audio,file,fn,ft,vars,now(),row.public_id);res.json({message:'Listing media updated.',listing:db.prepare(`SELECT * FROM ${table} WHERE public_id=?`).get(row.public_id)});
   });
 }

 app.get('/api/admin/control-center',requireAdmin,(req,res)=>{
   const users=db.prepare('SELECT COUNT(*) c FROM users').get().c;
   const activeUsers=db.prepare("SELECT COUNT(*) c FROM users WHERE account_status='active'").get().c;
   const products=db.prepare("SELECT COUNT(*) c FROM products WHERE status='active'").get().c;
   const services=db.prepare("SELECT COUNT(*) c FROM services WHERE status='active'").get().c;
   const orders=db.prepare('SELECT COUNT(*) c FROM orders').get().c;
   const pendingSupport=db.prepare("SELECT COUNT(*) c FROM customer_requests WHERE status='pending'").get().c;
   const pendingPlans=db.prepare("SELECT COUNT(*) c FROM subscriptions WHERE status='pending'").get().c;
   const pendingReports=db.prepare("SELECT COUNT(*) c FROM reports WHERE status='pending'").get().c;
   const settings=Object.fromEntries(db.prepare('SELECT key,value FROM platform_settings').all().map(x=>[x.key,x.value]));
   res.json({metrics:{users,activeUsers,products,services,orders,pendingSupport,pendingPlans,pendingReports},settings});
 });
 app.get('/api/admin/plans',requireAdmin,(req,res)=>res.json({plans:db.prepare('SELECT * FROM plans ORDER BY price ASC').all().map(p=>({...p,features:json(p.features,[])}))}));
 app.patch('/api/admin/plans/:code',requireAdmin,(req,res)=>{
   const code=clean(req.params.code); const p=db.prepare('SELECT * FROM plans WHERE code=?').get(code); if(!p)return res.status(404).json({message:'Plan not found.'});
   const name=clean(req.body.name)||p.name; const price=Math.max(0,Number(req.body.price??p.price)||0); const billing=clean(req.body.billing)||p.billing; const tagline=clean(req.body.tagline)||p.tagline; const active=req.body.active===undefined?p.active:(req.body.active?1:0); let features=p.features; if(Array.isArray(req.body.features))features=JSON.stringify(req.body.features.map(clean).filter(Boolean).slice(0,30));
   db.prepare('UPDATE plans SET name=?,price=?,billing=?,tagline=?,features=?,active=? WHERE code=?').run(name,price,billing,tagline,features,active,code); audit('admin_plan_updated','plan',code,name); res.json({message:'Plan updated.',plan:{...db.prepare('SELECT * FROM plans WHERE code=?').get(code),features:json(features,[])}});
 });
 app.patch('/api/admin/delivery-settings',requireAdmin,(req,res)=>{const n=Math.max(0,Number(req.body.defaultDeliveryPrice));if(!Number.isFinite(n))return res.status(400).json({message:'Enter a valid delivery price.'});db.prepare("INSERT INTO platform_settings(key,value,updated_at) VALUES('defaultDeliveryPrice',?,CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=CURRENT_TIMESTAMP").run(String(n));audit('admin_default_delivery_updated','platform','defaultDeliveryPrice',String(n));res.json({message:'Default delivery price updated.',defaultDeliveryPrice:n});});
 app.get('/api/admin/users-private',requireAdmin,(req,res)=>{const users=db.prepare('SELECT brave_id,brave_reference,brave_serial,fullname,username,email,phone,country,account_type,account_status,verification_status,created_at,last_login_at FROM users ORDER BY id DESC').all();res.json({users});});

 // Lightweight payment summary for checkout UIs. No payment is marked successful by this route.
 app.post('/api/checkout/quote',requireUser,(req,res)=>{
   const items=Array.isArray(req.body.items)?req.body.items:[];let subtotal=0,delivery=0;
   for(const it of items){const p=db.prepare('SELECT * FROM products WHERE public_id=? AND status=\'active\'').get(clean(it.public_id));if(!p)continue;const q=Math.max(1,Math.min(99,Number(it.quantity)||1));subtotal+=Number(p.price||0)*q;delivery+=Number(p.delivery_price||0);}
   res.json({subtotal,delivery,total:subtotal+delivery,currency:'NGN',paymentStatus:'pending',note:'This quote does not confirm payment.'});
 });
};
