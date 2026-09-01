-- Exact compensating rollback for the Integration-only 4.82.136 provider foundation.
-- It disables the newly introduced providers and operation contracts without deleting booking, click, conversion or commission evidence.
begin;
update public.booking_provider_operation_contracts
set active=false,access_state='disabled',updated_at=now()
where provider_id in ('tiqets','viator','bookingcom_demand','bookingcom_affiliate','expedia_rapid','amadeus_hotels','hotelbeds','expedia_affiliate','hotelscom_affiliate','vrbo_affiliate','agoda_affiliate','tripcom_affiliate','hostelworld_affiliate','kayak_affiliate','skyscanner_affiliate','viator_affiliate','tiqets_affiliate','klook_affiliate','omio_affiliate')
  and contract_version in ('demand-v3.2','rapid-lodging-v3','affiliate-cj-v1','travel-creator-v1','partner-portal-v1','affiliate-v1','partner-api-v2','affiliate-network-v1','impact-affiliate-v1','affiliate-api-v2');
update public.booking_provider_capabilities
set active=false,luvia_access_state='disabled',updated_at=now()
where provider_id in ('tiqets','viator','bookingcom_demand','bookingcom_affiliate','expedia_rapid','amadeus_hotels','hotelbeds','expedia_affiliate','hotelscom_affiliate','vrbo_affiliate','agoda_affiliate','tripcom_affiliate','hostelworld_affiliate','kayak_affiliate','skyscanner_affiliate','viator_affiliate','tiqets_affiliate','klook_affiliate','omio_affiliate');
update public.booking_monetization_profiles
set commercial_status='paused',updated_at=now()
where provider_id in ('bookingcom_demand','bookingcom_affiliate','expedia_rapid','amadeus_hotels','hotelbeds','expedia_affiliate','hotelscom_affiliate','vrbo_affiliate','agoda_affiliate','tripcom_affiliate','hostelworld_affiliate','kayak_affiliate','skyscanner_affiliate','viator_affiliate','tiqets_affiliate','klook_affiliate','omio_affiliate')
  and commercial_status not in ('rejected','unavailable');
commit;
