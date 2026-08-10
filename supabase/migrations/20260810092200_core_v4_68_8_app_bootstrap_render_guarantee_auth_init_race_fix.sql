begin;

-- Runtime release marker. No auth/session/trip schema changes are required for this fix.
insert into public.booking_health_checks(check_key,status,details,checked_at)
values(
  'release','ok',
  jsonb_build_object(
    'version','1.0.15',
    'integration_ready',true,
    'luvia_core','4.68.8',
    'luvia_build','13.68.8',
    'feature','App Bootstrap Render Guarantee & Auth Init Race Fix',
    'document_ready_state_bootstrap',true,
    'idempotent_shell_start',true,
    'post_bootstrap_render_guarantee',true,
    'startup_empty_dom_recovery',true,
    'boot_diagnostics',true,
    'auth_session_schema_changed',false,
    'checked_at',now()
  ),now()
)
on conflict(check_key) do update
set status=excluded.status,details=excluded.details,checked_at=excluded.checked_at;

commit;
