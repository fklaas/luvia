-- Luvia v13.82.148 / Core 4.82.148
-- Duffel Stays application submitted + fail-closed provider preparation.
-- No credential, provider access or live price is inferred by this migration.
begin;

insert into public.booking_provider_capabilities(
  provider_id,display_name,verticals,integration_tier,booking_mode,luvia_access_state,
  supports_search,supports_details,supports_quote,supports_availability,supports_create_reservation,
  supports_modify_reservation,supports_cancel_reservation,supports_messaging,supports_status_webhook,supports_status_polling,
  attribution_mode,commercial_access,metadata,active,updated_at
) values (
  'duffel_stays','Duffel Stays',array['lodging'],'external_handoff','api','partner_required',
  true,true,true,true,true,false,true,false,false,true,
  'conversion','partner_required',
  '{"capabilityBasis":"official_stays_v2_docs","activationRequired":true,"applicationStatus":"submitted","applicationSubmittedOn":"2026-09-02","commercialModel":"profit_share_on_completed_stays","searchResultRequiresRateFetchBeforeQuote":true,"quoteRequiredBeforeBooking":true,"unknownBookingOutcomeMustNotRetry":true,"officialDocs":"https://duffel.com/docs/guides/getting-started-with-stays"}'::jsonb,
  true,now()
)
on conflict(provider_id) do update set
  display_name=excluded.display_name,verticals=excluded.verticals,
  integration_tier=case when booking_provider_capabilities.luvia_access_state='connected' then booking_provider_capabilities.integration_tier else excluded.integration_tier end,
  booking_mode=case when booking_provider_capabilities.luvia_access_state='connected' then booking_provider_capabilities.booking_mode else excluded.booking_mode end,
  luvia_access_state=case when booking_provider_capabilities.luvia_access_state='connected' then 'connected' else excluded.luvia_access_state end,
  supports_search=excluded.supports_search,supports_details=excluded.supports_details,supports_quote=excluded.supports_quote,
  supports_availability=excluded.supports_availability,supports_create_reservation=excluded.supports_create_reservation,
  supports_modify_reservation=excluded.supports_modify_reservation,supports_cancel_reservation=excluded.supports_cancel_reservation,
  supports_messaging=excluded.supports_messaging,supports_status_webhook=excluded.supports_status_webhook,supports_status_polling=excluded.supports_status_polling,
  attribution_mode=excluded.attribution_mode,commercial_access=excluded.commercial_access,
  metadata=booking_provider_capabilities.metadata||excluded.metadata,active=true,updated_at=now();

insert into public.booking_provider_connections(
  provider_id,connection_state,credential_state,contract_state,availability_transport_state,status_return_state,
  required_secret_keys,last_health,last_checked_at,updated_at
) values (
  'duffel_stays','partner_required','missing','verified_mapping_ready','disabled','ready',
  '["DUFFEL_ACCESS_TOKEN"]'::jsonb,
  '{"providerId":"duffel_stays","applicationStatus":"submitted","applicationSubmittedOn":"2026-09-02","connectionState":"partner_required","activationState":"waiting_credentials","activationReason":"DUFFEL_STAYS_ACCESS_PENDING","secretValuesStored":false}'::jsonb,
  now(),now()
)
on conflict(provider_id) do update set
  required_secret_keys=excluded.required_secret_keys,
  last_health=booking_provider_connections.last_health||excluded.last_health,
  updated_at=now();

insert into public.booking_provider_operation_contracts(
  provider_id,vertical,operation,transport,access_state,supported,idempotency_required,outcome_authority,
  adapter_function,contract_version,evidence_url,metadata
) values
  ('duffel_stays','lodging','search','api','partner_required',true,false,false,'booking-provider-duffel-stays','duffel-stays-v2','https://duffel.com/docs/api/v2/search','{"livePrice":true,"priceStage":"search_result","rateFetchRequired":true,"source":"provider_api"}'::jsonb),
  ('duffel_stays','lodging','details','api','partner_required',true,false,false,'booking-provider-duffel-stays','duffel-stays-v2','https://duffel.com/docs/api/v2/search-result/fetch-all-rates','{"operation":"fetch_all_rates","mandatoryTotalRequired":true}'::jsonb),
  ('duffel_stays','lodging','quote','api','partner_required',true,false,false,'booking-provider-duffel-stays','duffel-stays-v2','https://duffel.com/docs/api/v2/quotes/create-quote','{"finalAvailabilityAndPriceCheck":true,"quoteRequiredBeforeBooking":true}'::jsonb),
  ('duffel_stays','lodging','create','api','partner_required',true,true,true,'booking-provider-duffel-stays','duffel-stays-v2','https://duffel.com/docs/api/v2/bookings/create-booking','{"bookingOwnerLedgerRequired":true,"explicitUserConfirmationRequired":true,"unknownOutcome":"do_not_retry_reconcile_with_provider_request_id"}'::jsonb),
  ('duffel_stays','lodging','modify','api','partner_required',false,true,false,'booking-provider-duffel-stays','duffel-stays-v2','https://duffel.com/docs/api/v2/bookings/get-booking','{"supportedScope":"booking_users_only","stayChangeFallback":"verified_provider_contact"}'::jsonb),
  ('duffel_stays','lodging','cancel','api','partner_required',true,true,true,'booking-provider-duffel-stays','duffel-stays-v2','https://duffel.com/docs/api/v2/bookings/cancel-booking','{"bookingOwnerLedgerRequired":true,"explicitUserConfirmationRequired":true}'::jsonb),
  ('duffel_stays','lodging','status','polling','partner_required',true,false,true,'booking-provider-duffel-stays','duffel-stays-v2','https://duffel.com/docs/api/v2/bookings/get-booking','{"verifiedPublicStatuses":["confirmed","cancelled"],"bookingOwnerLedgerRequired":true}'::jsonb)
on conflict(provider_id,vertical,operation,transport,contract_version) do update set
  access_state=case when booking_provider_operation_contracts.access_state='connected' then 'connected' else excluded.access_state end,
  supported=excluded.supported,idempotency_required=excluded.idempotency_required,outcome_authority=excluded.outcome_authority,
  adapter_function=excluded.adapter_function,evidence_url=excluded.evidence_url,
  metadata=booking_provider_operation_contracts.metadata||excluded.metadata,active=true,updated_at=now();

insert into public.booking_provider_status_contracts(
  provider_id,transport,contract_version,verification_state,auto_apply,status_map,source_label,source_url,notes,verified_at,active
) values (
  'duffel_stays','polling','duffel-stays-v2','verified_public',false,
  '{"CONFIRMED":"confirmed","CANCELLED":"cancelled"}'::jsonb,
  'Duffel Stays Booking API','https://duffel.com/docs/api/v2/bookings/get-booking',
  'Public Duffel Stays booking status vocabulary. Auto-apply remains disabled until activation proves an authenticated provider poll linked to the exact Luvia booking.',now(),true
)
on conflict(provider_id,transport) do update set
  contract_version=excluded.contract_version,verification_state=excluded.verification_state,auto_apply=excluded.auto_apply,
  status_map=excluded.status_map,source_label=excluded.source_label,source_url=excluded.source_url,notes=excluded.notes,
  verified_at=excluded.verified_at,active=true,updated_at=now();

insert into public.booking_monetization_profiles(
  provider_id,display_name,commercial_status,monetization_mode,tracking_strategy,attribution_model,
  supports_deep_links,supports_click_id,supports_sub_ids,supports_conversion_reporting,supports_commission_reporting,
  supports_postback,supports_webhook,supports_cancellation_reversal,public_metadata,evidence,updated_at
) values (
  'duffel_stays','Duffel Stays','application_pending','distribution_partner','partner_id','provider_reported',
  false,false,true,true,true,false,false,true,
  '{"verticals":["lodging"],"applicationStatus":"submitted","applicationSubmittedOn":"2026-09-02","activationRequired":true,"profitShare":"completed_stay_contract_defined"}'::jsonb,
  '{"basis":"official_duffel_stays_docs_and_user_confirmed_submission","reservationTruthIndependent":true,"commercialTermsRequired":true,"secretValuesStored":false}'::jsonb,
  now()
)
on conflict(provider_id) do update set
  display_name=excluded.display_name,
  commercial_status=case when booking_monetization_profiles.commercial_status in ('active','contracting','paused','rejected') then booking_monetization_profiles.commercial_status else excluded.commercial_status end,
  monetization_mode=excluded.monetization_mode,tracking_strategy=excluded.tracking_strategy,attribution_model=excluded.attribution_model,
  supports_deep_links=excluded.supports_deep_links,supports_click_id=excluded.supports_click_id,supports_sub_ids=excluded.supports_sub_ids,
  supports_conversion_reporting=excluded.supports_conversion_reporting,supports_commission_reporting=excluded.supports_commission_reporting,
  supports_postback=excluded.supports_postback,supports_webhook=excluded.supports_webhook,supports_cancellation_reversal=excluded.supports_cancellation_reversal,
  public_metadata=booking_monetization_profiles.public_metadata||excluded.public_metadata,
  evidence=booking_monetization_profiles.evidence||excluded.evidence,updated_at=now();

update public.booking_monetization_profiles
set commercial_status='application_pending',
    public_metadata=public_metadata||'{"applicationStatus":"submitted","applicationSubmittedOn":"2026-09-02","demandApiAccessSeparate":true}'::jsonb,
    evidence=evidence||'{"affiliateOnboardingSubmitted":true,"demandApiCredentialsVerified":false}'::jsonb,
    updated_at=now()
where provider_id='bookingcom_affiliate';

create or replace view public.booking_stay_offer_readiness_v1 as
select
  cap.provider_id,cap.display_name,cap.luvia_access_state,cap.supports_search,cap.supports_quote,cap.supports_availability,
  connection.connection_state,connection.activation_state,connection.probe_state,
  case
    when cap.provider_id not in ('duffel_stays','hotelbeds','amadeus_hotels') then 'unsupported'
    when cap.supports_search is not true or cap.supports_quote is not true then 'capability_disabled'
    when cap.provider_id='duffel_stays' and cap.metadata->>'applicationStatus'='submitted' and cap.luvia_access_state<>'connected' then 'application_pending'
    when cap.luvia_access_state <> 'connected' then 'partner_required'
    when coalesce(connection.connection_state,'missing') <> 'connected' then 'connection_not_ready'
    when coalesce(connection.activation_state,'missing') <> 'active' then 'activation_not_ready'
    when cap.provider_id='duffel_stays' and coalesce(connection.probe_state,'missing') <> 'healthy' then 'probe_not_ready'
    else 'ready'
  end as runtime_state,
  case
    when cap.provider_id not in ('duffel_stays','hotelbeds','amadeus_hotels') then 'PROVIDER_UNSUPPORTED'
    when cap.supports_search is not true or cap.supports_quote is not true then 'PROVIDER_CAPABILITY_DISABLED'
    when cap.provider_id='duffel_stays' and cap.metadata->>'applicationStatus'='submitted' and cap.luvia_access_state<>'connected' then 'APPLICATION_PENDING'
    when cap.luvia_access_state <> 'connected' then 'PARTNER_REQUIRED'
    when coalesce(connection.connection_state,'missing') <> 'connected' then 'CONNECTION_NOT_READY'
    when coalesce(connection.activation_state,'missing') <> 'active' then 'ACTIVATION_NOT_READY'
    when cap.provider_id='duffel_stays' and coalesce(connection.probe_state,'missing') <> 'healthy' then 'LIVE_PROBE_NOT_HEALTHY'
    else null
  end as runtime_reason
from public.booking_provider_capabilities cap
left join public.booking_provider_connections connection on connection.provider_id=cap.provider_id
where cap.provider_id in ('duffel_stays','hotelbeds','amadeus_hotels') and cap.active=true;

revoke all on public.booking_stay_offer_readiness_v1 from public,anon,authenticated;
grant select on public.booking_stay_offer_readiness_v1 to service_role;

comment on view public.booking_stay_offer_readiness_v1 is 'Fail-closed hotel price gate. Duffel application submission, credentials and a live probe are separate states; only connected+active+healthy may receive traffic.';
commit;
