# Test Results · Luvia v13.74.0 / Core 4.74.0

## Automated release gates

- `node --check core/booking/booking-orchestration.js` ✅
- `node --check core/booking/booking-integration.js` ✅
- `node --check core/diagnostics/booking-core-diagnostics.js` ✅
- `node --check intelligence/developer-console.js` ✅
- `tests/v13.74.0-runtime-provider-health-adaptive-booking-decisions.test.cjs` ✅
  - `LUVIA_V13_74_0_RUNTIME_PROVIDER_HEALTH_ADAPTIVE_BOOKING_DECISIONS_OK`
- TheFork adapter regression ✅
- Quandoo adapter regression ✅
- OpenTable adapter regression ✅
- SevenRooms adapter regression ✅
- Resy adapter regression ✅
- Tock adapter regression ✅
- SQL static migration sanity ✅

## Runtime gates still required after deployment

- Apply `20260810224000_core_v4_74_0_runtime_provider_health_adaptive_booking_decisions.sql` in Supabase SQL Editor.
- Run `SMOKE-v13.74.0.sql`.
- Developer Console → Booking Core → `Booking Core testen`.
- Developer Console → Booking Core → `Backend-Readiness prüfen`.
- Verify provider runtime health rows and adaptive diagnostics against the production database.

## Important

The historic Supabase migration ledger is still not baselined. Do not blindly use `npx supabase db push` for this release.
