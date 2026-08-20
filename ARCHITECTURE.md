# Luvia Architecture

## Architectural objective

Luvia is evolving from a historically grown application into a modular platform with explicit domain ownership, stable contracts and parallel development streams.

The target is not merely file separation. The target is independent evolvability without duplicate truth.

## Eight-stream topology

The machine-readable topology is `config/luvia-streams.json`.

Active streams:

- `main`
- `integration`
- `feature/platform-core`
- `feature/booking-core`
- `feature/consumer-experience`
- `feature/social-experience-graph`
- `feature/experience-core`
- `feature/intelligence-core`

The authoritative stream role and worktree mapping lives in the registry. New topology-aware scripts should consume the registry instead of hard-coding a six-stream list.

## Domain model

Canonical domain truth remains with domain cores.

Current locked roots include Trip, Places and Booking. Experience and Intelligence are new foundation cores with strict non-domain-truth boundaries.

File-level ownership remains governed by `docs/modularization/FILE-OWNERSHIP.csv` where a dedicated core root has not yet been locked.

## Contracts

Cross-domain consumers should rely on public contract adapters.

Existing contract foundations include Trip, Places, Media and Identity adapters under `core/platform/`.

A future Intelligence public contract is planned as `LuviaIntelligenceContractV1` with a platform adapter at `core/platform/intelligence-contract-adapter.js`.

The planned contract is not implemented by this architecture-foundation step.

## Experience architecture

Experience Core centralizes:

- design tokens
- themes
- layout primitives
- reusable UI components
- interaction patterns
- states
- motion
- accessibility
- icons
- experience diagnostics

It is not a domain truth owner.

A later dedicated roadmap block will establish the Design System Foundation followed by Global Experience Recomposition.

## Intelligence architecture

Intelligence Core will unify the future AI and reasoning architecture.

It may aggregate context from Trip, Places, Booking, Media, Identity and Journey through official contracts.

It may own Intelligence-specific memory, evaluations, model orchestration, tools, policies, recommendations and proactive signals.

It must not duplicate domain truth.

Existing `core/ai/`, `intelligence/`, recommendation services and AI-related bridges are migration candidates, not automatically Intelligence-owned files.

They must first be classified as:

- INTELLIGENCE OWNER
- INTELLIGENCE INFRASTRUCTURE
- DOMAIN ADAPTER
- DOMAIN OWNER
- LEGACY BRIDGE
- OBSOLETE

No big-bang directory move is allowed.

## Places evolution

The long-term Places direction is a declarative category system.

New categories should increasingly be defined through a Category Registry and shared Discovery, Card, Favorite, Planning and Detail primitives instead of copy/paste module infrastructure.

Potential future categories include beaches, cafes, nightlife, playgrounds, wellness, markets, museums, events, family activities, sport and water activities.

The existing seven Discovery modules are future consolidation candidates after their domain boundaries are stable.

## Journey / Timeline

`core/places/timeline-core.js` is explicitly reserved.

Its future architecture is heterogeneous Journey / Timeline aggregation, not ordinary Places-consumer ownership.

It receives its own later architecture and reachability audit.

## Release model

Feature stream -> Integration -> regression / preview -> Main -> production verification -> stream synchronization.

Static architecture-only changes do not require a runtime deploy unless they alter served runtime assets or deployment configuration.
<!-- NFR-0 NATIVE FIRST READY BEGIN -->

## Native First Ready Architecture

The binding Native First architecture contract is:

`docs/architecture/NATIVE-FIRST-READY-ARCHITECTURE.md`

Existing Web runtime debt is frozen in:

`config/luvia-native-readiness-debt.json`

New Domain Browser coupling is forbidden unless the Architecture baseline is explicitly reviewed and changed.

`window.LuviaTripContractV1` is a temporary Web Runtime Compatibility Binding and is not the final native contract transport.

Platform boundaries are defined in:

`config/luvia-platform-ports.json`

M5.3 remains blocked until NFR-0 closes.

<!-- NFR-0 NATIVE FIRST READY END -->
