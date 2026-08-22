# PCR M6.2 — Places Runtime Projection Core

Status: feature implementation complete; local validation **41 / 41 PASS**; release/promotion pending.

Baseline / source-lock marker: `31314e5a6d9d2325d6e2fe2279f488f49be8f5f4`

Owner stream: `feature/platform-core`

## Read-only audit result

The active Places runtime contained three materially different state shapes:

1. `place-state-core.js` owns normalized Place catalog records consumed by `LuviaPlaceCore` and the current `places.v1` adapter.
2. `place-runtime-store.js` held a trip- and type-scoped projection of Place/TripPlace entities, lifecycle/favorite fields, and supplemental TripPlace data for active Web modules and Intelligence evidence.
3. `place-collection-service.js` copied the same trip-scoped Place/TripPlace lifecycle and favorite records into a second `records` map while also writing every item into `LuviaPlaceRuntime`.

The Collection map was not an independent projection with a different query purpose. `findRecord` preferred `LuviaPlaceRuntime` and used the Collection map only as a compatibility fallback. Imported and lifecycle-mutated records were written to both maps. `clearFavorites` enumerated the Collection copy when no explicit IDs were supplied. This was active duplicate in-memory state.

Within the runtime projection, `byTripPlaceId` and `byProviderId` are indexes that point to the same record object. They are not classified as two truths. Supplemental `dataByTripPlaceId` is a projection of `trip_place_data` and remains separately sourced from `LuviaTripPlaceData`.

Cloud services remain authoritative for persisted Place, TripPlace, lifecycle, favorite, and TripPlace-data rows. No in-memory projection is reclassified as persistence truth.

## Locked implementation scope

M6.2 performs one coherent state-boundary slice:

- add browserless `core/places/place-runtime-projection-core.js`;
- move trip/type buckets, ID indexes, lifecycle/favorite projection records, supplemental data projection, revisions, snapshots, and subscriptions into that core;
- keep `core/places/place-runtime-store.js` as the Web event and active-Trip compatibility adapter;
- preserve the complete `window.LuviaPlaceRuntime` method surface;
- remove the Collection service's second Place/TripPlace `records` map;
- make Collection reads, ingestion, mutation updates, and clear-all enumeration delegate to the one runtime projection;
- retain only the Collection in-flight `pending` map, which is command concurrency state rather than Domain Truth;
- wire the browserless core before its Web adapter in the app, service worker asset list, and Intelligence test harness;
- add a focused M6.2 guardrail and increment the controlled Safe Regression allowlist.

## Explicit non-scope

- no `places.v1` surface or version change;
- no Place search/get/saved/recommend/lifecycle contract expansion;
- no database, RPC, schema, Edge Function, or Supabase change;
- no Timeline/Journey mutation or ownership reclassification;
- no `trip_place_data` ownership move;
- no Location, Permission, Deep Link, External Navigation, Offline, or persistence adapter;
- no Category/Discovery routing change;
- no Intelligence ownership move;
- no Experience/UI redesign;
- no cleanup or rewrite of historical NFR-0 debt evidence.

## Native First boundary

The physical runtime projection core has no `window`, `document`, `navigator`, DOM event, browser storage, navigation, Supabase, Trip global, or Place cloud-service dependency. Browser event dispatch and active-Trip Web-event binding remain in `place-runtime-store.js`.

This makes the same projection rules loadable in Node, Web, and future native runtimes. The current `window.LuviaPlaceRuntime` object remains a Web compatibility binding, not the final platform-neutral import/DI boundary.

## Compatibility invariants

- `LuviaPlaceRuntime` keeps `setActiveTrip`, `ingest`, `upsert`, `patch`, `find`, `records`, `favorites`, `setData`, `getData`, `clearTrip`, `snapshot`, `subscribe`, `normalizeEntity`, and `diagnostics`.
- `luvia:trip-changed` continues to select the active runtime projection.
- every runtime state change continues to dispatch `luvia:place-runtime-changed`.
- Collection favorite/lifecycle mutations remain cloud-authoritative and optimistically synchronize buttons.
- Collection `registered` diagnostics remain a count across all retained trip projections.
- status aliases are normalized at the one runtime projection boundary.

## Residual debt retained deliberately

`ingest` keeps merge semantics because current callers include both full entity lists and favorite-only subsets. M6.2 does not invent replacement/eviction semantics. Stale-record eviction, explicit full-list rehydration, active-trip retention limits, and Offline/Persistence behavior require a separate contract-first audit.

The normalized Place catalog state and the trip-scoped Place/TripPlace projection remain distinct bounded representations. The current public `places.v1` lifecycle reads still come from `LuviaPlaceCore`; contract alignment between catalog records and trip-scoped saved/lifecycle projections remains a later M6 scope and is not declared solved here.

Timeline/Journey remains a reserved cross-domain aggregator and is not treated as an ordinary Places state consumer.

## Validation gates

- focused M6.2 browserless projection behavior;
- ID-index identity and trip/type isolation;
- status-alias normalization;
- supplemental TripPlace-data projection;
- unchanged Web runtime method surface;
- active-Trip event and runtime-change event compatibility;
- Collection delegation with zero Place/TripPlace record maps;
- favorite mutation against the single runtime projection;
- asset ordering in app, service worker, and Intelligence harness;
- M6.1 retention;
- controlled Safe Regression;
- Core Stream Registry and Experience/Intelligence boundary guardrails;
- NFR-0 Foundation Regression and cross-core DB ownership guardrail.

Measured feature evidence:

- focused M6.2 projection/Collection behavior: **PASS**;
- Collection Place/TripPlace record maps: **0**;
- Web runtime adapter projection maps: **0**;
- physical runtime projection core browser tokens: **0**;
- controlled Safe Regression on `feature/platform-core`: **41 / 41 PASS**;
- tracked JS/TS files in DB ownership guardrail: **330**;
- static, mapped, unmapped, and dynamic DB debt counts: unchanged from the accepted baseline.

The non-allowlisted `nature-place-integration.test.cjs` remains a historical literal-shape artifact: it expects an obsolete `nature:{type:'nature'` shell string and fails identically on the clean source-lock marker. M6.2 does not alter Nature routing and does not rewrite that historical assertion into a passing claim.

## Rollback

Rollback is commit-only: restore the prior Web `place-runtime-store.js`, restore the Collection compatibility map, remove the new projection core and focused test, and remove the three asset-list insertions. No database or data rollback is required.
