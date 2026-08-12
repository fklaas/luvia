-- Luvia Core 4.80.0 · Booking Actions & Intelligence
begin;

alter table public.booking_message_intelligence
  add column if not exists review_state text,
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null,
  add column if not exists reviewed_at timestamptz,
  add column if not exists user_action text,
  add column if not exists user_action_payload jsonb not null default '{}'::jsonb;

update public.booking_message_intelligence
set review_state = case when coalesce(review_required,false) or coalesce(requires_user_action,false) then 'open' else 'not_required' end
where review_state is null;

alter table public.booking_message_intelligence
  alter column review_state set default 'not_required';

alter table public.booking_message_intelligence
  alter column review_state set not null;

do $$ begin
  if not exists(select 1 from pg_constraint where conname='booking_message_intelligence_review_state_check') then
    alter table public.booking_message_intelligence
      add constraint booking_message_intelligence_review_state_check
      check(review_state in ('not_required','open','resolved','dismissed'));
  end if;
end $$;

create index if not exists booking_message_intelligence_review_idx
  on public.booking_message_intelligence(booking_id,review_state,classified_at desc);

create or replace function public.luvia_booking_message_intelligence_review_state_sync()
returns trigger language plpgsql set search_path=public as $$
begin
  if (coalesce(new.review_required,false) or coalesce(new.requires_user_action,false))
     and new.reviewed_at is null
     and coalesce(new.review_state,'not_required')='not_required' then
    new.review_state:='open';
  elsif not coalesce(new.review_required,false) and not coalesce(new.requires_user_action,false)
        and new.reviewed_at is null and new.review_state is null then
    new.review_state:='not_required';
  end if;
  return new;
end $$;

drop trigger if exists booking_message_intelligence_review_state_sync on public.booking_message_intelligence;
create trigger booking_message_intelligence_review_state_sync
before insert or update of review_required,requires_user_action,review_state,reviewed_at
on public.booking_message_intelligence
for each row execute function public.luvia_booking_message_intelligence_review_state_sync();

create or replace function public.luvia_booking_resolve_message_intelligence(
  p_intelligence_id uuid,
  p_action text,
  p_payload jsonb default '{}'::jsonb
) returns jsonb
language plpgsql security definer set search_path=public as $$
declare
  v_intel public.booking_message_intelligence;
  v_booking public.bookings;
  v_action text:=lower(trim(coalesce(p_action,'')));
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into v_intel from public.booking_message_intelligence where id=p_intelligence_id for update;
  if not found then raise exception 'INTELLIGENCE_NOT_FOUND'; end if;
  select * into v_booking from public.bookings where id=v_intel.booking_id;
  if not found then raise exception 'BOOKING_NOT_FOUND'; end if;
  if not public.luvia_booking_is_trip_member(v_booking.trip_id) then raise exception 'TRIP_ACCESS_DENIED'; end if;
  if v_action not in ('accept_alternative','decline_alternative','answer','mark_reviewed','dismiss') then
    raise exception 'INVALID_INTELLIGENCE_ACTION';
  end if;
  update public.booking_message_intelligence set
    review_state=case when v_action='dismiss' then 'dismissed' else 'resolved' end,
    reviewed_by=auth.uid(),
    reviewed_at=now(),
    user_action=v_action,
    user_action_payload=coalesce(p_payload,'{}'::jsonb),
    updated_at=now()
  where id=v_intel.id
  returning * into v_intel;

  insert into public.booking_events(booking_id,trip_id,actor_user_id,event_type,payload)
  values(v_booking.id,v_booking.trip_id,auth.uid(),'booking.message.intelligence.resolved',jsonb_build_object(
    'intelligenceId',v_intel.id,
    'messageId',v_intel.message_id,
    'action',v_action,
    'payload',coalesce(p_payload,'{}'::jsonb)
  ));
  return to_jsonb(v_intel);
end $$;

revoke all on function public.luvia_booking_resolve_message_intelligence(uuid,text,jsonb) from public,anon;
grant execute on function public.luvia_booking_resolve_message_intelligence(uuid,text,jsonb) to authenticated,service_role;
comment on function public.luvia_booking_resolve_message_intelligence(uuid,text,jsonb) is 'v13.80 user-reviewed Booking Intelligence action audit. Does not create provider truth or auto-confirm reservations.';

commit;
