-- Luvia v13.59.0 / Core 4.59.0
-- Provider Activation Orchestrator + Expected-State Transport Cleanup
begin;

alter table public.booking_provider_connections
  add column if not exists orchestration_state text,
  add column if not exists orchestration_reason text,
  add column if not exists last_orchestrated_at timestamptz,
  add column if not exists consecutive_probe_failures integer not null default 0,
  add column if not exists next_probe_at timestamptz;


alter table public.booking_provider_connections
  drop constraint if exists booking_provider_connections_activation_state_check;
alter table public.booking_provider_connections
  add constraint booking_provider_connections_activation_state_check
  check (activation_state is null or activation_state = any(array['blocked','waiting_credentials','waiting_configuration','waiting_contract','ready_to_probe','ready_to_activate','active','degraded']::text[]));

alter table public.booking_provider_connections
  drop constraint if exists booking_provider_connections_orchestration_state_check;
alter table public.booking_provider_connections
  add constraint booking_provider_connections_orchestration_state_check
  check (orchestration_state is null or orchestration_state = any(array['idle','running','blocked','backoff','ready','degraded','active']::text[]));

alter table public.booking_provider_connections
  drop constraint if exists booking_provider_connections_consecutive_probe_failures_check;
alter table public.booking_provider_connections
  add constraint booking_provider_connections_consecutive_probe_failures_check
  check (consecutive_probe_failures >= 0);

create table if not exists public.booking_provider_activation_runs (
  id uuid primary key default gen_random_uuid(),
  provider_id text not null references public.booking_provider_capabilities(provider_id) on delete cascade,
  state text not null check (state = any(array['started','blocked','backoff','ready','degraded','active','failed']::text[])),
  phase text not null check (phase = any(array['preflight','probe','activation']::text[])),
  reason text,
  retry_after timestamptz,
  evidence jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.booking_provider_activation_runs enable row level security;
drop policy if exists booking_provider_activation_runs_read on public.booking_provider_activation_runs;
create policy booking_provider_activation_runs_read on public.booking_provider_activation_runs
  for select to authenticated using (true);
revoke all on public.booking_provider_activation_runs from anon;
grant select on public.booking_provider_activation_runs to authenticated;
grant all on public.booking_provider_activation_runs to service_role;

update public.booking_provider_connections
set orchestration_state=case when connection_state='connected' then 'active' else coalesce(orchestration_state,'idle') end,
    orchestration_reason=case when connection_state='connected' then 'ALREADY_CONNECTED' else coalesce(orchestration_reason,'NOT_ORCHESTRATED') end,
    updated_at=now();

create or replace view public.booking_provider_connection_readiness_v5 as
select c.provider_id,c.display_name,c.luvia_access_state,c.booking_mode,
 pc.connection_state,pc.credential_state,pc.contract_state,pc.availability_transport_state,pc.status_return_state,
 pc.activation_state,pc.activation_reason,pc.activation_requested_at,pc.activation_verified_at,
 pc.probe_state,pc.probe_strategy,pc.probe_reason,pc.last_probe,pc.last_probe_at,
 pc.orchestration_state,pc.orchestration_reason,pc.last_orchestrated_at,
 pc.consecutive_probe_failures,pc.next_probe_at,
 pc.required_secret_keys,pc.required_config_keys,pc.last_health,pc.last_checked_at,pc.connected_at,
 coalesce((select jsonb_agg(jsonb_build_object('transport',sc.transport,'contractVersion',sc.contract_version,'verificationState',sc.verification_state,'autoApply',sc.auto_apply,'active',sc.active) order by sc.transport)
   from public.booking_provider_status_contracts sc where sc.provider_id=c.provider_id and sc.active=true),'[]'::jsonb) as return_contracts,
 coalesce((select jsonb_agg(jsonb_build_object('state',pr.state,'reason',pr.reason,'httpStatus',pr.http_status,'latencyMs',pr.latency_ms,'finishedAt',pr.finished_at) order by pr.created_at desc)
   from (select * from public.booking_provider_probe_runs x where x.provider_id=c.provider_id order by x.created_at desc limit 5) pr),'[]'::jsonb) as recent_probes,
 coalesce((select jsonb_agg(jsonb_build_object('state',ar.state,'phase',ar.phase,'reason',ar.reason,'retryAfter',ar.retry_after,'finishedAt',ar.finished_at) order by ar.created_at desc)
   from (select * from public.booking_provider_activation_runs x where x.provider_id=c.provider_id order by x.created_at desc limit 5) ar),'[]'::jsonb) as recent_activation_runs
from public.booking_provider_capabilities c
left join public.booking_provider_connections pc on pc.provider_id=c.provider_id
where c.active=true;

grant select on public.booking_provider_connection_readiness_v5 to authenticated,service_role;

commit;
