import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const VERSION='1.0.0';
const BUILD='13.61.0';
const CORE='4.61.0';
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
  quandoo:'booking-provider-quandoo',
  thefork:'booking-provider-thefork',
  zenchef:'booking-provider-zenchef',
  opentable:'booking-provider-opentable',
  sevenrooms:'booking-provider-sevenrooms',
  resy:'booking-provider-resy'
};
const expectedCode=(state:string)=>({
  unsupported:'AVAILABILITY_NOT_SUPPORTED',
  partner_required:'PARTNER_REQUIRED',
  connection_not_ready:'CONNECTION_NOT_READY',
  transport_not_ready:'AVAILABILITY_TRANSPORT_NOT_ACTIVE',
  probe_not_healthy:'LIVE_PROBE_NOT_HEALTHY',
  disabled:'PROVIDER_DISABLED'
} as Record<string,string>)[state]||'AVAILABILITY_NOT_READY';
function validDate(v:string){return /^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(`${v}T00:00:00Z`));}
function validTime(v:string){return !v||/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(v);}
function validUuid(v:string|null){return !v||/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);}
function safeSlot(raw:any,index:number){
  if(!raw||typeof raw!=='object')return null;
  const startsAt=clean(raw.startsAt||raw.startAt||raw.start_at||raw.datetime||raw.dateTime);
  const endsAt=clean(raw.endsAt||raw.endAt||raw.end_at);
  const localDate=clean(raw.localDate||raw.date||raw.serviceDate);
  const localTime=clean(raw.localTime||raw.time||raw.startTime);
  const providerSlotReference=clean(raw.providerSlotReference||raw.slotReference||raw.slotId||raw.id||raw.token);
  const available=raw.available===false?false:true;
  if(!startsAt&&!localTime&&!providerSlotReference)return null;
  return {
    index,
    startsAt:startsAt||null,
    endsAt:endsAt||null,
    localDate:localDate||null,
    localTime:localTime||null,
    providerSlotReference:providerSlotReference||null,
    available,
    partySize:Number.isFinite(Number(raw.partySize))?Number(raw.partySize):null,
    label:clean(raw.label||raw.displayTime)||null,
    metadata:raw.metadata&&typeof raw.metadata==='object'?raw.metadata:{}
  };
}
function normalizeSlots(data:any){
  const source=Array.isArray(data?.slots)?data.slots:Array.isArray(data?.availability?.slots)?data.availability.slots:Array.isArray(data?.data?.slots)?data.data.slots:[];
  return source.map((x:any,i:number)=>safeSlot(x,i)).filter(Boolean);
}
async function sha256(input:string){const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(input));return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');}

Deno.serve(async req=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
  if(req.method!=='POST')return json({error:'METHOD_NOT_ALLOWED'},405);
  const started=Date.now();
  let requestId:string|null=null;
  try{
    const url=Deno.env.get('SUPABASE_URL')!;
    const anon=Deno.env.get('SUPABASE_ANON_KEY')!;
    const service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const auth=req.headers.get('Authorization')||'';
    const userClient=createClient(url,anon,{global:{headers:{Authorization:auth}}});
    const {data:{user},error:userError}=await userClient.auth.getUser();
    if(userError||!user)return json({error:'AUTH_REQUIRED'},401);
    const admin=createClient(url,service,{auth:{persistSession:false}});
    const body=await req.json().catch(()=>({}));
    const providerId=low(body?.providerId||body?.provider_id);
    const venueReference=clean(body?.venueReference||body?.venue_reference);
    const date=clean(body?.date||body?.requestedDate);
    const time=clean(body?.time||body?.requestedTime);
    const partySize=Number(body?.partySize||body?.party_size);
    const timezone=clean(body?.timezone);
    const tripId=clean(body?.tripId||body?.trip_id)||null;
    const bookingId=clean(body?.bookingId||body?.booking_id)||null;
    if(!providerId)return json({error:'PROVIDER_REQUIRED'},400);
    if(!venueReference)return json({error:'VENUE_REFERENCE_REQUIRED'},400);
    if(!validDate(date))return json({error:'VALID_DATE_REQUIRED'},400);
    if(!validTime(time))return json({error:'INVALID_TIME'},400);
    if(!Number.isInteger(partySize)||partySize<1||partySize>1000)return json({error:'INVALID_PARTY_SIZE'},400);
    if(!validUuid(tripId))return json({error:'INVALID_TRIP_ID'},400);
    if(!validUuid(bookingId))return json({error:'INVALID_BOOKING_ID'},400);

    const fingerprint=await sha256([providerId,venueReference,date,time,partySize,timezone,tripId||'',bookingId||''].join('|'));
    const {data:created,error:createError}=await admin.from('booking_availability_requests').insert({
      requested_by:user.id,trip_id:tripId,booking_id:bookingId,provider_id:providerId,venue_reference:venueReference,
      requested_date:date,requested_time:time||null,party_size:partySize,timezone:timezone||null,request_fingerprint:fingerprint,
      evidence:{runtimeVersion:VERSION,build:BUILD,core:CORE}
    }).select('id').single();
    if(createError)throw createError;
    requestId=created.id;

    const {data:ready,error:readyError}=await admin.from('booking_provider_availability_readiness_v1').select('*').eq('provider_id',providerId).maybeSingle();
    if(readyError)throw readyError;
    if(!ready){
      await admin.from('booking_availability_requests').update({state:'blocked',expected_state:true,error_code:'PROVIDER_NOT_FOUND',finished_at:new Date().toISOString()}).eq('id',requestId);
      return json({ok:false,expected:true,error:'PROVIDER_NOT_FOUND',providerId,requestId,slots:[]});
    }
    if(ready.availability_runtime_state!=='ready'){
      const error=expectedCode(String(ready.availability_runtime_state));
      await admin.from('booking_availability_requests').update({state:'blocked',expected_state:true,error_code:error,provider_latency_ms:Date.now()-started,evidence:{runtimeState:ready.availability_runtime_state,runtimeReason:ready.availability_runtime_reason},finished_at:new Date().toISOString()}).eq('id',requestId);
      return json({ok:false,expected:true,error,providerId,requestId,slots:[],availabilityState:ready.availability_runtime_state,reason:ready.availability_runtime_reason});
    }

    const fn=PROVIDER_FUNCTIONS[providerId];
    if(!fn){
      await admin.from('booking_availability_requests').update({state:'blocked',expected_state:true,error_code:'AVAILABILITY_ADAPTER_NOT_IMPLEMENTED',finished_at:new Date().toISOString()}).eq('id',requestId);
      return json({ok:false,expected:true,error:'AVAILABILITY_ADAPTER_NOT_IMPLEMENTED',providerId,requestId,slots:[]});
    }

    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),6500);
    let providerResponse:any;
    let httpStatus=0;
    const providerStarted=Date.now();
    try{
      const res=await fetch(`${url}/functions/v1/${fn}`,{
        method:'POST',
        headers:{'Authorization':auth,'apikey':anon,'Content-Type':'application/json'},
        body:JSON.stringify({action:'availability',venueReference,date,time:time||null,partySize,timezone:timezone||null,tripId,bookingId}),
        signal:controller.signal
      });
      httpStatus=res.status;
      providerResponse=await res.json().catch(()=>({ok:false,error:'INVALID_PROVIDER_RESPONSE'}));
    }catch(error){
      const timedOut=error instanceof DOMException&&error.name==='AbortError';
      const code=timedOut?'PROVIDER_AVAILABILITY_TIMEOUT':'PROVIDER_AVAILABILITY_NETWORK_ERROR';
      await admin.from('booking_availability_requests').update({state:timedOut?'timed_out':'failed',expected_state:false,error_code:code,provider_latency_ms:Date.now()-providerStarted,finished_at:new Date().toISOString()}).eq('id',requestId);
      return json({ok:false,error:code,providerId,requestId,slots:[]},timedOut?504:502);
    }finally{clearTimeout(timer);}

    const latency=Date.now()-providerStarted;
    if(providerResponse?.expected===true||providerResponse?.ok===false){
      const error=clean(providerResponse?.error)||'PROVIDER_AVAILABILITY_NOT_READY';
      await admin.from('booking_availability_requests').update({state:'blocked',expected_state:true,error_code:error,provider_latency_ms:latency,evidence:{providerHttpStatus:httpStatus},finished_at:new Date().toISOString()}).eq('id',requestId);
      return json({ok:false,expected:true,error,providerId,requestId,slots:[],details:providerResponse?.details||null});
    }

    const slots=normalizeSlots(providerResponse);
    await admin.from('booking_availability_snapshots').insert({availability_request_id:requestId,provider_id:providerId,venue_reference:venueReference,requested_date:date,party_size:partySize,slots,provider_response_meta:{httpStatus,latencyMs:latency,providerAdapter:fn}});
    await admin.from('booking_availability_requests').update({state:'completed',expected_state:false,error_code:null,result_count:slots.length,provider_latency_ms:latency,evidence:{providerHttpStatus:httpStatus,normalizedSlotCount:slots.length},finished_at:new Date().toISOString()}).eq('id',requestId);
    return json({ok:true,version:VERSION,providerId,requestId,venueReference,date,time:time||null,partySize,timezone:timezone||null,slots,count:slots.length,source:'provider_api'});
  }catch(error){
    console.error('[booking-provider-availability]',error);
    if(requestId){try{const admin=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});await admin.from('booking_availability_requests').update({state:'failed',error_code:'AVAILABILITY_RUNTIME_FAILED',finished_at:new Date().toISOString()}).eq('id',requestId);}catch{}}
    return json({error:'AVAILABILITY_RUNTIME_FAILED',details:error instanceof Error?error.message:String(error)},500);
  }
});
