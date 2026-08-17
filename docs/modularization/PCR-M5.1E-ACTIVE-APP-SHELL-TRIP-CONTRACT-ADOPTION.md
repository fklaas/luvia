# PCR – M5.1e Active App Shell Trip Contract Adoption

## Status

IMPLEMENTATION CANDIDATE.

## Purpose

M5.1e isolates the active production App Shell from direct Trip Store and Trip Context truth consumption.

The active App Shell becomes a Trip Contract consumer while Trip Core retains ownership of Trip truth.

## Runtime scope

- `app/app-shell.js`

## Regression scope

- `tests/m5.1e-active-app-shell-trip-contract-adoption.test.cjs`
- `tests/m4.3-evergreen-foundation-regression.test.cjs`
- controlled Safe Regression harness

## Allowed Trip access

- `LuviaTripContractV1`
- compatibility alias `LuviaTripContract`
- `listTrips()`
- `getActiveTrip()`
- `getContext()`
- `subscribe()`

## Forbidden active App Shell Trip truth access

- direct `LuviaTripStore`
- direct `LuviaTripContext`
- legacy Trip events as an alternative truth source
- private persisted Trip truth
- independent active-Trip cache

## Required preserved behavior

- boot behavior
- no-trip behavior
- active Trip shell rendering
- Trip switch observation
- profile active-Trip synchronization
- Timeline hydration
- Destination refresh
- Collaboration watch
- shell/header refresh
- active-view rerender

## Confirmed active runtime boundary

`app/app-shell.js` is loaded by `index.html` and belongs to the Service Worker application shell.

`core/app/app-shell-v11.js` has no confirmed active runtime reference in the M5.1e reachability proof and is excluded from this slice.

## Out of scope

- Trip Store owner internals
- Trip Contract adapter internals
- Boot Coordinator
- Trip creation
- Trip join
- Trip update
- legacy App Shell cleanup
- database migrations
- Supabase Functions
- secrets
- Consumer redesign

## Acceptance requirements

Before feature commit:

- direct App Shell `LuviaTripStore` references = **0**
- direct App Shell `LuviaTripContext` references = **0**
- focused M5.1e regression = **PASS**
- existing App Shell foundation regression = **PASS**
- release consistency = **PASS**
- controlled Safe Regression = **21 / 21 PASS**
- repository guardrail = **PASS**
- exact release scope = **PASS**
- `git diff --check` = **PASS**
- UTF-8 BOM verification = **PASS**

Promotion and production evidence are intentionally not pre-claimed.

M5.1e remains IN PROGRESS until the normal feature → integration → preview → main → production → stream-sync path is completed.

M5 remains IN PROGRESS.