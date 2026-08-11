# Luvia v13.74.0 / Core 4.74.0
## Runtime Provider Health & Adaptive Booking Decisions

### Runtime Provider Health
- New `booking_provider_runtime_health_v1` unifies connection state, live probe state/freshness, consecutive probe failures, activation/orchestration backoff and availability readiness.
- Runtime health states: `healthy`, `ready`, `unknown`, `degraded`, `unavailable`.
- Healthy/readiness signals can improve a route; stale/degraded/unavailable signals strongly reduce or block direct API routing.
- A stale live probe (>15 minutes) degrades the direct route instead of pretending current health.
- Partner-required/discovery providers are not treated as live API routes.

### Adaptive Booking Decisions
- Route selection no longer stops merely because an API candidate exists.
- All currently valid routes are compared using user-interest-first base rank + provider intelligence + confidence + runtime health.
- A healthy direct provider keeps priority.
- A degraded/stale direct provider can lose to a verified official booking link.
- An unavailable direct provider fails closed and allows verified fallback routes.
- Decision evidence persists `decisionMode=runtime_adaptive` and the runtime health snapshot used at decision time.

### Developer Console / Diagnostics
- Booking Core diagnostics now tests degraded-direct fallback, stale-probe degradation and healthy-direct recovery.
- Backend Readiness reads the new provider runtime health model and summarizes health-state counts.
- Provider & Orchestration card shows the adaptive decision mode and runtime health coverage.

### Safety invariants
- Commercial weight remains capped at 8.
- Commercial/commission never confirm reservation truth.
- No provider is activated by scoring logic.
- Email remains a verified fallback.
