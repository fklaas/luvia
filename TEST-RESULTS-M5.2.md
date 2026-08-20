# Luvia Test Results - M5.2

Date: 2026-08-20

App: 13.82.11

Core: 4.82.11

Release: M5.2 Remaining Trip Consumer Isolation

Platform implementation commit: 221bceb89f2ba927f58e7e076c1769169115373c

Booking / final runtime target: a2098a1188b40edbe60573322c6eec2d936ad28a

## Final result

Architecture scope:

PASS.

Platform Trip Contract adoption:

5 / 5 PASS.

Booking Trip Contract adoption:

2 / 2 PASS.

Total approved consumer set:

7 / 7 PASS.

Trip Contract extension:

NONE.

Private Trip mutation introduced:

NONE.

Integration promotion:

PASS.

Pre-Main Preview:

PASS.

Main promotion:

PASS.

Production static acceptance:

PASS.

Production authenticated runtime and reload:

PASS.

## Targeted regression

Test:

tests/m5.2-remaining-trip-consumer-isolation.test.cjs

Result:

PASS.

Approved consumers:

7 / 7.

Private LuviaTripStore references:

0.

Direct LuviaTripContext references:

0.

Public Trip Contract adoption:

7 / 7.

## Safe Regression

Allowlisted tests:

32.

Result:

32 / 32 PASS.

Total:

32.

Passed:

32.

Failed:

0.

Suite:

PASS.

## Known adjacent test

tests/user-preference-core.test.cjs

Classification:

PREEXISTING FAIL / RETAINED / NOT PASS.

Failure:

api.version === 3.0.0.

Untouched baseline reproduction:

c143fad9651e6090cae61cce91d69869c0e526a6.

Not part of Safe Regression.

Not claimed PASS.

## Runtime commits

Platform:

221bceb89f2ba927f58e7e076c1769169115373c.

Parent:

c143fad9651e6090cae61cce91d69869c0e526a6.

Booking:

a2098a1188b40edbe60573322c6eec2d936ad28a.

Parent:

221bceb89f2ba927f58e7e076c1769169115373c.

Commit count from M5.1k closeout:

2.

Merge commit:

NO.

## Integration proof

Integration final target:

a2098a1188b40edbe60573322c6eec2d936ad28a.

Fast-forward:

PASS.

Push:

PASS.

Safe Regression:

32 / 32 PASS.

## Pre-Main Preview static proof

Preview:

https://integration-luvia.njwnrvwbv5.workers.dev

Timing:

before Main mutation.

Static assets:

12 / 12 BYTE-EXACT PASS.

Release identity:

App 13.82.11 / Core 4.82.11.

M5.2 consumer boundary:

7 / 7 PASS.

Static Asset Hardening:

3 / 3 PASS.

## Pre-Main authenticated runtime

Initial runtime:

PASS.

Reload runtime:

PASS.

Active Trip available:

PASS.

Active Trip restore:

PASS.

Booking / Trip Contract active Trip equality:

PASS.

Authenticated Booking read:

24 rows PASS.

Booking UI render probe:

PASS.

## Preview harness history

Initial text-based comparison:

FAIL.

Classification:

HARNESS ENCODING ARTIFACT.

Cause:

Windows PowerShell native Git text decoding corrupted UTF-8.

Replacement raw-byte comparison:

PASS.

Failed execution is retained and is not retroactively converted to PASS.

pre-Main Preview gate retroactively claimed = NO.

A genuine M5.2 pre-Main Preview gate was nevertheless executed contemporaneously before Main mutation.

## Booking push harness history

Initial push harness reported failure after Git had already completed the remote mutation.

Classification:

POST-PUSH POWERSHELL STDERR HANDLING FAILURE.

Read-only proof:

HEAD = tracking = live remote = a2098a1188b40edbe60573322c6eec2d936ad28a.

Divergence:

0 / 0.

The push was not repeated.

## Main pre-flight history

V1:

FAIL in scope comparison harness.

Read-only set forensics:

LOGICALLY IDENTICAL.

File count:

15 / 15.

Unexpected:

0.

Missing:

0.

V2:

PASS.

## Main proof

Local fast-forward:

PASS.

Post-fast-forward Safe Regression:

32 / 32 PASS.

Main push:

PASS.

Final Main:

HEAD = tracking = live remote = a2098a1188b40edbe60573322c6eec2d936ad28a.

Divergence:

0 / 0.

Worktree:

clean.

## Production static proof

Production:

https://myluvia.app

Automatic target reached:

PASS.

Root shell:

exact target index PASS.

Static provenance:

12 / 12 BYTE-EXACT PASS.

Trip consumer boundary:

7 / 7 PASS.

Static Asset Hardening:

3 / 3 PASS.

App:

13.82.11 PASS.

Core:

4.82.11 PASS.

Service Worker:

luvia-shell-v13.82.11 PASS.

## Production authenticated runtime proof

Initial navigation:

PASS.

F5 reload:

PASS.

Active Trip restore:

PASS.

Authenticated Booking read:

24 rows before and after reload.

Booking UI pure render:

PASS.

Service Worker registration:

PASS.

No red runtime exception observed.

No authentication 401 observed.

## Warnings

Geolocation user-gesture violation:

RETAINED.

Tracking Prevention:

RETAINED.

Console warning-free claim:

NO.

## Infrastructure mutations

Manual Cloudflare / Wrangler deployment:

NONE.

Supabase deployment:

NONE.

Database migration:

NONE.

Edge Function deployment:

NONE.

Secret mutation:

NONE.

Provider configuration mutation:

NONE.

## Exit state

M5.2 runtime / Production acceptance:

COMPLETE.

M5.2 closeout docs:

PREPARED.

M5.2 Docs Marker commit:

PENDING.

M5.2 final eight-stream synchronization:

PENDING.

M5.2 overall:

CLOSEOUT PENDING.

M5:

IN PROGRESS.

NFR-0:

BLOCKED until final M5.2 closeout.