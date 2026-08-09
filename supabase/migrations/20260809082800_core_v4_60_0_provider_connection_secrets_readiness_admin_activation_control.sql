-- Luvia v13.60.0 / Core 4.60.0
-- Provider Connection Secrets Readiness + Admin Activation Control
-- Secret VALUES remain in the Edge Function environment only. Database stores safe counts/states, never values.
begin;

alter table public.booking_provider_connections
  add column if not exists required_secret_count integer not null default 0,
  add column if not exists configured_secret_count integer not null default 0,
  add column if not exists required_config_count integer not null default 0,
  add column if not exists configured_config_count integer not null default 0,
  add column if not exists credential_completeness text,
  add column if not exists config_completeness text,
  add column if not exists credential_checked_at timestamptz,
  add column if not exists admin_activation_state text,
  add column if not exists admin_activation_reason text,
  add column if not exists admin_activation_checked_at timestamptz;

alter table public.booking_provider_connections
  drop constraint if exists booking_provider_connections_secret_counts_check;
alter table public.booking_provider_connections
  add constraint booking_provider_connections_secret_counts_check
  check (required_secret_count >= 0 and configured_secret_count >= 0 and configured_secret_count <= required_secret_count);

alter table public.booking_provider_connections
  drop constraint if exists booking_provider_connections_config_counts_check;
alter table public.booking_provider_connections
  add constraint booking_provider_connections_config_counts_check
  check (required_config_count >= 0 and configured_config_count >= 0 and configured_config_count <= required_config_count);

alter table public.booking_provider_connections
  drop constraint if exists booking_provider_connections_credential_completeness_check;
alter table public.booking_provider_connections
  add constraint booking_provider_connections_credential_completeness_check
  check (credential_completeness is null or credential_completeness = any(array['not_applicable','schema_unknown','missing','partial','complete']::text[]));

alter table public.booking_provider_connections
  drop constraint if exists booking_provider_connections_config_completeness_check;
alter table public.booking_provider_connections
  add constraint booking_provider_connections_config_completeness_check
  check (config_completeness is null or config_completeness = any(array['not_applicable','missing','partial','complete']::text[]));

alter table public.booking_provider_connections
  drop constraint if exists booking_provider_connections_admin_activation_state_check;
alter table public.booking_provider_connections
  add constraint booking_provider_connections_admin_activation_state_check
  check (admin_activation_state is null or admin_activation_state = any(array['locked','approved','expired','revoked','not_required']::text[]));

create table if not exists public.booking_provider_activation_controls (
  provider_id text primary key references public.booking_provider_capabilities(provider_id) on delete cascade,
  activation_enabled boolean not null default false,
  require_manual_approval boolean not null default true,
  approval_state text not null default 'locked' check (approval_state = any(array['locked','approved','expired','revoked']::text[])),
  approved_until timestamptz,
  reason text,
  evidence jsonb not null default '{}'::jsonb,
  requested_at timestamptz,
  approved_at timestamptz,
  revoked_at timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.booking_provider_activation_controls enable row level security;
revoke all on public.booking_provider_activation_controls from public,anon,authenticated;
grant all on public.booking_provider_activation_controls to service_role;

create table if not exists public.booking_provider_admin_actions (
  id uuid primary key default gen_random_uuid(),
  provider_id text not null references public.booking_provider_capabilities(provider_id) on delete cascade,
  action text not null check (action = any(array['control_enabled','control_disabled','probe_requested','activation_requested','activation_completed','activation_blocked']::text[])),
  actor_kind text not null default 'service_role' check (actor_kind = any(array['service_role','sql_admin']::text[])),
  reason text,
  evidence jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table public.booking_provider_admin_actions enable row level security;
revoke all on public.booking_provider_admin_actions from public,anon,authenticated;
grant all on public.booking_provider_admin_actions to service_role;

-- Email is an internal connected transport and needs no provider secret/admin approval.
update public.booking_provider_connections
set required_secret_count=0,
    configured_secret_count=0,
    required_config_count=0,
    configured_config_count=0,
    credential_completeness='not_applicable',
    config_completeness='not_applicable',
    credential_checked_at=now(),
    admin_activation_state='not_required',
    admin_activation_reason='INTERNAL_TRANSPORT',
    admin_activation_checked_at=now(),
    updated_at=now()
where provider_id='email';

create or replace function public.luvia_booking_provider_admin_activation_eligible(p_provider_id text)
returns boolean
language sql stable security definer
set search_path=public
as $$
  select coalesce((select
    pc.credential_completeness='complete'
    and pc.config_completeness in ('complete','not_applicable')
    and pc.probe_state='healthy'
    and pc.last_probe_at is not null
    and pc.last_probe_at >= now() - interval '10 minutes'
    and pc.activation_state in ('ready_to_activate','active')
    and ctl.activation_enabled=true
    and ctl.approval_state='approved'
    and (ctl.approved_until is null or ctl.approved_until > now())
  from public.booking_provider_connections pc
  join public.booking_provider_activation_controls ctl on ctl.provider_id=pc.provider_id
  where pc.provider_id=lower(trim(coalesce(p_provider_id,'')))),false);
$$;
revoke all on function public.luvia_booking_provider_admin_activation_eligible(text) from public,anon;
grant execute on function public.luvia_booking_provider_admin_activation_eligible(text) to authenticated,service_role;

create or replace view public.booking_provider_connection_readiness_v6 as
select c.provider_id,c.display_name,c.luvia_access_state,c.booking_mode,
 pc.connection_state,pc.credential_state,pc.credential_completeness,
 pc.required_secret_count,pc.configured_secret_count,pc.credential_checked_at,
 pc.config_completeness,pc.required_config_count,pc.configured_config_count,
 pc.contract_state,pc.availability_transport_state,pc.status_return_state,
 pc.activation_state,pc.activation_reason,pc.activation_requested_at,pc.activation_verified_at,
 pc.probe_state,pc.probe_strategy,pc.probe_reason,pc.last_probe,pc.last_probe_at,
 pc.orchestration_state,pc.orchestration_reason,pc.last_orchestrated_at,
 pc.consecutive_probe_failures,pc.next_probe_at,
 case
   when c.provider_id='email' then 'not_required'
   when ctl.activation_enabled=true and ctl.approval_state='approved' and (ctl.approved_until is null or ctl.approved_until>now()) then 'approved'
   when ctl.approval_state='approved' and ctl.approved_until is not null and ctl.approved_until<=now() then 'expired'
   when ctl.approval_state='revoked' then 'revoked'
   else 'locked'
 end as admin_activation_state,
 case
   when c.provider_id='email' then 'INTERNAL_TRANSPORT'
   when ctl.activation_enabled=true and ctl.approval_state='approved' and (ctl.approved_until is null or ctl.approved_until>now()) then 'ADMIN_APPROVAL_ACTIVE'
   when ctl.approval_state='approved' and ctl.approved_until is not null and ctl.approved_until<=now() then 'ADMIN_APPROVAL_EXPIRED'
   when ctl.approval_state='revoked' then 'ADMIN_APPROVAL_REVOKED'
   else 'ADMIN_APPROVAL_REQUIRED'
 end as admin_activation_reason,
 ctl.approved_until as admin_approved_until,
 pc.required_secret_keys,pc.required_config_keys,pc.last_health,pc.last_checked_at,pc.connected_at,
 coalesce((select jsonb_agg(jsonb_build_object('transport',sc.transport,'contractVersion',sc.contract_version,'verificationState',sc.verification_state,'autoApply',sc.auto_apply,'active',sc.active) order by sc.transport)
   from public.booking_provider_status_contracts sc where sc.provider_id=c.provider_id and sc.active=true),'[]'::jsonb) as return_contracts,
 coalesce((select jsonb_agg(jsonb_build_object('state',pr.state,'reason',pr.reason,'httpStatus',pr.http_status,'latencyMs',pr.latency_ms,'finishedAt',pr.finished_at) order by pr.created_at desc)
   from (select * from public.booking_provider_probe_runs x where x.provider_id=c.provider_id order by x.created_at desc limit 5) pr),'[]'::jsonb) as recent_probes,
 coalesce((select jsonb_agg(jsonb_build_object('state',ar.state,'phase',ar.phase,'reason',ar.reason,'retryAfter',ar.retry_after,'finishedAt',ar.finished_at) order by ar.created_at desc)
   from (select * from public.booking_provider_activation_runs x where x.provider_id=c.provider_id order by x.created_at desc limit 5) ar),'[]'::jsonb) as recent_activation_runs
from public.booking_provider_capabilities c
left join public.booking_provider_connections pc on pc.provider_id=c.provider_id
left join public.booking_provider_activation_controls ctl on ctl.provider_id=c.provider_id
where c.active=true;

grant select on public.booking_provider_connection_readiness_v6 to authenticated,service_role;

commit;
