# Release Notes — M5.1c Booking Inbox Trip Contract Adoption

**Status:** STAGED RELEASE CANDIDATE / VALIDATION PASS / NOT COMMITTED / NOT RELEASED
**Masterplan:** M5 — Trip Core Isolation, Durchführung Punkt 1
**App:** 13.82.2
**Core:** 4.82.2
**Contract:** existing `trip.v1`, unchanged at major version 1
**Implementation parent:** `f3f7431b2db8344e34d716daed33e10559d9f7cf`
**Date:** 2026-08-17

## Outcome

The productive Booking Inbox now obtains its Trip list and initial active-Trip selection through the existing Trip owner contract.

`app/control-center/booking-inbox.js` obtains:

- selector options and the selected Trip title from `trip.v1.listTrips()`;
- the initial active-Trip ID from `trip.v1.getActiveTrip()` when no explicit or local Inbox selection exists.

The direct `LuviaTripStore.snapshot()` path, the private `tripSnapshot` helper and the redundant `LuviaControlCenterTravelIdentity` fallback were removed from this consumer. The Inbox does not use `LuviaTripContext`, `LuviaAppState`, another Trip provider, a Trip cache, a Trip subscription or a Trip command.

## Runtime design

- `LuviaTripContractV1` is the primary runtime surface.
- `LuviaTripContract` remains the supported latest-major alias.
- Contract lookup is lazy because the Inbox script is evaluated before the Trip adapter and mounted after App Shell startup.
- `listTrips()` and `getActiveTrip()` are the only Trip Contract methods used.
- `options.tripId` keeps precedence over the global active Trip.
- A user-selected `selectedTripId` remains local Inbox UI state across later loads.
- Manual Inbox selection does not call `selectActiveTrip()` or mutate global Trip truth.
- Missing Contract, empty Trip list and missing active Trip degrade to an empty selector and null selection without a Booking read for a null Trip ID.

## Ownership and compatibility

- Trip remains the sole owner of Trip-list and active-Trip truth.
- Booking remains the sole owner of Booking, Message, Conversation, Preference, Intelligence and mutation truth.
- Booking Inbox remains a Control Center / Experience projection with local UI selection only.
- `LuviaBookingIntegration || LuviaBooking` remains the Booking API boundary.
- `listForTrip(selectedTripId)`, Conversation, Preference, Intelligence and Reply operations remain unchanged.
- The public frozen `window.LuviaBookingInbox` surface remains `version`, `mount`, `unmount`, `load`, `render` and `diagnostics`.
- Diagnostics retain `ownsMessageTruth:false`, `ownsBookingTruth:false`, `source:'booking-core'` and `hardDeletesMessageTruth:false`.
- No App Shell, Navigation, CSS, UI, Contract JSON, adapter, event or load-order change was required.
- No feature flag was introduced because no persisted state or Contract major changes.

## Release integration

- all 214 active `index.html` cache-busting references use App 13.82.2;
- active App 13.82.1 references in the five candidate Runtime/cache files are zero;
- Service Worker cache is `luvia-shell-v13.82.2`;
- force-update targets App 13.82.2;
- kernel release identity is App 13.82.2 / Core 4.82.2;
- kernel release name is `M5.1c Booking Inbox Trip Contract Adoption`;
- kernel aliases remain intact;
- Media Readiness changed only its release comment, `CORE` and `BUILD` labels;
- after reversing only the cache version and normalizing line endings, `index.html` equals the implementation parent exactly;
- no asset, stylesheet, script or load-order change exists;
- `CURRENT-BUILD.md` identifies this work as an uncommitted `feature/platform-core` release candidate and preserves the actual current Production release separately.

## Data and backend impact

- Database migration: **NO**
- SQL deployment: **NO**
- Supabase RPC change: **NO**
- Supabase Edge Function change/deployment: **NO**
- Supabase or Cloudflare secret change: **NO**
- Storage/schema change: **NO**
- destructive or corrective data operation: **NO**
- Trip, Booking or Message truth duplication: **NO**
- legacy removal outside the one approved consumer fallback: **NO**

## Test-first evidence

The focused M5.1c test was created and executed before Runtime implementation.

Against unchanged Runtime it reported:

```text
tests: 3
pass: 0
fail: 3
```

The failures identified the known direct TripStore/Travel-Identity boundary, the private `tripSnapshot` helper and missing `trip.v1` usage. Test syntax was green, and the existing controlled 18-test baseline remained 18 / 18 green. The RED state was therefore caused by the intended boundary rather than a broken harness.

## Local validation evidence

- JavaScript syntax for Runtime, focused test and runner: **PASS**;
- targeted Booking Inbox Trip Contract regression: **3 / 3 PASS**;
- compatible Booking Actions / Intelligence boundary check: **PASS**;
- Trip Contract Adapter: **PASS**;
- evergreen Contract release integration: **PASS**;
- evergreen foundation regression: **PASS**;
- release consistency: **PASS** — App 13.82.2 / Core 4.82.2;
- controlled safe regression: **19 / 19 PASS**;
- runner allowlist: **19 unique paths / 0 duplicates / exactly one M5.1c entry**;
- cross-core DB ownership debt growth: **NONE**;
- direct Inbox Store/Context/AppState/Travel-Identity, Trip-event, subscription, command, DB and RPC references: **0**;
- `git diff --check`: **PASS**;
- approved working-tree scope after evidence creation: **12 / 12 PCR files**.

See `TEST-RESULTS-M5.1C.md` for the command-level local evidence.

## Current Git boundary

- Branch: `feature/platform-core`
- Local HEAD: `f3f7431b2db8344e34d716daed33e10559d9f7cf`
- Tracking HEAD before evidence creation: `f3f7431b2db8344e34d716daed33e10559d9f7cf`
- Live `origin/feature/platform-core` before evidence creation: `f3f7431b2db8344e34d716daed33e10559d9f7cf`
- Staged files before the staging gate: **0**
- Implementation commit: **NONE**
- Push: **NONE**
- Force push: **NONE**

Verified staging result:

- staged allowlist: **12 / 12 approved paths**;
- unexpected staged files: **0**;
- unstaged files: **0**;
- untracked files: **0**;
- `git diff --cached --check`: **PASS**;
- staged Runtime: **3 insertions / 3 deletions**;
- staged runner: **exactly one M5.1c entry**;
- staged `index.html`: **214 App 13.82.2 tokens and no semantic change beyond the version token**;
- complete post-staging syntax, Contract, release, guardrail and controlled regression: **PASS — 19 / 19**.

## Promotion status

- Exact staging inspection: **PASS**
- Implementation commit: **PENDING**
- Push to `origin/feature/platform-core`: **PENDING**
- Integration fast-forward and 19-test regression: **PENDING**
- Integration Preview static verification: **PENDING**
- Authenticated non-mutating Inbox Preview smoke: **PENDING**
- Main fast-forward and 19-test regression: **PENDING**
- Production static verification: **PENDING**
- Authenticated non-mutating Inbox Production smoke: **PENDING**
- Cloudflare version/deployment/traffic evidence: **PENDING**
- Six-stream synchronization: **PENDING**

No commit SHA, Remote update, Preview, Production, Cloudflare identity or synchronization result is claimed by this local release-candidate document.

## Rollback boundary

Before Production, stop promotion and correct or review-revert the implementation only in `feature/platform-core`. After Production, revert the later implementation commit through `feature/platform-core -> integration -> main -> production` and synchronize all streams again.

No database, migration, schema, Storage or data rollback is required because M5.1c changes no persisted truth or command.

## Current result

M5.1c local implementation, release identity and controlled feature validation: **PASS**.

M5.1c exact staging and post-staging validation: **PASS**.

M5.1c commit, promotion, Preview, Production and stream synchronization: **OPEN / NOT YET CLAIMED**.

M5 remains **IN PROGRESS** and its exit gate remains unclaimed.
