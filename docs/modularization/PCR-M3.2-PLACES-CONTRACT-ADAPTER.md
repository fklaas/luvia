# Platform Change Request — M3.2 Places Contract Adapter Foundation

- PCR: `M3.2-PLACES-CONTRACT-ADAPTER`
- Build: `13.81.6`
- Core: `4.81.6`
- Contract: `places.v1`
- Owner: Places / Platform boundary
- Change type: additive architecture adapter

## Problem
Places already has productive core, provider, lifecycle, collection, planning and persistence implementations, but consumers do not have one stable versioned boundary. Direct dependencies on implementation globals make later parallel development and domain isolation harder. A rewrite would create unnecessary risk and could duplicate existing state or persistence.

## Decision
Implement `places.v1` as a thin additive adapter in `core/platform/places-contract-adapter.js`.

The adapter delegates to existing owners:
- `LuviaPlaceCore` for canonical in-memory Place reads, search orchestration, import integration and lifecycle/visit entry points.
- `LuviaPlaces` for the existing provider-backed details gateway.
- `LuviaPlaceCommands` for favorite and planning commands.
- Existing internal Places services remain persistence owners.

The adapter exposes immutable public projections and normalized command results. It does not expose `LuviaPlaceEntities`, TripPlaceData persistence, table schemas, raw backend operation names or raw provider responses as contract surface.

## Runtime globals
- `window.LuviaPlacesContractV1`
- `window.LuviaPlacesContract`

`LuviaPlacesContract` is the latest-version alias and currently references the v1 object.

## Reads
- `search(options)`
- `getPlace(placeId)`
- `listPlaces(filters)`
- `getDetails(placeId, options)`
- `getLifecycle(placeId)`

Read outputs are safe projections. Search and details responses are normalized before leaving the contract boundary.

## Commands
- `importPlace(providerPlaceId, options)`
- `favorite(options)`
- `unfavorite(options)`
- `toggleFavorite(options)`
- `clearFavorites(placeType, options)`
- `plan(options)`
- `unplan(options)`
- `updateLifecycle(tripPlaceId, value, patch, options)`
- `confirmVisit(placeId, patch)`

Commands remain delegated to existing owners. M3.2 does not create a generic repository or direct database writer. Command outputs are projected to stable contract responses.

## Event bridge
Contract events:
- `places.changed`
- `place.lifecycle.changed`
- `place.plan.changed`
- `place.favorite.changed`

Transport: existing DOM `CustomEvent`, emitted as `luvia:<contract-event-name>` with a versioned envelope containing contract event name/version, source, timestamp, safe trip/entity identifiers, projected payload and correlation metadata.

Compatibility inputs currently bridged include the existing runtime/import/lifecycle/visit/plan/favorite DOM events. Existing compatibility events remain in place; M3.2 does not replace the productive event mechanism.

## Explicit non-goals
- No new Places store.
- No new Places database tables.
- No new repository/persistence abstraction.
- No direct Supabase access from the contract adapter.
- No direct `LuviaPlaceEntities` access from the contract adapter.
- No Places provider rewrite.
- No search-performance fix.
- No search-result product redesign.
- No forced caller migration.
- No removal of legacy/compatibility APIs.
- No Booking or Social domain rewrite.

## Rollback
Remove/revert the additive Places contract adapter integration and return static build/version metadata to the previous known-good release. Because M3.2 has no database migration, Edge Function deployment or secret change, rollback is application-only.
