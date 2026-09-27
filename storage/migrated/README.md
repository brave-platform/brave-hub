# BRAVE migrated storage

This folder is reserved for encrypted user migration snapshots and database backups.

- `users/` contains encrypted `.brave.enc` user snapshots only.
- `database/` contains database migration/backup copies when enabled.
- Passwords, OTPs and raw session secrets are never written here.

Set `BRAVE_MIGRATED_DIR` to relocate this folder in production if needed.
