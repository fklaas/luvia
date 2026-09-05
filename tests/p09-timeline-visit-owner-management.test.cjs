'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync('core/places/presence-visit-core.js','utf8');
const rows=[{
  id:'visit-1',trip_id:'trip-1',place_id:'place-1',participant_id:'traveler-1',
  state:'visited',arrived_at:'2027-06-12T10:00:00.000Z',left_at:null,
  duration_seconds:1800,gps_accuracy_meters:12,minimum_distance_meters:8,
  detection_source:'gps-confirmed',is_automatic:false,is_confirmed:true,
  correction:{confirmationRequired:false},created_at:'2027-06-12T10:30:00.000Z',updated_at:'2027-06-12T10:30:00.000Z'
}];

function database(){
  return{from(table){assert.equal(table,'place_visits');const filters=[];let updatePayload=null;return{
    select(){if(updatePayload){const matches=rows.filter(row=>filters.every(([key,value])=>String(row[key])===String(value)));for(const row of matches)Object.assign(row,structuredClone(updatePayload));return Promise.resolve({data:matches.map(row=>structuredClone(row)),error:null})}return this},
    eq(key,value){filters.push([key,value]);return this},order(){return this},limit(){return Promise.resolve({data:rows.filter(row=>filters.every(([key,value])=>String(row[key])===String(value))).map(row=>structuredClone(row)),error:null})},
    update(payload){updatePayload=payload;return this},
    async upsert(row){const index=rows.findIndex(item=>item.id===row.id);if(index>=0)rows[index]={...rows[index],...structuredClone(row)};else rows.push(structuredClone(row));return{data:[row],error:null}}
  }} };
}
function runtime(){const events=[];const context={console,Date,Map,Set,JSON,Object,Array,String,Number,Boolean,Math,Promise,structuredClone,setTimeout,clearTimeout,crypto:{randomUUID:()=>`op-${Date.now()}`},CustomEvent:function(type,options){this.type=type;this.detail=options?.detail},dispatchEvent:event=>events.push(event),addEventListener(){},LuviaTripContractV1:{getActiveTrip:()=>({id:'trip-1'})},LuviaSupabaseService:{getClient:database},LuviaPlatformPorts:{get:id=>id==='NetworkPort'?{isOnline:()=>true}:id==='PermissionPort'?{query:async()=> 'granted'}:null},LuviaProfileService:{snapshot:()=>({profile:{locationSharing:false}})},LuviaKernelEvents:{emit:async()=>{}},LuviaPlaceCore:{getPlaces:()=>[],getPlace:()=>null,updateLifecycle(){}},LuviaJourneyContractV1:{commands:{recordEvent:async()=>{}}}};context.window=context;context.globalThis=context;vm.createContext(context);vm.runInContext(source,context,{filename:'presence-visit-core.js'});return{api:context.LuviaPresenceVisitCore,events}}

(async()=>{
  let owner=runtime(),api=owner.api;await api.hydrateVisits();
  let visit=api.getVisit('visit-1');assert.equal(visit.revision,'2027-06-12T10:30:00.000Z');
  await assert.rejects(()=>api.updateVisit('visit-1',{confirmed:false,operationId:'edit-1',expectedRevision:visit.revision,arrivedAt:'2027-06-12T11:00:00.000Z',durationSeconds:2700}),/ausdrücklich bestätigen/);
  visit=await api.updateVisit('visit-1',{confirmed:true,operationId:'edit-1',expectedRevision:visit.revision,arrivedAt:'2027-06-12T11:00:00.000Z',durationSeconds:2700,leftAt:null});
  assert.equal(visit.arrivedAt,'2027-06-12T11:00:00.000Z');assert.equal(visit.durationSeconds,2700);assert.equal(visit.correction.visitManagementHistory.length,1);
  await assert.rejects(()=>api.updateVisit('visit-1',{confirmed:true,operationId:'stale-edit',expectedRevision:'2027-06-12T10:30:00.000Z',arrivedAt:'2027-06-12T12:00:00.000Z',durationSeconds:1800}),/inzwischen geändert/);

  const removed=await api.removeVisit('visit-1',{confirmed:true,operationId:'remove-1',expectedRevision:visit.revision,title:'Strandbesuch'});
  assert.equal(removed.operation,'remove-confirmed-visit');assert.equal(api.getVisit('visit-1').state,'removed');assert.equal(api.getVisit('visit-1').isConfirmed,false);
  assert.equal((await api.removeVisit('visit-1',{confirmed:true,operationId:'remove-1'})).recoveryId,removed.recoveryId,'same operation must replay its durable receipt');

  owner=runtime();api=owner.api;await api.init();const recovery=api.visitRecovery(removed.recoveryId);assert.ok(recovery,'removal recovery must survive reload');
  const restored=await api.restoreVisit(recovery.recoveryId,{confirmed:true,operationId:'restore-1',expectedRevision:recovery.expectedRevision});
  assert.equal(restored.operation,'restore-confirmed-visit');assert.equal(api.getVisit('visit-1').state,'visited');assert.equal(api.getVisit('visit-1').isConfirmed,true);assert.equal(api.getVisit('visit-1').arrivedAt,'2027-06-12T11:00:00.000Z');
  assert.equal((await api.restoreVisit(recovery.recoveryId,{confirmed:true,operationId:'restore-1'})).operationId,'restore-1','same restore operation must remain idempotent after recovery is cleared');
  assert.ok(owner.events.some(event=>event.type==='luvia:place-visit-changed'&&event.detail.management==='restored'));

  const migration=fs.readFileSync('supabase/migrations/20260905200000_place_visit_owner_management.sql','utf8');
  for(const state of ['pending_confirmation','discarded_unconfirmed','rejected','removed'])assert.match(migration,new RegExp(`'${state}'`));
  const timeline=fs.readFileSync('core/places/timeline-core.js','utf8');assert.doesNotMatch(timeline,/allowedEvents=new Set\(\[[^\]]*'place_visited'/,'canonical place_visits rows must not be duplicated by legacy events');assert.match(timeline,/sourceRevision:String\(r\.updated_at/);
  const adapter=fs.readFileSync('core/platform/places-contract-adapter.js','utf8');for(const method of ['getVisit','visitRecoveries','visitRecovery','updateVisit','removeVisit','restoreVisit'])assert.match(adapter,new RegExp(`\\b${method}\\b`));
  console.log('P09 Places-owner confirmed visit update/remove/reload/restore: PASS');
})().catch(error=>{console.error(error);process.exitCode=1});
