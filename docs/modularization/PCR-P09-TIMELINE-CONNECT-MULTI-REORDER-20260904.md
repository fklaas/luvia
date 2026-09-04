# PCR — P09 Timeline connect and multi-reorder

Date: 2026-09-04
Status: release candidate for bounded Integration acceptance

## Problem

The Timeline can edit or move one planned Place at a time, but it cannot deliberately connect several moments into one understandable travel sequence or review a changed multi-entry order before persistence. Separate single-entry writes also provide no shared, reload-persistent recovery experience.

## Owner and boundaries

- Journey owns selection, ordering, the before/after preview, conflict policy, shared operation identity and public `journey.v1` command semantics.
- Places remains owner of each Place link, `planned_at` value and the metadata stored in its existing `trip_place_data` record.
- Consumer owns the multi-select controls, order sheet, connection badges and durable recovery surface.
- Booking remains owner of reservations. A selected entry with a linked booking blocks the group mutation and points back to Booking management.
- Route geometry is not fabricated during the preview. The sheet describes the new stop sequence and marks exact routing for refresh after the confirmed owner writes.

## Product behavior

Timeline edit mode allows two to twelve planned Places on the same active-trip day to be selected. The review sheet shows the old and proposed stop order, start time and duration for every member, whether schedule order changes, current conflicts, preserved owner facts and the route-refresh consequence. Up/down controls work without drag and remain usable on mobile.

After confirmation, each Place receives the shared connection identity and its explicit order. Connected cards show `Gemeinsamer Weg · n/N`. A shared recovery receipt remains available after reload. Restoring rechecks current revisions, conflicts, the active trip and Booking before it restores every original time, duration and previous connection.

## Contract impact

`journey.v1` receives additive reads `previewConnectionReorder`, `connectionRecoveries`, `connectionRecovery` and `previewConnectionRestore`, plus commands `connectAndReorderEntries` and `restoreConnectionReorder`. The major contract version stays unchanged.

The operation uses per-entry conditional Places writes because no accepted database batch/RPC exists for this owner boundary. The consumer never describes this as a database-atomic transaction. A rare partial provider failure reports the exact applied count, forces an owner reload and never claims that every member was saved.

## Database, Functions and secrets

No migration, Edge Function, provider, secret, RLS or authorization change. Connection and recovery information is stored inside the existing `trip_place_data.fields.metadata` JSON object through the existing `places.v1 plan` owner command.

## Safety and concurrency

- Only two to twelve confirmed, non-automatic planned Places from one active-trip day are accepted.
- Preview and command require exactly the same member set and order.
- Every entry revision must still equal the reviewed owner revision before the first write.
- Current conflicts require explicit consent; linked Booking records reject the group change.
- Place facts, favorites and booking state are never copied or overwritten.
- Replayed operation IDs are idempotent.
- Recovery is accepted only while all members still carry the same unchanged group receipt.

## Test and acceptance plan

1. Browserless contract test for preview-without-write, ordering, confirmation, stale revision, Booking gate, conflict consent, per-owner readback, reload recovery, restore and idempotency.
2. Existing Journey, Human↔AI registry, failure-matrix, visual-inventory and release gates.
3. Controlled Safe Regression with the new P09 test in the evergreen allowlist.
4. Visible Integration browser sequence: select two same-day Places → reverse the proposed order → confirm → reload → verify connection/order → restore → reload → verify the original schedule and absence of recovery residue.

## Rollout and rollback

Publish as one Integration preview build after all gates pass. Main/Production promotion is outside this slice. The previous accepted rollback is App `13.82.168.47`, Core `4.82.169`, source `8eeba9ada79488760fc55d0de042c107630a7002`; additive metadata remains inert on that runtime.
