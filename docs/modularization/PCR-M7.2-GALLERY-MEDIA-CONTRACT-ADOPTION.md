# PCR M7.2 — Gallery Media Contract Adoption

Status: **FEATURE IMPLEMENTATION COMPLETE / LOCAL ACCEPTANCE PASS**

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

## Rollback

Rollback is code-only: restore the Gallery owner calls, remove the additive contract surfaces/projections, restore the previous Realtime handling, and remove the M7.2 guard/PCR entry. No data rollback is required.
