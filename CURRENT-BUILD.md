# CURRENT BUILD

- App: **13.81.7**
- Core: **4.81.7**
- Name: **M3.3 Media Contract Adapter Foundation**
- Channel: production
- Date: 2026-08-14

## Scope
- Additive runtime implementation of the M2 `media.v1` contract.
- Introduces `LuviaMediaContractV1` / `LuviaMediaContract` as the stable public Media/Memory boundary.
- Safe immutable projections prevent exposure of storage paths, raw media/memory rows, metadata internals and provider-specific persistence details.
- Media commands delegate to the existing `LuviaMediaCore`; album/card/journey commands delegate to their existing Memory owner services.
- Signed preview/original URL requests accept a media ID and internally resolve the owner entity without exposing storage internals.
- Existing Media/Memory compatibility events remain intact while normalized `media.v1` events are published through the existing DOM CustomEvent transport.
- `clearTripGallery` remains intentionally outside the generic public contract.
- No existing Gallery, Albums, Memories or Consumer caller is migrated in M3.3.
- Adds missing Service Worker shell coverage for `memory-journeys.js`, `memory-cards.js` and the new Media contract adapter.

## Deployment
- Database migration: NO
- SQL deployment: NO
- Edge Functions: NO
- New secrets: NO
- Static app: YES

## Core truth
M3.3 introduces no second Media or Memory state, storage system or persistence path. `LuviaMediaCore`, `LuviaMemoryAlbums`, `LuviaMemoryCards` and `LuviaMemoryJourneys` remain the implementation owners. The new adapter is a strangler boundary only. Direct Media-to-OpenAI provider coupling remains known migration debt and is not changed in M3.3.
