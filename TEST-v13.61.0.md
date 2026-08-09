# Test v13.61.0 / Core 4.61.0

Static checks:
- availability request/snapshot schema and service-role-only storage
- readiness view gates connected/availability/transport/probe states
- canonical availability input validation
- no generated/fake slots
- provider adapter routing only after readiness gate
- expected partner-required states remain HTTP 200
- provider timeout exists
- normalized slot reference preservation
- browser client API syntax
- Edge Function syntax
- runtime version consistency
- ZIP integrity

Smoke after deploy:
1. Query `booking_provider_availability_readiness_v1`.
2. Invoke `booking-provider-availability` for a partner-required provider with a valid venue/date/party size.
3. Expect `{ok:false,expected:true,...,slots:[]}` and no red transport error.
4. Confirm an audited row exists in `booking_availability_requests` with `state='blocked'`.
