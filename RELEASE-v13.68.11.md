# Luvia v13.68.11 / Core 4.68.11
## Delivery Event Auth Context & Webhook Retry Idempotency Fix
- Delivery-event RPC now uses the canonical robust service-role request guard introduced for Email Booking V2 inbound intelligence.
- Resend retries/replays are hard-idempotent by `(provider, provider_event_id)` and return the existing event instead of duplicating it.
- `email.delivery_delayed` is represented as `delayed` instead of collapsing to `unknown`.
- Delivery failures/complaints continue to move the email thread/request into delivery-attention state; no automatic resend is introduced.
