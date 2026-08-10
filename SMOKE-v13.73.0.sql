begin;

select public.luvia_booking_orchestration_policy_snapshot() as policy_snapshot;

select
 public.luvia_booking_route_rank('api') as api_rank,
 public.luvia_booking_route_rank('external_link') as external_link_rank,
 public.luvia_booking_route_rank('affiliate') as affiliate_rank,
 public.luvia_booking_route_rank('email') as email_rank,
 public.luvia_booking_route_rank('manual') as manual_rank;

select
 count(*) >= 0 as runtime_view_queryable,
 coalesce(bool_and(commercial_can_confirm_reservation=false),true) as commercial_never_confirms_reservation,
 coalesce(bool_and(commercial_weight_cap<=8),true) as commercial_weight_capped
from public.booking_route_decision_runtime_v1;

select check_key,status,details,checked_at
from public.booking_health_checks
where check_key='booking_orchestration_v4_73';

rollback;
