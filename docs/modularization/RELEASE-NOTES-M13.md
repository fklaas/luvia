# M13 Memory Core and Premium Memories

## Release candidate identity

- App / Core: `13.82.44 / 4.82.44`
- Platform foundation commit: `1778fad04a0131da0f91e1b65de9fe7fa19b2962`
- Starting marker / code rollback: `b610b0fa8db5f34a631fe8c87b82f8266c3a5b75`
- Memory owner stream: `feature/platform-core`
- Premium Experience stream: `feature/consumer-experience`
- Public contract: `memory.v1`
- Status: local release candidate verified; runtime commit and deployment
  provenance will be recorded after promotion.

## Delivered

- New browserless Memory Domain/Contract Core for immutable projections,
  accent-insensitive library search, filters, paging, bounded selection,
  deterministic story composition and transfer-status policy.
- New public `LuviaMemoryContractV1` reads and commands over one existing
  compatibility provider set.
- Explicit Memory Web runtime context through `trip.v1`, `AuthSessionPort` and
  the Supabase service; no private Media Core context borrowing.
- Media and Memory database ownership split in the current architecture maps;
  historical NFR-0 evidence remains unchanged.
- Premium Memories replaces the static Memories hub with a responsive studio:
  overview metrics, transfer/offline state, stories, large-library search and
  filters, bounded multi-selection and signed preview hydration.
- Story Composer uses the central Overlay Host and persists draft/publish
  commands only through `memory.v1`.
- Existing Gallery, Albums and legacy Memory experiences remain available as
  compatibility/detail surfaces.

## Ownership and Native First

- Memory owns durable albums, cards, stories, chapters, contributions,
  curation decisions and narrative lifecycle.
- Media owns asset metadata, acquisition, object storage, delivery and upload
  state. Memory references assets by public ID.
- Journey/Timeline remains a separate cross-domain aggregator.
- Consumer and Experience own presentation only. Intelligence may propose
  stories but may not persist Memory truth without a Memory owner command.
- Browserless Memory Core contains no DOM, navigation, browser storage,
  geolocation, Supabase or fetch dependency.

## Infrastructure impact

- Database/schema/RPC/RLS/bucket migration: none.
- Supabase Edge Function change: none.
- Secret/provider change: none.
- Manual Cloudflare configuration change: none.

## Rollback

Code-only rollback to `b610b0fa8db5f34a631fe8c87b82f8266c3a5b75`.
No persisted-data or infrastructure compensation is required.
