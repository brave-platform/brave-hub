# UNIQUE BRAVE

UNIQUE BRAVE is a Nigerian/African-focused platform for **Buy. Sell. Find Services. Build. Work. Grow.** It combines a marketplace, public profiles, timeline, business tools, messaging, records, receipts, Workshop tools, AI assistance and an administrator control centre.

## Included

- Public first page with large UNIQUE BRAVE lion branding and marketplace search.
- Buyer, product/goods seller and service-provider account types.
- Username-based public identity and shareable `/u/<username>` profile pages.
- Login with email, phone or username.
- Expandable Terms & Conditions on registration and login.
- Eye controls for showing/hiding passwords.
- Password reset by email when SMTP is configured.
- Optional Twilio Verify phone verification endpoints.
- SQLite database using `better-sqlite3`, WAL mode and migration-safe schema upgrades.
- Products with images/video, categories, prices, delivery and payment preference.
- Services with media and provider profiles.
- Public timeline with photo/video posts.
- Search across products, services and users.
- Messages, notifications, reports and protected account-change requests.
- UNIQUE BRAVE Workshop with working CV, letter, poster/flyer, invoice/receipt, form planner, social caption and media-preview tools.
- OPay as a selectable payment channel in UNIQUE BRAVE business receipts. **UNIQUE BRAVE is not OPay and the receipt is not proof of payment by itself.**
- Wallet clearly marked **Coming Soon**.
- Mobile bottom navigation: Home, Marketplace, Timeline and Menu; the Menu exposes the wider platform.
- Admin Centre with user records, public-profile access, login activity, signup records, moderation, verification, reports, security events, companies, advertising requests, AI conversations and audit activity.
- Render deployment configuration and environment-variable template.

## Security / deployment

Never commit `.env`, database files or real credentials. Put production secrets in Render Environment Variables.

For durable SQLite data on a host that supports persistent disks, set `UNIQUE BRAVE_DB_PATH` to the mounted database location. Without persistent storage, an ephemeral host may reset SQLite data on restart/redeploy. The schema is automatically recreated and upgraded when the application starts.

## Local run

1. Copy `.env.example` to `.env`.
2. Fill the required admin values and any SMTP/Twilio values you actually use.
3. Run `npm install`.
4. Run `npm start`.
5. Open the site at the local port shown by the server.

## GitHub / Render

Push the whole project including `package.json`, `package-lock.json`, `index.js`, `backend/`, `public/`, `storage/.gitkeep`, `.env.example` and `render.yaml`.

Do **not** push `.env`, `backend/brave.db`, `backend/*.db-shm` or `backend/*.db-wal`.

Set `PUBLIC_BASE_URL` to the public domain you actually use. When a custom domain is connected, public profile links automatically use it, e.g. `https://your-domain.example/u/brave1225`.

## Brand direction

Purple + gold + white, large readable mobile-first controls, rounded cards, strong imagery, clear text labels and professional presentation. The interface takes inspiration from polished modern product platforms without copying another service's branding or interface.


## Upgrade notes

The current project was upgraded in place; the existing marketplace, timeline, authentication, workshop, records, receipts, business tools, admin moderation, AI, phone verification and deployment structure were retained.

Additional connected features now included:
- Customer Requests with status tracking and admin management.
- Speak with Advisor with persistent conversation history and optional image attachments.
- Public Announcements stored in SQLite and surfaced to users with notification entries.
- Live Daily Report summaries generated from real account activity.
- Verification ID card for approved users with a generated 15-digit serial number.
- Receipt references generated automatically as `BRV-REC-` plus a 15-digit reference when one is not supplied.
- Product/service media can include optional image, video and PDF attachments.
- Product and service payment arrangements support pay-on-delivery/after-service, half payment, full payment, or disabled payment records.
- Payment-safety prompts are displayed before users rely on a listing's payment arrangement.
- Contact Admin is available from marketplace listings after login.
- Additional Workshop tools for simple profit planning and appointment planning.
- Reset/refresh controls were added to relevant user/admin views.
- Login and registration pages use the updated branded visual background and registration includes confirm-password validation.
- Verification serials and password hashes are stored as database values; passwords are never stored in plaintext.


## Production-readiness amendment
The current build preserves its original routes and UI while adding an additive feature layer:

- 100 additional catalogue products are seeded in **admin staging** with `pending` status and are invisible to the general marketplace until an administrator verifies the image, price, quantity and quality and publishes them.
- Staging items support admin image URL/data, price, quantity, quality, source reference, notes and publish/unpublish controls.
- Official user-generated receipts are now requests that require admin validation before a `BRV-REC-` serial is issued.
- Purchases receive an automatic `BRV-PUR-` purchase serial.
- Persistent user sessions can survive server restarts for the configured remember-me period.
- User profile and cover image uploads, apprentice records, seller profile detail views, buyer-to-seller negotiation chat, admin/user chat, customer-service roles and account-repair audit actions were added without removing the original feature set.
- AI suggestions include a larger knowledge base for common marketplace, payment, account and simple Nigerian Pidgin/Yoruba-style phrases.
- Expanded plans contain specific features and target use cases.

### Image and price verification
The staged catalogue contains real product/category image references. Some are open-licence Wikimedia photographs and some are third-party retail/reference images. Every staged item is intentionally marked for administrator verification before public publication. Prices in staging are editable reference values and should be checked against the seller/source before publishing.


## Additive production-readiness amendments
- Existing features and routes are retained; new functionality is layered on top.
- Admin Catalogue Staging now holds 200 staged SKUs: the original 100 plus 100 additional staged listings; they remain hidden until admin publication.
- Admin can edit image URL or upload a local image, price, quantity, quality, brand and verification fields before publication.
- Public goods-and-services marketplace cards support richer details, saved products, seller/provider profile links and direct negotiation chats where an individual seller exists.
- Public profiles use a Facebook-style structure with profile/cover image, stats, timeline, goods and services.
- Direct user/seller chats use a WhatsApp-style conversation layout with payment-safety reminders.
- Admin account diagnostics and repair controls are additive; Customer Service roles remain permission-limited.
- Receipt creation remains a validation request until an administrator approves it and issues the official UNIQUE BRAVE receipt serial.
- Purchase and validated receipt serial numbers are generated server-side.
- BRAVE AI has a simple-language route for common Nigerian Pidgin/Yoruba wording, budget phrases and catalogue suggestions.
- Storage subfolders contain .gitkeep files so the intended storage tree survives ZIP extraction/version control.
- Render uses npm install for the tested better-sqlite3 12.11.1 line.


## UNIQUE BRAVE downloadable app
The project is now a Progressive Web App (PWA). Users can install UNIQUE BRAVE directly from the live website without Play Store/App Store. Open `/download.html`, or use the in-app Install button.

### Production feature notes
- Password reset page is linked prominently from login. Email delivery still requires SMTP environment variables on the server.
- Paid membership plans now have a bank-transfer purchase request flow with subscription records and notifications.
- Marketplace catalogue is seeded with 50 real product-family image references from the existing staged catalogue and 10 service directory entries with photographic images.
- Product/service video fields are rendered with native browser controls when media is present.
- PWA shell is cached for faster repeat launches; marketplace/account data still requires network access.

### Important
The installable app is a PWA, not a Play Store APK. This is intentional: it can be installed directly on Android, iPhone/iPad and desktop browsers without an app store. A native APK/IPA wrapper can be produced later if needed, but it is not required for direct installation.


## Final additive upgrade
- Password reset now reports delivery status clearly; real email delivery uses SMTP environment variables.
- Users can change their username from Dashboard â†’ Settings.
- Admins can create, pause and activate sponsored image/video advertisements from Admin â†’ Paid Advertisements.
- Active ads can display as timed interstitials with a configured skip-after delay and impression/click tracking.
- BRAVE AI is available as a floating assistant across the app and can search the internal product/service catalogue and explain navigation.

## Latest in-place upgrade

This release keeps the existing Node.js/Express/SQLite architecture and adds:

- Dedicated `/products.html` and `/services.html` marketplaces so Product and Service entry points no longer depend on the general marketplace.
- A shuffled marketplace feed that mixes user-owned listings with UNIQUE BRAVE/admin catalogue listings while clearly identifying the seller/provider and linking to their public profile.
- Admin-editable live/demo catalogue listings, including service listings.
- WhatsApp-style user â†” administrator support chat with a configurable inactivity timeout (`ADMIN_CHAT_TIMEOUT_MINUTES`, default 30 minutes).
- Persistent password-reset tokens stored in SQLite so reset links survive server restarts and are single-use/expiry checked.
- SMTP `SMTP_SECURE` support with the recommended Gmail 587/STARTTLS configuration.
- A larger Workshop business suite: business-plan builder, quotation/estimate maker, price-list maker, break-even planner, campaign planner, proposal maker, content calendar and expense summary, while retaining the existing tools.
- A BRAVE AI chat interface with quick actions and real product/service results instead of a single plain form.
- More prominent Product Marketplace and Services Marketplace calls-to-action on the public homepage.

### SMTP for Gmail
For Gmail on port 587, use `SMTP_SECURE=false` and a Gmail App Password. Do not commit `.env` or real credentials.

### Admin chat
The timeout is configurable in Render with `ADMIN_CHAT_TIMEOUT_MINUTES`. The default is 30 minutes of inactivity; sending a new message refreshes the session.
