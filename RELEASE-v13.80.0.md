# Luvia v13.80.0 / Core 4.80.0
## Booking Actions & Intelligence

### Goal
Turn the v13.79 Booking Inbox from a read experience into a safe, user-controlled conversation and decision surface while keeping Booking Core and Email V2 as the only Booking/Message truth.

### Delivered
1. Dedicated authenticated `booking-email-reply` Edge Function for replies on existing Booking Email V2 threads.
2. Reply transport keeps the established `booking_email_threads.reply_alias` and uses provider message headers where available.
3. Replies are stored as canonical `booking_messages` only after Resend accepts the outbound send request.
4. Reply idempotency prevents duplicate sends on retries.
5. Existing venue-specific email verification is reused before every reply.
6. Existing production/test recipient safety routing remains enforced by `BOOKING_MODE` / `BOOKING_TEST_RECIPIENT`.
7. `booking_message_intelligence` gains persistent `review_state`, reviewer, action and action-payload fields.
8. New membership-protected RPC `luvia_booking_resolve_message_intelligence` writes an audit event and never invents provider confirmation.
9. Alternative Intelligence cards now provide `Alternative annehmen` and `Ablehnen` actions.
10. `requires_action` / `review_required` cards can route the user into the composer or be explicitly marked reviewed.
11. The normal composer now sends real replies through Booking Core.
12. After a successful user reply from `alternative_proposed` / `needs_action`, Luvia moves to `awaiting_reply` rather than claiming confirmation.
13. Product capability `booking.actions` added.
14. Service Worker and Kernel bumped to v13.80.0 / Core 4.80.0.

### Architecture guarantees
- Inbox still performs no direct Booking/Message table access.
- User action is explicit; no automatic free-text send.
- Provider confirmation is never inferred from the user's acceptance message.
- Reply success is not rendered until provider transport succeeds.
- Intelligence action is persisted and auditable.
