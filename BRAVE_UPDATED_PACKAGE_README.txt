UNIQUE BRAVE UPDATED PACKAGE
============================

This package adds the requested BRAVE features while preserving the existing project architecture.

ADDED / UPDATED
1. Large BRAVE lion branding on the homepage/dashboard/admin header.
2. BRAVE Workshop section for design, photo/video and document workflows.
3. User Records & Money Diary with local user records and a backend records endpoint.
4. Mobile menu that opens the BRAVE logo and full function names instead of icons only.
5. General BRAVE FAQ knowledge for common questions, in addition to marketplace/product searches.
6. Account creation requires accepting Terms & Conditions.
7. Login requires accepting Terms & Conditions.
8. Login has a clear "I need to reset my password" checkbox.
9. Admin Transactions & Receipts area.
10. Admin refund-request review area.
11. Receipt verification states: pending / verified / rejected.
12. Refund states: pending / approved / rejected / completed.
13. Bank screenshots are NOT automatically treated as verified payments.
14. Existing admin user/product/service/timeline/report/AI/activity tools remain in place.

IMPORTANT
- The .env file is intentionally NOT included in this ZIP. Keep your existing .env file.
- node_modules and .git are intentionally NOT included. Your existing Git repository should remain in place.
- Do not delete your existing backend data files before updating.
- After extracting these files into your existing BRAVE INTERFACE folder, run:
    npm install
  if dependencies are missing.
- Then run brave-save.bat to add, commit and push to GitHub.
- Render can then deploy the pushed main branch if Auto Deploy is enabled.

PAYMENT VERIFICATION NOTE
The new receipt/admin workflow provides the structure for verification. Real bank/payment confirmation should later be connected to the payment provider's API/webhook. A user-uploaded screenshot alone must not mark a transaction as verified.

TEST
Node syntax for index.js and backend/server.js has been checked.
Inline JavaScript in the key HTML pages has also been syntax checked.
