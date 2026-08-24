# PCR M15 - Actionable Intelligence and Rich Results

Date: 2026-08-24

Status: APPROVED FOR IMPLEMENTATION / SCOPE LOCKED

## Problem

M14 established a reliable conversational composer with visible history,
keyboard submission and selectable follow-up prompts. The conversation still
returns text only. It cannot present provider-backed Places results as rich
cards and cannot route an explicit user action into the responsible owner
contract. This creates a product gap: Luvia can discuss a restaurant or a day,
but the same conversation cannot yet discover a real restaurant, show its
facts and image, offer planning/favourite/reservation actions or provide a
verifiable receipt.

## Measured baseline

- `intelligence.v1` exposes nine READ/DRAFT capabilities and a proposal path;
  no generic owner-action protocol exists.
- Places already exposes `places.v1` reads for search, details and
  recommendations plus owner commands for import, favourite and planning.
- The Places details projection currently omits a bounded card-image
  projection, although the owner runtime can resolve provider photos.
- `booking.v1` is specified and its current facade is `LuviaBooking`; the Web
  runtime has a proven owner Booking flow, but no explicit v1 adapter object.
- Journey exposes `journey.v1` reads and owner commands and remains the sole
  owner of the derived Day Graph, ordering, conflicts and provenance.
- The M14 Intelligence dialog is the only in-scope visible consumer. It owns
  no foreign Domain Truth and has no direct database access.

## Owners and affected contracts

- Platform owns additive Web adapters, runtime load order and deployment
  assets.
- Intelligence owns capability/action policy, request routing, orchestration,
  structured results, receipts and the conversational application surface.
- Experience owns rich-result presentation semantics and accessibility only.
- Places retains all Place truth and provider facts through `places.v1`.
- Booking retains all reservation truth and execution through `booking.v1`.
- Journey retains Day Graph truth through `journey.v1` and is not
  reclassified as a Places or Intelligence consumer.

Contract changes are additive within major version 1:

- `places.v1` gains a bounded `getCard` read returning an immutable Place
  projection and optional image projection with attribution.
- `booking.v1` gains an explicit Web compatibility adapter over the existing
  owner facade and a command for opening the existing Place booking flow.
- `intelligence.v1` gains a supplemental browserless action/rich-result
  protocol and a Web action runtime. It never receives foreign persistence or
  mutation ownership.

## Scope

M15 delivers one end-to-end restaurant and day-planning pilot:

1. recognize a restaurant or day-plan intent without requiring a second
   navigation step;
2. run safe READ actions automatically through public owner contracts;
3. return structured message, Place collection and Day Plan results;
4. render provider-backed restaurant cards with image, rating, address,
   evidence and contextual actions inside the conversation;
5. route favourite and planning commands only after an explicit user gesture;
6. open the existing Booking owner flow from a restaurant card;
7. show immutable success/failure receipts and keep the conversation active;
8. fall back to the existing Intelligence answer path when no registered
   action matches or an owner read is unavailable.

This pilot defines the extensible protocol for later app-wide capability
adoption. It does not claim that every Luvia command is already implemented.

## Backward compatibility

- Existing `LuviaIntelligenceContractV1`, `LuviaPlacesContractV1`,
  `LuviaBooking` and M14 composer entry points remain available.
- Existing READ/DRAFT capability counts and M8.5 semantics remain unchanged;
  the new action definitions live in a supplemental Intelligence owner core.
- Text-only `brain.ask` remains the bounded fallback.
- Existing Places and Booking screens, direct navigation and event names are
  preserved.

## Files and streams

Platform / `feature/platform-core`:

- `core/platform/places-contract-adapter.js`
- `core/platform/booking-contract-adapter.js`
- `index.html`
- `sw.js`
- registries, architecture maps, contract metadata and M15 PCR/tests

Intelligence / `feature/intelligence-core`:

- `core/intelligence/intelligence-action-contract-core.js`
- `core/ai/ai-action-runtime.js`
- `core/ai/ai-dashboard-service.js`
- focused M15 browserless/runtime tests

Experience / `feature/experience-core`:

- `core/experience/experience-foundation.css`
- focused M15 rich-result accessibility/viewport test

## Native First Ready

- The action definition and rich-result normalizers are browserless.
- Definitions refer to owner contract IDs and command names, not Web globals.
- Web globals, provider-photo resolution, DOM rendering and the Booking modal
  stay in Web adapters/application/Experience code.
- iOS and Android can bind the same action IDs and result kinds to SwiftUI and
  Compose while implementing owner contracts with native adapters.
- No new `document`, `navigator`, browser storage, direct navigation or
  Supabase dependency enters the browserless Intelligence owner core.

## Database, Functions, secrets and deployment

- Database/schema/RPC/RLS/bucket migration: NONE.
- Supabase Edge Function change: NONE.
- Secret/provider change: NONE.
- Manual Cloudflare configuration change: NONE.
- Deployment follows the existing automatic Integration/Main path; causation
  is recorded only when byte/version evidence proves it.

## Test and release plan

- Browserless action-policy, immutability, sanitization, confirmation and
  foreign-owner invariants.
- Places card and Booking adapter contract tests.
- Action runtime test with public owner-contract stubs only.
- Rich-result accessibility, keyboard, mobile viewport and reduced-motion
  guard.
- Existing M14 composer, M8.5 Intelligence isolation, M12 Journey separation,
  complete Safe Regression and NFR-0 suites.
- Integration Preview byte/privacy/authenticated desktop/mobile checks and
  25 authenticated F5 samples.
- Main fast-forward promotion, Production byte/privacy/authenticated checks
  and 25 authenticated F5 samples.

## Rollout and rollback

The changes are additive and ship with the App/Core release identity. If the
registered action path cannot produce a safe owner result, the composer uses
the unchanged text fallback. Rollback is code-only to the synchronized M14
documentation marker `bb31c530a974b0d50da63887a46bc7a39b32b2bb`; no data
or infrastructure compensation is required.
