# UNIQUE BRAVE 2.9.2 — Live Customer Service Routing

This release preserves the existing marketplace, accounts, admin controls and customer-service role. It adds a real support-routing workflow.

## Customer-facing
- Customer Service is visible from the main user menu.
- The Forgot Password / Reset Password page now links directly to Customer Service.
- A logged-in user or a guest can send a support message.
- Each support conversation receives a private support session token so the customer can continue the conversation without exposing account credentials.
- The customer sees whether the conversation is waiting, assigned to Customer Care, or being handled by UNIQUE BRAVE Administration.
- Customers can continue sending messages and receive replies through the same support conversation.

## Administration
- New **Live Customer Service** control in the Admin Centre.
- Admin sees waiting/assigned support conversations.
- Admin sees Customer Care agents and their current online status.
- Admin can select an available online Customer Care agent.
- Admin can instead select **UNIQUE BRAVE Administration** and handle the customer personally.
- Admin can open, reply to and close any support conversation.
- Assignment and support actions are audited.

## Customer Care agents
- Existing Customer Care staff role is retained.
- Customer Care workspace reports online presence while the agent is active.
- Agents see only conversations assigned to them.
- Agents can reply and close their assigned conversations.
- Customers receive a notification when an agent is selected or replies.

## Persistence
- New migration: `009_live_customer_service.js`.
- Existing customer requests, advisor messages, admin chat and marketplace chat are preserved; this is an additive live-support layer.
