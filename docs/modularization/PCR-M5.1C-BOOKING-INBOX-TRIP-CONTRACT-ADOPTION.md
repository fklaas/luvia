# Platform Change Request — M5.1c Booking Inbox Trip Contract Adoption

**PCR ID:** `M5.1c`
**Status:** COMPLETE / PRODUCTION VERIFIED / SIX STREAMS SYNCHRONIZED
**Masterplan:** M5 — Trip Core Isolation, Durchführung Punkt 1
**Baseline:** App `13.82.1` / Core `4.82.1`, Git `487d137c36a9a4fc0a0daa1740d4e6350b9a8907`
**Implementation parent:** `f3f7431b2db8344e34d716daed33e10559d9f7cf` (approved PCR commit)
**Requester and implementation stream:** `feature/platform-core`
**Owners:** Platform (PCR/lock/implementation/promotion) + Trip (truth/contract) + Control Center (Inbox projection) + Booking (business-boundary review)
**Contract:** existing `trip.v1` (no contract schema, major version, JSON or adapter change)
**Change type:** adoption of an existing owner contract in exactly one read-only Control Center projection; compatible runtime release; no data migration

## Preflight evidence

The read-only M5.1c preflight confirmed the following at the common six-stream baseline:

- `feature/platform-core` was clean at `487d137c36a9a4fc0a0daa1740d4e6350b9a8907`;
- local HEAD, the tracking ref and the live `origin/feature/platform-core` ref matched, with divergence `0 / 0`;
- the current release identity was App `13.82.1` / Core `4.82.1`;
- `app/control-center/booking-inbox.js` is an active Control Center / Experience projection loaded by `index.html` and mounted by `app/app-shell.js`;
- the source contains exactly one literal direct `LuviaTripStore` access, through `window.LuviaTripStore?.snapshot?.()`;
- that internal snapshot supplies the Trip list, active-Trip ID, initial Inbox selection, Trip selector and Conversation Trip title;
- active-Trip resolution also contains one fallback to the public `LuviaControlCenterTravelIdentity` projection;
- the source contains zero `LuviaTripContext` and zero `LuviaAppState` references;
- the source contains zero Trip-event listeners and zero Trip subscriptions;
- the source invokes no Trip command;
- the source contains zero direct `.from(...)` and zero direct `.rpc(...)` database calls;
- Booking list, Conversation, Preference, Intelligence and Reply operations already go through `LuviaBookingIntegration || LuviaBooking`;
- the existing `trip.v1.listTrips()` and `trip.v1.getActiveTrip()` reads cover the complete Trip data need of this slice;
- Booking Inbox loads at `index.html:89`, the Trip adapter at `index.html:210`, and App Shell at `index.html:220`, so a lazy Contract lookup is required and no load-order change is needed;
- the controlled safe-regression baseline executed in the Platform worktree and passed `18 / 18`;
- the cross-core DB ownership baseline remained unchanged: 327 tracked JS/TS files, 316 static DB calls, mapped 26 / 26, unmapped 39 / 39 and dynamic 27 / 27.

This section records read-only preflight evidence only. At this gate no M5.1c Runtime or test implementation, version bump, staging, commit, push, Integration, Preview, Main, Production, Cloudflare identity or stream synchronization has occurred or is claimed.

## Problem

`app/control-center/booking-inbox.js` is a Control Center projection. It owns neither Trip truth nor Booking truth, but it currently reads Trip internals through `LuviaTripStore.snapshot()`.

The direct Store entry supplies both the Trip list and the active-Trip selection even though the Trip owner already publishes the required immutable projections through `trip.v1`. Keeping that internal read would preserve a foreign-domain access path beside the owner Contract and conflict with M5 Durchführung Punkt 1 and the rule that cross-core reads use Contracts, Projections or Events.

The Inbox-local `selectedTripId` remains legitimate view and selection state. It identifies which Trip's Bookings the user is currently viewing; it is not and must not become a second global active-Trip truth.

## Decision

Migrate only the Booking Inbox Trip-list and initial active-Trip reads to the existing `trip.v1` Runtime surface:

- resolve `window.LuviaTripContractV1 || window.LuviaTripContract` through one lazy accessor at the moment of use;
- use `listTrips()` for the Trip selector and the selected Trip title in the Conversation projection;
- use `getActiveTrip()` only to derive the initial active-Trip ID when no explicit Inbox Trip selection exists;
- preserve `options.tripId` precedence in `mount(el, options)`;
- preserve a user-selected `selectedTripId` as local Inbox UI state during later loads and renders;
- keep `LuviaBooking.listForTrip(selectedTripId)` or its existing integration alias as the Booking-owner query;
- do not call `selectActiveTrip()` or another Trip command when the Inbox selector changes;
- do not add an Inbox-owned Trip cache, global, Context, Projection truth, subscription or event listener;
- return a neutral empty Trip list and null active-Trip ID without throwing when the Contract or active Trip is unavailable.

The existing Inbox fallback to `LuviaControlCenterTravelIdentity` is removed from this read path. Travel Identity already reads the same `trip.v1` owner Contract, and the productive load order makes the lazy Contract available before Inbox mount. Keeping both paths would add a redundant projection lookup without providing another owner. This PCR does not remove or modify the global Travel Identity projection or any of its other consumers.

Trip remains the sole owner of Trip-list and active-Trip truth. Booking remains the sole owner of Booking, Message, Conversation, Intelligence and mutation truth. Booking Inbox remains a read-only Control Center projection with local UI selection state only.

## Load order and events

- Booking Inbox is evaluated before the Trip adapter.
- The Trip adapter is evaluated before App Shell startup and the productive Inbox mount.
- The Contract must therefore be resolved lazily and must not be cached as unavailable during script evaluation.
- Repeated explicit loads and renders must observe the then-current Contract projection without an Inbox-owned cache.
- The script order in `index.html` remains unchanged.
- No Trip event, event target or Trip subscription is added.
- A new active-Trip listener is deliberately excluded because it could overwrite a Trip that the user intentionally selected inside the Inbox.

The Inbox keeps its current behavior: `options.tripId` wins, otherwise the active Trip supplies the initial selection; manual selector changes remain local until unmount resets the Inbox state.

## Ownership and temporary stream lock

- Platform owns this PCR, the controlled implementation on `feature/platform-core`, the temporary file lock, Integration and release promotion.
- Trip owns Trip-list and active-Trip truth and the unchanged `trip.v1` Contract.
- Control Center / Experience owns `app/control-center/booking-inbox.js` and approves only the boundary migration defined by this PCR.
- Booking owns all existing Booking and Message operations and approves no semantic change to them.
- `feature/booking-core` and `feature/consumer-experience` must not edit `app/control-center/booking-inbox.js` concurrently while this PCR is active.
- No other Control Center, Consumer, Booking or Trip file is approved through the cross-stream lock.
- The lock ends after verified Production closeout and six-stream synchronization.
- This PCR does not grant Platform a permanent edit right to the Inbox file; normal file and domain ownership resumes after closeout.

The mandatory promotion path is:

`feature/platform-core -> integration -> controlled regression -> integration preview -> main -> production`

## Compatibility

- `window.LuviaBookingInbox` remains available.
- Its public keys remain `version`, `mount`, `unmount`, `load`, `render` and `diagnostics`.
- Mount and unmount lifecycle remain unchanged.
- `options.tripId` remains supported and retains precedence over the global active Trip.
- Without an explicit option, the current `trip.v1.getActiveTrip()` projection remains the initial default.
- The Inbox Trip selector remains local and does not mutate global active-Trip truth.
- Trip IDs and titles remain available to the selector and Conversation heading through `listTrips()`.
- Booking loading remains `listForTrip(selectedTripId)` through the existing Booking API.
- Conversation loading, personal read/seen handling, Preferences, Archive/Delete projection state, Intelligence Actions and Reply transport remain unchanged.
- The existing `localStorage` fallback remains limited to personal per-Booking seen timestamps and is not extended into Trip, Booking or Message truth.
- Diagnostics and the declarations `ownsMessageTruth:false`, `ownsBookingTruth:false`, `source:'booking-core'` and `hardDeletesMessageTruth:false` remain compatible.
- `trip.v1` remains at major version 1 and its Contract JSON and adapter are not modified.
- No event, load order, App Shell, Navigation, CSS or public API changes.
- No global or compatibility bridge is deleted; only the redundant Travel Identity read from this one consumer is removed.

## Affected streams and exact file allowlists

### PCR-only approval step

The initial PCR-only step may create or change exactly one file:

- `docs/modularization/PCR-M5.1C-BOOKING-INBOX-TRIP-CONTRACT-ADOPTION.md`

No Runtime, test, runner, version, release, `CURRENT-BUILD.md`, deployment or evidence file belongs to this PCR-only step.

### Later implementation and release — maximum approved allowlist

Later implementation occurs only in `feature/platform-core`, under this approved PCR and after a fresh state and scope check.

#### Functional and test files

1. `app/control-center/booking-inbox.js` — only the Trip-list and initial active-Trip boundary migration
2. `tests/m5.1c-booking-inbox-trip-contract-adoption.test.cjs` — new focused, local, deterministic and non-destructive M5.1c regression
3. `tests/run-m4.3-safe-regression.cjs` — add exactly one reviewed M5.1c test entry; no runner-logic rewrite

#### Mechanical release-integration files

4. `index.html` — cache-busting version only; no script, stylesheet or load-order change
5. `sw.js` — cache identity only
6. `force-update.html` — release target only
7. `intelligence/kernel/version.js` — App/Core build identity and M5.1c name
8. `core/diagnostics/media-readiness.js` — mechanical release comment plus App/Core labels required by the evergreen release gate; no diagnostic-logic change
9. `CURRENT-BUILD.md` — current-build handoff and evidence references

#### Governance and evidence files

10. this PCR
11. `RELEASE-NOTES-M5.1C.md` — create only from actually verified local/release evidence
12. `TEST-RESULTS-M5.1C.md` — create only from actually executed tests and checks

The maximum later implementation/release allowlist is therefore exactly 12 files. It must be rechecked before implementation and again before staging. Historical M3, M4, M5.1a and M5.1b evidence and historical version-specific Booking Inbox tests are immutable in this slice.

### Documentation-only closeout subset

After a verified Runtime release, the separate documentation-only closeout may change at most:

- `CURRENT-BUILD.md`;
- `RELEASE-NOTES-M5.1C.md`;
- `TEST-RESULTS-M5.1C.md`;
- this PCR.

No Runtime, version, test, runner, Supabase, configuration or deployment file belongs to a documentation-only closeout.

## Explicit non-goals

- no Trip Core rewrite;
- no new Trip Store, Context, cache, global or projection truth;
- no fallback to `LuviaTripStore`, `LuviaTripContext`, `LuviaAppState`, `LuviaControlCenterTravelIdentity` or another raw/parallel Trip provider from Booking Inbox;
- no `trip.v1` Contract, Contract JSON, adapter, event or major-version change;
- no Trip command, mutation or active-Trip selection side effect;
- no Trip event listener or subscription;
- no Active Trip Context centralization from M5 Durchführung Punkt 2;
- no membership, participant, timeline or schedule work from M5 Durchführung Punkt 3;
- no change to `app/control-center/booking-control-center.js` or its separate Trip dependencies;
- no Booking Timeline, Modify, Cancel or lifecycle change;
- no Conversation, Reply, Archive, Delete, Preference, Intelligence or read-state behavior change;
- no Booking Core, Booking Integration, provider or Function change;
- no App Shell, Navigation, ProductModule, Capability, CSS, layout or UI redesign;
- no script load-order change;
- no database migration, SQL, RPC, Edge Function, Storage, environment or secret change;
- no corrective or destructive data operation;
- no Legacy deletion or deprecation cleanup;
- no modernization of historical release tests to manufacture green evidence;
- no claim that M5.1c completes M5 or satisfies the M5 exit gate.

## Database, function and infrastructure impact

- Database migration: **NO**
- SQL deployment: **NO**
- Supabase RPC change: **NO**
- Supabase Edge Function change/deployment: **NO**
- Supabase secret change: **NO**
- Cloudflare secret change: **NO**
- Storage/schema change: **NO**
- Environment/configuration change: **NO**
- Trip, Booking or Message data correction: **NO**
- destructive data operation: **NO**

The existing personal seen timestamp in `localStorage` is not Domain truth and is outside this Trip-read migration. No Trip, Booking or Message truth is duplicated locally.

## Release identity

The PCR-only documentation step keeps the current release unchanged:

- App: `13.82.1`
- Core: `4.82.1`
- Runtime release: none

The compatible Runtime candidate prepared after the approved test-first implementation is:

- App: `13.82.2`
- Core: `4.82.2`
- Architecture slice: `M5.1c`
- Release name: `M5.1c Booking Inbox Trip Contract Adoption`

The compatible runtime is released at App `13.82.2` / Core `4.82.2` through implementation commit `83aae200b77aa7791f1d8d51b471af07506bdc0a`. Integration Preview and Production were statically and authentically verified. The version bump is required because productive cached JavaScript changed. Contract `trip.v1` remains version 1. Documentation closeout and final six-stream synchronization remain open.

## Test plan

### Test-first requirement

Before Runtime implementation, add the focused M5.1c test and execute it against the unchanged source to record an expected RED boundary result while the existing 18-test controlled baseline remains green. The RED result must be caused by the known direct TripStore boundary, not by a broken harness. No historical test is rewritten for this proof.

### Focused syntax, behavior and repository gates

Before any later implementation commit:

1. `node --check app/control-center/booking-inbox.js`
2. `node --check tests/m5.1c-booking-inbox-trip-contract-adoption.test.cjs`
3. `node --check tests/run-m4.3-safe-regression.cjs`
4. `node tests/m5.1c-booking-inbox-trip-contract-adoption.test.cjs`
5. `node tests/v13.80.0-booking-actions-intelligence.test.cjs`
6. `node tests/m3.1-trip-contract-adapter.test.cjs`
7. `node tests/m4.3-contract-release-integration-evergreen.test.cjs`
8. `node tests/m4.3-evergreen-foundation-regression.test.cjs`
9. `node tests/m4.2-cross-core-db-ownership-guardrail.test.cjs`
10. `node tests/release-version-consistency.test.cjs`
11. `node tests/run-m4.3-safe-regression.cjs --list`
12. `node tests/run-m4.3-safe-regression.cjs`
13. `git diff --check`
14. exact status, diff, numstat, allowlist and staging inspection

After exactly one reviewed runner entry is added, the controlled suite must contain exactly 19 tests and report 19 / 19 green.

### Required focused-test evidence

The new focused test must prove:

- Booking Inbox contains zero `LuviaTripStore`, zero `LuviaTripContext`, zero `LuviaAppState` and zero `LuviaControlCenterTravelIdentity` Trip-read references;
- the source contains no legacy Trip event, Trip subscription, Trip command, direct `.from(...)` call or direct `.rpc(...)` call;
- exactly one lazy Contract access path resolves `LuviaTripContractV1` first and `LuviaTripContract` only as the supported latest-major alias;
- only `listTrips()` and `getActiveTrip()` are used from the Trip Contract;
- `listTrips()` supplies the selector options and selected Trip title;
- `getActiveTrip()` supplies the initial active-Trip ID only when `options.tripId` is absent;
- a Contract that becomes available after Inbox script evaluation is used correctly;
- later explicit calls see changed Contract projections without an Inbox-owned Trip cache;
- `options.tripId` retains precedence;
- a manual Inbox selector change remains local and invokes no Trip selection command;
- `listForTrip(selectedTripId)` remains a Booking-owner call;
- Conversation, Preference, Intelligence and Reply calls remain behind the Booking owner API;
- missing Contract, empty Trip list and missing active Trip stay neutral without throwing;
- the public `LuviaBookingInbox` API keys and Diagnostics contract remain unchanged;
- unrelated Booking Inbox behavior remains compatible.

The test may instrument internal helpers only in its in-memory VM source. Production Runtime must not expose a new public test API.

Legacy-global getters in the VM should throw if the implementation touches a forbidden Store, Context, AppState or Travel Identity fallback. The Contract proxy should allow only the approved read methods.

### Historical Booking Inbox evidence

The following version-specific tests contain historical release expectations and are not substitutes for the new Evergreen M5.1c gate:

- `tests/v13.79.0-booking-inbox-conversations.test.cjs` — historical composer-transport expectation;
- `tests/v13.80.1-booking-inbox-composer-send-reliability.test.cjs` — fixed App/Core/cache identity;
- `tests/v13.80.2-reply-verification-mobile-inbox.test.cjs` — fixed App/Core/cache identity;
- `tests/v13.81.0-booking-timeline-modify-cancel-conversation-lifecycle.test.cjs` — fixed Booking Integration version `1.17.0`, while the current Runtime is newer.

They must not be silently added to the controlled allowlist, rewritten in this slice or counted as green. Any modernization requires separate scope. `tests/v13.80.0-booking-actions-intelligence.test.cjs` is a compatible focused Booking-boundary check and remains part of the explicit M5.1c test plan, but it does not replace the new Trip-boundary test.

### Static boundary checks

After implementation, this command must return no match:

```powershell
rg -n "LuviaTripStore|LuviaTripContext|LuviaAppState|LuviaControlCenterTravelIdentity|luvia:trips-changed|luvia:trip-changed|luvia:trip-context-changed|\.from\(|\.rpc\(" app/control-center/booking-inbox.js
```

This command must show only the approved lazy Contract read path:

```powershell
rg -n "LuviaTripContractV1|LuviaTripContract|listTrips|getActiveTrip" app/control-center/booking-inbox.js
```

### Staging gate

Before a later commit:

- `git diff --cached --name-only` must match the approved 12-file allowlist exactly;
- unexpected untracked, unstaged or staged files must be zero;
- `git diff --cached --stat` and `git diff --cached --check` must be inspected and clean;
- the staged Inbox diff must contain only the minimal lazy accessor and the two approved read substitutions;
- the staged runner diff must contain exactly one M5.1c allowlist entry and no runner-logic change;
- `index.html` must be inspected with numstat and word-level diff to prevent line-ending or formatting churn;
- version and evidence documents must contain only results that have actually been executed;
- no PASS, SHA, Remote, Preview, Production, Cloudflare or synchronization claim may appear without corresponding evidence.

## Feature implementation evidence — 2026-08-17

The approved local feature implementation has been executed against implementation parent `f3f7431b2db8344e34d716daed33e10559d9f7cf`.

Verified test-first sequence:

- the new focused test was added before Runtime changes;
- against unchanged Runtime it reported the intended RED result: 0 passed and 3 failed;
- the failures identified `LuviaTripStore`, `LuviaControlCenterTravelIdentity`, the private `tripSnapshot` path and missing `trip.v1` usage;
- the existing controlled 18-test baseline remained 18 / 18 green during the RED proof;
- no historical release test was rewritten to manufacture the result.

Verified Runtime and ownership result:

- `app/control-center/booking-inbox.js` has a 3-insertion / 3-deletion functional diff limited to the approved Trip read helpers;
- one lazy resolver prefers `LuviaTripContractV1` and falls back only to `LuviaTripContract`;
- the Trip list uses exactly one `listTrips()` Contract read;
- the initial active-Trip ID uses exactly one `getActiveTrip()` Contract read;
- direct Inbox references to `LuviaTripStore`, `LuviaTripContext`, `LuviaAppState`, `LuviaControlCenterTravelIdentity` and `tripSnapshot` are zero;
- direct Inbox Trip events, subscriptions, commands, `.from(...)` and `.rpc(...)` calls are zero;
- Inbox-local `selectedTripId` remains local UI state and does not mutate global Trip truth;
- Booking list, Conversation, Preference, Intelligence and Reply operations remain behind the Booking owner API;
- the public Inbox API and Diagnostics ownership declarations remain unchanged.

Verified release-candidate integration:

- exactly one M5.1c test entry was added to the controlled runner;
- the allowlist contains 19 unique paths and zero duplicates;
- App identity is `13.82.2`, Core identity is `4.82.2` and the Service Worker cache is `luvia-shell-v13.82.2`;
- all 214 active `index.html` cache markers changed from `13.82.1` to `13.82.2`;
- after reversing only that version token and normalizing line endings, the complete `index.html` content equals the implementation parent, proving unchanged assets and load order;
- the release-consistency gate reports `Build 13.82.2 / Core 4.82.2 release consistency: OK`;
- the focused M5.1c regression reports 3 / 3 pass;
- the compatible Booking Actions / Intelligence boundary check passes;
- Trip Contract, evergreen Contract release integration and foundation gates pass;
- the controlled safe regression reports 19 / 19 pass;
- the cross-core DB ownership baseline remains 327 tracked JS/TS files, 316 static DB calls, mapped 26 / 26, unmapped 39 / 39 and dynamic 27 / 27;
- `git diff --check` reports no whitespace error.

Verified Git boundary before evidence-file creation:

- branch: `feature/platform-core`;
- local HEAD, tracking HEAD and live `origin/feature/platform-core` all equal `f3f7431b2db8344e34d716daed33e10559d9f7cf`;
- staged files: zero;
- implementation commit: none;
- push: none;
- Integration, Preview, Main, Production, Cloudflare and six-stream synchronization evidence: not yet claimed.

Verified staging gate after evidence-file creation:

- exactly the 12 PCR-approved files were staged through an explicit path list;
- unexpected staged files: zero;
- unstaged files: zero;
- untracked files: zero;
- `git diff --cached --check`: pass;
- staged Runtime numstat: 3 insertions / 3 deletions;
- staged runner numstat: 4 insertions / 0 deletions with exactly one M5.1c entry;
- staged `index.html`: 214 App `13.82.2` tokens, zero App `13.82.1` tokens and complete equality to the implementation parent after reversing only the version token and normalizing line endings;
- staged focused, Booking boundary, Trip Contract, Contract release, foundation, DB guardrail and release-consistency gates: pass;
- staged controlled safe regression: 19 / 19 pass;
- implementation commit and push: none.

`RELEASE-NOTES-M5.1C.md` and `TEST-RESULTS-M5.1C.md` record the same bounded local evidence. Later staging and rollout sections must be updated only after their corresponding commands and external verifications have actually completed.

## Rollout and feature gate

1. create and review this PCR-only file on clean `feature/platform-core`;
2. before Runtime work, reverify local, tracking and live Remote SHA plus the exact PCR allowlist;
3. add and execute the focused M5.1c test first to record the expected boundary RED result;
4. implement and validate only the approved 12-file maximum scope;
5. stage only the reviewed scope and execute every syntax, behavior, release, guardrail, regression, diff and staging gate;
6. commit only after those gates are green;
7. verify the implementation commit SHA and clean tree;
8. verify live Remote SHA immediately before and after pushing `feature/platform-core`;
9. integrate through `integration` without bypassing it;
10. execute the complete 19-test controlled regression on Integration;
11. verify Integration Preview static assets and authenticated Inbox Runtime;
12. promote to `main` only after green Integration evidence;
13. execute the complete 19-test controlled regression on Main;
14. verify Production static assets and authenticated Inbox Runtime;
15. record actual Cloudflare version/deployment identities and traffic only after direct verification;
16. perform the separate documentation-only closeout;
17. synchronize all six active streams locally, in tracking refs and live on GitHub before marking the slice complete.

Authenticated Preview and Production smoke should use a narrow/mobile Inbox state or another demonstrably non-mutating path so the current desktop auto-selection does not mark a Conversation as read. The smoke may verify Inbox load, Contract-supplied Trip selector, selected Trip, Booking list, neutral state, reload and browser console. It must not send a Reply, execute an Intelligence Action, change Archive/Delete/Preference state, select the global active Trip or create/update Booking, Message or Trip truth merely to prove this boundary. State variants must be covered deterministically by the focused local test.

No feature flag is required because this is a compatible replacement of a read path, changes no persisted state or Contract major, and has a commit-level Git rollback.

## Verified rollout evidence — 2026-08-17

Result: **PASS / COMPLETE — PRODUCTION VERIFIED / SIX STREAMS SYNCHRONIZED**

Verified Git and rollout evidence:

- approved PCR commit: `f3f7431b2db8344e34d716daed33e10559d9f7cf`;
- implementation release commit: `83aae200b77aa7791f1d8d51b471af07506bdc0a`;
- implementation subject: `feat(m5): adopt trip contract in booking inbox`;
- feature Remote push: PASS;
- Integration fast-forward: PASS, no merge commit;
- Integration controlled regression: 19 / 19 PASS;
- Integration Preview static verification: PASS;
- Integration authenticated non-mutating runtime smoke: PASS;
- Main fast-forward: PASS, no merge commit;
- Main Remote push: PASS;
- Main local/tracking/live Remote SHA: `83aae200b77aa7791f1d8d51b471af07506bdc0a`;
- Main post-push divergence: `0 / 0`;
- Main controlled regression after promotion: 19 / 19 PASS;
- Production static verification: PASS;
- Production authenticated non-mutating runtime smoke: PASS;
- Production console: 0 errors / 0 warnings;
- force pushes: none.

Preview and Production runtime behavior confirmed that the Inbox consumes Trip projection state without changing global Trip truth:

- active Trip remained `Paris Hochzeitstag`;
- Paris showed 23 Booking conversations;
- Inbox-local Munich selection showed 0;
- global active Trip remained Paris;
- returning the Inbox selector to Paris restored 23;
- Café-Berry thread and Luvia Intelligence loaded;
- reply field and sending boundary remained available;
- reload persistence passed;
- no Reply, Archive, Delete or Booking mutation was executed.

No M5.1c Cloudflare Worker version, deployment ID or traffic identity is claimed because no direct identity evidence has been recorded.

Final six-stream synchronization was verified at acceptance snapshot `90fde6c458e4589d92dcc747978cac3853260e1d`.

At that snapshot all six active streams matched locally, in tracking refs and live on GitHub, each with divergence `0 / 0` and a clean working tree.

The aggregate synchronization gate returned `FINAL 6/6 RESULT: True`.

Therefore M5.1c satisfies its implementation, validation, promotion, Preview, Production and active-stream synchronization acceptance criteria and is **COMPLETE**.

This later COMPLETE-marker documentation change does not pre-claim its own future commit SHA or synchronization state. That administrative marker commit must still follow the controlled Git path.

M5 itself remains **IN PROGRESS** and the M5 exit gate remains unclaimed.
## Rollback

Before Production, stop promotion and correct or review-revert the implementation only in `feature/platform-core`; do not patch `integration`, `main` or Production directly.

After Production, revert the later M5.1c implementation commit through the owning stream, rerun the controlled regression, and promote the revert through `feature/platform-core -> integration -> main -> production`. Synchronize all streams again after the revert release.

No DB, migration, schema, Storage or data rollback is required because this slice changes no persisted truth or command. A temporary Cloudflare deployment rollback may reduce immediate Runtime impact but does not replace the Git revert as Source of Truth.

## Acceptance criteria

- The implemented and staged scope contains only the PCR-approved files.
- Booking Inbox has zero direct Store, Context, AppState or Travel Identity Trip-read references.
- Trip list and initial active Trip come lazily from `trip.v1.listTrips()` and `trip.v1.getActiveTrip()`.
- No Store/Context/projection fallback, second Trip truth, Trip cache, Trip subscription or Trip command exists in Booking Inbox.
- Inbox-local selection remains UI state and never mutates global active-Trip truth.
- Booking owner APIs, public Inbox API, Diagnostics and unrelated Inbox behavior remain compatible.
- Contract, Contract JSON, adapter, events, App Shell, Navigation, CSS, DB, Functions, Storage, Booking Core and other Control Center files remain unchanged except for the mechanical release labels explicitly approved above.
- The focused M5.1c test, compatible Booking boundary check, Trip Contract gates, release consistency, cross-core guardrail and controlled 19-test safe regression are green.
- Integration Preview and Production evidence are recorded only after actual static and authenticated verification.
- Local, tracking and live Remote SHAs plus clean trees are verified at every required gate.
- All six streams are synchronized before M5.1c is marked complete.
- M5 remains in progress and its exit gate remains unclaimed unless all separate M5 requirements are later evidenced.

Runtime, ownership, compatibility, focused-test, release-consistency, DB-guardrail, controlled-regression, implementation commit, feature push, Integration, Preview, Main, Production and six-stream synchronization acceptance evidence are **PASS**. M5.1c is **COMPLETE**. M5 remains **IN PROGRESS** and its exit gate remains unclaimed.

## Approval

- Platform owner: scope approved for the exact PCR and temporary lock defined above
- Trip owner: scope approved for read-only adoption of the unchanged `trip.v1` Contract
- Control Center / Experience owner: scope approved for the exact Booking Inbox boundary migration only
- Booking boundary reviewer: scope approved only while Booking APIs and business behavior remain unchanged
- approved implementation commit: `83aae200b77aa7791f1d8d51b471af07506bdc0a`
- Runtime implementation authorization: **executed, validated, promoted, Production verified and accepted through the final six-stream synchronization gate**
