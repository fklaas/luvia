-- Luvia v13.59.0 / Core 4.59.0
-- Provider Credential Activation + Live Probe Runtime V1
-- Secrets remain in Supabase Edge Function environment only. Database stores state/evidence, never values.
begin;

alter table public.booking_provider_connections
  add column if not exists required_config_keys jsonb not null default '[]'::jsonb,
  add column if not exists probe_strategy text,
  add column if not exists probe_reason text,
  add column if not exists activation_requested_at timestamptz,
  add column if not exists activation_verified_at timestamptz;

alter table public.booking_provider_connections
  drop constraint if exists booking_provider_connections_activation_state_check;
alter table public.booking_provider_connections
  add constraint booking_provider_connections_activation_state_check
  check (activation_state is null or activation_state = any(array['blocked','waiting_credentials','waiting_configuration','waiting_contract','ready_to_activate','active','degraded']::text[]));

alter table public.booking_provider_connections
  drop constraint if exists booking_provider_connections_probe_state_check;
alter table public.booking_provider_connections
  add constraint booking_provider_connections_probe_state_check
  check (probe_state is null or probe_state = any(array['not_run','not_applicable','blocked','ready','running','healthy','degraded','failed']::text[]));

alter table public.booking_provider_connections
  drop constraint if exists booking_provider_connections_probe_strategy_check;
alter table public.booking_provider_connections
  add constraint booking_provider_connections_probe_strategy_check
  check (probe_strategy is null or probe_strategy = any(array['none','contract_required','read_only_http']::text[]));

create table if not exists public.booking_provider_probe_runs (
  id uuid primary key default gen_random_uuid(),
  provider_id text not null references public.booking_provider_capabilities(provider_id) on delete cascade,
  probe_kind text not null default 'connection' check (probe_kind = any(array['connection','credentials','activation']::text[])),
  state text not null check (state = any(array['started','blocked','healthy','degraded','failed']::text[])),
  reason text,
  http_status integer,
  latency_ms integer check (latency_ms is null or latency_ms >= 0),
  credential_state text,
  contract_state text,
  evidence jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.booking_provider_probe_runs enable row level security;
drop policy if exists booking_provider_probe_runs_read on public.booking_provider_probe_runs;
create policy booking_provider_probe_runs_read on public.booking_provider_probe_runs
  for select to authenticated using (true);
revoke all on public.booking_provider_probe_runs from anon;
grant select on public.booking_provider_probe_runs to authenticated;
grant all on public.booking_provider_probe_runs to service_role;

-- Publicly documented Quandoo read-only probe requires a concrete merchant context.
-- Merchant id is configuration, not a secret, but is kept server-side with the provider connection config.
update public.booking_provider_connections set
  required_config_keys='["QUANDOO_PROBE_MERCHANT_ID"]'::jsonb,
  probe_strategy='read_only_http',
  probe_reason='PUBLIC_READ_ONLY_RESERVATION_SETTINGS_PROBE',
  updated_at=now()
where provider_id='quandoo';

update public.booking_provider_connections set
  probe_strategy='contract_required',
  probe_reason='EXACT_PARTNER_PROBE_CONTRACT_REQUIRED',
  updated_at=now()
where provider_id in ('thefork','zenchef','opentable','sevenrooms','resy','tock');

-- Email is an internal transport and does not need an external provider probe.
insert into public.booking_provider_connections(provider_id,connection_state,credential_state,activation_state,activation_reason,probe_state,probe_strategy,probe_reason)
select 'email','connected','not_applicable','active','CAPABILITY_ALREADY_CONNECTED','healthy','none','INTERNAL_TRANSPORT'
where exists(select 1 from public.booking_provider_capabilities where provider_id='email')
on conflict(provider_id) do update set
  connection_state='connected',credential_state='not_applicable',activation_state='active',
  activation_reason='CAPABILITY_ALREADY_CONNECTED',probe_state='healthy',probe_strategy='none',probe_reason='INTERNAL_TRANSPORT',updated_at=now();

create or replace view public.booking_provider_connection_readiness_v4 as
select c.provider_id,c.display_name,c.luvia_access_state,c.booking_mode,
 pc.connection_state,pc.credential_state,pc.contract_state,pc.availability_transport_state,pc.status_return_state,
 pc.activation_state,pc.activation_reason,pc.activation_requested_at,pc.activation_verified_at,
 pc.probe_state,pc.probe_strategy,pc.probe_reason,pc.last_probe,pc.last_probe_at,
 pc.required_secret_keys,pc.required_config_keys,pc.last_health,pc.last_checked_at,pc.connected_at,
 coalesce((select jsonb_agg(jsonb_build_object('transport',sc.transport,'contractVersion',sc.contract_version,'verificationState',sc.verification_state,'autoApply',sc.auto_apply,'active',sc.active) order by sc.transport)
   from public.booking_provider_status_contracts sc where sc.provider_id=c.provider_id and sc.active=true),'[]'::jsonb) as return_contracts,
 coalesce((select jsonb_agg(jsonb_build_object('state',pr.state,'reason',pr.reason,'httpStatus',pr.http_status,'latencyMs',pr.latency_ms,'finishedAt',pr.finished_at) order by pr.created_at desc)
   from (select * from public.booking_provider_probe_runs x where x.provider_id=c.provider_id order by x.created_at desc limit 5) pr),'[]'::jsonb) as recent_probes
from public.booking_provider_capabilities c
left join public.booking_provider_connections pc on pc.provider_id=c.provider_id
where c.active=true;

grant select on public.booking_provider_connection_readiness_v4 to authenticated,service_role;

-- Activation is never inferred merely from credentials. It requires a healthy live probe and explicit activation.
create or replace function public.luvia_booking_provider_activation_eligible(p_provider_id text)
returns boolean
language sql stable security definer
set search_path=public
as $$
  select coalesce((select
    pc.credential_state='configured'
    and pc.probe_state='healthy'
    and pc.activation_state in ('ready_to_activate','active')
    and (
      pc.contract_state='verified_mapping_ready'
      or pc.status_return_state='disabled'
    )
  from public.booking_provider_connections pc
  where pc.provider_id=lower(trim(coalesce(p_provider_id,'')))),false);
$$;
revoke all on function public.luvia_booking_provider_activation_eligible(text) from public,anon;
grant execute on function public.luvia_booking_provider_activation_eligible(text) to authenticated,service_role;

commit;
