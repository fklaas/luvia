# Test Results — M5.1a Travel Identity Trip Contract Adoption

**Status:** LOCAL PASS
**Date:** 2026-08-16
**Worktree:** `C:\Users\fabia\Documents\GitHub\luvia-platform`
**Branch:** `feature/platform-core`
**Base HEAD:** `de79c904a7aec99975acbf720abc3084714fb152`
**App/Core under test:** 13.82.0 / 4.82.0

## Structural gate

Result: **PASS**

- exact approved working-tree scope before evidence documents: 9 / 9 files;
- unexpected files: 0;
- staged files: 0;
- `index.html`: 214 App 13.82.0 references, zero active 13.81.9 references;
- Index semantic change beyond cache version: none;
- kernel aliases `LuviaKernelVersion`, `LuviaCoreVersion` and `LUVIA_RELEASE`: preserved;
- Media Readiness: only release comment, `CORE` and `BUILD` changed;
- M5 status remains `IN PROGRESS`;
- M5 exit gate remains unclaimed.

## Diff quality

Command:

```powershell
git --no-pager diff --check
```

Result: **PASS**

Git reported only Windows LF-to-CRLF notices and no whitespace error.

## Syntax

Passed:

- `node --check app/control-center/travel-identity-service.js`
- `node --check tests/v13.77.0-control-center-home-travel-identity.test.cjs`
- `node --check intelligence/kernel/version.js`
- `node --check core/diagnostics/media-readiness.js`

## Targeted behavior

Command:

```powershell
node tests/v13.77.0-control-center-home-travel-identity.test.cjs
```

Result: **PASS**

Marker:

```text
LUVIA_V13_77_0_CONTROL_CENTER_HOME_TRAVEL_IDENTITY_OK
```

The test proves:

- Trip list and active trip come from `trip.v1`;
- no direct `LuviaTripStore` reference remains;
- no direct `LuviaTripContext` reference remains;
- no `luvia:trips-changed` listener remains;
- `luvia:trip.changed` is registered;
- `phase`, `tripDay`, active trip and upcoming trip remain compatible;
- the projection still declares `ownsTripTruth:false`.

## Release consistency

Command:

```powershell
node tests/release-version-consistency.test.cjs
```

Result: **PASS**

Marker:

```text
Build 13.82.0 / Core 4.82.0 release consistency: OK
```

## Safe regression

Command:

```powershell
node tests/run-m4.3-safe-regression.cjs
```

Result:

```text
Total:  17
Passed: 17
Failed: 0
Suite:  PASS
```

The allowlist covered release consistency, runtime foundation, feature flags, Trip/Places/Media/Identity contract adapters, evergreen contract integration, Places architecture, Control Center, Booking regressions and repository ownership guardrails.

## Cross-Core DB ownership guardrail

Result: **PASS**

```text
tracked JS/TS files: 327
static DB calls: 316
mapped cross-core debt: 26 / baseline 26
unmapped DB-object debt: 39 / baseline 39
dynamic DB calls: 27 / baseline 27
```

No cross-core DB debt growth was detected.

## Working-tree integrity

The validation commands did not change the working tree.

## Not yet evidenced

- staged-scope verification;
- commit SHA and clean post-commit tree;
- pre-/post-push remote SHA;
- integration merge and full regression on `integration`;
- integration preview smoke;
- `main` promotion;
- production smoke;
- synchronization of all active streams.

No PASS is claimed for these pending stages.
