# M15 Release Notes - Actionable Intelligence and Rich Results

Date: 2026-08-24

Status: COMPLETE / CLOSED / PRODUCTION VERIFIED

App / Core: 13.82.47 / 4.82.47

Runtime source: `d39ed496d45b38cc6722cd0668d25f99e490940c`

## Outcome

M15 turns the M14 Luvia conversation from a text-only assistant into the first
owner-backed action surface. Luvia can identify registered restaurant and
day-planning intents, automatically execute safe READ operations through
public contracts, render rich Place or Journey results in the chat and offer
explicit owner actions. Intelligence still owns no Trip, Places, Booking or
Journey truth and cannot silently mutate another Core.

## Visible product changes

- The conversation keeps a real chronological history, visible submit action,
  Enter submit, Shift+Enter newline, in-flight guard and selectable prompts.
- Restaurant requests can return real Places cards with image attribution,
  name, address, rating, opening state, reasons and actions.
- The Booking action reuses the Booking owner flow; it does not create a
  second reservation implementation inside Intelligence.
- Day-planning requests return Journey Day Graph cards with conflicts and
  entries and can open the Journey planning editor after a user gesture.
- Owner commands return immutable success/failure receipts in the same chat.
- Unregistered intents keep the M14 bounded Intelligence text fallback.
- The natural prompt "Plane einen entspannten Tag für mich" is explicitly
  covered and produces a Journey Rich Result rather than free text.

## Places reliability incident closed

The production provider already returned real vegetarian Places for the
reported Scharbeutz search, including authoritative
`servesVegetarianFood=true` evidence. The Web filter discarded them because it
required the literal words vegetarian or vegan in text fields. The owner
filter now accepts verified positive provider evidence while continuing to
reject negative, unknown or conflicting dietary evidence.

Places breadth is no longer a small fixed visible sample:

- at most five bounded query variants;
- at most 60 unique candidates before ranking;
- at most 18 ranked results in the Places screen;
- six initial cards and progressive "six more" disclosure;
- no second Places truth store and no new device/browser dependency in the
  Places Domain Core.

## Booking route incident closed

The Integration Booking modal fell back to "Keine E-Mail verfügbar" because
`booking-route-resolve` returned only the Production CORS origin. Resolver
2.5.1 now emits request-scoped CORS for an explicit allowlist covering
Production, Integration, immutable account-owned Luvia previews and local
development. Unknown origins receive 403 with `Access-Control-Allow-Origin:
null`; no wildcard is used.

The authenticated probe for Restaurant Cafe Diercksen returned two verified
candidates from seven checked pages and selected the official-site e-mail
fallback. That is the correct order for this venue because no healthy direct
reservation provider was proven.

## Architecture and contracts

- Supplemental contract: `intelligence.actions.v1`.
- Registered actions: six.
- Rich-result kinds: message, Place collection, Day Plan, receipt,
  clarification and error.
- Automatic execution: registered READ plus confirmation NEVER only.
- WRITE/EXTERNAL: direct user gesture or explicit confirmation plus owner
  command.
- Places remains the provider-fact and Place-truth owner.
- Booking remains the reservation and handoff owner.
- Journey remains the independent cross-domain Day Graph owner; it was not
  absorbed into Places or Intelligence.
- Web globals remain compatibility bindings. Browserless action definitions
  and result normalization can be shared with native iOS and Android owners.

## Changed file groups

- Intelligence: action contract, Web action runtime and conversational rich
  result integration.
- Platform: Places and Booking public adapters, contract maps, registry,
  runtime load order and Service Worker assets.
- Places: dietary evidence filter, bounded multi-query breadth and progressive
  screen disclosure.
- Booking: public chat entry and `booking-route-resolve` request-scoped CORS.
- Experience: responsive Place/Day/receipt presentation, trip-accent
  inheritance, reduced-motion and touch-target rules.
- Tests/docs: M15.0-M15.8 guardrails, regression harness, PCR, release notes,
  test evidence and ownership registry.

## Commits

- Platform foundation: `e6ceaa055936295ad09fedf75610d7668c4df326`.
- Booking owner entry: `9c3e8830c8fb72c5014fc2837beffac940b16af2`.
- Intelligence implementation: `47ca66ac4db325f20ad9590054bf9fad99fae67c`.
- Experience implementation: `ac561b34f8556f58b55474bbedae09e1786c2c2b`.
- Places reliability/breadth: `fef32c71534eb9427fe446de17c062969d1d0270`.
- Booking Preview CORS: `5cca07d8d7c17e5d70ca47cf755307250f0e6b5e`.
- Natural Journey intent: `c8b10b6b471b25a2b9f9e5f305315383d873f434`.
- Initial runtime assembly: `f7565939c442f4ce83fdcb1514fb60e5bf8013b9`.
- Final runtime source: `d39ed496d45b38cc6722cd0668d25f99e490940c`.

## Infrastructure and deployment

- Database/schema/RPC/RLS/bucket migration: NONE.
- Supabase Edge Function: `booking-route-resolve` 2.5.1 only; active Function
  deployment version 11.
- Supabase secrets: UNCHANGED.
- Manual Cloudflare configuration: NONE.
- Preview version: `ae4fdd36-3b54-4f0f-a072-bbbdd30cc37c`.
- Production version/deployment:
  `3f12dc7d-5332-4521-b38c-3cc36f7b38b1` /
  `e36fe7ad-97a6-4654-97bd-e425653753ad`, 100%.

Cloudflare deployment causation is not invented. The release record is based
on observed provider versions plus exact Git-blob and runtime acceptance.

## Rollback

For a full M15 rollback, return the Worker release to the synchronized M14
marker `bb31c530a974b0d50da63887a46bc7a39b32b2bb` and redeploy
`booking-route-resolve` 2.5.0 from that marker. No database, RLS, storage,
bucket or secret rollback is required.
