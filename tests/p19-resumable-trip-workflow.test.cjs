'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
let checks=0;

async function providerResume(){
  const calls=[],jobs=new Map();let executions=0,reads=0;
  const functions={invoke:async(_name,{body})=>{
    calls.push(body);
    if(body.action==='trip.plan-workflow.start')return {data:{ok:true,data:{workflow:{id:'11111111-1111-4111-8111-111111111111',status:'active',phase:'understanding',phaseState:{}}}}};
    if(body.action==='trip.plan-job.start'){
      let job=jobs.get(body.payload.idempotencyKey);
      if(!job){executions++;job={id:'22222222-2222-4222-8222-222222222222',status:'running',attemptCount:1};jobs.set(body.payload.idempotencyKey,job);}
      return {data:{ok:true,data:{job}}};
    }
    if(body.action==='trip.plan-job.read'){
      reads++;const job=[...jobs.values()][0];job.status='succeeded';job.result={title:'Fortgesetzter Entwurf'};job.meta={usage:{totalTokens:321}};return {data:{ok:true,data:{job}}};
    }
    throw Error(`Unexpected ${body.action}`);
  }};
  const context=vm.createContext({window:{LuviaSupabaseService:{start:async()=>({functions})}},crypto:globalThis.crypto,TextEncoder,Uint8Array,setTimeout,clearTimeout,Date,Promise,Map,Set,Object,Array,JSON,Math,Error});
  vm.runInContext(read('core/ai/providers/openai-provider.js'),context);
  const provider=context.window.LuviaOpenAIProvider,workflow=await provider.startTripWorkflow('trip-workflow:test-user:stable-request',{destinationName:'Valencia'});
  assert.equal(workflow.id,'11111111-1111-4111-8111-111111111111');checks++;
  const payload={capability:'trip.compose',tier:'fast',input:{days:[{date:'2027-06-12',entries:[{providerPlaceId:'places/valencia-1',evidence:{refs:[{id:'evidence-valencia-1'}]}}]}]},context:{live:{now:'2026-09-08T06:40:00.000Z',today:'2026-09-08'},currentMoment:{surface:'trip-composer'}}};
  const first=await provider.runPersistent(payload,{workflowId:workflow.id,pollMs:1,timeoutMs:16000});
  assert.equal(first.data.result.title,'Fortgesetzter Entwurf');assert.equal(first.meta.resumable,true);checks+=2;
  const second=await provider.runPersistent({...payload,context:{...payload.context,live:{...payload.context.live,now:'2026-09-08T06:41:37.000Z'}}},{workflowId:workflow.id,pollMs:1,timeoutMs:16000});
  assert.equal(second.data.result.title,'Fortgesetzter Entwurf');assert.equal(executions,1,'Same semantic request must reuse one server execution');checks+=2;
  const reordered={tier:'fast',capability:'trip.compose',context:{currentMoment:{surface:'trip-composer'},live:{today:'2026-09-08',now:'2026-09-08T06:44:11.000Z'}},input:{days:[{entries:[{evidence:{refs:[{id:'evidence-valencia-1'}]},providerPlaceId:'places/valencia-1'}],date:'2027-06-12'}]}};
  const third=await provider.runPersistent(reordered,{workflowId:workflow.id,pollMs:1,timeoutMs:16000});
  assert.equal(third.data.result.title,'Fortgesetzter Entwurf');assert.equal(executions,1,'Equivalent payload key order must not create or conflict with another server execution');checks+=2;
  const starts=calls.filter(call=>call.action==='trip.plan-job.start');
  assert.equal(starts.length,3);assert.equal(starts[0].payload.idempotencyKey,starts[1].payload.idempotencyKey);assert.equal(starts[1].payload.idempotencyKey,starts[2].payload.idempotencyKey);assert.match(starts[0].payload.idempotencyKey,/^trip-plan-v2:/);assert.deepEqual(starts[0].payload.context,starts[1].payload.context);assert.equal(starts[0].payload.input.days[0].entries[0].evidence.refs[0].id,'evidence-valencia-1');assert.equal(starts[0].payload.workflowId,workflow.id);assert.equal(starts[0].payload.retryFailed,false,'foreground polling must read a failed job instead of silently paying for another attempt');assert.equal(reads,1);checks+=9;
}

function contracts(){
  const migration=read('supabase/migrations/20260908193000_intelligence_resumable_trip_jobs.sql'),singleActive=read('supabase/migrations/20260908204500_intelligence_single_active_trip_job.sql'),integrationEntry=read('supabase/functions/luvia-intelligence-integration/index.ts'),supabaseConfig=read('supabase/config.toml');
  assert.match(migration,/intelligence_trip_plan_workflows/);assert.match(migration,/unique \(user_id, idempotency_key\)/);assert.match(migration,/force row level security/);assert.match(migration,/revoke all on table public\.intelligence_trip_plan_jobs from anon, authenticated/);checks+=4;
  assert.match(singleActive,/unique index[\s\S]*\(workflow_id, capability\)[\s\S]*queued[\s\S]*running/);checks++;
  const jobs=read('supabase/functions/luvia-intelligence/jobs/trip-plan.ts'),handler=read('supabase/functions/luvia-intelligence/index.ts'),openai=read('supabase/functions/luvia-intelligence/providers/openai.ts'),registry=read('supabase/functions/luvia-intelligence/capabilities/registry.ts'),clientProvider=read('core/ai/providers/openai-provider.js');
  assert.match(jobs,/EdgeRuntime/);assert.match(jobs,/request_payload:null/);assert.match(jobs,/attempt_count<3|lt\('attempt_count',3\)/);assert.match(jobs,/input_fingerprint/);assert.match(jobs,/JSON\.stringify\(canonical\(value\)\)/);assert.match(jobs,/AI_WORKFLOW_BUDGET_EXHAUSTED/);assert.match(jobs,/\.eq\('workflow_id',workflowId\)\.eq\('capability',capabilityId\)\.in\('status',\['queued','running'\]\)/);checks+=7;
  assert.match(handler,/trip\.plan-workflow\.checkpoint/);assert.match(handler,/resumableTripWorkflow:true/);assert.match(handler,/jobTtlHours:24/);assert.match(handler,/singleActiveCapabilityJob:true/);assert.match(handler,/workflowBudget:TRIP_WORKFLOW_BUDGET/);checks+=5;
  assert.match(openai,/requestTimeoutMs/);assert.match(openai,/'trip\.compose':50_000/);assert.match(openai,/signal:controller\.signal/);assert.match(openai,/OPENAI_TIMEOUT/);checks+=4;
  assert.match(jobs,/TRIP_JOB_LEASE_TIMEOUT_MS=60_000/);assert.match(jobs,/AI_JOB_INTERRUPTED/);assert.match(jobs,/readTripPlanJob[\s\S]*?failInterruptedJob\(admin,userId,row\)/);assert.doesNotMatch(jobs,/AI_JOB_LEASE_RECOVERED/,'a stale paid job must become visibly terminal instead of being silently enqueued again');checks+=4;
  assert.match(clientProvider,/retryFailed:options\.retryFailed===true/,'reload and foreground resume must never silently retry a failed paid job');checks++;
  assert.match(clientProvider,/integration-luvia\\\.\/i[\s\S]*?'luvia-intelligence-integration':'luvia-intelligence'/,'Integration Preview must use an independently deployable Intelligence function');assert.match(integrationEntry,/import '\.\.\/luvia-intelligence\/index\.ts'/);assert.match(supabaseConfig,/\[functions\.luvia-intelligence-integration\][\s\S]*?verify_jwt = false/);checks+=3;
  assert.match(registry,/'planning\.dialogue'[\s\S]*?maxOutputTokens:2800,reasoningEffort:'none'/);assert.match(registry,/'trip\.compose'[\s\S]*?maxOutputTokens:5200,reasoningEffort:'none'/);assert.match(registry,/'trip\.audit'[\s\S]*?maxOutputTokens:3500/);checks+=3;
  const composer=read('app/first-trip-composer.js'),core=read('core/ai/ai-core.js'),adapter=read('core/platform/intelligence-contract-adapter.js');
  assert.match(composer,/workflowId:state\.workflowId\|\|null/);assert.match(composer,/ready-for-review/);assert.match(composer,/AI_JOB_PENDING/);assert.match(composer,/resumedPhase==='audit'/);assert.match(composer,/qualityAttempts\?qualityAttempts-1:0/);assert.match(core,/runPersistent/);checks+=6;
  assert.match(composer,/checkpointTripWorkflow\(state,'audit',\{itinerary:clone\(itinerary\),qualityAttempts/);checks++;
  assert.match(composer,/checkpointTripWorkflow\(state,'ready-for-review',\{audit:clone\(audit\),qualityAttempts\}/);checks++;
  assert.doesNotMatch(composer,/checkpointTripWorkflow\(state,'audit',\{[^\n]*candidates:/);checks++;
  assert.doesNotMatch(composer,/checkpointTripWorkflow\(state,'ready-for-review',\{[^\n]*candidates:/);checks++;
  assert.match(composer,/state\.aiDraft\.brief=clone\(brief\);state\.aiDraft\.phase='places'/);checks++;
  assert.match(composer,/cachedCoverage=new Map[\s\S]*aiCategoryRequests\(state\)[\s\S]*!item\|\|item\.status==='empty'\|\|item\.status==='unavailable'/,'resumed workflows must recover requested categories that never received a coverage row');checks++;
  assert.match(composer,/priorCategoryRefreshes=new Set\(\[\.\.\.\(serverState\.categoryRefreshAttempts\|\|\[\]\),\.\.\.\(resumed\?\.categoryRefreshAttempts\|\|\[\]\)\]/,'server and locally persisted category refresh attempts must survive reload and prevent repeated provider loops');checks++;
  assert.match(composer,/TRIP_PLACES_TIMEOUT/,'a supplemental Places refresh needs a bounded visible timeout');checks++;
  assert.match(composer,/within\(read\(state\.workflowId\),11000,[^\n]*AI_WORKFLOW_READ_TIMEOUT/,'workflow restore must be bounded outside the provider so service initialization cannot hang the Composer');checks++;
  assert.match(composer,/within\(start\(key,workflowIdentity\(state\)\),13000,[^\n]*AI_WORKFLOW_START_TIMEOUT/,'workflow creation must be bounded outside the provider');checks++;
  assert.match(composer,/within\(checkpoint\(state\.workflowId,phase,data\),9000,[^\n]*AI_WORKFLOW_CHECKPOINT_TIMEOUT[\s\S]*?workflowCheckpointWarning/,'a slow checkpoint must become a locally persisted warning instead of blocking the visible planning phase');checks++;
  assert.match(composer,/state\.aiDraft\.categoryRefreshAttempts=\[\.\.\.categoryRefreshAttempts\];persist\(state\)/,'the refresh marker must be persisted locally before provider work starts without adding another blocking server checkpoint');checks++;
  assert.match(composer,/localCandidates=Array\.isArray\(resumed\?\.places\)[\s\S]*?serverCandidates=Array\.isArray\(serverState\.candidates\)[\s\S]*?cachedCandidates=\[localCandidates,serverCandidates\]/,'a fresh workflow must reuse the locally persisted Places catalog before paying for another discovery pass');checks++;
  assert.match(composer,/cachedCandidates=\[localCandidates,serverCandidates\]\.filter\(Boolean\)\.sort\(\(left,right\)=>right\.places\.length-left\.places\.length\)\[0\]\|\|null/,'a smaller server shortlist must never overwrite a richer locally persisted destination pool');checks++;
  assert.match(composer,/AI_PLACE_RESEARCH_BUDGET_MS=44000[\s\S]*placeResearchDeadline=Date\.now\(\)\+AI_PLACE_RESEARCH_BUDGET_MS/,'all Places passes share one finite research deadline');checks++;
  assert.match(composer,/candidateBreadthWavesStarted:completedBreadthWaves,candidateBreadthWavesCompleted:completedBreadthWaves/,'completed breadth work is checkpointed once with the final candidate pool');checks++;
  assert.match(composer,/state\.aiDraft\.phase='itinerary';state\.aiDraft\.lastProgressAt=new Date\(\)\.toISOString\(\);state\.aiDraft\.places=clone\(result\.places\)[^\n]*persist\(state\);render\(state\);/,'the UI must enter itinerary composition as soon as Place research is complete, before a remote checkpoint');checks++;
  assert.match(composer,/const checkpointCandidates=tripCompositionCandidateCatalog\(state,result\.places,brief,null\);await checkpointTripWorkflow\(state,'candidates',\{brief:clone\(brief\),candidates:clone\(checkpointCandidates\)/,'the resumable checkpoint stores the bounded composition shortlist while metadata retains the full researched count');checks++;
  assert.match(composer,/readAiPlaces\(state,\{categories:refillCategories,supplementalCategories,refresh:true,focused:true,excludedProviderPlaceIds:result\.places\.map\(providerId\),breadthWave:wave,targetCount:shortage,deadlineAt:placeResearchDeadline\}\)/,'a thin long-trip catalog must receive exclusion-aware, anchored multi-query breadth waves inside the shared deadline');checks++;
  assert.match(composer,/aiRetryGeneration=Number\(state\.aiRetryGeneration\|\|0\)\+1/,'an explicit visible retry must advance the semantic model generation instead of replaying a contract-invalid successful job');checks++;
  assert.match(composer,/state\.idempotencyKey=createKey\(\);state\.workflowId=null;state\.workflowKey='';state\.workflowSnapshot=null/,'an explicit visible retry must leave an exhausted workflow while automatic polling continues to reuse the active job');checks++;
  assert.match(composer,/const confirmedBrief=Boolean\(state\.aiDraft\?\.brief\)[\s\S]*?loadAiDayDraft\(state,\{force:true,confirmedBrief\}\)/,'the visible retry must reuse the already confirmed travel order instead of paying to interpret it again');checks++;
  assert.match(composer,/repairInstructions:clone\(resumed\?\.repairInstructions\|\|\[\]\),repairDayDates:clone\(resumed\?\.repairDayDates\|\|\[\]\),contractRejections:clone\(resumed\?\.contractRejections\|\|\[\]\)/,'a new workflow must retain the exact failed-day repair lane');checks++;
  assert.match(composer,/resumingTargetedDeepRepair=Boolean\(itinerary\)&&repairDayDates\.length===1&&state\.aiDraft\.retryEscalated===true[\s\S]*?resumingTargetedRepair=Boolean\(itinerary\)&&repairDayDates\.length===1/,'a user-authorized retry keeps one failed day targeted and raises only that repair to the strongest tier');checks++;
  assert.match(composer,/repairWholeTrip=Boolean\(itinerary\)&&repairDayDates\.length!==1&&\(repairDayDates\.length>1\|\|state\.aiDraft\.retryEscalated===true\),composeQualityAttempt=repairWholeTrip\|\|resumingTargetedDeepRepair\?3:attempt\+1/,'several failed days use a strongest-tier whole-trip repair while one failed day preserves every valid day');checks++;
  assert.match(composer,/if\(repairWholeTrip\)break/,'a holistic repair receives one final audit and must not open a third automatic paid loop');checks++;
  assert.match(composer,/\['ready','brief-ready','brief-loading','brief-error','loading','error'\]\.includes\(state\.aiDraft\?\.status\)/,'terminal planning evidence must survive reload without silently restarting paid work');checks++;
  assert.match(composer,/AI_PLANNING_PHASES=Object\.freeze/);assert.match(composer,/data-ftc-ai-elapsed/);assert.match(composer,/Diese Phase braucht länger als vorgesehen/);assert.match(composer,/ftc-ai-work-signals/);checks+=4;
  assert.match(composer,/mountAiPlanningLifecycle/);assert.match(composer,/visibilitychange/);assert.match(composer,/resumeAiPlanning\(state,'foreground'\)/);checks+=3;
  assert.match(composer,/scheduleAiResume\(state,reason,180\)/,'foreground recovery must reconcile the current workflow instead of creating a new retry generation');checks++;
  assert.match(composer,/if\(!planningOnline\(\)\)\{state\.aiDraft=/,'offline recovery must stop before provider execution and preserve the loading workflow');checks++;
  assert.match(composer,/retryEscalated=state\.aiDraft\?\.errorCode==='AI_WORKFLOW_BUDGET_EXHAUSTED'\|\|Number\(state\.aiDraft\?\.qualityAttempts\|\|0\)>=3[\s\S]*?qualityAttempts:retryEscalated\?3:0,retryEscalated[\s\S]*?error:null,errorCode:null/,'a manual retry must preserve reusable evidence and route an exhausted plan directly into one strongest-tier holistic repair');checks++;
  assert.match(composer,/retryGeneration:Number\(state\.aiRetryGeneration\|\|0\)/,'the persisted semantic generation must reach itinerary and audit jobs');checks++;
  assert.match(composer,/aiRetryGeneration:Number\(draft\?\.aiRetryGeneration\|\|0\)/,'the semantic retry generation must survive a browser reload');checks++;
  assert.ok((adapter.match(/retryGeneration:Math\.max\(0,Math\.round\(Number\(input\.retryGeneration\)\|\|0\)\)/g)||[]).length>=3,'compose, day repair and audit must include the semantic retry generation in the persistent job input');checks++;
  assert.match(composer,/workflowIdentity=state=>\(\{[^\n]*startDate:state\.data\.startDate[^\n]*endDate:state\.data\.endDate/,'the persistent workflow identity must separate materially different travel periods');checks++;
  assert.match(composer,/function confirmedAiBrief[\s\S]*?confirmTripBriefWindow/,'restored and edited AI briefs must be reconciled with the owner-confirmed travel window without another model call');checks++;
  assert.match(composer,/if\(aiDraft\.brief\)aiDraft\.brief=confirmedAiBrief\(data,aiDraft\.brief\)/,'a persisted ready itinerary must repair a stale date narrative when the Composer reloads');checks++;
  assert.match(composer,/function invalidateAiBriefForDateEdit[\s\S]*?state\.workflowId=null;state\.workflowKey='';state\.workflowSnapshot=null;state\.aiRetryGeneration=0/,'editing travel dates must leave the exhausted or completed workflow without discarding the reusable semantic brief');checks++;
  assert.match(composer,/checkpointTripWorkflow\(state,'failed',\{brief:clone\(brief\),itinerary:state\.aiDraft\.itinerary/,'the failed checkpoint must retain the repairable itinerary and exact rejection state');checks++;
}

(async()=>{contracts();await providerResume();console.log(`P19 resumable trip workflow: ${checks}/${checks} checks PASS`);})().catch(error=>{console.error(error);process.exitCode=1;});
