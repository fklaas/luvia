# Luvia v13.81.6 / Core 4.81.6 — M3.2 Places Contract Adapter Foundation

## Purpose
M3.2 implements the previously specified `places.v1` architecture contract as an additive runtime adapter over the existing Places domain. The build creates a stable, versioned boundary for future parallel development without replacing the current Places core, provider gateway, command layer or persistence paths.

## Added
- `core/platform/places-contract-adapter.js` as the runtime implementation of `places.v1`.
- Public runtime globals `LuviaPlacesContractV1` and `LuviaPlacesContract`.
- Stable reads: `search`, `getPlace`, `listPlaces`, `getDetails`, `getLifecycle`.
- Stable commands: `importPlace`, `favorite`, `unfavorite`, `toggleFavorite`, `clearFavorites`, `plan`, `unplan`, `updateLifecycle`, `confirmVisit`.
- Immutable Place, detail, command and visit projections so raw provider/backend/RPC payloads do not become public contract data.
- Versioned DOM CustomEvent envelopes for `places.changed`, `place.lifecycle.changed`, `place.plan.changed` and `place.favorite.changed`.
- Compatibility event bridges from the existing Places runtime events.
- Service-worker shell caching for the Places contract adapter.
- M3.2 contract and release integration regression tests.
- Missing local `LuviaPlaceCore.updateLifecycle(id,value)` compatibility method for existing callers. This method only updates the existing in-memory Place core and does not create a new cloud persistence path.

## Preserved
- `LuviaPlaceCore` remains the canonical in-memory Places core.
- `LuviaPlaces` remains the existing Places gateway for provider-backed details/search integration.
- `LuviaPlaceCommands` and existing Places services remain mutation/persistence owners.
- `LuviaPlaceEntities`, `TripPlaceData` and existing backend/RPC persistence stay internal.
- Existing compatibility events and existing Places consumers continue to operate.
- No caller migration to `places.v1` is forced in M3.2.
- No Booking Core, Trip Core, Media Core or Social runtime behavior is changed.

## Not included
- No Places search performance optimization.
- No change to the known slow free-text/AI Places search behavior.
- No change to result repetition, result count or refresh/"more results" product behavior.
- No Places UI redesign.
- No provider rewrite and no new provider.
- No database migration or schema change.
- No Edge Function deployment.
- No new secret.
- No Social implementation.
- No removal of legacy or compatibility APIs.
