# UNIQUE BRAVE 2.9.3 — Email Reset & Customer Care Manual Reset

## Email reset improvements
- Resend sender is now explicitly required in production.
- Production blocks the unsafe `onboarding@resend.dev` fallback instead of pretending a production reset email is configured.
- Reset emails now include both HTML and plain-text content.
- Reset email includes a visible fallback URL as well as the button.
- Optional `RESEND_REPLY_TO` is supported.
- Resend idempotency keys prevent accidental duplicate reset emails during retries.
- Reset creation is centralized so self-service, Admin and Customer Care use the same 30-minute, single-use token flow.

## Manual Customer Care reset
- Admin can continue to send a manual reset email from Admin Centre.
- Assigned Customer Care agents can now send a fresh reset email from the customer's support conversation.
- The Customer Care action is restricted to active `customer_service` staff and the assigned conversation.
- Manual reset actions are audited.
- Customers receive a support notification when Customer Care issues a reset.

## Important deployment requirement
Code improvements cannot bypass Gmail/recipient filtering. For production, set `RESEND_FROM` to an address on a domain that is verified in Resend. Resend's API accepts the message, while delivery/bounce is determined afterward by recipient providers.
