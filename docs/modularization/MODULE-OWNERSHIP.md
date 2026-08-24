# Module Ownership — M2 normative ownership map

This file is **normative from M2 onward**. Existing code can temporarily violate a boundary when listed in `CROSS-CORE-ACCESS.md`, but new code must follow this ownership map.

## Ownership matrix

| Owner | Owns truth for | Public surface today / M3 target | Must not own |
|---|---|---|---|
| Platform | boot primitives, auth/session transport, single Supabase client, global contracts/capabilities, runtime stages/signals, navigation intents/history policy, product-module lifecycle | GlobalContracts, CapabilityRegistry, ProductModuleRegistry, `app-runtime.v1`, `app-runtime-signals.v1`, `module-mount.v1`, `navigation.v1`, `navigation-history.v1`, Auth, SupabaseService | Trip/Places/Booking/Media/Memory/Identity/Collaboration/Admin business truth |
| Trip | trips, active trip state, trip metadata, trip membership truth boundary, timeline/schedule trip truth | TripStore + TripContext today; `trip.v1` adapter in M3 | Places lifecycle, Booking lifecycle, Media storage, Social graph |
| Places | places, trip-place lifecycle/planning linkage, place visits, place search/import abstraction | PlaceCore/PlaceEntities/PlaceCommands today; `places.v1` in M3 | Trip identity, Booking provider truth, Media truth |
| Booking | bookings, provider selection/status/provenance, messages, intelligence, attribution, mutations, recovery | **LuviaBooking** today and remains supported; `booking.v1` contract declaration | Consumer state, Social graph, Trip/Place storage |
| Media | media entities, asset/storage linkage, acquisition and transfer lifecycle | MediaCore and `media.v1` | Memory narrative, Wallet documents, Trip/Identity/Booking truth |
| Memory | albums, cards, stories, chapters, contributions, curation decisions and narrative lifecycle | `memory.v1` with classified Web/DB compatibility providers | Media asset truth, Trip/Journey/Identity/Collaboration truth |
| Identity/Preferences | user profile persistence, private preference aggregate, safe public identity projection | ProfileService/UserPreferences today; `identity.v1` in M3 | Trip membership, collaboration presence, Social relationship graph |
| Intelligence | AI capabilities, policy, evidence, orchestration, recommendation/planning intelligence and Intelligence-specific state | browserless `core/intelligence/intelligence-domain-contract-core.js`; active `LuviaIntelligenceContractV1`; LuviaAI/core/ai remains transitional Web runtime | Final writes to Booking/Trip/Places/Media/Identity/Social/Journey truth without domain command |
| Experience Core | shared design tokens, themes, layout primitives, reusable UI components, interaction patterns, motion, accessibility, icons and experience diagnostics | `core/experience/*` | Any domain truth, direct domain persistence, domain validation or business mutation lifecycle |
| Collaboration / Membership (reserved) | collaboration spaces, memberships, invitations, scoped roles/grants and their lifecycle after M18.1 | planned `collaboration.membership.v1`; current LuviaCollaboration remains presence/activity compatibility only | Identity profile, Trip membership, Admin governance grants |
| Social / Experience Graph (reserved strategic) | consented Experience Graph edges, circles/relationships, visibility, Travel Twin relationship state, Echoes, Drops, Trip Fork provenance and inspiration signals | planned `social.experience-graph.v1`; `social.v1` compatibility reservation | Collaboration membership, private Travel DNA, Memory/Trip/Places/Booking/Reviews truth, Attention delivery, commission truth |
| Attention / Notification Intent (reserved) | attention policy, semantic notification intents, scheduling, dedupe, Inbox state and delivery receipts | planned `attention.notification-intent.v1` | originating Domain facts, provider UI ownership |
| Travel Wallet / Documents (reserved) | secure travel documents, versions, validity, verification claims and share grants | planned `travel-wallet.documents.v1` | Booking purchase truth, Trip, Identity or Media asset truth |
| Reviews / Reputation (reserved) | reviews, revisions, moderation, reports, appeals, helpful votes and transparent reputation projections | planned `reviews.reputation.v1` | Places/Booking truth, provider review truth, hidden global social score |
| Admin / Governance (mandatory reserved) | administrative roles, capability grants, scopes, policies, approvals, break-glass sessions and immutable audit receipts | planned `admin.governance.v1` and `admin.audit.v1` | Auth session, Identity profile, Trip/Collaboration membership or any managed Domain Truth |
| Consumer | visible consumer experience/composition | App Shell + screens/modules | Any domain truth or direct provider/DB ownership |
| Control Center | control-center projections and interaction surfaces | TravelIdentity, Attention, Booking CC/Inbox | Booking/Trip/Message truth |
| Developer | diagnostics/developer tooling | diagnostic read paths | production truth |
| Legacy | compatibility only | adapters/aliases while required | new features or new canonical truth |

## Protected owner files / areas

### Platform / Shared
`core/platform/*`, `auth/*`, `core/services/supabase-service.js`, `core/runtime/*`, `core/ui/*`, `core/design/*`, `core/services/theme-service.js`, `app/navigation-registry.js`, `app/adapters/navigation-history-web-adapter.js`, `app/adapters/runtime-signal-web-adapter.js`, `core/modules/module-registry.js`, `intelligence/kernel/version.js`, `index.html`, `sw.js`, `wrangler.jsonc`.

### Trip
`core/trips/*`, `luvia-trip-context.js`, Trip-owned migrations/tables, membership/timeline/schedule contracts on `feature/trip-core`. `core/context/travel-context-service.js` is a derived Trip context service.

### Places
`core/places/*` on `feature/places-core`, productive Place compatibility services in `intelligence/place-entity-service.js` / `intelligence/places-service.js`, modern Place modules only as experience consumers.

### Booking
`core/booking/*`, all `supabase/functions/booking-*`, Booking-owned SQL objects, provider adapters/secrets/status/mutations/recovery/email runtime.

### Media
`core/media/*` on `feature/media-core`, Media SQL objects and `luvia-media`/thumbnail storage paths. `sync/gallery.js` is legacy compatibility, not a new write path. The classified `core/media/memory-*` providers remain Memory-owned compatibility despite their physical path.

### Memory
`core/memory/*` on `feature/memory-core`; Memory/Narrative SQL objects and the classified `core/media/memory-*` compatibility providers behind `memory.v1`.

### Identity/Preferences
`core/identity/*`, `core/profiles/*`, `core/preferences/*`, profile RPCs/tables on `feature/identity-core`. Auth remains Platform and is consumed by Identity.

### Events

`core/events/*` and the versioned event-envelope contract on `feature/events-core`. Events owns no Domain Truth or notification delivery.

### Journey

`core/journey/*` and `app/journey/*` on `feature/journey-core`. The classified `core/places/timeline-core.js` provider remains Journey compatibility and does not make Journey Places-owned.

### Intelligence
Canonical owner root: `core/intelligence/*` on `feature/intelligence-core`. `LuviaIntelligenceContractV1` is active from M8.5 through the Platform-owned Web adapter.

Shared capability, domain/tool metadata, model tiers, policy, validation, context-envelope, signal/proposal and evidence semantics are owned by the browserless Intelligence Core. The continuing Intelligence Core Isolation & Unification migration remains classification-first: existing `core/ai/*`, `intelligence/*`, `core/recommendations/*`, `core/context/*` and AI-related bridges retain their current file-level ownership until each file is classified and migrated. No bulk move is implied.

### Experience Core

`core/experience/*` on `feature/experience-core` is the canonical foundation for shared visual and interaction infrastructure.

Existing `core/design/*`, `core/ui/*`, current Consumer UI and module surfaces remain with their existing owners until a dedicated Experience Core / Design System migration explicitly moves them. The new Experience stream does not retroactively claim those files.

### Reserved future Cores

`core/collaboration/*` is reserved for `feature/collaboration-core`, while the current presence/activity service remains compatibility until M18.1 proves Membership Truth. `core/social/*`, `core/attention/*`, `core/travel-wallet/*`, `core/reviews/*` and `core/admin/*` are reserved for their matching owner streams and must not be created as active runtime roots without an approved Core slice. Social and Collaboration are distinct owners and may not infer one another's truth.

Admin is distinct from Identity and Collaboration. A Superadmin role is not a client flag, profile field or trip membership. The Admin Core must enforce default-deny authorization server-side, prohibit self-escalation, protect the last Superadmin, require step-up authentication and dual control for the highest-risk actions, and produce immutable audit receipts.
## Write ownership rules

1. A domain is the only layer allowed to perform final persistence mutations to its owned tables.
2. Experience code can request commands but cannot reproduce domain validation or write owned tables directly.
3. Intelligence may propose/score/recommend; it cannot silently finalize another domain's mutation.
4. Platform may provide transport, lifecycle and registry primitives but cannot infer/finalize business state.
5. Cross-domain reads use a public contract/projection. Direct table reads are transitional debt only when explicitly listed.
6. Cross-domain writes always use an owner command/API. There is no exception for “small UI fixes.”
7. Administrative authority is evaluated server-side through Admin Governance; UI visibility, JWT convenience claims and cached projections are never sufficient authorization.
8. Admin commands may govern access to another Core, but the resulting domain mutation still executes through that Core's public command and invariants.

## Ownership conflicts

When a file logically spans multiple domains, ownership is decided by **the truth it can mutate**, not by folder name or UI placement. If it mutates no domain truth and only renders/composes, it belongs to Experience. If it aggregates without persisting, it is a Projection. If uncertainty remains, Platform owns the change request process, not the business truth.
