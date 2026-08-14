# Luvia v13.81.7 / Core 4.81.7 - M3.3 Media Contract Adapter Foundation

## Purpose

M3.3 implements the previously specified `media.v1` architecture contract as an additive runtime adapter over the existing Media and Memory owners.

The build creates a stable versioned boundary for future parallel development without replacing the current Media core, Memory services, storage model or persistence paths.

## Added

- `core/platform/media-contract-adapter.js` as the runtime implementation of `media.v1`.
- Public runtime globals `LuviaMediaContractV1` and `LuviaMediaContract`.
- Stable Media reads: `listMedia`, `getMedia`, `signedUrl`, `signedOriginalUrl`.
- Stable Memory reads: `listAlbums`, `listCards`, `listJourneys`.
- Grouped owner command surfaces for Media, Albums, Cards and Journeys.
- Immutable Media/Memory projections so raw database rows and storage internals do not become public contract data.
- ID-based signed preview/original URL requests.
- Provider-method availability guards with `MEDIA_CONTRACT_PROVIDER_UNAVAILABLE`.
- Normalized contract events: `media.changed`, `media.deleted`, `media.polaroid.changed`, `memory.changed`.
- Safe event projections over existing Media/Memory compatibility events.
- Optional registration in the existing `LuviaGlobalContracts` registry.
- Service-worker shell caching for the new Media contract adapter.
- Service-worker shell coverage for existing `memory-journeys.js` and `memory-cards.js` runtime providers.
- M3.3 Media contract adapter regression test.
- M3.3 release integration regression test.
- Media readiness now checks availability of `LuviaMediaContractV1`.

## Protected internals

The public contract deliberately does not expose:

- Storage bucket names.
- Storage object paths.
- Preview or thumbnail storage paths.
- Rendered preview paths.
- Media content hashes.
- Raw Media metadata.
- Raw Media/Memory row schemas.
- Direct Supabase access.
- Direct Storage access.
- Clustering persistence internals.
- Direct OpenAI provider access.

## Preserved

- `LuviaMediaCore` remains the Media owner.
- `LuviaMemoryAlbums` remains the album owner.
- `LuviaMemoryCards` remains the card owner.
- `LuviaMemoryJourneys` remains the journey owner.
- Existing Media storage and persistence stay authoritative.
- Existing compatibility events continue to operate.
- Existing Gallery, Albums and Memories consumers continue to operate.
- No caller migration to `media.v1` is forced in M3.3.
- Existing AI behavior remains unchanged internally.
- No Booking, Places, Trip or Social runtime behavior is intentionally redesigned.

## Explicit safety boundary

`clearTripGallery` is intentionally not included as a generic `media.v1` command.

Destructive whole-trip gallery clearing remains a Media-owned explicit user-flow concern rather than a cross-core capability.

## Not included

- No Media or Gallery product redesign.
- No Albums redesign.
- No Memory World redesign.
- No Media consumer migration.
- No storage migration.
- No database migration or schema change.
- No Edge Function deployment.
- No new secret.
- No new Media provider.
- No AI capability migration.
- No removal of internal direct OpenAI coupling.
- No Social implementation.
- No removal of legacy or compatibility APIs.
