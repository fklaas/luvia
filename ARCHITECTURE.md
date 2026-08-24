# Luvia Architecture

## Architectural objective

Luvia is evolving from a historically grown application into a modular platform with explicit domain ownership, stable contracts and parallel development streams.

The target is not merely file separation. The target is independent evolvability without duplicate truth.

## Core-aligned twenty-stream topology

The machine-readable topology is `config/luvia-streams.json`.

The active topology contains `main`, `integration`, the non-owning Consumer
product stream and one explicit owner stream for every active or bindingly
reserved Core boundary. Trip, Places, Booking, Media, Memory, Identity,
Events, Journey, Experience, Intelligence, Collaboration, Social, Attention,
Travel Wallet, Reviews, Admin and Platform therefore have distinct branches and
worktree mappings.

Existing peer branches such as `feature/experience-core` and
`feature/intelligence-core` remain active; the new domain-aligned branches are
listed completely in `docs/architecture/STREAM-TOPOLOGY.md`.

`feature/social-experience-graph` is an active reserved owner lane distinct
from `feature/collaboration-core`. Collaboration owns trip/group membership,
invitations and roles. Social owns the future consent-scoped Experience Graph,
relationship/visibility lifecycle, Travel Twin relationship state, Echoes,
Drops, Trip Fork provenance and inspiration signals. Neither may become a
second owner for the other.

The authoritative stream role and worktree mapping lives in the registry.
Topology-aware scripts must consume the registry instead of hard-coding a
stream count or branch list.

## Domain model

Canonical domain truth remains with domain cores.

Current locked roots include Platform Runtime, Trip, Places, Booking, Media,
Memory, Identity, Events, Journey, Experience and Intelligence. Collaboration,
Social, Attention, Travel Wallet, Reviews and Admin are bindingly reserved boundaries;
their registry entries and streams do not falsely claim implemented runtime or
persistence.

File-level ownership remains governed by `docs/modularization/FILE-OWNERSHIP.csv` where a dedicated core root has not yet been locked.

## Contracts

Cross-domain consumers should rely on public contract adapters.

Existing contract foundations include Trip, Places, Booking, Media, Memory,
Identity, Events, Journey, Experience and Intelligence. Reserved future
contracts are clearly marked as planned and must not be consumed before their
browserless owner core and authorization rules exist.

Contract adapters may remain under `core/platform/`; this does not transfer
Domain Truth or implementation ownership back to Platform.

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

M10.5 establishes browserless `experience.v1` semantics in `core/experience/experience-contract-core.js` and the explicit Web projection in `app/adapters/experience-web-adapter.js`. The legacy Design System global is a compatibility facade, not a second semantic truth. Global Experience Recomposition proceeds incrementally against this contract.

## Intelligence architecture

Intelligence Core already provides the browserless owner foundation,
capability/tool and action policy, model routing, evidence, Action Ledger,
owner-backed Rich Results and confirmed owner-action runtime established from
M8.5 through M16. This is a production foundation and first vertical product
slice, not the completed system-wide Intelligence product.

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

The later Intelligence Product Evolution II expands public tool coverage to
every implemented Core, contextual planning, proactive signals, controlled
personalization, Voice/Multimodal, native presentation and complete eval/
telemetry. It still executes foreign changes only through owner commands.

## Places evolution

The long-term Places direction is a declarative category system.

New categories should increasingly be defined through a Category Registry and shared Discovery, Card, Favorite, Planning and Detail primitives instead of copy/paste module infrastructure.

Potential future categories include beaches, cafes, nightlife, playgrounds, wellness, markets, museums, events, family activities, sport and water activities.

The existing seven Discovery modules are future consolidation candidates after their domain boundaries are stable.

## Memory / Narrative

`core/memory/` owns durable Memory and Narrative truth: albums, cards,
stories, chapters, contributions, curation decisions and narrative lifecycle.

Its public boundary is `memory.v1` through
`core/platform/memory-contract-adapter.js`. Media assets remain owned by Media
Core and cross the boundary as IDs and sanitized `media.v1` projections.

The current database and realtime providers under `core/media/memory-*.js` are
explicit legacy compatibility providers behind `memory.v1`; they are not a
second Memory state. Memory Core owns no Trip, Places, Journey schedule,
Identity, Social or Intelligence truth.

## Journey / Timeline

`core/journey/` owns the browserless Journey Day Graph, temporal ordering, conflict policy and owner provenance.

Its public boundary is `journey.v1` through `core/platform/journey-contract-adapter.js`.

Journey is a heterogeneous cross-domain aggregator. It may compose read-only Trip, Places, Booking, Media and other owner projections, but it never copies or mutates their canonical truth. `core/places/timeline-core.js` remains an explicit Web/DB compatibility provider behind the public contract until its persistence and presentation responsibilities are decomposed in later measured slices.

## Admin / Governance

Admin is a mandatory reserved Core boundary with owner stream
`feature/admin-core`. It will own platform-administrative roles, capability
grants, scopes, policy decisions, approvals, time-boxed break-glass sessions
and immutable administrative audit receipts.

Identity continues to own the person and authentication context; Collaboration
continues to own trip/group membership. Admin may reference those owners by ID
and contract but must not copy their truth. An Admin Experience is a separate,
server-authorized product surface and never a client-side role flag.

The future implementation is default-deny and server-enforced, prohibits
self-escalation, protects the last Superadmin, requires step-up authentication
and dual control for the highest-risk operations, and never allows Intelligence
to grant itself authority or autonomously perform break-glass actions.

## Social / Experience Graph

Social is a strategic reserved Core boundary with owner stream
`feature/social-experience-graph`. It will own consent-scoped Experience Graph
edges, relationship/visibility lifecycle, Travel Twin relationship state,
Echoes, Experience Drops, Trip Fork provenance and inspiration signals.

It is explicitly anti-vanity: no endless feed, public follower/like race or
hidden global popularity score defines relevance. Collaboration remains the
owner of memberships, invitations and group roles. Identity owns explicit
preferences, Intelligence the private inferred Travel DNA and match
calculation, Memory the source memories, Booking provider/commission truth,
Reviews authored review/moderation truth and Attention notification delivery.

Social references those owners through consented public IDs/projections and
requests actions through contracts. It never copies their truth or exposes
precise travel presence without explicit purpose-bound consent.

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
