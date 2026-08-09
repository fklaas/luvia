import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const VERSION='1.0.0';
const BUILD='13.62.0';
const CORE='4.62.0';
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
const expectedCode=(state:string)=>({
  unsupported:'RESERVATION_CREATE_NOT_SUPPORTED',partner_required:'PARTNER_REQUIRED',connection_not_ready:'CONNECTION_NOT_READY',
  transport_not_ready:'RESERVATION_CREATE_TRANSPORT_NOT_ACTIVE',probe_not_healthy:'LIVE_PROBE_NOT_HEALTHY',disabled:'PROVIDER_DISABLED'
} as Record<string,string>)[state]||'RESERVATION_CREATE_NOT_READY';
function validDate(v:string){return /^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(`${v}T00:00:00Z`));}
function validTime(v:string){return !v||/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(v);}
function validUuid(v:string){return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);}
async function sha256(input:string){const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(input));return Array.from(new Uint8Array(d)).map(b=>b.toString(16).padStart(2,'0')).join('');}
function reservationReference(data:any){return clean(data?.reservationReference||data?.reservation_reference||data?.reservationId||data?.reservation_id||data?.confirmationNumber||data?.confirmation_number||data?.id);}
function providerStatus(data:any){return clean(data?.providerStatus||data?.provider_status||data?.status||data?.reservationStatus||data?.reservation_status)||'CREATED';}
function proposedStatus(data:any){const n=low(data?.normalizedStatus||data?.normalized_status||data?.luviaStatus||data?.luvia_status);if(n==='confirmed'||data?.confirmed===true)return 'confirmed';return 'requested';}

Deno.serve(async req=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
  if(req.method!=='POST')return json({error:'METHOD_NOT_ALLOWED'},405);
  let requestId:string|null=null;
  try{
    const url=Deno.env.get('SUPABASE_URL')!; const anon=Deno.env.get('SUPABASE_ANON_KEY')!; const service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const auth=req.headers.get('Authorization')||'';
    const userClient=createClient(url,anon,{global:{headers:{Authorization:auth}}});
    const {data:{user},error:userError}=await userClient.auth.getUser();
    if(userError||!user)return json({error:'AUTH_REQUIRED'},401);
    const admin=createClient(url,service,{auth:{persistSession:false}});
    const body=await req.json().catch(()=>({}));
    const bookingId=clean(body?.bookingId||body?.booking_id), providerId=low(body?.providerId||body?.provider_id), venueReference=clean(body?.venueReference||body?.venue_reference);
    const providerSlotReference=clean(body?.providerSlotReference||body?.provider_slot_reference||body?.slotReference||body?.slot_reference)||null;
    const date=clean(body?.date||body?.requestedDate), time=clean(body?.time||body?.requestedTime), partySize=Number(body?.partySize||body?.party_size), timezone=clean(body?.timezone)||null;
    const guest=body?.guest&&typeof body.guest==='object'?body.guest:{}, notes=clean(body?.notes)||null;
    if(!validUuid(bookingId))return json({error:'VALID_BOOKING_ID_REQUIRED'},400);
    if(!providerId)return json({error:'PROVIDER_REQUIRED'},400);
    if(!venueReference)return json({error:'VENUE_REFERENCE_REQUIRED'},400);
    if(!validDate(date))return json({error:'VALID_DATE_REQUIRED'},400);
    if(!validTime(time))return json({error:'INVALID_TIME'},400);
    if(!Number.isInteger(partySize)||partySize<1||partySize>1000)return json({error:'INVALID_PARTY_SIZE'},400);

    // RLS-backed ownership/membership check: if the user cannot see the booking, creation is forbidden.
    const {data:booking,error:bookingError}=await userClient.from('bookings').select('*').eq('id',bookingId).maybeSingle();
    if(bookingError||!booking)return json({ok:false,expected:true,error:'BOOKING_NOT_ACCESSIBLE',bookingId},200);
    if(['confirmed','cancelled'].includes(low(booking.status)))return json({ok:false,expected:true,error:'BOOKING_STATE_NOT_CREATABLE',bookingId,status:booking.status},200);

    const fingerprint=await sha256([bookingId,providerId,venueReference,providerSlotReference||'',date,time,partySize,timezone||''].join('|'));
    const idem=clean(body?.idempotencyKey||body?.idempotency_key)||fingerprint;
    const {data:existing}=await admin.from('booking_reservation_create_requests').select('*').eq('booking_id',bookingId).eq('idempotency_key',idem).maybeSingle();
    if(existing?.state==='completed')return json({ok:true,idempotent:true,providerId,bookingId,requestId:existing.id,reservationReference:existing.reservation_reference,luviaStatus:existing.luvia_status,source:'provider_api'});
    if(existing&&['calling_provider','applying'].includes(existing.state))return json({ok:false,expected:true,error:'RESERVATION_CREATE_IN_PROGRESS',providerId,bookingId,requestId:existing.id});

    if(existing){
      requestId=existing.id;
      await admin.from('booking_reservation_create_requests').update({state:'received',attempt_count:(existing.attempt_count||0)+1,error_code:null,expected_state:false,finished_at:null,evidence:{...(existing.evidence||{}),retryAt:new Date().toISOString(),build:BUILD,core:CORE}}).eq('id',requestId);
    }else{
      const {data:created,error:createError}=await admin.from('booking_reservation_create_requests').insert({
        requested_by:user.id,trip_id:booking.trip_id,booking_id:bookingId,provider_id:providerId,venue_reference:venueReference,provider_slot_reference:providerSlotReference,
        requested_date:date,requested_time:time||null,party_size:partySize,timezone,idempotency_key:idem,request_fingerprint:fingerprint,
        evidence:{runtimeVersion:VERSION,build:BUILD,core:CORE}
      }).select('id').single();
      if(createError)throw createError; requestId=created.id;
    }

    const {data:ready,error:readyError}=await admin.from('booking_provider_reservation_create_readiness_v1').select('*').eq('provider_id',providerId).maybeSingle();
    if(readyError)throw readyError;
    if(!ready){await admin.from('booking_reservation_create_requests').update({state:'blocked',expected_state:true,error_code:'PROVIDER_NOT_FOUND',finished_at:new Date().toISOString()}).eq('id',requestId);return json({ok:false,expected:true,error:'PROVIDER_NOT_FOUND',providerId,bookingId,requestId});}
    if(ready.reservation_create_runtime_state!=='ready'){
      const error=expectedCode(String(ready.reservation_create_runtime_state));
      await admin.from('booking_reservation_create_requests').update({state:'blocked',expected_state:true,error_code:error,evidence:{runtimeState:ready.reservation_create_runtime_state,runtimeReason:ready.reservation_create_runtime_reason},finished_at:new Date().toISOString()}).eq('id',requestId);
      return json({ok:false,expected:true,error,providerId,bookingId,requestId,reservationReference:null,luviaStatus:booking.status,reservationCreateState:ready.reservation_create_runtime_state,reason:ready.reservation_create_runtime_reason});
    }
    const fn=PROVIDER_FUNCTIONS[providerId];
    if(!fn){await admin.from('booking_reservation_create_requests').update({state:'blocked',expected_state:true,error_code:'RESERVATION_CREATE_ADAPTER_NOT_IMPLEMENTED',finished_at:new Date().toISOString()}).eq('id',requestId);return json({ok:false,expected:true,error:'RESERVATION_CREATE_ADAPTER_NOT_IMPLEMENTED',providerId,bookingId,requestId});}

    await admin.from('booking_reservation_create_requests').update({state:'calling_provider'}).eq('id',requestId);
    const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),8000); const started=Date.now(); let providerResponse:any; let httpStatus=0;
    try{
      const res=await fetch(`${url}/functions/v1/${fn}`,{method:'POST',headers:{Authorization:auth,apikey:anon,'Content-Type':'application/json'},body:JSON.stringify({
        action:'create_reservation',bookingId,venueReference,providerSlotReference,date,time:time||null,partySize,timezone,guest,notes,idempotencyKey:idem
      }),signal:controller.signal});
      httpStatus=res.status; providerResponse=await res.json().catch(()=>({ok:false,error:'INVALID_PROVIDER_RESPONSE'}));
    }catch(error){
      const timedOut=error instanceof DOMException&&error.name==='AbortError'; const code=timedOut?'PROVIDER_RESERVATION_CREATE_TIMEOUT':'PROVIDER_RESERVATION_CREATE_NETWORK_ERROR';
      await admin.from('booking_reservation_create_requests').update({state:timedOut?'timed_out':'failed',error_code:code,provider_latency_ms:Date.now()-started,finished_at:new Date().toISOString()}).eq('id',requestId);
      return json({ok:false,error:code,providerId,bookingId,requestId},timedOut?504:502);
    }finally{clearTimeout(timer);}

    const latency=Date.now()-started;
    if(providerResponse?.expected===true||providerResponse?.ok===false){
      const error=clean(providerResponse?.error)||'PROVIDER_RESERVATION_CREATE_NOT_READY';
      await admin.from('booking_reservation_create_requests').update({state:'blocked',expected_state:true,error_code:error,provider_latency_ms:latency,evidence:{providerHttpStatus:httpStatus},finished_at:new Date().toISOString()}).eq('id',requestId);
      return json({ok:false,expected:true,error,providerId,bookingId,requestId,reservationReference:null,details:providerResponse?.details||null});
    }

    const ref=reservationReference(providerResponse);
    if(!ref){await admin.from('booking_reservation_create_requests').update({state:'failed',error_code:'PROVIDER_RESERVATION_REFERENCE_MISSING',provider_latency_ms:latency,evidence:{providerHttpStatus:httpStatus},finished_at:new Date().toISOString()}).eq('id',requestId);return json({ok:false,error:'PROVIDER_RESERVATION_REFERENCE_MISSING',providerId,bookingId,requestId},502);}
    const pStatus=providerStatus(providerResponse), luviaStatus=proposedStatus(providerResponse), sourceEventId=`create:${providerId}:${ref}`;
    await admin.from('booking_reservation_create_requests').update({state:'applying',reservation_reference:ref,provider_status:pStatus,luvia_status:luviaStatus,provider_latency_ms:latency}).eq('id',requestId);

    const {error:refError}=await admin.rpc('luvia_booking_provider_reference_upsert',{p_booking_id:bookingId,p_provider_id:providerId,p_venue_reference:venueReference,p_reservation_reference:ref,p_reference_state:luviaStatus==='confirmed'?'active':'created',p_metadata:{creationRequestId:requestId,source:'provider_api'}});
    if(refError)throw refError;
    const {data:signal,error:signalError}=await admin.rpc('luvia_booking_ingest_status_signal',{p_booking_id:bookingId,p_provider_id:providerId,p_provider_reference:ref,p_provider_status:pStatus,p_proposed_luvia_status:luviaStatus,p_source:'provider_api',p_source_event_id:sourceEventId,p_confidence:1,p_evidence:{creationRequestId:requestId,providerHttpStatus:httpStatus,verifiedProviderApiResponse:true},p_occurred_at:new Date().toISOString()});
    if(signalError)throw signalError;

    await admin.from('booking_reservation_create_requests').update({state:'completed',expected_state:false,error_code:null,reservation_reference:ref,provider_status:pStatus,luvia_status:luviaStatus,status_signal_id:signal?.signalId||signal?.signal_id||null,evidence:{providerHttpStatus:httpStatus,providerAdapter:fn,normalizedStatus:luviaStatus},finished_at:new Date().toISOString()}).eq('id',requestId);
    return json({ok:true,version:VERSION,providerId,bookingId,requestId,reservationReference:ref,providerStatus:pStatus,luviaStatus,statusApplied:signal||null,source:'provider_api'});
  }catch(error){
    console.error('[booking-provider-reservation-create]',error);
    if(requestId){try{const admin=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});await admin.from('booking_reservation_create_requests').update({state:'failed',error_code:'RESERVATION_CREATE_RUNTIME_FAILED',finished_at:new Date().toISOString()}).eq('id',requestId);}catch{}}
    return json({error:'RESERVATION_CREATE_RUNTIME_FAILED',details:error instanceof Error?error.message:String(error)},500);
  }
});
