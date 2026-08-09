# Luvia v13.54.3 / Core 4.54.3 — Failed Status Signal Recovery & Idempotent Retry Fix

This patch closes the recovery gap discovered while testing a verified Quandoo provider return.

## What changed
- A trusted provider status signal that was emitted but never applied because an earlier core version rejected the transition can now be retried.
- The existing `booking_status_signals` row is reused; no duplicate signal is created.
- Retry is allowed only when the signal is from a verified provider contract, is still unapplied, targets the same booking/status/source, and previously ended in `ignored` or `failed`.
- Already applied signals remain strictly idempotent and can never create a second status update.
- Conflict/review signals are not automatically retried.
- The provider receipt reprocessor now distinguishes `SIGNAL_ALREADY_APPLIED`, retryable failed signals, and non-retryable emitted signals.
- Successful recovery updates the original signal and receipt with the resulting `booking_status_updates` id and audit evidence.

## Regression safety
- Handoff and affiliate sources still cannot confirm a booking.
- Unverified provider transports still cannot auto-apply a provider contract.
- The v13.54.2 trusted `ready -> confirmed` exception remains limited to verified provider webhook/API/polling paths.
