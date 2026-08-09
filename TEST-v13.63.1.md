# Test Plan v13.63.1 / Core 4.63.1

## Primary regression

Use a booking accessible to the logged-in user with a mutable status but without an entry containing `reservation_reference` in `booking_provider_references`.

Call `window.LuviaBookingReservationMutation.modify(...)`.

Expected response:

- `ok = false`
- `expected = true`
- `error = PROVIDER_RESERVATION_REFERENCE_REQUIRED`
- `requestId` is present

Then query `booking_reservation_modify_requests` by booking ID.

Expected latest row:

- `state = blocked`
- `expected_state = true`
- `error_code = PROVIDER_RESERVATION_REFERENCE_REQUIRED`
- `attempt_count >= 1`
- `reservation_reference is null`
- `finished_at is not null`

## Additional guards

Verify blocked audit rows for non-mutable/non-cancellable booking states and provider-reference mismatch when suitable fixtures exist.

## Regression

- no provider call on early block
- no local booking status mutation
- existing readiness gates remain unchanged
- expected states remain controlled responses
- shell global remains available
