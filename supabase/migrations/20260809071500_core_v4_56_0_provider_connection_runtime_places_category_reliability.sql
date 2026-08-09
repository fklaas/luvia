-- Luvia v13.56.0 / Core 4.56.0
-- Provider Connection Runtime + Places Category Reliability
begin;

create table if not exists public.booking_provider_connections (
  provider_id text primary key references public.booking_provider_capabilities(provider_id) on delete cascade,
  connection_state text not null default 'partner_required' check (connection_state = any(array['partner_required','configuring','ready_to_connect','connected','degraded','disabled']::text[])),
  credential_state text not null default 'unknown' check (credential_state = any(array['missing','partial','configured','not_applicable','unknown']::text[])),
  contract_state text not null default 'not_connected' check (contract_state = any(array['verified_mapping_ready','partner_schema_required','not_connected']::text[])),
  availability_transport_state text not null default 'disabled' check (availability_transport_state = any(array['disabled','ready','active']::text[])),
  status_return_state text not null default 'disabled' check (status_return_state = any(array['disabled','ready','active','partner_schema_required']::text[])),
  required_secret_keys jsonb not null default '[]'::jsonb check (jsonb_typeof(required_secret_keys)='array'),
  last_health jsonb not null default '{}'::jsonb,
  last_checked_at timestamptz,
  connected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.booking_provider_connections enable row level security;
drop policy if exists booking_provider_connections_read on public.booking_provider_connections;
create policy booking_provider_connections_read on public.booking_provider_connections for select to authenticated using (true);
revoke all on public.booking_provider_connections from anon;
grant select on public.booking_provider_connections to authenticated;
grant all on public.booking_provider_connections to service_role;

insert into public.booking_provider_connections(provider_id,required_secret_keys) values
 ('thefork','["THEFORK_CLIENT_ID","THEFORK_CLIENT_SECRET"]'::jsonb),
 ('quandoo','["QUANDOO_AUTH_TOKEN","QUANDOO_AGENT_ID"]'::jsonb),
 ('zenchef','["ZENCHEF_API_CREDENTIALS","ZENCHEF_PARTNER_CONTRACT_VERSION"]'::jsonb),
 ('opentable','["OPENTABLE_CLIENT_ID","OPENTABLE_CLIENT_SECRET","OPENTABLE_PARTNER_CONTRACT_VERSION"]'::jsonb),
 ('sevenrooms','[]'::jsonb),
 ('resy','[]'::jsonb),
 ('tock','[]'::jsonb)
on conflict(provider_id) do update set required_secret_keys=excluded.required_secret_keys,updated_at=now();

-- Initial state is derived only from known capability/contract metadata. Credentials are never stored here.
update public.booking_provider_connections pc set
 contract_state=coalesce((select case when bool_or(r.return_readiness='verified_mapping_ready') then 'verified_mapping_ready' when bool_or(r.return_readiness='partner_schema_required') then 'partner_schema_required' else 'not_connected' end from public.booking_provider_return_readiness r where r.provider_id=pc.provider_id),'not_connected'),
 status_return_state=coalesce((select case when bool_or(r.return_readiness='verified_mapping_ready') then 'ready' when bool_or(r.return_readiness='partner_schema_required') then 'partner_schema_required' else 'disabled' end from public.booking_provider_return_readiness r where r.provider_id=pc.provider_id),'disabled'),
 connection_state=case when exists(select 1 from public.booking_provider_capabilities c where c.provider_id=pc.provider_id and c.luvia_access_state='connected') then 'connected' else 'partner_required' end,
 updated_at=now();

create or replace view public.booking_provider_connection_readiness_v2 as
select c.provider_id,c.display_name,c.luvia_access_state,c.booking_mode,
 pc.connection_state,pc.credential_state,pc.contract_state,pc.availability_transport_state,pc.status_return_state,
 pc.required_secret_keys,pc.last_health,pc.last_checked_at,pc.connected_at,
 coalesce((select jsonb_agg(jsonb_build_object('transport',sc.transport,'contractVersion',sc.contract_version,'verificationState',sc.verification_state,'autoApply',sc.auto_apply,'active',sc.active) order by sc.transport) from public.booking_provider_status_contracts sc where sc.provider_id=c.provider_id and sc.active=true),'[]'::jsonb) as return_contracts
from public.booking_provider_capabilities c
left join public.booking_provider_connections pc on pc.provider_id=c.provider_id
where c.active=true;

grant select on public.booking_provider_connection_readiness_v2 to authenticated,service_role;
commit;
