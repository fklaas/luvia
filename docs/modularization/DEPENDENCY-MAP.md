# Dependency Map — current runtime and target direction

## Current high-level graph

```text
index.html / sw.js
        ↓
App Shell / Boot Coordinator / Runtime
        ↓
Auth + SupabaseService + TripStore/Profile
        ↓
┌────────────┬────────────┬─────────────┬─────────────┐
│ Consumer   │ Places     │ Booking     │ Media       │
│ Experience │ Experience │ Experience  │ Experience  │
└─────┬──────┴─────┬──────┴─────┬───────┴─────┬───────┘
      ↓            ↓            ↓             ↓
 Trip/Context   Places Core   LuviaBooking   Media Core
      ↓            ↓            ↓             ↓
 Trip storage   Place data    Booking DB      Media/Memory DB
 /legacy bridge /backend       + providers     + storage

Identity/Profile ─────────────→ context/preferences used across domains
LuviaAI ──────────────────────→ intelligence services/proposals
Collaboration ────────────────→ trip activity/presence projection
```

## Current App Shell dependencies

`app/app-shell.js` currently:

- owns global boot/auth/navigation/render orchestration;
- starts Booking loader families in `startShell()`;
- mounts PlacesShell, GalleryView, AlbumsView, Booking views, Control Center, module hubs and other experiences in `show()`;
- contains central `handleHubAction` routing and domain-specific unmount knowledge;
- refreshes trip-dependent Destination, Timeline and Collaboration state after active-trip changes;
- still contains concrete route-helper / Google Maps routing behavior.

This makes the App Shell the largest cross-domain lifecycle dependency. It must be reduced only **after** M2 contracts and M3 adapters exist.

## Domain dependency direction declared by M2

```text
Platform contracts/runtime
       ↑ consumed by all
       │
Trip   Places   Booking   Media   Identity   Intelligence   Social(future)
 ↑       ↑        ↑         ↑       ↑             ↑             ↑
 └─────── public contracts / commands / events only ─────────────┘
                       ↑
                 Experience layers
                       ↑
                    App Shell
```

Allowed dependency direction is **Experience → Domain Contract → Domain implementation**. A domain may depend on Platform and on another domain's public contract; it must not reach into the other domain's tables/internal service graph.

## Confirmed cross-domain hotspots

- TripStore → `LuviaLegacyParisCloud` / `LuviaLegacyParisMigrator`.
- TripCreator/TripExperience → direct Supabase/ParisCloud fallback chains.
- PlacesFinal → duplicates part of central Place planning persistence/event orchestration.
- MediaCore → Places lookup for capture coordinates; legitimate integration but should become a Places contract call.
- Gallery/Memory → direct `LuviaOpenAIProvider` capability calls; target `LuviaAI` capability contract.
- Memory/Timeline/Knowledge Graph → direct `trip_members` reads in places; target Trip membership projection.
- ProfileService → `ParisAuth` compatibility alias; target shared Auth contract.
- Collaboration → `LuviaApp.activeView` for presence metadata; target neutral Platform view/context signal.
- JoinFlow → auth/join UI + membership projection + realtime in one file; split only after Trip contract exists.
- `LuviaModules` → legacy localStorage + direct module RPC plus runtime mounting; target runtime-only with Trip-owned module configuration command.
- Control Center → `LuviaBookingIntegration || LuviaBooking`; target one Booking contract/facade.

See `CROSS-CORE-ACCESS.md` and `GLOBAL-ACCESS-INVENTORY.csv` for the operational debt list.

## M16.5AB Today / Journey / Places direction

```text
Identity preferences ─┐
                     ├─→ Intelligence derived resolution ─→ Today proposal
Trip composition ────┘                                  └─→ Places ranking input

Trip + owner events ─→ Journey derived day graph/open gaps ─→ Today sequence
                                                       └─→ explicit Places handoff
```

The shared web adapter reads public owner contracts and may retain only an
ephemeral navigation proposal. It does not persist preferences, Trip
composition, Journey entries, Places selections or AI output. Planning remains
an explicit Places/Trip/Journey owner command after user confirmation.
