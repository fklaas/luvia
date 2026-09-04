# Stays uses the shared Places spatial consumer

User requests 1:1 technical parity and a map/history-only Hotels route. Baseline
Integration 4ad98cd5 / runtime .27. No provider, secret, database or billing change.

The existing Places spatial consumer gains an accommodation surface parameter.
Hotels mounts that same consumer; its old hero/offer/discovery rendering no longer
runs on this route. Legacy Booking-related API methods remain callable and domain
commands continue through public contracts. This avoids a parallel map pipeline.

Both surfaces share initial destination search, filter state, preference ranking,
viewport caching, pins, history and details. Cache namespaces and category guards
keep the cohorts isolated. Accommodation details retain the hotel-map context.
The mobile preview remains inside the common map container instead of being fixed
to the viewport. No new global navigation or booking workflow is introduced.

Validation: executable real-mount parity and lifecycle tests, existing filter and
viewport tests, controlled regression and visible mobile/desktop browser checks.
Rollback: .27 Worker 610b6d75-d8df-4017-ae0e-db235c46e08b, gateway v148 unchanged.
