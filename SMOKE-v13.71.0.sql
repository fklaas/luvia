-- Luvia v13.71.0 / Core 4.71.0
-- Rollback-safe Production Commission / Revenue Lifecycle smoke test.
-- Uses the SevenRooms correlation already proven in v13.70.2.

begin;
select set_config('request.jwt.claim.role','service_role',true);

create temporary table tmp_v13710_results(label text primary key,result jsonb) on commit drop;

-- Simulate commercial activation ONLY inside this transaction.
update public.booking_monetization_profiles
set commercial_status='active',monetization_mode='distribution_partner',tracking_strategy='source_id',attribution_model='provider_reported',updated_at=now()
where provider_id='sevenrooms';

insert into tmp_v13710_results values ('conversion', public.luvia_booking_ingest_commercial_event(
  'sevenrooms','provider_callback','conversion_approved','v13710-sevenrooms-conversion','SR-V13710-COMMISSION-SMOKE',
  '5f024621-03a9-4599-8a57-0e91a2c4592a'::uuid,null,'reservation','approved',null,
  120.00,'EUR',null,null,true,'synthetic_verified_callback','{}'::jsonb,
  '{"test":"v13.71.0 conversion anchor"}'::jsonb,now()
));

insert into tmp_v13710_results values ('commission_pending', public.luvia_booking_ingest_commercial_event(
  'sevenrooms','provider_callback','commission_pending','v13710-sevenrooms-commission-pending','SR-V13710-COMMISSION-SMOKE',
  '5f024621-03a9-4599-8a57-0e91a2c4592a'::uuid,null,'reservation',null,'pending',
  null,null,6.00,'EUR',true,'synthetic_verified_callback','{}'::jsonb,
  '{"test":"v13.71.0 commission pending"}'::jsonb,now()
));

insert into tmp_v13710_results values ('commission_approved', public.luvia_booking_ingest_commercial_event(
  'sevenrooms','provider_callback','commission_approved','v13710-sevenrooms-commission-approved','SR-V13710-COMMISSION-SMOKE',
  '5f024621-03a9-4599-8a57-0e91a2c4592a'::uuid,null,'reservation',null,'approved',
  null,null,6.00,'EUR',true,'synthetic_verified_callback','{}'::jsonb,
  '{"test":"v13.71.0 commission approved"}'::jsonb,now()
));

insert into tmp_v13710_results values ('commission_paid', public.luvia_booking_ingest_commercial_event(
  'sevenrooms','provider_callback','commission_paid','v13710-sevenrooms-commission-paid','SR-V13710-COMMISSION-SMOKE',
  '5f024621-03a9-4599-8a57-0e91a2c4592a'::uuid,null,'reservation',null,'paid',
  null,null,6.00,'EUR',true,'synthetic_verified_callback','{}'::jsonb,
  '{"test":"v13.71.0 commission paid"}'::jsonb,now()
));

-- Exact provider retry: must reuse the same commercial event and not create another state transition.
insert into tmp_v13710_results values ('commission_paid_duplicate', public.luvia_booking_ingest_commercial_event(
  'sevenrooms','provider_callback','commission_paid','v13710-sevenrooms-commission-paid','SR-V13710-COMMISSION-SMOKE',
  '5f024621-03a9-4599-8a57-0e91a2c4592a'::uuid,null,'reservation',null,'paid',
  null,null,6.00,'EUR',true,'synthetic_verified_callback','{}'::jsonb,
  '{"test":"v13.71.0 commission paid duplicate"}'::jsonb,now()
));

-- One final result row for easy copy/paste from Supabase.
select
  (select result->>'duplicate' from tmp_v13710_results where label='commission_paid_duplicate')::boolean as paid_duplicate,
  (select count(*) from public.booking_conversion_reports where provider_id='sevenrooms' and external_reference='SR-V13710-COMMISSION-SMOKE') as conversion_rows,
  (select count(*) from public.booking_commission_reconciliations x join public.booking_conversion_reports r on r.id=x.conversion_report_id where r.provider_id='sevenrooms' and r.external_reference='SR-V13710-COMMISSION-SMOKE') as reconciliation_rows,
  (select count(*) from public.booking_commission_state_events s join public.booking_conversion_reports r on r.id=s.conversion_report_id where r.provider_id='sevenrooms' and r.external_reference='SR-V13710-COMMISSION-SMOKE') as state_event_rows,
  x.commission_state,
  x.reported_amount,
  x.reported_currency,
  x.settled_amount,
  x.settled_currency,
  x.state_event_count,
  x.booking_status,
  x.booking_status_changed_by_commission
from public.booking_commission_runtime_v1 x
where x.conversion_external_reference='SR-V13710-COMMISSION-SMOKE';

rollback;
