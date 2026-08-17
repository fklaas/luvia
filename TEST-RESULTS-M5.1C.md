# Test Results — M5.1c Booking Inbox Trip Contract Adoption

**Status:** STAGING PASS / RELEASE CANDIDATE / NOT COMMITTED / NOT RELEASED
**Date:** 2026-08-17
**Worktree:** `C:\Users\fabia\Documents\GitHub\luvia-platform`
**Branch:** `feature/platform-core`
**Implementation parent:** `f3f7431b2db8344e34d716daed33e10559d9f7cf`
**App/Core under test:** 13.82.2 / 4.82.2

## Test-first boundary proof

The focused test was created before any productive Booking Inbox change and executed against the unchanged Runtime.

Command:

```powershell
node tests/m5.1c-booking-inbox-trip-contract-adoption.test.cjs
```

Result before implementation:

```text
tests: 3
pass: 0
fail: 3
```

The failures were the intended boundary RED:

- static source still contained `LuviaTripStore`, `LuviaControlCenterTravelIdentity` and `tripSnapshot`;
- the versioned `trip.v1` Runtime surface was absent from the Inbox consumer;
- the VM behavior test reached the deliberately throwing `LuviaTripStore` getter.

The test itself passed `node --check`. The existing controlled runner still contained 18 tests and reported 18 / 18 pass. No historical version-specific test was rewritten or counted as green. This proves the RED state was caused by the known Runtime boundary and not a broken harness.

## Runtime structural gate

Result: **PASS**

- functional Runtime diff: 3 insertions / 3 deletions in `app/control-center/booking-inbox.js`;
- exactly one lazy resolver: `LuviaTripContractV1 || LuviaTripContract || null`;
- exactly one `listTrips()` Contract read;
- exactly one `getActiveTrip()` Contract read;
- direct `LuviaTripStore`, `LuviaTripContext`, `LuviaAppState`, `LuviaControlCenterTravelIdentity` and `tripSnapshot` references: 0;
- direct legacy Trip-event, subscription, Trip-command, `.from(...)` and `.rpc(...)` references: 0;
- public Inbox API and Diagnostics implementation unchanged;
- Booking Conversation, Preference, Intelligence and Reply code unchanged;
- Trip Contract specification, JSON and adapter unchanged;
- App Shell, Navigation and CSS unchanged.

## Working-tree allowlist gate

Result after evidence-file creation: **PASS / UNSTAGED**

- exact PCR-approved working-tree files: 12 / 12;
- unexpected changed or untracked files: 0;
- staged files: 0;
- implementation commit: none;
- local HEAD changed: no;
- Remote reference changed: no;
- push performed: no.

The 12-file set is:

1. `app/control-center/booking-inbox.js`
2. `tests/m5.1c-booking-inbox-trip-contract-adoption.test.cjs`
3. `tests/run-m4.3-safe-regression.cjs`
4. `index.html`
5. `sw.js`
6. `force-update.html`
7. `intelligence/kernel/version.js`
8. `core/diagnostics/media-readiness.js`
9. `CURRENT-BUILD.md`
10. `docs/modularization/PCR-M5.1C-BOOKING-INBOX-TRIP-CONTRACT-ADOPTION.md`
11. `RELEASE-NOTES-M5.1C.md`
12. `TEST-RESULTS-M5.1C.md`

## Diff quality

Command:

```powershell
git diff --check
git diff --cached --check
```

Result: **PASS**

Git reported Windows LF-to-CRLF notices but no whitespace error. New untracked evidence and test files are additionally checked for a final newline and trailing whitespace before staging.

## Syntax

Passed:

- `node --check app/control-center/booking-inbox.js`
- `node --check tests/m5.1c-booking-inbox-trip-contract-adoption.test.cjs`
- `node --check tests/run-m4.3-safe-regression.cjs`
- `node --check sw.js`
- `node --check intelligence/kernel/version.js`
- `node --check core/diagnostics/media-readiness.js`

## Targeted Booking Inbox behavior

Command:

```powershell
node tests/m5.1c-booking-inbox-trip-contract-adoption.test.cjs
```

Result after implementation:

```text
tests: 3
pass: 3
fail: 0
```

The test proves:

- the Inbox contains no direct Trip Store, Context, AppState or Travel Identity fallback;
- the Inbox contains no legacy Trip event, subscription, Trip command or direct DB/RPC call;
- one lazy resolver prefers `LuviaTripContractV1` before the supported alias;
- only `listTrips()` and `getActiveTrip()` are consumed from `trip.v1`;
- an alias supplied after Inbox script evaluation is observed;
- V1 takes precedence without reading the alias;
- replacement of the complete V1 Contract object is observed without an Inbox cache;
- `options.tripId` keeps precedence and avoids an unnecessary active-Trip read;
- manual selector state remains local, survives public reload and calls only `Booking.listForTrip` with the selected ID;
- manual selection does not read or mutate global active-Trip truth;
- missing Contract produces null selection, an empty selector and no `listForTrip(null)` call;
- the frozen six-key public Inbox API remains unchanged;
- the Diagnostics key set and Booking-/Message-ownership declarations remain unchanged;
- no Booking mutation is triggered by mount, selector or reload validation.

## Compatible Booking boundary

Command:

```powershell
node tests/v13.80.0-booking-actions-intelligence.test.cjs
```

Result: **PASS**

Marker:

```text
LUVIA_V13_80_0_BOOKING_ACTIONS_INTELLIGENCE_OK
```

The four historical version-pinned Booking Inbox tests identified in the PCR were not rewritten, added to the allowlist or counted as green.

## Trip Contract and foundation gates

Passed:

- `node tests/m3.1-trip-contract-adapter.test.cjs`
- `node tests/m4.3-contract-release-integration-evergreen.test.cjs`
- `node tests/m4.3-evergreen-foundation-regression.test.cjs`

Markers:

```text
M3.1 Trip Contract Adapter: OK
M4.3 contract release integration evergreen: OK (13.82.2 / Core 4.82.2)
M4.3 evergreen foundation regression: OK
```

## Release consistency

Command:

```powershell
node tests/release-version-consistency.test.cjs
```

Result: **PASS**

Marker:

```text
Build 13.82.2 / Core 4.82.2 release consistency: OK
```

Exact version-token evidence in the five candidate Runtime/cache files:

- `index.html`: 214 App 13.82.2 markers and zero App 13.82.1 markers;
- `sw.js`: 1 App 13.82.2 marker and zero App 13.82.1 markers;
- `force-update.html`: 1 App 13.82.2 marker and zero App 13.82.1 markers;
- `intelligence/kernel/version.js`: 1 App marker, 1 Core marker and the M5.1c release name;
- `core/diagnostics/media-readiness.js`: 2 App markers and 2 Core markers;
- old 13.82.1 / 4.82.1 markers in those five candidate files: 0.

`index.html` contains 214 changed version tokens on 170 physical lines. After replacing 13.82.2 with 13.82.1 only for an in-memory comparison and normalizing line endings, the complete content equals `HEAD:index.html`. Assets and load order are unchanged.

## Controlled safe regression

Allowlist result:

```text
Tests: 19
Unique paths: 19
Duplicate paths: 0
M5.1c entries: 1
```

Command:

```powershell
node tests/run-m4.3-safe-regression.cjs
```

Final local result against App 13.82.2 / Core 4.82.2:

```text
Total:  19
Passed: 19
Failed: 0
Suite:  PASS
```

The allowlist covers release consistency, Runtime foundation, feature flags, Trip/Places/Media/Identity contract adapters, evergreen Contract integration, Places architecture, M5.1b Gallery, the new M5.1c Booking Inbox boundary, Control Center, Booking regressions and the repository ownership guardrail.

## Cross-Core DB ownership guardrail

Command:

```powershell
node tests/m4.2-cross-core-db-ownership-guardrail.test.cjs
```

Result: **PASS**

```text
tracked JS/TS files: 327
static DB calls: 316
mapped cross-core debt: 26 / baseline 26
unmapped DB-object debt: 39 / baseline 39
dynamic DB calls: 27 / baseline 27
```

No cross-core DB debt growth was detected.

## Database, function and external-state impact

- database migration: none;
- SQL/RPC deployment: none;
- Supabase Edge Function change or deployment: none;
- Supabase or Cloudflare secret change: none;
- Storage/schema change: none;
- destructive or corrective data operation: none;
- external AI call during validation: none;
- browser, Preview or Production mutation during local validation: none.

## Current Git boundary

Verified before evidence-file creation:

```text
Branch:   feature/platform-core
HEAD:     f3f7431b2db8344e34d716daed33e10559d9f7cf
Tracking: f3f7431b2db8344e34d716daed33e10559d9f7cf
Remote:   f3f7431b2db8344e34d716daed33e10559d9f7cf
Staged:   0 files
```

No implementation commit, push or force push exists.

## Staging evidence

Result: **PASS**

- exactly 12 PCR-approved files were staged with an explicit path list;
- unexpected staged paths: 0;
- unstaged files: 0;
- untracked files: 0;
- `git diff --cached --check`: PASS;
- staged Runtime numstat: 3 insertions / 3 deletions;
- staged runner numstat: 4 insertions / 0 deletions;
- staged M5.1c runner references: exactly 1;
- staged Runtime forbidden Store/Context/AppState/Travel-Identity/DB/RPC references: 0;
- staged Runtime lazy V1-first resolver: exactly 1;
- staged `listTrips()` reads: exactly 1;
- staged `getActiveTrip()` reads: exactly 1;
- staged `index.html`: 214 App 13.82.2 tokens and zero App 13.82.1 tokens;
- staged `index.html` equals the implementation parent after reversing only the version token and normalizing line endings;
- complete syntax, focused behavior, compatible Booking boundary, Trip Contract, Contract release, foundation, DB guardrail and release consistency after staging: PASS;
- controlled safe regression after staging: 19 / 19 PASS;
- implementation commit: none.

## Open commit and rollout gates

The following results are intentionally not claimed:

- implementation commit SHA and clean post-commit tree;
- Remote SHA before and after feature push;
- Integration fast-forward and 19 / 19 regression;
- Integration Preview static asset match;
- authenticated non-mutating Booking Inbox Preview smoke;
- Main fast-forward and 19 / 19 regression;
- Production static asset match;
- authenticated non-mutating Booking Inbox Production smoke;
- Cloudflare version, deployment and traffic identity;
- six-stream synchronization.

These sections may be changed to PASS only after the corresponding Git, test, deployment and runtime evidence exists.

## Current result

M5.1c local implementation, release identity and controlled feature validation: **PASS**.

M5.1c exact staging and post-staging validation: **PASS**.

M5.1c commit, promotion, Preview, Production and stream synchronization: **OPEN / NOT YET CLAIMED**.

M5 remains **IN PROGRESS** and its exit gate remains unclaimed.
