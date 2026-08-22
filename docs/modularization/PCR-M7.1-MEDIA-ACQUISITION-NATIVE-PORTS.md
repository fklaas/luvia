# PCR M7.1 — Media Acquisition Native Ports

Status: **FEATURE IMPLEMENTATION COMPLETE / LOCAL ACCEPTANCE PASS**

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

## Rollback

Rollback is code-only: remove the four added Web port implementations, restore the Gallery Web picker/share/location bridge, restore the earlier diagnostics object, and remove the focused test/PCR entry. No database or data rollback is required.
