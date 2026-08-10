# Runtime Test v13.70.1

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
    'latest_commercial_processing_state',
    'booking_status_changed_by_commercial'
  )
order by ordinal_position;
```

Expected: table exists and all five runtime columns are present.

## B. Column order regression guard

```sql
select ordinal_position,column_name
from information_schema.columns
where table_schema='public'
  and table_name='booking_monetization_runtime_v1'
order by ordinal_position desc
limit 5;
```

Expected final sequence: commercial event count, pending commercial event count, latest kind, latest processing state, then `booking_status_changed_by_commercial`.

## C. Reservation-truth guard

```sql
select distinct booking_status_changed_by_commercial
from public.booking_monetization_runtime_v1;
```

Expected: only `false` (or no rows if there are no correlations).
