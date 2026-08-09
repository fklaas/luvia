import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const VERSION='1.0.0';
const BUILD='13.63.0';
const CORE='4.63.0';
const cors={
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods':'POST, OPTIONS',
  'Content-Type':'application/json'
};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:cors});
const clean=(v:unknown)=>String(v??'').trim();
const low=(v:unknown)=>clean(v).toLowerCase();
const PROVIDER_FUNCTIONS:Record<string,string>={
  quandoo:'booking-provider-quandoo',thefork:'booking-provider-thefork',zenchef:'booking-provider-zenchef',
  opentable:'booking-provider-opentable',sevenrooms:'booking-provider-sevenrooms',resy:'booking-provider-resy'
};
const ACTIONS:Record<string,Record<string,string>>={
  modify:{zenchef:'update_reservation'},
  cancel:{opentable:'cancel_reservation',sevenrooms:'cancel_reservation',resy:'cancel_reservation'}
};
const TABLES={modify:'booking_reservation_modify_requests',cancel:'booking_reservation_cancel_requests'} as const;
const VIEWS={modify:'booking_provider_reservation_modify_readiness_v1',cancel:'booking_provider_reservation_cancel_readiness_v1'} as const;
const STATE_FIELDS={modify:'reservation_modify_runtime_state',cancel:'reservation_cancel_runtime_state'} as const;
const REASON_FIELDS={modify:'reservation_modify_runtime_reason',cancel:'reservation_cancel_runtime_reason'} as const;
const MUTABLE_STATES=new Set(['requested','awaiting_reply','alternative_proposed','needs_action','confirmed']);
function validUuid(v:string){return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);}
function validDate(v:string){return !v||(/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(`${v}T00:00:00Z`)));}
function validTime(v:string){return !v||/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(v);}
async function sha256(input:string){const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(input));return Array.from(new Uint8Array(d)).map(b=>b.toString(16).padStart(2,'0')).join('');}
function expectedCode(action:'modify'|'cancel',state:string){
  const prefix=action==='modify'?'RESERVATION_MODIFY':'RESERVATION_CANCEL';
  return ({unsupported:`${prefix}_NOT_SUPPORTED`,partner_required:'PARTNER_REQUIRED',connection_not_ready:'CONNECTION_NOT_READY',transport_not_ready:`${prefix}_TRANSPORT_NOT_ACTIVE`,probe_not_healthy:'LIVE_PROBE_NOT_HEALTHY',disabled:'PROVIDER_DISABLED'} as Record<string,string>)[state]||`${prefix}_NOT_READY`;
}
function normalizedProviderStatus(data:any){return clean(data?.providerStatus||data?.provider_status||data?.status||data?.reservationStatus||data?.reservation_status);}
function normalizedLuviaStatus(action:'modify'|'cancel',data:any){
  const n=low(data?.normalizedStatus||data?.normalized_status||data?.luviaStatus||data?.luvia_status);
  if(['requested','awaiting_reply','alternative_proposed','needs_action','confirmed','declined','cancelled','failed'].includes(n))return n;
  if(action==='cancel'&&(data?.cancelled===true||['cancelled','canceled','reservation_cancelled','reservation_canceled'].includes(low(data?.status))))return 'cancelled';
  if(action==='modify'){
    if(data?.alternativeProposed===true||data?.alternative_proposed===true)return 'alternative_proposed';
    if(data?.needsAction===true||data?.needs_action===true)return 'needs_action';
    if(data?.confirmed===true)return 'confirmed';
  }
  return null;
}

Deno.serve(async req=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
  if(req.method!=='POST')return json({error:'METHOD_NOT_ALLOWED'},405);
  let requestId:string|null=null; let table:string|null=null;
  try{
    const url=Deno.env.get('SUPABASE_URL')!; const anon=Deno.env.get('SUPABASE_ANON_KEY')!; const service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const auth=req.headers.get('Authorization')||'';
    const userClient=createClient(url,anon,{global:{headers:{Authorization:auth}}});
    const {data:{user},error:userError}=await userClient.auth.getUser();
    if(userError||!user)return json({error:'AUTH_REQUIRED'},401);
    const admin=createClient(url,service,{auth:{persistSession:false}});
    const body=await req.json().catch(()=>({}));
    const action=low(body?.action) as 'modify'|'cancel';
    if(action!=='modify'&&action!=='cancel')return json({error:'VALID_MUTATION_ACTION_REQUIRED'},400);
    table=TABLES[action];
    const bookingId=clean(body?.bookingId||body?.booking_id);
    if(!validUuid(bookingId))return json({error:'VALID_BOOKING_ID_REQUIRED'},400);

    const date=clean(body?.date||body?.requestedDate),time=clean(body?.time||body?.requestedTime),timezone=clean(body?.timezone)||null;
    const rawParty=body?.partySize??body?.party_size; const partySize=rawParty==null||rawParty===''?null:Number(rawParty);
    const reason=clean(body?.reason)||null,notes=clean(body?.notes)||null;
    if(action==='modify'){
      if(!date&&!time&&partySize==null)return json({error:'RESERVATION_MODIFICATION_REQUIRED'},400);
      if(!validDate(date))return json({error:'INVALID_DATE'},400);
      if(!validTime(time))return json({error:'INVALID_TIME'},400);
      if(partySize!=null&&(!Number.isInteger(partySize)||partySize<1||partySize>1000))return json({error:'INVALID_PARTY_SIZE'},400);
    }

    // RLS-backed access check. Provider identity and reservation reference are resolved server-side.
    const {data:booking,error:bookingError}=await userClient.from('bookings').select('*').eq('id',bookingId).maybeSingle();
    if(bookingError||!booking)return json({ok:false,expected:true,error:'BOOKING_NOT_ACCESSIBLE',bookingId});
    const bookingState=low(booking.status);
    if(bookingState==='cancelled')return json({ok:false,expected:true,error:'BOOKING_ALREADY_CANCELLED',bookingId,status:booking.status});
    if(!MUTABLE_STATES.has(bookingState))return json({ok:false,expected:true,error:action==='modify'?'BOOKING_STATE_NOT_MODIFIABLE':'BOOKING_STATE_NOT_CANCELLABLE',bookingId,status:booking.status});

    const {data:refs,error:refError}=await admin.from('booking_provider_references').select('*').eq('booking_id',bookingId).not('reservation_reference','is',null).order('updated_at',{ascending:false}).limit(2);
    if(refError)throw refError;
    const ref=(refs||[])[0];
    if(!ref||!clean(ref.reservation_reference))return json({ok:false,expected:true,error:'PROVIDER_RESERVATION_REFERENCE_REQUIRED',bookingId});
    const providerId=low(ref.provider_id); const reservationReference=clean(ref.reservation_reference);
    if(booking.provider&&low(booking.provider)!==providerId)return json({ok:false,expected:true,error:'BOOKING_PROVIDER_REFERENCE_MISMATCH',bookingId,bookingProvider:low(booking.provider),referenceProvider:providerId});

    const fingerprint=await sha256([action,bookingId,providerId,reservationReference,date,time,partySize??'',timezone||'',reason||''].join('|'));
    const idem=clean(body?.idempotencyKey||body?.idempotency_key)||fingerprint;
    const {data:existing}=await admin.from(table).select('*').eq('booking_id',bookingId).eq('idempotency_key',idem).maybeSingle();
    if(existing?.state==='completed')return json({ok:true,idempotent:true,action,providerId,bookingId,requestId:existing.id,reservationReference,luviaStatus:existing.luvia_status,source:'provider_api'});
    if(existing&&['calling_provider','applying'].includes(existing.state))return json({ok:false,expected:true,error:'RESERVATION_MUTATION_IN_PROGRESS',action,providerId,bookingId,requestId:existing.id});
    if(existing&&['timed_out','failed'].includes(existing.state))return json({ok:false,expected:true,error:'RESERVATION_MUTATION_RECONCILIATION_REQUIRED',action,providerId,bookingId,requestId:existing.id,previousState:existing.state});

    if(existing){
      requestId=existing.id;
      await admin.from(table).update({state:'received',attempt_count:(existing.attempt_count||0)+1,error_code:null,expected_state:false,finished_at:null,evidence:{...(existing.evidence||{}),retryAt:new Date().toISOString(),build:BUILD,core:CORE}}).eq('id',requestId);
    }else{
      const record:any={requested_by:user.id,trip_id:booking.trip_id,booking_id:bookingId,provider_id:providerId,reservation_reference:reservationReference,idempotency_key:idem,request_fingerprint:fingerprint,evidence:{runtimeVersion:VERSION,build:BUILD,core:CORE,referenceId:ref.id,referenceState:ref.reference_state}};
      if(action==='modify'){record.requested_date=date||null;record.requested_time=time||null;record.party_size=partySize;record.timezone=timezone;record.evidence={...record.evidence,notes};}
      else record.evidence={...record.evidence,reason};
      const {data:created,error:createError}=await admin.from(table).insert(record).select('id').single();
      if(createError)throw createError;requestId=created.id;
    }

    const {data:ready,error:readyError}=await admin.from(VIEWS[action]).select('*').eq('provider_id',providerId).maybeSingle();
    if(readyError)throw readyError;
    if(!ready){await admin.from(table).update({state:'blocked',expected_state:true,error_code:'PROVIDER_NOT_FOUND',finished_at:new Date().toISOString()}).eq('id',requestId);return json({ok:false,expected:true,error:'PROVIDER_NOT_FOUND',action,providerId,bookingId,requestId});}
    const runtimeState=String(ready[STATE_FIELDS[action]]||''); const runtimeReason=String(ready[REASON_FIELDS[action]]||'');
    if(runtimeState!=='ready'){
      const error=expectedCode(action,runtimeState);
      await admin.from(table).update({state:'blocked',expected_state:true,error_code:error,evidence:{runtimeState,runtimeReason,reservationReferencePresent:true},finished_at:new Date().toISOString()}).eq('id',requestId);
      return json({ok:false,expected:true,error,action,providerId,bookingId,requestId,reservationReference,reservationMutationState:runtimeState,reason:runtimeReason,luviaStatus:booking.status});
    }
    const fn=PROVIDER_FUNCTIONS[providerId],providerAction=ACTIONS[action]?.[providerId];
    if(!fn||!providerAction){const error=action==='modify'?'RESERVATION_MODIFY_ADAPTER_NOT_IMPLEMENTED':'RESERVATION_CANCEL_ADAPTER_NOT_IMPLEMENTED';await admin.from(table).update({state:'blocked',expected_state:true,error_code:error,finished_at:new Date().toISOString()}).eq('id',requestId);return json({ok:false,expected:true,error,action,providerId,bookingId,requestId});}

    await admin.from(table).update({state:'calling_provider'}).eq('id',requestId);
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),8000);const started=Date.now();let providerResponse:any;let httpStatus=0;
    try{
      const payload:any={action:providerAction,bookingId,reservationReference,idempotencyKey:idem};
      if(action==='modify')Object.assign(payload,{date:date||null,time:time||null,partySize,timezone,notes}); else payload.reason=reason;
      const res=await fetch(`${url}/functions/v1/${fn}`,{method:'POST',headers:{Authorization:auth,apikey:anon,'Content-Type':'application/json'},body:JSON.stringify(payload),signal:controller.signal});
      httpStatus=res.status;providerResponse=await res.json().catch(()=>({ok:false,error:'INVALID_PROVIDER_RESPONSE'}));
    }catch(error){
      const timedOut=error instanceof DOMException&&error.name==='AbortError';const code=timedOut?'PROVIDER_RESERVATION_MUTATION_TIMEOUT':'PROVIDER_RESERVATION_MUTATION_NETWORK_ERROR';
      await admin.from(table).update({state:timedOut?'timed_out':'failed',error_code:code,provider_latency_ms:Date.now()-started,evidence:{ambiguousProviderOutcome:true,requiresReconciliation:true},finished_at:new Date().toISOString()}).eq('id',requestId);
      return json({ok:false,error:code,action,providerId,bookingId,requestId,reconciliationRequired:true},timedOut?504:502);
    }finally{clearTimeout(timer);}

    const latency=Date.now()-started;
    if(providerResponse?.expected===true||providerResponse?.ok===false){
      const error=clean(providerResponse?.error)||'PROVIDER_RESERVATION_MUTATION_NOT_READY';
      await admin.from(table).update({state:'blocked',expected_state:true,error_code:error,provider_latency_ms:latency,evidence:{providerHttpStatus:httpStatus},finished_at:new Date().toISOString()}).eq('id',requestId);
      return json({ok:false,expected:true,error,action,providerId,bookingId,requestId,reservationReference,details:providerResponse?.details||null});
    }

    const pStatus=normalizedProviderStatus(providerResponse)|| (action==='modify'?'MODIFIED':'CANCEL_REQUEST_ACCEPTED');
    const luviaStatus=normalizedLuviaStatus(action,providerResponse);
    await admin.from(table).update({state:'applying',provider_latency_ms:latency,provider_status:pStatus,luvia_status:luviaStatus,evidence:{providerHttpStatus:httpStatus,verifiedProviderApiResponse:true,responseHadExplicitLuviaStatus:Boolean(luviaStatus)}}).eq('id',requestId);

    let statusSignalId:string|null=null;
    if(luviaStatus){
      const sourceEventId=`provider_api:${action}:${providerId}:${requestId}`;
      const {data:signal,error:signalError}=await admin.rpc('luvia_booking_ingest_status_signal',{p_booking_id:bookingId,p_provider_id:providerId,p_provider_reference:reservationReference,p_provider_status:pStatus,p_proposed_luvia_status:luviaStatus,p_source:'provider_api',p_source_event_id:sourceEventId,p_confidence:1,p_evidence:{mutationRequestId:requestId,mutationAction:action,providerHttpStatus:httpStatus,verifiedProviderApiResponse:true},p_occurred_at:new Date().toISOString()});
      if(signalError)throw signalError;
      statusSignalId=clean(signal?.signalId||signal?.signal_id||signal?.id)||null;
    }
    if(action==='cancel'&&luviaStatus==='cancelled'){
      await admin.rpc('luvia_booking_provider_reference_upsert',{p_booking_id:bookingId,p_provider_id:providerId,p_venue_reference:ref.venue_reference,p_reservation_reference:reservationReference,p_reference_state:'cancelled',p_metadata:{cancelRequestId:requestId,source:'provider_api'}});
    }
    await admin.from(table).update({state:'completed',status_signal_id:statusSignalId,finished_at:new Date().toISOString(),evidence:{providerHttpStatus:httpStatus,verifiedProviderApiResponse:true,statusAppliedThroughProvenance:Boolean(luviaStatus),bookingStatusNotAssumed:!luviaStatus}}).eq('id',requestId);
    return json({ok:true,action,providerId,bookingId,requestId,reservationReference,providerStatus:pStatus,luviaStatus:luviaStatus||booking.status,statusSignalId,statusChanged:Boolean(luviaStatus),source:'provider_api'});
  }catch(error){
    console.error('[booking-provider-reservation-mutation]',error);
    if(requestId&&table){try{const admin=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});await admin.from(table).update({state:'failed',error_code:'RESERVATION_MUTATION_RUNTIME_FAILED',evidence:{requiresReconciliation:true},finished_at:new Date().toISOString()}).eq('id',requestId);}catch{}}
    return json({error:'RESERVATION_MUTATION_RUNTIME_FAILED',details:error instanceof Error?error.message:String(error)},500);
  }
});
