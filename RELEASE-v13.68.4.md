# Luvia v13.68.4 / Core 4.68.4

## Contact Resolver Candidate Bridge & Legacy Contact Verification Fix

This patch closes the gap discovered during the positive Email Booking V2 smoke test: `booking-contact-resolve` previously returned `CONTACT_ALREADY_PRESENT` when `bookings.contact.email` already existed, without proving that the address belonged to the venue and without creating a `booking_contact_candidates` record.

### New behavior

- Existing `bookings.contact.email` is treated as a legacy hint, not verification evidence.
- Provider/SaaS email domains remain rejected and are removed from the booking contact payload.
- A legacy venue email is only verified when the exact address is rediscovered on an official public venue webpage.
- Verified addresses are idempotently upserted through `luvia_booking_upsert_candidate` with `is_public=true`, `is_official=true`, `verification_status=verified` and evidence pointing to the exact source page.
- Channel resolution continues through `luvia_booking_resolve_channel`; no parallel booking/contact resolution path is introduced.
- If the legacy address is not present on the official source, it is not promoted to a candidate and Email Booking V2 remains blocked.
- If no official website exists or it cannot be fetched, the resolver fails closed instead of trusting the legacy contact.

### Runtime

- App: 13.68.4
- Core: 4.68.4
- `booking-contact-resolve`: 1.3.0
- Email Booking V2 client remains 1.0.3
