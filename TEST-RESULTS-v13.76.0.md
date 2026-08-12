# Test Results – v13.76.0 / Core 4.76.0

Date: 2026-08-12

## PASS – v13.76 foundation
`node tests/v13.76.0-control-center-global-product-module-foundation.test.cjs`

Result:
`LUVIA_V13_76_0_CONTROL_CENTER_GLOBAL_PRODUCT_MODULE_FOUNDATION_OK`

Validated:
- Kernel version 4.76.0 / build 13.76.0.
- Product Module Registry registration and isolation semantics.
- Consumer, Developer Console and Control Center product manifests.
- Control Center ownership rule: no domain truth.
- Control Center enable/disable does not disable Consumer module.
- Capability Registry booking/trip/media relationships.
- Planned notifications/wallet capability representation.
- Attention contract separates unread/action-required concepts.
- Global Design System contract rejects product-level design forks.
- Existing `LuviaModuleRegistry` is preserved.
- Booking orchestration route order/foundation remains unchanged.

## PASS – Booking provider regressions
- TheFork: `LUVIA_V13_41_0_THEFORK_ADAPTER_FOUNDATION_OK`
- Quandoo: `LUVIA_V13_42_0_QUANDOO_ADAPTER_FOUNDATION_OK`
- OpenTable: `LUVIA_V13_44_0_OPENTABLE_ADAPTER_FOUNDATION_OK`
- SevenRooms: `LUVIA_V13_45_0_SEVENROOMS_ADAPTER_FOUNDATION_OK`
- Resy: `LUVIA_V13_46_0_RESY_ADAPTER_FOUNDATION_OK`
- Tock: `LUVIA_V13_47_0_TOCK_ADAPTER_FOUNDATION_OK`

## PASS – JavaScript syntax
`node --check` passed for every new v13.76 JavaScript source file.

## Static integration checks
- `index.html` contains no v13.75.0 cache-busting references.
- Developer Console contains no v13.75.0 cache-busting references.
- Service worker cache key is `luvia-shell-v13.76.0`.
- Product Module diagnostics are wired into Developer Console.

## Not executed locally
- Live Supabase/backend runtime checks.
- Production Cloudflare deployment smoke test.
- Authenticated browser E2E against production data.

Those checks must be performed after deployment as described in `DEPLOYMENT-v13.76.0.md`.
