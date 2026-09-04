-- Activate verified HERE services using one shared conservative location-services pool.
begin;
select bucket from public.places_provider_policies
where provider='here' order by bucket for update;

insert into public.places_provider_policies
  (bucket,provider,operations,enabled,daily_limit,monthly_limit,minute_limit,reset_timezone,policy_note)
values ('here-location-services','here',array['search','details','route'],true,500,10000,10,'UTC',
  'HERE search/WALK/BICYCLE live verified 2026-09-04. Public Limited Plan: 1000 requests/day; local shared 500/day, 10000/month reserve. Account-specific billing tier and external key usage not automatically read. No paid plan activated.');

-- Carry forward reservations from both old pools; never reset consumed quota.
insert into public.places_provider_usage(bucket,window_kind,window_start,units)
select 'here-location-services',window_kind,window_start,sum(units)::integer
from public.places_provider_usage where bucket in ('here-search','here-routing')
group by window_kind,window_start;

update public.places_provider_policies
set enabled=false,operations=array[]::text[],daily_limit=0,monthly_limit=0,minute_limit=0,
  policy_note='Retired split HERE pool. Reservations copied to here-location-services; legacy rows retained for audit.',updated_at=now()
where bucket in ('here-search','here-routing');
commit;
