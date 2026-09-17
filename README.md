# BRAVE COM — Unique BRAVE

This package is a cleaned, rebuilt BRAVE application folder. It includes:

- SQLite storage for accounts, usernames, products, services, timeline posts, records, receipts, messages, notifications, admin requests and security events.
- User dashboard with four-item mobile navigation: Home, Market, Timeline, Menu.
- WhatsApp-style BRAVE AI chat with a large offline response library and marketplace matching.
- Image and video timeline posts.
- Workshop tools with usable workspaces.
- Multiple receipt types and print/save-PDF flow.
- Company Centre and business profile tools.
- Admin login and a functional admin dashboard at `/admin-login` and `/admin.html`.
- Admin approval queue for protected account changes.
- Suspicious-activity review signals (failed login bursts, rapid account activity, repeated protected requests).
- Public username profiles at `/u/<username>`.
- No hard-coded localhost links in the frontend. Production share links use `PUBLIC_BASE_URL`.

## Run locally

1. `npm install`
2. Copy `.env.example` to `.env` and set admin credentials for local testing.
3. `npm start`
4. Open `http://localhost:3000/`

## Render

Set the Environment Variables in Render from `.env.example`. The application uses `PORT` supplied by Render automatically.

Important: SQLite is real database storage, but Render's normal ephemeral filesystem can reset between deploys/restarts. For durable production data, attach a persistent disk or move the database/media layer to managed storage later.

The public URL is an access URL, not a database. The app stores structured information in SQLite and exposes shareable records through the public web URL.

Google ID/OAuth is intentionally left for the next phase after this setup is tested.
