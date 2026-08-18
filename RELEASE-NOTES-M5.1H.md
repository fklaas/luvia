# RELEASE NOTES – M5.1h

## Release

- App: **13.82.7**
- Core: **4.82.7**
- Milestone: **M5.1h – Discovery Modules Trip Contract Adoption**
- Parent baseline: `9c1d37e67c57fa6343a55b5ca5ea8ef25858c960`
- Stream: `feature/consumer-experience`
- M5 status: **IN PROGRESS**
- Release commit: **pending**
- Push: **pending**
- Integration promotion: **pending**
- Main promotion: **pending**
- Production deployment: **pending**
- Production runtime verification: **pending**

## Purpose

M5.1h removes direct Trip truth access from the seven scope-locked Discovery module runtime surfaces.

Trip Core remains the canonical owner of Trip truth. The Discovery modules remain Consumer / Places Experience surfaces and now obtain Trip-owned state only through the public Trip Contract v1 boundary.

## Runtime scope

Exactly seven runtime modules are included:

1. `modules/accommodations/accommodation-module.js`
2. `modules/attractions/attraction-module.js`
3. `modules/mobility/mobility-module.js`
4. `modules/nature/nature-module.js`
5. `modules/photo-spots/photo-spot-module.js`
6. `modules/restaurants-v2/restaurant-module.js`
7. `modules/shopping/shopping-module.js`

Corrected pre-migration inventory:

- direct `LuviaTripStore`: **16**
- direct `LuviaTripContext`: **7**
- total legacy Trip tokens: **23**
- physical matching source lines: **19**
- existing Trip Contract references: **0**
- persistence signals: **0**
- Trip mutation signals: **0**
- Trip owner / bridge signals: **0**

After implementation:

- direct `LuviaTripStore`: **0**
- direct `LuviaTripContext`: **0**
- lazy Trip Contract adoption: **7 / 7**
- active Trip via `getActiveTrip()`: **7 / 7**
- Trip mutation ownership introduced: **NO**

## Canonical Trip boundary

The modules use the existing lazy boundary:

`window.LuviaTripContractV1 || window.LuviaTripContract`

Active Trip reads use `getActiveTrip()`.

Existing module-owned `context.trip`, `instance.trip` and `state.trip` inputs remain intact where they are part of the existing module semantics.

## Restaurant destination decision

Restaurant originally contained:

- `getActiveTrip()`: **2**
- `getDestination()`: **1**

The measured Trip Contract v1 already exposes:

- `getActiveTrip()`
- `getContext()`
- `destinationProjection`
- projected `destination`
- projected `destinationName`
- projected `accent`

It does not expose a public `getDestination()`.

M5.1h therefore does not introduce a new Contract method merely to duplicate LegacyTripContext.

Restaurant derives Trip-owned destination information from the existing Contract projection / context and retains separate Destination-service and AppState compatibility fallbacks where those represent distinct runtime semantics.

## Timeline boundary

`core/places/timeline-core.js` is explicitly excluded and unchanged.

Timeline / Journey Aggregation remains reserved for a later dedicated cross-domain architecture slice.

## Trip Contract Adapter

`core/platform/trip-contract-adapter.js` is unchanged.

No Contract extension was required.

## Test-first implementation

Regression:

`tests/m5.1h-discovery-modules-trip-contract-adoption.test.cjs`

RED proof:

- Node exit code: **1**
- Runtime changes during RED proof: **0**
- first intended violation: direct `LuviaTripStore` access in Accommodation

After implementation the same targeted test is GREEN.

## Safe Regression

M5.1h is permanently registered in:

`tests/run-m4.3-safe-regression.cjs`

Allowlist:

- previous: **27**
- current: **28**

Local release-candidate verification:

- M5.1h targeted regression: **PASS**
- Safe Regression: **28 / 28 PASS**
- release consistency: **PASS**
- Ownership / Cross-Core guardrails: **PASS**
- DB Ownership guardrail: **PASS**

## Repository DB guardrail

Baseline unchanged:

- tracked JS/TS files: **327**
- static DB calls: **316**
- mapped cross-core debt: **26 / baseline 26**
- unmapped DB-object debt: **39 / baseline 39**
- dynamic DB calls: **27 / baseline 27**

## Infrastructure impact

M5.1h introduces:

- database migration: **NO**
- Supabase Edge Function change: **NO**
- Supabase secret change: **NO**
- Booking Core ownership change: **NO**
- Media Core ownership change: **NO**
- Trip Contract Adapter change: **NO**

No `npx supabase ...` deployment command is required for M5.1h.

Browser-delivered runtime assets do change, therefore normal Integration -> Main -> Production promotion and static/runtime verification are still required.

## Local lifecycle state

Current local release candidate:

- App **13.82.7**
- Core **4.82.7**
- Safe Regression **28 / 28 PASS**

Still pending:

1. final exact diff / changed-file verification
2. explicit staging
3. implementation release commit
4. feature-stream push
5. Integration promotion
6. Integration Safe Regression
7. Integration preview/runtime verification
8. Main promotion
9. Production deployment/runtime/reload/browser-console verification
10. eight-stream synchronization
11. authoritative M5.1h closeout documentation

Therefore:

- M5.1h: **LOCAL RELEASE CANDIDATE**
- M5: **IN PROGRESS**

## Authoritative Closeout

M5.1h completed its full promotion and runtime-verification lifecycle.

Final evidence:

- implementation commit: 69f1b7da691f9a1a0212d75748477018f0257408;
- Consumer promotion: **PASS**;
- Integration promotion: **PASS**;
- Integration Safe Regression: **28 / 28 PASS**;
- Integration Runtime: **EXACT_COMMIT_BLOBS_LIVE**;
- Integration Discovery Git blobs: **7 / 7 exact**;
- Main promotion: **PASS**;
- Main Safe Regression: **28 / 28 PASS**;
- DB ownership baseline: **UNCHANGED**;
- Production App/Core: **13.82.7 / 4.82.7**;
- Production Runtime: **TARGET_ALREADY_LIVE**;
- Production Discovery Git blobs: **7 / 7 exact**;
- direct legacy Trip truth in the seven targets: **0**;
- Restaurant destination boundary: **PASS**;
- additional manual Wrangler deployment: **not required and not performed**;
- DB migration: **none**;
- Edge Function deployment: **none**;
- secret change: **none**;
- Journey / Timeline mutation: **none**.

Final M5.1h status: **COMPLETE**.

The final documentation marker and 8/8 synchronization do not alter the released runtime.
