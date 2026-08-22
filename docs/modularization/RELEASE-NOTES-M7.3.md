# Release Notes — M7.3 Memory Asset Delivery Contract Adoption

Date: 2026-08-22

Status: **COMPLETE / CLOSED / PRODUCTION VERIFIED**

## Release identity

- App: **13.82.20**
- Core: **4.82.20**
- Feature commit: `21ef490c30dc2cc0ddc011300ef0e3b638321d10`
- Runtime release commit: `63a73bcd3b39de723b97c86887b866e488659d60`
- Integration Preview: `805b8187-86f9-4b43-8254-7f574b11c6ae`
- Production: `476ec499-830d-4cbb-87a3-e9e32a79cd4d` at 100%
- Production build/check: `7df7ffbb-7f30-43aa-bd9c-76335dba88a4` / `97023989740` — SUCCESS

## Architecture result

The six locked Memory Experience artifacts have zero direct private Media Core references. Signed asset delivery now flows lazily through `media.v1` and receives a Media ID rather than a raw Media entity.

No Contract extension was required. Media truth remains in Media Core; Album, Card, and Journey truth remain with their existing owners. Experience retains presentation and export behavior but gains no Media truth, storage path, bucket, raw metadata, or database access.

Smart Photo Moments/Clustering, AI Memory, Memory owner services, legacy Gallery sync, and Timeline/Journey were deliberately preserved as separate scopes.

## Changed files

Feature/guardrail:

- `app/albums-view.js`
- `app/memory-worlds-v2.js`
- `app/memory-worlds-v3.js`
- `app/memory-worlds-v3.ts`
- `app/memory-export-engine.js`
- `app/memory-export-engine.ts`
- `docs/modularization/FILE-OWNERSHIP.csv`
- `docs/modularization/PCR-M7.3-MEMORY-ASSET-CONTRACT-ADOPTION.md`
- `tests/m7.3-memory-asset-contract-adoption.test.cjs`
- `tests/run-m4.3-safe-regression.cjs`

Runtime release identity/cache busting:

- `CURRENT-BUILD.md`
- `core/diagnostics/media-readiness.js`
- `force-update.html`
- `index.html`
- `intelligence/kernel/version.js`
- `intelligence/test.html`
- `luvia-trip-context.js`
- `sw.js`
- `tests/m5-final-physical-trip-core-isolation.test.cjs`
- `tests/m5.3-active-trip-context-web-binding.test.cjs`

## Verification

- Memory Experience direct Media Core refs: **6 -> 0**;
- signed asset boundary: **media.v1 / ID-only**;
- source mirror alignment: PASS;
- excluded reference groups: unchanged;
- NFR-0: 3/3 PASS;
- Safe Regression: 45/45 PASS on Platform, Integration, Main;
- Integration and Production: 11/11 exact assets, 5/5 privacy, authenticated F5, active Trip, 59 Cards, 2 travelers, signed images rendered, console 0/0.

A historical non-Allowlist test still hard-codes Memory Worlds 13.37.0/4.37.0 although its Git baseline is already 13.37.7/4.37.7. It was not modified and is not presented as M7.3 acceptance evidence.

## Infrastructure

- DB/schema/RPC/bucket/RLS: NONE
- Edge Functions: NONE
- Secrets: NONE
- Manual Production deployment: NONE
- Manual Cloudflare configuration: NONE

## Rollback

Rollback is code-only: revert runtime commit `63a73bc`, then feature commit `21ef490`. No data, database, function, secret, or Cloudflare configuration rollback is required.

## Next M7 scope

Start with a fresh read-only classification of Smart Photo Moments/Clustering, AI Memory, Memory owner services, legacy Gallery sync, and Media Realtime/hydration topology. Timeline/Journey remains separate. MediaStorage, background upload, retry/network transitions, and offline queue remain a distinct Native First block.
