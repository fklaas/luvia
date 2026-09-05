-- Keep Luvia inside Geoapify's documented Free plan while releasing part of the
-- deliberately over-conservative local reserve. No paid fallback is enabled.
begin;

update public.places_provider_policies
set daily_limit = 2800,
    policy_note = 'Geoapify Free plan publicly lists 3000 credits/day. Luvia reserves 200 credits/day and keeps the existing conservative minute limit. External account usage must still be reconciled.',
    updated_at = now()
where bucket = 'geoapify-all'
  and provider = 'geoapify'
  and daily_limit < 2800;

do $$
begin
  if not exists (
    select 1
    from public.places_provider_policies
    where bucket = 'geoapify-all'
      and provider = 'geoapify'
      and enabled = true
      and daily_limit = 2800
  ) then
    raise exception 'GEOAPIFY_FREE_BUDGET_POLICY_NOT_UPDATED';
  end if;
end $$;

commit;
