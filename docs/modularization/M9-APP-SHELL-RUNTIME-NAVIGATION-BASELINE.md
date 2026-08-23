# M9 — App Shell I: Runtime & Navigation Baseline / Scope Lock

Status: READ-ONLY BASELINE COMPLETE; M9.1 MUTATION SCOPE LOCKED

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

1. explicit App Runtime stage contract and Boot-stage diagnostics;
2. Consumer adoption of Navigation Contract mount descriptors;
3. History/Back/Deep-Link policy through Web adapter and native equivalents;
4. auth/session events separated from render orchestration;
5. Lifecycle/Network state fed through existing Platform Ports;
6. cold-start, reload, login, logout, deep-link, back and resume acceptance;
7. runtime release, production proof and eight-stream closeout.
