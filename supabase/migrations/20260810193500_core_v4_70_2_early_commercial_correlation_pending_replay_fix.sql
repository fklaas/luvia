-- Luvia v13.70.2 / Core 4.70.2
-- Early Commercial Correlation Resolution & Pending Replay Fix
-- Resolve/persist correlation before commercial activation gating. Duplicate provider retries may replay pending events.
-- Commercial evidence NEVER mutates reservation truth.
begin;

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
    return jsonb_build_object('resolved',true,'duplicateProcessing',true,'event',to_jsonb(e),'bookingStatusChanged',false,'reservationConfirmed',false);
  end if;

  v_internal_source:=e.source in ('provider_api','provider_polling','manual_reconciliation');
  if not e.event_verified and not v_internal_source then
    update public.booking_commercial_events
       set processing_state='pending_verification',resolution_reason='EVENT_VERIFICATION_REQUIRED',updated_at=now()
     where id=e.id returning * into e;
    return jsonb_build_object('resolved',false,'expectedState',true,'reason','EVENT_VERIFICATION_REQUIRED','event',to_jsonb(e),'bookingStatusChanged',false,'reservationConfirmed',false);
  end if;

  -- v13.70.2: resolve correlation BEFORE monetization readiness. Pending partner events remain attributable/replayable.
  if e.correlation_token is not null then
    select * into c from public.booking_correlations where correlation_token=e.correlation_token for update;
  elsif e.correlation_id is not null then
    select * into c from public.booking_correlations where id=e.correlation_id for update;
  elsif e.booking_id is not null then
    select * into c from public.booking_correlations
     where booking_id=e.booking_id and provider_id=e.provider_id
     order by created_at desc limit 1 for update;
  else
    c:=null;
  end if;

  if c.id is null then
    update public.booking_commercial_events
       set processing_state='pending_unmatched',resolution_reason='CORRELATION_NOT_FOUND',updated_at=now()
     where id=e.id returning * into e;
    return jsonb_build_object('resolved',false,'expectedState',true,'reason','CORRELATION_NOT_FOUND','event',to_jsonb(e),'bookingStatusChanged',false,'reservationConfirmed',false);
  end if;

  if c.provider_id is not null and c.provider_id<>e.provider_id then
    update public.booking_commercial_events
       set processing_state='ignored',resolution_reason='CORRELATION_PROVIDER_MISMATCH',correlation_id=c.id,
           correlation_token=c.correlation_token,trip_id=c.trip_id,updated_at=now()
     where id=e.id returning * into e;
    return jsonb_build_object('resolved',false,'expectedState',false,'reason','CORRELATION_PROVIDER_MISMATCH','event',to_jsonb(e),'bookingStatusChanged',false,'reservationConfirmed',false);
  end if;

  if e.booking_id is not null and c.booking_id is not null and e.booking_id<>c.booking_id then
    update public.booking_commercial_events
       set processing_state='ignored',resolution_reason='CORRELATION_BOOKING_MISMATCH',correlation_id=c.id,
           correlation_token=c.correlation_token,trip_id=c.trip_id,updated_at=now()
     where id=e.id returning * into e;
    return jsonb_build_object('resolved',false,'expectedState',false,'reason','CORRELATION_BOOKING_MISMATCH','event',to_jsonb(e),'bookingStatusChanged',false,'reservationConfirmed',false);
  end if;

  if c.booking_id is null and e.booking_id is not null then
    perform public.luvia_booking_link_correlation(e.booking_id,c.correlation_token);
    select * into c from public.booking_correlations where id=c.id for update;
  end if;

  update public.booking_commercial_events
     set correlation_id=c.id,correlation_token=c.correlation_token,booking_id=coalesce(c.booking_id,e.booking_id),trip_id=c.trip_id,
         evidence=evidence||jsonb_build_object('correlationResolvedByCore','4.70.2'),updated_at=now()
   where id=e.id returning * into e;

  -- Commercial readiness is evaluated only after provenance/correlation is known and persisted.
  select * into p from public.booking_monetization_profiles where provider_id=e.provider_id;
  if not found or p.commercial_status='unavailable' or p.monetization_mode='none' then
    update public.booking_commercial_events
       set processing_state='ignored',resolution_reason='PROVIDER_NOT_MONETIZABLE',processed_at=now(),updated_at=now()
     where id=e.id returning * into e;
    return jsonb_build_object('resolved',false,'expectedState',true,'reason','PROVIDER_NOT_MONETIZABLE','event',to_jsonb(e),'bookingStatusChanged',false,'reservationConfirmed',false);
  end if;
  if p.commercial_status<>'active' then
    update public.booking_commercial_events
       set processing_state='pending_partner_activation',resolution_reason='COMMERCIAL_PARTNER_NOT_ACTIVE',updated_at=now()
     where id=e.id returning * into e;
    return jsonb_build_object('resolved',false,'expectedState',true,'reason','COMMERCIAL_PARTNER_NOT_ACTIVE','event',to_jsonb(e),'bookingStatusChanged',false,'reservationConfirmed',false);
  end if;

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
    e.evidence||jsonb_build_object('commercialEventId',e.id,'eventKind',e.event_kind,'eventVerified',e.event_verified,'commercialCore','4.70.2'),e.occurred_at
  );
  begin v_conversion_id:=((v_conversion_result->'conversion'->>'id'))::uuid; exception when others then v_conversion_id:=null; end;

  if v_commission_state is not null and v_conversion_id is not null then
    v_reconciliation_result:=public.luvia_booking_reconcile_conversion_report(
      v_conversion_id,null,v_commission_state,e.commission_amount,e.commission_currency,e.external_reference,
      coalesce(e.external_event_id,e.id::text),e.source,
      e.evidence||jsonb_build_object('commercialEventId',e.id,'eventKind',e.event_kind,'commercialCore','4.70.2'),e.occurred_at
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
  return jsonb_build_object('resolved',false,'expectedState',false,'reason','COMMERCIAL_EVENT_PROCESSING_FAILED','detail',sqlerrm,'bookingStatusChanged',false,'reservationConfirmed',false);
end $$;
revoke all on function public.luvia_booking_process_commercial_event(uuid) from public,anon,authenticated;
grant execute on function public.luvia_booking_process_commercial_event(uuid) to service_role;

-- Duplicate delivery is still one persisted event, but pending states can be replayed through the canonical processor.
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
             evidence=evidence||coalesce(p_evidence,'{}'::jsonb)||jsonb_build_object('duplicateReplayByCore','4.70.2'),updated_at=now()
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
    coalesce(p_evidence,'{}'::jsonb)||jsonb_build_object('ingestedByCore','4.70.2'),coalesce(p_occurred_at,now())
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

-- Explicit replay entry point for partner activation jobs/reconciliation. Does not bypass verification or readiness gates.
create or replace function public.luvia_booking_replay_commercial_event(
  p_event_id uuid,
  p_evidence jsonb default '{}'::jsonb
) returns jsonb
language plpgsql security definer set search_path=public as $$
declare e public.booking_commercial_events;
begin
  if coalesce(current_setting('request.jwt.claim.role',true),'') <> 'service_role' then raise exception 'SERVICE_ROLE_REQUIRED'; end if;
  update public.booking_commercial_events
     set evidence=evidence||coalesce(p_evidence,'{}'::jsonb)||jsonb_build_object('explicitReplayByCore','4.70.2'),updated_at=now()
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
         evidence=evidence||coalesce(p_evidence,'{}'::jsonb)||jsonb_build_object('replayedByCore','4.70.2'),
         processing_state='received',resolution_reason=null,updated_at=now()
   where id=p_event_id returning * into e;
  if not found then raise exception 'COMMERCIAL_EVENT_NOT_FOUND'; end if;
  return public.luvia_booking_process_commercial_event(e.id);
end $$;
revoke all on function public.luvia_booking_verify_and_replay_commercial_event(uuid,text,jsonb,uuid,uuid) from public,anon,authenticated;
grant execute on function public.luvia_booking_verify_and_replay_commercial_event(uuid,text,jsonb,uuid,uuid) to service_role;

comment on function public.luvia_booking_process_commercial_event(uuid) is 'v13.70.2 conversion processor. Correlation is resolved and persisted before commercial activation gating; commercial facts never mutate bookings.status.';
comment on function public.luvia_booking_replay_commercial_event(uuid,jsonb) is 'v13.70.2 explicit service-role replay for pending commercial events. All verification, correlation and partner readiness gates remain enforced.';
comment on function public.luvia_booking_ingest_commercial_event(text,text,text,text,text,uuid,uuid,text,text,text,numeric,text,numeric,text,boolean,text,jsonb,jsonb,timestamptz) is 'v13.70.2 canonical commercial intake. Provider retries remain idempotent by event identity and may replay pending events through the same guarded processor.';

commit;
