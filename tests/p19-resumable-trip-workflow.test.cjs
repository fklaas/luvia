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
  assert.equal(starts.length,3);assert.equal(starts[0].payload.idempotencyKey,starts[1].payload.idempotencyKey);assert.equal(starts[1].payload.idempotencyKey,starts[2].payload.idempotencyKey);assert.match(starts[0].payload.idempotencyKey,/^trip-plan-v2:/);assert.deepEqual(starts[0].payload.context,starts[1].payload.context);assert.equal(starts[0].payload.input.days[0].entries[0].evidence.refs[0].id,'evidence-valencia-1');assert.equal(starts[0].payload.workflowId,workflow.id);assert.equal(reads,1);checks+=8;
}

function contracts(){
  const migration=read('supabase/migrations/20260908193000_intelligence_resumable_trip_jobs.sql'),singleActive=read('supabase/migrations/20260908204500_intelligence_single_active_trip_job.sql');
  assert.match(migration,/intelligence_trip_plan_workflows/);assert.match(migration,/unique \(user_id, idempotency_key\)/);assert.match(migration,/force row level security/);assert.match(migration,/revoke all on table public\.intelligence_trip_plan_jobs from anon, authenticated/);checks+=4;
  assert.match(singleActive,/unique index[\s\S]*\(workflow_id, capability\)[\s\S]*queued[\s\S]*running/);checks++;
  const jobs=read('supabase/functions/luvia-intelligence/jobs/trip-plan.ts'),handler=read('supabase/functions/luvia-intelligence/index.ts');
  assert.match(jobs,/EdgeRuntime/);assert.match(jobs,/request_payload:null/);assert.match(jobs,/attempt_count<3|lt\('attempt_count',3\)/);assert.match(jobs,/input_fingerprint/);assert.match(jobs,/JSON\.stringify\(canonical\(value\)\)/);assert.match(jobs,/AI_WORKFLOW_BUDGET_EXHAUSTED/);assert.match(jobs,/\.eq\('workflow_id',workflowId\)\.eq\('capability',capabilityId\)\.in\('status',\['queued','running'\]\)/);checks+=7;
  assert.match(handler,/trip\.plan-workflow\.checkpoint/);assert.match(handler,/resumableTripWorkflow:true/);assert.match(handler,/jobTtlHours:24/);assert.match(handler,/singleActiveCapabilityJob:true/);assert.match(handler,/workflowBudget:TRIP_WORKFLOW_BUDGET/);checks+=5;
  const composer=read('app/first-trip-composer.js'),core=read('core/ai/ai-core.js'),adapter=read('core/platform/intelligence-contract-adapter.js');
  assert.match(composer,/workflowId:state\.workflowId\|\|null/);assert.match(composer,/ready-for-review/);assert.match(composer,/AI_JOB_PENDING/);assert.match(composer,/resumedPhase==='audit'/);assert.match(composer,/qualityAttempts\?qualityAttempts-1:0/);assert.match(core,/runPersistent/);checks+=6;
  assert.match(composer,/checkpointTripWorkflow\(state,'audit',\{itinerary:clone\(itinerary\),qualityAttempts/);checks++;
  assert.match(composer,/checkpointTripWorkflow\(state,'ready-for-review',\{audit:clone\(audit\),qualityAttempts\}/);checks++;
  assert.doesNotMatch(composer,/checkpointTripWorkflow\(state,'audit',\{[^\n]*candidates:/);checks++;
  assert.doesNotMatch(composer,/checkpointTripWorkflow\(state,'ready-for-review',\{[^\n]*candidates:/);checks++;
  assert.match(composer,/state\.aiDraft\.brief=clone\(brief\);state\.aiDraft\.phase='places'/);checks++;
  assert.match(composer,/cachedCoverage=new Map[\s\S]*aiCategoryRequests\(state\)[\s\S]*!item\|\|item\.status==='empty'\|\|item\.status==='unavailable'/,'resumed workflows must recover requested categories that never received a coverage row');checks++;
  assert.match(composer,/priorCategoryRefreshes=new Set\(\(serverState\.categoryRefreshAttempts\|\|\[\]\)/,'category refresh attempts must survive reload and prevent repeated provider loops');checks++;
  assert.match(composer,/TRIP_PLACES_TIMEOUT/,'a supplemental Places refresh needs a bounded visible timeout');checks++;
  assert.match(composer,/checkpointTripWorkflow\(state,resumedPhase\|\|'candidates',\{categoryRefreshAttempts\}\)/,'the refresh marker must be checkpointed before provider work starts');checks++;
  assert.match(composer,/aiRetryGeneration=Number\(state\.aiRetryGeneration\|\|0\)\+1/,'an explicit visible retry must advance the semantic model generation instead of replaying a contract-invalid successful job');checks++;
  assert.match(composer,/retryGeneration:Number\(state\.aiRetryGeneration\|\|0\)/,'the persisted semantic generation must reach itinerary and audit jobs');checks++;
  assert.match(composer,/aiRetryGeneration:Number\(draft\?\.aiRetryGeneration\|\|0\)/,'the semantic retry generation must survive a browser reload');checks++;
  assert.ok((adapter.match(/retryGeneration:Math\.max\(0,Math\.round\(Number\(input\.retryGeneration\)\|\|0\)\)/g)||[]).length>=3,'compose, day repair and audit must include the semantic retry generation in the persistent job input');checks++;
  assert.match(composer,/workflowIdentity=state=>\(\{[^\n]*startDate:state\.data\.startDate[^\n]*endDate:state\.data\.endDate/,'the persistent workflow identity must separate materially different travel periods');checks++;
  assert.match(composer,/function confirmedAiBrief[\s\S]*?confirmTripBriefWindow/,'restored and edited AI briefs must be reconciled with the owner-confirmed travel window without another model call');checks++;
  assert.match(composer,/if\(aiDraft\.brief\)aiDraft\.brief=confirmedAiBrief\(data,aiDraft\.brief\)/,'a persisted ready itinerary must repair a stale date narrative when the Composer reloads');checks++;
  assert.match(composer,/function invalidateAiBriefForDateEdit[\s\S]*?state\.workflowId=null;state\.workflowKey='';state\.workflowSnapshot=null;state\.aiRetryGeneration=0/,'editing travel dates must leave the exhausted or completed workflow without discarding the reusable semantic brief');checks++;
  assert.match(composer,/resumedPhase==='failed'&&Boolean\(itinerary\)&&repairDayDates\.length>0/,'a failed but preserved itinerary must resume in a bounded targeted-repair lane');checks++;
  assert.match(composer,/checkpointTripWorkflow\(state,'failed',\{brief:clone\(brief\),itinerary:state\.aiDraft\.itinerary/,'the failed checkpoint must retain the repairable itinerary and exact rejection state');checks++;
}

(async()=>{contracts();await providerResume();console.log(`P19 resumable trip workflow: ${checks}/${checks} checks PASS`);})().catch(error=>{console.error(error);process.exitCode=1;});
