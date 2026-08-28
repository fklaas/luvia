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

## Photo-first depth addendum — `.105` local release gate

App/Core `13.82.105` / `4.82.105` reduces Today’s visual obstruction without
removing any owner-backed information. The destination photograph is emitted
with `loading=eager` and `fetchpriority=high` in the first visible markup and
occupies its own depth plane; Places may replace it later with an exact,
attributed transient destination photo. Weather, companions, counts and the AI
draft remain complete but use smaller, lighter glass instruments. Pointer
movement produces restrained multi-plane depth, hover produces short lift and
four ambient orbit details add quiet motion. Touch does not drive parallax and
the complete depth/transition layer is neutral under Reduced Motion.

Local gates: 121/121 Safe Regression PASS; Wave C, destination resilience,
local-first boot, visual inventory and no-`!important` design debt PASS. The
public version identifiers and visible Stable/Immutable evidence are appended
only after the committed archive is deployed.

## Recovery addendum — `.104` local release gate

The final local candidate is App/Core `13.82.105` / `4.82.105`. It completes the
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

## Public Integration evidence — `.104`

- Runtime commit: `b0aec9eebe321a7c9aead786c864facb91a57669` on
  `integration`; the Worker was uploaded from a clean `git archive` of exactly
  that commit. The three pre-existing untracked Reel videos were neither
  archived, committed nor uploaded.
- Cloudflare version: `d3e3c56c-7d80-43e6-b3b4-c5b2a18b36b7`, 100% in
  deployment `4cad525c-de83-4822-893f-110dd80d6610`.
- Stable URL: `https://integration-luvia.njwnrvwbv5.workers.dev/`.
- Immutable URL:
  `https://d3e3c56c-integration-luvia.njwnrvwbv5.workers.dev/`.
- Clean archive, Stable and Immutable are SHA-256 byte-identical for 14/14
  critical entry, version, App Shell, Today, boot, Places, public entry,
  Service Worker, force-update and Trip-context assets.
- Safe Regression: 121/121 PASS. Targeted Wave C, local-first boot,
  destination-discovery resilience, signed-in shell, Compass and exhaustive
  visual-inventory gates PASS.
- Real visible signed-in Stable Desktop and 390x844 Mobile: exact Scharbeutz
  photo resolved as `places-exact-transient`; linked credit
  `K. P. / Google Maps`; per-second countdown and both weather modes; appwide
  38x38 mobile new-trip action; real left-click from Today and Places with
  `returnTo=today` and `returnTo=places`; cancel return; Compass reverse exit;
  Reload after background cloud synchronization; Reduced Motion. Today remains
  exactly one viewport, horizontal overflow is zero and browser warnings/errors
  are 0/0.
- Main remains `c4b6d1740ad04c291d5e27d8d18b3a32e5ed87ba` locally and
  remotely. Production remains deployment
  `578f13fc-8193-4988-88cf-93c94362fcc3`, version
  `0d26706b-8b79-4e05-b3b6-6c6314cc597c` at 100%.
- Operational rollback: deploy
  `0ad87340-4aa1-4d56-8048-d5c749d82adf@100` to `integration-luvia`.
  This is a code/assets rollback only; there is no schema, data, RLS, bucket,
  Edge Function, secret or manual non-versioned configuration rollback.
- Acceptance boundary: automated, byte-parity and visible in-app-browser
  evidence are complete. A real physical-handset acceptance by the user and
  the broader M16.5 Design Freeze remain explicitly open.
