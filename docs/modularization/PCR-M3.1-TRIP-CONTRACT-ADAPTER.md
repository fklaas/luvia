# Platform Change Request — M3.1 Trip Contract Adapter Foundation

**Status:** APPROVED FOR M3.1
**Owners:** Platform + Trip
**Contract:** `trip.v1`
**Change type:** additive runtime adapter; no data migration; no legacy removal.

## Problem
Trip already has one frontend state truth (`LuviaTripStore`) and one active-trip facade (`LuviaTripContext`), but cross-core callers do not have a single versioned public domain contract. Existing callers therefore use several shapes and compatibility fallbacks.

## Decision
Implement `core/platform/trip-contract-adapter.js` as the runtime implementation of the M2-specified `trip.v1` contract.

The adapter wraps the existing Trip owner implementations. It does not persist data, create tables, call raw RPCs, know Supabase clients, or reproduce Trip state.

## Runtime globals
- `window.LuviaTripContractV1` — immutable v1 contract.
- `window.LuviaTripContract` — latest-major alias referencing the same object.
- dynamic registration of `trip.v1` in `LuviaGlobalContracts` when that registry is available.

## Reads
- `listTrips()`
- `getTrip(tripId)`
- `getActiveTrip()`
- `getContext()`
- `subscribe(listener)`

All read methods expose immutable projections rather than raw store objects.

## Commands
- `selectActiveTrip(tripId|null)` → `LuviaTripStore.setActive`
- `createTrip(input)` → `LuviaTripCreator.save`
- `updateTrip(tripId, patch)` → `LuviaTripExperience.update`
- `joinTrip(code, memberName)` → `LuviaJoinFlow.join`

`LuviaTripStore.upsert` is intentionally not exposed.

## Event bridge
The adapter normalizes existing compatibility events into the M2 v1 envelope over DOM `CustomEvent` transport:
- `luvia:trip.changed`
- `luvia:trip.active.changed`
- `luvia:trip.membership.changed`
- `luvia:trip.timeline.changed`

Existing events remain untouched.

## Explicit non-goals
- no Trip rewrite;
- no new Trip store;
- no new database tables/views/functions;
- no direct Supabase/RPC access in the adapter;
- no removal/renaming of existing globals or legacy bridges;
- no migration of existing callers in M3.1;
- no Social runtime implementation.

## Rollback
Remove the adapter script from `index.html`/`sw.js` and delete the adapter file. Existing TripStore/TripContext/Creator/Experience/JoinFlow behavior remains available because none is replaced.
