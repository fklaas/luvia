# PCR M12 - Journey Core, Day Graph and Day Composer

Date: 2026-08-24

Status: APPROVED FOR IMPLEMENTATION

## Problem

`core/places/timeline-core.js` is currently a mixed Web runtime containing cross-domain aggregation, direct database access, realtime subscriptions, owner-routed mutations, DOM presentation and overlay behavior. Its physical path and the historical file-ownership CSV incorrectly imply ordinary Places ownership even though the locked core registry has reserved it for a dedicated Journey / Timeline audit.

The measured baseline is 31,698 bytes / 174 physical lines, seven database projection sources, 43 `window` references, 30 DOM operations, 13 direct database query-builder calls and private compatibility references into Trip, Places, Media and Intelligence runtime surfaces.

## Owner decision

M12 establishes Journey as an explicit Core owned by `feature/platform-core` until a dedicated Journey stream is introduced. Journey owns only:

- immutable Day Graph composition;
- cross-source ordering and grouping;
- conflict and temporal-integrity policy;
- source provenance and owner-routing metadata;
- Journey read projections and presentation-safe action descriptors.

Journey does not own or copy Trip, Places, Media, Booking, Identity, Social or Intelligence truth. Existing source records remain owned by their current domain owners. The current database/realtime runtime remains an explicit Web compatibility adapter during M12; there is no database migration or ownership rewrite.

## Contracts

- New browserless owner surface: `core/journey/journey-domain-contract-core.js`.
- New public Web boundary: `core/platform/journey-contract-adapter.js`.
- Public contract: `journey.v1` / `LuviaJourneyContractV1`.
- Existing `LuviaTimelineCore`: compatibility provider only, not a second Journey truth.
- New Web presentation: `app/journey/journey-day-composer.js` and `app/journey/journey-day-composer.css`.

## Backward compatibility

The complete `LuviaTimelineCore` surface remains available during M12. The new contract delegates hydration, realtime and legacy owner-routed commands to that compatibility provider while recomposing its projection through the browserless Journey Core. App Shell and Dashboard consume `journey.v1` plus the Day Composer; legacy product modules continue to work during controlled adoption.

## Affected streams and files

Primary implementation stream: `feature/platform-core`.

Shared runtime and registry files require this PCR:

- `config/luvia-cores.json`;
- `core/platform/journey-contract-adapter.js`;
- `index.html`;
- `sw.js`;
- shared architecture maps and ownership registry;
- controlled regression allowlist.

Consumer runtime adoption is limited to the shared App Shell and Dashboard widget boundary. It changes no Consumer-owned Domain Truth.

## Database, Functions and secrets

- Database migration: NONE.
- RPC/RLS/bucket change: NONE.
- Supabase Edge Function change: NONE.
- Secret/provider change: NONE.
- Manual Cloudflare configuration change: NONE.

## Test plan

- browserless Journey Core unit and immutability tests;
- deterministic Day Graph, provenance and conflict tests;
- contract/load-order and active App Shell adoption guard;
- legacy compatibility API preservation;
- NFR-0 3/3;
- cross-core DB ownership guardrail with no growth;
- controlled Safe Regression;
- authenticated Integration and Production acceptance, including responsive Day Composer and F5 stability.

## Rollout

The public Journey contract is additive. The active Dashboard switches to the new Day Composer in the same release after all local gates pass. Existing `LuviaTimelineCore` remains rollback-compatible.

## Rollback

Code-only rollback to the synchronized M11 marker `06b6c069471cd0c744390553c3dbecbf9b7b0c0b`. No persisted-data compensation is required because M12 introduces no schema or data migration.
