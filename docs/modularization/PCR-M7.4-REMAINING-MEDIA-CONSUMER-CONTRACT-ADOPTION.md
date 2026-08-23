# PCR M7.4 — Remaining Media Consumer Contract Adoption

Status: **IMPLEMENTED / LOCAL VERIFIED**

Source-lock marker: `1edbe8b96e1be5f71c0967798ac019f1a1022657`

Owner stream: `feature/platform-core`

## Read-only scope lock

After M7.3, two consumer-class artifacts retained eight direct `LuviaMediaCore` references:

- `smart-photo-moments.js`: **3**, classified as a Paris Legacy/Experience path that remains reachable through `paris-official.html` but is not loaded by the current `index.html` app entry;
- `core/media/ai-memory-bridge.js`: **5**, classified as active Intelligence orchestration over Media evidence and commands.

The existing `media.v1` 1.1.0 public projection already contains the fields required by both consumers: Media ID, Trip/participant identity, capture time/day, coordinates, place ID, capture-evidence availability, resolved location, display properties and Media kind. Its command surface already owns Media-to-Place linking.

## Locked implementation scope

- Smart Photo Moments reads images through `media.v1.reads.listMedia`;
- Smart Photo Moments requests signed assets through `media.v1.reads.signedUrl` by Media ID;
- Smart Photo Moments no longer checks or consumes private storage paths, raw metadata or Media entities;
- AI Memory builds evidence only from the sanitized public Media projection;
- AI Memory links Media to Places through `media.v1.commands.media.linkPlace`;
- AI Memory resolves its own proposal-persistence context without borrowing the private Media owner context;
- AI Memory diagnostics report the public Media Contract dependency;
- focused behavioral/static guard plus the canonical Safe Regression entry.

## Explicit non-scope

- no Media, Memory, Album, Card, Journey, Place, Trip or Intelligence truth move;
- no public Contract version or projection extension;
- no Media Clustering owner/context/persistence mutation;
- no Memory Album/Card/Journey owner-service migration;
- no `sync/gallery.js` legacy storage compatibility migration;
- no Timeline/Journey mutation or ownership reclassification;
- no Realtime/hydration owner move;
- no MediaStoragePort, background upload, retry/network transition, LifecyclePort or offline queue implementation;
- no database, schema, RPC, bucket, RLS, Edge Function, secret or deployment-configuration change.

## Local validation

- Smart Photo Moments direct private Media Core refs: **3 -> 0**;
- AI Memory direct private Media Core refs: **5 -> 0**;
- public Media reads: **listMedia / signedUrl**;
- public Media command: **linkPlace**;
- raw storage fields or raw Media metadata in Smart Photo: **0**;
- raw Media metadata reads in AI Memory: **0**;
- focused public-projection and link-command behavior: **PASS**;
- AI profile integration: **PASS**;
- Media Clustering maintained regression: **PASS**;
- M5.2 Trip boundary maintained regression: **PASS**.

The historical release-pinned `ai-memory-bridge-v13.28.2.2.test.cjs` and `media-smart-photo-foundation-v13.28.0.test.cjs` contain stale App/Core and unrelated UI assertions that already diverge from Git HEAD. They are not part of the controlled Safe Regression allowlist and are not rewritten or counted as M7.4 evidence.

## Native Readiness result

The changed consumers now receive Media facts through a versioned public boundary. No private storage path, raw Media metadata, file input, DOM acquisition path, browser storage, navigator capability or device API was added. Smart Photo remains a Web/Experience renderer; AI Memory remains Intelligence orchestration and does not acquire Media truth.

## Rollback

Rollback is code-only: restore the eight direct private Media Core references and remove the focused guard/PCR entry. No data rollback is required.
