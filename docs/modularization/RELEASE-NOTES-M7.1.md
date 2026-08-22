# Release Notes — M7.1 Media Acquisition Native Ports

Date: 2026-08-22

Status: **COMPLETE / CLOSED / PRODUCTION VERIFIED**

## Release identity

- App: **13.82.18**
- Core: **4.82.18**
- Feature commit: `b2792df68a89b45f886c021be7c05404e33d1f4d`
- Runtime release commit: `625dc47cb36427a0f28586d28e65eab344bc1ae9`
- Integration Preview version: `708bc5e4-0ab2-4335-945e-95dadc7f8310`
- Production version: `97d5674b-db5d-43b0-8eee-ce8700acf6f2` at 100% traffic
- Production build: `9e5a19ef-ed16-4042-a046-8557a6ef1087`
- Production check: `97020481096` — SUCCESS

## Architecture result

The active Gallery no longer owns Web picker, camera, geolocation, device metadata, Web Share, or browser-storage capability code. These operations cross MediaPickerPort, MediaCapturePort, LocationPort, DevicePort, SharingPort, and OfflineCachePort. The Web implementation remains in `app/adapters/platform-port-adapters.mjs`, outside `core/media`.

M7.1 does not add Media truth, change the `media.v1` surface, move Realtime ownership, or modify Media/Memory persistence. Gallery remains an Experience projection over the existing Media owners; its broader Media Contract adoption remains measured M7 debt.

## Changed files

Feature and guardrail:

- `app/adapters/platform-port-adapters.mjs`
- `app/gallery-view.js`
- `core/diagnostics/media-readiness.js`
- `docs/modularization/FILE-OWNERSHIP.csv`
- `docs/modularization/PCR-M7.1-MEDIA-ACQUISITION-NATIVE-PORTS.md`
- `tests/m7.1-media-acquisition-native-ports.test.cjs`
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

- focused M7.1 guard: PASS;
- Gallery direct navigator refs: 0;
- Gallery embedded file inputs: 0;
- Web Media acquisition/device ports: 5/5;
- NFR-0 Foundation Regression: 3/3 PASS;
- Safe Regression: 43/43 PASS on Platform, Integration, and Main;
- Integration: 9/9 exact runtime assets, 5/5 privacy, authenticated F5/Gallery, 51 photos, actions visible, console 0/0;
- Production: 9/9 exact runtime assets, 5/5 privacy, authenticated F5/Gallery, 51 photos, actions visible, console 0/0.

The historical non-allowlisted Gallery v13.28.3 test retains a pre-existing `lv-day-group` assertion that was already stale at the M7 source-lock marker. It is documented, not rewritten into passing evidence.

## Infrastructure

- DB/schema/RPC/bucket/RLS: NONE
- Edge Functions: NONE
- Secrets: NONE
- Manual Production deployment: NONE
- Manual Cloudflare configuration: NONE

## Rollback

Rollback is code-only and can revert runtime release commit `625dc47` followed by feature commit `b2792df`. No data, database, function, secret, or Cloudflare configuration rollback is required.

## Next M7 scope

Proceed from a fresh read-only lock of the Media Contract adoption and owner/Realtime/hydration topology. MediaStorage/background upload/offline queue and Memory Experience adoption remain separate measured scopes; Timeline/Journey stays separately classified.
