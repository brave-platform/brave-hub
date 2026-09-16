# Unique BRAVE phone/email authentication setup

Add these values to Render Environment Variables (do not commit real secrets):

- EMAIL_USER
- EMAIL_APP_PASSWORD
- ADMIN_EMAIL
- ADMIN_PASSWORD
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_VERIFY_SERVICE_SID

Twilio Verify is used for SMS OTP and phone-call verification. The app normalizes Nigerian 080... numbers to +234... and otherwise expects international +country-code format.

Test after deployment:
1. Create an account and verify the phone OTP.
2. Verify the email from the verification message.
3. Log in and open Settings > Change Phone Number.
4. Verify the existing number, then verify the new number by SMS or phone call.
5. Test Forgot Password by email and Reset password with phone OTP.
6. Submit an advertising request and review it in Admin > Advertising Requests.
