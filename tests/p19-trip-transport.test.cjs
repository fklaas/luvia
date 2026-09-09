'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{stripTypeScriptTypes}=require('node:module');
const read=p=>fs.readFileSync(p,'utf8'),copy=value=>JSON.parse(JSON.stringify(value));
let checks=0;
function check(fn){fn();checks++;}
const privacy=vm.createContext({TextEncoder,crypto:globalThis.crypto});
vm.runInContext(stripTypeScriptTypes(read('supabase/functions/luvia-intelligence/policies/privacy.ts').replace(/\bexport\s+/g,'')),privacy);
const sanitize=value=>privacy.sanitizeTripPayload(value);
function transport(){
  const calls=[],store=new Map();let fail=null;
  const sandbox={TextEncoder,Date,setTimeout,clearTimeout,Promise,Map,Set,console,CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail}},dispatchEvent(){}};
  sandbox.window=sandbox;sandbox.globalThis=sandbox;
  sandbox.LuviaSupabaseService={start:async()=>({functions:{invoke:async(name,{body})=>{
    calls.push(copy(body));if(fail)return {error:fail};
    if(body.action==='trip.plan-workflow.checkpoint'){const state=sanitize(copy(body.payload.state));store.set(body.payload.workflowId,state);return {data:{ok:true,data:{workflow:{id:body.payload.workflowId,phaseState:copy(state)}}}};}
    if(body.action==='trip.plan-workflow.read')return {data:{ok:true,data:{workflow:{id:body.payload.workflowId,phaseState:copy(store.get(body.payload.workflowId))}}}};
    return {data:{ok:false,error:{code:'TEST_CAPTURED',message:'model not executed'}}};
  }}})};
  vm.createContext(sandbox);
  for(const p of ['core/intelligence/intelligence-domain-contract-core.js','core/ai/ai-policy-service.js','core/ai/ai-capability-registry.js','core/ai/ai-model-router.js','core/ai/ai-context-service.js','core/ai/ai-output-validator.js','core/ai/providers/openai-provider.js','core/ai/ai-core.js'])vm.runInContext(read(p),sandbox,{filename:p});
  return {sandbox,calls,fail:error=>fail=error};
}
async function run(){
  const t=transport(),provider=t.sandbox.LuviaOpenAIProvider;
  for(const days of [14,21,28]){
    const candidates=Array.from({length:days*9},(_,i)=>({providerPlaceId:'verified-place-'+i,name:'Ort '+i,category:['water','food','culture','shopping'][i%4],coordinates:{latitude:39.46+i*.0001,longitude:-.35},profileFit:{state:'unknown',evidence:{nested:{source:{reference:{id:'proof-'+i}}}}}}));
    const state={candidates,selectedDates:{startDate:'2027-06-01',endDate:'2027-06-'+String(days).padStart(2,'0')},completedSections:Array.from({length:Math.ceil(days/7)},(_,i)=>({index:i,result:{days:[{date:'section-'+i,entries:[{providerPlaceId:'verified-place-'+i}]}]}})),email:'private@example.test'};
    const saved=await provider.checkpointTripWorkflow('test-'+days,'itinerary',state),restored=await provider.readTripWorkflow('test-'+days);
    check(()=>assert.deepEqual(copy(restored.phaseState.candidates),candidates,days+'-day reserve survives the real client serialization and server sanitizer'));
    check(()=>assert.equal(saved.phaseState.email,undefined));
    check(()=>assert.deepEqual(copy(restored.phaseState.completedSections),state.completedSections));
    // Recreated clients simulate app reload; the server representation itself is lossless.
    const fresh=transport();await fresh.sandbox.LuviaOpenAIProvider.checkpointTripWorkflow('restored','itinerary',restored.phaseState);
    check(()=>assert.equal(fresh.calls[0].payload.state.candidates.at(-1).providerPlaceId,candidates.at(-1).providerPlaceId));
  }
  const fullInput={surface:'trip-composer',candidateCatalog:Array.from({length:64},(_,i)=>({providerPlaceId:'p'+i,name:'Ort '+i})),days:Array.from({length:28},(_,i)=>({date:'day'+i})),travelOrder:{hardConstraints:{accessibility:['wheelchair']}}};
  await assert.rejects(()=>t.sandbox.LuviaAI.run('trip.compose',fullInput,{fallback:false}),e=>e.code==='TEST_CAPTURED');checks++;
  const request=t.calls.at(-1).payload;
  check(()=>assert.equal(request.input.candidateCatalog.length,64,'AI policy no longer truncates trip candidates to 50'));
  check(()=>assert.equal(request.context.currentMoment.candidateCatalog,undefined,'The full input is not duplicated into context'));
  check(()=>assert.equal(request.input.travelOrder.hardConstraints.accessibility[0],'wheelchair'));
  t.fail({message:'Edge Function returned a non-2xx status code',context:{status:413,clone:()=>({json:async()=>({error:{code:'PAYLOAD_TOO_LARGE',message:'Too large'},meta:{requestId:'exact-server-request'}})})}});
  await assert.rejects(()=>provider.invoke('brain.run',{capability:'trip.audit'}),e=>e.code==='PAYLOAD_TOO_LARGE'&&e.requestId==='exact-server-request');checks++;
  check(()=>assert.equal(provider.diagnostics().lastError.requestId,'exact-server-request'));
  const top=transport();top.fail({message:'Edge failed',context:{status:401,code:'INVALID_SESSION',message:'Session expired'}});
  await assert.rejects(()=>top.sandbox.LuviaOpenAIProvider.invoke('brain.run',{}),e=>e.code==='INVALID_SESSION');checks++;
  const bounds=transport();await assert.rejects(()=>bounds.sandbox.LuviaOpenAIProvider.invoke('brain.run',{values:Array.from({length:1000},()=> 'x'.repeat(1000))}),e=>e.code==='AI_PAYLOAD_TOO_LARGE');checks++;
  check(()=>assert.equal(bounds.calls.length,0,'Oversized model input fails before spending a request'));
  const harnessSource=read('tests/trip-composer-recovery.test.cjs').split('\n(async()=>{\n  let checks=0;')[0];
  const harness=new Function('require',harnessSource+'\nreturn harness;')(require);
  for(const days of [14,21,28]){
    const h=harness(),state=h.state;state.data.startDate='2027-06-01';state.data.endDate='2027-06-'+String(days).padStart(2,'0');
    const candidates=Array.from({length:days*9},(_,i)=>({...h.candidate(['food','culture','activities','water'][i%4],i+1),providerPlaceId:'geoapify:'+i.toString(16).padStart(120,'a')}));
    const sections=[];let interrupt=true;
    const params={qualityAttempt:3,repairInstructions:['Die Reise mit belegten Alternativen neu komponieren.'],destination:state.data.destination,days:h.api.itineraryDays(state),candidates,brief:{travelOrder:{rhythm:{freeTimePercent:20},categories:[]},policy:{}},tripPreferences:state.data.tripPreferences,onSection:async list=>{sections.splice(0,sections.length,...copy(list));if(interrupt&&list.length===1)throw Object.assign(new Error('screen locked'),{code:'TEST_LOCK'});}};
    await assert.rejects(()=>h.sandbox.LuviaIntelligenceContractV1.reads.composeTripItinerary(params),e=>e.code==='TEST_LOCK');checks++;
    const before=h.sandbox.modelCalls.length;interrupt=false;
    const itinerary=await h.sandbox.LuviaIntelligenceContractV1.reads.composeTripItinerary({...params,completedSections:sections});
    check(()=>assert.equal(itinerary.days.length,days));
    check(()=>assert.equal(h.sandbox.modelCalls.length-before,Math.ceil(days/7)-1,'Saved first section is not recomputed after screen lock'));
    check(()=>assert.ok(h.sandbox.modelCalls.every(call=>call.request.days.length<=7&&call.request.candidateCatalog.length<=64)));
    check(()=>assert.ok(h.sandbox.modelCalls.every(call=>call.request.candidateCatalog.every(place=>/^p[0-9]+$/.test(place.providerPlaceId))),'Models use short references instead of copying long opaque provider identifiers'));
    check(()=>assert.ok(h.sandbox.modelCalls.every(call=>call.request.referenceSet),'Idempotency includes the real reference set as well as the short aliases'));
    check(()=>assert.ok(h.sandbox.modelCalls.every(call=>call.options.tier==='fast'),'Whole-trip retries retain the fast composition lane; stronger models repair individual days'));
    const ids=itinerary.days.flatMap(day=>day.entries.map(entry=>entry.providerPlaceId));check(()=>assert.ok(ids.every(id=>id.startsWith('geoapify:')),'Only exact original verified Place ids leave the adapter'));check(()=>assert.equal(new Set(ids).size,ids.length,'No Place repeats across section boundaries'));
    const calls=h.sandbox.modelCalls;check(()=>assert.equal(calls[1].request.days[0].role,'full','A later section does not introduce a second arrival day'));
    await h.sandbox.LuviaIntelligenceContractV1.reads.auditTripItinerary({brief:params.brief,destination:state.data.destination,candidates,itinerary});
    check(()=>assert.equal(h.sandbox.modelCalls.at(-1).request.itinerary.days.length,days,'One final audit sees the complete journey'));
    check(()=>assert.equal(h.sandbox.modelCalls.at(-1).request.itinerary.evidenceCatalog,undefined,'Audit evidence is not duplicated'));
    state.aiDraft.places=candidates;state.aiDraft.brief=params.brief;
    const quality=h.api.tripPoolQuality(state,candidates);check(()=>assert.ok(quality.distinctAreas>1&&quality.categoryTargets.length>0));
    const concentrated=candidates.map(place=>({...place,coordinates:state.data.destination}));check(()=>assert.equal(h.api.tripPoolQuality(state,concentrated).spatialReady,false,'A single cluster fails pre-composition spatial quality even with hundreds of Places'));
  }

  const beach=harness(),beachState=beach.state;beachState.data.startDate='2027-06-01';beachState.data.endDate='2027-06-03';
  const beachCandidates=Array.from({length:30},(_,i)=>beach.candidate(['water','food','culture'][i%3],i+1)),baseRun=beach.sandbox.LuviaAI.run;let anchorMinutes=180;
  beach.sandbox.LuviaAI.run=async(capability,request,options)=>{const response=await baseRun(capability,request,options);if(capability==='trip.compose'){const day=response.data.days[1];day.entries=day.entries.slice(0,2);day.entries[0].time='09:30';day.entries[0].durationMinutes=anchorMinutes;day.entries[1].time='17:00';day.entries[1].durationMinutes=60;day.freeTime=[{start:'13:30',end:'16:30',purpose:'Bewusste Strandzeit und Erholung'}];}return response;};
  const beachParams={days:beach.api.itineraryDays(beachState),destination:beachState.data.destination,candidates:beachCandidates,brief:{travelOrder:{rhythm:{freeTimePercent:25}},policy:{}}};
  const beachPlan=await beach.sandbox.LuviaIntelligenceContractV1.reads.composeTripItinerary(beachParams);
  check(()=>assert.equal(beachPlan.days[1].entries.length,2));
  check(()=>assert.ok(!beachPlan.contractIssues.some(issue=>issue.code==='TRIP_ITINERARY_DAY_TOO_THIN'),'A three-hour anchor plus a second moment and deliberate free time is a full planned day'));
  check(()=>assert.equal(beachPlan.dayPolicies[1].longStayAlternative.minimumAnchorMinutes,180,'The model and independent audit receive the same explicit alternative criterion'));
  anchorMinutes=60;const thinPlan=await beach.sandbox.LuviaIntelligenceContractV1.reads.composeTripItinerary(beachParams);
  check(()=>assert.ok(thinPlan.contractIssues.some(issue=>issue.code==='TRIP_ITINERARY_DAY_TOO_THIN'),'Two short visits cannot masquerade as a long beach day'));
  const restart=harness();await restart.api.loadAiDayDraft(restart.state);restart.state.aiDraft={...restart.state.aiDraft,status:'error',phase:'repair',resumePhase:'repair',audit:null,qualityAttempts:3,retryEscalated:true,repairDayDates:[],repairInstructions:['Gesamten Entwurf mit geprüften Alternativen verbessern.']};
  const restartRun=restart.sandbox.LuviaAI.run;let sparse=true;restart.sandbox.modelCalls=[];
  restart.sandbox.LuviaAI.run=async(capability,request,options)=>{const response=await restartRun(capability,request,options);if(capability==='trip.compose'&&sparse){sparse=false;response.data.days[1].entries=[];}return response;};
  await restart.api.loadAiDayDraft(restart.state,{force:true,confirmedBrief:true});
  check(()=>assert.equal(restart.state.aiDraft.status,'ready','A fresh full retry can repair one thin day without requiring another manual Retry'));
  check(()=>assert.ok(restart.sandbox.modelCalls.some(call=>call.capability==='trip.compose-day-repair')));
  console.log('P19 trip transport, reserves and sections: '+checks+'/'+checks+' PASS');
}
run().catch(error=>{console.error(error);process.exitCode=1});
