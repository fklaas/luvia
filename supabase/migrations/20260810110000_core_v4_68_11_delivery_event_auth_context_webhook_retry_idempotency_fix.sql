-- Luvia v13.68.11 / Core 4.68.11
-- Delivery Event Auth Context & Webhook Retry Idempotency Fix
begin;

-- Delivery-delay is a first-class transport state.
alter table public.booking_email_delivery_events
  drop constraint if exists booking_email_delivery_events_delivery_state_check;
alter table public.booking_email_delivery_events
  add constraint booking_email_delivery_events_delivery_state_check
  check (delivery_state in ('sent','delivered','delayed','failed','complained','unknown'));

create or replace function public.luvia_booking_email_mark_delivery(
  p_provider_message_id text,
  p_provider_event_id text,
  p_event_type text,
  p_delivery_state text,
  p_evidence jsonb default '{}'::jsonb,
  p_occurred_at timestamptz default null
) returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  m public.booking_messages;
  e public.booking_email_delivery_events;
  v_status text;
begin
  if not public.luvia_booking_is_service_role_request() then
    raise exception 'SERVICE_ROLE_REQUIRED';
  end if;
  if nullif(trim(p_provider_event_id),'') is null then raise exception 'PROVIDER_EVENT_ID_REQUIRED'; end if;
  if p_delivery_state not in ('sent','delivered','delayed','failed','complained','unknown') then raise exception 'EMAIL_DELIVERY_STATE_INVALID'; end if;

  -- Hard webhook retry/replay idempotency boundary.
  select * into e from public.booking_email_delivery_events
  where provider='resend' and provider_event_id=p_provider_event_id;
  if found then
    return jsonb_build_object('ok',true,'duplicate',true,'matched',e.message_id is not null,'event',to_jsonb(e));
  end if;

  select * into m from public.booking_messages
  where transport_provider='resend' and provider_message_id=p_provider_message_id
  order by created_at desc limit 1;

  if not found then
    insert into public.booking_email_delivery_events(provider_message_id,provider_event_id,event_type,delivery_state,evidence,occurred_at)
    values(p_provider_message_id,p_provider_event_id,p_event_type,p_delivery_state,coalesce(p_evidence,'{}'::jsonb),p_occurred_at)
    on conflict(provider,provider_event_id) do nothing
    returning * into e;
    if e.id is null then select * into e from public.booking_email_delivery_events where provider='resend' and provider_event_id=p_provider_event_id; end if;
    return jsonb_build_object('ok',true,'duplicate',false,'matched',false,'event',to_jsonb(e));
  end if;

  v_status:=case
    when p_delivery_state='delivered' then 'delivered'
    when p_delivery_state in ('failed','complained') then 'failed'
    else m.delivery_status end;
  update public.booking_messages
    set delivery_status=coalesce(v_status,delivery_status),
        metadata=coalesce(metadata,'{}'::jsonb)||jsonb_build_object('lastDeliveryEvent',p_event_type,'lastDeliveryState',p_delivery_state)
    where id=m.id;

  insert into public.booking_email_delivery_events(booking_id,message_id,provider_message_id,provider_event_id,event_type,delivery_state,evidence,occurred_at)
  values(m.booking_id,m.id,p_provider_message_id,p_provider_event_id,p_event_type,p_delivery_state,coalesce(p_evidence,'{}'::jsonb),p_occurred_at)
  on conflict(provider,provider_event_id) do nothing
  returning * into e;
  if e.id is null then select * into e from public.booking_email_delivery_events where provider='resend' and provider_event_id=p_provider_event_id; end if;

  if p_delivery_state in ('failed','complained') then
    update public.booking_email_threads set state='delivery_failed',last_activity_at=now(),updated_at=now() where id=m.email_thread_id;
    update public.booking_email_requests set state='delivery_failed',error_code=upper(replace(p_event_type,'.','_')),finished_at=coalesce(finished_at,now()) where message_id=m.id;
  end if;
  return jsonb_build_object('ok',true,'duplicate',false,'matched',true,'event',to_jsonb(e),'messageId',m.id,'bookingId',m.booking_id);
end $$;

revoke all on function public.luvia_booking_email_mark_delivery(text,text,text,text,jsonb,timestamptz) from public,anon,authenticated;
grant execute on function public.luvia_booking_email_mark_delivery(text,text,text,text,jsonb,timestamptz) to service_role;
comment on function public.luvia_booking_email_mark_delivery(text,text,text,text,jsonb,timestamptz) is 'Email Booking V2 delivery webhook store: robust service-role context plus provider-event replay idempotency.';
commit;
