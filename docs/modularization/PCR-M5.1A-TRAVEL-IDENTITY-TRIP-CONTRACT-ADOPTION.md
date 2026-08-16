# Platform Change Request — M5.1a Travel Identity Trip Contract Adoption

**Status:** APPROVED FOR IMPLEMENTATION
**Masterplan:** M5 — Trip Core Isolation, Durchführung Punkt 1
**Owners:** Platform + Trip + Control Center
**Contract:** existing `trip.v1` (no contract schema or adapter change)
**Change type:** contract adoption in one read-only consumer projection; additive release integration; no data migration

## Problem

`app/control-center/travel-identity-service.js` is a Control Center projection, but it currently reads Trip truth directly from both `LuviaTripStore` and `LuviaTripContext` and listens to the compatibility event `luvia:trips-changed`.

The versioned `trip.v1` adapter already exposes the required Trip reads. Keeping the direct reads would preserve multiple access paths to the same Trip truth and would conflict with the M5 goal of consolidating important Trip access behind the owner contract.

## Decision

Migrate only the Trip list and active-Trip reads of `LuviaControlCenterTravelIdentity` to the existing `trip.v1` runtime surface:

- `listTrips()` supplies the immutable trip summary list;
- `getActiveTrip()` supplies the canonical active trip;
- `luvia:trip.changed` invalidates the Control Center projection.

`LuviaTravelContext` remains the temporary source for the derived `phase` and `tripDay` fields. Centralizing that derived context belongs to M5 Durchführung Punkt 2 and is explicitly outside M5.1a.

The Control Center projection remains read-only and does not become a second Trip truth.

## Compatibility

- The public `window.LuviaControlCenterTravelIdentity` global remains available.
- Its `snapshot`, `refresh`, `subscribe` and `diagnostics` methods remain available.
- Existing projection fields remain available: `activeTrip`, `upcomingTrip`, `phase`, `tripDay`, `hasActiveTrip`, `hasUpcomingTrip`, `source` and `ownsTripTruth`.
- The experience event `luvia:control-center-travel-identity-changed` remains unchanged.
- `trip.v1` stays at major version 1 and its adapter is not modified.
- Control Center Home, Attention, Booking Control Center and Booking Inbox require no product-code change in this slice.
- No legacy global or compatibility bridge is removed.

## Affected streams and files

Implementation occurs only in `feature/platform-core` and follows the standard promotion path through `integration`.

### Functional files

- `app/control-center/travel-identity-service.js`
- `tests/v13.77.0-control-center-home-travel-identity.test.cjs`

### Release integration files

- `index.html` — cache-busting version only; no load-order change
- `sw.js` — cache name only; no asset-list semantic change
- `force-update.html` — release target only
- `intelligence/kernel/version.js` — App/Core build identity and M5.1a name
- `CURRENT-BUILD.md` — current-build handoff
- `core/diagnostics/media-readiness.js` — only the release comment plus `CORE` and `BUILD` labels required by the evergreen release-consistency gate; no diagnostic logic change

### Evidence files

- this PCR
- M5.1a test/release evidence created only after successful execution

Historical M3/M4 release, deployment, test-result and exit-gate documents are immutable evidence and must not be rewritten.

## Explicit non-goals

- no Trip Core rewrite;
- no new Trip store, context or projection truth;
- no `trip.v1` contract or adapter change;
- no migration of Booking Control Center or Booking Inbox direct Trip reads in this slice;
- no TravelContext centralization;
- no membership, timeline or schedule contract expansion;
- no Consumer redesign or CSS change;
- no database, migration, RPC, Edge Function, Storage or secret change;
- no legacy deletion or deprecation removal;
- no change to Media readiness behavior despite its mechanical release labels.

## Database and function impact

- Database migration: **NO**
- SQL deployment: **NO**
- Supabase Edge Function change/deployment: **NO**
- Supabase secret change: **NO**
- Cloudflare secret change: **NO**
- Storage/schema change: **NO**

## Release identity

Planned runtime release:

- App: `13.82.0`
- Core: `4.82.0`
- Architecture slice: `M5.1a`

The version change is required because productive runtime behavior and cached JavaScript change. Contract version `trip.v1` remains version `1`.

## Test plan

Before staging or commit:

1. `node --check app/control-center/travel-identity-service.js`
2. `node --check tests/v13.77.0-control-center-home-travel-identity.test.cjs`
3. targeted Travel Identity regression
4. M3.1 Trip Contract adapter regression
5. evergreen release-version consistency
6. M4.2 cross-core DB ownership guardrail
7. M4.3 evergreen foundation and contract-release integration gates
8. complete `tests/run-m4.3-safe-regression.cjs` allowlist (17 tests)
9. `git diff --check`
10. exact status, diff and staging inspection

The targeted test must prove that Trip list and active Trip come from `trip.v1`, that the source no longer depends on `LuviaTripStore`, `LuviaTripContext` or `luvia:trips-changed`, and that `phase`/`tripDay` plus the existing Control Center projection remain compatible.

## Rollout

1. implement and validate in `feature/platform-core`;
2. commit only the reviewed M5.1a scope;
3. verify commit SHA and clean tree;
4. verify remote SHA before and after push;
5. merge `feature/platform-core` into `integration`;
6. run full regression and integration preview smoke;
7. promote through `main` only after green evidence;
8. synchronize all active streams after the main release.

No feature flag is required because this is a compatible replacement of a read path behind an existing projection, with a commit-level rollback and no persisted state change.

## Rollback

Revert the M5.1a commit through the owning stream and promotion path. The previous Control Center direct-read implementation can be restored without data rollback because M5.1a changes no persisted truth, schema, contract major or domain command.

## Acceptance criteria

- Travel Identity has zero direct `LuviaTripStore` and `LuviaTripContext` references.
- Travel Identity has zero `luvia:trips-changed` listener references.
- Existing Control Center projection shape and consumer behavior remain compatible.
- No new cross-core DB, provider, RPC, legacy or global-truth access is introduced.
- Targeted, contract, release, guardrail and 17-test safe-regression evidence is green.
- The final staged diff contains only the PCR-approved files.
