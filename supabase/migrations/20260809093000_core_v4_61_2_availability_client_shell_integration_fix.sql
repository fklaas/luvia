-- Luvia v13.61.2 / Core 4.61.2
-- Availability Client Shell Integration Fix
begin;

insert into public.booking_health_checks(check_key,status,details,checked_at)
values(
  'release',
  'ok',
  jsonb_build_object(
    'version','1.0.2',
    'integration_ready',true,
    'luvia_core','4.61.2',
    'luvia_build','13.61.2',
    'feature','Availability Client Shell Integration Fix',
    'checked_at',now()
  ),
  now()
)
on conflict(check_key) do update set
  status=excluded.status,
  details=excluded.details,
  checked_at=excluded.checked_at;

commit;
