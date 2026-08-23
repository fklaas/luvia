# Intelligence Core Agent Instructions

Scope: `core/intelligence/**`

## Governing rule

**Intelligence may understand every domain, but it owns no domain truth except Intelligence-specific state.**

## Allowed ownership

- AI / Intelligence orchestration
- model and provider routing
- capability registry
- tool registry and tool policy
- context aggregation
- Intelligence-specific memory
- planning / reasoning
- recommendation ranking
- proactive signal evaluation
- action orchestration
- Intelligence evaluation and telemetry

## Forbidden

- direct `LuviaTripStore` access as a normal consumer
- direct private domain-store access
- direct foreign domain database mutations
- duplicated Booking / Places / Trip / Media / Identity truth
- migration solely because a file currently lives under `core/ai/` or `intelligence/`

## Read dependencies

Consume domain information through supported contracts.

## Action dependencies

Use:

`Intelligence -> Domain Contract / Command -> Domain Core`

Do not bypass domain lifecycle, validation, idempotency, recovery or audit behavior.

## Migration

Before moving an existing service, classify it:

- INTELLIGENCE OWNER
- INTELLIGENCE INFRASTRUCTURE
- DOMAIN ADAPTER
- DOMAIN OWNER
- LEGACY BRIDGE
- OBSOLETE

Preserve compatibility until all active consumers have migrated.

## Public contract

`LuviaIntelligenceContractV1` is active from M8.5 through `core/platform/intelligence-contract-adapter.js`.

The contract may expose Intelligence reads, reasoning and draft-proposal creation. Do not add foreign-domain execution, raw private context, prompts, credentials or provider internals to it.

Keep `intelligence-domain-contract-core.js` browserless and provider-neutral. Web, iOS and Android bindings belong in adapters outside the owner core.
