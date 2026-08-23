# M10 — DOM, Modal & Global Handlers Baseline / Scope Lock

Date: 2026-08-23

Starting marker: `febb908e664c7ee47d3c07865c2ee27751076a86`

Owner worktree: `feature/platform-core`

## Normative objective

M10 consolidates global `addEventListener` and `window.*` bridges by owner, establishes an explicit Shared/Experience boundary for Modal and Sheet hosting, separates platform-neutral interaction semantics from Web rendering, and hardens layering, fixed navigation, keyboard, viewport, safe-area and Back behavior. Legacy handlers may be deleted only after reachability proof. M10.5 Experience Core and visual-system recomposition remain a separate milestone.

## Measured active runtime

The active `index.html` referenced 210 local JavaScript assets and 29 external local stylesheets at the starting marker; no referenced JavaScript asset was missing.

Lexical inventory across the active scripts:

- 128 `window.addEventListener` registrations.
- 17 `document.addEventListener` registrations.
- 17 matching `removeEventListener` occurrences.
- 277 direct inline handler assignments such as `.onclick =`.
- 199 `window.Luvia* =` compatibility bindings.
- 37 document-query occurrences and 57 `document.createElement` occurrences.
- 15 dialog tokens, 12 keyboard tokens, 6 viewport tokens and 16 Back/History tokens.
- 135 literal global event registrations could be classified by target and event name; the most duplicated custom event was `luvia:place-collection-changed` in eight active files.

The highest active z-index values were `2147483647` in Places and Booking UI, `2147483646` in Guided Discovery, `2147483600` in Restaurants, `2147483000` in App Shell and Restaurants, then disconnected layers at `1000002`, `100000`, `99999`, `60000`, `50000`, `20050`, `10000` and lower. This proves that layering was being solved locally rather than through one declared host hierarchy.

## Existing canonical seed

`core/ui/ui-manager.js` already provided the only intended shared registry and overlay API. At baseline it owned an in-memory stack, backdrop close, Escape close, initial focus and a Web compatibility binding named `LuviaUI`.

Measured adoption was incomplete:

- Trip Experience registered dialog names in `LuviaUI`, but still constructed and dismissed its own DOM overlay.
- `LuviaUI.mount()` had no active consumer.
- Places Experience, Trip Join, Booking UI, AI proposal/transparency, Profile, Albums, Gallery and Memory Worlds built independent overlay roots.
- Escape listeners, body/root scroll locks, focus behavior, safe-area handling and z-index choices were repeated or missing.

Creating a second host is therefore forbidden. M10 evolves this seed through a browserless contract and explicit Web compatibility adapter.

## Owner classification

| Surface | Current owner | M10 classification |
| --- | --- | --- |
| `core/ui/ui-manager.js` | Platform / Shared UI | Canonical Web DOM compatibility host; harden in place |
| `core/trips/trip-experience.js` | Trip | Active owner flow; first host adopter |
| `core/trips/join-flow.js` | Trip | Active owner flow; first host adopter |
| `core/places/place-experience-shell.js` | Places | Active owner flow; first host adopter |
| `app/albums-view.js`, `app/gallery-view.js`, `app/memory-worlds-v3.js` | Consumer / Experience | Later Consumer-owned adoption block |
| `core/booking/booking-ui.js`, Booking Control Center sheets | Booking | Later Booking-owned adoption block |
| AI proposal and dashboard overlays | Intelligence / Planning | Later Intelligence-owned adoption block |
| Profile Foundation overlay | Identity / Preferences | Later owner-classified adoption block |
| `core/places/timeline-core.js` | Reserved Journey / Timeline | Excluded; dedicated architecture audit required |

## M10.1 mutation scope

The first bundled scope is locked to:

1. Browserless `overlay-host.v1` stack, top-of-stack and dismissal policy without DOM, browser globals or Domain Truth.
2. In-place hardening of the existing Web host with one global keyboard listener, focus containment, modal ARIA semantics, inert background management, deterministic layering, safe areas, reduced-motion behavior, scroll lock, session/navigation cleanup and an adapter-neutral Back command.
3. Adoption by Trip Experience, Trip Join Code Entry and Places Experience while preserving their owner content, commands and compatibility close events.
4. Focused browserless/static regression plus Safe Regression inclusion, load-order and Service Worker cache proof.

Excluded from M10.1:

- Visual redesign, new design tokens or M10.5 Experience work.
- Booking, Consumer, Profile or Intelligence-owned runtime mutations.
- Browser History writes; the Overlay Host must not become a second History owner.
- Journey / Timeline migration or reclassification.
- Database, RPC, schema, RLS, bucket, Edge Function, secret or deployment-configuration changes.

## Native First Ready interpretation

`overlay-host.v1` contains stack and dismissal semantics only. Web DOM, focus APIs, `inert`, CSS safe areas and compatibility globals stay in the Web host. A future iOS or Android client can bind the same semantic entries to native sheets/dialogs and route its native Back command through `handleBack` without importing Web DOM code.
