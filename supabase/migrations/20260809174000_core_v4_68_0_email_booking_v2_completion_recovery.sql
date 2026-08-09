-- Luvia v13.68.0 / Core 4.68.0
-- Email Booking V2 · Completion, recovery and operational queue
begin;

create or replace view public.booking_email_runtime_v2 as
select b.id as booking_id,b.trip_id,b.title,b.booking_type,b.status as booking_status,b.contact->>'email' as intended_recipient,
 t.id as thread_id,t.reply_alias,t.state as thread_state,t.last_activity_at,
 oer.id as latest_request_id,oer.state as latest_request_state,oer.error_code as latest_request_error,oer.provider_message_id,
 om.id as last_outbound_message_id,om.delivery_status as last_outbound_delivery_status,om.sent_at as last_outbound_at,
 im.id as last_inbound_message_id,im.received_at as last_inbound_at,
 mi.intent as last_reply_intent,mi.confidence as last_reply_confidence,mi.review_required,
 case
  when oer.state in ('failed','delivery_failed') or t.state='delivery_failed' then 'delivery_attention'
  when mi.review_required=true then 'review_required'
  when b.status in ('requested','awaiting_reply') and im.id is null and coalesce(om.sent_at,om.created_at) < now()-interval '48 hours' then 'reply_overdue'
  when b.status in ('confirmed','declined','cancelled','failed') then 'complete'
  when t.state='replied' then 'reply_received'
  when om.id is not null then 'awaiting_reply'
  else 'not_started' end as email_case_state
from public.bookings b
left join lateral(select * from public.booking_email_threads x where x.booking_id=b.id limit 1)t on true
left join lateral(select * from public.booking_email_requests r where r.booking_id=b.id order by r.created_at desc limit 1)oer on true
left join public.booking_messages om on om.id=t.last_outbound_message_id
left join public.booking_messages im on im.id=t.last_inbound_message_id
left join public.booking_message_intelligence mi on mi.message_id=im.id;
alter view public.booking_email_runtime_v2 set (security_invoker=true);
grant select on public.booking_email_runtime_v2 to authenticated,service_role;

create or replace view public.booking_email_recovery_queue_v2 as
select * from public.booking_email_runtime_v2
where email_case_state in ('delivery_attention','review_required','reply_overdue')
order by last_activity_at asc nulls first;
alter view public.booking_email_recovery_queue_v2 set (security_invoker=true);
grant select on public.booking_email_recovery_queue_v2 to authenticated,service_role;

create or replace function public.luvia_booking_email_mark_delivery(p_provider_message_id text,p_provider_event_id text,p_event_type text,p_delivery_state text,p_evidence jsonb default '{}'::jsonb,p_occurred_at timestamptz default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare m public.booking_messages;e public.booking_email_delivery_events;v_status text;v_thread uuid;
begin
 if coalesce(current_setting('request.jwt.claim.role',true),'') <> 'service_role' then raise exception 'SERVICE_ROLE_REQUIRED'; end if;
 if p_delivery_state not in ('sent','delivered','failed','complained','unknown') then raise exception 'EMAIL_DELIVERY_STATE_INVALID'; end if;
 select * into e from public.booking_email_delivery_events where provider='resend' and provider_event_id=p_provider_event_id;
 if found then return jsonb_build_object('ok',true,'duplicate',true,'event',to_jsonb(e)); end if;
 select * into m from public.booking_messages where transport_provider='resend' and provider_message_id=p_provider_message_id order by created_at desc limit 1;
 if not found then
  insert into public.booking_email_delivery_events(provider_message_id,provider_event_id,event_type,delivery_state,evidence,occurred_at)
  values(p_provider_message_id,p_provider_event_id,p_event_type,p_delivery_state,coalesce(p_evidence,'{}'::jsonb),p_occurred_at) returning * into e;
  return jsonb_build_object('ok',true,'matched',false,'event',to_jsonb(e));
 end if;
 v_status:=case when p_delivery_state='delivered' then 'delivered' when p_delivery_state in ('failed','complained') then 'failed' else m.delivery_status end;
 update public.booking_messages set delivery_status=coalesce(v_status,delivery_status),metadata=coalesce(metadata,'{}'::jsonb)||jsonb_build_object('lastDeliveryEvent',p_event_type,'lastDeliveryState',p_delivery_state) where id=m.id;
 insert into public.booking_email_delivery_events(booking_id,message_id,provider_message_id,provider_event_id,event_type,delivery_state,evidence,occurred_at)
 values(m.booking_id,m.id,p_provider_message_id,p_provider_event_id,p_event_type,p_delivery_state,coalesce(p_evidence,'{}'::jsonb),p_occurred_at) returning * into e;
 if p_delivery_state in ('failed','complained') then
  update public.booking_email_threads set state='delivery_failed',last_activity_at=now(),updated_at=now() where id=m.email_thread_id;
  update public.booking_email_requests set state='delivery_failed',error_code=upper(replace(p_event_type,'.','_')),finished_at=coalesce(finished_at,now()) where message_id=m.id;
 end if;
 return jsonb_build_object('ok',true,'matched',true,'event',to_jsonb(e),'messageId',m.id,'bookingId',m.booking_id);
end $$;
revoke all on function public.luvia_booking_email_mark_delivery(text,text,text,text,jsonb,timestamptz) from public,anon,authenticated;
grant execute on function public.luvia_booking_email_mark_delivery(text,text,text,text,jsonb,timestamptz) to service_role;

comment on view public.booking_email_recovery_queue_v2 is 'Email Booking V2 operational queue: delivery failures, reply reviews and overdue unanswered requests. No automatic resend.';
commit;
