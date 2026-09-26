# Local Test Build Changes

Base project: UNIQUE_BRAVE_2_5_CHAT_MARKETPLACE_COMPLETE.zip

## Account persistence
- Added `/api/session/bootstrap` to recover a valid server session after browser storage loss/staleness.
- Session bootstrap rotates the session token, persists it server-side, refreshes the HttpOnly cookie and restores the frontend session state.
- Existing `user_sessions` database architecture is preserved.

## User migration protection
- Added `backend/migrations/002_user_data_protection.js`.
- Added protected migration/backup metadata.
- Existing encrypted `user_storage` snapshots remain supported.
- `backend/storage_service.js` now also maintains an encrypted per-user snapshot under `storage/migrated/users/`.
- Snapshots intentionally exclude passwords/password hashes, session tokens, OTPs and API secrets.

## Safety
- No production secrets were added.
- No real user password was copied into migration files.
- Existing project files were preserved rather than replaced.
