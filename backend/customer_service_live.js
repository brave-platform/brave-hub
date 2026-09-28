const crypto=require('crypto');
module.exports=function registerCustomerServiceLive({app,db,helpers}){
  const {requireUser,requireAdmin,clean,id,now,audit,safeUser,sendManualResetForUser}=helpers;
  const hash=v=>crypto.createHash('sha256').update(String(v)).digest('hex');
  const token=()=>crypto.randomBytes(24).toString('hex');
  const onlineCutoff=()=>new Date(Date.now()-5*60*1000).toISOString();
  const agentRows=()=>db.prepare(`SELECT s.user_id,s.role,s.active,s.permissions,u.fullname,u.username,u.email,
      COALESCE(p.status,'offline') presence,COALESCE(p.last_seen_at,'') last_seen_at
      FROM staff_roles s LEFT JOIN users u ON u.brave_id=s.user_id
      LEFT JOIN customer_service_presence p ON p.user_id=s.user_id
      WHERE s.active=1 AND s.role='customer_service' ORDER BY u.fullname ASC`).all().map(x=>({...x,online:x.last_seen_at>=onlineCutoff()&&x.presence==='online'}));
  const getThread=(pid)=>db.prepare('SELECT * FROM customer_service_threads WHERE public_id=?').get(pid);
  const messages=(pid)=>db.prepare('SELECT * FROM customer_service_messages WHERE thread_id=? ORDER BY id ASC LIMIT 500').all(pid);
  const publicThread=t=>({public_id:t.public_id,requester_name:t.requester_name,requester_email:t.requester_email,subject:t.subject,status:t.status,assigned_to:t.assigned_to,assigned_role:t.assigned_role,created_at:t.created_at,updated_at:t.updated_at,last_message_at:t.last_message_at});
  const sendNotification=(uid,title,message)=>{if(uid)db.prepare('INSERT INTO notifications(public_id,user_id,title,message) VALUES(?,?,?,?)').run(id('note'),uid,title,message)};
  const sendMsg=(thread,type,senderId,senderName,msg)=>{const mid=id('csm');db.prepare('INSERT INTO customer_service_messages(public_id,thread_id,sender_type,sender_id,sender_name,message) VALUES(?,?,?,?,?,?)').run(mid,thread.public_id,type,senderId||'',senderName||'',msg);db.prepare('UPDATE customer_service_threads SET updated_at=?,last_message_at=? WHERE public_id=?').run(now(),now(),thread.public_id);return db.prepare('SELECT * FROM customer_service_messages WHERE public_id=?').get(mid)};

  // Guest or logged-in user starts a real support queue conversation.
  app.post('/api/customer-service/live/start',(req,res)=>{
    const name=clean(req.body.name).slice(0,120),email=clean(req.body.email).slice(0,160),phone=clean(req.body.phone).slice(0,60),subject=clean(req.body.subject).slice(0,180)||'Customer service request',message=clean(req.body.message).slice(0,4000);
    if(!name||!message)return res.status(400).json({message:'Your name and message are required.'});
    let userId='';
    try{const h=String(req.headers.authorization||'');if(h.startsWith('Bearer ')){const u=db.prepare('SELECT * FROM users WHERE brave_id IN (SELECT user_id FROM user_sessions WHERE token_hash=?)').get(hash(h.slice(7)));if(u){userId=u.brave_id}}}catch{}
    const access=token(),pid=id('support');
    db.prepare('INSERT INTO customer_service_threads(public_id,access_hash,user_id,requester_name,requester_email,requester_phone,subject,status) VALUES(?,?,?,?,?,?,?,?)').run(pid,hash(access),userId,name,email,phone,subject,'waiting');
    const t=getThread(pid);sendMsg(t,'user',userId,name,message);
    audit('customer_service_live_started',userId?'user':'guest',userId||pid,subject);
    res.status(201).json({message:'Your message has reached UNIQUE BRAVE Customer Service. Administration will select an available Customer Care agent or respond as UNIQUE BRAVE Administration.',thread:publicThread(t),accessToken:access,agentsOnline:agentRows().filter(a=>a.online).length});
  });
  app.get('/api/customer-service/live/thread',(req,res)=>{
    const access=String(req.headers['x-support-token']||'');if(!access)return res.status(401).json({message:'Support session token required.'});
    const t=db.prepare('SELECT * FROM customer_service_threads WHERE access_hash=?').get(hash(access));if(!t)return res.status(404).json({message:'Support conversation not found.'});
    res.json({thread:publicThread(t),messages:messages(t.public_id),agentsOnline:agentRows().filter(a=>a.online).length});
  });
  app.post('/api/customer-service/live/thread/message',(req,res)=>{
    const access=String(req.headers['x-support-token']||''),msg=clean(req.body.message).slice(0,4000);if(!access||!msg)return res.status(400).json({message:'Support session and message are required.'});
    const t=db.prepare('SELECT * FROM customer_service_threads WHERE access_hash=?').get(hash(access));if(!t)return res.status(404).json({message:'Support conversation not found.'});
    if(t.status==='closed')return res.status(409).json({message:'This support conversation is closed. Start a new Customer Service request.'});
    const m=sendMsg(t,'user',t.user_id,t.requester_name,msg);db.prepare("UPDATE customer_service_threads SET status=CASE WHEN status='closed' THEN status ELSE status END WHERE public_id=?").run(t.public_id);
    if(t.assigned_to)sendNotification(t.assigned_to,'Customer Service message',`${t.requester_name} sent a new support message.`);
    audit('customer_service_live_user_message',t.user_id?'user':'guest',t.user_id||t.public_id,msg);res.status(201).json({message:'Message sent.',item:m});
  });
  app.get('/api/customer-service/live/agents',(req,res)=>res.json({agents:agentRows().map(a=>({user_id:a.user_id,fullname:a.fullname,username:a.username,online:a.online,last_seen_at:a.last_seen_at}))}));

  // Customer Care staff presence and assigned queue.
  app.post('/api/customer-service/live/presence',requireUser,(req,res)=>{
    const s=db.prepare('SELECT * FROM staff_roles WHERE user_id=? AND role="customer_service" AND active=1').get(req.user.brave_id);if(!s)return res.status(403).json({message:'Customer Care access is not enabled for this account.'});
    db.prepare('INSERT INTO customer_service_presence(user_id,status,last_seen_at) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET status=excluded.status,last_seen_at=excluded.last_seen_at').run(req.user.brave_id,req.body.online===false?'offline':'online',now());res.json({online:req.body.online!==false});
  });
  app.get('/api/customer-service/live/assigned',requireUser,(req,res)=>{
    const s=db.prepare('SELECT * FROM staff_roles WHERE user_id=? AND role="customer_service" AND active=1').get(req.user.brave_id);if(!s)return res.status(403).json({message:'Customer Care access is not enabled for this account.'});
    const threads=db.prepare('SELECT * FROM customer_service_threads WHERE assigned_to=? AND status IN ("assigned","waiting") ORDER BY updated_at DESC LIMIT 100').all(req.user.brave_id);res.json({threads:threads.map(publicThread)});
  });
  app.get('/api/customer-service/live/assigned/:id',(req,res)=>{
    const s=db.prepare('SELECT * FROM staff_roles WHERE user_id=? AND role="customer_service" AND active=1').get(req.user.brave_id);if(!s)return res.status(403).json({message:'Customer Care access is not enabled for this account.'});
    const t=getThread(req.params.id);if(!t||t.assigned_to!==req.user.brave_id)return res.status(404).json({message:'Assigned support conversation not found.'});res.json({thread:publicThread(t),messages:messages(t.public_id)});
  });
  app.post('/api/customer-service/live/assigned/:id/message',requireUser,(req,res)=>{
    const s=db.prepare('SELECT * FROM staff_roles WHERE user_id=? AND role="customer_service" AND active=1').get(req.user.brave_id);if(!s)return res.status(403).json({message:'Customer Care access is not enabled for this account.'});
    const t=getThread(req.params.id),msg=clean(req.body.message).slice(0,4000);if(!t||t.assigned_to!==req.user.brave_id)return res.status(404).json({message:'Assigned support conversation not found.'});if(!msg)return res.status(400).json({message:'Message is required.'});
    const m=sendMsg(t,'agent',req.user.brave_id,req.user.fullname,msg);sendNotification(t.user_id,'Customer Care response',`${req.user.fullname} from UNIQUE BRAVE Customer Care replied to your support conversation.`);res.status(201).json({message:'Customer reply sent.',item:m});
  });
  app.post('/api/customer-service/live/assigned/:id/close',requireUser,(req,res)=>{
    const s=db.prepare('SELECT * FROM staff_roles WHERE user_id=? AND role="customer_service" AND active=1').get(req.user.brave_id);if(!s)return res.status(403).json({message:'Customer Care access is not enabled for this account.'});
    const t=getThread(req.params.id);if(!t||t.assigned_to!==req.user.brave_id)return res.status(404).json({message:'Assigned support conversation not found.'});db.prepare("UPDATE customer_service_threads SET status='closed',updated_at=? WHERE public_id=?").run(now(),t.public_id);sendNotification(t.user_id,'Customer Service conversation closed',`Your Customer Care conversation was closed by ${req.user.fullname}. You can start another request at any time.`);res.json({message:'Conversation closed.'});
  });
  app.post('/api/customer-service/live/assigned/:id/reset-email',requireUser,async(req,res)=>{
    const s=db.prepare('SELECT * FROM staff_roles WHERE user_id=? AND role="customer_service" AND active=1').get(req.user.brave_id);
    if(!s)return res.status(403).json({message:'Customer Care access is not enabled for this account.'});
    const t=getThread(req.params.id);
    if(!t||t.assigned_to!==req.user.brave_id)return res.status(404).json({message:'Assigned support conversation not found.'});
    if(!t.user_id)return res.status(400).json({message:'This customer contacted Customer Care without a logged-in account, so there is no account password to reset.'});
    const u=db.prepare('SELECT * FROM users WHERE brave_id=? AND account_status<>"banned"').get(t.user_id);
    if(!u)return res.status(404).json({message:'Customer account not found.'});
    if(!u.email)return res.status(400).json({message:'This customer has no email address on file.'});
    try{
      const {reset,mail}=await sendManualResetForUser(u,'customer-care');
      audit('customer_care_manual_reset_email','user',u.brave_id,mail.sent?`Reset email issued by ${req.user.username}.`:`Reset email requested but delivery failed: ${mail.code||'unknown'}`);
      if(!mail.sent)return res.status(502).json({message:'A new reset link was created, but the email could not be delivered.',reason:mail.code,resetUrl:process.env.NODE_ENV==='production'?undefined:reset.url});
      sendMsg(t,'system',req.user.brave_id,req.user.fullname,'Customer Care issued a fresh password-reset email to the email address on your account.');
      sendNotification(u.brave_id,'Password reset email sent','UNIQUE BRAVE Customer Care sent you a fresh password-reset link. It expires in 30 minutes.');
      res.json({message:'Fresh password-reset email sent to the customer.',emailId:mail.id});
    }catch(e){console.error('[CUSTOMER CARE RESET]',e);res.status(500).json({message:'Unable to send the manual reset email right now.'});}
  });

  // Administrator controls the queue: choose an online Customer Care agent or the administrator.
  app.get('/api/admin/customer-service/live',requireAdmin,(req,res)=>{const threads=db.prepare(`SELECT * FROM customer_service_threads WHERE status IN ('waiting','assigned') ORDER BY CASE status WHEN 'waiting' THEN 0 ELSE 1 END,updated_at DESC LIMIT 300`).all();res.json({agents:agentRows(),threads:threads.map(t=>({...publicThread(t),messages:messages(t.public_id).slice(-1)}))});});
  app.post('/api/admin/customer-service/live/:id/assign',requireAdmin,(req,res)=>{
    const t=getThread(req.params.id);if(!t)return res.status(404).json({message:'Support conversation not found.'});const assignee=clean(req.body.assignee);
    if(assignee==='ADMIN'){db.prepare('UPDATE customer_service_threads SET assigned_to="ADMIN",assigned_role="administrator",status="assigned",updated_at=? WHERE public_id=?').run(now(),t.public_id);sendMsg(t,'system','ADMIN','UNIQUE BRAVE Administration','UNIQUE BRAVE Administration has picked up your Customer Service conversation.');if(t.user_id)sendNotification(t.user_id,'UNIQUE BRAVE Administration is assisting you','An administrator has picked up your Customer Service conversation.');audit('customer_service_assigned_admin','thread',t.public_id);return res.json({message:'Conversation assigned to UNIQUE BRAVE Administration.'});}
    const a=db.prepare('SELECT s.user_id,u.fullname FROM staff_roles s JOIN users u ON u.brave_id=s.user_id LEFT JOIN customer_service_presence p ON p.user_id=s.user_id WHERE s.user_id=? AND s.role="customer_service" AND s.active=1 AND p.status="online" AND p.last_seen_at>=?').get(assignee,onlineCutoff());
    if(!a)return res.status(400).json({message:'That Customer Care agent is not currently online.'});
    db.prepare('UPDATE customer_service_threads SET assigned_to=?,assigned_role="customer_service",status="assigned",updated_at=? WHERE public_id=?').run(a.user_id,now(),t.public_id);sendMsg(t,'system','ADMIN','UNIQUE BRAVE Administration',`${a.fullname} has been selected as your Customer Care agent.`);if(t.user_id)sendNotification(t.user_id,'Customer Care agent selected',`${a.fullname} is now available to assist you.`);sendNotification(a.user_id,'New Customer Service assignment',`${t.requester_name} has been assigned to you.`);audit('customer_service_assigned_agent','thread',t.public_id,a.user_id);res.json({message:`Conversation assigned to ${a.fullname}.`});
  });
  app.get('/api/admin/customer-service/live/:id',requireAdmin,(req,res)=>{const t=getThread(req.params.id);if(!t)return res.status(404).json({message:'Support conversation not found.'});res.json({thread:publicThread(t),messages:messages(t.public_id)});});
  app.post('/api/admin/customer-service/live/:id/message',requireAdmin,(req,res)=>{const t=getThread(req.params.id),msg=clean(req.body.message).slice(0,4000);if(!t)return res.status(404).json({message:'Support conversation not found.'});if(!msg)return res.status(400).json({message:'Message is required.'});const m=sendMsg(t,'administrator','ADMIN','UNIQUE BRAVE Administration',msg);if(t.user_id)sendNotification(t.user_id,'UNIQUE BRAVE Administration',msg);audit('customer_service_admin_message','thread',t.public_id,msg);res.status(201).json({message:'Administrator reply sent.',item:m});});
  app.post('/api/admin/customer-service/live/:id/close',requireAdmin,(req,res)=>{const t=getThread(req.params.id);if(!t)return res.status(404).json({message:'Support conversation not found.'});db.prepare("UPDATE customer_service_threads SET status='closed',updated_at=? WHERE public_id=?").run(now(),t.public_id);if(t.user_id)sendNotification(t.user_id,'Customer Service conversation closed','UNIQUE BRAVE Administration closed this support conversation. You can start another request anytime.');audit('customer_service_closed','thread',t.public_id);res.json({message:'Conversation closed.'});});
};
