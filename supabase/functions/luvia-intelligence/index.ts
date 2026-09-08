import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { corsHeaders, resolveOrigin } from './_shared/cors.ts';
import { errorResponse, jsonResponse, requestId } from './_shared/http.ts';
import { enforceRateLimit } from './_shared/rate-limit.ts';
import { capability, listCapabilities } from './capabilities/registry.ts';
import { sanitize, byteLength, safetyIdentifier } from './policies/privacy.ts';
import { modelDiagnostics, runOpenAI } from './providers/openai.ts';
import { recordUsage } from './telemetry/usage.ts';
import { readTravelCalendarEvidence } from './providers/open-holidays.ts';
import { checkpointTripPlanWorkflow, readTripPlanJob, readTripPlanWorkflow, startTripPlanJob, startTripPlanWorkflow, TRIP_JOB_LEASE_TIMEOUT_MS, TRIP_WORKFLOW_BUDGET } from './jobs/trip-plan.ts';

type Body={action?:string;payload?:any;client?:Record<string,unknown>};
const PUBLIC=new Set(['health','brain.health']);
const ACTION=/^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/;
Deno.serve(async(req:Request)=>{
  const id=requestId(req),origin=resolveOrigin(req.headers.get('origin')),cors=corsHeaders(origin,id);
  if(!origin)return errorResponse(403,'ORIGIN_NOT_ALLOWED','Origin ist nicht freigeschaltet.',id,cors);
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
  if(req.method!=='POST')return errorResponse(405,'METHOD_NOT_ALLOWED','Nur POST ist erlaubt.',id,cors);
  if(!(req.headers.get('content-type')||'').includes('application/json'))return errorResponse(415,'UNSUPPORTED_MEDIA_TYPE','Content-Type application/json erforderlich.',id,cors);
  let body:Body;try{body=await req.json()}catch{return errorResponse(400,'INVALID_JSON','Ungültiger JSON-Body.',id,cors)}
  if(byteLength(body)>180_000)return errorResponse(413,'PAYLOAD_TOO_LARGE','Der KI-Kontext ist zu groß.',id,cors);
  const action=String(body.action||'').trim().toLowerCase();if(!ACTION.test(action)||action.length>80)return errorResponse(400,'INVALID_ACTION','Ungültige Aktion.',id,cors);
  const clientKey=req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||req.headers.get('cf-connecting-ip')||'unknown';
  const url=Deno.env.get('SUPABASE_URL')||'',anon=Deno.env.get('SUPABASE_ANON_KEY')||'',authorization=req.headers.get('authorization')||'';let userId:string|null=null;
  if(authorization){const client=createClient(url,anon,{global:{headers:{Authorization:authorization}},auth:{persistSession:false}});const {data,error}=await client.auth.getUser();if(!error&&data.user)userId=data.user.id;else if(!PUBLIC.has(action))return errorResponse(401,'INVALID_SESSION','Sitzung ist ungültig oder abgelaufen.',id,cors)}
  if(!PUBLIC.has(action)&&!userId)return errorResponse(401,'AUTH_REQUIRED','Für diese Aktion ist eine Anmeldung erforderlich.',id,cors);
  const capabilityKey=action==='brain.run'?String(body.payload?.capability||'brain.run'):action;const limit=PUBLIC.has(action)?60:80;const rate=enforceRateLimit(`${userId||clientKey}:${capabilityKey}`,limit,60_000);if(!rate.allowed)return errorResponse(429,'RATE_LIMITED','Zu viele KI-Anfragen.',id,{...cors,'Retry-After':String(rate.retryAfter)});
  if(PUBLIC.has(action))return jsonResponse(200,{ok:true,data:{service:'luvia-intelligence',status:'ok',version:'4.42.1',build:'13.42.1',core:'4.42.1',authenticated:Boolean(userId),...modelDiagnostics(),capabilities:listCapabilities(),calendarEvidence:{provider:'OpenHolidays API',schoolRegions:'DE-16',officialReference:'KMK'},structuredOutput:{incompleteDetection:true,structuredOutputEscalation:true,tripComposeTokens:5200,tripComposeReasoning:'none',tripDayRepairTokens:4500,planningDialogueTokens:2800,planningDialogueReasoning:'none',planningDialogueVerbosity:'low',destinationInspirationTier:'fast',destinationInspirationTokens:1200,adaptiveQualityCascade:true,compactTripCompose:true,targetedDayRepair:true,resumableTripWorkflow:true,resumableTripJobs:true,singleActiveCapabilityJob:true,silentFailedJobRetry:false,staleJobPolicy:'fail-visible-no-blind-retry',serverTimeoutsMs:{planningDialogue:28000,tripCompose:50000,tripDayRepair:45000,tripAudit:40000},jobLeaseTimeoutMs:TRIP_JOB_LEASE_TIMEOUT_MS,workflowBudget:TRIP_WORKFLOW_BUDGET,jobCapabilities:['planning.dialogue','trip.compose','trip.compose-day-repair','trip.audit'],workflowPhases:['understanding','candidates','itinerary','repair','audit','ready-for-review'],jobTtlHours:24,repairTiers:['fast','default','deep'],travelPromise:true,uncertaintyMap:true,bookingOrder:true,neighborhoodRecommendation:true,semanticConflictModerator:true,movementScope:true,visiblePlanningAssumptions:true,deferredLiveChecks:true,spatialDiversityAudit:true},privacy:{providerStore:false,transientJobStore:true,jobTtlHours:24,completedInputDiscarded:true,promptsLogged:false,minimumNecessaryContext:true}},meta:{requestId:id}},cors);
  if(action==='destination.normalize'){const name=String(body.payload?.name||'').trim();return jsonResponse(200,{ok:true,data:{name,isUsable:Boolean(name),isResolved:false,source:'server_normalized'},meta:{requestId:id}},cors)}
  if(action==='calendar.travel-evidence'){
    try{return jsonResponse(200,{ok:true,data:await readTravelCalendarEvidence(sanitize(body.payload||{})),meta:{requestId:id}},cors)}
    catch(error){const e=error as any;return errorResponse(e.status||502,e.code||'CALENDAR_EVIDENCE_FAILED',e.message||'Die bestätigten Ferienzeiten konnten nicht geladen werden.',id,cors)}
  }
  if(['trip.plan-workflow.start','trip.plan-workflow.read','trip.plan-workflow.checkpoint','trip.plan-job.start','trip.plan-job.read'].includes(action)){
    try{
      if(action==='trip.plan-workflow.start')return jsonResponse(200,{ok:true,data:{workflow:await startTripPlanWorkflow(userId!,body.payload||{})},meta:{requestId:id,resumable:true}},cors);
      if(action==='trip.plan-workflow.read')return jsonResponse(200,{ok:true,data:{workflow:await readTripPlanWorkflow(userId!,body.payload||{})},meta:{requestId:id,resumable:true}},cors);
      if(action==='trip.plan-workflow.checkpoint')return jsonResponse(200,{ok:true,data:{workflow:await checkpointTripPlanWorkflow(userId!,body.payload||{})},meta:{requestId:id,resumable:true}},cors);
      const job=action==='trip.plan-job.start'?await startTripPlanJob(userId!,body.payload||{}):await readTripPlanJob(userId!,body.payload||{});
      return jsonResponse(200,{ok:true,data:{job},meta:{requestId:id,resumable:true}},cors);
    }catch(error){const e=error as any;return errorResponse(e.status||500,e.code||'AI_JOB_FAILED',e.message||'Der fortsetzbare KI-Auftrag konnte nicht verarbeitet werden.',id,cors)}
  }
  if(!['brain.run','brain.orchestrate'].includes(action))return errorResponse(404,'ACTION_NOT_FOUND','Aktion ist nicht freigeschaltet.',id,cors);
  const capabilityId=action==='brain.orchestrate'?'brain.orchestrate':String(body.payload?.capability||'');const definition=capability(capabilityId);if(!definition)return errorResponse(400,'CAPABILITY_NOT_FOUND','Unbekannte Luvia-AI-Capability.',id,cors);
  const requestedTier=String(body.payload?.tier||definition.tier);const tier=(['fast','default','deep'].includes(requestedTier)?requestedTier:definition.tier) as 'fast'|'default'|'deep';const input=sanitize(body.payload?.input||{}),context=sanitize(body.payload?.context||{});const started=performance.now();
  try{
    const result=await runOpenAI({capability:definition,tier,input,context,safetyId:await safetyIdentifier(userId!)});
    for(const attempt of result.attempts||[])await recordUsage({user_id:userId,capability:capabilityId,provider:result.provider,model:attempt.model,tier:result.tier,request_id:attempt.requestId,input_tokens:attempt.usage.inputTokens,output_tokens:attempt.usage.outputTokens,total_tokens:attempt.usage.totalTokens,cached_tokens:attempt.usage.cachedTokens,latency_ms:attempt.latencyMs,success:attempt.success,error_code:attempt.errorCode});
    return jsonResponse(200,{ok:true,data:{result:result.result},meta:{requestId:id,capability:capabilityId,provider:result.provider,model:result.model,tier:result.tier,usage:result.usage,latencyMs:result.latencyMs,store:false}},cors);
  }catch(error){const e=error as any,attempts=Array.isArray(e.attempts)&&e.attempts.length?e.attempts:[{model:e.model||'unresolved',requestId:null,usage:e.usage||{inputTokens:0,outputTokens:0,totalTokens:0,cachedTokens:0},latencyMs:e.latencyMs||Math.round(performance.now()-started),success:false,errorCode:e.code||'AI_FAILED'}];for(const attempt of attempts)await recordUsage({user_id:userId,capability:capabilityId,provider:'openai',model:attempt.model,tier,request_id:attempt.requestId,input_tokens:attempt.usage.inputTokens,output_tokens:attempt.usage.outputTokens,total_tokens:attempt.usage.totalTokens,cached_tokens:attempt.usage.cachedTokens,latency_ms:attempt.latencyMs,success:false,error_code:attempt.errorCode||e.code||'AI_FAILED'});return errorResponse(e.status||500,e.code||'AI_FAILED',e.message||'Luvia Intelligence konnte die Aufgabe nicht verarbeiten.',id,cors)}
});
