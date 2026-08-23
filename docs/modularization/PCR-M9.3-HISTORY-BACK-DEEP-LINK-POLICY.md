# PCR M9.3 — History, Back and Deep-Link Policy

Status: COMPLETE / CLOSED / PRODUCTION VERIFIED

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

## Measured closeout

- Platform foundation: `965c231263d0554105e0bf8364dad1ab1323eb28`;
- Consumer adoption: `9a9108f4c3ff85a4d06e24fadeaf8c795ad4d432`;
- final runtime release: `6648f41c6f831645dc79c6cd5463fe8cc945765e`;
- App/Core: `13.82.30 / 4.82.30`;
- focused M9.3, NFR-0 `3/3`, controlled Safe Regression `52/52`: PASS;
- Integration Preview version `2fd3416e-703a-4bc6-9172-3cc86f4b9714`: `11/11` exact assets, `5/5` privacy, authenticated Places Deep Link, ten categories, Back/Forward restore, `25/25` F5, active Trip retained, console `0`;
- Production version/deployment `5c966e7f-1685-4976-9af1-d94871869954` / `32291cf2-f7c4-4ec7-bd11-f88d46520b77`: 100%, with the same exact/private/authenticated contract gates and `25/25` F5 at 3.1–5.1 seconds, console `0`;
- Main promotion: fast-forward only;
- DB/schema/RPC/RLS/bucket, Edge Functions, secrets and manual Cloudflare configuration: unchanged;
- Timeline/Journey: separately reserved and unchanged.

The initial Preview observer used a 15-second wait and timed out once. Read-only inspection proved that the same reload subsequently reached the correct `plan` state, release identity and active Trip with no console entry. The remaining observations used a 30-second window aligned with the runtime’s bounded stage contract; this harness incident is retained explicitly.

M9.3 is **COMPLETE / CLOSED / PRODUCTION VERIFIED**. Existing direct History/Location flows in Auth, Join and Booking keep their measured owners and are not reclassified by this closeout.
