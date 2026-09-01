'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const read=file=>fs.readFileSync(file,'utf8');
const ownerCommands=[];
const trips=[{id:'trip-1',title:'Ostsee',startDate:'2026-06-12',endDate:'2026-06-15'},{id:'trip-2',title:'Dänemark',startDate:'2026-08-02',endDate:'2026-08-12'}];
let activeTrip=trips[0],uuidSequence=0,journeyReads=0;
const tripContract={
  getActiveTrip:()=>activeTrip,
  listTrips:()=>trips,
  reads:{getActiveTrip:()=>activeTrip,listTrips:()=>trips},
  commands:{
    selectActiveTrip(tripId){ownerCommands.push(['selectActiveTrip',tripId]);activeTrip=trips.find(trip=>trip.id===tripId)||null;return activeTrip},
    async updateTrip(tripId,patch){ownerCommands.push(['updateTrip',tripId,patch]);return{...trips.find(trip=>trip.id===tripId),...patch}}
  }
};
const journeyContract={
  reads:{async snapshot({trip}){journeyReads++;return{days:[{date:'2026-06-14',entries:[{id:'moment-1',title:'Minigolf',startAt:'2026-06-14T12:00:00Z'}]}],summary:{tripId:trip.id}}}},
  commands:{async openPlanningEditor(payload){ownerCommands.push(['openPlanningEditor',payload]);return{opened:true}}}
};
const context={
  console,Object,Array,Map,Set,WeakSet,Error,TypeError,String,Boolean,Number,Math,JSON,Date,Intl,RegExp,Promise,
  crypto:{randomUUID:()=>`block0-journey-trip-${++uuidSequence}`},
  CustomEvent:function(name,options){this.type=name;this.detail=options?.detail},dispatchEvent(){},
  LuviaTripContractV1:tripContract,
  LuviaJourneyContractV1:journeyContract
};
context.globalThis=context;
vm.createContext(context);
for(const file of ['core/intelligence/intelligence-action-contract-core.js','core/intelligence/intelligence-action-ledger-core.js','core/ai/ai-action-runtime.js'])vm.runInContext(read(file),context,{filename:file});

const core=context.LuviaIntelligenceActionContractCoreV1,runtime=context.LuviaAIActionRuntime;
assert.equal(core.validateActionInput('journey.day.read',{query:'Zeige den Tagesplan',date:'2026-06-14',includePlanningDetails:true},{tripId:'trip-1'}).valid,true);
assert.equal(core.validateActionInput('journey.day.open',{tripId:'trip-1',date:'2026-06-14',mode:'edit'},{}).valid,true);
assert.equal(core.validateActionInput('trip.active.list',{query:'Meine Reisen'},{}).valid,true);
assert.equal(core.validateActionInput('trip.active.select',{tripId:'trip-2'},{tripId:'trip-1'}).valid,true);
assert.equal(core.validateActionInput('trip.update.details',{tripId:'trip-1',patch:{title:'Ostsee mit Kindern'}},{}).valid,true);

assert.throws(()=>runtime.prepare('journey.day.open',{date:'2026-06-14'},{userGesture:true}),error=>error.code==='AI_ACTION_INPUT_REQUIRED'&&error.missingInputs.includes('tripId'));
assert.throws(()=>runtime.prepare('journey.day.open',{tripId:'trip-1',date:'2026-02-30',mode:'edit'},{userGesture:true}),error=>error.code==='AI_ACTION_INPUT_CONFLICT'&&error.inputIssues.some(issue=>issue.path==='date'));
assert.throws(()=>runtime.prepare('trip.active.select',{}, {userGesture:true}),error=>error.code==='AI_ACTION_INPUT_REQUIRED'&&error.missingInputs.includes('tripId'));
assert.throws(()=>runtime.prepare('trip.active.select',{tripId:'trip-does-not-exist'}, {userGesture:true}),error=>error.code==='AI_ACTION_INPUT_CONFLICT'&&error.inputIssues.some(issue=>issue.code==='owner-reference'));
assert.throws(()=>runtime.prepare('trip.update.details',{tripId:'trip-1',patch:{}}, {userGesture:true}),error=>error.code==='AI_ACTION_INPUT_REQUIRED'&&error.missingInputs.includes('patch'));
assert.throws(()=>runtime.prepare('trip.update.details',{tripId:'trip-1',patch:{startDate:'2026-08-10',endDate:'2026-08-02'}}, {userGesture:true}),error=>error.code==='AI_ACTION_INPUT_CONFLICT'&&error.inputIssues.some(issue=>issue.path==='patch.endDate'));
assert.equal(runtime.diagnostics().ledger.count,0,'invalid journey/trip input must fail before ledger creation');
assert.equal(ownerCommands.length,0,'invalid journey/trip input must fail before owner commands');

(async()=>{
  activeTrip=null;
  const missingTrip=await runtime.runMessage('Zeige mir den Tagesplan');
  assert.equal(missingTrip.error,true);
  assert.equal(missingTrip.results[0].evidence.code,'AI_ACTION_INPUT_REQUIRED');
  assert.equal(journeyReads,0,'journey read validation must run before the owner read');
  activeTrip=trips[0];
  const invalidDate=await runtime.runMessage('Zeige den Tagesplan am ungültigen Datum',{compiledIntent:{contractId:'intelligence.travel-orchestration.v1',status:'compiled',intents:[{domain:'journey',clause:'Tagesplan',mode:'read',temporalHint:{date:'2026-02-30'}}]}});
  assert.equal(invalidDate.error,true);
  assert.equal(journeyReads,0);

  const day=await runtime.runMessage('Zeige mir den Tagesplan');
  assert.equal(day.error,false);
  assert.equal(day.results[0].kind,'day_plan');
  assert.equal(journeyReads,1);
  assert.equal(day.results[0].actions[0].actionId,'journey.day.open');

  const opened=runtime.prepare('journey.day.open',{tripId:'trip-1',date:'2026-06-14',mode:'edit'},{userGesture:true});
  assert.equal(opened.requiresConfirmation,false);
  const openedReceipt=await runtime.execute('journey.day.open',{}, {ledgerId:opened.ledgerId,userGesture:true});
  assert.equal(openedReceipt.evidence.status,'opened');

  const listed=await runtime.runMessage('Zeige meine Reisen');
  assert.equal(listed.error,false);
  assert.equal(listed.results[0].kind,'trip_collection');
  assert.equal(listed.results[0].items.length,2);

  const selected=runtime.prepare('trip.active.select',{tripId:'trip-2',name:'Dänemark'},{userGesture:true,idempotencyKey:'trip-select-once'});
  assert.equal(selected.result.kind,'confirmation');
  const selectedReceipt=await runtime.execute('trip.active.select',{}, {ledgerId:selected.ledgerId,userGesture:true,confirmed:true});
  assert.equal(selectedReceipt.evidence.status,'completed');
  assert.equal(activeTrip.id,'trip-2');
  const undo=runtime.prepareUndo(selected.ledgerId,{userGesture:true});
  const undoReceipt=await runtime.execute('trip.active.select',{}, {ledgerId:undo.ledgerId,userGesture:true,confirmed:true});
  assert.equal(undoReceipt.evidence.status,'compensated');
  assert.equal(activeTrip.id,'trip-1');

  const updated=runtime.prepare('trip.update.details',{tripId:'trip-1',patch:{title:'Ostsee mit Kindern',startDate:'2026-06-12',endDate:'2026-06-16'}},{userGesture:true,idempotencyKey:'trip-update-once'});
  const updateReceipt=await runtime.execute('trip.update.details',{}, {ledgerId:updated.ledgerId,userGesture:true,confirmed:true});
  assert.equal(updateReceipt.evidence.status,'completed');
  assert.equal(ownerCommands.filter(call=>call[0]==='updateTrip').length,1);
  assert.equal(runtime.recoveryPlan(updated.ledgerId).kind,'owner-recovery','trip detail undo needs an owner-owned before snapshot');

  console.log('M16.5 Block 0 Journey + Trip input enforcement: PASS');
  console.log('Day Read/Open + Trip List/Select/Update: VALIDATED');
  console.log('Invalid dates/references/patches: BLOCKED BEFORE MUTATION');
  console.log('Trip select receipt + Owner compensation: PASS');
})().catch(error=>{console.error(error);process.exitCode=1});
