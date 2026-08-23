# Release Notes — M7.4 Remaining Media Consumer Contract Adoption

Date: 2026-08-23

Status: **COMPLETE / CLOSED / PRODUCTION VERIFIED**

## Release identity

- App: **13.82.21**
- Core: **4.82.21**
- Feature commit: `dfbeffbe7bbbd003f1a3e72220cd5d1f666768b0`
- Runtime release commit: `2f8fe62b71f93643cef474ff002a90bd267bac01`
- Integration Preview: `0541fd51-4bd3-4e10-8ac0-3bc0d16aafb9`
- Production: `2ad42346-348b-4fbe-ba10-e32ede4e71ef` at 100%
- Production deployment/build/check: `36f63a2a-8e5e-438e-8323-12f698d8d195` / `193a43c1-3021-46f6-89ff-a417fb3ed1d3` / `97170830238` — SUCCESS

## Architecture result

The remaining measured consumer-class Media Core bypasses are removed. Smart Photo Moments now reads public Media projections and ID-only signed assets through `media.v1`; it does not consume storage paths, buckets, raw metadata, or Media owner entities. The route stays correctly classified as a reachable Paris Legacy/Experience path outside the current `index.html` app entry.

Active AI Memory now receives sanitized Media evidence through `media.v1` and executes Media-to-Place linking through the Media-owned public command. Intelligence keeps reasoning, evidence composition, proposal persistence and confirmed orchestration, but acquires no Media or Place truth. Timeline/Journey remains a separate cross-domain aggregator and was not reclassified.

## Changed files

Feature/guardrail:

- `smart-photo-moments.js`
- `core/media/ai-memory-bridge.js`
- `docs/modularization/FILE-OWNERSHIP.csv`
- `docs/modularization/PCR-M7.4-REMAINING-MEDIA-CONSUMER-CONTRACT-ADOPTION.md`
- `tests/m7.3-memory-asset-contract-adoption.test.cjs`
- `tests/m7.4-remaining-media-consumer-contract-adoption.test.cjs`
- `tests/run-m4.3-safe-regression.cjs`

Runtime release identity/cache busting:

- `CURRENT-BUILD.md`
- `core/diagnostics/media-readiness.js`
- `force-update.html`
- `index.html`
- `intelligence/kernel/version.js`
- `intelligence/test.html`
- `luvia-trip-context.js`
- `paris-official.html`
- `sw.js`
- `tests/m5-final-physical-trip-core-isolation.test.cjs`
- `tests/m5.3-active-trip-context-web-binding.test.cjs`
- `tests/m7.4-remaining-media-consumer-contract-adoption.test.cjs`

## Verification

- Smart Photo Moments direct Media Core refs: **3 -> 0**;
- AI Memory direct Media Core refs: **5 -> 0**;
- public Media read/command behavior: PASS;
- private storage/raw metadata leakage in changed consumers: **0**;
- NFR-0: 3/3 PASS;
- Safe Regression: 46/46 PASS on Platform, Integration, Main;
- Integration and Production: 13/13 exact assets, 5/5 privacy, authenticated F5, active Trip, 51 photos, 10 photo moments, Realtime active, console 0/0.

The historical non-Allowlist tests `ai-memory-bridge-v13.28.2.2.test.cjs` and `media-smart-photo-foundation-v13.28.0.test.cjs` contain stale release/UI assertions that already diverged from Git HEAD. They were not rewritten and are not presented as M7.4 acceptance evidence.

## Infrastructure

- DB/schema/RPC/bucket/RLS: NONE
- Edge Functions: NONE
- Secrets: NONE
- Manual Production deployment: NONE
- Manual Cloudflare configuration: NONE

## Rollback

Rollback is code-only: revert runtime commit `2f8fe62`, then feature commit `dfbeffb`. No data, database, function, secret, or Cloudflare configuration rollback is required.

## Next M7 scope

Start with a fresh read-only lock of Media owner/context boundaries, Realtime/hydration ownership, MediaStorage/background-upload capabilities, network/retry/offline-queue semantics, and the browserless Media Core exit surface. Memory owner services and Media Clustering remain owner-internal scopes; legacy `sync/gallery.js` remains a separately classified compatibility adapter; Timeline/Journey stays separate.
