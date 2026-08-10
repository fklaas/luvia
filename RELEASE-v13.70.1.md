# Luvia v13.70.1 / Core 4.70.1

## Conversion Runtime View Migration Fix

Targeted runtime fix for the PostgreSQL `42P16` failure discovered while deploying v13.70.0.

### Root cause

`booking_monetization_runtime_v1` already existed from v13.69.x. v13.70.0 inserted new commercial-event columns before the existing terminal column `booking_status_changed_by_commercial`. PostgreSQL does not allow `CREATE OR REPLACE VIEW` to reinterpret the existing positional column as a differently named column, so deployment stopped with:

`cannot change name of view column "booking_status_changed_by_commercial" to "commercial_event_count"`

### Fix

- The v13.70.0 migration is corrected to explicitly drop/recreate the read-only runtime view before changing its column shape.
- A dedicated idempotent v13.70.1 repair migration repeats the safe view recreation for environments where v13.70.0 objects were already partially/manual applied.
- No persisted booking, correlation, conversion or commission data is deleted by the view drop.
- Commercial evidence remains non-confirming and cannot mutate reservation truth.
- Email Booking V2, provider reservation lifecycle and status provenance are unchanged.
