# BRAVE Reviews — Unique BRAVE

This is the existing BRAVE application with additive improvements. The project is intentionally preserved rather than replaced with a demo.

## Included
- BRAVE public homepage, purple/gold/white branding and lion asset.
- Existing user dashboard, marketplace, services, timeline, profiles, messaging, notifications, AI, Workshop, Company Centre, records, receipts, settings and verification.
- Login and registration with password visibility controls and Terms & Conditions hidden behind a viewer.
- Persistent password-reset tokens with expiry and single-use invalidation.
- Admin Control Centre with users, marketplace moderation, verification, reports, security, advertising, AI activity, companies and audit activity.
- User Timeline Viewer.
- Reviews & Ratings plus suspicious/flagged review administration.
- Content moderation queue for new products, services and timeline posts.

## Local Windows setup
1. Install Node.js 18 or newer.
2. Open Command Prompt in the project folder.
3. Run `npm install`.
4. Copy `.env.example` to `.env`.
5. Fill in `ADMIN_EMAIL` and `ADMIN_PASSWORD` for local admin testing.
6. For password recovery email, configure the SMTP variables. Never place a real App Password in source code.
7. Run `npm start`.
8. Open `http://localhost:3000/`.

## Render
Use `npm install` as the build/install step and `npm start` as the start command. Render supplies `PORT`; the server reads `process.env.PORT` and falls back to 3000 locally.

Set environment variables from `.env.example` in Render. Do not commit `.env` or credentials.

SQLite remains the current database. For durable production data on Render, use persistent storage or move the data/media layer to managed storage.

## Phone verification
The existing Twilio-compatible endpoints are preserved. If Twilio variables are not configured, the UI reports that phone verification is pending/optional rather than pretending an OTP was delivered.

## AI
BRAVE AI currently uses the existing offline response library plus marketplace database search. It does not claim to be an external model/API when one is not connected.

## Reports
`BRAVE_TEST_REPORT.md` records the tests actually performed for this delivery. `BRAVE_IMPLEMENTATION_REPORT.md` records implementation status and known limitations.
