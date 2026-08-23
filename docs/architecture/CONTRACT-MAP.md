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

### Media

Adapter:

`core/platform/media-contract-adapter.js`

Browserless owner contract and upload rules:

`core/media/media-domain-contract-core.js`

M7 closed the Media consumer/storage isolation. Timeline/Journey and owner-internal memory composition remain explicitly classified rather than treated as ordinary consumers.

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

Timeline/Journey is consumed only as a separately owned projection and is not reclassified as Intelligence truth.

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
