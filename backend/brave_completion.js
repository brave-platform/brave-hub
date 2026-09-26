const crypto = require('crypto');
module.exports = function registerBraveCompletion({app,db,helpers}){
  const {requireUser,requireAdmin,clean,base64,id,now,audit,publicUrl,safeUser}=helpers;
  const ensure=(table,def)=>{try{db.exec(`ALTER TABLE ${table} ADD COLUMN ${def}`)}catch(_){} };
  ensure('users',"location TEXT DEFAULT ''"); ensure('users',"rating REAL DEFAULT 0"); ensure('users',"rating_count INTEGER DEFAULT 0");
  ensure('admin_chat_sessions',"admin_responded_at TEXT"); ensure('admin_chat_sessions',"response_deadline_at TEXT"); ensure('admin_chat_sessions',"response_required INTEGER DEFAULT 1");
  db.exec(`CREATE TABLE IF NOT EXISTS profile_reviews(
    id INTEGER PRIMARY KEY AUTOINCREMENT, public_id TEXT UNIQUE NOT NULL, profile_user_id TEXT NOT NULL,
    reviewer_user_id TEXT NOT NULL, rating INTEGER NOT NULL, review TEXT DEFAULT '', created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(profile_user_id,reviewer_user_id)
  );`);

  const parseFeatures=p=>{try{return JSON.parse(p.features||'[]')}catch{return []}};
  app.get('/api/account/entitlements',requireUser,(req,res)=>{
    const sub=db.prepare(`SELECT s.*,p.name,p.price,p.billing,p.features,p.tagline FROM subscriptions s JOIN plans p ON p.code=s.plan_code WHERE s.user_id=? AND s.status='active' AND (s.ends_at IS NULL OR s.ends_at>?) ORDER BY s.id DESC LIMIT 1`).get(req.user.brave_id,now());
    const plan=sub||db.prepare("SELECT * FROM plans WHERE code='basic' AND active=1").get();
    res.json({plan:{code:sub?.plan_code||'basic',name:plan?.name||'Basic',price:Number(plan?.price||0),billing:plan?.billing||'monthly',tagline:plan?.tagline||'',features:parseFeatures(plan||{})},subscription:sub||null,wallet:{status:'coming_soon'}});
  });

  app.get('/api/config/status',(req,res)=>{
    const from=String(process.env.RESEND_FROM||'').trim();
    res.json({email:{provider:'Resend',configured:!!String(process.env.RESEND_API_KEY||'').trim(),senderConfigured:!!from,from:from.replace(/<.*?>/,'<configured-domain>')},twilioConfigured:!!String(process.env.TWILIO_ACCOUNT_SID||'').trim(),aiProviderConfigured:!!String(process.env.OPENAI_API_KEY||process.env.GEMINI_API_KEY||'').trim(),wallet:'coming_soon'});
  });

  // Admin may edit every public catalogue listing, including BRAVE_SHOWCASE and staged catalogue items.
  app.get('/api/admin/public-listings',requireAdmin,(req,res)=>{
    const products=db.prepare("SELECT * FROM products WHERE status<>'deleted' ORDER BY id DESC LIMIT 500").all();
    const services=db.prepare("SELECT * FROM services WHERE status<>'deleted' ORDER BY id DESC LIMIT 500").all();
    res.json({products,services});
  });
  app.patch('/api/admin/public-listing/:type/:id',requireAdmin,(req,res)=>{
    const type=clean(req.params.type), table=type==='product'?'products':type==='service'?'services':null;
    if(!table)return res.status(400).json({message:'Type must be product or service.'});
    const row=db.prepare(`SELECT * FROM ${table} WHERE public_id=?`).get(req.params.id);
    if(!row)return res.status(404).json({message:'Listing not found.'});
    const name=clean(req.body.name ?? row.name)||row.name, category=clean(req.body.category ?? row.category)||row.category;
    const description=clean(req.body.description ?? row.description); const price=req.body.price===undefined?row.price:Math.max(0,Number(req.body.price)||0);
    const image=req.body.imageData===undefined?row.image_data:base64(req.body.imageData); const imageUrl=req.body.imageUrl===undefined?(row.image_url||''):clean(req.body.imageUrl).slice(0,2000); const video=req.body.videoData===undefined?row.video_data:base64(req.body.videoData);
    const status=['active','hidden','pending','removed','draft','deleted'].includes(clean(req.body.status))?clean(req.body.status):row.status;
    if(table==='products'){
      const delivery=req.body.deliveryPrice===undefined?row.delivery_price:Math.max(0,Number(req.body.deliveryPrice)||0);
      const stock=req.body.stock===undefined?(row.stock??row.quantity??0):Math.max(0,Number(req.body.stock)||0);
      const payment=clean(req.body.paymentMethod ?? row.payment_method)||row.payment_method;
      db.prepare(`UPDATE products SET name=?,category=?,description=?,price=?,delivery_price=?,payment_method=?,image_data=?,image_url=?,video_data=?,stock=?,quantity=?,status=?,updated_at=? WHERE public_id=?`).run(name,category,description,price,delivery,payment,image,imageUrl,video,stock,stock,status,now(),row.public_id);
    }else{
      const payment=clean(req.body.paymentMethod ?? row.payment_method)||row.payment_method;
      db.prepare(`UPDATE services SET name=?,category=?,description=?,price=?,payment_method=?,image_data=?,image_url=?,video_data=?,status=?,updated_at=? WHERE public_id=?`).run(name,category,description,price,payment,image,imageUrl,video,status,now(),row.public_id);
    }
    audit('admin_public_listing_edited',type,row.public_id,`owner=${row.owner_id||''}`);
    res.json({message:'Public marketplace listing updated.',listing:db.prepare(`SELECT * FROM ${table} WHERE public_id=?`).get(row.public_id)});
  });

  // Facebook-style public profile data: location, verification, rating, reviews and profile views.
  app.get('/api/public-profile/:username',(req,res)=>{
    const uname=clean(req.params.username).toLowerCase(); const u=db.prepare("SELECT * FROM users WHERE lower(username)=? AND account_status='active'").get(uname);
    if(!u)return res.status(404).json({message:'Profile not found.'});
    let viewer=null; try{const t=clean((req.headers.authorization||'').replace(/^Bearer\s+/i,'')); if(t){const h=crypto.createHash('sha256').update(t).digest('hex');const s=db.prepare('SELECT user_id,expires_at FROM user_sessions WHERE token_hash=?').get(h);if(s&&new Date(s.expires_at).getTime()>Date.now())viewer=s.user_id;}}catch(_){}
    db.prepare('INSERT INTO profile_views(viewed_user_id,viewer_user_id) VALUES(?,?)').run(u.brave_id,viewer||null);
    const posts=db.prepare("SELECT * FROM timeline_posts WHERE user_id=? AND status='active' ORDER BY id DESC LIMIT 100").all(u.brave_id).map(p=>({...p,likes:db.prepare('SELECT COUNT(*) c FROM timeline_likes WHERE post_id=?').get(p.public_id).c,comments:db.prepare('SELECT public_id,username,fullname,comment,created_at FROM timeline_comments WHERE post_id=? ORDER BY id ASC').all(p.public_id)}));
    const reviews=db.prepare(`SELECT r.*,u.username AS reviewer_username,u.fullname AS reviewer_name,u.profile_image AS reviewer_image FROM profile_reviews r LEFT JOIN users u ON u.brave_id=r.reviewer_user_id WHERE r.profile_user_id=? ORDER BY r.id DESC LIMIT 100`).all(u.brave_id);
    const products=db.prepare("SELECT * FROM products WHERE owner_id=? AND status='active' ORDER BY id DESC LIMIT 100").all(u.brave_id);
    const services=db.prepare("SELECT * FROM services WHERE owner_id=? AND status='active' ORDER BY id DESC LIMIT 100").all(u.brave_id);
    const stats={posts:posts.length,products:products.length,services:services.length,profileViews:db.prepare('SELECT COUNT(*) c FROM profile_views WHERE viewed_user_id=?').get(u.brave_id).c,likes:db.prepare('SELECT COUNT(*) c FROM timeline_likes l JOIN timeline_posts p ON p.public_id=l.post_id WHERE p.user_id=?').get(u.brave_id).c,comments:db.prepare('SELECT COUNT(*) c FROM timeline_comments c JOIN timeline_posts p ON p.public_id=c.post_id WHERE p.user_id=?').get(u.brave_id).c,reviews:reviews.length};
    res.json({user:safeUser(u),profileUrl:publicUrl('/u/'+u.username),coverImage:u.cover_image||'',posts,products,services,reviews,stats,viewerId:viewer});
  });

  app.post('/api/profile/:username/reviews',requireUser,(req,res)=>{
    const u=db.prepare("SELECT * FROM users WHERE lower(username)=? AND account_status='active'").get(clean(req.params.username).toLowerCase());
    if(!u)return res.status(404).json({message:'Profile not found.'}); if(u.brave_id===req.user.brave_id)return res.status(400).json({message:'You cannot review your own profile.'});
    const rating=Math.max(1,Math.min(5,Math.round(Number(req.body.rating)||0))); const review=clean(req.body.review).slice(0,1000); if(!rating)return res.status(400).json({message:'Choose a rating from 1 to 5.'});
    const rid=id('review');
    db.prepare(`INSERT INTO profile_reviews(public_id,profile_user_id,reviewer_user_id,rating,review) VALUES(?,?,?,?,?) ON CONFLICT(profile_user_id,reviewer_user_id) DO UPDATE SET rating=excluded.rating,review=excluded.review,created_at=CURRENT_TIMESTAMP`).run(rid,u.brave_id,req.user.brave_id,rating,review);
    const agg=db.prepare('SELECT AVG(rating) avg,COUNT(*) count FROM profile_reviews WHERE profile_user_id=?').get(u.brave_id); db.prepare('UPDATE users SET rating=?,rating_count=?,updated_at=? WHERE brave_id=?').run(Number(agg.avg||0),Number(agg.count||0),now(),u.brave_id);
    db.prepare('INSERT INTO notifications(public_id,user_id,title,message) VALUES(?,?,?,?)').run(id('note'),u.brave_id,'New profile review',`${req.user.fullname} left a ${rating}-star review on your BRAVE profile.`);
    res.status(201).json({message:'Review saved.',rating:Number(agg.avg||0),ratingCount:Number(agg.count||0)});
  });

  app.post('/api/timeline/:id/share',requireUser,(req,res)=>{const p=db.prepare("SELECT * FROM timeline_posts WHERE public_id=? AND status='active'").get(req.params.id);if(!p)return res.status(404).json({message:'Post not found.'});db.prepare('UPDATE timeline_posts SET share_count=COALESCE(share_count,0)+1 WHERE public_id=?').run(p.public_id);res.json({message:'Share recorded.',shares:db.prepare('SELECT share_count FROM timeline_posts WHERE public_id=?').get(p.public_id).share_count});});

  // Lightweight automatic marketplace activity so a seller's Timeline is not empty when they publish.
  app.post('/api/timeline/marketplace-activity',requireUser,(req,res)=>{
    const type=clean(req.body.type), name=clean(req.body.name); if(!['product','service'].includes(type)||!name)return res.status(400).json({message:'Activity type and name are required.'});
    const text=`${type==='product'?'Listed a new product':'Added a new service'}: ${name}`; const pid=id('post');
    db.prepare('INSERT INTO timeline_posts(public_id,user_id,username,fullname,text,media_data,media_type,status) VALUES(?,?,?,?,?,?,?,?)').run(pid,req.user.brave_id,req.user.username,req.user.fullname,text,'','text','active');
    res.status(201).json({message:'Timeline activity added.',post:db.prepare('SELECT * FROM timeline_posts WHERE public_id=?').get(pid)});
  });

  // Wallet remains intentionally non-operational.
  app.get('/api/wallet',requireUser,(req,res)=>res.json({status:'coming_soon',message:'BRAVE Wallet is Coming Soon. No wallet balance or withdrawal is currently available.'}));

  // Affordable everyday catalogue, seeded once at NGN 500+.
  const affordable=[
    ['BRAVE Everyday USB-C Cable','Electronics',800,'/images/catalog/powerbank.svg'],['BRAVE Screen Protector','Phones & Tablets',500,'/images/catalog/phone.svg'],['BRAVE Phone Stand','Electronics',1500,'/images/catalog/phone.svg'],['BRAVE Notebook','Stationery',500,'/images/catalog/chair.svg'],['BRAVE Ball Pen Pack','Stationery',700,'/images/catalog/chair.svg'],['BRAVE Water Bottle','Home & Living',1200,'/images/catalog/chair.svg'],['BRAVE LED Bulb','Home Appliances',1200,'/images/catalog/blender.svg'],['BRAVE Hair Bonnet','Beauty & Personal Care',800,'/images/catalog/bag.svg'],['BRAVE Everyday Socks','Fashion',1000,'/images/catalog/shirt.svg'],['BRAVE Earphones','Electronics',3500,'/images/catalog/headphones.svg'],['BRAVE Storage Container','Home & Living',2500,'/images/catalog/chair.svg'],['BRAVE Phone Charging Adapter','Electronics',1800,'/images/catalog/powerbank.svg']
  ];
  const ins=db.prepare(`INSERT OR IGNORE INTO products(public_id,owner_id,owner_name,owner_username,name,category,description,price,delivery_price,payment_method,image_url,image_data,featured,status,stock,quantity) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  affordable.forEach((x,i)=>ins.run('brave-affordable-'+(i+1),'ADMIN','UNIQUE BRAVE','',x[0],x[1],`Affordable everyday item from the UNIQUE BRAVE catalogue. Starting price is NGN ${x[2]}.`,x[2],0,'pay_on_delivery',x[3],'',0,'active',25,25));

  console.log('BRAVE completion layer loaded: public admin editing, profile/timeline, plan entitlements, affordable catalogue, wallet placeholder and config status.');
};
