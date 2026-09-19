# UNIQUE BRAVE Release & Data Safety

## Release rule
This release is additive. Existing production user records must never be replaced with a development database during deployment.

## Keep these separate
- GitHub: application source code only.
- Production database: the live SQLite database configured by `BRAVE_DB_PATH`.
- Storage: uploaded/user media and other files.
- Render environment variables: secrets and deployment configuration.

## Deployment safety
1. Deploy the application code without deleting or replacing the production database.
2. Keep `BRAVE_DB_PATH` pointed at the persistent production database location.
3. Do not commit `.env` or `backend/brave.db` to GitHub.
4. Do not run `DROP TABLE`, destructive database resets, or replace the production DB with a local DB.
5. Database schema changes must use additive, migration-safe changes.
6. Test changes against a copy/staging database before production when a database migration is needed.
7. Keep a recoverable backup before major migrations.

## Important Render note
SQLite only persists across redeploys/restarts when its database directory is on persistent storage. If the current Render service uses ephemeral storage, configure durable production storage before treating the deployment as permanently data-safe. Do not upload a local development `brave.db` as a replacement for the live database.

## Included in this release
- Existing UNIQUE BRAVE application source and public assets.
- SQLite schema/code with migration-safe initialization.
- Authentication, marketplace, services, timeline, profiles, workshop, admin and supporting features present in the supplied release.
- `.env.example` for configuration; real `.env` secrets are intentionally excluded.

## Before going live
Run the application health check at `/api/status`, verify login/register and existing records, then deploy the code while preserving the live database and storage.
