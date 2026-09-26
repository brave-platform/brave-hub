

# 0A. PROJECT BOUNDARY — UNIQUE BRAVE MARKETPLACE

UNIQUE BRAVE Marketplace is a standalone marketplace and personal-business platform.

The following are separate projects and must NOT be merged into this marketplace build:
- BRAVE World / football games
- AYO AI / AI video-generation and video-production application

Do not add game menus, football squad systems, game matches, or AI-video-generation workspaces to UNIQUE BRAVE Marketplace.

UNIQUE BRAVE Marketplace may contain its own BRAVE AI assistant for marketplace/business guidance and its own Creative Studio for user-created business graphics/designs. These are marketplace/business tools, not the separate AI video-generation project.

The marketplace may use interaction patterns familiar to users of major social, fintech and marketplace products (for example social feeds, wallet-style information cards, professional business dashboards and marketplace discovery), but the implementation must remain UNIQUE BRAVE's own interface and identity.

# 0B. PERSONAL BUSINESS PLATFORM

Every ordinary user receives a private business workspace connected to their own account.

User-owned actions must be scoped to the authenticated account:
- Own products
- Own services
- Own customers
- Own records
- Own receipts
- Own messages
- Own saved listings
- Own creative designs
- Own profile
- Own business information

Users must not be able to edit another user's listings, designs, records or private account information by changing an ID in the browser.

The administrator has separate protected controls for platform-wide moderation, user support, marketplace management, security, operational maintenance and approved administrative actions.

# 0C. ADMIN OPERATIONAL CONTROL

The administrator must have a direct Platform Command Centre for:
- Database health checks
- Migration visibility
- Protected database backup
- Expired-session cleanup
- Database maintenance/reindex
- User-to-user marketplace chat oversight
- BRAVE AI conversation oversight
- Direct admin response to users
- Existing user/order/listing/report/security management

These operational tools must not require an AI service or require the administrator to upload the project files to another service for routine platform maintenance.
# UNIQUE BRAVE

## FINAL COMPLETE MASTER DEVELOPMENT SPECIFICATION

### MASTER INSTRUCTION

You are working on an **existing project**, not creating a new project from scratch.

The project is called:

# UNIQUE BRAVE

Former/internal name: BRAVE
Current repository/deployment identity may still contain `brave-hub`.

The most important instruction is:

> **DO NOT START OVER. DO NOT REBUILD THE PROJECT FROM SCRATCH. DO NOT DELETE WORKING FEATURES. INSPECT THE EXISTING PROJECT FIRST, THEN UPGRADE IT.**

The existing project contains working functionality and previous development work.

Your job is to:

**Inspect → Understand → Preserve → Fix → Connect → Upgrade → Test → Deploy**

Do not replace working architecture simply because another architecture looks cleaner.

Do not remove existing features.

Do not downgrade existing functionality.

Do not create fake UI that pretends something works when the backend does not support it.

Do not hard-code data where database/API functionality is required.

If something is already working, preserve it and improve it.

---

# 1. PRODUCT VISION

UNIQUE BRAVE is intended to become a Nigerian/African digital ecosystem.

It is much more than a normal marketplace.

The long-term journey is:

# FIND → CONNECT → BUY → SELL → HIRE → WORK → KEEP RECORDS → GROW

The platform should connect:

- Buyers
- Sellers
- Service providers
- Professionals
- Businesses
- Customers
- Creators
- Staff
- Administrators

Core areas:

- Marketplace
- Products
- Services
- Profiles
- Business pages
- Local discovery
- Social-style timeline
- Messaging
- Reviews
- Verification
- Transactions
- Invoices
- Receipts
- Business records
- Advertising
- Featured listings
- Customer Care
- Human Advisor
- BRAVE BOT
- Creator Workshop
- AI generation
- Future mobile app
- Future payment/wallet infrastructure
- Subscription plans

The platform should feel like a real product that can grow into a large ecosystem.

---

# 2. EXISTING PROJECT MUST BE INSPECTED FIRST

Before changing anything, inspect:

- Entire directory structure
- `package.json`
- Backend
- Frontend
- Database
- Database schema
- Routes
- APIs
- Authentication
- Admin authentication
- Sessions
- Password reset
- Phone verification
- Marketplace
- Profiles
- Dashboard
- Admin dashboard
- Messaging
- Transactions
- Invoices
- Receipts
- Workshop
- Uploads
- Settings
- `.env.example`
- `.gitignore`
- `render.yaml`
- README
- Existing assets
- Existing images
- Existing scripts
- Existing deployment configuration

Identify:

### Already working

### Partially working

### Broken

### Missing

### Placeholder only

Then upgrade the existing implementation.

Do not assume something is missing just because its implementation is unfamiliar.

---

# 3. DATA SAFETY

Never destroy existing user/project data simply to implement a feature.

Before database changes:

1. Inspect current schema.
2. Create a safe migration.
3. Preserve existing records.
4. Add missing columns/tables safely.
5. Test migration.
6. Verify old functionality.

Never solve schema problems by casually deleting the database.

If a new field such as:

`terms_accepted_at`

is required, migrate the existing schema safely.

---

# 4. TECHNOLOGY PRINCIPLES

Preserve the existing working stack unless there is a genuine technical reason to change it.

Existing architecture may include:

- Node.js
- Express
- CommonJS
- SQLite
- better-sqlite3
- bcrypt
- dotenv
- Twilio
- CORS
- HTML/CSS/JavaScript frontend

Do not replace SQLite unnecessarily.

Do not replace Express unnecessarily.

Do not introduce dozens of unnecessary dependencies.

Use modular, maintainable code.

---

# 5. BRAND

Brand:

# UNIQUE BRAVE

The name should feel distinctive while retaining BRAVE.

Visual identity:

- Purple
- Gold/yellow
- White
- Strong contrast
- Modern
- Bold
- Clean
- Spacious
- Friendly
- Professional
- Mobile-first

Preferred purple direction can use existing branding around:

- `#32105f`
- `#5b20a8`

Gold/yellow direction:

- `#ffd83d`

Do not make the interface:

- Green-dominant
- Black-dominant
- Blue-heavy
- Tiny
- Cluttered

Use the existing lion:

`public/images/brave-lion.png`

The lion should be prominent on appropriate pages.

---

# 6. MOBILE-FIRST DESIGN

The website must work extremely well on:

- Android
- Small phones
- Samsung devices
- Tablets
- Desktop
- Different screen sizes

The current interface must not feel tiny on phones.

Use:

- Large buttons
- Large touch targets
- Clear text
- Good spacing
- Responsive cards
- Mobile navigation
- Bottom navigation where appropriate
- Three-dot/more menu
- Collapsible menus

Navigation should use:

**ICON + TEXT**

not icon-only navigation.

The experience should be easy for someone who is not technically experienced.

---

# 7. PUBLIC HOMEPAGE

The homepage is the first public page.

Do not redirect ordinary visitors straight to a dashboard.

Homepage should contain:

- UNIQUE BRAVE logo
- Lion
- Search
- Login
- Join UNIQUE BRAVE
- Marketplace entry
- Products
- Services
- Local discovery
- Featured content
- Popular products
- Popular services
- Business/professional discovery
- AI assistant
- Customer care access
- Clear platform explanation

Main message:

**Buy. Sell. Find Services. Connect. Grow.**

Search:

**Search products, services, sellers...**

A visitor should understand the platform without registering.

---

# 8. WELCOME / LOADING

Avoid unnecessary black loading screens.

If a loading screen is needed:

- Keep it short
- Use UNIQUE BRAVE branding
- Use lion logo
- Use purple/gold/white
- Fail gracefully
- Do not leave users stuck

---

# 9. ACCOUNT REGISTRATION

Registration must support:

- Full name
- Email
- Phone
- Password
- Location
- Account type

Account types:

### Buyer

### Product/Goods Seller

### Service Provider

Potential future business account types can be added without breaking existing accounts.

Registration must include:

- Terms & Conditions checkbox
- Privacy acknowledgement where appropriate
- Show/hide password
- Validation
- Email validation
- Phone validation
- Duplicate account handling
- Secure password hashing
- Clear errors

Never store plaintext passwords.

---

# 10. LOGIN

Login must support:

**Email OR phone number**

Include:

- Email/phone field
- Password
- Show/hide password
- Remember/easy returning user functionality
- Secure session handling
- Terms acknowledgement where appropriate
- Logout

Most importantly:

### FORGOT PASSWORD / RESET PASSWORD

must be clearly visible on the login page.

If `forgot-password.html` already exists, connect the login page to it rather than creating an unnecessary duplicate system.

---

# 11. PASSWORD RECOVERY

Support:

- Forgot password
- Email recovery
- Phone recovery where configured
- Secure reset token
- OTP where applicable
- Expiration
- New password
- Password confirmation
- Success/error handling

Never expose sensitive account data.

Do not falsely tell a user that an email/SMS was sent if the provider failed.

---

# 12. PHONE VERIFICATION

If Twilio already exists, preserve it.

Support:

- OTP
- OTP expiration
- Resend limits
- Phone verification
- Phone change
- Previous phone verification where required
- New phone verification
- Verified/unverified state

Never expose OTPs in production logs.

Twilio credentials must remain in `.env`.

---

# 13. USER PROFILE

Profiles should support:

- Profile photo
- Name
- Username/public identifier
- Account type
- Location
- Verification badge
- Rating
- Reviews
- About
- Products
- Services
- Portfolio
- Contact/message button

Users can edit permitted profile fields.

Private information must remain protected.

---

# 14. PUBLIC BUSINESS / PROFESSIONAL PAGE

Sellers/providers should be able to create useful public pages.

A public page can include:

- Business/professional name
- Logo/photo
- Description
- Location
- Products
- Services
- Portfolio
- Reviews
- Rating
- Verification
- Contact
- Message
- Availability
- Business information

Pages should eventually have shareable URLs.

Example concept:

`/business/name`

or equivalent.

---

# 15. MARKETPLACE

The marketplace must be database-driven.

It must NOT simply contain a few hard-coded cards.

Users should be able to:

- Browse
- Search
- Filter
- View
- Open
- Share
- Message
- Review
- Report
- Save/favourite where implemented

Marketplace must contain:

## PRODUCTS

Examples:

- Phones
- Laptops
- Electronics
- Chargers
- Earphones
- Clothing
- Shoes
- Bags
- Food
- Furniture
- Beauty products
- Agriculture
- Building materials
- Books
- Office supplies
- Household goods

## SERVICES

Examples:

- Graphic design
- Web development
- Photography
- Video editing
- Writing
- Tailoring
- Hairdressing
- Cleaning
- Repairs
- Tutoring
- Digital services
- Transportation
- Events
- Beauty
- Professional services

---

# 16. PRODUCT LISTINGS

Product fields:

- Product name
- Description
- Price
- Promotional price
- Category
- Subcategory
- Stock
- Availability
- Location
- Seller
- Images
- Video
- PDF
- Rating
- Verification
- Date
- Status
- Featured status
- Moderation status

Media must be optional.

Seller may upload:

- Image
- Video
- PDF

or none, where appropriate.

Do not force every media type.

---

# 17. SERVICE LISTINGS

Service fields:

- Service name
- Description
- Price/rate
- Pricing type
- Category
- Location
- Provider
- Images
- Video
- PDF/portfolio
- Availability
- Rating
- Verification
- Contact
- Message
- Status

Products and services must remain clearly distinguishable.

---

# 18. MEDIA UPLOADS

Support actual uploads:

- Images
- Videos
- PDFs

Do not make URL pasting the primary workflow.

Validate:

- File type
- File size
- File name
- Storage
- Security
- Upload errors

Never allow dangerous executable uploads.

---

# 19. MARKETPLACE SEARCH

Search:

- Products
- Services
- Sellers
- Providers
- Businesses
- Categories
- Locations

Filters:

- Category
- Product/service
- Location
- Price
- Availability
- Rating
- Verified
- Featured

Location:

**State → City → Locality**

Nigeria must be supported properly.

---

# 20. MARKETPLACE LOCATION DISCOVERY

Support Nigerian locations such as:

- States
- Cities
- Localities

Listings can have location tags.

Do not expose private residential addresses unnecessarily.

---

# 21. MARKETPLACE RANKING

Possible ranking signals:

- Relevance
- Availability
- Verified status
- Quality
- Rating
- Recency
- Featured status
- Location

Verified/featured listings may receive better visibility.

However:

**Unverified listings should remain visible unless moderation/safety rules require removal.**

Never falsely display a verification badge.

---

# 22. SOCIAL TIMELINE

UNIQUE BRAVE should also have a social-style discovery timeline.

It should not be only a marketplace.

Timeline can contain:

- Posts
- Product posts
- Service posts
- Business updates
- Photos
- Videos
- Announcements
- Shared listings

Possible actions:

- Like/react
- Comment
- Share
- Save
- Report
- Open profile
- Open listing

Do not copy Facebook branding.

---

# 23. MESSAGING

Build real messaging.

Users can:

- Message sellers
- Message providers
- Continue conversations
- View history
- Receive notifications
- Report conversations

Possible future features:

- Attachments
- Read status
- Unread count
- Block
- Report
- Search conversations

Do not expose private messages to unauthorized users.

---

# 24. TRANSACTIONS

Transaction structure should support:

- Buyer
- Seller/provider
- Listing
- Amount
- Currency
- Reference
- Status
- Date
- Notes
- Evidence

Statuses:

- Pending
- Confirmed
- Processing
- Completed
- Cancelled
- Disputed

Never mark a transaction as completed without valid confirmation.

---

# 25. CART / ORDER SYSTEM

Where applicable, support:

- Add to cart
- Remove from cart
- Quantity
- Price calculation
- Order creation
- Order history
- Seller order management
- Buyer order management
- Status tracking

Do not create fake payment success.

---

# 26. DELIVERY / FULFILMENT

Prepare architecture for:

- Delivery
- Pickup
- Seller fulfilment
- Delivery status
- Delivery notes

Future logistics providers can be integrated later.

Do not claim live delivery tracking without an actual provider.

---

# 27. WALLET

Initial wallet can safely say:

**Wallet — Coming Soon**

Do not create fake balances.

Do not create fake deposits.

Do not pretend a payment was completed.

Future wallet architecture must use secure payment infrastructure.

---

# 28. PAYMENTS

Prepare for proper payment integration.

Potential future providers may include appropriate Nigerian payment processors.

Payment architecture must support:

- Payment initialization
- Payment reference
- Callback/webhook
- Verification
- Failed payment
- Successful payment
- Refund where supported
- Transaction record

Never trust only a frontend “payment successful” message.

Server-side verification is required.

---

# 29. PAYMENT EVIDENCE

Where manual payment verification is used:

User may upload evidence.

Admin can:

- Review
- Approve
- Reject

Important:

**A bank screenshot is evidence, not absolute proof.**

Receipt must not be automatically issued merely because an image was uploaded.

---

# 30. INVOICES

Invoice generated before confirmed payment.

Document format:

**BRV-INV-XXXX**

Invoice should include:

- Unique ID
- Buyer
- Seller/provider
- Items/service
- Amount
- Date
- Status
- Reference

Allow:

- View
- Print
- Download
- Share where safe

---

# 31. RECEIPTS

Receipt generated only after payment confirmation.

Format:

**BRV-REC-XXXX**

Never generate a confirmed receipt for an unverified payment.

---

# 32. DOCUMENT FEE

Existing business model may include:

**₦100 invoice/receipt generation fee**

Prepare architecture for this.

Do not hard-code payment details.

Do not claim payment integration is live unless actually configured.

---

# 33. BUSINESS RECORDS / DIARY

Create a money/business record section.

Support:

- Income
- Expenses
- Sales
- Purchases
- Notes
- Invoices
- Receipts
- Transactions

Users should be able to maintain useful records.

---

# 34. REVIEWS

Reviews should support:

- Rating
- Review
- Reviewer
- Reviewed user/listing
- Date
- Report
- Moderation

Prevent obvious spam/duplicate abuse where possible.

Admin must be able to moderate reviews.

---

# 35. VERIFICATION

Verification states:

- Unverified
- Pending
- Verified
- Suspended
- Revoked

Admin can:

- Review
- Approve
- Reject
- Revoke

Keep verification separate from payment confirmation.

---

# 36. ADS

Admin-controlled advertising.

Advertisement fields:

- Title
- Description
- Image/video
- Destination
- Placement
- Start date
- End date
- Status
- Location/category targeting if supported

Ads must be distinguishable from ordinary listings.

---

# 37. FEATURED LISTINGS

Admin can feature:

- Products
- Services
- Businesses

Include:

- Start date
- End date
- Placement
- Status

Do not hard-code featured content.

---

# 38. SUBSCRIPTION PLANS

Prepare:

### BASIC

Core platform access.

### PREMIUM

Additional business/discovery tools.

### LUXURY

Advanced features/visibility.

The architecture must allow future payment integration.

Do not pretend subscription billing works if it does not.

---

# 39. CUSTOMER CARE

Create a proper customer-support system.

Categories:

- Registration
- Login
- Password
- Phone verification
- Marketplace
- Product
- Service
- Payment
- Transaction
- Invoice
- Receipt
- Review
- Report
- Technical issue
- Account
- Other

Ticket statuses:

**New → Assigned → In Progress → Resolved**

Store:

- User
- Subject
- Category
- Conversation
- Assigned staff
- Status
- Dates
- Resolution

---

# 40. HUMAN ADVISOR

Provide:

**Speak to Human Advisor**

when:

- AI is uncertain
- Issue is sensitive
- Financial issue needs human review
- Account issue requires admin action
- User requests human help

Do not force AI to guess.

---

# 41. BRAVE BOT

BRAVE BOT should behave like a useful normal conversational assistant.

It should answer platform questions about:

- Account
- Marketplace
- Products
- Services
- Search
- Sellers
- Providers
- Verification
- Reviews
- Transactions
- Invoices
- Receipts
- Customer Care
- Platform features
- Basic troubleshooting

Use actual platform data when available.

Never invent:

- Listings
- Prices
- Sellers
- Transactions
- Payment confirmations
- Policies

When uncertain:

**Explain the limitation and direct the user to Customer Care/Human Advisor.**

---

# 42. ADMIN BRAVE BOT

Admin BRAVE BOT can help administrators understand:

- Users
- Listings
- Reports
- Verification
- Reviews
- Transactions
- Support tickets
- System status
- Deployment errors
- Settings

However, it must not secretly execute sensitive actions.

Require explicit confirmation for actions involving:

- User deletion
- Permission changes
- Financial decisions
- Payment approval
- Security changes
- Database deletion
- Destructive operations

---

# 43. ADMIN DASHBOARD

Admin navigation should include:

1. Home
2. Users
3. Marketplace
4. Services
5. Messages
6. Transactions
7. Invoices & Receipts
8. Locations & Tags
9. Analytics
10. Plans
11. Ads
12. Featured Listings
13. Verification
14. Reviews
15. Customer Care
16. Staff/Apprentices
17. BRAVE BOT
18. Safety & Reports
19. Notifications
20. Branding
21. Settings
22. Database & Storage
23. Audit Logs
24. System Health
25. Advanced Settings

Mobile navigation must remain usable.

---

# 44. USER MANAGEMENT

Admin can view appropriate information:

- Name
- Email
- Phone
- Account type
- Registration date
- Status
- Verification
- Last activity where appropriate

Admin must never see plaintext passwords.

Admin may:

- View
- Suspend
- Reactivate
- Verify
- Revoke
- Review reports

---

# 45. ADMIN AUDIT LOGS

Record important administrative events:

- Admin login
- Verification
- Revocation
- Listing moderation
- Ad changes
- Featured changes
- Payment evidence decisions
- Permission changes
- Settings changes

Audit logs must actually be stored.

Do not display fake “audit connected” messages.

---

# 46. STAFF / APPRENTICE

Support staff accounts with limited permissions.

Roles may include:

- Customer Care
- Marketplace Assistant
- Transaction Assistant
- Listing Assistant
- Content Assistant

Admin controls:

- Role
- Permissions
- Active/inactive
- Access scope

Do not automatically grant full administrator access.

---

# 47. SAFETY / REPORTING

Users can report:

- Users
- Products
- Services
- Reviews
- Messages
- Suspicious activity

Admin sees:

- Reporter
- Reported user/item
- Reason
- Date
- Evidence
- Status
- Resolution

AI may assist with detection.

Humans should control important enforcement decisions.

---

# 48. NOTIFICATIONS

Support notifications for:

- Messages
- Verification
- Listings
- Transactions
- Reviews
- Support tickets
- Admin decisions
- Payment verification

Prepare architecture for:

- In-app
- Email
- SMS
- Push notifications

Do not spam users.

---

# 49. SECURITY

Protect:

- Passwords
- Sessions
- Authentication
- Authorization
- Admin routes
- APIs
- Uploads
- Database
- User input
- Secrets

Use:

- bcrypt/secure password hashing
- Prepared SQL statements
- Input validation
- Authorization middleware
- Rate limiting where appropriate
- Secure sessions/tokens
- File validation
- Safe error messages

Protect against common risks such as:

- SQL injection
- XSS
- Unauthorized admin access
- File upload abuse
- Credential exposure
- Session abuse
- Data leakage

---

# 50. SECRETS

Never commit:

- `.env`
- API keys
- Passwords
- SMTP credentials
- Twilio secrets
- Payment secrets
- AI API keys
- Private credentials

`.env.example` contains placeholders only.

---

# 51. DATABASE

Continue using the existing SQLite database if appropriate.

Database should eventually support entities such as:

- users
- sessions
- listings
- products
- services
- media
- profiles
- businesses
- messages
- conversations
- reviews
- ratings
- transactions
- orders
- invoices
- receipts
- payment evidence
- verification
- advertisements
- featured listings
- notifications
- reports
- support tickets
- audit logs
- locations
- plans
- records

Do not create unnecessary duplicate tables if existing structures already support the requirement.

---

# 52. DATABASE MIGRATIONS

Database changes must be safe.

Never:

- Delete the database casually
- Drop tables just to fix errors
- Destroy user records
- Replace existing production data

Use migrations/additive changes.

Back up before destructive migrations.

---

# 53. STORAGE

Media includes:

- Images
- Videos
- PDFs
- Profile pictures
- Business assets
- Creator projects

Inspect the existing storage architecture before changing it.

Remember that some production hosting environments have ephemeral local storage.

Prepare an upgrade path to persistent/object storage.

---

# 54. SEO / PUBLIC SHARING

Public listings/business pages should eventually support:

- Shareable URLs
- Page titles
- Descriptions
- Social preview metadata
- Search-friendly structure

Do not expose private user information through public pages.

---

# 55. ACCESSIBILITY

Support:

- Readable text
- Good contrast
- Labels
- Keyboard navigation where appropriate
- Form accessibility
- Clear errors
- Touch-friendly controls

---

# 56. PERFORMANCE

Optimize for Nigerian mobile users and limited data.

Use:

- Image compression
- Responsive images
- Lazy loading
- Efficient API calls
- Pagination
- Caching where appropriate
- Minimal unnecessary JavaScript
- Efficient database queries

Avoid huge downloads.

---

# 57. ERROR HANDLING

Every major feature must have:

### Loading state

### Empty state

### Success state

### Error state

Avoid:

- Blank pages
- Infinite loading
- Raw stack traces
- Broken buttons
- Fake success
- Silent failure

---

# 58. API QUALITY

Inspect all APIs.

Every API should have:

- Authentication where needed
- Authorization
- Validation
- Database safety
- Error handling
- Consistent responses

Never allow users to access another user's private records by manipulating IDs.

---

# 59. ADMIN AUTHORIZATION

Admin endpoints must use real authorization.

Do not rely only on:

- Hidden buttons
- Frontend checks
- URL obscurity

Backend must verify permissions.

---

# 60. WORKSHOP

Expand the existing Creator Workshop.

It should eventually include:

### DESIGN

- Posters
- Social graphics
- Flyers
- Thumbnails
- Templates

### IMAGE

- Crop
- Resize
- Filters
- Text
- Background tools
- Layers

### VIDEO

- Timeline
- Trim
- Split
- Merge
- Crop
- Text
- Captions
- Transitions
- Speed
- Audio
- Voiceover

### AUDIO

- Import
- Trim
- Volume
- Voiceover
- Audio layers

### CHARACTERS

- Create
- Edit
- Animate

---

# 61. AI GENERATOR

The future AI Creator system should support:

## AI IMAGE

Generate:

- Characters
- Posters
- Backgrounds
- Product visuals
- Creative assets

## AI VIDEO

Generate short videos from descriptions.

## AI AUDIO

Generate appropriate:

- Narration
- Voice
- Sound
- Music/audio where legally permitted

## AI CHARACTERS

Create characters from descriptions.

## AI ANIMATION

Characters can:

- Walk
- Move
- Gesture
- Perform actions
- Animate according to prompts

---

# 62. AI SHORT VIDEOS

User should eventually be able to provide:

- Idea
- Script
- Description
- Characters
- Style
- Duration

System can generate:

- Scenes
- Movement
- Narration
- Captions
- Audio
- Transitions

Then allow manual editing.

---

# 63. MANUAL CREATOR EDITOR

This is mandatory.

The Creator Workshop must NOT depend entirely on AI.

User must be able to:

**Generate → Edit → Combine → Preview → Export**

Manual tools:

- Timeline
- Layers
- Trim
- Split
- Merge
- Crop
- Resize
- Text
- Captions
- Images
- Video
- Audio
- Characters
- Transitions
- Speed
- Volume
- Voiceover
- Undo
- Redo
- Preview
- Export

---

# 64. CREATOR PROJECTS

Allow:

- New project
- Save
- Rename
- Continue later
- Duplicate
- Delete
- Export

Do not lose project data on page refresh.

---

# 65. AI PROVIDER ARCHITECTURE

AI should use an abstraction layer.

Do not tightly couple the entire application to one AI provider.

Allow future providers to be added.

Architecture should support:

- Provider adapters
- API keys
- Usage limits
- Error handling
- Fallbacks
- Generation history
- Costs/usage tracking

The platform should be able to begin with low/no-cost options and upgrade later.

---

# 66. MOBILE APPLICATION

After the website is stable, build the mobile app using the same backend/API architecture where practical.

App should eventually support:

- Login
- Registration
- Marketplace
- Products
- Services
- Search
- Profiles
- Business pages
- Messaging
- Notifications
- Transactions
- Customer Care
- Creator Workshop
- AI tools

Do not create a completely separate database unless there is a genuine reason.

The web and mobile app should use a consistent backend.

---

# 67. APP NOTIFICATION ARCHITECTURE

Prepare for:

- Push notifications
- Messages
- Transactions
- Verification
- Customer care
- Promotions

Do not implement fake notifications.

---

# 68. REALISTIC SAMPLE DATA

Use realistic Nigerian sample marketplace data for demonstration.

Examples:

Products:

- Smartphones
- Laptops
- Chargers
- Earphones
- Clothing
- Shoes
- Bags
- Food
- Furniture
- Electronics
- Accessories

Services:

- Graphic design
- Photography
- Video editing
- Web development
- Tailoring
- Repairs
- Tutoring
- Hairdressing
- Writing
- Digital services

Use realistic indicative ₦ prices.

Clearly mark demo/sample data where it is not from actual sellers.

Do not invent real businesses or imply fake users are real.

---

# 69. MARKETPLACE SCALE

The marketplace must not be artificially limited to five products.

Use database/API pagination.

The architecture must support many listings.

For demonstration, seed a meaningful number of products/services without hard-coding them into HTML.

---

# 70. SEARCH AI

AI can help interpret natural language searches.

Example:

“I need a graphic designer in Lagos.”

Search actual database listings and return relevant results.

Example:

“I need a laptop for school.”

Return actual available listings.

Never invent a listing if the database does not contain one.

---

# 71. CUSTOMER CARE FAQ

BRAVE BOT/customer care should understand common questions such as:

- How do I create an account?
- How do I log in?
- I forgot my password.
- How do I change my phone?
- How do I verify my phone?
- How do I sell a product?
- How do I add a service?
- How do I upload images?
- Can I upload video?
- Can I upload PDF?
- How do I edit a listing?
- How do I remove a listing?
- How do I find a seller?
- How do I contact a seller?
- How do I contact a service provider?
- What does verified mean?
- How do I report a user?
- How do I report a listing?
- How do reviews work?
- How do transactions work?
- How do invoices work?
- How do receipts work?
- What is payment verification?
- What is Wallet?
- How do I contact Customer Care?
- What is BRAVE BOT?
- Why is my listing not visible?
- What are featured listings?
- What are advertisements?
- What are Basic/Premium/Luxury plans?

---

# 72. ADMIN ANALYTICS

Analytics should eventually show:

- Total users
- New users
- Active users
- Sellers
- Providers
- Listings
- Products
- Services
- Messages
- Transactions
- Revenue
- Invoices
- Receipts
- Reports
- Verification
- Ads
- Featured listings
- Popular categories
- Popular locations
- Search activity

Avoid fake numbers.

If there is no data, display zero/empty states.

---

# 73. BUSINESS ANALYTICS

Users/businesses can eventually see:

- Views
- Listing performance
- Messages
- Sales
- Revenue
- Popular products
- Popular services
- Reviews
- Customer activity

Only expose information the user is authorized to see.

---

# 74. ADMIN SYSTEM HEALTH

Show useful system information such as:

- Server status
- Database status
- API status
- Storage status
- Email status
- SMS status
- AI status
- Payment provider status

Clearly distinguish:

**Configured**

from:

**Not configured**

Do not falsely show unavailable services as operational.

---

# 75. ADVANCED ADMIN SETTINGS

Admin settings should eventually include:

### User settings

### Marketplace settings

### Verification

### Reviews

### Ads

### Featured listings

### Customer Care

### AI

### Notifications

### Branding

### Email

### SMS

### Payments

### Storage

### Security

### Maintenance

### Database

### Audit

### System health

Sensitive settings require authorization.

---

# 76. LEGAL / TRUST

Prepare pages/sections for:

- Terms & Conditions
- Privacy Policy
- Community Rules
- Marketplace rules
- Reporting rules
- Payment terms
- Refund/cancellation policy where applicable

Do not invent legal compliance claims.

Where professional/legal review is needed, clearly mark that.

---

# 77. SECURITY / TRUST MESSAGING

Users should be warned appropriately about:

- Suspicious payments
- Fake sellers
- Requests for passwords/OTP
- Off-platform scams
- Fraudulent documents

Never ask users to reveal passwords or OTPs to staff/AI.

---

# 78. DEPLOYMENT

The project must remain deployable to Render.

Check:

- `package.json`
- Start command
- Node version
- PORT
- Environment variables
- Database
- Native dependencies
- Storage
- Build process

Use:

`process.env.PORT || 3000`

Do not hard-code Render's port.

---

# 79. GITHUB

Before pushing:

Check:

- `.env`
- Secrets
- Credentials
- API keys
- Private files
- Unnecessary generated files
- `node_modules`

Use `.gitignore`.

Do not remove important source files simply to make the repository smaller.

---

# 80. RENDER

Verify:

- Server starts
- Database initializes
- Homepage loads
- Authentication works
- Admin works
- APIs work
- Marketplace works
- Uploads work according to storage architecture
- Environment variables are configured
- No production-only crash

---

# 81. TESTING

Test:

## Authentication

- Register
- Login
- Logout
- Forgot password
- Reset password
- Phone verification
- Phone change
- Invalid credentials

## Marketplace

- Browse
- Search
- Filter
- Open listing
- Create listing
- Edit listing
- Delete listing
- Upload media
- Contact seller/provider

## Profiles

- View
- Edit
- Public profile
- Business page

## Messaging

- Create conversation
- Send
- Receive
- Read
- Report

## Transactions

- Create
- Update
- Complete
- Cancel
- Dispute

## Documents

- Invoice
- Payment evidence
- Admin confirmation
- Receipt

## Admin

- Login
- User management
- Verification
- Listings
- Reviews
- Reports
- Ads
- Featured listings
- Staff
- Customer Care
- Audit logs

---

# 82. MOBILE TESTING

Check all important pages on small screens.

Specifically check:

- Homepage
- Login
- Register
- Marketplace
- Listing details
- Profile
- Messages
- Dashboard
- Admin
- Workshop

No:

- Horizontal overflow
- Tiny text
- Buttons outside screen
- Broken menus
- Overlapping cards
- Unusable forms

---

# 83. PERFORMANCE TESTING

Check:

- First page load
- Images
- API response
- Database queries
- Mobile data usage
- Large listings
- Large media uploads

Use pagination rather than loading everything at once.

---

# 84. FAILURE RECOVERY

If an external provider fails:

- Do not crash the entire website.
- Show a useful message.
- Keep unrelated features working.

Examples:

If Twilio fails:

Phone verification should show an appropriate error.

If email fails:

Password reset should show a safe error.

If AI fails:

Workshop should remain accessible.

If payment provider fails:

Do not mark payment completed.

---

# 85. NO FAKE FUNCTIONALITY

Never implement:

- Fake payment success
- Fake verification
- Fake transaction completion
- Fake AI results
- Fake admin actions
- Fake analytics
- Fake notifications
- Fake database storage

If a feature is not connected yet:

Show:

**Coming Soon**

or:

**Not configured**

rather than pretending.

---

# 86. NO UNNECESSARY REWRITES

Do not:

- Replace the entire project
- Rewrite all frontend pages
- Replace backend unnecessarily
- Replace database unnecessarily
- Delete old working features
- Remove existing authentication
- Remove existing admin functionality

Make targeted improvements.

---

# 87. CODE REVIEW

After development:

Inspect the code again.

Look for:

- Duplicate routes
- Broken imports
- Missing dependencies
- Undefined variables
- Incorrect database columns
- Authentication mistakes
- Permission mistakes
- Broken links
- Broken forms
- Console errors
- API errors
- Mobile issues

Fix them before claiming completion.

---

# 88. DATABASE REVIEW

Confirm:

- Database opens
- Tables exist
- Existing records remain
- New fields work
- Foreign keys/relationships are sensible
- Queries work
- No accidental data deletion

---

# 89. SECURITY REVIEW

Confirm:

- Passwords hashed
- Secrets excluded
- Admin protected
- User data protected
- Uploads validated
- SQL safe
- Sessions secure
- Unauthorized APIs blocked

---

# 90. DEPLOYMENT REVIEW

Confirm:

- GitHub contains correct source
- No secrets
- Render starts
- Port is correct
- Environment variables documented
- Database works
- Homepage loads
- Authentication works
- Admin works
- Marketplace works

---

# 91. README

Update README with:

- What UNIQUE BRAVE is
- Technology
- Setup
- Environment variables
- Local development
- Database
- Deployment
- Admin setup
- Feature overview
- Known limitations
- Future roadmap

Do not expose secrets.

---

# 92. ENV EXAMPLE

Provide `.env.example`.

Use placeholders such as:

`PORT=3000`

`DATABASE_PATH=./backend/brave.db`

and appropriate placeholders for:

- SMTP
- Twilio
- AI
- Payments
- Storage
- Session/security

Never place real credentials inside `.env.example`.

---

# 93. PROJECT ROADMAP

The development order should be:

## PHASE 1 — WEBSITE FOUNDATION

Complete and stabilize:

- Homepage
- Authentication
- Profiles
- Marketplace
- Services
- Database
- Admin

## PHASE 2 — BUSINESS PLATFORM

Add/finalize:

- Messaging
- Transactions
- Invoices
- Receipts
- Records
- Verification
- Ads
- Featured listings
- Customer Care

## PHASE 3 — MOBILE APP

Build:

- Android/iOS
- Shared backend
- Authentication
- Marketplace
- Profiles
- Messaging
- Notifications

## PHASE 4 — CREATOR WORKSHOP

Build:

- Design tools
- Image editing
- Video editing
- Audio
- Timeline
- Manual editing

## PHASE 5 — AI GENERATOR

Add:

- AI image
- AI video
- AI audio
- Characters
- Animation
- Automatic short-video generation

## PHASE 6 — ADVANCED INFRASTRUCTURE

Later:

- Wallet
- Payment infrastructure
- Subscriptions
- Advanced storage
- Scaling
- Advanced AI
- Larger production infrastructure

Do not rush expensive infrastructure before the foundation is stable.

---

# 94. CURRENT RESOURCE CONSTRAINT

The project owner currently has limited funds.

Therefore:

- Prefer low-cost/free development tools where practical.
- Avoid unnecessary paid APIs.
- Design AI architecture so providers can be upgraded later.
- Do not require expensive infrastructure for basic platform operation.
- Do not create unnecessary monthly costs.
- Keep the application usable without optional paid services where possible.

---

# 95. FUTURE SCALABILITY

The architecture should be capable of eventually supporting:

- More users
- More listings
- More messages
- More businesses
- More media
- Mobile applications
- AI generation
- Payment systems
- Creator projects

Do not prematurely over-engineer the project.

Build a stable foundation first.

---

# 96. PROJECT PHILOSOPHY

UNIQUE BRAVE should be:

### Useful

People can actually use it.

### Safe

User data and transactions are protected.

### Simple

Beginners can understand it.

### Mobile-first

Phones are treated as a primary platform.

### Scalable

The architecture can grow.

### Honest

No fake functionality.

### Local

Nigeria/Africa is considered from the beginning.

### Inclusive

Products, services, professionals and businesses all have a place.

### Creative

The future Creator Workshop and AI tools are part of the ecosystem.

---

# 97. FINAL QUALITY STANDARD

Before declaring the project complete, ask:

### Can a new person visit the homepage and understand UNIQUE BRAVE?

### Can they register?

### Can they log in?

### Can they recover their account?

### Can sellers list products?

### Can service providers list services?

### Can users search?

### Can users find businesses?

### Can users message each other?

### Can users review/report?

### Can transactions be recorded?

### Can invoices be generated?

### Are receipts only generated after payment confirmation?

### Can admins manage users?

### Can admins verify users?

### Can admins manage listings?

### Can admins manage ads?

### Can admins manage reports?

### Can staff work with limited permissions?

### Can customers contact support?

### Can BRAVE BOT provide useful answers without hallucinating?

### Can the platform work on mobile?

### Is the database safe?

### Are passwords protected?

### Are secrets protected?

### Can it deploy to Render?

### Can the system grow into an app?

### Can the Creator Workshop eventually support AI + manual editing?

If any answer is no, identify it clearly and fix it where it belongs in the existing architecture.

---

# 98. FINAL REPORT REQUIREMENT

When you finish the work, provide a structured report:

## COMPLETED

List everything genuinely working.

## FIXED

List bugs that were repaired.

## CONNECTED

List previously disconnected frontend/backend/database features.

## ADDED

List genuinely new features.

## DATABASE

Explain schema/migration changes.

## SECURITY

Explain security improvements.

## ADMIN

Explain admin functionality.

## MARKETPLACE

Explain marketplace functionality.

## CUSTOMER CARE

Explain support functionality.

## AI

Explain current AI functionality.

## CREATOR WORKSHOP

Explain current/manual/AI capabilities.

## MOBILE APP

Explain what is ready and what remains.

## DEPLOYMENT

Explain GitHub/Render status.

## COMING SOON

Only put genuinely unfinished features here.

Never claim unfinished work is complete.

---

# 99. ABSOLUTE RULES

Remember these above everything else:

1. **DO NOT START OVER.**
2. **INSPECT FIRST.**
3. **PRESERVE WORKING FEATURES.**
4. **DO NOT DELETE THE DATABASE TO SOLVE PROBLEMS.**
5. **DO NOT DELETE WORKING FILES.**
6. **DO NOT REPLACE THE ARCHITECTURE WITHOUT A REAL REASON.**
7. **DO NOT CREATE FAKE FUNCTIONALITY.**
8. **DO NOT HARD-CODE WHAT SHOULD COME FROM THE DATABASE.**
9. **DO NOT STORE PLAINTEXT PASSWORDS.**
10. **DO NOT COMMIT SECRETS.**
11. **DO NOT PRETEND PAYMENTS ARE CONFIRMED.**
12. **DO NOT PRETEND AI GENERATED SOMETHING IF IT DID NOT.**
13. **DO NOT GIVE STAFF UNNECESSARY ADMIN POWER.**
14. **DO NOT EXPOSE PRIVATE USER INFORMATION.**
15. **DO NOT REMOVE UNVERIFIED LISTINGS JUST BECAUSE THEY ARE UNVERIFIED.**
16. **DO NOT BREAK MOBILE RESPONSIVENESS.**
17. **DO NOT REMOVE EXISTING WORKING AUTHENTICATION.**
18. **DO NOT REPLACE SQLITE WITHOUT NECESSARY REASON.**
19. **DO NOT CLAIM A FEATURE IS COMPLETE WHEN IT IS ONLY A UI PLACEHOLDER.**
20. **TEST BEFORE DECLARING COMPLETION.**

---

# 100. FINAL OBJECTIVE

The final result should be a genuine, maintainable, secure and expandable:

# UNIQUE BRAVE

ecosystem.

It should connect:

**PEOPLE**

with

**PRODUCTS**

**SERVICES**

**BUSINESSES**

**PROFESSIONALS**

**MESSAGING**

**TRANSACTIONS**

**RECORDS**

**CUSTOMER CARE**

**AI**

and eventually:

**CREATIVE TOOLS + MOBILE APP + ADVANCED PAYMENT INFRASTRUCTURE**

The existing project is the foundation.

**Do not throw it away.**

Inspect it.

Preserve it.

Repair it.

Connect it.

Upgrade it.

Test it.

Then deploy it.

# UNIQUE BRAVE

## FIND. CONNECT. BUY. SELL. HIRE. WORK. RECORD. GROW.