# Luvia Intelligence Core

## Purpose

Luvia Intelligence is the cross-domain reasoning and orchestration layer of the application.

It understands context from the whole Luvia platform without becoming the owner of every domain.

## Governing rule

**Intelligence may understand every domain, but it owns no domain truth except Intelligence-specific state.**

## It may own

- capability registry
- context aggregation
- context projections
- model routing
- provider integration
- tool registry
- tool policy
- Intelligence policy
- output validation
- Intelligence-specific memory
- planning intelligence
- recommendation ranking and explanation
- proactive signal evaluation
- action orchestration
- evaluation
- telemetry
- Intelligence diagnostics
- action capability and owner-connection diagnostics
- confirmation, idempotency, receipt and recovery orchestration metadata

## It must not own

Canonical Trip, Places, Booking, Media, Identity, Social or Journey truth.

## Domain access

Read path:

`Intelligence -> Domain Contract -> Domain projection`

Action path:

`Intelligence -> Domain Contract / Command -> Domain Core`

Never:

`Intelligence -> private domain Store / direct foreign DB mutation`

## Current physical foundation

- `intelligence-domain-contract-core.js` owns the browserless `intelligence.v1` capability, domain/tool metadata, model tiers, policy, validation, context-envelope, Intelligence-memory signal, proposal and evidence semantics.
- `intelligence-action-contract-core.js` owns the browserless `intelligence.actions.v1` registry, R0-R3 policy, rich-result normalization and execution-envelope semantics.
- `intelligence-action-ledger-core.js` owns the browserless digest-only `intelligence.action-ledger.v1` state machine. It stores no raw action payload and no foreign Domain Truth.
- `core/platform/intelligence-contract-adapter.js` is the Web compatibility binding.
- transitional runtime services remain under `core/ai/`, `core/planning/`, `core/recommendations/` and selected adapters until each file is classified and migrated.

The owner core has no runtime, UI, provider SDK, database, network, storage or device dependency. Runtime-specific implementations inject those capabilities outside the physical core.

## Target structure

The target structure will grow with real migration work:

- `capabilities/`
- `context/`
- `models/`
- `providers/`
- `tools/`
- `policy/`
- `validation/`
- `memory/`
- `planning/`
- `recommendations/`
- `proactive/`
- `actions/`
- `adapters/`
- `telemetry/`
- `diagnostics/`

Do not generate empty implementation files just to populate this tree.

## Public boundary

Runtime contract:

`LuviaIntelligenceContractV1`

Platform adapter:

`core/platform/intelligence-contract-adapter.js`

## Human ↔ AI language compiler

`human-ai-language-compiler-core.js` is the browserless B0.04 interpretation
boundary. It may normalize language, preserve entities and propose semantic
action IDs. It never executes an Owner command and never treats natural
language as mutation confirmation. Web consumers call it through
`intelligence.v1.reads.compileHumanActions` and must still pass deterministic
input, authority and lifecycle gates before any action can proceed.

## Human ↔ AI safety and authorization policy

`human-ai-safety-policy-core.js` is the browserless B0.05 authority boundary.
It deterministically classifies all 327 semantic actions, applies public,
self, Trip-member and Trip-admin scopes, and checks re-authentication,
purpose-bound consent, connectivity, provider readiness, direct user gestures
and explicit confirmation. It only returns the next safety decision; it never
executes an Owner command. The public additive reads are
`intelligence.v1.reads.evaluateHumanActionAuthority` and
`intelligence.v1.reads.getHumanActionSafetyCoverage`. The AI cannot obtain a
permission that the acting user does not already have.

## Human ↔ AI action lifecycle

`human-ai-action-lifecycle-core.js` is the browserless B0.06 lifecycle state
machine for all 327 semantic actions. It distinguishes reads, opens, drafts,
permission requests, external handoffs, durable Owner mutations and the three
Intelligence control transitions. All 124 durable/control state changes require
a bounded preview, a separate visible confirmation and an idempotency key.
The 121 Owner mutations additionally require an Owner-attributed receipt and
readback or reconciliation; the three chat-control transitions use scoped
control receipts and never impersonate a foreign Owner. Unknown external
outcomes cannot be blindly retried. Twenty durable mutations expose a truthful
Owner compensation path with a new preview and confirmation. Raw action input
is never stored in the lifecycle instance.

## Human ↔ AI capability discovery

`human-ai-capability-discovery-core.js` is the browserless B0.07 availability
boundary. It combines the semantic registry, current actor authority, required
inputs, network/provider state, public Owner binding, AI-route readiness and
the action lifecycle. Only actions that can safely proceed are marked
offerable. Every blocked action receives one concrete reason and next step,
such as a short clarification, sign-in, consent, restored connectivity,
provider retry or a truthful manual Owner flow. The generated matrix reports
59 currently routed semantic rows and 288 human-operable manual Owner fallbacks;
these are control-plane facts, not public E2E acceptance claims.

## Human ↔ AI bright consumer projection

`human-ai-consumer-projection-core.js` is the browserless B0.08 presentation
boundary. It maps all 327 semantic actions and every honest capability state
to short consumer views for direct results, clarification, permission,
handoff, preview, confirmation, receipt, recovery and Undo. A resolved
single intent is not repeated as an additional “recognized wish” card.
Dates use `TT.MM.JJJJ`; normal copy removes internal action IDs and
Owner/lifecycle/ledger vocabulary while machine-readable attributes remain
available for evals. The real AI dashboard consumes the same projector for
multi-intent summaries, result headers, previews, read failures, receipts and
sequence transitions. The projector never executes an Owner command.

## Human ↔ AI parity and failure matrix

`human-ai-parity-failure-matrix-core.js` is the browserless B0.09 release
evidence boundary. It joins all 327 canonical actions with the language,
safety, lifecycle, capability and consumer contracts. Every row contains the
same twelve decisions: Owner contract, compiler, permission, confirmation,
idempotency, receipt, recovery, Undo, multilingual, typo, multi-intent and
denial. The generated matrix currently contains 2,711 explicit failure evals
and distinguishes public E2E proof from a local AI route, a truthful manual
Owner path, a blocked action and a non-product action. Deterministic source
hashes plus an exact generated-file comparison form the CI drift gate: a new
or changed UI action cannot silently bypass the matrix. The core only projects
release evidence; it never executes an Owner command.

The v1 boundary is additive and active from M8.5. It exposes sanitized reads, reasoning execution and proposal creation. It deliberately exposes no foreign-domain execution command.

M16 adds an action-orchestration boundary without changing Domain ownership:

`User gesture -> Intelligence action policy/confirmation -> Owner public command -> receipt/recovery metadata`

The registered M16 surface contains 19 actions across Trip, Places, Booking, Journey, Memory and Identity. R0 reads may auto-run. R1 requires the selected control. R2 and R3 require an explicit confirmation card. An unclear R3 external outcome is never blindly retried and must be reconciled by the Booking owner.

Runtime diagnostics distinguish owner-contract registration, operation availability and ledger state. Registration is not itself proof that every authenticated database/provider operation succeeds live; those paths remain part of integration and production acceptance.

## Migration strategy

Current candidates include `core/ai/`, `intelligence/`, parts of `core/recommendations/` and AI-related bridges.

No candidate moves based only on its path or filename.

Each candidate is first classified as:

- INTELLIGENCE OWNER
- INTELLIGENCE INFRASTRUCTURE
- DOMAIN ADAPTER
- DOMAIN OWNER
- LEGACY BRIDGE
- OBSOLETE

Migration phases:

1. stream and boundary foundation — complete
2. pure Intelligence infrastructure — in progress; shared rules and evidence state are adopted
3. context and orchestration
4. Intelligence memory
5. recommendations
6. proactive intelligence
7. product evolution

The migration is incremental and contract-first.
