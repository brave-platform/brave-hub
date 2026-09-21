# UNIQUE BRAVE v2.1.0 — In-place marketplace/workshop upgrade

## Preserved
- Node.js + Express server
- SQLite + better-sqlite3
- bcrypt authentication
- nodemailer SMTP reset flow
- Twilio-ready verification
- existing dashboard, marketplace, admin centre, timeline, records, receipts, plans, PWA and AI endpoints

## Added/amended
- Dedicated product and service marketplace pages
- Shuffled mixed catalogue discovery with visible owner/provider identity
- User profile presentation beside their listings
- Admin editing controls for service/demo catalogue listings
- WhatsApp-style admin ↔ user chat with inactivity timeout
- Persistent, single-use password-reset tokens
- SMTP STARTTLS configuration support
- Expanded online Workshop business tools
- BRAVE AI chat-style interface with real listing results and tool shortcuts
- More prominent homepage product/service doors and marketplace imagery

## Safety
- No plaintext passwords are exposed to administrators.
- No real credentials are included in this release ZIP.
- Paid plan/payment status is not faked.
- Receipt validation remains an administrator-controlled step.
