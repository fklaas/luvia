# PCR M13 - Memory Core and Premium Story Composition

Date: 2026-08-24

Status: IN PROGRESS - PLATFORM FOUNDATION VERIFIED

## Problem

Durable Memory truth is currently implemented by the `memory_*` database model
and three Web providers physically located below `core/media/`. The historical
`media.v1` facade exposes both Media assets and Memory narratives, which blurs
the ownership boundary and prevents a native client from consuming one stable
Memory contract without also depending on the Web Media runtime.

The measured pre-mutation baseline found durable albums, cards, stories,
chapters, contributions, reviews, votes, curation decisions and draft/publish
lifecycle. Media records are referenced by ID. This proves that Memory and
Narrative are a separate domain from Media asset acquisition, storage and
delivery.

## Owner decision

M13 establishes Memory as an explicit Core owned by
`feature/platform-core`. Memory owns:

- albums, cards and stories;
- chapters, contributions and narrative item selection;
- curation decisions and narrative lifecycle;
- deterministic library, selection and story-composition rules;
- presentation-safe transfer status projected from Media.

Memory does not own Media assets or storage paths, Trip, Places, Journey
schedule, Identity, Social membership or Intelligence reasoning. Timeline and
Journey remain an independent cross-domain Core and are not absorbed into
Memory.

## Contracts and compatibility

- Browserless owner rules: `core/memory/memory-domain-contract-core.js`.
- Public contract: `memory.v1` / `LuviaMemoryContractV1`.
- Public Web adapter: `core/platform/memory-contract-adapter.js`.
- Web runtime context: `core/platform/memory-runtime-context-adapter.js`.
- Media assets cross the boundary as IDs and sanitized `media.v1` projections.
- Existing `core/media/memory-*.js` services remain the single Web/DB
  compatibility provider set; their physical path does not confer Media
  ownership.
- Historical Memory methods on `media.v1` remain compatibility only while
  active consumers move to `memory.v1`.

## Measured architecture result

- Private `LuviaMediaCore` references in Memory providers: **4 -> 0**.
- Direct cross-domain Memory-to-Media database operations removed: **6**.
- Current cross-core DB guard: **30/30 mapped**, **39/39 unmapped baseline**,
  **27/27 dynamic baseline**, no growth.
- Browserless Memory Core: **PASS**.
- NFR-0 Native First foundation: **3/3 PASS**.
- Safe Regression after platform foundation: **70/70 PASS**.

## Database, functions, secrets and deployment

- Database migration: NONE.
- RPC/RLS/bucket change: NONE.
- Supabase Edge Function change: NONE.
- Secret/provider change: NONE.
- Manual Cloudflare configuration change: NONE.
- Runtime release/deployment: pending the Premium Memories consumer slice.

## Premium product slice

The next controlled block adds a visible, responsive Memories surface over the
public contracts: large-library search and filters, bounded selection, story
draft composition, album/story projections and explicit transfer/offline
status. The Experience owns presentation only; all durable writes route through
`memory.v1` owner commands and asset delivery remains behind `media.v1`.

## Rollback

The platform foundation is additive and contains no persisted-data migration.
Before the final runtime release it can be reverted as one code-only commit.
After release, rollback returns the runtime to the synchronized M12 marker
`b610b0fa8db5f34a631fe8c87b82f8266c3a5b75`; no data compensation is required.
