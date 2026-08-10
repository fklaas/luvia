-- Luvia v13.70.1 / Core 4.70.1
-- Conversion Runtime View Migration Fix
-- Idempotent repair for PostgreSQL 42P16 when extending booking_monetization_runtime_v1.
-- This migration owns no booking-status mutation and preserves all v13.70 commercial safety contracts.
begin;

drop view if exists public.booking_monetization_runtime_v1;
create view public.booking_monetization_runtime_v1 with (security_invoker=true) as
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
  (select count(*) from public.booking_commercial_events e where e.correlation_id=c.id) as commercial_event_count,
  (select count(*) from public.booking_commercial_events e where e.correlation_id=c.id and e.processing_state in ('pending_verification','pending_partner_activation','pending_unmatched','failed')) as pending_commercial_event_count,
  (select e.event_kind from public.booking_commercial_events e where e.correlation_id=c.id order by e.occurred_at desc,e.received_at desc limit 1) as latest_commercial_event_kind,
  (select e.processing_state from public.booking_commercial_events e where e.correlation_id=c.id order by e.occurred_at desc,e.received_at desc limit 1) as latest_commercial_processing_state,
  false as booking_status_changed_by_commercial
from public.booking_correlations c
left join public.booking_monetization_profiles p on p.provider_id=c.provider_id
left join public.bookings b on b.id=c.booking_id;
grant select on public.booking_monetization_runtime_v1 to authenticated,service_role;

comment on view public.booking_monetization_runtime_v1 is 'v13.70.1 unified monetization runtime; drop/recreate avoids PostgreSQL 42P16 while commercial facts remain non-confirming.';

commit;
