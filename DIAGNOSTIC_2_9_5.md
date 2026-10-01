# UNIQUE BRAVE 2.9.5 Diagnostic Report

## Source
Built as a targeted upgrade of `UNIQUE_BRAVE_2_9_4_MENU_ADMIN_FIXED_FROM_LAST_BUILD.zip`.

## Static checks completed
- `node --check` passed for every JavaScript file in the project.
- `node --check` passed for every inline JavaScript block in public HTML pages.
- All migration modules, including `010_brave_catalog_expansion.js`, loaded successfully with Node's module parser.
- ZIP/source structure inspected before modification.
- Workshop inline JavaScript audited after the Workshop fixes.
- Registration page audited after adding the international calling-code selector.
- Admin App inline JavaScript audited.
- Existing product/service separation retained.
- Existing persistent user-session database mechanism retained and strengthened with a periodic session health check.
- Persistent admin sessions added to SQLite so the separate Admin App survives refreshes and server restarts until expiry/logout.

## Functional changes included
- Separate Admin App at `/admin-app.html`, using the same Express/SQLite backend.
- Persistent administrator sessions with explicit logout invalidation.
- Admin control-center metrics, private user-contact view, plan editor and delivery-price editor.
- Default delivery price is `₦500` for new product listings when no listing-specific delivery price is supplied.
- Existing BRAVE catalogue products with an empty/zero delivery price are normalised to `₦500` by the new migration.
- 237 country/territory calling-code entries on registration.
- Admin-only visibility of user phone, email, BRAVE registration reference and BRAVE serial.
- Public profiles expose email only from the requested contact fields; phone remains private.
- Added Speak with Admin / Customer Service support requests for ordinary users.
- Added Free Tools & Opportunities, Jobs & Gigs, and Learn & Skills sections.
- Expanded catalogue with additional products and services while retaining admin ownership/control.
- Broader simple-language, Nigerian wording, synonym and business-intent AI normalization.
- Workshop fixes: corrected saturation calculation, added square crop, image text overlay, active-canvas export selection, character-image storage, and browser-supported trimmed-video export.
- Existing receipts/invoices, marketplace, authentication, storage, customer service, legacy admin centre and other working systems were left in place.

## Session requirement
The user-session system already stored session hashes in SQLite. 2.9.5 keeps that architecture and adds a periodic `/api/session/check` heartbeat. Remembered sessions are extended before expiry by the existing backend logic. Multiple simultaneous browser sessions are not deleted when another browser logs in. Explicit logout deletes only the current token.

## Live-test limitation
A full Express/browser integration test could not be completed in this build environment because the npm registry dependency installation did not finish successfully within the execution window; the offline cache also lacked at least one required package archive. Therefore this report does **not** claim a live browser test that did not occur.

Local final verification command:

```text
npm install
npm start
```

Then verify:
1. user login -> refresh -> second tab -> second browser -> logout one browser -> other browser remains signed in;
2. admin login -> `/admin-app.html` -> refresh -> restart server -> session still valid -> logout;
3. registration with several country calling codes;
4. product creation without delivery price -> default ₦500;
5. admin changes default delivery price -> new product uses new default;
6. admin edits plans;
7. public profile shows email but not phone;
8. admin user list shows email, phone, reference and serial;
9. Products and Services open separately;
10. Workshop image, layout, video, audio, character, documents and saved-project flows.
