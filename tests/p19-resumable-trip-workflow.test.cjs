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
  const payload={capability:'trip.compose',tier:'fast',input:{days:[{date:'2027-06-12'}]},context:{currentMoment:{surface:'trip-composer'}}};
  const first=await provider.runPersistent(payload,{workflowId:workflow.id,pollMs:1,timeoutMs:16000});
  assert.equal(first.data.result.title,'Fortgesetzter Entwurf');assert.equal(first.meta.resumable,true);checks+=2;
  const second=await provider.runPersistent(payload,{workflowId:workflow.id,pollMs:1,timeoutMs:16000});
  assert.equal(second.data.result.title,'Fortgesetzter Entwurf');assert.equal(executions,1,'Same semantic request must reuse one server execution');checks+=2;
  const starts=calls.filter(call=>call.action==='trip.plan-job.start');
  assert.equal(starts.length,2);assert.equal(starts[0].payload.idempotencyKey,starts[1].payload.idempotencyKey);assert.equal(starts[0].payload.workflowId,workflow.id);assert.equal(reads,1);checks+=4;
}

function contracts(){
  const migration=read('supabase/migrations/20260908193000_intelligence_resumable_trip_jobs.sql');
  assert.match(migration,/intelligence_trip_plan_workflows/);assert.match(migration,/unique \(user_id, idempotency_key\)/);assert.match(migration,/force row level security/);assert.match(migration,/revoke all on table public\.intelligence_trip_plan_jobs from anon, authenticated/);checks+=4;
  const jobs=read('supabase/functions/luvia-intelligence/jobs/trip-plan.ts'),handler=read('supabase/functions/luvia-intelligence/index.ts');
  assert.match(jobs,/EdgeRuntime/);assert.match(jobs,/request_payload:null/);assert.match(jobs,/attempt_count<3|lt\('attempt_count',3\)/);assert.match(jobs,/input_fingerprint/);checks+=4;
  assert.match(handler,/trip\.plan-workflow\.checkpoint/);assert.match(handler,/resumableTripWorkflow:true/);assert.match(handler,/jobTtlHours:24/);checks+=3;
  const composer=read('app/first-trip-composer.js'),core=read('core/ai/ai-core.js');
  assert.match(composer,/workflowId:state\.workflowId\|\|null/);assert.match(composer,/ready-for-review/);assert.match(composer,/AI_JOB_PENDING/);assert.match(core,/runPersistent/);checks+=4;
}

(async()=>{contracts();await providerResume();console.log(`P19 resumable trip workflow: ${checks}/${checks} checks PASS`);})().catch(error=>{console.error(error);process.exitCode=1;});
