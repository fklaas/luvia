-- Free, source-backed dietary evidence fallback for the Places "Passend" lane.
-- Only explicit diet:vegetarian/diet:vegan tags are read from Overpass. The
-- local ceiling is far below the public instance's published safe-use guidance.
begin;

insert into public.places_provider_policies
  (bucket,provider,operations,enabled,daily_limit,monthly_limit,minute_limit,reset_timezone,policy_note)
values (
  'openstreetmap-dietary-evidence','openstreetmap',array['search'],true,500,0,6,'UTC',
  'Overpass read-only fallback for explicit diet:vegetarian/diet:vegan tags. Six-hour gateway cache; local 500/day and 6/min ceiling. No generic Place discovery, routing, photos or inferred dietary claims.'
)
on conflict (bucket) do update set
  provider=excluded.provider,operations=excluded.operations,enabled=true,daily_limit=excluded.daily_limit,monthly_limit=0,minute_limit=excluded.minute_limit,
  reset_timezone=excluded.reset_timezone,blocked_until=null,last_status=null,policy_note=excluded.policy_note,updated_at=now();

commit;
