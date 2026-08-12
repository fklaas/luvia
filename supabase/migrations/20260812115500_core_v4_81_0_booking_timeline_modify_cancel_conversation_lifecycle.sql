-- Luvia v13.81.0 / Core 4.81.0
-- Booking Timeline + Modify + Cancel + Conversation Archive/Delete Lifecycle
begin;

create table if not exists public.booking_conversation_preferences(
  user_id uuid not null references auth.users(id) on delete cascade,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  archived_at timestamptz,
  deleted_at timestamptz,
  last_read_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key(user_id,booking_id)
);
create index if not exists booking_conversation_preferences_booking_idx on public.booking_conversation_preferences(booking_id,updated_at desc);
alter table public.booking_conversation_preferences enable row level security;
grant select,insert,update,delete on public.booking_conversation_preferences to authenticated;
grant all on public.booking_conversation_preferences to service_role;
drop policy if exists booking_conversation_preferences_self_select on public.booking_conversation_preferences;
drop policy if exists booking_conversation_preferences_self_insert on public.booking_conversation_preferences;
drop policy if exists booking_conversation_preferences_self_update on public.booking_conversation_preferences;
drop policy if exists booking_conversation_preferences_self_delete on public.booking_conversation_preferences;
create policy booking_conversation_preferences_self_select on public.booking_conversation_preferences for select to authenticated
using(user_id=auth.uid() and exists(select 1 from public.bookings b where b.id=booking_id and public.luvia_booking_is_trip_member(b.trip_id)));
create policy booking_conversation_preferences_self_insert on public.booking_conversation_preferences for insert to authenticated
with check(user_id=auth.uid() and exists(select 1 from public.bookings b where b.id=booking_id and public.luvia_booking_is_trip_member(b.trip_id)));
create policy booking_conversation_preferences_self_update on public.booking_conversation_preferences for update to authenticated
using(user_id=auth.uid() and exists(select 1 from public.bookings b where b.id=booking_id and public.luvia_booking_is_trip_member(b.trip_id)))
with check(user_id=auth.uid() and exists(select 1 from public.bookings b where b.id=booking_id and public.luvia_booking_is_trip_member(b.trip_id)));
create policy booking_conversation_preferences_self_delete on public.booking_conversation_preferences for delete to authenticated
using(user_id=auth.uid() and exists(select 1 from public.bookings b where b.id=booking_id and public.luvia_booking_is_trip_member(b.trip_id)));

create or replace function public.luvia_booking_conversation_preference(
  p_booking_id uuid,
  p_action text,
  p_at timestamptz default now()
) returns jsonb
language plpgsql security definer set search_path=public
as $$
declare b public.bookings; v_action text:=lower(trim(coalesce(p_action,''))); p public.booking_conversation_preferences;
begin
  select * into b from public.bookings where id=p_booking_id;
  if b.id is null or not public.luvia_booking_is_trip_member(b.trip_id) then raise exception 'BOOKING_NOT_ACCESSIBLE'; end if;
  if v_action not in ('archive','unarchive','delete','restore','read') then raise exception 'INVALID_CONVERSATION_PREFERENCE_ACTION'; end if;
  insert into public.booking_conversation_preferences(user_id,booking_id,updated_at)
  values(auth.uid(),p_booking_id,now()) on conflict(user_id,booking_id) do nothing;
  update public.booking_conversation_preferences set
    archived_at=case when v_action='archive' then coalesce(p_at,now()) when v_action in ('unarchive','restore') then null else archived_at end,
    deleted_at=case when v_action='delete' then coalesce(p_at,now()) when v_action='restore' then null else deleted_at end,
    last_read_at=case when v_action='read' then coalesce(p_at,now()) else last_read_at end,
    updated_at=now()
  where user_id=auth.uid() and booking_id=p_booking_id returning * into p;
  return jsonb_build_object('bookingId',p.booking_id,'archivedAt',p.archived_at,'deletedAt',p.deleted_at,'lastReadAt',p.last_read_at,'updatedAt',p.updated_at,'ownsMessageTruth',false);
end $$;
revoke all on function public.luvia_booking_conversation_preference(uuid,text,timestamptz) from public;
grant execute on function public.luvia_booking_conversation_preference(uuid,text,timestamptz) to authenticated,service_role;

create or replace function public.luvia_booking_record_mutation_fallback(
  p_booking_id uuid,
  p_action text,
  p_message_id uuid default null,
  p_payload jsonb default '{}'::jsonb
) returns jsonb
language plpgsql security definer set search_path=public
as $$
declare b public.bookings; v_action text:=lower(trim(coalesce(p_action,''))); v_event uuid;
begin
  select * into b from public.bookings where id=p_booking_id;
  if b.id is null or not public.luvia_booking_is_trip_member(b.trip_id) then raise exception 'BOOKING_NOT_ACCESSIBLE'; end if;
  if v_action not in ('modify','cancel') then raise exception 'INVALID_MUTATION_ACTION'; end if;
  insert into public.booking_events(booking_id,trip_id,actor_user_id,event_type,from_status,to_status,payload)
  values(b.id,b.trip_id,auth.uid(),case when v_action='modify' then 'booking.modify.requested.email' else 'booking.cancel.requested.email' end,b.status,b.status,
    coalesce(p_payload,'{}'::jsonb)||jsonb_build_object('messageId',p_message_id,'transport','email_thread','providerOutcomeKnown',false,'finalStatusApplied',false))
  returning id into v_event;
  return jsonb_build_object('ok',true,'eventId',v_event,'action',v_action,'bookingStatusChanged',false,'mutationLifecycleState','pending','awaitingProviderReply',true,'providerOutcomeKnown',false,'reconciliationRequired',false);
end $$;
revoke all on function public.luvia_booking_record_mutation_fallback(uuid,text,uuid,jsonb) from public;
grant execute on function public.luvia_booking_record_mutation_fallback(uuid,text,uuid,jsonb) to authenticated,service_role;

create or replace function public.luvia_booking_timeline_v1(p_booking_id uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare b public.bookings; items jsonb;
begin
  select * into b from public.bookings where id=p_booking_id;
  if b.id is null or not public.luvia_booking_is_trip_member(b.trip_id) then raise exception 'BOOKING_NOT_ACCESSIBLE'; end if;
  select coalesce(jsonb_agg(x.item order by x.at asc),'[]'::jsonb) into items from (
    select e.created_at at, jsonb_build_object('id',e.id,'source','booking_event','kind',e.event_type,'occurredAt',e.created_at,'fromStatus',e.from_status,'toStatus',e.to_status,'payload',e.payload) item
      from public.booking_events e where e.booking_id=p_booking_id
    union all
    select s.occurred_at at, jsonb_build_object('id',s.id,'source','status_signal','kind','booking.status.signal','occurredAt',s.occurred_at,'proposedStatus',s.proposed_luvia_status,'providerStatus',s.provider_status,'provenance',s.source,'resolutionState',s.resolution_state,'payload',s.evidence) item
      from public.booking_status_signals s where s.booking_id=p_booking_id
    union all
    select m.created_at at, jsonb_build_object('id',m.id,'source','message','kind',case when m.direction='inbound' then 'booking.message.received' when m.direction='outbound' then 'booking.message.sent' else 'booking.message.system' end,'occurredAt',m.created_at,'direction',m.direction,'deliveryStatus',m.delivery_status,'messageId',m.id,'payload',jsonb_build_object('subject',m.subject,'channel',m.channel)) item
      from public.booking_messages m where m.booking_id=p_booking_id
    union all
    select d.coalesce_at at, jsonb_build_object('id',d.id,'source','delivery','kind','booking.message.'||coalesce(d.delivery_state,'unknown'),'occurredAt',d.coalesce_at,'deliveryState',d.delivery_state,'messageId',d.message_id,'payload',d.evidence) item
      from (select id,message_id,delivery_state,evidence,coalesce(occurred_at,received_at) coalesce_at from public.booking_email_delivery_events where booking_id=p_booking_id) d
    union all
    select r.created_at at, jsonb_build_object('id',r.id,'source','mutation','kind','booking.modify.request','occurredAt',r.created_at,'action','modify','state',r.state,'mutationLifecycleState',r.mutation_lifecycle_state,'providerOutcomeKnown',r.provider_outcome_known,'reconciliationRequired',r.reconciliation_required,'payload',jsonb_build_object('requestedDate',r.requested_date,'requestedTime',r.requested_time,'partySize',r.party_size,'providerId',r.provider_id,'errorCode',r.error_code)) item
      from public.booking_reservation_modify_requests r where r.booking_id=p_booking_id
    union all
    select r.created_at at, jsonb_build_object('id',r.id,'source','mutation','kind','booking.cancel.request','occurredAt',r.created_at,'action','cancel','state',r.state,'mutationLifecycleState',r.mutation_lifecycle_state,'providerOutcomeKnown',r.provider_outcome_known,'reconciliationRequired',r.reconciliation_required,'payload',jsonb_build_object('providerId',r.provider_id,'errorCode',r.error_code)) item
      from public.booking_reservation_cancel_requests r where r.booking_id=p_booking_id
  ) x;
  return jsonb_build_object('bookingId',b.id,'status',b.status,'items',items,'ownsBookingTruth',false,'source','booking-core');
end $$;
revoke all on function public.luvia_booking_timeline_v1(uuid) from public;
grant execute on function public.luvia_booking_timeline_v1(uuid) to authenticated,service_role;

commit;
