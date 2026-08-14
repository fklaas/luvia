# Platform Change Request - M3.3 Media Contract Adapter Foundation

- PCR: `M3.3-MEDIA-CONTRACT-ADAPTER`
- Build: `13.81.7`
- Core: `4.81.7`
- Contract: `media.v1`
- Owner: Media/Memory / Platform boundary
- Change type: additive architecture adapter

## Problem

Media and Memory already have productive implementations for media storage, gallery data, albums, cards and journeys. Consumers, however, do not yet have one stable versioned boundary.

Direct dependencies on Media implementation globals, storage paths, raw media/memory rows and provider-specific persistence make later parallel development harder and risk leaking internal structures across domain boundaries.

A Media rewrite would duplicate existing state, storage and persistence and would therefore create unnecessary migration risk.

## Decision

Implement `media.v1` as a thin additive adapter in:

`core/platform/media-contract-adapter.js`

The adapter delegates to the existing owners:

- `LuviaMediaCore` for canonical Media reads, uploads, updates, reanalysis, favorite state, polaroid state, Place linking and removal.
- `LuviaMemoryAlbums` for album-owned reads and mutations.
- `LuviaMemoryCards` for card-owned reads and mutations.
- `LuviaMemoryJourneys` for journey-owned reads and mutations.

No new Media store, Memory store, repository, storage bucket or persistence path is introduced.

The adapter exposes safe immutable projections so storage bucket names, storage paths, thumbnail/preview paths, content hashes, raw metadata and other internal row details do not become part of the public contract.

## Runtime globals

- `window.LuviaMediaContractV1`
- `window.LuviaMediaContract`

`LuviaMediaContract` is the latest-version alias and currently references the v1 contract object.

## Reads

- `listMedia(options)`
- `getMedia(mediaId)`
- `signedUrl(mediaId, expiresIn)`
- `signedOriginalUrl(mediaId, expiresIn)`
- `listAlbums()`
- `listCards(filters)`
- `listJourneys()`

Signed URL reads deliberately accept a Media ID. The adapter resolves the internal owner entity before delegating to `LuviaMediaCore`; callers do not need a storage path or raw Media row.

## Commands

Media-owned commands:

- `commands.media.upload(file, options)`
- `commands.media.update(mediaId, patch)`
- `commands.media.reanalyze(mediaId)`
- `commands.media.toggleFavorite(mediaId)`
- `commands.media.setPolaroid(mediaId, dayKey)`
- `commands.media.linkPlace(mediaId, placeId, options)`
- `commands.media.remove(mediaId)`

Album-owned commands:

- `commands.albums.save(input)`
- `commands.albums.remove(id)`
- `commands.albums.setFavorite(albumId, mediaId)`
- `commands.albums.saveContribution(albumId, input)`

Card-owned commands:

- `commands.cards.save(input)`
- `commands.cards.setWeight(id, weight)`
- `commands.cards.dismiss(id)`
- `commands.cards.setAlbumReview(cardId, decision)`
- `commands.cards.saveAlbumVotes(clusterId, votes, budget)`
- `commands.cards.updateStory(id, content)`
- `commands.cards.syncPhotoCandidates(clusterId, mediaIds)`
- `commands.cards.saveTitleProposal(clusterId, title)`
- `commands.cards.dissolveStack(clusterId)`

Journey-owned commands:

- `commands.journeys.save(input)`
- `commands.journeys.saveContribution(journeyId, input)`
- `commands.journeys.remove(id)`

The destructive `LuviaMediaCore.clearTripGallery()` operation is intentionally NOT exposed as a generic `media.v1` command. It remains available only to an explicit authorized Media-owned user flow.

## Event bridge

Contract events:

- `media.changed`
- `media.deleted`
- `media.polaroid.changed`
- `memory.changed`

Transport remains the existing DOM `CustomEvent` mechanism, emitted as `luvia:<contract-event-name>`.

Existing Media and Memory compatibility events remain active. M3.3 bridges them into a safe contract envelope rather than introducing a second event bus.

Event payloads expose only safe identifiers and normalized state. Storage paths and raw internal event payloads do not cross the contract boundary.

## Global contract registry

If `LuviaGlobalContracts` is available, the adapter registers `media.v1` with its owner, API and readiness probe.

The adapter does not introduce a second registry.

## Service Worker integration

M3.3 adds shell-cache coverage for:

- `core/platform/media-contract-adapter.js`
- `core/media/memory-journeys.js`
- `core/media/memory-cards.js`

The latter two existing runtime providers were loaded by `index.html` but were not previously present in the service-worker application shell.

## Explicit non-goals

- No new Media state store.
- No new Memory state store.
- No new storage bucket.
- No new Media or Memory database tables.
- No new repository or persistence abstraction.
- No direct Supabase access from the contract adapter.
- No direct Storage access from the contract adapter.
- No raw media/memory table access from the contract adapter.
- No Media redesign.
- No Gallery redesign.
- No Albums redesign.
- No Memory World redesign.
- No forced caller migration.
- No legacy Media deletion.
- No destructive `clearTripGallery` exposure.
- No AI capability migration.
- No direct OpenAI provider cleanup in this build.
- No Booking, Places, Trip or Social domain rewrite.

## Known deferred debt

Existing direct OpenAI provider coupling in Media/Memory-related implementation code remains outside the public contract but still exists internally.

That debt is intentionally deferred to the later Intelligence capability migration. M3.3 must not create a second AI abstraction merely to hide it.

## Rollback

M3.3 is additive and application-only.

Rollback means redeploying the previous known-good release:

`13.81.6 / Core 4.81.6`

No database rollback, migration repair, Supabase Function rollback, storage rollback or secret rollback is required.
