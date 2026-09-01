begin;

drop view if exists public.booking_stay_offer_readiness_v1;
drop table if exists public.booking_stay_offer_snapshots;
drop table if exists public.booking_stay_offer_searches;

delete from public.booking_provider_operation_contracts
where provider_id in ('amadeus_hotels','hotelbeds')
  and contract_version='hotel-live-offer-v1'
  and adapter_function in ('booking-provider-amadeus-hotels','booking-provider-hotelbeds');

update public.booking_provider_capabilities
set metadata=(metadata
  - 'hotelLiveOfferGateway'
  - 'hotelLiveOfferContract'
  - 'priceRankingRequiresConnectedLiveResponse'
  - 'affiliateLinkCannotSupplyPrice'
  - 'bestMarketClaimAllowed'),
  updated_at=now()
where provider_id in ('amadeus_hotels','hotelbeds');

-- Deliberately retained: provider profiles, connection state, booking records,
-- messages, attribution, conversion and commission evidence. This rollback only
-- removes the 4.82.136 live-offer gateway slice.

commit;
