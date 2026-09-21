require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const path = require('path');
const db = require('./backend/database');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_BASE_URL = String(process.env.PUBLIC_BASE_URL || process.env.APP_URL || 'https://brave-hub.onrender.com').replace(/\/$/, '');
app.use(cors());
app.use(express.json({limit:'15mb'}));
app.use(express.urlencoded({extended:true, limit:'15mb'}));
app.use(express.static(path.join(__dirname,'public'), {index:false}));

const userSessions = new Map();
const adminSessions = new Map();
const loginFailures = new Map();
const aiResponses = {
  ng: [
"How far! I’m UNIQUE BRAVE AI. Tell me what you’re looking for and I’ll help you find it.","No wahala. I can help you search products, services or businesses on UNIQUE BRAVE.","Oga/ma, tell me the product name, colour, location or budget you have in mind.","You can use the Marketplace to compare available products and sellers.","If you need a service, tell me the kind of professional you want and your location.","I can help you turn a rough business idea into a simple plan.","For a company, UNIQUE BRAVE can organise products, staff, customers, records and business pages.","If a seller has the item you want, I can help you understand the listing before you contact them.","You can post a product with photos, delivery details and your preferred payment method.","You can post a service with your category, description and media.","Pay on delivery can be selected when a listing supports it.","Half payment plus delivery can be shown on a product listing where the seller chooses it.","A receipt can be created even when payment is not enabled; UNIQUE BRAVE can mark it as an order record.","Need a CV? Open UNIQUE BRAVE Workshop and choose CV Builder.","Need a letter? Open Letter Maker in the Workshop.","Need a poster? Use Poster Maker and then print or save the result.","Need a document? Document Maker can prepare a clean printable page.","Need an invoice? Invoice Maker is available in the Workshop.","Need a social caption? Social Media Maker can create a starting draft.","Need a Google Form plan? Form Planner can turn your questions into a clean structure.","Your Timeline works like a simple social feed: write a post, add a photo or video, and publish.","You can use your username as a public identity link on UNIQUE BRAVE.","A public profile link makes it easier to share your UNIQUE BRAVE page with customers.","For privacy, never post passwords, OTP codes or private financial details on your Timeline.","If you see suspicious content, use the report option so the admin can review it.","UNIQUE BRAVE’s admin can review flagged content and account-security events.","If you need a business page, open Company Centre from your dashboard.","Company Centre can be used to organise staff, customers, records and marketing ideas.","Your business profile can contain a business name, category, contact details and website.","You can copy your business link and share it outside UNIQUE BRAVE.","If you are a seller, make your product title clear and add useful photos.","If you are a service provider, explain what you actually do and who you serve.","A clear description helps customers understand a listing before they message the seller.","For Nigerian users, you can enter a local phone number beginning with 0; UNIQUE BRAVE normalises Nigerian numbers for account checks.","British English spelling is fine on UNIQUE BRAVE; the AI can understand it.","American English spelling is fine too; the AI can understand it.","You can ask me about availability, suitability, colours, categories or finding a seller.","If I cannot find an exact match, try a shorter product name or a category.","For example, instead of a long description, try ‘black office chair’.","For services, try terms such as ‘graphic design’, ‘typing’, ‘photo editing’ or ‘electrical repair’.","UNIQUE BRAVE is designed to connect buyers, sellers, professionals and businesses in one place."
  ],
  gb: [
"Hello! I’m UNIQUE BRAVE AI. Tell me what you’re looking for and I’ll help you search.","Certainly. I can help you find products, services or businesses on UNIQUE BRAVE.","Tell me the item, colour, location or price range you have in mind.","Use Marketplace to browse products and compare listings.","If you need a service, tell me what sort of professional you need and where you are.","I can help you organise a straightforward business plan.","Companies can use UNIQUE BRAVE to organise products, staff, customers, records and business pages.","I can help you understand a listing before you contact the seller.","A product listing can include photographs, delivery information and a payment option.","A service listing can include its category, description and media.","Pay on delivery can be displayed where the seller has selected it.","Half payment plus delivery can be displayed where the seller has selected it.","You can create a receipt without enabling payment and label it as an order record.","Open CV Builder in UNIQUE BRAVE Workshop if you need a CV.","Open Letter Maker if you need a formal letter.","Poster Maker can help you prepare a simple printable poster.","Document Maker can create a clean printable document.","Invoice Maker is available in the Workshop.","Social Media Maker can help you draft a promotional caption.","Form Planner can turn a list of questions into a useful form structure.","Timeline works like a straightforward social feed, with text, photographs and videos.","Your username can be used as a public UNIQUE BRAVE profile link.","A public profile link is useful when sharing your UNIQUE BRAVE presence with customers.","For safety, do not publish passwords, one-time codes or private financial information.","Report suspicious content so the UNIQUE BRAVE administrator can review it.","The administrator can review flagged content and security events.","Company Centre is the place for business-focused tools.","Company Centre can help organise staff, customers, records and marketing.","Your business profile can include your business name, category, contact details and website.","You can copy and share your business link outside UNIQUE BRAVE.","Clear product titles and useful photographs make listings easier to understand.","Service providers should explain what they offer and who they help.","A useful description gives customers more information before they send a message.","Nigerian telephone numbers beginning with 0 can be normalised for account checks.","British English is supported in UNIQUE BRAVE AI.","American English is supported in UNIQUE BRAVE AI as well.","Ask me about availability, suitability, colours, categories or seller matching.","If there is no exact match, try a shorter name or a broader category.","For example, try ‘black office chair’ rather than a long sentence.","For services, try ‘graphic design’, ‘typing’, ‘photo editing’ or ‘electrical repair’.","UNIQUE BRAVE brings buyers, sellers, professionals and businesses together."
  ],
  us: [
"Hi! I’m UNIQUE BRAVE AI. Tell me what you’re looking for and I’ll help you search.","Sure. I can help you find products, services, or businesses on UNIQUE BRAVE.","Tell me the item, color, location, or price range you have in mind.","Use Marketplace to browse products and compare listings.","If you need a service, tell me what kind of professional you need and your location.","I can help you organise a simple business plan.","Companies can use UNIQUE BRAVE to organize products, staff, customers, records, and business pages.","I can help you understand a listing before you contact the seller.","A product listing can include photos, delivery details, and a payment option.","A service listing can include its category, description, and media.","Pay on delivery can be displayed when the seller selects it.","Half payment plus delivery can be displayed when the seller selects it.","You can create a receipt without enabling payment and label it as an order record.","Open CV Builder in UNIQUE BRAVE Workshop if you need a CV.","Open Letter Maker if you need a formal letter.","Poster Maker can help you prepare a simple printable poster.","Document Maker can create a clean printable document.","Invoice Maker is available in the Workshop.","Social Media Maker can help you draft a promotional caption.","Form Planner can turn your questions into a useful form structure.","Timeline works like a simple social feed, with text, photos, and videos.","Your username can be used as a public UNIQUE BRAVE profile link.","A public profile link is useful for sharing your UNIQUE BRAVE presence with customers.","For safety, do not publish passwords, one-time codes, or private financial information.","Report suspicious content so the UNIQUE BRAVE administrator can review it.","The administrator can review flagged content and security events.","Company Centre is the place for business-focused tools.","Company Centre can help organize staff, customers, records, and marketing.","Your business profile can include your business name, category, contact details, and website.","You can copy and share your business link outside UNIQUE BRAVE.","Clear product titles and useful photos make listings easier to understand.","Service providers should explain what they offer and who they help.","A useful description gives customers more information before they send a message.","Nigerian phone numbers beginning with 0 can be normalized for account checks.","British English is supported in UNIQUE BRAVE AI.","American English is supported in UNIQUE BRAVE AI too.","Ask me about availability, suitability, colors, categories, or seller matching.","If there is no exact match, try a shorter name or a broader category.","For example, try ‘black office chair’ instead of a long sentence.","For services, try ‘graphic design’, ‘typing’, ‘photo editing’, or ‘electrical repair’.","UNIQUE BRAVE brings buyers, sellers, professionals, and businesses together."
  ]
};
const allResponses = [...aiResponses.ng,...aiResponses.gb,...aiResponses.us];

function id(prefix){return prefix+'_'+crypto.randomBytes(8).toString('hex');}
function serial15(){let n='';while(n.length<15)n+=crypto.randomInt(0,10);return n.slice(0,15);}
function normalizePayment(v,kind='product'){
 const allowed=kind==='service'?['pay_after_service','half_payment','full_payment','disabled']:['pay_on_delivery','half_payment','full_payment','disabled'];
 return allowed.includes(v)?v:(kind==='service'?'pay_after_service':'pay_on_delivery');
}
function paymentLabel(v){return ({pay_on_delivery:'Pay on delivery',pay_after_service:'Pay after service',half_payment:'Half payment',full_payment:'Full payment',disabled:'Payment not enabled — record only'})[v]||v||'Payment arrangement not specified';}
function now(){return new Date().toISOString();}
function clean(v){return String(v??'').trim();}
function email(v){return clean(v).toLowerCase();}
function username(v){return clean(v).toLowerCase().replace(/[^a-z0-9_]/g,'').slice(0,24);}
function phone(v){let x=clean(v).replace(/[^\d+]/g,''); if(x.startsWith('0')) x='+234'+x.slice(1); return x;}
function base64(v){return typeof v==='string' && v.length < 14000000 ? v : '';}
function safeUser(u){if(!u)return null;return {id:u.brave_id,username:u.username,fullname:u.fullname,email:u.email,phone:u.phone||'',accountType:u.account_type||'Buyer',country:u.country,profileImage:u.profile_image||'',accountStatus:u.account_status||'active',verificationStatus:u.verification_status||'unverified',emailVerified:!!u.email_verified,phoneVerified:!!u.phone_verified,verificationSerial:u.verification_serial||'',createdAt:u.created_at};}
function currentUser(req){const t=clean((req.headers.authorization||'').replace(/^Bearer\s+/i,'')||req.headers['x-session-token']); if(!t)return null; const mem=userSessions.get(t); if(mem){const u=db.prepare('SELECT * FROM users WHERE brave_id=?').get(mem.userId); if(u)return u;} try{const h=crypto.createHash('sha256').update(t).digest('hex'); const row=db.prepare('SELECT user_id,expires_at FROM user_sessions WHERE token_hash=?').get(h); if(!row||new Date(row.expires_at).getTime()<Date.now())return null; const u=db.prepare('SELECT * FROM users WHERE brave_id=?').get(row.user_id); if(u){userSessions.set(t,{userId:u.brave_id,createdAt:Date.now(),rememberMe:true}); db.prepare('UPDATE user_sessions SET last_seen=? WHERE token_hash=?').run(now(),h); return u;} }catch(_){} return null;}
function requireUser(req,res,next){const u=currentUser(req);if(!u)return res.status(401).json({message:'Please log in to continue.'});if(u.account_status!=='active')return res.status(403).json({message:'Your account is not currently active.'});req.user=u;next();}
function requireAdmin(req,res,next){const t=clean(req.headers['x-admin-token']);if(!t||!adminSessions.has(t))return res.status(401).json({message:'Administrator authentication required.'});req.admin=true;next();}
function requireOwnerOrAdmin(req,res,next){const u=currentUser(req);if(u && u.account_status==='active'){req.user=u;req.admin=false;return next();}const t=clean(req.headers['x-admin-token']);if(t && adminSessions.has(t)){req.admin=true;return next();}return res.status(401).json({message:'Please log in to manage this listing.'});}
function audit(action,targetType='',targetId='',details=''){db.prepare('INSERT INTO admin_audit(public_id,action,target_type,target_id,details) VALUES(?,?,?,?,?)').run(id('audit'),action,targetType,targetId,details);}
function security(req,eventType,userId='',details='',score=0){db.prepare('INSERT INTO security_events(public_id,user_id,event_type,ip,user_agent,details,risk_score) VALUES(?,?,?,?,?,?,?)').run(id('sec'),userId,eventType,req.ip,clean(req.get('user-agent')),details,score);}
function publicUrl(p){return PUBLIC_BASE_URL+p;}
function transporter(){
 const host=String(process.env.SMTP_HOST||'').trim();
 const user=String(process.env.SMTP_USER||'').trim();
 const pass=String(process.env.SMTP_PASS||'').replace(/\s/g,'');
 if(!host||!user||!pass)return null;
 const port=Number(process.env.SMTP_PORT||587);
 const secure=String(process.env.SMTP_SECURE||'').toLowerCase()==='true' || port===465;
 return nodemailer.createTransport({host,port,secure,requireTLS:!secure && port===587,auth:{user,pass},connectionTimeout:15000,greetingTimeout:15000,socketTimeout:20000});
}
async function sendMail(to,subject,html){
 const t=transporter();
 if(!t){
   console.error('[EMAIL] SMTP is not configured. Required: SMTP_HOST, SMTP_USER and SMTP_PASS.');
   return {sent:false,code:'SMTP_NOT_CONFIGURED'};
 }
 try{
   await t.sendMail({from:String(process.env.SMTP_FROM||process.env.SMTP_USER).trim(),to,subject,html});
   console.log('[EMAIL] Password reset email sent successfully to',to);
   return {sent:true};
 }catch(e){
   console.error('[EMAIL] SMTP delivery failed:',e && e.message ? e.message : e);
   return {sent:false,code:'SMTP_SEND_FAILED',error:e && e.message ? e.message : String(e)};
 }
}

app.get('/',(req,res)=>res.sendFile(path.join(__dirname,'public','home.html')));
app.get('/home',(req,res)=>res.sendFile(path.join(__dirname,'public','home.html')));
app.get('/login',(req,res)=>res.sendFile(path.join(__dirname,'public','login.html')));
app.get('/register',(req,res)=>res.sendFile(path.join(__dirname,'public','register.html')));
app.get('/admin-login',(req,res)=>res.sendFile(path.join(__dirname,'public','admin-login.html')));
app.get('/admin',(req,res)=>res.sendFile(path.join(__dirname,'public','admin.html')));
app.get('/u/:username',(req,res)=>res.sendFile(path.join(__dirname,'public','profile.html')));
app.get('/customer-service',(req,res)=>res.sendFile(path.join(__dirname,'public','customer-service.html')));

app.get('/api/status',(req,res)=>res.json({status:'online',service:'UNIQUE BRAVE',database:'connected',publicBaseUrl:PUBLIC_BASE_URL,twilio:'optional',aiResponses:allResponses.length,time:now()}));

app.post('/register',async(req,res)=>{
 try{
  const fullname=clean(req.body.fullname), uname=username(req.body.username||fullname.split(/\s+/)[0]), em=email(req.body.email), ph=phone(req.body.phone), country=clean(req.body.country)||'Nigeria', accountType=clean(req.body.accountType)||'Buyer', pw=String(req.body.password||'');
  if(!fullname||!uname||!em||!ph||!['Buyer','Product-Goods Seller','Service Provider'].includes(accountType)||pw.length<8)return res.status(400).json({message:'Please complete all required fields. Password must contain at least 8 characters.'});
  if(req.body.acceptedTerms!==true)return res.status(400).json({message:'You must accept the Terms & Conditions.'});
  if(db.prepare('SELECT 1 FROM users WHERE email=? OR username=? OR phone=?').get(em,uname,ph))return res.status(409).json({message:'Email, username or phone number is already in use.'});
  const hash=await bcrypt.hash(pw,10), uid=id('user');
  db.prepare(`INSERT INTO users(brave_id,username,fullname,email,country,phone,account_type,password_hash,created_at,updated_at,terms_accepted_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)`).run(uid,uname,fullname,em,country,ph,accountType,hash,now(),now(),now());
  db.prepare('INSERT INTO notifications(public_id,user_id,title,message) VALUES(?,?,?,?,?)'.replace('VALUES(?,?,?,?,?)','VALUES(?,?,?,?)')).run(id('note'),uid,'Welcome to UNIQUE BRAVE','Your account has been created successfully.');
  audit('user_registered','user',uid,uname);
  res.status(201).json({message:'Account created successfully. Phone verification is optional until Twilio is configured.',user:safeUser(db.prepare('SELECT * FROM users WHERE brave_id=?').get(uid)),publicProfile:publicUrl('/u/'+uname)});
 }catch(e){console.error(e);res.status(500).json({message:'Unable to create your account right now.'});}
});

app.post('/login',async(req,res)=>{
 try{
  const identifier=clean(req.body.identifier||req.body.email||req.body.phone);
  const pw=String(req.body.password||'');
  if(req.body.acceptedTerms!==true)return res.status(400).json({message:'Please accept the Terms & Conditions before logging in.'});
  const normalizedEmail=email(identifier);
  const normalizedPhone=phone(identifier);
  const u=db.prepare('SELECT * FROM users WHERE email=? OR phone=? OR username=?').get(normalizedEmail,normalizedPhone,username(identifier));
  if(!u || !(await bcrypt.compare(pw,u.password_hash))){
   db.prepare('INSERT INTO login_events(public_id,user_id,identifier,success,ip,user_agent) VALUES(?,?,?,?,?,?)').run(id('login'),u?.brave_id||null,identifier,0,req.ip,clean(req.get('user-agent')));
   security(req,'failed_login',u?.brave_id||'',`Failed login for ${identifier}`,35);
   return res.status(401).json({message:'Invalid email, phone, username or password.'});
  }
  if(u.account_status!=='active')return res.status(403).json({message:'Your account is currently '+u.account_status+'.'});
  const token=crypto.randomBytes(32).toString('hex');
  const rememberMe=req.body.rememberMe!==false;
  userSessions.set(token,{userId:u.brave_id,createdAt:Date.now(),rememberMe});
  try{db.prepare('DELETE FROM user_sessions WHERE user_id=? AND expires_at < ?').run(u.brave_id,now()); const expires=new Date(Date.now()+(rememberMe?30:1)*24*60*60*1000).toISOString(); db.prepare('INSERT INTO user_sessions(token_hash,user_id,remember_me,expires_at,ip,user_agent) VALUES(?,?,?,?,?,?)').run(crypto.createHash('sha256').update(token).digest('hex'),u.brave_id,rememberMe?1:0,expires,req.ip,clean(req.get('user-agent')));}catch(e){console.error('session persistence warning:',e.message);}
  db.prepare('INSERT INTO login_events(public_id,user_id,identifier,success,ip,user_agent) VALUES(?,?,?,?,?,?)').run(id('login'),u.brave_id,identifier,1,req.ip,clean(req.get('user-agent')));
  try{db.prepare('UPDATE users SET last_login_at=?,preferred_language=COALESCE(preferred_language,?) WHERE brave_id=?').run(now(),clean(req.body.locale)||'ng',u.brave_id);}catch(_){}
  audit('user_login','user',u.brave_id,u.username);
  res.json({message:'Login successful.',token,user:safeUser(u),publicProfile:publicUrl('/u/'+u.username)});
 }catch(e){console.error(e);res.status(500).json({message:'Unable to log in right now.'});}
});

app.post('/logout',(req,res)=>{const t=clean((req.headers.authorization||'').replace(/^Bearer\s+/i,'')||req.headers['x-session-token']);userSessions.delete(t);try{db.prepare('DELETE FROM user_sessions WHERE token_hash=?').run(crypto.createHash('sha256').update(t).digest('hex'));}catch(_){}res.json({message:'Logged out successfully.'});});
app.get('/api/me',requireUser,(req,res)=>res.json({user:safeUser(req.user),usernameLink:publicUrl('/u/'+req.user.username)}));
app.post('/api/account/profile',requireUser,(req,res)=>{const name=clean(req.body.fullname);if(!name)return res.status(400).json({message:'Name is required.'});db.prepare('UPDATE users SET fullname=?,updated_at=? WHERE brave_id=?').run(name,now(),req.user.brave_id);res.json({message:'Profile updated.',user:safeUser(db.prepare('SELECT * FROM users WHERE brave_id=?').get(req.user.brave_id))});});
app.post('/api/account/username',requireUser,(req,res)=>{
 const requested=username(req.body.username);
 if(requested.length<3)return res.status(400).json({message:'Username must contain at least 3 letters or numbers.'});
 if(requested===req.user.username)return res.json({message:'Username is unchanged.',user:safeUser(req.user)});
 const taken=db.prepare('SELECT 1 FROM users WHERE username=? AND brave_id<>?').get(requested,req.user.brave_id);
 if(taken)return res.status(409).json({message:'That username is already in use.'});
 db.prepare('UPDATE users SET username=?,updated_at=? WHERE brave_id=?').run(requested,now(),req.user.brave_id);
 db.prepare('UPDATE products SET owner_username=? WHERE owner_id=?').run(requested,req.user.brave_id);
 db.prepare('UPDATE services SET owner_username=? WHERE owner_id=?').run(requested,req.user.brave_id);
 db.prepare('UPDATE timeline_posts SET username=? WHERE user_id=?').run(requested,req.user.brave_id);
 audit('username_changed','user',req.user.brave_id,requested);
 res.json({message:'Username changed successfully.',user:safeUser(db.prepare('SELECT * FROM users WHERE brave_id=?').get(req.user.brave_id))});
});


app.post('/change-password',requireUser,async(req,res)=>{const current=String(req.body.currentPassword||''), next=String(req.body.newPassword||'');if(next.length<6)return res.status(400).json({message:'New password must contain at least 6 characters.'});if(!await bcrypt.compare(current,req.user.password_hash))return res.status(401).json({message:'Current password is incorrect.'});db.prepare('UPDATE users SET password_hash=?,updated_at=? WHERE brave_id=?').run(await bcrypt.hash(next,10),now(),req.user.brave_id);security(req,'password_changed',req.user.brave_id,'Password changed',0);res.json({message:'Password changed successfully.'});});

app.post('/api/account/change-request',requireUser,(req,res)=>{const type=clean(req.body.type), reason=clean(req.body.reason), requestedValue=clean(req.body.requestedValue);const allowed=['phone number','email address','verification method','profile image','account deletion'];if(!allowed.includes(type))return res.status(400).json({message:'Unsupported protected change.'});const pending=db.prepare('SELECT 1 FROM protected_requests WHERE user_id=? AND type=? AND status=?').get(req.user.brave_id,type,'pending');if(pending)return res.status(409).json({message:'You already have a pending request of this type.'});db.prepare('INSERT INTO protected_requests(public_id,user_id,type,reason,requested_value) VALUES(?,?,?,?,?)').run(id('request'),req.user.brave_id,type,reason,requestedValue);security(req,'protected_change_request',req.user.brave_id,type,15);res.status(201).json({message:'Request sent to admin for review.'});});

app.get('/api/products',(req,res)=>res.json(db.prepare("SELECT * FROM products WHERE status='active' ORDER BY random()").all().map(p=>({...p,publicUrl:publicUrl('/product/'+p.public_id)}))));
app.post('/api/products',requireUser,(req,res)=>{const name=clean(req.body.name||req.body.title);if(!name)return res.status(400).json({message:'Product name is required.'});const image=base64(req.body.image),video=base64(req.body.video),pdf=base64(req.body.pdf);for(const [v,label] of [[image,'image'],[video,'video'],[pdf,'PDF']])if(v&& !new RegExp('^data:(image|video|application/pdf)(/|;)').test(v))return res.status(400).json({message:`Invalid ${label} upload.`});const pid=id('product');db.prepare(`INSERT INTO products(public_id,owner_id,owner_name,owner_username,name,category,description,price,delivery_price,payment_method,image_data,video_data,pdf_data,featured,status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(pid,req.user.brave_id,req.user.fullname,req.user.username,name,clean(req.body.category)||'General',clean(req.body.description),req.body.price===''?null:Number(req.body.price)||null,req.body.deliveryPrice===''?null:Number(req.body.deliveryPrice)||null,normalizePayment(req.body.paymentMethod,'product'),image,video,pdf,0,'active');db.prepare('INSERT INTO notifications(public_id,user_id,title,message) VALUES(?,?,?,?)').run(id('note'),req.user.brave_id,'Product published','Your product is now visible in the marketplace.');res.status(201).json({message:'Product published successfully.',product:db.prepare('SELECT * FROM products WHERE public_id=?').get(pid)});});
app.post('/api/admin/products',requireAdmin,(req,res)=>{const name=clean(req.body.name);if(!name)return res.status(400).json({message:'Product name is required.'});const pid=id('product');db.prepare(`INSERT INTO products(public_id,owner_id,owner_name,owner_username,name,category,description,price,delivery_price,payment_method,image_data,video_data,pdf_data,featured,status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(pid,'ADMIN','UNIQUE BRAVE','uniquebrave',name,clean(req.body.category)||'Featured',clean(req.body.description),req.body.price===''?null:Number(req.body.price)||null,req.body.deliveryPrice===''?null:Number(req.body.deliveryPrice)||null,normalizePayment(req.body.paymentMethod,'product'),base64(req.body.image),base64(req.body.video),base64(req.body.pdf),1,'active');audit('admin_product_posted','product',pid,name);res.status(201).json({message:'Admin product posted.',product:db.prepare('SELECT * FROM products WHERE public_id=?').get(pid)});});
app.get('/product/:id',(req,res)=>res.redirect('/marketplace.html?product='+encodeURIComponent(req.params.id)));
app.get('/service/:id',(req,res)=>res.redirect('/marketplace.html?service='+encodeURIComponent(req.params.id)));

app.get('/api/services',(req,res)=>res.json(db.prepare("SELECT * FROM services WHERE status='active' ORDER BY random()").all()));
app.post('/api/services',requireUser,(req,res)=>{const name=clean(req.body.name||req.body.title);if(!name)return res.status(400).json({message:'Service name is required.'});const image=base64(req.body.image),video=base64(req.body.video),pdf=base64(req.body.pdf);for(const [v,label,rx] of [[image,'image',/^data:image\//],[video,'video',/^data:video\//],[pdf,'PDF',/^data:application\/pdf(?:;|,)/]])if(v&&!rx.test(v))return res.status(400).json({message:`Invalid ${label} upload.`});const sid=id('service');db.prepare(`INSERT INTO services(public_id,owner_id,owner_name,owner_username,name,category,description,price,payment_method,image_data,video_data,pdf_data,status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(sid,req.user.brave_id,req.user.fullname,req.user.username,name,clean(req.body.category)||'Professional service',clean(req.body.description),req.body.price===''?null:Number(req.body.price)||null,normalizePayment(req.body.paymentMethod,'service'),image,video,pdf,'active');db.prepare('INSERT INTO notifications(public_id,user_id,title,message) VALUES(?,?,?,?)').run(id('note'),req.user.brave_id,'Service published','Your service is now visible in the marketplace.');res.status(201).json({message:'Service published successfully.',service:db.prepare('SELECT * FROM services WHERE public_id=?').get(sid)});});

app.get('/api/timeline/feed', (req,res)=>res.json(db.prepare("SELECT * FROM timeline_posts WHERE status='active' ORDER BY id DESC LIMIT 100").all()));
app.get('/api/timeline/:userId',(req,res)=>res.json(db.prepare("SELECT * FROM timeline_posts WHERE user_id=? AND status='active' ORDER BY id DESC").all(req.params.userId)));
app.post('/api/timeline',requireUser,(req,res)=>{const text=clean(req.body.text);const media=base64(req.body.media);if(!text&&!media)return res.status(400).json({message:'Write something or add a photo/video.'});if(media && !/^data:(image|video|application\/pdf)\//.test(media))return res.status(400).json({message:'Only image, video or PDF media is allowed.'});const pid=id('post');const type=clean(req.body.mediaType)||((media.match(/^data:([^;]+)/)||[])[1]||'');db.prepare('INSERT INTO timeline_posts(public_id,user_id,username,fullname,text,media_data,media_type) VALUES(?,?,?,?,?,?,?)').run(pid,req.user.brave_id,req.user.username,req.user.fullname,text,media,type);res.status(201).json({message:'Posted to Timeline.',post:db.prepare('SELECT * FROM timeline_posts WHERE public_id=?').get(pid)});});
app.post('/api/timeline/:id/view',(req,res)=>{db.prepare('UPDATE timeline_posts SET views=views+1 WHERE public_id=?').run(req.params.id);res.json({ok:true});});

app.get('/api/timeline/:id/social', (req,res)=>{
 const likes=db.prepare('SELECT COUNT(*) c FROM timeline_likes WHERE post_id=?').get(req.params.id).c;
 const comments=db.prepare('SELECT public_id,username,fullname,comment,created_at FROM timeline_comments WHERE post_id=? ORDER BY id ASC').all(req.params.id);
 res.json({likes,comments});
});
app.post('/api/timeline/:id/like',requireUser,(req,res)=>{
 const exists=db.prepare('SELECT id FROM timeline_likes WHERE post_id=? AND user_id=?').get(req.params.id,req.user.brave_id);
 if(exists) db.prepare('DELETE FROM timeline_likes WHERE id=?').run(exists.id);
 else db.prepare('INSERT INTO timeline_likes(post_id,user_id) VALUES(?,?)').run(req.params.id,req.user.brave_id);
 res.json({liked:!exists,likes:db.prepare('SELECT COUNT(*) c FROM timeline_likes WHERE post_id=?').get(req.params.id).c});
});
app.post('/api/timeline/:id/comment',requireUser,(req,res)=>{
 const comment=clean(req.body.comment); if(!comment)return res.status(400).json({message:'Comment cannot be empty.'});
 const cid=id('comment'); db.prepare('INSERT INTO timeline_comments(public_id,post_id,user_id,username,fullname,comment) VALUES(?,?,?,?,?,?)').run(cid,req.params.id,req.user.brave_id,req.user.username,req.user.fullname,comment);
 res.status(201).json({message:'Comment added.',comment:db.prepare('SELECT public_id,username,fullname,comment,created_at FROM timeline_comments WHERE public_id=?').get(cid)});
});


app.get('/api/search',(req,res)=>{const q=clean(req.query.q).toLowerCase();if(!q)return res.json({products:[],services:[],users:[]});const like='%'+q+'%';res.json({products:db.prepare("SELECT public_id,name,category,description,owner_name,owner_username,price,featured FROM products WHERE status='active' AND (lower(name) LIKE ? OR lower(category) LIKE ? OR lower(description) LIKE ?) ORDER BY random() LIMIT 30").all(like,like,like),services:db.prepare("SELECT public_id,name,category,description,owner_name,owner_username,price FROM services WHERE status='active' AND (lower(name) LIKE ? OR lower(category) LIKE ? OR lower(description) LIKE ?) ORDER BY id DESC LIMIT 30").all(like,like,like),users:db.prepare("SELECT username,fullname,country FROM users WHERE account_status='active' AND (lower(username) LIKE ? OR lower(fullname) LIKE ?) LIMIT 30").all(like,like)});});

app.get('/api/profile/:username',(req,res)=>{const u=db.prepare('SELECT * FROM users WHERE username=? AND account_status=\'active\'').get(username(req.params.username));if(!u)return res.status(404).json({message:'Profile not found.'});const posts=db.prepare("SELECT * FROM timeline_posts WHERE user_id=? AND status='active' ORDER BY id DESC LIMIT 50").all(u.brave_id);const products=db.prepare("SELECT * FROM products WHERE owner_id=? AND status='active' ORDER BY random() LIMIT 50").all(u.brave_id);const services=db.prepare("SELECT * FROM services WHERE owner_id=? AND status='active' ORDER BY id DESC LIMIT 50").all(u.brave_id);res.json({user:safeUser(u),profileUrl:publicUrl('/u/'+u.username),posts,products,services});});

app.post('/api/records',requireUser,(req,res)=>{const rid=id('record');db.prepare('INSERT INTO records(public_id,user_id,record_type,title,details,amount,reference) VALUES(?,?,?,?,?,?,?)').run(rid,req.user.brave_id,clean(req.body.recordType)||'general',clean(req.body.title),clean(req.body.details),req.body.amount===''?null:Number(req.body.amount)||null,clean(req.body.reference));res.status(201).json({message:'Record saved.',record:db.prepare('SELECT * FROM records WHERE public_id=?').get(rid)});});
app.get('/api/records',requireUser,(req,res)=>res.json({records:db.prepare('SELECT * FROM records WHERE user_id=? ORDER BY id DESC').all(req.user.brave_id)}));

app.post('/api/receipts',requireUser,(req,res)=>{const work=clean(req.body.work);if(!work)return res.status(400).json({message:'Product, service or work description is required.'});const rid=id('receipt-request');db.prepare('INSERT INTO receipt_requests(public_id,user_id,type,sender,recipient,reference,work,amount,delivery,payment_status) VALUES(?,?,?,?,?,?,?,?,?,?)').run(rid,req.user.brave_id,clean(req.body.type)||'Sales Receipt',clean(req.body.sender),clean(req.body.recipient),clean(req.body.reference),work,req.body.amount===''?null:Number(req.body.amount)||null,req.body.delivery===''?null:Number(req.body.delivery)||null,'Pending validation');db.prepare('INSERT INTO notifications(public_id,user_id,title,message) VALUES(?,?,?,?)').run(id('note'),req.user.brave_id,'Receipt request submitted','Your receipt request is awaiting admin validation. No official receipt has been issued yet.');audit('receipt_request_created','receipt_request',rid,work);res.status(202).json({message:'Receipt request submitted for validation.',request:db.prepare('SELECT * FROM receipt_requests WHERE public_id=?').get(rid)});});
app.get('/api/receipts',requireUser,(req,res)=>res.json({receipts:db.prepare('SELECT * FROM receipts WHERE user_id=? ORDER BY id DESC').all(req.user.brave_id)}));

app.post('/api/customers',requireUser,(req,res)=>{const cid=id('customer');db.prepare('INSERT INTO customers(public_id,user_id,name,contact,notes) VALUES(?,?,?,?,?)').run(cid,req.user.brave_id,clean(req.body.name),clean(req.body.contact),clean(req.body.notes));res.status(201).json({message:'Customer saved.'});});
app.get('/api/customers',requireUser,(req,res)=>res.json({customers:db.prepare('SELECT * FROM customers WHERE user_id=? ORDER BY id DESC').all(req.user.brave_id)}));

app.post('/api/businesses',requireUser,(req,res)=>{const bid=id('business');db.prepare('INSERT INTO businesses(public_id,owner_id,username,name,category,description,phone,email,address,website,logo_data) VALUES(?,?,?,?,?,?,?,?,?,?,?)').run(bid,req.user.brave_id,req.user.username,clean(req.body.name),clean(req.body.category),clean(req.body.description),clean(req.body.phone),clean(req.body.email),clean(req.body.address),clean(req.body.website),base64(req.body.logo));res.status(201).json({message:'Business profile saved.',business:db.prepare('SELECT * FROM businesses WHERE public_id=?').get(bid)});});
app.get('/api/businesses/mine',requireUser,(req,res)=>res.json({businesses:db.prepare('SELECT * FROM businesses WHERE owner_id=? ORDER BY id DESC').all(req.user.brave_id)}));

app.post('/api/messages',requireUser,(req,res)=>{const to=clean(req.body.receiverId), msg=clean(req.body.message);if(!to||!msg)return res.status(400).json({message:'Recipient and message are required.'});db.prepare('INSERT INTO messages(public_id,sender_id,receiver_id,message) VALUES(?,?,?,?)').run(id('msg'),req.user.brave_id,to,msg);db.prepare('INSERT INTO notifications(public_id,user_id,title,message) VALUES(?,?,?,?)').run(id('note'),to,'New UNIQUE BRAVE message',`You received a new message from ${req.user.fullname}.`);res.status(201).json({message:'Message sent.'});});
app.get('/api/messages',requireUser,(req,res)=>res.json({messages:db.prepare('SELECT * FROM messages WHERE sender_id=? OR receiver_id=? ORDER BY id DESC').all(req.user.brave_id,req.user.brave_id)}));
app.get('/api/notifications',requireUser,(req,res)=>res.json({notifications:db.prepare('SELECT * FROM notifications WHERE user_id=? ORDER BY id DESC LIMIT 50').all(req.user.brave_id)}));
app.post('/api/notifications/:id/read',requireUser,(req,res)=>{db.prepare('UPDATE notifications SET is_read=1 WHERE public_id=? AND user_id=?').run(req.params.id,req.user.brave_id);res.json({message:'Notification marked as read.'});});


app.get('/api/notifications/unread-count',requireUser,(req,res)=>res.json({count:db.prepare('SELECT COUNT(*) c FROM notifications WHERE user_id=? AND is_read=0').get(req.user.brave_id).c}));

app.post('/api/customer-requests',requireUser,(req,res)=>{
 const subject=clean(req.body.subject), description=clean(req.body.description);
 if(!subject||!description)return res.status(400).json({message:'Subject and request details are required.'});
 const rid=id('request'); db.prepare('INSERT INTO customer_requests(public_id,user_id,subject,description) VALUES(?,?,?,?)').run(rid,req.user.brave_id,subject,description);
 db.prepare('INSERT INTO notifications(public_id,user_id,title,message) VALUES(?,?,?,?)').run(id('note'),req.user.brave_id,'Customer request submitted','Your request is now pending review.');
 audit('customer_request_created','request',rid,subject);
 res.status(201).json({message:'Customer request submitted.',request:db.prepare('SELECT * FROM customer_requests WHERE public_id=?').get(rid)});
});
app.get('/api/customer-requests',requireUser,(req,res)=>res.json({requests:db.prepare('SELECT * FROM customer_requests WHERE user_id=? ORDER BY id DESC').all(req.user.brave_id)}));

app.post('/api/advisor/messages',requireUser,async(req,res)=>{
 const message=clean(req.body.message), image=base64(req.body.image);
 if(!message)return res.status(400).json({message:'Write a message for the advisor.'});
 if(image&&!/^data:image\//.test(image))return res.status(400).json({message:'Only an image attachment is allowed.'});
 const mid=id('advisor');db.prepare('INSERT INTO advisor_messages(public_id,user_id,sender_role,message,image_data) VALUES(?,?,?,?,?)').run(mid,req.user.brave_id,'user',message,image);
 db.prepare('INSERT INTO notifications(public_id,user_id,title,message) VALUES(?,?,?,?)').run(id('note'),req.user.brave_id,'Advisor request received','Your message has been sent to the advisor team.');
 res.status(201).json({message:'Message sent to advisor.',item:db.prepare('SELECT * FROM advisor_messages WHERE public_id=?').get(mid)});
});
app.get('/api/advisor/messages',requireUser,(req,res)=>res.json({messages:db.prepare('SELECT * FROM advisor_messages WHERE user_id=? ORDER BY id ASC').all(req.user.brave_id)}));

app.post('/api/contact-admin',requireUser,(req,res)=>{
 const message=clean(req.body.message)||'I need help with a marketplace listing.';
 const subject=clean(req.body.subject)||'Marketplace support';
 const rid=id('request');db.prepare('INSERT INTO customer_requests(public_id,user_id,subject,description) VALUES(?,?,?,?)').run(rid,req.user.brave_id,subject,message);
 db.prepare('INSERT INTO notifications(public_id,user_id,title,message) VALUES(?,?,?,?)').run(id('note'),req.user.brave_id,'Admin contact request sent','The administrator can review your request from the Admin Centre.');
 res.status(201).json({message:'Your message has been sent to the administrator.'});
});

app.get('/api/announcements',requireUser,(req,res)=>res.json({announcements:db.prepare('SELECT * FROM announcements WHERE active=1 ORDER BY id DESC LIMIT 30').all()}));

app.get('/api/daily-report',requireUser,(req,res)=>{
 const date=new Date().toISOString().slice(0,10), uid=req.user.brave_id;
 const report={date,notifications:db.prepare('SELECT COUNT(*) c FROM notifications WHERE user_id=? AND substr(created_at,1,10)=?').get(uid,date).c,requests:db.prepare('SELECT COUNT(*) c FROM customer_requests WHERE user_id=? AND substr(created_at,1,10)=?').get(uid,date).c,advisorMessages:db.prepare('SELECT COUNT(*) c FROM advisor_messages WHERE user_id=? AND substr(created_at,1,10)=?').get(uid,date).c,records:db.prepare('SELECT COUNT(*) c FROM records WHERE user_id=? AND substr(created_at,1,10)=?').get(uid,date).c,receipts:db.prepare('SELECT COUNT(*) c FROM receipts WHERE user_id=? AND substr(created_at,1,10)=?').get(uid,date).c};
 const summary=`${report.notifications} notifications, ${report.requests} customer requests, ${report.advisorMessages} advisor messages, ${report.records} records and ${report.receipts} receipts created today.`;
 const existing=db.prepare('SELECT public_id FROM daily_reports WHERE user_id=? AND report_date=?').get(uid,date);
 if(existing)db.prepare('UPDATE daily_reports SET summary=?,title=?,created_at=? WHERE public_id=?').run(summary,'Daily activity report',now(),existing.public_id);
 else db.prepare('INSERT INTO daily_reports(public_id,user_id,report_date,title,summary) VALUES(?,?,?,?,?)').run(id('daily'),uid,date,'Daily activity report',summary);
 res.json({report});
});

app.get('/api/verification-card',requireUser,(req,res)=>{
 if(req.user.verification_status!=='verified')return res.status(403).json({message:'Your UNIQUE BRAVE verification has not been approved yet.'});
 const serial=req.user.verification_serial||serial15();
 if(!req.user.verification_serial)db.prepare('UPDATE users SET verification_serial=?,updated_at=? WHERE brave_id=?').run(serial,now(),req.user.brave_id);
 res.json({card:{name:req.user.fullname,username:req.user.username,accountType:req.user.account_type,serial,issuedAt:req.user.updated_at,status:'Verified UNIQUE BRAVE User'}});
});

app.post('/api/advertising-requests',requireUser,(req,res)=>{const rid=id('ad');db.prepare('INSERT INTO advertising_requests(public_id,user_id,title,category,description,contact) VALUES(?,?,?,?,?,?)').run(rid,req.user.brave_id,clean(req.body.title),clean(req.body.category),clean(req.body.description),clean(req.body.contact));res.status(201).json({message:'Advertising request submitted.'});});
app.get('/api/advertising-requests/mine',requireUser,(req,res)=>res.json({requests:db.prepare('SELECT * FROM advertising_requests WHERE user_id=? ORDER BY id DESC').all(req.user.brave_id)}));
app.post('/api/reports',requireUser,(req,res)=>{const rid=id('report');db.prepare('INSERT INTO reports(public_id,reporter_id,content_type,content_id,reason) VALUES(?,?,?,?,?)').run(rid,req.user.brave_id,clean(req.body.contentType),clean(req.body.contentId),clean(req.body.reason));security(req,'content_report',req.user.brave_id,clean(req.body.reason),5);res.status(201).json({message:'Report sent to admin for review.'});});

app.post('/api/ai/chat',(req,res)=>{
 const text=clean(req.body.message); if(!text)return res.status(400).json({message:'Please enter a message.'});
 const locale=['ng','gb','us'].includes(req.body.locale)?req.body.locale:'ng'; const lower=text.toLowerCase();
 const p=db.prepare("SELECT * FROM products WHERE status='active' AND (lower(name) LIKE ? OR lower(category) LIKE ? OR lower(description) LIKE ?) ORDER BY random() LIMIT 5").all('%'+lower+'%','%'+lower+'%','%'+lower+'%');
 const s=db.prepare("SELECT * FROM services WHERE status='active' AND (lower(name) LIKE ? OR lower(category) LIKE ? OR lower(description) LIKE ?) ORDER BY id DESC LIMIT 5").all('%'+lower+'%','%'+lower+'%','%'+lower+'%');
 const hello=/^(hi|hello|hey|how far|good morning|good afternoon|good evening|how are you|yo)\b/i.test(text);
 const thanks=/\b(thanks|thank you|tnx|appreciate)\b/i.test(lower);
 let reply;
 if(hello) reply=locale==='ng'?'How far 👋🏽 I’m UNIQUE BRAVE AI. What do you want to do today — buy, sell, find a service, build something in Workshop, or manage your UNIQUE BRAVE account?':'Hello 👋 I’m UNIQUE BRAVE AI. What would you like to do on UNIQUE BRAVE today?';
 else if(thanks) reply=locale==='ng'?'You’re welcome! I’m here whenever you need UNIQUE BRAVE.':'You’re welcome! I’m here whenever you need help.';
 else if(/\b(wallet|money|balance)\b/.test(lower)) reply='Wallet is coming soon on UNIQUE BRAVE. The current platform can still keep records and receipts for your business activities.';
 else if(/\b(edit|change|update)\b.*\b(product|service|listing)\b|\b(product|service|listing)\b.*\b(edit|change|update)\b/.test(lower)) reply='If you posted the product or service yourself, open Dashboard → My Products or My Services. You can edit your own listing. Other users cannot edit your listing.';
 else if(/\b(stock|quantity|out of stock)\b/.test(lower)) reply='Product owners can change stock from their Dashboard. Stock changes update availability without changing the product listing owner.';
 else if(/\b(order|checkout|delivery|track)\b/.test(lower)) reply='For a purchase, add the product to Cart, review the order, enter delivery details, select the available payment method and place the order. Your order can then be reviewed from Dashboard → Orders.';
 else if(/\b(payment|pay|transfer|card|ussd)\b/.test(lower)) reply='UNIQUE BRAVE shows the payment methods configured for the listing or checkout. Never treat a payment as successful until the platform/payment provider confirms it.';
 else if(/\b(plan|subscription|premium|starter|professional|luxury|enterprise)\b/.test(lower)) reply='Open Marketplace → Plans to compare available BRAVE plans, prices, billing periods and included features before choosing one.';
 else if(/\b(new|newly added|latest)\b.*\b(product|service|listing)\b|\b(product|service|listing)\b.*\b(new|latest)\b/.test(lower)) reply='New marketplace listings are marked NEW so shoppers can quickly identify recently added products and services.';
 else if(/\b(price|pricing|normal price|market price|discount)\b/.test(lower)) reply='A seller sets the listing price, while unusual prices can be reviewed by BRAVE administrators. BRAVE should only show a discount comparison when there is a genuine reference price.';
 else if(/\b(admin|administrator|moderation|report)\b/.test(lower)) reply='BRAVE administrators can review users, marketplace listings, reports, orders, payments, announcements, security activity and AI activity from the protected Admin Centre.';
 else if(/\b(workshop|cv|resume|letter|flyer|poster|invoice|receipt|form|caption|document)\b/.test(lower)) reply='UNIQUE BRAVE Workshop has practical tools for CVs, letters, posters, invoices, receipts, form planning, social captions and printable documents. Open Dashboard → Workshop to use them.';
 else if(/\b(profile|username|link|page)\b/.test(lower)) reply='Your UNIQUE BRAVE username is your public identity. Your shareable page follows /u/yourusername, so you can send your UNIQUE BRAVE profile to customers or friends.';
 else if(/\b(password|forgot|reset|login|sign up|signup|account)\b/.test(lower)) reply='For account access, use your email, phone number or username to log in. If you forget your password, use Forgot password to request a reset link.';
 else if(p.length) reply=`I found ${p.length} product option${p.length===1?'':'s'} matching what you typed: ${p.slice(0,3).map(x=>x.name).join(', ')}. Open Marketplace to view the listings and seller profiles.`;
 else if(s.length) reply=`I found ${s.length} service option${s.length===1?'':'s'} that may match: ${s.slice(0,3).map(x=>x.name).join(', ')}. Open the provider profile to learn more.`;
 else if(/\b(buy|sell|marketplace|seller|product|service|provider|business)\b/.test(lower)) reply='I can help with that. Tell me the product or service, your location, and any budget or requirement you have. I can also point you to Marketplace or the relevant UNIQUE BRAVE section.';
 else reply=locale==='ng'?'I understand. Tell me a little more about what you want to achieve on UNIQUE BRAVE, and I’ll guide you step by step.':'I understand. Tell me a little more about what you want to achieve on UNIQUE BRAVE, and I’ll guide you step by step.';
 const cid=id('ai'); db.prepare('INSERT INTO ai_conversations(public_id,user_id,message,reply,locale) VALUES(?,?,?,?,?)').run(cid,clean(req.body.userId)||null,text,reply,locale);
 res.json({reply,products:p,services:s,conversationId:cid});
});

// Optional phone verification. No Twilio credentials are required for registration; when absent these routes explain that verification is optional.
app.post('/api/phone/send-otp',(req,res)=>res.json({message:'Phone verification is currently optional because Twilio is not configured.',optional:true,channel:clean(req.body.channel)||'sms'}));
app.post('/api/phone/verify',(req,res)=>res.json({message:'Phone verification is currently optional because Twilio is not configured.',verified:false,optional:true}));

// Password reset by email. Phone reset is intentionally not exposed on the login page.
app.post('/forgot-password',async(req,res)=>{
 const em=email(req.body.email); const u=db.prepare('SELECT * FROM users WHERE email=?').get(em);
 if(!u)return res.json({message:'If that email belongs to a UNIQUE BRAVE account, a reset link has been sent.'});
 const token=crypto.randomBytes(32).toString('hex');
 const tokenHash=crypto.createHash('sha256').update(token).digest('hex');
 const expiresAt=new Date(Date.now()+30*60*1000).toISOString();
 db.prepare('DELETE FROM password_reset_tokens WHERE user_id=? OR expires_at<?').run(u.brave_id,now());
 db.prepare('INSERT INTO password_reset_tokens(token_hash,user_id,expires_at) VALUES(?,?,?)').run(tokenHash,u.brave_id,expiresAt);
 const url=publicUrl('/reset-password.html?token='+token);
 const mail=await sendMail(em,'Reset your UNIQUE BRAVE password',`<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto"><h2 style="color:#32105f">UNIQUE BRAVE password reset</h2><p>Hello ${clean(u.fullname)},</p><p>Use the button below to create a new password. This link expires in 30 minutes.</p><p><a href="${url}" style="display:inline-block;background:#ffd83d;color:#32105f;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:800">Reset my password</a></p><p style="font-size:12px;color:#666">If you did not request this, you can ignore this email. Never share this link with anyone.</p></div>`);
 if(mail.sent)return res.json({message:'Reset link sent. Check your email.'});
 // Keep the button functional for local/self-hosted testing without SMTP. Never expose this fallback in production.
 if(process.env.NODE_ENV!=='production')return res.json({message:'Email delivery is not configured. Use the test reset link below.',resetUrl:url});
 if(mail.code==='SMTP_NOT_CONFIGURED'){
   console.error('[PASSWORD RESET] SMTP configuration is missing on the server.');
   return res.status(503).json({message:'Password reset email service is not configured on the server.'});
 }
 console.error('[PASSWORD RESET] Email delivery failed:',mail.error||mail.code||'unknown SMTP error');
 return res.status(502).json({message:'We could not deliver the reset email right now. Please try again later.'});
});
app.post('/reset-password',async(req,res)=>{
 try{
  const token=clean(req.body.token),pw=String(req.body.password||'');
  if(!token||pw.length<8)return res.status(400).json({message:'Enter a valid reset token and a password of at least 8 characters.'});
  const tokenHash=crypto.createHash('sha256').update(token).digest('hex');
  const r=db.prepare('SELECT * FROM password_reset_tokens WHERE token_hash=? AND used_at IS NULL AND expires_at>?').get(tokenHash,now());
  if(!r)return res.status(400).json({message:'This reset link is invalid or expired.'});
  const nextHash=await bcrypt.hash(pw,10);
  const tx=db.transaction(()=>{
   db.prepare('UPDATE users SET password_hash=?,updated_at=? WHERE brave_id=?').run(nextHash,now(),r.user_id);
   db.prepare('UPDATE password_reset_tokens SET used_at=? WHERE token_hash=?').run(now(),tokenHash);
   db.prepare('DELETE FROM user_sessions WHERE user_id=?').run(r.user_id);
  });
  tx();
  res.json({message:'Password reset successfully. Please log in again.'});
 }catch(e){console.error('[PASSWORD RESET] reset failed:',e);res.status(500).json({message:'Unable to reset the password right now.'});}
});

// Admin
app.post('/admin-login',(req,res)=>{const ok=email(req.body.email)===email(process.env.ADMIN_EMAIL||'') && String(req.body.password||'')===String(process.env.ADMIN_PASSWORD||'');if(!ok){security(req,'failed_admin_login','','Invalid admin credentials',70);return res.status(401).json({message:'Invalid administrator credentials.'});}const token=crypto.randomBytes(32).toString('hex');adminSessions.set(token,{createdAt:Date.now()});audit('admin_login');res.json({message:'Administrator login successful.',token});});
app.post('/api/admin/logout',requireAdmin,(req,res)=>{adminSessions.delete(req.headers['x-admin-token']);res.json({message:'Administrator logged out.'});});


app.get('/api/plans',(req,res)=>res.json({plans:db.prepare('SELECT * FROM plans WHERE active=1 ORDER BY price ASC').all().map(p=>({...p,features:JSON.parse(p.features||'[]')}))}));
app.get('/api/plans/:code',(req,res)=>{const p=db.prepare('SELECT * FROM plans WHERE code=? AND active=1').get(clean(req.params.code));if(!p)return res.status(404).json({message:'Plan not found.'});res.json({plan:{...p,features:JSON.parse(p.features||'[]')}})});
app.post('/api/subscriptions',requireUser,(req,res)=>{const code=clean(req.body.planCode),p=db.prepare('SELECT * FROM plans WHERE code=? AND active=1').get(code);if(!p)return res.status(404).json({message:'Plan not found.'});const method=clean(req.body.paymentMethod||'bank_transfer');const ref=clean(req.body.reference||'');if(p.price>0&&method!=='bank_transfer')return res.status(400).json({message:'Paid plans currently use bank transfer.'});if(p.price>0&&!ref)return res.status(400).json({message:'Transfer reference is required.'});const existing=db.prepare("SELECT * FROM subscriptions WHERE user_id=? AND plan_code=? AND status IN ('pending','active') ORDER BY id DESC LIMIT 1").get(req.user.brave_id,code);if(existing)return res.json({message:'You already have a pending or active subscription for this plan.',subscription:existing});const sid=id('subscription');const status=p.price>0?'pending':'active';const starts=status==='active'?now():null;const ends=status==='active'?new Date(Date.now()+30*24*60*60*1000).toISOString():null;db.prepare('INSERT INTO subscriptions(public_id,user_id,plan_code,status,starts_at,ends_at) VALUES(?,?,?,?,?,?)').run(sid,req.user.brave_id,code,status,starts,ends);if(p.price>0){db.prepare('INSERT INTO records(public_id,user_id,record_type,title,details,amount,reference) VALUES(?,?,?,?,?,?,?)').run(id('record'),req.user.brave_id,'subscription_payment','Plan purchase request',p.name,p.price,ref)}db.prepare('INSERT INTO notifications(public_id,user_id,title,message) VALUES(?,?,?,?)').run(id('notification'),req.user.brave_id,'Plan '+(status==='active'?'activated':'purchase submitted'),status==='active'?`Your ${p.name} plan is active.`:`Your ${p.name} plan purchase is awaiting admin payment verification.`);res.status(201).json({message:status==='active'?`Your ${p.name} plan is now active.`:`Your ${p.name} plan purchase has been submitted for payment verification.`,subscription:db.prepare('SELECT * FROM subscriptions WHERE public_id=?').get(sid)});});
app.get('/api/my-subscriptions',requireUser,(req,res)=>res.json({subscriptions:db.prepare('SELECT s.*,p.name,p.price,p.billing FROM subscriptions s JOIN plans p ON p.code=s.plan_code WHERE s.user_id=? ORDER BY s.id DESC').all(req.user.brave_id)}));
app.get('/api/payment-settings',(req,res)=>{
 const b=db.prepare('SELECT bank_name,account_name,account_number,instructions,updated_at FROM bank_settings WHERE id=1').get();
 res.json({bank:b});
});
app.post('/api/orders',requireUser,(req,res)=>{
 const items=Array.isArray(req.body.items)?req.body.items:[]; const address=clean(req.body.deliveryAddress);
 if(!items.length||!address)return res.status(400).json({message:'Cart items and delivery address are required.'});
 let subtotal=0,delivery=0; const rows=[];
 for(const item of items){
  const p=db.prepare("SELECT * FROM products WHERE public_id=? AND status='active'").get(clean(item.productId));
  const qty=Math.max(1,Math.min(99,Number(item.quantity)||1));
  if(!p)return res.status(400).json({message:'One of the products is no longer available.'});
  const total=(Number(p.price)||0)*qty; subtotal+=total; delivery+=Number(p.delivery_price)||0;
  rows.push({p,qty,total});
 }
 const oid=id('order'), total=subtotal+delivery, purchaseSerial='BRV-PUR-'+serial15();
 const tx=db.transaction(()=>{db.prepare('INSERT INTO orders(public_id,buyer_id,status,subtotal,delivery,total,delivery_address,payment_method,purchase_serial,seller_payment_notice) VALUES(?,?,?,?,?,?,?,?,?,?)').run(oid,req.user.brave_id,'pending_payment',subtotal,delivery,total,address,clean(req.body.paymentMethod)||'bank_transfer',purchaseSerial,'Payment safety: follow the listing arrangement; never share OTPs or private credentials.');const ins=db.prepare('INSERT INTO order_items(order_id,product_id,seller_id,seller_name,product_name,quantity,unit_price,total) VALUES(?,?,?,?,?,?,?,?)');for(const r of rows)ins.run(oid,r.p.public_id,r.p.owner_id,r.p.owner_name,r.p.name,r.qty,r.p.price,r.total);});
 tx();
 const inv='BRV-INV-'+serial15();db.prepare('INSERT INTO records(public_id,user_id,record_type,title,details,amount,reference) VALUES(?,?,?,?,?,?,?)').run(id('record'),req.user.brave_id,'invoice','UNIQUE BRAVE Invoice',`Invoice for order ${oid}`,total,inv);
 res.status(201).json({message:'Order created. Complete payment using the displayed payment instructions.',order:db.prepare('SELECT * FROM orders WHERE public_id=?').get(oid)});
});
app.get('/api/orders',requireUser,(req,res)=>{
 const orders=db.prepare('SELECT * FROM orders WHERE buyer_id=? ORDER BY id DESC').all(req.user.brave_id);
 for(const o of orders)o.items=db.prepare('SELECT * FROM order_items WHERE order_id=?').all(o.public_id);
 res.json({orders});
});
app.post('/api/orders/:id/evidence',requireUser,(req,res)=>{
 const evidence=base64(req.body.evidence);if(!evidence||!/^data:(image|application\/pdf)\//.test(evidence))return res.status(400).json({message:'Upload a payment screenshot or PDF evidence.'});
 const o=db.prepare('SELECT * FROM orders WHERE public_id=? AND buyer_id=?').get(req.params.id,req.user.brave_id);if(!o)return res.status(404).json({message:'Order not found.'});
 db.prepare("UPDATE orders SET payment_evidence=?,payment_status='submitted',updated_at=CURRENT_TIMESTAMP WHERE public_id=?").run(evidence,o.public_id);
 res.json({message:'Payment evidence submitted for admin review.'});
});
app.get('/api/admin/orders',requireAdmin,(req,res)=>{
 const orders=db.prepare('SELECT o.*,u.fullname,u.username,u.email,u.phone FROM orders o LEFT JOIN users u ON u.brave_id=o.buyer_id ORDER BY o.id DESC').all();
 for(const o of orders)o.items=db.prepare('SELECT * FROM order_items WHERE order_id=?').all(o.public_id);
 res.json({orders});
});
app.post('/api/admin/orders/:id/action',requireAdmin,(req,res)=>{
 const action=clean(req.body.action), status=action==='confirm_payment'?'paid':action==='processing'?'processing':action==='shipped'?'shipped':action==='delivered'?'delivered':action==='cancel'?'cancelled':null;
 if(!status)return res.status(400).json({message:'Invalid order action.'});
 const o=db.prepare('SELECT * FROM orders WHERE public_id=?').get(req.params.id);if(!o)return res.status(404).json({message:'Order not found.'});
 const paymentStatus=status==='paid'||status==='processing'||status==='shipped'||status==='delivered'?'confirmed':o.payment_status;
 db.prepare('UPDATE orders SET status=?,payment_status=?,updated_at=CURRENT_TIMESTAMP WHERE public_id=?').run(status,paymentStatus,o.public_id);
 if(status==='paid') {
  const rid='BRV-REC-'+serial15();
  db.prepare('INSERT INTO receipts(public_id,user_id,type,sender,recipient,reference,work,amount,delivery,payment_status) VALUES(?,?,?,?,?,?,?,?,?,?)').run(rid,o.buyer_id,'sale','UNIQUE BRAVE','Customer',rid,'Marketplace order '+o.public_id,o.total,o.delivery,'confirmed');
  db.prepare('INSERT INTO notifications(public_id,user_id,title,message) VALUES(?,?,?,?)').run(id('note'),o.buyer_id,'Payment confirmed',`Payment for ${o.public_id} was confirmed. Purchase serial ${o.purchase_serial||'recorded'}. Receipt ${rid} is now available.`);
 }
 audit('order_'+status,'order',o.public_id);
 res.json({message:'Order updated.'});
});
app.get('/api/admin/payment-settings',requireAdmin,(req,res)=>res.json({bank:db.prepare('SELECT * FROM bank_settings WHERE id=1').get()}));
app.post('/api/admin/payment-settings',requireAdmin,(req,res)=>{
 const bankName=clean(req.body.bankName),accountName=clean(req.body.accountName),accountNumber=clean(req.body.accountNumber),instructions=clean(req.body.instructions);
 if(!bankName||!accountName||!accountNumber)return res.status(400).json({message:'Bank name, account name and account number are required.'});
 db.prepare('UPDATE bank_settings SET bank_name=?,account_name=?,account_number=?,instructions=?,updated_at=CURRENT_TIMESTAMP WHERE id=1').run(bankName,accountName,accountNumber,instructions);
 audit('payment_settings_updated','settings','bank');
 res.json({message:'Payment details saved.'});
});
app.get('/api/admin/plans',requireAdmin,(req,res)=>res.json({plans:db.prepare('SELECT * FROM plans ORDER BY price ASC').all()}));
app.post('/api/admin/plans/:code',requireAdmin,(req,res)=>{
 const price=Math.max(0,Number(req.body.price)||0),active=req.body.active===false?0:1;
 db.prepare('UPDATE plans SET price=?,active=? WHERE code=?').run(price,active,req.params.code);
 audit('plan_updated','plan',req.params.code);
 res.json({message:'Plan updated.'});
});

app.get('/api/admin/subscriptions',requireAdmin,(req,res)=>res.json({subscriptions:db.prepare('SELECT s.*,p.name AS plan_name,p.price,p.billing,u.fullname,u.email,u.username FROM subscriptions s JOIN plans p ON p.code=s.plan_code LEFT JOIN users u ON u.brave_id=s.user_id ORDER BY s.id DESC').all()}));
app.get('/api/admin/customer-requests',requireAdmin,(req,res)=>res.json({requests:db.prepare('SELECT r.*,u.fullname,u.username,u.email,u.phone FROM customer_requests r LEFT JOIN users u ON u.brave_id=r.user_id ORDER BY CASE WHEN r.status="pending" THEN 0 ELSE 1 END,r.id DESC').all()}));
app.post('/api/admin/customer-requests/:id/action',requireAdmin,(req,res)=>{
 const a=clean(req.body.action), status=a==='resolve'?'resolved':a==='pending'?'pending':a==='close'?'closed':null;
 if(!status)return res.status(400).json({message:'Invalid request action.'});
 const note=clean(req.body.note);const r=db.prepare('SELECT * FROM customer_requests WHERE public_id=?').get(req.params.id);if(!r)return res.status(404).json({message:'Request not found.'});
 db.prepare('UPDATE customer_requests SET status=?,admin_note=?,updated_at=? WHERE public_id=?').run(status,note,now(),req.params.id);
 db.prepare('INSERT INTO notifications(public_id,user_id,title,message) VALUES(?,?,?,?)').run(id('note'),r.user_id,'Customer request updated',`Your request is now ${status}.${note?' Admin note: '+note:''}`);
 audit('customer_request_'+status,'request',req.params.id,note);res.json({message:'Customer request updated.'});
});
app.get('/api/admin/advisor/messages',requireAdmin,(req,res)=>res.json({messages:db.prepare('SELECT m.*,u.fullname,u.username,u.email FROM advisor_messages m LEFT JOIN users u ON u.brave_id=m.user_id ORDER BY m.id ASC LIMIT 500').all()}));
app.post('/api/admin/advisor/messages/:userId',requireAdmin,(req,res)=>{
 const message=clean(req.body.message);if(!message)return res.status(400).json({message:'Advisor response is required.'});
 const u=db.prepare('SELECT * FROM users WHERE brave_id=?').get(req.params.userId);if(!u)return res.status(404).json({message:'User not found.'});
 const mid=id('advisor');db.prepare('INSERT INTO advisor_messages(public_id,user_id,sender_role,message) VALUES(?,?,?,?,?)'.replace('VALUES(?,?,?,?,?)','VALUES(?,?,?,?)')).run(mid,u.brave_id,'advisor',message);
 db.prepare('INSERT INTO notifications(public_id,user_id,title,message) VALUES(?,?,?,?)').run(id('note'),u.brave_id,'Advisor response','Your advisor has responded to your message.');
 audit('advisor_response','user',u.brave_id);res.status(201).json({message:'Advisor response sent.'});
});
app.get('/api/admin/announcements',requireAdmin,(req,res)=>res.json({announcements:db.prepare('SELECT * FROM announcements ORDER BY id DESC').all()}));
app.post('/api/admin/announcements',requireAdmin,(req,res)=>{
 const title=clean(req.body.title),body=clean(req.body.body);if(!title||!body)return res.status(400).json({message:'Announcement title and body are required.'});
 const active=req.body.active===false?0:1;const aid=id('announce');db.prepare('INSERT INTO announcements(public_id,title,body,active) VALUES(?,?,?,?)').run(aid,title,body,active);
 if(active)db.prepare('INSERT INTO notifications(public_id,user_id,title,message) SELECT ?,brave_id,?,? FROM users').run(id('note'),title,body);
 audit('announcement_created','announcement',aid,title);
 res.status(201).json({message:'Public announcement published.'});
});
app.post('/api/admin/announcements/:id/action',requireAdmin,(req,res)=>{
 const a=clean(req.body.action);if(!['activate','deactivate','delete'].includes(a))return res.status(400).json({message:'Invalid announcement action.'});
 if(a==='delete')db.prepare('DELETE FROM announcements WHERE public_id=?').run(req.params.id);else db.prepare('UPDATE announcements SET active=?,updated_at=? WHERE public_id=?').run(a==='activate'?1:0,now(),req.params.id);
 audit('announcement_'+a,'announcement',req.params.id);res.json({message:'Announcement updated.'});
});
app.get('/api/admin/daily-reports',requireAdmin,(req,res)=>res.json({reports:db.prepare('SELECT d.*,u.fullname,u.username FROM daily_reports d LEFT JOIN users u ON u.brave_id=d.user_id ORDER BY d.id DESC LIMIT 200').all()}));

app.get('/api/admin/overview',requireAdmin,(req,res)=>res.json({users:db.prepare('SELECT COUNT(*) c FROM users').get().c,products:db.prepare("SELECT COUNT(*) c FROM products WHERE status='active'").get().c,services:db.prepare("SELECT COUNT(*) c FROM services WHERE status='active'").get().c,posts:db.prepare("SELECT COUNT(*) c FROM timeline_posts WHERE status='active'").get().c,pendingRequests:db.prepare("SELECT COUNT(*) c FROM protected_requests WHERE status='pending'").get().c,pendingReports:db.prepare("SELECT COUNT(*) c FROM reports WHERE status='pending'").get().c,suspicious:db.prepare("SELECT COUNT(*) c FROM security_events WHERE status='review' AND risk_score>=40").get().c,aiConversations:db.prepare('SELECT COUNT(*) c FROM ai_conversations').get().c,customerRequests:db.prepare("SELECT COUNT(*) c FROM customer_requests WHERE status='pending'").get().c,advisorMessages:db.prepare('SELECT COUNT(*) c FROM advisor_messages').get().c,announcements:db.prepare('SELECT COUNT(*) c FROM announcements WHERE active=1').get().c}));
app.get('/api/admin/users',requireAdmin,(req,res)=>res.json({users:db.prepare('SELECT * FROM users ORDER BY id DESC').all().map(safeUser)}));
app.get('/api/admin/users/:id',requireAdmin,(req,res)=>{const u=db.prepare('SELECT * FROM users WHERE brave_id=?').get(req.params.id);if(!u)return res.status(404).json({message:'User not found.'});res.json({user:safeUser(u),posts:db.prepare('SELECT * FROM timeline_posts WHERE user_id=? ORDER BY id DESC').all(u.brave_id),products:db.prepare('SELECT * FROM products WHERE owner_id=? ORDER BY id DESC').all(u.brave_id),services:db.prepare('SELECT * FROM services WHERE owner_id=? ORDER BY id DESC').all(u.brave_id)});});
app.post('/api/admin/users/:id/message',requireAdmin,(req,res)=>{
 const message=clean(req.body.message); if(!message)return res.status(400).json({message:'Message is required.'});
 const u=db.prepare('SELECT * FROM users WHERE brave_id=?').get(req.params.id); if(!u)return res.status(404).json({message:'User not found.'});
 db.prepare('INSERT INTO messages(public_id,sender_id,receiver_id,message) VALUES(?,?,?,?)').run(id('msg'),'ADMIN',u.brave_id,message);
 db.prepare('INSERT INTO notifications(public_id,user_id,title,message) VALUES(?,?,?,?)').run(id('note'),u.brave_id,'Message from UNIQUE BRAVE Admin',message);
 audit('admin_message','user',u.brave_id,message);
 res.json({message:'Message sent to user.'});
});
app.post('/api/admin/users/:id/action',requireAdmin,(req,res)=>{const action=clean(req.body.action);const u=db.prepare('SELECT * FROM users WHERE brave_id=?').get(req.params.id);if(!u)return res.status(404).json({message:'User not found.'});let status=u.account_status;if(action==='suspend')status='suspended';else if(action==='restrict')status='restricted';else if(action==='restore')status='active';else return res.status(400).json({message:'Invalid user action.'});db.prepare('UPDATE users SET account_status=?,updated_at=? WHERE brave_id=?').run(status,now(),u.brave_id);audit('user_'+action,'user',u.brave_id);res.json({message:'User status updated.',user:safeUser(db.prepare('SELECT * FROM users WHERE brave_id=?').get(u.brave_id))});});
app.get('/api/admin/products',requireAdmin,(req,res)=>res.json({products:db.prepare('SELECT * FROM products ORDER BY random()').all()}));
app.get('/api/admin/services',requireAdmin,(req,res)=>res.json({services:db.prepare('SELECT * FROM services ORDER BY id DESC').all()}));
app.post('/api/admin/content/:id/action',requireAdmin,(req,res)=>{const type=clean(req.body.contentType),action=clean(req.body.action),table=type==='product'?'products':type==='service'?'services':null;if(!table)return res.status(400).json({message:'Invalid content type.'});const row=db.prepare(`SELECT * FROM ${table} WHERE public_id=?`).get(req.params.id);if(!row)return res.status(404).json({message:'Content not found.'});if(action==='approve')db.prepare(`UPDATE ${table} SET status='active' WHERE public_id=?`).run(req.params.id);else if(action==='remove')db.prepare(`UPDATE ${table} SET status='removed' WHERE public_id=?`).run(req.params.id);else if(action==='feature'&&table==='products')db.prepare('UPDATE products SET featured=1 WHERE public_id=?').run(req.params.id);else if(action==='unfeature'&&table==='products')db.prepare('UPDATE products SET featured=0 WHERE public_id=?').run(req.params.id);else return res.status(400).json({message:'Invalid content action.'});audit('content_'+action,type,req.params.id);res.json({message:'Content action completed.'});});
app.get('/api/admin/protected-requests',requireAdmin,(req,res)=>res.json({requests:db.prepare('SELECT r.*,u.fullname,u.username,u.email,u.phone FROM protected_requests r LEFT JOIN users u ON u.brave_id=r.user_id ORDER BY r.status ASC,r.id DESC').all()}));
app.post('/api/admin/protected-requests/:id/action',requireAdmin,(req,res)=>{const r=db.prepare('SELECT * FROM protected_requests WHERE public_id=?').get(req.params.id);if(!r)return res.status(404).json({message:'Request not found.'});const action=clean(req.body.action),status=action==='approve'?'approved':action==='reject'?'rejected':null;if(!status)return res.status(400).json({message:'Invalid request action.'});if(status==='approved'){const u=db.prepare('SELECT * FROM users WHERE brave_id=?').get(r.user_id);if(r.type==='phone number'&&r.requested_value)db.prepare('UPDATE users SET phone=?,updated_at=? WHERE brave_id=?').run(phone(r.requested_value),now(),u.brave_id);if(r.type==='email address'&&r.requested_value)db.prepare('UPDATE users SET email=?,updated_at=? WHERE brave_id=?').run(email(r.requested_value),now(),u.brave_id);if(r.type==='profile image'&&r.requested_value)db.prepare('UPDATE users SET profile_image=?,updated_at=? WHERE brave_id=?').run(base64(r.requested_value),now(),u.brave_id);if(r.type==='verification method')db.prepare('UPDATE users SET verification_status=\'verified\',updated_at=? WHERE brave_id=?').run(now(),u.brave_id);if(r.type==='account deletion')db.prepare('UPDATE users SET account_status=\'deleted\',updated_at=? WHERE brave_id=?').run(now(),u.brave_id);}db.prepare('UPDATE protected_requests SET status=?,admin_note=?,updated_at=? WHERE public_id=?').run(status,clean(req.body.note),now(),r.public_id);audit('protected_request_'+status,'request',r.public_id,r.type);res.json({message:'Request updated.'});});
app.get('/api/admin/reports',requireAdmin,(req,res)=>res.json({reports:db.prepare('SELECT r.*,u.fullname,u.username FROM reports r LEFT JOIN users u ON u.brave_id=r.reporter_id ORDER BY r.status ASC,r.id DESC').all()}));
app.post('/api/admin/reports/:id/action',requireAdmin,(req,res)=>{const a=clean(req.body.action);if(!['reviewed','dismissed','actioned'].includes(a))return res.status(400).json({message:'Invalid report action.'});db.prepare('UPDATE reports SET status=?,admin_note=? WHERE public_id=?').run(a,clean(req.body.note),req.params.id);audit('report_'+a,'report',req.params.id);res.json({message:'Report updated.'});});
app.get('/api/admin/security',requireAdmin,(req,res)=>res.json({events:db.prepare('SELECT s.*,u.fullname,u.username,u.email FROM security_events s LEFT JOIN users u ON u.brave_id=s.user_id ORDER BY s.id DESC LIMIT 200').all()}));
app.post('/api/admin/security/:id/action',requireAdmin,(req,res)=>{const a=clean(req.body.action);if(!['reviewed','cleared'].includes(a))return res.status(400).json({message:'Invalid security action.'});db.prepare('UPDATE security_events SET status=? WHERE public_id=?').run(a,req.params.id);audit('security_'+a,'security',req.params.id);res.json({message:'Security event updated.'});});
app.get('/api/admin/activity',requireAdmin,(req,res)=>res.json({activity:db.prepare('SELECT * FROM admin_audit ORDER BY id DESC LIMIT 200').all()}));
app.get('/api/admin/ai-conversations',requireAdmin,(req,res)=>res.json({conversations:db.prepare('SELECT * FROM ai_conversations ORDER BY id DESC LIMIT 200').all()}));
app.get('/api/admin/advertising-requests',requireAdmin,(req,res)=>res.json({requests:db.prepare('SELECT a.*,u.fullname,u.username,u.email FROM advertising_requests a LEFT JOIN users u ON u.brave_id=a.user_id ORDER BY a.status ASC,a.id DESC').all()}));
app.post('/api/admin/advertising-requests/:id/action',requireAdmin,(req,res)=>{const a=clean(req.body.action),status={approve:'approved',reject:'rejected',pause:'paused',complete:'completed'}[a];if(!status)return res.status(400).json({message:'Invalid advertising action.'});db.prepare('UPDATE advertising_requests SET status=?,updated_at=? WHERE public_id=?').run(status,now(),req.params.id);audit('advertising_'+status,'advertising',req.params.id);res.json({message:'Advertising request updated.'});});
app.get('/api/admin/verifications',requireAdmin,(req,res)=>res.json({users:db.prepare("SELECT * FROM users WHERE verification_status!='verified' ORDER BY id DESC").all().map(safeUser)}));
app.post('/api/admin/verifications/:id/action',requireAdmin,(req,res)=>{const a=clean(req.body.action);if(!['approve','reject'].includes(a))return res.status(400).json({message:'Invalid verification action.'});db.prepare('UPDATE users SET verification_status=?,verification_serial=?,email_verified=?,phone_verified=?,updated_at=? WHERE brave_id=?').run(a==='approve'?'verified':'rejected',a==='approve'?(db.prepare('SELECT verification_serial FROM users WHERE brave_id=?').get(req.params.id)?.verification_serial||serial15()):'',a==='approve'?1:0,a==='approve'?1:0,now(),req.params.id);audit('verification_'+a,'user',req.params.id);res.json({message:'Verification status updated.'});});
app.get('/api/admin/companies',requireAdmin,(req,res)=>res.json({businesses:db.prepare('SELECT b.*,u.fullname,u.email FROM businesses b LEFT JOIN users u ON u.brave_id=b.owner_id ORDER BY b.id DESC').all()}));

app.get('/api/admin/login-activity',requireAdmin,(req,res)=>res.json({events:db.prepare("SELECT l.*,u.fullname,u.username,u.email FROM login_events l LEFT JOIN users u ON u.brave_id=l.user_id ORDER BY l.id DESC LIMIT 300").all()}));
app.get('/api/admin/users/:id/profile',requireAdmin,(req,res)=>{const u=db.prepare('SELECT * FROM users WHERE brave_id=?').get(req.params.id);if(!u)return res.status(404).json({message:'User not found.'});res.json({user:safeUser(u),profileUrl:publicUrl('/u/'+u.username),posts:db.prepare('SELECT * FROM timeline_posts WHERE user_id=? ORDER BY id DESC').all(u.brave_id),products:db.prepare('SELECT * FROM products WHERE owner_id=? ORDER BY id DESC').all(u.brave_id),services:db.prepare('SELECT * FROM services WHERE owner_id=? ORDER BY id DESC').all(u.brave_id)});});
app.post('/api/workshop/documents',requireUser,(req,res)=>{const type=clean(req.body.toolType)||'document',title=clean(req.body.title)||'UNIQUE BRAVE Workshop document',content=clean(req.body.content);if(!content)return res.status(400).json({message:'Document content is required.'});const did=id('doc');db.prepare('INSERT INTO workshop_documents(public_id,user_id,tool_type,title,content) VALUES(?,?,?,?,?)').run(did,req.user.brave_id,type,title,content);res.status(201).json({message:'Workshop document saved.',document:db.prepare('SELECT * FROM workshop_documents WHERE public_id=?').get(did)});});
app.get('/api/workshop/documents',requireUser,(req,res)=>res.json({documents:db.prepare('SELECT * FROM workshop_documents WHERE user_id=? ORDER BY id DESC').all(req.user.brave_id)}));

// Additive production feature layer. Existing routes remain in place; this layer adds new workflows and migrations.
require('./backend/feature_additions')({app,db,helpers:{requireUser,requireAdmin,clean,base64,id,now,serial15,audit,publicUrl,safeUser}});
// Marketplace management is ADMIN ONLY. Sellers/users may publish listings, but only an authenticated administrator may edit, change stock, or delete them.

app.put('/api/products/:id', requireOwnerOrAdmin, (req,res)=>{
  const p=db.prepare('SELECT * FROM products WHERE public_id=?').get(req.params.id);
  if(!p) return res.status(404).json({message:'Product not found.'});
  if(!req.admin && p.owner_id!==req.user.brave_id) return res.status(403).json({message:'You can only edit your own product.'});
  const name=clean(req.body.name ?? p.name) || p.name;
  const category=clean(req.body.category ?? p.category) || p.category;
  const description=clean(req.body.description ?? p.description);
  const price=req.body.price===''||req.body.price==null?p.price:Number(req.body.price);
  const delivery=req.body.deliveryPrice===''||req.body.deliveryPrice==null?p.delivery_price:Number(req.body.deliveryPrice);
  const payment=normalizePayment(req.body.paymentMethod ?? p.payment_method,'product');
  const stock=req.body.stock===undefined ? p.stock : Math.max(0,Number(req.body.stock)||0);
  db.prepare(`UPDATE products SET name=?,category=?,description=?,price=?,delivery_price=?,payment_method=?,stock=?,quantity=?,updated_at=? WHERE public_id=?`)
    .run(name,category,description,price,delivery,payment,stock,stock,now(),p.public_id);
  res.json({message:'Product updated successfully.',product:db.prepare('SELECT * FROM products WHERE public_id=?').get(p.public_id)});
});

app.patch('/api/products/:id/stock', requireOwnerOrAdmin, (req,res)=>{
  const p=db.prepare('SELECT * FROM products WHERE public_id=?').get(req.params.id);
  if(!p) return res.status(404).json({message:'Product not found.'});
  if(!req.admin && p.owner_id!==req.user.brave_id) return res.status(403).json({message:'You can only change stock for your own product.'});
  const stock=Math.max(0,Number(req.body.stock));
  if(!Number.isFinite(stock)) return res.status(400).json({message:'Enter a valid stock quantity.'});
  db.prepare('UPDATE products SET stock=?,quantity=?,updated_at=? WHERE public_id=?').run(stock,stock,now(),p.public_id);
  res.json({message:'Stock updated.',stock});
});

app.delete('/api/products/:id', requireOwnerOrAdmin, (req,res)=>{
  const p=db.prepare('SELECT * FROM products WHERE public_id=?').get(req.params.id);
  if(!p) return res.status(404).json({message:'Product not found.'});
  if(!req.admin && p.owner_id!==req.user.brave_id) return res.status(403).json({message:'You can only remove your own product.'});
  db.prepare('UPDATE products SET status="deleted",updated_at=? WHERE public_id=?').run(now(),p.public_id);
  res.json({message:'Product deleted from the marketplace.'});
});

app.put('/api/services/:id', requireOwnerOrAdmin, (req,res)=>{
  const x=db.prepare('SELECT * FROM services WHERE public_id=?').get(req.params.id);
  if(!x) return res.status(404).json({message:'Service not found.'});
  if(!req.admin && x.owner_id!==req.user.brave_id) return res.status(403).json({message:'You can only edit your own service.'});
  const name=clean(req.body.name ?? x.name) || x.name;
  const category=clean(req.body.category ?? x.category) || x.category;
  const description=clean(req.body.description ?? x.description);
  const price=req.body.price===''||req.body.price==null?x.price:Number(req.body.price);
  const payment=normalizePayment(req.body.paymentMethod ?? x.payment_method,'service');
  db.prepare(`UPDATE services SET name=?,category=?,description=?,price=?,payment_method=?,updated_at=? WHERE public_id=?`)
    .run(name,category,description,price,payment,now(),x.public_id);
  res.json({message:'Service updated successfully.',service:db.prepare('SELECT * FROM services WHERE public_id=?').get(x.public_id)});
});

app.delete('/api/services/:id', requireOwnerOrAdmin, (req,res)=>{
  const x=db.prepare('SELECT * FROM services WHERE public_id=?').get(req.params.id);
  if(!x) return res.status(404).json({message:'Service not found.'});
  if(!req.admin && x.owner_id!==req.user.brave_id) return res.status(403).json({message:'You can only remove your own service.'});
  db.prepare('UPDATE services SET status="deleted" WHERE public_id=?').run(x.public_id);
  res.json({message:'Service deleted from the marketplace.'});
});

// Extra admin marketplace controls: inspect seller listings and moderate unusual listings.
app.get('/api/admin/marketplace-overview', requireAdmin, (req,res)=>{
  const products=db.prepare(`SELECT public_id,name,owner_name,owner_username,price,stock,quantity,status,created_at,updated_at
    FROM products WHERE owner_id IS NOT NULL ORDER BY id DESC LIMIT 300`).all();
  const services=db.prepare(`SELECT public_id,name,owner_name,owner_username,price,status,created_at
    FROM services WHERE owner_id IS NOT NULL ORDER BY id DESC LIMIT 300`).all();
  const suspiciousProducts=products.filter(x=>x.price!=null && (Number(x.price)<1 || Number(x.price)>100000000));
  return res.json({products,services,suspiciousProducts,counts:{
    products:products.length,services:services.length,suspicious:suspiciousProducts.length
  }});
});
app.patch('/api/admin/marketplace-listing/:type/:id', requireAdmin, (req,res)=>{
  const type=clean(req.params.type);
  const table=type==='product'?'products':type==='service'?'services':null;
  if(!table) return res.status(400).json({message:'Listing type must be product or service.'});
  const row=db.prepare(`SELECT * FROM ${table} WHERE public_id=?`).get(req.params.id);
  if(!row) return res.status(404).json({message:'Listing not found.'});
  const status=['active','hidden','removed','pending'].includes(clean(req.body.status))?clean(req.body.status):row.status;
  const price=req.body.price===undefined?row.price:Math.max(0,Number(req.body.price)||0);
  db.prepare(`UPDATE ${table} SET status=?,price=?,updated_at=? WHERE public_id=?`).run(status,price,now(),row.public_id);
  audit('admin_listing_moderated',type,row.public_id,`status=${status};price=${price}`);
  res.json({message:'Marketplace listing updated by admin.',listing:db.prepare(`SELECT * FROM ${table} WHERE public_id=?`).get(row.public_id)});
});


// Compatibility endpoints used by older frontend versions.
app.get('/api/admin/transactions',requireAdmin,(req,res)=>res.json({transactions:[]}));
app.get('/api/admin/receipts',requireAdmin,(req,res)=>res.json({receipts:db.prepare('SELECT * FROM receipts ORDER BY id DESC LIMIT 200').all()}));
app.get('/api/admin/refunds',requireAdmin,(req,res)=>res.json({refunds:[]}));
app.get('/api/admin/users/:id/timeline',requireAdmin,(req,res)=>res.json(db.prepare('SELECT * FROM timeline_posts WHERE user_id=? ORDER BY id DESC').all(req.params.id)));
app.get('/api/brave/faq',(req,res)=>{
 const extra=[
  ['How do I edit a product I posted?','Open Dashboard → My Products, select your listing and use Edit listing. Only the listing owner or an authorised administrator can edit it.'],
  ['How do I edit a service I posted?','Open Dashboard → My Services and use Edit listing. Other users cannot change your service listing.'],
  ['Can another user edit my listing?','No. Other users can view, buy or contact you, but they cannot edit your product or service.'],
  ['How do I change product stock?','Open your product from Dashboard → My Products and choose Stock. Enter the new available quantity.'],
  ['How do I delete my listing?','Open your own product or service and choose Delete listing. Deleted listings are no longer shown in the public marketplace.'],
  ['How do I buy a product?','Open Marketplace, choose a product, add it to Cart, review delivery details and complete the available checkout/payment steps.'],
  ['How do I know a listing is new?','Recently created marketplace listings can display a NEW badge so shoppers can identify fresh listings.'],
  ['Who can post products and services?','A signed-in BRAVE user can post eligible products and services. Administrators can also publish official BRAVE catalogue content.'],
  ['Can BRAVE guarantee a seller price is the normal public price?','No automatic system can guarantee a single normal market price for every item. BRAVE can flag unusual prices and require review before making price-comparison claims.'],
  ['What can the administrator manage?','Administrators can review marketplace listings, users, reports, orders, payment records/settings, announcements, security events and AI activity.'],
  ['What should I do if a payment looks suspicious?','Do not share passwords or one-time codes. Keep the transaction reference and contact BRAVE support/admin through the available account or customer-service tools.'],
  ['Can I offer a service instead of a product?','Yes. Use Dashboard → My Services to publish a professional service with its category, description, price and available payment arrangement.']
 ];
 res.json({faq:[...allResponses.map((answer,i)=>({question:'UNIQUE BRAVE AI response '+(i+1),answer})),...extra.map(([question,answer])=>({question,answer}))]});
});

app.use((req,res,next)=>{if(req.path.startsWith('/api/')||req.path==='/login'||req.path==='/register')return res.status(404).json({message:'API route not found.'});next();});
app.listen(PORT,()=>{
 console.log(`UNIQUE BRAVE COM backend is running on port ${PORT}`);
 const smtpReady=!!transporter();
 console.log(`[EMAIL] SMTP configuration detected: ${smtpReady ? 'YES' : 'NO'}`);
 if(smtpReady){
   transporter().verify().then(()=>console.log('[EMAIL] SMTP connection verified successfully.')).catch(e=>console.error('[EMAIL] SMTP connection verification failed:',e && e.message ? e.message : e));
 }
});
