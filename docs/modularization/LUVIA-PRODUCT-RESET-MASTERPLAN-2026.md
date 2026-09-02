# Luvia Product Reset Masterplan 2026

Date: 2026-09-02
Status: **BINDING EXECUTION ORDER FOR INTEGRATION; MAIN AND PRODUCTION LOCKED**
Canonical package IDs: **B1–B5 / P01–P50 remain unchanged**
Technical decomposition: `LUVIA-FIFTY-POINT-OWNER-FIRST-EXECUTION-PLAN.md`
Operational status index: `M16.5-BLOCK0-TO-BLOCK5-MASTER-HANDOUT.md`

## 1. Decision at the product checkpoint

Luvia continues. The project is not restarted and the existing owner-first
architecture is not replaced. Execution changes from feature accumulation to
outcome closure.

The five canonical 10-package blocks remain binding. A package is no longer
allowed to become a prominent product surface merely because its contract,
adapter or local UI exists. Every visible capability must reach an honest
maturity level, close a real user job and pass its public acceptance gate.

The product promise is:

> Luvia turns a personal travel intention into an executable, live-adaptable
> journey and then into a lasting memory.

The product loop is:

`Intent and constraints → discovery → executable plan → verified action → live companion → memory → better next journey`

Hotels, restaurants, tickets, events, routing, media, language and social are
capabilities inside this loop. None is an independent unfinished mini-product.

## 2. Current truthful baseline

- App/Core `13.82.147 / 4.82.147` remains the last accepted recovery baseline.
  `.148` was rejected because one pin opened the complete result collection;
  publicly deployed `.149` repaired exact selection and viewport breadth but
  is rejected because background refresh hid the rendered map behind a grey
  loading/empty fallback.
- App/Core `13.82.160 / 4.82.160` is the local continuous-map Integration
  candidate. It retains tiles and old pins during pan/zoom loading, stages new
  pins before replacement and keeps the map active for empty or transient-error
  outcomes. It is not public evidence until deployed and operated on Stable and
  Immutable.
- Main and Production remain locked.
- Google Places is the primary Places source. Foursquare is fallback only and
  currently has no remaining credits. A fallback outage may reduce coverage
  but must not silently replace Google as the primary source.
- Duffel Stays application was submitted on 2026-09-02; Stays access and a
  verified token are pending.
- Booking.com Affiliate onboarding was submitted on 2026-09-02. Approval does
  not imply Booking.com Demand API access. Demand requires separate Managed
  Affiliate qualification, contract, Partner Centre rights, API key and
  `X-Affiliate-Id`.
- No Hotel provider is claimed active. No affiliate link is treated as live
  price evidence.
- Existing B0 action-parity, owner contracts, receipts, recovery and release
  discipline remain permanent gates for every later package.

## 3. Capability maturity ladder

Every Place, Hotel, Restaurant, Event, Ticket, Booking, Media and Social
capability is assigned exactly one visible maturity level:

| Level | Meaning | Allowed product behavior |
|---:|---|---|
| 0 — Hidden | No reliable owner-backed user value | No navigation entry or active CTA |
| 1 — Evidenced read | Source-backed content exists | Show facts, source/freshness and honest unknown states |
| 2 — Verified handoff | Exact entity and verified destination URL/contact exist | Open the named provider after an explicit user action; record as forwarded, never booked |
| 3 — Live decision | Authorized provider returns current availability/price | Show source-labelled live result for exact dates/party; refresh before action |
| 4 — Transaction | Authorized create/modify/cancel operation exists | Preview, explicit confirmation, idempotent owner command and provider receipt |
| 5 — Reconciled lifecycle | Provider status and recovery are proven | Booking Center may show confirmed/cancelled only from provider or verified evidence |

No copy, button or AI response may claim a higher level than the capability has
actually reached. A lower level remains useful when named honestly.

## 4. Global product gates

### G0 — Truth and trust

- Zero cross-venue and cross-property redirects.
- Zero lodging cards with ticket/admission actions.
- Zero Event/Activity ticket buttons without an exact verified product or
  venue route.
- Zero price comparison claims without comparable live source responses.
- External handoff is `forwarded`, not `reserved`, `booked` or `confirmed`.
- Unknown, stale, quota-limited, offline and permission-denied states remain
  distinct and recoverable.

### G1 — One visual language

- Places and Hotels use the same Compass-derived map language.
- The map is the primary results surface for spatial discovery.
- No parallel result list appears beside or below the map in the accepted map
  experience.
- Selecting a pin opens the one bright Journey suggestion sheet / Bottom Sheet
  for Place, Hotel, Restaurant, Event or Activity.
- One pin opens exactly one provider entity. A Bottom Sheet opened from a pin
  never receives the complete result collection.
- Panning or zooming runs a debounced query for the new visible bounds in every
  productive spatial consumer. Valid new provider results become pins without
  requiring a new destination-form submission.
- A viewport is split into four Google-primary requests because Google returns
  at most 20 results per request. Results are deduplicated by provider identity,
  filtered to the requested bounds and capped at 80 unique pins per viewport.
  Further panning/zooming loads the next visible area. This is broad provider
  coverage, not a false promise that Google exposes an exhaustive inventory.
- Personal or Trip fit may decorate a pin only when evidenced. It never removes
  or hides another provider-returned, coordinate-qualified result.
- The legacy white Place detail card has no productive route.
- Every result supplies a real provider image or one deliberate, consistent
  unavailable-image state; broken or indefinitely loading media is not accepted.

### G2 — Golden Journey

The reference journey is a real signed-in Scharbeutz trip with explicit dates,
party and preferences. It must prove:

1. understand or select the active Trip;
2. discover source-backed Places in the explicit destination;
3. render valid coordinates as map pins;
4. open the exact entity in the unified Bottom Sheet;
5. explain why it fits and what remains unknown;
6. inspect route/time/opening/admission or reservation evidence;
7. favorite and add the entity to a selected Journey day/time;
8. open only an exact verified reservation/ticket/hotel route when available;
9. retain forwarded/unknown/confirmed truth correctly in Booking Center;
10. survive Reload, Back, Forward, narrow mobile and owner readback;
11. offer a useful next action during the Trip; and
12. connect an explicitly selected visit/media item to a Memory draft.

The Golden Journey is a permanent regression and public acceptance path, not a
demo fixture or one-time presentation.

### G3 — User value proof

Before opening a new broad product family, at least five independent users must
attempt the Golden Journey without operator instruction. Acceptance requires:

- no dead main action;
- no wrong entity/provider handoff;
- a useful planned day produced within ten minutes;
- each user can state in their own words what Luvia did beyond a normal map or
  generic chat; and
- counterevidence is recorded and corrected before the next broad surface.

If users cannot explain the value, the product promise or composition is
reworked before more features are exposed.

## 5. Five canonical 10-package blocks

The package numbers and owner boundaries below retain the canonical Fifty-Point
Plan. This masterplan changes their product order and exit evidence, not their
domain ownership.

### B1 / P01–P10 — Trustworthy discovery, agency and the Golden Journey

**User outcome:** A person can turn one concrete travel wish into an evidenced,
editable day and take one verified external or provider-backed action without a
dead end or false claim.

#### B1 execution slices

1. **`.150` trust recovery — P01–P03/P06 guardrails.** Complete Google-primary
   coordinates, bounded Foursquare fallback, map-only Places/Hotels, exact pin
   selection, an uninterrupted map during live viewport refresh, unified Bottom
   Sheet, media loading/fallback, no legacy detail route and no automatic
   arbitrary result opening.
2. **Golden discovery and planning — P03–P05/P09.** Close search, detail,
   favorite/unfavorite, plan/unplan, exact day/time, Journey conflict preview,
   owner receipt, readback, recovery and separately confirmed Undo in one user
   session.
3. **Universal admission truth — P06.** Show `free`, `not_required`,
   `reservation_optional`, `reservation_recommended`, `reservation_required`,
   `ticket_available`, `ticket_required`, `timed_entry` or `unknown` only from
   source-backed Booking-owner evidence.
4. **Verified actions — P06–P08.** Prove one exact Restaurant route and one
   exact Activity/Culture route. Enable provider create/modify/cancel only when
   the relevant provider reaches maturity 4/5.
5. **Explainability closure — P10.** Show sources, freshness, assumptions,
   rejected alternatives, proposed commands and receipts in user language,
   without exposing private chain-of-thought or internal field names.

#### B1 Hotel lane

- Discovery remains useful at maturity 1/2: location, image, rating, fit,
  Journey proximity, favorite, planning and verified direct handoff.
- Duffel Stays is the first requested named live source after access and a
  healthy Integration probe.
- Hotelbeds is the second independent live source for the first genuine
  cross-source comparison.
- Booking.com Affiliate may become a tracked handoff after approval; it is not
  price evidence.
- Booking.com Demand, Expedia Rapid and KAYAK remain separate commercial/API
  qualifications.
- With no live source the UI says prices are unavailable. With one source it
  names that source. With two comparable sources it may say exactly which two
  sources were compared. It never claims a universal market-best price.

#### B1 exit gate

- G0, G1 and the complete G2 Golden Journey pass publicly on Integration.
- P01–P10 each have accepted evidence or an explicit provider-dependent hold.
- Provider-dependent holds are hidden or honestly unavailable and do not leave
  dead CTAs.
- Desktop, 390×844, keyboard, touch, Reduced Motion, Reload, Back/Forward,
  quota/offline and exact rollback pass.
- Five-user G3 validation begins before B2 broadening.

### B2 / P11–P20 — Personal, robust and live-adaptable planning

**User outcome:** The plan behaves like a travel companion rather than a static
list. It understands constraints, uncertainty and change while the person
retains control.

#### B2 package outcomes

- **P11 Route Uncertainty:** visible source age and realistic uncertainty bands;
  optional Journey buffer only after confirmation.
- **P12 Day Rehearsal:** best/expected/worst scenario comparison with explicit
  plan revisions.
- **P13 Live Disruption Recovery:** evidence-backed alternatives and separate
  owner receipts for partial outcomes.
- **P14 On-Device Context Gate:** precise/coarse/manual/denied/revoked/expired
  location with purpose limitation and no implicit persistence.
- **P15 Identity Preferences:** clear separation of durable profile, Trip-scoped
  choices and one-request intent.
- **P16 Causal Feedback:** learn only from explicit outcome feedback with edit,
  expiry and deletion.
- **P17 Trip Closure:** create, update, switch, archive, delete and restore with
  dependency previews.
- **P18 Memory Read and Story Save:** one complete selected-visit-to-Memory draft
  rather than a broad unfinished editor.
- **P19 Destination Twin:** expiring, provenance-labelled Trip projection; never
  copied destination truth.
- **P20 Event Source Authorization:** approve licences, attribution, freshness,
  cache, images and provider boundaries before public event ingestion.

#### B2 exit gate

- The Golden Journey adapts to one route delay, one weather/opening change and
  one user preference correction without silent mutations.
- A user can understand and reject every proposed change.
- A completed visit can produce one real Memory draft.
- Event ingestion remains hidden until P20 authorization is complete.

### B3 / P21–P30 — Verified events, calendar and ticketing

**User outcome:** A person can see what is really happening during the Trip,
understand whether admission is required and take the correct action.

#### B3 package outcomes

- **P21 Verified Event Core:** normalize source identity, schedule, venue,
  geometry, status, ticket evidence, freshness and conflicts without synthetic
  events.
- **P22 Complete Event Calendar:** day, week and Trip-range calendar plus
  timeline and map.
- **P23 Map-Time Brushing:** the map and time range stay synchronized. The map
  remains primary; any optional accessibility index is a separate view, not a
  duplicated permanent result column.
- **P24 Event-to-Memory:** connect the exact verified Event, visit and selected
  Media evidence to a Memory command.
- **P25 Cultural Context:** attributable context with an unavailable state when
  evidence is missing.
- **P26 Serendipity Window:** optional verified events inside a genuinely open
  Journey window; `keep free` remains a first-class choice.
- **P27 Group Taste Divergence:** consented common ground and minority impact
  without exposing private member constraints.
- **P28 Weather-Safe Substitution:** forecast risk is not official cancellation;
  Booking and Journey confirmations remain separate.
- **P29 Cancellation/Venue Drift:** source-backed changes, never outage-as-
  cancellation.
- **P30 Live Schedule Reconciliation:** visible diffs and separately confirmed
  owner actions.

#### Ticket truth contract

Every ticket-capable projection includes:

- exact Event/Activity/Venue identity;
- `required`, `optional`, `free` or `unknown` admission state;
- evidence source, observed time and freshness;
- `api`, `verified_link`, `venue_contact` or `unavailable` purchase mode;
- source-backed price and terms only when present; and
- provider/product identity that cannot resolve to a sibling entity.

`Tickets kaufen` exists only for an exact actionable path. `Ticketstatus noch
ungeklärt` is informational and does not open an unrelated provider.

#### B3 exit gate

- Real, licensed events populate one calendar/timeline/map model.
- At least one free event, one verified ticket-required event and one honest
  unknown state pass public operation.
- Ticket purchase/handoff and Booking Center truth are exact and recoverable.
- Missing coordinates remain honest and never generate fake pins.

### B4 / P31–P40 — Complete orchestration, safety and product hardening

**User outcome:** Luvia consistently coordinates the full classic travel loop
across language, device, connectivity and provider failures.

#### B4 package outcomes

- **P31:** spatio-temporal Place/Event/Journey/Booking/weather graph.
- **P32:** public acceptance of live sources, media, map-time behavior, drift,
  weather recovery and offline/freshness states.
- **P33:** complete Event Chat reads and confirmed actions.
- **P34:** German/English and mixed-language multi-intent orchestration without
  owner or entity loss.
- **P35:** complete AI mutation matrix or explicit unavailable result for every
  user-visible action.
- **P36:** foreign data, stale previews, duplicate execution, partial failure,
  offline state and privacy denial fail safely.
- **P37:** complete real-device Step-17 matrix.
- **P38:** separately authorized offline-first Journey/Collaboration decision;
  no CRDT implementation before owner and membership authorization.
- **P39:** immutable release, byte proof and exact rollback for every coherent
  slice.
- **P40:** explainable alternative Journey simulations that remain read-only
  until a user selects and confirms an owner preview.

#### B4 product-payoff lane

The first usable Memory Studio closes here if P18/P24 only produced a draft:

1. collect selected Trip media;
2. map it to verified dates/places/events;
3. generate an album and short Reel draft;
4. allow title, order, inclusion and mood/music changes;
5. export or privately share; and
6. prepare the same provenance for a later travel book.

This lane does not attempt to recreate a general-purpose video editor. It
finishes one travel-specific outcome first.

#### B4 exit gate

- The classic Luvia loop from intent through live adaptation to Memory works on
  real Integration data.
- All visible human actions have equivalent AI execution or an equally honest
  block.
- No open high-risk, wrong-entity or false-confirmation counterevidence remains.
- The Design Freeze is granted per complete surface, never to an unfinished
  application as a whole.

### B5 / P41–P50 — Travel Intelligence Operating System

**User outcome:** Luvia adds differentiated frontier capabilities after the
classic product is useful and trusted.

#### B5 package outcomes

- **P41 Travel Constitution:** user-authored hard and soft travel rules with
  understandable policy proof.
- **P42 Evidence Provenance Mesh:** owner, source, freshness, contradiction,
  hash and downstream invalidation for material claims.
- **P43 Accessibility and Energy Twin:** consented route/surface/rest/sensory
  simulation without diagnosis or hidden sensitive inference.
- **P44 Private Group Negotiation:** explainable fairness without disclosure of
  private member constraints.
- **P45 Offline Sovereign Travel Brain:** encrypted Destination Capsules with
  local planning, maps, verified snapshots and reconciliation.
- **P46 Scene-to-Action Lens:** consented menu/poster/timetable/ticket/audio
  understanding that produces verified claims and previews, not silent truth.
- **P47 Destination Pulse:** measured/predicted/unknown crowd, transport,
  weather, heat, wind, noise and accessibility fields.
- **P48 Regenerative Optimizer:** auditable trade-offs instead of one fabricated
  universal score.
- **P49 Recovery War Room:** provider-aware recovery sagas with expiring options
  and explicit confirmations.
- **P50 Proof-of-Journey Vault:** encrypted evidence chronology and user-reviewed
  claim packages.

#### B5 exit gate

- Each frontier capability is separately flagged, consented, reversible and
  publicly evidenced.
- No frontier feature may weaken the Golden Journey or owner truth.
- No `world first`, market-leader or universal-optimizer claim is made without
  separate current research and legal review.

## 6. Cross-block provider activation plan

Provider approval runs in parallel with product work but never changes runtime
truth automatically.

| Priority | Provider/path | Product role | Activation proof |
|---:|---|---|---|
| 1 | Google Places | Primary Place search, coordinates, details and photos | Authenticated live health, quota and public positive result |
| 2 | Duffel Stays | First named Hotel live price/availability source | Stays entitlement, secret-store token, healthy bounded probe, search → full rates → quote |
| 3 | Hotelbeds | Independent Hotel second source | Evaluation/production rights, exact identifiers, availability → check-rate → booking proof |
| 4 | Booking.com Affiliate | Approved tracked Hotel handoff | Account approval, legal tracking parameters and exact-property redirect |
| 5 | Booking.com Demand | Deep Hotel content/search/book lifecycle | Managed Affiliate contract, Partner Centre rights, API key, affiliate ID and sandbox/live proof |
| 6 | Tiqets or Viator | First transaction-capable Activity/Ticket path | Partner rights, credentials, exact product availability and lifecycle proof |
| 7 | OpenTable/TheFork/other dining providers | Restaurant availability/reservation where authorized | Exact venue identity, commercial/API access and status evidence |
| 8 | KAYAK/Expedia Rapid | Breadth and deep Hotel comparison | Separate business approval and production certification |

Secrets live only in the Integration/Production secret stores. Screenshots,
source files, migration data and logs never contain tokens, tax IDs, passwords,
payment details or full partner credentials.

## 7. Surface policy: what is visible when

- A Level-0 feature is hidden, not shown as `coming soon` inside a primary task.
- A Level-1 Hotel can be discovered, explained, planned and favorited but cannot
  display price comparison or availability CTAs.
- A Level-2 reservation route says `Beim Anbieter reservieren` and records a
  handoff, not a reservation.
- A Level-3 Hotel says `Livepreis von <Quelle>` and displays exact dates, party,
  currency, mandatory total, freshness and terms.
- A Level-4 action always previews final current terms and requires explicit
  confirmation.
- A Level-5 Booking Center state is provider/evidence-backed and reconciled.
- Navigation entries are promoted only after their primary job is complete on
  desktop and narrow mobile.

## 8. Design and map policy

- One bright Living/Compass design language across Today, Plan, Places, Hotels,
  Events, Booking and Memory.
- One unified Bottom Sheet composition with domain-owned actions.
- No legacy card may coexist as a productive fallback.
- MapLibre behavior, pin states, map padding, sheet focus, keyboard access,
  Reduced Motion, Back/Forward and mobile safe areas are shared primitives.
- The Hotel map visually matches the Places map. Domain differences appear in
  sheet content and actions, not in a second design system.
- Large lists may exist as an explicit accessibility/search view only when the
  user chooses it; they do not permanently compete with the map.
- Media has bounded loading, cancellation and fallback. A loading promise that
  never settles is a failed state.

## 9. Release and acceptance protocol

Every coherent slice must complete:

1. owner contract and capability version;
2. evidence, source, freshness and failure vocabulary;
3. browserless core and public adapter;
4. accepted consumer and AI path;
5. Preview/confirmation/Receipt/Recovery/Undo where applicable;
6. focused tests, architecture/ownership gates, NFR-0 and Safe Regression;
7. real desktop and narrow-mobile operation;
8. keyboard, touch, Reduced Motion, Reload, Back/Forward and offline/quota paths;
9. clean commit and clean deployment archive;
10. immutable Integration version, Stable/Immutable byte equality and exact
    rollback;
11. public signed-in Golden Journey evidence when the slice affects it; and
12. explicit user acceptance for a Design Freeze or Main/Production promotion.

No single slice authorizes Main or Production. Integration deployment is always
explicitly named `integration-luvia`.

## 10. Stop rules and pivot criteria

Work stops before a broader surface when any of the following is true:

- a wrong entity/provider can open;
- a visible CTA has no truthful outcome;
- a source outage is presented as an empty market;
- a price or status is not attributable to current provider evidence;
- two separate detail systems can open for the same entity;
- a new module copies owner truth;
- the Golden Journey regresses; or
- the five-user value test cannot explain Luvia's advantage.

External provider delay does not stop the whole product. The dependent feature
stays at its proven maturity level, while the next provider-independent slice
continues. It does stop all higher-level claims and transactional UI for that
provider.

## 11. Deferred expansion after the core loop

The following remain planned but do not pre-empt B1–B4 closure:

- broad Social feed or public community mechanics;
- full Travel Twin relationship network;
- general-purpose video editing beyond the travel Reel outcome;
- full travel-book publishing workflow beyond the shared Memory provenance;
- broad language-learning curriculum;
- always-listening or ambient Voice;
- autonomous purchasing or silent itinerary mutation; and
- new Core truth owners without their reserved-stream authorization.

Language assistance, translation and voice may enter earlier only as a narrow
capability required to complete the Golden Journey and only with explicit
privacy/permission behavior.

## 12. Immediate execution order

1. Finish `.150` inventory, regression, clean commit, explicit Integration
   Worker deployment and public one-pin/one-entity plus uninterrupted pan/zoom
   viewport QA.
2. Close remaining B1 exact Restaurant and Activity/Culture route evidence.
3. Close P09 granular Journey actions and P10 user-facing explainability.
4. Run the complete G2 Golden Journey and first five-user G3 value test.
5. Continue B2 P11–P20 in order while provider applications run in parallel.
6. Open B3 only after P20 verifies at least one lawful event source.
7. Open B4 only after real Event/Calendar/Ticket operation closes B3.
8. Open B5 only after the classic intent-to-memory loop and surface-level
   Design Freeze are accepted.

This order is the binding Product Reset. The canonical Fifty-Point Plan remains
the technical package authority; this document is the authority for why,
when and under which user-value gate each package may become product-visible.
