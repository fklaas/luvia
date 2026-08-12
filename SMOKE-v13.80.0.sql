-- Luvia v13.80.0 / Core 4.80.0 smoke verification
select 'booking_message_intelligence_columns' as check_name,
       count(*) = 5 as ok
from information_schema.columns
where table_schema='public'
  and table_name='booking_message_intelligence'
  and column_name in ('review_state','reviewed_by','reviewed_at','user_action','user_action_payload');

select 'resolve_intelligence_rpc' as check_name,
       exists(
         select 1 from information_schema.routines
         where routine_schema='public'
           and routine_name='luvia_booking_resolve_message_intelligence'
       ) as ok;

select 'review_state_trigger' as check_name,
       exists(
         select 1 from pg_trigger
         where tgname='booking_message_intelligence_review_state_sync'
           and not tgisinternal
       ) as ok;
