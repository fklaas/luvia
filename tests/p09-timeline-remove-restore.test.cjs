'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const read=file=>fs.readFileSync(file,'utf8');

const trip={id:'trip-1',title:'Scharbeutz',startDate:'2027-06-12',endDate:'2027-06-13'};
const owner={
  revision:1,
  writes:0,
  fields:{planned_at:'2027-06-12T10:00:00.000Z',place_name:'Testcafé',metadata:{durationMinutes:60,notes:'bleibt erhalten'}},
  bookings:[]
};

function sourceEntry(){
  if(!owner.fields.planned_at)return null;
  return{id:'tpd:link-1:planned_at',source:'place-data',dataKey:'planned_at',sourceRevision:`rev-${owner.revision}`,tripId:trip.id,tripPlaceId:'link-1',placeId:'place-1',providerPlaceId:'provider-1',entityType:'restaurant',kind:'planned',title:'Restaurant · Testcafé',startAt:owner.fields.planned_at,durationMinutes:Number(owner.fields.metadata?.durationMinutes)||60,automatic:false,metadata:owner.fields.metadata||{}};
}
const conflictingEntry={id:'schedule:other',source:'schedule',sourceRevision:'other-rev',tripId:trip.id,entityType:'activity',title:'Paralleltermin',startAt:'2027-06-12T10:30:00.000Z',durationMinutes:45,automatic:false,metadata:{}};
function provider(){
  return{
    snapshot:()=>({entries:[sourceEntry(),conflictingEntry].filter(Boolean)}),
    subscribe:()=>()=>{},
    hydrate:async()=>({entries:[sourceEntry(),conflictingEntry].filter(Boolean)}),
    removalRecoveries:()=>{const metadata=owner.fields.metadata||{},receipt=metadata.timelineRemovalRecovery;return receipt&&!owner.fields.planned_at?[{...receipt,expectedRevision:`rev-${owner.revision}`,ownerMetadata:structuredClone(metadata)}]:[]},
    removalRestoreReceipts:()=>{const receipt=owner.fields.metadata?.timelineRemovalLastRestore;return receipt?[{...receipt,expectedRevision:`rev-${owner.revision}`}]:[]},
    diagnostics:()=>({cloudAuthoritative:true,realtime:false,metrics:{}}),
    removeEntry:async()=>true
  };
}
function load(){
  const context={console,Date,Intl,Map,Set,Promise,Object,Array,String,Number,Boolean,RegExp,JSON,Error,TypeError,structuredClone,CustomEvent:function(name,options){this.type=name;this.detail=options?.detail},dispatchEvent(){},LuviaTimelineCore:provider(),LuviaTripContractV1:{getActiveTrip:()=>trip},LuviaBookingContractV1:{reads:{listForTrip:async()=>owner.bookings}},LuviaPlacesContractV1:{commands:{plan:async input=>{
    assert.equal(input.tripId,trip.id);assert.equal(input.tripPlaceId,'link-1');
    if(input.expectedUpdatedAt!==`rev-${owner.revision}`)throw new Error('Der Eintrag wurde inzwischen geändert.');
    owner.writes+=1;owner.fields={...owner.fields,...input.fields};owner.revision+=1;return{updated_at:`rev-${owner.revision}`};
  }}},LuviaFeatureFlagRegistry:{register(){}},LuviaGlobalContracts:{register(){}}};
  context.window=context;context.globalThis=context;vm.createContext(context);
  for(const file of ['core/journey/journey-domain-contract-core.js','core/journey/journey-resilience-core.js','core/platform/journey-contract-adapter.js'])vm.runInContext(read(file),context,{filename:file});
  return context;
}

(async()=>{
  let context=load(),api=context.LuviaJourneyContractV1,entryId=sourceEntry().id;
  const preview=api.reads.previewRemoval(entryId);
  assert.equal(preview.effects.placeLinkPreserved,true);assert.equal(preview.effects.favoritePreserved,true);assert.equal(owner.writes,0);
  await assert.rejects(()=>api.commands.removeEntry(entryId,{operationId:'remove-1',expectedRevision:'rev-1'}),/prüfen und bestätigen/);
  await assert.rejects(()=>api.commands.removeEntry(entryId,{confirmed:true,operationId:'remove-stale',expectedRevision:'rev-0'}),/inzwischen geändert/);
  owner.bookings=[{trip_place_id:'link-1'}];
  await assert.rejects(()=>api.commands.removeEntry(entryId,{confirmed:true,operationId:'remove-booked',expectedRevision:'rev-1'}),/Buchung verwalten/);
  assert.equal(owner.writes,0);owner.bookings=[];
  const removed=await api.commands.removeEntry(entryId,{confirmed:true,operationId:'remove-1',expectedRevision:'rev-1'});
  assert.equal(owner.writes,1);assert.equal(owner.fields.planned_at,null);assert.equal(owner.fields.metadata.notes,'bleibt erhalten');assert.equal(api.reads.getEntry(entryId),null);
  assert.equal(api.reads.removalRecoveries().length,1);assert.equal(removed.expectedRevision,'rev-2');

  // A new adapter instance models a full reload. The recovery comes from the owner record.
  context=load();api=context.LuviaJourneyContractV1;
  const afterReload=api.reads.removalRecovery(removed.recoveryId);assert.equal(afterReload.before.startAt,'2027-06-12T10:00:00.000Z');assert.equal(afterReload.expectedRevision,'rev-2');
  const replayedRemoval=await api.commands.removeEntry(entryId,{confirmed:true,operationId:'remove-1',expectedRevision:'rev-1'});assert.equal(replayedRemoval.recoveryId,removed.recoveryId);assert.equal(owner.writes,1);
  const restorePreview=api.reads.previewRestore(removed.recoveryId);assert.equal(restorePreview.conflicts.length,1);
  owner.bookings=[{trip_place_id:'link-1'}];
  await assert.rejects(()=>api.commands.restoreRemovedEntry(removed.recoveryId,{confirmed:true,operationId:'restore-booked',expectedRevision:'rev-2',expectedConflictSignature:JSON.stringify(restorePreview.conflicts),conflictsAccepted:true}),/Buchung verwalten/);
  assert.equal(owner.writes,1);owner.bookings=[];
  await assert.rejects(()=>api.commands.restoreRemovedEntry(removed.recoveryId,{confirmed:true,operationId:'restore-stale',expectedRevision:'rev-1',expectedConflictSignature:JSON.stringify(restorePreview.conflicts),conflictsAccepted:true}),/inzwischen geändert/);
  await assert.rejects(()=>api.commands.restoreRemovedEntry(removed.recoveryId,{confirmed:true,operationId:'restore-1',expectedRevision:'rev-2',expectedConflictSignature:JSON.stringify(restorePreview.conflicts)}),/ausdrücklich bestätigen/);
  const restored=await api.commands.restoreRemovedEntry(removed.recoveryId,{confirmed:true,operationId:'restore-1',expectedRevision:'rev-2',expectedConflictSignature:JSON.stringify(restorePreview.conflicts),conflictsAccepted:true});
  assert.equal(restored.restoredStartAt,'2027-06-12T10:00:00.000Z');assert.equal(owner.writes,2);assert.equal(owner.fields.planned_at,'2027-06-12T10:00:00.000Z');assert.equal(owner.fields.metadata.notes,'bleibt erhalten');assert.equal(owner.fields.metadata.timelineRemovalRecovery,null);

  context=load();api=context.LuviaJourneyContractV1;
  assert.equal(api.reads.removalRecoveries().length,0);assert.equal(api.reads.getEntry(entryId).startAt,'2027-06-12T10:00:00.000Z');
  const replayedRestore=await api.commands.restoreRemovedEntry(removed.recoveryId,{confirmed:true,operationId:'restore-1',tripId:trip.id,expectedRevision:'rev-2',conflictsAccepted:true});assert.equal(replayedRestore.replayed,true);assert.equal(owner.writes,2);

  // The real Places compatibility provider must project both durable receipts
  // directly from the owner record; the journey adapter may not rely on a UI cache.
  const projectedRecord={trip_id:trip.id,trip_place_id:'link-1',updated_at:'rev-9',fields:{planned_at:null,metadata:{notes:'bleibt erhalten',timelineRemovalRecovery:{recoveryId:'recovery-real',tripId:trip.id,tripPlaceId:'link-1',removedAt:'2027-06-01T09:00:00.000Z',before:{startAt:'2027-06-12T10:00:00.000Z'}}}}};
  const providerContext={console,Date,Intl,Map,Set,Promise,Object,Array,String,Number,Boolean,RegExp,JSON,Error,TypeError,structuredClone,setTimeout(){},CustomEvent:function(name,options){this.type=name;this.detail=options?.detail},dispatchEvent(){},addEventListener(){},LuviaTripPlaceData:{snapshot:()=>({tripId:trip.id,records:[projectedRecord]}),dateEntries:()=>[]},LuviaTripContext:{getActiveTripId:()=>trip.id}};
  providerContext.window=providerContext;providerContext.globalThis=providerContext;vm.createContext(providerContext);vm.runInContext(read('core/places/timeline-core.js'),providerContext,{filename:'core/places/timeline-core.js'});
  const projectedRecovery=providerContext.LuviaTimelineCore.removalRecoveries()[0];assert.equal(projectedRecovery.recoveryId,'recovery-real');assert.equal(projectedRecovery.expectedRevision,'rev-9');assert.equal(projectedRecovery.ownerMetadata.notes,'bleibt erhalten');
  projectedRecord.fields={...projectedRecord.fields,planned_at:'2027-06-12T10:00:00.000Z',metadata:{notes:'bleibt erhalten',timelineRemovalRecovery:null,timelineRemovalLastRestore:{recoveryId:'recovery-real',operationId:'restore-real',restoredAt:'2027-06-01T09:01:00.000Z'}}};
  assert.equal(providerContext.LuviaTimelineCore.removalRecoveries().length,0);assert.equal(providerContext.LuviaTimelineCore.removalRestoreReceipts()[0].operationId,'restore-real');

  const composer=read('app/journey/journey-day-composer.js');
  for(const marker of ['reads.previewRemoval','commands.removeEntry(entry.id,{confirmed:true','data-journey-removal-recoveries','reads.previewRestore','commands.restoreRemovedEntry','Wiederherstellung bleibt auch nach einem Neuladen verfügbar'])assert.ok(composer.includes(marker),`consumer marker missing: ${marker}`);
  console.log('P09 durable remove/restore: preview, confirmation, booking gate, stale revision, reload recovery, conflict gate, owner readback and idempotency PASS');
})().catch(error=>{console.error(error);process.exitCode=1});
