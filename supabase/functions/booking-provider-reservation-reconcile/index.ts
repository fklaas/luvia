import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
const VERSION='1.0.0',BUILD='13.65.0',CORE='4.65.0';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json'};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:cors});
const clean=(v:unknown)=>String(v??'').trim(); const low=(v:unknown)=>clean(v).toLowerCase();
const validUuid=(v:string)=>/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
const TABLES={modify:'booking_reservation_modify_requests',cancel:'booking_reservation_cancel_requests'} as const;
const PROVIDER_FUNCTIONS:Record<string,string>={opentable:'booking-provider-opentable',sevenrooms:'booking-provider-sevenrooms',resy:'booking-provider-resy'};
function explicitMutationStatus(action:'modify'|'cancel',data:any){
  const explicit=low(data?.mutationLifecycleState||data?.mutation_lifecycle_state||data?.mutationStatus||data?.mutation_status||data?.mutationOutcome||data?.mutation_outcome);
  if(['pending','accepted','rejected','alternative_proposed','cancelled','failed','unknown'].includes(explicit))return explicit;
  const status=low(data?.providerStatus||data?.provider_status||data?.reservationStatus||data?.reservation_status||data?.status);
  if(action==='cancel'&&['cancelled','canceled','reservation_cancelled','reservation_canceled'].includes(status))return 'cancelled';
  if(['cancellation_pending','cancel_pending','pending'].includes(status))return 'pending';
  if(['cancellation_rejected','rejected','declined'].includes(status))return 'rejected';
  if(['failed','error'].includes(status))return 'failed';
  if(action==='modify'&&(data?.alternativeProposed===true||data?.alternative_proposed===true||status==='alternative_proposed'))return 'alternative_proposed';
  return 'unknown';
}
function proposedLuviaStatus(action:'modify'|'cancel',mutation:string,data:any){
  const explicit=low(data?.normalizedStatus||data?.normalized_status||data?.luviaStatus||data?.luvia_status);
  if(['requested','awaiting_reply','alternative_proposed','needs_action','confirmed','declined','cancelled','failed'].includes(explicit))return explicit;
  if(action==='cancel'&&mutation==='cancelled')return 'cancelled';
  if(action==='modify'&&mutation==='alternative_proposed')return 'alternative_proposed';
  return null;
}
Deno.serve(async req=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
  if(req.method!=='POST')return json({error:'METHOD_NOT_ALLOWED'},405);
  try{
    const url=Deno.env.get('SUPABASE_URL')!,anon=Deno.env.get('SUPABASE_ANON_KEY')!,service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const auth=req.headers.get('Authorization')||''; const userClient=createClient(url,anon,{global:{headers:{Authorization:auth}}});
    const {data:{user},error:userError}=await userClient.auth.getUser(); if(userError||!user)return json({error:'AUTH_REQUIRED'},401);
    const admin=createClient(url,service,{auth:{persistSession:false}}); const body=await req.json().catch(()=>({}));
    const mode=low(body?.mode)||'get'; if(!['get','list','reconcile','history'].includes(mode))return json({error:'VALID_RECONCILIATION_MODE_REQUIRED'},400);
    if(mode==='list'){
      const limit=Math.min(Math.max(Number(body?.limit)||25,1),100);
      const {data:accessible,error:accessError}=await userClient.from('bookings').select('id').limit(500); if(accessError)throw accessError;
      const ids=(accessible||[]).map((x:any)=>x.id); if(!ids.length)return json({ok:true,version:VERSION,build:BUILD,core:CORE,items:[]});
      let q=admin.from('booking_reservation_mutation_reconciliation_queue_v1').select('*').in('booking_id',ids).order('created_at',{ascending:true}).limit(limit);
      const actionFilter=low(body?.action); if(actionFilter==='modify'||actionFilter==='cancel')q=q.eq('action',actionFilter);
      const {data,error}=await q; if(error)throw error; return json({ok:true,version:VERSION,build:BUILD,core:CORE,items:data||[]});
    }
    const action=low(body?.action) as 'modify'|'cancel'; const requestId=clean(body?.requestId||body?.request_id);
    if(action!=='modify'&&action!=='cancel')return json({error:'VALID_MUTATION_ACTION_REQUIRED'},400);
    if(!validUuid(requestId))return json({error:'VALID_MUTATION_REQUEST_ID_REQUIRED'},400);
    const table=TABLES[action]; const {data:mutation,error:mutationError}=await admin.from(table).select('*').eq('id',requestId).maybeSingle(); if(mutationError)throw mutationError;
    if(!mutation)return json({ok:false,expected:true,error:'MUTATION_REQUEST_NOT_ACCESSIBLE',action,requestId});
    const {data:booking,error:bookingError}=await userClient.from('bookings').select('id,status,trip_id,provider').eq('id',mutation.booking_id).maybeSingle();
    if(bookingError||!booking)return json({ok:false,expected:true,error:'MUTATION_REQUEST_NOT_ACCESSIBLE',action,requestId});
    if(mode==='history'){
      const {data,error}=await admin.from('booking_reservation_mutation_reconciliation_attempts').select('*').eq(action==='modify'?'modify_request_id':'cancel_request_id',requestId).order('started_at',{ascending:false}).limit(Math.min(Math.max(Number(body?.limit)||25,1),100)); if(error)throw error;
      return json({ok:true,version:VERSION,build:BUILD,core:CORE,request:mutation,attempts:data||[]});
    }
    if(mode==='get')return json({ok:true,version:VERSION,build:BUILD,core:CORE,request:mutation,currentBookingStatus:booking.status});
    if(mutation.provider_outcome_known===true||mutation.reconciliation_required!==true){
      return json({ok:true,idempotent:true,resolved:true,action,requestId,bookingId:mutation.booking_id,mutationLifecycleState:mutation.mutation_lifecycle_state,reconciliationRequired:false,providerOutcomeKnown:Boolean(mutation.provider_outcome_known)});
    }
    const providerId=low(mutation.provider_id),reservationReference=clean(mutation.reservation_reference);
    const {data:cap,error:capError}=providerId?await admin.from('booking_provider_capabilities').select('*').eq('provider_id',providerId).maybeSingle():({data:null,error:null} as any); if(capError)throw capError;
    const strategy=cap?.supports_status_polling===true?'polling':cap?.supports_status_webhook===true?'await_webhook':'manual_review';
    const attemptRecord:any={trip_id:mutation.trip_id,booking_id:mutation.booking_id,action,modify_request_id:action==='modify'?requestId:null,cancel_request_id:action==='cancel'?requestId:null,provider_id:providerId||null,reservation_reference:reservationReference||null,strategy,state:'started',evidence:{runtimeVersion:VERSION,build:BUILD,core:CORE,mutationState:mutation.state,mutationLifecycleState:mutation.mutation_lifecycle_state,neverReplayMutation:true}};
    const {data:attempt,error:attemptError}=await admin.from('booking_reservation_mutation_reconciliation_attempts').insert(attemptRecord).select('*').single(); if(attemptError)throw attemptError;
    const now=new Date().toISOString();
    const finish=async(state:string,errorCode:string|null,extra:any={},expected=true)=>{
      await admin.from('booking_reservation_mutation_reconciliation_attempts').update({state,expected_state:expected,error_code:errorCode,finished_at:new Date().toISOString(),evidence:{...(attempt.evidence||{}),...extra}}).eq('id',attempt.id);
      await admin.from(table).update({reconciliation_attempt_count:(mutation.reconciliation_attempt_count||0)+1,last_reconciliation_at:now,last_reconciliation_state:state,last_reconciliation_error:errorCode,next_reconciliation_at:state==='unresolved'?new Date(Date.now()+15*60*1000).toISOString():null}).eq('id',requestId);
      return json({ok:false,expected,error:errorCode,action,requestId,bookingId:mutation.booking_id,providerId,strategy,reconciliationRequired:true,providerOutcomeKnown:false,attemptId:attempt.id,...extra});
    };
    if(!providerId||!reservationReference)return finish('blocked','PROVIDER_RESERVATION_REFERENCE_REQUIRED',{reservationReferencePresent:Boolean(reservationReference)});
    if(!cap||cap.active!==true)return finish('blocked','PROVIDER_DISABLED');
    if(cap.luvia_access_state!=='connected')return finish('blocked','PARTNER_REQUIRED',{accessState:cap.luvia_access_state});
    if(cap.supports_status_polling!==true){
      return finish('awaiting_provider',cap.supports_status_webhook===true?'RECONCILIATION_AWAITING_WEBHOOK':'RECONCILIATION_STATUS_READ_NOT_SUPPORTED',{supportsStatusWebhook:cap.supports_status_webhook===true});
    }
    const providerFunction=PROVIDER_FUNCTIONS[providerId];
    if(!providerFunction)return finish('awaiting_provider','RECONCILIATION_STATUS_READ_TRANSPORT_NOT_IMPLEMENTED',{supportsStatusPolling:true});
    const {data:connection,error:connectionError}=await admin.from('booking_provider_connections').select('connection_state,probe_state,status_return_state,last_probe_at').eq('provider_id',providerId).maybeSingle(); if(connectionError)throw connectionError;
    if(connection?.connection_state!=='connected')return finish('blocked','CONNECTION_NOT_READY',{connectionState:connection?.connection_state||null});
    if(connection?.probe_state!=='healthy')return finish('blocked','LIVE_PROBE_NOT_HEALTHY',{probeState:connection?.probe_state||null});
    if(!['ready','active'].includes(low(connection?.status_return_state)))return finish('blocked','STATUS_RETURN_NOT_READY',{statusReturnState:connection?.status_return_state||null});
    await admin.from('booking_reservation_mutation_reconciliation_attempts').update({state:'polling'}).eq('id',attempt.id);
    const started=Date.now(); const response=await fetch(`${url}/functions/v1/${providerFunction}`,{method:'POST',headers:{Authorization:auth,apikey:anon,'Content-Type':'application/json'},body:JSON.stringify({action:'get_reservation',reservationReference,bookingId:mutation.booking_id,reconciliationRequestId:requestId})});
    const latency=Date.now()-started; const data=await response.json().catch(()=>({}));
    if(data?.expected===true||data?.ok===false){
      await admin.from('booking_reservation_mutation_reconciliation_attempts').update({provider_http_status:response.status,provider_latency_ms:latency}).eq('id',attempt.id);
      return finish('unresolved',clean(data?.error)||'RECONCILIATION_PROVIDER_STATUS_UNAVAILABLE',{providerResponse:data,providerHttpStatus:response.status,providerLatencyMs:latency});
    }
    if(!response.ok)return finish('failed','RECONCILIATION_PROVIDER_STATUS_REQUEST_FAILED',{providerHttpStatus:response.status,providerLatencyMs:latency},false);
    const providerStatus=clean(data?.providerStatus||data?.provider_status||data?.reservationStatus||data?.reservation_status||data?.status);
    const normalized=explicitMutationStatus(action,data); const luvia=proposedLuviaStatus(action,normalized,data);
    const sourceEventId=clean(data?.externalEventId||data?.external_event_id)||`reconciliation:${providerId}:${requestId}:${attempt.id}`;
    const {data:lifecycle,error:lifecycleError}=await admin.rpc('luvia_booking_ingest_reservation_mutation_status',{p_action:action,p_request_id:requestId,p_provider_status:providerStatus||'reconciliation_poll',p_normalized_mutation_status:normalized,p_source:'provider_polling',p_source_event_id:sourceEventId,p_proposed_luvia_status:luvia,p_confidence:1,p_evidence:{source:'booking-provider-reservation-reconcile',reconciliationAttemptId:attempt.id,providerResponse:data,neverReplayedMutation:true},p_occurred_at:null});
    if(lifecycleError)throw lifecycleError;
    const resolved=Boolean(lifecycle?.providerOutcomeKnown)&&!Boolean(lifecycle?.reconciliationRequired);
    const finalState=resolved?'resolved':'unresolved';
    await admin.from('booking_reservation_mutation_reconciliation_attempts').update({state:finalState,expected_state:!resolved,error_code:resolved?null:'RECONCILIATION_OUTCOME_STILL_UNKNOWN',provider_status:providerStatus||null,normalized_mutation_status:normalized,lifecycle_event_id:lifecycle?.lifecycleEventId||null,status_signal_id:lifecycle?.statusSignalId||null,provider_http_status:response.status,provider_latency_ms:latency,reconciliation_required_after:Boolean(lifecycle?.reconciliationRequired),provider_outcome_known_after:Boolean(lifecycle?.providerOutcomeKnown),finished_at:new Date().toISOString(),evidence:{providerResponse:data,neverReplayedMutation:true}}).eq('id',attempt.id);
    await admin.from(table).update({reconciliation_attempt_count:(mutation.reconciliation_attempt_count||0)+1,last_reconciliation_at:now,last_reconciliation_state:finalState,last_reconciliation_error:resolved?null:'RECONCILIATION_OUTCOME_STILL_UNKNOWN',next_reconciliation_at:resolved?null:new Date(Date.now()+15*60*1000).toISOString()}).eq('id',requestId);
    return json({ok:true,action,requestId,bookingId:mutation.booking_id,providerId,reservationReference,attemptId:attempt.id,resolved,mutationLifecycleState:lifecycle?.mutationLifecycleState,reconciliationRequired:Boolean(lifecycle?.reconciliationRequired),providerOutcomeKnown:Boolean(lifecycle?.providerOutcomeKnown),lifecycleEventId:lifecycle?.lifecycleEventId||null,statusSignalId:lifecycle?.statusSignalId||null,source:'provider_polling',neverReplayedMutation:true});
  }catch(error){console.error('[booking-provider-reservation-reconcile]',error);return json({error:'RESERVATION_MUTATION_RECONCILIATION_FAILED',details:error instanceof Error?error.message:String(error)},500);}
});
