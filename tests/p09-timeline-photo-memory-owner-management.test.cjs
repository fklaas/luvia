'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const read=file=>fs.readFileSync(file,'utf8');

const trip={id:'trip-photo',title:'Scharbeutz',startDate:'2027-06-12',endDate:'2027-06-13'};
const owner={
  revision:1,
  writes:0,
  occurredAt:'2027-06-12T10:00:00.000Z',
  metadata:{durationMinutes:30,mediaIds:['media-1','media-2'],clusterId:'cluster-1',caption:'bleibt erhalten'}
};
const revision=()=>`event-rev-${owner.revision}`;
function sourceEntry(){
  if(owner.metadata.timelineRemovalRecovery)return null;
  return{id:'event:photo-1',rowId:'photo-1',sourceKey:'photo-1',sourceRevision:revision(),source:'event',tripId:trip.id,entityType:'photo_memory',kind:'photo_memory',title:'Morgenlicht am Strand',description:'Unser Moment',startAt:owner.occurredAt,durationMinutes:Number(owner.metadata.durationMinutes)||30,automatic:false,metadata:structuredClone(owner.metadata)};
}
function recoveries(){
  const receipt=owner.metadata.timelineRemovalRecovery;
  return receipt?[{...structuredClone(receipt),source:'event',rowId:'photo-1',expectedRevision:revision(),ownerMetadata:structuredClone(owner.metadata)}]:[];
}
function restoreReceipts(){
  const receipt=owner.metadata.timelineRemovalLastRestore;
  return receipt?[{...structuredClone(receipt),source:'event',rowId:'photo-1',expectedRevision:revision()}]:[];
}
function provider(){
  return{
    snapshot:()=>({tripId:trip.id,hydrated:true,loading:false,entries:[sourceEntry()].filter(Boolean)}),
    subscribe:()=>()=>{},hydrate:async()=>({entries:[sourceEntry()].filter(Boolean)}),
    removalRecoveries:recoveries,removalRestoreReceipts:restoreReceipts,
    updateJourneyEvent:async(_identity,input)=>{
      assert.equal(input.tripId,trip.id);
      assert.equal(input.expectedRevision,revision());
      owner.writes+=1;
      if(input.occurredAt!==undefined)owner.occurredAt=input.occurredAt;
      owner.metadata={...owner.metadata,...structuredClone(input.metadata||{})};
      owner.revision+=1;
      return sourceEntry();
    },
    diagnostics:()=>({cloudAuthoritative:true,realtime:true,metrics:{}})
  };
}
function load(){
  const context={console,Date,Intl,Map,Set,Promise,Object,Array,String,Number,Boolean,RegExp,JSON,Error,TypeError,structuredClone,CustomEvent:function(name,options){this.type=name;this.detail=options?.detail},dispatchEvent(){},LuviaTimelineCore:provider(),LuviaTripContractV1:{getActiveTrip:()=>trip},LuviaBookingContractV1:{reads:{listForTrip:async()=>{throw new Error('photo memories must not query Booking')}}},LuviaPlacesContractV1:{commands:{plan:async()=>{throw new Error('photo memories must not write through Places')}}},LuviaFeatureFlagRegistry:{register(){}},LuviaGlobalContracts:{register(){}}};
  context.window=context;context.globalThis=context;vm.createContext(context);
  for(const file of ['core/journey/journey-domain-contract-core.js','core/journey/journey-resilience-core.js','core/platform/journey-contract-adapter.js'])vm.runInContext(read(file),context,{filename:file});
  return context;
}

(async()=>{
  let context=load(),api=context.LuviaJourneyContractV1,entryId='event:photo-1';
  let entry=api.reads.getEntry(entryId),capability=api.reads.entryCapabilities(entry);
  assert.equal(entry.provenance.owner,'journey');
  assert.deepEqual([...entry.metadata.mediaIds],['media-1','media-2']);
  assert.equal(capability.mode,'memory');
  assert.equal(capability.actions.editSchedule.state,'available');
  assert.equal(capability.actions.remove.state,'available');
  const schedulePreview=api.reads.previewSchedule(entryId,{startAt:'2027-06-12T11:15:00.000Z',durationMinutes:45});
  assert.equal(schedulePreview.changed,true);assert.equal(schedulePreview.conflicts.length,0);
  await api.commands.editEntry(entryId,{confirmed:true,operationId:'photo-time-1',expectedRevision:'event-rev-1',startAt:'2027-06-12T11:15:00.000Z',durationMinutes:45,expectedConflictSignature:'[]'});
  assert.equal(owner.writes,1);assert.equal(owner.occurredAt,'2027-06-12T11:15:00.000Z');assert.deepEqual(owner.metadata.mediaIds,['media-1','media-2']);assert.equal(owner.metadata.caption,'bleibt erhalten');

  entry=api.reads.getEntry(entryId);
  const removalPreview=api.reads.previewRemoval(entryId);
  assert.equal(removalPreview.operation,'remove-photo-memory-moment');assert.equal(removalPreview.effects.mediaAssetsPreserved,true);
  const removed=await api.commands.removeEntry(entryId,{confirmed:true,operationId:'photo-remove-1',expectedRevision:'event-rev-2'});
  assert.equal(owner.writes,2);assert.equal(api.reads.getEntry(entryId),null);assert.equal(removed.source,'event');assert.equal(removed.mediaIds.length,2);assert.equal(owner.metadata.caption,'bleibt erhalten');

  context=load();api=context.LuviaJourneyContractV1;
  const durable=api.reads.removalRecovery(removed.recoveryId);assert.equal(durable.expectedRevision,'event-rev-3');assert.deepEqual([...durable.mediaIds],['media-1','media-2']);
  const restorePreview=api.reads.previewRestore(removed.recoveryId);assert.equal(restorePreview.conflicts.length,0);
  const restored=await api.commands.restoreRemovedEntry(removed.recoveryId,{confirmed:true,operationId:'photo-restore-1',expectedRevision:'event-rev-3',expectedConflictSignature:'[]'});
  assert.equal(restored.mediaIdsPreserved,true);assert.equal(owner.writes,3);assert.equal(api.reads.getEntry(entryId).startAt,'2027-06-12T11:15:00.000Z');assert.deepEqual([...api.reads.getEntry(entryId).metadata.mediaIds],['media-1','media-2']);
  assert.match(read('core/platform/journey-contract-adapter.js'),/restore-photo-memory-moment/);
  console.log('P09 Journey-owned photo-memory schedule, durable remove/restore and Media-ID preservation: PASS');
})().catch(error=>{console.error(error);process.exitCode=1});
