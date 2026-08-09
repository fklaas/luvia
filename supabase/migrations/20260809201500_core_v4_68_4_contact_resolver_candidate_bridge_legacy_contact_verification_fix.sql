-- Luvia v13.68.4 / Core 4.68.4
-- Contact Resolver Candidate Bridge & Legacy Contact Verification Fix
-- Runtime correction: a legacy bookings.contact.email is not sufficient evidence for Email Booking V2.
-- booking-contact-resolve must rediscover the exact email on an official public venue page and upsert
-- a verified booking_contact_candidates record before the email becomes auto-usable.
begin;

comment on table public.booking_contact_candidates is
'Verified booking contact candidates. Legacy bookings.contact values become auto-usable only after rediscovery on an official public venue source and idempotent candidate upsert.';

insert into public.booking_health_checks(check_key,status,details,checked_at)
values(
  'release',
  'ok',
  jsonb_build_object(
    'version','1.0.11',
    'integration_ready',true,
    'luvia_core','4.68.4',
    'luvia_build','13.68.4',
    'feature','Contact Resolver Candidate Bridge & Legacy Contact Verification Fix',
    'legacy_contact_short_circuit_removed',true,
    'legacy_contact_requires_official_rediscovery',true,
    'candidate_bridge_idempotent',true,
    'provider_email_guard_preserved',true,
    'email_v2_verified_candidate_gate_preserved',true,
    'checked_at',now()
  ),
  now()
)
on conflict(check_key) do update
set status=excluded.status,details=excluded.details,checked_at=excluded.checked_at;

commit;
