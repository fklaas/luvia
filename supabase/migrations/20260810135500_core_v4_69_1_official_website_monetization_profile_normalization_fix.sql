-- Luvia v13.69.1 / Core 4.69.1
-- Official Website Monetization Profile Normalization Fix
-- Safe default: an unrecognized external booking destination is NOT a commercial partner.
-- Commercial facts NEVER mutate reservation truth.
begin;

-- Canonical profile for an official venue-owned reservation page.
insert into public.booking_monetization_profiles(
  provider_id,display_name,commercial_status,monetization_mode,tracking_strategy,attribution_model,
  supports_deep_links,supports_click_id,supports_sub_ids,supports_agent_id,supports_source_id,
  supports_conversion_reporting,supports_commission_reporting,supports_postback,supports_webhook,supports_cancellation_reversal,
  public_metadata,evidence,updated_at
) values (
  'official_website','Offizielle Website','unavailable','none','none','manual',
  false,false,false,false,false,false,false,false,false,false,
  '{"restaurantBookingCore":true,"commercialTerms":"none","channelKind":"venue_owned"}'::jsonb,
  '{"basis":"luvia_route_fallback","reservationTruthIndependent":true,"canonicalProviderId":"official_website"}'::jsonb,
  now()
)
on conflict(provider_id) do update set
  display_name='Offizielle Website',
  commercial_status='unavailable',
  monetization_mode='none',
  tracking_strategy='none',
  attribution_model='manual',
  supports_deep_links=false,
  supports_click_id=false,
  supports_sub_ids=false,
  supports_agent_id=false,
  supports_source_id=false,
  supports_conversion_reporting=false,
  supports_commission_reporting=false,
  supports_postback=false,
  supports_webhook=false,
  supports_cancellation_reversal=false,
  public_metadata=booking_monetization_profiles.public_metadata||'{"restaurantBookingCore":true,"commercialTerms":"none","channelKind":"venue_owned"}'::jsonb,
  evidence=booking_monetization_profiles.evidence||'{"basis":"luvia_route_fallback","reservationTruthIndependent":true,"canonicalProviderId":"official_website"}'::jsonb,
  updated_at=now();

-- Keep the old `official` id only as a compatibility alias; no commercial behavior may differ.
insert into public.booking_monetization_profiles(
  provider_id,display_name,commercial_status,monetization_mode,tracking_strategy,attribution_model,
  supports_deep_links,supports_click_id,supports_sub_ids,supports_agent_id,supports_source_id,
  supports_conversion_reporting,supports_commission_reporting,supports_postback,supports_webhook,supports_cancellation_reversal,
  public_metadata,evidence,updated_at
) values (
  'official','Offizielle Website (Legacy Alias)','unavailable','none','none','manual',
  false,false,false,false,false,false,false,false,false,false,
  '{"restaurantBookingCore":true,"commercialTerms":"none","aliasFor":"official_website"}'::jsonb,
  '{"basis":"compatibility_alias","reservationTruthIndependent":true}'::jsonb,
  now()
)
on conflict(provider_id) do update set
  commercial_status='unavailable',monetization_mode='none',tracking_strategy='none',attribution_model='manual',updated_at=now();

-- Replace the v13.69 handoff entrypoint with provider-id normalization and a fail-closed commercial default.
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
  v_provider_raw text:=lower(coalesce(nullif(trim(p_provider),''),'official_website'));
  v_provider text;
  v_snapshot jsonb;
  v_profile_found boolean:=false;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  if p_trip_id is null or not public.luvia_booking_is_trip_member(p_trip_id) then raise exception 'TRIP_ACCESS_DENIED'; end if;

  -- Canonical provider aliases. The route resolver emits `official_website`.
  v_provider:=case
    when v_provider_raw in ('official','official_website') then 'official_website'
    else v_provider_raw
  end;

  v_handoff_id:=public.luvia_booking_record_place_handoff(
    p_trip_id,p_place_type,p_provider_place_id,p_venue_name,v_provider,p_destination_url,
    coalesce(p_metadata,'{}'::jsonb)||jsonb_build_object('monetizationCore','4.69.1')
  );

  select * into v_correlation from public.booking_correlations where handoff_event_id=v_handoff_id;
  select * into v_profile from public.booking_monetization_profiles where provider_id=v_provider;
  v_profile_found:=found;

  -- FAIL CLOSED: unknown provider ids/domains are non-commercial until an explicit verified profile exists.
  v_snapshot:=jsonb_build_object(
    'provider',v_provider,
    'commercialStatus',case when v_profile_found then v_profile.commercial_status else 'unavailable' end,
    'monetizationMode',case when v_profile_found then v_profile.monetization_mode else 'none' end,
    'trackingStrategy',case when v_profile_found then v_profile.tracking_strategy else 'none' end,
    'attributionModel',case when v_profile_found then v_profile.attribution_model else 'manual' end,
    'profileResolved',v_profile_found,
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

-- Runtime read model also fails closed when an older/unknown provider has no commercial profile.
create or replace view public.booking_monetization_runtime_v1 with (security_invoker=true) as
select
  c.id as correlation_id,c.correlation_token,c.trip_id,c.booking_id,c.handoff_event_id,c.provider_id,c.provider_place_id,c.venue_name,
  c.state as correlation_state,c.created_at,c.linked_at,c.converted_at,c.expires_at,
  coalesce(p.commercial_status, nullif(c.metadata->'monetization'->>'commercialStatus',''), 'unavailable') as commercial_status,
  coalesce(p.monetization_mode, nullif(c.metadata->'monetization'->>'monetizationMode',''), 'none') as monetization_mode,
  coalesce(p.tracking_strategy, nullif(c.metadata->'monetization'->>'trackingStrategy',''), 'none') as tracking_strategy,
  coalesce(p.attribution_model, nullif(c.metadata->'monetization'->>'attributionModel',''), 'manual') as attribution_model,
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

-- Repair v13.69.0 snapshots that were captured with the unsafe missing-profile defaults.
update public.booking_correlations c
set metadata = c.metadata || jsonb_build_object('monetization',
  coalesce(c.metadata->'monetization','{}'::jsonb) || jsonb_build_object(
    'provider','official_website',
    'commercialStatus','unavailable',
    'monetizationMode','none',
    'trackingStrategy','none',
    'attributionModel','manual',
    'profileResolved',true,
    'commercialSignalCanConfirmReservation',false,
    'normalizedByCore','4.69.1'
  )
)
where c.provider_id='official_website'
  and c.metadata ? 'monetization';

update public.booking_handoff_events h
set metadata = h.metadata || jsonb_build_object('monetization',
  coalesce(h.metadata->'monetization','{}'::jsonb) || jsonb_build_object(
    'provider','official_website',
    'commercialStatus','unavailable',
    'monetizationMode','none',
    'trackingStrategy','none',
    'attributionModel','manual',
    'profileResolved',true,
    'commercialSignalCanConfirmReservation',false,
    'normalizedByCore','4.69.1'
  )
)
where lower(coalesce(h.provider,''))='official_website'
  and h.metadata ? 'monetization';

-- Any v13.69.0 monetization snapshot without an explicit provider profile must also be non-commercial.
update public.booking_correlations c
set metadata = c.metadata || jsonb_build_object('monetization',
  coalesce(c.metadata->'monetization','{}'::jsonb) || jsonb_build_object(
    'commercialStatus','unavailable',
    'monetizationMode','none',
    'trackingStrategy','none',
    'attributionModel','manual',
    'profileResolved',false,
    'commercialSignalCanConfirmReservation',false,
    'normalizedByCore','4.69.1'
  )
)
where c.metadata ? 'monetization'
  and not exists(select 1 from public.booking_monetization_profiles p where p.provider_id=c.provider_id);

comment on function public.luvia_booking_prepare_monetized_handoff(uuid,text,text,text,text,text,jsonb) is 'v13.69.1 canonical monetized handoff. Normalizes official_website and fails closed for unknown commercial providers; never changes reservation status.';
comment on view public.booking_monetization_runtime_v1 is 'v13.69.1 unified read model. Missing provider profiles are treated as unavailable/non-monetized, never as partner-ready.';

commit;
