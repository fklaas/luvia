# M9 — App Shell I: Runtime & Navigation Baseline / Scope Lock

Status: **M9.1–M9.6 COMPLETE / CLOSED / PRODUCTION VERIFIED; M9 COMPLETE**

Source marker: `052873bd70eb2f5cc6913beacd96b0c0bedf3484`

Source release: App `13.82.25` / Core `4.82.25`

Owner stream: `feature/platform-core`

## Measured starting point

- All eight streams were Local = Tracking = Live on the source marker, divergence `0/0`, working trees clean.
- `app/app-shell.js` is Consumer-owned and combines rendering, auth reactions, active-Trip reactions, navigation dispatch and explicit per-screen mounting.
- `core/runtime/boot-coordinator.js` is Platform-owned Web runtime infrastructure and currently combines splash phases, cloud profile/Trip hydration, active-Trip selection and Journey/Places hydration.
- `app/navigation-registry.js` is Platform-owned but was a Web-global five-item registry. It did not define the full set of fifteen active App Shell screens, a stable intent envelope, Deep Link parsing or mount descriptors.
- The active App Shell handles fifteen screen identifiers and performs ten explicit module mounts/inline mount paths.
- The measured non-legacy JavaScript/HTML estate contains 17 `data-view` occurrences, 3 `luvia:navigate-request` occurrences, 10 History/hash-routing occurrences, 31 direct location writes, 7 `window.open` calls, 23 DOM-ready hooks and 11 `.mount(...)` call sites. These counts are inventory, not a claim that all hits belong to the active App Shell.
- `app/adapters/platform-port-adapters.mjs` already exposes `DeepLinkPort`, `LifecyclePort`, `NetworkPort` and `ExternalNavigationPort`. The starting `DeepLinkPort.open()` special-cased Places by directly calling `LuviaApp.show('places')`.
- `luvia-app-shell.js` contains older hash-module navigation but is not loaded by the active `index.html`; it remains classified legacy until reference/runtime proof authorizes removal.
- `core/places/timeline-core.js` remains the reserved Journey/Timeline cross-domain aggregator and is outside M9 ownership.

## Ownership lock

- Platform owns the runtime-neutral Navigation Contract, route/deep-link intent semantics, Platform Ports, shared runtime and entry wiring.
- Consumer owns `app/app-shell.js`, screen composition and concrete Web mounting/rendering.
- Domain cores own no App Shell navigation truth.
- Experience owns later shared navigation interaction semantics and presentation, not routes or Domain Truth.
- Intelligence may request an authorized Navigation Intent but does not own screen state, browser history or Domain Truth.

## M9.1 mutation scope

The first mutation is an additive Navigation Contract Foundation:

1. add a browserless `navigation.v1` core with one route registry, aliases, screen intents, Deep Link parsing/serialization and declarative mount descriptors;
2. keep `LuviaNavigationRegistry` backward-compatible through a Platform-owned Web adapter;
3. expose `LuviaNavigationContractV1` as the current Web compatibility binding;
4. change `DeepLinkPort` from a direct App Shell call to `screen.navigate` intent dispatch;
5. load the browserless core before the Web adapter and existing Consumer App Shell;
6. add a focused browserless/contract/adapter/load-order regression.

## Explicitly out of scope

- no change to `app/app-shell.js` in the Platform slice;
- no staged Boot rewrite yet;
- no History API or URL policy activation in the App Shell yet;
- no visual redesign;
- no Journey/Timeline reclassification;
- no Domain Core, DB, RPC, Edge Function, Secret, RLS or Cloudflare configuration change;
- no deletion of legacy shell/navigation files.

## Native First Ready target

Web, iOS and Android will be able to map the same `screen.navigate` intent and route semantics to their own renderers. The Core contains no `window`, DOM, `navigator`, browser storage, History API, location access, network or provider SDK. Browser events and URL access remain in Web adapters/ports.

## Subsequent M9 blocks

1. explicit App Runtime stage contract and Boot-stage diagnostics — **M9.2 COMPLETE**;
2. Consumer adoption of Navigation Contract mount descriptors — **M9.2 COMPLETE**;
3. History/Back/Deep-Link policy through Web adapter and native equivalents — **M9.3 COMPLETE**;
4. auth/session events separated from render orchestration — **M9.4 COMPLETE**;
5. Lifecycle/Network state fed through existing Platform Ports — **M9.4 COMPLETE**;
6. cold-start, reload, deep-link, back and resume acceptance complete; real login/logout environment acceptance remains;
7. runtime release, production proof and eight-stream closeout.

## M9.3 measured baseline and scope lock

The current `index.html` loads 204 local scripts. Across that active load set the read-only M9.3 inventory measured:

- direct History API writes: 2, in `auth/session.js` and `core/trips/join-flow.js`;
- `popstate` handlers: 0;
- `hashchange` handlers: 0;
- direct Location writes/reloads: 10 across Auth UI, PWA, Booking, Trip Join/Invite and Public Entry owners;
- direct `window.open` calls: 5 across Booking, Trip, Bookings View and the active App Shell route helper;
- `luvia:navigate-request` paths: 4 across DeepLinkPort, Timeline/Journey, Booking UI and App Shell;
- direct active `LuviaApp.show(...)` callers outside the App Shell: 1 in Albums View.

Classification:

- The missing shell-level History/Back projection is the M9.3 mutation scope.
- The two existing direct History writers and owner-specific Auth/Join/Booking URL flows are recorded debt with their existing owners; this PCR does not silently absorb those domain/application flows into the App Shell.
- The active App Shell's direct Maps `window.open` is migrated to the existing `ExternalNavigationPort` during Consumer adoption.
- Both inactive legacy shell copies retain hash-module History code and remain outside mutation scope until a later reference/runtime deletion proof.
- `navigation.v1` remains canonical. The new History contract may project or restore Navigation Intents but may not define routes or Domain Truth.

M9.3 implementation sequence:

1. browserless `navigation-history.v1` policy and Web adapter in Platform;
2. Consumer-owned App Shell adoption with successful-route commits and Popstate restores;
3. focused/NFR/Safe Regression;
4. integration Preview Deep-Link/Back/Forward/Reload/F5 acceptance before Main.

M9.3 closeout: Platform foundation `965c231263d0554105e0bf8364dad1ab1323eb28`, Consumer adoption `9a9108f4c3ff85a4d06e24fadeaf8c795ad4d432`, runtime release `6648f41c6f831645dc79c6cd5463fe8cc945765e`, App/Core `13.82.30 / 4.82.30`, NFR-0 `3/3`, Safe Regression `52/52`, Preview and Production each `11/11` byte exact, `5/5` privacy, authenticated Deep-Link/Back/Forward, `25/25` F5, active Trip retained and clean console. Timeline/Journey and the separately owned Auth/Join/Booking URL flows remain outside this completed slice.

## M9.4 measured baseline and scope lock

The active App Shell has one direct `authApi.onChange(...)` render-orchestration callback and no LifecyclePort or NetworkPort subscription. Productive Web `AuthSessionPort`, `LifecyclePort` and `NetworkPort` implementations already exist, so a second browser/device source is neither required nor permitted.

M9.4 bundles the two inseparable remaining Runtime concerns: Platform normalizes Auth/Lifecycle/Network transitions into browserless, idempotent Runtime Actions; Consumer serializes those actions into session activation/deactivation, eligible foreground resume and visible offline/reconnect status. The policy stores no token/session and owns no Domain Truth. Background intervals below 15 seconds do not remount the current module; eligible resume preserves the current Navigation Intent and writes no History entry.

Collaboration, Media upload, Location and Travel Context retain their existing domain-specific transition reactions. Auth, Join and Booking URL owners, inactive legacy shells and Timeline/Journey remain outside the M9.4 mutation scope.

M9.4 closeout: Platform `c9377153ff8e6a95e592293745640c2ff058b31b`, Consumer `e9dd548e0e8a4841ead1f6d956612eff51f1e4e1`, final runtime `236f32c1072d6e0e5d5ef8978d906289db7156cc`, App/Core `13.82.33 / 4.82.33`, NFR-0 `3/3`, Safe Regression `53/53`, final Preview and Production each `12/12` exact, `5/5` privacy, authenticated Offline/Reconnect/Resume with unchanged History, `25/25` F5, active Trip/View retained and console `0`. Two rejected release-identity candidates remain recorded; neither is rewritten as the final release.

## M9 final closeout

M9.5 converged Auth, Join and Booking owner flows on browserless policy plus Platform Ports, removed password-login reloads and two unreachable legacy Shell copies, and released App/Core 13.82.35/4.82.35. M9.6 then used the authorized real credential cycle to expose and repair two final lifecycle defects: Profile Foundation was not closed on session deactivation, and Control Center Attention could issue a Booking projection read during logout.

The App Shell now closes the authenticated owner surface before unmount/hydration. Control Center Attention consumes `AuthSessionPort`, clears and pauses its read-only projection on public logout/session deactivation, rejects stale async completions and resumes only after canonical activation plus hydrated Travel Identity. No Auth, Booking or Trip truth moved into Consumer.

Final runtime: Production App/Core **13.82.38 / 4.82.38**, commit `3bca0bab3467c38c9207e01d75ad07926d977b51`, Cloudflare version/deployment `1905015c-cf29-46b8-8f9a-402e8fdb3a75` / `27b46a4c-4e43-4835-9d9e-ed83029e6f16`. Safe Regression is **57/57**, NFR-0 **3/3**, Preview and Production are each **24/24 exact**, **5/5 privacy**, **2/2 removed-shell fallback**, and the real logout/login cycle restores Today plus the active Paris Trip in the same document with History delta 0 and CDP warnings/errors/exceptions 0.

Timeline/Journey remains a separately reserved cross-domain aggregator. M9 is **COMPLETE / CLOSED / PRODUCTION VERIFIED**; M10 requires a fresh measured baseline rather than extending M9 ownership by assumption.
