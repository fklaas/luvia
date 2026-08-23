# PCR M9.5 – Owner Flow Navigation Convergence

Status: **RUNTIME RELEASED / PRODUCTION VERIFIED / REAL LOGOUT → LOGIN ACCEPTANCE OPEN**

Integration runtime candidate: **App 13.82.34 / Core 4.82.34**

Implementation chain: Platform `cefc35e21e7cebd14ac2215d0e32beca16dc6e80`, Consumer `9f47e953adde516d17c697a4daa7278487919e77`, Booking `e84a794ff92fcb10379d8718e558bb735c966bd3`.

## Measured baseline

M9.1–M9.4 established canonical screen intents, staged module mounting, one History owner and runtime signal coordination. The remaining M9 scope was not another App Shell router. It consisted of owner-specific transitions in Auth, Trip Join/Public Entry and Booking plus two byte-identical inactive legacy Shell copies.

The pre-mutation inventory proved:

- all eight streams synchronized at `1a21b4a3c01fa103c0c380272a84fe3d4c9a6b74`, divergence `0/0`, clean;
- active Shell: only `app/app-shell.js`, loaded by `index.html` and cached by `sw.js`;
- `luvia-app-shell.js` and `legacy/ui/luvia-app-shell.js`: byte-identical, not referenced by active `index.html`, Service Worker, imports or fetches;
- Auth login forced a full `location.replace`, although M9.4 already provides serialized session activation;
- Auth logout wrote Web History directly;
- Trip Join persisted pending input through direct `localStorage` and used direct History/Location reloads;
- Booking and Trip Invite opened device/browser surfaces directly;
- the formal Storage, Sharing, DeepLink and ExternalNavigation Ports already existed and remained the correct Web/native boundary.

Timeline/Journey is not part of this scope. No owner-specific domain truth moves into Platform or Consumer.

## Locked bundled scope

1. Add browserless `owner-flow-navigation.v1` effects for Auth, Join and Booking transitions.
2. Add one Web adapter that consumes the existing Platform Ports and delegates URL replacement to the established `LuviaNavigationHistoryV1` owner.
3. Make password login reload-free and let M9.4 Runtime Signals perform session activation.
4. Move pending Join storage to `StoragePort`; preserve the Join query through login; remove direct reload/history actions.
5. Move Trip Invite sharing and external communication to Sharing/ExternalNavigation Ports.
6. Adopt the same external navigation boundary in Consumer Booking and Booking Core.
7. Delete only the two proven unreachable byte-identical legacy Shell JavaScript copies. Historical CSS and the separately classified v11 archive remain untouched.
8. Add owner-specific focused guards and then perform the normal Integration/Preview/Main/Production/8-stream gates.

## Explicit exclusions

- no database, schema, RPC, RLS or bucket mutation;
- no Edge Function or secret change;
- no Booking, Trip, Identity or Journey truth reassignment;
- no deletion of `core/app/app-shell-v11.js` or the archived `legacy/ui/index-v11.0.0.html`;
- no broad cleanup of unrelated PWA, profile or historical URL debt;
- no direct AI, Timeline/Journey or payment mutation.

## Platform foundation

The Platform foundation introduces a browserless immutable policy with no DOM, browser global, Supabase access or Domain Truth. `app/adapters/owner-flow-navigation-web-adapter.js` is the only new Web binding. It uses the existing Navigation History adapter for URL replacement and the existing Platform Port registry for external navigation.

Auth password login no longer reloads the document. Auth logout clears navigation through the owner-flow boundary. Join URLs preserve unrelated parameters, remove `join`/`invite` only when requested and retain the completion screen until the traveler explicitly opens the joined trip.

The deleted `luvia-app-shell.js` and `legacy/ui/luvia-app-shell.js` had identical SHA-256 `4651AC3D4E921E5CA18AE4B03B6AFB6C72F28723D6CE8D55DFFC99B36B3ABC7E` and zero active reachability.

## Consumer adoption

Public Entry now opens an invitation through `owner-flow-navigation.v1` without assigning a new document URL. The active App Shell listens only for Join-owned flow effects and renders the appropriate signed-out, Join or authenticated surface without becoming the owner of Auth or Booking policy. Consumer Booking external routes use the same validated external boundary and contain no direct `window.open` call.

## Booking adoption

Booking Core still resolves, validates and attributes the provider route. It now reserves the user-gesture handoff surface and opens the validated provider URL through `ExternalNavigationPort`; the port reports popup blocking instead of fabricating success. Booking engine detection receives its default base from the owner-flow/environment boundary and no longer reads `location.href` directly. No Booking persistence, provider, status or reconciliation rule changed.

## Measured release evidence

- Integration runtime candidate: App/Core **13.82.34 / 4.82.34**, commit `2cfa11a75cab0cf28d77d578006c0fc025f0f996`;
- Integration version: `563a84f3-c30b-483d-9d87-1bc9f0cb4ff4`;
- Production runtime: App/Core **13.82.35 / 4.82.35**, commit `7773087ede7c72d39bdd235269cd0fc7c2a9d90e`;
- Production version: `56d56a8b-5b1d-46af-bcd2-3cf0fb3e4479`;
- focused Platform / Consumer / Booking guards: **3/3 PASS**;
- NFR-0: **3/3 PASS**;
- Safe Regression: **56/56 PASS**;
- Preview: **23/23 exact**, **5/5 privacy**, removed legacy assets **2/2 SPA fallback**, authenticated Runtime/Owner-Flow diagnostics, same-document invalid-Join cleanup, **25/25 authenticated F5** at **2.231–4.060 seconds**, console **0/0**;
- Production: **23/23 exact**, **5/5 privacy**, removed legacy assets **2/2 SPA fallback**, authenticated Runtime/Owner-Flow diagnostics, same-document invalid-Join cleanup, **25/25 authenticated F5** at **2.291–5.389 seconds**, console **0/0**.

The first immediate Production sample observed four HTML assets from different edge generations while the new version activated. Read-only follow-up proved identical version markers, LF form and full Git-blob equality; only then did the complete second gate pass 23/23. The mixed sample remains classified as a failed sample, not rewritten as success.

## Remaining M9 exit gate

The active Preview and Production sessions were deliberately not destroyed without an authorized credential source for restoration. Consequently, actual logout → credentialed login → active-Trip/runtime acceptance remains open. Static policy tests, authenticated cold starts and Join-flow runtime acceptance are PASS, but they are not mislabeled as a real credential cycle.

M9.5 is runtime-released and Production-verified. M9 remains **IN PROGRESS** until that single environment gate is measured. Timeline/Journey remains separately reserved and is not an ordinary Places, Trip or App-Shell consumer.

No DB/schema/RPC/RLS/bucket migration, Edge Function change, secret change, manual Cloudflare configuration change or Domain Truth reassignment occurred.
