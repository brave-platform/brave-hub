module.exports=function(db){
  // Keep official UNIQUE BRAVE catalogue listings free of user identity fields.
  db.exec(`UPDATE products SET owner_name='UNIQUE BRAVE', owner_username='' WHERE owner_id IN ('ADMIN','CATALOGUE_STAGING','catalog','demo');`);
  db.exec(`UPDATE services SET owner_name='UNIQUE BRAVE', owner_username='' WHERE owner_id IN ('ADMIN','CATALOGUE_STAGING','catalog','demo');`);
  // Repair user listing identity fields from the authoritative users table when possible.
  db.exec(`UPDATE products SET owner_name=COALESCE((SELECT fullname FROM users WHERE users.brave_id=products.owner_id),owner_name), owner_username=COALESCE((SELECT username FROM users WHERE users.brave_id=products.owner_id),owner_username) WHERE owner_id IS NOT NULL AND owner_id NOT IN ('ADMIN','CATALOGUE_STAGING','catalog','demo');`);
  db.exec(`UPDATE services SET owner_name=COALESCE((SELECT fullname FROM users WHERE users.brave_id=services.owner_id),owner_name), owner_username=COALESCE((SELECT username FROM users WHERE users.brave_id=services.owner_id),owner_username) WHERE owner_id IS NOT NULL AND owner_id NOT IN ('ADMIN','CATALOGUE_STAGING','catalog','demo');`);
};
