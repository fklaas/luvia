# Luvia v13.68.2 / Core 4.68.2
## Email Send Expected-State & Early Audit Fix

This patch closes the server-side gap found while testing `logo-le-point@2x.jpg`.

### Fixed
- `booking-email-send` creates `booking_email_requests` before recipient verification.
- Recipient validation failures are persisted as `blocked` expected states.
- `EMAIL_ASSET_OR_FILE_REFERENCE`, `EMAIL_INVALID`, `BOOKING_PROVIDER_EMAIL_DOMAIN`, `VENUE_EMAIL_NOT_VERIFIED`, and missing test-recipient blocks return HTTP 200 business responses.
- `actual_recipient` remains null for recipient-validation blocks.
- Resend transport prerequisites are evaluated only after venue-recipient verification, so infrastructure failures cannot mask an expected recipient guard.
- No Resend API call is reachable before the verified-recipient gate.

### Versions
- App: 13.68.2
- Core: 4.68.2
- Email V2 Browser Client: 1.0.2
- Email Runtime: 1.0.2
- Email Send: 2.0.2
