import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { capability } from '../capabilities/registry.ts';
import { sanitizeTripPayload as sanitize, safetyIdentifier } from '../policies/privacy.ts';
import { runOpenAI } from '../providers/openai.ts';
import { recordUsage } from '../telemetry/usage.ts';

type Tier='fast'|'default'|'deep';
type JobRow={
  id:string;user_id:string;workflow_id:string;idempotency_key:string;capability:string;tier:Tier;
  input_fingerprint:string;request_payload:any;status:'queued'|'running'|'succeeded'|'failed';
  result:any;meta:any;error_code:string|null;error_message:string|null;attempt_count:number;
  created_at:string;updated_at:string;started_at:string|null;completed_at:string|null;expires_at:string;
};
type WorkflowRow={
  id:string;user_id:string;idempotency_key:string;input_fingerprint:string;
  status:'active'|'ready_for_review'|'failed'|'confirmed'|'expired';phase:string;
  phase_state:any;aggregate_usage:any;created_at:string;updated_at:string;completed_at:string|null;expires_at:string;
};

export const TRIP_JOB_CAPABILITIES=new Set(['planning.dialogue','trip.compose','trip.compose-day-repair','trip.audit']);
export const TRIP_WORKFLOW_BUDGET={maxModelCalls:8,maxTotalTokens:180_000};
export const TRIP_JOB_LEASE_TIMEOUT_MS=60_000;
export function tripWorkflowBudget(workflow:any){
  const dates=workflow?.phase_state?.selectedDates||workflow?.phase_state?.data||{},start=Date.parse(dates.startDate||''),end=Date.parse(dates.endDate||''),days=Number.isFinite(start)&&Number.isFinite(end)?Math.max(1,Math.min(366,Math.round((end-start)/86400000)+1)):1,sections=Math.ceil(days/7);
  return {maxModelCalls:Math.max(TRIP_WORKFLOW_BUDGET.maxModelCalls,sections+4),maxTotalTokens:Math.max(TRIP_WORKFLOW_BUDGET.maxTotalTokens,sections*36000)};
}
const IDEMPOTENCY=/^[a-zA-Z0-9:_-]{24,180}$/;
const WORKFLOW_PHASES=new Set(['understanding','candidates','itinerary','repair','audit','ready-for-review','failed','confirmed']);

function adminClient(){
  const url=Deno.env.get('SUPABASE_URL')||'',serviceKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
  if(!url||!serviceKey)throw Object.assign(new Error('Der fortsetzbare KI-Auftrag ist serverseitig noch nicht konfiguriert.'),{code:'AI_JOB_NOT_CONFIGURED',status:503});
  return createClient(url,serviceKey,{auth:{persistSession:false}});
}

function canonical(value:unknown):unknown{
  if(Array.isArray(value))return value.map(canonical);
  if(value&&typeof value==='object')return Object.keys(value as Record<string,unknown>).sort().reduce((result,key)=>{result[key]=canonical((value as Record<string,unknown>)[key]);return result},{} as Record<string,unknown>);
  return value;
}

async function digest(value:unknown){
  const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(canonical(value))));
  return [...new Uint8Array(bytes)].map(byte=>byte.toString(16).padStart(2,'0')).join('');
}

function publicJob(row:JobRow){
  return {
    id:row.id,status:row.status,capability:row.capability,tier:row.tier,
    attemptCount:row.attempt_count,createdAt:row.created_at,updatedAt:row.updated_at,
    startedAt:row.started_at,completedAt:row.completed_at,expiresAt:row.expires_at,
    ...(row.status==='succeeded'?{result:row.result,meta:row.meta||{}}:{}),
    ...(row.status==='failed'?{error:{code:row.error_code||'AI_JOB_FAILED',message:row.error_message||'Der KI-Auftrag konnte nicht abgeschlossen werden.'},meta:row.meta||{}}:{})
  };
}

function publicWorkflow(row:WorkflowRow){
  return {id:row.id,status:row.status,phase:row.phase,phaseState:row.phase_state||{},aggregateUsage:row.aggregate_usage||{},createdAt:row.created_at,updatedAt:row.updated_at,completedAt:row.completed_at,expiresAt:row.expires_at};
}

async function storeUsage(userId:string,capabilityId:string,tier:Tier,provider:string,attempts:any[]){
  for(const attempt of attempts||[])await recordUsage({
    user_id:userId,capability:capabilityId,provider,model:attempt.model,tier,
    request_id:attempt.requestId,input_tokens:attempt.usage?.inputTokens||0,
    output_tokens:attempt.usage?.outputTokens||0,total_tokens:attempt.usage?.totalTokens||0,
    cached_tokens:attempt.usage?.cachedTokens||0,latency_ms:attempt.latencyMs||0,
    success:attempt.success===true,error_code:attempt.errorCode||null
  });
}

async function addWorkflowUsage(admin:any,workflowId:string,attempts:any[]){
  const {data}=await admin.from('intelligence_trip_plan_workflows').select('aggregate_usage').eq('id',workflowId).maybeSingle();
  if(!data)return;
  const current=data.aggregate_usage||{},delta=(attempts||[]).reduce((sum,item)=>({inputTokens:sum.inputTokens+Number(item.usage?.inputTokens||0),outputTokens:sum.outputTokens+Number(item.usage?.outputTokens||0),totalTokens:sum.totalTokens+Number(item.usage?.totalTokens||0),cachedTokens:sum.cachedTokens+Number(item.usage?.cachedTokens||0),latencyMs:sum.latencyMs+Number(item.latencyMs||0),modelCalls:sum.modelCalls+1}),{inputTokens:0,outputTokens:0,totalTokens:0,cachedTokens:0,latencyMs:0,modelCalls:0});
  const aggregate={inputTokens:Number(current.inputTokens||0)+delta.inputTokens,outputTokens:Number(current.outputTokens||0)+delta.outputTokens,totalTokens:Number(current.totalTokens||0)+delta.totalTokens,cachedTokens:Number(current.cachedTokens||0)+delta.cachedTokens,latencyMs:Number(current.latencyMs||0)+delta.latencyMs,modelCalls:Number(current.modelCalls||0)+delta.modelCalls};
  await admin.from('intelligence_trip_plan_workflows').update({aggregate_usage:aggregate,updated_at:new Date().toISOString()}).eq('id',workflowId);
}

async function execute(admin:any,row:JobRow){
  const now=new Date().toISOString();
  const {data:claimed,error:claimError}=await admin.from('intelligence_trip_plan_jobs')
    .update({status:'running',attempt_count:row.attempt_count+1,started_at:now,updated_at:now,error_code:null,error_message:null})
    .eq('id',row.id).eq('user_id',row.user_id).eq('status','queued').lt('attempt_count',3).select('*').maybeSingle();
  if(claimError||!claimed)return;
  const current=claimed as JobRow,definition=capability(current.capability);
  if(!definition){
    await admin.from('intelligence_trip_plan_jobs').update({status:'failed',error_code:'CAPABILITY_NOT_FOUND',error_message:'Unbekannte Luvia-AI-Capability.',completed_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('id',current.id);
    return;
  }
  const request=current.request_payload||{};
  try{
    const response=await runOpenAI({capability:definition,tier:current.tier,input:request.input||{},context:request.context||{},safetyId:await safetyIdentifier(current.user_id)});
    await storeUsage(current.user_id,current.capability,current.tier,response.provider,response.attempts||[]);
    await addWorkflowUsage(admin,current.workflow_id,response.attempts||[]);
    const completedAt=new Date().toISOString();
    await admin.from('intelligence_trip_plan_jobs').update({
      status:'succeeded',result:response.result,request_payload:null,error_code:null,error_message:null,
      meta:{provider:response.provider,model:response.model,tier:response.tier,usage:response.usage,latencyMs:response.latencyMs,store:false,resumable:true},
      completed_at:completedAt,updated_at:completedAt
    }).eq('id',current.id).eq('user_id',current.user_id);
  }catch(error){
    const e=error as any,attempts=Array.isArray(e.attempts)&&e.attempts.length?e.attempts:[{model:e.model||'unresolved',requestId:null,usage:e.usage||{inputTokens:0,outputTokens:0,totalTokens:0,cachedTokens:0},latencyMs:e.latencyMs||0,success:false,errorCode:e.code||'AI_FAILED'}];
    await storeUsage(current.user_id,current.capability,current.tier,'openai',attempts);
    await addWorkflowUsage(admin,current.workflow_id,attempts);
    const completedAt=new Date().toISOString();
    await admin.from('intelligence_trip_plan_jobs').update({
      status:'failed',error_code:e.code||'AI_FAILED',error_message:String(e.message||'Luvia Intelligence konnte die Aufgabe nicht verarbeiten.').slice(0,1000),
      meta:{provider:'openai',model:e.model||'unresolved',tier:current.tier,usage:e.usage||null,latencyMs:e.latencyMs||null,resumable:true},
      completed_at:completedAt,updated_at:completedAt
    }).eq('id',current.id).eq('user_id',current.user_id);
  }
}

function schedule(task:Promise<void>){
  const runtime=(globalThis as any).EdgeRuntime;
  if(typeof runtime?.waitUntil==='function'){runtime.waitUntil(task);return true;}
  return false;
}

async function enqueue(admin:any,row:JobRow){
  const task=execute(admin,row);
  if(!schedule(task))await task;
}

async function findOwned(admin:any,userId:string,jobId:string){
  const {data,error}=await admin.from('intelligence_trip_plan_jobs').select('*').eq('id',jobId).eq('user_id',userId).maybeSingle();
  if(error)throw Object.assign(new Error('Der KI-Auftrag konnte nicht gelesen werden.'),{code:'AI_JOB_READ_FAILED',status:502});
  if(!data)throw Object.assign(new Error('Dieser KI-Auftrag ist nicht mehr verfügbar.'),{code:'AI_JOB_NOT_FOUND',status:404});
  return data as JobRow;
}

async function failInterruptedJob(admin:any,userId:string,row:JobRow){
  if(row.status!=='running'||Date.parse(row.updated_at)>=Date.now()-TRIP_JOB_LEASE_TIMEOUT_MS)return row;
  const now=new Date().toISOString(),message='Die KI-Berechnung wurde serverseitig unterbrochen. Eure Eingaben und bisherigen Ergebnisse sind erhalten; startet den Versuch bitte sichtbar erneut.';
  const {data,error}=await admin.from('intelligence_trip_plan_jobs').update({
    status:'failed',error_code:'AI_JOB_INTERRUPTED',error_message:message,completed_at:now,updated_at:now
  }).eq('id',row.id).eq('user_id',userId).eq('status','running').eq('updated_at',row.updated_at).select('*').maybeSingle();
  if(error)throw Object.assign(new Error('Der unterbrochene KI-Auftrag konnte nicht abgeschlossen werden.'),{code:'AI_JOB_INTERRUPT_FAILED',status:502});
  return (data as JobRow|null)||await findOwned(admin,userId,row.id);
}

async function findWorkflow(admin:any,userId:string,workflowId:string){
  const {data,error}=await admin.from('intelligence_trip_plan_workflows').select('*').eq('id',workflowId).eq('user_id',userId).maybeSingle();
  if(error)throw Object.assign(new Error('Der Reiseauftrag konnte nicht gelesen werden.'),{code:'AI_WORKFLOW_READ_FAILED',status:502});
  if(!data)throw Object.assign(new Error('Dieser Reiseauftrag ist nicht mehr verfügbar.'),{code:'AI_WORKFLOW_NOT_FOUND',status:404});
  return data as WorkflowRow;
}

export async function startTripPlanWorkflow(userId:string,payload:any){
  const idempotencyKey=String(payload?.idempotencyKey||'').trim();
  if(!IDEMPOTENCY.test(idempotencyKey))throw Object.assign(new Error('Für die Reiseplanung fehlt eine gültige Idempotenz-ID.'),{code:'AI_WORKFLOW_IDEMPOTENCY_REQUIRED',status:400});
  const initialState=sanitize(payload?.state||{}),inputFingerprint=await digest(initialState),admin=adminClient();
  await admin.from('intelligence_trip_plan_workflows').delete().eq('user_id',userId).lt('expires_at',new Date().toISOString());
  const {data:existing,error:readError}=await admin.from('intelligence_trip_plan_workflows').select('*').eq('user_id',userId).eq('idempotency_key',idempotencyKey).maybeSingle();
  if(readError)throw Object.assign(new Error('Der Reiseauftrag konnte nicht vorbereitet werden.'),{code:'AI_WORKFLOW_READ_FAILED',status:502});
  if(existing){
    if((existing as WorkflowRow).input_fingerprint!==inputFingerprint)throw Object.assign(new Error('Die Auftrags-ID gehört bereits zu einer anderen Reiseplanung.'),{code:'AI_WORKFLOW_IDEMPOTENCY_CONFLICT',status:409});
    return publicWorkflow(existing as WorkflowRow);
  }
  const {data:created,error}=await admin.from('intelligence_trip_plan_workflows').insert({user_id:userId,idempotency_key:idempotencyKey,input_fingerprint:inputFingerprint,phase:'understanding',phase_state:initialState,status:'active'}).select('*').single();
  if(error)throw Object.assign(new Error('Der Reiseauftrag konnte nicht angelegt werden.'),{code:'AI_WORKFLOW_CREATE_FAILED',status:502});
  return publicWorkflow(created as WorkflowRow);
}

export async function readTripPlanWorkflow(userId:string,payload:any){
  const workflowId=String(payload?.workflowId||'').trim();
  if(!/^[0-9a-f-]{36}$/i.test(workflowId))throw Object.assign(new Error('Für die Wiederaufnahme fehlt eine gültige Reiseauftrags-ID.'),{code:'AI_WORKFLOW_ID_REQUIRED',status:400});
  const row=await findWorkflow(adminClient(),userId,workflowId);
  if(Date.parse(row.expires_at)<=Date.now())throw Object.assign(new Error('Dieser Reiseauftrag ist abgelaufen.'),{code:'AI_WORKFLOW_EXPIRED',status:410});
  return publicWorkflow(row);
}

export async function checkpointTripPlanWorkflow(userId:string,payload:any){
  const workflowId=String(payload?.workflowId||'').trim(),phase=String(payload?.phase||'').trim();
  if(!/^[0-9a-f-]{36}$/i.test(workflowId))throw Object.assign(new Error('Für den Zwischenstand fehlt eine gültige Reiseauftrags-ID.'),{code:'AI_WORKFLOW_ID_REQUIRED',status:400});
  if(!WORKFLOW_PHASES.has(phase))throw Object.assign(new Error('Unbekannte Phase der Reiseplanung.'),{code:'AI_WORKFLOW_PHASE_INVALID',status:400});
  const admin=adminClient(),current=await findWorkflow(admin,userId,workflowId),now=new Date().toISOString(),status=phase==='ready-for-review'?'ready_for_review':phase==='failed'?'failed':phase==='confirmed'?'confirmed':'active';
  if(['confirmed','expired'].includes(current.status))return publicWorkflow(current);
  const nextState={...(current.phase_state||{}),...((sanitize(payload?.state||{}) as Record<string,unknown>)||{})};
  const {data,error}=await admin.from('intelligence_trip_plan_workflows').update({phase,status,phase_state:nextState,updated_at:now,completed_at:['ready_for_review','failed','confirmed'].includes(status)?now:null}).eq('id',workflowId).eq('user_id',userId).select('*').single();
  if(error)throw Object.assign(new Error('Der Zwischenstand der Reiseplanung konnte nicht gespeichert werden.'),{code:'AI_WORKFLOW_CHECKPOINT_FAILED',status:502});
  return publicWorkflow(data as WorkflowRow);
}

export async function startTripPlanJob(userId:string,payload:any){
  const idempotencyKey=String(payload?.idempotencyKey||'').trim(),capabilityId=String(payload?.capability||'').trim(),workflowId=String(payload?.workflowId||'').trim();
  if(!IDEMPOTENCY.test(idempotencyKey))throw Object.assign(new Error('Für den KI-Auftrag fehlt eine gültige Idempotenz-ID.'),{code:'AI_JOB_IDEMPOTENCY_REQUIRED',status:400});
  if(!TRIP_JOB_CAPABILITIES.has(capabilityId))throw Object.assign(new Error('Diese KI-Fähigkeit darf nicht als Reiseauftrag ausgeführt werden.'),{code:'AI_JOB_CAPABILITY_FORBIDDEN',status:400});
  const definition=capability(capabilityId);if(!definition)throw Object.assign(new Error('Unbekannte Luvia-AI-Capability.'),{code:'CAPABILITY_NOT_FOUND',status:400});
  const requestedTier=String(payload?.tier||definition.tier),tier=(['fast','default','deep'].includes(requestedTier)?requestedTier:definition.tier) as Tier;
  const requestPayload={input:sanitize(payload?.input||{}),context:sanitize(payload?.context||{})};
  const inputFingerprint=await digest({capability:capabilityId,tier,...requestPayload}),admin=adminClient();
  const workflow=await findWorkflow(admin,userId,workflowId);
  await admin.from('intelligence_trip_plan_jobs').delete().eq('user_id',userId).lt('expires_at',new Date().toISOString());
  const {data:existing,error:readError}=await admin.from('intelligence_trip_plan_jobs').select('*').eq('user_id',userId).eq('idempotency_key',idempotencyKey).maybeSingle();
  if(readError)throw Object.assign(new Error('Der KI-Auftrag konnte nicht vorbereitet werden.'),{code:'AI_JOB_READ_FAILED',status:502});
  if(existing){
    const prior=existing as JobRow;
    if(prior.input_fingerprint!==inputFingerprint)throw Object.assign(new Error('Die Auftrags-ID gehört bereits zu einem anderen Reiseentwurf.'),{code:'AI_JOB_IDEMPOTENCY_CONFLICT',status:409});
    if(prior.status==='queued'){await enqueue(admin,prior);return publicJob((await findOwned(admin,userId,prior.id)));}
    if(prior.status==='running'&&Date.parse(prior.updated_at)<Date.now()-TRIP_JOB_LEASE_TIMEOUT_MS)return publicJob(await failInterruptedJob(admin,userId,prior));
    if(prior.status==='failed'&&payload?.retryFailed===true&&prior.attempt_count<3){
      const now=new Date().toISOString();
      const {data:retried}=await admin.from('intelligence_trip_plan_jobs').update({status:'queued',completed_at:null,updated_at:now,error_code:null,error_message:null}).eq('id',prior.id).eq('user_id',userId).eq('status','failed').select('*').maybeSingle();
      if(retried){await enqueue(admin,retried as JobRow);return publicJob((await findOwned(admin,userId,prior.id)));}
    }
    return publicJob(prior);
  }
  const {data:active,error:activeError}=await admin.from('intelligence_trip_plan_jobs').select('*').eq('user_id',userId).eq('workflow_id',workflowId).eq('capability',capabilityId).in('status',['queued','running']).order('created_at',{ascending:false}).limit(1).maybeSingle();
  if(activeError)throw Object.assign(new Error('Der aktive KI-Auftrag konnte nicht gelesen werden.'),{code:'AI_JOB_READ_FAILED',status:502});
  if(active){
    const prior=active as JobRow;
    if(prior.status==='queued'){await enqueue(admin,prior);return publicJob(await findOwned(admin,userId,prior.id));}
    if(Date.parse(prior.updated_at)<Date.now()-TRIP_JOB_LEASE_TIMEOUT_MS)return publicJob(await failInterruptedJob(admin,userId,prior));
    return publicJob(prior);
  }
  const usage=workflow.aggregate_usage||{},budget=tripWorkflowBudget(workflow);
  if(Number(usage.modelCalls||0)>=budget.maxModelCalls||Number(usage.totalTokens||0)>=budget.maxTotalTokens)throw Object.assign(new Error('Der sichere Rechenrahmen dieses Reiseentwurfs ist erreicht. Eure bisherigen Ergebnisse bleiben erhalten.'),{code:'AI_WORKFLOW_BUDGET_EXHAUSTED',status:409});
  const {data:created,error:createError}=await admin.from('intelligence_trip_plan_jobs').insert({user_id:userId,workflow_id:workflowId,idempotency_key:idempotencyKey,capability:capabilityId,tier,input_fingerprint:inputFingerprint,request_payload:requestPayload,status:'queued'}).select('*').single();
  if(createError){
    if(String(createError.code)==='23505'){
      const {data:collision}=await admin.from('intelligence_trip_plan_jobs').select('*').eq('user_id',userId).eq('workflow_id',workflowId).eq('capability',capabilityId).in('status',['queued','running']).order('created_at',{ascending:false}).limit(1).maybeSingle();
      if(collision)return publicJob(collision as JobRow);
      const {data:same}=await admin.from('intelligence_trip_plan_jobs').select('*').eq('user_id',userId).eq('idempotency_key',idempotencyKey).maybeSingle();if(same)return publicJob(same as JobRow);
    }
    throw Object.assign(new Error('Der KI-Auftrag konnte nicht angelegt werden.'),{code:'AI_JOB_CREATE_FAILED',status:502});
  }
  await enqueue(admin,created as JobRow);
  return publicJob(await findOwned(admin,userId,(created as JobRow).id));
}

export async function readTripPlanJob(userId:string,payload:any){
  const jobId=String(payload?.jobId||'').trim();
  if(!/^[0-9a-f-]{36}$/i.test(jobId))throw Object.assign(new Error('Für die Wiederaufnahme fehlt eine gültige Auftrags-ID.'),{code:'AI_JOB_ID_REQUIRED',status:400});
  const admin=adminClient();let row=await findOwned(admin,userId,jobId);
  if(Date.parse(row.expires_at)<=Date.now())throw Object.assign(new Error('Dieser KI-Auftrag ist abgelaufen.'),{code:'AI_JOB_EXPIRED',status:410});
  row=await failInterruptedJob(admin,userId,row);
  return publicJob(row);
}
