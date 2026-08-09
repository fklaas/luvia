# Luvia v13.59.0 / Core 4.59.0
## Provider Activation Orchestrator + Expected-State Transport Cleanup

### Booking Core
- Central provider activation orchestration across preflight, live probe and explicit activation.
- New `booking_provider_activation_runs` audit trail.
- Exponential probe backoff after degraded/failed probes; successful probes reset the failure counter.
- `next_probe_at`, orchestration state/reason and last orchestration timestamp are persisted.
- Activation remains explicit: orchestration never connects a provider unless both `allowActivation=true` and `confirmActivation=true` are supplied by the trusted server-side caller.
- Existing provider-specific safety gates remain intact. No partner credentials or undocumented contracts are invented.

### Expected-state transport cleanup
- Authenticated browser calls to privileged `probe`, `activate` and `orchestrate` actions now return controlled HTTP 200 responses with `ok:false, expected:true, error:'SERVICE_ROLE_REQUIRED'`.
- Expected business states such as missing provider, confirmation required, provider not ready or unverified auto-activation are returned as controlled responses instead of red 4xx transport errors.
- Real authentication failures and unexpected server faults remain genuine HTTP errors.

### Security
- Credential/secret values are never returned, logged in audit evidence or stored in database tables.
- Live probes remain read-only.
- Provider activation requires a healthy probe and an explicitly verified activation contract.
