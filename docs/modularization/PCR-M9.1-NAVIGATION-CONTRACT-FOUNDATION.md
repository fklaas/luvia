# PCR M9.1 — Navigation Contract Foundation

Status: COMPLETE / CLOSED / PRODUCTION VERIFIED

## Problem

The active Web App Shell receives route strings from DOM attributes and custom events, while the Platform Navigation Registry exposes only five top-level items. Deep Link handling has no runtime-neutral intent contract and `DeepLinkPort.open()` directly special-cases the Web App Shell. This prevents Web, iOS, Android and later Luvia Intelligence tools from sharing one controlled navigation meaning.

## Owner

Platform owns the public Navigation Contract, route registry, Deep Link intent semantics, Platform Port integration and entry load order. Consumer continues to own the concrete Web App Shell and screen composition.

## Contract

Additive `navigation.v1` / `LuviaNavigationContractV1`:

- normalized route IDs and aliases;
- immutable `screen.navigate` intents;
- sanitized scalar parameters;
- Deep Link parse/serialize helpers;
- declarative mount descriptors;
- browserless diagnostics.

The existing `LuviaNavigationRegistry.items()`, `get()` and `normalize()` surface remains backward-compatible.

## Affected streams and files

- Platform: new `core/runtime/navigation-contract-core.js`; update `app/navigation-registry.js`, `app/adapters/platform-port-adapters.mjs`, `index.html`, architecture/release evidence and focused tests.
- Consumer: no file mutation in M9.1; the existing App Shell continues to consume `LuviaNavigationRegistry` and `luvia:navigate-request`.
- Experience, Intelligence, Booking, Social: no runtime mutation.

## Backward compatibility

- five dock items and labels remain unchanged;
- existing aliases remain valid and are expanded additively;
- unknown route input still falls back to `today`;
- the active App Shell keeps its current `show(view)` behavior;
- `DeepLinkPort.open()` still returns the requested navigation result, now as a versioned intent and without a direct App Shell method call.

## DB / Functions / Secrets / Deployment impact

- database/schema/RPC/RLS/bucket: none;
- Edge Functions: none;
- secrets: none;
- manual Cloudflare configuration: none;
- runtime assets: yes, requiring App/Core version bump, Preview/Production proof and rollback evidence.

## Test plan

- browserless VM load with no browser/device/storage/history/network dependencies;
- full route/alias/mount inventory assertions;
- immutable intent and sanitized parameter assertions;
- query/hash/custom-scheme Deep Link assertions;
- Web adapter delegation and no duplicated route truth;
- DeepLinkPort intent dispatch and no direct `LuviaApp.show` call;
- index load-order assertion;
- NFR-0 and controlled Safe Regression;
- Integration/Production exact assets, authenticated F5, active-Trip, navigation and console acceptance.

## Rollout and rollback

No feature flag is required because the Web adapter preserves the public surface and the App Shell behavior. Rollback is the M8.5 runtime release commit; no data rollback is required.

## Measured closeout

- feature commit: `5248eccdbb2d8616a1b8248ec065bfc56bc41b7c`;
- runtime release: `8a538e395aadf361fe9c2d360e258ecad35de880`;
- runtime identity: App `13.82.26` / Core `4.82.26`;
- focused M9.1, NFR-0 `3/3` and controlled Safe Regression `50/50`: PASS on Platform, Integration and Main;
- Integration Preview version/build/check: `43c5bdbb-569a-417c-9d69-9428abd5b86e` / `99bf67e7-f36e-4d0c-93cc-6791b34d8baf` / `97191761126`, SUCCESS;
- Integration: `11/11` exact runtime assets, `5/5` private-path SPA fallback, `25/25` authenticated F5, active Trip, navigation, console `0/0`;
- Production version/deployment: `7e41749e-23ee-41e6-b67d-b0a3379c3969` / `a1310844-e263-4c96-903c-50eace9f39da`, 100%;
- Production: `11/11` exact runtime assets, `5/5` private-path SPA fallback, `25/25` authenticated F5, active Trip, Planen -> Places, ten categories, console `0/0`;
- Production build: `a855c3b3-cb97-478a-873a-aa6bb58be7dc`;
- GitHub check `97193079285`: still `in_progress` without error/conclusion at closeout. This reporting delay is retained verbatim and is not classified as success; Cloudflare version/deployment plus exact authenticated runtime proof independently establish the deployed state;
- database/functions/secrets/manual Cloudflare configuration: none;
- Journey/Timeline: reserved and unchanged.

M9.1 is complete. M9 remains in progress; M9.2 will address staged boot and explicit module mounting under separate owner authorization.
