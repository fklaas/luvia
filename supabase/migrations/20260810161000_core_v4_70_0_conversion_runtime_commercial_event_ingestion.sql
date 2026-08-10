-- Luvia v13.70.0 / Core 4.70.0
-- Conversion Runtime & Commercial Event Ingestion
-- Provider-neutral commercial event inbox with verification, idempotency, correlation resolution and fail-closed processing.
-- Commercial evidence NEVER mutates reservation truth.
begin;

create table if not exists public.booking_commercial_events (
  id uuid primary key default gen_random_uuid(),
  provider_id text not null,
  source text not null check (source in ('provider_callback','affiliate_callback','provider_api','provider_polling','manual_reconciliation')),
  event_kind text not null check (event_kind in (
    'conversion_reported','conversion_pending','conversion_approved','conversion_rejected','conversion_cancelled',
    'commission_pending','commission_approved','commission_paid','commission_rejected','commission_disputed'
  )),
  external_event_id text,
  external_reference text,
  correlation_token uuid,
  correlation_id uuid references public.booking_correlations(id) on delete set null,
  booking_id uuid references public.bookings(id) on delete set null,
  trip_id uuid,
  conversion_type text not null default 'reservation' check (conversion_type in ('reservation','lead','commerce')),
  conversion_state text check (conversion_state is null or conversion_state in ('reported','pending','approved','rejected','cancelled')),
  commission_state text check (commission_state is null or commission_state in ('pending','matched','approved','paid','rejected','disputed')),
  gross_amount numeric check (gross_amount is null or gross_amount >= 0),
  gross_currency text check (gross_currency is null or char_length(gross_currency)=3),
  commission_amount numeric check (commission_amount is null or commission_amount >= 0),
  commission_currency text check (commission_currency is null or char_length(commission_currency)=3),
  event_verified boolean not null default false,
  verification_method text,
  processing_state text not null default 'received' check (processing_state in (
    'received','pending_verification','pending_partner_activation','pending_unmatched','resolved','ignored','failed'
  )),
  resolution_reason text,
  conversion_report_id uuid references public.booking_conversion_reports(id) on delete set null,
  reconciliation_id uuid references public.booking_commission_reconciliations(id) on delete set null,
  raw_payload jsonb not null default '{}'::jsonb check (jsonb_typeof(raw_payload)='object'),
  evidence jsonb not null default '{}'::jsonb check (jsonb_typeof(evidence)='object'),
  booking_status_before text,
  booking_status_after text,
  occurred_at timestamptz not null default now(),
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists booking_commercial_events_provider_event_uidx
  on public.booking_commercial_events(provider_id,source,external_event_id)
  where external_event_id is not null;
create index if not exists booking_commercial_events_correlation_idx
  on public.booking_commercial_events(correlation_id,occurred_at desc) where correlation_id is not null;
create index if not exists booking_commercial_events_booking_idx
  on public.booking_commercial_events(booking_id,occurred_at desc) where booking_id is not null;
create index if not exists booking_commercial_events_trip_idx
  on public.booking_commercial_events(trip_id,occurred_at desc) where trip_id is not null;
create index if not exists booking_commercial_events_pending_idx
  on public.booking_commercial_events(processing_state,received_at)
  where processing_state in ('pending_verification','pending_partner_activation','pending_unmatched','failed');

alter table public.booking_commercial_events enable row level security;
drop policy if exists booking_commercial_events_trip_member_select on public.booking_commercial_events;
create policy booking_commercial_events_trip_member_select on public.booking_commercial_events
for select to authenticated using (trip_id is not null and public.luvia_booking_is_trip_member(trip_id));
-- Raw partner payloads/evidence remain server-only. Authenticated clients receive only the narrow columns
-- needed by the security-invoker monetization runtime view.
revoke all on public.booking_commercial_events from public,anon,authenticated;
grant select(provider_id,event_kind,correlation_id,booking_id,trip_id,processing_state,occurred_at,received_at) on public.booking_commercial_events to authenticated;
grant select,insert,update,delete on public.booking_commercial_events to service_role;

-- Keep commercial-event linkage correct when a click-time correlation is linked to a Luvia booking later.
create or replace function public.luvia_booking_commercial_event_propagate_booking_link()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.booking_id is distinct from old.booking_id and new.booking_id is not null then
    update public.booking_commercial_events
       set booking_id=new.booking_id,trip_id=new.trip_id,updated_at=now()
     where correlation_id=new.id and booking_id is null;
  end if;
  return new;
end $$;
drop trigger if exists booking_correlations_commercial_event_link on public.booking_correlations;
create trigger booking_correlations_commercial_event_link
  after update of booking_id on public.booking_correlations
  for each row execute function public.luvia_booking_commercial_event_propagate_booking_link();

-- Internal processor. It is deliberately service-role only and can be replayed after verification,
-- partner activation or a previously missing correlation becomes available.
create or replace function public.luvia_booking_process_commercial_event(p_event_id uuid)
returns jsonb
language plpgsql security definer set search_path=public as $$
declare
  e public.booking_commercial_events;
  p public.booking_monetization_profiles;
  c public.booking_correlations;
  v_conversion_state text;
  v_commission_state text;
  v_conversion_result jsonb;
  v_reconciliation_result jsonb;
  v_conversion_id uuid;
  v_reconciliation_id uuid;
  v_before text;
  v_after text;
  v_internal_source boolean;
begin
  if coalesce(current_setting('request.jwt.claim.role',true),'') <> 'service_role' then raise exception 'SERVICE_ROLE_REQUIRED'; end if;
  select * into e from public.booking_commercial_events where id=p_event_id for update;
  if not found then raise exception 'COMMERCIAL_EVENT_NOT_FOUND'; end if;

  if e.processing_state='resolved' then
    return jsonb_build_object('resolved',true,'duplicateProcessing',true,'event',to_jsonb(e),'bookingStatusChanged',false);
  end if;

  v_internal_source:=e.source in ('provider_api','provider_polling','manual_reconciliation');
  if not e.event_verified and not v_internal_source then
    update public.booking_commercial_events
       set processing_state='pending_verification',resolution_reason='EVENT_VERIFICATION_REQUIRED',updated_at=now()
     where id=e.id returning * into e;
    return jsonb_build_object('resolved',false,'expectedState',true,'reason','EVENT_VERIFICATION_REQUIRED','event',to_jsonb(e),'bookingStatusChanged',false);
  end if;

  select * into p from public.booking_monetization_profiles where provider_id=e.provider_id;
  if not found or p.commercial_status='unavailable' or p.monetization_mode='none' then
    update public.booking_commercial_events
       set processing_state='ignored',resolution_reason='PROVIDER_NOT_MONETIZABLE',processed_at=now(),updated_at=now()
     where id=e.id returning * into e;
    return jsonb_build_object('resolved',false,'expectedState',true,'reason','PROVIDER_NOT_MONETIZABLE','event',to_jsonb(e),'bookingStatusChanged',false);
  end if;
  if p.commercial_status<>'active' then
    update public.booking_commercial_events
       set processing_state='pending_partner_activation',resolution_reason='COMMERCIAL_PARTNER_NOT_ACTIVE',updated_at=now()
     where id=e.id returning * into e;
    return jsonb_build_object('resolved',false,'expectedState',true,'reason','COMMERCIAL_PARTNER_NOT_ACTIVE','event',to_jsonb(e),'bookingStatusChanged',false);
  end if;

  if e.correlation_token is not null then
    select * into c from public.booking_correlations where correlation_token=e.correlation_token for update;
  elsif e.correlation_id is not null then
    select * into c from public.booking_correlations where id=e.correlation_id for update;
  elsif e.booking_id is not null then
    select * into c from public.booking_correlations
     where booking_id=e.booking_id and provider_id=e.provider_id
     order by created_at desc limit 1 for update;
  end if;

  if not found then
    update public.booking_commercial_events
       set processing_state='pending_unmatched',resolution_reason='CORRELATION_NOT_FOUND',updated_at=now()
     where id=e.id returning * into e;
    return jsonb_build_object('resolved',false,'expectedState',true,'reason','CORRELATION_NOT_FOUND','event',to_jsonb(e),'bookingStatusChanged',false);
  end if;
  if c.provider_id is not null and c.provider_id<>e.provider_id then
    update public.booking_commercial_events
       set processing_state='ignored',resolution_reason='CORRELATION_PROVIDER_MISMATCH',correlation_id=c.id,trip_id=c.trip_id,updated_at=now()
     where id=e.id returning * into e;
    return jsonb_build_object('resolved',false,'expectedState',false,'reason','CORRELATION_PROVIDER_MISMATCH','event',to_jsonb(e),'bookingStatusChanged',false);
  end if;
  if e.booking_id is not null and c.booking_id is not null and e.booking_id<>c.booking_id then
    update public.booking_commercial_events
       set processing_state='ignored',resolution_reason='CORRELATION_BOOKING_MISMATCH',correlation_id=c.id,trip_id=c.trip_id,updated_at=now()
     where id=e.id returning * into e;
    return jsonb_build_object('resolved',false,'expectedState',false,'reason','CORRELATION_BOOKING_MISMATCH','event',to_jsonb(e),'bookingStatusChanged',false);
  end if;

  if c.booking_id is null and e.booking_id is not null then
    perform public.luvia_booking_link_correlation(e.booking_id,c.correlation_token);
    select * into c from public.booking_correlations where id=c.id for update;
  end if;

  update public.booking_commercial_events
     set correlation_id=c.id,correlation_token=c.correlation_token,booking_id=coalesce(c.booking_id,e.booking_id),trip_id=c.trip_id,updated_at=now()
   where id=e.id returning * into e;

  if e.booking_id is not null then select status into v_before from public.bookings where id=e.booking_id; end if;

  v_conversion_state:=coalesce(e.conversion_state,
    case e.event_kind
      when 'conversion_pending' then 'pending'
      when 'conversion_approved' then 'approved'
      when 'conversion_rejected' then 'rejected'
      when 'conversion_cancelled' then 'cancelled'
      else 'reported'
    end
  );
  v_commission_state:=coalesce(e.commission_state,
    case e.event_kind
      when 'commission_pending' then 'pending'
      when 'commission_approved' then 'approved'
      when 'commission_paid' then 'paid'
      when 'commission_rejected' then 'rejected'
      when 'commission_disputed' then 'disputed'
      else null
    end
  );

  v_conversion_result:=public.luvia_booking_report_conversion(
    c.correlation_token,e.provider_id,e.source,e.conversion_type,v_conversion_state,e.external_event_id,e.external_reference,
    e.gross_amount,e.gross_currency,e.commission_amount,e.commission_currency,
    e.evidence||jsonb_build_object('commercialEventId',e.id,'eventKind',e.event_kind,'eventVerified',e.event_verified,'commercialCore','4.70.0'),e.occurred_at
  );
  begin v_conversion_id:=((v_conversion_result->'conversion'->>'id'))::uuid; exception when others then v_conversion_id:=null; end;

  if v_commission_state is not null and v_conversion_id is not null then
    v_reconciliation_result:=public.luvia_booking_reconcile_conversion_report(
      v_conversion_id,null,v_commission_state,e.commission_amount,e.commission_currency,e.external_reference,
      coalesce(e.external_event_id,e.id::text),e.source,
      e.evidence||jsonb_build_object('commercialEventId',e.id,'eventKind',e.event_kind,'commercialCore','4.70.0'),e.occurred_at
    );
    begin v_reconciliation_id:=((v_reconciliation_result->'reconciliation'->>'id'))::uuid; exception when others then v_reconciliation_id:=null; end;
  end if;

  if e.booking_id is not null then select status into v_after from public.bookings where id=e.booking_id; end if;
  if v_before is distinct from v_after then raise exception 'COMMERCIAL_EVENT_MUTATED_BOOKING_STATUS'; end if;

  update public.booking_commercial_events
     set processing_state='resolved',resolution_reason='COMMERCIAL_EVENT_RESOLVED',conversion_state=v_conversion_state,
         commission_state=v_commission_state,conversion_report_id=v_conversion_id,reconciliation_id=v_reconciliation_id,
         event_verified=(event_verified or v_internal_source),
         verification_method=coalesce(verification_method,case when v_internal_source then 'trusted_service_role_source' else null end),
         booking_status_before=v_before,booking_status_after=v_after,processed_at=now(),updated_at=now()
   where id=e.id returning * into e;

  return jsonb_build_object(
    'resolved',true,'expectedState',false,'event',to_jsonb(e),'conversion',v_conversion_result,'reconciliation',v_reconciliation_result,
    'bookingStatusBefore',v_before,'bookingStatusAfter',v_after,'bookingStatusChanged',false,'reservationConfirmed',false
  );
exception when others then
  if sqlerrm in ('SERVICE_ROLE_REQUIRED','COMMERCIAL_EVENT_NOT_FOUND','COMMERCIAL_EVENT_MUTATED_BOOKING_STATUS') then raise; end if;
  update public.booking_commercial_events set processing_state='failed',resolution_reason=left(sqlerrm,500),updated_at=now() where id=p_event_id;
  return jsonb_build_object('resolved',false,'expectedState',false,'reason','COMMERCIAL_EVENT_PROCESSING_FAILED','detail',sqlerrm,'bookingStatusChanged',false);
end $$;
revoke all on function public.luvia_booking_process_commercial_event(uuid) from public,anon,authenticated;
grant execute on function public.luvia_booking_process_commercial_event(uuid) to service_role;

-- Canonical v13.70 ingestion entrypoint. Provider-specific webhook/API adapters verify authenticity first,
-- then submit their normalized commercial event here. Duplicate provider events are idempotent.
create or replace function public.luvia_booking_ingest_commercial_event(
  p_provider_id text,
  p_source text,
  p_event_kind text,
  p_external_event_id text default null,
  p_external_reference text default null,
  p_correlation_token uuid default null,
  p_booking_id uuid default null,
  p_conversion_type text default 'reservation',
  p_conversion_state text default null,
  p_commission_state text default null,
  p_gross_amount numeric default null,
  p_gross_currency text default null,
  p_commission_amount numeric default null,
  p_commission_currency text default null,
  p_event_verified boolean default false,
  p_verification_method text default null,
  p_raw_payload jsonb default '{}'::jsonb,
  p_evidence jsonb default '{}'::jsonb,
  p_occurred_at timestamptz default null
) returns jsonb
language plpgsql security definer set search_path=public as $$
declare
  e public.booking_commercial_events;
  existing public.booking_commercial_events;
  v_provider text:=lower(trim(coalesce(p_provider_id,'')));
  v_source text:=lower(trim(coalesce(p_source,'')));
  v_kind text:=lower(trim(coalesce(p_event_kind,'')));
  v_type text:=lower(trim(coalesce(p_conversion_type,'reservation')));
  v_conversion_state text:=nullif(lower(trim(coalesce(p_conversion_state,''))), '');
  v_commission_state text:=nullif(lower(trim(coalesce(p_commission_state,''))), '');
  v_external_event text:=nullif(trim(coalesce(p_external_event_id,'')),'');
begin
  if coalesce(current_setting('request.jwt.claim.role',true),'') <> 'service_role' then raise exception 'SERVICE_ROLE_REQUIRED'; end if;
  if v_provider='' then raise exception 'PROVIDER_REQUIRED'; end if;
  if v_source not in ('provider_callback','affiliate_callback','provider_api','provider_polling','manual_reconciliation') then raise exception 'COMMERCIAL_SOURCE_INVALID'; end if;
  if v_kind not in ('conversion_reported','conversion_pending','conversion_approved','conversion_rejected','conversion_cancelled','commission_pending','commission_approved','commission_paid','commission_rejected','commission_disputed') then raise exception 'COMMERCIAL_EVENT_KIND_INVALID'; end if;
  if v_type not in ('reservation','lead','commerce') then raise exception 'CONVERSION_TYPE_INVALID'; end if;
  if v_conversion_state is not null and v_conversion_state not in ('reported','pending','approved','rejected','cancelled') then raise exception 'CONVERSION_STATE_INVALID'; end if;
  if v_commission_state is not null and v_commission_state not in ('pending','matched','approved','paid','rejected','disputed') then raise exception 'COMMISSION_STATE_INVALID'; end if;
  if p_gross_currency is not null and char_length(trim(p_gross_currency))<>3 then raise exception 'GROSS_CURRENCY_INVALID'; end if;
  if p_commission_currency is not null and char_length(trim(p_commission_currency))<>3 then raise exception 'COMMISSION_CURRENCY_INVALID'; end if;

  if v_external_event is not null then
    select * into existing from public.booking_commercial_events
     where provider_id=v_provider and source=v_source and external_event_id=v_external_event limit 1;
    if found then
      return jsonb_build_object('duplicate',true,'event',to_jsonb(existing),'bookingStatusChanged',false,'reservationConfirmed',false);
    end if;
  end if;

  insert into public.booking_commercial_events(
    provider_id,source,event_kind,external_event_id,external_reference,correlation_token,booking_id,conversion_type,conversion_state,commission_state,
    gross_amount,gross_currency,commission_amount,commission_currency,event_verified,verification_method,raw_payload,evidence,occurred_at
  ) values(
    v_provider,v_source,v_kind,v_external_event,nullif(trim(coalesce(p_external_reference,'')),''),p_correlation_token,p_booking_id,v_type,v_conversion_state,v_commission_state,
    p_gross_amount,upper(nullif(trim(coalesce(p_gross_currency,'')),'')),p_commission_amount,upper(nullif(trim(coalesce(p_commission_currency,'')),'')),
    coalesce(p_event_verified,false),nullif(trim(coalesce(p_verification_method,'')),''),coalesce(p_raw_payload,'{}'::jsonb),
    coalesce(p_evidence,'{}'::jsonb)||jsonb_build_object('ingestedByCore','4.70.0'),coalesce(p_occurred_at,now())
  ) on conflict do nothing returning * into e;

  -- Race-safe retry idempotency: a concurrent delivery may have inserted the same provider event
  -- after the optimistic lookup above but before this insert.
  if not found then
    if v_external_event is not null then
      select * into existing from public.booking_commercial_events
       where provider_id=v_provider and source=v_source and external_event_id=v_external_event limit 1;
      if found then return jsonb_build_object('duplicate',true,'event',to_jsonb(existing),'bookingStatusChanged',false,'reservationConfirmed',false); end if;
    end if;
    raise exception 'COMMERCIAL_EVENT_INSERT_CONFLICT';
  end if;

  return jsonb_build_object('duplicate',false,'ingestion',public.luvia_booking_process_commercial_event(e.id),'bookingStatusChanged',false,'reservationConfirmed',false);
end $$;
revoke all on function public.luvia_booking_ingest_commercial_event(text,text,text,text,text,uuid,uuid,text,text,text,numeric,text,numeric,text,boolean,text,jsonb,jsonb,timestamptz) from public,anon,authenticated;
grant execute on function public.luvia_booking_ingest_commercial_event(text,text,text,text,text,uuid,uuid,text,text,text,numeric,text,numeric,text,boolean,text,jsonb,jsonb,timestamptz) to service_role;

-- Verification/replay path for callbacks whose authenticity could not be established at first receipt.
create or replace function public.luvia_booking_verify_and_replay_commercial_event(
  p_event_id uuid,
  p_verification_method text,
  p_evidence jsonb default '{}'::jsonb,
  p_correlation_token uuid default null,
  p_booking_id uuid default null
) returns jsonb
language plpgsql security definer set search_path=public as $$
declare e public.booking_commercial_events;
begin
  if coalesce(current_setting('request.jwt.claim.role',true),'') <> 'service_role' then raise exception 'SERVICE_ROLE_REQUIRED'; end if;
  update public.booking_commercial_events
     set event_verified=true,verification_method=coalesce(nullif(trim(coalesce(p_verification_method,'')),''),'verified_by_adapter'),
         correlation_token=coalesce(p_correlation_token,correlation_token),booking_id=coalesce(p_booking_id,booking_id),
         evidence=evidence||coalesce(p_evidence,'{}'::jsonb)||jsonb_build_object('replayedByCore','4.70.0'),
         processing_state='received',resolution_reason=null,updated_at=now()
   where id=p_event_id returning * into e;
  if not found then raise exception 'COMMERCIAL_EVENT_NOT_FOUND'; end if;
  return public.luvia_booking_process_commercial_event(e.id);
end $$;
revoke all on function public.luvia_booking_verify_and_replay_commercial_event(uuid,text,jsonb,uuid,uuid) from public,anon,authenticated;
grant execute on function public.luvia_booking_verify_and_replay_commercial_event(uuid,text,jsonb,uuid,uuid) to service_role;

-- Extend the existing monetization read model with commercial-ingestion health, without exposing raw partner payloads.
create or replace view public.booking_monetization_runtime_v1 with (security_invoker=true) as
select
  c.id as correlation_id,c.correlation_token,c.trip_id,c.booking_id,c.handoff_event_id,c.provider_id,c.provider_place_id,c.venue_name,
  c.state as correlation_state,c.created_at,c.linked_at,c.converted_at,c.expires_at,
  coalesce(p.commercial_status, nullif(c.metadata->'monetization'->>'commercialStatus',''), 'unavailable') as commercial_status,
  coalesce(p.monetization_mode, nullif(c.metadata->'monetization'->>'monetizationMode',''), 'none') as monetization_mode,
  coalesce(p.tracking_strategy, nullif(c.metadata->'monetization'->>'trackingStrategy',''), 'none') as tracking_strategy,
  coalesce(p.attribution_model, nullif(c.metadata->'monetization'->>'attributionModel',''), 'manual') as attribution_model,
  b.status as booking_status,b.status_source,
  (select count(*) from public.booking_conversion_reports r where r.correlation_id=c.id) as conversion_count,
  (select count(*) from public.booking_commission_reconciliations x where x.correlation_id=c.id) as reconciliation_count,
  (select r.conversion_state from public.booking_conversion_reports r where r.correlation_id=c.id order by r.occurred_at desc,r.received_at desc limit 1) as latest_conversion_state,
  (select x.state from public.booking_commission_reconciliations x where x.correlation_id=c.id order by x.occurred_at desc,x.created_at desc limit 1) as latest_commission_state,
  (select coalesce(x.settled_amount,x.reported_amount,x.expected_amount) from public.booking_commission_reconciliations x where x.correlation_id=c.id order by x.occurred_at desc,x.created_at desc limit 1) as latest_commission_amount,
  (select coalesce(x.settled_currency,x.reported_currency,x.expected_currency) from public.booking_commission_reconciliations x where x.correlation_id=c.id order by x.occurred_at desc,x.created_at desc limit 1) as latest_commission_currency,
  (select count(*) from public.booking_commercial_events e where e.correlation_id=c.id) as commercial_event_count,
  (select count(*) from public.booking_commercial_events e where e.correlation_id=c.id and e.processing_state in ('pending_verification','pending_partner_activation','pending_unmatched','failed')) as pending_commercial_event_count,
  (select e.event_kind from public.booking_commercial_events e where e.correlation_id=c.id order by e.occurred_at desc,e.received_at desc limit 1) as latest_commercial_event_kind,
  (select e.processing_state from public.booking_commercial_events e where e.correlation_id=c.id order by e.occurred_at desc,e.received_at desc limit 1) as latest_commercial_processing_state,
  false as booking_status_changed_by_commercial
from public.booking_correlations c
left join public.booking_monetization_profiles p on p.provider_id=c.provider_id
left join public.bookings b on b.id=c.booking_id;
grant select on public.booking_monetization_runtime_v1 to authenticated,service_role;

-- Server diagnostics view: sanitized commercial-event lifecycle, no raw payload/evidence.
create or replace view public.booking_commercial_event_runtime_v1 as
select
  e.id as commercial_event_id,e.provider_id,e.source,e.event_kind,e.external_event_id,e.external_reference,
  e.correlation_token,e.correlation_id,e.booking_id,e.trip_id,e.event_verified,e.verification_method,
  e.processing_state,e.resolution_reason,e.conversion_type,e.conversion_state,e.commission_state,
  e.gross_amount,e.gross_currency,e.commission_amount,e.commission_currency,e.conversion_report_id,e.reconciliation_id,
  e.booking_status_before,e.booking_status_after,false as booking_status_changed_by_commercial,
  e.occurred_at,e.received_at,e.processed_at,e.created_at,e.updated_at
from public.booking_commercial_events e;
revoke all on public.booking_commercial_event_runtime_v1 from public,anon,authenticated;
grant select on public.booking_commercial_event_runtime_v1 to service_role;

comment on table public.booking_commercial_events is 'v13.70 raw commercial event inbox. Server-only evidence with idempotent provider event identity and replayable resolution states.';
comment on function public.luvia_booking_ingest_commercial_event(text,text,text,text,text,uuid,uuid,text,text,text,numeric,text,numeric,text,boolean,text,jsonb,jsonb,timestamptz) is 'v13.70 canonical provider-neutral commercial event intake. Requires service role; callback evidence must be verified before it can become conversion/commission evidence.';
comment on function public.luvia_booking_process_commercial_event(uuid) is 'v13.70 conversion processor. Fails closed for inactive/non-commercial providers and never mutates bookings.status.';
comment on function public.luvia_booking_verify_and_replay_commercial_event(uuid,text,jsonb,uuid,uuid) is 'v13.70 verification/replay bridge for pending callback events and late correlation resolution.';
comment on view public.booking_monetization_runtime_v1 is 'v13.70 unified monetization runtime with commercial event processing health; commercial facts remain non-confirming.';

commit;
