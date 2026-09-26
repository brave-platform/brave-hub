# BRAVE Marketplace + Chat Amendment

- Product Marketplace remains the only purchase/cart/checkout marketplace.
- Service Marketplace is inquiry/chat-first; services do not use product checkout.
- Product and service cards show whether the listing is owned by BRAVE Admin or a BRAVE member/provider.
- BRAVE-owned listings use a normal BRAVE Admin chat instead of a fake seller profile.
- Member listings open a normal direct chat with the seller/provider.
- Every listing chat carries a visible “Regarding” reference containing the listing name and ID.
- Product delivery defaults to ₦509 for existing BRAVE catalogue/showcase products where no delivery fee was set.
- Added affordable catalogue items around ₦1,000, ₦2,000, ₦5,000 and above.
- Marketplace search understands budget phrases such as “powerbank 20k” and “20 thousand” and sorts matching products by price closeness.
- Registration already requires a phone number; public profiles now show the saved phone number when available.
- Registration and password-reset pages include simple show/hide password controls.
- Public BRAVE contact phone: 0813 843 2348. Configure `PUBLIC_CONTACT_EMAIL` in Render for the public Gmail/contact email.
- User-owned products/services remain editable/removable by their owners; admin can moderate/manage marketplace listings.
- Password reset still uses the configured Resend delivery path; in production the reset token is never exposed in the browser when email delivery fails.
