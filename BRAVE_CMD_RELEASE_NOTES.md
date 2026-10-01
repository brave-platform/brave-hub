# UNIQUE BRAVE — BRAVE CMD Upgrade

This is an additive upgrade of the supplied UNIQUE BRAVE 2.9.3 project. Working architecture and existing marketplace/business systems are preserved.

## Completed upgrade areas

- Stable UNIQUE BRAVE Reference Number and Serial Number for every account.
- Branded public BRAVE pages with reference/serial identity and real share actions.
- Server-rendered Open Graph/Twitter metadata for `/u/:username`, allowing WhatsApp and other social platforms to generate a rich BRAVE link preview.
- Popular on BRAVE section with member listings, BRAVE listings and clearly marked paid adverts.
- Paid advertising workflow: member submits an advert request for an owned listing; payment reference is recorded; admin activates/rejects/stops the advert; active adverts appear in Popular on BRAVE.
- Organic member listings remain eligible for marketplace discovery; paid promotion does not make member listings disappear.
- Server-side active-listing limits based on the user's active plan.
- Plan-limit response is surfaced in the existing frontend with a real View Plans action.
- Multi-tab session restoration is hardened so session bootstrap no longer invalidates the same account token used by another tab.
- In-memory sessions are checked against persistent expiry instead of bypassing expiry.
- Additive BRAVE CMD design layer with a distinctive BRAVE visual system.
- BRAVE CMD command center at `/cmd` using existing functional pages and workflows.

## Preservation rule

No working invoice/receipt, authentication, marketplace, admin, customer-care, workshop or database architecture was intentionally replaced by this upgrade.
