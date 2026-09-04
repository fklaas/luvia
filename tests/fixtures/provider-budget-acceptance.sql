begin;
insert into public.places_provider_policies(bucket,provider,operations,enabled,daily_limit,monthly_limit,minute_limit,policy_note)
values('acceptance-only-budget','acceptance-only',array['search','route'],true,3,4,3,'Transaction rollback fixture');
do $$ declare result jsonb; n integer; begin
  result:=public.luvia_reserve_provider_budget('acceptance-only','search',2);
  if result->>'allowed'<>'true' then raise exception 'initial reservation failed'; end if;
  result:=public.luvia_reserve_provider_budget('acceptance-only','route',2);
  if result->>'allowed'<>'false' then raise exception 'shared pool overrun'; end if;
  select units into n from public.places_provider_usage where bucket='acceptance-only-budget' and window_kind='month';
  if n<>2 then raise exception 'denied request mutated month'; end if;
  result:=public.luvia_reserve_provider_budget('acceptance-only','route',1);
  if result->>'allowed'<>'true' then raise exception 'remaining budget lost'; end if;
  perform public.luvia_provider_outcome('acceptance-only','route',429);
  result:=public.luvia_reserve_provider_budget('acceptance-only','search',1);
  if result->>'reason'<>'cooldown' then raise exception 'cooldown missing'; end if;
  if has_function_privilege('authenticated','public.luvia_reserve_provider_budget(text,text,integer)','execute') then raise exception 'authenticated budget mutation exposed'; end if;
  if has_table_privilege('anon','public.places_provider_policies','update') then raise exception 'anonymous policy mutation exposed'; end if;
  update public.places_provider_policies set enabled=false where bucket='acceptance-only-budget';
  result:=public.luvia_reserve_provider_budget('acceptance-only','search',1);
  if result->>'reason'<>'not_enabled' then raise exception 'disabled policy bypass'; end if;
end $$;
select 'PASS shared pools, atomic deny, cooldown, disabled policy and grants' as result;
rollback;
