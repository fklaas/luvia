-- Luvia v13.61.0 / Core 4.61.0
-- Provider Availability Runtime V1
begin;

create table if not exists public.booking_availability_requests (
  id uuid primary key default gen_random_uuid(),
  requested_by uuid,
  trip_id uuid,
  booking_id uuid references public.bookings(id) on delete set null,
  provider_id text not null references public.booking_provider_capabilities(provider_id) on delete restrict,
  venue_reference text not null,
  requested_date date not null,
  requested_time time,
  party_size integer not null check (party_size > 0 and party_size <= 1000),
  timezone text,
  request_fingerprint text not null,
  state text not null default 'received' check (state = any(array['received','blocked','completed','failed','timed_out']::text[])),
  expected_state boolean not null default false,
  error_code text,
  result_count integer not null default 0 check (result_count >= 0),
  provider_latency_ms integer check (provider_latency_ms is null or provider_latency_ms >= 0),
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);
create index if not exists booking_availability_requests_provider_created_idx on public.booking_availability_requests(provider_id,created_at desc);
create index if not exists booking_availability_requests_booking_idx on public.booking_availability_requests(booking_id) where booking_id is not null;
create index if not exists booking_availability_requests_fingerprint_idx on public.booking_availability_requests(request_fingerprint,created_at desc);
alter table public.booking_availability_requests enable row level security;
revoke all on public.booking_availability_requests from public,anon,authenticated;
grant all on public.booking_availability_requests to service_role;

create table if not exists public.booking_availability_snapshots (
  id uuid primary key default gen_random_uuid(),
  availability_request_id uuid not null references public.booking_availability_requests(id) on delete cascade,
  provider_id text not null references public.booking_provider_capabilities(provider_id) on delete restrict,
  venue_reference text not null,
  requested_date date not null,
  party_size integer not null,
  slots jsonb not null default '[]'::jsonb check (jsonb_typeof(slots)='array'),
  provider_response_meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists booking_availability_snapshots_request_idx on public.booking_availability_snapshots(availability_request_id);
alter table public.booking_availability_snapshots enable row level security;
revoke all on public.booking_availability_snapshots from public,anon,authenticated;
grant all on public.booking_availability_snapshots to service_role;

create or replace view public.booking_provider_availability_readiness_v1 as
select
  c.provider_id,
  c.display_name,
  c.active,
  c.supports_availability,
  c.luvia_access_state,
  c.booking_mode,
  pc.connection_state,
  pc.credential_state,
  pc.credential_completeness,
  pc.config_completeness,
  pc.probe_state,
  pc.availability_transport_state,
  case
    when c.active is not true then 'disabled'
    when c.supports_availability is not true then 'unsupported'
    when c.luvia_access_state <> 'connected' then 'partner_required'
    when pc.connection_state <> 'connected' then 'connection_not_ready'
    when pc.availability_transport_state <> 'active' then 'transport_not_ready'
    when pc.probe_state <> 'healthy' and c.provider_id <> 'email' then 'probe_not_healthy'
    else 'ready'
  end as availability_runtime_state,
  case
    when c.active is not true then 'PROVIDER_DISABLED'
    when c.supports_availability is not true then 'AVAILABILITY_NOT_SUPPORTED'
    when c.luvia_access_state <> 'connected' then 'PARTNER_REQUIRED'
    when pc.connection_state <> 'connected' then 'CONNECTION_NOT_READY'
    when pc.availability_transport_state <> 'active' then 'AVAILABILITY_TRANSPORT_NOT_ACTIVE'
    when pc.probe_state <> 'healthy' and c.provider_id <> 'email' then 'LIVE_PROBE_NOT_HEALTHY'
    else 'AVAILABILITY_RUNTIME_READY'
  end as availability_runtime_reason,
  pc.last_probe_at,
  pc.last_checked_at
from public.booking_provider_capabilities c
left join public.booking_provider_connections pc on pc.provider_id=c.provider_id;

grant select on public.booking_provider_availability_readiness_v1 to authenticated,service_role;

insert into public.booking_core_releases(version,notes,integration_ready)
values ('4.61.0','Provider Availability Runtime V1: normalized availability contract, audited requests/snapshots, provider readiness gate, timeout and expected-state normalization. No fake slots.',true)
on conflict (version) do update set notes=excluded.notes,integration_ready=excluded.integration_ready;

commit;
