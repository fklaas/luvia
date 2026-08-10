-- Luvia Core 4.73.0 · Booking Decision Evidence & Diagnostics Integrity
-- Keeps server/client routing policy aligned and exposes auditable route decisions.
begin;

create or replace function public.luvia_booking_route_rank(p_channel text)
returns integer language sql immutable as $$
 select case lower(coalesce(p_channel,''))
  when 'api' then 500
  when 'external_link' then 350
  when 'affiliate' then 300
  when 'email' then 200
  else 0 end
$$;

create or replace view public.booking_route_decision_runtime_v1 with (security_invoker=true) as
select
 d.id as decision_id,
 d.booking_id,
 b.trip_id,
 d.created_at,
 d.channel,
 d.provider,
 d.target,
 d.source_type,
 d.source_id,
 d.route_rank,
 d.requires_user_action,
 d.reason,
 d.excluded_channels,
 d.decision,
 coalesce(d.decision->>'policy','legacy') as policy,
 coalesce((d.decision->>'baseRank')::integer,public.luvia_booking_route_rank(d.channel)) as base_rank,
 coalesce((d.decision->>'providerIntelligence')::integer,0) as provider_intelligence,
 least(8,greatest(0,coalesce((d.decision->>'commercialWeightCap')::integer,8))) as commercial_weight_cap,
 coalesce((d.decision->>'commercialCanConfirmReservation')::boolean,false) as commercial_can_confirm_reservation,
 s.state as orchestration_state,
 s.retry_count,
 s.next_retry_at,
 s.last_error,
 s.current_attempt_id,
 a.status as current_attempt_status,
 a.error_class as current_attempt_error_class,
 a.retry_at as current_attempt_retry_at
from public.booking_route_decisions d
join public.bookings b on b.id=d.booking_id
left join public.booking_route_state s on s.current_decision_id=d.id
left join public.booking_route_attempts a on a.id=s.current_attempt_id;

grant select on public.booking_route_decision_runtime_v1 to authenticated,service_role;
comment on view public.booking_route_decision_runtime_v1 is
'Booking Core explainability read model for route decisions, policy evidence, current attempt and fallback/retry state. Reservation truth remains separate.';

create or replace function public.luvia_booking_orchestration_policy_snapshot()
returns jsonb language sql stable as $$
 select jsonb_build_object(
  'core','4.73.0',
  'build','13.73.0',
  'policy','user_interest_first',
  'routeOrder',jsonb_build_array('api','external_link','affiliate','email','manual'),
  'routeRanks',jsonb_build_object('api',500,'external_link',350,'affiliate',300,'email',200,'manual',0),
  'commercialWeightCap',8,
  'commercialCanConfirmReservation',false,
  'commissionCanConfirmReservation',false
 )
$$;

grant execute on function public.luvia_booking_orchestration_policy_snapshot() to authenticated,service_role;

comment on table public.booking_route_decisions is
'Luvia Booking route decisions. User-interest-first policy: API -> verified external link -> affiliate -> verified email -> manual. Decision JSON stores explainability evidence.';

insert into public.booking_health_checks(check_key,status,details,checked_at)
values('booking_orchestration_v4_73','ok',public.luvia_booking_orchestration_policy_snapshot()||jsonb_build_object('diagnosticsIntegrity',true,'decisionEvidence',true,'strictCoreHealth',true),now())
on conflict(check_key) do update set status=excluded.status,details=excluded.details,checked_at=excluded.checked_at;

commit;
