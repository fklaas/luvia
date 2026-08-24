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
