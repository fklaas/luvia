# Luvia v13.80.2 / Core 4.80.2
## Booking Actions & Intelligence – Reply Verification & Mobile Inbox Fix

### Fixed
- Corrects the `booking-email-reply` verification contract. `luvia_booking_email_verified_candidate()` returns `ok`, not `verified/autoUsable`; v13.80.0/1 therefore blocked valid replies with `EMAIL_RECIPIENT_NOT_VERIFIED`.
- Mobile Booking Inbox now opens as a conversation list first instead of auto-opening one thread.
- A visible `← Inbox` action returns from a mobile conversation to the full conversation list.
- Reply verification failure keeps the underlying verification reason observable.

### Architecture
- No new Booking Truth or Message Truth.
- Existing verified venue contact guard remains active.
- Provider-domain and unverified-contact protections remain enforced by `luvia_booking_email_verified_candidate()`.
- Direct deep-links with a bookingId may still open a specific conversation intentionally.
