-- Apple Maps Server API is prepared as a separate Apple-MapKit-only surface.
-- Apple Map Data must never enter the mixed MapLibre cascade or durable Place DB.
begin;
insert into public.places_provider_policies
  (bucket,provider,operations,enabled,daily_limit,monthly_limit,minute_limit,reset_timezone,policy_note)
values (
  'apple-maps-services','apple',array['token','search','details','geocode','autocomplete','route'],false,0,0,10,'UTC',
  'Prepared Apple Maps Server API adapter. Disabled until Maps ID, Team ID, Key ID, private key and Apple-MapKit-only transient consumer exist. Apple documents 25000 shared service calls/day/team; Apple Map Data must not enter MapLibre, provider merging or durable Place storage.'
)
on conflict (bucket) do update set
  provider=excluded.provider,operations=excluded.operations,enabled=false,daily_limit=0,monthly_limit=0,minute_limit=excluded.minute_limit,
  reset_timezone=excluded.reset_timezone,blocked_until=null,last_status=null,policy_note=excluded.policy_note,updated_at=now();
commit;
