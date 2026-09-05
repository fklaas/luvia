-- Activate only the current Foursquare Place Search operation used as a
-- dietary-evidence fallback. Foursquare documents 500 free Pro calls from
-- 2026-06-01; Luvia retains 200 calls as account-wide reserve.
begin;

do $$
declare
  changed integer;
begin
  update public.places_provider_policies
  set operations = array['search']::text[],
      enabled = true,
      daily_limit = 12,
      monthly_limit = 300,
      minute_limit = 2,
      reset_timezone = 'UTC',
      blocked_until = null,
      last_status = null,
      policy_note = 'Foursquare Place Search dietary-evidence fallback only. Current free Pro allowance: 500 calls/month; local cap 300/month, 12/day, 2/min retains 200 calls. Details and photos remain disabled in this policy.',
      updated_at = now()
  where bucket = 'foursquare-places'
    and provider = 'foursquare';

  get diagnostics changed = row_count;
  if changed <> 1 then
    raise exception 'FOURSQUARE_DIETARY_EVIDENCE_POLICY_NOT_UPDATED';
  end if;
end $$;

commit;
