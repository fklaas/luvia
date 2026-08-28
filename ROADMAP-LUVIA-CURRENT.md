# Luvia Current Roadmap

Date: 2026-08-28

Source of truth: Git/runtime evidence first; the complete normative roadmap is
the latest `Luvia_Masterfahrplan_Native_First_Ready_*_VOLLSTAENDIG.docx`.

## Current verified product baseline

- Integration candidate App/Core target: 13.82.99 / 4.82.99 (M16.5Z First
  Trip Composer).
- Stable Integration before M16.5Z remains App/Core 13.82.98 / 4.82.98,
  version `31624f74-d281-43eb-81b7-8b994401c7df`, deployment
  `a0215087-ad1c-47a3-9345-e5fa3cd2eb83`.
- Main/Production remain on App/Core 13.82.49 / 4.82.49 until joint visual
  Preview acceptance.
- M0-M16: COMPLETE / CLOSED; M16 Production verified.
- Integration candidate Safe Regression: 116/116 PASS; regenerated visual
  inventory freshness 2,855/726 with 0 unclassified; NFR-0 3/3 PASS; cross-Core DB guard PASS
  without debt growth.
- Main/Production M16 baseline before visual promotion: 90/90 PASS.
- M16 action platform: 19 actions across Trip, Places, Booking, Journey,
  Memory and Identity with R0-R3 policy and digest-only Action Ledger.
- Integration and Production: 17/17 critical assets exact; 10/10
  private/retired SPA fallbacks; authenticated 25/25 F5 each; console 0.
- Database/schema/RPC/RLS/bucket migration in M16: none.
- Supabase Edge Function, secret and manual Cloudflare configuration change in
  M16: none.
- M16.5 architecture marker: `41c02f6cf6a36d85eecba3f02a7c7a7a38e4444f`;
  Safe Regression 92/92 on Platform, Integration and Main; NFR-0 3/3;
  20/20 architecture streams synchronized at that marker.
- M16.5C navigation-continuity runtime: Production verified at App/Core
  13.82.49 / 4.82.49; Safe Regression 93/93; Integration 8/8 exact plus
  authenticated 25/25 F5; Production 16/16 exact plus authenticated 25/25 F5;
  zero obsolete module intros and console 0. The broad redesign remains
  Design-only and its Design Freeze is still pending.
- M16.5E Living Design/Compass foundation: official neutral and active-Trip
  Compass variants, needle-only motion, semantic haptics and native mappings;
  feature/Integration foundation commit
  `afddfca01f1b5a0f9d6083a1dceb83b3a3949eef`.
- M16.5F Signed-in Living Product vertical slice: productive App Shell and
  Today composition, target meanings Heute/Planen/Luvia Compass/Reise/
  Erinnern, real owner projections and unchanged `navigation.v1`; Integration
  commit `e1e4b5fce80c854bba745f9bb12e1ef0c4bda74d`; Safe Regression 95/95.
- M16.5G Platform release gate: official Compass replaces the active root,
  favicon and PWA icon family; active runtime/cache advances to 13.82.50 /
  4.82.50; 96/96 Safe Regression, NFR-0 3/3 and the regenerated 2,761-file
  visual inventory pass. Preview, authenticated desktop/mobile acceptance,
  Main and Production remain pending.
- M16.5H accepted Living Shell adoption: the productive App Shell now uses the
  accepted light desktop sidebar, responsive five-destination mobile dock,
  official layered Compass and real Trip/Navigation/Collaboration/Intelligence
  projections at Consumer source
  `fee1cdbe02707f845fa6543d17b9c03718135c23`.
- M16.5I visual parity/no-substitution gate: the 27-file accepted reference is
  pinned by six SHA-256 key inputs; twelve mandatory product surfaces have an
  explicit desktop/mobile/motion/state/accessibility/joint-acceptance matrix.
  A new shell around an old feature is explicitly not completion.
- M16.5J release target: App/Core 13.82.51 / 4.82.51 packages H/I as an
  immutable Integration review candidate. Main and Production stay locked on
  13.82.49 / 4.82.49 until the complete matrix is jointly accepted.
- M16.5K productive Plan Compass: Consumer source
  `37cead7b30230f2731b866390c510f812ba50291` replaces the Plan tile wall with
  the accepted embedded eight-direction Compass, official native-needle motion
  and no-scroll 390×844 / 320×673 responsive sizing.
- M16.5L release target: App/Core 13.82.52 / 4.82.52 publishes K as a new
  immutable Integration review candidate. Places/Booking and all remaining
  feature stages continue before joint Design Freeze; Main/Production remain
  locked.
- M16.5M correction target: App/Core 13.82.53 / 4.82.53 returns the central
  mobile navigation Compass to normal five-column dock layout at 42 × 42 px,
  or 40 × 40 px up to 390 px, without changing the accepted shared-element
  Plan flow. It is a new immutable Integration candidate; Main/Production stay
  locked and Places/Booking remain the active visual-migration work.
- M16.5N Places owner hardening: Places source `2decd5e` accepts the public
  provider `location` projection and emits only complete finite WGS84 pairs;
  invalid or partial coordinates never become map markers.
- M16.5O productive Places composition: Consumer source `8126c51` replaces the
  default legacy guided Places screen with the accepted light search/map/result
  stage, six-to-eighteen real results, public owner actions, explicit runtime
  states and exact coordinate-only markers. The Plan exit correction keeps
  unselected directions stationary while they fade.
- M16.5P release target: App/Core 13.82.54 / 4.82.54 publishes N/O as a new
  immutable Integration review candidate. Productive Places is the completed
  implementation slice; Browser acceptance remains required and Booking is the
  next visual feature migration. Main/Production stay locked.
- M16.5Q closes the Living Compass recovery at App/Core 13.82.64 / 4.82.64
  after local/public real-input matrices and the user's separate physical-
  handset retest. The accepted Compass is frozen as navigation infrastructure.
- M16.5R is the first Productization Plan correction: App/Core 13.82.65 /
  4.82.65 preserves a later Places result's horizontal rail, exact selection,
  map position and focus while asynchronous `Details & Evidenz` opens or
  closes. Source/stable/immutable provenance and the authenticated visible
  Integration E2E are PASS; explicit user acceptance and the complete Places
  Golden Slice remain open.
- M16.5S begins the next vertical slice with a binding Public Landing / real
  Authentication baseline. Five accepted Landing reference artifacts are
  hash-pinned, the current productive entry and Supabase Auth owner are
  measured, and 23 signed-out/auth/session states plus no-substitution and
  no-second-session-store rules are locked before runtime adoption. The
  complete Landing/Auth user outcome will receive its own Integration version;
  Main and Production remain locked.
- M16.5X freezes the accepted Living Shell geometry on Stable Integration at
  App/Core 13.82.97 / 4.82.97 with collision-free Compass orbits and the
  dedicated Control Center Compass. Main and Production remain unchanged.
- M16.5Y implements and publicly verifies Gate 3 of the Productization Plan on
  Stable Integration at App/Core 13.82.98 / 4.82.98: one seven-stage,
  post-auth Identity Compass onboarding with atomic Identity-owner commit,
  session-scoped resume/defer/edit and an explicit prohibition on Trip writes.
  Local and public Desktop, short-height, landscape and Mobile evidence,
  stable/immutable 9/9 byte parity plus 115/115 Safe Regression are PASS. The
  next independent gate is the Trip-owned First-Trip
  Composer; physical-handset acceptance and the broader Design Freeze remain
  open.
- M16.5Z implements Gate 4 as the Trip-owned First Trip Composer at App/Core
  13.82.99 / 4.82.99: nine stages, idempotent Trip owner commit, public
  Places-v1 destination confirmation, session-scoped recovery, all 50 Landing
  colours and explicit Profile-versus-Trip preference semantics. Local
  Desktop/Mobile/Keyboard/Reload/Back/Reduced Motion evidence is PASS. The
  Collaboration invitation execution and downstream use of the stored
  trip-feeling weights in Places/Planning/Journey remain intentionally open;
  Main, Production and the broader Design Freeze stay locked.

## Completed architecture boundaries

- Platform Runtime and Platform Ports.
- Trip Core.
- Places Core.
- Booking Core/stream boundary.
- Media Core.
- Identity Core and versioned Events Contract.
- Intelligence Core and governed action orchestration.
- Experience Core.
- Journey Core as independent cross-domain Day Graph/Timeline aggregator.
- Memory Core.
- Core-aligned twenty-stream ownership topology: one stream for every active
  or bindingly reserved Core, plus Main, Integration and non-owning Consumer.
- Social / Experience Graph and Collaboration / Membership are separate
  reserved owners: Social is the anti-vanity Social Travel Intelligence layer;
  Collaboration owns concrete group/trip membership, invitations and roles.

Consumer and Experience own no Domain Truth. Intelligence may reason, rank,
plan and orchestrate, but executes changes only through public owner commands.

## Current mandatory gate: M16.5 Complete Visual Product Redesign

The jointly selected M16.5 design is now the binding productive endpoint. Its
implementation proceeds in measured feature slices, but no alternative visual
interpretation or legacy substitution is allowed. The current visual design is
replaced completely while the proven Domain architecture remains. Required
outputs and release gates:

The binding execution order, slice Definition of Done and live status/ownership
ledgers are now defined in
`docs/modularization/M16.5-DESIGN-INTEGRATION-AND-FEATURE-PRODUCTIZATION-PLAN.md`,
`docs/modularization/M16.5-PRODUCT-SURFACE-MATRIX.csv` and
`docs/modularization/M16.5-CORE-OWNER-MATRIX.csv`. Work proceeds through closed
vertical outcomes: Places continuity, public Landing/real Auth, Profile
onboarding, First-Trip Composer, Places Golden Slice, Booking, Today/Journey and
Media/Memories. The accepted Living Compass is frozen after the user-confirmed
App 13.82.64 handset pass. Main and Production remain locked until the complete
matrix and explicit Design Freeze are accepted.

- Corporate Design and brand foundation;
- two to three distinct creative territories;
- exhaustive inventory of every active, hidden, empty, loading, error,
  offline, confirmation and recovery surface plus every relevant UI/CSS/
  Experience/legacy file and active runtime asset;
- complete screen, state and interaction architecture for all boxes,
  containers, navigation, forms, tables, cards, maps, overlays, sheets and AI
  Rich Results;
- dynamic motion language and native Web/iOS/Android adaptations;
- explicit Hover/Press/Focus/Drag/Scroll, screen-transition,
  micro-interaction, animation, haptic-equivalent and reduced-motion language;
- accessibility, performance and reduced-motion budgets;
- semantic active-Trip accent system for buttons, selection, highlights,
  headings, outlines and motion;
- separately composed Administrative Experience for user/role/grant/policy,
  approvals, incidents, break-glass and audit exploration; UI visibility never
  substitutes server authorization;
- explicit user-approved Design Freeze before M17.

### M16.5C active directional foundation

The joint work has now moved from unrelated concept screens into one accepted
directional foundation. This is a binding product direction, but not yet the
complete Design Freeze:

- Q/R is the strongest visual base; B spatial orientation, D Corporate warmth,
  E complete action/consent/receipt flows, F Living-Itinerary phases and G
  shared-element motion remain required functional DNA;
- Luvia uses a bright, open, primarily white canvas with meaningful travel
  imagery, depth, rhythm and affectionate detail; it must not become sterile,
  newspaper-like, insurance-like, overly soft/blurred or space-themed;
- warmth is created by anticipation, shared travel, discoveries, recovery and
  memories. Image language is decided separately and does not equate warmth
  with indiscriminate stock photos of people;
- primary navigation is Heute, Planen, central Luvia, Reise and Erinnern.
  Wallet, Booking, Collaboration, Profile/Settings, Attention and Admin/Social
  remain contextual flows backed by their own owners;
- the central Luvia surface means "Fragen, planen, handeln": it combines
  conversation, rich owner projections, confirmations and receipts without
  taking foreign Domain Truth;
- public entry, onboarding, first-Trip creation and signed-in product form one
  continuous story. Scroll, entrance/exit, creation, change, confirmation and
  recovery motion use one spatial model with reduced-motion parity;
- active-Trip colour is a semantic accent across actions, selections, focus,
  highlights, route traces and motion, always with contrast-safe fallbacks;
- the first design-only implementation now covers the target desktop/mobile
  navigation, cinematic landing flow, complete first-Trip onboarding and
  reversible scroll/route choreography. It does not write production Trip
  truth and is not deployed as the final redesign;
- public entry and onboarding are now the binding visual/motion benchmark for
  every remaining product surface: bright travel canvas, cinematic scene
  changes, reversible fade/depth transitions, restrained magnetic response,
  semantic haptic intents and native-quality reduced-motion parity;
- account/profile onboarding and Trip creation are deliberately separate
  product flows. Identity owns account, consent and the global Reisekompass;
  Trip owns the concrete journey frame; Collaboration owns invitations,
  membership and roles. A shared visual handoff must never merge ownership;
- the Identity flow must cover the complete existing Reisekompass vocabulary:
  interests, dietary preferences, travel style, activities, evening,
  mobility, family, accessibility, pace and budget. Learned signals remain
  proposals until the person explicitly confirms them;
- the independent Trip Composer must preserve at least the complete current
  Trip-creation capability: name, optional subtitle, canonical destination,
  symbol, start/end or flexible dates, active modules, privacy, members/roles,
  invitation handoff and active-Trip accent. No redesign may silently drop an
  existing creation capability;
- the active-Trip colour is previewed during creation and then follows the
  selected Trip across primary actions, selections, focus, routes, headings,
  outlines, confirmations and shared-element motion. Corporate base colours
  and semantic status colours remain stable and contrast-safe;
- "magnetic" and "haptic" mean an Experience-owned interaction grammar, not
  direct browser/device calls from Domain code. Web vibration is an optional
  adapter, while iOS/Android later map the same semantic intents to native
  feedback;
- the active Runtime App Shell double-arrival defect is independently isolated:
  the obsolete full-field module splash is replaced by a single target-mount
  transition while canonical `navigation.v1` semantics remain unchanged.

Evidence and remaining gates are recorded in
`docs/modularization/PCR-M16.5C-CINEMATIC-PRODUCT-NAVIGATION-FOUNDATION.md`
and `docs/modularization/PCR-M16.5D-PROFILE-TRIP-ONBOARDING-SPLIT.md`.

## Accelerated delivery corridor

- M17: token-first implementation of the approved visual product language in
  vertical, rollback-capable flows.
- M18.1: Collaboration / Membership Core.
- M18.2: Attention / Notification Intent Core.
- M18.3: Travel Wallet / Documents Core.
- M18.4: Reviews / Reputation Core.
- M18.5: Admin / Governance Core — mandatory security and operability Core.
- M18.6: Social / Experience Graph Core — strategic Social Travel Intelligence.
- M18.7: Universal Search / projection index, not a shadow Domain Core.
- M18.8: Luvia Intelligence Product Evolution II — system-wide context,
  capability coverage, proactive assistance, Voice/Multimodal and evals.
- M19: Offline/Sync, conflicts, resilience, observability and AI evals.
- M20-M21: native iOS/Android delivery and productization using the same
  Domain contracts.
- M21.5: exhaustive all-functions matrix, autonomous first and targeted user
  acceptance second.
- M22: staged Production/App Store/Play Store rollout.

## M18 Core blueprints

All six new Cores follow the same owner-first delivery sequence: read-only
inventory and ADR; public Contract, Commands, Events and state machine;
browserless policy tests; separately approved persistence/security changes;
Web and native adapters; Experience/Intelligence integration; regression,
Preview, Production and twenty-stream closeout. Consumers never write private
owner persistence, and every mutation carries actor, scope, idempotency,
expected version, correlation and an owner receipt.

### M18.1 Collaboration / Membership Core

- Owns collaboration spaces, memberships, invitations, roles, grants, join
  requests and audit history; Identity, Trip, Journey, Booking and Media remain
  independent owners referenced only through IDs and Contracts.
- Publishes `collaboration.membership.v1`, membership projections and events;
  commands cover invite, accept/decline/revoke, role change, remove, leave and
  owner transfer with explicit risk/confirmation policy.
- Enforces deny-by-default server authorization, RLS, expiring hashed invite
  tokens, replay protection and auditable role transitions.
- Uses DeepLink, Sharing, Notification, Network, Lifecycle, SecureStorage and
  OfflineCache Ports. Offline state is a read model; critical changes remain
  pending until an owner receipt confirms them.
- Acceptance includes the complete role/permission matrix, RLS negative cases,
  invite expiry/revoke/replay, races/idempotency, offline/reconnect, deep-link
  F5, accessibility, browserless smoke and Production provenance.

### M18.2 Attention / Notification Intent Core

- Owns attention policies, channel preferences, quiet hours, semantic
  notification intents, scheduling, dedupe, Inbox/read/snooze state and
  delivery receipts; originating Domain facts remain with their owners.
- Publishes `attention.notification-intent.v1`. Domain owners request semantic
  intents with source, urgency, expiry, dedupe key and Deep-Link Intent instead
  of embedding provider-specific push behavior.
- Deterministic policy covers consent, local timezone/DST, quiet hours,
  frequency caps, grouping, suppression reason and security priority.
- Notification, Lifecycle, Network and DeepLink Ports isolate push, e-mail,
  in-app and future providers. Minimal lock-screen payloads, token rotation,
  retention and unknown-delivery recovery are mandatory.
- Acceptance includes timezone/DST, opt-in/out, multi-device, dedupe/retry,
  provider outage, offline/reconnect, deep links, rate limits, accessibility,
  browserless policy smoke and real delivery receipts.

### M18.3 Travel Wallet / Documents Core — priority

- Owns secure travel documents, versions, classification, validity,
  verification claims, share grants, expiry/checklist projections and encrypted
  asset references; Booking, Trip, Identity and Media keep their own Truth.
- Publishes `travel-wallet.documents.v1` with redacted snapshots and
  capability-based reads. Commands cover import/capture, classify, correct,
  replace, verify, link, share/revoke, archive and two-stage deletion.
- Covers ID/passport references, visa/entry material, tickets/boarding passes,
  confirmations, insurance and specially governed health evidence through a
  declarative document-type registry.
- Requires threat modelling and data classification, encryption/key rotation,
  short-lived signed URLs, MIME/size/malware checks, EXIF redaction, RLS,
  step-up authentication and absolute exclusion from logs/analytics/ledgers.
- Uses SecureStorage, MediaPicker/Capture/Storage, Permission, Device,
  OfflineCache, Network and Sharing Ports. Offline cache is encrypted,
  selective, expiring and remotely revocable; version/hash conflicts are
  explicit.
- OCR, extraction, translation and reminders require consent, field provenance
  and confidence. Raw documents do not go to external models by default;
  sharing, overwrite, revoke and deletion never execute autonomously.
- Acceptance includes IDOR/RLS, signed URL expiry, malware/MIME, log redaction,
  OCR confidence, version conflicts, offline/revoke, export/deletion proof,
  backup/restore, native protection capabilities, browserless state smoke and
  independent security/privacy approval.

### M18.4 Reviews / Reputation Core

- Owns Luvia reviews, revisions, rating dimensions, publication/moderation
  state, reports, appeals, helpful votes and transparent reputation
  projections. Places/Booking remain owners; provider reviews are attributed
  read models, never copied Luvia Truth.
- Publishes `reviews.reputation.v1`; commands cover draft, publish, edit,
  withdraw, report, vote, moderation and appeal. Verified visits are evidence,
  not a hidden requirement or global social score.
- Aggregates expose sample size, dimensions, recency and uncertainty.
  Moderation has reason codes, human review and appeal; AI may assist but not
  make final high-risk decisions.
- Privacy includes lawful attribution/pseudonymization, minimum Identity
  projection, media consent, blocking/reporting and protection against leaking
  sensitive travel or presence data.
- Acceptance includes RLS/ownership, revision history, aggregate correctness,
  spam/rate-limit/Sybil scenarios, moderation/appeal, deletion, offline drafts,
  media safety, accessibility, browserless policy smoke, load and Production
  rollback evidence.

### M18.5 Admin / Governance Core — mandatory

- Owns platform-administrative roles, capability grants, resource scopes,
  policy versions, delegations, approval requests, time-boxed break-glass
  sessions and immutable administrative audit receipts. Identity owns the
  person/authentication context; Collaboration owns trip/group membership;
  managed Domain Cores retain their own Truth and invariants.
- Publishes `admin.governance.v1` and `admin.audit.v1`. Canonical models include
  AdminPrincipalRef, AdminRole, Capability, ResourceScope, PolicyRule,
  RoleAssignment, Delegation, ApprovalRequest, BreakGlassSession, AuditEntry
  and AdminActionReceipt.
- Commands cover create/update/retire role, grant/revoke assignment, delegate,
  request/approve/deny high-risk change, suspend/reactivate subject, revoke
  sessions and open/close break-glass. Every command carries actor, purpose,
  scope, reason, idempotency key, expected version and correlation.
- Default deny, least privilege and separation of duties are server-enforced.
  Client visibility, cached projection, JWT convenience claim or hidden route
  is never sufficient authorization. Self-grant/self-escalation is forbidden;
  the last Superadmin cannot be removed or weakened without a recoverable,
  independently approved successor.
- Highest-risk changes require step-up authentication, explicit reason,
  dual control/four-eyes approval, expiry and immutable audit evidence.
  Break-glass is exceptional, time-boxed, narrowly scoped, alerted and reviewed;
  it is not a permanent Superadmin shortcut.
- Administrative UI is a dedicated Experience surface: overview, user and
  principal directory, roles, permission matrix, scopes, pending approvals,
  audit explorer, incident/break-glass console and system-health projections.
  The UI calls Admin commands and foreign owner commands; it never writes
  tables directly or becomes a second Domain owner.
- Intelligence may explain access, draft policy changes and flag anomalies.
  It may never grant/revoke Superadmin, approve its own proposal, open
  break-glass, suspend/delete accounts or autonomously perform highest-risk
  administrative actions.
- Native First uses AuthSession, SecureStorage, Device, Permission, Network,
  Lifecycle, Notification and DeepLink Ports. Offline Admin state is redacted
  read-only cache; mutation fails closed until online policy and owner receipts
  are available.
- Persistence/RLS/RPC/Edge work is a separately approved security migration.
  Acceptance includes full permission matrix, negative privilege-escalation
  and IDOR/RLS tests, concurrent grant/revoke, last-Superadmin protection,
  dual-control races, audit tamper evidence, break-glass expiry, session
  revocation, offline deny, reload/deep-link, accessibility, browserless policy
  smoke, Preview/Production provenance and independent security review.

### M18.6 Social / Experience Graph Core — strategic

- Product position: Luvia is not a classic feed/follower/like network. It is a
  Social Travel Intelligence Network that answers which consented experiences
  from trusted or behaviorally compatible people are relevant to the active
  trip and can be transformed into owner-confirmed action.
- Owns consented Experience Graph edges and lifecycle, circles/relationships,
  visibility and blocking, Travel Twin relationship state, Experience Drops,
  Echo eligibility/delivery state, Trip Fork provenance and inspiration
  signals. It does not copy Trip, Places, Booking, Memory, Media, Identity,
  Reviews, Collaboration, Attention or monetization truth.
- Publishes `social.experience-graph.v1`; `social.v1` remains the compatibility
  name. Public projections cover relevant experiences, relationship/circle
  state, privacy-safe compatibility evidence, Echo/Drop/Fork provenance and
  inspiration receipts—never a hidden global popularity score.
- Anti-vanity is a binding product invariant: no follower race, public like
  count, engagement feed or influencer override. Relevance is explained using
  trust, context, recency, verified evidence and similarity with uncertainty.
- Travel DNA remains split correctly: Identity owns explicit preferences;
  Intelligence owns inferred behavioral models and match calculation; Social
  consumes only a privacy-safe vector/projection and owns durable consented
  relationship state, not the private model.
- Travel Twins: Intelligence calculates explainable compatibility; Social
  governs discovery consent, candidate visibility, dismissal/blocking and any
  accepted connection. Match percentages include provenance, uncertainty and
  minimum-sample gates.
- Luvia Echoes: Memory owns source memories; Places owns location references;
  Social owns the consented person-to-experience connection and Echo lifecycle;
  Attention owns notification intent/delivery and Platform LocationPort owns
  device location access.
- Experience Drops: Social owns the message, audience and lifecycle while
  Places/Media/Identity are referenced by public IDs/projections. Audiences are
  private, family, friends, circle or moderated community; precise presence is
  never inferred or exposed without consent.
- Fork my Trip: Intelligence adapts an inspiration projection; Trip creates the
  new trip through its owner command; Social stores provenance/credit only.
  No booking, schedule or traveler truth is copied as Social truth.
- Social Compass and Social Booking combine Social relevance with Places,
  Booking and Journey public contracts. Booking owns availability,
  reservation, provider status, partner attribution and commission; Social
  supplies inspiration provenance and never calls providers or Booking tables.
- Verified Experience is an evidence-backed attestation referencing owner
  receipts with consent. Reviews owns authored review/moderation truth; Social
  may rank relevance but cannot convert evidence into an undisclosed rating.
- Group Intelligence remains Collaboration + Intelligence + Journey: members
  and votes are Collaboration truth, preference reasoning is Intelligence and
  the plan is committed through Journey/Trip owner commands.
- Safety/privacy requires explicit audience and reuse consent, purpose binding,
  blocking/reporting, child/minor protection, location minimization, retention,
  deletion propagation, export, anti-Sybil/rate limits, moderation and no raw
  private Identity/Memory/Booking payload in graph or model logs.
- M16.5 designs Social as relevant in-context cards, Compass explanations,
  Travel Twin evidence, Echoes, Drops and Fork provenance—never a generic
  Social tab or endless feed. Implementation starts only after the shared
  Corporate Design Freeze and a dedicated Social threat/consent model.
- Acceptance includes graph ownership/consent matrices, RLS/IDOR negatives,
  visibility/block/delete propagation, Twin evals and fairness, provenance,
  Echo geo/privacy gates, Fork idempotency, verified-evidence integrity,
  moderation, offline/reload, accessibility, browserless policy smoke,
  Production provenance and twenty-stream synchronization.

### M18.7 Universal Search / Projection Index

Universal Search is explicitly not a Domain owner. It consumes approved events
and stores source owner, entity ID, version, visibility and freshness. Search
returns owner references; authorization, details and commands resolve through
the owner. Reindex, tombstones, erasure propagation, ranking evals and offline
search projections are mandatory gates.

### M18.8 Luvia Intelligence Product Evolution II

M8.5-M16 already delivered a real Intelligence foundation, not merely a UI
mockup: browserless owner Core, capability/tool policy, model routing,
evidence, Rich Results, Action Ledger, R0-R3 confirmation/recovery and 19
registered actions across six public owner contracts. The restaurant/day/
Booking chat is the first production vertical slice.

Evolution II turns that foundation into the system-wide Luvia assistant after
the missing owners expose safe contracts:

- complete Capability/Tool Registry across Trip, Places, Booking, Journey,
  Memory, Identity, Collaboration, Social, Attention, Wallet, Reviews and
  authorized Admin explanation/draft tools;
- natural-language commands and multi-step plans with explicit owner,
  capability, risk, confirmation, idempotency, receipts and recovery for every
  action;
- context aggregation over public projections, active trip, time, weather,
  group constraints, Travel DNA projection and Social relevance without
  copying foreign Domain Truth;
- proactive but consented day, booking, conflict, document, attention and
  location-aware signals with explainable timing and easy suppression;
- controlled personalization and Intelligence Memory with provenance,
  correction, forgetting, export and privacy boundaries;
- model routing by capability, latency, privacy, cost and reliability plus
  deterministic fallback and unknown-outcome reconciliation;
- Voice and Multimodal input/output, camera/document handoff and native iOS/
  Android command surfaces through Platform Ports;
- cards, maps, media, comparisons, confirmations and owner receipts directly
  in the conversational surface instead of text-only answers;
- offline/degraded planning, resumable tasks and cross-device continuity
  without pretending that an unconfirmed foreign mutation succeeded;
- complete eval/telemetry for intent accuracy, tool selection, plan quality,
  hallucination, unsafe action, confirmation, latency, cost, accessibility,
  personalization and user correction.

Intelligence remains an orchestrator. High-risk Admin, Wallet, identity,
publication, relationship, booking and destructive actions remain owner- and
policy-controlled; no model receives direct foreign table/provider authority.

## Database connection truth

M16 authenticated acceptance proves live read paths for the six action owners.
It does not yet certify every database table, RPC, Realtime subscription,
Edge Function, bucket and provider workflow in the entire application. That
complete proof is a mandatory M21.5 gate and cannot be replaced by HTTP 200,
static source inspection or a single UI sample.

## Core-to-stream rule

Every active or bindingly reserved Core has its own GitHub stream. The
canonical roster is `config/luvia-streams.json`; branches are owner lanes over
one integrated repository tree, not copies of business truth. Main,
Integration and Consumer remain coordination/product streams. Universal Search
does not receive a false Domain-Core stream because it is a projection/index
capability. Social and Collaboration each have one distinct owner stream and
may reference one another only through public contracts.

## Stop rules

Stop on unexpected drift, unclear owner authority, risky data migration,
unexplained gate failure, destructive operation or unproven Production
causation. Fast-forward promotion, exact staging, byte/content provenance and
owner receipts remain mandatory.
