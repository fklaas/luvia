# RELEASE NOTES – M5.1e

## Release

- App: **13.82.4**
- Core: **4.82.4**
- Milestone: **M5 – Trip Core Isolation**
- Slice: **M5.1e – Active App Shell Trip Contract Adoption**
- Status: **IMPLEMENTATION CANDIDATE**
- Production: **NOT YET CLAIMED**

## Purpose

M5.1e moves the active production App Shell away from direct Trip Store / Trip Context truth consumption and onto the canonical Trip Contract.

Trip Core remains the owner of Trip truth.

The App Shell remains a consumer and does not create a second Trip truth layer.

## Runtime scope

Changed runtime file:

`app/app-shell.js`

The active App Shell now consumes:

- `LuviaTripContractV1`
- compatibility alias `LuviaTripContract`
- `listTrips()`
- `getActiveTrip()`
- `getContext()`
- `subscribe()`

Removed from the active App Shell:

- direct `LuviaTripStore` reads
- direct `LuviaTripStore` subscription
- direct `LuviaTripContext` access

## Preserved behavior

The App Shell keeps the existing behavior for:

- authenticated boot
- no-trip state
- active Trip rendering
- Trip switching
- profile active-Trip synchronization
- Timeline hydration
- Destination refresh
- Collaboration watch
- shell header refresh
- active view rerender

The local shell projection derives compatibility fields such as `activeTripId`, `hasTrips` and `hasActiveTrip` from Trip Contract reads. It does not own or persist Trip truth.

## Runtime reachability

`app/app-shell.js` is the confirmed active runtime shell:

- loaded directly by `index.html`
- part of the Service Worker application shell

`core/app/app-shell-v11.js` is not part of the confirmed active runtime path and is intentionally unchanged in M5.1e.

## Regression coverage

Dedicated evergreen regression:

`tests/m5.1e-active-app-shell-trip-contract-adoption.test.cjs`

Registered in:

`tests/run-m4.3-safe-regression.cjs`

Expected controlled Safe Regression after registration:

- Total: **21**
- Passed: **21**
- Failed: **0**

## Infrastructure impact

- Database migration: **NONE**
- Supabase Edge Function change: **NONE**
- Supabase Secret change: **NONE**
- Cloudflare Secret change: **NONE**
- Provider configuration change: **NONE**

## Promotion

Required flow remains:

`feature/platform-core -> integration -> controlled regression -> integration preview -> main -> production`

No Integration, Preview, Main, Production or six-stream completion claim is made by this implementation-candidate document.

M5.1e remains **IN PROGRESS** until promotion and runtime verification complete.

M5 remains **IN PROGRESS**.