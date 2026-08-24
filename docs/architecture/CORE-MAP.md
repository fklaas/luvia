# Luvia Core Map

## Purpose

This document gives humans and coding agents a fast architectural map.

The machine-readable locked-core registry is `config/luvia-cores.json`.

## Locked domain roots

### Trip

Root: `core/trips/`

Owner stream: `feature/platform-core`

Role: canonical Trip truth.

Public boundary: `core/platform/trip-contract-adapter.js`

Consumers must not create independent Trip truth.

### Places

Root: `core/places/`

Owner stream: `feature/platform-core`

Role: canonical Places domain behavior and Place lifecycle infrastructure.

Browserless domain surface and canonical declarative Category Registry: `core/places/places-domain-contract-core.js`

Physical in-memory state owner: `core/places/place-state-core.js`

Web compatibility/orchestration adapter: `core/places/place-core.js`

Trip-scoped Place/TripPlace runtime projection owner: `core/places/place-runtime-projection-core.js`

Web runtime/event adapter: `core/places/place-runtime-store.js`

Collection actions delegate to the runtime projection and own no second Place/TripPlace record map.

Public boundary: `core/platform/places-contract-adapter.js`

Web Platform Port implementations: `app/adapters/platform-port-adapters.mjs`

Places/Intelligence provider composition: `app/adapters/places-discovery-adapter.js`

Category routing is derived from the browserless Domain Registry. Category UI remains Consumer/Experience-owned and owns no Places truth.

Browser globals, device capabilities, persistence, Deep Links, and external navigation are confined to app/platform adapters. Places domain code consumes public contracts and injected ports.

### Booking

Root: `core/booking/`

Owner stream: `feature/booking-core`

Role: Booking truth, reservation lifecycle, mutations, provider integration and recovery.

Public boundary: `core/platform/booking-contract-adapter.js` (`booking.v1`).

The existing `LuviaBooking` facade remains the owner runtime behind this
adapter. M15 adds a bounded `openPlaceBooking` owner command so conversational
and other consumers can enter the same provider/handoff/email policy without
copying Booking routing or gaining reservation truth.

### Media

Root: `core/media/`

Owner stream: `feature/platform-core`

Role: canonical Media truth, asset metadata, Media lifecycle and upload coordination.

Browserless domain surface: `core/media/media-domain-contract-core.js`

Public boundary: `core/platform/media-contract-adapter.js`

Web object storage and offline queue adapter: `app/adapters/media-storage-web-adapter.mjs`

Media Core owns assets and their transfer lifecycle. It does not own albums,
cards, stories, chapters, contributions or narrative composition.

### Memory

Root: `core/memory/`

Owner stream: `feature/platform-core`

Role: canonical durable Memory and Narrative truth for albums, cards, stories,
chapters, contributions, curation decisions and narrative lifecycle.

Browserless domain surface: `core/memory/memory-domain-contract-core.js`

Public boundary: `core/platform/memory-contract-adapter.js` (`memory.v1`)

Web runtime context boundary:
`core/platform/memory-runtime-context-adapter.js` (`trip.v1`,
`AuthSessionPort`, Supabase service; no Media Core context borrowing)

Legacy Web/DB compatibility providers:
`core/media/memory-albums.js`, `core/media/memory-cards.js` and
`core/media/memory-journeys.js`. Their current paths do not make their durable
records Media truth. The older Memory methods on `media.v1` remain a temporary
compatibility facade and route to the same providers.

Memory references Media assets by ID and consumes sanitized `media.v1`
projections. It owns no Media asset, Trip, Places, Journey schedule, Identity,
Social membership or Intelligence reasoning truth.

### Identity

Root: `core/identity/`

Owner stream: `feature/platform-core`

Role: canonical global viewer identity and explicitly confirmed preference truth.

Browserless state/rules surface: `core/identity/identity-domain-contract-core.js`

Public boundary: `core/platform/identity-contract-adapter.js`

Web platform adapter: `app/adapters/identity-platform-web-adapter.js`

Trip context is not Identity truth. Observed or inferred preference signals are Intelligence-owned until a user explicitly confirms them.

### Events

Root: `core/events/`

Owner stream: `feature/platform-core`

Role: versioned cross-core event envelopes and causal metadata; owns no domain truth.

Browserless envelope surface: `core/events/event-contract-core.js`

Public Web boundary: `app/adapters/event-contract-web-adapter.js`

Domain Events never directly trigger browser or native notifications. Delivery requires an explicit `NotificationPort` command.

## Foundation cores

### Platform Runtime & Navigation

Root: `core/runtime/`

Owner stream: `feature/platform-core`

Role: platform-neutral App Runtime stages, canonical screen intents, declarative module-mount semantics, browserless navigation-history policy and Auth/Lifecycle/Network Runtime Action policy; owns no business Domain Truth.

Browserless surfaces: `core/runtime/app-runtime-contract-core.js`, `core/runtime/runtime-signal-policy-core.js`, `core/runtime/navigation-contract-core.js`, `core/runtime/module-mount-contract-core.js`, `core/runtime/navigation-history-policy-core.js`, `core/runtime/overlay-host-contract-core.js`.

Web boundaries: `app/navigation-registry.js`, `app/adapters/navigation-history-web-adapter.js`, `app/adapters/runtime-signal-web-adapter.js` and the Consumer-owned `app/app-shell.js` screen composer.

`navigation.v1` is the sole route/intent truth. `navigation-history.v1` projects and restores those intents; it does not define routes. Future native clients consume the same intents and provide native stack adapters.

`app-runtime-signals.v1` consumes AuthSession, Lifecycle and Network ports, stores no session/token and emits only sanitized Runtime Actions. Native clients bind the same policy to their native lifecycle/network/session adapters.

`overlay-host.v1` owns only platform-neutral overlay stack and dismissal semantics. The current `core/ui/ui-manager.js` is its explicit Web DOM compatibility host. It centralizes modal layering, focus containment, Escape/Back commands, safe-area rendering, scroll lock and session/navigation cleanup without owning Domain Truth. Native clients consume the same stack semantics through native presentation adapters. Shared visual tokens and component styling remain reserved for M10.5 Experience Core.

### Experience

Root: `core/experience/`

Owner stream: `feature/experience-core`

Role: shared design and interaction architecture.

Domain truth ownership: none.

Browserless semantic surface: `core/experience/experience-contract-core.js`

Public Web boundary: `app/adapters/experience-web-adapter.js`

Legacy compatibility facade: `core/design/design-system-contract.js`

`experience.v1` owns design-token, component, state, motion, accessibility and native presentation-mapping semantics. It stores no product or Domain Truth. Web projects the same semantics through CSS custom properties; future SwiftUI and Compose hosts consume the native mappings without importing DOM APIs.

### Intelligence

Root: `core/intelligence/`

Owner stream: `feature/intelligence-core`

Role: reasoning, orchestration, AI capabilities, Intelligence-specific memory, recommendations and proactive intelligence.

Domain truth ownership: Intelligence-specific state only.

Browserless owner surface: `core/intelligence/intelligence-domain-contract-core.js`

Public Web boundary: `core/platform/intelligence-contract-adapter.js`

The current `core/ai`, planning and recommendation runtime is migrated incrementally through this boundary. Trip, Places, Identity and Journey/Timeline are read through public owner projections; Intelligence proposal creation does not grant foreign-domain write ownership.

## Journey / Timeline Core

Owner root: `core/journey/`

Status: ACTIVE.

Domain truth ownership: derived Day Graph, temporal ordering, conflict policy and source-owner provenance only.

Browserless owner surface: `core/journey/journey-domain-contract-core.js`

Public Web boundary: `core/platform/journey-contract-adapter.js` (`journey.v1`)

Visible Consumer composition: `app/journey/journey-day-composer.js`

Legacy compatibility: `core/places/timeline-core.js` retains current Web presentation, Supabase hydration/realtime and persistence routing behind the adapter. It is not a Places truth owner and active consumers must not access it directly.

Journey may aggregate owner projections, but it must not absorb Trip, Places, Booking, Media, Identity, Social or Intelligence truth.
