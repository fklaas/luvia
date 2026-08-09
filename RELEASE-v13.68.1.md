# Luvia v13.68.1 / Core 4.68.1
## Email Recipient Validation & Readiness Guard Fix

This patch closes the Email Booking V2 recipient-readiness gap found by the Sphère smoke test, where the legacy value `logo-le-point@2x.jpg` could be marked READY because a previously verified contact candidate existed for the same malformed value.

### Changes
- Adds one central server-side recipient validator: `luvia_booking_email_recipient_validation(text)`.
- Both `booking_email_readiness_v2` and `luvia_booking_email_verified_candidate(...)` use that validator.
- `booking-email-send` continues to require `luvia_booking_email_verified_candidate(...)` immediately before any Resend transport, so readiness and send now share the same recipient validity rules.
- Rejects malformed email syntax.
- Rejects web-asset/file-like recipient domains such as `.jpg`, `.png`, `.svg`, `.pdf`, `.js`, fonts and archives.
- Keeps generic booking-provider domains blocked.
- Venue ownership still requires an exact verified/public/official/auto_usable contact candidate for the booking.
- No changes to booking status provenance, inbound mail intelligence, Places routing, or provider reservation runtimes.

### Expected smoke result
For booking `8e240d22-6f85-4ecb-89f5-1a6577efc4a1`, `logo-le-point@2x.jpg` must no longer be READY. The expected reason is `EMAIL_ASSET_OR_FILE_REFERENCE`.
