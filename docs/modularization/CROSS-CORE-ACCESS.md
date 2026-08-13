# Cross-Core Access and Global Coupling Register

This is the human-readable prioritized companion to `GLOBAL-ACCESS-INVENTORY.csv`. M2 does not remove these call-sites; it defines the target boundary so M3+ can migrate them safely.

| Area | Current coupling | M2 ruling | Target stage |
|---|---|---|---|
| App Shell → Booking | global Booking loader/bootstrap families in shell | allowed transitional bootstrap only; no new Booking business logic in shell | M9/M11 |
| App Shell → all experiences | direct mount/unmount switchboard | transitional; future registry/lifecycle adapter | M9-M10 |
| App Shell → routing | concrete Google Maps route helper | belongs to mobility/planning contract, not shell | M6/M9 |
| TripStore → LegacyParis | migrator + cloud hydration | legacy bridge may remain, hidden behind Trip contract | M5/M14 |
| TripCreator/Experience → infra aliases | SupabaseService/ParisCloud/ParisSupabaseClient fallback chains | no new alias usage; M5 routes through Trip-owned infrastructure | M5 |
| Trip consumers → context API drift | consumers expect `getActiveTripId`, `get`, `getSnapshot().activeTrip` variants | M3 contract defines one read shape; adapter supplies compatibility | M3/M5 |
| Capability/GlobalContracts → TravelContext fallback | TripContext OR TravelContext accepted | TripContext is canonical, TravelContext derived | M3 |
| PlacesFinal → planning persistence | custom modal/import/save/lifecycle/timeline/event orchestration | central Place planning command/use-case is owner | M6 |
| PlaceCommands.plan → TripPlaceData | command layer currently incomplete relative to UI planning use case | do not make it canonical until M6 consolidation | M6 |
| Media → Places | capture GPS resolution via Places service | legitimate dependency but must use Places public read contract | M7 |
| Gallery/Memory → OpenAI provider | direct `LuviaOpenAIProvider` media capabilities | forbidden for new code; use Intelligence contract once capabilities registered | M7/M8 |
| Memory/Timeline → trip_members | direct membership queries in several areas | foreign direct read; expose Trip membership projection | M5/M7 |
| Profile → ParisAuth | compatibility alias | canonical Auth contract/name only for new code | M8/M14 |
| Collaboration → App Shell | reads active view for presence metadata | replace with neutral Platform navigation/view context | M8/M9 |
| Collaboration → domain event semantics | listens to restaurant/trip events and records activity | future domain-to-activity adapter; Collaboration stays generic | M8 |
| JoinFlow | join UI + membership list + realtime combined | backend truth remains Trip membership; split projection/experience after Trip contract | M5/M10 |
| LuviaModules | runtime + legacy storage + RPC + editor/content | runtime remains; persistence moves to Trip/module command | M9/M14 |
| Module manager login sync | document emits non-bubbling `reisezeit:login-success`, window listener waits for it | dormant mismatch; do not depend on it as canonical sync | M9/M14 |
| Booking View | uses deprecated `LuviaBooking.cancel()` | new code must use evidence-driven `cancelBooking()` | Booking product hardening |
| Control Center → Booking compatibility | `LuviaBookingIntegration || LuviaBooking` | `LuviaBooking`/booking.v1 is canonical | M3 |
| Control Center Attention | reads Booking + TravelIdentity and keeps projection state | valid projection; must remain non-persistent/domain-neutral | retain |
| Shared UI | many consumers call missing `LuviaUIKit.toast` | confirmed API gap; complete existing UIKit, do not invent notification subsystem | safe UI hardening |
| ProductModuleRegistry | lifecycle callbacks not awaited | harden existing registry; do not build another module lifecycle system | M3/M4 |
| Events | DOM CustomEvents productive; old Kernel bus not loaded | version/naming contract in M3; do not revive old bus | M3 |
| Feature gates | old Intelligence flags dormant, modern flags absent | M4 introduces small modern gate convention | M4 |
| Notifications | global `notifications.unread` planned only | domain read/action truth stays in owner; future aggregator is projection | later |

## Direct DB access rule from M2 onward

New cross-core `.from('<foreign_table>')` calls are forbidden. Existing call-sites are migration debt and must be routed through a contract when their owning M-stage is executed. `GLOBAL-ACCESS-INVENTORY.csv` is the baseline diff source: M3+ should make the number of foreign-domain direct accesses trend down, never up.

## Global `window.*` rule

Existing globals remain compatibility APIs until adapters are available. New domain internals must not be exported globally. M3 public contract adapters can be global initially for compatibility, but the exported object must be frozen/versioned and intentionally small.
