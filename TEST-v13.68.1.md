# Test v13.68.1

## Required regression
1. `window.LuviaBookingEmailV2` remains present.
2. Sphère booking `8e240d22-6f85-4ecb-89f5-1a6577efc4a1` with legacy recipient `logo-le-point@2x.jpg` returns a blocked readiness state and `EMAIL_ASSET_OR_FILE_REFERENCE`.
3. A generic provider-domain address remains blocked with `BOOKING_PROVIDER_EMAIL_DOMAIN`.
4. A syntactically valid but unverified venue address returns `VENUE_EMAIL_NOT_VERIFIED`.
5. A verified/public/official/auto_usable venue candidate can reach READY.
6. `booking-email-send` uses the same verified-candidate RPC before any Resend call.
7. No booking status or Places behavior changes.
