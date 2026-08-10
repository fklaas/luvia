begin;

-- Runtime release marker. No auth/session/trip schema changes are required for this fix.
insert into public.booking_health_checks(check_key,status,details,checked_at)
values(
  'release','ok',
  jsonb_build_object(
    'version','1.0.14',
    'integration_ready',true,
    'luvia_core','4.68.7',
    'luvia_build','13.68.7',
    'feature','Public Entry Mount Contract & Signed-out Boot Fix',
    'public_entry_default_container',true,
    'signed_out_explicit_mount_contract',true,
    'join_flow_empty_mount_recovery',true,
    'auth_session_schema_changed',false,
    'checked_at',now()
  ),now()
)
on conflict(check_key) do update
set status=excluded.status,details=excluded.details,checked_at=excluded.checked_at;

commit;
