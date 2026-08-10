# Runtime Test v13.70.2

## A. SevenRooms pending-partner correlation

Repeat the existing `manual_reconciliation / conversion_reported` smoke event against a valid SevenRooms correlation token.

Expected:
- `processing_state = pending_partner_activation`
- `resolution_reason = COMMERCIAL_PARTNER_NOT_ACTIVE`
- `correlation_id` is NOT NULL and equals the supplied correlation
- `conversion_report_id IS NULL`
- booking status remains unchanged/null for a handoff without booking

## B. Duplicate pending replay

Call `luvia_booking_ingest_commercial_event(...)` again with the same provider/source/external_event_id.
Expected: one persisted event only, `duplicate=true`, and the canonical processor is replayed without creating a conversion while the partner remains inactive.

## C. Active-path rollback test

Inside one transaction temporarily set the tested provider profile to `commercial_status='active'`, replay the same event via `luvia_booking_replay_commercial_event(...)`, verify a conversion report is produced and `booking_status_changed_by_commercial=false`, then `ROLLBACK`.
