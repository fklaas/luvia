-- One-time reset after the current dietary category path was activated. The
-- next bounded probe captures the original provider HTTP status; normal
-- cooldown behavior applies immediately afterwards. Usage is never removed.
begin;

do $$
declare
  changed integer;
begin
  update public.places_provider_policies
  set blocked_until = null,
      last_status = null,
      updated_at = now()
  where bucket = 'foursquare-places'
    and provider = 'foursquare'
    and enabled = true
    and operations = array['search']::text[];

  get diagnostics changed = row_count;
  if changed <> 1 then
    raise exception 'FOURSQUARE_DIETARY_DIAGNOSTIC_COOLDOWN_NOT_RESET';
  end if;
end $$;

commit;
