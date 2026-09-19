const crypto = require('crypto');

module.exports = function registerBraveAdditions({app, db, helpers}) {
  const {requireUser, requireAdmin, clean, base64, id, now, serial15, audit, publicUrl, safeUser} = helpers;
  const hashToken = (token) => crypto.createHash('sha256').update(String(token)).digest('hex');
  const json = (v, fallback=[]) => { try { return JSON.parse(v || JSON.stringify(fallback)); } catch { return fallback; } };
  const ensureColumn = (table, columnDef) => { try { db.exec(`ALTER TABLE ${table} ADD COLUMN ${columnDef}`); } catch (_) {} };

  // Additive migration layer. Existing columns and tables are kept.
  ensureColumn('users', "cover_image TEXT DEFAULT ''");
  ensureColumn('users', "last_login_at TEXT");
  ensureColumn('users', "preferred_language TEXT DEFAULT 'ng'");
  ensureColumn('products', "old_price REAL");
  ensureColumn('products', "rating REAL DEFAULT 0");
  ensureColumn('products', "rating_count INTEGER DEFAULT 0");
  ensureColumn('products', "stock INTEGER");
  ensureColumn('products', "sku TEXT");
  ensureColumn('products', "brand TEXT DEFAULT ''");
  ensureColumn('products', "condition TEXT DEFAULT 'new'");
  ensureColumn('products', "location TEXT DEFAULT ''");
  ensureColumn('products', "delivery_estimate TEXT DEFAULT ''");
  ensureColumn('products', "return_policy TEXT DEFAULT ''");
  ensureColumn('products', "image_url TEXT DEFAULT ''");
  ensureColumn('products', "source_url TEXT DEFAULT ''");
  ensureColumn('products', "tags TEXT DEFAULT ''");
  ensureColumn('products', "views INTEGER DEFAULT 0");
  ensureColumn('products', "quantity INTEGER");
  ensureColumn('products', "quality TEXT DEFAULT ''");
  ensureColumn('products', "image_verified INTEGER DEFAULT 0");
  ensureColumn('products', "image_source TEXT DEFAULT ''");
  ensureColumn('products', "image_license TEXT DEFAULT ''");
  ensureColumn('products', "admin_note TEXT DEFAULT ''");
  ensureColumn('products', "published_at TEXT");
  ensureColumn('orders', "purchase_serial TEXT");
  ensureColumn('orders', "seller_payment_notice TEXT DEFAULT ''");
  ensureColumn('messages', "context TEXT DEFAULT ''");
  ensureColumn('messages', "payment_notice TEXT DEFAULT ''");
  ensureColumn('timeline_posts', "share_count INTEGER DEFAULT 0");
  ensureColumn('timeline_posts', "cover_style TEXT DEFAULT ''");
  ensureColumn('plans', "tagline TEXT DEFAULT ''");

  db.exec(`
  CREATE TABLE IF NOT EXISTS user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token_hash TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    remember_me INTEGER DEFAULT 1,
    expires_at TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    last_seen TEXT DEFAULT CURRENT_TIMESTAMP,
    ip TEXT DEFAULT '',
    user_agent TEXT DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS apprentices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    public_id TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT DEFAULT '',
    trade TEXT DEFAULT '',
    start_date TEXT DEFAULT '',
    education TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS receipt_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    public_id TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    sender TEXT DEFAULT '',
    recipient TEXT DEFAULT '',
    reference TEXT DEFAULT '',
    work TEXT DEFAULT '',
    amount REAL,
    delivery REAL,
    payment_status TEXT DEFAULT 'Pending validation',
    status TEXT DEFAULT 'pending',
    admin_note TEXT DEFAULT '',
    receipt_serial TEXT DEFAULT '',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    validated_at TEXT
  );
  CREATE TABLE IF NOT EXISTS staff_roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    active INTEGER DEFAULT 1,
    permissions TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS ai_knowledge (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic TEXT NOT NULL,
    keywords TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    locale TEXT DEFAULT 'ng',
    active INTEGER DEFAULT 1
  );
  CREATE TABLE IF NOT EXISTS product_interests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    action TEXT DEFAULT 'view',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS platform_daily_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_date TEXT UNIQUE NOT NULL,
    users INTEGER DEFAULT 0,
    products INTEGER DEFAULT 0,
    services INTEGER DEFAULT 0,
    orders INTEGER DEFAULT 0,
    receipts INTEGER DEFAULT 0,
    posts INTEGER DEFAULT 0,
    messages INTEGER DEFAULT 0,
    revenue REAL DEFAULT 0
  );
  `);

  // Admin staging services: exactly 25 curated demonstration/service catalogue entries.
  db.exec(`CREATE TABLE IF NOT EXISTS staging_services (
    id INTEGER PRIMARY KEY AUTOINCREMENT, public_id TEXT UNIQUE NOT NULL, name TEXT NOT NULL, category TEXT NOT NULL,
    description TEXT, price REAL DEFAULT 0, image_url TEXT DEFAULT '', image_data TEXT DEFAULT '', status TEXT DEFAULT 'pending',
    featured INTEGER DEFAULT 0, quantity INTEGER DEFAULT 1, admin_note TEXT DEFAULT '', created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP, published_at TEXT
  );`);
  const stagedServices=[
    ['Graphic Design','Creative & Digital','Logos, flyers, social media designs and business graphics.',15000],
    ['Web Development','Technology','Business websites, landing pages and web applications.',75000],
    ['Photography','Media','Portrait, product, event and business photography.',30000],
    ['Video Editing','Media','Short-form videos, adverts, reels and professional edits.',25000],
    ['Writing & Copywriting','Writing','Articles, product descriptions, captions, letters and business copy.',10000],
    ['Tailoring','Fashion','Custom clothing, alterations and fashion finishing.',20000],
    ['Hairdressing','Beauty','Hair styling, braiding, wig styling and treatments.',10000],
    ['Cleaning Services','Home Services','Home, office and post-event cleaning.',15000],
    ['Phone & Laptop Repairs','Repairs','Device diagnostics, software fixes and hardware repairs.',10000],
    ['Tutoring','Education','Academic tutoring and exam preparation.',12000],
    ['Digital Marketing','Business','Social media management, adverts and digital promotion.',30000],
    ['Transportation & Delivery','Logistics','Local dispatch, pickup and delivery services.',5000],
    ['Event Planning','Events','Event coordination, decoration planning and vendor support.',50000],
    ['Makeup Services','Beauty','Bridal, party and professional makeup services.',15000],
    ['Barbing','Beauty','Haircuts, grooming and styling.',5000],
    ['Electrical Repairs','Repairs','Household electrical troubleshooting and repairs.',10000],
    ['Plumbing','Repairs','Pipe, tap, drainage and household plumbing services.',10000],
    ['Catering','Food','Small-event catering, meals and food trays.',25000],
    ['Laundry Services','Home Services','Washing, ironing and garment care.',5000],
    ['Furniture Making','Home & Furniture','Custom furniture and repairs.',60000],
    ['Graphic & Motion Design','Creative & Digital','Motion graphics, animated adverts and visual branding.',30000],
    ['CV & Resume Writing','Professional','Professional CV, resume and cover-letter preparation.',8000],
    ['Data Entry & Typing','Digital Services','Typing, data entry, formatting and document cleanup.',5000],
    ['Social Media Management','Business','Content scheduling, page management and engagement support.',25000],
    ['Printing & Branding','Business','Business cards, banners, stickers and branded materials.',10000]
  ];
  const ssIns=db.prepare(`INSERT OR IGNORE INTO staging_services(public_id,name,category,description,price,status) VALUES(?,?,?,?,?,'pending')`);
  stagedServices.forEach((x,i)=>ssIns.run('staging-service-'+String(i+1).padStart(2,'0'),...x));

  // Seed the 100 staged products exactly once. They stay out of the public marketplace until admin publishes them.
  try {
    const staged = [...require('./staged_products_100'), ...require('./staged_products_100_more')];
    const insert = db.prepare(`INSERT OR IGNORE INTO products
      (public_id,owner_id,owner_name,owner_username,name,category,description,price,delivery_price,payment_method,image_data,video_data,featured,status,
       old_price,rating,rating_count,stock,sku,brand,condition,location,delivery_estimate,return_policy,image_url,source_url,tags,quantity,quality,image_verified,image_source,image_license,admin_note)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
    const tx = db.transaction(() => staged.forEach(p => insert.run(
      `staging-${p.sku.toLowerCase()}`,'CATALOGUE_STAGING','UNIQUE BRAVE Staging','uniquebrave',p.name,p.category,p.description,
      p.price,0,p.payment_method,'','',0,'pending',p.old_price,0,0,p.quantity,p.sku,p.brand,p.condition,p.location,p.delivery_estimate,p.return_policy,
      p.image_url,p.source_url,p.tags,p.quantity,p.quality,p.image_verified,p.image_source,p.image_license,p.admin_note
    )));
    tx();
  } catch(e) { console.error('Staging seed warning:', e.message); }

  // Stronger, specific plan descriptions; existing plan codes remain intact.
  const planRows = [
    ['basic','Basic','Free','Free access to the essentials','Browse goods & services','Post on Timeline','Basic BRAVE AI assistance','Basic Workshop tools','Personal profile','Standard customer support'],
    ['starter-business','Starter Business',1500,'For new sellers and small service providers','Everything in Basic','Seller/service profile tools','Up to 25 active listings','Basic business records','Negotiation chat tools','Daily activity overview'],
    ['premium','Premium',2500,'For growing sellers, professionals and active users','Everything in Starter Business','Featured profile options','Expanded listings and media','Advanced Workshop tools','Priority support queue','Enhanced AI product suggestions','Customer follow-up tools'],
    ['professional','Professional',7500,'For established businesses and busy professionals','Everything in Premium','Business growth tools','Higher catalogue limits','Advanced records and reports','Priority advisor access','Promotional placement options','Detailed daily business overview'],
    ['luxury','Luxury',12000,'For high-activity businesses that need deeper control','Everything in Professional','Priority admin support','Advanced marketplace analytics','Expanded team planning','Advanced advertising tools','Premium AI assistance','Enhanced customer-service tools'],
    ['enterprise','Enterprise',25000,'For organisations managing larger operations','Everything in Luxury','Custom business setup','Multi-user team administration','Advanced operational reporting','Priority support and escalation','Enterprise catalogue controls','Custom platform assistance']
  ];
  const updatePlan = db.prepare('UPDATE plans SET name=?,price=?,billing=?,features=?,tagline=? WHERE code=?');
  const insertPlan = db.prepare('INSERT OR IGNORE INTO plans(code,name,price,billing,features,tagline) VALUES(?,?,?,?,?,?)');
  for(const [code,name,price,tagline,...features] of planRows){
    insertPlan.run(code,name,price,'monthly',JSON.stringify(features),tagline);
    updatePlan.run(name,price,'monthly',JSON.stringify(features),tagline,code);
  }

  const knowledge = [
    ['marketplace','buy|shop|market|goods|product|item','How do I buy something?','Open Goods & Services, search for the item, open the seller listing, review the price, quality, delivery and payment arrangement, then add it to your cart or contact the seller.','ng'],
    ['services','service|work|hire|professional|repair|designer|typing','How do I find a service?','Tell me the service you need and your location or budget. I can suggest service listings and you can open the provider profile before contacting them.','ng'],
    ['negotiation','negotiate|price|reduce|discount|seller|seller price|how much','Can I negotiate with a seller?','Yes. Use Contact seller to discuss price or product details. Before sending money, check the seller profile, listing and payment arrangement.','ng'],
    ['payment-safety','pay|payment|transfer|opay|half|delivery','How should I pay?','Use the payment arrangement shown on the listing. A seller can choose pay on delivery, half payment or full payment. UNIQUE BRAVE does not treat an ordinary receipt as proof that money was actually paid.','ng'],
    ['receipts','receipt|fake receipt|validate receipt|receipt request','Can I generate a receipt immediately?','UNIQUE BRAVE now treats user-created receipts as requests. The request must be reviewed and validated before an official UNIQUE BRAVE receipt serial is issued.','ng'],
    ['profile','profile|seller page|timeline|seller details','How do I see a seller profile?','Tap the seller name or profile link. You can see the public profile, seller details, active goods and services, and public Timeline posts.','ng'],
    ['account','login|password|account|bug|fix account|unlock','My account has a problem.','Use Account Requests or Contact Admin. Customer-service staff can handle limited support tasks, while administrators retain full account controls.','ng'],
    ['apprentices','apprentice|learner|student|trainee','Can I save apprentice information?','Yes. Company Centre now includes an Apprentice Manager for names, contact information, trade, start date, education and notes.','ng'],
    ['plans','plan|premium|starter|professional|luxury|enterprise|subscription','What does a plan give me?','Each BRAVE plan is tied to specific features. Open Plans to compare marketplace, business, AI, support, reporting and team-management features.','ng'],
    ['timeline','facebook|timeline|post|like|comment|share','How does Timeline work?','Timeline is a social feed where users can post text, photos or video, view public profiles, react, comment and share. Keep private credentials out of public posts.','ng'],
    ['simple-pidgin','abeg|wetin|dey|una|oya|fit|don|wan|need|where my order dey','Understand Nigerian Pidgin','Yes. You can ask in normal English, Nigerian Pidgin and simple mixed wording. Example: “abeg find phone under 200k” or “wetin una get for laptop?”','ng'],
    ['simple-yoruba','mo fe|nibo|elo ni|se o|mo nilo|bawo ni|ra|ta','Understand simple Yoruba','I can work with common simple Yoruba phrases together with English or Pidgin. For best results, include the product, service or action you need.','ng'],
    ['ai-suggestions','suggest|recommend|which one|which product|help me choose|show me options','Can BRAVE AI suggest products?','Yes. BRAVE AI can use your wording, budget and category to return matching goods or services and explain why the listing may fit the request.','ng']
  ];
  const knew = db.prepare('SELECT 1 FROM ai_knowledge WHERE topic=? LIMIT 1');
  const kins = db.prepare('INSERT INTO ai_knowledge(topic,keywords,question,answer,locale) VALUES(?,?,?,?,?)');
  for(const row of knowledge){ if(!knew.get(row[0])) kins.run(...row); }

  // Automatic product stock guard for items with a defined quantity/stock.
  try {
    db.exec(`CREATE TRIGGER IF NOT EXISTS brave_validate_order_stock BEFORE INSERT ON order_items
      WHEN (SELECT COALESCE(quantity,stock,-1) FROM products WHERE public_id=NEW.product_id) >= 0
       AND NEW.quantity > (SELECT COALESCE(quantity,stock,0) FROM products WHERE public_id=NEW.product_id)
      BEGIN SELECT RAISE(ABORT,'Insufficient stock for this product.'); END;`);
    db.exec(`CREATE TRIGGER IF NOT EXISTS brave_reserve_order_stock AFTER INSERT ON order_items
      WHEN (SELECT quantity FROM products WHERE public_id=NEW.product_id) IS NOT NULL
      BEGIN UPDATE products SET quantity=MAX(0,quantity-NEW.quantity),stock=MAX(0,COALESCE(stock,quantity)-NEW.quantity),updated_at=CURRENT_TIMESTAMP WHERE public_id=NEW.product_id; END;`);
  } catch(e) { console.error('Stock trigger warning:', e.message); }

  function staff(req) {
    const row = db.prepare('SELECT * FROM staff_roles WHERE user_id=? AND active=1').get(req.user.brave_id);
    return row ? {...row,permissions:json(row.permissions,[])} : null;
  }
  function requireCustomerService(req,res,next){
    const u = req.headers.authorization ? requireUserResult(req) : null;
    if(!u) return res.status(401).json({message:'Please log in to continue.'});
    req.user=u; const r=staff(req); if(!r||!r.permissions.includes('customer_support')) return res.status(403).json({message:'Customer-service access is not enabled for this account.'}); next();
  }
  function requireUserResult(req){
    const token=String((req.headers.authorization||'').replace(/^Bearer\s+/i,'')||req.headers['x-session-token']||'').trim(); if(!token)return null;
    const row=db.prepare('SELECT user_id,expires_at FROM user_sessions WHERE token_hash=?').get(hashToken(token));
    if(!row||new Date(row.expires_at).getTime()<Date.now()) return null;
    const u=db.prepare('SELECT * FROM users WHERE brave_id=?').get(row.user_id); if(!u)return null;
    db.prepare('UPDATE user_sessions SET last_seen=? WHERE token_hash=?').run(now(),hashToken(token)); return u;
  }

  // Persistent session lookup endpoint for the frontend.
  app.get('/api/session/check', requireUser, (req,res)=>res.json({user:safeUser(req.user)}));

  // Profile image + cover, kept separate from the protected change-request workflow.
  app.post('/api/account/profile-image', requireUser, (req,res)=>{
    const image=base64(req.body.image); if(!image || !/^data:image\//.test(image)) return res.status(400).json({message:'Please select a valid image.'});
    db.prepare('UPDATE users SET profile_image=?,updated_at=? WHERE brave_id=?').run(image,now(),req.user.brave_id); audit('profile_image_updated','user',req.user.brave_id); res.json({message:'Profile picture updated.',user:safeUser(db.prepare('SELECT * FROM users WHERE brave_id=?').get(req.user.brave_id))});
  });
  app.post('/api/account/cover-image', requireUser, (req,res)=>{
    const image=base64(req.body.image); if(!image || !/^data:image\//.test(image)) return res.status(400).json({message:'Please select a valid cover image.'});
    db.prepare('UPDATE users SET cover_image=?,updated_at=? WHERE brave_id=?').run(image,now(),req.user.brave_id); audit('cover_image_updated','user',req.user.brave_id); res.json({message:'Cover photo updated.'});
  });

  // Apprentices manager.
  app.get('/api/apprentices', requireUser, (req,res)=>res.json({apprentices:db.prepare('SELECT * FROM apprentices WHERE user_id=? ORDER BY id DESC').all(req.user.brave_id)}));
  app.post('/api/apprentices', requireUser, (req,res)=>{
    const name=clean(req.body.name); if(!name)return res.status(400).json({message:'Apprentice name is required.'});
    const aid=id('apprentice'); db.prepare('INSERT INTO apprentices(public_id,user_id,name,phone,trade,start_date,education,notes,status) VALUES(?,?,?,?,?,?,?,?,?)').run(aid,req.user.brave_id,name,clean(req.body.phone),clean(req.body.trade),clean(req.body.startDate),clean(req.body.education),clean(req.body.notes),'active');
    audit('apprentice_added','user',req.user.brave_id,name); res.status(201).json({message:'Apprentice saved.',apprentice:db.prepare('SELECT * FROM apprentices WHERE public_id=?').get(aid)});
  });
  app.put('/api/apprentices/:id', requireUser, (req,res)=>{
    const a=db.prepare('SELECT * FROM apprentices WHERE public_id=? AND user_id=?').get(req.params.id,req.user.brave_id); if(!a)return res.status(404).json({message:'Apprentice not found.'});
    db.prepare('UPDATE apprentices SET name=?,phone=?,trade=?,start_date=?,education=?,notes=?,status=?,updated_at=? WHERE public_id=?').run(clean(req.body.name)||a.name,clean(req.body.phone),clean(req.body.trade),clean(req.body.startDate),clean(req.body.education),clean(req.body.notes),clean(req.body.status)||a.status,now(),a.public_id); res.json({message:'Apprentice updated.'});
  });
  app.delete('/api/apprentices/:id', requireUser, (req,res)=>{db.prepare('DELETE FROM apprentices WHERE public_id=? AND user_id=?').run(req.params.id,req.user.brave_id);res.json({message:'Apprentice removed.'});});

  // User overview + daily activity.
  app.get('/api/overview', requireUser, (req,res)=>{
    const u=req.user.brave_id, day=now().slice(0,10); const overview={products:db.prepare("SELECT COUNT(*) c FROM products WHERE owner_id=? AND status='active'").get(u).c,services:db.prepare("SELECT COUNT(*) c FROM services WHERE owner_id=? AND status='active'").get(u).c,posts:db.prepare('SELECT COUNT(*) c FROM timeline_posts WHERE user_id=?').get(u).c,orders:db.prepare('SELECT COUNT(*) c FROM orders WHERE buyer_id=?').get(u).c,unread:db.prepare('SELECT COUNT(*) c FROM notifications WHERE user_id=? AND is_read=0').get(u).c,messages:db.prepare('SELECT COUNT(*) c FROM messages WHERE sender_id=? OR receiver_id=?').get(u,u).c};
    const daily={date:day,newPosts:db.prepare("SELECT COUNT(*) c FROM timeline_posts WHERE user_id=? AND date(created_at)=date('now')").get(u).c,notifications:db.prepare("SELECT COUNT(*) c FROM notifications WHERE user_id=? AND date(created_at)=date('now')").get(u).c,advisorMessages:db.prepare("SELECT COUNT(*) c FROM advisor_messages WHERE user_id=? AND date(created_at)=date('now')").get(u).c,receipts:db.prepare("SELECT COUNT(*) c FROM receipts WHERE user_id=? AND date(created_at)=date('now')").get(u).c};
    res.json({overview,daily});
  });

  // Rich single-listing endpoint used by the additive marketplace detail view.
  app.get('/api/products/:id',(req,res)=>{
    const p=db.prepare("SELECT * FROM products WHERE public_id=? AND status='active'").get(req.params.id);
    if(!p)return res.status(404).json({message:'Product not found or no longer available.'});
    db.prepare('UPDATE products SET views=COALESCE(views,0)+1 WHERE public_id=?').run(p.public_id);
    res.json({product:p});
  });

  // Seller profile details without changing the existing public profile endpoint.
  app.get('/api/seller/:username', (req,res)=>{
    const u=db.prepare("SELECT * FROM users WHERE username=? AND account_status='active'").get(clean(req.params.username).toLowerCase()); if(!u)return res.status(404).json({message:'Seller not found.'});
    const posts=db.prepare("SELECT * FROM timeline_posts WHERE user_id=? AND status='active' ORDER BY id DESC LIMIT 50").all(u.brave_id);
    const products=db.prepare("SELECT * FROM products WHERE owner_id=? AND status='active' ORDER BY featured DESC,id DESC LIMIT 100").all(u.brave_id);
    const services=db.prepare("SELECT * FROM services WHERE owner_id=? AND status='active' ORDER BY id DESC LIMIT 100").all(u.brave_id);
    const businesses=db.prepare('SELECT * FROM businesses WHERE owner_id=? ORDER BY id DESC LIMIT 10').all(u.brave_id);
    res.json({user:safeUser(u),coverImage:u.cover_image||'',profileUrl:publicUrl('/u/'+u.username),posts,products,services,businesses,stats:{posts:posts.length,products:products.length,services:services.length}});
  });

  // Seller negotiation + WhatsApp-style direct conversation API.
  app.post('/api/products/:id/contact-seller', requireUser, (req,res)=>{
    const p=db.prepare("SELECT * FROM products WHERE public_id=? AND status='active'").get(req.params.id); if(!p)return res.status(404).json({message:'Product not found or no longer available.'});
    const seller=p.owner_id; if(!seller || seller===req.user.brave_id || seller==='ADMIN' || seller==='CATALOGUE_STAGING')return res.status(400).json({message:'This listing is not currently connected to an individual seller.'});
    const msg=clean(req.body.message)||`Hello, I am interested in ${p.name}. Is the price negotiable?`;
    const warning = p.payment_method==='pay_on_delivery' ? 'Payment safety: this listing allows pay on delivery. Do not send money outside the agreed arrangement.' : p.payment_method==='half_payment' ? 'Payment safety: this seller lists half payment. Confirm the exact amount, delivery terms and seller details before paying.' : 'Payment safety: confirm the seller arrangement and delivery details before making any payment.';
    const mid=id('msg'); db.prepare('INSERT INTO messages(public_id,sender_id,receiver_id,message,context,payment_notice) VALUES(?,?,?,?,?,?)').run(mid,req.user.brave_id,seller,msg,`product:${p.public_id}`,warning);
    db.prepare('INSERT INTO notifications(public_id,user_id,title,message) VALUES(?,?,?,?)').run(id('note'),seller,'New buyer message',`${req.user.fullname} sent you a message about ${p.name}.`);
    audit('seller_negotiation_started','product',p.public_id,req.user.brave_id); res.status(201).json({message:'Message sent to seller.',warning,conversationUserId:seller});
  });
  app.get('/api/conversations/:userId', requireUser, (req,res)=>{
    const other=clean(req.params.userId); const rows=db.prepare('SELECT * FROM messages WHERE (sender_id=? AND receiver_id=?) OR (sender_id=? AND receiver_id=?) ORDER BY id ASC').all(req.user.brave_id,other,other,req.user.brave_id); res.json({messages:rows});
  });
  app.post('/api/conversations/:userId', requireUser, (req,res)=>{
    const other=clean(req.params.userId), msg=clean(req.body.message); if(!other||!msg)return res.status(400).json({message:'Recipient and message are required.'});
    const target=db.prepare('SELECT * FROM users WHERE brave_id=? AND account_status="active"').get(other); if(!target)return res.status(404).json({message:'User not found.'});
    const mid=id('msg'); db.prepare('INSERT INTO messages(public_id,sender_id,receiver_id,message,context,payment_notice) VALUES(?,?,?,?,?,?)').run(mid,req.user.brave_id,other,msg,clean(req.body.context),clean(req.body.paymentNotice));
    db.prepare('INSERT INTO notifications(public_id,user_id,title,message) VALUES(?,?,?,?)').run(id('note'),other,'New message',`You received a new message from ${req.user.fullname}.`); res.status(201).json({message:'Sent.',item:db.prepare('SELECT * FROM messages WHERE public_id=?').get(mid)});
  });

  // Receipt requests: user submits details; admin validates before an official receipt exists.
  app.post('/api/receipt-requests', requireUser, (req,res)=>{
    const work=clean(req.body.work); if(!work)return res.status(400).json({message:'Product, service or work description is required.'});
    const rid=id('receipt-request'); db.prepare(`INSERT INTO receipt_requests(public_id,user_id,type,sender,recipient,reference,work,amount,delivery,payment_status)
      VALUES(?,?,?,?,?,?,?,?,?,?)`).run(rid,req.user.brave_id,clean(req.body.type)||'Sales Receipt',clean(req.body.sender),clean(req.body.recipient),clean(req.body.reference),work,req.body.amount===''?null:Number(req.body.amount)||null,req.body.delivery===''?null:Number(req.body.delivery)||null,'Pending validation');
    db.prepare('INSERT INTO notifications(public_id,user_id,title,message) VALUES(?,?,?,?)').run(id('note'),req.user.brave_id,'Receipt request submitted','Your receipt request is awaiting admin validation. No official receipt has been issued yet.');
    audit('receipt_request_created','receipt_request',rid,work); res.status(202).json({message:'Receipt request submitted for validation.',request:db.prepare('SELECT * FROM receipt_requests WHERE public_id=?').get(rid)});
  });
  app.get('/api/receipt-requests', requireUser, (req,res)=>res.json({requests:db.prepare('SELECT * FROM receipt_requests WHERE user_id=? ORDER BY id DESC').all(req.user.brave_id)}));
  app.get('/api/admin/receipt-requests', requireAdmin, (req,res)=>res.json({requests:db.prepare('SELECT r.*,u.fullname,u.username,u.email FROM receipt_requests r LEFT JOIN users u ON u.brave_id=r.user_id ORDER BY CASE WHEN r.status="pending" THEN 0 ELSE 1 END,r.id DESC').all()}));
  app.post('/api/admin/receipt-requests/:id/action', requireAdmin, (req,res)=>{
    const action=clean(req.body.action), row=db.prepare('SELECT * FROM receipt_requests WHERE public_id=?').get(req.params.id); if(!row)return res.status(404).json({message:'Receipt request not found.'});
    if(action==='reject'){db.prepare('UPDATE receipt_requests SET status="rejected",admin_note=?,updated_at=? WHERE public_id=?').run(clean(req.body.note),now(),row.public_id);db.prepare('INSERT INTO notifications(public_id,user_id,title,message) VALUES(?,?,?,?)').run(id('note'),row.user_id,'Receipt request declined',`Your receipt request ${row.public_id} was not validated.${clean(req.body.note)?' Note: '+clean(req.body.note):''}`);audit('receipt_request_rejected','receipt_request',row.public_id);return res.json({message:'Receipt request rejected.'});}
    if(action!=='approve')return res.status(400).json({message:'Use approve or reject.'});
    const serial='BRV-REC-'+serial15();
    const tx=db.transaction(()=>{
      db.prepare('INSERT INTO receipts(public_id,user_id,type,sender,recipient,reference,work,amount,delivery,payment_status) VALUES(?,?,?,?,?,?,?,?,?,?)').run(serial,row.user_id,row.type,row.sender,row.recipient,row.reference||serial,row.work,row.amount,row.delivery,'Validated by UNIQUE BRAVE admin');
      db.prepare('UPDATE receipt_requests SET status="approved",admin_note=?,receipt_serial=?,payment_status="Validated by admin",updated_at=?,validated_at=? WHERE public_id=?').run(clean(req.body.note),serial,now(),now(),row.public_id);
      db.prepare('INSERT INTO notifications(public_id,user_id,title,message) VALUES(?,?,?,?)').run(id('note'),row.user_id,'Receipt validated',`Your receipt request is approved. Official receipt serial: ${serial}`);
    }); tx(); audit('receipt_request_approved','receipt',serial,row.public_id); res.json({message:'Receipt request approved and receipt issued.',receipt:db.prepare('SELECT * FROM receipts WHERE public_id=?').get(serial)});
  });

  // Customer-service role with deliberately limited permissions.
  app.get('/api/customer-service/me', requireCustomerService, (req,res)=>res.json({user:safeUser(req.user),role:staff(req)}));
  app.get('/api/customer-service/requests', requireCustomerService, (req,res)=>res.json({requests:db.prepare('SELECT r.public_id,r.subject,r.description,r.status,r.admin_note,r.created_at,u.brave_id,u.fullname,u.username,u.email FROM customer_requests r LEFT JOIN users u ON u.brave_id=r.user_id ORDER BY CASE WHEN r.status="pending" THEN 0 ELSE 1 END,r.id DESC LIMIT 200').all()}));
  app.post('/api/customer-service/requests/:id/reply', requireCustomerService, (req,res)=>{
    const r=db.prepare('SELECT * FROM customer_requests WHERE public_id=?').get(req.params.id); if(!r)return res.status(404).json({message:'Request not found.'});
    const msg=clean(req.body.message); if(!msg)return res.status(400).json({message:'Reply is required.'});
    const user=db.prepare('SELECT * FROM users WHERE brave_id=?').get(r.user_id); if(!user)return res.status(404).json({message:'User not found.'});
    const mid=id('msg'); db.prepare('INSERT INTO messages(public_id,sender_id,receiver_id,message,context) VALUES(?,?,?,?,?)').run(mid,'CUSTOMER_SERVICE',r.user_id,msg,`customer_request:${r.public_id}`);
    db.prepare('INSERT INTO notifications(public_id,user_id,title,message) VALUES(?,?,?,?)').run(id('note'),r.user_id,'Customer service response',msg);
    db.prepare('UPDATE customer_requests SET status="resolved",admin_note=?,updated_at=? WHERE public_id=?').run(`Customer service: ${msg}`,now(),r.public_id); audit('customer_service_reply','request',r.public_id,user.brave_id); res.json({message:'Reply sent.'});
  });

  // Admin user control / repairs, with explicit audit trail.
  app.get('/api/admin/staff', requireAdmin, (req,res)=>res.json({staff:db.prepare('SELECT s.*,u.fullname,u.username,u.email FROM staff_roles s LEFT JOIN users u ON u.brave_id=s.user_id ORDER BY s.id DESC').all().map(s=>({...s,permissions:json(s.permissions,[])}))}));
  app.post('/api/admin/users/:id/staff-role', requireAdmin, (req,res)=>{
    const u=db.prepare('SELECT * FROM users WHERE brave_id=?').get(req.params.id); if(!u)return res.status(404).json({message:'User not found.'});
    const role=clean(req.body.role)||'customer_service'; if(role!=='customer_service')return res.status(400).json({message:'Only customer_service can be granted from this control.'});
    const permissions=['customer_support','view_customer_requests','reply_customer_requests'];
    db.prepare('INSERT INTO staff_roles(user_id,role,active,permissions,updated_at) VALUES(?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET role=excluded.role,active=excluded.active,permissions=excluded.permissions,updated_at=excluded.updated_at').run(u.brave_id,role,req.body.active===false?0:1,JSON.stringify(permissions),now()); audit('staff_role_updated','user',u.brave_id,role); res.json({message:'Customer-service access updated.'});
  });
  app.post('/api/admin/users/:id/repair', requireAdmin, (req,res)=>{
    const action=clean(req.body.action),u=db.prepare('SELECT * FROM users WHERE brave_id=?').get(req.params.id); if(!u)return res.status(404).json({message:'User not found.'});
    if(action==='clear_sessions'){db.prepare('DELETE FROM user_sessions WHERE user_id=?').run(u.brave_id);}
    else if(action==='activate_account'){db.prepare('UPDATE users SET account_status="active",updated_at=? WHERE brave_id=?').run(now(),u.brave_id);}
    else if(action==='clear_restriction'){db.prepare('UPDATE users SET account_status="active",updated_at=? WHERE brave_id=?').run(now(),u.brave_id);}
    else if(action==='reset_verification'){db.prepare('UPDATE users SET verification_status="unverified",email_verified=0,phone_verified=0,verification_serial="",updated_at=? WHERE brave_id=?').run(now(),u.brave_id);}
    else if(action==='notify_user'){db.prepare('INSERT INTO notifications(public_id,user_id,title,message) VALUES(?,?,?,?)').run(id('note'),u.brave_id,'Admin account support',clean(req.body.note)||'An administrator reviewed your account. Please try again.');}
    else if(action==='restore_profile'){db.prepare('UPDATE users SET account_status="active",updated_at=? WHERE brave_id=?').run(now(),u.brave_id);}
    else return res.status(400).json({message:'Unknown repair action.'});
    audit('account_repair_'+action,'user',u.brave_id,clean(req.body.note)); res.json({message:'Account support action completed.'});
  });
  app.get('/api/admin/users/:id/timeline/detail', requireAdmin, (req,res)=>{
    const u=db.prepare('SELECT * FROM users WHERE brave_id=?').get(req.params.id); if(!u)return res.status(404).json({message:'User not found.'});
    const posts=db.prepare('SELECT * FROM timeline_posts WHERE user_id=? ORDER BY id DESC LIMIT 100').all(u.brave_id);
    const detail=posts.map(p=>({post:p,likes:db.prepare('SELECT COUNT(*) c FROM timeline_likes WHERE post_id=?').get(p.public_id).c,comments:db.prepare('SELECT * FROM timeline_comments WHERE post_id=? ORDER BY id ASC').all(p.public_id)}));
    audit('user_timeline_viewed','user',u.brave_id); res.json({user:safeUser(u),coverImage:u.cover_image||'',posts:detail});
  });
  app.get('/api/admin/users/:id/chat', requireAdmin, (req,res)=>res.json({messages:db.prepare("SELECT * FROM messages WHERE sender_id=? OR receiver_id=? ORDER BY id ASC LIMIT 300").all(req.params.id,req.params.id)}));
  app.post('/api/admin/users/:id/chat', requireAdmin, (req,res)=>{const msg=clean(req.body.message);const u=db.prepare('SELECT * FROM users WHERE brave_id=?').get(req.params.id);if(!u)return res.status(404).json({message:'User not found.'});if(!msg)return res.status(400).json({message:'Message is required.'});const mid=id('msg');db.prepare('INSERT INTO messages(public_id,sender_id,receiver_id,message,context) VALUES(?,?,?,?,?)').run(mid,'ADMIN',u.brave_id,msg,'admin:user');db.prepare('INSERT INTO notifications(public_id,user_id,title,message) VALUES(?,?,?,?)').run(id('note'),u.brave_id,'Admin message',msg);audit('admin_user_message','user',u.brave_id,msg);res.json({message:'Admin message sent.'});});


  // Admin diagnostics: safe account health information before repair actions.
  app.get('/api/admin/users/:id/diagnostics', requireAdmin, (req,res)=>{
    const u=db.prepare('SELECT * FROM users WHERE brave_id=?').get(req.params.id); if(!u)return res.status(404).json({message:'User not found.'});
    const checks={accountStatus:u.account_status,verificationStatus:u.verification_status,sessions:db.prepare('SELECT COUNT(*) c FROM user_sessions WHERE user_id=? AND expires_at>?').get(u.brave_id,now()).c,posts:db.prepare('SELECT COUNT(*) c FROM timeline_posts WHERE user_id=?').get(u.brave_id).c,products:db.prepare('SELECT COUNT(*) c FROM products WHERE owner_id=?').get(u.brave_id).c,services:db.prepare('SELECT COUNT(*) c FROM services WHERE owner_id=?').get(u.brave_id).c,messages:db.prepare('SELECT COUNT(*) c FROM messages WHERE sender_id=? OR receiver_id=?').get(u.brave_id,u.brave_id).c,notifications:db.prepare('SELECT COUNT(*) c FROM notifications WHERE user_id=? AND is_read=0').get(u.brave_id).c,apprentices:db.prepare('SELECT COUNT(*) c FROM apprentices WHERE user_id=?').get(u.brave_id).c,lastLogin:u.last_login_at||null,updatedAt:u.updated_at||null};
    audit('account_diagnostics_viewed','user',u.brave_id); res.json({user:safeUser(u),checks});
  });

  // Additive simple-language AI understanding for common Nigerian Pidgin/Yoruba wording, budget phrases and catalogue suggestions.
  app.post('/api/ai/understand',(req,res)=>{
    const raw=clean(req.body.message); if(!raw)return res.status(400).json({message:'Please enter a message.'});
    const locale=['ng','gb','us'].includes(req.body.locale)?req.body.locale:'ng';
    const aliases=[['where my order dey','where is my order'],['una get','you have'],['mó fẹ́','i want'],['mo fe','i want'],['mofe','i want'],['mo nilo','i need'],['mo nílò','i need'],['elo ni','how much'],['ẹlo ni','how much'],['nibo','where'],['nìbo','where'],['abeg','please'],['wetin','what'],['una','you'],['dey','is'],['don','has'],['wan','want'],['fit','can'],['oya','okay'],['ra','buy'],['ta','sell']];
    let normalized=raw.toLowerCase(); for(const [a,b] of aliases)normalized=normalized.split(a).join(b);
    const m=normalized.match(/(?:under|below|less than|within|up to|max(?:imum)?(?: of)?|not more than)\s*[₦n]?\s*([0-9][0-9,]*(?:\.[0-9]+)?)(?:\s*(k|thousand|m|million))?/i);
    let budget=null;if(m){budget=Number(m[1].replace(/,/g,''));if(/k|thousand/i.test(m[2]||''))budget*=1000;else if(/m|million/i.test(m[2]||''))budget*=1000000;}
    const stop=new Set(['please','what','is','are','the','a','an','i','want','need','can','you','have','for','to','me','show','find','buy','sell','something','under','below','less','than','with','and']);
    const tokens=normalized.replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(Boolean).filter(x=>!stop.has(x)).slice(0,16);
    const products=db.prepare("SELECT * FROM products WHERE status='active' ORDER BY featured DESC,id DESC LIMIT 300").all();
    const services=db.prepare("SELECT * FROM services WHERE status='active' ORDER BY id DESC LIMIT 300").all();
    const score=x=>{const hay=[x.name,x.category,x.description,x.brand,x.tags].join(' ').toLowerCase();let n=0;for(const q of tokens){if(hay.includes(q))n+=q.length>=4?3:2;}if(budget!==null&&Number(x.price||0)>0&&Number(x.price)<=budget)n+=5;return n;};
    const pp=products.map(x=>[score(x),x]).filter(a=>a[0]>0).sort((a,b)=>b[0]-a[0]||Number(a[1].price||0)-Number(b[1].price||0)).slice(0,8).map(a=>a[1]);
    const ss=services.map(x=>[score(x),x]).filter(a=>a[0]>0).sort((a,b)=>b[0]-a[0]).slice(0,8).map(a=>a[1]);
    const knowledge=db.prepare('SELECT * FROM ai_knowledge WHERE active=1').all().filter(k=>k.keywords.split('|').some(w=>normalized.includes(w))).slice(0,4);
    let reply='';
    if(/^(hi|hello|hey|how far|good morning|good afternoon|good evening|yo)\b/i.test(normalized)) reply='How far 👋🏽 I’m BRAVE AI. Tell me what you want to buy, sell, find, book or manage.';
    else if(/order|delivery|my package|where.*order|track/.test(normalized)) reply='For an order, open Dashboard → Orders. Check the order status and contact the seller where available. Never share passwords or OTPs in chat.';
    else if(/receipt|fake receipt|validate/.test(normalized)) reply='Receipt creation starts as a request. An official UNIQUE BRAVE receipt serial is issued only after validation.';
    else if(/account|login|password|sign up|signup|unlock|bug|fix/.test(normalized)) reply='For account problems, use Account Requests or Contact Admin. Remembered sessions are stored server-side while the session is valid.';
    else if(pp.length||ss.length) reply=`I understand you. ${budget!==null?'Your budget is about ₦'+budget.toLocaleString('en-NG')+'. ':''}${pp.length?'Matching goods: '+pp.slice(0,3).map(x=>x.name).join(', ')+'. ':''}${ss.length?'Matching services: '+ss.slice(0,3).map(x=>x.name).join(', ')+'. ':''}You can open the listing or seller/provider profile before arranging payment.`;
    else if(knowledge.length) reply=knowledge.map(k=>k.answer).join(' ');
    else reply='I understand simple English, common Nigerian Pidgin and common everyday wording. Try: “abeg find phone under 200k”, “wetin una get for laptop?”, “mofe service”, or “elo ni this shoe?”.';
    try{const cid=id('ai');db.prepare('INSERT INTO ai_conversations(public_id,user_id,message,reply,locale) VALUES(?,?,?,?,?)').run(cid,clean(req.body.userId)||null,raw,reply,locale);}catch(_){ }
    res.json({reply,normalized,budget,products:pp,services:ss,knowledge:knowledge.map(k=>({topic:k.topic,question:k.question})),locale});
  });

  // Admin staging catalogue.
  app.get('/api/admin/staging-products', requireAdmin, (req,res)=>{
    const status=clean(req.query.status)||'pending', q=clean(req.query.q).toLowerCase();
    const rows=db.prepare('SELECT * FROM products WHERE owner_id="CATALOGUE_STAGING" AND status=? ORDER BY id ASC LIMIT 50').all(status).filter(p=>!q||JSON.stringify(p).toLowerCase().includes(q));
    res.json({count:rows.length,published:db.prepare("SELECT COUNT(*) c FROM products WHERE owner_id='CATALOGUE_STAGING' AND status='active'").get().c,pending:db.prepare("SELECT COUNT(*) c FROM products WHERE owner_id='CATALOGUE_STAGING' AND status='pending'").get().c,products:rows});
  });
  app.put('/api/admin/staging-products/:id', requireAdmin, (req,res)=>{
    const p=db.prepare('SELECT * FROM products WHERE public_id=? AND owner_id="CATALOGUE_STAGING"').get(req.params.id); if(!p)return res.status(404).json({message:'Staging item not found.'});
    const image=clean(req.body.imageUrl) || p.image_url || ''; const imageData=base64(req.body.imageData);
    const quantity=Math.max(0,Number(req.body.quantity ?? p.quantity ?? p.stock ?? 0)||0), price=Math.max(0,Number(req.body.price ?? p.price ?? 0)||0), oldPrice=Math.max(0,Number(req.body.oldPrice ?? p.old_price ?? 0)||0);
    const status=['pending','active','removed'].includes(clean(req.body.status))?clean(req.body.status):p.status;
    db.prepare(`UPDATE products SET name=?,category=?,description=?,price=?,old_price=?,quantity=?,stock=?,quality=?,brand=?,condition=?,location=?,delivery_estimate=?,return_policy=?,image_url=?,image_data=?,source_url=?,image_verified=?,image_source=?,image_license=?,admin_note=?,featured=?,status=?,published_at=?,updated_at=? WHERE public_id=?`).run(
      clean(req.body.name)||p.name,clean(req.body.category)||p.category,clean(req.body.description)||p.description,price,oldPrice,quantity,quantity,clean(req.body.quality)||p.quality,clean(req.body.brand)||p.brand,clean(req.body.condition)||p.condition,clean(req.body.location)||p.location,clean(req.body.deliveryEstimate)||p.delivery_estimate,clean(req.body.returnPolicy)||p.return_policy,image,imageData,clean(req.body.sourceUrl)||p.source_url,req.body.imageVerified?1:0,clean(req.body.imageSource)||p.image_source,clean(req.body.imageLicense)||p.image_license,clean(req.body.adminNote)||p.admin_note,req.body.featured?1:0,status,status==='active'?now():null,now(),p.public_id);
    audit('staging_product_edited','product',p.public_id,`${price}/${quantity}/${clean(req.body.quality)||p.quality}`); res.json({message:'Staging product updated.',product:db.prepare('SELECT * FROM products WHERE public_id=?').get(p.public_id)});
  });
  app.post('/api/admin/staging-products/:id/publish', requireAdmin, (req,res)=>{
    const p=db.prepare('SELECT * FROM products WHERE public_id=? AND owner_id="CATALOGUE_STAGING"').get(req.params.id); if(!p)return res.status(404).json({message:'Staging item not found.'});
    const finalImage=p.image_data||p.image_url; if(!finalImage)return res.status(400).json({message:'An image is required before publication.'});
    if(!(Number(p.price)>0))return res.status(400).json({message:'A valid price is required before publication.'});
    if(!(Number(p.quantity)>0))return res.status(400).json({message:'Quantity must be greater than 0 before publication.'});
    db.prepare('UPDATE products SET status="active",published_at=?,updated_at=? WHERE public_id=?').run(now(),now(),p.public_id); audit('staging_product_published','product',p.public_id); res.json({message:'Product published to the general marketplace.',product:db.prepare('SELECT * FROM products WHERE public_id=?').get(p.public_id)});
  });
  app.post('/api/admin/staging-products/:id/unpublish', requireAdmin, (req,res)=>{db.prepare('UPDATE products SET status="pending",published_at=NULL,updated_at=? WHERE public_id=? AND owner_id="CATALOGUE_STAGING"').run(now(),req.params.id);audit('staging_product_unpublished','product',req.params.id);res.json({message:'Product returned to staging.'});});

  // Admin service staging: edit image/price/listing, then publish to public marketplace.
  app.get('/api/admin/staging-services', requireAdmin, (req,res)=>{
    const status=clean(req.query.status)||'pending'; const q=clean(req.query.q).toLowerCase();
    const rows=db.prepare('SELECT * FROM staging_services WHERE status=? ORDER BY id ASC').all(status).filter(x=>!q||JSON.stringify(x).toLowerCase().includes(q));
    res.json({count:rows.length,published:db.prepare("SELECT COUNT(*) c FROM staging_services WHERE status='active'").get().c,pending:db.prepare("SELECT COUNT(*) c FROM staging_services WHERE status='pending'").get().c,services:rows});
  });
  app.put('/api/admin/staging-services/:id', requireAdmin, (req,res)=>{
    const x=db.prepare('SELECT * FROM staging_services WHERE public_id=?').get(req.params.id); if(!x)return res.status(404).json({message:'Staging service not found.'});
    const imageData=base64(req.body.imageData); const price=Math.max(0,Number(req.body.price ?? x.price)||0);
    const status=['pending','active','removed'].includes(clean(req.body.status))?clean(req.body.status):x.status;
    db.prepare(`UPDATE staging_services SET name=?,category=?,description=?,price=?,image_url=?,image_data=?,featured=?,status=?,admin_note=?,updated_at=?,published_at=? WHERE public_id=?`).run(clean(req.body.name)||x.name,clean(req.body.category)||x.category,clean(req.body.description)||x.description,price,clean(req.body.imageUrl)||x.image_url,imageData||x.image_data,req.body.featured?1:0,status,clean(req.body.adminNote)||x.admin_note,now(),status==='active'?now():x.published_at,x.public_id);
    res.json({message:'Staging service updated.',service:db.prepare('SELECT * FROM staging_services WHERE public_id=?').get(x.public_id)});
  });
  app.post('/api/admin/staging-services/:id/publish', requireAdmin, (req,res)=>{
    const x=db.prepare('SELECT * FROM staging_services WHERE public_id=?').get(req.params.id); if(!x)return res.status(404).json({message:'Staging service not found.'});
    if(!(Number(x.price)>0))return res.status(400).json({message:'A valid price is required before publication.'});
    const sid=id('service'); db.prepare(`INSERT INTO services(public_id,owner_id,owner_name,owner_username,name,category,description,price,image_data,status,created_at) VALUES(?,?,?,?,?,?,?,?,?,'active',?)`).run(sid,'ADMIN','UNIQUE BRAVE','uniquebrave',x.name,x.category,x.description,x.price,x.image_data||x.image_url,now());
    db.prepare('UPDATE staging_services SET status="active",published_at=?,updated_at=? WHERE public_id=?').run(now(),now(),x.public_id); audit('staging_service_published','service',x.public_id);
    res.json({message:'Service published to the marketplace.',service:db.prepare('SELECT * FROM services WHERE public_id=?').get(sid)});
  });
  app.post('/api/admin/staging-services/:id/unpublish', requireAdmin, (req,res)=>{db.prepare('UPDATE staging_services SET status="pending",published_at=NULL,updated_at=? WHERE public_id=?').run(now(),req.params.id);res.json({message:'Service returned to staging.'});});

  // Rich admin overview.
  app.get('/api/admin/overview-v2', requireAdmin, (req,res)=>{
    const today=now().slice(0,10); const get=c=>db.prepare(c).get().c;
    const data={users:get('SELECT COUNT(*) c FROM users'),products:get("SELECT COUNT(*) c FROM products WHERE status='active'"),services:get("SELECT COUNT(*) c FROM services WHERE status='active'"),stagedPending:get("SELECT COUNT(*) c FROM products WHERE owner_id='CATALOGUE_STAGING' AND status='pending'"),orders:get('SELECT COUNT(*) c FROM orders'),receiptRequests:get("SELECT COUNT(*) c FROM receipt_requests WHERE status='pending'"),customerRequests:get("SELECT COUNT(*) c FROM customer_requests WHERE status='pending'"),advisorMessages:get('SELECT COUNT(*) c FROM advisor_messages'),todayPosts:db.prepare("SELECT COUNT(*) c FROM timeline_posts WHERE date(created_at)=date('now')").get().c,todayMessages:db.prepare("SELECT COUNT(*) c FROM messages WHERE date(created_at)=date('now')").get().c};
    const revenue=db.prepare("SELECT COALESCE(SUM(amount),0) total FROM receipts WHERE date(created_at)=date('now') AND (payment_status LIKE 'Validated%' OR payment_status='confirmed')").get().total||0;
    data.date=today;data.todayRevenue=revenue;res.json(data);
  });

  // AI suggestion service with fuzzy token matching + simple language phrases.
  app.get('/api/ai/suggestions', (req,res)=>{
    const q=clean(req.query.q).toLowerCase(); if(!q)return res.json({suggestions:[],products:[],services:[]});
    const tokens=q.replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(Boolean).slice(0,12);
    const products=db.prepare("SELECT * FROM products WHERE status='active' ORDER BY featured DESC,id DESC LIMIT 250").all();
    const services=db.prepare("SELECT * FROM services WHERE status='active' ORDER BY id DESC LIMIT 250").all();
    const score=(x)=>tokens.reduce((n,t)=>n+(String(x.name||'').toLowerCase().includes(t)?4:0)+(String(x.category||'').toLowerCase().includes(t)?2:0)+(String(x.description||'').toLowerCase().includes(t)?1:0),0);
    const pp=products.map(x=>[score(x),x]).filter(x=>x[0]>0).sort((a,b)=>b[0]-a[0]).slice(0,6).map(x=>x[1]);
    const ss=services.map(x=>[score(x),x]).filter(x=>x[0]>0).sort((a,b)=>b[0]-a[0]).slice(0,6).map(x=>x[1]);
    const knowledge=db.prepare('SELECT * FROM ai_knowledge WHERE active=1').all().filter(k=>k.keywords.split('|').some(t=>q.includes(t))).slice(0,3);
    const suggestions=[...knowledge.map(k=>k.answer), ...(pp.length?['You may like '+pp.slice(0,3).map(p=>p.name).join(', ')]:[]), ...(ss.length?['For services, you can consider '+ss.slice(0,3).map(s=>s.name).join(', ')]:[])];
    res.json({suggestions,products:pp,services:ss});
  });


  // Paid advertising layer: admin-managed image/video campaigns shown as interstitials.
  db.exec(`
    CREATE TABLE IF NOT EXISTS brave_ads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      public_id TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      advertiser TEXT DEFAULT '',
      media_data TEXT NOT NULL,
      media_type TEXT NOT NULL,
      target_url TEXT DEFAULT '',
      price REAL DEFAULT 0,
      duration INTEGER DEFAULT 8,
      skip_after INTEGER DEFAULT 5,
      status TEXT DEFAULT 'draft',
      impressions INTEGER DEFAULT 0,
      clicks INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
  app.get('/api/ads/active',(req,res)=>{
    const ads=db.prepare("SELECT public_id,title,advertiser,media_data,media_type,target_url,duration,skip_after FROM brave_ads WHERE status='active' ORDER BY id DESC LIMIT 20").all();
    res.json({ads});
  });
  app.post('/api/ads/:id/impression',(req,res)=>{
    db.prepare('UPDATE brave_ads SET impressions=impressions+1 WHERE public_id=?').run(req.params.id); res.json({ok:true});
  });
  app.post('/api/ads/:id/click',(req,res)=>{
    db.prepare('UPDATE brave_ads SET clicks=clicks+1 WHERE public_id=?').run(req.params.id); res.json({ok:true});
  });
  app.get('/api/admin/ads',requireAdmin,(req,res)=>res.json({ads:db.prepare('SELECT * FROM brave_ads ORDER BY id DESC').all()}));
  app.post('/api/admin/ads',requireAdmin,(req,res)=>{
    const title=clean(req.body.title), media=base64(req.body.media);
    const type=clean(req.body.mediaType);
    if(!title||!media||!/^data:(image|video)\//.test(media))return res.status(400).json({message:'Ad title and a valid image/video are required.'});
    const aid=id('ad');
    db.prepare('INSERT INTO brave_ads(public_id,title,advertiser,media_data,media_type,target_url,price,duration,skip_after,status) VALUES(?,?,?,?,?,?,?,?,?,?)').run(
      aid,title,clean(req.body.advertiser),media,type,clean(req.body.targetUrl),Number(req.body.price||0),Math.max(3,Number(req.body.duration||8)),Math.max(0,Number(req.body.skipAfter||5)),'active'
    );
    audit('ad_created','advertisement',aid,title); res.status(201).json({message:'Advertisement published.',ad:db.prepare('SELECT * FROM brave_ads WHERE public_id=?').get(aid)});
  });
  app.post('/api/admin/ads/:id/status',requireAdmin,(req,res)=>{
    const status=['active','paused','completed','draft'].includes(clean(req.body.status))?clean(req.body.status):null;
    if(!status)return res.status(400).json({message:'Invalid ad status.'});
    db.prepare('UPDATE brave_ads SET status=?,updated_at=? WHERE public_id=?').run(status,now(),req.params.id);
    audit('ad_status_changed','advertisement',req.params.id,status); res.json({message:'Advertisement updated.'});
  });

  // Persist a small daily metric snapshot for admin overview.
  try {
    const day=now().slice(0,10);
    db.prepare(`INSERT INTO platform_daily_metrics(metric_date,users,products,services,orders,receipts,posts,messages,revenue)
      VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(metric_date) DO UPDATE SET users=excluded.users,products=excluded.products,services=excluded.services,orders=excluded.orders,receipts=excluded.receipts,posts=excluded.posts,messages=excluded.messages,revenue=excluded.revenue`).run(
      day,
      db.prepare('SELECT COUNT(*) c FROM users').get().c,
      db.prepare("SELECT COUNT(*) c FROM products WHERE status='active'").get().c,
      db.prepare("SELECT COUNT(*) c FROM services WHERE status='active'").get().c,
      db.prepare('SELECT COUNT(*) c FROM orders').get().c,
      db.prepare('SELECT COUNT(*) c FROM receipts').get().c,
      db.prepare('SELECT COUNT(*) c FROM timeline_posts').get().c,
      db.prepare('SELECT COUNT(*) c FROM messages').get().c,
      db.prepare('SELECT COALESCE(SUM(amount),0) total FROM receipts').get().total || 0
    );
  } catch(e) { console.error('Daily metric warning:', e.message); }

  console.log('BRAVE additive feature layer loaded: staging catalogue, persistent sessions, receipt validation, seller chat, profiles, apprentices, plans, AI suggestions, staff controls and admin tools.');
};
