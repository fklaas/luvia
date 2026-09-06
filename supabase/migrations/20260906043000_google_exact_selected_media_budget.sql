-- Google Places search and photo are separate billable SKUs. The existing
-- search policy remains bounded to 800 Enterprise reads per month. Add an
-- equally bounded photo bucket and allow the search lane to resolve a photo
-- reference only after the traveler selects one exact place.
begin;

do $$
declare
  changed integer;
begin
  update public.places_provider_policies
  set blocked_until = null,
      last_status = null,
      policy_note = 'Google Text Search is used for verified profile evidence and strict selected-place photo identity. Current Enterprise free cap is 1000 monthly events per SKU; local search cap remains 800/month, 25/day, 4/min. External key usage must be reconciled.',
      updated_at = now()
  where bucket = 'google-places'
    and provider = 'google'
    and operations = array['search']::text[]
    and enabled = true
    and daily_limit = 25
    and monthly_limit = 800
    and minute_limit = 4;

  get diagnostics changed = row_count;
  if changed <> 1 then
    raise exception 'GOOGLE_EXACT_MEDIA_SEARCH_POLICY_NOT_READY';
  end if;

  insert into public.places_provider_policies(
    bucket,provider,operations,enabled,daily_limit,monthly_limit,minute_limit,
    reset_timezone,blocked_until,last_status,policy_note
  ) values (
    'google-place-photo','google',array['photo']::text[],true,25,800,4,
    'UTC',null,null,
    'Place Photos (New), selected-place only. Current Enterprise photo free cap is 1000 monthly events; local cap 800/month, 25/day, 4/min retains reserve. Photo names come only from a strict exact-place Google match.'
  )
  on conflict(bucket) do update set
    provider=excluded.provider,
    operations=excluded.operations,
    enabled=excluded.enabled,
    daily_limit=excluded.daily_limit,
    monthly_limit=excluded.monthly_limit,
    minute_limit=excluded.minute_limit,
    reset_timezone=excluded.reset_timezone,
    policy_note=excluded.policy_note,
    updated_at=now();
end $$;

commit;
