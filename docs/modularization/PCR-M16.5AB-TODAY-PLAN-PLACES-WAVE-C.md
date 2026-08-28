# PCR M16.5AB — Today ↔ Planen ↔ Places / Wave C

Status: approved for Integration-only implementation

## Problem

M16.5AA introduced the browserless preference resolver, but the productive Places
experience did not provide the public Identity preference projection and active
Trip composition to `places.v1.reads.recommend`. The isolated fixture therefore
proved more than the real product path delivered. Today and Journey also rendered
their own older presentation without a shared, explainable day-planning context.

## Owners and boundaries

- Identity owns durable personal preferences and hard requirements.
- Trip owns the active trip, destination and trip-specific feelings.
- Places owns provider facts, place lifecycle and the `places.plan` command.
- Journey owns only the derived day graph, ordering, open windows and conflicts.
- Intelligence derives preference resolution and planning guidance. It persists
  no Identity, Trip, Places or Journey truth and performs no foreign mutation.
- Today is a consumer projection. It renders the shared read models and routes a
  draft suggestion to Places; committing a place still requires explicit user
  confirmation through `places.plan`.

## Additive contracts

1. `LuviaTripPreferenceContextV1.snapshot()` composes public read-only projections
   from `identity.v1`, `trip.v1` and `intelligence.v1`.
2. `intelligence.v1.reads.composeDayGuidance()` derives an explainable draft from
   the preference resolution and a `journey.v1` day graph.
3. `journey.v1` adds derived `openWindows` to each day. No schedule owner changes.
4. Places receives the actual public preference and trip-composition inputs on
   every productive recommendation request and exposes the resolution visibly.

## Compatibility

All additions are optional and additive. Consumers fall back to the existing
Today, Journey and Places behaviour when a provider is unavailable. App Shell,
Living Compass navigation, Main and Production are outside the mutation scope.

## Files

- `app/adapters/trip-preference-context-adapter.js`
- `core/intelligence/trip-preference-resolution-core.js`
- `core/platform/intelligence-contract-adapter.js`
- `core/journey/journey-domain-contract-core.js`
- `app/places/places-spatial-experience.{js,css}`
- `app/today/today-composition-core.js`
- `app/today/today-experience.{js,css}`
- `app/journey/journey-day-composer.{js,css}`
- `index.html`, `sw.js`, tests and evidence

## Verification

- Browserless vertical-flow test with real public contract shapes.
- Desktop and mobile pointer/touch, keyboard, reload/back, reduced motion and
  offline checks.
- Full safe regression suite.
- Visible E2E: Today suggestion → Places recommendation → explicit plan action →
  Journey day graph update.

## Rollout and rollback

Rollout is a new immutable Integration version followed by the stable Integration
alias. Main and Production stay byte-identical. Rollback restores the previous
Integration deployment/version recorded in the release evidence.
