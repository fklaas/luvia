# Luvia v13.78.0 / Core 4.78.0
## Booking Control Center Foundation

v13.78 introduces the first dedicated Booking Control Center surface on top of the v13.76 Product Module Foundation and v13.77 Control Center Home.

## Delivered
- New dedicated `LuviaBookingControlCenter` surface inside the registered Control Center product module.
- Booking Control Center route promoted to `available-v13.78`.
- Control Center Home Booking card now opens the new Booking Control Center instead of the legacy consumer booking view.
- Provider-independent booking overview for the selected trip.
- Trip selector using the existing global `LuviaTripStore`; no second trip selection truth.
- Booking Status Center with four user-facing groups:
  - Attention
  - In Bearbeitung
  - Bestätigt
  - Abgeschlossen
- Booking detail foundation with time, party size, booking path and confirmation reference.
- Attention states normalized from existing Booking Core statuses such as `review_required`, `requires_action`, `alternative_proposed`, `blocked` and `failed`.
- Existing consumer `LuviaBookingsView` remains available and unchanged as a separate product surface.
- Attention service production compatibility fixed to consume `LuviaBookingIntegration || LuviaBooking`.
- Product-module diagnostics now include Booking Control Center presence/diagnostics.
- Service Worker cache bumped to `luvia-shell-v13.78.0` and includes the new Control Center assets.

## Deliberately not included
These are intentionally reserved for later roadmap steps:
- conversation/message history → v13.79
- reply intelligence and decision actions → v13.80
- modify/cancel and lifecycle timeline → v13.81
- wallet/notifications → v13.82

## Architecture invariants
- Booking Control Center does not query `bookings` directly.
- Booking Control Center consumes the existing Booking integration API.
- `ownsBookingTruth: false`.
- Provider differences remain execution details, not competing user-facing booking truths.
- No database schema changes.
- No new Edge Functions.
- Existing Booking provider routing and adapter behavior is preserved.
