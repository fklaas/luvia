# PCR M7.2 — Gallery Media Contract Adoption

Status: **COMPLETE / CLOSED / PRODUCTION VERIFIED**

Source-lock marker: `b2d0031f6d4a4614ecfb9de2760559d85c75e907`

Owner stream: `feature/platform-core`

## Read-only scope lock

After M7.1, Gallery contained exactly 19 direct `window.LuviaMediaCore` references. The existing `media.v1` adapter already exposed core reads and commands, but it did not yet provide the sanitized projection fields, Polaroid reads, rendered-preview persistence, destructive Gallery clear command, or Media Realtime subscription required for behavior-preserving Gallery adoption.

Separately measured references remain outside this slice:

- Media Clustering: 8;
- AI Memory Bridge: 3;
- Timeline/Journey: 1.

These are not ordinary Media Core calls and are not silently reclassified by M7.2.

## Locked implementation scope

- evolve the additive `media.v1` runtime surface from 1.0.0 to 1.1.0 without changing Contract major version 1;
- expose sanitized Media projection semantics needed by Gallery without storage paths, bucket names, content hashes, raw metadata, user IDs, or DB rows;
- expose listPolaroids, Media subscription, rendered-preview save, and explicit Gallery clear through the owner adapter;
- normalize Media Realtime payloads to public Media projections;
- migrate all 19 Gallery Media Core reads/commands/subscriptions to the lazy public Contract;
- preserve location-based clustering when it receives sanitized Media projections;
- add a focused M7.2 guard and Safe Regression entry.

## Explicit non-scope

- no database, schema, RPC, bucket, RLS, Edge Function, secret, or deployment configuration change;
- no Media Core persistence or Realtime channel ownership move;
- no Clustering Contract/adoption change;
- no AI Memory Contract/adoption change;
- no Albums, Cards, Journeys, Memory Worlds, or Timeline/Journey migration;
- no MediaStoragePort, background upload, retry, network-transition, or offline queue implementation;
- no new Media truth or Gallery-owned state store;
- no rewrite of historical NFR-0 evidence.

## Local validation

- Gallery direct Media Core refs: **19 -> 0**;
- Gallery private Media projection/storage/DB access: **0**;
- media.v1 adapter projection leak guard: **PASS**;
- M3.3 Media Contract compatibility: **PASS**;
- M5.1b Gallery Trip Contract compatibility: **PASS**;
- M7.1 Native Port retention: **PASS**;
- legacy Clustering focus test: **PASS**;
- NFR-0 Foundation Regression: **3/3 PASS**;
- Safe Regression: **44/44 PASS** on `feature/platform-core`.

## Release and environment acceptance

- Feature commit: `eaf505fdc715825a862c0d1dd733feb1330367a2`;
- Runtime release commit: `54eb8d16cf94a92cc8b77e1442dfe88bb44f4144`;
- App/Core: **13.82.19 / 4.82.19**;
- Safe Regression: **44/44 PASS** on Platform, Integration, and Main;
- Integration Preview version: `5c94df43-a9c9-4ea8-9687-44243348ea5c`, alias `integration`, `has_preview=true`;
- Integration: **10/10 exact Git blobs**, **5/5 privacy**, authenticated F5, 51 photos, 10 photo moments, Realtime active, native actions, console **0/0**;
- Main promotion: **FF-only PASS**;
- Production version: `bd7b5df9-667d-4a8e-93a5-d00f4583d5f0` at **100%**;
- Production build/check: `aaa26d29-24cf-4ad1-abd8-3abdee9b9153` / `97022054088`, **SUCCESS**;
- Production: **10/10 exact Git blobs**, **5/5 privacy**, authenticated F5, 51 photos, 10 photo moments, Realtime active, native actions, console **0/0**.

## Infrastructure and milestone result

- database/schema/RPC/bucket/RLS change: **NONE**;
- Edge Function change: **NONE**;
- secret change: **NONE**;
- manual Cloudflare deployment/configuration change: **NONE**;
- Media truth or Realtime-owner move: **NONE**;
- Timeline/Journey change: **NONE**.

M7.2 is closed; M7 remains in progress.

## Rollback

Rollback is code-only: restore the Gallery owner calls, remove the additive contract surfaces/projections, restore the previous Realtime handling, and remove the M7.2 guard/PCR entry. No data rollback is required.
