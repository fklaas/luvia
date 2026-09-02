-- Rollback for Core 4.82.148 Duffel Stays requested/provider-preparation slice.
-- This removes only the additive Duffel provider state and restores the prior
-- two-provider readiness view. It does not touch bookings, trips or other providers.
begin;

delete from public.booking_provider_operation_contracts where provider_id='duffel_stays';
delete from public.booking_provider_status_contracts where provider_id='duffel_stays';
delete from public.booking_monetization_profiles where provider_id='duffel_stays';
delete from public.booking_provider_connections where provider_id='duffel_stays';
delete from public.booking_provider_capabilities where provider_id='duffel_stays';

update public.booking_monetization_profiles
set commercial_status='partner_required',
    public_metadata=(public_metadata-'applicationStatus'-'applicationSubmittedOn'-'demandApiAccessSeparate'),
    evidence=(evidence-'affiliateOnboardingSubmitted'-'demandApiCredentialsVerified'),
    updated_at=now()
where provider_id='bookingcom_affiliate'
  and public_metadata->>'applicationSubmittedOn'='2026-09-02';

create or replace view public.booking_stay_offer_readiness_v1 as
select
  cap.provider_id,cap.display_name,cap.luvia_access_state,cap.supports_search,cap.supports_quote,cap.supports_availability,
  connection.connection_state,connection.activation_state,connection.probe_state,
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

revoke all on public.booking_stay_offer_readiness_v1 from public,anon,authenticated;
grant select on public.booking_stay_offer_readiness_v1 to service_role;
commit;
