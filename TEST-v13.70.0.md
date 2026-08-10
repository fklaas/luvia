# Runtime Test v13.70.0

## A. Schema/runtime presence

```sql
select to_regclass('public.booking_commercial_events') as commercial_events_table;

select column_name
from information_schema.columns
where table_schema='public'
  and table_name='booking_monetization_runtime_v1'
  and column_name in (
    'commercial_event_count',
    'pending_commercial_event_count',
    'latest_commercial_event_kind',
    'latest_commercial_processing_state'
  )
order by column_name;
```

Expected: table exists and all four runtime columns exist.

## B. Fail-closed real-world check

Use the existing Chez Funda `official_website` correlation token in a transaction. `official_website` is non-commercial and must never create a conversion.

```sql
begin;
set local request.jwt.claim.role = 'service_role';

select public.luvia_booking_ingest_commercial_event(
  'official_website',
  'manual_reconciliation',
  'conversion_reported',
  'v1370-official-noncommercial-smoke',
  'SMOKE-OFFICIAL',
  '990db06d-1ecd-4385-9d31-244978b82494'::uuid,
  null,
  'reservation',
  'reported',
  null,
  null,null,null,null,
  true,
  'sql_smoke',
  '{}'::jsonb,
  '{"test":"v13.70 fail closed"}'::jsonb,
  now()
) as result;

select provider_id,event_kind,processing_state,resolution_reason,conversion_report_id,booking_status_before,booking_status_after
from public.booking_commercial_event_runtime_v1
where external_event_id='v1370-official-noncommercial-smoke';

rollback;
```

Expected:

- `processing_state = ignored`
- `resolution_reason = PROVIDER_NOT_MONETIZABLE`
- `conversion_report_id IS NULL`
- no booking status change.

## C. Resolved commercial conversion + idempotency, without creating fake persistent revenue

Use an existing SevenRooms handoff correlation. Temporarily activate the profile inside a transaction, ingest a synthetic verified event, run it twice, verify one commercial event/one conversion, then rollback.

Replace `<SEVENROOMS_CORRELATION_TOKEN>` with a real SevenRooms correlation token from `booking_correlations`.

```sql
begin;
set local request.jwt.claim.role = 'service_role';

update public.booking_monetization_profiles
set commercial_status='active',
    monetization_mode='distribution_partner',
    tracking_strategy='source_id',
    attribution_model='provider_reported',
    updated_at=now()
where provider_id='sevenrooms';

select public.luvia_booking_ingest_commercial_event(
  'sevenrooms','provider_callback','conversion_approved',
  'v1370-sevenrooms-conversion-smoke','SR-SMOKE-1',
  '<SEVENROOMS_CORRELATION_TOKEN>'::uuid,null,
  'reservation','approved',null,
  120.00,'EUR',6.00,'EUR',
  true,'synthetic_verified_callback','{}'::jsonb,
  '{"test":"v13.70 conversion runtime"}'::jsonb,now()
) as first_ingest;

select public.luvia_booking_ingest_commercial_event(
  'sevenrooms','provider_callback','conversion_approved',
  'v1370-sevenrooms-conversion-smoke','SR-SMOKE-1',
  '<SEVENROOMS_CORRELATION_TOKEN>'::uuid,null,
  'reservation','approved',null,
  120.00,'EUR',6.00,'EUR',
  true,'synthetic_verified_callback','{}'::jsonb,
  '{"test":"duplicate"}'::jsonb,now()
) as duplicate_ingest;

select provider_id,event_kind,processing_state,resolution_reason,conversion_report_id,
       booking_status_before,booking_status_after,booking_status_changed_by_commercial
from public.booking_commercial_event_runtime_v1
where external_event_id='v1370-sevenrooms-conversion-smoke';

select count(*) as conversion_rows
from public.booking_conversion_reports
where provider_id='sevenrooms'
  and source='provider_callback'
  and external_event_id='v1370-sevenrooms-conversion-smoke';

rollback;
```

Expected:

- first ingestion: `resolved = true`
- second ingestion: `duplicate = true`
- commercial event `processing_state = resolved`
- exactly `1` conversion report
- `bookingStatusChanged = false`
- rollback leaves no fake conversion/revenue in production data.

## D. Pending verification contract

A callback passed with `event_verified=false` must remain `pending_verification` and create no conversion report.
