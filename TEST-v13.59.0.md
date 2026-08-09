# Tests – Luvia v13.59.0 / Core 4.59.0

- Expected-state browser probe returns HTTP 200 payload instead of FunctionsHttpError.
- Browser probe remains blocked (`SERVICE_ROLE_REQUIRED`).
- `booking_provider_connection_readiness_v5` exposes orchestration/backoff fields.
- Orchestrator does not activate without explicit trusted confirmation.
- Probe failure increments backoff; healthy probe resets it.
- Activation run audit contains no secret values.
- Runtime/build/core release consistency.
