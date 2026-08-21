# Luvia Release Notes — M5.4.2 Runtime / Bootstrap Trip Boundary

Date: 2026-08-21

## Release

- App 13.82.12
- Core 4.82.12
- Milestone M5.4.2
- Runtime commit `5b6af89ba061e9638fc12be3268767e6d681c1b9`
- Runtime parent `2748c02bdb1497b0460c85630c1fd8c8a5bc76d8`
- Runtime version bump: NONE

## Purpose

M5.4.2 removes direct private Trip Store access from the active boot and shared runtime paths while preserving Trip Store as the sole owner of Trip Truth.

The change continues the Native First Ready migration by moving Web runtime lifecycle operations behind the public Trip owner boundary rather than allowing runtime/bootstrap consumers to call `window.LuviaTripStore` directly.

## Changed runtime architecture

### core/platform/trip-contract-adapter.js

Adds owner runtime capabilities:
- `getState()`
- `initialize()`
- `loadRemote()`

Extends:
- `selectActiveTrip(tripId, options={})`

The options extension preserves boot semantics such as `touch` and `source:'boot-cloud'` while keeping the private Store call inside the owner adapter.

### core/runtime/boot-coordinator.js

Direct private `LuviaTripStore` references:
- Before: 7
- After: 0

Boot now uses the public Trip runtime/command boundary for initialization, remote loading, state projection and active-trip selection.

### core/runtime/runtime.js

Direct private `LuviaTripStore` references:
- Before: 3
- After: 0

Runtime state calculation remains tolerant before the lazy Trip owner runtime is available, while boot/authenticated remote paths use the required public runtime boundary.

## Tests

- Focused M5.4.2: PASS
- M5.1j owner bridge preservation: PASS
- M5.4.1 retained regressions: PASS
- Safe Regression: 36 / 36 PASS
- Native First Foundation: PASS
- M5.3 Active Trip Context: PASS
- Cross-core DB ownership: PASS

## Integration Preview

- Check ID: `96750127577`
- Build ID: `8791679f-d968-4580-809d-9a5c0572cbe8`
- Version ID: `a1fb1cf3-34c3-4d68-b9fc-fb159da95f2d`
- Static byte provenance: PASS
- Static privacy: PASS
- Authenticated browser + F5: PASS
- Active Trip: Paris Hochzeitstag / Paris
- Booking Center: PASS

## Production

- Production runtime commit: `5b6af89ba061e9638fc12be3268767e6d681c1b9`
- Check ID: `96753083232`
- Build ID: `3a51d89b-ae7c-4844-befe-09bf22e98052`
- Version ID: `38c83250-b231-46d6-b573-1e111fcd1d97`
- Static byte provenance: PASS
- Static privacy: PASS
- Authenticated Production F5: PASS
- Runtime ready: true
- Authenticated: true
- Active Trip: Paris Hochzeitstag / Paris
- Booking Center: PASS

## Known retained warnings / evidence limits

Tracking Prevention messages and the geolocation user-gesture warning remain retained browser/runtime debt and are not claimed fixed.

The exact causal Main promotion action was not captured at the original mutation instant. Current Git state, reflog evidence, Cloudflare commit-specific evidence and byte-exact Production state are proven; historical causation is not invented.

## Infrastructure

No DB migration.
No Supabase Edge Function change.
No secret change.
No manual Cloudflare change.

## State

M5.4.2 closes only with its docs marker and final eight-stream synchronization.

M5.4 remains IN PROGRESS.
M5 remains IN PROGRESS.
