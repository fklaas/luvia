# PCR — P09 durable Timeline remove and restore

Date: 2026-09-04
Status: accepted for the bounded Integration slice

## Problem

The Timeline currently removes a planned Place only after a visible confirmation, but its undo is an eight-second browser toast. A reload discards that recovery path even though the Places-owned `trip_place_data` record still exists. The user therefore cannot inspect and restore the exact removed schedule through the public Journey surface after a reload.

## Owner and boundaries

- Journey owns the remove/restore preview, confirmation, conflict policy and public `journey.v1` command semantics.
- Places remains the owner of the linked Place and its `trip_place_data` schedule fields.
- Consumer owns the Timeline sheets and recovery card.
- Booking remains the owner of real reservations. A linked booking redirects to Booking management and is never deleted by this flow.

## Contract impact

`journey.v1` receives additive reads and commands for a durable planned-Place removal receipt, its restoration preview, and confirmed restoration. Its major version remains unchanged. Existing Journey reads and commands remain available.

The temporary Journey Web compatibility provider exposes recovery receipts derived from the already hydrated Places-owned record. It does not become an owner of Places truth.

## Backward compatibility

Records without a removal receipt behave exactly as before. Schedule-change recovery remains separate. Non-Place Journey entries continue through their existing owner routes. The new metadata is ignored safely by older clients.

## Files and streams

- `core/platform/journey-contract-adapter.js` — additive public contract adapter behavior.
- `core/places/timeline-core.js` — compatibility projection of Places-owned recovery metadata.
- `app/journey/journey-day-composer.js` and `.css` — confirmed remove and persistent restore experience.
- Targeted P09 tests, release manifests and synchronized planning documents.

This bounded cross-stream change is integrated through Integration under this PCR.

## Database, Functions and secrets

No migration, Edge Function, provider, secret or authorization change. The receipt is stored inside the existing `trip_place_data.fields.metadata` JSON object by the existing conditional Places owner command.

## Safety and concurrency

- Removal requires preview, explicit confirmation, operation ID and the observed owner revision.
- The command reloads owner state before writing and rejects a stale revision or active-trip change.
- A linked booking is checked before removal and stays on the Booking management path.
- Restoration requires a fresh preview, explicit confirmation and conflict acknowledgement when the day changed.
- Place identity, favorite state and Place facts are not removed.
- Replayed operation IDs are idempotent; a different mutation of the removed schedule invalidates automatic restoration.

## Test and acceptance plan

1. Browserless tests for preview-without-write, confirmation, stale revision, idempotency, booking gate, durable reload recovery, changed-day conflict and restored owner readback.
2. Consumer test for readable remove/restore sheets and a recovery card that survives a new adapter instance.
3. Controlled Safe Regression and public artifact hash verification.
4. Visible Integration browser sequence: remove → reload → restore → reload → independent owner readback → restore the original test state.

## Rollout and rollback

Publish as one Integration preview build after all gates pass. No production/Main promotion is part of this slice. Rollback is the previous accepted Integration runtime source `a6bbb89896882b3c941e5007ed8e2f44023503d1` / App `13.82.168.46`; the additive metadata is inert there and the scheduled Place can still be restored through the existing Places owner command.
