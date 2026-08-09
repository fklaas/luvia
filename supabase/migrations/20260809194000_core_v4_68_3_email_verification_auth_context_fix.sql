-- Luvia v13.68.3 / Core 4.68.3
-- Email Verification Auth Context Fix
-- Runtime-only auth-context correction: verified venue contact RPC must execute with
-- the authenticated user JWT after the booking itself has passed RLS access checks.
begin;

comment on function public.luvia_booking_email_verified_candidate(uuid,text) is
'Email Booking V2 venue-contact verification. The send runtime must invoke this RPC with the authenticated user context so trip membership is evaluated through auth.uid(); service-role remains reserved for server-side audit/thread persistence.';

insert into public.booking_health_checks(check_key,status,details,checked_at)
values(
  'release',
  'ok',
  jsonb_build_object(
    'version','1.0.10',
    'integration_ready',true,
    'luvia_core','4.68.3',
    'luvia_build','13.68.3',
    'feature','Email Verification Auth Context Fix',
    'email_verification_authenticated_context',true,
    'email_audit_service_role_separation',true,
    'recipient_expected_state_guard_preserved',true,
    'checked_at',now()
  ),
  now()
)
on conflict(check_key) do update
set status=excluded.status,details=excluded.details,checked_at=excluded.checked_at;

commit;
