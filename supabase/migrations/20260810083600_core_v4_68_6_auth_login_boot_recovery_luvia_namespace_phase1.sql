begin;

-- Frontend/runtime release marker only. No auth tables, sessions, RLS policies or trip data
-- are renamed in phase 1. Compatibility aliases keep legacy clients operational.
insert into public.booking_health_checks(check_key,status,details,checked_at)
values(
  'release','ok',
  jsonb_build_object(
    'version','1.0.13',
    'integration_ready',true,
    'luvia_core','4.68.6',
    'luvia_build','13.68.6',
    'feature','Auth Login Boot Recovery & Paris→Luvia Namespace Migration Phase 1',
    'auth_login_boot_recovery',true,
    'canonical_luvia_auth_namespace',true,
    'paris_compatibility_aliases',true,
    'legacy_auth_storage_migration',true,
    'database_schema_renames',false,
    'checked_at',now()
  ),now()
)
on conflict(check_key) do update
set status=excluded.status,details=excluded.details,checked_at=excluded.checked_at;

commit;
