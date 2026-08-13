# CURRENT BUILD

- App: **13.81.6**
- Core: **4.81.6**
- Name: **M3.2 Places Contract Adapter Foundation**
- Channel: production
- Date: 2026-08-13

## Scope
- Additive runtime implementation of the M2 `places.v1` contract.
- Safe, immutable read projections over the existing `LuviaPlaceCore`, `LuviaPlaces` and `LuviaPlaceCommands` owners.
- Place commands delegate to existing owners and return normalized contract projections instead of raw backend/RPC responses.
- Versioned Places contract event envelope over the existing DOM CustomEvent transport.
- Existing Places APIs, provider adapters, persistence bridges and compatibility events remain in place.
- Adds the missing local `LuviaPlaceCore.updateLifecycle()` compatibility path for existing Places callers.

## Deployment
- Database migration: NO
- SQL deployment: NO
- Edge Functions: NO
- New secrets: NO
- Static app: YES

## Core truth
M3.2 introduces no second Places state or persistence path. `LuviaPlaceCore` remains the canonical in-memory Places core, `LuviaPlaces` is the existing gateway, and `LuviaPlaceCommands` and existing Places services remain mutation/persistence owners.
