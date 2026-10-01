# UNIQUE BRAVE CMD — Visual & Marketplace Release

This release is an additive visual upgrade to the existing UNIQUE BRAVE 2.9.3 application.

## Preserved
- Existing Express/SQLite architecture
- Existing authentication/session layer
- Existing marketplace/product/service routes
- Existing invoice/receipt and records systems
- Existing admin/customer-care systems
- Existing plans/entitlement layer
- Existing BRAVE CMD identity/advertising layer

## Updated
- Rebuilt the public home experience without replacing the backend.
- Strong UNIQUE BRAVE visual identity using the BRAVE lion, dark-violet/gold palette, structured cards and responsive layouts.
- Popular on BRAVE now consumes the real `/api/marketplace/popular` feed so sponsored and organic listings are shown from live data.
- Paid adverts are visibly marked as PAID ADVERT; member listings are visibly marked MEMBER; official listings are marked BRAVE OFFICIAL.
- Member discovery messaging explicitly keeps organic discovery available to members without paid advertising.
- Logged-in users can see their server-generated BRAVE Reference Number and BRAVE Serial Number on the home page and open/copy their public BRAVE page.
- Social metadata is retained on public profile routes for rich link previews.

## Verification
- `node --check index.js` passed.
- `node --check public/app.js` passed.
- The visual page uses real API routes and does not seed fake front-end listings.
