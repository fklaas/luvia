# Luvia Dependency Rules

## 1. Canonical truth

Each business domain has one canonical truth owner.

Consumers must not duplicate that truth in parallel stores, fallback databases or private snapshots.

## 2. Contract-first cross-core access

A consumer outside a domain core should use that domain's public contract.

Private implementation details are not stable integration APIs.

## 3. Database ownership

A core must not directly read or mutate another core's database objects unless an explicit ownership exception exists.

Existing repository guardrails remain authoritative.

## 4. Experience Core boundary

Experience Core may provide visual and interaction infrastructure.

It must not own or persist Trip, Places, Booking, Media, Identity, Social or Intelligence domain truth.

Experience components receive state through public inputs, domain projections or supported contracts.

## 5. Intelligence Core boundary

Intelligence may understand every domain, but it owns no domain truth except Intelligence-specific state.

Allowed pattern:

`Intelligence -> Domain Contract -> Context / Projection`

Allowed action pattern:

`Intelligence -> Domain Contract / Command -> Domain Core`

Forbidden pattern:

`Intelligence -> private Domain Store`

Forbidden pattern:

`Intelligence -> direct foreign Domain DB mutation`

## 6. Migration over duplication

When legacy and new architecture overlap, migrate through adapters and compatibility layers.

Do not create an unrelated replacement implementation beside the canonical system.

## 7. Owner / bridge classification

Files with write responsibility, bootstrap responsibility or compatibility responsibility must not be migrated as ordinary consumers.

Classify before moving.

## 8. Timeline boundary

`journey.v1` is the only public Journey boundary. Active consumers use its explicit `reads` and `commands` surfaces.

`core/journey/` owns the browserless derived Day Graph, ordering, conflict policy and provenance. It may aggregate public owner projections, but it may not persist or duplicate Trip, Places, Booking, Media, Identity, Social or Intelligence truth.

`core/places/timeline-core.js` is the explicit Web/DB compatibility provider behind the adapter. No active consumer may reach its private `LuviaTimelineCore` global directly.

## 9. Experience changes versus core changes

Do not combine a broad visual redesign with a risky domain-core boundary change in the same build.

The future Experience Core exists specifically so global redesign work can later proceed against stable domain contracts.

## 10. Runtime navigation

`navigation.v1` is the canonical route and screen-intent truth. Platform-specific history stacks may only project or restore those intents.

The Web History API belongs in the Platform Web adapter. Browserless runtime/navigation cores must not import DOM, browser storage, `window`, `location` or History APIs.

Consumer commits navigation only after a successful mount. Domain navigation requests remain distinct from Domain Commands, and screen navigation grants no authority to mutate foreign Domain Truth.

Auth, Lifecycle and Network transitions enter App Shell orchestration only through `app-runtime-signals.v1` and their Platform Ports. The policy may emit sanitized session/resume/reconnect actions but must not retain tokens, duplicate session truth or absorb domain-specific sync ownership. Resume/reconnect preserves the current Navigation Intent and must not add History.

## 11. Tests

Every migration slice must have targeted regression coverage.

Repository-wide safe regression and ownership guardrails remain mandatory at release gates.

## 12. Overlay and modal ownership

Domain and product flows may provide content and owner commands, but must not create a second global modal stack, keyboard dispatcher, scroll-lock owner or z-index hierarchy. Shared presentation crosses `overlay-host.v1`; Web DOM behavior remains in the Web compatibility host and native clients bind native presentation adapters.

Journey supplies domain-specific content and commands through `journey.v1`; Overlay Host remains the sole global presentation lifecycle owner. The legacy Journey presentation provider is an explicit compatibility layer, not permission to create another modal stack or reclassify Journey as Places.

## 13. Memory versus Media ownership

`memory.v1` is the public boundary for albums, cards, stories, chapters,
contributions, curation decisions and narrative lifecycle. Memory references
Media assets by ID and consumes sanitized `media.v1` projections.

Media owns asset metadata, acquisition, delivery and upload state. It must not
absorb durable narrative truth. Memory must not copy storage paths, buckets or
Media entity state.

The current `core/media/memory-*.js` services are explicitly classified Web/DB
compatibility providers behind `memory.v1`. Consumers must not add new direct
dependencies on their `LuviaMemory*` globals. The older Memory functions on
`media.v1` are compatibility only and must not become a second owner surface.
