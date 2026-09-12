@echo off
echo ==============================
echo        BRAVE SAVE
echo ==============================

git add .

git commit -m "Update BRAVE website"

git push origin main

echo.
echo ==============================
echo       BRAVE SAVE COMPLETE
echo ==============================
pause