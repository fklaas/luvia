-- Enable only the bounded Google Text Search read used to prove profile fit.
-- Google Maps Platform lists 1,000 free monthly events for Text Search
-- Enterprise + Atmosphere (the tier that carries servesVegetarianFood).
-- Luvia retains a 200-event monthly reserve and admits no other Google
-- operation through this policy.
begin;

do $$
declare
  changed integer;
begin
  update public.places_provider_policies
  set operations = array['search']::text[],
      enabled = true,
      daily_limit = 25,
      monthly_limit = 800,
      minute_limit = 4,
      reset_timezone = 'UTC',
      blocked_until = null,
      last_status = null,
      policy_note = 'Google Text Search profile-evidence only. Current Enterprise + Atmosphere free cap: 1000/month; local cap 800/month, 25/day, 4/min retains reserve. External key usage must be reconciled. Details, photo, autocomplete, geocode, timezone and route remain disabled.',
      updated_at = now()
  where bucket = 'google-places'
    and provider = 'google';

  get diagnostics changed = row_count;
  if changed <> 1 then
    raise exception 'GOOGLE_PROFILE_EVIDENCE_POLICY_NOT_UPDATED';
  end if;
end $$;

commit;
