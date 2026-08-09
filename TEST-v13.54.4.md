# Test v13.54.4 / Core 4.54.4

## Regression target
The existing trusted Quandoo signal `smoke-v13-54-verified-001` was previously left `ignored` and unapplied. Reprocessing must not write an invalid intermediate `received` state.

## Expected
1. Reprocess runs without `booking_status_signals_resolution_state_check` failure.
2. Existing signal row is reused.
3. No second signal is created for the same source event.
4. Verified provider `ready -> confirmed` may apply under the trusted contract path.
5. The signal moves directly to `applied` only after successful booking update.
6. Reprocessing again is idempotent and creates no second status update.
