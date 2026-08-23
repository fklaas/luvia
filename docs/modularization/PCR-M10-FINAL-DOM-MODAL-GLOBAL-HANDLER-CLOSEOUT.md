# PCR — M10 Final: DOM, Modal & Global Handler Closeout

Date: 2026-08-23

Owner stream: `feature/platform-core`

Starting marker: `febb908e664c7ee47d3c07865c2ee27751076a86`

Technical closeout commit: `c879d63de29ca7864a23ece2452702faf0c04362`

Integration runtime release: `f42a1bad295475314095d8f5b01ce6e3b25d4a0f`

Production runtime release: `1110ad8d9b63d6c970f37bc05cb6f5db1791f16e`

Runtime App / Core: **13.82.40 / 4.82.40**

## Outcome

M10 has one browserless overlay policy and one explicit Web DOM compatibility host. All measured, actively reachable modal and sheet lifecycles in the current `index.html` runtime delegate global stacking, focus containment, Escape/Back, background inertness, safe-area presentation, scroll locking and session/navigation cleanup to `overlay-host.v1` / `core/ui/ui-manager.js`.

Domain and product owners still own their content and commands. No Trip, Places, Booking, Media, Identity, Intelligence or Journey truth moved into Platform or Experience.

M10.5 remains separately reserved for the Experience Core, Design System and visual recomposition. M10 Final does not claim that later milestone.

## Delivered blocks

- M10.1: browserless `overlay-host.v1`, hardened Web host, Trip Experience, Trip Join and Places Experience adoption.
- M10.2: Intelligence command proposal, Ask Luvia and transparency surfaces.
- M10.3: safe legacy-root adoption for Albums, Gallery and Memory Worlds.
- M10.4: Consumer-owned remaining overlay surfaces.
- M10.4B: Booking request and Control Center sheets.
- M10.4C: Identity Profile, Guided Discovery, Trip Creator and Module Manager.
- M10.4D: Places planning, canonical Place photo detail and Restaurant workspace.
- M10.4E: separately classified Journey/Timeline day, photo-memory and planning-editor surfaces.

## Final active-runtime measurement

The current `index.html` loads 211 unique local JavaScript assets and no referenced local JavaScript asset is missing.

The final guard records the following explicitly defined lexical inventory across those assets:

- 131 `window.addEventListener` registrations.
- 15 `document.addEventListener` registrations.
- 32 matching listener removals.
- 298 direct inline handler assignments.
- 199 `window.Luvia* =` Web compatibility bindings.
- 23 document-query calls and 59 `document.createElement` calls.
- Six `document.body.append/appendChild` sites.
- Exactly one global `keydown` owner: `core/ui/ui-manager.js`.

The six remaining body append sites are classified and locked:

1. `core/ui/ui-manager.js`: the canonical Web Overlay Host mount.
2. `app/gallery-view.js`: temporary download anchor.
3. `app/memory-export-engine.js`: temporary download anchor.
4. `app/app-shell.js`: transient toast fallback.
5. `core/places/places-final-foundation.js`: transient toast fallback.
6. `modules/restaurants-v2/restaurant-module.js`: obsolete gallery binder whose selector is not emitted by active Restaurant markup; the active canonical photo surface already uses the host.

There is therefore no measured actively reachable private modal stack left in the current runtime. The high remaining event-listener and compatibility-binding counts are not misreported as modal debt: they include owner-specific input events, domain event projections and temporary Web contract bindings. Their later contract migrations require owner-specific scopes, not a destructive global rewrite.

## Native First Ready proof

- `core/runtime/overlay-host-contract-core.js` contains stack and dismissal policy without `window`, `document`, storage, navigation or Domain Truth.
- The DOM, focus, inert, safe-area and Web event behavior remains in `core/ui/ui-manager.js` as `web-dom-compatibility`.
- Native iOS/Android clients can consume the same `overlay-host.v1` entries and bind them to native sheets/dialogs.
- Web History remains owned by Navigation History; the Overlay Host contains no `pushState`, `replaceState` or `history.back` ownership.
- Journey/Timeline remains a separately reserved cross-domain aggregator and a future physical Core extraction candidate.

## Regression and acceptance

- Focused M10 Final guard: PASS.
- NFR-0: 3/3 PASS as part of the controlled run.
- Controlled Safe Regression: 66/66 PASS on the Platform closeout candidate.
- Browser edge lifecycle: M10.4C, M10.4D, M10.4E and final release acceptance passed with final overlay depth zero and console zero.

## Integration Preview acceptance

- Final version: `ec418361-2592-428c-bbd0-a9658a2d3e3f` (Cloudflare deployment number 676, alias `integration`).
- Runtime assets: **24/24 byte-exact** against `f42a1bad295475314095d8f5b01ce6e3b25d4a0f`.
- Private-path classification: **5/5** confirmed SPA fallback; HTTP 200 alone was not treated as private asset exposure.
- Authenticated F5: **25/25 PASS**, 3.093–6.755 seconds, average 4.770 seconds, final overlay depth zero.
- Product acceptance: active Paris Trip retained; Intelligence Ask, Identity Profile, Journey day/editor, Places result/detail/photo and Restaurants category surfaces exercised.
- Nested Journey stack: day/editor depth two with correct underlay, top entry and hidden-state semantics.
- Browser console: **0 warnings / 0 errors**.
- The first `/index.html` comparison was rejected as a misclassified sample because the endpoint correctly returned a 307 canonical redirect. The canonical `/` comparison then passed 24/24.

## Production acceptance

- Final version: `860f485b-3321-4348-93a9-69145cd87562`.
- Final 100% deployment: `077c28b5-4f7e-4da8-aa11-b3c91b69d091`.
- Runtime assets: **24/24 byte-exact** against `1110ad8d9b63d6c970f37bc05cb6f5db1791f16e`.
- Private-path classification: **5/5** confirmed SPA fallback.
- Authenticated F5: **25/25 PASS**, 3.213–5.943 seconds, average 3.564 seconds, final overlay depth zero.
- Product acceptance: Intelligence Ask and a nested Journey day/editor stack were opened and closed with correct host diagnostics; active Paris Trip and release identity remained stable.
- Browser console: **0 warnings / 0 errors**.
- The first local Production archive used checkout CRLF conversion and failed raw blob equality **0/24**. It was never uploaded. The accepted LF archive was independently verified **24/24** before upload.
- Cloudflare automation briefly placed version `de5d8245-c892-4bd0-baaa-ef53e550fa43` at 100%. Final deployment causation is claimed only for explicitly uploaded version `860f485b-3321-4348-93a9-69145cd87562` in deployment `077c28b5-4f7e-4da8-aa11-b3c91b69d091`.

## Explicitly unchanged

- No database, schema, RPC, RLS, bucket or migration change.
- No Supabase Edge Function change.
- No secret change.
- No manual Cloudflare configuration change.
- No foreign Domain Truth move.
- No Timeline/Journey ownership reclassification.
- No M10.5 Experience redesign.

Rollback is code-only to synchronized M9 marker `febb908e664c7ee47d3c07865c2ee27751076a86`; no canonical Domain data rollback is required.

M10 is **COMPLETE / CLOSED / PRODUCTION VERIFIED**. M10.5 Experience Core remains the next separately scope-locked milestone.
