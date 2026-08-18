# PCR – M5.1h Discovery Modules Trip Contract Adoption

## Objective

M5.1h isolates the active Discovery module runtime surfaces from direct Trip truth ownership.

Trip Core remains canonical.

Discovery modules remain Consumer / Places Experience surfaces and consume Trip truth only through the public Trip Contract v1 boundary.

## Scope

Exactly seven runtime modules:

1. `modules/accommodations/accommodation-module.js`
2. `modules/attractions/attraction-module.js`
3. `modules/mobility/mobility-module.js`
4. `modules/nature/nature-module.js`
5. `modules/photo-spots/photo-spot-module.js`
6. `modules/restaurants-v2/restaurant-module.js`
7. `modules/shopping/shopping-module.js`

## Corrected legacy inventory

Before implementation:

- `LuviaTripStore`: **16**
- `LuviaTripContext`: **7**
- total legacy tokens: **23**
- physical matching lines: **19**
- Trip Contract references: **0**

The distinction between token count and physical-line count is deliberate because several lines contained multiple legacy tokens.

## Ownership classification

All seven files are:

- owner: **Consumer/Places Experience**
- classification: **Experience**

Measured Trip ownership indicators:

- persistence: **0**
- Trip mutation: **0**
- Trip owner / bridge: **0**

They are therefore Trip Truth consumers, not Trip owners.

## Canonical boundary

Lazy Contract lookup:

`window.LuviaTripContractV1 || window.LuviaTripContract`

Active Trip:

`getActiveTrip()`

Where needed, Contract context is used for projected Trip context such as `tripId` and destination information.

Direct access to `LuviaTripStore` and `LuviaTripContext` is removed from the seven-file scope.

## Existing semantics preserved

M5.1h does not remove legitimate module inputs such as:

- `context.trip`
- `instance.trip`
- `state.trip`

Those remain first-class where they were already part of module semantics.

Only direct legacy/private Trip truth fallbacks are replaced.

## Restaurant destination boundary

Restaurant contained:

- two `LuviaTripContext.getActiveTrip()` reads
- one `LuviaTripContext.getDestination()` read

The real Trip Contract v1 surface was measured before mutation.

It already exposes active Trip projection, Contract context, destination projection, `destination`, `destinationName` and `accent`.

It has no public `getDestination()`.

No new `getDestination()` was added.

Restaurant uses the existing Contract projection/context for Trip-owned destination data and keeps the existing non-Trip destination resolution layers where they represent distinct semantics.

No second Trip truth path was created.

## Timeline

`core/places/timeline-core.js` remains explicitly excluded and unchanged.

Timeline / Journey Aggregation is reserved for a future dedicated cross-domain architecture review.

## Trip Contract Adapter

`core/platform/trip-contract-adapter.js` remains unchanged.

No Contract extension was necessary.

## Test-first protection

Test:

`tests/m5.1h-discovery-modules-trip-contract-adoption.test.cjs`

RED:

- exit code **1**
- expected architecture violation proven
- Runtime mutation during RED: **0**

GREEN:

- exact seven-module scope
- direct Store: **0**
- direct Context: **0**
- lazy Contract adoption: **7 / 7**
- `getActiveTrip()`: **7 / 7**
- Restaurant destination boundary: **PASS**

## Evergreen regression

M5.1h is registered in:

`tests/run-m4.3-safe-regression.cjs`

Safe Regression:

**27 -> 28**

Current local result:

**28 / 28 PASS**

## Cross-Core DB guardrail

Unchanged baseline:

- tracked JS/TS: **327**
- static DB calls: **316**
- mapped cross-core debt: **26 / baseline 26**
- unmapped DB-object debt: **39 / baseline 39**
- dynamic DB calls: **27 / baseline 27**

No guardrail debt increase.

## Release identity

Local candidate:

- App **13.82.7**
- Core **4.82.7**
- Name **M5.1h Discovery Modules Trip Contract Adoption**

A release bump is required because browser-delivered Discovery module JavaScript changed.

## Infrastructure impact

No:

- DB migration
- Edge Function deployment
- secret update
- provider/API contract change
- Booking Core ownership change
- Media Core ownership change
- Trip Contract Adapter change

## Exact local runtime-release scope

Exactly 18 files:

1. `CURRENT-BUILD.md`
2. `RELEASE-NOTES-M5.1H.md`
3. `TEST-RESULTS-M5.1H.md`
4. `core/diagnostics/media-readiness.js`
5. `docs/modularization/PCR-M5.1H-DISCOVERY-MODULES-TRIP-CONTRACT-ADOPTION.md`
6. `force-update.html`
7. `index.html`
8. `intelligence/kernel/version.js`
9. `modules/accommodations/accommodation-module.js`
10. `modules/attractions/attraction-module.js`
11. `modules/mobility/mobility-module.js`
12. `modules/nature/nature-module.js`
13. `modules/photo-spots/photo-spot-module.js`
14. `modules/restaurants-v2/restaurant-module.js`
15. `modules/shopping/shopping-module.js`
16. `sw.js`
17. `tests/m5.1h-discovery-modules-trip-contract-adoption.test.cjs`
18. `tests/run-m4.3-safe-regression.cjs`

Explicit exclusions:

- `core/platform/trip-contract-adapter.js`
- `core/places/timeline-core.js`
- `docs/architecture/MIGRATION-STATE.md`
- historical M5.1g release evidence

## Local exit state

PASS:

- Scope Lock
- Mutation Design Gate
- test-first RED
- implementation GREEN
- existing 27/27 regression
- M5.1h Evergreen integration
- 28/28 Safe Regression
- release consistency
- architecture guardrails
- DB ownership baseline

Still required:

- final diff/scope/staging proof
- implementation commit
- feature-stream push
- Integration promotion/regression/preview
- Main promotion
- Production verification
- eight-stream synchronization
- authoritative M5.1h closeout

Therefore:

- M5.1h: **LOCAL RELEASE CANDIDATE**
- M5: **IN PROGRESS**

## Authoritative Closeout Decision

M5.1h is **COMPLETE**.

The seven scope-locked Discovery module runtime surfaces consume Trip truth through the existing `trip.v1` public contract boundary while preserving legitimate domain and destination fallbacks.

No new getDestination() method was added to Trip Contract merely to reproduce LuviaTripContext.

Journey / Timeline remained outside this migration. core/places/timeline-core.js was not changed and remains reserved.

Final evidence:

- Consumer -> Integration: **PASS**
- Integration -> Main: **PASS**
- Integration Safe Regression: **28 / 28 PASS**
- Main Safe Regression: **28 / 28 PASS**
- DB ownership baseline: **UNCHANGED**
- Integration Runtime: **EXACT_COMMIT_BLOBS_LIVE**
- Production Runtime: **TARGET_ALREADY_LIVE**
- Production Discovery Git-blob equality: **7 / 7**
- App/Core: **13.82.7 / 4.82.7**
- additional manual Wrangler deployment: **not required**

### Evidence limitation retained

Live remote SHA and divergence were not captured immediately before three early mutation moments: RED-test creation, initial runtime adoption and the first Safe-Runner release mutation.

Subsequent verification cannot retroactively establish those exact pre-mutation states. Repository history was not reset, rewritten or replayed merely to manufacture missing evidence.

The later release implementation commit and all subsequent promotion mutations used the full immediate pre-mutation protocol including live-remote and divergence verification.

This limitation must remain part of future authoritative summaries of M5.1h.
