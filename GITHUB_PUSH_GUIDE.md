# UNIQUE BRAVE — Beginner GitHub Push Guide

This is an in-place upgrade. Do not delete the repository or start a new project.

## 1. Back up the current project
Keep the previous ZIP somewhere safe before replacing files.

## 2. Open CMD/PowerShell in the GitHub repository

```text
cd path\to\brave-hub
git status
```

## 3. Replace the repository files with the upgraded project
Copy the contents of this ZIP into your existing `brave-hub` folder. Do **not** copy `.env`, `backend/brave.db`, `backend/*.db-wal` or `backend/*.db-shm` from a local runtime.

## 4. Check the changes

```text
git status
git diff --stat
git diff --check
```

## 5. Install dependencies

```text
npm install
```

## 6. Test locally

```text
npm start
```

Open `http://localhost:3000/`.

## 7. Commit

```text
git add .
git commit -m "Upgrade Unique BRAVE marketplace, workshop and admin chat"
```

## 8. Push

```text
git push origin main
```

If your branch is not `main`, run `git branch --show-current` and use that branch name.

## 9. Render
Render should rebuild from GitHub. Set/update the environment variables from `.env.example` in the Render dashboard. Never put real passwords or SMTP/Twilio secrets in GitHub.

## Important Render variables

- `PUBLIC_BASE_URL=https://brave-hub.onrender.com`
- `APP_URL=https://brave-hub.onrender.com`
- `SMTP_HOST=smtp.gmail.com`
- `SMTP_PORT=587`
- `SMTP_SECURE=false`
- `SMTP_USER=your-email`
- `SMTP_PASS=your-gmail-app-password`
- `SMTP_FROM=UNIQUE BRAVE <your-email>`
- `ADMIN_EMAIL=your-admin-email`
- `ADMIN_PASSWORD=your-admin-password`
- `ADMIN_CHAT_TIMEOUT_MINUTES=30`
- `BRAVE_DB_PATH=/var/data/brave.db` if your Render service has a persistent disk mounted at `/var/data`.
