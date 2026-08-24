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
- Core-aligned nineteen-stream ownership topology: one stream for every active
  or bindingly reserved Core, plus Main, Integration and non-owning Consumer.
- Historical Social Experience Graph branch preserved; canonical future
  Membership ownership moves to the Collaboration Core stream.

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
- M18.6: Universal Search / projection index, not a shadow Domain Core.
- M19: Offline/Sync, conflicts, resilience, observability and AI evals.
- M20-M21: native iOS/Android delivery and productization using the same
  Domain contracts.
- M21.5: exhaustive all-functions matrix, autonomous first and targeted user
  acceptance second.
- M22: staged Production/App Store/Play Store rollout.

## M18 Core blueprints

All five new Cores follow the same owner-first delivery sequence: read-only
inventory and ADR; public Contract, Commands, Events and state machine;
browserless policy tests; separately approved persistence/security changes;
Web and native adapters; Experience/Intelligence integration; regression,
Preview, Production and nineteen-stream closeout. Consumers never write private
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

### M18.6 Universal Search / Projection Index

Universal Search is explicitly not a Domain owner. It consumes approved events
and stores source owner, entity ID, version, visibility and freshness. Search
returns owner references; authorization, details and commands resolve through
the owner. Reindex, tombstones, erasure propagation, ranking evals and offline
search projections are mandatory gates.

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
capability. The former Social branch remains historical and must not evolve as
a second Collaboration owner.

## Stop rules

Stop on unexpected drift, unclear owner authority, risky data migration,
unexplained gate failure, destructive operation or unproven Production
causation. Fast-forward promotion, exact staging, byte/content provenance and
owner receipts remain mandatory.
