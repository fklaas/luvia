# PCR M7 FINAL — Media Domain / Native Readiness

Status: **IMPLEMENTED / LOCAL VERIFIED**

Source-lock marker: `a44e95c3ba5a7e144652f90e95e9bc6f04c20526`

Owner stream: `feature/platform-core`

## Read-only exit baseline

The M7.1-M7.4 consumer migrations left one cohesive milestone-exit block inside the Media/Platform owner boundary:

- `core/media` contained eight runtime artifacts. The canonical `media-core.js` still contained 22 Web-global references, 36 owner database calls, seven direct Supabase Storage calls, and one owner Realtime channel;
- MediaStoragePort and LifecyclePort were declared by NFR-0 but had no Web implementation;
- NetworkPort exposed only a synchronous online flag and could not report network transitions;
- Media upload had no persisted offline-command queue or lifecycle/network drain coordinator;
- Media entity/public projection and Realtime projection rules lived inside Web adapters rather than a browserless reusable core;
- the separately classified legacy `sync/gallery.js` compatibility bridge retained ten direct private `LuviaMediaCore` references;
- Media Clustering retained two and Memory Album/Card/Journey owner services retained four private owner references. These are same-owner internals, not cross-core consumers;
- Timeline/Journey retained exactly two private Media references and remained separately reserved as a cross-domain aggregator.

The measured architecture already established Gallery, Memory Experience, Smart Photo, and AI Memory on `media.v1`. The final scope therefore does not repeat those completed migrations.

## Locked implementation scope

- add a browserless Media Domain Contract Core for canonical owner projection, sanitized public projection, normalized Media Realtime projection, upload-task state transitions, and injected upload coordination;
- make `media.v1` delegate public Media/Realtime projection to that shared core and evolve its additive runtime surface to 1.2.0 while retaining Contract major v1;
- add ID-only Media asset download for the legacy compatibility bridge without leaking buckets or paths;
- implement a dedicated Web MediaStoragePort adapter for Supabase object operations plus a persistable IndexedDB upload-command queue;
- implement LifecyclePort and NetworkPort transition subscription in the generic Web device adapter;
- route every canonical Media owner storage upload, remove, download, and signed-URL operation through MediaStoragePort;
- stage offline uploads as owner commands and drain them through injected Network/Lifecycle/Queue providers when the runtime becomes eligible;
- preserve the current online upload behavior and expose queued state additively to Gallery;
- adopt the canonical half of `sync/gallery.js` onto `media.v1`, while preserving its explicitly legacy `gallery_photos` / `paris-gallery` fallback;
- make Realtime ownership (`media-core`) and hydration boundary (`media.v1`) explicit in Media diagnostics;
- add the browserless M7 exit guard and increment the controlled Safe Regression allowlist.

## Ownership and Native First result

The browserless core contains no DOM, browser-global, device, browser-storage, IndexedDB, Supabase, DB, or remote-storage dependency. Web, iOS, and Android can provide the same injected queue/network/lifecycle/storage capabilities without rewriting the Media entity, public projection, Realtime, or upload-state rules.

The Web MediaStoragePort owns physical Web storage access and durable upload staging, but no Media entity, Trip truth, Memory truth, or UI truth. IndexedDB contains pending command payloads, not a second authoritative Media database. A staged command becomes Media truth only after the Media owner persists it through the existing canonical database path.

Web background handling is intentionally capability-accurate: queued uploads persist across reloads and drain on online/foreground transitions while the Web runtime is active. The code does not claim that a closed browser receives native OS background execution. Native adapters can bind the same coordinator contract to iOS/Android background-transfer facilities.

## Hydration and Realtime ownership

- canonical Media hydration: Media owner list/get providers;
- public hydration boundary: `media.v1` sanitized reads;
- canonical Media Realtime channel: `media-core` only;
- public Realtime boundary: `media.v1.reads.subscribe` normalized projection;
- Gallery and legacy compatibility consumers: public subscription only;
- upload queue: Media owner command state through MediaStoragePort staging;
- Memory Album/Card/Journey services and Media Clustering: same-owner internal services, unchanged.

## Explicit non-scope

- no database, schema, RPC, bucket, RLS, migration, Edge Function, secret, or deployment-configuration change;
- no Media, Memory, Trip, Place, Identity, Booking, Experience, or Intelligence truth move;
- no rewrite of Memory Album/Card/Journey persistence or Media Clustering persistence;
- no Timeline/Journey mutation, adoption, ownership move, or reclassification;
- no removal of the separately measured legacy `gallery_photos` / `paris-gallery` read fallback;
- no claim of native OS background execution from a closed Web runtime;
- no rewrite of historical NFR-0 debt evidence or stale release-pinned tests.

## Local validation

- browserless Media Domain Core: **PASS**;
- browser/device/Supabase/storage tokens in browserless core: **0**;
- canonical Media owner direct `client.storage.from(...)` refs: **7 -> 0**;
- legacy Gallery direct private Media Core refs: **10 -> 0**;
- Web MediaStoragePort: remote storage plus IndexedDB queue **PASS**;
- NetworkPort transition subscription: **PASS**;
- LifecyclePort: **PASS**;
- upload task transition and offline/online drain behavior: **PASS**;
- `media.v1` runtime surface: **1.2.0**, Contract major remains **v1**;
- Media Realtime owner / public hydration boundary diagnostics: **PASS**;
- Media Clustering direct owner refs: **2**, unchanged;
- Memory owner-service direct owner refs: **4**, unchanged;
- Timeline/Journey direct Media refs: **2**, separately reserved and unchanged;
- prior maintained M3.3 and M7.1-M7.4 guardrails: **PASS**;
- new M7 FINAL guard: **PASS**;
- NFR-0 Foundation Regression: **3/3 PASS**;
- Safe Regression: **47/47 PASS** on `feature/platform-core`.

The historical non-Allowlist `m3.3-media-contract-release-integration.test.cjs` remains pinned to Core 4.81.7 while the source-lock runtime is already Core 4.82.21. It is not rewritten or presented as current acceptance evidence.

## Rollback

Rollback is code-only: restore the direct Web storage implementation in `media-core.js`, restore the legacy compatibility owner calls, remove the added Domain/Storage adapters and focused guard, and restore `media.v1` runtime 1.1.0. Pending IndexedDB upload commands may be left for a forward fix or cleared explicitly by the Web adapter; no canonical Media data rollback is required.
