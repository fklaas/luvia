# PCR M9.3 — History, Back and Deep-Link Policy

Status: APPROVED FOR IMPLEMENTATION

Owner streams: `feature/platform-core` for browserless policy/Web adapter and `feature/consumer-experience` for App Shell adoption.

## Problem

M9.1 established one browserless `screen.navigate` route truth and M9.2 established staged runtime plus explicit module mounting. The active App Shell still has no History/Back owner: among 204 local scripts loaded by `index.html`, the measured baseline contains zero `popstate` handlers, two direct History writes, ten direct Location writes, five `window.open` calls and four `luvia:navigate-request` paths. The active App Shell changes screens without projecting them into browser history, so Back/Forward and cold Deep Links do not share one deterministic policy.

## Owner and boundary

- Platform owns a browserless `navigation-history.v1` policy, Web History adapter, URL projection and Back/Forward bridge.
- Consumer owns `app/app-shell.js`, concrete screen composition, successful-route commit and visible Back interactions.
- `navigation.v1` remains the only route/intent truth. History is a projection, not a second route registry.
- Domain cores own no screen-history state. Intelligence may request an authorized `screen.navigate` intent only.
- `core/places/timeline-core.js` remains the reserved Journey/Timeline aggregator and is not part of this PCR.

## Impacted contracts and files

- New additive browserless contract: `core/runtime/navigation-history-policy-core.js` (`navigation-history.v1`).
- New Web adapter: `app/adapters/navigation-history-web-adapter.js`.
- Entry/load order: `index.html`.
- Consumer adoption: `app/app-shell.js` in a separate Consumer-owned commit.
- Focused guard: `tests/m9.3-navigation-history-policy-foundation.test.cjs` and Safe Regression registration.
- NFR guard precision: the Web History token now matches concrete History API members instead of semantic domain labels such as booking or navigation history; the historical debt JSON remains unchanged.
- Documentation/ownership: M9 baseline, file ownership and release evidence.

## Backward compatibility

- Existing `LuviaNavigationContractV1`, `LuviaNavigationRegistry`, `DeepLinkPort` and `luvia:navigate-request` remain supported.
- Existing direct callers of `LuviaApp.show()` continue to work; successful screen changes now receive the same History projection.
- Root URLs without an explicit recognized route do not override the profile/default screen.
- Unknown URL routes fail closed to no Deep-Link match rather than creating a new route.
- Legacy `luvia-app-shell.js` hash routing remains unmodified and inactive; it is not used as the new policy.

## DB, Function and infrastructure impact

- Database/schema/RPC/RLS/bucket migration: none.
- Edge Function change: none.
- Secret change: none.
- Manual Cloudflare configuration change: none.

## Test plan

1. Browserless policy test: explicit URL matching, default-root non-match, idempotent replace, push, restore, back and forward commands.
2. Static ownership/load-order test: core contains no Browser/DOM/Domain globals; Web adapter is the only new History API owner.
3. Consumer adoption test: initial Deep Link, successful route commit, event intent preservation, no push on restore, ExternalNavigationPort use.
4. NFR-0 3/3 and controlled Safe Regression.
5. Integration Preview: byte provenance/privacy plus authenticated cold start, direct Deep Link, Back/Forward, reload and 25/25 F5.
6. Main/Production only after Preview gates remain green.

## Rollout and rollback

The additive scripts are released through Platform -> Consumer -> Integration -> Preview -> Main -> Production. Rollback is code-only to the M9.2 Runtime Release `740f127041cb275cf8a5716965bf9c20d4158d04`; no data rollback is required.
