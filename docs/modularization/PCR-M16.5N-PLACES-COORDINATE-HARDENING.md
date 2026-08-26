# PCR M16.5N — Places Coordinate Projection Hardening

Date: 2026-08-26

Status: **IMPLEMENTED / LOCALLY VERIFIED**

Owner stream: `feature/places-core`

## Scope

This bounded owner change hardens the browserless coordinate projection in
`core/places/places-domain-contract-core.js` and adds the focused
`tests/m16.5n-places-coordinate-projection-hardening.test.cjs` regression.
It also accepts provider coordinates exposed through `input.location`.

No public contract ID or version changes. There is no Platform Runtime,
Consumer/Experience, map renderer, provider, persistence, database, schema,
RPC, RLS, bucket, Edge Function, secret or deployment change.

## Ownership

Places remains the sole owner of normalized Place projections. The change
does not create another coordinate store, move Place truth, or give Consumer,
Experience, Intelligence or Platform permission to normalize private provider
payloads independently. `places.v1` consumers continue to receive only the
existing immutable coordinate projection or `null`.

## Behavior

- `coordinates`, `position`, `location` and flat `latitude`/`longitude`
  inputs retain their ordered projection boundary;
- `latitude`/`longitude` and `lat`/`lng` aliases remain supported;
- finite numeric strings remain compatible with existing provider and DB
  projections;
- a coordinate is emitted only when both values are present and finite;
- latitude must be inside the inclusive WGS84 range `[-90, 90]`;
- longitude must be inside the inclusive WGS84 range `[-180, 180]`;
- booleans, blank values, objects, arrays, `NaN`, positive/negative Infinity,
  half pairs and out-of-range pairs project to `null`;
- the generic numeric helper used by rating and other detail projections is
  unchanged.

## Tests

- `node --check core/places/places-domain-contract-core.js`: **PASS**;
- `node --check tests/m16.5n-places-coordinate-projection-hardening.test.cjs`:
  **PASS**;
- focused M16.5N coordinate projection regression: **PASS**;
- M6 FINAL Places Domain Contract / Native Readiness: **PASS**;
- M3.2 Places Contract Adapter regression: **PASS**;
- `git diff --check`: **PASS** apart from the informational Windows checkout
  line-ending warning.

## Rollback

Rollback is code-only: restore the prior coordinate projection in
`core/places/places-domain-contract-core.js`, remove the focused M16.5N test,
this PCR and their ownership rows. No data migration or persisted-data
compensation is required.
