# M11 Consumer – Today and Attention Baseline and Scope Lock

Date: 2026-08-24

Owner stream: `feature/consumer-experience`

Starting marker: `5067332492fca8a7df79bb6584c891c973550180`

## Read-only baseline

- All eight registered streams start at the M10.5 documentation marker with Local = Tracking = Live, divergence `0/0` and clean worktrees.
- App / Core: `13.82.41 / 4.82.41`; controlled Safe Regression: `67/67 PASS`; NFR-0: `3/3 PASS`.
- The active document loads 245 local JavaScript/CSS assets. Fifty-four are Consumer-related: 18 Consumer, 15 Consumer/Places Experience, 10 Control Center, 7 Consumer/Root Legacy, 2 Consumer/Legacy Modules, 1 Consumer/Control Center and 1 Experience/Control Center.
- Those active Consumer-related assets contain 569 `window`, 83 `document`, 1 `navigator`, 16 `localStorage`, 2 `sessionStorage`, 38 history/location, 11 Supabase/DB, 2 private Trip, 16 private Places, 2 private Media, 25 Journey/Timeline, 26 Experience, 22 inline-style and 95 inline-handler references. This is the measured Consumer estate, not the locked M11 mutation scope.
- `navigation.v1` already routes `today` to the inline `dashboard` mount. The App Shell renders an active-Trip hero followed by the Dashboard Widget Registry.
- The active `today` widget is the existing `LuviaTimelineCore` calendar. It is a Journey/Timeline compatibility projection and remains separately reserved.
- The retired `todayLegacy` widget contains older current/next/free-time composition. It is not reactivated or copied into a second state owner.
- `LuviaControlCenterTravelIdentity` and `LuviaControlCenterAttention` are read-only Consumer projections. The latter can aggregate Trip/Booking attention but owns no domain truth.
- `experience.v1`, the canonical M10 Overlay Host and the global Luvia AI Command Surface are available for a visible premium composition without adding a second design or assistant stack.

## Ownership classification

- Consumer owns Today layout, view-model composition, navigation affordances and attention presentation.
- Trip owns Trip truth; the Consumer reads the public Trip projection passed by the App Shell.
- Booking owns booking truth; Consumer receives only normalized attention items.
- Experience owns tokens, states, motion, accessibility semantics and native presentation mappings.
- Intelligence owns reasoning and the Command Surface response flow. M11 opens it but grants no execution authority.
- Journey/Timeline remains a separately reserved cross-domain aggregator. M11 embeds the existing read-only widget and does not absorb, move or reclassify it.
- Platform owns device/network lifecycle. The Web adapter reads online state only through `NetworkPort`.

## Locked mutation scope

1. Add a browserless `consumer.today-composition.v1` view-model core with deterministic phase, greeting, attention priority, safe navigation and provenance.
2. Add a Consumer Web adapter over public/read-only projections and `NetworkPort`, with explicit bind/unbind lifecycle.
3. Replace the legacy App Shell hero with a visible premium Today composition based on `experience.v1` while preserving the existing Dashboard Widget Registry.
4. Keep the Timeline/Journey widget physically and semantically separate behind an explicit read-only reservation marker.
5. Connect the existing Luvia AI Command Surface and safe navigation actions; do not add an autonomous mutation path.
6. Add browserless, ownership, load-order, offline-cache, accessibility, Journey-reservation and App Shell adoption guardrails to controlled Safe Regression.
7. Version, cache, document, preview, promote and measure the coherent runtime bundle.

## Explicit exclusions

- No Trip, Booking, Places, Media, Identity, Social, Intelligence or Journey domain truth.
- No private Store access, direct Supabase/DB/RPC access or foreign-domain command execution.
- No new autonomous booking, payment or external side effect. Those require the later Tool Registry, confirmation, owner-command, receipt and recovery milestones.
- No database/schema/RPC/RLS/bucket migration, Edge Function, secret, provider or manual Cloudflare configuration change.
- No removal of the existing Journey calendar or broad rewrite of the remaining Consumer estate.

## Rollback

The slice is code- and asset-only. Roll back to the synchronized M10.5 documentation marker `5067332492fca8a7df79bb6584c891c973550180`; no persisted data or infrastructure state requires compensation.
