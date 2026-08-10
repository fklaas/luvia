# Luvia v13.71.0 / Core 4.71.0

## Production Commission & Revenue Lifecycle Foundation

v13.71.0 builds the first production-grade commission lifecycle on top of the now runtime-proven v13.70 conversion core.

### What changes

- Adds `booking_commission_state_events` as an append-only audit trail for commission lifecycle transitions.
- Adds guarded commission transitions via `luvia_booking_commission_transition_allowed(...)`.
- Adds `luvia_booking_apply_commission_lifecycle(...)` for atomic, service-role-only commission reconciliation.
- Prevents backwards lifecycle movement such as `paid -> pending`; a paid commission can only move to `disputed` before a later dispute resolution.
- Rejects conflicting duplicate `paid` amounts instead of silently rewriting settled revenue truth.
- Commercial `commission_*` events now attach to an existing `booking_conversion_reports` row instead of creating a new conversion report.
- Ambiguous or missing conversion linkage fails closed as `pending_unmatched` with `COMMISSION_CONVERSION_AMBIGUOUS` / `COMMISSION_CONVERSION_NOT_FOUND`.
- Adds `booking_commission_runtime_v1` for operational lifecycle visibility.
- Adds `booking_commission_revenue_summary_v1` with provider/currency aggregates based only on persisted facts; paid commission is derived from `settled_amount` only.
- Extends the JS monetization/reconciliation contracts for the later Booking Control Center without introducing a new UI yet.

### Truth boundary

Commission and revenue evidence never confirms, cancels or otherwise mutates a reservation. The commercial processor still asserts that `bookings.status` is unchanged before resolving an event.

### Explicitly not included

- No invented commission rates.
- No provider is activated by this build.
- No fake revenue or partner contract data.
- No Booking UX redesign.
- No Hotel/Activity/Ticket domain work.
- No changes to Email Booking V2 or the reservation create/modify/cancel lifecycle.
