# Luvia Fifty-Point Owner-First Execution and Frontier Plan

Date: 2026-09-01

Status: **BINDING CONTINUATION PLAN / INTEGRATION ONLY / BLOCK 1 ACTIVE**

Plan position: P01–P39 are execution packages inside the stable M16.5
Redesign/Recovery Steps **15–18 of 18**. Steps 01–14 remain closed and are
reopened only by a concretely reproduced regression. P40–P50 are bindingly
retained frontier capabilities, but their implementation begins only after the
applicable later Roadmap, owner, privacy, data and infrastructure authorization
gates are met. Their inclusion is not advance authorization for M18/M19/M21
scope.

Authority: this continuation plan is subordinate to the Master Roadmap, the
binding M16.5 Design/Acceptance Contract and
`M16.5-DESIGN-INTEGRATION-AND-FEATURE-PRODUCTIZATION-PLAN.md`. It extends the
owner-first backlog; it does not renumber or replace the stable 18-step plan.

## 1. Invariants for every product slice

Every slice follows this complete chain:

`Owner Contract → browserless Core → public Owner Adapter → bright Living Sheet / Map / Timeline Consumer → Luvia AI Chat integration → evals and failure modes → real Step-17 operation → commit → immutable Integration version → Stable/Immutable byte proof → exact Step-18 rollback`

OpenAI may understand, decompose, orchestrate and explain. Places, Booking,
Journey, Trip, Identity, Location, Memory, Collaboration and verified event
boundaries remain owners of their facts and mutations. No language-model or
consumer-side direct mutation is permitted.

Every mutation remains:

`Preview → explicit confirmation → public Owner Command → Owner Receipt → Recovery → separately confirmed Undo/compensation`

The following remain forbidden without separate explicit authorization:

- Main or Production changes;
- DB/RLS migrations or policy changes;
- Secret changes;
- Edge Function deployment or mutation;
- invented provider evidence, availability, events, coordinates or success;
- silent mutation, hidden retry or dark Legacy substitution.

## 2. Five canonical execution blocks

The work-package identifiers below are canonically `P01`–`P50`; the execution
blocks are `B1`–`B5`. They are distinct from the stable Redesign/Recovery Steps
01–18 and from the owner-first slice identifiers `S16.01`–`S16.12`.

### B1 — Productive AI Chat and first real agency (P01–P10)

Status: **ACTIVE**

1. **P01 — Public `.126` baseline lock.** Retain App/Core/cache/SW versions, Stable,
   Immutable, byte provenance, rollback, known counterevidence and the untouched
   pre-existing untracked paths.
2. **P02 — Places provider readiness.** Prove real Google and Foursquare readiness,
   bounded fallback, provider health, quota/timeout/offline semantics, source
   freshness, result diversity, exact spatial intent and provider photos.
3. **P03 — Positive public Places search through the AI Chat.** Accept multilingual
   requests, confirmed-profile fallback, missing/conflicting input questions,
   one-to-three source-backed suggestions per category, Compass-coloured
   MapLibre and bottom-up Place detail sheets.
4. **P04 — Places Favorite/Unfavorite.** Close Preview, explicit confirmation,
   `places.v1` command, Receipt, recovery, persistence and separately confirmed
   Undo.
5. **P05 — Places Plan/Unplan.** Close trip/day/time selection, conflict preview,
   `places.v1` command, Timeline projection, Receipt, recovery and Undo.
6. **P06 — Booking Read/Open.** Show owner/provider status, evidence, price and terms;
   open only an official provider handoff and never infer availability.
7. **P07 — Booking Create.** Execute only supported provider-backed creation with
   idempotency, refreshed terms, explicit confirmation and provider/owner
   receipts.
8. **P08 — Booking Modify/Cancel.** Expose consequences and fees before confirmation;
   reconcile unknown provider outcomes and compensate only where supported.
9. **P09 — Granular Journey commands.** Add, edit, move, reorder, connect, delete and
   restore Journey moments through `journey.v1`, preserving all owner truth.
10. **P10 — S16.01 Explainable Planning Trace expansion.** Explain intent split,
    owner decisions, sources, freshness, assumptions, conflicts, rejected
    alternatives, proposed commands and resulting receipts without exposing
    private reasoning or sensitive raw input.

Block-1 exit: positive public provider evidence and all applicable mutation
chains are visible through the real AI Chat; focused evals, Step 17, commit,
immutable Integration release, byte proof and exact rollback are recorded.

### B2 — Intelligent, personal and robust planning (P11–P20)

11. **P11 — S16.03 Route Uncertainty.** Real uncertainty bands, source age, missing
    live evidence and a separately confirmed Journey buffer command.
12. **P12 — S16.04 Day Rehearsal.** Simulate feasible best/expected/worst days and
    apply selected revisions only through confirmed owner commands.
13. **P13 — S16.05 Live Disruption Recovery.** Generate evidence-backed recovery
    proposals and correlated per-owner receipts without silent repair.
14. **P14 — S16.02 On-Device Context Gate.** Prove precise/coarse/manual/denied/
    revoked/expired location, purpose limitation, no implicit persistence and
    offline fallback.
15. **P15 — Identity Preferences.** Distinguish request-only, Trip-scoped and durable
    preferences; protect sensitive traits and confirm every durable write.
16. **P16 — S16.06 Causal Feedback Learning.** Learn only from an explicit outcome
    and reason, with scope, expiry, correction and deletion.
17. **P17 — Trip capability closure.** Read, create, update, switch, archive, delete
    and restore with dependency previews and Trip receipts.
18. **P18 — Memory Read and Story Save.** Create, edit, connect, share, archive,
    remove and restore source-labelled memories without copying Media truth.
19. **P19 — S16.08 Destination Digital Twin.** Build an expiring, derived and fully
    provenance-labelled model without becoming destination truth.
20. **P20 — Verified Event Source Gateway authorization gate.** Define accepted
    providers, licences, attribution, cache/freshness, image rights and any
    separately authorized infrastructure boundary before live event ingestion.

Block-2 exit: Luvia can explain and safely act across the personal Trip,
Identity, Journey and Memory graph; the live event source boundary is approved
without widening owner or infrastructure authority implicitly.

### B3 — Complete verified event and calendar product (P21–P30)

21. **P21 — Browserless Verified Event Intelligence Core.** Normalize provider-native
    claims, field provenance, freshness, deduplication, conflicts and verified
    geometry with zero synthetic events.
22. **P22 — Complete Event/Veranstaltungskalender.** Deliver day, week, Trip range,
    filters, Timeline, Compass-coloured MapLibre and bottom-up details.
23. **P23 — Dynamic Map-Time Brushing.** Synchronize time range, map extent, pins,
    list, pointer, touch, keyboard and Reduced Motion.
24. **P24 — Event-to-Memory Thread.** Connect a verified event and explicitly selected
    visit/media evidence to a confirmed Memory command.
25. **P25 — Cultural Context Layer.** Provide attributable, source/version-bound
    context; unavailable evidence remains unavailable rather than generated.
26. **P26 — Serendipity Window.** Rank optional verified events inside an open Journey
    window with an honest “keep free” outcome.
27. **P27 — Group Taste Divergence.** Explain consented common ground and minority
    impact while Collaboration writes remain owner-gated.
28. **P28 — Weather-Safe Event Substitution.** Distinguish forecast risk from official
    cancellation and require separate Booking/Journey confirmations.
29. **P29 — Cancellation and Venue Drift Detection.** Detect source-backed time,
    status, venue and coordinate changes; outage is unknown, not cancellation.
30. **P30 — Live Schedule Reconciliation.** Reconcile verified schedules with Journey
    and Booking through visible diffs and separately confirmed commands.

Block-3 exit: public Integration shows real source-backed events in one
calendar/timeline/map model; missing coordinates remain list-only and all
provider/source failures remain honest.

### B4 — Complete orchestration, safety and future simulation (P31–P40)

31. **P31 — Spatio-Temporal Event Graph.** Derive expiring event/place/time/journey/
    route/booking/weather/memory edges from owner/source evidence only.
32. **P32 — Public S16.09–S16.12 acceptance.** Prove live sources, images, map,
    brushing, drift, weather recovery and offline/freshness states.
33. **P33 — Full Event Chat integration.** Search, refine, explain, open, plan, book,
    propose to a group and save to Memory through the existing chat.
34. **P34 — Multilingual multi-intent orchestration.** Preserve mixed-language,
    colloquial, relative and conflicting wishes across every owner.
35. **P35 — Complete AI mutation coverage matrix.** Every supported user action has
    an owner command and the complete mutation protocol or an explicit block.
36. **P36 — Forbidden and high-risk command safety.** Cover foreign data, stale
    preview, duplicate execution, partial failure, offline and privacy denial.
37. **P37 — Complete Step-17 matrix.** Real desktop/mobile/touch/keyboard/reload/back/
    Reduced-Motion/cold-warm/offline-reconnect/GPS/group/provider evidence.
38. **P38 — S16.07 Offline-First CRDT decision.** Separately authorize the Journey/
    Collaboration owner, schema, rights, conflict and reconciliation design.
39. **P39 — Immutable release per coherent slice.** Commit, App/Core/cache/SW,
    archive/hash, Stable/Immutable byte equality and exact rollback.
40. **P40 — Counterfactual Journey Multiverse.** Simulate alternative future Trip
    branches using probabilistic graphs, Monte Carlo, constraints and Pareto
    fronts; selection creates owner previews and never an automatic mutation.

Block-4 exit: the classic owner-backed Luvia product has exhaustive public
operation and release evidence, and the first frontier capability produces
explainable, non-mutating alternative futures.

### B5 — Luvia Travel Intelligence Operating System (P41–P50)

41. **P41 — Travel Constitution and Formal Policy Engine.** Compile user-authored hard
    and soft rules into a versioned policy DSL and expose understandable policy
    proof/violation results before every plan and command.
42. **P42 — Evidence Provenance Mesh.** Track every material claim with owner, source,
    observation/freshness, evidence class, hash, contradiction and downstream
    dependency invalidation.
43. **P43 — Embodied Accessibility and Energy Twin.** With explicit consent, simulate
    mobility, surfaces, steps, lifts, heat, sensory load, rests and fatigue;
    never diagnose or silently infer sensitive traits.
44. **P44 — Private Group Negotiation Lab.** Use secure aggregation and explainable
    fairness objectives such as minimax regret and Nash welfare without
    disclosing private member constraints.
45. **P45 — Offline Sovereign Travel Brain.** Provide encrypted Destination Capsules
    containing a local intent model, owner projections, map/routing data,
    translations, verified snapshots and conflict-aware reconciliation.
46. **P46 — Scene-to-Action Lens.** Convert consented camera/audio input such as a
    menu, poster, timetable, ticket or announcement into redacted, verified
    claims and owner previews—not direct truth or mutation.
47. **P47 — Destination Pulse Field.** Project measured, predicted and unknown crowd,
    transit, weather, wind, heat, noise and accessibility states as a
    source-labelled spatio-temporal MapLibre field.
48. **P48 — Regenerative Impact Optimizer.** Compare comfort, price, accessibility,
    local benefit, crowd displacement and environmental impact as an auditable
    Pareto space without a fabricated universal score.
49. **P49 — Transactional Recovery War Room.** Coordinate major disruptions through
    provider-aware saga orchestration, expiring options, correlated receipts
    and lawful compensating commands after explicit confirmation.
50. **P50 — Proof-of-Journey Vault and Claims Copilot.** Build an encrypted,
    hash-linked evidence chronology from Booking/provider/owner receipts and
    prepare source-backed claim packages that the user must review and submit.

Block-5 exit: each frontier capability remains independently flagged,
owner-first, privacy-gated, rollbackable and publicly evidenced. No “world
first” marketing claim may be made without a separate current market/patent
landscape review.

## 3. Recurring acceptance and release rule

The five blocks are execution phases, not five oversized releases. Every
coherent slice in every block must independently include:

1. owner contract and capability version;
2. inputs/outputs, provenance and freshness;
3. privacy and authorization;
4. failure vocabulary and recovery mode;
5. browserless core and public adapter;
6. accepted bright consumer and chat integration;
7. mutation Preview/confirmation/Receipt/Undo where applicable;
8. focused evals and ownership/architecture tests;
9. real visible Step-17 evidence without DOM mutation shortcuts;
10. focused commit and version-coherent immutable Integration release;
11. clean archive/source/Stable/Immutable byte proof; and
12. exact Step-18 rollback.

## 4. Active next slice

B1 begins from accepted `.126`. The first active slice is **P02–P03**:

- audit the current Google/Foursquare gateway and public readiness;
- prove bounded fallback when one provider fails;
- preserve provider-native photos and attribution;
- improve and evaluate result diversity and precise spatial intent;
- prove a positive signed-in public Chat search using real pointer/keyboard
  operation;
- publish only after all focused tests and the applicable Step-17 rows pass.

P04–P10 follow in order. A documentation entry is not completion evidence.

### 4.1 P02–P03 implementation ledger — 2026-09-01

Status: **LOCAL CONTRACT + EVAL GREEN / PUBLIC POSITIVE PROVIDER EVIDENCE OPEN**

- Public `.126` health reports Google and Foursquare configured, but this is a
  configuration check rather than a positive live-search proof.
- The real public Chat correctly compiled the centre/not-waterfront request and
  then exposed Google quota / action cooldown instead of inventing a Place.
- The Integration client now treats an empty provider response containing
  provider errors as `PLACES_PROVIDER_READ_UNAVAILABLE`; it is no longer a
  successful empty result and is not placed into the client result cache.
- Foursquare provider-native types are retained separately and deterministically
  mapped to the shared Places taxonomy without inventing provider facts.
- Spatial constraints reach the provider payload. Device coordinates reach it
  only with an explicit provider-share grant and as a bounded projection.
- Provider, provider references, bounded evidence, real/unknown freshness,
  cache state, distance and distance source now survive the public owner and AI
  projections.
- Foursquare direct photos remain Foursquare-attributed and do not use the
  Google photo endpoint; unknown media is never labelled Google by default.
- A multi-category Places request now returns a fair round-robin selection of
  one to three cards per available requested category, capped at twelve, with
  visible category distribution and sanitized provider diagnostics.
- New evergreen evals cover partial provider success, full provider failure,
  honest empty success, Foursquare taxonomy/media, spatial/privacy forwarding,
  public projections and category fairness.

Still open before P02/P03 completion:

- a positive signed-in public Chat search with real provider cards, photos,
  MapLibre pins and bottom-up details;
- visible public Provider/Freshness/Distance evidence in the newly released
  immutable Integration build;
- Stable/Immutable/archive byte proof, Step-17 rows and exact rollback for that
  release;
- perfect attempted/succeeded/failed provider distinction and suppression of
  gateway-side five-minute failure caching, which require separately authorized
  Edge Function work and are not implied by this client slice.
