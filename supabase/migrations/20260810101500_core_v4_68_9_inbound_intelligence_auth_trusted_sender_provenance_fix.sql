-- Luvia v13.68.9 / Core 4.68.9
-- Inbound Intelligence Auth Context & Trusted Sender Provenance Fix

begin;

create or replace function public.luvia_booking_is_service_role_request()
returns boolean
language plpgsql
stable
security invoker
set search_path=public
as $$
declare
  v_role text:=coalesce(current_setting('request.jwt.claim.role',true),'');
  v_claims text:=coalesce(current_setting('request.jwt.claims',true),'');
  v_claims_role text:='';
  v_auth_role text:='';
begin
  if v_role='service_role' then return true; end if;

  if v_claims<>'' then
    begin
      v_claims_role:=coalesce((v_claims::jsonb)->>'role','');
    exception when others then
      v_claims_role:='';
    end;
    if v_claims_role='service_role' then return true; end if;
  end if;

  begin
    v_auth_role:=coalesce(auth.jwt()->>'role','');
  exception when others then
    v_auth_role:='';
  end;
  return v_auth_role='service_role';
end $$;

revoke all on function public.luvia_booking_is_service_role_request() from public,anon,authenticated;
grant execute on function public.luvia_booking_is_service_role_request() to service_role;

create or replace function public.luvia_booking_process_inbound_intelligence_v2(p_message_id uuid)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_msg public.booking_messages;
  v_booking public.bookings;
  v_result jsonb;
  v_intent text;
  v_conf numeric;
  v_proposed text;
  v_classifier_auto boolean;
  v_effective_auto boolean:=false;
  v_signal jsonb:=null;
  v_signal_id uuid:=null;
  v_applied boolean:=false;
  v_applied_status text:=null;
  v_sender_email text;
  v_trusted_sender boolean:=false;
  v_trusted_candidate_id uuid:=null;
  v_review boolean:=false;
  v_requires_action boolean:=false;
  v_evidence jsonb:='[]'::jsonb;
  v_extracted jsonb:='{}'::jsonb;
begin
  if not public.luvia_booking_is_service_role_request() then
    raise exception 'SERVICE_ROLE_REQUIRED';
  end if;

  select * into v_msg
  from public.booking_messages
  where id=p_message_id and direction='inbound'
  for update;
  if not found then raise exception 'INBOUND_MESSAGE_NOT_FOUND'; end if;

  select * into v_booking from public.bookings where id=v_msg.booking_id for update;
  if not found then raise exception 'BOOKING_NOT_FOUND'; end if;

  -- Extract a normalized mailbox from either a plain address or "Display Name <mailbox>".
  v_sender_email:=lower(trim(regexp_replace(coalesce(v_msg.sender,''),'^.*<([^>]+)>.*$','\1')));

  -- Production-safe trust boundary: only an exact match against an already verified,
  -- public, official and auto-usable venue email may auto-apply an email reply.
  select c.id into v_trusted_candidate_id
  from public.booking_contact_candidates c
  where c.booking_id=v_booking.id
    and c.channel='email'
    and c.is_public=true
    and c.is_official=true
    and c.verification_status='verified'
    and c.auto_usable=true
    and lower(trim(coalesce(c.contact_value,'')))=v_sender_email
  order by c.last_verified_at desc nulls last,c.created_at desc
  limit 1;
  v_trusted_sender:=v_trusted_candidate_id is not null;

  v_result:=public.luvia_booking_classify_reply(v_msg.subject,v_msg.body_text);
  v_intent:=v_result->>'intent';
  v_conf:=(v_result->>'confidence')::numeric;
  v_proposed:=nullif(v_result->>'proposedStatus','');
  v_classifier_auto:=coalesce((v_result->>'autoApply')::boolean,false);
  v_effective_auto:=v_classifier_auto and v_trusted_sender;
  v_review:=coalesce((v_result->>'reviewRequired')::boolean,false) or (v_classifier_auto and not v_trusted_sender);
  v_requires_action:=coalesce((v_result->>'requiresUserAction')::boolean,false) or (v_classifier_auto and not v_trusted_sender);
  v_evidence:=coalesce(v_result->'evidence','[]'::jsonb);
  if not v_trusted_sender then
    v_evidence:=v_evidence||jsonb_build_array('untrusted_sender_not_auto_applied');
  end if;
  v_extracted:=coalesce(v_result->'extracted','{}'::jsonb);

  if v_effective_auto and v_proposed is not null then
    v_signal:=public.luvia_booking_ingest_status_signal_internal(
      v_booking.id,
      'email',
      v_msg.provider_message_id,
      v_intent,
      v_proposed,
      'email_reply',
      coalesce(v_msg.webhook_event_id,v_msg.id::text),
      v_conf,
      jsonb_build_object(
        'messageId',v_msg.id,
        'classifierVersion','0.4.0-email-v2.1',
        'emailThreadId',v_msg.email_thread_id,
        'sender',v_sender_email,
        'senderTrusted',true,
        'trustedCandidateId',v_trusted_candidate_id,
        'senderTrustMethod','verified_candidate_exact_match'
      ),
      coalesce(v_msg.received_at,v_msg.created_at),
      false
    );
    v_signal_id:=nullif(v_signal#>>'{signal,id}','')::uuid;
    v_applied:=coalesce((v_signal->>'applied')::boolean,false);
    if v_applied then v_applied_status:=v_proposed; end if;
  end if;

  insert into public.booking_message_intelligence(
    booking_id,message_id,classifier,classifier_version,intent,confidence,proposed_status,
    auto_apply,applied,applied_status,requires_user_action,review_required,visible_reply,
    evidence,extracted,raw_result,classified_at,updated_at
  ) values(
    v_booking.id,v_msg.id,'rules','0.4.0-email-v2.1',v_intent,v_conf,v_proposed,
    v_effective_auto,v_applied,v_applied_status,v_requires_action,v_review,v_result->>'visibleReply',
    v_evidence,v_extracted,
    v_result||jsonb_build_object(
      'statusSignal',v_signal,
      'classifierAutoApply',v_classifier_auto,
      'effectiveAutoApply',v_effective_auto,
      'sender',v_sender_email,
      'senderTrusted',v_trusted_sender,
      'trustedCandidateId',v_trusted_candidate_id,
      'senderTrustMethod',case when v_trusted_sender then 'verified_candidate_exact_match' else 'none' end,
      'autoApplyBlockedReason',case when v_classifier_auto and not v_trusted_sender then 'UNTRUSTED_EMAIL_SENDER' else null end
    ),now(),now()
  )
  on conflict(message_id) do update set
    classifier='rules',classifier_version='0.4.0-email-v2.1',intent=excluded.intent,
    confidence=excluded.confidence,proposed_status=excluded.proposed_status,auto_apply=excluded.auto_apply,
    applied=excluded.applied,applied_status=excluded.applied_status,
    requires_user_action=excluded.requires_user_action,review_required=excluded.review_required,
    visible_reply=excluded.visible_reply,evidence=excluded.evidence,extracted=excluded.extracted,
    raw_result=excluded.raw_result,classified_at=now(),updated_at=now();

  update public.booking_email_threads
  set state='replied',last_inbound_message_id=v_msg.id,last_activity_at=now(),updated_at=now()
  where id=v_msg.email_thread_id;

  insert into public.booking_events(booking_id,trip_id,event_type,payload)
  values(
    v_booking.id,v_booking.trip_id,'booking.email.reply.classified',
    jsonb_build_object(
      'messageId',v_msg.id,'intent',v_intent,'confidence',v_conf,'statusSignalId',v_signal_id,
      'applied',v_applied,'sender',v_sender_email,'senderTrusted',v_trusted_sender,
      'trustedCandidateId',v_trusted_candidate_id,'effectiveAutoApply',v_effective_auto,
      'reviewRequired',v_review
    )
  );

  return v_result||jsonb_build_object(
    'bookingId',v_booking.id,'messageId',v_msg.id,'statusSignalId',v_signal_id,
    'applied',v_applied,'appliedStatus',v_applied_status,
    'classifierAutoApply',v_classifier_auto,'autoApply',v_effective_auto,
    'sender',v_sender_email,'senderTrusted',v_trusted_sender,
    'trustedCandidateId',v_trusted_candidate_id,
    'reviewRequired',v_review,
    'autoApplyBlockedReason',case when v_classifier_auto and not v_trusted_sender then 'UNTRUSTED_EMAIL_SENDER' else null end
  );
end $$;

revoke all on function public.luvia_booking_process_inbound_intelligence_v2(uuid) from public,anon,authenticated;
grant execute on function public.luvia_booking_process_inbound_intelligence_v2(uuid) to service_role;

comment on function public.luvia_booking_process_inbound_intelligence_v2(uuid) is
'Email Booking V2.1: classifies inbound replies, persists every decision, and only auto-applies email_reply provenance when sender exactly matches a verified/public/official/auto-usable venue email candidate.';

insert into public.booking_health_checks(check_key,status,details,checked_at)
values(
  'release','ok',
  jsonb_build_object(
    'version','1.0.16','integration_ready',true,'luvia_core','4.68.9','luvia_build','13.68.9',
    'feature','Inbound Intelligence Auth Context & Trusted Sender Provenance Fix',
    'service_role_context_robust',true,'trusted_sender_exact_verified_candidate',true,
    'untrusted_sender_auto_apply_blocked',true,'intelligence_always_audited',true,'checked_at',now()
  ),now()
)
on conflict(check_key) do update set status=excluded.status,details=excluded.details,checked_at=excluded.checked_at;

commit;
