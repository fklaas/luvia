-- Luvia v13.74.0 / Core 4.74.0
-- Runtime Provider Health & Adaptive Booking Decisions smoke test
begin;

-- Policy truth must be current and safety invariants must remain intact.
select public.luvia_booking_orchestration_policy_snapshot() as policy_snapshot;

-- Runtime scoring contract.
select
  public.luvia_booking_runtime_health_adjustment('healthy') as healthy_adjustment,
  public.luvia_booking_runtime_health_adjustment('ready') as ready_adjustment,
  public.luvia_booking_runtime_health_adjustment('unknown') as unknown_adjustment,
  public.luvia_booking_runtime_health_adjustment('degraded') as degraded_adjustment,
  public.luvia_booking_runtime_health_adjustment('unavailable') as unavailable_adjustment;

-- Real provider health/readiness must be observable.
select
  provider_id,
  runtime_health_state,
  runtime_health_reason,
  runtime_health_score,
  api_route_eligible,
  connection_state,
  probe_state,
  probe_age_seconds,
  consecutive_probe_failures,
  orchestration_state,
  availability_runtime_state
from public.booking_provider_runtime_health_v1
order by provider_id;

-- Orchestration read model must expose the same adaptive evidence.
select
  provider_id,
  runtime_health_state,
  runtime_health_score,
  api_route_eligible,
  commercial_score,
  commercial_signal_can_confirm_reservation
from public.booking_provider_orchestration_readiness_v1
order by provider_id;

-- Health marker for this release.
select check_key,status,details,checked_at
from public.booking_health_checks
where check_key='booking_orchestration_v4_74';

rollback;
