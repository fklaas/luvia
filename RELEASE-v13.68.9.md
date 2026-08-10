# Luvia v13.68.9 / Core 4.68.9

## Inbound Intelligence Auth Context & Trusted Sender Provenance Fix

This release closes two issues discovered during the positive Email Booking V2 inbound smoke test.

1. `booking-email-inbound` successfully stored the inbound Resend message and advanced its thread to `replied`, but the V2 intelligence RPC could fail its service-role guard. The guard now recognizes the service role through the dedicated role setting, JWT claims JSON, or `auth.jwt()`.
2. Email reply classification may no longer auto-apply a booking state merely because the message text says a reservation is confirmed. Auto-apply is allowed only when the normalized sender exactly matches an existing `booking_contact_candidates` row for that booking that is `verified`, `public`, `official`, and `auto_usable`.

An untrusted sender is still classified and audited. If the classifier would otherwise auto-apply, the effective result becomes `auto_apply=false`, `review_required=true`, `requires_user_action=true`, with `UNTRUSTED_EMAIL_SENDER` in the raw decision evidence. No `email_reply` status signal is emitted.

`booking-email-inbound` no longer silently hides intelligence failures. It persists a `booking.email.reply.intelligence_failed` booking event and includes `intelligenceError` in the successful webhook response while retaining the inbound message/thread data.
