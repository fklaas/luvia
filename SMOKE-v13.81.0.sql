-- A. Migration objects
select table_name from information_schema.tables
where table_schema='public' and table_name='booking_conversation_preferences';

select routine_name from information_schema.routines
where routine_schema='public' and routine_name in (
 'luvia_booking_conversation_preference',
 'luvia_booking_record_mutation_fallback',
 'luvia_booking_timeline_v1'
) order by routine_name;

-- B. Conversation preference state (replace BOOKING_ID)
-- select public.luvia_booking_conversation_preference('BOOKING_ID'::uuid,'read',now());
-- select * from public.booking_conversation_preferences where booking_id='BOOKING_ID'::uuid;

-- C. Timeline (replace BOOKING_ID)
-- select public.luvia_booking_timeline_v1('BOOKING_ID'::uuid);

-- D. Verify soft-delete does NOT delete message truth (replace BOOKING_ID)
-- select count(*) as messages_before from public.booking_messages where booking_id='BOOKING_ID'::uuid;
-- Perform "Chat löschen" in UI.
-- select count(*) as messages_after from public.booking_messages where booking_id='BOOKING_ID'::uuid;
-- Counts must remain equal.
