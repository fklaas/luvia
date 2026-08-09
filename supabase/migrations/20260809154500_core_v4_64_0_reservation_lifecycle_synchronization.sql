-- Luvia v13.64.0 / Core 4.64.0
-- Reservation Lifecycle Synchronization / Provider Mutation Status Runtime
begin;

alter table public.booking_reservation_modify_requests
  add column if not exists mutation_lifecycle_state text not null default 'not_started',
  add column if not exists reconciliation_required boolean not null default false,
  add column if not exists provider_outcome_known boolean not null default false,
  add column if not exists last_lifecycle_source text,
  add column if not exists last_lifecycle_at timestamptz;

alter table public.booking_reservation_cancel_requests
  add column if not exists mutation_lifecycle_state text not null default 'not_started',
  add column if not exists reconciliation_required boolean not null default false,
  add column if not exists provider_outcome_known boolean not null default false,
  add column if not exists last_lifecycle_source text,
  add column if not exists last_lifecycle_at timestamptz;

alter table public.booking_reservation_modify_requests drop constraint if exists booking_reservation_modify_requests_mutation_lifecycle_state_check;
alter table public.booking_reservation_modify_requests add constraint booking_reservation_modify_requests_mutation_lifecycle_state_check
  check(mutation_lifecycle_state = any(array['not_started','pending','accepted','rejected','alternative_proposed','cancelled','failed','unknown']::text[]));
alter table public.booking_reservation_cancel_requests drop constraint if exists booking_reservation_cancel_requests_mutation_lifecycle_state_check;
alter table public.booking_reservation_cancel_requests add constraint booking_reservation_cancel_requests_mutation_lifecycle_state_check
  check(mutation_lifecycle_state = any(array['not_started','pending','accepted','rejected','alternative_proposed','cancelled','failed','unknown']::text[]));

create table if not exists public.booking_reservation_mutation_status_events (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  action text not null check(action in ('modify','cancel')),
  modify_request_id uuid references public.booking_reservation_modify_requests(id) on delete cascade,
  cancel_request_id uuid references public.booking_reservation_cancel_requests(id) on delete cascade,
  provider_id text,
  reservation_reference text,
  provider_status text,
  normalized_mutation_status text not null check(normalized_mutation_status in ('pending','accepted','rejected','alternative_proposed','cancelled','failed','unknown')),
  proposed_luvia_status text check(proposed_luvia_status is null or proposed_luvia_status = any(array['requested','awaiting_reply','alternative_proposed','needs_action','confirmed','declined','cancelled','failed']::text[])),
  source text not null check(source in ('system','provider_api','provider_webhook','provider_polling')),
  source_event_id text,
  confidence numeric(4,3) check(confidence is null or confidence between 0 and 1),
  evidence jsonb not null default '{}'::jsonb check(jsonb_typeof(evidence)='object'),
  occurred_at timestamptz not null default now(),
  received_at timestamptz not null default now(),
  resolution_state text not null default 'recorded' check(resolution_state in ('recorded','status_applied','status_ignored','duplicate')),
  resolution_reason text,
  status_signal_id uuid references public.booking_status_signals(id) on delete set null,
  check((action='modify' and modify_request_id is not null and cancel_request_id is null) or (action='cancel' and cancel_request_id is not null and modify_request_id is null))
);
create unique index if not exists booking_reservation_mutation_status_events_source_uidx
  on public.booking_reservation_mutation_status_events(source,source_event_id) where source_event_id is not null;
create index if not exists booking_reservation_mutation_status_events_booking_idx
  on public.booking_reservation_mutation_status_events(booking_id,occurred_at desc,received_at desc);
create index if not exists booking_reservation_mutation_status_events_modify_idx
  on public.booking_reservation_mutation_status_events(modify_request_id,occurred_at desc) where modify_request_id is not null;
create index if not exists booking_reservation_mutation_status_events_cancel_idx
  on public.booking_reservation_mutation_status_events(cancel_request_id,occurred_at desc) where cancel_request_id is not null;

alter table public.booking_reservation_mutation_status_events enable row level security;
drop policy if exists booking_reservation_mutation_status_events_trip_member_select on public.booking_reservation_mutation_status_events;
create policy booking_reservation_mutation_status_events_trip_member_select on public.booking_reservation_mutation_status_events
  for select to authenticated using(public.luvia_booking_is_trip_member(trip_id));
grant select on public.booking_reservation_mutation_status_events to authenticated;
grant select,insert,update,delete on public.booking_reservation_mutation_status_events to service_role;

create or replace function public.luvia_booking_ingest_reservation_mutation_status(
  p_action text,
  p_request_id uuid,
  p_provider_status text,
  p_normalized_mutation_status text,
  p_source text,
  p_source_event_id text default null,
  p_proposed_luvia_status text default null,
  p_confidence numeric default null,
  p_evidence jsonb default '{}'::jsonb,
  p_occurred_at timestamptz default null
) returns jsonb
language plpgsql security definer set search_path=public as $$
declare
  r record;
  e public.booking_reservation_mutation_status_events;
  existing public.booking_reservation_mutation_status_events;
  v_action text:=lower(trim(coalesce(p_action,'')));
  v_source text:=lower(trim(coalesce(p_source,'')));
  v_mutation text:=lower(trim(coalesce(p_normalized_mutation_status,'')));
  v_luvia text:=nullif(lower(trim(coalesce(p_proposed_luvia_status,''))), '');
  v_signal_result jsonb;
  v_signal_id uuid;
  v_applied boolean:=false;
  v_reconciliation boolean:=false;
  v_outcome_known boolean:=false;
begin
  if coalesce(current_setting('request.jwt.claim.role',true),'') <> 'service_role' then raise exception 'SERVICE_ROLE_REQUIRED'; end if;
  if v_action not in ('modify','cancel') then raise exception 'MUTATION_ACTION_INVALID'; end if;
  if v_source not in ('system','provider_api','provider_webhook','provider_polling') then raise exception 'MUTATION_STATUS_SOURCE_INVALID'; end if;
  if v_mutation not in ('pending','accepted','rejected','alternative_proposed','cancelled','failed','unknown') then raise exception 'MUTATION_STATUS_INVALID'; end if;
  if v_luvia is not null and v_luvia not in ('requested','awaiting_reply','alternative_proposed','needs_action','confirmed','declined','cancelled','failed') then raise exception 'MUTATION_LUVIA_STATUS_INVALID'; end if;

  if v_action='modify' then
    select id,trip_id,booking_id,provider_id,reservation_reference,status_signal_id into r
    from public.booking_reservation_modify_requests where id=p_request_id for update;
  else
    select id,trip_id,booking_id,provider_id,reservation_reference,status_signal_id into r
    from public.booking_reservation_cancel_requests where id=p_request_id for update;
  end if;
  if not found then raise exception 'MUTATION_REQUEST_NOT_FOUND'; end if;

  if p_source_event_id is not null then
    select * into existing from public.booking_reservation_mutation_status_events
    where source=v_source and source_event_id=trim(p_source_event_id) limit 1;
    if found then return jsonb_build_object('ok',true,'duplicate',true,'event',to_jsonb(existing),'lifecycleEventId',existing.id,'statusSignalId',existing.status_signal_id); end if;
  end if;

  if v_action='cancel' and v_mutation='cancelled' and v_luvia is null and v_source in ('provider_api','provider_webhook','provider_polling') then
    v_luvia:='cancelled';
  end if;

  insert into public.booking_reservation_mutation_status_events(
    trip_id,booking_id,action,modify_request_id,cancel_request_id,provider_id,reservation_reference,provider_status,
    normalized_mutation_status,proposed_luvia_status,source,source_event_id,confidence,evidence,occurred_at
  ) values(
    r.trip_id,r.booking_id,v_action,case when v_action='modify' then r.id else null end,case when v_action='cancel' then r.id else null end,
    r.provider_id,r.reservation_reference,nullif(trim(coalesce(p_provider_status,'')),''),v_mutation,v_luvia,v_source,
    nullif(trim(coalesce(p_source_event_id,'')),''),case when p_confidence is null then null else greatest(0,least(1,p_confidence)) end,
    coalesce(p_evidence,'{}'::jsonb),coalesce(p_occurred_at,now())
  ) returning * into e;

  v_reconciliation:=v_mutation in ('pending','unknown');
  v_outcome_known:=v_mutation in ('accepted','rejected','alternative_proposed','cancelled','failed');

  if v_luvia is not null and v_source <> 'system' then
    v_signal_result:=public.luvia_booking_ingest_status_signal(
      r.booking_id,r.provider_id,r.reservation_reference,p_provider_status,v_luvia,v_source,
      coalesce(nullif(trim(coalesce(p_source_event_id,'')),''),'mutation-status:'||e.id::text),
      coalesce(p_confidence,1),coalesce(p_evidence,'{}'::jsonb)||jsonb_build_object('mutationLifecycleEventId',e.id,'mutationRequestId',r.id,'mutationAction',v_action),
      coalesce(p_occurred_at,now())
    );
    begin v_signal_id:=((v_signal_result->'signal'->>'id'))::uuid; exception when others then v_signal_id:=null; end;
    if v_signal_id is null then begin v_signal_id:=(v_signal_result->>'signalId')::uuid; exception when others then v_signal_id:=null; end; end if;
    v_applied:=coalesce((v_signal_result->>'applied')::boolean,false);
    update public.booking_reservation_mutation_status_events
    set status_signal_id=v_signal_id,
        resolution_state=case when v_applied then 'status_applied' else 'status_ignored' end,
        resolution_reason=coalesce(v_signal_result->'signal'->>'resolution_reason',v_signal_result->>'reason',case when v_applied then 'BOOKING_STATUS_APPLIED' else 'BOOKING_STATUS_NOT_APPLIED' end)
    where id=e.id returning * into e;
  end if;

  if v_action='modify' then
    update public.booking_reservation_modify_requests
    set mutation_lifecycle_state=v_mutation,reconciliation_required=v_reconciliation,provider_outcome_known=v_outcome_known,
        last_lifecycle_source=v_source,last_lifecycle_at=e.occurred_at,status_signal_id=coalesce(v_signal_id,status_signal_id),
        evidence=coalesce(evidence,'{}'::jsonb)||jsonb_build_object('lastMutationLifecycleEventId',e.id,'lastMutationLifecycleState',v_mutation,'lastMutationLifecycleSource',v_source)
    where id=r.id;
  else
    update public.booking_reservation_cancel_requests
    set mutation_lifecycle_state=v_mutation,reconciliation_required=v_reconciliation,provider_outcome_known=v_outcome_known,
        last_lifecycle_source=v_source,last_lifecycle_at=e.occurred_at,status_signal_id=coalesce(v_signal_id,status_signal_id),
        evidence=coalesce(evidence,'{}'::jsonb)||jsonb_build_object('lastMutationLifecycleEventId',e.id,'lastMutationLifecycleState',v_mutation,'lastMutationLifecycleSource',v_source)
    where id=r.id;
  end if;

  return jsonb_build_object(
    'ok',true,'duplicate',false,'action',v_action,'requestId',r.id,'bookingId',r.booking_id,'providerId',r.provider_id,
    'reservationReference',r.reservation_reference,'mutationLifecycleState',v_mutation,'reconciliationRequired',v_reconciliation,
    'providerOutcomeKnown',v_outcome_known,'lifecycleEventId',e.id,'statusSignalId',v_signal_id,'bookingStatusApplied',v_applied,'event',to_jsonb(e)
  );
end $$;

revoke all on function public.luvia_booking_ingest_reservation_mutation_status(text,uuid,text,text,text,text,text,numeric,jsonb,timestamptz) from public,anon,authenticated;
grant execute on function public.luvia_booking_ingest_reservation_mutation_status(text,uuid,text,text,text,text,text,numeric,jsonb,timestamptz) to service_role;

create or replace view public.booking_reservation_mutation_lifecycle_v1 as
select m.id as request_id,'modify'::text as action,m.trip_id,m.booking_id,m.provider_id,m.reservation_reference,m.state as request_state,
  m.mutation_lifecycle_state,m.reconciliation_required,m.provider_outcome_known,m.last_lifecycle_source,m.last_lifecycle_at,m.provider_status,m.luvia_status,m.status_signal_id,m.error_code,m.attempt_count,m.created_at,m.finished_at,
  b.status as current_booking_status
from public.booking_reservation_modify_requests m join public.bookings b on b.id=m.booking_id
union all
select c.id,'cancel'::text,c.trip_id,c.booking_id,c.provider_id,c.reservation_reference,c.state,
  c.mutation_lifecycle_state,c.reconciliation_required,c.provider_outcome_known,c.last_lifecycle_source,c.last_lifecycle_at,c.provider_status,c.luvia_status,c.status_signal_id,c.error_code,c.attempt_count,c.created_at,c.finished_at,
  b.status
from public.booking_reservation_cancel_requests c join public.bookings b on b.id=c.booking_id;
revoke all on public.booking_reservation_mutation_lifecycle_v1 from public,anon,authenticated;
grant select on public.booking_reservation_mutation_lifecycle_v1 to service_role;

insert into public.booking_health_checks(check_key,status,details,checked_at)
values('release','ok',jsonb_build_object('version','1.0.5','integration_ready',true,'luvia_core','4.64.0','luvia_build','13.64.0','feature','Reservation Lifecycle Synchronization / Provider Mutation Status Runtime','checked_at',now()),now())
on conflict(check_key) do update set status=excluded.status,details=excluded.details,checked_at=excluded.checked_at;

commit;
