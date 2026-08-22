# PCR M6.1 — Places State Core Foundation

Status: **COMPLETE / PRODUCTION VERIFIED**. Scope was locked from the read-only baseline and implementation remained limited to the physical Places record-state boundary.

Baseline commit: `5cb5161f942cf67b6378c954befae94f6d541203`

Owner stream: `feature/platform-core`

Public contract: `places.v1` (unchanged)

## Measured baseline

`core/places/` contains 33 active files: 30 JavaScript and 3 CSS files, 298235 bytes in the Git working copy. Every one of the 30 JavaScript files references `window`; the directory therefore has no browserless Places implementation at baseline.

Measured browser and platform coupling inside `core/places/`:

- `window`: 340 references across 30 files.
- `document`: 30 references across 7 files.
- `navigator`: 10 references across 3 files.
- `navigator.geolocation`: 5 references in `presence-visit-core.js`.
- `sessionStorage`: 2 references in `places-final-foundation.js`.
- Direct external navigation: one `window.open` path in `places-final-foundation.js`.
- Direct Supabase/client/table access: five files when Timeline is included; four ordinary Places files plus the reserved Timeline/Journey aggregator.
- Direct RPC: `trip-place-data-service.js` calls `luvia_upsert_trip_place_fields`.
- Trip Contract references: 30 references across 8 files.
- Private Trip compatibility reference: one `LuviaTripContext` read in reserved `timeline-core.js`; no ordinary Places file reads private Trip Store/Context.

The NFR-0 native-readiness debt JSON remains an immutable historical baseline. This PCR records current measurements without rewriting the historical classifications.

## Ownership and state findings

Canonical Places entity records are held by the `records` map in `core/places/place-core.js`. The current Web API `window.LuviaPlaceCore` / `window.LuviaPlacesCore` reads and mutates that map.

Two other stateful compatibility paths remain and are explicitly outside this slice:

- `place-runtime-store.js` holds trip/type-indexed runtime projections used by Places modules.
- `place-collection-service.js` holds a compatibility lookup/optimistic projection and delegates authoritative lifecycle mutations to the cloud service.

This PCR does not claim those projections are already proven free of duplicated truth. They require a later read/write/rehydration audit before consolidation or removal. The M6.1 implementation must not add another Place record map to `place-core.js`.

Places lifecycle persistence is currently split across compatibility services for `places`, `trip_places`, `trip_place_data`, and `place_visits`. No database, RPC, migration, Edge Function, secret, or data ownership change is allowed in this slice.

## Contract and routing findings

`core/platform/places-contract-adapter.js` exposes `places.v1` with reads for search/place lists/details/lifecycle, commands for import/favorite/plan/lifecycle/visit, normalized events, and immutable projections. It remains the public Web compatibility boundary and is unchanged in M6.1.

Category and discovery routing is not yet single-source:

- `global-place-contracts.js` defines ten discovery categories and intent/ranking rules.
- `places-final-foundation.js` defines a second ten-category UI/routing map.
- `place-type-definitions.js` registers seven type definitions.
- `modules/places-shell.js` exposes six catalog modules; Mobility is intentionally outside the Places hub.

Category UI remains Experience-owned. Centralization is deferred until a declarative domain routing contract can be introduced without moving layout or navigation ownership into Places.

AI and provider search currently enter through compatibility services in `intelligence/places-service.js` and `intelligence/place-entity-service.js`. They are gateway/orchestration paths, not owners of Places Truth. Moving them is excluded from M6.1.

## Platform-port findings

The NFR-0 registry declares `LocationPort`, `PermissionPort`, `DeepLinkPort`, `ExternalNavigationPort`, `NetworkPort`, `StoragePort`, and `OfflineCachePort`, but no productive Web implementations are registered through that registry at baseline.

`core/location/global-location-bootstrap.js` is an existing Web-specific bootstrap, not a runtime-neutral LocationPort binding. It and `presence-visit-core.js` currently call each other, so Location extraction requires a dedicated follow-up scope with an explicit dependency direction. It is not bundled into state isolation.

## Timeline / Journey reservation

`core/places/timeline-core.js` is a cross-domain Journey/Timeline aggregator. It directly joins Trip, Places, schedule, visit, member, and timeline data and has its own mutation/realtime paths. It is not classified as an ordinary Places consumer and is excluded from M6.1. No Timeline file, contract, query, mutation, or ownership marker may change in this slice.

## M6.1 mutation scope

The first safe mutation is a one-to-one physical extraction of the existing `place-core.js` record map into `core/places/place-state-core.js`.

Required invariants:

1. The new state core owns the one existing in-memory Place record map.
2. The new state core has zero browser, DOM, storage, network, Supabase, or device references.
3. `place-core.js` becomes the Web compatibility/orchestration adapter and contains no second record map.
4. The existing `window.LuviaPlaceCore` / `window.LuviaPlacesCore` public surface and behavior remain compatible.
5. `places.v1` remains unchanged.
6. Runtime asset order loads the state core before the Web adapter.
7. A browserless focused guardrail enters the controlled Safe Regression suite.

## Explicit exclusions

- No DB/RPC/schema/migration change.
- No Edge Function, secret, or Cloudflare configuration change.
- No Places contract-surface change.
- No Location/Permission/Network/Storage/OfflineCache port adoption.
- No Deep Link or External Navigation rewrite.
- No category/discovery centralization.
- No Intelligence migration.
- No Experience/UI/CSS change.
- No Timeline/Journey change.
- No consolidation or deletion of runtime/collection compatibility projections.

## Rollback

Revert the M6.1 feature commit. The rollback restores the record map to `place-core.js`, removes the new runtime asset and focused test, and requires no data rollback because the slice changes no persistence or schema.
