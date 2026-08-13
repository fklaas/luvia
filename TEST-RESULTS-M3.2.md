# Test Results — M3.2 Places Contract Adapter Foundation

## Result
Current local automated result: **PASS** for the implemented M3.2 adapter and release-integration gates completed during development. Production browser smoke remains a post-deployment gate and must be recorded after Cloudflare deployment.

## Green M3.2 gates
- `node --check core/places/place-core.js` — PASS.
- `node --check core/platform/places-contract-adapter.js` — PASS.
- `node --check intelligence/kernel/version.js` — PASS.
- `node --check core/diagnostics/media-readiness.js` — PASS.
- `node --check sw.js` — PASS.
- `node tests/m3.2-places-contract-adapter.test.cjs` — PASS.
- `node tests/m3.2-places-contract-release-integration.test.cjs` — PASS.
- `node tests/release-version-consistency.test.cjs` — PASS.
- `docs/modularization/contracts/places.v1.json` JSON parse — PASS.
- Adapter forbidden-coupling audit for direct `LuviaBackend`, Supabase, `TripPlaceData`, `trip_places`, `trip_place_data`, local/session storage, Paris legacy clients and direct `LuviaPlaceEntities` access — PASS.
- Runtime load-order check: Places adapter loads after Places-owned providers and before AppShell — PASS.
- Service-worker shell includes `core/platform/places-contract-adapter.js` — PASS.
- Command projection regression: raw Favorite/Plan/Lifecycle backend/RPC responses do not leak through the contract — PASS.
- Import projection regression: canonical Place ID and explicit provider Place ID remain separate — PASS.
- Existing local PlaceCore lifecycle caller compatibility (`updateLifecycle`) — PASS.

## Version-bound historical test behavior
M3.1 tests remain historical tests for the prior `13.81.5 / 4.81.5` release. They are not rewritten to pretend that M3.1 itself shipped as 13.81.6. M3.2 uses its own version-bound release integration test plus the generic `release-version-consistency.test.cjs`.

## M3.2 development RED→GREEN observations
- Release integration initially failed because the repository still reported Core `4.81.5`; after controlled version bump it advanced to the next gate.
- It then failed because the service worker did not yet cache the Places adapter; the adapter was added to the existing shell cache.
- It then failed because `places.v1.json` still reported stage `M3`; after contract implementation metadata was updated to `M3.2`, the release integration gate passed.
- The adapter test initially exposed an import provider-ID ambiguity. `importPlace()` was corrected so the explicit imported provider ID is preserved while the canonical Place ID remains independent.

## Additional regression matrix
- `place-contract-bootstrap-resilience.test.cjs` — PASS.
- `global-place-planning-dialog.test.cjs` — PASS.
- `v13.78.0-product-module-regression.test.cjs` — PASS.
- `v13.81.4-google-reserve-discovery-matrix.test.cjs` — PASS.
- `v13.81.4-green-farmers-mutation-bootstrap-regression.test.cjs` — PASS.
- `place-architecture-regression.test.cjs` — **PRE-EXISTING FAIL / NOT M3.2 CAUSED**. The historical Build 13.15.0 test requires `modules/move-shell.js` to be loaded by `index.html`; neither the current M3.2 working tree nor the unchanged M3.1 baseline `HEAD` (`7eeb36a`) loads that asset. The test and MoveShell runtime were not changed to manufacture a green result.
- `v13.81.4-mutation-thread-bootstrap-mobile-surface-fetch-hardening.test.cjs` — **VERSION-BOUND HISTORICAL TEST**. A direct run stops on fixed `13.81.4 / 4.81.4` release assertions. A temporary copy with only those release/cache/query-string assertions normalized to `13.81.6 / 4.81.6` passed all underlying mutation-thread bootstrap, mobile mutation surface, contact discovery and route discovery assertions (`LUVIA_V13_81_4_MUTATION_THREAD_BOOTSTRAP_MOBILE_SURFACE_FETCH_HARDENING_OK`). The temporary file was removed immediately and the historical repository test remains unchanged.

## Final pre-staging verification
- Provider-method guards were added to the existing Places contract adapter. Missing individual LuviaPlaceCommands methods, missing LuviaPlaceCore command methods and missing LuviaPresenceVisitCore.confirmVisit now fail with PLACES_CONTRACT_PROVIDER_UNAVAILABLE instead of an uncontrolled TypeError or silent null result.
- The M3.2 adapter regression test now covers partial-provider availability and passed.
- Final diff check: PASS.
- JavaScript syntax checks: PASS (7/7).
- places.v1 contract JSON parse: PASS.
- Final automated regression matrix: PASS (9/9), including the M3.1 Trip Contract adapter regression.
- Version-bound v13.81.4 mutation-thread/mobile-surface/fetch-hardening test: functional assertions PASS after temporary release-string normalization to 13.81.6 / 4.81.6; temporary test file removed immediately.
- Changed-file allowlist: PASS (18/18).
- Historical place-architecture-regression.test.cjs remains a documented pre-existing failure because it expects modules/move-shell.js in index.html; unchanged M3.1 baseline HEAD 7eeb36a already did not load that asset. No M3.2 code was changed to manufacture a green result.

## Safety
- No database migration executed.
- No SQL executed.
- No Supabase Edge Function deployed.
- No secret added or changed.
- No destructive Git operation required.
- No new Places persistence path introduced.
- No new Places state store introduced.
- No real Booking/reservation request is required for the M3.2 automated gate.
- Known Places search latency/result-repetition behavior is intentionally outside M3.2 architecture scope and must be tracked separately.
