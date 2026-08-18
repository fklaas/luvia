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

The existence of this adapter does not imply that every historical Media or Memory file already follows the final ownership model.

### Identity

Adapter:

`core/platform/identity-contract-adapter.js`

Identity-related ownership continues to follow the current ownership documentation until future isolation work locks additional roots.

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
