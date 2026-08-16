# Platform Change Request — M5.1b Gallery View Trip Contract Adoption

**Status:** IMPLEMENTED / LOCAL VERIFIED / STAGED / NOT COMMITTED / NOT RELEASED
**Masterplan:** M5 — Trip Core Isolation, Durchführung Punkt 1
**Baseline:** App `13.82.0` / Core `4.82.0`, Git `0a2aa60564a75f4723ca11807905f669702e2437`
**Owners:** Platform (PCR/promotion) + Trip (truth/contract) + Consumer (Gallery projection)
**Contract:** existing `trip.v1` (no contract schema, version or adapter change)
**Change type:** contract adoption in one read-only Consumer projection; compatible runtime release; no data migration

## Preflight evidence

The read-only M5.1b preflight confirmed the following at the baseline commit:

- `feature/platform-core` was clean and matched `origin/feature/platform-core`;
- `app/gallery-view.js` is an active Consumer-owned screen loaded by `index.html` and mounted by `app/app-shell.js`;
- exactly two direct `LuviaTripStore` reads exist in `app/gallery-view.js`;
- the file has zero `LuviaTripContext` references;
- the file has zero legacy Trip-event listeners or Trip subscriptions;
- the file has zero direct `.from(...)` or `.rpc(...)` database calls;
- the existing `trip.v1.getActiveTrip()` projection already contains every Trip field used by both reads;
- the controlled safe-regression baseline is 17 / 17 green;
- the cross-core DB ownership baseline is unchanged: mapped 26 / 26, unmapped 39 / 39 and dynamic 27 / 27.

This section records preflight evidence only. The separately recorded local implementation evidence below is green. No commit, push, preview, production or synchronization PASS is claimed.

## Problem

`app/gallery-view.js` belongs to the Consumer experience and must not own or read internal Trip truth directly. At the baseline commit, it reached into `LuviaTripStore.snapshot().activeTrip` at two call sites:

1. `placeContextFor(item)` reads destination name and coordinates for photo/place metadata passed to the existing image-analysis flow;
2. the Gallery download handler reads the active Trip title for the ZIP label.

Both are read-only Consumer projections. Keeping their former direct Store access would have preserved a foreign-domain access path and conflicted with M5 Durchführung Punkt 1, even though the Trip owner already publishes the required normalized data through `trip.v1`.

## Decision

Migrate only these two active-Trip reads to the existing `trip.v1` runtime surface:

- resolve `window.LuviaTripContractV1 || window.LuviaTripContract` through a lazy accessor at the moment of use;
- obtain the current projection through `getActiveTrip()`;
- use `title` for the Gallery download label;
- use `destinationName` and the normalized `destination.name`, `destination.latitude` and `destination.longitude` fields for photo/place context;
- preserve the current neutral behavior when there is no active Trip;
- do not fall back to `LuviaTripStore` or `LuviaTripContext`.

The Gallery script is loaded before the Trip adapter, while the adapter is loaded before App Shell startup and Gallery mount. The lookup must therefore remain lazy. It must not cache an unavailable contract during script evaluation. Re-reading the contract and active Trip at each existing action also keeps Trip switching correct without adding a Gallery-owned cache or subscription.

Trip remains the sole owner of Trip truth. Gallery remains a read-only Consumer projection.

## Ownership and stream lock

- Platform owns this PCR, the controlled implementation on `feature/platform-core`, integration and release promotion.
- Trip continues to own active-Trip truth and the unchanged `trip.v1` contract.
- Consumer owns `app/gallery-view.js` and approves only the two-callsite boundary migration defined here.
- `feature/consumer-experience` must not edit `app/gallery-view.js` concurrently while this PCR is active.
- No other Consumer file is approved by this PCR.
- After production verification, all six active streams must synchronize with the released `main` commit before dependent work continues.

This explicit owner agreement prevents a hidden cross-stream or cross-core change.

## Compatibility

- `window.LuviaGalleryView` and its existing public methods remain unchanged.
- Gallery mount, unmount, refresh, photo viewing, editing, upload, deletion, Realtime and Media behavior remain unchanged.
- Photo/place context retains destination name and coordinates from the current active Trip.
- Gallery ZIP naming retains the active Trip title and the existing neutral `Luvia` fallback.
- The current active Trip is resolved at each relevant action, so a prior Trip selection is not cached in Gallery.
- `trip.v1` remains at major version 1 and its adapter is not modified.
- No event, event target, load order, subscription or public API is changed.
- No legacy global or compatibility bridge is removed.

## Affected streams and exact file allowlists

### PCR-only approval step

The initial PCR step may change exactly one file:

- `docs/modularization/PCR-M5.1B-GALLERY-VIEW-TRIP-CONTRACT-ADOPTION.md`

No runtime, test, version, release or evidence file belongs to this PCR-only step.

### Later implementation and release — maximum approved allowlist

Implementation occurs in `feature/platform-core` under this PCR and follows the standard promotion path through `integration`.

#### Functional and test files

- `app/gallery-view.js` — only the two direct active-Trip reads
- `tests/m5.1b-gallery-view-trip-contract-adoption.test.cjs` — new focused, local and non-destructive M5.1b regression
- `tests/run-m4.3-safe-regression.cjs` — add only the reviewed M5.1b test entry; no runner-logic rewrite

#### Release integration files

- `index.html` — cache-busting version only; no script, stylesheet or load-order change
- `sw.js` — cache identity only
- `force-update.html` — release target only
- `intelligence/kernel/version.js` — App/Core build identity and M5.1b name
- `core/diagnostics/media-readiness.js` — mechanical release comment plus App/Core labels required by the evergreen consistency gate; no diagnostic-logic change
- `CURRENT-BUILD.md` — current-build handoff and evidence references

#### Evidence files

- this PCR
- `RELEASE-NOTES-M5.1B.md` — created only after successful local implementation evidence
- `TEST-RESULTS-M5.1B.md` — created only from actually executed evidence

The maximum later implementation/release allowlist is therefore 12 files. Historical M3/M4/M5.1a evidence and historical version-specific Gallery tests are immutable in this slice.

## Explicit non-goals

- no Trip Core rewrite;
- no new Trip store, context, cache or projection truth;
- no fallback to `LuviaTripStore`, `LuviaTripContext` or another raw provider;
- no `trip.v1` contract, contract JSON, adapter or event change;
- no Trip command or mutation;
- no Active Trip Context centralization from M5 Durchführung Punkt 2;
- no membership, participants, timeline or schedule projection from M5 Durchführung Punkt 3;
- no App Shell, navigation, CSS, layout or Gallery redesign;
- no Gallery Media, clustering, editor, upload, deletion, Storage or Realtime behavior change;
- no Booking or Places migration;
- no direct `LuviaOpenAIProvider` cleanup; that is separate Intelligence/Media boundary debt;
- no database, migration, RPC, Edge Function, Storage, environment or secret change;
- no legacy deletion or deprecation removal;
- no rewrite of historical Gallery tests to manufacture green evidence.

## Database and function impact

- Database migration: **NO**
- SQL deployment: **NO**
- Supabase RPC change: **NO**
- Supabase Edge Function change/deployment: **NO**
- Supabase secret change: **NO**
- Cloudflare secret change: **NO**
- Storage/schema change: **NO**
- destructive or corrective data operation: **NO**

## Release identity

The initial PCR-only documentation step kept App `13.82.0` / Core `4.82.0` unchanged.

The locally verified compatible release candidate is:

- App: `13.82.1`
- Core: `4.82.1`
- Architecture slice: `M5.1b`
- Release name: `M5.1b Gallery View Trip Contract Adoption`

The version bump is required because productive cached JavaScript changes. Contract `trip.v1` remains version 1.

## Test plan

### Focused syntax and behavior

Before any implementation commit:

1. `node --check app/gallery-view.js`
2. `node --check tests/m5.1b-gallery-view-trip-contract-adoption.test.cjs`
3. `node --check tests/run-m4.3-safe-regression.cjs`
4. `node tests/m5.1b-gallery-view-trip-contract-adoption.test.cjs`
5. `node tests/m3.1-trip-contract-adapter.test.cjs`
6. `node tests/m4.3-contract-release-integration-evergreen.test.cjs`
7. `node tests/m4.3-evergreen-foundation-regression.test.cjs`
8. `node tests/m4.2-cross-core-db-ownership-guardrail.test.cjs`
9. `node tests/release-version-consistency.test.cjs`
10. `node tests/run-m4.3-safe-regression.cjs --list`
11. `node tests/run-m4.3-safe-regression.cjs`
12. `git diff --check`
13. exact status, diff, numstat, allowlist and staging inspection

After adding the reviewed test entry, the controlled suite must contain 18 tests and report 18 / 18 green. A historical Gallery test outside the controlled allowlist is not a substitute for the focused M5.1b test.

### Required focused-test evidence

The new M5.1b test must prove:

- Gallery contains zero `LuviaTripStore` and zero `LuviaTripContext` references;
- Gallery contains no legacy Trip event and introduces no Trip subscription;
- both former direct reads use one lazy contract-access path;
- `LuviaTripContractV1` is primary and `LuviaTripContract` is only the supported latest-major alias;
- `getActiveTrip()` is the only Trip read used by the slice;
- contract availability after Gallery script evaluation is honored;
- consecutive calls observe a changed active Trip without a Gallery cache;
- the normalized title produces the Gallery download label;
- normalized destination name and coordinates reach the existing photo/place context;
- a missing active Trip keeps the existing neutral fallback without throwing;
- no Trip command, DB call, RPC, local Trip state or Store/Context fallback is introduced;
- the public `LuviaGalleryView` API and unrelated Gallery behavior remain compatible.

### Historical Gallery baseline

The version-specific files `tests/gallery-experience-v13.28.3.test.cjs`, `tests/gallery-studio-v13.28.4.test.cjs` and `tests/photo-metadata-studio-v13.28.6.test.cjs` contain pre-existing stale expectations and are not in the controlled 17-test baseline. They must not be rewritten, silently counted as green or used to block/approve this Trip-only slice. Any modernization of those historical expectations requires separate scope.

### Static boundary check

After implementation, this command must return no match:

```powershell
rg -n "LuviaTripStore|LuviaTripContext|LuviaAppState|luvia:trips-changed|luvia:trip-changed|luvia:trip-context-changed|\.from\(|\.rpc\(" app/gallery-view.js
```

This command must show only the approved contract read path:

```powershell
rg -n "LuviaTripContractV1|LuviaTripContract|getActiveTrip" app/gallery-view.js
```

### Staging gate

Before commit:

- `git diff --cached --name-only` must match the approved allowlist exactly;
- `git diff --cached --stat` and `git diff --cached --check` must be clean;
- `git diff --cached -- app/gallery-view.js` must contain only the two-callsite migration plus the minimal lazy accessor;
- `git diff --cached -- tests/run-m4.3-safe-regression.cjs` must contain only one M5.1b allowlist entry;
- `index.html` must be inspected with `git diff --numstat` and word-level diff to prevent line-ending or formatting churn;
- no PASS, commit SHA, remote SHA, preview, production or synchronization claim may be recorded without corresponding evidence.

## Rollout

1. implement and validate in `feature/platform-core` under the exact allowlist;
2. commit only the reviewed M5.1b scope;
3. verify commit SHA and clean tree;
4. verify remote SHA before and after push;
5. merge `feature/platform-core` into `integration`;
6. run the complete controlled regression and integration preview smoke;
7. verify authenticated Gallery load, reload, active-Trip switch, download naming, empty Trip state and browser console;
8. promote through `main` only after green evidence;
9. verify production static assets and authenticated Gallery runtime;
10. synchronize all six active streams after the main release.

No feature flag is required because this is a compatible replacement of two read paths, has no persisted state change and has a commit-level rollback.

The browser smoke must not invoke paid or externally mutating AI title generation merely to validate this Trip boundary. The focused local test must stub and prove the photo/place context path.

## Implementation and local evidence

Result: **LOCAL PASS / STAGED / NOT COMMITTED / NOT RELEASED**

- base HEAD: `0a2aa60564a75f4723ca11807905f669702e2437`;
- branch: `feature/platform-core`;
- App/Core candidate: `13.82.1` / `4.82.1`;
- exact prepared and staged PCR scope: 12 / 12 files;
- unexpected files: 0;
- unexpected staged files: 0;
- unstaged and untracked files after staging: 0 / 0;
- Gallery runtime diff: 5 inserted and 2 removed lines;
- focused test-first RED proof: existing 17 tests green and only the new M5.1b gate red before implementation;
- targeted Gallery regression after implementation: 3 / 3 PASS;
- release consistency: PASS;
- controlled safe regression: 18 / 18 PASS;
- direct Gallery Store/Context/AppState, legacy Trip-event and DB/RPC references: 0;
- cross-core DB ownership debt growth: none;
- database, migration, Function, Storage and secret impact: none;
- `git diff --check`: PASS;
- `git diff --cached --check`: PASS;
- commit, push, integration, preview, main, production and stream synchronization: not yet performed.

Local evidence is recorded in `TEST-RESULTS-M5.1B.md`; candidate release notes are recorded in `RELEASE-NOTES-M5.1B.md`.

The pre-commit and staging gates are satisfied. This evidence authorizes the commit step only; it does not satisfy the M5.1b push, integration, release, production or completion gates.

## Rollback

Revert the later M5.1b implementation commit through the owning stream and normal promotion path. Restore the previous two Gallery read expressions only as part of that reviewed revert. No database, migration, storage or data rollback is needed because this slice changes no persisted truth or command.

If the failure occurs before promotion, stop integration and fix or revert in `feature/platform-core`. Do not patch `integration`, `main` or production directly.

## Acceptance criteria

- The staged and committed scope contains only PCR-approved files.
- `app/gallery-view.js` has zero direct `LuviaTripStore` and `LuviaTripContext` references.
- Both former reads use the existing `trip.v1.getActiveTrip()` projection through a lazy accessor.
- No Store/Context fallback, second Trip truth, cache or Trip subscription exists in Gallery.
- Gallery behavior and public API remain compatible for active Trip, switched Trip and no active Trip.
- `trip.v1`, App Shell, CSS, DB, Functions, Storage, Media, Booking, Places and legacy behavior remain unchanged except for mechanical release labels explicitly listed above.
- The targeted test, Trip contract gates, release consistency, cross-core guardrail and controlled 18-test safe regression are green.
- Integration preview and production runtime evidence are recorded before those states are claimed.
- Final local and remote SHAs, clean trees and six-stream synchronization are verified before M5.1b is marked complete.
- M5 remains in progress; this slice does not claim the M5 exit gate.
