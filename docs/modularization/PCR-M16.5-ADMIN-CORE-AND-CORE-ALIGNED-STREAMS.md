# PCR M16.5 — Mandatory Admin Core and Core-aligned GitHub Streams

Supersession note: the nineteen-stream classification below is retained as the
auditable first architecture slice. PCR M16.5B proves a distinct Social /
Experience Graph owner and corrects the current topology to twenty active
streams before the normative v4.4 Masterfahrplan and Design Freeze.

Date: 2026-08-24

Owner for this architecture slice: `feature/platform-core`

Runtime impact: none

Database / RLS / RPC / bucket impact: none in this slice

Edge Functions / secrets / provider configuration: unchanged

## Decision

Luvia receives a mandatory Admin / Governance Core. In addition, every active
or bindingly reserved Core receives exactly one GitHub owner stream. The stream
topology expands from the historical eight-stream foundation to nineteen
registry-active streams.

This architecture slice reserves ownership and prepares independent work. It
does not claim that the five future Core runtimes, schemas or contracts are
already implemented.

## Verified input state

Before mutation, all eight previously active worktrees were measured at
`7a3c9349bd725ca0010b901b1006b4926b2be3e4`:

- Local = Tracking = live Remote;
- divergence `0/0`;
- clean working trees;
- App/Core `13.82.48 / 4.82.48`;
- Safe Regression `90/90` and NFR-0 `3/3` from the accepted M16 release.

The live authenticated UI exposed Today, Control Center and the Profile /
Security shell, but no global Admin roles, grants, policies, approvals,
break-glass or audit surface. The existing Control Center is a Consumer-owned
travel and attention projection and is not renamed into an Admin console.

## Why a dedicated Admin Core is required

Administrative policy has its own long-lived truth, invariants, lifecycle,
security model and audit obligations. It cannot safely be represented as:

- a profile field or client-side `isAdmin` flag;
- a trip/collaboration membership role;
- a hidden route or navigation visibility check;
- a generic Supabase `service_role` client;
- a Platform feature flag;
- an Intelligence capability that can grant itself authority.

Admin therefore satisfies the Core test: independent truth, explicit commands,
state transitions, versioned public boundaries, persistence ownership,
negative authorization tests and owner receipts.

## Admin ownership

Admin owns:

- administrative principals by reference;
- Admin roles and role versions;
- capability definitions and resource scopes;
- role assignments, direct grants and delegations;
- policy rules and policy decisions;
- approval requests and separation-of-duty evidence;
- time-boxed break-glass sessions;
- immutable administrative audit entries and action receipts.

Admin does not own:

- authentication sessions or provider identities — Platform/Auth;
- global person/profile truth — Identity;
- trip/group membership — Trip or Collaboration;
- Trip, Places, Booking, Media, Memory, Journey, Wallet or Reviews truth;
- feature-flag registry mechanics — Platform;
- presentation truth — Experience;
- autonomous authority — Intelligence.

An Admin command may authorize or request an operation in another Core. The
actual business mutation still executes through that owner's public command
and invariants.

## Planned public surfaces

`admin.governance.v1`:

- redacted principal, role, capability, assignment, scope, policy and approval
  projections;
- server-side `can(actor, capability, resource)` decisions with reason codes;
- Commands for role create/update/retire, grant/revoke, delegation, approval,
  suspension/reactivation, session revocation and break-glass lifecycle;
- every mutation carries actor, purpose, scope, reason, idempotency key,
  expected version, correlation and causation.

`admin.audit.v1`:

- immutable append-only administrative action receipts;
- actor, effective authority, request/approval chain, target reference,
  decision, policy version, timestamp and correlation;
- redaction-safe reads, retention and tamper evidence;
- no raw passwords, tokens, private document contents or foreign Domain Truth.

## Canonical models and state machines

- `AdminPrincipalRef`
- `AdminRole` / `AdminRoleVersion`
- `Capability`
- `ResourceScope`
- `PolicyRule` / `PolicyDecision`
- `RoleAssignment`
- `DirectGrant`
- `Delegation`
- `ApprovalRequest`
- `BreakGlassSession`
- `AuditEntry`
- `AdminActionReceipt`

Role assignments and grants transition through requested, approved, active,
expired, revoked and rejected states. Break-glass transitions through requested,
approved, active, expired/closed and reviewed. Unknown or stale policy state
fails closed.

## Security invariants

1. Default deny and least privilege.
2. Authorization is evaluated server-side for every read and mutation.
3. No self-grant, self-approval or self-escalation.
4. The last effective Superadmin cannot be removed, expired or scoped away
   without a separately approved, recoverable successor.
5. Highest-risk changes require step-up authentication, explicit purpose,
   four-eyes approval, short validity and immutable audit evidence.
6. Break-glass is exceptional, narrowly scoped, time-boxed, alerted and
   reviewed; it is not a permanent bypass.
7. Revocation invalidates effective authority and applicable sessions quickly;
   cached UI state grants no continuing permission.
8. Rate limits, enumeration resistance and IDOR/RLS negative cases are release
   gates.
9. Offline administrative mutation is forbidden. A redacted read cache is
   allowed only when stale state is obvious and all commands fail closed.
10. Intelligence cannot grant/revoke Superadmin, approve its own request, open
    break-glass, suspend/delete an account or execute the highest-risk class.

## Administrative Experience in M16.5

M16.5 designs, but does not yet broadly implement, a dedicated administrative
product surface:

- operational overview and security posture;
- users/service principals with safe search and scoped details;
- role catalogue, permission matrix and effective-access explanation;
- assignment, delegation and expiry flows;
- approvals inbox with before/after policy diff;
- audit explorer with actor/target/correlation filters;
- incident, session-revocation and break-glass console;
- health projections from Domain owners without copying their truth;
- explicit loading, empty, stale, denied, step-up, pending approval, partial
  failure, unknown outcome, recovery and completed-receipt states.

The Admin Experience uses the same Corporate Design and accessibility system as
the consumer app, but a deliberately higher information-density composition.
Route visibility is convenience only; the server remains authoritative.

## Native First

Admin consumes AuthSession, SecureStorage, Device, Permission, Network,
Lifecycle, Notification and DeepLink Ports. Web, SwiftUI and Compose bind the
same policy and command contracts. Device biometrics may assist step-up behind
a port but never replace server policy. Sensitive data is excluded from local
logs, analytics and screenshots where platform capabilities permit.

## Core-aligned stream roster

Coordination/product streams:

- `main`
- `integration`
- `feature/consumer-experience`

Core streams:

- `feature/platform-core`
- `feature/trip-core`
- `feature/places-core`
- `feature/booking-core`
- `feature/media-core`
- `feature/memory-core`
- `feature/identity-core`
- `feature/events-core`
- `feature/journey-core`
- `feature/experience-core`
- `feature/intelligence-core`
- `feature/collaboration-core`
- `feature/attention-core`
- `feature/travel-wallet-core`
- `feature/reviews-core`
- `feature/admin-core`

The former `feature/social-experience-graph` branch remains preserved as
history. It is removed from the active registry rather than deleted, and must
not evolve as a second Membership owner.

## Stream semantics

One stream is one owner lane and one worktree mapping. It is not an independent
copy of the product or a second Domain state. After each release, every active
stream fast-forwards to the same integrated marker.

Reserved streams may carry architecture and Contract work before runtime
activation. They must not introduce speculative DB objects or client-only
authorization. Universal Search remains a projection/index capability and does
not receive a false Domain-Core stream.

## Delivery sequence

1. Register nineteen streams and all active/reserved Core owner mappings.
2. Update architecture, ownership, CODEOWNERS and topology guardrails.
3. Run focused registry tests, Safe Regression and NFR-0.
4. Promote architecture-only changes Feature -> Integration -> Main FF-only.
5. Create missing GitHub branches and local worktrees at the approved marker.
6. Synchronize every registry stream and verify Local = Tracking = Live,
   divergence `0/0`, clean.
7. Preserve the historical Social branch without destructive deletion.
8. Continue M16.5 visual design inventory and joint Design Freeze.

## Architecture-slice closeout evidence

The architecture implementation chain is
`6880e881fd433d28e75396502adee12af528fb8b`,
`3679a06fbaf45b132dac2238ba198d658b5ceb02` and
`f44036bf7e62e2557585142845f53ffa553ce4d7`.

At `f44036bf7e62e2557585142845f53ffa553ce4d7` all nineteen registry-active
branches and their mapped worktrees existed locally and on GitHub, resolved
Local = Tracking = live Remote, had divergence `0/0` and clean working trees.
The historical Social branch remained preserved and registry-inactive.

Focused topology and visual-inventory guards passed. Controlled Safe
Regression passed `91/91` on Platform, Integration and Main; NFR-0 remained
`3/3`. The cross-Core DB guard remained unchanged at 361 tracked JavaScript/
TypeScript files, static 310, mapped `30/30`, unmapped `39/39` and dynamic
`27/27`.

One Integration candidate was correctly rejected before promotion: the first
manifest compared raw Working-Copy line endings and therefore treated LF and
CRLF checkouts of identical Git text blobs as different. The generator and
comparison were corrected to canonical LF text provenance while retaining raw
byte equality for binary assets. Only the corrected candidate advanced.

This slice changed no runtime asset, App/Core version, database, schema, RPC,
RLS, bucket, Edge Function, secret or Cloudflare configuration. No Preview or
Production deployment was triggered or claimed. The Admin runtime and Admin
Experience remain future implementation work; only their mandatory ownership,
security architecture and design surface are reserved here.

## Later Admin implementation sequence

1. Read-only auth/RLS/admin-debt inventory and threat model.
2. ADR for authority model, risk levels and recovery ownership.
3. Browserless policy/state-machine Core and negative tests.
4. Additive public contracts and server decision boundary.
5. Separately approved schema/RLS/RPC/Function migration with rollback and
   last-Superadmin bootstrap procedure.
6. Administrative Experience behind server capability checks.
7. Step-up, dual control, audit, break-glass and session-revocation tests.
8. Intelligence read/explain/draft integration without autonomous authority.
9. Preview, Production, browser/reload/security acceptance and full stream
   synchronization.

## Test plan

This architecture slice:

- JSON parse and registry invariants;
- unique IDs, branches and worktrees;
- Core owner stream exists exactly once;
- mandatory Admin reservation and CODEOWNERS coverage;
- historical eight-stream evidence strings remain unchanged;
- controlled Safe Regression and NFR-0.

Future Admin Core:

- permission matrix and deny-by-default coverage;
- privilege escalation, IDOR and RLS negative tests;
- self-grant/self-approval denial;
- concurrent grant/revoke and expected-version conflict;
- last-Superadmin and successor recovery;
- step-up and four-eyes approval races;
- audit append/tamper/retention/redaction;
- break-glass scope/expiry/alert/review;
- session revocation and stale/offline deny;
- accessibility, responsive layouts and native adapters;
- Preview/Production provenance and rollback drill.

## Rollback

This slice is architecture-only. Before external branch creation, rollback is a
normal reviewed revert of the topology commit. After branches exist, rollback
does not delete history: restore the prior active registry through a reviewed
commit and leave the extra branches/worktrees inert until an explicit cleanup
decision. No database compensation is required because this slice changes no
schema, data, Function, secret or runtime asset.

## Stop conditions

Stop on unexpected branch drift, dirty worktree, duplicate owner, unclear
Identity/Collaboration/Admin authority, guardrail failure, destructive branch
cleanup, risky DB/RLS proposal, unproven Production causation or any design
decision represented as approved without the user's explicit M16.5 Design
Freeze.
