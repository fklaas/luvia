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
- Social Experience Graph stream boundary.

Consumer and Experience own no Domain Truth. Intelligence may reason, rank,
plan and orchestrate, but executes changes only through public owner commands.

## Next mandatory gate: M16.5 Complete Visual Product Redesign

M16.5 is design-only and jointly approved before broad code implementation.
The current visual design is replaced completely while the proven Domain
architecture remains. Required outputs:

- Corporate Design and brand foundation;
- two to three distinct creative territories;
- complete screen, state and interaction architecture;
- dynamic motion language and native Web/iOS/Android adaptations;
- accessibility, performance and reduced-motion budgets;
- semantic active-Trip accent system for buttons, selection, highlights,
  headings, outlines and motion;
- explicit user-approved Design Freeze before M17.

## Accelerated delivery corridor

- M17: token-first implementation of the approved visual product language in
  vertical, rollback-capable flows.
- M18.1: Collaboration / Membership Core.
- M18.2: Attention / Notification Intent Core.
- M18.3: Travel Wallet / Documents Core.
- M18.4: Reviews / Reputation Core.
- M18.5: Universal Search / projection index, not a shadow Domain Core.
- M19: Offline/Sync, conflicts, resilience, observability and AI evals.
- M20-M21: native iOS/Android delivery and productization using the same
  Domain contracts.
- M21.5: exhaustive all-functions matrix, autonomous first and targeted user
  acceptance second.
- M22: staged Production/App Store/Play Store rollout.

## M18 Core blueprints

All four new Cores follow the same owner-first delivery sequence: read-only
inventory and ADR; public Contract, Commands, Events and state machine;
browserless policy tests; separately approved persistence/security changes;
Web and native adapters; Experience/Intelligence integration; regression,
Preview, Production and eight-stream closeout. Consumers never write private
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

### M18.5 Universal Search / Projection Index

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

## Stop rules

Stop on unexpected drift, unclear owner authority, risky data migration,
unexplained gate failure, destructive operation or unproven Production
causation. Fast-forward promotion, exact staging, byte/content provenance and
owner receipts remain mandatory.
