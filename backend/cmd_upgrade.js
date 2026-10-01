const crypto = require('crypto');

module.exports = function registerCmdUpgrade({app, db, helpers}) {
  const {requireUser, requireAdmin, clean, id, now, publicUrl, audit, safeUser} = helpers;
  const add = (table, def) => { try { db.exec(`ALTER TABLE ${table} ADD COLUMN ${def}`); } catch (_) {} };

  // Stable UNIQUE BRAVE identity numbers. These are additive and never replace brave_id.
  add('users', "brave_reference TEXT");
  add('users', "brave_serial TEXT");
  add('users', "public_theme TEXT DEFAULT 'brave-signature'");
  add('users', "public_bio TEXT DEFAULT ''");
  add('products', "listing_origin TEXT DEFAULT 'user'");
  add('products', "ad_eligible INTEGER DEFAULT 1");
  add('products', "views INTEGER DEFAULT 0");
  add('services', "listing_origin TEXT DEFAULT 'user'");
  add('services', "ad_eligible INTEGER DEFAULT 1");
  add('services', "views INTEGER DEFAULT 0");

  db.exec(`
    CREATE TABLE IF NOT EXISTS marketplace_ads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      public_id TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      listing_type TEXT NOT NULL CHECK(listing_type IN ('product','service')),
      listing_id TEXT NOT NULL,
      title TEXT DEFAULT '',
      placement TEXT DEFAULT 'popular',
      status TEXT DEFAULT 'pending',
      payment_method TEXT DEFAULT 'bank_transfer',
      payment_reference TEXT DEFAULT '',
      amount REAL DEFAULT 0,
      starts_at TEXT,
      ends_at TEXT,
      approved_at TEXT,
      approved_by TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_marketplace_ads_status_dates ON marketplace_ads(status,starts_at,ends_at);
    CREATE INDEX IF NOT EXISTS idx_marketplace_ads_listing ON marketplace_ads(listing_type,listing_id);
  `);

  const ensureIdentity = (u) => {
    if (!u) return u;
    let ref = clean(u.brave_reference), serial = clean(u.brave_serial);
    if (!ref || !serial) {
      const numeric = String(Number(u.id || 0) || 0).padStart(7, '0');
      ref = ref || `BRV-REF-${new Date(u.created_at || Date.now()).getFullYear()}-${numeric}`;
      serial = serial || `UBR-SN-${new Date(u.created_at || Date.now()).getFullYear()}-${numeric}`;
      db.prepare('UPDATE users SET brave_reference=?,brave_serial=?,updated_at=? WHERE brave_id=?').run(ref, serial, now(), u.brave_id);
      u.brave_reference = ref; u.brave_serial = serial;
    }
    return u;
  };

  db.prepare("SELECT id,brave_id,created_at FROM users WHERE brave_reference IS NULL OR brave_reference='' OR brave_serial IS NULL OR brave_serial='' ORDER BY id").all().forEach(ensureIdentity);
  try {
    db.prepare("UPDATE products SET listing_origin=CASE WHEN owner_id='ADMIN' OR owner_id='catalog' OR owner_id='demo' THEN 'brave' ELSE 'user' END WHERE listing_origin IS NULL OR listing_origin=''").run();
    db.prepare("UPDATE services SET listing_origin=CASE WHEN owner_id='ADMIN' OR owner_id='catalog' OR owner_id='demo' THEN 'brave' ELSE 'user' END WHERE listing_origin IS NULL OR listing_origin=''").run();
  } catch (_) {}

  const limits = {basic:10,'starter-business':25,premium:100,professional:500,luxury:1000,enterprise:10000};
  const ranks = {basic:0,'starter-business':1,premium:2,professional:3,luxury:4,enterprise:5};
  const currentPlan = uid => {
    const s = db.prepare("SELECT plan_code FROM subscriptions WHERE user_id=? AND status='active' AND (ends_at IS NULL OR ends_at>?) ORDER BY id DESC LIMIT 1").get(uid, now());
    return s?.plan_code || 'basic';
  };
  const listingCount = uid => Number(db.prepare("SELECT (SELECT COUNT(*) FROM products WHERE owner_id=? AND status='active')+(SELECT COUNT(*) FROM services WHERE owner_id=? AND status='active') c").get(uid, uid).c || 0);
  app.locals.braveCanCreateListing = uid => {
    const plan = currentPlan(uid), limit = limits[plan] ?? limits.basic, used = listingCount(uid);
    return {ok: used < limit, plan, used, limit};
  };

  app.get('/api/brave/identity', requireUser, (req,res) => {
    const u = ensureIdentity(db.prepare('SELECT * FROM users WHERE brave_id=?').get(req.user.brave_id));
    res.json({reference:u.brave_reference,serial:u.brave_serial,profileUrl:publicUrl('/u/'+u.username)});
  });

  app.get('/api/marketplace/popular', (req,res) => {
    const q = clean(req.query.q).toLowerCase();
    const category = clean(req.query.category);
    const like = `%${q}%`;
    const activeAds = db.prepare(`SELECT * FROM marketplace_ads WHERE status='active' AND (starts_at IS NULL OR starts_at<=?) AND (ends_at IS NULL OR ends_at>=?) ORDER BY id DESC`).all(now(), now());
    const adMap = new Map(activeAds.map(a => [`${a.listing_type}:${a.listing_id}`, a]));
    const where = (table) => {
      const clauses = [`${table}.status='active'`]; const args=[];
      if(q){clauses.push(`(LOWER(${table}.name) LIKE ? OR LOWER(COALESCE(${table}.description,'')) LIKE ? OR LOWER(COALESCE(${table}.category,'')) LIKE ?)`);args.push(like,like,like);}
      if(category && category!=='Services'){clauses.push(`${table}.category=?`);args.push(category);}
      return {sql:clauses.join(' AND '),args};
    };
    const p=where('products'), s=where('services');
    const products=db.prepare(`SELECT products.*,users.profile_image AS profile_image,users.brave_reference,users.brave_serial FROM products LEFT JOIN users ON users.brave_id=products.owner_id WHERE ${p.sql} ORDER BY COALESCE(products.featured,0) DESC,COALESCE(products.views,0) DESC,products.id DESC LIMIT 80`).all(...p.args);
    const services=db.prepare(`SELECT services.*,users.profile_image AS profile_image,users.brave_reference,users.brave_serial FROM services LEFT JOIN users ON users.brave_id=services.owner_id WHERE ${s.sql} ORDER BY COALESCE(services.views,0) DESC,services.id DESC LIMIT 80`).all(...s.args);
    const map = (x,type) => {
      const key=`${type}:${x.public_id}`, ad=adMap.get(key), brave=x.listing_origin==='brave'||x.owner_id==='ADMIN'||x.owner_id==='catalog'||x.owner_id==='demo';
      return {...x,listingType:type,isUserOwned:!brave,listingOrigin:brave?'BRAVE':'MEMBER',originLabel:brave?'BRAVE LISTING':'MEMBER LISTING',isSponsored:!!ad,sponsoredLabel:ad?'PAID ADVERT':'',adPublicId:ad?.public_id||null,adAmount:ad?.amount||null};
    };
    const ads=[...products.map(x=>map(x,'product')).filter(x=>x.isSponsored),...services.map(x=>map(x,'service')).filter(x=>x.isSponsored)];
    const organic=[...products.map(x=>map(x,'product')).filter(x=>!x.isSponsored),...services.map(x=>map(x,'service')).filter(x=>!x.isSponsored)];
    organic.sort((a,b)=>(Number(b.featured)-Number(a.featured))||(Number(b.views||0)-Number(a.views||0))||(Date.parse(b.created_at||0)-Date.parse(a.created_at||0)));
    res.json({items:[...ads.slice(0,12),...organic.slice(0,60)],paidAds:ads.slice(0,12),organic:organic.slice(0,60),limits:{note:'Paid advertising increases promotion; member listings remain eligible for organic discovery.'}});
  });

  app.post('/api/advertising/request', requireUser, (req,res) => {
    const type=clean(req.body.listingType), listingId=clean(req.body.listingId), amount=Math.max(0,Number(req.body.amount)||0), reference=clean(req.body.paymentReference), placement=clean(req.body.placement)||'popular';
    if(!['product','service'].includes(type)||!listingId)return res.status(400).json({message:'Choose a valid product or service to advertise.'});
    const table=type==='product'?'products':'services'; const row=db.prepare(`SELECT * FROM ${table} WHERE public_id=? AND owner_id=? AND status='active'`).get(listingId,req.user.brave_id);
    if(!row)return res.status(404).json({message:'Only your active BRAVE listing can be advertised.'});
    const existing=db.prepare("SELECT * FROM marketplace_ads WHERE user_id=? AND listing_type=? AND listing_id=? AND status IN ('pending','active') ORDER BY id DESC LIMIT 1").get(req.user.brave_id,type,listingId);
    if(existing)return res.status(409).json({message:'This listing already has a pending or active advert.',advert:existing});
    const ad=id('ad'); db.prepare('INSERT INTO marketplace_ads(public_id,user_id,listing_type,listing_id,title,placement,status,payment_method,payment_reference,amount) VALUES(?,?,?,?,?,?,?,?,?,?)').run(ad,req.user.brave_id,type,listingId,row.name,placement,'pending','bank_transfer',reference,amount);
    audit('advertising_request_created','advert',ad,`${type}:${listingId}`);
    res.status(201).json({message:'Advert request submitted. It will appear in Popular on BRAVE after payment is verified and the advert is activated.',advert:db.prepare('SELECT * FROM marketplace_ads WHERE public_id=?').get(ad)});
  });

  app.get('/api/advertising/mine', requireUser, (req,res)=>res.json({adverts:db.prepare('SELECT * FROM marketplace_ads WHERE user_id=? ORDER BY id DESC').all(req.user.brave_id)}));
  app.get('/api/admin/advertising', requireAdmin, (req,res)=>res.json({adverts:db.prepare(`SELECT a.*,u.fullname,u.username,u.email FROM marketplace_ads a LEFT JOIN users u ON u.brave_id=a.user_id ORDER BY CASE a.status WHEN 'pending' THEN 0 WHEN 'active' THEN 1 ELSE 2 END,a.id DESC`).all()}));
  app.post('/api/admin/advertising/:id/action', requireAdmin, (req,res) => {
    const action=clean(req.body.action), a=db.prepare('SELECT * FROM marketplace_ads WHERE public_id=?').get(req.params.id);
    if(!a)return res.status(404).json({message:'Advert not found.'});
    if(action==='activate'){
      const days=Math.max(1,Math.min(90,Number(req.body.days)||7)); const start=now(), end=new Date(Date.now()+days*86400000).toISOString();
      db.prepare("UPDATE marketplace_ads SET status='active',starts_at=?,ends_at=?,approved_at=?,approved_by=?,updated_at=? WHERE public_id=?").run(start,end,start,'ADMIN',now(),a.public_id);
      audit('advertising_activated','advert',a.public_id,`${days} days`); return res.json({message:'Paid advert activated and will be displayed in Popular on BRAVE.',advert:db.prepare('SELECT * FROM marketplace_ads WHERE public_id=?').get(a.public_id)});
    }
    if(action==='reject'){db.prepare("UPDATE marketplace_ads SET status='rejected',updated_at=? WHERE public_id=?").run(now(),a.public_id);audit('advertising_rejected','advert',a.public_id);return res.json({message:'Advert request rejected.'});}
    if(action==='stop'){db.prepare("UPDATE marketplace_ads SET status='stopped',updated_at=? WHERE public_id=?").run(now(),a.public_id);audit('advertising_stopped','advert',a.public_id);return res.json({message:'Advert stopped.'});}
    return res.status(400).json({message:'Invalid advert action.'});
  });

  app.get('/api/account/limits', requireUser, (req,res)=>{
    const plan=currentPlan(req.user.brave_id), used=listingCount(req.user.brave_id), limit=limits[plan]??limits.basic;
    res.json({plan,used,limit,remaining:Math.max(0,limit-used),canCreateListing:used<limit,limits:{activeListings:limit},rank:ranks[plan]??0});
  });

  // A machine-readable public sharing payload for WhatsApp/social sharing.
  app.get('/api/public-share/:username', (req,res)=>{
    const u=ensureIdentity(db.prepare("SELECT * FROM users WHERE username=? AND account_status='active'").get(username(req.params.username)));
    if(!u)return res.status(404).json({message:'BRAVE page not found.'});
    const url=publicUrl('/u/'+u.username), title=`${u.fullname} | UNIQUE BRAVE`, description=u.public_bio||`${u.fullname} is on UNIQUE BRAVE. Find products, services, business information and ways to connect.`;
    res.json({url,title,description,shareText:`${title}\n${description}\n${url}`,reference:u.brave_reference,serial:u.brave_serial,image:publicUrl('/images/brave-logo.png')});
  });

  app.get('/api/admin/identity-audit', requireAdmin, (req,res)=>res.json({users:db.prepare('SELECT brave_id,username,fullname,brave_reference,brave_serial,created_at FROM users ORDER BY id DESC LIMIT 500').all()}));
  console.log('BRAVE CMD upgrade layer loaded: branded identity, organic member discovery, paid marketplace adverts, public sharing metadata and server-side listing limits.');
};
