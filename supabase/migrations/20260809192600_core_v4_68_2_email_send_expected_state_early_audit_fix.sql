-- Luvia v13.68.2 / Core 4.68.2
-- Email Send Expected-State & Early Audit Fix
begin;

comment on table public.booking_email_requests is
'Email Booking V2 outbound request audit. v13.68.2 requires the audit row to exist before recipient verification so blocked recipient guards are persisted before any transport attempt.';

insert into public.booking_health_checks(check_key,status,details,checked_at)
values(
  'release',
  'ok',
  jsonb_build_object(
    'version','1.0.9',
    'integration_ready',true,
    'luvia_core','4.68.2',
    'luvia_build','13.68.2',
    'feature','Email Send Expected-State & Early Audit Fix',
    'recipient_expected_states_http_200',true,
    'early_email_request_audit',true,
    'checked_at',now()
  ),
  now()
)
on conflict(check_key) do update
set status=excluded.status,details=excluded.details,checked_at=excluded.checked_at;

commit;
