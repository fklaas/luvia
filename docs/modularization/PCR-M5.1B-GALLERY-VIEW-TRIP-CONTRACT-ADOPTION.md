# Platform Change Request — M5.1b Gallery View Trip Contract Adoption

**Status:** IMPLEMENTED / PRODUCTION VERIFIED / SIX STREAMS SYNCHRONIZED
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

This section records the historical preflight state only. At that gate no commit, push, Preview, Production or synchronization PASS was claimed; the subsequently executed lifecycle evidence is recorded below.

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

The temporary cross-stream lock was satisfied for implementation and rollout. After Production verification, all six streams synchronized at the runtime release commit. Future Gallery changes require their own normal Consumer ownership review or a new PCR; this closeout does not grant a continuing Platform edit right.

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

### Documentation-only closeout subset

After runtime release and six-stream synchronization, the closeout may update only this four-file subset of the approved evidence scope:

- `CURRENT-BUILD.md`;
- `RELEASE-NOTES-M5.1B.md`;
- `TEST-RESULTS-M5.1B.md`;
- this PCR.

No Runtime, version, test, runner, deployment, configuration, Supabase or historical evidence file belongs to the documentation-only closeout.

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

The released compatible runtime is:

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
7. verify authenticated Gallery load, reload, current active Trip and browser console; verify changed-Trip observation, download naming and the no-Trip state through the focused deterministic gate without mutating cloud-synchronized Trip truth;
8. promote through `main` only after green evidence;
9. verify production static assets and authenticated Gallery runtime;
10. synchronize all six active streams after the main release.

No feature flag is required because this is a compatible replacement of two read paths, has no persisted state change and has a commit-level rollback.

The browser smoke must not invoke paid or externally mutating AI title generation merely to validate this Trip boundary. The focused local test must stub and prove the photo/place context path.

## Implementation, local and staging evidence

Historical pre-commit result: **LOCAL PASS / STAGING PASS**

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
- `git diff --cached --check`: PASS.

At this historical gate, commit, push, integration, Preview, main, Production and stream synchronization had not yet been performed and were not claimed.

## Implementation and rollout evidence

Result: **PASS**

- implementation and runtime release commit: `68e7ff5433e4581eb3c19ef98934302736be84ec`;
- parent baseline: `0a2aa60564a75f4723ca11807905f669702e2437`;
- commit subject: `feat(m5): adopt trip contract in gallery view`;
- exact approved implementation scope: 12 / 12 files;
- clean post-commit tree: confirmed;
- feature push: PASS, local/tracking/live divergence `0 / 0`;
- `integration` fast-forward: PASS, no merge commit;
- controlled regression on `integration`: 18 / 18 PASS;
- Integration Preview static and authenticated runtime smoke: PASS;
- Integration Cloudflare version 184, ID `5272ac11-6b95-4866-86fa-82b8dd610200`;
- `main` fast-forward: PASS, no merge commit;
- controlled regression on `main`: 18 / 18 PASS;
- Production static and authenticated runtime smoke: PASS;
- Production Cloudflare version 185, ID `14a8e2eb-385b-4e2a-80bb-e8056952a991`;
- Production deployment ID `749d237e-47ce-4e71-a1e9-349e4fb9cbc4`, 100 % traffic;
- authenticated Preview and Production: active Trip `Paris Hochzeitstag`, destination Paris, Gallery 51 photos / 10 photo moments / Realtime active, day counts 20 / 27 / 4 / 0 and reload persistence;
- browser console on Preview and Production: zero errors and zero warnings;
- all six active streams synchronized locally, in tracking refs and live on GitHub at `68e7ff5433e4581eb3c19ef98934302736be84ec`, divergence `0 / 0`, clean worktrees;
- force pushes: none;
- database, migration, Function, Storage, secret and corrective-data changes: none.

### Combined browser and deterministic behavior evidence

The authenticated browser smokes prove the deployed current-Trip Gallery load, data, reload and console path. The targeted 3 / 3 runtime test proves the state variants without changing cloud-synchronized user truth:

- the versioned V1 Contract is primary and the supported alias remains compatible;
- late Contract availability is resolved lazily;
- consecutive calls observe a changed active Trip without a Gallery cache;
- normalized destination context reaches the existing photo/place path;
- the current Trip title reaches the logical Gallery collection label;
- no active Trip yields `Luvia Galerie` and null destination values;
- no forbidden legacy global is read and the public Gallery API is unchanged.

A follow-up authenticated safety probe confirmed that the visible selector displayed the existing synchronized active Trip. The UI stated that the active selection is restored across devices; the probe itself did not perform a cross-device or persisted Trip switch. The Browser control boundary intentionally does not allow a hidden main-world Contract override. Seven Trips were read without activating one; no Trip was changed, created, edited or archived, no Gallery ZIP was downloaded, and the temporary test tab was closed. The active Trip remained `Paris Hochzeitstag`, Gallery remained at 51 photos / 10 moments and the console remained empty.

This combined acceptance method is deliberate: it proves the deployed primary path live and the changed/no-Trip variants deterministically, while avoiding a persistent Trip switch or manufactured empty account state. It does not claim that those state variants were performed in the live user account.

### Runtime observations

- Preview Gallery settled from its existing loading/zero state after roughly 9–15 seconds.
- Production Gallery settled from the same state after roughly 20 seconds.
- One exact text locator timed out after the production reload although the final DOM contained the complete correct state; the result was confirmed from the main view and all four day buttons.
- M5.1b changes neither Gallery loading nor Media, Storage or Realtime behavior; no Trip-data or Gallery-data loss was observed.

Release evidence is recorded in `TEST-RESULTS-M5.1B.md` and `RELEASE-NOTES-M5.1B.md`.

`68e7ff5433e4581eb3c19ef98934302736be84ec` remains the implementation and production runtime release SHA. The later documentation-only closeout commit must be inspected, committed, promoted and synchronized separately and is not pre-claimed here.

## Rollback

Revert M5.1b release commit `68e7ff5433e4581eb3c19ef98934302736be84ec` through the owning stream and normal promotion path. Restore the previous two Gallery read expressions only as part of that reviewed revert. No database, migration, storage or data rollback is needed because this slice changes no persisted truth or command.

Because M5.1b is present on `main` and Production, any rollback must be a reviewed revert commit promoted through `feature/platform-core -> integration -> main`. Do not patch `integration`, `main` or Production directly.

## Acceptance criteria

- **PASS** — The staged and committed implementation scope contains only the 12 PCR-approved files; the documentation-only closeout is restricted to the four approved evidence files.
- **PASS** — `app/gallery-view.js` has zero direct `LuviaTripStore` and `LuviaTripContext` references.
- **PASS** — Both former reads use the existing `trip.v1.getActiveTrip()` projection through a lazy accessor.
- **PASS** — No Store/Context fallback, second Trip truth, cache or Trip subscription exists in Gallery.
- **PASS, combined evidence** — Live browser smokes prove the deployed active-Trip Gallery path; the deterministic 3 / 3 gate proves switched-Trip and no-active-Trip variants plus the logical download label without mutating cloud truth.
- **PASS** — `trip.v1`, App Shell, CSS, DB, Functions, Storage, Media, Booking, Places and legacy behavior remain unchanged except for mechanical release labels explicitly listed above.
- **PASS** — The targeted test, Trip contract gates, release consistency, cross-core guardrail and controlled 18-test safe regression are green.
- **PASS** — Integration Preview and Production static plus authenticated runtime evidence are recorded with their actual Cloudflare identities.
- **PASS** — Final runtime-release local/tracking/live SHAs, clean trees and six-stream synchronization were verified before M5.1b was marked complete.
- M5 remains in progress; this slice does not claim the M5 exit gate.
