# Luvia v13.69.0 / Core 4.69.0
## Attribution Core & Monetization Foundation

This build starts the v13.69–v13.71 monetization milestone without replacing the existing Booking Core.

### What changed
- Added canonical `booking_monetization_profiles` for provider-commercial readiness, tracking strategy and verified commercial capability metadata.
- Kept sensitive contractual data service-role-only and exposed only a sanitized readiness view to authenticated app clients.
- Added `luvia_booking_prepare_monetized_handoff(...)` as the new canonical restaurant handoff entrypoint. It reuses the existing `booking_handoff_events` + `booking_correlations` chain instead of creating a second attribution system.
- Every new handoff receives a durable correlation token and a monetization snapshot where available.
- Added `booking_monetization_runtime_v1`, a unified read model over correlation, conversion reports and commission reconciliation.
- Added `window.LuviaBookingMonetization` and Booking Integration read APIs for provider readiness and booking monetization runtime.
- Existing place handoff code now prefers the v4.69 monetized handoff RPC and safely falls back to the v4.49 RPC during deploy-order transitions.

### Safety invariants
- Conversion, commission, affiliate callback and handoff facts remain non-confirming.
- No commercial event changes `bookings.status`.
- No provider commission rate, payout or contract is fabricated in this build.
- Email Booking V2, provider mutation lifecycle, status provenance and recovery/reconciliation are unchanged.

### Scope
Restaurant Booking Core only. Hotels, activities, tickets, transport and Booking UX V1 are not pulled forward.
