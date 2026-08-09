-- Luvia v13.56.0 / Core 4.56.0
-- Provider Return Matrix + Booking Discovery Reliability
-- Expands every remaining provider into the verified-contract matrix without inventing status vocabularies.
begin;

-- Public capability sources verified on 2026-08-09. Empty status maps intentionally mean:
-- transport/capability exists publicly, but exact reservation status schema requires partner access.
insert into public.booking_provider_status_contracts(
  provider_id,transport,contract_version,verification_state,auto_apply,status_map,source_label,source_url,notes,verified_at,active
) values
('opentable','api','opentable-partner-api-2026-08','partner_schema_required',false,'{}'::jsonb,
 'OpenTable API Documentation','https://docs.opentable.com/',
 'OpenTable publicly documents booking APIs. Exact status vocabulary/authentication is partner gated and is not guessed.',now(),true),
('thefork','api','thefork-custom-api-2026-08','partner_schema_required',false,'{}'::jsonb,
 'TheFork Manager Custom API Integration','https://www.theforkmanager.com/en/restaurant-software-price',
 'TheFork publicly offers custom API integration for reservation data; exact return schema remains partner gated.',now(),true),
('resy','api','resy-booking-api-2026-08','partner_schema_required',false,'{}'::jsonb,
 'Resy Booking API','https://resy.com/join/plans-pricing/',
 'Resy publicly advertises Booking API access. Exact status vocabulary/authentication remains partner gated.',now(),true),
('resy','webhook','resy-webhooks-2026-08','partner_schema_required',false,'{}'::jsonb,
 'Resy Hospitality Groups','https://resy.com/join/hospitality-groups/',
 'Resy publicly confirms webhooks/open API. Exact webhook payload/signature contract is not public and is not guessed.',now(),true),
('zenchef','api','zenchef-partner-api-2026-08','partner_schema_required',false,'{}'::jsonb,
 'Zenchef API','https://help.zenchef.com/hc/en-gb/articles/27690768125597-Zenchef-API',
 'Zenchef publicly confirms reservation API access; exact schema requires partner credentials.',now(),true),
('sevenrooms','api','sevenrooms-booking-api-2026-08','partner_schema_required',false,'{}'::jsonb,
 'SevenRooms API & Integrations','https://sevenrooms.com/platform/integrations-apis/',
 'SevenRooms publicly confirms a restaurant booking API and flexible API. Exact return status vocabulary is not assumed.',now(),true)
on conflict(provider_id,transport) do update set
  contract_version=excluded.contract_version,
  verification_state=excluded.verification_state,
  auto_apply=excluded.auto_apply,
  status_map=excluded.status_map,
  source_label=excluded.source_label,
  source_url=excluded.source_url,
  notes=excluded.notes,
  verified_at=excluded.verified_at,
  active=true,
  updated_at=now();

-- Old placeholder polling contracts are not treated as public capabilities when only API/webhook access is verified.
update public.booking_provider_status_contracts
set active=false, updated_at=now(), notes=coalesce(notes,'')||' Superseded by Core 4.56.0 verified capability matrix.'
where (provider_id,transport) in (('opentable','polling'),('thefork','polling'),('resy','polling'))
  and verification_state='partner_schema_required';

create or replace view public.booking_provider_return_readiness as
select
  c.provider_id,
  c.display_name,
  c.luvia_access_state,
  c.supports_status_webhook,
  c.supports_status_polling,
  sc.transport,
  sc.contract_version,
  sc.verification_state,
  sc.auto_apply,
  sc.active as contract_active,
  sc.source_label,
  sc.source_url,
  case
    when sc.verification_state='verified_public' and sc.auto_apply then 'verified_mapping_ready'
    when sc.verification_state='partner_schema_required' then 'partner_schema_required'
    else 'not_connected'
  end as return_readiness
from public.booking_provider_capabilities c
left join public.booking_provider_status_contracts sc
  on sc.provider_id=c.provider_id and sc.active=true
where c.active=true;

grant select on public.booking_provider_return_readiness to authenticated,service_role;

commit;
