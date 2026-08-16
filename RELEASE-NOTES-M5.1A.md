# Release Notes — M5.1a Travel Identity Trip Contract Adoption

**Status:** PRODUCTION VERIFIED / SIX STREAMS SYNCHRONIZED
**Masterplan:** M5 — Trip Core Isolation, Durchführung Punkt 1
**App:** 13.82.0
**Core:** 4.82.0
**Contract:** existing `trip.v1`, unchanged at major version 1
**Date:** 2026-08-16

## Outcome

The first productive Control Center Trip-read projection now consumes the versioned Trip owner contract.

`LuviaControlCenterTravelIdentity` obtains:

- the immutable trip list from `trip.v1.listTrips()`;
- the canonical active trip from `trip.v1.getActiveTrip()`;
- Trip invalidation from the versioned `luvia:trip.changed` event.

Direct `LuviaTripStore`, `LuviaTripContext` and `luvia:trips-changed` dependencies were removed from this projection.

## Compatibility

- The public `LuviaControlCenterTravelIdentity` global remains available.
- Its projection fields and experience-level change event remain compatible.
- Control Center Home and Attention require no caller change.
- Booking Control Center and Booking Inbox remain outside this slice.
- `LuviaTravelContext` still supplies `phase` and `tripDay` until M5 Durchführung Punkt 2.
- No Trip contract or adapter change was required.
- No feature flag was introduced.

## Release integration

- all 214 active `index.html` cache-busting references use App 13.82.0;
- Service Worker cache is `luvia-shell-v13.82.0`;
- force-update targets App 13.82.0;
- kernel release identity is App 13.82.0 / Core 4.82.0;
- existing kernel aliases remain intact;
- Media Readiness changed only its three required release labels.

## Data and backend impact

- Database migration: **NO**
- SQL deployment: **NO**
- Supabase Edge Function change/deployment: **NO**
- Supabase or Cloudflare secret change: **NO**
- Storage/schema change: **NO**
- Legacy removal: **NO**

## Validation evidence

- structural file/version/ownership gate: **PASS**
- `git diff --check`: **PASS**
- JavaScript syntax: **PASS**
- targeted Travel Identity regression: **PASS**
- release consistency: **PASS**
- safe regression: **17 / 17 PASS**
- cross-core DB ownership debt growth: **NONE**

See `TEST-RESULTS-M5.1A.md` for the recorded local evidence.

## Promotion status

- Commit: **PASS** — `b4ffe88deddd726854f90e4fff48867deb3a91f9`
- Parent baseline: `de79c904a7aec99975acbf720abc3084714fb152`
- Push to `origin/feature/platform-core`: **PASS**
- Fast-forward to `integration`: **PASS**
- Integration controlled regression: **17 / 17 PASS**
- Integration preview static and authenticated runtime smoke: **PASS**
- Fast-forward to `main`: **PASS**
- Main controlled regression: **17 / 17 PASS**
- Production static and authenticated runtime smoke: **PASS**
- Active-stream synchronization: **6 / 6 PASS** at `b4ffe88d`, local/remote divergence `0 / 0`, clean worktrees

## Runtime verification

Integration preview and Production both confirmed:

- App 13.82.0 / Core 4.82.0;
- Service Worker `luvia-shell-v13.82.0`;
- active Trip and Control Center projection load correctly;
- `Reise öffnen` reaches the Trip surface;
- the authenticated state and Trip projection survive reload;
- browser console reports zero errors and zero warnings;
- internal repository paths remain protected by the SPA fallback.

No Cloudflare version ID is claimed for M5.1a because the ID was not available through the local authenticated tooling. The deployed assets and authenticated runtime were verified directly.

M5.1a is complete. M5 and its exit gate remain in progress.
