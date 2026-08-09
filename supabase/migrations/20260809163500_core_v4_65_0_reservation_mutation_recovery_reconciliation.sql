-- Luvia v13.65.0 / Core 4.65.0
-- Reservation Mutation Recovery / Reconciliation / Runtime Completion
begin;

alter table public.booking_reservation_modify_requests
  add column if not exists reconciliation_attempt_count integer not null default 0,
  add column if not exists last_reconciliation_at timestamptz,
  add column if not exists last_reconciliation_state text,
  add column if not exists last_reconciliation_error text,
  add column if not exists next_reconciliation_at timestamptz;

alter table public.booking_reservation_cancel_requests
  add column if not exists reconciliation_attempt_count integer not null default 0,
  add column if not exists last_reconciliation_at timestamptz,
  add column if not exists last_reconciliation_state text,
  add column if not exists last_reconciliation_error text,
  add column if not exists next_reconciliation_at timestamptz;

alter table public.booking_reservation_modify_requests drop constraint if exists booking_reservation_modify_requests_state_check;
alter table public.booking_reservation_modify_requests add constraint booking_reservation_modify_requests_state_check
  check(state = any(array['received','blocked','calling_provider','applying','completed','failed','timed_out','reconciled']::text[]));
alter table public.booking_reservation_cancel_requests drop constraint if exists booking_reservation_cancel_requests_state_check;
alter table public.booking_reservation_cancel_requests add constraint booking_reservation_cancel_requests_state_check
  check(state = any(array['received','blocked','calling_provider','applying','completed','failed','timed_out','reconciled']::text[]));

alter table public.booking_reservation_modify_requests drop constraint if exists booking_reservation_modify_requests_last_reconciliation_state_check;
alter table public.booking_reservation_modify_requests add constraint booking_reservation_modify_requests_last_reconciliation_state_check
  check(last_reconciliation_state is null or last_reconciliation_state = any(array['started','blocked','awaiting_provider','polling','resolved','unresolved','failed']::text[]));
alter table public.booking_reservation_cancel_requests drop constraint if exists booking_reservation_cancel_requests_last_reconciliation_state_check;
alter table public.booking_reservation_cancel_requests add constraint booking_reservation_cancel_requests_last_reconciliation_state_check
  check(last_reconciliation_state is null or last_reconciliation_state = any(array['started','blocked','awaiting_provider','polling','resolved','unresolved','failed']::text[]));

create table if not exists public.booking_reservation_mutation_reconciliation_attempts (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  action text not null check(action in ('modify','cancel')),
  modify_request_id uuid references public.booking_reservation_modify_requests(id) on delete cascade,
  cancel_request_id uuid references public.booking_reservation_cancel_requests(id) on delete cascade,
  provider_id text,
  reservation_reference text,
  strategy text not null check(strategy in ('polling','await_webhook','manual_review')),
  state text not null default 'started' check(state in ('started','blocked','awaiting_provider','polling','resolved','unresolved','failed')),
  expected_state boolean not null default false,
  error_code text,
  provider_status text,
  normalized_mutation_status text check(normalized_mutation_status is null or normalized_mutation_status in ('pending','accepted','rejected','alternative_proposed','cancelled','failed','unknown')),
  lifecycle_event_id uuid references public.booking_reservation_mutation_status_events(id) on delete set null,
  status_signal_id uuid references public.booking_status_signals(id) on delete set null,
  provider_http_status integer,
  provider_latency_ms integer check(provider_latency_ms is null or provider_latency_ms >= 0),
  reconciliation_required_after boolean,
  provider_outcome_known_after boolean,
  evidence jsonb not null default '{}'::jsonb check(jsonb_typeof(evidence)='object'),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  check((action='modify' and modify_request_id is not null and cancel_request_id is null) or (action='cancel' and cancel_request_id is not null and modify_request_id is null))
);
create index if not exists booking_reservation_mutation_reconciliation_attempts_booking_idx on public.booking_reservation_mutation_reconciliation_attempts(booking_id,started_at desc);
create index if not exists booking_reservation_mutation_reconciliation_attempts_modify_idx on public.booking_reservation_mutation_reconciliation_attempts(modify_request_id,started_at desc) where modify_request_id is not null;
create index if not exists booking_reservation_mutation_reconciliation_attempts_cancel_idx on public.booking_reservation_mutation_reconciliation_attempts(cancel_request_id,started_at desc) where cancel_request_id is not null;

alter table public.booking_reservation_mutation_reconciliation_attempts enable row level security;
drop policy if exists booking_reservation_mutation_reconciliation_attempts_trip_member_select on public.booking_reservation_mutation_reconciliation_attempts;
create policy booking_reservation_mutation_reconciliation_attempts_trip_member_select on public.booking_reservation_mutation_reconciliation_attempts
  for select to authenticated using(public.luvia_booking_is_trip_member(trip_id));
grant select on public.booking_reservation_mutation_reconciliation_attempts to authenticated;
grant select,insert,update,delete on public.booking_reservation_mutation_reconciliation_attempts to service_role;

-- Tighten v13.64 lifecycle authority: system events can document progress, but only provider-originated terminal evidence can resolve provider outcome.
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

  -- Only provider-originated terminal evidence may resolve an ambiguous provider outcome.
  v_outcome_known:=v_source in ('provider_api','provider_webhook','provider_polling') and v_mutation in ('accepted','rejected','alternative_proposed','cancelled','failed');
  v_reconciliation:=v_mutation in ('pending','unknown') or (v_source='system' and v_mutation in ('accepted','rejected','alternative_proposed','cancelled','failed'));

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


-- Terminal lifecycle evidence resolves an ambiguous request without ever replaying the mutation.
create or replace function public.luvia_booking_finalize_mutation_reconciliation_from_event()
returns trigger language plpgsql security definer set search_path=public as $$
declare
  v_terminal boolean := new.source in ('provider_api','provider_webhook','provider_polling') and new.normalized_mutation_status in ('accepted','rejected','alternative_proposed','cancelled','failed');
  v_error text := case
    when new.normalized_mutation_status='rejected' then 'PROVIDER_MUTATION_REJECTED'
    when new.normalized_mutation_status='failed' then 'PROVIDER_MUTATION_FAILED'
    else null end;
begin
  if not v_terminal then return new; end if;
  if new.action='modify' then
    update public.booking_reservation_modify_requests
    set state=case when reconciliation_required=true or state in ('timed_out','failed') then 'reconciled' else state end,
        reconciliation_required=false,
        provider_outcome_known=true,
        last_reconciliation_at=case when reconciliation_required=true or state in ('timed_out','failed') then now() else last_reconciliation_at end,
        last_reconciliation_state=case when reconciliation_required=true or state in ('timed_out','failed') then 'resolved' else last_reconciliation_state end,
        last_reconciliation_error=case when reconciliation_required=true or state in ('timed_out','failed') then v_error else last_reconciliation_error end,
        next_reconciliation_at=null,
        finished_at=case when reconciliation_required=true or state in ('timed_out','failed') then coalesce(finished_at,now()) else finished_at end
    where id=new.modify_request_id;
  else
    update public.booking_reservation_cancel_requests
    set state=case when reconciliation_required=true or state in ('timed_out','failed') then 'reconciled' else state end,
        reconciliation_required=false,
        provider_outcome_known=true,
        last_reconciliation_at=case when reconciliation_required=true or state in ('timed_out','failed') then now() else last_reconciliation_at end,
        last_reconciliation_state=case when reconciliation_required=true or state in ('timed_out','failed') then 'resolved' else last_reconciliation_state end,
        last_reconciliation_error=case when reconciliation_required=true or state in ('timed_out','failed') then v_error else last_reconciliation_error end,
        next_reconciliation_at=null,
        finished_at=case when reconciliation_required=true or state in ('timed_out','failed') then coalesce(finished_at,now()) else finished_at end
    where id=new.cancel_request_id;
  end if;
  return new;
end $$;
revoke all on function public.luvia_booking_finalize_mutation_reconciliation_from_event() from public,anon,authenticated;
grant execute on function public.luvia_booking_finalize_mutation_reconciliation_from_event() to service_role;

drop trigger if exists booking_reservation_mutation_status_event_finalize_reconciliation on public.booking_reservation_mutation_status_events;
create trigger booking_reservation_mutation_status_event_finalize_reconciliation
  after insert on public.booking_reservation_mutation_status_events
  for each row execute function public.luvia_booking_finalize_mutation_reconciliation_from_event();

create or replace view public.booking_reservation_mutation_reconciliation_queue_v1 as
select m.id as request_id,'modify'::text as action,m.trip_id,m.booking_id,m.provider_id,m.reservation_reference,
  m.state as request_state,m.mutation_lifecycle_state,m.reconciliation_required,m.provider_outcome_known,
  m.reconciliation_attempt_count,m.last_reconciliation_at,m.last_reconciliation_state,m.last_reconciliation_error,m.next_reconciliation_at,
  c.supports_status_polling,c.supports_status_webhook,c.luvia_access_state,
  pc.connection_state,pc.probe_state,pc.status_return_state,
  case when c.supports_status_polling=true then 'polling' when c.supports_status_webhook=true then 'await_webhook' else 'manual_review' end as reconciliation_strategy,
  b.status as current_booking_status,m.created_at,m.finished_at
from public.booking_reservation_modify_requests m
join public.bookings b on b.id=m.booking_id
left join public.booking_provider_capabilities c on c.provider_id=m.provider_id
left join public.booking_provider_connections pc on pc.provider_id=m.provider_id
where m.reconciliation_required=true and m.provider_outcome_known=false
union all
select x.id,'cancel'::text,x.trip_id,x.booking_id,x.provider_id,x.reservation_reference,
  x.state,x.mutation_lifecycle_state,x.reconciliation_required,x.provider_outcome_known,
  x.reconciliation_attempt_count,x.last_reconciliation_at,x.last_reconciliation_state,x.last_reconciliation_error,x.next_reconciliation_at,
  c.supports_status_polling,c.supports_status_webhook,c.luvia_access_state,
  pc.connection_state,pc.probe_state,pc.status_return_state,
  case when c.supports_status_polling=true then 'polling' when c.supports_status_webhook=true then 'await_webhook' else 'manual_review' end,
  b.status,x.created_at,x.finished_at
from public.booking_reservation_cancel_requests x
join public.bookings b on b.id=x.booking_id
left join public.booking_provider_capabilities c on c.provider_id=x.provider_id
left join public.booking_provider_connections pc on pc.provider_id=x.provider_id
where x.reconciliation_required=true and x.provider_outcome_known=false;
revoke all on public.booking_reservation_mutation_reconciliation_queue_v1 from public,anon,authenticated;
grant select on public.booking_reservation_mutation_reconciliation_queue_v1 to service_role;

insert into public.booking_health_checks(check_key,status,details,checked_at)
values('release','ok',jsonb_build_object('version','1.0.6','integration_ready',true,'luvia_core','4.65.0','luvia_build','13.65.0','feature','Reservation Mutation Recovery / Reconciliation / Runtime Completion','checked_at',now()),now())
on conflict(check_key) do update set status=excluded.status,details=excluded.details,checked_at=excluded.checked_at;

commit;
