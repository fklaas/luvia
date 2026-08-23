# Release Notes — M9.3 History, Back and Deep-Link Policy

Date: 2026-08-23
Status: COMPLETE / CLOSED / PRODUCTION VERIFIED

## Release identity

- App / Core: `13.82.30 / 4.82.30`
- Platform foundation: `965c231263d0554105e0bf8364dad1ab1323eb28`
- Consumer adoption: `9a9108f4c3ff85a4d06e24fadeaf8c795ad4d432`
- Final runtime release: `6648f41c6f831645dc79c6cd5463fe8cc945765e`
- Previous synchronized marker: `1cddc1835ba2c1364151cc7ac70646d1ae561f37`

## Architectural and visible result

M9.3 introduces the browserless `navigation-history.v1` policy and its single Web adapter. `navigation.v1` remains the sole route and intent truth. Browser History is now an idempotent Platform projection with explicit push, replace, restore, Back and Forward semantics; future native clients can map the same screen intents to their own navigation stacks.

The Consumer App Shell honors explicit recognized Deep Links during authenticated cold start, preserves sanitized route parameters, and commits History only after a successful module mount. Popstate restores an existing intent without pushing another entry. External Google Maps navigation moved from direct `window.open` to `ExternalNavigationPort`.

Existing Auth, Trip Join and Booking URL flows retain their measured owners. Timeline/Journey remains a separately reserved cross-domain aggregator. No Domain Truth moved into Platform, Consumer or History.

## Quality and deployment evidence

- Focused M9.3 regression: PASS;
- NFR-0: `3/3 PASS`;
- Safe Regression: `52/52 PASS` on Platform, Consumer, Integration and Main;
- Integration Preview `2fd3416e-703a-4bc6-9172-3cc86f4b9714`: `11/11` byte-exact assets, `5/5` privacy, authenticated direct Places Deep Link, ten categories, Back/Forward restore, `25/25` F5, active Trip retained, console `0`;
- Production version `5c966e7f-1685-4976-9af1-d94871869954`, deployment `32291cf2-f7c4-4ec7-bd11-f88d46520b77`: 100%;
- `myluvia.app`: `11/11` byte-exact assets, `5/5` privacy, contract-level Back/Forward diagnostics, `25/25` authenticated F5 at 3.1–5.1 seconds, active Trip retained, console `0`.

One Preview reload exceeded an initial 15-second observer window and then reached the correct state without an error. Read-only diagnosis preceded a contract-aligned 30-second observer window for the remaining runs; the delayed observation is retained as evidence.

## Exclusions and rollback

There was no database/schema/RPC/RLS/bucket mutation, Edge Function change, secret change, manual Cloudflare configuration change, foreign Domain Truth move or Journey/Timeline reclassification.

Rollback is code-only to M9.2 runtime `740f127041cb275cf8a5716965bf9c20d4158d04` / Production version `15c2ba3c-8b16-40e4-bd53-01bc9f9893e4`; no data rollback is required.

M9.3 is closed. M9 remains in progress; the next mutation starts with a fresh read-only lock of remaining App Shell orchestration, lifecycle/resume and legacy URL-owner boundaries.
