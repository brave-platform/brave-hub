# UNIQUE BRAVE — Migrated Storage

This folder is reserved for BRAVE data that must survive application updates.

## What is protected

- The SQLite database contains users, hashed passwords, sessions, products, services, timeline posts, orders, receipts, records and other platform data.
- `user_storage` keeps an encrypted snapshot of each user's important records.
- Passwords are **never stored in plain text** and are not included in user migration exports.
- Login continuity uses persistent server-side session hashes plus an HttpOnly `brave_session` cookie.

## Safe update workflow

1. Keep `BRAVE_DB_PATH` pointed at a persistent disk/database location.
2. Set `BRAVE_STORAGE_KEY` to a long random secret and keep it in server environment variables only.
3. Before a major update, run `npm run backup` or enable `BRAVE_AUTO_DB_BACKUP=true`.
4. Store the generated `.db` backup outside the Git repository when possible.
5. Deploy the new release. Existing migrations use `CREATE TABLE IF NOT EXISTS` and additive `ALTER TABLE` operations so existing user records are preserved.

## Important

Do not put real user exports, passwords, API keys, bank credentials or payment secrets into Git. The repository contains only this guide and an empty migration directory.
