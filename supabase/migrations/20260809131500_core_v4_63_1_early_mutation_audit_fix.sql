-- Luvia v13.63.1 / Core 4.63.1
-- Early Mutation Audit Fix
begin;

-- Early business guards can legitimately fire before a provider reservation reference
-- (and therefore a provider_id) exists. Keep booking_id/trip_id/idempotency mandatory,
-- but allow these two context fields to be absent in blocked audit rows.
alter table public.booking_reservation_modify_requests
  alter column provider_id drop not null,
  alter column reservation_reference drop not null;

alter table public.booking_reservation_cancel_requests
  alter column provider_id drop not null,
  alter column reservation_reference drop not null;

comment on column public.booking_reservation_modify_requests.provider_id is
  'Resolved provider for the mutation when available. May be null for early blocked audit attempts before a provider reservation reference exists.';
comment on column public.booking_reservation_modify_requests.reservation_reference is
  'Provider reservation reference when available. Null is valid only for early blocked audit attempts.';
comment on column public.booking_reservation_cancel_requests.provider_id is
  'Resolved provider for the mutation when available. May be null for early blocked audit attempts before a provider reservation reference exists.';
comment on column public.booking_reservation_cancel_requests.reservation_reference is
  'Provider reservation reference when available. Null is valid only for early blocked audit attempts.';

insert into public.booking_health_checks(check_key,status,details,checked_at)
values(
  'release',
  'ok',
  jsonb_build_object(
    'version','1.0.4',
    'integration_ready',true,
    'luvia_core','4.63.1',
    'luvia_build','13.63.1',
    'feature','Early Mutation Audit Fix',
    'checked_at',now()
  ),
  now()
)
on conflict(check_key) do update
set status=excluded.status,details=excluded.details,checked_at=excluded.checked_at;

commit;
