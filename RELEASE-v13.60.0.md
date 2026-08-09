# Luvia v13.60.0 / Core 4.60.0

## Provider Connection Secrets Readiness + Admin Activation Control

- Safe secret/config completeness counters without storing or returning secret values.
- `booking_provider_connection_readiness_v6` exposes missing/partial/complete readiness and admin-control state.
- Service-role-only activation-control records with optional expiry.
- Activation now requires: complete credentials, complete probe config, healthy fresh live probe, explicit activation confirmation, verified auto-activation contract, and active admin approval.
- Fresh probe window: 10 minutes.
- Admin actions are audited separately.
- Expected client-side security blocks remain HTTP 200 `{ok:false, expected:true,...}`.

## Security

No provider secret values are persisted in Postgres, audit evidence, or client responses. Admin activation-control tables are not readable by anon/authenticated roles.
