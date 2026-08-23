# Release Notes — M10 Final: Overlay Host and Interaction Boundary

Date: 2026-08-23

Status: **COMPLETE / CLOSED / PRODUCTION VERIFIED**

Runtime App / Core: **13.82.40 / 4.82.40**

Technical closeout: `c879d63de29ca7864a23ece2452702faf0c04362`

Integration runtime: `f42a1bad295475314095d8f5b01ce6e3b25d4a0f`

Production runtime: `1110ad8d9b63d6c970f37bc05cb6f5db1791f16e`

## Shipped

- Browserless `overlay-host.v1` stack and dismissal policy.
- One Web DOM host for stacking, focus containment/restoration, Escape and Back handling, background inertness, safe-area presentation, scroll locking, and navigation/session cleanup.
- Host adoption across Trip Experience/Join, Places Experience, Intelligence, Albums, Gallery, Memory Worlds, Consumer flows, Booking sheets, Identity/Profile, Guided Discovery, Trip Creator, Module Manager, Places planning/detail/photo/Restaurants, and separately classified Journey/Timeline surfaces.
- Final guard over all 211 active local scripts, all body append sites and the single global keydown owner.
- Runtime-neutral contract usable by future native iOS and Android presentation adapters without moving Domain Truth.

## Acceptance

- Safe Regression: **66/66 PASS**.
- NFR-0: **3/3 PASS**.
- Integration Preview `ec418361-2592-428c-bbd0-a9658a2d3e3f`: **24/24 byte-exact**, **5/5 privacy**, **25/25 authenticated F5**, nested overlay acceptance, console **0/0**.
- Production version `860f485b-3321-4348-93a9-69145cd87562`, deployment `077c28b5-4f7e-4da8-aa11-b3c91b69d091`: **100%**, **24/24 byte-exact**, **5/5 privacy**, **25/25 authenticated F5**, 3.213–5.943 seconds, average 3.564 seconds, console **0/0**.

## Boundaries retained

- No Domain Truth moved into Platform, Consumer or Experience.
- Timeline/Journey remains a separately reserved cross-domain aggregator and physical Core extraction candidate.
- Web History remains Navigation-owned.
- Remaining inline handlers, global listeners and `window.Luvia*` bindings stay explicitly measured owner-specific modernization debt; they are not private modal stacks.
- M10.5 Experience Core and visual recomposition were not pulled into M10.

## Infrastructure and rollback

No database/schema/RPC/RLS/bucket migration, Edge Function change, secret change or manual Cloudflare configuration change occurred. Rollback is code-only to synchronized M9 marker `febb908e664c7ee47d3c07865c2ee27751076a86`; canonical data rollback is not required.

The first local Production archive used CRLF checkout bytes, failed raw equality 0/24 and was never uploaded. The deployed LF-clean package passed 24/24 local and live Git-blob equality. Final Production causation is claimed only for the explicit version/deployment pair above.
