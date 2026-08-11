# Luvia v13.75.0 / Core 4.75.0
## Adaptive Failover, Decision Replay & Orchestration Hardening

This build closes the technical Booking Intelligence / Provider Orchestration block before Booking UX V1.

### New
- Guarded automatic route failover after a route attempt is definitively failed.
- Strict Retry != Failover semantics.
- Failover never creates a new booking; the original `booking_id` is preserved.
- Failover is blocked when provider outcome is unknown or a booking mutation requires reconciliation, preventing blind duplicate reservations.
- Failed route signatures are excluded from subsequent planning without poisoning other channels of the same provider.
- Read-only Decision Replay compares stored decision evidence with current runtime conditions.
- `booking_route_failover_events` provides a dedicated audit timeline.
- `booking_route_failover_runtime_v1` exposes the full failover chain to diagnostics.
- Booking Core Developer Console now reports failover/decision counts and failover safety policy.

### Invariants
- Reservation truth is never inferred from routing/failover/commercial events.
- Commercial weight remains capped at 8.
- User-interest-first remains the ranking policy.
- Unknown provider outcome requires reconciliation before an alternative provider can be attempted.
