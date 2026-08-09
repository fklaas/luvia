import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
const VERSION='1.0.0',BUILD='13.64.0',CORE='4.64.0';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json'};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:cors});
const clean=(v:unknown)=>String(v??'').trim();
const low=(v:unknown)=>clean(v).toLowerCase();
const validUuid=(v:string)=>/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
const TABLES={modify:'booking_reservation_modify_requests',cancel:'booking_reservation_cancel_requests'} as const;
Deno.serve(async req=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
  if(req.method!=='POST')return json({error:'METHOD_NOT_ALLOWED'},405);
  try{
    const url=Deno.env.get('SUPABASE_URL')!,anon=Deno.env.get('SUPABASE_ANON_KEY')!,service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const auth=req.headers.get('Authorization')||'';
    const userClient=createClient(url,anon,{global:{headers:{Authorization:auth}}});
    const {data:{user},error:userError}=await userClient.auth.getUser();
    if(userError||!user)return json({error:'AUTH_REQUIRED'},401);
    const admin=createClient(url,service,{auth:{persistSession:false}});
    const body=await req.json().catch(()=>({}));
    const action=low(body?.action) as 'modify'|'cancel';
    const requestId=clean(body?.requestId||body?.request_id);
    const mode=low(body?.mode)||'get';
    if(action!=='modify'&&action!=='cancel')return json({error:'VALID_MUTATION_ACTION_REQUIRED'},400);
    if(!validUuid(requestId))return json({error:'VALID_MUTATION_REQUEST_ID_REQUIRED'},400);
    if(mode!=='get'&&mode!=='history')return json({error:'VALID_STATUS_MODE_REQUIRED'},400);
    const {data:mutation,error:mutationError}=await admin.from(TABLES[action]).select('*').eq('id',requestId).maybeSingle();
    if(mutationError)throw mutationError;
    if(!mutation)return json({ok:false,expected:true,error:'MUTATION_REQUEST_NOT_ACCESSIBLE',action,requestId});
    const {data:booking,error:bookingError}=await userClient.from('bookings').select('id,status,trip_id,provider').eq('id',mutation.booking_id).maybeSingle();
    if(bookingError||!booking)return json({ok:false,expected:true,error:'MUTATION_REQUEST_NOT_ACCESSIBLE',action,requestId});
    let q=admin.from('booking_reservation_mutation_status_events').select('*').eq(action==='modify'?'modify_request_id':'cancel_request_id',requestId).order('occurred_at',{ascending:false}).order('received_at',{ascending:false});
    if(mode==='get')q=q.limit(1); else q=q.limit(Math.min(Math.max(Number(body?.limit)||25,1),100));
    const {data:events,error:eventsError}=await q;if(eventsError)throw eventsError;
    const lifecycle={action,requestId,bookingId:mutation.booking_id,providerId:mutation.provider_id,reservationReference:mutation.reservation_reference,requestState:mutation.state,mutationLifecycleState:mutation.mutation_lifecycle_state||'not_started',reconciliationRequired:Boolean(mutation.reconciliation_required),providerOutcomeKnown:Boolean(mutation.provider_outcome_known),lastLifecycleSource:mutation.last_lifecycle_source,lastLifecycleAt:mutation.last_lifecycle_at,currentBookingStatus:booking.status,statusSignalId:mutation.status_signal_id,errorCode:mutation.error_code,attemptCount:mutation.attempt_count};
    return json({ok:true,version:VERSION,build:BUILD,core:CORE,lifecycle,latestEvent:(events||[])[0]||null,events:mode==='history'?(events||[]):undefined});
  }catch(error){console.error('[booking-provider-reservation-mutation-status]',error);return json({error:'RESERVATION_MUTATION_STATUS_RUNTIME_FAILED',details:error instanceof Error?error.message:String(error)},500);}
});
