# Legacy Map — Paris and older architecture compatibility

Legacy is **not scheduled for deletion in M2**. This map defines what is still active, what is dormant, and what evidence is required before removal.

## Active compatibility paths

| Legacy/compatibility element | Current role | Removal condition |
|---|---|---|
| `window.ParisAuth` | Alias of the same current Auth API | all consumers use `LuviaAuth` / future auth contract; regression green |
| `window.ParisSupabaseClient` | Alias to the single Supabase client created/reused by SupabaseService | all consumers use SupabaseService; no direct alias readers |
| `LuviaLegacyParisMigrator` | Trip localStorage migration/mirroring used by TripStore | Trip storage migration proven complete and no legacy reader/writer remains |
| `LuviaLegacyParisCloud` | Current TripStore cloud hydration compatibility adapter | M5 Trip adapter provides equivalent cloud path and reload tests pass |
| `paris_list_my_trips()` | Current legacy-named Trip hydration RPC | replacement RPC/contract live, tested and all callers migrated |
| `reisezeit:trip-selected` | Legacy Trip selection event emitted for compatibility | listener inventory is zero or adapter preserves needed behavior |
| `parisTripRegistryV1` / `parisIdentityV1` | `LuviaModules` compatibility storage | module configuration is moved to canonical Trip/module command and all readers migrated |
| `paris-gallery` | legacy readable media bucket; M0 confirmed real objects | Media migration/read bridge complete; object count and production smoke verified before any deletion |
| `sync/gallery.js` | legacy gallery compatibility reader | all historical media visible via Media contract without it |

## Remote/base legacy data confirmed during M0

- `paris_member_activity_feed`
- `paris_member_locations`
- `paris_member_presence`
- `paris_member_profiles`
- legacy storage bucket `paris-gallery`

These are **legacy candidates, not deletion approvals**.

## Dormant/older architecture that must not be revived accidentally

- `intelligence/platform.js` feature-flag system and `runtime-config.json`: repository code exists, but current `index.html`/`sw.js` do not load it and current `app/core/modules/auth` do not consume its feature flags.
- `intelligence/kernel/events.js` / `LuviaKernelEvents`: old event bus exists but is not current Consumer entry. Current productive integration relies on DOM `CustomEvent`; BookingEvents safely falls back to that channel.
- old `LuviaData`, database foundation, old platform/service registry/core bootstrap paths: mostly developer console/tests/legacy UI reachability, not current Consumer boot ownership.
- older `ParisCloud`/sync generation: retain for legacy direct pages until reachability/deletion checks are explicit.

## Compatibility names with drift

- `LuviaBookingIntegration || LuviaBooking` is read by Control Center, but the current Booking facade exports `LuviaBooking`; no current provider assignment for `LuviaBookingIntegration` is established in the M1 inventory. Treat as compatibility debt, not a second Booking API.
- `LuviaSupabase` appears as a fallback in Media code, but no canonical current provider assignment was established. SupabaseService is the canonical client service.
- Global contract/capability probes accept `TripContext || TravelContext`; M2 ownership declares TripContext canonical and TravelContext derived.

## Deletion gate for every legacy item

A legacy item can only be removed when all five are true:

1. canonical owner is documented;
2. replacement contract/adapter is live;
3. all known callers are migrated or a compatibility shim remains;
4. baseline + domain regression suite is green;
5. production smoke proves the user-visible path and rollback point exists.

No M2 artifact authorizes deletion, table rename, bucket deletion or migration rewrite.
