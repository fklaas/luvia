# Luvia v13.63.1 / Booking Core 4.63.1

## Early Mutation Audit Fix

This patch closes the audit gap discovered during the deployed v13.63.0 smoke test.

### Fixed

Blocked Modify/Cancel requests are now persisted before the early business guards that can stop a mutation, including:

- `BOOKING_ALREADY_CANCELLED`
- `BOOKING_STATE_NOT_MODIFIABLE`
- `BOOKING_STATE_NOT_CANCELLABLE`
- `PROVIDER_RESERVATION_REFERENCE_REQUIRED`
- `BOOKING_PROVIDER_REFERENCE_MISMATCH`

The audit row is created only after the booking has passed the RLS-backed accessibility check. Invalid/unauthenticated requests do not gain an audit path that bypasses access control.

### Schema

`provider_id` and `reservation_reference` in the two mutation audit tables are nullable for early blocked attempts. This is required because the absence of a provider reservation reference is itself an auditable business outcome.

No provider capability, live transport, status transition, provider adapter contract or booking provenance behavior is relaxed by this patch.

### Versions

- Luvia App: `13.63.1`
- Booking Core: `4.63.1`
- Mutation Runtime: `1.0.1`
