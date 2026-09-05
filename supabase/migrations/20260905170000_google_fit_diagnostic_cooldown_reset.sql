-- One-time reset after activating the bounded Google fit-evidence lane.
-- The next health probe records the provider's original HTTP status and then
-- the ordinary cooldown policy applies again. Budgets and usage stay intact.
begin;

do $$
declare
  changed integer;
begin
  update public.places_provider_policies
  set blocked_until = null,
      last_status = null,
      updated_at = now()
  where bucket = 'google-places'
    and provider = 'google'
    and enabled = true
    and operations = array['search']::text[];

  get diagnostics changed = row_count;
  if changed <> 1 then
    raise exception 'GOOGLE_FIT_DIAGNOSTIC_COOLDOWN_NOT_RESET';
  end if;
end $$;

commit;
