-- Let a strictly identity-matched selected place consume one Foursquare photo
-- call from the same bounded free pool as dietary evidence search. This does not
-- raise a daily, monthly or minute limit and retains all recorded usage.
begin;

do $$
declare
  changed integer;
begin
  update public.places_provider_policies
  set operations = array['search','photo']::text[],
      enabled = true,
      daily_limit = 12,
      monthly_limit = 300,
      minute_limit = 2,
      reset_timezone = 'UTC',
      policy_note = 'Foursquare search plus one photo after strict selected-place identity matching. Both operations share the existing 300/month, 12/day and 2/min free reserve; details remain disabled.',
      updated_at = now()
  where bucket = 'foursquare-places'
    and provider = 'foursquare'
    and operations = array['search']::text[]
    and enabled = true
    and daily_limit = 12
    and monthly_limit = 300
    and minute_limit = 2;

  get diagnostics changed = row_count;
  if changed <> 1 then
    raise exception 'FOURSQUARE_EXACT_MEDIA_POLICY_NOT_UPDATED';
  end if;
end $$;

commit;
