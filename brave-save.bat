@echo off
setlocal
echo ==============================
echo      UNIQUE BRAVE SAVE
echo ==============================

git add .
git diff --cached --quiet
if %errorlevel%==0 (
  echo No new changes to commit.
) else (
  git commit -m "Update Unique BRAVE marketplace, admin and user tools"
)

git push origin main

if %errorlevel%==0 (
  echo.
  echo ==============================
  echo   GITHUB PUSH SUCCESSFUL
  echo   Render should auto-deploy
  echo ==============================
) else (
  echo.
  echo GitHub push failed. Check your GitHub login/remote.
)
echo.
pause
endlocal
