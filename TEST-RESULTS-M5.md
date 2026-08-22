# TEST RESULTS — M5 FINAL

## Release under test

- App: **13.82.14**
- Core: **4.82.14**
- Release name: **M5 FINAL Physical Trip Core Isolation**
- Built at: **2026-08-22T09:10:09+02:00**
- Runtime Release Commit: `579e72c9419fc4456ce724bc63ba15d8f24233c7`
- Physical Isolation Feature Commit: `d3a13e829ea1eca4fbbeff38b16ecf52e2eec58e`

## Architecture gates

- Physical Trip State Core browser tokens: **0**.
- Web Trip Store owns second local Trip state: **NO**.
- `LuviaTripStateReaderV1`: **READ-ONLY / snapshot + subscribe**.
- M5.4 FINAL Web Compatibility Boundary: **PASS**.
- M5.4.3 Active TripStore Consumer Isolation: **PASS**.
- M5.3 Active Trip Context Regression: **2/2 PASS**.
- NFR-0 Foundation Regression: **3/3 PASS**.
- M5.2 Remaining Trip Consumer Isolation: **7/7 PASS**.
- Core Stream Registry: **PASS**.

## Safe Regression

- Platform pre-commit: **39/39 PASS**.
- Platform post-commit: **39/39 PASS**.
- Integration: **39/39 PASS**.
- Main: **39/39 PASS**.
- Final pre-closeout retention: **39/39 PASS**.

Total controlled Safe Regression tests: **39**
Passed: **39**
Failed: **0**
Suite: **PASS**

## Integration Preview

- URL: `https://integration-luvia.njwnrvwbv5.workers.dev`
- Target Release: `579e72c9419fc4456ce724bc63ba15d8f24233c7`
- Runtime byte provenance: **11/11 EXACT**.
- Public registries: **EXACT**.
- Static Privacy: **PASS**.
- Physical Trip Core deployed: **PASS**.
- Native-readiness semantics: **PASS**.

### Integration authenticated F5

- Summary: **25/25 PASS**.
- Total: **25**.
- Passed: **25**.
- Failed: **0**.
- Suite: **PASS**.
- Reader available after F5: **PASS**.
- Active Trip preserved after F5: **PASS**.
- Trip count after F5: **7**.
- Visual Active Trip / Booking Center: **UI PASS**.

## Main / Production

- Main FF-only promotion: **PASS**.
- Main Local = Tracking = Live at Runtime Release: **PASS**.
- Production URL: `https://luvia.njwnrvwbv5.workers.dev`.
- Production runtime byte provenance: **11/11 EXACT**.
- Public registries: **EXACT**.
- Static Privacy: **PASS**.
- Physical Trip Core: **PASS**.
- Native-readiness semantics: **PASS**.

### Production authenticated F5

- Summary: **25/25 PASS**.
- Total: **25**.
- Passed: **25**.
- Failed: **0**.
- Suite: **PASS**.
- Active Trip preserved after F5: **PASS**.
- Trip count after F5: **7**.
- Visual Active Trip / Booking Center: **UI PASS**.

## Production runtime SHA256 evidence

- `index.html`: `a6d219beb1b3fa03e63cac43cbc4e30d3d3a4c572349de39037076d93c357a17`
- `intelligence/kernel/version.js`: `cbd5123eb41caa9e9e3a490359b8933dd2e55ed3472c75d44e5bfc692e74d8b8`
- `core/diagnostics/media-readiness.js`: `52a050dfe5aeb5d4bff1901d7d100fd3f94a92316e684a1dea1ec5e728f65b7a`
- `force-update.html`: `774297e752728f446ce166df562cce46f53fbf2cc7b63cb72a2ab2086b4bf7f7`
- `sw.js`: `ccf6308a0399fc857ed47000aad6106c27c702853d74d200ffc03811b733e147`
- `core/trips/trip-state-core.js`: `22a1573e12c35dc830cf3fa67d6d88e2369e7e10b3798a7d98569aa32867a74d`
- `core/trips/trip-store.js`: `dccd0b86226d971208df5460723fb222121832a1becebb3b2751e8968c39517a`
- `core/trips/active-trip-context.mjs`: `2ceb784bdbbcd14dbcd861466bd9e1c1aec3ebcc7ff800d018957f3da6875bd4`
- `luvia-trip-context.js`: `bf610de49189b7a4023ca33477af9386ee9fc9f35366bdf7a059d214e0c38381`
- `core/platform/trip-contract-adapter.js`: `4e32e386b8301f9f3a4ec964248128abf645b08d929f116f6cbea2d6d873b776`
- `core/context/travel-context-service.js`: `e2dd2401b6b08ee0c10df9fbc0c33459837bb43b65c1a39a103ddb31be453e7d`

## Static privacy

The following closeout / architecture artifacts are deployment-private and must not be served directly:

- `CURRENT-BUILD.md`
- `RELEASE-NOTES-M5.md`
- `TEST-RESULTS-M5.md`
- `docs/architecture/MIGRATION-STATE.md`
- `docs/modularization/PCR-M5-FINAL-PHYSICAL-TRIP-CORE-ISOLATION.md`
- `tests/m4.5.3-core-stream-registry.test.cjs`

HTTP 200 is acceptable only when byte-classified as the SPA fallback, not as direct private file exposure.

## Infrastructure

- DB migration: **NONE**.
- Edge Function change: **NONE**.
- Secret change: **NONE**.
- Manual Cloudflare change: **NONE**.

## Result

M5 final runtime and architecture acceptance: **PASS**.
M5 milestone exit: **ELIGIBLE FOR COMPLETE / CLOSED after documentation marker and 8/8 synchronization**.
