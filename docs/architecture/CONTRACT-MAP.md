# Luvia Contract Map

## Purpose

Contracts protect consumers from private domain implementation details.

## Existing contract-adapter foundations

### Trip

Adapter:

`core/platform/trip-contract-adapter.js`

Current M5 work is systematically replacing direct TripStore / TripContext consumer access with this boundary.

### Places

Adapter:

`core/platform/places-contract-adapter.js`

Places remains responsible for Places-domain behavior and persistence.

M15 adds the bounded `getCard` read for conversational and other rich-result
consumers. It returns the immutable Place projection plus optional owner-
resolved image URL and attribution; provider-photo mechanics remain behind the
Places adapter.

### Booking

Public name:

`LuviaBookingContractV1`

Web adapter:

`core/platform/booking-contract-adapter.js`

The adapter exposes the established Booking reads and commands over the
existing `LuviaBooking` owner runtime. `openPlaceBooking` enters the same
provider, tracked-handoff and verified e-mail fallback owned by Booking; a
calling consumer never receives reservation truth or provider secrets.

### Media

Adapter:

`core/platform/media-contract-adapter.js`

Browserless owner contract and upload rules:

`core/media/media-domain-contract-core.js`

M7 closed the Media consumer/storage isolation. Timeline/Journey and owner-internal memory composition remain explicitly classified rather than treated as ordinary consumers.

`media.v1` remains the public asset and transfer boundary. Its historical
Memory reads and commands are retained only as compatibility while active M13
consumers adopt `memory.v1`.

### Memory

Public name:

`LuviaMemoryContractV1`

Web adapter:

`core/platform/memory-contract-adapter.js`

Web runtime context adapter:

`core/platform/memory-runtime-context-adapter.js`

Browserless owner rules and composition policy:

`core/memory/memory-domain-contract-core.js`

M13 establishes Memory as the owner of durable albums, cards, stories,
chapters, contributions, curation decisions and narrative lifecycle. Media
assets stay Media-owned and are referenced by ID through `media.v1`.

The existing `core/media/memory-albums.js`, `memory-cards.js` and
`memory-journeys.js` services remain one set of Web/DB compatibility providers
behind the adapter until their physical relocation is separately proven safe.

### Identity

Adapter:

`core/platform/identity-contract-adapter.js`

M8 locks the Identity root and its browserless read/write rules; Web persistence remains an adapter around that owner state.

Browserless owner state and rules:

`core/identity/identity-domain-contract-core.js`

M8 locks global viewer identity and explicit preferences as Identity truth. Trip context remains Trip-owned; inferred or observed signals remain Intelligence-owned until explicit confirmation.

### Events

Adapter:

`app/adapters/event-contract-web-adapter.js`

Browserless envelope contract:

`core/events/event-contract-core.js`

`events.v1` standardizes event identity, time, owner, source, subject, correlation and causation. Notification eligibility is metadata only; delivery always requires an explicit platform command.

## Intelligence

Public name:

`LuviaIntelligenceContractV1`

Web adapter:

`core/platform/intelligence-contract-adapter.js`

Browserless owner rules:

`core/intelligence/intelligence-domain-contract-core.js`

M8.5 activates sanitized capability, domain/tool, model-tier, policy, memory/system diagnostics and reasoning reads plus proposal creation. Foreign-domain mutation is not part of `intelligence.v1`; it remains delegated to the respective owner command.

M15 adds `intelligence.actions.v1` as a supplemental browserless owner surface
for action definitions, effects, confirmation requirements, structured rich
results and receipts. Its Web runtime may auto-run registered READ actions;
WRITE and EXTERNAL actions require a direct user gesture or explicit
confirmation and the public command of the declared owner contract.

Timeline/Journey is consumed only as a separately owned projection and is not reclassified as Intelligence truth.

## Experience

Public name:

`LuviaExperienceContractV1`

Web adapter:

`app/adapters/experience-web-adapter.js`

Browserless semantic contract:

`core/experience/experience-contract-core.js`

Legacy facade:

`core/design/design-system-contract.js`

`experience.v1` defines shared tokens, component roles and variants, UI state semantics, motion/reduced-motion policy, accessibility thresholds and explicit SwiftUI/Compose mappings. It owns no product or Domain Truth. `overlay-host.v1` remains the lifecycle owner for dialogs and sheets; Experience defines their presentation semantics.

## Platform Runtime & Navigation

Browserless contracts:

- `app-runtime.v1` — ordered readiness, failure and recovery stages;
- `app-runtime-signals.v1` — idempotent Auth/Lifecycle/Network transitions and sanitized session/resume/reconnect actions;
- `module-mount.v1` — serialized mount/unmount transitions from canonical descriptors;
- `navigation.v1` — routes, aliases, immutable `screen.navigate` intents and Deep-Link serialization;
- `navigation-history.v1` — idempotent push/replace/restore policy and Back/Forward commands.

Web bindings:

- `LuviaNavigationContractV1` through `app/navigation-registry.js`;
- `LuviaNavigationHistoryV1` through `app/adapters/navigation-history-web-adapter.js`;
- `LuviaAppRuntimeSignalsV1` through `app/adapters/runtime-signal-web-adapter.js` over AuthSession/Lifecycle/Network ports;
- Consumer commit boundary through `app/app-shell.js` only after successful screen mount.

History and Runtime Signals are Platform projections, not route/session/Domain Truth owners. Intelligence may request a sanitized Navigation Intent but cannot bypass Domain Commands through screen navigation or Runtime Actions.

## Dependency principle

Contracts may expose stable projections and supported commands.

They must not expose another core's private mutable state as a new global dependency.

## Consumer Today Composition

Public contract:

`consumer.today-composition.v1`

Browserless composition core:

`app/today/today-composition-core.js`

Web presentation adapter:

`app/today/today-experience.js`

M11 composes read-only Trip, Travel Identity, Attention, Experience and Network projections into an immutable Today view model. It owns presentation state only: no Trip, Booking, Places, Media, Identity, Intelligence or Journey truth, no DB/RPC/Supabase access and no foreign-domain command execution.

The Journey widget remains outside this Consumer contract and is embedded through the explicit `journey.v1-read-only` projection boundary. The global Luvia AI Command Surface is opened through the established Overlay Host; M11 grants it no autonomous mutation authority.

## Journey

Public contract:

`journey.v1`

Browserless owner core:

`core/journey/journey-domain-contract-core.js`

Web compatibility adapter:

`core/platform/journey-contract-adapter.js`

Reads expose immutable Day Graph, entries, conflicts and subscriptions. Commands route hydration, Journey events, legacy schedule editing and owner-specific open actions through one compatibility provider. The contract owns derived ordering, temporal integrity and provenance only; foreign domain truth remains with Trip, Places, Booking, Media, Identity, Social and Intelligence.
