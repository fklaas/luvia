# Module Ownership — M2 normative ownership map

This file is **normative from M2 onward**. Existing code can temporarily violate a boundary when listed in `CROSS-CORE-ACCESS.md`, but new code must follow this ownership map.

## Ownership matrix

| Owner | Owns truth for | Public surface today / M3 target | Must not own |
|---|---|---|---|
| Platform | boot primitives, auth/session, single Supabase client, global contracts/capabilities, design/UI primitives, navigation metadata, product-module lifecycle | GlobalContracts, CapabilityRegistry, ProductModuleRegistry, Auth, SupabaseService, shared UI/theme | Trip/Places/Booking/Media/Identity/Social business truth |
| Trip | trips, active trip state, trip metadata, trip membership truth boundary, timeline/schedule trip truth | TripStore + TripContext today; `trip.v1` adapter in M3 | Places lifecycle, Booking lifecycle, Media storage, Social graph |
| Places | places, trip-place lifecycle/planning linkage, place visits, place search/import abstraction | PlaceCore/PlaceEntities/PlaceCommands today; `places.v1` in M3 | Trip identity, Booking provider truth, Media truth |
| Booking | bookings, provider selection/status/provenance, messages, intelligence, attribution, mutations, recovery | **LuviaBooking** today and remains supported; `booking.v1` contract declaration | Consumer state, Social graph, Trip/Place storage |
| Media/Memory | media entities/storage linkage, clusters, polaroids, albums/cards/journeys | MediaCore + Memory services today; `media.v1` in M3 | Trip truth, public Identity truth, Booking truth |
| Identity/Preferences | user profile persistence, private preference aggregate, safe public identity projection | ProfileService/UserPreferences today; `identity.v1` in M3 | Trip membership, collaboration presence, Social relationship graph |
| Intelligence | AI capabilities, policy, evidence, orchestration, recommendation/planning intelligence | **LuviaAI** today; `intelligence.v1` contract | Final writes to Booking/Trip/Places/Media/Identity truth without domain command |
| Collaboration | trip presence and trip activity projection | LuviaCollaboration | Social followers/friends, identity, trip membership truth |
| Social (future) | social experiences/relationships/reactions/read state created by Social itself | `social.v1` specification; implementation does not exist yet | Booking status/messages, Trip membership, private Identity preferences |
| Consumer | visible consumer experience/composition | App Shell + screens/modules | Any domain truth or direct provider/DB ownership |
| Control Center | control-center projections and interaction surfaces | TravelIdentity, Attention, Booking CC/Inbox | Booking/Trip/Message truth |
| Developer | diagnostics/developer tooling | diagnostic read paths | production truth |
| Legacy | compatibility only | adapters/aliases while required | new features or new canonical truth |

## Protected owner files / areas

### Platform / Shared
`core/platform/*`, `auth/*`, `core/services/supabase-service.js`, `core/runtime/*`, `core/ui/*`, `core/design/*`, `core/services/theme-service.js`, `app/navigation-registry.js`, `core/modules/module-registry.js`, `intelligence/kernel/version.js`, `index.html`, `sw.js`, `wrangler.jsonc`.

### Trip
`core/trips/*`, `luvia-trip-context.js`, Trip-owned migrations/tables, membership/timeline/schedule contracts. `core/context/travel-context-service.js` is a derived Trip context service.

### Places
`core/places/*`, productive Place compatibility services in `intelligence/place-entity-service.js` / `intelligence/places-service.js`, modern Place modules only as experience consumers.

### Booking
`core/booking/*`, all `supabase/functions/booking-*`, Booking-owned SQL objects, provider adapters/secrets/status/mutations/recovery/email runtime.

### Media/Memory
`core/media/*`, media/memory SQL objects and `luvia-media`/thumbnail storage paths. `sync/gallery.js` is legacy compatibility, not a new write path.

### Identity/Preferences
`core/profiles/*`, `core/preferences/*`, profile RPCs/tables. Auth remains Platform and is consumed by Identity.

### Intelligence
`core/ai/*`, recommendation/discovery/planning intelligence, `supabase/functions/luvia-intelligence`. Old Intelligence Foundation files remain Legacy unless current entry reachability is proven.

## Write ownership rules

1. A domain is the only layer allowed to perform final persistence mutations to its owned tables.
2. Experience code can request commands but cannot reproduce domain validation or write owned tables directly.
3. Intelligence may propose/score/recommend; it cannot silently finalize another domain's mutation.
4. Platform may provide transport, lifecycle and registry primitives but cannot infer/finalize business state.
5. Cross-domain reads use a public contract/projection. Direct table reads are transitional debt only when explicitly listed.
6. Cross-domain writes always use an owner command/API. There is no exception for “small UI fixes.”

## Ownership conflicts

When a file logically spans multiple domains, ownership is decided by **the truth it can mutate**, not by folder name or UI placement. If it mutates no domain truth and only renders/composes, it belongs to Experience. If it aggregates without persisting, it is a Projection. If uncertainty remains, Platform owns the change request process, not the business truth.
