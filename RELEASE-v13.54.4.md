# Luvia v13.54.4 / Core 4.54.4 — Atomic Status Signal Retry Fix

This patch fixes the constraint failure discovered while retrying an already-emitted, trusted Quandoo status signal.

## What changed
- Retry no longer assigns the illegal synthetic state `received` to `booking_status_signals`.
- Existing trusted, unapplied `ignored` signals are re-evaluated atomically while keeping their current legal state until a final result exists.
- The same signal row is reused; no duplicate status signal is emitted.
- On success, the existing signal moves directly to `applied` and receives `applied_status_update_id`.
- On failure, the existing signal remains safely unapplied and records retry audit evidence.
- Already-applied signals remain strictly idempotent.
- The trusted provider `ready -> confirmed` exception from Core 4.54.2 remains restricted to verified provider webhook/API/polling sources.

## Security invariants
- No constraint is widened.
- No client/service-role direct access to the internal database-only status core is granted.
- Handoff/affiliate signals still cannot confirm a booking.
- Unverified provider transports still cannot auto-apply a status contract.
