# Release Notes — M7.2 Gallery Media Contract Adoption

Date: 2026-08-22

Status: **COMPLETE / CLOSED / PRODUCTION VERIFIED**

## Release identity

- App: **13.82.19**
- Core: **4.82.19**
- Feature commit: `eaf505fdc715825a862c0d1dd733feb1330367a2`
- Runtime release commit: `54eb8d16cf94a92cc8b77e1442dfe88bb44f4144`
- Integration Preview: `5c94df43-a9c9-4ea8-9687-44243348ea5c`
- Production: `bd7b5df9-667d-4a8e-93a5-d00f4583d5f0` at 100%
- Production build/check: `aaa26d29-24cf-4ad1-abd8-3abdee9b9153` / `97022054088` — SUCCESS

## Architecture result

Gallery has zero direct private Media Core references. Its Media reads and commands now flow through `media.v1` 1.1.0. The additive Contract surface covers sanitized projections, signed URLs, Polaroids, upload/reanalysis/favorites/polaroids/removal, rendered-preview persistence, explicit Gallery clearing, and normalized Media Realtime subscription.

Private storage buckets and paths, content hashes, raw metadata, user IDs, and database rows remain behind the owner adapter. Edit settings and visual overlays are deeply sanitized. Gallery does not gain Media truth.

Clustering, AI Memory, and Timeline/Journey were deliberately retained outside this slice. Clustering received only compatibility for the sanitized public `mediaKind` and `resolvedLocation` projection so its existing behavior remains intact.

## Changed files

Feature/contract/guardrail:

- `app/gallery-view.js`
- `core/media/media-clustering.js`
- `core/platform/media-contract-adapter.js`
- `docs/modularization/FILE-OWNERSHIP.csv`
- `docs/modularization/PCR-M7.2-GALLERY-MEDIA-CONTRACT-ADOPTION.md`
- `tests/m3.3-media-contract-adapter.test.cjs`
- `tests/m5.1b-gallery-view-trip-contract-adoption.test.cjs`
- `tests/m7.2-gallery-media-contract-adoption.test.cjs`
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

- Gallery direct Media Core refs: 19 -> 0;
- private Media projection/storage/DB access: 0;
- Media Contract 1.1.0 projection/command tests: PASS;
- Native acquisition ports retained: PASS;
- Clustering compatibility: PASS;
- NFR-0: 3/3 PASS;
- Safe Regression: 44/44 PASS on Platform, Integration, Main;
- Integration and Production: 10/10 exact assets, 5/5 privacy, authenticated F5, 51 photos, 10 photo moments, Realtime active, console 0/0.

## Infrastructure

- DB/schema/RPC/bucket/RLS: NONE
- Edge Functions: NONE
- Secrets: NONE
- Manual Production deployment: NONE
- Manual Cloudflare configuration: NONE

## Rollback

Rollback is code-only: revert runtime commit `54eb8d1`, then feature commit `eaf505f`. No data, database, function, secret, or Cloudflare configuration rollback is required.

## Next M7 scope

Start with a fresh read-only classification of Clustering, AI Memory, Albums/Cards/Journeys, and Media Realtime/hydration topology. Timeline/Journey remains separate. MediaStorage, background upload, retry/network transitions, and offline queue remain a distinct Native First block.
