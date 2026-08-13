# Luvia v13.81.5 / Core 4.81.5 — M3.1 Trip Contract Adapter Foundation

## Purpose
M3.1 is the first runtime implementation step after the M2 ownership/contract specification. It proves the adapter pattern on Trip without rewriting the Trip Core.

## Added
- `core/platform/trip-contract-adapter.js`
- runtime globals `LuviaTripContractV1` and `LuviaTripContract`
- `trip.v1` registration in `LuviaGlobalContracts`
- immutable reads: list/get/active/context/subscribe
- owner-command delegation: select/create/update/join
- v1 DOM event envelope for Trip change, active change, membership change and timeline change
- M3.1 PCR, exit gate and regression tests
- release hygiene: `force-update.html` now points to the current `13.81.5` build instead of the stale `13.71.0` target recorded during M2 baseline analysis

## Preserved
- `LuviaTripStore` remains the state owner.
- `LuviaTripContext` remains the active-trip facade.
- `LuviaTripCreator`, `LuviaTripExperience`, `LuviaJoinFlow` remain the existing Trip-owned use cases.
- current `luvia:trips-changed`, `luvia:trip-context-changed`, `luvia:members-changed`, timeline events and legacy aliases remain intact.

## Not included
No DB migration, no Edge Function change, no secret change, no Social implementation, no migration of existing consumers, no removal of legacy Paris compatibility.
