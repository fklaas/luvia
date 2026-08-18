# Luvia Intelligence Core

## Purpose

Luvia Intelligence is the cross-domain reasoning and orchestration layer of the application.

It should eventually understand context from the whole Luvia platform without becoming the owner of every domain.

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

## It must not own

Canonical Trip, Places, Booking, Media, Identity, Social or Journey truth.

## Domain access

Read path:

`Intelligence -> Domain Contract -> Domain projection`

Action path:

`Intelligence -> Domain Contract / Command -> Domain Core`

Never:

`Intelligence -> private domain Store / direct foreign DB mutation`

## Planned target structure

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

## Planned public boundary

Planned runtime contract:

`LuviaIntelligenceContractV1`

Planned platform adapter:

`core/platform/intelligence-contract-adapter.js`

This contract does not exist yet and must not be faked during foundation work.

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

1. stream and boundary foundation
2. pure Intelligence infrastructure
3. context and orchestration
4. Intelligence memory
5. recommendations
6. proactive intelligence
7. product evolution

The migration is incremental and contract-first.
