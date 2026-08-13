# Luvia Modularization — M1/M2 Architecture Pack

**Baseline:** v13.81.4 / Core 4.81.4 / `aff59be`  
**Architecture stage:** M2 — Ownership & Contract Specification  
**Runtime impact:** none

## Read in this order

1. `ARCHITECTURE-INVENTORY.md` — confirmed M1 baseline and hotspots.
2. `MODULE-OWNERSHIP.md` — normative domain/file ownership from M2 onward.
3. `M2-CONTRACT-SPECIFICATION.md` — normative read/command/event boundaries.
4. `DATABASE-DOMAIN-MAP.md` — table/function/storage ownership rules.
5. `DEPENDENCY-MAP.md` and `CROSS-CORE-ACCESS.md` — migration debt and target direction.
6. `LEGACY-MAP.md` — Paris/old-foundation compatibility and deletion gates.
7. `PARALLEL-DEVELOPMENT-RULES.md` — rules now, operational worktrees later in M4.
8. `BASELINE-REGRESSION-CHECKLIST.md` — release safety baseline.
9. `M2-EXIT-GATE.md` — formal M2 completion gate.
10. `PLATFORM-CHANGE-REQUEST-TEMPLATE.md` — mandatory template for future cross-cutting shared changes.

## Machine-readable inventories

- `FILE-OWNERSHIP.csv` — all 2,387 original baseline files classified.
- `GLOBAL-ACCESS-INVENTORY.csv` — Window/DOM/Supabase/RPC/event call-sites for future diffing.
- `DATABASE-DOMAIN-MAP.csv` — table-to-owner map.
- `CONTRACT-MATRIX.csv` — compact contract summary.
- `contracts/*.json` — seven non-runtime contract skeletons for M3 adapter implementation.

## Important boundary

These files specify architecture. They do **not** activate adapters, feature flags, new worktrees, database changes or Social runtime code. Those belong to later M-builds according to the master plan.

## M3.1 runtime implementation

`trip.v1` is now implemented additively by `core/platform/trip-contract-adapter.js`. Existing Trip implementations remain the domain truth; no caller migration or legacy removal is part of M3.1. See `PCR-M3.1-TRIP-CONTRACT-ADAPTER.md` and `M3.1-EXIT-GATE.md`.

## M3.2 runtime implementation

`places.v1` is now implemented additively by `core/platform/places-contract-adapter.js`. Existing Places implementations remain the domain truth: `LuviaPlaceCore` remains the canonical in-memory core, `LuviaPlaces` the existing gateway and `LuviaPlaceCommands` / existing Places services the mutation and persistence owners. M3.2 adds safe read/command projections, normalized contract events and the missing local `LuviaPlaceCore.updateLifecycle()` compatibility path; no caller migration, provider rewrite, database change or Places search-performance fix is part of M3.2. See `PCR-M3.2-PLACES-CONTRACT-ADAPTER.md` and `M3.2-EXIT-GATE.md`.
