# Luvia Release Notes - M5.2

Date: 2026-08-20

App: 13.82.11

Core: 4.82.11

Release: M5.2 Remaining Trip Consumer Isolation

Platform implementation commit: 221bceb89f2ba927f58e7e076c1769169115373c

Booking implementation commit: a2098a1188b40edbe60573322c6eec2d936ad28a

Final runtime target: a2098a1188b40edbe60573322c6eec2d936ad28a

Platform owner stream: feature/platform-core

Booking owner stream: feature/booking-core

## Status

M5.2 runtime implementation is COMPLETE.

M5.2 Integration, Main and Production runtime acceptance are COMPLETE.

M5.2 closeout documentation is PREPARED.

The future Docs Marker commit SHA and final eight-stream synchronization are intentionally not pre-claimed.

M5.2 remains CLOSEOUT PENDING until both gates are proven.

M5 remains IN PROGRESS.

NFR-0 begins only after final M5.2 closeout and eight-stream synchronization.

## Purpose

M5.2 removes the remaining approved reachable private Trip truth dependencies from seven Platform and Booking runtime consumers.

The required dependency direction is:

Domain Core -> public Contract / Adapter -> Consumer.

The existing Trip Contract v1 getActiveTrip() capability was sufficient.

No Trip Contract extension was required.

## Approved runtime consumers

Platform:

- core/media/ai-memory-bridge.js
- core/media/media-core.js
- core/media/memory-cards.js
- core/preferences/guided-discovery-sequence.js
- core/services/theme-service.js

Booking:

- core/booking/booking-integration.js
- core/booking/booking-ui.js

Result:

- Platform: 5 / 5
- Booking: 2 / 2
- Total: 7 / 7
- private LuviaTripStore references: 0
- direct LuviaTripContext references: 0
- Trip Contract adoption: 7 / 7
- Trip Contract extension: NONE
- private Trip mutation introduced: NONE
- Trip DB mutation introduced: NONE

The guided-discovery sessionStorage draft remains UI-local state and is not Trip domain truth.

## Runtime history

M5.1k closeout baseline:

c143fad9651e6090cae61cce91d69869c0e526a6

Platform implementation:

221bceb89f2ba927f58e7e076c1769169115373c

Booking / final runtime target:

a2098a1188b40edbe60573322c6eec2d936ad28a

Linear history:

c143fad9651e6090cae61cce91d69869c0e526a6
-> 221bceb89f2ba927f58e7e076c1769169115373c
-> a2098a1188b40edbe60573322c6eec2d936ad28a

No merge commit was created.

## Runtime and release scope

Cumulative scope from the M5.1k closeout baseline to the M5.2 runtime target:

15 files.

Release identity:

- App 13.82.11
- Core 4.82.11
- builtAt 2026-08-19T22:14:00+02:00
- Service Worker luvia-shell-v13.82.11

## Regression

Targeted M5.2 Remaining Trip Consumer Isolation:

7 / 7 PASS.

Controlled Safe Regression:

32 / 32 PASS.

Release consistency:

PASS.

Trip Contract regression:

PASS.

Ownership, registry, topology and boundary guardrails:

PASS.

Known adjacent test:

tests/user-preference-core.test.cjs

Classification:

PREEXISTING FAIL / RETAINED / NOT PASS.

The api.version === 3.0.0 failure was reproduced from untouched baseline c143fad9651e6090cae61cce91d69869c0e526a6.

The test is not part of Safe Regression and is not claimed PASS.

## Integration acceptance

Platform owner push:

PASS.

Booking owner push:

PASS.

Integration fast-forward:

PASS.

Integration push:

PASS.

Final Integration runtime target:

a2098a1188b40edbe60573322c6eec2d936ad28a.

Safe Regression:

32 / 32 PASS.

## Pre-Main Integration Preview

Stable Preview:

https://integration-luvia.njwnrvwbv5.workers.dev

A genuine current M5.2 Preview gate was executed before Main mutation.

Static Git provenance:

12 / 12 BYTE-EXACT PASS.

M5.2 remote consumer boundary:

7 / 7 PASS.

Static Asset Hardening:

3 / 3 PASS.

Authenticated initial runtime:

PASS.

Authenticated F5 reload runtime:

PASS.

Active Trip restore:

PASS.

Booking active Trip equals Trip Contract active Trip:

PASS.

Authenticated Booking read:

24 rows PASS.

No Booking, Trip or DB mutation was executed by the runtime smoke.

No red runtime exception was observed.

No authentication 401 was observed.

## Preview harness evidence

The initial text-based Preview comparison failed because Windows PowerShell native Git text decoding corrupted UTF-8.

Read-only binary forensics proved the remote Booking files exactly matched the accepted Git blobs.

The accepted replacement gate compared raw Git blob bytes against raw HTTP response bytes.

The failed text gate remains retained as failed harness evidence.

No retroactive PASS is assigned to that execution.

pre-Main Preview gate retroactively claimed = NO.

This retained historical evidence statement does not negate the genuine current M5.2 pre-Main Preview acceptance.

## Booking push harness evidence

The initial Booking push harness reported failure after the remote mutation because Windows PowerShell treated normal Git stderr push output as terminating.

Read-only post-mortem proved local HEAD, tracking and live remote had already reached a2098a1188b40edbe60573322c6eec2d936ad28a.

Classification:

REMOTE MUTATION ALREADY SUCCEEDED.

The push was not repeated blindly.

## Main promotion

Main Pre-flight V1 failed in the comparison harness.

Read-only set forensics proved:

- actual files: 15
- expected files: 15
- unexpected: 0
- missing: 0
- set comparison: logically identical

Main Pre-flight V2:

PASS.

Main local fast-forward:

PASS.

Safe Regression on local Main:

32 / 32 PASS.

Main normal non-force push:

PASS.

Final Main state:

- HEAD exact
- tracking exact
- live remote exact
- divergence 0 / 0
- worktree clean
- staged paths 0

## Production acceptance

Production:

https://myluvia.app

Automatic Production target:

PASS.

Manual Cloudflare deployment:

NONE.

Production root:

HTTP 200 / text/html / exact target index.html bytes.

Production static provenance:

12 / 12 BYTE-EXACT PASS.

Production M5.2 Trip consumer boundary:

7 / 7 PASS.

Production Static Asset Hardening:

3 / 3 PASS.

Production release identity:

App 13.82.11 / Core 4.82.11 PASS.

Service Worker:

luvia-shell-v13.82.11 PASS.

Authenticated Production initial runtime:

PASS.

Authenticated Production F5 reload:

PASS.

Active Trip restore:

PASS.

Authenticated Booking read:

24 rows PASS.

Service Worker registration:

PASS.

Service Worker script:

https://myluvia.app/sw.js

## Retained browser warnings

Geolocation user-gesture violation:

RETAINED.

Tracking Prevention messages:

RETAINED.

Console warning-free claim:

NO.

## Infrastructure

Manual Cloudflare / Wrangler deployment:

NONE.

Second deployment truth:

NONE.

Supabase deployment:

NONE.

Database migration:

NONE.

Edge Function deployment:

NONE.

Supabase Secret mutation:

NONE.

Cloudflare Secret mutation:

NONE.

Provider configuration mutation:

NONE.

## Physical isolation boundary

M5.2 completes the approved remaining logical Trip consumer isolation group.

It does not claim final physical Trip Core isolation.

Final physical Trip Core relocation and remaining lifecycle / legacy bridge cleanup remain later M5 work.

Timeline / Journey remains reserved.

## Result

M5.2 runtime and Production acceptance:

COMPLETE.

M5.2 closeout documentation:

PREPARED.

M5.2 Docs Marker:

PENDING.

M5.2 final eight-stream synchronization:

PENDING.

M5.2 overall:

CLOSEOUT PENDING.

M5:

IN PROGRESS.

Next architecture phase after final M5.2 closeout:

NFR-0 Native First Ready Architecture Foundation.