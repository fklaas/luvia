# PCR M7.3 — Memory Asset Delivery Contract Adoption

Status: **IMPLEMENTED / LOCAL VALIDATED**

Source-lock marker: `18cff2350c487647a0984dd472d93e2785094861`

Owner stream: `feature/platform-core`

## Read-only scope lock

After M7.2, six Memory Experience artifacts retained exactly six direct `LuviaMediaCore` references. Every reference served only signed asset delivery for a Media item already supplied by an existing Memory owner. The public `media.v1` 1.1.0 surface already provides ID-based signed asset reads, so no Contract extension or owner change is required.

Locked targets:

- `app/albums-view.js`;
- `app/memory-worlds-v2.js`;
- `app/memory-worlds-v3.js` and its TypeScript source mirror;
- `app/memory-export-engine.js` and its TypeScript source mirror.

## Locked implementation scope

- replace the six direct signed-URL calls with lazy `media.v1` reads;
- pass only Media IDs across the public boundary;
- retain URL caching and graceful missing-asset behavior;
- add a focused M7.3 guard and Safe Regression entry.

## Explicit non-scope

- no Media, Album, Card, Journey, or Trip truth move;
- no Contract version or projection change;
- no Smart Photo Moments or Media Clustering mutation;
- no AI Memory mutation or Intelligence ownership assignment;
- no Memory owner-service migration;
- no Timeline/Journey mutation;
- no legacy `sync/gallery.js` migration;
- no Realtime/hydration owner move;
- no MediaStoragePort, background upload, retry, NetworkPort, LifecyclePort, or offline queue implementation;
- no database, schema, RPC, bucket, RLS, Edge Function, secret, or deployment configuration change.

## Local validation

- target direct Media Core refs: **6 -> 0**;
- signed asset calls: **media.v1 / ID-only**;
- existing Memory behavior and source mirrors: retained;
- separately classified direct-reference counts: unchanged;
- Safe Regression: **45/45 PASS** on `feature/platform-core`.

## Rollback

Rollback is code-only: restore the six direct signed-URL calls and remove the M7.3 guard/PCR entry. No data rollback is required.
