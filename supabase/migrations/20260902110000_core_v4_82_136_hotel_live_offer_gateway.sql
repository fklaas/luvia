-- M16.5 Block 1 / Core 4.82.136: fail-closed Hotel live-offer evidence gateway.
begin;

create table if not exists public.booking_stay_offer_searches (
  id uuid primary key default gen_random_uuid(),
  requested_by uuid not null references auth.users(id) on delete cascade,
  trip_id uuid null references public.trips(id) on delete set null,
  query_fingerprint text not null,
  provider_ids text[] not null default '{}'::text[],
  succeeded_provider_ids text[] not null default '{}'::text[],
  failed_provider_ids text[] not null default '{}'::text[],
  state text not null default 'created' check (state = any(array['created','running','completed','failed']::text[])),
  product_mode text null check (product_mode is null or product_mode = any(array['fit_only','single_source_live_prices','cross_source_live_prices']::text[])),
  result_count integer not null default 0 check (result_count >= 0),
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  finished_at timestamptz null
);

create index if not exists booking_stay_offer_searches_user_created_idx
  on public.booking_stay_offer_searches(requested_by,created_at desc);
create index if not exists booking_stay_offer_searches_trip_created_idx
  on public.booking_stay_offer_searches(trip_id,created_at desc)
  where trip_id is not null;
create index if not exists booking_stay_offer_searches_fingerprint_created_idx
  on public.booking_stay_offer_searches(query_fingerprint,created_at desc);

create table if not exists public.booking_stay_offer_snapshots (
  id uuid primary key default gen_random_uuid(),
  search_id uuid not null references public.booking_stay_offer_searches(id) on delete cascade,
  provider_id text not null references public.booking_provider_capabilities(provider_id) on delete restrict,
  observed_at timestamptz not null,
  offer_count integer not null default 0 check (offer_count >= 0),
  offer_summaries jsonb not null default '[]'::jsonb check (jsonb_typeof(offer_summaries)='array'),
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists booking_stay_offer_snapshots_search_provider_idx
  on public.booking_stay_offer_snapshots(search_id,provider_id);

alter table public.booking_stay_offer_searches enable row level security;
alter table public.booking_stay_offer_snapshots enable row level security;
revoke all on public.booking_stay_offer_searches, public.booking_stay_offer_snapshots from public, anon, authenticated;
grant all on public.booking_stay_offer_searches, public.booking_stay_offer_snapshots to service_role;

create or replace view public.booking_stay_offer_readiness_v1 as
select
  cap.provider_id,
  cap.display_name,
  cap.luvia_access_state,
  cap.supports_search,
  cap.supports_quote,
  cap.supports_availability,
  connection.connection_state,
  connection.activation_state,
  connection.probe_state,
  case
    when cap.provider_id not in ('amadeus_hotels','hotelbeds') then 'unsupported'
    when cap.supports_search is not true or cap.supports_quote is not true then 'capability_disabled'
    when cap.luvia_access_state <> 'connected' then 'partner_required'
    when coalesce(connection.connection_state,'missing') <> 'connected' then 'connection_not_ready'
    when coalesce(connection.activation_state,'missing') <> 'active' then 'activation_not_ready'
    else 'ready'
  end as runtime_state,
  case
    when cap.provider_id not in ('amadeus_hotels','hotelbeds') then 'PROVIDER_UNSUPPORTED'
    when cap.supports_search is not true or cap.supports_quote is not true then 'PROVIDER_CAPABILITY_DISABLED'
    when cap.luvia_access_state <> 'connected' then 'PARTNER_REQUIRED'
    when coalesce(connection.connection_state,'missing') <> 'connected' then 'CONNECTION_NOT_READY'
    when coalesce(connection.activation_state,'missing') <> 'active' then 'ACTIVATION_NOT_READY'
    else null
  end as runtime_reason
from public.booking_provider_capabilities cap
left join public.booking_provider_connections connection on connection.provider_id=cap.provider_id
where cap.provider_id in ('amadeus_hotels','hotelbeds') and cap.active=true;

revoke all on public.booking_stay_offer_readiness_v1 from public, anon, authenticated;
grant select on public.booking_stay_offer_readiness_v1 to service_role;

insert into public.booking_provider_operation_contracts(provider_id,vertical,operation,transport,access_state,supported,idempotency_required,outcome_authority,adapter_function,contract_version,evidence_url,metadata)
values
  ('amadeus_hotels','lodging','search','api','partner_required',true,false,false,'booking-provider-amadeus-hotels','hotel-live-offer-v1','https://developers.amadeus.com/self-service/apis-docs/guides/developer-guides/resources/hotels/','{"livePrice":true,"childOccupancy":"fail_closed","source":"provider_api"}'::jsonb),
  ('amadeus_hotels','lodging','quote','api','partner_required',true,false,false,'booking-provider-amadeus-hotels','hotel-live-offer-v1','https://developers.amadeus.com/self-service/apis-docs/guides/developer-guides/resources/hotels/','{"mandatoryTotalRequired":true,"source":"provider_api"}'::jsonb),
  ('hotelbeds','lodging','search','api','partner_required',true,false,false,'booking-provider-hotelbeds','hotel-live-offer-v1','https://developer.hotelbeds.com/documentation/hotels/booking-api/','{"livePrice":true,"providerDestinationIdRequired":true,"source":"provider_api"}'::jsonb),
  ('hotelbeds','lodging','quote','api','partner_required',true,false,false,'booking-provider-hotelbeds','hotel-live-offer-v1','https://developer.hotelbeds.com/documentation/hotels/booking-api/','{"mandatoryTotalRequired":true,"source":"provider_api"}'::jsonb)
on conflict(provider_id,vertical,operation,transport,contract_version) do update set
  access_state=case when booking_provider_operation_contracts.access_state='connected' then 'connected' else excluded.access_state end,
  supported=excluded.supported,
  adapter_function=excluded.adapter_function,
  evidence_url=excluded.evidence_url,
  metadata=booking_provider_operation_contracts.metadata||excluded.metadata,
  active=true,
  updated_at=now();

update public.booking_provider_capabilities
set metadata=metadata||jsonb_build_object(
  'hotelLiveOfferGateway','booking-hotel-offer-search',
  'hotelLiveOfferContract','hotel-live-offer-v1',
  'priceRankingRequiresConnectedLiveResponse',true,
  'affiliateLinkCannotSupplyPrice',true,
  'bestMarketClaimAllowed',false
),updated_at=now()
where provider_id in ('amadeus_hotels','hotelbeds');

comment on table public.booking_stay_offer_searches is 'Privacy-bounded Booking Owner ledger for authenticated hotel live-offer searches. Raw prompts and exact coordinates are not stored.';
comment on table public.booking_stay_offer_snapshots is 'Normalized, bounded provider price evidence. It never converts affiliate links into live-price claims.';
comment on view public.booking_stay_offer_readiness_v1 is 'Fail-closed readiness gate: credentials alone do not activate hotel provider traffic.';

commit;
