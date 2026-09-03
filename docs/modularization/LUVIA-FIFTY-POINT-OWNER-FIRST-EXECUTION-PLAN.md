# Luvia Fifty-Point Owner-First Execution and Frontier Plan

Product execution authority: `LUVIA-PRODUCT-RESET-MASTERPLAN-2026.md` now
defines the binding product promise, capability maturity ladder, Golden Journey,
user-value gates, stop rules and cross-block visibility order. This document
retains canonical package IDs `P01`–`P50`, owner boundaries and technical
acceptance requirements; the five 10-package blocks are not renumbered.

Date: 2026-09-03

Status: **BINDING CONTINUATION PLAN / INTEGRATION ONLY / BLOCK 0 PUBLICLY ACCEPTED ON 13.82.135 / BLOCK 1 PUBLIC MAP/MINI-INFO CHECKPOINT ON 13.82.167 WITH USER ACCEPTANCE OPEN, BLOCK STILL ACTIVE**

Current canonical counts on 2026-09-03 are **330 semantic actions, 246 public
Owner bindings, 24/24 typed runtime actions, 124 protected state changes, 939
audited source markers and 2,733 generated failure evals**. Lower figures in
the dated B0 construction ledger below are retained only as historical progress
evidence; they do not describe the current control plane.

Plan position: B0.01–B0.10 are the newly inserted, cross-cutting Human ↔ AI
action-parity control plane. They do not renumber P01–P50. P01–P39 are
execution packages inside the stable M16.5
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

Consumer-ready acceptance is binding from **Block 0 onward**, including every
later P- and S16-slice. Internal contract names, Owner identifiers, action IDs,
ledger terminology, slice numbers, source counters and raw provider errors stay
available to diagnostics and evals but are not normal product copy. The bright
consumer must instead show:

- the user goal and the next understandable step;
- source-backed results, relevant freshness and uncertainty in plain language;
- a concrete retry, refinement or manual alternative when a read fails;
- preview, consequence, confirmation, completion and `Rückgängig machen` in
  ordinary product language for mutations;
- optional `Warum passt das zu dir?` explanations rather than an open technical
  trace occupying the conversation;
- no visible placeholder, reservation or “foundation-only” capability that the
  user cannot already operate.

A technically green Core, adapter, fixture or eval is therefore necessary but
not sufficient. A slice is complete only after its real consumer is visibly
operable and its failure mode is equally understandable.

The following remain forbidden without separate explicit authorization:

- Main or Production changes;
- Secret changes;
- invented provider evidence, availability, events, coordinates or success;
- silent mutation, hidden retry or dark Legacy substitution.

For the current Hotel slice only, the user separately authorized additive
Integration DB/RLS and Edge Function changes. That authorization covers the
deny-default search/snapshot schema, gateway and provider adapters; it does not
create partner approval, credentials, Main/Production authority or permission
to label a provider connected before live health and public E2E pass.

## 2. Block 0 and five canonical execution blocks

The work-package identifiers below are canonically `P01`–`P50`; the original
execution blocks are `B1`–`B5`. The inserted parity packages are
`B0.01`–`B0.10`. They are distinct from the stable Redesign/Recovery Steps
01–18 and from the owner-first slice identifiers `S16.01`–`S16.12`.

### B0 — Complete Human ↔ AI action-parity control plane (B0.01–B0.10)

Status: **B0.01–B0.10 CONTROL-PLANE EXIT PUBLICLY COMPLETE ON APP 13.82.135 / CURRENT 330-ACTION REGISTER, 246 PUBLIC OWNER PATHS, 24/24 RUNTIME INPUT ENFORCEMENT, LANGUAGE, SAFETY, LIFECYCLE, BRIGHT CONSUMER AND 12-DIMENSION PARITY/FAILURE MATRIX GREEN / PRODUCT PARITY CONTINUES THROUGH B1–B5**

Control-plane construction ledger, reconciled to the canonical 2026-09-02 counts above:

- The verified inventory contains **330 semantic user actions** across 13
  product categories. **318** are executable or conditionally executable
  product actions; **11** are explicitly labelled Landing/demo interactions.
  The audit also records **24 unavailable or reserved outcomes** and reconciles
  **898 `data-*` markers** so that markup is not mistaken for a semantic action.
- The workbook
  `Luvia-vollstaendiges-Benutzeraktionsinventar-2026-09-01.xlsx` is the reviewed
  source artifact for this insertion. Its SHA-256 is
  `42E4B9D2115EE6CF38E3B7E9EDA1148AAACCB63CF14C8780C9EDA8A67CE48E46`.
- The current executable AI action registry contains **23** typed actions. The full
  inventory audit classifies **3** actions as publicly E2E-proven, **61** as
  registered/partial, **229** as missing from productive AI parity, **14** as
  native chat controls, **10** as presentation-only/not required and **11** as
  demo/not-applicable actions. The Chat category contains 16 rows in total;
  two of those are presentation mechanics rather than native AI actions.
  These figures are a baseline, not a completion claim.
- B0.01 now exists locally as
  `config/luvia-human-ai-action-registry.v1.json` plus its JSON Schema and the
  complete 899-marker source audit. The validator proves unique contiguous IDs,
  workbook provenance, all 21 runtime-action mappings, honest open Owner/input
  states and explicit confirmation plus idempotency for all 124 classified
  state changes. The first B0.09 CI/source-drift gate is green locally. These
  artifacts are not yet a committed or public product slice.
- The read-only visible local gate
  `tests/fixtures/m16.5-block0-human-ai-action-parity-browser.html` now loads
  the versioned register directly. It visibly proves 330/330 actions, 24 typed
  runtime paths, 124 explicitly confirmed/idempotent state changes and 898
  audited source markers. Search, category/status filters, Desktop and 390 × 844
  responsive layout passed with no horizontal overflow and no browser console
  warning/error. This is local evidence only, not public Integration acceptance.
- `config/luvia-ai-action-input-contracts.v1.json` now defines one typed input
  contract for every existing runtime action: 21 unique schema IDs projected to
  45 matching human-action rows. Required, optional and allowed context fields
  are machine-checked. Bounded runtime enforcement is active for all 24/24 actions:
  `places.place.favorite`, `places.place.unfavorite`, `places.place.plan` and
  `places.place.unplan` reject missing Owner IDs; Plan also rejects a missing or
  contradictory date/time/time-zone and shifted Owner instant before ledger
  creation and Owner invocation. Booking Open/Read/Create/Modify/Cancel now
  validate their decisive Owner IDs, active trip, patch, time range and party
  size before ledger or Owner execution. Journey and Trip validate active
  context, dates, modes, references and non-empty changes. Places discovery,
  verified Events, Memory and Identity validate their queries, ranges, scopes
  and write payloads before an Owner is called. R3 booking mutations retain
  explicit confirmation, idempotent receipts, transient PII handoff outside
  the ledger, and reconciliation instead of blind retry for unknown provider
  outcomes. Raw Story text and concrete preference values are handed only to
  their Owner and omitted from the Action Ledger.
- The first B0.02 Owner slice binds all 18 canonical screen routes through
  `navigation.v1.createIntent` and Back/Forward through the public
  `navigation-history.v1` commands. The validator executes those browserless
  contracts and proves every route/command key. Open Owner-method audits drop
  from 243 to **223**; this does not yet expose the 20 routes as AI actions.
- The second B0.02 Owner slice routes 16 profile and global-setting actions
  through `identity.v1 commands.updateProfile`, and the existing human profile
  and settings forms now use that same public command. The Identity contract
  rejects disallowed fields before its provider. Open Owner-method audits drop
  again from 223 to **207**; the corresponding missing AI routes remain open.
- The third B0.02 Owner slice binds 10 Journey actions to `journey.v1`: selecting
  and reading a day or entry, conflicts, route uncertainty, day rehearsal,
  disruption recovery, destination context, plan trust, single-entry removal
  and scoped clearing. The visible Journey consumer now uses the same public
  plan-trust and resilience reads instead of reaching the private resilience
  core. Open Owner-method audits drop from 207 to **197**; these bindings still
  do not claim missing AI routes or public E2E completion.
- The fourth B0.02 Owner slice binds 13 Booking actions to `booking.v1`: Trip
  and status list reads, refresh, detail, lifecycle timeline, verified contact,
  Inbox/thread reads and filters, provider messages and confirmed Intelligence
  follow-ups. Booking Control Center and Booking Inbox use these public reads
  and commands instead of the private Booking runtime. Open Owner-method audits
  drop from 197 to **184**; provider availability, draft fields, route resolution,
  reconciliation and unsupported lifecycle operations remain explicitly open.
- The fifth bundled B0.02 slice binds another **60** actions: 22 through
  `places.v1`, 12 through `journey.v1` and 26 through `memory.v1`. It covers
  Places discovery/filter/result/detail reads, explicit location and visit
  decisions, Places-to-Journey schedule edits, Journey moment fields, Memory
  library/selection/story/contribution operations and the two verified-event
  handoffs to Journey and Memory. Places now exposes bounded presence enable,
  refresh, confirm and reject commands; the validator executes the public
  Places and Memory contracts instead of trusting method names. Open
  Owner-method audits drop from 184 to **124**. Map/list presentation, external
  website/telephone/maps launching, offline packs and Undo remain open because
  no complete public execution boundary exists yet. The 60 bindings remain
  missing AI parity until Chat, lifecycle and visible public evidence are added.
- The sixth bundled B0.02 slice binds another **39** actions: all 16 Trip
  interactions, 15 Media reads/commands, two Places handoffs, two confirmed
  Intelligence learning-signal commands and five Identity commands. Trip draft
  composition now begins in a pure browserless core and is projected through
  `trip.v1`; the validator executes Trip, Media, Intelligence and Identity
  methods instead of accepting declared names. Open Owner-method audits drop
  from 124 to **85**. Auth submission, camera/file-picker gestures, cluster/UI
  presentation and unsupported media/story operations remain explicitly open
  for their correct public Auth, Platform, Experience or domain contracts.
- The seventh bundled B0.02 slice binds another **51** actions: 18 Auth flows,
  one self-service Identity export, 15 invitation/join/proposal interactions,
  two visit decisions through Places and 15 Booking availability/draft/route/
  recovery/message actions. Auth now exposes a sanitized public `auth.v1`
  adapter without passwords, raw sessions or tokens. Booking fields are
  validated in a browserless draft core before provider work. Collaboration
  sharing and voting cross a bounded compatibility contract; it explicitly does
  not claim canonical membership persistence. Abstention remains distinct from
  a negative vote. Open Owner-method audits drop from 85 to **34**. These local
  bindings still do not claim that the 51 actions are already callable by Chat
  or publicly E2E-proven.
- B0.04 now has a local browserless language compiler and a versioned language
  contract for all **330** semantic actions. Every action has its canonical
  German utterance; **142** high-frequency actions across all product domains
  additionally have curated German/English, colloquial and mixed-language
  rules. The compiler preserves source text, correction, intent order,
  negation, `TT.MM.JJJJ` dates, relative dates, times, party size, duration,
  location and spatial constraints. The formerly failing sentence `Trage
  Minigolf am 14.06.2027 gegen 14 ur in meine timline ein` resolves to
  `journey.entry.create` with `14.06.2027` and `14:00 Uhr`. Multi-intent
  Booking-plus-Timeline and English Places-plus-Favorite cases are green. The
  public `intelligence.v1` adapter exposes this only as a read/interpretation:
  it never executes an Owner or treats natural language as confirmation. This
  closes the **local B0.04 control-plane package**, not Chat insertion or public
  product parity.
- B0.05 now compiles all **330/330** semantic actions through one versioned,
  browserless safety policy. The generated register contains six primary
  safety classes, 30 public, 111 self, 173 Trip-member and 13 Trip-admin
  authority decisions, four fresh-login gates, 21 purpose-bound consent gates,
  65 provider gates and 78 online-only decisions. The public `intelligence.v1`
  read returns only the next decision and never executes an Owner action.
  Visible local scenarios prove an allowed restaurant read, explicit Booking
  confirmation, offline blocking, location consent, Trip-role denial and
  re-authentication. This closes the **local B0.05 control-plane package**;
  Chat insertion and public Integration E2E evidence remain open.
- B0.06 now compiles **330/330** action lifecycles and runs them through a
  browserless state machine. All **124** state-changing control/Owner actions
  require bounded Preview, a separate visible confirmation and idempotency;
  **121** durable Owner mutations require an Owner receipt plus readback or
  reconciliation, while three Intelligence controls use correctly attributed
  control receipts. **20** durable mutations expose truthful Owner compensation
  with a new Preview and confirmation. Unknown external outcomes block blind
  retry until reconciliation. The visible local matrix executes Favorite plus
  Undo, Booking outcome reconciliation, read-only search and external-open
  flows without sending any real Owner/provider request. This closes the
  **local B0.06 control-plane package**; productive Chat and public E2E
  insertion remain open.
- B0.07 now evaluates all **330** actions against the acting user, Trip role,
  required input, connectivity, provider health, Owner binding, AI-route state
  and lifecycle before the Chat may offer them. The matrix records **80**
  currently AI-routed semantic rows, **290** truthful human-operable Owner
  fallbacks and **15** explicit available/prerequisite/unavailable states.
  The visible local test distinguishes ready search, confirmed writes, missing
  input, offline/provider failure, consent, role denial and a not-yet-routed
  Chat action with a manual product path. Blocked actions are never included in
  the offer-only result. This closes the **local B0.07 control-plane package**;
  its decisions now feed the local B0.08 consumer projector.
- B0.08 now projects all **330/330** actions and all **15** capability states
  through one browserless bright-consumer contract. The real AI dashboard uses
  it for compact multi-intent summaries, result headers, clarification,
  previews, confirmations, read failures, receipts, recovery and Undo. A
  resolved single intent is no longer repeated as an extra “recognized wish”
  card; normal copy hides internal action IDs and Owner/lifecycle/ledger
  vocabulary; dates are rendered as `TT.MM.JJJJ`. The visible local chat test
  proves a typo-tolerant Timeline preview at `14.06.2027 · 14:00 Uhr`, explicit
  confirmation, receipt, separately confirmed Undo, missing input, offline
  recovery and two ordered wishes. This closes the **local B0.08 consumer
  package**; public Integration E2E evidence remains open until B0.10.
- B0.09 now joins the canonical registry, language contracts, safety policy,
  lifecycle, capability discovery and consumer projection into one generated
  **330-row, 12-dimension parity and failure matrix**. It derives **2,733**
  explicit failure evals for compiler ambiguity, Owner failure, typo,
  multi-intent, missing input, authority, consent, re-auth, connectivity,
  provider, confirmation, duplicate command, unknown outcome and truthful Undo
  limits wherever applicable. The current release evidence remains explicit:
  **3** public E2E proofs, **78** local AI paths, **223** manual Owner paths,
  **14** blocked rows and **11** non-product rows. Source hashes plus exact
  generated-file comparison form the CI drift gate; a new or changed action
  cannot pass without a reviewed matrix decision. The visible local gate loads
  the canonical generated file and proves search, category/release filters,
  twelve-dimension detail and failure expectations without executing an Owner.
  This closes the **local B0.09 control-plane package**; public evidence and
  release closure remain B0.10.
- Integration Apps `.133` and `.134` remain explicit counterevidence: `.133`
  rendered the confirmed `14:00` plan as `12:00`, while `.134` wrote the correct
  Owner moment but left the selected-day header and metrics on 12 June after the
  user opened 14 June. App `.135` fixes both boundaries and is the accepted
  public control-plane release. This closes B0's control-plane exit only; the
  318 product-action parity rows continue through B1–B5.

1. **B0.01 — Version the canonical semantic action registry.** Convert the
   reviewed workbook into a repository-owned, machine-readable register with
   stable action IDs, category, surface, human entry point, current
   availability and source references. Preserve the workbook as the review
   artifact; never use CSS selectors or raw `data-*` markers as action IDs.
2. **B0.02 — Bind every action to its canonical Owner.** Assign Trip, Journey,
   Places, Booking, Identity, Memory, Media, Collaboration, Event, Location,
   Device/System or the appropriate consumer owner; record the exact public
   read/command/open method or mark the missing owner boundary explicitly.
3. **B0.03 — Define deterministic input and context contracts.** Give every
   executable action a typed input schema, required and optional fields,
   defaults, preconditions, Trip/profile context rules, date/time-zone handling
   and missing/conflicting-input questions. Raw chat text is never an owner
   command payload.
4. **B0.04 — Add multilingual intent and entity coverage.** Map colloquial,
   misspelled, mixed-language and multi-intent utterances to the semantic
   registry while preserving entities, negations, spatial detail, dates,
   participants and ordering. OpenAI may interpret language; deterministic
   validation decides whether an action may proceed.
5. **B0.05 — Compile one shared safety and authorization policy.** Classify every
   action as read, navigation/open, draft, internal write, external transaction
   or high-risk/destructive action; bind self/member/admin scopes, re-auth,
   privacy/consent, provider and offline gates. The AI receives exactly the
   acting user's authority and never a broader shadow permission.
   **Local implementation complete (updated 2026-09-02):** all 330 registry actions
   now compile through one browserless, deny-by-default policy into six safety
   classes. Public/self/Trip-member/Trip-admin authority, fresh-login,
   purpose-bound consent, online/provider readiness, direct gesture and
   explicit confirmation are checked in one deterministic order. The additive
   `intelligence.v1` read only returns `ALLOW` or the concrete missing gate and
   never executes an Owner command. A visible local browser matrix covers
   permitted reads, confirmation, offline, consent, role denial and re-auth.
   Integration/public E2E evidence remains deliberately open until the next
   coherent immutable release slice.
6. **B0.06 — Generate the complete mutation lifecycle.** For every state-changing
   action require understandable Preview, separate explicit confirmation,
   idempotency key, public Owner Command, Owner Receipt, readback/reconciliation,
   recovery and a separately confirmed Undo/compensation where the owner can
   truthfully provide it. Reads and owner-surface opens use their corresponding
   non-mutating lifecycle.
   **Local implementation complete (updated 2026-09-02):** 330 generated lifecycle
   definitions, 124 protected state changes, 121 Owner receipt/readback paths,
   three scoped Intelligence-control receipt paths, 20 truthful compensation
   paths and zero blind retries for unknown external outcomes are green in the
   browserless state machine and visible local acceptance matrix.
7. **B0.07 — Build capability discovery and honest blocking.** Let the chat query
   which owner actions are currently available for this user, Trip, device and
   provider state. Offer only operable actions; otherwise explain the concrete
   missing prerequisite and expose a safe retry, refinement, manual owner flow
   or clearly unavailable result.
   **Local implementation complete (updated 2026-09-02):** 330 actions are evaluated
   through 15 honest capability states; 80 semantic rows have current AI routes,
   290 have a truthful manual Owner fallback, and offer-only queries exclude
   every blocked action. The real bright Chat consumer remains B0.08 scope.
8. **B0.08 — Project every action into the bright consumer.** Standardize compact
   in-chat reads, cards, MapLibre/Timeline continuity, owner sheets, previews,
   confirmations, receipts, errors and Undo. Technical traces remain optional
   diagnostics; duplicate intent summaries, internal IDs, raw owner vocabulary
   and oversized day dumps are not normal product copy.
   **Local implementation complete (updated 2026-09-02):** all 330 semantic actions
   compile to consumer-safe action, handoff or preview views, while the runtime
   also projects clarification, result, confirmation, error, receipt, recovery
   and Undo states. The public `intelligence.v1` adapter exposes the additive
   projection reads; the real AI dashboard consumes the same core. Visible
   local interaction is green; public Integration is deliberately not claimed.
9. **B0.09 — Generate the Human ↔ AI parity and failure matrix.** Derive contract,
   compiler, permission, confirmation, idempotency, receipt, recovery, undo,
   multilingual, typo, multi-intent and denial evals from the registry. Add a CI
   parity guard: a new or changed authenticated UI action cannot pass release
   gates without a registry decision and the applicable AI/owner evidence.
   **Local implementation complete (updated 2026-09-02):** 330 rows retain all twelve
   required dimensions and 2,733 generated failure evals. The deterministic
   generator hashes all six source contracts; CI compares the stored artifact
   byte-for-byte with a fresh build and rejects missing or changed action IDs,
   confirmation/idempotency gaps and unsupported public-pass claims. The public
   `intelligence.v1` adapter exposes additive compile, query, projection and
   coverage reads. The responsive visible matrix is local evidence only.
10. **B0.10 — Close and release parity in coherent owner slices.** Sort the 318
    executable/conditional actions by dependency and risk, then deliver them
    through the B1–B5 owner slices rather than one unsafe mega-release. Every
    slice must finish the full Owner-first chain, a visible local test, real
    Step-17 operation, focused commit, new immutable Integration version,
    Stable/Immutable byte proof and exact rollback before its registry row can
    become `PUBLIC-E2E-PASS`.
    **Public control-plane release complete (2026-09-01):** App/Core
    `13.82.135 / 4.82.135` passes 179/179 Safe Regression and NFR-0 3/3. The
    signed-in public run proved three exact source-backed Minigolf results,
    exact `14.06.2027 · 14:00 Uhr` Preview, explicit confirmation, Owner
    receipt, separately confirmed Undo, empty Timeline readback and the repaired
    selected-day heading/metrics. Stable and immutable version
    `d4efd8ac-969c-426c-b312-7ea686740ac1` match the clean source archive for
    20/20 files / 4,119,803 bytes. This closes only the control-plane exit;
    product parity remains evidence-gated row by row through B1–B5.

Block-0 exit has two binding levels:

1. **Control-plane exit:** all 330 actions are versioned, owned, classified,
   scheduled and protected by generated parity/release gates; no action is
   hidden or ambiguously counted.
2. **Product-parity exit:** every one of the 318 executable/conditional actions
   is either operable through the AI via the same public Owner boundary as the
   human UI, or is equally unavailable to both because the product/owner itself
   does not support it. Every positive claim has visible public evidence.

The control-plane exit is the rapid insertion now being executed. Product-parity
is closed progressively by the coherent B1–B5 slices; Block 0 remains an open
cross-cutting release gate until that second level is complete. This prevents a
multi-month mega-release while preserving the no-exception parity requirement.

### B1 — Productive AI Chat and first real agency (P01–P10)

Status: **STARTED / SEMANTIC-AI + UNIVERSAL-ADMISSION + FAIL-CLOSED HOTEL FOUNDATION PUBLIC ON `.136` / CHAT-NATIVE TRIP-SELECTION READ PUBLIC ON `.138` / P04–P05 PLACES MUTATIONS PUBLIC ON `.139` / BOOKING LIFECYCLE + PLACE-ROUTE INTEGRITY PUBLIC ON `.143` / SEMANTIC REQUIREMENT + BRIGHT HOTEL SUCCESSOR LOCAL / PROVIDER ACCEPTANCE OPEN**

Current truthful B1 position on 2026-09-02:

- The current accepted Integration App is `.143`. Its exact documented
  app-only rollback is accepted `.139`; rejected `.140`–`.142` are not rollback
  targets. The historical `.126` Owner-first baseline remains evidence, not the
  current deployment pointer.
- P02/P03 are **PARTIAL / OPEN**. Public runs proved live Foursquare results,
  exact provider categories, coordinates and photos, while Google
  `SearchTextRequest` remained quota-restricted. Successive public runs also
  exposed and drove fixes for rating scale, stale location, narrow restaurant
  breadth, contradictory broad categories, duplicate destination tokens,
  ranking and chat-native Place details. These reads are not a completed slice
  until the corrected consumer passes one coherent public release.
- P04 and P05 are **PUBLICLY ACCEPTED ON `.139`** for the four registered rows.
  A signed-in 390 px run proved Favorite, Unfavorite, Plan and freely worded
  Unplan through Preview, explicit confirmation, public Owner command,
  independent readback, Receipt and the applicable separately confirmed Undo.
  Journey restoration retained exactly `12.06.2027`, `17:50 Uhr` and three
  moments; the Favorite test restored the original no-favorite state. The
  registry now contains seven `PUBLIC_E2E_PASS` rows. Cross-surface Chat subject
  hydration remains a named AI follow-up because reopening Chat from Places
  required one search before the Place name was again an unambiguous subject.
- P06–P09 remain **OPEN** beyond partial contracts/evals. The `.143` public
  lifecycle and exact Place-route slice closes neither real provider
  activation nor provider-backed completion. P10 and the S16
  planning projections have meaningful partial coverage but do not constitute
  Block-1 completion.
- The `.135` counterexample (`ich will eine andere reise auswählen` → Places
  travel agencies) opened the semantic-first correction. `.137` removed the
  false date/time requirement but was publicly rejected because a lower-level
  navigation route closed the Chat. Accepted `.138` now keeps that exact
  sentence in Chat, asks for no date/time, renders nine Trip-owner projections
  with eight concrete selection controls and performs no mutation. The signed-
  in public Hotel sentence on `.136` and Trip-selection sentence on `.138`
  jointly prove the read-side whole-sentence owner boundary.
- P06–P08 now include the **universal admission and booking provider family**.
  The Booking Owner, not Places/Journey/Chat, decides whether a place is dining,
  lodging, attraction, culture, activity, event, transport or rental; whether
  free/not-required/recommended/required/timed entry is explicitly evidenced;
  and which safe route is available. `reservable=true`, a category or a ticket
  URL never becomes an invented requirement. The public foundation supports an
  official ticket/reservation link and a source-backed verified public booking
  email immediately. Tiqets and Viator receive partner-gated API adapter
  counterparts; GetYourGuide, FareHarbor, Bókun, Regiondo, bookingkit, Xola and
  Checkfront are recognized handoff/partner candidates; EVENTIM, Reservix and
  Ticketmaster are recognized event-ticket handoffs. None is called connected
  without real partner access and runtime health.
- The coherent public B1 foundation now contains the browserless
  `booking.admission.v1` decision, additive `booking.v1` reads, a canonical
  `booking.place.open` action with the old restaurant ID retained only as a
  compatibility alias, admission notices in Chat/Place detail, Places and
  Journey suggestions, plus fail-closed Tiqets and Viator adapters. The
  executable registry contains **24** actions, including
  `navigation.route.open`, universal `booking.place.open` and the typed
  `booking.stay.search` Owner read; `booking.stay.offer.open` is the separately
  typed selected-offer handoff.
- Focused syntax, semantic-routing, admission/provider, Booking-owner,
  action-runtime, consumer and registry suites are green. The visible local
  fixture is operated successfully at the default and 390 × 844 viewport:
  `pass`, 4 admission states, 11 provider tiers, no horizontal overflow and no
  browser warning/error. The immutable `.136` release chain is complete for
  this fail-closed foundation; the `.138` app-only follow-up passed 189/189,
  local and public 390×844 operation, 23/23 byte identity and rollback to
  `.136`. The separate visible
  Hotel live-price fixture is also green at default and 390×844: one property,
  two controlled comparable tariffs, `TT.MM.JJJJ`, no market-best claim,
  truthful no-provider fallback, no overflow and no console warning/error. The
  actual Hotel module has now been rebuilt locally in the same bright design
  language and passes a second visible Owner fixture: no ticket labels or
  generic Place route, and the selected Hotelbeds property/offer identity
  survives the exact handoff unchanged.
- Consequently Block 1 is started, not finished. Booking Read/Open/Create/
  Modify/Cancel, positive provider activation, P09/P10 and the applicable remaining Desktop/Mobile/
  Keyboard/Reload/Back/Reduced-Motion rows must still pass before the Block may
  advance as complete.

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
6. **P06 — Universal Booking Read/Open.** Classify the visit through the Booking
   Owner; show a compact admission/reservation notice in Places, AI Chat and
   Journey/Timeline suggestions; show owner/provider status, evidence, price
   and terms; open only a verified official/provider/email route and never infer
   requirement, availability or partner connectivity.
7. **P07 — Booking/Ticket Create.** Execute only supported provider-backed creation with
   idempotency, refreshed terms, explicit confirmation and provider/owner
   receipts.
8. **P08 — Booking/Ticket Modify/Cancel.** Expose consequences and fees before confirmation;
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

The immediate active slice is now **B1's unfinished shared Places/Hotels map and
mini-info interaction after the public `.167` engineering checkpoint**. An older
conversation whose context ends at M5 must not resume the old milestone order;
it must first read `../handoffs/M5-TO-CURRENT-CONTEXT-BRIDGE.md` and continue at
this exact surface:

- retain the now-versioned 330-action semantic registry and 939-marker source
  audit as the canonical B0.01 baseline;
- preserve the 246 public Owner bindings and zero remaining
  `OWNER_METHOD_AUDIT_OPEN` rows rather than inventing global methods;
- retain the now-green 24/24 runtime input enforcement across Places, Events,
  Booking, Journey, Trip, Memory and Identity, then expand typed contracts to
  missing actions domain by domain;
- retain the now-green registry/source-drift, language, 330/330 authority,
  lifecycle, capability, bright-consumer and 330-row parity/failure gates;
- retain the visible local register gate as an always-operable progress surface;
  it must continue to load the canonical register rather than a copied demo list;
- retain `.135` as the accepted B0 control-plane baseline, `.136` as the
  accepted B1 admission/Hotel foundation, `.138` as the accepted Chat-native
  Trip-read deployment, `.139` as the accepted Places-mutation deployment and
  `.143` as the accepted Booking lifecycle/Place-route-integrity deployment and
  `.147` as the accepted recovery baseline. `.167` is the current public
  map/preview checkpoint and the rollback target for its next App-only
  successor; it is not yet a user-accepted Design Freeze;
- keep the accepted semantic-first owner router, universal admission Read/Open,
  `.139` Favorite/Unfavorite/Plan/Unplan and `.143` lifecycle/identity paths
  green; reproduce and close the remaining mini-info/map smoothness and layout
  defects without creating a second sheet, map or Hotel interaction path;
- preserve one exact selected provider entity and its image from pin through
  preview and drag; the preview must grow with the finger to map width and map
  bottom, and Places plus Planen → Hotels must remain behaviorally identical;
- obtain explicit user acceptance after desktop, narrow mobile, real touch,
  keyboard, Back/Reload and Reduced Motion evidence before leaving this slice;
- retain the now-regenerated canonical `booking.place.open` registry and typed
  input contract while `booking.restaurant.open` remains only a migration
  alias, retain `booking.stay.search` as a semantic read through
  `booking.v1.reads.searchStayOffers`, and retain `booking.stay.offer.open` as
  the exact selected-offer handoff. The runtime count is 24; public evidence
  does not rise until the visible Integration run passes;
- activate Booking/Ticket Create/Modify/Cancel only after real partner access,
  Edge transport authorization, health, idempotency and provider-positive E2E,
  without upgrading unrelated registry rows.

After that gate, B1 resumes at P06–P10 and any still-open P02/P03 provider rows.
A documentation entry, a green fixture or a successful Owner call
without correct human-visible readback is not completion evidence.

### 4.1 Historical P02–P03 implementation ledger at the `.127` boundary

Status: **SUPERSEDED STATUS SNAPSHOT — RETAINED AS EVIDENCE, NOT CURRENT STATE**

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

### 4.2 Current B0/B1 handoff ledger — 2026-09-03

Status: **B0 CONTROL-PLANE EXIT PUBLICLY COMPLETE ON `.135` / B1 FOUNDATION `.136` + CHAT-NATIVE TRIP READ `.138` + PLACES MUTATIONS `.139` + ROUTE INTEGRITY `.143` PUBLIC / `.167` PUBLIC MAP CHECKPOINT WITH USER ACCEPTANCE OPEN / PRODUCT-PARITY DELIVERY CONTINUES**

- B0 inventory/review and the local B0.01 machine-readable repository insertion
  are complete. The current control plane has 245 audited public Owner paths;
  the dated B0.02 bundles below explain how the pre-B1 set was assembled: 20 Navigation/History,
  16 Identity profile/settings, 10 initial Journey reads/deletes, 13 Booking
  actions, a 60-action Places/Journey/Memory/Event bundle and a 39-action
  Trip/Media/Identity/Intelligence bundle, a 51-action Auth/Collaboration/
  Booking bundle and the final 34-action Platform/Places/Journey/Media/Memory
  bundle. No Owner-method audit row remains open. This does not mean complete
  AI parity: typed chat routes, visible confirmation/receipt/Undo and public
  E2E evidence are still required. B0.03 typed metadata contracts and
  bounded pre-Owner enforcement now cover all 24/24 current runtime actions;
  schemas for the still-missing AI actions remain open. The generated B0.09
  structure, provenance, 12-dimension evidence, 2,733 failure evals,
  typed-contract and source-marker gates are green locally. B0.04
  additionally covers 330 canonical German actions and 142 curated multilingual
  action rules. B0.05 covers all 330 actions with the shared authority,
  re-auth, privacy, provider and offline policy. B0.06 covers all 330 actions
  with read/open/draft/permission/external/mutation lifecycles, including all
  124 protected changes and 20 truthful Undo paths. B0.07 evaluates all 330
  actions through 15 honest capability states, with 80 currently routed rows
  and 291 truthful manual Owner fallbacks. B0.08 now projects all 330 actions
  into the compact local Chat; B0.09 now closes the local parity/failure matrix
  and CI drift package. B0.10 is publicly released and closed as a control-plane
  exit; product parity remains open and is now delivered through B1–B5.
- P02/P03 have positive public Foursquare/provider-photo evidence and extensive
  negative counterevidence. They remain partial until one corrected coherent
  public build passes the complete consumer and release chain.
- `.139` closes the four coherent P04/P05 rows after the earlier `.135`
  counterevidence: Favorite/Unfavorite and Plan/freely worded Unplan all use
  Preview, separate confirmation, Owner readback, Receipt and compensation.
  The public Journey sequence removed one exact entry, showed two moments and
  restored `12.06.2027`, `17:50 Uhr` plus three moments; Favorite/Unfavorite
  restored the original state. The former `.135` trip-selection misroute remains
  closed on accepted `.138`. Neither release claims all-language parity; the
  observed cross-surface Chat-subject reset is retained as an explicit eval.
- `.167` is the current visible public checkpoint: 201/201 Safe Regression,
  NFR-0 3/3, public Places/Hotels pointer and drag proof, exact one-entity
  previews and 10/10 release-byte equality are complete. The user's latest
  assessment still rejects completion of the map and compact preview. The next
  accepted build must improve that same interaction and expose a visible test
  the user can operate. No block or row becomes complete from automated tests
  alone.

### 4.3 Hotel decision and affiliate activation lane — 2026-09-02

- Hotels are a dedicated Planning product, not a generic Places result and not
  a restaurant reservation variant. Luvia first chooses a property and then a
  provider route for an equivalent offer.
- One property may contain offers from multiple approved sources. Provider
  price comparison requires the same dates, party/rooms, currency, room/board/
  bed signature, complete mandatory charges and a fresh quote.
- The visible choices are cheapest comparable total, best flexible option and
  best personal fit. Commission/revenue never contributes to user ranking.
- KAYAK is the strategic hotel breadth application; Expedia Group Travel
  Creator is the earliest broad tracked-handoff application; Booking.com
  Demand and Expedia Rapid stay separately gated deep-booking contracts.
- Duffel Stays is the first requested named live-price proof; Hotelbeds is the
  intended independent second-source evaluation. They do not replace KAYAK's
  cross-provider breadth and do not inherit an
  affiliate revenue claim. Without at least one live price response, Hotel UI
  is fit-only; without two live sources it cannot claim cross-source comparison.
- The public `.136` foundation contains the authenticated
  `booking-hotel-offer-search` gateway, separate fail-closed Amadeus and
  Hotelbeds adapters, service-only search/snapshot evidence and the public
  `booking.v1.reads.searchStayOffers` route. Only `live=true` provider API
  evidence may enter a price decision; missing partner status, credentials,
  destination identifiers, taxes or current responses stays `fit_only`.
- The controlled Hotel acceptance passes at default and 390×844 for both
  two-controlled-source and no-source states, with no overflow or console
  warning/error. Stable additionally proves the signed-in semantic Hotel read,
  truthful no-provider state and 390×844 no-overflow path. The actual Hotel
  module is now replaced on public `.167` by a bright dedicated consumer using
  the same Booking Owner and the shared Places map interaction. It shows
  `TT.MM.JJJJ`, the named source and complete total,
  exposes one `Dieses Angebot öffnen` action and proves the exact controlled
  `HBX-9 · HBX-RATE-9` handoff. It renders neither `Tickets prüfen` nor the
  generic Place booking command. This is still no proof of a positive public
  live-provider price, and its map/mini-info design remains awaiting explicit
  user acceptance.
- Viator, Tiqets, Expedia Creator, Hostelworld, Omio and Klook form the first
  commercial application wave. The owner must submit contracts and payout/tax
  data; credentials remain outside the repository.
- Binding activation/ranking evidence is in
  `M16.5-AFFILIATE-ACTIVATION-AND-HOTEL-DECISION-PLAN.md`. No provider becomes
  active without real approval, Edge transport, health, reconciliation,
  visible public E2E and the complete immutable release/rollback chain.

The binding provider order is Duffel Stays first named live-source proof after
approval → Hotelbeds second-source proof → KAYAK breadth application → Expedia
Rapid qualification → Booking.com Demand qualification. The prepared Amadeus
adapter remains a later enterprise option. Affiliate applications may proceed
in parallel, but their links never become price evidence or ranking input.
