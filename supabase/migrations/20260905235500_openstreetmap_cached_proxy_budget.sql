-- Separate cheap authenticated Edge-cache lookups from direct Overpass reads.
-- Direct reads keep the conservative 500/day and 6/minute ceiling. A cache
-- lookup normally terminates inside Cloudflare's six-hour cache and therefore
-- must not exhaust the direct upstream allowance during normal map gestures.
begin;

insert into public.places_provider_policies
  (bucket,provider,operations,enabled,daily_limit,monthly_limit,minute_limit,reset_timezone,policy_note)
values (
  'openstreetmap-cached-proxy','openstreetmap-cache',array['lookup'],true,20000,0,300,'UTC',
  'Authenticated Luvia Edge-proxy lookups with six-hour Cloudflare cache, 14 whitelisted categories, bounded radius and row cap. Direct Overpass reads retain their separate conservative budget.'
)
on conflict (bucket) do update set
  provider=excluded.provider,operations=excluded.operations,enabled=true,daily_limit=excluded.daily_limit,monthly_limit=0,minute_limit=excluded.minute_limit,
  reset_timezone=excluded.reset_timezone,blocked_until=null,last_status=null,policy_note=excluded.policy_note,updated_at=now();

commit;
