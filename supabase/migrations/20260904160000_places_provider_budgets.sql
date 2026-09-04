-- Places provider infrastructure. No user/trip data, secrets or provider payloads.
begin;
create table public.places_provider_policies (
  bucket text primary key,
  provider text not null,
  operations text[] not null,
  enabled boolean not null default false,
  daily_limit integer not null default 0 check (daily_limit >= 0),
  monthly_limit integer not null default 0 check (monthly_limit >= 0),
  minute_limit integer not null default 0 check (minute_limit >= 0),
  reset_timezone text not null default 'UTC',
  blocked_until timestamptz,
  last_status integer,
  policy_note text not null,
  updated_at timestamptz not null default now()
);
create table public.places_provider_usage (
  bucket text not null references public.places_provider_policies(bucket),
  window_kind text not null check (window_kind in ('day','month','minute')),
  window_start timestamptz not null,
  units integer not null default 0 check (units >= 0),
  primary key(bucket,window_kind,window_start)
);
alter table public.places_provider_policies enable row level security;
alter table public.places_provider_usage enable row level security;
revoke all on public.places_provider_policies,public.places_provider_usage from public,anon,authenticated;
grant all on public.places_provider_policies,public.places_provider_usage to service_role;

-- All operations sharing a billing pool reserve under the same row lock.
-- Denied requests change no window; attempted requests are never refunded blindly.
create function public.luvia_reserve_provider_budget(p_provider text,p_operation text,p_units integer)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare p public.places_provider_policies; k text; lim integer; used integer; ts timestamptz; local_now timestamp; t timestamptz:=clock_timestamp();
begin
  if p_units is null or p_units < 1 or p_units > 1000 then raise exception 'INVALID_PROVIDER_UNITS'; end if;
  select * into p from public.places_provider_policies where provider=p_provider and p_operation=any(operations) for update;
  if not found or not p.enabled then return jsonb_build_object('allowed',false,'reason','not_enabled'); end if;
  t:=clock_timestamp();
  if p.blocked_until>t then return jsonb_build_object('allowed',false,'reason','cooldown','retryAt',p.blocked_until); end if;
  local_now:=t at time zone p.reset_timezone;
  foreach k in array array['month','day','minute'] loop
    lim:=case k when 'month' then p.monthly_limit when 'day' then p.daily_limit else p.minute_limit end;
    if lim>0 then
      ts:=date_trunc(k,local_now) at time zone p.reset_timezone;
      select u.units into used from public.places_provider_usage u where u.bucket=p.bucket and u.window_kind=k and u.window_start=ts;
      if coalesce(used,0)+p_units>lim then return jsonb_build_object('allowed',false,'reason','budget_exhausted','window',k,'limit',lim,'used',coalesce(used,0)); end if;
    end if;
  end loop;
  if p.monthly_limit=0 and p.daily_limit=0 then return jsonb_build_object('allowed',false,'reason','quota_unknown'); end if;
  foreach k in array array['month','day','minute'] loop
    lim:=case k when 'month' then p.monthly_limit when 'day' then p.daily_limit else p.minute_limit end;
    if lim>0 then
      ts:=date_trunc(k,local_now) at time zone p.reset_timezone;
      insert into public.places_provider_usage(bucket,window_kind,window_start,units) values(p.bucket,k,ts,p_units)
      on conflict(bucket,window_kind,window_start) do update set units=places_provider_usage.units+excluded.units;
    end if;
  end loop;
  -- The fixed-minute rows are operational counters, not an unbounded request log.
  delete from public.places_provider_usage where bucket=p.bucket and window_kind='minute' and window_start<t-interval '2 hours';
  return jsonb_build_object('allowed',true,'bucket',p.bucket,'reservedUnits',p_units);
end $$;

create function public.luvia_provider_outcome(p_provider text,p_operation text,p_status integer)
returns void language sql security definer set search_path=public,pg_temp as $$
  update public.places_provider_policies set last_status=p_status,updated_at=now(),
    blocked_until=case when p_status in (401,403) then now()+interval '1 day' when p_status=429 then now()+interval '15 minutes' when p_status>=500 or p_status=0 then now()+interval '30 seconds' else blocked_until end
  where provider=p_provider and p_operation=any(operations);
$$;

create function public.luvia_provider_budget_status()
returns jsonb language sql security definer set search_path=public,pg_temp as $$
  select coalesce(jsonb_agg(jsonb_build_object('bucket',p.bucket,'provider',p.provider,'operations',p.operations,'enabled',p.enabled,'dailyLimit',p.daily_limit,'monthlyLimit',p.monthly_limit,'minuteLimit',p.minute_limit,'resetTimezone',p.reset_timezone,'blockedUntil',p.blocked_until,'lastStatus',p.last_status,'note',p.policy_note,
    'usage',coalesce((select jsonb_object_agg(u.window_kind,u.units) from public.places_provider_usage u where u.bucket=p.bucket and u.window_start=(date_trunc(u.window_kind,now() at time zone p.reset_timezone) at time zone p.reset_timezone)),'{}'::jsonb)) order by p.bucket),'[]'::jsonb) from public.places_provider_policies p;
$$;
revoke all on function public.luvia_reserve_provider_budget(text,text,integer),public.luvia_provider_outcome(text,text,integer),public.luvia_provider_budget_status() from public,anon,authenticated;
grant execute on function public.luvia_reserve_provider_budget(text,text,integer),public.luvia_provider_outcome(text,text,integer),public.luvia_provider_budget_status() to service_role;

insert into public.places_provider_policies(bucket,provider,operations,enabled,daily_limit,monthly_limit,minute_limit,policy_note) values
('geoapify-all','geoapify',array['search','details','geocode','route'],true,2200,0,60,'Conservative local ceiling below 3000 free daily credits. Search reserves ceil(limit/20), details 5, two-point route 2. External account usage must be reconciled.'),
('tomtom-search-v2','tomtom',array['search','details','taxonomy'],true,150,1500,25,'Search API v2: 2500 free monthly requests publicly listed 2026-09-04. Local cap retains 1000 reserve. Not Orbis Discover billing.'),
('tomtom-routing','tomtom',array['route'],true,1000,12000,25,'Routing: 20000 free monthly requests publicly listed. Conservative local reserve.'),
('ors-directions','openrouteservice',array['route'],true,1200,0,20,'HeiGIT Standard observed: Directions v2 2000/day and 40/min. Local 1200/day and 20/min.'),
('here-search','here',array['search','details'],false,0,0,10,'Await confirmed account entitlement and free Search allowance; key alone does not enable billing.'),
('here-routing','here',array['route'],false,0,0,10,'Await confirmed account entitlement and free Routing allowance.'),
('google-places','google',array['search','details','photo','autocomplete','geocode','timezone','route'],false,0,0,10,'Explicit account/SKU and EEA map-content approval required before further automatic use.'),
('foursquare-places','foursquare',array['search','details','photo'],false,0,0,10,'Previously exhausted credits; verify current Pro and photo entitlements before activation.');
commit;
