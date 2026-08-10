# Luvia v13.70.2 / Core 4.70.2

## Early Commercial Correlation Resolution & Pending Replay Fix

- Resolves and persists `booking_correlations` before the commercial partner activation gate.
- `pending_partner_activation` events therefore retain `correlation_id`, `correlation_token`, `trip_id` and any linked `booking_id`.
- Duplicate provider deliveries remain one event but can replay pending/failed states through the canonical processor.
- Adds `luvia_booking_replay_commercial_event(...)` for controlled service-role replay after partner activation/reconciliation.
- Correlation/provider and correlation/booking mismatches fail closed before revenue evidence can be produced.
- Verification remains mandatory for callback sources.
- Commercial evidence remains non-confirming and cannot mutate `bookings.status`.

No Booking UX, hotel/activity domain, Email Booking V2 or reservation-lifecycle behavior is changed.
