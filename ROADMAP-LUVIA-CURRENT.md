# Luvia Current Roadmap

Date: 2026-08-24

Source of truth: Git/runtime evidence first; the complete normative roadmap is
the latest `Luvia_Masterfahrplan_Native_First_Ready_*_VOLLSTAENDIG.docx`.

## Current verified product baseline

- App/Core: 13.82.48 / 4.82.48.
- Runtime: `0d7468596dbdb42803738f427d4355bf31281c65`.
- M0-M16: COMPLETE / CLOSED; M16 Production verified.
- Safe Regression: 90/90 PASS; NFR-0: 3/3 PASS.
- M16 action platform: 19 actions across Trip, Places, Booking, Journey,
  Memory and Identity with R0-R3 policy and digest-only Action Ledger.
- Integration and Production: 17/17 critical assets exact; 10/10
  private/retired SPA fallbacks; authenticated 25/25 F5 each; console 0.
- Database/schema/RPC/RLS/bucket migration in M16: none.
- Supabase Edge Function, secret and manual Cloudflare configuration change in
  M16: none.
- M16.5 architecture marker: `41c02f6cf6a36d85eecba3f02a7c7a7a38e4444f`;
  Safe Regression 92/92 on Platform, Integration and Main; NFR-0 3/3;
  20/20 streams synchronized. Runtime App/Core remains unchanged.

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

## Next mandatory gate: M16.5 Complete Visual Product Redesign

M16.5 is design-only and jointly approved before broad code implementation.
The current visual design is replaced completely while the proven Domain
architecture remains. Required outputs:

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
