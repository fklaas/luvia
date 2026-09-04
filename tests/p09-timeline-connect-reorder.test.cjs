'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const read=file=>fs.readFileSync(file,'utf8');

const trip={id:'trip-group',title:'Scharbeutz',startDate:'2027-06-12',endDate:'2027-06-13'};
const owners=[
  {tripPlaceId:'link-a',placeId:'place-a',title:'Restaurant · Hafenfrühstück',revision:1,writes:0,fields:{planned_at:'2027-06-12T08:00:00.000Z',metadata:{durationMinutes:60,notes:'A'}}},
  {tripPlaceId:'link-b',placeId:'place-b',title:'Aktivität · Strandspaziergang',revision:1,writes:0,fields:{planned_at:'2027-06-12T10:00:00.000Z',metadata:{durationMinutes:75,notes:'B'}}}
];
let bookings=[];

function entry(owner){return{id:`tpd:${owner.tripPlaceId}:planned_at`,source:'place-data',dataKey:'planned_at',sourceRevision:`${owner.tripPlaceId}-rev-${owner.revision}`,tripId:trip.id,tripPlaceId:owner.tripPlaceId,placeId:owner.placeId,providerPlaceId:`provider-${owner.placeId}`,entityType:owner.tripPlaceId==='link-a'?'restaurant':'activity',kind:'planned',title:owner.title,startAt:owner.fields.planned_at,durationMinutes:Number(owner.fields.metadata?.durationMinutes)||60,automatic:false,fields:owner.fields,metadata:owner.fields.metadata||{}}}
const other={id:'schedule:other',source:'schedule',sourceRevision:'other-rev',tripId:trip.id,entityType:'activity',title:'Paralleltermin',startAt:'2027-06-12T10:30:00.000Z',durationMinutes:30,automatic:false,metadata:{}};
const entries=()=>[...owners.map(entry),other];
function provider(){return{snapshot:()=>({entries:entries()}),subscribe:()=>()=>{},hydrate:async()=>({entries:entries()}),removalRecoveries:()=>[],removalRestoreReceipts:()=>[],diagnostics:()=>({cloudAuthoritative:true,realtime:false,metrics:{}})}}
function load(){
  const context={console,Date,Intl,Map,Set,Promise,Object,Array,String,Number,Boolean,RegExp,JSON,Error,TypeError,structuredClone,CustomEvent:function(name,options){this.type=name;this.detail=options?.detail},dispatchEvent(){},LuviaTimelineCore:provider(),LuviaTripContractV1:{getActiveTrip:()=>trip},LuviaBookingContractV1:{reads:{listForTrip:async()=>bookings}},LuviaPlacesContractV1:{commands:{plan:async input=>{
    const owner=owners.find(item=>item.tripPlaceId===input.tripPlaceId);assert.ok(owner,'known owner');if(input.expectedUpdatedAt!==`${owner.tripPlaceId}-rev-${owner.revision}`)throw new Error('stale owner');owner.writes+=1;owner.fields={...owner.fields,...structuredClone(input.fields)};owner.revision+=1;return{updated_at:`${owner.tripPlaceId}-rev-${owner.revision}`};
  }}},LuviaFeatureFlagRegistry:{register(){}},LuviaGlobalContracts:{register(){}}};context.window=context;context.globalThis=context;vm.createContext(context);for(const file of ['core/journey/journey-domain-contract-core.js','core/journey/journey-resilience-core.js','core/platform/journey-contract-adapter.js'])vm.runInContext(read(file),context,{filename:file});return context;
}

(async()=>{
  let context=load(),api=context.LuviaJourneyContractV1,originalIds=owners.map(owner=>entry(owner).id),reverse=[...originalIds].reverse();
  let preview=api.reads.previewConnectionReorder({orderIds:reverse});assert.equal(preview.after[0].entryId,originalIds[1]);assert.equal(preview.after[0].startAt,'2027-06-12T08:00:00.000Z');assert.equal(preview.after[1].entryId,originalIds[0]);assert.equal(preview.after[1].startAt,'2027-06-12T10:00:00.000Z');assert.ok(preview.conflicts.length>0);assert.equal(owners.reduce((sum,item)=>sum+item.writes,0),0);
  await assert.rejects(()=>api.commands.connectAndReorderEntries({operationId:'group-1',orderIds:reverse,expectedRevisions:preview.expectedRevisions}),/prüfen und bestätigen/);
  const stale={...preview.expectedRevisions,[originalIds[0]]:'wrong'};await assert.rejects(()=>api.commands.connectAndReorderEntries({confirmed:true,operationId:'group-stale',orderIds:reverse,expectedRevisions:stale,expectedConflictSignature:JSON.stringify(preview.conflicts),conflictsAccepted:true}),/inzwischen geändert/);
  bookings=[{trip_place_id:'link-b'}];await assert.rejects(()=>api.commands.connectAndReorderEntries({confirmed:true,operationId:'group-booked',orderIds:reverse,expectedRevisions:preview.expectedRevisions,expectedConflictSignature:JSON.stringify(preview.conflicts),conflictsAccepted:true}),/Buchung verwalten/);bookings=[];
  await assert.rejects(()=>api.commands.connectAndReorderEntries({confirmed:true,operationId:'group-1',orderIds:reverse,expectedRevisions:preview.expectedRevisions,expectedConflictSignature:JSON.stringify(preview.conflicts)}),/ausdrücklich bestätigen/);
  const saved=await api.commands.connectAndReorderEntries({confirmed:true,operationId:'group-1',orderIds:reverse,expectedRevisions:preview.expectedRevisions,expectedConflictSignature:JSON.stringify(preview.conflicts),conflictsAccepted:true});assert.equal(saved.entryIds.length,2);assert.equal(owners[0].fields.planned_at,'2027-06-12T10:00:00.000Z');assert.equal(owners[1].fields.planned_at,'2027-06-12T08:00:00.000Z');assert.equal(owners[0].fields.metadata.notes,'A');assert.equal(owners[1].fields.metadata.notes,'B');assert.equal(owners[0].fields.metadata.timelineConnection.order,1);assert.equal(owners[1].fields.metadata.timelineConnection.order,0);

  context=load();api=context.LuviaJourneyContractV1;const recovery=api.reads.connectionRecoveries()[0];assert.equal(recovery.memberIds.length,2);assert.equal(recovery.members.length,2);const writesAfterSave=owners.reduce((sum,item)=>sum+item.writes,0);const replayed=await api.commands.connectAndReorderEntries({confirmed:true,operationId:'group-1',orderIds:reverse,expectedRevisions:recovery.expectedRevisions,conflictsAccepted:true});assert.equal(replayed.replayed,true);assert.equal(owners.reduce((sum,item)=>sum+item.writes,0),writesAfterSave);
  const restorePreview=api.reads.previewConnectionRestore(recovery.recoveryId);bookings=[{trip_place_id:'link-a'}];await assert.rejects(()=>api.commands.restoreConnectionReorder(recovery.recoveryId,{confirmed:true,operationId:'restore-group-booked',expectedRevisions:restorePreview.expectedRevisions,expectedConflictSignature:JSON.stringify(restorePreview.conflicts),conflictsAccepted:true}),/Buchung verwalten/);bookings=[];
  const restored=await api.commands.restoreConnectionReorder(recovery.recoveryId,{confirmed:true,operationId:'restore-group-1',expectedRevisions:restorePreview.expectedRevisions,expectedConflictSignature:JSON.stringify(restorePreview.conflicts),conflictsAccepted:true});assert.equal(restored.memberIds.length,2);assert.equal(owners[0].fields.planned_at,'2027-06-12T08:00:00.000Z');assert.equal(owners[1].fields.planned_at,'2027-06-12T10:00:00.000Z');assert.equal(owners[0].fields.metadata.timelineConnection,null);assert.equal(owners[1].fields.metadata.timelineConnectionRecovery,null);
  context=load();api=context.LuviaJourneyContractV1;assert.equal(api.reads.connectionRecoveries().length,0);const writesAfterRestore=owners.reduce((sum,item)=>sum+item.writes,0);const restoreReplay=await api.commands.restoreConnectionReorder(recovery.recoveryId,{confirmed:true,operationId:'restore-group-1'});assert.equal(restoreReplay.replayed,true);assert.equal(owners.reduce((sum,item)=>sum+item.writes,0),writesAfterRestore);

  const composer=read('app/journey/journey-day-composer.js');for(const marker of ['data-group-action','previewConnectionReorder','connectAndReorderEntries','Gemeinsamer Weg','connectionRecoveries','restoreConnectionReorder'])assert.ok(composer.includes(marker),`consumer marker missing: ${marker}`);
  console.log('P09 connected multi-reorder: preview, confirmation, stale/booking/conflict gates, owner readback, reload recovery, restore and idempotency PASS');
})().catch(error=>{console.error(error);process.exitCode=1});
