# Luvia M6.2 Release Notes — Places Runtime Projection Core

Date: 2026-08-22

Status: **COMPLETE / PRODUCTION VERIFIED**

## Release identity

- Feature: `ecd94eac7f5c97b68be74c13097aad1a9086164b`
- Runtime release: `d1c45cbb0fe357a061dffc8f52bef29e9593c612`
- App: **13.82.16**
- Core: **4.82.16**
- Production Cloudflare version: `98b38643-2d9e-46cc-a032-1fddeae77788`

## Delivered architecture

- Added browserless `core/places/place-runtime-projection-core.js` as the single in-memory owner of trip/type-scoped Place and TripPlace runtime projections.
- Reduced `core/places/place-runtime-store.js` to the Web event and active-Trip compatibility adapter; it owns no projection maps.
- Removed the duplicate Place/TripPlace `records` map from `core/places/place-collection-service.js`.
- Preserved the full `window.LuviaPlaceRuntime` compatibility surface and existing lifecycle/favorite behavior.
- Retained only Collection command-concurrency state and the separately sourced `trip_place_data` projection.
- Kept Timeline/Journey separately classified as a cross-domain aggregator.

## Acceptance

- Focused M6.2 browserless and compatibility guardrail: **PASS**
- Safe Regression on Platform, Integration, and Main: **41 / 41 PASS**
- Integration Preview runtime assets: **10 / 10 EXACT**
- Integration static privacy: **5 / 5 PASS**
- Integration authenticated F5 + Places + ten categories: **PASS**
- Production runtime assets: **10 / 10 EXACT**
- Production static privacy: **5 / 5 PASS**
- Production authenticated F5 + Places + ten categories: **PASS**
- Browser console warnings / errors: **0 / 0** in both accepted environments

The Integration and Production GitHub checks remained stuck at `in_progress` without error or conclusion. This is retained as a check-reporting fault. Cloudflare version/deployment records plus byte-exact and authenticated runtime evidence independently prove both environments; no successful check conclusion is invented.

## Infrastructure and rollback

- Database migration: **NONE**
- RPC/schema change: **NONE**
- Edge Function change: **NONE**
- Secret change: **NONE**
- Manual Cloudflare configuration change: **NONE**
- Rollback: commit-only runtime rollback; no data rollback required

M6 remains **IN PROGRESS**. The next block is derived from a read-only M6 exit-gap lock, not from an assumed micro-slice.
