# RELEASE NOTES – M5.1g

## Release

- App: **13.82.6**
- Core: **4.82.6**
- Milestone: **M5.1g – Places Domain Trip Contract Adoption**
- Parent baseline: `98b84f254c1889aaa5f6bc39ab0c29073c5014c7`
- M5 status: **IN PROGRESS**
- Release commit: **pending**
- Push: **pending**
- Integration promotion: **pending**
- Production deployment: **pending**
- Production runtime verification: **pending**

## Purpose

M5.1g removes direct Trip truth access from the active Places domain consumers.

The Places domain remains responsible for Places data, Places persistence and Places lifecycle behavior. It no longer reads active Trip truth directly from `LuviaTripStore` or `LuviaTripContext` in the eight approved M5.1g consumers.

Active Trip identity is now obtained through the canonical lazy Trip Contract v1 boundary.

## Runtime scope

Exactly eight active Places consumers are part of M5.1g:

1. `core/places/place-core.js`
2. `core/places/place-lifecycle-hub.js`
3. `core/places/place-collection-service.js`
4. `core/places/place-command-service.js`
5. `core/places/place-lifecycle-service.js`
6. `core/places/places-final-foundation.js`
7. `core/places/presence-visit-core.js`
8. `core/places/trip-place-data-service.js`

Before M5.1g this slice contained:

- 7 direct `LuviaTripStore` references
- 7 direct `LuviaTripContext` references
- 0 Trip Contract references
- 0 direct Trip mutations

After the implementation all eight consumers have:

- `LuviaTripStore` direct references: **0**
- `LuviaTripContext` direct references: **0**
- canonical Trip Contract access: **present**
- Trip mutation ownership: **not introduced**

## Contract behavior

M5.1g uses the existing Trip Contract v1 active-Trip projection.

Consumers keep their existing explicit trip-ID arguments and Places runtime/state fallbacks where those are part of their own domain semantics. The fallback that previously reached directly into Trip Store or Trip Context is replaced by lazy contract access through:

`window.LuviaTripContractV1 || window.LuviaTripContract`

The canonical active Trip is read via `getActiveTrip()`.

## Timeline boundary

`core/places/timeline-core.js` is explicitly **not part of M5.1g**.

The future Timeline is intended to aggregate cross-domain journey events such as Places, photos/media, memories, Booking, activities, travel actions and other journey events.

For that reason M5.1g does not further couple Timeline to the Places domain and does not move or rename the file.

Timeline/Journey Aggregation will receive a separate architecture and Trip-consumer review later in M5.

## Safe regression

The Safe Regression allowlist grows from 23 to **24 tests**.

Added:

`tests/m5.1g-places-domain-trip-contract-adoption.test.cjs`

Local release-gate evidence before the release bump:

- M5.1g test: **4/4 PASS**
- Controlled Safe Regression: **24/24 PASS**
- Repository Guardrail: **PASS**
- release consistency on previous release 13.82.5 / Core 4.82.5: **PASS**
- `git diff --check`: **PASS**
- strict UTF-8: **PASS**
- BOM absent: **PASS**
- control characters: **0**

## Repository guardrail

Known guardrail baseline remains unchanged:

- tracked JS/TS files: **327**
- static DB calls: **316**
- mapped cross-core debt: **26 / baseline 26**
- unmapped DB-object debt: **39 / baseline 39**
- dynamic DB calls: **27 / baseline 27**

## Infrastructure impact

M5.1g introduces:

- no database migration
- no Supabase Edge Function change
- no secret change
- no provider contract change
- no Booking Core ownership change
- no Media Core ownership change
- no Trip mutation responsibility inside Places

## Release lifecycle

At document creation time this release is prepared locally only.

Still pending:

1. release implementation commit
2. feature-stream push
3. integration promotion
4. integration regression
5. integration runtime/preview verification as required
6. main promotion
7. production deployment
8. production runtime/reload/browser-console verification
9. six-stream synchronization
10. final M5.1g closeout marker

M5.1g must not be considered fully COMPLETE until those release lifecycle gates are evidenced.