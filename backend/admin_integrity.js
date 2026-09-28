module.exports=function registerAdminIntegrity({app,db,helpers}){
  const {requireAdmin,clean,audit}=helpers;
  const officialOwners=['ADMIN','CATALOGUE_STAGING','catalog','demo'];
  const adminOwnerWhere="'ADMIN','CATALOGUE_STAGING','catalog','demo'";

  app.get('/api/admin/identity',requireAdmin,(req,res)=>{
    const token=clean(req.headers['x-admin-token']);
    const session=req.app.locals.braveAdminSessions?.get(token);
    const adminEmail=clean(process.env.ADMIN_EMAIL||'');
    res.json({
      authenticated:true,
      role:'PRIMARY ADMINISTRATOR',
      account:'UNIQUE BRAVE Administration',
      adminEmail,
      sessionStartedAt:session?.createdAt?new Date(session.createdAt).toISOString():null,
      serverTime:new Date().toISOString(),
      publicBaseUrl:String(process.env.PUBLIC_BASE_URL||process.env.APP_URL||'').replace(/\/$/,''),
      node:process.version,
      authority:['Users','Marketplace catalogue','Plans & payments','Moderation','Customer care','Security','Reports','System maintenance']
    });
  });

  app.get('/api/admin/audit/recent',requireAdmin,(req,res)=>{
    const limit=Math.min(500,Math.max(1,Number(req.query.limit)||100));
    res.json({entries:db.prepare('SELECT * FROM admin_audit ORDER BY id DESC LIMIT ?').all(limit)});
  });

  app.get('/api/admin/ownership-integrity',requireAdmin,(req,res)=>{
    const adminProfiles=db.prepare(`SELECT public_id,name,owner_id,owner_name,owner_username FROM products WHERE owner_id IN (${adminOwnerWhere}) AND (COALESCE(owner_username,'')<>'' OR owner_name<>'UNIQUE BRAVE') UNION ALL SELECT public_id,name,owner_id,owner_name,owner_username FROM services WHERE owner_id IN (${adminOwnerWhere}) AND (COALESCE(owner_username,'')<>'' OR owner_name<>'UNIQUE BRAVE')`).all();
    const brokenUsers=db.prepare(`SELECT p.public_id,'product' AS type,p.name,p.owner_id,p.owner_name,p.owner_username,u.fullname,u.username FROM products p LEFT JOIN users u ON u.brave_id=p.owner_id WHERE p.owner_id IS NOT NULL AND p.owner_id NOT IN (${adminOwnerWhere}) AND (u.brave_id IS NULL OR COALESCE(p.owner_username,'')<>COALESCE(u.username,'') OR COALESCE(p.owner_name,'')<>COALESCE(u.fullname,'')) UNION ALL SELECT s.public_id,'service' AS type,s.name,s.owner_id,s.owner_name,s.owner_username,u.fullname,u.username FROM services s LEFT JOIN users u ON u.brave_id=s.owner_id WHERE s.owner_id IS NOT NULL AND s.owner_id NOT IN (${adminOwnerWhere}) AND (u.brave_id IS NULL OR COALESCE(s.owner_username,'')<>COALESCE(u.username,'') OR COALESCE(s.owner_name,'')<>COALESCE(u.fullname,''))`).all();
    res.json({ok:adminProfiles.length===0&&brokenUsers.length===0,adminProfileLeaks:adminProfiles,userIdentityIssues:brokenUsers});
  });

  app.post('/api/admin/ownership-integrity/fix',requireAdmin,(req,res)=>{
    let changed=0;
    const a=db.prepare(`UPDATE products SET owner_name='UNIQUE BRAVE',owner_username='' WHERE owner_id IN (${adminOwnerWhere}) AND (COALESCE(owner_username,'')<>'' OR owner_name<>'UNIQUE BRAVE')`).run(); changed+=Number(a.changes||0);
    const b=db.prepare(`UPDATE services SET owner_name='UNIQUE BRAVE',owner_username='' WHERE owner_id IN (${adminOwnerWhere}) AND (COALESCE(owner_username,'')<>'' OR owner_name<>'UNIQUE BRAVE')`).run(); changed+=Number(b.changes||0);
    const products=db.prepare(`SELECT p.public_id,p.owner_id,u.fullname,u.username FROM products p JOIN users u ON u.brave_id=p.owner_id WHERE p.owner_id NOT IN (${adminOwnerWhere})`).all();
    for(const p of products){db.prepare('UPDATE products SET owner_name=?,owner_username=?,updated_at=CURRENT_TIMESTAMP WHERE public_id=?').run(p.fullname,p.username,p.public_id);changed++;}
    const services=db.prepare(`SELECT s.public_id,s.owner_id,u.fullname,u.username FROM services s JOIN users u ON u.brave_id=s.owner_id WHERE s.owner_id NOT IN (${adminOwnerWhere})`).all();
    for(const s of services){db.prepare('UPDATE services SET owner_name=?,owner_username=?,updated_at=CURRENT_TIMESTAMP WHERE public_id=?').run(s.fullname,s.username,s.public_id);changed++;}
    audit('admin_ownership_integrity_repaired','platform',String(changed));
    res.json({message:`Ownership integrity repair completed. ${changed} listing records checked/updated.`,changed});
  });
};
