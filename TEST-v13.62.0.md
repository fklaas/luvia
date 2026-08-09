# Test v13.62.0 / Core 4.62.0

Expected smoke while providers are still partner-required:

- `booking_provider_reservation_create_readiness_v1` reports `partner_required` for supported but unconnected providers.
- `window.LuviaBookingReservationCreate.create(...)` returns `{ok:false, expected:true, error:'PARTNER_REQUIRED'}` and never invents a reservation reference.
- No provider mutation occurs before readiness is `ready`.
- Repeating a completed request with the same idempotency key returns the existing result.
