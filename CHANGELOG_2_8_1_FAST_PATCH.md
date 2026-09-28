# UNIQUE BRAVE 2.8.1 Fast Patch

- Fixed logo rendering by using a real PNG logo at `/images/brave-logo.png` instead of the broken protocol-relative logo path/SVG composition.
- Replaced marketplace/login/dashboard/home logo references with the real image path.
- Added explicit client-side ownership checks before edit/remove actions in the private dashboard.
- Existing server-side ownership enforcement remains in place: non-admin users can only edit/stock/delete listings whose `owner_id` matches their authenticated BRAVE account.
- BRAVE Admin retains marketplace moderation/editing authority.
- `.env` remains excluded from the release ZIP; keep production secrets out of GitHub.
