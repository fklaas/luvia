-- Luvia v13.67.0 / Core 4.67.0
-- Email Booking V2 · Threading, delivery events, inbound status provenance
begin;

alter table public.booking_messages add column if not exists email_thread_id uuid;
alter table public.booking_messages add column if not exists correlation_method text;

create table if not exists public.booking_email_threads(
 id uuid primary key default gen_random_uuid(),
 booking_id uuid not null unique references public.bookings(id) on delete cascade,
 trip_id uuid not null references public.trips(id) on delete cascade,
 transport_provider text not null default 'resend',
 reply_alias text not null unique,
 state text not null default 'open' check(state in ('open','awaiting_reply','replied','closed','delivery_failed')),
 last_outbound_message_id uuid references public.booking_messages(id) on delete set null,
 last_inbound_message_id uuid references public.booking_messages(id) on delete set null,
 last_activity_at timestamptz not null default now(),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists booking_email_threads_trip_state_idx on public.booking_email_threads(trip_id,state,last_activity_at desc);
alter table public.booking_email_threads enable row level security;
grant select on public.booking_email_threads to authenticated;
grant all on public.booking_email_threads to service_role;
drop policy if exists booking_email_threads_trip_member_select on public.booking_email_threads;
create policy booking_email_threads_trip_member_select on public.booking_email_threads for select to authenticated using(public.luvia_booking_is_trip_member(trip_id));

create table if not exists public.booking_email_delivery_events(
 id uuid primary key default gen_random_uuid(),
 booking_id uuid references public.bookings(id) on delete cascade,
 message_id uuid references public.booking_messages(id) on delete cascade,
 provider text not null default 'resend',
 provider_message_id text,
 provider_event_id text not null,
 event_type text not null,
 delivery_state text not null check(delivery_state in ('sent','delivered','failed','complained','unknown')),
 evidence jsonb not null default '{}'::jsonb,
 occurred_at timestamptz,
 received_at timestamptz not null default now(),
 unique(provider,provider_event_id)
);
create index if not exists booking_email_delivery_events_message_idx on public.booking_email_delivery_events(message_id,received_at desc);
alter table public.booking_email_delivery_events enable row level security;
grant select on public.booking_email_delivery_events to authenticated;
grant all on public.booking_email_delivery_events to service_role;
drop policy if exists booking_email_delivery_events_trip_member_select on public.booking_email_delivery_events;
create policy booking_email_delivery_events_trip_member_select on public.booking_email_delivery_events for select to authenticated using(
 booking_id is not null and exists(select 1 from public.bookings b where b.id=booking_id and public.luvia_booking_is_trip_member(b.trip_id))
);

create or replace function public.luvia_booking_match_inbound_v2(p_to text[],p_in_reply_to text default null,p_references text default null,p_provider_message_id text default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_booking uuid;v_thread uuid;v_method text;v_alias text;v_ref text;
begin
 foreach v_alias in array coalesce(p_to,array[]::text[]) loop
  select t.booking_id,t.id into v_booking,v_thread from public.booking_email_threads t where lower(t.reply_alias)=lower(v_alias) limit 1;
  if v_booking is not null then return jsonb_build_object('bookingId',v_booking,'threadId',v_thread,'method','reply_alias'); end if;
 end loop;
 if nullif(trim(coalesce(p_in_reply_to,'')),'') is not null then
  select bm.booking_id,bm.email_thread_id into v_booking,v_thread from public.booking_messages bm where bm.message_id_header=p_in_reply_to order by bm.created_at desc limit 1;
  if v_booking is not null then return jsonb_build_object('bookingId',v_booking,'threadId',v_thread,'method','in_reply_to'); end if;
 end if;
 if nullif(trim(coalesce(p_references,'')),'') is not null then
  for v_ref in select regexp_split_to_table(p_references,'\s+') loop
   select bm.booking_id,bm.email_thread_id into v_booking,v_thread from public.booking_messages bm where bm.message_id_header=v_ref order by bm.created_at desc limit 1;
   if v_booking is not null then return jsonb_build_object('bookingId',v_booking,'threadId',v_thread,'method','references'); end if;
  end loop;
 end if;
 if nullif(trim(coalesce(p_provider_message_id,'')),'') is not null then
  select bm.booking_id,bm.email_thread_id into v_booking,v_thread from public.booking_messages bm where bm.transport_provider='resend' and bm.provider_message_id=p_provider_message_id order by bm.created_at desc limit 1;
  if v_booking is not null then return jsonb_build_object('bookingId',v_booking,'threadId',v_thread,'method','provider_message_id'); end if;
 end if;
 return jsonb_build_object('bookingId',null,'threadId',null,'method',null);
end $$;
revoke all on function public.luvia_booking_match_inbound_v2(text[],text,text,text) from public,anon,authenticated;
grant execute on function public.luvia_booking_match_inbound_v2(text[],text,text,text) to service_role;

create or replace function public.luvia_booking_process_inbound_intelligence_v2(p_message_id uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_msg public.booking_messages;v_booking public.bookings;v_result jsonb;v_intent text;v_conf numeric;v_proposed text;v_auto boolean;v_signal jsonb:=null;v_signal_id uuid:=null;v_applied boolean:=false;v_applied_status text:=null;
begin
 if coalesce(current_setting('request.jwt.claim.role',true),'') <> 'service_role' then raise exception 'SERVICE_ROLE_REQUIRED'; end if;
 select * into v_msg from public.booking_messages where id=p_message_id and direction='inbound' for update;
 if not found then raise exception 'INBOUND_MESSAGE_NOT_FOUND'; end if;
 select * into v_booking from public.bookings where id=v_msg.booking_id for update;
 if not found then raise exception 'BOOKING_NOT_FOUND'; end if;
 v_result:=public.luvia_booking_classify_reply(v_msg.subject,v_msg.body_text);
 v_intent:=v_result->>'intent';v_conf:=(v_result->>'confidence')::numeric;v_proposed:=nullif(v_result->>'proposedStatus','');v_auto:=coalesce((v_result->>'autoApply')::boolean,false);
 if v_auto and v_proposed is not null then
  v_signal:=public.luvia_booking_ingest_status_signal_internal(v_booking.id,'email',v_msg.provider_message_id,v_intent,v_proposed,'email_reply',coalesce(v_msg.webhook_event_id,v_msg.id::text),v_conf,jsonb_build_object('messageId',v_msg.id,'classifierVersion','0.4.0','emailThreadId',v_msg.email_thread_id),coalesce(v_msg.received_at,v_msg.created_at),false);
  v_signal_id:=nullif(v_signal#>>'{signal,id}','')::uuid;
  v_applied:=coalesce((v_signal->>'applied')::boolean,false);
  if v_applied then v_applied_status:=v_proposed; end if;
 end if;
 insert into public.booking_message_intelligence(booking_id,message_id,classifier,classifier_version,intent,confidence,proposed_status,auto_apply,applied,applied_status,requires_user_action,review_required,visible_reply,evidence,extracted,raw_result,classified_at,updated_at)
 values(v_booking.id,v_msg.id,'rules','0.4.0-email-v2',v_intent,v_conf,v_proposed,v_auto,v_applied,v_applied_status,coalesce((v_result->>'requiresUserAction')::boolean,false),coalesce((v_result->>'reviewRequired')::boolean,false),v_result->>'visibleReply',coalesce(v_result->'evidence','[]'::jsonb),coalesce(v_result->'extracted','{}'::jsonb),v_result||jsonb_build_object('statusSignal',v_signal),now(),now())
 on conflict(message_id) do update set classifier='rules',classifier_version='0.4.0-email-v2',intent=excluded.intent,confidence=excluded.confidence,proposed_status=excluded.proposed_status,auto_apply=excluded.auto_apply,applied=excluded.applied,applied_status=excluded.applied_status,requires_user_action=excluded.requires_user_action,review_required=excluded.review_required,visible_reply=excluded.visible_reply,evidence=excluded.evidence,extracted=excluded.extracted,raw_result=excluded.raw_result,classified_at=now(),updated_at=now();
 update public.booking_email_threads set state='replied',last_inbound_message_id=v_msg.id,last_activity_at=now(),updated_at=now() where id=v_msg.email_thread_id;
 insert into public.booking_events(booking_id,trip_id,event_type,payload) values(v_booking.id,v_booking.trip_id,'booking.email.reply.classified',jsonb_build_object('messageId',v_msg.id,'intent',v_intent,'confidence',v_conf,'statusSignalId',v_signal_id,'applied',v_applied));
 return v_result||jsonb_build_object('bookingId',v_booking.id,'messageId',v_msg.id,'statusSignalId',v_signal_id,'applied',v_applied,'appliedStatus',v_applied_status);
end $$;
revoke all on function public.luvia_booking_process_inbound_intelligence_v2(uuid) from public,anon,authenticated;
grant execute on function public.luvia_booking_process_inbound_intelligence_v2(uuid) to service_role;

comment on function public.luvia_booking_process_inbound_intelligence_v2(uuid) is 'Email Booking V2: inbound reply classification feeds canonical booking status provenance; never writes booking status directly.';
commit;
