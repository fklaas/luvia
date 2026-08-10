-- v13.72.0 / Core 4.72.0 Booking Intelligence & Provider Orchestration smoke
-- Safe: all synthetic changes are rolled back.
begin;
select set_config('request.jwt.claim.role','service_role',true);

-- 1) New provider-intelligence read model must exist.
select provider_id,display_name,luvia_access_state,connection_state,availability_runtime_state,
       reliability_score,availability_score,direct_booking_score,commercial_score,
       commercial_signal_can_confirm_reservation
from public.booking_provider_orchestration_readiness_v1
order by provider_id;

-- 2) User-interest-first channel policy: verified direct/external route outranks affiliate.
select
  public.luvia_booking_route_rank('api') as api_rank,
  public.luvia_booking_route_rank('external_link') as external_link_rank,
  public.luvia_booking_route_rank('affiliate') as affiliate_rank,
  public.luvia_booking_route_rank('email') as email_rank,
  public.luvia_booking_route_rank('manual') as manual_rank;

-- 3) Commercial influence is capped in the readiness model and can never confirm reservation truth.
select
  max(commercial_score) as max_commercial_score,
  bool_and(commercial_signal_can_confirm_reservation=false) as commercial_never_confirms_reservation
from public.booking_provider_orchestration_readiness_v1;

-- 4) Safe real planner smoke against one existing booking. Synthetic candidates are rolled back.
create temporary table tmp_v13720_booking(id uuid) on commit drop;
insert into tmp_v13720_booking
select id from public.bookings order by created_at desc limit 1;

insert into public.booking_contact_candidates(
  booking_id,kind,channel,provider,contact_value,source_url,is_public,is_official,
  verification_status,confidence,auto_usable,evidence,metadata,last_verified_at
)
select id,'reservation_link','external_link','official_website',
       'https://myluvia.app/v13720-orchestration-smoke','https://myluvia.app',true,true,
       'verified',0.99,true,'{"test":"v13.72.0"}'::jsonb,'{"synthetic":true}'::jsonb,now()
from tmp_v13720_booking
on conflict do nothing;

insert into public.booking_contact_candidates(
  booking_id,kind,channel,provider,contact_value,source_url,is_public,is_official,
  verification_status,confidence,auto_usable,evidence,metadata,last_verified_at
)
select id,'public_reservation_email','email','email',
       'v13720-smoke@myluvia.app','https://myluvia.app',true,true,
       'verified',1.0,true,'{"test":"v13.72.0"}'::jsonb,'{"synthetic":true}'::jsonb,now()
from tmp_v13720_booking
on conflict do nothing;

select public.luvia_booking_plan_route(id,array['api']::text[]) as orchestration_result
from tmp_v13720_booking;

-- 5) Migration health marker.
select check_key,status,details,checked_at
from public.booking_health_checks
where check_key='booking_orchestration_v4_72';

rollback;
