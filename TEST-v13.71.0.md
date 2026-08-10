# Runtime Test v13.71.0

Use the existing SevenRooms correlation that was already proven in v13.70.2. The complete test must run inside one transaction and finish with `ROLLBACK` so no synthetic partner/revenue data remains in production.

## Expected lifecycle

1. Temporarily set SevenRooms commercial profile to `active` inside the transaction only.
2. Ingest one `conversion_approved` event and verify exactly one conversion report exists.
3. Ingest `commission_pending`, then `commission_approved`, then `commission_paid` against the same conversion external reference.
4. Re-ingest the exact same paid event and verify duplicate handling.
5. Verify:
   - conversion report count remains `1`
   - commission reconciliation count is `1`
   - commission audit transition count is `3`
   - final state is `paid`
   - settled commission equals the reported paid fact
   - `booking_status_changed_by_commission = false`
   - underlying booking status is unchanged/null when the correlation has no booking
6. `ROLLBACK`.

## Fail-closed checks

- A commission event without a resolvable conversion must become `pending_unmatched` with `COMMISSION_CONVERSION_NOT_FOUND`.
- Multiple matching conversions without an explicit conversion hint must become `pending_unmatched` with `COMMISSION_CONVERSION_AMBIGUOUS`.
- `paid -> pending` must raise `COMMISSION_TRANSITION_INVALID`.
- A repeated paid state with a conflicting amount must raise `COMMISSION_PAID_AMOUNT_CONFLICT`.

Commercial truth must never mutate reservation truth.

## Ready-to-run SQL

The repository includes `SMOKE-v13.71.0.sql`. Run the whole file in Supabase SQL Editor after the migration. Expected final row: `paid_duplicate=true`, `conversion_rows=1`, `reconciliation_rows=1`, `state_event_rows=3`, `commission_state=paid`, `settled_amount=6.00`, `settled_currency=EUR`, and `booking_status_changed_by_commission=false`. The transaction ends with `ROLLBACK`.
