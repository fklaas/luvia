-- Luvia Core 4.82.136 · Universal Admission, Lodging & Affiliate Foundation
-- Additive only. Partner-required providers remain fail-closed until explicit health/contract activation.
begin;

alter table public.booking_provider_capabilities
  add column if not exists verticals text[] not null default array['dining']::text[],
  add column if not exists supports_search boolean,
  add column if not exists supports_details boolean,
  add column if not exists supports_quote boolean,
  add column if not exists supports_modify_reservation boolean,
  add column if not exists supports_cancel_reservation boolean,
  add column if not exists supports_messaging boolean;

create index if not exists booking_provider_capabilities_verticals_gin
  on public.booking_provider_capabilities using gin(verticals);

create table if not exists public.booking_provider_operation_contracts (
  id uuid primary key default gen_random_uuid(),
  provider_id text not null references public.booking_provider_capabilities(provider_id) on delete cascade,
  vertical text not null check(vertical in ('dining','lodging','attraction','culture','activity','event','transport','rental','other')),
  operation text not null check(operation in ('search','details','quote','availability','create','modify','cancel','status','message','handoff','conversion','commission')),
  transport text not null check(transport in ('api','webhook','polling','tracked_handoff','handoff','email','commercial_report')),
  access_state text not null default 'partner_required' check(access_state in ('connected','partner_required','discovery','disabled')),
  supported boolean,
  idempotency_required boolean not null default false,
  outcome_authority boolean not null default false,
  adapter_function text,
  contract_version text not null,
  evidence_url text,
  metadata jsonb not null default '{}'::jsonb check(jsonb_typeof(metadata)='object'),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider_id,vertical,operation,transport,contract_version)
);

alter table public.booking_provider_operation_contracts enable row level security;
drop policy if exists booking_provider_operation_contracts_authenticated_select on public.booking_provider_operation_contracts;
create policy booking_provider_operation_contracts_authenticated_select on public.booking_provider_operation_contracts
  for select to authenticated using(active=true);
grant select on public.booking_provider_operation_contracts to authenticated;
grant select,insert,update,delete on public.booking_provider_operation_contracts to service_role;

insert into public.booking_provider_capabilities(
  provider_id,display_name,verticals,integration_tier,booking_mode,luvia_access_state,
  supports_search,supports_details,supports_quote,supports_availability,supports_create_reservation,
  supports_modify_reservation,supports_cancel_reservation,supports_messaging,supports_status_webhook,supports_status_polling,
  attribution_mode,commercial_access,metadata,active,updated_at
) values
 ('tiqets','Tiqets',array['attraction','culture','activity'],'external_handoff','handoff','partner_required',true,true,true,true,true,false,true,null,true,true,'conversion','partner_required','{"capabilityBasis":"official_docs","activationRequired":true,"verticalFoundation":"admission"}'::jsonb,true,now()),
 ('viator','Viator',array['attraction','culture','activity'],'external_handoff','handoff','partner_required',true,true,true,true,true,false,true,null,null,true,'conversion','partner_required','{"capabilityBasis":"official_docs","activationRequired":true,"verticalFoundation":"admission"}'::jsonb,true,now()),
 ('bookingcom_demand','Booking.com Demand API',array['lodging','attraction','rental'],'external_handoff','api','partner_required',true,true,true,true,true,true,true,true,null,true,'conversion','partner_required','{"capabilityBasis":"official_docs","activationRequired":true,"commercialModel":"managed_affiliate_api","officialDocs":"https://developers.booking.com/demand/docs"}'::jsonb,true,now()),
 ('bookingcom_affiliate','Booking.com Affiliate',array['lodging','attraction','rental'],'tracked_handoff','tracked_handoff','partner_required',false,false,false,false,false,false,false,false,false,false,'conversion','partner_required','{"capabilityBasis":"official_affiliate_program","activationRequired":true,"affiliateNetwork":"CJ","officialDocs":"https://www.booking.com/affiliate-program/v2/index.html"}'::jsonb,true,now()),
 ('expedia_rapid','Expedia Rapid Lodging',array['lodging'],'external_handoff','api','partner_required',true,true,true,true,true,true,true,true,null,true,'conversion','partner_required','{"capabilityBasis":"official_docs","activationRequired":true,"commercialModel":"distribution_partner","officialDocs":"https://developers.expediagroup.com/rapid/lodging"}'::jsonb,true,now()),
 ('amadeus_hotels','Amadeus Self-Service Hotels',array['lodging'],'external_handoff','api','partner_required',true,true,true,true,true,false,false,false,false,false,'none','partner_required','{"capabilityBasis":"official_self_service_docs","accessPath":"self_service_account","activationRequired":true,"productionRealTimeData":true,"imagesAvailable":false,"cancellationOffline":true,"officialDocs":"https://developers.amadeus.com/self-service/apis-docs/guides/developer-guides/resources/hotels/"}'::jsonb,true,now()),
 ('hotelbeds','HBX Group Hotelbeds Booking API',array['lodging'],'external_handoff','api','partner_required',true,true,true,true,true,true,true,false,false,true,'conversion','partner_required','{"capabilityBasis":"official_booking_api_docs","activationRequired":true,"evaluationKeyAvailable":true,"productionCertificationRequired":true,"finalRates":true,"officialDocs":"https://developer.hotelbeds.com/documentation/hotels/booking-api/"}'::jsonb,true,now()),
 ('expedia_affiliate','Expedia Affiliate',array['lodging','attraction','rental','transport'],'tracked_handoff','tracked_handoff','partner_required',false,false,false,false,false,false,false,false,false,false,'conversion','partner_required','{"capabilityBasis":"official_affiliate_program","activationRequired":true,"affiliateProgram":"Expedia Group Travel Creator"}'::jsonb,true,now()),
 ('hotelscom_affiliate','Hotels.com Affiliate',array['lodging'],'tracked_handoff','tracked_handoff','partner_required',false,false,false,false,false,false,false,false,false,false,'conversion','partner_required','{"capabilityBasis":"official_affiliate_program","activationRequired":true,"affiliateProgram":"Expedia Group Travel Creator"}'::jsonb,true,now()),
 ('vrbo_affiliate','Vrbo Affiliate',array['lodging'],'tracked_handoff','tracked_handoff','partner_required',false,false,false,false,false,false,false,false,false,false,'conversion','partner_required','{"capabilityBasis":"official_affiliate_program","activationRequired":true,"affiliateProgram":"Expedia Group Travel Creator"}'::jsonb,true,now()),
 ('agoda_affiliate','Agoda Affiliate',array['lodging'],'tracked_handoff','tracked_handoff','partner_required',null,null,null,null,false,false,false,false,false,false,'conversion','partner_required','{"capabilityBasis":"official_partner_portal","activationRequired":true,"officialDocs":"https://partners.agoda.com/"}'::jsonb,true,now()),
 ('tripcom_affiliate','Trip.com Affiliate',array['lodging','transport','attraction'],'tracked_handoff','tracked_handoff','partner_required',null,null,null,null,false,false,false,false,false,false,'conversion','partner_required','{"capabilityBasis":"official_affiliate_portal","activationRequired":true,"officialDocs":"https://www.trip.com/partners/"}'::jsonb,true,now()),
 ('hostelworld_affiliate','Hostelworld Affiliate',array['lodging'],'tracked_handoff','tracked_handoff','partner_required',true,true,true,true,false,false,false,false,false,false,'conversion','partner_required','{"capabilityBasis":"official_partner_api","activationRequired":true,"affiliateNetwork":"Partnerize","officialDocs":"https://partners.hostelworld.com/"}'::jsonb,true,now()),
 ('kayak_affiliate','KAYAK Affiliate Network',array['lodging','transport','rental'],'tracked_handoff','tracked_handoff','partner_required',true,null,true,null,false,false,false,false,false,false,'conversion','partner_required','{"capabilityBasis":"official_affiliate_network","activationRequired":true,"integrationTools":["deeplink","widget","white_label","api"],"officialDocs":"https://affiliates.kayak.com/"}'::jsonb,true,now()),
 ('skyscanner_affiliate','Skyscanner Affiliate',array['lodging','transport','rental'],'tracked_handoff','tracked_handoff','partner_required',true,false,false,false,false,false,false,false,false,false,'conversion','partner_required','{"capabilityBasis":"official_affiliate_program","activationRequired":true,"affiliateNetwork":"Impact","officialDocs":"https://www.partners.skyscanner.net/product/affiliates"}'::jsonb,true,now()),
 ('viator_affiliate','Viator Affiliate API',array['attraction','culture','activity'],'tracked_handoff','tracked_handoff','partner_required',true,true,true,true,false,false,false,false,false,false,'conversion','partner_required','{"capabilityBasis":"official_affiliate_api","activationRequired":true,"merchantOfRecord":"viator","officialDocs":"https://partnerresources.viator.com/travel-commerce/affiliate/"}'::jsonb,true,now()),
 ('tiqets_affiliate','Tiqets Affiliate API',array['attraction','culture','activity'],'tracked_handoff','tracked_handoff','partner_required',true,true,true,true,false,false,false,false,false,true,'conversion','partner_required','{"capabilityBasis":"official_affiliate_api","activationRequired":true,"bookingApiThresholdOrdersPerMonth":200,"officialDocs":"https://partners.tiqets.com/en_us/do-you-offer-api-solutions-H1pJDp3zi"}'::jsonb,true,now()),
 ('klook_affiliate','Klook Affiliate',array['attraction','culture','activity','transport'],'tracked_handoff','tracked_handoff','partner_required',null,null,null,null,false,false,false,false,false,false,'conversion','partner_required','{"capabilityBasis":"official_affiliate_program","activationRequired":true,"integrationTools":["links","widgets","data_feed","api","white_label"],"officialDocs":"https://affiliate.klook.com/"}'::jsonb,true,now()),
 ('omio_affiliate','Omio Affiliate',array['transport'],'tracked_handoff','tracked_handoff','partner_required',true,null,true,true,false,false,false,false,false,false,'click','partner_required','{"capabilityBasis":"official_affiliate_program","activationRequired":true,"affiliateNetwork":"Impact Radius","officialDocs":"https://www.omio.com/affiliate"}'::jsonb,true,now()),
 ('official','Offizieller Buchungsweg',array['dining','lodging','attraction','culture','activity','event','transport','rental'],'external_handoff','handoff','discovery',null,null,null,null,null,null,null,null,null,null,'none','unknown','{"capabilityBasis":"place_specific","universalBookingCore":true}'::jsonb,true,now()),
 ('email','Verifizierter Anbieter-Kontakt',array['dining','lodging','attraction','culture','activity','event','transport','rental'],'fallback','email','connected',false,false,false,false,false,false,false,true,false,false,'none','public','{"capabilityBasis":"luvia_core","universalBookingCore":true}'::jsonb,true,now())
on conflict(provider_id) do update set
  display_name=excluded.display_name,
  verticals=excluded.verticals,
  integration_tier=case when booking_provider_capabilities.luvia_access_state='connected' then booking_provider_capabilities.integration_tier else excluded.integration_tier end,
  booking_mode=case when booking_provider_capabilities.luvia_access_state='connected' then booking_provider_capabilities.booking_mode else excluded.booking_mode end,
  luvia_access_state=case when booking_provider_capabilities.luvia_access_state='connected' then 'connected' else excluded.luvia_access_state end,
  supports_search=excluded.supports_search,supports_details=excluded.supports_details,supports_quote=excluded.supports_quote,
  supports_availability=excluded.supports_availability,supports_create_reservation=excluded.supports_create_reservation,
  supports_modify_reservation=excluded.supports_modify_reservation,supports_cancel_reservation=excluded.supports_cancel_reservation,
  supports_messaging=excluded.supports_messaging,supports_status_webhook=excluded.supports_status_webhook,supports_status_polling=excluded.supports_status_polling,
  attribution_mode=excluded.attribution_mode,commercial_access=excluded.commercial_access,
  metadata=booking_provider_capabilities.metadata||excluded.metadata,active=true,updated_at=now();

insert into public.booking_provider_operation_contracts(provider_id,vertical,operation,transport,access_state,supported,idempotency_required,outcome_authority,adapter_function,contract_version,evidence_url,metadata)
values
 ('bookingcom_demand','lodging','search','api','partner_required',true,false,false,'booking-provider-bookingcom-demand','demand-v3.2','https://developers.booking.com/demand/docs','{"activation":"partner_contract_required"}'::jsonb),
 ('bookingcom_demand','lodging','quote','api','partner_required',true,false,false,'booking-provider-bookingcom-demand','demand-v3.2','https://developers.booking.com/demand/docs/orders-api/overview','{"endpointClass":"orders.preview"}'::jsonb),
 ('bookingcom_demand','lodging','create','api','partner_required',true,true,true,'booking-provider-bookingcom-demand','demand-v3.2','https://developers.booking.com/demand/docs/orders-api/overview','{"unknownOutcome":"reconcile_before_retry"}'::jsonb),
 ('bookingcom_demand','lodging','modify','api','partner_required',true,true,true,'booking-provider-bookingcom-demand','demand-v3.2','https://developers.booking.com/demand/docs/orders-api/overview','{}'::jsonb),
 ('bookingcom_demand','lodging','cancel','api','partner_required',true,true,true,'booking-provider-bookingcom-demand','demand-v3.2','https://developers.booking.com/demand/docs/orders-api/overview','{}'::jsonb),
 ('bookingcom_demand','lodging','message','api','partner_required',true,true,false,'booking-provider-bookingcom-demand','demand-v3.2','https://developers.booking.com/demand/docs/messaging/try-out-messages','{}'::jsonb),
 ('expedia_rapid','lodging','search','api','partner_required',true,false,false,'booking-provider-expedia-rapid','rapid-lodging-v3','https://developers.expediagroup.com/rapid/lodging','{}'::jsonb),
 ('expedia_rapid','lodging','quote','api','partner_required',true,false,false,'booking-provider-expedia-rapid','rapid-lodging-v3','https://developers.expediagroup.com/rapid/lodging','{"priceCheckRequired":true}'::jsonb),
 ('expedia_rapid','lodging','create','api','partner_required',true,true,true,'booking-provider-expedia-rapid','rapid-lodging-v3','https://developers.expediagroup.com/rapid/lodging/reference/handle-booking-reqs','{"unknownOutcome":"retrieve_by_affiliate_reference_before_retry"}'::jsonb),
 ('expedia_rapid','lodging','cancel','api','partner_required',true,true,true,'booking-provider-expedia-rapid','rapid-lodging-v3','https://developers.expediagroup.com/rapid/lodging','{}'::jsonb),
 ('expedia_rapid','lodging','message','handoff','partner_required',true,false,false,'booking-provider-expedia-rapid','rapid-lodging-v3','https://developers.expediagroup.com/rapid/lodging','{"channel":"property_message_center"}'::jsonb),
 ('amadeus_hotels','lodging','search','api','partner_required',true,false,false,'booking-provider-amadeus-hotels','self-service-hotel-v3','https://developers.amadeus.com/self-service/apis-docs/guides/developer-guides/resources/hotels/','{"productionRequiresAccountAndBilling":true,"priceScope":"amadeus_inventory"}'::jsonb),
 ('amadeus_hotels','lodging','quote','api','partner_required',true,false,false,'booking-provider-amadeus-hotels','self-service-hotel-v3','https://developers.amadeus.com/self-service/apis-docs/guides/developer-guides/resources/hotels/','{"refreshOfferBeforeBookingWhenNeeded":true}'::jsonb),
 ('amadeus_hotels','lodging','create','api','partner_required',true,true,true,'booking-provider-amadeus-hotels','self-service-hotel-v3','https://developers.amadeus.com/self-service/apis-docs/guides/developer-guides/resources/hotels/','{"cancellationOffline":true,"unknownOutcome":"reconcile_before_retry"}'::jsonb),
 ('hotelbeds','lodging','search','api','partner_required',true,false,false,'booking-provider-hotelbeds','booking-api-v1','https://developer.hotelbeds.com/documentation/hotels/booking-api/','{"evaluationKeyOnlyUntilCertification":true}'::jsonb),
 ('hotelbeds','lodging','quote','api','partner_required',true,false,false,'booking-provider-hotelbeds','booking-api-v1','https://developer.hotelbeds.com/documentation/hotels/booking-api/','{"checkRateWhenRateTypeRecheck":true,"finalRates":true}'::jsonb),
 ('hotelbeds','lodging','create','api','partner_required',true,true,true,'booking-provider-hotelbeds','booking-api-v1','https://developer.hotelbeds.com/documentation/hotels/booking-api/','{"unknownOutcome":"retrieve_before_retry"}'::jsonb),
 ('hotelbeds','lodging','modify','api','partner_required',true,true,true,'booking-provider-hotelbeds','booking-api-v1','https://developer.hotelbeds.com/documentation/hotels/booking-api/','{}'::jsonb),
 ('hotelbeds','lodging','cancel','api','partner_required',true,true,true,'booking-provider-hotelbeds','booking-api-v1','https://developer.hotelbeds.com/documentation/hotels/booking-api/','{"simulateCancellationBeforeCommit":true}'::jsonb),
 ('bookingcom_affiliate','lodging','handoff','tracked_handoff','partner_required',true,true,false,null,'affiliate-cj-v1','https://www.booking.com/affiliate-program/v2/index.html','{"bookingConfirmationAuthority":false}'::jsonb),
 ('expedia_affiliate','lodging','handoff','tracked_handoff','partner_required',true,true,false,null,'travel-creator-v1','https://partner.expediagroup.com/en-us/solutions/explore-our-affiliate-program','{"bookingConfirmationAuthority":false}'::jsonb),
 ('hotelscom_affiliate','lodging','handoff','tracked_handoff','partner_required',true,true,false,null,'travel-creator-v1','https://partner.expediagroup.com/en-us/solutions/explore-our-affiliate-program','{"bookingConfirmationAuthority":false}'::jsonb),
 ('vrbo_affiliate','lodging','handoff','tracked_handoff','partner_required',true,true,false,null,'travel-creator-v1','https://partner.expediagroup.com/en-us/solutions/explore-our-affiliate-program','{"bookingConfirmationAuthority":false}'::jsonb),
 ('agoda_affiliate','lodging','handoff','tracked_handoff','partner_required',true,true,false,null,'partner-portal-v1','https://partners.agoda.com/','{"bookingConfirmationAuthority":false,"exactLinkContractRequired":true}'::jsonb),
 ('tripcom_affiliate','lodging','handoff','tracked_handoff','partner_required',true,true,false,null,'affiliate-v1','https://www.trip.com/partners/','{"bookingConfirmationAuthority":false,"exactLinkContractRequired":true}'::jsonb),
 ('hostelworld_affiliate','lodging','handoff','tracked_handoff','partner_required',true,true,false,null,'partner-api-v2','https://partners.hostelworld.com/','{"bookingConfirmationAuthority":false,"affiliateNetwork":"Partnerize"}'::jsonb),
 ('kayak_affiliate','lodging','handoff','tracked_handoff','partner_required',true,true,false,null,'affiliate-network-v1','https://affiliates.kayak.com/','{"bookingConfirmationAuthority":false,"metasearch":true}'::jsonb),
 ('skyscanner_affiliate','lodging','handoff','tracked_handoff','partner_required',true,true,false,null,'impact-affiliate-v1','https://www.partners.skyscanner.net/product/affiliates','{"bookingConfirmationAuthority":false,"metasearch":true,"autoRedirectForbidden":true}'::jsonb),
 ('viator_affiliate','activity','handoff','tracked_handoff','partner_required',true,true,false,null,'affiliate-api-v2','https://partnerresources.viator.com/travel-commerce/affiliate/','{"bookingConfirmationAuthority":false,"merchantOfRecord":"viator","cookieWindowDays":30}'::jsonb),
 ('tiqets_affiliate','attraction','handoff','tracked_handoff','partner_required',true,true,false,null,'affiliate-api-v1','https://partners.tiqets.com/en_us/do-you-offer-api-solutions-H1pJDp3zi','{"bookingConfirmationAuthority":false,"bookingApiRequiresSeparateQualification":true}'::jsonb),
 ('klook_affiliate','activity','handoff','tracked_handoff','partner_required',true,true,false,null,'affiliate-v1','https://affiliate.klook.com/','{"bookingConfirmationAuthority":false,"exactLinkContractRequired":true}'::jsonb),
 ('omio_affiliate','transport','handoff','tracked_handoff','partner_required',true,true,false,null,'impact-affiliate-v1','https://www.omio.com/affiliate','{"bookingConfirmationAuthority":false,"searchApiAvailable":true}'::jsonb),
 ('official','lodging','handoff','handoff','discovery',true,true,false,null,'official-place-link-v1',null,'{"bookingConfirmationAuthority":false,"verifiedPlaceOwnershipRequired":true}'::jsonb),
 ('email','lodging','message','email','connected',true,true,true,'booking-email-send','email-v2',null,'{"verifiedPublicContactRequired":true,"senderTrustRequiredForStatus":true}'::jsonb)
on conflict(provider_id,vertical,operation,transport,contract_version) do update set
  access_state=case when booking_provider_operation_contracts.access_state='connected' then 'connected' else excluded.access_state end,
  supported=excluded.supported,idempotency_required=excluded.idempotency_required,outcome_authority=excluded.outcome_authority,
  adapter_function=excluded.adapter_function,evidence_url=excluded.evidence_url,metadata=booking_provider_operation_contracts.metadata||excluded.metadata,active=true,updated_at=now();

insert into public.booking_monetization_profiles(
  provider_id,display_name,commercial_status,monetization_mode,tracking_strategy,attribution_model,
  supports_deep_links,supports_click_id,supports_sub_ids,supports_conversion_reporting,supports_commission_reporting,supports_postback,supports_webhook,supports_cancellation_reversal,
  public_metadata,evidence,updated_at
) values
 ('bookingcom_demand','Booking.com Demand API','partner_required','distribution_partner','partner_id','provider_reported',true,null,true,true,true,null,null,true,'{"verticals":["lodging","attraction","rental"],"activationRequired":true}'::jsonb,'{"basis":"official_demand_api","reservationTruthIndependent":true}'::jsonb,now()),
 ('bookingcom_affiliate','Booking.com Affiliate','partner_required','affiliate_link','sub_id','last_click',true,null,true,true,true,null,null,true,'{"verticals":["lodging","attraction","rental"],"affiliateNetwork":"CJ","activationRequired":true}'::jsonb,'{"basis":"official_affiliate_program","reservationTruthIndependent":true}'::jsonb,now()),
 ('expedia_rapid','Expedia Rapid Lodging','partner_required','distribution_partner','partner_id','provider_reported',true,null,true,true,true,null,null,true,'{"verticals":["lodging"],"activationRequired":true}'::jsonb,'{"basis":"official_rapid_docs","reservationTruthIndependent":true}'::jsonb,now()),
 ('hotelbeds','HBX Group Hotelbeds Booking API','partner_required','distribution_partner','partner_id','provider_reported',true,null,true,true,true,null,null,true,'{"verticals":["lodging"],"activationRequired":true,"evaluationKeyAvailable":true,"productionCertificationRequired":true}'::jsonb,'{"basis":"official_hbx_booking_api","reservationTruthIndependent":true,"commercialTermsRequired":true}'::jsonb,now()),
 ('expedia_affiliate','Expedia Affiliate','partner_required','affiliate_link','sub_id','last_click',true,null,true,true,true,null,null,true,'{"verticals":["lodging","attraction","rental","transport"],"affiliateProgram":"Travel Creator","activationRequired":true}'::jsonb,'{"basis":"official_travel_creator_program","reservationTruthIndependent":true}'::jsonb,now()),
 ('hotelscom_affiliate','Hotels.com Affiliate','partner_required','affiliate_link','sub_id','last_click',true,null,true,true,true,null,null,true,'{"verticals":["lodging"],"affiliateProgram":"Travel Creator","activationRequired":true}'::jsonb,'{"basis":"official_travel_creator_program","reservationTruthIndependent":true}'::jsonb,now()),
 ('vrbo_affiliate','Vrbo Affiliate','partner_required','affiliate_link','sub_id','last_click',true,null,true,true,true,null,null,true,'{"verticals":["lodging"],"affiliateProgram":"Travel Creator","activationRequired":true}'::jsonb,'{"basis":"official_travel_creator_program","reservationTruthIndependent":true}'::jsonb,now()),
 ('agoda_affiliate','Agoda Affiliate','partner_required','affiliate_link','contract_defined','contract_defined',true,null,null,null,null,null,null,null,'{"verticals":["lodging"],"activationRequired":true}'::jsonb,'{"basis":"official_partner_portal","exactTermsRequired":true,"reservationTruthIndependent":true}'::jsonb,now()),
 ('tripcom_affiliate','Trip.com Affiliate','partner_required','affiliate_link','contract_defined','contract_defined',true,null,null,null,null,null,null,null,'{"verticals":["lodging","transport","attraction"],"activationRequired":true}'::jsonb,'{"basis":"official_affiliate_portal","exactTermsRequired":true,"reservationTruthIndependent":true}'::jsonb,now()),
 ('hostelworld_affiliate','Hostelworld Affiliate','partner_required','affiliate_link','sub_id','last_click',true,null,true,true,true,null,null,true,'{"verticals":["lodging"],"affiliateNetwork":"Partnerize","cookieWindowDays":30,"activationRequired":true}'::jsonb,'{"basis":"official_affiliate_program","reservationTruthIndependent":true}'::jsonb,now()),
 ('kayak_affiliate','KAYAK Affiliate Network','partner_required','hybrid','partner_id','contract_defined',true,null,true,true,true,null,null,true,'{"verticals":["lodging","transport","rental"],"networkBrands":["KAYAK","HotelsCombined","momondo","Cheapflights"],"activationRequired":true}'::jsonb,'{"basis":"official_affiliate_network","reservationTruthIndependent":true}'::jsonb,now()),
 ('skyscanner_affiliate','Skyscanner Affiliate','partner_required','affiliate_link','sub_id','last_click',true,null,true,true,true,null,null,true,'{"verticals":["lodging","transport","rental"],"affiliateNetwork":"Impact","cookieWindowDays":30,"activationRequired":true}'::jsonb,'{"basis":"official_affiliate_program","reservationTruthIndependent":true,"autoRedirectForbidden":true}'::jsonb,now()),
 ('viator_affiliate','Viator Affiliate API','partner_required','affiliate_link','sub_id','last_click',true,null,true,true,true,null,null,true,'{"verticals":["attraction","culture","activity"],"cookieWindowDays":30,"merchantOfRecord":"viator","activationRequired":true}'::jsonb,'{"basis":"official_affiliate_api","reservationTruthIndependent":true}'::jsonb,now()),
 ('tiqets_affiliate','Tiqets Affiliate API','partner_required','affiliate_link','sub_id','provider_reported',true,null,true,true,true,null,null,true,'{"verticals":["attraction","culture","activity"],"bookingApiThresholdOrdersPerMonth":200,"activationRequired":true}'::jsonb,'{"basis":"official_affiliate_api","reservationTruthIndependent":true}'::jsonb,now()),
 ('klook_affiliate','Klook Affiliate','partner_required','affiliate_link','sub_id','contract_defined',true,null,true,true,true,null,null,true,'{"verticals":["attraction","culture","activity","transport"],"activationRequired":true}'::jsonb,'{"basis":"official_affiliate_program","exactTermsRequired":true,"reservationTruthIndependent":true}'::jsonb,now()),
 ('omio_affiliate','Omio Affiliate','partner_required','affiliate_link','sub_id','contract_defined',true,null,true,true,true,null,null,true,'{"verticals":["transport"],"affiliateNetwork":"Impact Radius","activationRequired":true}'::jsonb,'{"basis":"official_affiliate_program","reservationTruthIndependent":true}'::jsonb,now())
on conflict(provider_id) do update set
  display_name=excluded.display_name,
  commercial_status=case when booking_monetization_profiles.commercial_status in ('active','contracting','application_pending','inquiry_sent','paused','rejected') then booking_monetization_profiles.commercial_status else excluded.commercial_status end,
  monetization_mode=case when booking_monetization_profiles.monetization_mode<>'unknown' then booking_monetization_profiles.monetization_mode else excluded.monetization_mode end,
  public_metadata=booking_monetization_profiles.public_metadata||excluded.public_metadata,
  evidence=booking_monetization_profiles.evidence||excluded.evidence,
  updated_at=now();

comment on table public.booking_provider_operation_contracts is 'Provider/vertical/operation contracts. Platform capability and commercial availability never imply a live Luvia connection or a confirmed booking.';
commit;
