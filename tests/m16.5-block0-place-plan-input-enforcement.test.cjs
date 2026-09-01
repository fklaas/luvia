'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const read=file=>fs.readFileSync(file,'utf8');
const ownerCalls=[];
const context={
  console,Object,Array,Map,Set,WeakSet,Error,TypeError,String,Boolean,Number,Math,JSON,Date,Intl,RegExp,Promise,
  crypto:{randomUUID:()=>`block0-${ownerCalls.length+1}`},
  CustomEvent:function(name,options){this.type=name;this.detail=options?.detail},dispatchEvent(){},
  LuviaTripContractV1:{getActiveTrip:()=>({id:'trip-scharbeutz',timeZone:'Europe/Berlin',destination:{name:'Scharbeutz'}})},
  LuviaPlacesContractV1:{commands:{
    async favorite(payload){ownerCalls.push(['favorite',payload]);return{tripPlaceId:'trip-place-1'}},
    async unfavorite(payload){ownerCalls.push(['unfavorite',payload]);return{tripPlaceId:'trip-place-1'}},
    async importPlace(providerPlaceId){ownerCalls.push(['importPlace',providerPlaceId]);return{placeId:'place-1',tripPlaceId:'trip-place-1',providerPlaceId}},
    async plan(payload){ownerCalls.push(['plan',payload]);return{tripPlaceId:payload.tripPlaceId}},
    async unplan(payload){ownerCalls.push(['unplan',payload]);return{tripPlaceId:payload.tripPlaceId}},
    async updateLifecycle(tripPlaceId,status){ownerCalls.push(['updateLifecycle',tripPlaceId,status]);return{tripPlaceId,status}}
  }}
};
context.globalThis=context;
vm.createContext(context);
for(const file of ['core/intelligence/intelligence-action-contract-core.js','core/intelligence/intelligence-action-ledger-core.js','core/ai/ai-action-runtime.js'])vm.runInContext(read(file),context,{filename:file});

const core=context.LuviaIntelligenceActionContractCoreV1,runtime=context.LuviaAIActionRuntime;
assert.equal(core.zonedDateTimeToIso('2026-06-14','14:00','Europe/Berlin'),'2026-06-14T12:00:00.000Z');
assert.equal(core.zonedDateTimeToIso('2026-03-29','02:30','Europe/Berlin'),null,'a daylight-saving gap must never be guessed');
assert.equal(core.zonedDateTimeToIso('2026-10-25','02:30','Europe/Berlin'),null,'an ambiguous daylight-saving time must never be guessed');
assert.equal(core.validateActionInput('places.place.favorite',{tripId:'trip-scharbeutz'},{timeZone:'Europe/Berlin'}).valid,false);
assert.equal(core.validateActionInput('places.place.unfavorite',{tripId:'trip-scharbeutz',providerPlaceId:'provider-place-1'},{timeZone:'Europe/Berlin'}).valid,true);
assert.equal(core.validateActionInput('places.place.unplan',{tripId:'trip-scharbeutz'},{timeZone:'Europe/Berlin'}).valid,false);

const conflicting={tripId:'trip-scharbeutz',providerPlaceId:'provider-place-1',date:'2026-06-14',time:'14:00',fields:{planned_at:'2026-06-14T14:00:00.000Z'}};
assert.throws(
  ()=>runtime.prepare('places.place.plan',conflicting,{userGesture:true,timeZone:'Europe/Berlin'}),
  error=>error.code==='AI_ACTION_INPUT_CONFLICT'&&error.inputIssues.some(issue=>issue.code==='conflict'&&issue.path==='fields.planned_at')
);
assert.equal(runtime.diagnostics().ledger.count,0,'contradictory input must be rejected before ledger creation');
assert.equal(ownerCalls.length,0,'contradictory input must be rejected before any Owner invocation');
assert.throws(()=>runtime.prepare('places.place.favorite',{tripId:'trip-scharbeutz'},{userGesture:true}),error=>error.code==='AI_ACTION_INPUT_REQUIRED'&&error.missingInputs.includes('providerPlaceId'));
assert.throws(()=>runtime.prepare('places.place.unplan',{tripId:'trip-scharbeutz',providerPlaceId:'provider-place-1'},{userGesture:true}),error=>error.code==='AI_ACTION_INPUT_REQUIRED'&&error.missingInputs.includes('tripPlaceId'));
assert.equal(runtime.diagnostics().ledger.count,0,'all invalid Places mutations must fail before ledger creation');

const exact={...conflicting,fields:{planned_at:'2026-06-14T12:00:00.000Z',place_name:'Minigolf Timmendorfer Strand'}};
const prepared=runtime.prepare('places.place.plan',exact,{userGesture:true,timeZone:'Europe/Berlin',idempotencyKey:'block0-plan-once'});
assert.equal(prepared.requiresConfirmation,true);
assert.equal(prepared.result.evidence.preview.date,'2026-06-14');
assert.equal(prepared.result.evidence.preview.time,'14:00');

(async()=>{
  const receipt=await runtime.execute('places.place.plan',{}, {ledgerId:prepared.ledgerId,userGesture:true,confirmed:true});
  assert.equal(receipt.evidence.status,'completed');
  assert.equal(ownerCalls.find(call=>call[0]==='plan')[1].fields.planned_at,'2026-06-14T12:00:00.000Z');
  assert.equal(ownerCalls.filter(call=>call[0]==='plan').length,1);
  const undoPlan=runtime.prepareUndo(prepared.ledgerId,{userGesture:true});
  const unplanned=await runtime.execute('places.place.unplan',{}, {ledgerId:undoPlan.ledgerId,userGesture:true,confirmed:true});
  assert.equal(unplanned.evidence.status,'compensated');
  assert.equal(ownerCalls.filter(call=>call[0]==='unplan').length,1);

  const favorite=runtime.prepare('places.place.favorite',{tripId:'trip-scharbeutz',providerPlaceId:'provider-place-1',placeType:'activities',name:'Minigolf Timmendorfer Strand'},{userGesture:true,idempotencyKey:'block0-favorite-once'});
  const favorited=await runtime.execute('places.place.favorite',{}, {ledgerId:favorite.ledgerId,userGesture:true,confirmed:true});
  assert.equal(favorited.evidence.status,'completed');
  const undoFavorite=runtime.prepareUndo(favorite.ledgerId,{userGesture:true});
  const unfavorited=await runtime.execute('places.place.unfavorite',{}, {ledgerId:undoFavorite.ledgerId,userGesture:true,confirmed:true});
  assert.equal(unfavorited.evidence.status,'compensated');
  assert.equal(ownerCalls.filter(call=>call[0]==='favorite').length,1);
  assert.equal(ownerCalls.filter(call=>call[0]==='unfavorite').length,1);

  console.log('M16.5 Block 0 Places mutation input enforcement: PASS');
  console.log('Favorite / Unfavorite / Plan / Unplan: VALIDATED + RECEIPT + UNDO');
  console.log('14.06.2026 · 14:00 Europe/Berlin -> 2026-06-14T12:00:00.000Z: EXACT');
  console.log('Contradictory owner instant: REJECTED BEFORE LEDGER + OWNER');
})().catch(error=>{console.error(error);process.exitCode=1});
