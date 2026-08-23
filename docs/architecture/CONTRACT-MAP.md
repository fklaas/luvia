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

## Planned Intelligence contract

Planned public name:

`LuviaIntelligenceContractV1`

Planned adapter:

`core/platform/intelligence-contract-adapter.js`

Status:

PLANNED ONLY.

M4.5.3 does not implement this contract.

The later Intelligence Core Isolation & Unification milestone will define its exact methods after current AI / Intelligence services have been classified.

## Dependency principle

Contracts may expose stable projections and supported commands.

They must not expose another core's private mutable state as a new global dependency.
