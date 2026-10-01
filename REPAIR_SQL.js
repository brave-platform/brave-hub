const fs = require('fs');

const file = 'backend/feature_additions.js';
const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);

lines[511] = "  app.get('/api/admin/receipt-requests', requireAdmin, (req,res)=>res.json({requests:db.prepare(`SELECT r.*,u.fullname,u.username,u.email FROM receipt_requests r LEFT JOIN users u ON u.brave_id=r.user_id ORDER BY CASE WHEN r.status='pending' THEN 0 ELSE 1 END,r.id DESC`).all()}));";

lines[526] = "  app.get('/api/customer-service/requests', requireCustomerService, (req,res)=>res.json({requests:db.prepare(`SELECT r.public_id,r.subject,r.description,r.status,r.admin_note,r.created_at,u.brave_id,u.fullname,u.username,u.email FROM customer_requests r LEFT JOIN users u ON u.brave_id=r.user_id ORDER BY CASE WHEN r.status='pending' THEN 0 ELSE 1 END,r.id DESC LIMIT 200`).all()}));";

fs.writeFileSync(file, lines.join('\n'), 'utf8');

console.log('Lines 512 and 527 repaired successfully.');