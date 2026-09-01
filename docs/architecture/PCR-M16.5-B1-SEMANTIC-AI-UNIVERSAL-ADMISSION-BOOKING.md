# PCR M16.5 B1 — Semantic AI and universal admission booking

Status: accepted for implementation on `integration`

## Problem

The AI could route a complete sentence such as “Ich will eine andere Reise auswählen” to Places because a deterministic fallback over-weighted isolated verbs and nouns. Booking affordances were additionally limited to gastronomic places, so attractions, culture, activities and events could neither expose a truthful admission notice nor enter the existing Booking Owner flow.

## Owner decision

- `core/intelligence/` owns semantic intent interpretation and clarification.
- `core/booking/` remains the single owner for booking, reservation and admission-routing truth.
- `booking.v1` remains the only public booking adapter. The change is additive; no second Booking Core or consumer-owned booking policy is introduced.
- Places, Journey/Timeline and AI Chat remain light consumers. They render the Booking Owner decision and invoke only its public command.

## Contract changes

1. Add the browserless `booking.admission.v1` component inside the Booking Core. It classifies the visit kind, evaluates explicit admission evidence, ranks safe provider/direct/email routes, and returns immutable user-facing notice/action metadata.
2. Extend `booking.v1.reads` with `resolveAdmission(place)` and `admissionProviderCatalog()`.
3. Add canonical AI action `booking.place.open`; retain `booking.restaurant.open` as a compatibility alias.
4. Let confident structured model output win over the deterministic language fallback. Low-confidence or conflicting model output becomes a clarification, never an invented owner route.
5. Add browserless `booking.lifecycle-policy.v1`. It determines whether manage,
   modify, cancel, message and status refresh are genuinely available from the
   connected provider capability, verified email thread/contact path, external
   handoff or terminal status.
6. External ticket/reservation navigation must first create or reuse a normal
   Booking record and record the exact safe HTTPS handoff. It remains
   unconfirmed until provider/message evidence returns.
7. Add browserless `booking.live-stay-search.v1`, public
   `booking.v1.reads.searchStayOffers` and typed AI read
   `booking.stay.search`. Structured semantic entities carry destination,
   dates, occupancy, rooms and provider identifiers; raw text is not a
   provider command.
8. Add one authenticated aggregate Hotel search function plus separate
   Amadeus/Hotelbeds provider adapters. The aggregate function may invoke only
   providers whose capability, connection and activation state is ready.
9. Add service-only Hotel search/snapshot evidence and a readiness view. RLS is
   deny-default for normal clients; no raw prompt, secret or exact device
   location is persisted.

## Evidence and safety rules

- Place type alone may make admission relevant, but never proves that a ticket or reservation is required.
- `reservable=true` means supported, not required.
- A ticket or booking URL means a route is available, not that entry is mandatory.
- “required”, “recommended”, “free” and timed-entry statements require explicit provider or official-place evidence.
- A public booking email is usable only when it is structurally valid and explicitly marked public and verified with a source URL.
- Provider API routes are exposed as connected only when a real configured connection exists. Partner-gated catalogs are discovery metadata until credentials and commercial access exist.
- Opening the owner flow does not send, reserve, purchase or mutate anything. Existing confirmation and receipt rules stay in force.
- An external link never implies provider chat, modification, cancellation or
  a confirmed booking. Free-form messages require an existing verified thread.
- A provider is `connected` only after contract entitlement, provider-specific
  transport, credentials, health, idempotency and reconciliation are proven.
- A Hotel price requires `source=provider_api`, `live=true`, matching stay/rate
  semantics, current evidence and a complete mandatory total. Affiliate links
  and unconnected providers contribute zero price evidence.
- One provider permits only a named single-source view. Cross-source comparison
  requires two successful live sources. “Best market price” is never claimed.

## Compatibility

- `booking.v1` keeps version `1` and all existing read/command names.
- Restaurant buttons continue to work through the new generic decision.
- The legacy `booking.restaurant.open` identifier remains an input-enforced
  compatibility alias that canonicalizes to `booking.place.open`; it is not a
  second runtime action and does not inflate the visible counters.
- Existing Booking, handoff, email-thread and mutation-fallback contracts are
  retained. Main, Production and secrets are unchanged. The separately
  authorized Hotel addendum is additive: two service-only evidence tables, one
  readiness view and three fail-closed Integration Edge functions. It does not
  modify existing reservation/message/provider evidence.

## Changed streams

- `core/intelligence/`: semantic-first interpretation and generic booking action.
- `core/booking/`: admission decision, provider catalog and engine discovery.
- `core/platform/booking-contract-adapter.js`: public read projection.
- `core/ai/`, `app/places/`, `app/journey/`: light notice and action consumers.
- `index.html`, `sw.js` and immutable runtime bundles: script registration and release version.

## Verification

- Browserless admission matrix: dining, attraction, culture, activity, event, free place, unknown place, official route, partner route and verified-email fallback.
- Semantic routing regression: trip-selection sentences must not reach Places; unknown wishes must clarify.
- Public-adapter projection test: raw contact data cannot cross the boundary.
- AI action compatibility and universal action tests.
- Consumer source tests and a visible browser fixture.
- Controlled Hotel fixture at default and 390×844: two-source comparison and
  no-source fail-closed state, `TT.MM.JJJJ`, no overflow and no console errors.
- Static Edge/auth/secret-boundary tests, migration/rollback test and semantic
  Hotel route without dependence on one lexical keyword.
- Full relevant test suites, public Integration smoke, immutable/stable byte comparison and exact previous-version rollback proof.

## Rollout and rollback

Publish one immutable Integration version containing this coherent slice.
Stable may point to it only after public verification. Code rollback restores
accepted App `13.82.135` / Worker version
`d4efd8ac-969c-426c-b312-7ea686740ac1`. If the new Hotel evidence schema was
applied and must also be removed, execute
`docs/rollback/M16.5-B1-CORE-4.82.136-HOTEL-LIVE-OFFER-GATEWAY-ROLLBACK.sql`
after restoring the Worker. This rollback does not delete existing Booking,
message, provider, reservation or conversion evidence.
