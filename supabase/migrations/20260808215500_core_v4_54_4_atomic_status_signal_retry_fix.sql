-- Luvia v13.54.4 / Core 4.54.4
-- Provider Connection Runtime + Places Category Reliability
-- Reuses a previously emitted but never-applied trusted provider signal when the earlier
-- apply attempt ended in ignored/failed. Successfully applied signals remain strictly idempotent.

begin;

create or replace function public.luvia_booking_ingest_status_signal_internal(
  p_booking_id uuid,
  p_provider_id text,
  p_provider_reference text,
  p_provider_status text,
  p_proposed_luvia_status text,
  p_source text,
  p_source_event_id text default null,
  p_confidence numeric default null,
  p_evidence jsonb default '{}'::jsonb,
  p_occurred_at timestamptz default null,
  p_trusted_provider_contract boolean default false
) returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  b public.bookings;
  s public.booking_status_signals;
  existing public.booking_status_signals;
  latest public.booking_status_signals;
  v_source text;
  v_status text;
  v_authority integer;
  v_latest_authority integer;
  applied jsonb;
  update_id uuid;
  v_retry_existing boolean:=false;
begin
  select * into b from public.bookings where id=p_booking_id for update;
  if not found then raise exception 'BOOKING_NOT_FOUND'; end if;

  v_source:=lower(trim(coalesce(p_source,'')));
  v_status:=lower(trim(coalesce(p_proposed_luvia_status,'')));
  if v_source not in ('system','handoff','provider_webhook','provider_api','provider_polling','affiliate_callback','email_reply','user_confirmation') then
    raise exception 'STATUS_SIGNAL_SOURCE_INVALID';
  end if;
  if v_status not in ('requested','awaiting_reply','alternative_proposed','needs_action','confirmed','declined','cancelled','failed') then
    raise exception 'STATUS_SIGNAL_TARGET_INVALID';
  end if;

  if p_source_event_id is not null then
    select * into existing from public.booking_status_signals
    where source=v_source and source_event_id=p_source_event_id limit 1;
    if found then
      -- Applied signals are final/idempotent: never apply the same provider event twice.
      if existing.applied_status_update_id is not null or existing.resolution_state='applied' then
        return jsonb_build_object('duplicate',true,'applied',true,'signal',to_jsonb(existing),'statusUpdateId',existing.applied_status_update_id);
      end if;

      -- Recovery is deliberately narrow: only a trusted provider-contract signal that was
      -- previously ignored/failed before apply may be retried, and only against the same booking,
      -- source and normalized target. Conflict/review states are not auto-retried.
      v_retry_existing :=
        p_trusted_provider_contract
        and v_source in ('provider_webhook','provider_api','provider_polling')
        and existing.booking_id=p_booking_id
        and existing.proposed_luvia_status=v_status
        and existing.resolution_state in ('ignored','failed')
        and existing.applied_status_update_id is null;

      if not v_retry_existing then
        return jsonb_build_object('duplicate',true,'applied',false,'signal',to_jsonb(existing));
      end if;

      -- Atomic retry: never move the existing signal through a synthetic intermediate
      -- resolution_state. booking_status_signals only permits pending/applied/ignored/conflict/duplicate.
      -- Keep the previous legal state until the re-evaluation has a final outcome; the same row
      -- is then changed directly to applied or remains ignored/failed-equivalent with audit evidence.
      update public.booking_status_signals
      set provider_id=coalesce(nullif(lower(trim(coalesce(p_provider_id,''))),''),provider_id),
          provider_reference=coalesce(nullif(trim(coalesce(p_provider_reference,'')),''),provider_reference),
          provider_status=coalesce(nullif(trim(coalesce(p_provider_status,'')),''),provider_status),
          confidence=case when p_confidence is null then confidence else greatest(0,least(1,p_confidence)) end,
          evidence=coalesce(evidence,'{}'::jsonb)||coalesce(p_evidence,'{}'::jsonb)||jsonb_build_object(
            'trustedProviderContract',true,
            'retryingPreviouslyUnappliedSignal',true,
            'previousResolutionState',existing.resolution_state,
            'previousResolutionReason',existing.resolution_reason,
            'retryAttemptStartedAt',now(),
            'retryCoreVersion','4.54.4',
            'atomicRetry',true
          ),
          received_at=now()
      where id=existing.id
      returning * into s;
    end if;
  end if;

  if s.id is null then
    insert into public.booking_status_signals(
      booking_id,trip_id,provider_id,provider_reference,provider_status,proposed_luvia_status,source,source_event_id,confidence,evidence,occurred_at
    ) values (
      b.id,b.trip_id,nullif(lower(trim(coalesce(p_provider_id,''))),''),nullif(trim(coalesce(p_provider_reference,'')),''),
      nullif(trim(coalesce(p_provider_status,'')),''),v_status,v_source,nullif(trim(coalesce(p_source_event_id,'')),''),
      case when p_confidence is null then null else greatest(0,least(1,p_confidence)) end,
      coalesce(p_evidence,'{}'::jsonb)||jsonb_build_object('trustedProviderContract',p_trusted_provider_contract),
      coalesce(p_occurred_at,now())
    ) returning * into s;
  end if;

  if v_status='confirmed' and v_source in ('handoff','affiliate_callback') then
    update public.booking_status_signals set resolution_state='ignored',resolution_reason='NON_CONFIRMING_SOURCE'
    where id=s.id returning * into s;
    return jsonb_build_object('duplicate',false,'applied',false,'retried',v_retry_existing,'signal',to_jsonb(s));
  end if;

  v_authority:=public.luvia_booking_status_source_authority(v_source);
  select * into latest
  from public.booking_status_signals
  where booking_id=b.id and id<>s.id and resolution_state='applied'
  order by occurred_at desc,received_at desc limit 1;

  if found then
    v_latest_authority:=public.luvia_booking_status_source_authority(latest.source);
    if v_latest_authority>v_authority and latest.proposed_luvia_status<>v_status then
      update public.booking_status_signals set resolution_state='ignored',resolution_reason='LOWER_AUTHORITY_THAN_APPLIED_SIGNAL'
      where id=s.id returning * into s;
      return jsonb_build_object('duplicate',false,'applied',false,'retried',v_retry_existing,'signal',to_jsonb(s));
    end if;
    if v_latest_authority=v_authority and latest.proposed_luvia_status<>v_status
       and abs(extract(epoch from (s.occurred_at-latest.occurred_at)))<300 then
      update public.booking_status_signals set resolution_state='conflict',resolution_reason='EQUAL_AUTHORITY_CONFLICT' where id=s.id;
      update public.booking_status_signals set resolution_state='conflict',resolution_reason='EQUAL_AUTHORITY_CONFLICT' where id=latest.id;
      return jsonb_build_object('duplicate',false,'applied',false,'retried',v_retry_existing,'conflict',true,'signalId',s.id,'conflictsWith',latest.id);
    end if;
  end if;

  if v_source in ('provider_webhook','provider_api','provider_polling') then
    begin
      applied:=public.luvia_booking_apply_provider_status_internal(
        b.id,coalesce(p_provider_id,b.provider),p_provider_reference,p_provider_status,v_status,v_source,
        p_source_event_id,p_evidence,p_occurred_at,not p_trusted_provider_contract
      );
    exception when others then
      update public.booking_status_signals
      set resolution_state='ignored',resolution_reason=sqlerrm,
          evidence=coalesce(evidence,'{}'::jsonb)||jsonb_build_object('lastRetryFailedAt',now(),'retryCoreVersion','4.54.4')
      where id=s.id returning * into s;
      return jsonb_build_object('duplicate',false,'applied',false,'retried',v_retry_existing,'signal',to_jsonb(s));
    end;
    begin update_id:=(applied->>'statusUpdateId')::uuid; exception when others then update_id:=null; end;
  else
    if not public.luvia_booking_transition_allowed(b.status,v_status) then
      update public.booking_status_signals set resolution_state='ignored',resolution_reason='INVALID_BOOKING_TRANSITION'
      where id=s.id returning * into s;
      return jsonb_build_object('duplicate',false,'applied',false,'retried',v_retry_existing,'signal',to_jsonb(s));
    end if;
    update public.bookings
    set status=v_status,status_source=v_source,
        status_source_ref=coalesce(nullif(trim(coalesce(p_source_event_id,'')),''),nullif(trim(coalesce(p_provider_reference,'')),'')),
        status_verified_at=coalesce(p_occurred_at,now()),updated_at=now()
    where id=b.id;
    insert into public.booking_status_updates(
      booking_id,trip_id,provider_id,provider_reference,provider_status,luvia_status,source,source_event_id,evidence,occurred_at,applied
    ) values (
      b.id,b.trip_id,nullif(lower(trim(coalesce(p_provider_id,''))),''),nullif(trim(coalesce(p_provider_reference,'')),''),
      nullif(trim(coalesce(p_provider_status,'')),''),v_status,v_source,nullif(trim(coalesce(p_source_event_id,'')),''),
      coalesce(p_evidence,'{}'::jsonb),coalesce(p_occurred_at,now()),true
    ) returning id into update_id;
  end if;

  update public.booking_status_signals
  set resolution_state='applied',resolution_reason=case when v_retry_existing then 'RETRIED_AUTHORITATIVE_SIGNAL_APPLIED' else 'AUTHORITATIVE_SIGNAL_APPLIED' end,
      applied_status_update_id=update_id,
      evidence=coalesce(evidence,'{}'::jsonb)||jsonb_build_object('retryRecovered',v_retry_existing,'retryCoreVersion','4.54.4')
  where id=s.id returning * into s;

  return jsonb_build_object('duplicate',false,'applied',true,'retried',v_retry_existing,'signal',to_jsonb(s),'statusUpdateId',update_id);
end $$;

revoke all on function public.luvia_booking_ingest_status_signal_internal(uuid,text,text,text,text,text,text,numeric,jsonb,timestamptz,boolean)
from public,anon,authenticated,service_role;

create or replace function public.luvia_booking_reprocess_provider_status_receipt_internal(p_receipt_id uuid)
returns jsonb
language plpgsql security definer set search_path=public as $$
declare
  r public.booking_provider_status_receipts;
  b public.bookings;
  c public.booking_correlations;
  pr public.booking_provider_references;
  existing_signal public.booking_status_signals;
  v_contract jsonb;
  v_normalized text;
  v_auto_apply boolean:=false;
  v_contract_id uuid;
  v_contract_version text;
  v_source text;
  v_result jsonb;
  v_signal_id uuid;
  v_update_id uuid;
  v_linked boolean:=false;
  v_existing_issue uuid;
  v_retry_signal boolean:=false;
begin
  select * into r from public.booking_provider_status_receipts where id=p_receipt_id for update;
  if not found then return jsonb_build_object('ok',false,'reason','RECEIPT_NOT_FOUND'); end if;
  if r.resolution_state in ('applied','duplicate') then
    return jsonb_build_object('ok',true,'changed',false,'state',r.resolution_state,'receiptId',r.id);
  end if;

  if r.correlation_id is not null then
    select * into c from public.booking_correlations where id=r.correlation_id;
    if found and c.booking_id is not null then
      select * into b from public.bookings where id=c.booking_id;
      if found then v_linked:=r.booking_id is distinct from b.id; end if;
    end if;
  end if;
  if b.id is null and r.provider_reference is not null then
    select * into pr from public.booking_provider_references
    where provider_id=r.provider_id and reservation_reference=r.provider_reference limit 1;
    if found then
      select * into b from public.bookings where id=pr.booking_id;
      if found then
        v_linked:=true;
        if r.correlation_id is null then
          select * into c from public.booking_correlations
          where booking_id=b.id and (provider_id=r.provider_id or provider_id is null)
          order by linked_at desc nulls last,created_at desc limit 1;
        end if;
      end if;
    end if;
  end if;
  if b.id is null and r.booking_id is not null then
    select * into b from public.bookings where id=r.booking_id;
  end if;

  v_contract:=public.luvia_booking_resolve_provider_status_contract(r.provider_id,r.transport,r.provider_status,r.signature_verified);
  v_normalized:=nullif(v_contract->>'normalizedStatus','');
  v_auto_apply:=coalesce((v_contract->>'autoApply')::boolean,false);
  begin v_contract_id:=(v_contract->>'contractId')::uuid; exception when others then v_contract_id:=null; end;
  v_contract_version:=nullif(v_contract->>'contractVersion','');
  v_source:=case r.transport when 'webhook' then 'provider_webhook' when 'api' then 'provider_api' else 'provider_polling' end;

  if b.id is null then
    update public.booking_provider_status_receipts
    set resolution_state='pending_unlinked',resolution_reason='NO_BOOKING_LINK',
        normalized_luvia_status=v_normalized,status_contract_id=v_contract_id,status_contract_version=v_contract_version,
        mapping_verified=v_auto_apply,evidence=evidence||jsonb_build_object('statusContract',v_contract),
        reprocess_count=reprocess_count+1,last_reprocessed_at=now()
    where id=r.id returning * into r;
    return jsonb_build_object('ok',true,'changed',false,'linked',false,'state','pending_unlinked','receiptId',r.id,'contract',v_contract);
  end if;

  update public.booking_provider_status_receipts
  set booking_id=b.id,trip_id=b.trip_id,correlation_id=coalesce(r.correlation_id,c.id),
      normalized_luvia_status=v_normalized,status_contract_id=v_contract_id,status_contract_version=v_contract_version,
      mapping_verified=v_auto_apply,evidence=evidence||jsonb_build_object('statusContract',v_contract),
      reprocess_count=reprocess_count+1,last_reprocessed_at=now()
  where id=r.id returning * into r;

  update public.booking_reconciliation_issues
  set state='resolved',resolved_at=coalesce(resolved_at,now()),
      details=details||jsonb_build_object('resolvedBy','failed_status_signal_recovery_v1','receiptId',r.id)
  where provider_id=r.provider_id and issue_type='unlinked_provider_status' and state='open'
    and (reference=r.provider_reference or details->>'receiptId'=r.id::text);

  if not v_auto_apply then
    update public.booking_provider_status_receipts
    set resolution_state='pending_review',resolution_reason=coalesce(v_contract->>'reason','STATUS_NOT_VERIFIED')
    where id=r.id returning * into r;
    select id into v_existing_issue
    from public.booking_reconciliation_issues
    where booking_id=b.id and provider_id=r.provider_id and issue_type='unknown_provider_status' and state='open'
      and (reference=r.provider_reference or details->>'receiptId'=r.id::text)
    limit 1;
    if v_existing_issue is null then
      insert into public.booking_reconciliation_issues(trip_id,booking_id,correlation_id,provider_id,issue_type,reference,details)
      values(
        b.trip_id,b.id,r.correlation_id,r.provider_id,'unknown_provider_status',coalesce(r.provider_reference,r.external_event_id),
        jsonb_build_object('receiptId',r.id,'providerStatus',r.provider_status,'statusContract',v_contract,'reprocessed',true)
      );
    end if;
    return jsonb_build_object('ok',true,'changed',v_linked,'linked',true,'applied',false,'state','pending_review','receiptId',r.id,'contract',v_contract);
  end if;

  if r.status_signal_id is not null then
    select * into existing_signal from public.booking_status_signals where id=r.status_signal_id;
    if found then
      if existing_signal.applied_status_update_id is not null or existing_signal.resolution_state='applied' then
        update public.booking_provider_status_receipts
        set resolution_state='applied',resolution_reason='STATUS_SIGNAL_ALREADY_APPLIED',
            status_update_id=coalesce(status_update_id,existing_signal.applied_status_update_id)
        where id=r.id returning * into r;
        return jsonb_build_object('ok',true,'changed',v_linked,'linked',true,'applied',true,
          'state','applied','receiptId',r.id,'reason','SIGNAL_ALREADY_APPLIED','contract',v_contract);
      end if;
      v_retry_signal:=existing_signal.resolution_state in ('ignored','failed') and existing_signal.applied_status_update_id is null;
      if not v_retry_signal then
        return jsonb_build_object('ok',true,'changed',v_linked,'linked',true,'applied',false,
          'state',r.resolution_state,'receiptId',r.id,'reason','SIGNAL_ALREADY_EMITTED_NOT_RETRYABLE','contract',v_contract);
      end if;
    end if;
  end if;

  v_result:=public.luvia_booking_ingest_status_signal_internal(
    b.id,r.provider_id,r.provider_reference,r.provider_status,v_normalized,v_source,r.external_event_id,1.0,
    coalesce(r.evidence,'{}'::jsonb)||jsonb_build_object(
      'providerReceiptId',r.id,
      'signatureVerified',r.signature_verified,
      'transport',r.transport,
      'reprocessed',true,
      'statusContract',v_contract,
      'trustedInternalBridgeVersion','4.54.4',
      'retryingExistingSignal',v_retry_signal
    ),
    r.occurred_at,
    true
  );

  begin v_signal_id:=((v_result->'signal'->>'id'))::uuid; exception when others then v_signal_id:=r.status_signal_id; end;
  begin v_update_id:=(v_result->>'statusUpdateId')::uuid; exception when others then v_update_id:=null; end;

  update public.booking_provider_status_receipts
  set resolution_state=case when coalesce((v_result->>'applied')::boolean,false) then 'applied' else 'ignored' end,
      resolution_reason=case
        when coalesce((v_result->>'applied')::boolean,false) and coalesce((v_result->>'retried')::boolean,false) then 'RETRIED_STATUS_SIGNAL_APPLIED'
        else coalesce(v_result->'signal'->>'resolution_reason',v_result->>'reason','STATUS_SIGNAL_NOT_APPLIED')
      end,
      status_signal_id=coalesce(v_signal_id,status_signal_id),
      status_update_id=coalesce(v_update_id,status_update_id),
      evidence=evidence||jsonb_build_object('signalRetryAttempted',v_retry_signal,'signalRetryCoreVersion','4.54.4')
  where id=r.id returning * into r;

  return jsonb_build_object(
    'ok',true,'changed',true,'linked',true,'applied',coalesce((v_result->>'applied')::boolean,false),
    'retriedSignal',v_retry_signal,'state',r.resolution_state,'receiptId',r.id,'statusResult',v_result,'contract',v_contract,
    'trustedInternalBridge',true
  );
end $$;

revoke all on function public.luvia_booking_reprocess_provider_status_receipt_internal(uuid)
from public,anon,authenticated,service_role;

comment on function public.luvia_booking_ingest_status_signal_internal(uuid,text,text,text,text,text,text,numeric,jsonb,timestamptz,boolean)
is 'Protected database-only Booking Status V2 resolver. Trusted previously-unapplied provider signals are retried atomically without an invalid intermediate resolution state; applied signals remain strictly idempotent.';

comment on function public.luvia_booking_reprocess_provider_status_receipt_internal(uuid)
is 'Reprocesses provider receipts and atomically recovers a previously emitted but never-applied trusted provider signal without creating a duplicate signal.';

commit;
