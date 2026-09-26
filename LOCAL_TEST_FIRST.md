# UNIQUE BRAVE — Local Test Build

Base: `UNIQUE_BRAVE_2_5_CHAT_MARKETPLACE_COMPLETE.zip`

This build keeps the existing BRAVE architecture and adds the account-persistence protection requested for the local test stage.

## 1. Copy the folder
Use this folder as your new local test project.

## 2. Install dependencies
Open CMD in this folder:

```cmd
npm install
```

If Windows reports that `better-sqlite3` needs a Visual Studio C++ build tool, use the existing workaround from the BRAVE development setup:

```cmd
npm install --ignore-scripts
```

Then verify:

```cmd
node -e "require('better-sqlite3'); console.log('better-sqlite3 OK')"
```

## 3. Create local environment file
Copy `.env.example` to `.env` and set a local storage key.

Example:

```env
NODE_ENV=development
PORT=4173
BRAVE_DB_PATH=./backend/brave.db
BRAVE_STORAGE_KEY=change-this-local-key
PUBLIC_BASE_URL=http://localhost:4173
APP_URL=http://localhost:4173
BRAVE_SESSION_DAYS=90
BRAVE_MIGRATED_DIR=./storage/migrated
BRAVE_AUTO_DB_BACKUP=true
```

Keep real Resend/payment/API secrets out of Git.

## 4. Start

```cmd
npm start
```

Open:

`http://localhost:4173/`

## 5. Test the refresh fix

1. Create/login to a test BRAVE account.
2. Confirm the dashboard opens.
3. Refresh the page several times.
4. Close and reopen the browser while the Remember Me option is active.
5. Open Marketplace, Services, Workshop and Profile.
6. Confirm the same BRAVE account is still recognised.

The frontend now bootstraps a fresh persistent session from the HttpOnly server cookie when the browser's local token is missing/stale. The server remains the authentication source of truth.

## 6. Test migration protection

After logging in, the server stores an encrypted snapshot in:

`storage/migrated/users/`

The snapshot does not contain passwords, password hashes, session tokens, OTPs or API secrets.

Database migrations are tracked in:

`brave_migrations`

Before production updates, keep database backups as well as these encrypted snapshots.

## 7. Before GitHub/Render

Do not push `.env` or production secrets.

Run:

```cmd
node --check index.js
node --check backend/storage_service.js
node --check backend/migrations/002_user_data_protection.js
git status --short
```

Only after local testing passes should this build be committed and pushed.
