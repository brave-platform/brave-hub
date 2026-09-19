# UNIQUE BRAVE — Additive Public-Ready Upgrade

This package is an additive upgrade of the existing UNIQUE BRAVE project. Existing pages, routes, database tables and previously working features are retained; the changes below extend the existing system.

## Added/amended
- 200 admin-staged catalogue SKUs total: the original 100 plus 100 additional staged listings.
- All staged listings remain hidden from the general marketplace until admin publication.
- Admin staging editor can change image URL, upload a local product image, price, old price, quantity, quality, brand, source and verification note.
- Publication guard requires an image, positive price and positive quantity.
- Rich single-product view, wishlist/save action, seller/provider profile links and negotiation entry points.
- WhatsApp-style direct user/seller conversations with payment-safety reminders.
- WhatsApp-style advisor conversation remains layered over the existing advisor feature.
- Admin account diagnostics and account-repair controls are additive.
- Admin user timeline detail viewer remains available from user controls.
- Limited Customer Service role and support desk remain permission-controlled.
- Profile picture and cover picture support retained and surfaced in public profile presentation.
- Facebook-style public profile presentation with timeline, goods, services and profile statistics.
- Existing purchase serial and validated receipt serial generation retained; receipt generation remains a request until admin validation.
- Persistent database-backed login sessions retained for remembered login across normal server restarts while the token is still valid.
- Apprentices, overview and daily metrics, plans and plan-specific feature descriptions retained.
- BRAVE AI receives a simple-language endpoint that understands common Nigerian Pidgin/Yoruba wording, budget phrases and catalogue matching/suggestions.
- Storage tree expanded with persistent folder placeholders for user media, products, services, timeline, advisor, receipts, documents, apprentices, messages, admin evidence/exports, advertising, backups, logs and temporary files.
- Render build command uses `npm install --no-audit` because the tested local Windows build uses `better-sqlite3` 12.11.1.

## Product image note
The catalogue uses real product-family image/source references rather than invented photographs. Some variants deliberately reuse the same real family/source image and are flagged for admin verification before publication. Admin can replace a staged image with an exact image file before publishing.
