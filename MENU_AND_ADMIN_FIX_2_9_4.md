# UNIQUE BRAVE 2.9.4 — Menu & Admin Access Fix

This is a targeted upgrade of the existing 2.9.3 build.

## Fixed
- User menu links that point to `/dashboard.html#section` now open the requested dashboard section instead of always showing Home.
- Dashboard hash navigation also works when the hash is changed after the page is already open.
- `/admin.html` now performs an admin authentication check before the admin dashboard is allowed to load.
- Missing/expired/invalid `braveAdminToken` redirects to `/admin-login.html`.
- Existing server-side `requireAdmin` protection remains in place for admin APIs.
- Service-worker cache version was bumped so the repaired menu/admin scripts are refreshed instead of an old cached copy being reused.

## Preserved
The existing marketplace, business dashboard, products, services, orders, messages, receipts/invoices, plans, workshop, customer care, admin tools, database and existing API architecture were not replaced.

## Local test
Run:

```bat
npm install
npm start
```

Then open `http://localhost:10000`.
