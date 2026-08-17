# RELEASE NOTES – M5.1f

## Release

- App: **13.82.5**
- Core: **4.82.5**
- Milestone: **M5 – Trip Core Isolation**
- Slice: **M5.1f – Memory Worlds v3 Trip Contract Adoption**
- Status at this stage: **IMPLEMENTATION / RELEASE VALIDATION IN PROGRESS**

## Purpose

M5.1f removes direct Trip Store and Trip Context truth consumption from the confirmed active Memory Worlds v3 runtime.

The active consumer is:

`app/memory-worlds-v3.js`

Runtime reachability was proven through `index.html` and the active Service Worker shell. Legacy `memory-worlds-v2.js` and `memory-worlds-v3.ts` were not active entry assets for this slice.

## Runtime changes

Memory Worlds v3 now resolves Trip state through:

`window.LuviaTripContractV1 || window.LuviaTripContract`

The following consumer paths use the canonical Trip Contract:

- `getActiveTrip()`
- `getContext()`
- `subscribe()`

Direct references remaining in the active Memory Worlds v3 runtime:

- `LuviaTripStore`: **0**
- `LuviaTripContext`: **0**

No Trip mutation capability was added to the consumer.

## Trip Contract compatibility

During test-first migration an existing compatibility dependency was discovered.

Memory Worlds previously accepted Trip accent values through:

1. `accent`
2. `accent_color`
3. `color`
4. default `#ee6f83`

The Trip Contract previously projected only `accent`.

M5.1f therefore makes the canonical projection backwards compatible:

`accent -> accent_color -> color -> #ee6f83`

The normalized value remains exposed as canonical `accent`.

## Test-first evidence

Focused tests:

- `tests/m5.1f-memory-worlds-v3-trip-contract-adoption.test.cjs`
- `tests/m5.1f-trip-contract-accent-compatibility.test.cjs`

Both requirements were proven RED before implementation and GREEN after implementation.

Existing M3.1 Trip Contract regression remains green.

## Unchanged behavior

M5.1f does not change:

- Memory Card write behavior
- Memory Journey write behavior
- Media write behavior
- UI composition
- Memory Worlds public registration
- theme event handling
- cleanup / unsubscribe lifecycle
- Trip ownership or mutation responsibility

## Repository / infrastructure impact

- DB migration: **NONE**
- Supabase Function change: **NONE**
- Secret change: **NONE**
- Provider change: **NONE**

## Release lifecycle

At creation of this document:

- implementation: complete
- focused tests: green
- release validation: pending
- Integration: pending
- Preview: pending
- Main: pending
- Production: pending
- final M5.1f completion marker: pending

M5 remains **IN PROGRESS**.