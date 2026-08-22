# PCR M7.1 — Media Acquisition Native Ports

Status: **COMPLETE / CLOSED / PRODUCTION VERIFIED**

Baseline / source-lock marker: `81510950f1d8d7a8f9b7192e98c15c2593b8db6d`

Owner stream: `feature/platform-core`

## Read-only M7 baseline

The normative M7 milestone is Media / Memory Data Isolation. The current repository already has a `media.v1` owner adapter and cloud-authoritative Media/Memory services, but the active Gallery acquisition path bypassed the registered Native First ports:

- `app/gallery-view.js` contained eight direct `navigator` references;
- Gallery embedded its own `<input type="file">` and controlled the Web picker directly;
- camera capture location used `navigator.geolocation` as a fallback;
- device metadata was read directly from `navigator`;
- Gallery created browser `File` objects and invoked Web Share directly;
- Gallery diagnostics persisted their flag through direct browser storage;
- MediaPickerPort, MediaCapturePort, DevicePort, and SharingPort were declared by the Platform Registry but had no Web implementations;
- Media Readiness reported the central owner but did not expose the Native Port path.

The active Gallery still calls the Media and Clustering owners directly. The broader Media Contract, Realtime ownership, hydration, background upload, offline queue, and Memory Experience adoption remain measured M7 debt and are not declared solved by this first slice.

## Locked implementation scope

- provide Web implementations of MediaPickerPort, MediaCapturePort, DevicePort, and SharingPort in the existing app adapter layer;
- keep browser and DOM capability code outside `core/media`;
- remove Gallery's embedded file input and direct picker control;
- add explicit Gallery picker and capture actions backed by the formal ports;
- route capture location, device metadata, and file sharing through LocationPort, DevicePort, and SharingPort;
- route the Gallery diagnostic preference through OfflineCachePort;
- extend Media Readiness with Media Contract and Native Port diagnostics;
- add a focused M7.1 guardrail and increment the controlled Safe Regression allowlist.

## Explicit non-scope

- no Media/Memory database, schema, RPC, bucket, RLS, Edge Function, or secret change;
- no Media truth move and no new Media state store;
- no `media.v1` surface change in M7.1;
- no Gallery-to-Media-Contract adoption yet;
- no MediaStoragePort, background-upload, retry, network-transition, or offline-queue implementation;
- no Realtime/hydration ownership move;
- no Albums, Memory Cards, Memory Journeys, Memory Worlds, AI Memory, or Timeline mutation;
- no rewrite of historical NFR-0 evidence.

## Validation gates

- Gallery direct `navigator` references: **0**;
- Gallery embedded file inputs: **0**;
- Gallery direct browser storage references: **0**;
- Web Media device ports: **5/5** including the reused LocationPort;
- Platform adapter Media truth/API ownership: **0**;
- Media Readiness Contract/Port diagnostics: **PASS**;
- Gallery syntax and focused M7.1 guard: **PASS**;
- Media Contract and Gallery Trip Contract compatibility: **PASS** through the controlled suite;
- NFR-0 Foundation Regression: **3/3 PASS**;
- Safe Regression: **43/43 PASS** on `feature/platform-core`.

Historical test note: `tests/gallery-experience-v13.28.3.test.cjs` still expects the removed `lv-day-group` marker. A read-only comparison against source-lock marker `81510950` proves that marker was already absent before M7.1; this historical assertion is therefore classified as pre-existing test drift, not as an M7.1 regression. It is not part of the controlled Safe Regression suite.

## Release and environment acceptance

- Feature commit: `b2792df68a89b45f886c021be7c05404e33d1f4d`;
- Runtime release commit: `625dc47cb36427a0f28586d28e65eab344bc1ae9`;
- App/Core: **13.82.18 / 4.82.18**;
- Safe Regression: **43/43 PASS** on Platform, Integration, and Main;
- Integration Preview version: `708bc5e4-0ab2-4335-945e-95dadc7f8310`, alias `integration`, `has_preview=true`;
- Integration static provenance: **9/9 exact Git blobs**;
- Integration static privacy: **5/5 SPA fallback**;
- Integration authenticated F5/Gallery: active Trip retained, 51 photos rendered, picker/capture actions visible, console **0/0**;
- Main promotion: **FF-only PASS**;
- Production version: `97d5674b-db5d-43b0-8eee-ce8700acf6f2` at **100%** traffic;
- Production build/check: `9e5a19ef-ed16-4042-a046-8557a6ef1087` / `97020481096`, **SUCCESS**;
- Production static provenance: **9/9 exact Git blobs**;
- Production static privacy: **5/5 SPA fallback**;
- Production authenticated F5/Gallery: active Trip retained, 51 photos rendered, picker/capture actions visible, console **0/0**.

An additional manual, non-aliased Preview version `6b8ef54d-feef-485a-87b1-eec0a4767e5a` was created during validation. Its bytes exactly matched the Windows CRLF working copy and matched the Git blobs after LF normalization. It was not promoted and is not used as release provenance. The automatically created aliased Integration version above served the exact Git blobs and is the authoritative Preview proof.

## Infrastructure and ownership result

- database/schema/RPC/bucket/RLS migration: **NONE**;
- Supabase Edge Function change: **NONE**;
- secret change: **NONE**;
- manual Production deployment or Cloudflare configuration change: **NONE**;
- Media truth move or duplication: **NONE**;
- Timeline/Journey change: **NONE**.

M7.1 closes only the Media acquisition/device browser boundary. It does not close M7 as a milestone.

## Rollback

Rollback is code-only: remove the four added Web port implementations, restore the Gallery Web picker/share/location bridge, restore the earlier diagnostics object, and remove the focused test/PCR entry. No database or data rollback is required.
