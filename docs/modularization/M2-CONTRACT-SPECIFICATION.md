# M2 — Ownership & Contract Specification

**Status:** normative specification; no runtime implementation in M2.  
**Contract style:** minimal, versioned, owner-controlled, backward-compatible.  
**Next step:** M3 creates additive adapters onto the existing implementations.

## 1. Contract principles

1. **One truth, one owner.** A contract exposes a domain's truth; it does not create a second copy.
2. **Reads, commands and events are separate.** Reading state never implies write permission. Events are notifications/invalidation, not persistence truth.
3. **Experiences do not own domain truth.** Consumer, Control Center and future Social UI call contracts.
4. **Intelligence proposes; domains decide/write.** AI output cannot directly finalize Booking/Trip/Places/Media/Identity truth unless the owning domain command validates and persists it.
5. **No foreign internals.** Repository classes, provider adapters, table schemas, storage paths and compatibility aliases are not public contracts.
6. **Additive migration first.** M3 adapters wrap existing code; they do not rewrite working cores.
7. **Current compatibility violations are debt, not precedent.** New code must follow M2 even before all old callers are migrated.

## 2. Contract versioning

- Contract IDs: `trip.v1`, `places.v1`, `booking.v1`, `media.v1`, `identity.v1`, `intelligence.v1`, `social.v1`.
- Runtime contract objects use `version:'1'` or equivalent major identifier aligned with current `LuviaGlobalContracts` style.
- **Additive** optional methods/fields/events can remain in v1 if old consumers continue to work.
- A rename, removal, changed semantic, changed required field, or changed error/command guarantee is **breaking** and requires `v2` alongside `v1` for a migration window.
- An old major can be removed only after call-site inventory reaches zero and baseline/domain regression is green.
- Contract events carry an event/payload version independently from app/core release numbers.
- App `13.x`, Booking Core `4.x` and M-build IDs are release identifiers, not contract versions.

## 3. Event responsibility and envelope

M3 will implement/normalize the following envelope without requiring a new global event bus:

```js
{
  name: 'domain.entity.changed',
  version: '1',
  source: 'trip|places|booking|media|identity|intelligence|social|platform',
  occurredAt: '<ISO-8601>',
  tripId: '<uuid|null>',
  entityId: '<id|null>',
  payload: { /* additive domain projection */ },
  meta: { correlationId: null }
}
```

Rules:

- only the owner emits a domain-state event after a successful mutation/accepted state transition;
- experience code may emit UI intent events but must not impersonate domain state changes;
- event consumers re-read the owner contract when correctness matters;
- event delivery failure cannot be treated as rollback of persisted domain truth;
- current DOM `CustomEvent` transport can remain underneath the contract.

# 4. Domain contracts

## 4.1 `trip.v1`

**Owner:** Trip.  
**Current implementation sources:** `LuviaTripStore`, `LuviaTripContext`, TripCreator/TripExperience/JoinFlow, legacy cloud bridge internally.

### Public reads

- `listTrips()` → immutable trip summary list.
- `getTrip(tripId)` → one normalized trip summary or null.
- `getActiveTrip()` → canonical active trip or null.
- `getContext()` → `{ tripId, hasActiveTrip, tripName, destination, destinationName, symbol, accent, startDate, endDate, role, isOwner }`.
- `subscribe(listener)` → active/list change projection.
- future M5 projection: membership summary, timeline/schedule reads required by other domains.

### Allowed commands

- `selectActiveTrip(tripId|null)` — App Shell/Consumer may request selection.
- create/edit/join/invite actions remain Trip-owned use cases; Experience can invoke them through a Trip command/use-case surface, not through direct DB/RPC access.
- module selection/config writes are Trip-owned configuration commands once consolidated.

### Events

`trip.changed`, `trip.active.changed`, `trip.membership.changed`, `trip.timeline.changed` (v1 envelope after M3/M5). Existing `luvia:trips-changed` and `luvia:trip-context-changed` remain compatibility events during migration.

### Internal only

`LuviaLegacyParisMigrator`, `LuviaLegacyParisCloud`, `ParisCloud`, `ParisSupabaseClient`, raw Trip RPC names, localStorage trip keys, direct `trip_members`/`trip_settings`/`trips` schema.

### Owned tables

`trips`, `trip_settings`, `trip_members`, `trip_modules`, `trip_preferences`, `trip_schedule_events`, `timeline_events` (with Collaboration owning its separate activity/presence projections).

### Forbidden

Consumer/Places/Media/Social may not write Trip tables or call Trip persistence RPCs directly. Social may not reinterpret `trip_members` as followers/friends.

---

## 4.2 `places.v1`

**Owner:** Places.  
**Current implementation sources:** `LuviaPlaceCore`, `LuviaPlaceEntities`, `LuviaPlaceCommands`, `LuviaPlaceUIActions` planning use case, Place lifecycle/services.

### Public reads

- `search(query/options)` / typed discovery.
- `getPlace(placeId)`.
- `listPlaces(filters)` / trip place projection.
- place details/capabilities/roles/lifecycle projection.
- read-only route/contact/provider metadata only when intentionally part of Place projection; Booking provider truth remains Booking.

### Allowed commands

- `importPlace(providerPlaceId, options)`.
- `favorite`, `unfavorite`, `toggleFavorite`, `clearFavorites`.
- `plan` / `unplan` through the consolidated Places planning command/use case.
- `updateLifecycle` and visit confirmation through owner services.

### Events

`places.changed`, `place.lifecycle.changed`, `place.plan.changed`, `place.favorite.changed`; current `luvia:*` events remain compatibility names until M3 normalization.

### Internal only

Provider adapters/normalizers, TripPlaceData persistence details, backend operation names, raw `places`, `trip_places`, `trip_place_data`, `place_*` tables.

### Owned tables

`places`, `trip_places`, `trip_place_data`, `place_visits`, `place_lifecycle_history`, `place_recommendation_feedback`; legacy/extension `restaurants`, `accommodations`, `provider_cache` until M6 decides final placement.

### Forbidden

Places cannot finalize Booking status/provider mutation; Consumer modules cannot write Place tables directly. Media can request coordinate-to-place resolution only through a Places read contract.

---

## 4.3 `booking.v1`

**Owner:** Booking.  
**Current public facade:** `window.LuviaBooking` from `core/booking/booking-integration.js`. This is already the reference pattern for other domains.

### Public reads

The M3 contract can expose a curated subset of the existing facade:

- `listForTrip(tripId)`, `get(bookingId)`.
- `conversation(bookingId)`, `messages`, conversation preferences/unread projection.
- `bookingTimeline(bookingId)`.
- status/provenance/capability summary required by UI.
- provider-independent route/contact readiness summary where needed.

### Allowed commands

- `createForPlace`.
- `reply` / supported message action.
- `performIntelligenceAction` / `resolveIntelligence` where Booking owns the action semantics.
- `modifyBooking` and `cancelBooking` only; final status remains evidence/provider-driven.
- `setConversationPreference` for personal read/archive/delete-view state.

`cancel()` is legacy/deprecated and must not be used by new code.

### Events

- coarse invalidation: current `luvia:booking-changed` remains supported during migration;
- granular BookingEvents such as created/status/message/provider notifications are domain notifications;
- M3 versioned envelope will normalize external consumption.

### Internal only

`LuviaBookingRepository`, `LuviaBookingCore`, provider registry/adapters/stubs, Email runtime internals, recovery/reconciliation, status signal internals, provider secrets, all raw Booking RPC/table schemas and Booking Edge Function endpoints.

### Owned data

`bookings` plus all `booking_*` tables/views/functions and all `booking-*` Edge Functions.

### Forbidden

Consumer, Social, Trip and Places may not read/write `booking_*` tables directly, instantiate provider adapters, inspect provider credentials, or infer a final booking state from a click. Social has no direct Booking provider access.

---

## 4.4 `media.v1`

**Owner:** Media/Memory.  
**Current implementation:** `LuviaMediaCore`, `LuviaMemoryAlbums`, `LuviaMemoryCards`, `LuviaMemoryJourneys`, MediaClustering/Metadata/Preview.

### Public reads

- media list/get and safe signed preview/original URL requests;
- favorite/polaroid projection;
- albums/cards/journeys read projections;
- diagnostics/readiness as developer/Platform diagnostics, not business truth.

### Allowed commands

- upload/update/reanalyze/favorite/link-place/remove through MediaCore;
- album/card/journey commands through the respective Memory owner service;
- destructive `clearTripGallery` is Media-owned and must only be exposed through an explicitly authorized user flow, never generic cross-core access.

### Events

`media.changed`, `media.deleted`, `media.polaroid.changed`, `memory.changed`; compatibility DOM events remain until adapter migration.

### Internal only

Storage bucket paths, `media` row schema, clustering persistence, memory table joins, metadata/preview internals. Direct OpenAI provider calls are not part of Media public contract.

### Owned data

`media`, `media_*`, `memory_*`, `live_moment_media`, storage buckets `luvia-media` and `luvia-media-thumbnails`. `paris-gallery` is legacy compatibility only.

### Forbidden

Consumer/Social cannot access Storage or Media tables directly. Media must request AI through `intelligence.v1`, not `LuviaOpenAIProvider` directly once M8 capability gaps are closed.

---

## 4.5 `identity.v1`

**Owner:** Identity/Preferences.  
**Current implementation:** `LuviaProfileService`, `LuviaUserPreferences`, `LuviaTravelPreferences`; Auth itself is Platform.

### Public reads

Two distinct projections are required:

1. **viewer/self identity:** user id, display name, avatar information and settings required by the signed-in user's own experience;
2. **public identity projection:** minimal whitelisted identity safe for other users/domains, initially `{ userId, displayName, avatarUrl, avatarColor }` plus only fields explicitly approved later.

Preferences are a separate self-only projection/API and are not public Social profile data.

### Allowed commands

- `updateProfile(patch)` through ProfileService/adapter.
- `updatePreferences(patch/category)` through UserPreferences.
- active trip selection is **not Identity ownership** even though the current profile aggregate stores `activeTripId`; M5/M8 must keep Trip ownership authoritative and treat profile value as a preference/reference.

### Events

`identity.changed`, `preferences.changed`; current `luvia:profile-changed`, `luvia:user-preferences-changed`, `luvia:travel-preferences-changed` remain compatibility events.

### Internal only

Full `user_profiles` row, private dietary/travel/accessibility/preferences/settings, auth metadata migration, local profile cache, persistence RPC payloads.

### Owned data

`user_profiles`, `derived_user_preferences` and preference schema semantics. Platform/Auth owns authentication session/identity provider mechanics.

### Forbidden

Social cannot read the whole ProfileService snapshot or private preferences. Booking/Places cannot persist profile changes directly. Identity cannot own Trip membership or Collaboration presence.

---

## 4.6 `intelligence.v1`

**Owner:** Intelligence.  
**Current public facade:** `LuviaAI`.

### Public reads/operations

- `run(capability,input,options)` with registered capability IDs;
- curated convenience operations (`ask`, `rank`, `recommend`, `explain`, `summarize`) where semantics are stable;
- diagnostics/health only for appropriate developer/platform consumers.

### Allowed commands

Intelligence can create **proposals** or return ranked/explained results. A proposal that changes another domain must be passed to that domain's public command and confirmed according to domain policy.

### Events

`ai.changed`, proposal lifecycle/evidence events; versioned in M3/M8.

### Internal only

`LuviaOpenAIProvider`, model router, policy engine, tool registry, evidence store, orchestration internals, Edge Function request details/model selection.

### Owned data

`ai_*`, recommendation/learning/evidence/orchestration data and intelligence-owned generated/automation data as listed in Database Domain Map.

### Forbidden

Other domains must not call the concrete OpenAI provider. Intelligence cannot update Booking/Trip/Places/Media/Identity tables as a shortcut.

---

## 4.7 `social.v1` — future contract reservation

**Owner:** future Social Core. There is **no Social persistence implementation in M2**.

### Minimal public reads

- `listFeed(context)` → social experience projection.
- `getExperience(id)`.
- `getRelationshipSummary(subjectId)` where such a relationship model exists.
- `getUnreadSummary()` for Social-owned unread state.
- public identity displayed in Social comes from `identity.v1` public projection, not copied private profile state.

### Allowed commands

- `publishExperience(payload)`.
- `setReaction(...)`, `comment(...)` if/when those features are introduced.
- `follow/unfollow` or equivalent relationship command only after Social schema is explicitly defined.
- `markRead(...)` for Social-owned read state.

These names are **specification placeholders**, not authorization to implement all features at once.

### Events

Reserved namespace: `social.experience.*`, `social.relationship.*`, `social.unread.*`, version 1.

### Internal only

Future Social graph/ranking/moderation tables and algorithms.

### Data ownership rule

New Social truth gets new Social-owned schema objects (for example `social_*` once designed). Do **not** overload `trip_members`, Collaboration presence/activity or Booking messages as a social graph.

### Forbidden

Social → Booking repository/provider/table access; Social → Trip membership writes; Social → private ProfileService snapshot/preferences; Social → Media storage internals. Social may consume approved public projections/contracts only.

# 5. Shared Platform contracts

Platform provides transport/lifecycle contracts but owns no domain truth:

- Auth session
- Supabase client/service
- Trip/Identity/etc contract registry/adapters in M3
- capability metadata
- product module lifecycle
- navigation metadata
- shared design/UI/theme
- attention event shape / future notification aggregation projection
- feature gates in M4

## Attention / unread rule

Unread and action-required remain domain-owned. A future global notification/attention service may aggregate projections but cannot become the source of Booking/Social/Trip truth. `LuviaAttentionContract` should gain a `social` source when Social is introduced; do not create a separate Social-only global attention contract.

# 6. Forbidden direct access list

From M2 onward, **new** code is rejected if it does any of the following:

1. Consumer/Control Center/Social calls `.from('booking_*')`, Booking RPCs or provider adapters directly.
2. Social reads/writes `trip_members` to implement friendships/following.
3. Consumer/Social reads full `user_profiles`/ProfileService private preference aggregate for public display.
4. Media/Consumer calls `LuviaOpenAIProvider` instead of Intelligence contract.
5. Experience code writes `trips`, `places`, `media`, `booking_*`, `user_profiles` directly.
6. A product stream changes `core/platform`, shared event semantics, UI/design primitives, Auth/Supabase ownership or public contracts without PCR.
7. New code depends on `ParisAuth`, `ParisSupabaseClient`, `ParisCloud`, `LuviaLegacyParis*` or old Intelligence platform/kernel APIs.
8. A new global `window.*` domain internal is created without being an intentional versioned contract adapter.
9. An event is treated as authoritative persistence truth without re-reading the domain where correctness matters.
10. A deployed migration is edited or a productive table/bucket is destructively renamed/deleted for modularization.

# 7. Platform Change Request rule

See `PARALLEL-DEVELOPMENT-RULES.md`. Shared changes require a PCR containing owner, reason, affected contracts/streams, compatibility, tests, rollout and rollback. No product stream may smuggle a cross-cutting change into its feature build.

# 8. M2 → M3 implementation boundary

M2 does **not** create runtime adapters. M3 may add:

- versioned `TripContract`, `PlacesContract`, `MediaContract`, `IdentityContract` adapters;
- Booking contract registration around existing `LuviaBooking` without rewriting Booking Core;
- contract registry hardening on top of existing Platform registries;
- versioned event envelope adapters;
- legacy-vs-contract equivalence regression tests.

Existing implementations remain live until those adapters are proven.
