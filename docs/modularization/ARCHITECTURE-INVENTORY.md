# Luvia M1 Architecture Inventory — frozen baseline for M2

**Baseline:** `aff59be9c3a1b69580314c34c0acc7a125c70bb1` (`aff59be`)  
**App:** v13.81.4  
**Core:** 4.81.4  
**Release:** Mutation Thread Bootstrap, Mobile Mutation Surface & Discovery Fetch Hardening  
**Purpose:** Persist the evidence gathered in M0/M1 before contract work. This document is descriptive; it does not change runtime behavior.

## Repository inventory

| Area | Tracked files |
|---|---:|
| Entire archive | 2,387 |
| `core/` | 161 |
| `tests/` | 143 |
| `modules/` | 71 |
| `intelligence/` | 48 |
| `app/` | 33 |
| `supabase/` | 183 |
| `audio/` | 16 |
| `legacy/` | 7 |
| `sync/` | 6 |
| `auth/` | 3 |
| local migrations | 126 |
| local Edge Function directories | 24 |

`FILE-OWNERSHIP.csv` assigns every file in the baseline archive to an owner/classification. `GLOBAL-ACCESS-INVENTORY.csv` provides the machine-readable inventory of Window globals, DOM access, Supabase table/RPC access and event call-sites used to support the manual M1 findings.

## Confirmed current owners

- **App Shell:** `app/app-shell.js` owns boot orchestration, active view/navigation state and current surface mount/unmount orchestration. It is a lifecycle switchboard, not a domain owner.
- **Trip state:** `core/trips/trip-store.js` is the canonical frontend trip state owner. `luvia-trip-context.js` is the public active-trip read facade. `core/context/travel-context-service.js` is derived temporal/location context, not a second trip truth.
- **Booking:** `core/booking/*` is the strongest isolated domain. The supported cross-product facade is `window.LuviaBooking` from `core/booking/booking-integration.js`.
- **Places:** `core/places/*` owns the modern place model/lifecycle/planning path; `intelligence/place-entity-service.js` and `intelligence/places-service.js` remain productive compatibility-era implementations.
- **Media/Memory:** `core/media/media-core.js` owns media truth/API. Memory Albums/Cards/Journeys are separate domain services on top of Media.
- **Identity/Preferences:** `core/profiles/profile-service.js` owns persistent profile aggregate; `LuviaUserPreferences` and `LuviaTravelPreferences` are preference APIs/projections on top of that truth.
- **Intelligence:** `window.LuviaAI` is the public AI facade. Model/provider/router/evidence/tool internals stay behind it.
- **Collaboration:** `core/collaboration/collaboration-service.js` owns trip presence/activity projection. It is not identity, membership truth, or a future social graph.
- **Membership backend truth:** `trip_members`; current frontend member projection is bundled into `LuviaJoinFlow`.
- **Shared platform:** `core/platform/*`, runtime/auth/Supabase service, shared design/UI/theme, navigation metadata and module registries.
- **Consumer:** current screens and app composition under `app/` and `modules/`; no domain truth should be created here.
- **Control Center:** experience/projection under `app/control-center/`; it consumes Booking/Trip platform contracts and explicitly does not own Booking truth.

## Strong boundaries already present

1. Booking Core can be separated from Control Center/Consumer without redesigning booking data.
2. Trip has one canonical frontend state owner; the main debt is compatibility transport/context API drift, not duplicate trip state.
3. Media Core does not depend on Gallery/Albums experience components.
4. AI has a real public facade (`LuviaAI`) and internal provider abstraction.
5. Control Center declares `ownsDomainTruth:false` for derived attention/travel projections.
6. SupabaseService creates one client; `ParisSupabaseClient` is a compatibility alias, not a second connection.
7. Auth has one state owner; `ParisAuth` aliases the same API.

## Highest-priority structural debt confirmed in M1

| ID | Finding | Severity | Planned stage |
|---|---|---|---|
| M1-COUPLING-005 | App Shell is the domain surface switchboard and knows every mount/unmount implementation. | High | M9-M10 after contracts/adapters |
| M1-COUPLING-002 | App Shell globally bootstraps Booking loaders instead of module/lazy ownership. | High | M9/M11 |
| M1-TRIP-INFRA-001/002 | Trip create/edit flows still resolve legacy Cloud/Supabase fallbacks directly. | Medium | M5 |
| M1-LEGACY-BRIDGE-002/003 | TripStore still depends on active Paris migrator/cloud bridges. | Medium | M5/M14 |
| M1-PLACES-PLANNING-001 | Central planning use case exists in `PlaceUIActions`; `PlacesFinal` duplicates part of it. | Medium | M6 |
| M1-MEDIA-AI-001 | Gallery/Memory consumers call `LuviaOpenAIProvider` directly for media capabilities. | Medium | M7/M8 |
| M1-AI-CAPABILITY-001 | `media.describe` and `media.cluster-title` are used but absent from AI capability registry. | Medium | M8 |
| M1-PROFILE-AUTH-001 | ProfileService still uses `ParisAuth` compatibility name. | Low/Medium | M8/M14 |
| M1-COLLABORATION-COUPLING-001 | Collaboration reads `LuviaApp.activeView()` for telemetry metadata. | Medium | M8/M9 |
| M1-MEMBERSHIP-LAYER-001 | JoinFlow combines invite/join UI with membership projection/realtime. | Medium | M5/M10 |
| M1-MODULE-OWNERSHIP-002 | `LuviaModuleRegistry` and `LuviaModules` form a hybrid catalog/runtime; runtime still carries legacy persistence/editor duties. | Medium | M9/M14 |
| M1-PLATFORM-002 | ProductModuleRegistry lifecycle calls are synchronous and do not await async lifecycle callbacks. | Medium | M3/M4 |
| M1-SHARED-UI-API-001 | Many current consumers expect `LuviaUIKit.toast`, but UIKit does not export it. | High UX | separate safe hardening after M2 |
| M1-FEATURE-FLAGS-002 | No active modern central feature-gate service; old `intelligence/platform.js` flags are not current entry. | Medium | M4 per master plan |
| M1-NOTIFICATIONS-OWNERSHIP-001 | Global notifications/unread service is planned only; domain unread/attention ownership is currently local. | Expected gap | later product/platform work |
| M1-TEST-RUNTIME-001 | Large Node regression suite exists, but no central runner/CI/merge gate is tracked. | High for parallel dev | M4 |
| M2-BASELINE-TEST-001 | `release-version-consistency` already fails on baseline because `force-update.html` still points to 13.71.0; historical version-pinned tests are not cumulative CI tests. | Medium release hygiene | separate maintenance + M4 suite taxonomy |

## Runtime/legacy conclusions that must not be reversed casually

- Do **not** introduce a second Trip Store, Booking Core, Places Core, Media Core, AI Core, event bus, module system or UI kit.
- Do **not** revive old `intelligence/platform.js` or old kernel event bus merely because files exist.
- Current productive cross-component event transport is primarily DOM `CustomEvent`; `LuviaKernelEvents` is not loaded by the current consumer entry.
- `LuviaBookingEvents` is a valid booking notification facade with DOM fallback; booking data changes occur before events.
- `notifications.unread` is intentionally `planned`, not a hidden existing global truth.
- `PlanningSession` is temporary workflow/session state, not Trip/Places/Booking persistence truth.
- `LuviaControlCenterAttention` is a projection only and must remain `ownsDomainTruth:false`.

## M1 decision point

The M5-M15 sequence remains valid. The evidence reduces the need for core rewrites: the main work is contract adoption, compatibility removal and App-Shell/Experience decoupling. The largest risk remains frontend lifecycle/shell coupling, not Booking data architecture.
