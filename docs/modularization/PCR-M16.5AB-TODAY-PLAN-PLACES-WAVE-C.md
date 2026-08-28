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

## Recovery addendum — rejected `.101`

The first public candidate (`13.82.101` / `4.82.101`, immutable Worker version
`8e422bca-586c-425f-9914-975048ab9272`) is explicitly rejected. Its visible
Today-to-Places routing worked, but provider-backed completion did not. Stable
Integration was restored to `13.82.100` before further work.

Root cause: the consumer sent a destination label to discovery but discovery did
not forward the canonical Trip destination into `LuviaPlaceEntities.searchPlaces`.
The request therefore depended on stale or absent global destination state. The
cascade also targeted 60 unique candidates for an 18-place surface and aborted
on a single failed query variant. The recovery passes the full destination on
every query, stops after the requested visible count, records every attempt and
retains successful partial results. No owner boundary or persistence rule changes.

## Recovery addendum — `.104` local release gate

The final local candidate is App/Core `13.82.104` / `4.82.104`. It completes the
Wave C consumer surface without changing owner truth:

- Today is a single non-scrolling, destination-image-led surface. Countdown,
  weather, companions, owner-safe planning counts and the explainable AI draft
  share one compact composition instead of independent dashboard panels.
- Destination photography resolves from the canonical Trip `placeId` through
  the public Places card contract first. Provider attribution remains visible.
  Curated exact assets are allowed; a semantic fallback is always identified as
  a motif fallback and never masquerades as an exact destination image.
- The existing First Trip Composer is exposed appwide in the signed-in header.
  The mobile action is a 38 by 38 pixel icon control with the accessible name
  `Neue Reise anlegen`; cancelling preserves the originating route.
- Remote cloud hydration no longer changes the visible boot phase after first
  paint. Reload, bfcache restore and tab return preserve `ready`, clear
  `aria-busy` and never reapply the legacy warm-start mask.

Local evidence: Safe Regression 121/121 PASS; Wave C, local-first boot,
destination-discovery resilience, shell, Compass and visual-inventory targeted
gates PASS. A real visible Desktop and 390x844 Mobile browser sequence covered
the exact Scharbeutz image plus attribution, per-second countdown, weather
toggle, Today to Places, the appwide new-trip action from Today and Places,
cancel return, Reload and Back. Both viewports stayed within one page, and the
browser console contained zero warnings/errors. Public Stable/Immutable
evidence and the final Cloudflare deployment identifiers are deliberately not
claimed before publication.
