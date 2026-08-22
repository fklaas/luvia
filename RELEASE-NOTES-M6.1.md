# Luvia M6.1 — Places State Core Foundation

Status: **COMPLETE / PRODUCTION VERIFIED**

Date: 2026-08-22

## Release identity

- Feature commit: `9b9b782baa3fa58ed8bc9be5e96214da084a52e4`
- Runtime release commit: `f4adb8b07cc131166241bfa3051c1ea3119c1bfb`
- App: **13.82.15**
- Core: **4.82.15**
- Public Places contract: `places.v1` — unchanged
- Milestone status: M6 remains **IN PROGRESS**

## Architecture result

`core/places/place-state-core.js` now owns the existing in-memory Place record map. The state core is browserless and contains no Web, DOM, storage, network, Supabase, DB, RPC, or device dependency.

`core/places/place-core.js` remains the Web compatibility and orchestration adapter. It delegates record registration, reads, filtering, updates, lifecycle updates, and removal to the state core and owns no second record map. The existing `window.LuviaPlaceCore` / `window.LuviaPlacesCore` method surface remains compatible.

This is a foundation slice, not the M6 exit. The runtime and collection projections remain under explicit later audit. No duplicate-truth clearance is claimed for those projections yet.

Timeline/Journey remained reserved and unchanged. Category/Discovery routing, Intelligence gateways, Location, Permission, Deep Links, External Navigation, Offline/Cache, Experience UI, DB/RPC ownership, and the `places.v1` surface were not changed.

## Validation

- Maintained focused Places regression: **7 / 7 PASS**
- M6.1 browserless state-core guardrail: **PASS**
- Controlled Safe Regression on Platform: **40 / 40 PASS**
- Controlled Safe Regression on Integration: **40 / 40 PASS**
- Controlled Safe Regression on Main: **40 / 40 PASS**
- Core Stream Registry: **PASS**
- Experience / Intelligence boundary guardrail: **PASS**
- Cross-core DB ownership guardrail: **PASS**
- NFR-0 Foundation Regression: **PASS**
- Physical Places State Core browser tokens: **0**
- Web Places adapter record maps: **0**

Historical version-pinned 13.26/13.27 test artifacts remain historical evidence and were not rewritten into cumulative evergreen gates.

## Integration Preview acceptance

- Integration live commit: `f4adb8b07cc131166241bfa3051c1ea3119c1bfb`
- GitHub / Cloudflare check: `97007980994` — **success**
- Cloudflare Build ID: `e6e99f04-fd38-4221-adaa-df5cf5770d3a`
- Stable preview alias: `https://integration-luvia.njwnrvwbv5.workers.dev`
- Runtime Git blob provenance: **12 / 12 EXACT**
- Static privacy / SPA fallback classification: **5 / 5 PASS**
- App/Core: **13.82.15 / 4.82.15**
- New Places State Core JavaScript asset and MIME type: **PASS**
- Authenticated active-Trip UI before and after F5: **PASS**
- Timeline and destination UI before and after F5: **PASS**
- Places planning entry and Places hub: **PASS**
- Ten visible Places discovery categories: **10 / 10 PASS**
- Browser console warnings/errors: **0 / 0**

## Production acceptance

- Main live commit: `f4adb8b07cc131166241bfa3051c1ea3119c1bfb`
- Production URL: `https://myluvia.app`
- Active Cloudflare version: `50a9ad97-d841-46e0-81d3-9ca1e5619f77` at 100% traffic
- Runtime Git blob provenance: **12 / 12 EXACT**
- Static privacy / SPA fallback classification: **5 / 5 PASS**
- App/Core: **13.82.15 / 4.82.15**
- New Places State Core JavaScript asset and MIME type: **PASS**
- Authenticated active-Trip UI before and after F5: **PASS**
- Timeline and destination UI before and after F5: **PASS**
- Places planning entry and Places hub: **PASS**
- Ten visible Places discovery categories: **10 / 10 PASS**
- Browser console warnings/errors: **0 / 0**

Cloudflare reported the active deployment/version source as `Unknown (deployment/version_upload)`. The deployment appeared after Main promotion and Production subsequently served exact Main Git blobs, but no more specific automatic/manual trigger causation is asserted.

## Infrastructure

- Database migration: **NONE**
- RPC/schema change: **NONE**
- Supabase Edge Function change/deployment: **NONE**
- Supabase secret change: **NONE**
- Cloudflare secret change: **NONE**
- Manual Cloudflare configuration change: **NONE**

## Rollback

Application rollback is commit-only: revert the runtime release commit and feature commit, then redeploy the previous known-good Main. No database or data rollback is required.

## Next controlled scope

Before another Places mutation, the runtime-store and collection-service maps require a read/write/rehydration audit to prove which structures are derived projections and whether any active duplicate Places or Trip-Place truth remains. Location/Permission extraction remains a separate Platform-Port slice because the current Web bootstrap and Presence Visit Core have a circular dependency direction.
