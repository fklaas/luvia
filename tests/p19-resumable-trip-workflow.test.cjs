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
  const starts=calls.filter(call=>call.action==='trip.plan-job.start');
  assert.equal(starts.length,2);assert.equal(starts[0].payload.idempotencyKey,starts[1].payload.idempotencyKey);assert.deepEqual(starts[0].payload.context,starts[1].payload.context);assert.equal(starts[0].payload.input.days[0].entries[0].evidence.refs[0].id,'evidence-valencia-1');assert.equal(starts[0].payload.workflowId,workflow.id);assert.equal(reads,1);checks+=6;
}

function contracts(){
  const migration=read('supabase/migrations/20260908193000_intelligence_resumable_trip_jobs.sql'),singleActive=read('supabase/migrations/20260908204500_intelligence_single_active_trip_job.sql');
  assert.match(migration,/intelligence_trip_plan_workflows/);assert.match(migration,/unique \(user_id, idempotency_key\)/);assert.match(migration,/force row level security/);assert.match(migration,/revoke all on table public\.intelligence_trip_plan_jobs from anon, authenticated/);checks+=4;
  assert.match(singleActive,/unique index[\s\S]*\(workflow_id, capability\)[\s\S]*queued[\s\S]*running/);checks++;
  const jobs=read('supabase/functions/luvia-intelligence/jobs/trip-plan.ts'),handler=read('supabase/functions/luvia-intelligence/index.ts');
  assert.match(jobs,/EdgeRuntime/);assert.match(jobs,/request_payload:null/);assert.match(jobs,/attempt_count<3|lt\('attempt_count',3\)/);assert.match(jobs,/input_fingerprint/);assert.match(jobs,/AI_WORKFLOW_BUDGET_EXHAUSTED/);assert.match(jobs,/\.eq\('workflow_id',workflowId\)\.eq\('capability',capabilityId\)\.in\('status',\['queued','running'\]\)/);checks+=6;
  assert.match(handler,/trip\.plan-workflow\.checkpoint/);assert.match(handler,/resumableTripWorkflow:true/);assert.match(handler,/jobTtlHours:24/);assert.match(handler,/singleActiveCapabilityJob:true/);assert.match(handler,/workflowBudget:TRIP_WORKFLOW_BUDGET/);checks+=5;
  const composer=read('app/first-trip-composer.js'),core=read('core/ai/ai-core.js');
  assert.match(composer,/workflowId:state\.workflowId\|\|null/);assert.match(composer,/ready-for-review/);assert.match(composer,/AI_JOB_PENDING/);assert.match(composer,/resumedPhase==='audit'/);assert.match(composer,/qualityAttempts\?qualityAttempts-1:0/);assert.match(core,/runPersistent/);checks+=6;
  assert.match(composer,/checkpointTripWorkflow\(state,'audit',\{itinerary:clone\(itinerary\),qualityAttempts/);checks++;
  assert.match(composer,/checkpointTripWorkflow\(state,'ready-for-review',\{audit:clone\(audit\),qualityAttempts\}/);checks++;
  assert.doesNotMatch(composer,/checkpointTripWorkflow\(state,'audit',\{[^\n]*candidates:/);checks++;
  assert.doesNotMatch(composer,/checkpointTripWorkflow\(state,'ready-for-review',\{[^\n]*candidates:/);checks++;
  assert.match(composer,/state\.aiDraft\.brief=clone\(brief\);state\.aiDraft\.phase='places'/);checks++;
}

(async()=>{contracts();await providerResume();console.log(`P19 resumable trip workflow: ${checks}/${checks} checks PASS`);})().catch(error=>{console.error(error);process.exitCode=1;});
