-- Luvia v13.62.0 / Core 4.62.0
-- Reservation Creation Runtime V1
begin;

create table if not exists public.booking_reservation_create_requests (
  id uuid primary key default gen_random_uuid(),
  requested_by uuid,
  trip_id uuid not null references public.trips(id) on delete cascade,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  provider_id text not null references public.booking_provider_capabilities(provider_id) on delete restrict,
  venue_reference text not null,
  provider_slot_reference text,
  requested_date date not null,
  requested_time time,
  party_size integer not null check (party_size > 0 and party_size <= 1000),
  timezone text,
  idempotency_key text not null,
  request_fingerprint text not null,
  state text not null default 'received' check (state = any(array['received','blocked','calling_provider','applying','completed','failed','timed_out']::text[])),
  expected_state boolean not null default false,
  error_code text,
  attempt_count integer not null default 1 check (attempt_count > 0),
  provider_latency_ms integer check(provider_latency_ms is null or provider_latency_ms >= 0),
  reservation_reference text,
  provider_status text,
  luvia_status text check(luvia_status is null or luvia_status = any(array['requested','awaiting_reply','confirmed','declined','cancelled','failed']::text[])),
  status_signal_id uuid,
  evidence jsonb not null default '{}'::jsonb check(jsonb_typeof(evidence)='object'),
  created_at timestamptz not null default now(),
  finished_at timestamptz,
  unique(booking_id,idempotency_key)
);
create index if not exists booking_reservation_create_requests_provider_created_idx on public.booking_reservation_create_requests(provider_id,created_at desc);
create index if not exists booking_reservation_create_requests_booking_idx on public.booking_reservation_create_requests(booking_id,created_at desc);
alter table public.booking_reservation_create_requests enable row level security;
revoke all on public.booking_reservation_create_requests from public,anon,authenticated;
grant all on public.booking_reservation_create_requests to service_role;

create or replace view public.booking_provider_reservation_create_readiness_v1 as
select
  c.provider_id,c.display_name,c.active,c.supports_create_reservation,c.luvia_access_state,c.booking_mode,
  pc.connection_state,pc.credential_state,pc.credential_completeness,pc.config_completeness,pc.probe_state,
  case
    when c.active is not true then 'disabled'
    when c.supports_create_reservation is not true then 'unsupported'
    when c.luvia_access_state <> 'connected' then 'partner_required'
    when pc.connection_state <> 'connected' then 'connection_not_ready'
    when pc.probe_state <> 'healthy' then 'probe_not_healthy'
    when coalesce((c.metadata->'adapter'->>'liveTransportEnabled')::boolean,false) is not true then 'transport_not_ready'
    else 'ready'
  end as reservation_create_runtime_state,
  case
    when c.active is not true then 'PROVIDER_DISABLED'
    when c.supports_create_reservation is not true then 'RESERVATION_CREATE_NOT_SUPPORTED'
    when c.luvia_access_state <> 'connected' then 'PARTNER_REQUIRED'
    when pc.connection_state <> 'connected' then 'CONNECTION_NOT_READY'
    when pc.probe_state <> 'healthy' then 'LIVE_PROBE_NOT_HEALTHY'
    when coalesce((c.metadata->'adapter'->>'liveTransportEnabled')::boolean,false) is not true then 'RESERVATION_CREATE_TRANSPORT_NOT_ACTIVE'
    else 'RESERVATION_CREATE_RUNTIME_READY'
  end as reservation_create_runtime_reason,
  pc.last_probe_at,pc.last_checked_at
from public.booking_provider_capabilities c
left join public.booking_provider_connections pc on pc.provider_id=c.provider_id;

grant select on public.booking_provider_reservation_create_readiness_v1 to authenticated,service_role;

insert into public.booking_health_checks(check_key,status,details,checked_at)
values('release','ok',jsonb_build_object('version','1.0.2','integration_ready',true,'luvia_core','4.62.0','luvia_build','13.62.0','feature','Reservation Creation Runtime V1','checked_at',now()),now())
on conflict(check_key) do update set status=excluded.status,details=excluded.details,checked_at=excluded.checked_at;

commit;
