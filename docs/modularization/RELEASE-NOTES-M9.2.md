# Release Notes — M9.2 Staged App Runtime and Module Mounting

Date: 2026-08-23
Status: COMPLETE / CLOSED / PRODUCTION VERIFIED

## Release identity

- App / Core: `13.82.29 / 4.82.29`
- Platform foundation: `216c8389865434087c2cf4d1e5185824c8640b3b`
- Platform boot rehydration repair: `ca19583c5023df2ed45e68d9cba8d199037f817a`
- Consumer adoption: `b44b21602debf2e2d3f55b6fb0e9ef7712f06725`
- Consumer watchdog repair: `4109e5f3d200cd8b4c8a64cd6c6c0e8fe38d8716`
- Platform/Auth serialization: `d1112f252c3f428941e1bbddb3aef4705cec43d5`
- Final runtime release: `740f127041cb275cf8a5716965bf9c20d4158d04`
- Previous synchronized marker: `3e8a25f28b92275831ced0df7b3883cc96bebcac`

## Architectural and visible result

M9.2 introduces the browserless `app-runtime.v1` and `module-mount.v1` foundations. App startup now advances through explicit Platform, Auth, Domain Context, Shell and Module readiness stages with immutable diagnostics, strict transition order, bounded timeouts, measured failure and explicit recovery.

The Consumer App Shell no longer keeps five manual mounted-state flags or a route-specific module-mount chain. Nine active module routes consume the canonical `navigation.v1` descriptors and mount through serialized concrete Web adapters. Screen composition remains Consumer-owned, every Domain Core retains its own truth, and Journey/Timeline remains a separately classified cross-domain aggregator.

The release also closes two real browser races found by the pre-Main Preview gate. Authenticated recovery rendering now waits for Domain Context. Concurrent Auth initializers now share the same provider hydration instead of returning a premature loading snapshot, and failed initialization is restartable.

## Quality and deployment evidence

- Focused M9.2 regression: PASS, including deterministic concurrent Auth initialization;
- NFR-0: `3/3 PASS`;
- Safe Regression: `51/51 PASS` on Platform, Integration and Main;
- Integration Preview version `6f18047f-a0c5-4020-8e40-1ba97ee20744`: `14/14` byte-exact assets, `5/5` privacy, authenticated cold start, Planen -> Places, `10/10` categories, `25/25` authenticated F5, active Trip retained, console `0`;
- Production version `15c2ba3c-8b16-40e4-bd53-01bc9f9893e4`, deployment `db4ad571-9919-4c1e-b36d-1eaa2bf1fe34`: 100%;
- `myluvia.app`: `14/14` byte-exact assets, `5/5` privacy, authenticated cold start, Planen -> Places, `10/10` categories, `25/25` F5, active Trip retained, console `0`.

Rejected candidates remain explicit evidence: `13.82.27` failed the authenticated cold-start watchdog gate, and `13.82.28` failed the authenticated F5 Auth readiness gate. Both stopped before Main; only `13.82.29` was promoted.

## Exclusions and rollback

There was no database/schema/RPC/RLS/bucket mutation, Edge Function change, secret change, manual Cloudflare configuration change, foreign Domain Truth move or Journey/Timeline reclassification.

Rollback is code-only to synchronized M9.1 marker `3e8a25f28b92275831ced0df7b3883cc96bebcac`; no data rollback is required.

M9.2 is closed. M9 remains in progress with History/Back/Deep-Link policy as M9.3.
