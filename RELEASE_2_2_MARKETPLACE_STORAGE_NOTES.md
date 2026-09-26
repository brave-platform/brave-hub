# UNIQUE BRAVE — Marketplace + Storage Release

## Added
- New dashboard marketplace hub with **See Products Marketplace** and **See Services Marketplace** actions.
- Dedicated product/service marketplace category filtering; selecting a category requests only that category.
- 50 additional official UNIQUE BRAVE admin-owned products.
- 50 additional official UNIQUE BRAVE admin-owned services.
- New Admin → Published Catalogue Manager for editing published, hidden, draft and removed BRAVE catalogue listings.
- Admin can edit catalogue name, category, description, price, delivery, stock, payment arrangement, image/video and status.
- Publish, unpublish and republish controls.
- Marketplace checkout now supports Pay on Delivery, Bank Transfer, Part Payment and Full Payment, plus standard/express/pickup delivery and customer notes.
- Admin payment settings remain the source of the account used for bank-transfer instructions; no payment account is hard-coded into public source.
- Persistent session cookie backup for easier login after refresh/restart, while password hashes remain server-side.
- Encrypted per-user storage snapshots for records, timeline, listings, orders, receipts and workshop documents.
- Migration storage directory and SQLite backup command.
- Expanded BRAVE AI task buttons for order help, listing improvement, customer replies, receipt guidance, category help and business ideas.

## Security/storage
- Passwords are never written to user exports in plaintext.
- `BRAVE_STORAGE_KEY` is used for encrypted user snapshots.
- `BRAVE_DB_PATH` should point to a persistent database location in production.
- `BRAVE_MIGRATED_DIR` can point to a persistent migration/backup location.
- `npm run backup` creates a SQLite database backup.
- `BRAVE_AUTO_DB_BACKUP=true` enables a startup backup.

## Existing features preserved
The release is additive: existing products/services, users, timeline, orders, receipts, plans, admin controls, verification, customer support, advisor chat, workshop and PWA/mobile polish remain in the project.
