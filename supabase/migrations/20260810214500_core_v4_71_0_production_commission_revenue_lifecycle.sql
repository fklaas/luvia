-- Luvia v13.71.0 / Core 4.71.0
-- Production Commission / Revenue Lifecycle Foundation
-- Commission events attach to an existing conversion and advance a guarded, auditable lifecycle.
-- Commercial truth remains strictly separated from reservation truth.
begin;

create table if not exists public.booking_commission_state_events (
  id uuid primary key default gen_random_uuid(),
  reconciliation_id uuid not null references public.booking_commission_reconciliations(id) on delete cascade,
  conversion_report_id uuid not null references public.booking_conversion_reports(id) on delete cascade,
  correlation_id uuid references public.booking_correlations(id) on delete set null,
  booking_id uuid references public.bookings(id) on delete set null,
  trip_id uuid not null,
  provider_id text not null,
  source text not null check (source in ('provider_callback','affiliate_callback','provider_api','provider_polling','manual_reconciliation')),
  external_event_id text,
  from_state text check (from_state is null or from_state in ('pending','matched','approved','paid','rejected','disputed')),
  to_state text not null check (to_state in ('pending','matched','approved','paid','rejected','disputed')),
  amount numeric check (amount is null or amount >= 0),
  currency text check (currency is null or char_length(currency)=3),
  statement_reference text,
  evidence jsonb not null default '{}'::jsonb check (jsonb_typeof(evidence)='object'),
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create unique index if not exists booking_commission_state_events_external_uidx
  on public.booking_commission_state_events(provider_id,source,external_event_id)
  where external_event_id is not null;
create index if not exists booking_commission_state_events_reconciliation_idx
  on public.booking_commission_state_events(reconciliation_id,occurred_at desc,created_at desc);
create index if not exists booking_commission_state_events_conversion_idx
  on public.booking_commission_state_events(conversion_report_id,occurred_at desc,created_at desc);
create index if not exists booking_commission_state_events_trip_idx
  on public.booking_commission_state_events(trip_id,occurred_at desc,created_at desc);

alter table public.booking_commission_state_events enable row level security;
drop policy if exists booking_commission_state_events_trip_member_select on public.booking_commission_state_events;
create policy booking_commission_state_events_trip_member_select on public.booking_commission_state_events
for select to authenticated using (public.luvia_booking_is_trip_member(trip_id));
grant select on public.booking_commission_state_events to authenticated;
grant select,insert,update,delete on public.booking_commission_state_events to service_role;

create or replace function public.luvia_booking_commission_transition_allowed(p_from text,p_to text)
returns boolean language sql immutable as $$
  select case
    when p_to not in ('pending','matched','approved','paid','rejected','disputed') then false
    when p_from is null then true
    when p_from=p_to then true
    when p_from='pending' then p_to in ('matched','approved','paid','rejected','disputed')
    when p_from='matched' then p_to in ('approved','paid','rejected','disputed')
    when p_from='approved' then p_to in ('paid','rejected','disputed')
    when p_from='paid' then p_to='disputed'
    when p_from='disputed' then p_to in ('approved','paid','rejected')
    when p_from='rejected' then p_to='disputed'
    else false
  end
$$;

create or replace function public.luvia_booking_apply_commission_lifecycle(
  p_conversion_report_id uuid,
  p_commission_state text,
  p_commission_amount numeric default null,
  p_commission_currency text default null,
  p_statement_reference text default null,
  p_reconciliation_key text default null,
  p_source text default 'manual_reconciliation',
  p_external_event_id text default null,
  p_evidence jsonb default '{}'::jsonb,
  p_occurred_at timestamptz default null
) returns jsonb
language plpgsql security definer set search_path=public as $$
declare
  r public.booking_conversion_reports;
  c public.booking_commission_reconciliations;
  before_state text;
  v_state text:=lower(trim(coalesce(p_commission_state,'')));
  v_source text:=lower(trim(coalesce(p_source,'manual_reconciliation')));
  v_currency text:=upper(nullif(trim(coalesce(p_commission_currency,'')),''));
  v_statement text:=nullif(trim(coalesce(p_statement_reference,'')),'');
  v_external_event text:=nullif(trim(coalesce(p_external_event_id,'')),'');
  v_key text;
  v_time timestamptz:=coalesce(p_occurred_at,now());
  v_event public.booking_commission_state_events;
  v_duplicate public.booking_commission_state_events;
begin
  if coalesce(current_setting('request.jwt.claim.role',true),'') <> 'service_role' then raise exception 'SERVICE_ROLE_REQUIRED'; end if;
  if v_state not in ('pending','matched','approved','paid','rejected','disputed') then raise exception 'COMMISSION_STATE_INVALID'; end if;
  if v_source not in ('provider_callback','affiliate_callback','provider_api','provider_polling','manual_reconciliation') then raise exception 'RECONCILIATION_SOURCE_INVALID'; end if;
  if p_commission_amount is not null and p_commission_amount<0 then raise exception 'COMMISSION_AMOUNT_INVALID'; end if;
  if v_currency is not null and char_length(v_currency)<>3 then raise exception 'COMMISSION_CURRENCY_INVALID'; end if;

  if v_external_event is not null then
    select * into v_duplicate from public.booking_commission_state_events
      where provider_id=(select provider_id from public.booking_conversion_reports where id=p_conversion_report_id)
        and source=v_source and external_event_id=v_external_event limit 1;
    if found then
      select * into c from public.booking_commission_reconciliations where id=v_duplicate.reconciliation_id;
      return jsonb_build_object('duplicate',true,'transitioned',false,'reconciliation',to_jsonb(c),'stateEvent',to_jsonb(v_duplicate),'bookingStatusChanged',false,'reservationConfirmed',false);
    end if;
  end if;

  select * into r from public.booking_conversion_reports where id=p_conversion_report_id for update;
  if not found then raise exception 'CONVERSION_REPORT_NOT_FOUND'; end if;

  v_key:=coalesce(nullif(trim(coalesce(p_reconciliation_key,'')),''),v_statement,r.external_reference,'conversion:'||r.id::text);
  select * into c from public.booking_commission_reconciliations
    where provider_id=r.provider_id and reconciliation_key=v_key for update;

  if found then
    before_state:=c.state;
    if not public.luvia_booking_commission_transition_allowed(before_state,v_state) then
      raise exception 'COMMISSION_TRANSITION_INVALID:%->%',before_state,v_state;
    end if;
    if before_state='paid' and v_state='paid' and p_commission_amount is not null and c.settled_amount is not null and p_commission_amount<>c.settled_amount then
      raise exception 'COMMISSION_PAID_AMOUNT_CONFLICT';
    end if;
    update public.booking_commission_reconciliations set
      state=v_state,
      reported_amount=coalesce(p_commission_amount,reported_amount),
      reported_currency=coalesce(v_currency,reported_currency),
      settled_amount=case when v_state='paid' then coalesce(p_commission_amount,settled_amount,reported_amount,expected_amount) when before_state='paid' and v_state='disputed' then settled_amount else null end,
      settled_currency=case when v_state='paid' then coalesce(v_currency,settled_currency,reported_currency,expected_currency) when before_state='paid' and v_state='disputed' then settled_currency else null end,
      statement_reference=coalesce(v_statement,statement_reference),
      source=v_source,
      evidence=evidence||coalesce(p_evidence,'{}'::jsonb)||jsonb_build_object('commissionCore','4.71.0'),
      occurred_at=v_time,
      reconciled_at=case when v_state in ('matched','approved','paid','rejected') then coalesce(reconciled_at,v_time) else reconciled_at end,
      paid_at=case when v_state='paid' then coalesce(paid_at,v_time) else paid_at end,
      updated_at=now()
    where id=c.id returning * into c;
  else
    before_state:=null;
    insert into public.booking_commission_reconciliations(
      conversion_report_id,correlation_id,booking_id,trip_id,provider_id,reconciliation_key,state,
      expected_amount,expected_currency,reported_amount,reported_currency,settled_amount,settled_currency,
      statement_reference,source,evidence,occurred_at,reconciled_at,paid_at
    ) values(
      r.id,r.correlation_id,r.booking_id,r.trip_id,r.provider_id,v_key,v_state,
      r.commission_amount,r.commission_currency,p_commission_amount,v_currency,
      case when v_state='paid' then coalesce(p_commission_amount,r.commission_amount) else null end,
      case when v_state='paid' then coalesce(v_currency,r.commission_currency) else null end,
      v_statement,v_source,coalesce(p_evidence,'{}'::jsonb)||jsonb_build_object('commissionCore','4.71.0'),v_time,
      case when v_state in ('matched','approved','paid','rejected') then v_time else null end,
      case when v_state='paid' then v_time else null end
    ) returning * into c;
  end if;

  if before_state is distinct from v_state then
    insert into public.booking_commission_state_events(
      reconciliation_id,conversion_report_id,correlation_id,booking_id,trip_id,provider_id,source,external_event_id,
      from_state,to_state,amount,currency,statement_reference,evidence,occurred_at
    ) values(
      c.id,r.id,r.correlation_id,r.booking_id,r.trip_id,r.provider_id,v_source,v_external_event,
      before_state,v_state,p_commission_amount,v_currency,v_statement,
      coalesce(p_evidence,'{}'::jsonb)||jsonb_build_object('commissionCore','4.71.0','bookingStatusChanged',false),v_time
    ) on conflict(provider_id,source,external_event_id) where external_event_id is not null do nothing
    returning * into v_event;
  end if;

  if v_state='paid' and not exists(
    select 1 from public.booking_attribution_events_v2
    where conversion_report_id=r.id and event_type='commission_paid' and metadata->>'reconciliationId'=c.id::text
  ) then
    insert into public.booking_attribution_events_v2(booking_id,trip_id,provider_id,correlation_id,conversion_report_id,event_type,external_reference,metadata,occurred_at)
    values(r.booking_id,r.trip_id,r.provider_id,r.correlation_id,r.id,'commission_paid',coalesce(c.statement_reference,r.external_reference),
      jsonb_build_object('reconciliationId',c.id,'amount',c.settled_amount,'currency',c.settled_currency,'bookingStatusChanged',false,'commercialCore','4.71.0'),v_time);
  end if;

  return jsonb_build_object(
    'duplicate',false,'transitioned',before_state is distinct from v_state,'fromState',before_state,'toState',v_state,
    'reconciliation',to_jsonb(c),'stateEvent',to_jsonb(v_event),'bookingStatusChanged',false,'reservationConfirmed',false
  );
end $$;
revoke all on function public.luvia_booking_apply_commission_lifecycle(uuid,text,numeric,text,text,text,text,text,jsonb,timestamptz) from public,anon,authenticated;
grant execute on function public.luvia_booking_apply_commission_lifecycle(uuid,text,numeric,text,text,text,text,text,jsonb,timestamptz) to service_role;

-- v13.71.0 processor: conversion events create/update conversion evidence; commission events MUST attach to an existing conversion.
create or replace function public.luvia_booking_process_commercial_event(p_event_id uuid)
returns jsonb
language plpgsql security definer set search_path=public as $$
declare
  e public.booking_commercial_events;
  p public.booking_monetization_profiles;
  c public.booking_correlations;
  r public.booking_conversion_reports;
  v_conversion_state text;
  v_commission_state text;
  v_conversion_result jsonb;
  v_reconciliation_result jsonb;
  v_conversion_id uuid;
  v_reconciliation_id uuid;
  v_before text;
  v_after text;
  v_internal_source boolean;
  v_is_commission_event boolean;
  v_conversion_count integer:=0;
  v_hint_conversion uuid;
begin
  if coalesce(current_setting('request.jwt.claim.role',true),'') <> 'service_role' then raise exception 'SERVICE_ROLE_REQUIRED'; end if;
  select * into e from public.booking_commercial_events where id=p_event_id for update;
  if not found then raise exception 'COMMERCIAL_EVENT_NOT_FOUND'; end if;

  if e.processing_state='resolved' then
    return jsonb_build_object('resolved',true,'duplicateProcessing',true,'event',to_jsonb(e),'bookingStatusChanged',false,'reservationConfirmed',false);
  end if;

  v_internal_source:=e.source in ('provider_api','provider_polling','manual_reconciliation');
  if not e.event_verified and not v_internal_source then
    update public.booking_commercial_events set processing_state='pending_verification',resolution_reason='EVENT_VERIFICATION_REQUIRED',updated_at=now()
    where id=e.id returning * into e;
    return jsonb_build_object('resolved',false,'expectedState',true,'reason','EVENT_VERIFICATION_REQUIRED','event',to_jsonb(e),'bookingStatusChanged',false,'reservationConfirmed',false);
  end if;

  if e.correlation_token is not null then
    select * into c from public.booking_correlations where correlation_token=e.correlation_token for update;
  elsif e.correlation_id is not null then
    select * into c from public.booking_correlations where id=e.correlation_id for update;
  elsif e.booking_id is not null then
    select * into c from public.booking_correlations where booking_id=e.booking_id and provider_id=e.provider_id order by created_at desc limit 1 for update;
  else c:=null; end if;

  if c.id is null then
    update public.booking_commercial_events set processing_state='pending_unmatched',resolution_reason='CORRELATION_NOT_FOUND',updated_at=now()
    where id=e.id returning * into e;
    return jsonb_build_object('resolved',false,'expectedState',true,'reason','CORRELATION_NOT_FOUND','event',to_jsonb(e),'bookingStatusChanged',false,'reservationConfirmed',false);
  end if;
  if c.provider_id is not null and c.provider_id<>e.provider_id then
    update public.booking_commercial_events set processing_state='ignored',resolution_reason='CORRELATION_PROVIDER_MISMATCH',correlation_id=c.id,correlation_token=c.correlation_token,trip_id=c.trip_id,updated_at=now()
    where id=e.id returning * into e;
    return jsonb_build_object('resolved',false,'expectedState',false,'reason','CORRELATION_PROVIDER_MISMATCH','event',to_jsonb(e),'bookingStatusChanged',false,'reservationConfirmed',false);
  end if;
  if e.booking_id is not null and c.booking_id is not null and e.booking_id<>c.booking_id then
    update public.booking_commercial_events set processing_state='ignored',resolution_reason='CORRELATION_BOOKING_MISMATCH',correlation_id=c.id,correlation_token=c.correlation_token,trip_id=c.trip_id,updated_at=now()
    where id=e.id returning * into e;
    return jsonb_build_object('resolved',false,'expectedState',false,'reason','CORRELATION_BOOKING_MISMATCH','event',to_jsonb(e),'bookingStatusChanged',false,'reservationConfirmed',false);
  end if;
  if c.booking_id is null and e.booking_id is not null then
    perform public.luvia_booking_link_correlation(e.booking_id,c.correlation_token);
    select * into c from public.booking_correlations where id=c.id for update;
  end if;

  update public.booking_commercial_events
  set correlation_id=c.id,correlation_token=c.correlation_token,booking_id=coalesce(c.booking_id,e.booking_id),trip_id=c.trip_id,
      evidence=evidence||jsonb_build_object('correlationResolvedByCore','4.71.0'),updated_at=now()
  where id=e.id returning * into e;

  select * into p from public.booking_monetization_profiles where provider_id=e.provider_id;
  if not found or p.commercial_status='unavailable' or p.monetization_mode='none' then
    update public.booking_commercial_events set processing_state='ignored',resolution_reason='PROVIDER_NOT_MONETIZABLE',processed_at=now(),updated_at=now()
    where id=e.id returning * into e;
    return jsonb_build_object('resolved',false,'expectedState',true,'reason','PROVIDER_NOT_MONETIZABLE','event',to_jsonb(e),'bookingStatusChanged',false,'reservationConfirmed',false);
  end if;
  if p.commercial_status<>'active' then
    update public.booking_commercial_events set processing_state='pending_partner_activation',resolution_reason='COMMERCIAL_PARTNER_NOT_ACTIVE',updated_at=now()
    where id=e.id returning * into e;
    return jsonb_build_object('resolved',false,'expectedState',true,'reason','COMMERCIAL_PARTNER_NOT_ACTIVE','event',to_jsonb(e),'bookingStatusChanged',false,'reservationConfirmed',false);
  end if;

  if e.booking_id is not null then select status into v_before from public.bookings where id=e.booking_id; end if;
  v_is_commission_event:=e.event_kind like 'commission_%';

  if v_is_commission_event then
    v_commission_state:=coalesce(e.commission_state,case e.event_kind
      when 'commission_pending' then 'pending' when 'commission_approved' then 'approved' when 'commission_paid' then 'paid'
      when 'commission_rejected' then 'rejected' when 'commission_disputed' then 'disputed' else null end);

    begin v_hint_conversion:=(e.evidence->>'conversionReportId')::uuid; exception when others then v_hint_conversion:=null; end;
    if e.conversion_report_id is not null then v_hint_conversion:=e.conversion_report_id; end if;

    if v_hint_conversion is not null then
      select * into r from public.booking_conversion_reports where id=v_hint_conversion and correlation_id=c.id and provider_id=e.provider_id;
      if not found then
        update public.booking_commercial_events set processing_state='pending_unmatched',resolution_reason='COMMISSION_CONVERSION_HINT_INVALID',updated_at=now() where id=e.id returning * into e;
        return jsonb_build_object('resolved',false,'expectedState',true,'reason','COMMISSION_CONVERSION_HINT_INVALID','event',to_jsonb(e),'bookingStatusChanged',false,'reservationConfirmed',false);
      end if;
    elsif e.external_reference is not null then
      select count(*) into v_conversion_count from public.booking_conversion_reports where correlation_id=c.id and provider_id=e.provider_id and external_reference=e.external_reference;
      if v_conversion_count=1 then select * into r from public.booking_conversion_reports where correlation_id=c.id and provider_id=e.provider_id and external_reference=e.external_reference limit 1; end if;
    end if;

    if r.id is null then
      select count(*) into v_conversion_count from public.booking_conversion_reports where correlation_id=c.id and provider_id=e.provider_id;
      if v_conversion_count=1 then select * into r from public.booking_conversion_reports where correlation_id=c.id and provider_id=e.provider_id limit 1; end if;
    end if;

    if r.id is null then
      update public.booking_commercial_events set processing_state='pending_unmatched',
        resolution_reason=case when v_conversion_count>1 then 'COMMISSION_CONVERSION_AMBIGUOUS' else 'COMMISSION_CONVERSION_NOT_FOUND' end,updated_at=now()
      where id=e.id returning * into e;
      return jsonb_build_object('resolved',false,'expectedState',true,'reason',e.resolution_reason,'event',to_jsonb(e),'bookingStatusChanged',false,'reservationConfirmed',false);
    end if;

    v_conversion_id:=r.id;
    v_reconciliation_result:=public.luvia_booking_apply_commission_lifecycle(
      r.id,v_commission_state,e.commission_amount,e.commission_currency,e.external_reference,null,e.source,e.external_event_id,
      e.evidence||jsonb_build_object('commercialEventId',e.id,'eventKind',e.event_kind,'commercialCore','4.71.0'),e.occurred_at
    );
    begin v_reconciliation_id:=((v_reconciliation_result->'reconciliation'->>'id'))::uuid; exception when others then v_reconciliation_id:=null; end;
  else
    v_conversion_state:=coalesce(e.conversion_state,case e.event_kind
      when 'conversion_pending' then 'pending' when 'conversion_approved' then 'approved' when 'conversion_rejected' then 'rejected'
      when 'conversion_cancelled' then 'cancelled' else 'reported' end);
    v_conversion_result:=public.luvia_booking_report_conversion(
      c.correlation_token,e.provider_id,e.source,e.conversion_type,v_conversion_state,e.external_event_id,e.external_reference,
      e.gross_amount,e.gross_currency,e.commission_amount,e.commission_currency,
      e.evidence||jsonb_build_object('commercialEventId',e.id,'eventKind',e.event_kind,'eventVerified',e.event_verified,'commercialCore','4.71.0'),e.occurred_at
    );
    begin v_conversion_id:=((v_conversion_result->'conversion'->>'id'))::uuid; exception when others then v_conversion_id:=null; end;
    v_commission_state:=e.commission_state;
    if v_commission_state is not null and v_conversion_id is not null then
      v_reconciliation_result:=public.luvia_booking_apply_commission_lifecycle(
        v_conversion_id,v_commission_state,e.commission_amount,e.commission_currency,e.external_reference,null,e.source,e.external_event_id,
        e.evidence||jsonb_build_object('commercialEventId',e.id,'eventKind',e.event_kind,'commercialCore','4.71.0'),e.occurred_at
      );
      begin v_reconciliation_id:=((v_reconciliation_result->'reconciliation'->>'id'))::uuid; exception when others then v_reconciliation_id:=null; end;
    end if;
  end if;

  if e.booking_id is not null then select status into v_after from public.bookings where id=e.booking_id; end if;
  if v_before is distinct from v_after then raise exception 'COMMERCIAL_EVENT_MUTATED_BOOKING_STATUS'; end if;

  update public.booking_commercial_events set
    processing_state='resolved',resolution_reason='COMMERCIAL_EVENT_RESOLVED',conversion_state=coalesce(v_conversion_state,conversion_state),
    commission_state=coalesce(v_commission_state,commission_state),conversion_report_id=v_conversion_id,reconciliation_id=v_reconciliation_id,
    event_verified=(event_verified or v_internal_source),verification_method=coalesce(verification_method,case when v_internal_source then 'trusted_service_role_source' else null end),
    booking_status_before=v_before,booking_status_after=v_after,processed_at=now(),updated_at=now(),
    evidence=evidence||jsonb_build_object('processedByCommercialCore','4.71.0')
  where id=e.id returning * into e;

  return jsonb_build_object('resolved',true,'expectedState',false,'event',to_jsonb(e),'conversion',v_conversion_result,'reconciliation',v_reconciliation_result,
    'bookingStatusBefore',v_before,'bookingStatusAfter',v_after,'bookingStatusChanged',false,'reservationConfirmed',false);
exception when others then
  if sqlerrm in ('SERVICE_ROLE_REQUIRED','COMMERCIAL_EVENT_NOT_FOUND','COMMERCIAL_EVENT_MUTATED_BOOKING_STATUS') or sqlerrm like 'COMMISSION_TRANSITION_INVALID:%' or sqlerrm='COMMISSION_PAID_AMOUNT_CONFLICT' then raise; end if;
  update public.booking_commercial_events set processing_state='failed',resolution_reason=left(sqlerrm,500),updated_at=now() where id=p_event_id;
  return jsonb_build_object('resolved',false,'expectedState',false,'reason','COMMERCIAL_EVENT_PROCESSING_FAILED','detail',sqlerrm,'bookingStatusChanged',false,'reservationConfirmed',false);
end $$;
revoke all on function public.luvia_booking_process_commercial_event(uuid) from public,anon,authenticated;
grant execute on function public.luvia_booking_process_commercial_event(uuid) to service_role;


-- Refresh canonical intake/replay provenance for Core 4.71.0.
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
  replay_result jsonb;
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
      -- Preserve event identity. Enrich missing correlation hints, then replay pending/failed states.
      update public.booking_commercial_events
         set correlation_token=coalesce(correlation_token,p_correlation_token),booking_id=coalesce(booking_id,p_booking_id),
             evidence=evidence||coalesce(p_evidence,'{}'::jsonb)||jsonb_build_object('duplicateReplayByCore','4.71.0'),updated_at=now()
       where id=existing.id returning * into existing;
      if existing.processing_state in ('pending_partner_activation','pending_unmatched','failed','received') then
        replay_result:=public.luvia_booking_process_commercial_event(existing.id);
      else
        replay_result:=jsonb_build_object('resolved',existing.processing_state='resolved','expectedState',true,'reason','DUPLICATE_EVENT_NO_REPLAY','event',to_jsonb(existing),'bookingStatusChanged',false,'reservationConfirmed',false);
      end if;
      return jsonb_build_object('duplicate',true,'replayed',existing.processing_state in ('pending_partner_activation','pending_unmatched','failed','received'),'ingestion',replay_result,'bookingStatusChanged',false,'reservationConfirmed',false);
    end if;
  end if;

  insert into public.booking_commercial_events(
    provider_id,source,event_kind,external_event_id,external_reference,correlation_token,booking_id,conversion_type,conversion_state,commission_state,
    gross_amount,gross_currency,commission_amount,commission_currency,event_verified,verification_method,raw_payload,evidence,occurred_at
  ) values(
    v_provider,v_source,v_kind,v_external_event,nullif(trim(coalesce(p_external_reference,'')),''),p_correlation_token,p_booking_id,v_type,v_conversion_state,v_commission_state,
    p_gross_amount,upper(nullif(trim(coalesce(p_gross_currency,'')),'')),p_commission_amount,upper(nullif(trim(coalesce(p_commission_currency,'')),'')),
    coalesce(p_event_verified,false),nullif(trim(coalesce(p_verification_method,'')),''),coalesce(p_raw_payload,'{}'::jsonb),
    coalesce(p_evidence,'{}'::jsonb)||jsonb_build_object('ingestedByCore','4.71.0'),coalesce(p_occurred_at,now())
  ) on conflict do nothing returning * into e;

  if not found then
    if v_external_event is not null then
      select * into existing from public.booking_commercial_events
       where provider_id=v_provider and source=v_source and external_event_id=v_external_event limit 1;
      if found then
        replay_result:=case when existing.processing_state in ('pending_partner_activation','pending_unmatched','failed','received')
          then public.luvia_booking_process_commercial_event(existing.id)
          else jsonb_build_object('resolved',existing.processing_state='resolved','expectedState',true,'reason','DUPLICATE_EVENT_NO_REPLAY','event',to_jsonb(existing),'bookingStatusChanged',false,'reservationConfirmed',false)
        end;
        return jsonb_build_object('duplicate',true,'replayed',existing.processing_state in ('pending_partner_activation','pending_unmatched','failed','received'),'ingestion',replay_result,'bookingStatusChanged',false,'reservationConfirmed',false);
      end if;
    end if;
    raise exception 'COMMERCIAL_EVENT_INSERT_CONFLICT';
  end if;

  return jsonb_build_object('duplicate',false,'replayed',false,'ingestion',public.luvia_booking_process_commercial_event(e.id),'bookingStatusChanged',false,'reservationConfirmed',false);
end $$;
revoke all on function public.luvia_booking_ingest_commercial_event(text,text,text,text,text,uuid,uuid,text,text,text,numeric,text,numeric,text,boolean,text,jsonb,jsonb,timestamptz) from public,anon,authenticated;
grant execute on function public.luvia_booking_ingest_commercial_event(text,text,text,text,text,uuid,uuid,text,text,text,numeric,text,numeric,text,boolean,text,jsonb,jsonb,timestamptz) to service_role;

create or replace function public.luvia_booking_replay_commercial_event(
  p_event_id uuid,
  p_evidence jsonb default '{}'::jsonb
) returns jsonb
language plpgsql security definer set search_path=public as $$
declare e public.booking_commercial_events;
begin
  if coalesce(current_setting('request.jwt.claim.role',true),'') <> 'service_role' then raise exception 'SERVICE_ROLE_REQUIRED'; end if;
  update public.booking_commercial_events
     set evidence=evidence||coalesce(p_evidence,'{}'::jsonb)||jsonb_build_object('explicitReplayByCore','4.71.0'),updated_at=now()
   where id=p_event_id returning * into e;
  if not found then raise exception 'COMMERCIAL_EVENT_NOT_FOUND'; end if;
  return public.luvia_booking_process_commercial_event(e.id);
end $$;
revoke all on function public.luvia_booking_replay_commercial_event(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.luvia_booking_replay_commercial_event(uuid,jsonb) to service_role;

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
         evidence=evidence||coalesce(p_evidence,'{}'::jsonb)||jsonb_build_object('replayedByCore','4.71.0'),
         processing_state='received',resolution_reason=null,updated_at=now()
   where id=p_event_id returning * into e;
  if not found then raise exception 'COMMERCIAL_EVENT_NOT_FOUND'; end if;
  return public.luvia_booking_process_commercial_event(e.id);
end $$;
revoke all on function public.luvia_booking_verify_and_replay_commercial_event(uuid,text,jsonb,uuid,uuid) from public,anon,authenticated;
grant execute on function public.luvia_booking_verify_and_replay_commercial_event(uuid,text,jsonb,uuid,uuid) to service_role;

create or replace view public.booking_commission_runtime_v1 with (security_invoker=true) as
select
  x.id reconciliation_id,x.conversion_report_id,x.correlation_id,x.booking_id,x.trip_id,x.provider_id,x.reconciliation_key,
  x.state commission_state,x.expected_amount,x.expected_currency,x.reported_amount,x.reported_currency,x.settled_amount,x.settled_currency,
  x.statement_reference,x.source,x.occurred_at,x.reconciled_at,x.paid_at,x.created_at,x.updated_at,
  r.conversion_type,r.conversion_state,r.external_event_id conversion_external_event_id,r.external_reference conversion_external_reference,
  r.gross_amount,r.gross_currency,
  (select count(*) from public.booking_commission_state_events s where s.reconciliation_id=x.id) state_event_count,
  (select s.to_state from public.booking_commission_state_events s where s.reconciliation_id=x.id order by s.occurred_at desc,s.created_at desc limit 1) latest_audit_state,
  b.status booking_status,
  false as booking_status_changed_by_commission
from public.booking_commission_reconciliations x
join public.booking_conversion_reports r on r.id=x.conversion_report_id
left join public.bookings b on b.id=x.booking_id;
grant select on public.booking_commission_runtime_v1 to authenticated,service_role;

create or replace view public.booking_commission_revenue_summary_v1 with (security_invoker=true) as
select
  provider_id,
  coalesce(settled_currency,reported_currency,expected_currency) currency,
  count(*) reconciliation_count,
  count(*) filter(where state='pending') pending_count,
  count(*) filter(where state='matched') matched_count,
  count(*) filter(where state='approved') approved_count,
  count(*) filter(where state='paid') paid_count,
  count(*) filter(where state='rejected') rejected_count,
  count(*) filter(where state='disputed') disputed_count,
  sum(case when state='approved' then reported_amount else 0 end) approved_commission_amount,
  sum(case when state='paid' then settled_amount else 0 end) paid_commission_amount,
  max(paid_at) latest_paid_at
from public.booking_commission_reconciliations
group by provider_id,coalesce(settled_currency,reported_currency,expected_currency);
grant select on public.booking_commission_revenue_summary_v1 to authenticated,service_role;

comment on table public.booking_commission_state_events is 'Append-only audit trail for commission lifecycle transitions. It never changes reservation status.';
comment on function public.luvia_booking_apply_commission_lifecycle(uuid,text,numeric,text,text,text,text,text,jsonb,timestamptz) is 'v13.71.0 guarded commission lifecycle with idempotent provider event handling and immutable transition audit.';
comment on function public.luvia_booking_process_commercial_event(uuid) is 'v13.71.0 commercial processor. Commission events attach to an existing conversion instead of creating duplicate conversion reports; reservation truth is immutable.';
comment on view public.booking_commission_runtime_v1 is 'Operational commission lifecycle projection. Monetary values are provider/reconciliation facts only; no inferred commission rates.';
comment on view public.booking_commission_revenue_summary_v1 is 'Provider/currency commission summary derived only from persisted reconciliation facts. Paid amount uses settled commission only.';

commit;
