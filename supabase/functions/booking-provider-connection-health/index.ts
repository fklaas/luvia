import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
const VERSION='2.0.0';
const cors={'Access-Control-Allow-Origin':'https://myluvia.app','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json','Vary':'Origin'};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:cors});
const clean=(v:unknown)=>String(v??'').trim().toLowerCase();
const now=()=>new Date().toISOString();
const redactedUrl=(raw:string)=>{try{const u=new URL(raw);return `${u.protocol}//${u.host}${u.pathname}`;}catch{return ''}};

type Manifest={secretKeys:string[];configKeys:string[];probeStrategy:'none'|'contract_required'|'read_only_http';autoActivation:boolean;publicContract?:string};
const KNOWN:Record<string,Manifest>={
 email:{secretKeys:[],configKeys:[],probeStrategy:'none',autoActivation:false},
 thefork:{secretKeys:['THEFORK_CLIENT_ID','THEFORK_CLIENT_SECRET'],configKeys:[],probeStrategy:'contract_required',autoActivation:false},
 quandoo:{secretKeys:['QUANDOO_AUTH_TOKEN','QUANDOO_AGENT_ID'],configKeys:['QUANDOO_PROBE_MERCHANT_ID'],probeStrategy:'read_only_http',autoActivation:true,publicContract:'quandoo-public-api'},
 zenchef:{secretKeys:['ZENCHEF_API_CREDENTIALS','ZENCHEF_PARTNER_CONTRACT_VERSION'],configKeys:[],probeStrategy:'contract_required',autoActivation:false},
 opentable:{secretKeys:['OPENTABLE_CLIENT_ID','OPENTABLE_CLIENT_SECRET','OPENTABLE_PARTNER_CONTRACT_VERSION'],configKeys:[],probeStrategy:'contract_required',autoActivation:false},
 sevenrooms:{secretKeys:[],configKeys:[],probeStrategy:'contract_required',autoActivation:false},
 resy:{secretKeys:[],configKeys:[],probeStrategy:'contract_required',autoActivation:false},
 tock:{secretKeys:[],configKeys:[],probeStrategy:'contract_required',autoActivation:false}
};
function state(keys:string[]){if(!keys.length)return 'unknown';const n=keys.filter(k=>Boolean(Deno.env.get(k)?.trim())).length;return n===0?'missing':n===keys.length?'configured':'partial';}
function configState(keys:string[]){if(!keys.length)return 'not_applicable';const n=keys.filter(k=>Boolean(Deno.env.get(k)?.trim())).length;return n===0?'missing':n===keys.length?'configured':'partial';}
function activation(access:string,creds:string,contract:string,manifest:Manifest,config:string,probe:string){
 if(access==='connected')return {state:'active',reason:'CAPABILITY_ALREADY_CONNECTED'};
 if(manifest.secretKeys.length===0)return {state:'blocked',reason:'PARTNER_CREDENTIAL_SCHEMA_REQUIRED'};
 if(creds==='missing'||creds==='partial')return {state:'waiting_credentials',reason:creds==='partial'?'PARTIAL_CREDENTIALS':'CREDENTIALS_MISSING'};
 if(config==='missing'||config==='partial')return {state:'waiting_configuration',reason:config==='partial'?'PARTIAL_PROBE_CONFIGURATION':'PROBE_CONFIGURATION_MISSING'};
 if(contract==='partner_schema_required'&&manifest.probeStrategy!=='read_only_http')return {state:'waiting_contract',reason:'PARTNER_STATUS_SCHEMA_REQUIRED'};
 if(probe==='healthy')return {state:'ready_to_activate',reason:'LIVE_PROBE_HEALTHY'};
 if(probe==='failed'||probe==='degraded')return {state:'degraded',reason:'LIVE_PROBE_NOT_HEALTHY'};
 return {state:'ready_to_activate',reason:'CREDENTIALS_CONFIGURED_PROBE_REQUIRED'};
}
async function quandooProbe(){
 const token=Deno.env.get('QUANDOO_AUTH_TOKEN')?.trim();
 const merchant=Deno.env.get('QUANDOO_PROBE_MERCHANT_ID')?.trim();
 const base=(Deno.env.get('QUANDOO_API_BASE')?.trim()||'https://api.quandoo.com/v1').replace(/\/$/,'');
 if(!token||!merchant)return {state:'blocked',reason:'QUANDOO_PROBE_CONFIGURATION_MISSING',httpStatus:null,latencyMs:null,evidence:{strategy:'read_only_http',contract:'quandoo-public-api'}};
 const target=`${base}/merchants/${encodeURIComponent(merchant)}/reservation-settings`;
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),5000);const t0=Date.now();
 try{
  const res=await fetch(target,{method:'GET',headers:{'X-Quandoo-AuthToken':token,'Accept':'application/json'},signal:controller.signal,redirect:'manual'});
  const latency=Date.now()-t0;
  const evidence={strategy:'read_only_http',contract:'quandoo-public-api',endpoint:redactedUrl(target),responseClass:`${Math.floor(res.status/100)}xx`};
  if(res.status>=200&&res.status<300)return {state:'healthy',reason:'QUANDOO_READ_ONLY_PROBE_OK',httpStatus:res.status,latencyMs:latency,evidence};
  if(res.status===401||res.status===403)return {state:'failed',reason:'QUANDOO_AUTH_REJECTED',httpStatus:res.status,latencyMs:latency,evidence};
  if(res.status===404)return {state:'failed',reason:'QUANDOO_MERCHANT_NOT_FOUND_OR_NOT_ACCESSIBLE',httpStatus:res.status,latencyMs:latency,evidence};
  return {state:'degraded',reason:'QUANDOO_PROVIDER_REACHABLE_UNEXPECTED_RESPONSE',httpStatus:res.status,latencyMs:latency,evidence};
 }catch(e){const latency=Date.now()-t0;return {state:'failed',reason:e instanceof DOMException&&e.name==='AbortError'?'PROBE_TIMEOUT':'PROBE_NETWORK_ERROR',httpStatus:null,latencyMs:latency,evidence:{strategy:'read_only_http',contract:'quandoo-public-api',endpoint:redactedUrl(target)}}}
 finally{clearTimeout(timer)}
}
async function runProbe(provider:string,manifest:Manifest){
 if(manifest.probeStrategy==='none')return {state:'healthy',reason:'INTERNAL_TRANSPORT',httpStatus:null,latencyMs:0,evidence:{strategy:'none'}};
 if(manifest.probeStrategy==='contract_required')return {state:'blocked',reason:'EXACT_PARTNER_PROBE_CONTRACT_REQUIRED',httpStatus:null,latencyMs:null,evidence:{strategy:'contract_required'}};
 if(provider==='quandoo')return await quandooProbe();
 return {state:'blocked',reason:'PROBE_NOT_IMPLEMENTED',httpStatus:null,latencyMs:null,evidence:{strategy:manifest.probeStrategy}};
}
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
 if(req.method!=='POST')return json({error:'METHOD_NOT_ALLOWED'},405);
 try{
  const url=Deno.env.get('SUPABASE_URL')!,anon=Deno.env.get('SUPABASE_ANON_KEY')!,service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const auth=req.headers.get('Authorization')||'';const bearer=auth.replace(/^Bearer\s+/i,'').trim();const isService=bearer===service;
  if(!isService){const userClient=createClient(url,anon,{global:{headers:{Authorization:auth}}});const {data:{user},error}=await userClient.auth.getUser();if(error||!user)return json({error:'AUTH_REQUIRED'},401);}
  const admin=createClient(url,service,{auth:{persistSession:false}});
  const body=await req.json().catch(()=>({}));const requested=clean(body?.providerId);const action=clean(body?.action)||'health';
  if(!['health','all','probe','activate'].includes(action))return json({error:'UNSUPPORTED_ACTION'},400);
  if((action==='probe'||action==='activate')&&!requested)return json({error:'PROVIDER_REQUIRED'},400);
  if((action==='probe'||action==='activate')&&!isService)return json({error:'SERVICE_ROLE_REQUIRED'},403);
  let q=admin.from('booking_provider_capabilities').select('provider_id,display_name,luvia_access_state,booking_mode,supports_availability,supports_create_reservation,supports_status_webhook,supports_status_polling').eq('active',true);
  if(requested)q=q.eq('provider_id',requested);const {data:caps,error:capError}=await q;if(capError)throw capError;if(requested&&!caps?.length)return json({error:'PROVIDER_NOT_FOUND'},404);
  const results=[];
  for(const cap of caps||[]){
   const provider=String(cap.provider_id);const manifest=KNOWN[provider]||{secretKeys:[],configKeys:[],probeStrategy:'contract_required',autoActivation:false};
   const creds=provider==='email'?'not_applicable':state(manifest.secretKeys);const configs=configState(manifest.configKeys);
   const {data:contracts}=await admin.from('booking_provider_status_contracts').select('transport,contract_version,verification_state,auto_apply,active').eq('provider_id',provider).eq('active',true);
   const verified=(contracts||[]).some((x:any)=>x.verification_state==='verified_public'&&x.auto_apply===true);const schemaRequired=(contracts||[]).some((x:any)=>x.verification_state==='partner_schema_required');
   const contractState=verified?'verified_mapping_ready':schemaRequired?'partner_schema_required':'not_connected';
   const {data:existing}=await admin.from('booking_provider_connections').select('*').eq('provider_id',provider).maybeSingle();
   let probeState=provider==='email'?'healthy':String(existing?.probe_state||'not_run');let probeReason=String(existing?.probe_reason||'');let lastProbe=existing?.last_probe||{};let lastProbeAt=existing?.last_probe_at||null;
   if(action==='probe'){
    const started=now();const {data:run}=await admin.from('booking_provider_probe_runs').insert({provider_id:provider,probe_kind:'connection',state:'started',reason:'PROBE_STARTED',credential_state:creds,contract_state:contractState,started_at:started}).select('id').single();
    const probe=await runProbe(provider,manifest);probeState=probe.state;probeReason=probe.reason;lastProbe={...probe.evidence,httpStatus:probe.httpStatus,latencyMs:probe.latencyMs,state:probe.state,reason:probe.reason,checkedAt:now()};lastProbeAt=now();
    if(run?.id)await admin.from('booking_provider_probe_runs').update({state:probe.state,reason:probe.reason,http_status:probe.httpStatus,latency_ms:probe.latencyMs,evidence:probe.evidence,finished_at:lastProbeAt}).eq('id',run.id);
   }
   const act=activation(String(cap.luvia_access_state||''),creds,contractState,manifest,configs,probeState);
   let accessState=String(cap.luvia_access_state||'');
   let connectionState=accessState==='connected'?'connected':act.state==='ready_to_activate'?'ready_to_connect':'partner_required';
   let statusReturnState=accessState==='connected'&&verified?'active':verified?'ready':schemaRequired?'partner_schema_required':'disabled';
   let availabilityTransportState=accessState==='connected'&&cap.supports_availability===true?'active':act.state==='ready_to_activate'&&cap.supports_availability===true?'ready':'disabled';
   let connectedAt=existing?.connected_at||null;let activationVerifiedAt=existing?.activation_verified_at||null;
   if(action==='activate'){
    const confirm=body?.confirmActivation===true;if(!confirm)return json({ok:false,expected:true,error:'ACTIVATION_CONFIRMATION_REQUIRED',provider},200);
    if(!manifest.autoActivation)return json({ok:false,expected:true,error:'PROVIDER_AUTO_ACTIVATION_NOT_VERIFIED',provider,reason:'Exact partner activation contract is not publicly verified.'},200);
    if(creds!=='configured'||configs!=='configured'||probeState!=='healthy')return json({ok:false,expected:true,error:'PROVIDER_NOT_READY_TO_ACTIVATE',provider,credentialState:creds,configState:configs,probeState},200);
    await admin.from('booking_provider_capabilities').update({luvia_access_state:'connected',integration_tier:'connected',booking_mode:'api',updated_at:now()}).eq('provider_id',provider);
    accessState='connected';connectionState='connected';connectedAt=now();activationVerifiedAt=connectedAt;statusReturnState=verified?'active':statusReturnState;availabilityTransportState=cap.supports_availability===true?'active':'disabled';
    await admin.from('booking_provider_connection_events').insert({provider_id:provider,event_type:'connected',previous_state:existing?.connection_state||null,next_state:'connected',reason:'EXPLICIT_ACTIVATION_AFTER_HEALTHY_LIVE_PROBE',evidence:{probeState,credentialState:creds,contractState,activationRuntimeVersion:VERSION},occurred_at:connectedAt});
   }
   const finalAct=accessState==='connected'?{state:'active',reason:'LIVE_PROBE_ACTIVATED'}:act;const checkedAt=now();
   const health={providerId:provider,displayName:cap.display_name,accessState,connectionState,credentialState:creds,configState:configs,contractState,statusReturnState,availabilityTransportState,activationState:finalAct.state,activationReason:finalAct.reason,probeState,probeStrategy:manifest.probeStrategy,probeReason,requiredSecretCount:manifest.secretKeys.length,configuredSecretCount:manifest.secretKeys.filter(k=>Boolean(Deno.env.get(k)?.trim())).length,requiredConfigCount:manifest.configKeys.length,configuredConfigCount:manifest.configKeys.filter(k=>Boolean(Deno.env.get(k)?.trim())).length,autoActivationVerified:manifest.autoActivation,contracts:contracts||[],lastProbe,checkedAt};
   await admin.from('booking_provider_connections').upsert({provider_id:provider,connection_state:connectionState,credential_state:creds,contract_state:contractState,status_return_state:statusReturnState,availability_transport_state:availabilityTransportState,required_secret_keys:manifest.secretKeys,required_config_keys:manifest.configKeys,last_health:health,last_checked_at:checkedAt,activation_state:finalAct.state,activation_reason:finalAct.reason,probe_state:probeState,probe_strategy:manifest.probeStrategy,probe_reason:probeReason,last_probe:lastProbe,last_probe_at:lastProbeAt,connected_at:connectedAt,activation_requested_at:action==='activate'?checkedAt:existing?.activation_requested_at||null,activation_verified_at:activationVerifiedAt,updated_at:checkedAt},{onConflict:'provider_id'});
   if(action!=='activate')await admin.from('booking_provider_connection_events').insert({provider_id:provider,event_type:finalAct.state==='ready_to_activate'?'activation_ready':finalAct.state==='active'?'connected':finalAct.state==='degraded'?'degraded':'health_checked',previous_state:existing?.connection_state||null,next_state:connectionState,reason:finalAct.reason,evidence:{credentialState:creds,configState:configs,contractState,statusReturnState,availabilityTransportState,activationState:finalAct.state,probeState,probeStrategy:manifest.probeStrategy},occurred_at:checkedAt});
   results.push(health);
  }
  return json({ok:true,version:VERSION,action,providers:results});
 }catch(error){console.error('[booking-provider-connection-health]',error);return json({error:'PROVIDER_CONNECTION_RUNTIME_FAILED',details:error instanceof Error?error.message:String(error)},500);}
});
