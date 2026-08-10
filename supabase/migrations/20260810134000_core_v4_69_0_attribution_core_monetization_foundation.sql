-- Luvia v13.69.0 / Core 4.69.0
-- Attribution Core & Monetization Foundation
-- Canonical commercial-readiness layer over existing handoff/correlation/conversion/commission foundations.
-- Commercial facts NEVER mutate reservation truth.
begin;

create table if not exists public.booking_monetization_profiles (
  provider_id text primary key,
  display_name text not null,
  commercial_status text not null default 'partner_required' check (commercial_status in (
    'researching','inquiry_sent','application_pending','partner_required','contracting','active','paused','rejected','unavailable'
  )),
  monetization_mode text not null default 'unknown' check (monetization_mode in (
    'unknown','none','agent_attribution','affiliate_link','distribution_partner','referral','revenue_share','hybrid'
  )),
  tracking_strategy text not null default 'contract_defined' check (tracking_strategy in (
    'none','click_id','sub_id','agent_id','source_id','partner_id','mixed','contract_defined'
  )),
  attribution_model text not null default 'contract_defined' check (attribution_model in (
    'last_click','first_click','provider_reported','manual','contract_defined'
  )),
  attribution_window_days integer check (attribution_window_days is null or attribution_window_days between 1 and 365),
  supports_deep_links boolean,
  supports_click_id boolean,
  supports_sub_ids boolean,
  supports_agent_id boolean,
  supports_source_id boolean,
  supports_conversion_reporting boolean,
  supports_commission_reporting boolean,
  supports_postback boolean,
  supports_webhook boolean,
  supports_cancellation_reversal boolean,
  commercial_terms jsonb not null default '{}'::jsonb check (jsonb_typeof(commercial_terms)='object'),
  public_metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(public_metadata)='object'),
  evidence jsonb not null default '{}'::jsonb check (jsonb_typeof(evidence)='object'),
  terms_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.booking_monetization_profiles enable row level security;
revoke all on public.booking_monetization_profiles from public,anon,authenticated;
grant select,insert,update,delete on public.booking_monetization_profiles to service_role;
drop policy if exists booking_monetization_profiles_authenticated_read on public.booking_monetization_profiles;
create policy booking_monetization_profiles_authenticated_read on public.booking_monetization_profiles for select to authenticated using (true);
-- Authenticated clients may read only the non-sensitive readiness columns required by security-invoker views.
grant select(
  provider_id,display_name,commercial_status,monetization_mode,tracking_strategy,attribution_model,attribution_window_days,
  supports_deep_links,supports_click_id,supports_sub_ids,supports_agent_id,supports_source_id,
  supports_conversion_reporting,supports_commission_reporting,supports_postback,supports_webhook,supports_cancellation_reversal,
  public_metadata,terms_verified_at,created_at,updated_at
) on public.booking_monetization_profiles to authenticated;

-- Conservative seeds only. No commission rate, payout or contractual right is invented here.
insert into public.booking_monetization_profiles(
  provider_id,display_name,commercial_status,monetization_mode,tracking_strategy,attribution_model,
  supports_deep_links,supports_click_id,supports_sub_ids,supports_agent_id,supports_source_id,
  supports_conversion_reporting,supports_commission_reporting,supports_postback,supports_webhook,supports_cancellation_reversal,
  public_metadata,evidence,updated_at
) values
 ('quandoo','Quandoo','partner_required','agent_attribution','agent_id','provider_reported',true,null,null,true,null,null,null,null,null,null,
  '{"restaurantBookingCore":true,"commercialTerms":"unverified"}'::jsonb,
  '{"basis":"existing_luvia_provider_adapter","adapterSignal":"QUANDOO_AGENT_ID","reservationTruthIndependent":true}'::jsonb,now()),
 ('thefork','TheFork','partner_required','unknown','contract_defined','contract_defined',null,null,null,null,null,null,null,null,null,null,
  '{"restaurantBookingCore":true,"commercialTerms":"unverified"}'::jsonb,
  '{"basis":"existing_luvia_provider_adapter","reservationTruthIndependent":true}'::jsonb,now()),
 ('zenchef','Zenchef','partner_required','unknown','contract_defined','contract_defined',null,null,null,null,null,null,null,null,null,null,
  '{"restaurantBookingCore":true,"commercialTerms":"unverified"}'::jsonb,
  '{"basis":"existing_luvia_provider_adapter","reservationTruthIndependent":true}'::jsonb,now()),
 ('opentable','OpenTable','partner_required','unknown','contract_defined','contract_defined',null,null,null,null,null,null,null,null,null,null,
  '{"restaurantBookingCore":true,"commercialTerms":"unverified"}'::jsonb,
  '{"basis":"existing_luvia_provider_adapter","reservationTruthIndependent":true}'::jsonb,now()),
 ('sevenrooms','SevenRooms','partner_required','unknown','contract_defined','contract_defined',null,null,null,null,null,null,null,null,null,null,
  '{"restaurantBookingCore":true,"commercialTerms":"unverified"}'::jsonb,
  '{"basis":"existing_luvia_provider_adapter","reservationTruthIndependent":true}'::jsonb,now()),
 ('resy','Resy','partner_required','unknown','contract_defined','contract_defined',null,null,null,null,null,null,null,null,null,null,
  '{"restaurantBookingCore":true,"commercialTerms":"unverified"}'::jsonb,
  '{"basis":"existing_luvia_provider_adapter","reservationTruthIndependent":true}'::jsonb,now()),
 ('tock','Tock','partner_required','unknown','contract_defined','contract_defined',null,null,null,null,null,null,null,null,null,null,
  '{"restaurantBookingCore":true,"commercialTerms":"unverified"}'::jsonb,
  '{"basis":"existing_luvia_provider_adapter","reservationTruthIndependent":true}'::jsonb,now()),
 ('official','Offizielle Reservierung','unavailable','none','none','manual',false,false,false,false,false,false,false,false,false,false,
  '{"restaurantBookingCore":true,"commercialTerms":"none"}'::jsonb,
  '{"basis":"luvia_route_fallback","reservationTruthIndependent":true}'::jsonb,now()),
 ('email','E-Mail-Fallback','unavailable','none','none','manual',false,false,false,false,false,false,false,false,false,false,
  '{"restaurantBookingCore":true,"commercialTerms":"none"}'::jsonb,
  '{"basis":"luvia_email_booking_v2","reservationTruthIndependent":true}'::jsonb,now())
on conflict(provider_id) do update set
  display_name=excluded.display_name,
  -- Never overwrite a later real commercial activation/contract decision with conservative seed state.
  commercial_status=case when booking_monetization_profiles.commercial_status in ('active','contracting','application_pending','inquiry_sent','paused','rejected','unavailable') then booking_monetization_profiles.commercial_status else excluded.commercial_status end,
  monetization_mode=case when booking_monetization_profiles.monetization_mode<>'unknown' then booking_monetization_profiles.monetization_mode else excluded.monetization_mode end,
  tracking_strategy=case when booking_monetization_profiles.tracking_strategy<>'contract_defined' then booking_monetization_profiles.tracking_strategy else excluded.tracking_strategy end,
  attribution_model=case when booking_monetization_profiles.attribution_model<>'contract_defined' then booking_monetization_profiles.attribution_model else excluded.attribution_model end,
  public_metadata=booking_monetization_profiles.public_metadata||excluded.public_metadata,
  evidence=booking_monetization_profiles.evidence||excluded.evidence,
  updated_at=now();

create or replace view public.booking_monetization_provider_readiness_v1 with (security_invoker=true) as
select
  p.provider_id,p.display_name,p.commercial_status,p.monetization_mode,p.tracking_strategy,p.attribution_model,p.attribution_window_days,
  p.supports_deep_links,p.supports_click_id,p.supports_sub_ids,p.supports_agent_id,p.supports_source_id,
  p.supports_conversion_reporting,p.supports_commission_reporting,p.supports_postback,p.supports_webhook,p.supports_cancellation_reversal,
  p.public_metadata,p.terms_verified_at,
  c.integration_tier,c.booking_mode,c.luvia_access_state,c.commercial_access,c.attribution_mode as provider_attribution_mode,
  c.supports_availability,c.supports_create_reservation,c.supports_status_webhook,c.supports_status_polling,
  (c.luvia_access_state='connected') as provider_connected,
  (p.commercial_status='active') as commercial_active,
  false as commercial_signal_can_confirm_reservation
from public.booking_monetization_profiles p
left join public.booking_provider_capabilities c on c.provider_id=p.provider_id;

-- Expose only the sanitized readiness view, never commercial_terms/evidence.
grant select on public.booking_monetization_provider_readiness_v1 to authenticated,service_role;

create or replace function public.luvia_booking_prepare_monetized_handoff(
  p_trip_id uuid,
  p_place_type text,
  p_provider_place_id text,
  p_venue_name text,
  p_provider text,
  p_destination_url text,
  p_metadata jsonb default '{}'::jsonb
) returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_handoff_id uuid;
  v_correlation public.booking_correlations;
  v_profile public.booking_monetization_profiles;
  v_provider text:=lower(coalesce(nullif(trim(p_provider),''),'official'));
  v_snapshot jsonb;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  if p_trip_id is null or not public.luvia_booking_is_trip_member(p_trip_id) then raise exception 'TRIP_ACCESS_DENIED'; end if;

  v_handoff_id:=public.luvia_booking_record_place_handoff(
    p_trip_id,p_place_type,p_provider_place_id,p_venue_name,v_provider,p_destination_url,
    coalesce(p_metadata,'{}'::jsonb)||jsonb_build_object('monetizationCore','4.69.0')
  );

  select * into v_correlation from public.booking_correlations where handoff_event_id=v_handoff_id;
  select * into v_profile from public.booking_monetization_profiles where provider_id=v_provider;

  v_snapshot:=jsonb_build_object(
    'provider',v_provider,
    'commercialStatus',coalesce(v_profile.commercial_status,'partner_required'),
    'monetizationMode',coalesce(v_profile.monetization_mode,'unknown'),
    'trackingStrategy',coalesce(v_profile.tracking_strategy,'contract_defined'),
    'attributionModel',coalesce(v_profile.attribution_model,'contract_defined'),
    'commercialSignalCanConfirmReservation',false,
    'capturedAt',now()
  );

  if v_correlation.id is not null then
    update public.booking_correlations
      set metadata=metadata||jsonb_build_object('monetization',v_snapshot)
      where id=v_correlation.id
      returning * into v_correlation;
  end if;
  update public.booking_handoff_events
    set metadata=metadata||jsonb_build_object('monetization',v_snapshot)
    where id=v_handoff_id;

  return jsonb_build_object(
    'handoffId',v_handoff_id,
    'correlationId',v_correlation.id,
    'correlationToken',v_correlation.correlation_token,
    'provider',v_provider,
    'monetization',v_snapshot,
    'bookingStatusChanged',false
  );
end $$;
revoke all on function public.luvia_booking_prepare_monetized_handoff(uuid,text,text,text,text,text,jsonb) from public,anon;
grant execute on function public.luvia_booking_prepare_monetized_handoff(uuid,text,text,text,text,text,jsonb) to authenticated,service_role;

create or replace view public.booking_monetization_runtime_v1 with (security_invoker=true) as
select
  c.id as correlation_id,c.correlation_token,c.trip_id,c.booking_id,c.handoff_event_id,c.provider_id,c.provider_place_id,c.venue_name,
  c.state as correlation_state,c.created_at,c.linked_at,c.converted_at,c.expires_at,
  p.commercial_status,p.monetization_mode,p.tracking_strategy,p.attribution_model,
  b.status as booking_status,b.status_source,
  (select count(*) from public.booking_conversion_reports r where r.correlation_id=c.id) as conversion_count,
  (select count(*) from public.booking_commission_reconciliations x where x.correlation_id=c.id) as reconciliation_count,
  (select r.conversion_state from public.booking_conversion_reports r where r.correlation_id=c.id order by r.occurred_at desc,r.received_at desc limit 1) as latest_conversion_state,
  (select x.state from public.booking_commission_reconciliations x where x.correlation_id=c.id order by x.occurred_at desc,x.created_at desc limit 1) as latest_commission_state,
  (select coalesce(x.settled_amount,x.reported_amount,x.expected_amount) from public.booking_commission_reconciliations x where x.correlation_id=c.id order by x.occurred_at desc,x.created_at desc limit 1) as latest_commission_amount,
  (select coalesce(x.settled_currency,x.reported_currency,x.expected_currency) from public.booking_commission_reconciliations x where x.correlation_id=c.id order by x.occurred_at desc,x.created_at desc limit 1) as latest_commission_currency,
  false as booking_status_changed_by_commercial
from public.booking_correlations c
left join public.booking_monetization_profiles p on p.provider_id=c.provider_id
left join public.bookings b on b.id=c.booking_id;
grant select on public.booking_monetization_runtime_v1 to authenticated,service_role;

comment on table public.booking_monetization_profiles is 'Canonical provider-commercial readiness/configuration. Sensitive commercial terms stay service-role-only; public readiness is exposed via a sanitized view.';
comment on view public.booking_monetization_provider_readiness_v1 is 'Sanitized monetization readiness joined to provider capabilities. Commercial capability does not imply live provider access.';
comment on function public.luvia_booking_prepare_monetized_handoff(uuid,text,text,text,text,text,jsonb) is 'Canonical v13.69 handoff entrypoint. Reuses existing handoff/correlation foundations and snapshots monetization context without changing reservation status.';
comment on view public.booking_monetization_runtime_v1 is 'Unified read model over correlation, conversion and commission reconciliation. Commercial facts never mutate reservation truth.';

commit;
