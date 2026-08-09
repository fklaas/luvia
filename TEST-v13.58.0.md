# Tests – Luvia v13.58.0 / Core 4.58.0

## Static/contract checks

- Runtime version consistency
- Probe state constraint includes `running`
- Probe run audit table exists
- Readiness v4 exists
- No secret value persistence
- Service-role-only activation
- Explicit activation confirmation required
- Credentials alone never imply connected
- Unsupported provider probe remains contract-gated
- Quandoo probe is GET/read-only
- Quandoo Auth Token sent only as server-side header
- 5-second probe timeout
- Client exposes `health`, `probe`, `activate`, `readiness`

## Production smoke after deploy

1. Query `booking_provider_connection_readiness_v4`.
2. Invoke health action from authenticated Luvia session.
3. `probe` from a normal authenticated client must return `SERVICE_ROLE_REQUIRED`.
4. Quandoo live probe only server-side after real partner credentials + `QUANDOO_PROBE_MERCHANT_ID` are configured.
5. `activate` from normal authenticated client must return `SERVICE_ROLE_REQUIRED`.
