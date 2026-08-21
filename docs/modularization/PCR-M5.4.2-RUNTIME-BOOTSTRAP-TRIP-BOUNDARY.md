# PCR — M5.4.2 Runtime / Bootstrap Trip Boundary

Date: 2026-08-21

Status after successful marker + sync: COMPLETE / CLOSED

## Objective

Remove active runtime/bootstrap dependency on private Trip Store access while preserving a single Trip Truth owner and preparing the runtime for future Web/iOS/Android clients.

## Baseline

Previous closeout marker:

`2748c02bdb1497b0460c85630c1fd8c8a5bc76d8`

Runtime implementation commit:

`5b6af89ba061e9638fc12be3268767e6d681c1b9`

App/Core:

13.82.12 / 4.82.12

## Architecture decision

Runtime/bootstrap code must not own or directly consume private Trip Truth.

The active Web runtime may call a public Trip owner boundary.

Private Trip Store access remains legal inside the Trip owner adapter/store implementation until later physical/native-ready decomposition proves a safer replacement.

## Delivered

### Public owner runtime boundary

`core/platform/trip-contract-adapter.js` exposes runtime owner operations for:
- state projection
- initialization
- remote load

Active Trip selection remains an owner command and now accepts owner-preserving options.

### Boot migration

`core/runtime/boot-coordinator.js`:
- 7 direct private Store refs -> 0

### Runtime migration

`core/runtime/runtime.js`:
- 3 direct private Store refs -> 0

Total active runtime/bootstrap private Store debt removed in this slice:

10 references.

## Native First evaluation

PASS:
- Boot consumer no longer depends on the private Web Trip Store global.
- Shared runtime no longer directly depends on the private Web Trip Store global.
- Lifecycle/state operations flow through a public owner boundary.
- Trip Truth remains singular.
- Browser compatibility bindings remain explicitly classified rather than falsely declared eliminated.

Not yet complete for M5:
- global Web compatibility debt still exists
- Trip owner internals still contain Web-era bindings
- `luvia-trip-context.js` remains a separate compatibility/load-order boundary
- remaining Trip-owned runtime/legacy consumers still require controlled classification/migration
- Travel Context/browser ports still require later M5.4 work
- physical Trip Core isolation remains a mandatory M5 exit condition

## Regression exit

PASS:
- focused M5.4.2
- M5.1j owner command preservation
- M5.4.1 retained tests
- Safe 36/36
- NFR-0
- M5.3
- DB ownership guardrail

## Integration / Production exit

PASS:
- Integration FF convergence
- Integration Cloudflare build
- byte provenance
- SPA-aware privacy
- authenticated Integration F5
- Main current state
- commit-specific Production Cloudflare build
- byte-exact Production state
- Production SPA-aware privacy
- authenticated Production F5

## Evidence limitation

The exact causal operation that first moved Main to `5b6af89ba061e9638fc12be3268767e6d681c1b9` was not captured contemporaneously by the later recovery harness.

We retain only what is actually proven:
- local Main reflog records a Fast Forward
- Main Local = Tracking = Live on the runtime commit
- divergence 0/0
- commit-specific Cloudflare Production check succeeded
- Production assets are byte-identical to the runtime commit

No missing historical mutation-time evidence is manufactured retroactively.

## Retained browser debt

Tracking Prevention warnings remain.

The geolocation user-gesture violation remains and belongs to Web Location/runtime hardening rather than this Trip runtime isolation slice.

## Infrastructure

No DB migration.
No Edge Function change.
No secret change.
No manual Cloudflare change.

## Exit decision

M5.4.2 may be declared COMPLETE / CLOSED after:
1. closeout docs/registry guardrail commit,
2. marker push,
3. Production runtime byte preservation,
4. final eight-stream Local = Tracking = Live synchronization.

M5.4 remains IN PROGRESS.

The next M5.4 architecture boundary should continue with the remaining Trip-owned runtime/legacy access rather than reopening the completed Runtime/Bootstrap slice.
