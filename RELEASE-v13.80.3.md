# Luvia v13.80.3 / Core 4.80.3
## Reply Sender Consistency & Error Transparency Fix

### Fixed
- `booking-email-reply` now uses the same canonical sender configuration as `booking-email-send`: `BOOKING_EMAIL_FROM` first, then legacy `BOOKING_FROM`, then `Luvia Booking <booking@booking.myluvia.app>`.
- Reply requests now pass the deterministic `Idempotency-Key` to Resend.
- Resend rejection responses preserve provider HTTP status and structured details.
- Frontend Booking Integration converts structured function errors to readable text instead of `[object Object]`.

### Safety
- Venue-recipient verification remains mandatory.
- No booking is confirmed by sending a reply.
- Existing Booking Core and message truth remain authoritative.
- No DB schema changes.
