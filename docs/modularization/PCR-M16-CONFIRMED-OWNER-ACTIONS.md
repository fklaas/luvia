# PCR M16 - Confirmed Owner Actions and Full Capability Expansion

Date: 2026-08-24

Status: INTELLIGENCE OWNER FEATURE COMPLETE / RUNTIME INTEGRATION PENDING

Baseline marker: `efd64fed5ed47624b399635c9ae1942c5e5ac86f`

Baseline App / Core: `13.82.47 / 4.82.47`

## Problem

M15 proves six owner-backed actions and rich Places/Journey results. It does
not yet provide an app-wide capability inventory, risk classes, a durable
execution envelope, explicit confirmation protocol, idempotency ledger or
safe recovery policy for ambiguous external outcomes. Expanding individual
chat handlers without these controls would create inconsistent authorization,
duplicate commands and untraceable retries.

## Ownership lock

- Intelligence owns action definitions, risk and confirmation policy,
  capability discovery, orchestration metadata, the Action Ledger and
  normalized receipts.
- Trip, Places, Booking, Journey, Memory and Identity retain their Domain
  Truth and execute only their own public commands.
- Experience owns confirmation, receipt, error and recovery presentation
  semantics, never command authorization or Domain Truth.
- Platform owns runtime load order, public contract availability and native
  adapter mapping.
- Booking remains the owner of provider effects, reservation state,
  idempotency interpretation, reconciliation, compensation and recovery.

## Additive M16 surface

M16 extends `intelligence.actions.v1` within major version 1 and introduces
the browserless supplemental `intelligence.action-ledger.v1`.

The initial capability expansion covers nineteen actions across:

- Trip reads, active-trip selection and confirmed detail updates;
- Places recommendation, favourite/unfavourite and plan/unplan commands;
- Booking reads, owner-flow entry and confirmed create/modify/cancel commands;
- Journey Day Graph reads and editor entry;
- Memory library reads and confirmed Story save;
- Identity preference reads and confirmed preference updates.

## Risk and confirmation policy

- R0: read-only; auto-run only when registered with `NEVER` confirmation.
- R1: local UI or low-impact reversible owner command; direct user gesture.
- R2: meaningful reversible Domain mutation; explicit preview and
  confirmation.
- R3: external/provider effect or cancellation; explicit confirmation,
  idempotency key, owner receipt and recovery path.
- R4: financial, destructive or sensitive authority; not implemented in this
  M16 block.

No confirmation is inferred from a natural-language prompt alone.

## Action Ledger invariants

- stores only Intelligence orchestration metadata and digests, never raw
  foreign-domain payloads or copied Domain Truth;
- deduplicates by versioned idempotency key;
- records proposed, confirmation, running, success, failure, unknown outcome,
  cancellation and compensation transitions;
- blocks blind retry when an external outcome is unknown;
- requires owner reconciliation before a potentially duplicated external
  effect can run again;
- remains browserless and portable to Web, SwiftUI and Jetpack Compose hosts.

## Backward compatibility

- all six M15 action IDs and result kinds remain supported;
- existing one-gesture Favourite, Booking owner-flow and Journey editor
  entries remain operational;
- unregistered intents continue through the bounded text fallback;
- public owner contracts remain version 1 and receive only additive usage;
- no Web global is promoted to a platform-neutral contract.

## Planned files and streams

Intelligence / `feature/intelligence-core`:

- `core/intelligence/intelligence-action-contract-core.js`
- `core/intelligence/intelligence-action-ledger-core.js`
- `core/ai/ai-action-runtime.js`
- `core/ai/ai-dashboard-service.js`
- M16 focused tests and contract metadata

Platform / `feature/platform-core` after owner foundation:

- runtime asset load order and caches;
- core/contract/ownership registries;
- native-readiness and cross-core guardrails.

Booking / `feature/booking-core` only if measured adoption requires an
additive owner adapter change. Existing Booking idempotency and recovery must
not be reimplemented in Intelligence.

Experience / `feature/experience-core` only for shared confirmation, ledger,
receipt and recovery presentation semantics. M16 does not start the M16.5
Corporate Design rebuild.

## Database, Functions, secrets and deployment

- Database/schema/RPC/RLS/bucket migration: not planned.
- Supabase Edge Function change: not planned.
- Secrets/provider configuration: not planned.
- Manual Cloudflare configuration: not planned.

Any discovered need changes the scope and triggers a stop/review before
mutation.

## Test and release gates

- browserless action contract and Action Ledger policy tests;
- nineteen-action registry, risk, permission and confirmation matrix;
- owner-contract runtime tests with deterministic stubs and no real external
  side effects;
- idempotency, duplicate-click, timeout, unknown-outcome, cancellation,
  recovery and compensation tests;
- visible confirmation, receipt, retry-block and accessibility tests;
- Native First, ownership, DB boundary, full Safe Regression and NFR-0;
- Integration Preview exact assets, authenticated desktop/mobile flows,
  reloads and console;
- fast-forward Main, Production provenance and eight-stream synchronization.

## Intelligence owner evidence

Completed on `feature/intelligence-core` before Platform runtime integration:

- `intelligence.actions.v1` expanded from 6 to 19 registered actions across
  6 public owner contracts;
- browserless `intelligence.action-ledger.v1` added with digest-only storage,
  legal transition enforcement, idempotency deduplication and unknown-outcome
  retry blocking;
- Web action runtime expanded with capability/connection snapshots, explicit
  confirmation preparation, cancellation, receipts and bounded recovery;
- chat presents Trip, Booking, Memory and Identity rich results in addition to
  Places and Journey, and uses explicit confirm/cancel controls for R2/R3;
- direct private owner-store, Supabase, RPC and persistence access in the
  Intelligence action surfaces remains zero;
- M15 focused compatibility suite: PASS;
- M16.1-M16.4 focused tests: PASS;
- NFR-0 Foundation: `3 / 3 PASS`;
- cross-core DB ownership guardrail: PASS;
- Experience/Intelligence boundary guardrail: PASS;
- Safe Regression: `84 / 84 PASS`.

These results prove the owner implementation only. Runtime asset loading,
shared Experience styling, authenticated Preview/Production behavior and
eight-stream synchronization are not yet claimed at this marker.

## Rollback

Runtime rollback returns to the synchronized M15 marker
`efd64fed5ed47624b399635c9ae1942c5e5ac86f`. Because the scope is additive and
contains no planned database, function, secret or provider mutation, no data
compensation is expected. If any owner command has already produced an
external effect, rollback follows that owner's receipt and recovery contract;
Git rollback never pretends to undo a real booking or provider action.
