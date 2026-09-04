'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=p=>fs.readFileSync(p,'utf8');
const trip={id:'trip-1',startDate:'2027-06-12',endDate:'2027-06-19'};
let entries=[{id:'tpd:1:planned_at',tripId:trip.id,source:'place-data',dataKey:'planned_at',sourceRevision:'rev-1',tripPlaceId:'place-1',placeId:'p-1',entityType:'restaurant',title:'Cafe',startAt:'2027-06-12T10:00:00.000Z',durationMinutes:90,metadata:{durationMinutes:90,notes:'preserve'}}],writes=0,bookings=[];
function load(){
 const c={console,Date,Intl,Map,Set,Promise,CustomEvent:function(){},dispatchEvent(){},LuviaTripContractV1:{getActiveTrip:()=>trip},LuviaTimelineCore:{snapshot:()=>({entries}),subscribe:()=>()=>{},hydrate:async()=>({entries})},LuviaBookingContractV1:{reads:{listForTrip:async()=>bookings}},LuviaPlacesContractV1:{commands:{plan:async options=>{
  assert.equal(options.expectedUpdatedAt,entries[0].sourceRevision);writes++;entries[0]={...entries[0],sourceRevision:'rev-'+(writes+1),startAt:options.fields.planned_at,durationMinutes:options.fields.metadata.durationMinutes??60,metadata:options.fields.metadata};
 }}}};c.globalThis=c;vm.createContext(c);for(const p of ['core/journey/journey-domain-contract-core.js','core/platform/journey-contract-adapter.js'])vm.runInContext(read(p),c);return c;
}
(async()=>{
 let c=load(),api=c.LuviaJourneyContractV1,core=c.LuviaJourneyDomainContractCoreV1;
 const id=entries[0].id,options={startAt:'2027-06-13T12:00:00.000Z',durationMinutes:120},before=JSON.stringify(entries);
 const preview=api.reads.previewSchedule(id,options);assert.equal(preview.changed,true);assert.equal(writes,0);assert.equal(JSON.stringify(entries),before);
 assert.throws(()=>api.reads.previewSchedule(id,{...options,startAt:'2027-06-21T12:00:00Z'}),/innerhalb/);
 assert.throws(()=>api.reads.previewSchedule(id,{...options,durationMinutes:-30}),/Dauer/);
 await assert.rejects(()=>api.commands.editEntry(id,options),/bestätigen/);
 await assert.rejects(()=>api.commands.editEntry(id,{...options,confirmed:true,operationId:'old',expectedRevision:'old'}),/inzwischen/);
 assert.equal(writes,0);
 const commit={...options,confirmed:true,operationId:'move-1',expectedRevision:'rev-1'};
 await Promise.all([api.commands.editEntry(id,commit),api.commands.editEntry(id,commit)]);assert.equal(writes,1);
 assert.equal(entries[0].metadata.notes,'preserve');assert.equal(entries[0].durationMinutes,120);
 // New adapter instance models a reload; recovery comes from the owner record.
 c=load();api=c.LuviaJourneyContractV1;
 const recovery=api.reads.scheduleRecovery(id);assert.equal(recovery.before.durationMinutes,90);
 await api.commands.editEntry(id,commit);assert.equal(writes,1,'replayed operation does not write');
 await api.commands.undo({operation:'restore-schedule',entryId:id,confirmed:true,operationId:'undo-1',expectedRevision:entries[0].sourceRevision});
 assert.equal(entries[0].startAt,'2027-06-12T10:00:00.000Z');assert.equal(entries[0].durationMinutes,90);assert.equal(api.reads.scheduleRecovery(id),null);
 assert.equal(entries[0].metadata.notes,'preserve');
 bookings=[{trip_place_id:'place-1'}];await assert.rejects(()=>api.commands.editEntry(id,{...commit,operationId:'booked',expectedRevision:entries[0].sourceRevision}),/Buchung verwalten/);bookings=[];
 const nested=core.compose({trip,entries:[{id:'long',tripId:trip.id,startAt:'2027-06-12T10:00:00Z',durationMinutes:240},{id:'inside1',tripId:trip.id,startAt:'2027-06-12T11:00:00Z',durationMinutes:30},{id:'inside2',tripId:trip.id,startAt:'2027-06-12T12:00:00Z',durationMinutes:30}]});
 assert.equal(nested.conflicts.filter(x=>x.kind==='overlap').length,2,'long visit must conflict with both nested visits');
 entries.push({id:'other',tripId:trip.id,source:'schedule',title:'Museum',startAt:options.startAt,durationMinutes:90});
 await assert.rejects(()=>api.commands.editEntry(id,{...commit,operationId:'conflict',expectedRevision:entries[0].sourceRevision}),/Zeitkonflikte/);
 assert.equal(writes,2);
 entries.pop();
 const ownerContext={console,CustomEvent:function(){},queueMicrotask,window:null,addEventListener(){}};ownerContext.window=ownerContext;ownerContext.dispatchEvent=()=>{};
 const row={trip_id:'11111111-1111-4111-8111-111111111111',trip_place_id:'22222222-2222-4222-8222-222222222222',updated_at:'revision',fields:{planned_at:'before',notes:'keep'}};
 let queries=[],affected=true,fail=false,updatePayload;
 ownerContext.LuviaSupabaseService={getClient:()=>({rpc(){throw Error('unguarded RPC called')},from(){let updating=false;const query={select(){return query},update(payload){updating=true;updatePayload=payload;return query},eq(key,value){queries.push([key,value]);return query},then(resolve){return Promise.resolve(updating?{data:affected?[{trip_place_id:row.trip_place_id}]:[],error:fail?Error('offline'):null}:{data:[row]}).then(resolve)}};return query}})};
 vm.createContext(ownerContext);vm.runInContext(read('core/places/trip-place-data-service.js'),ownerContext);const writer=ownerContext.LuviaTripPlaceData;
 await writer.hydrate(row.trip_id);const args={tripId:row.trip_id,tripPlaceId:row.trip_place_id,placeType:'restaurant',expectedUpdatedAt:'revision',fields:{planned_at:'after'}};
 affected=false;await assert.rejects(()=>writer.upsert(args),/inzwischen/);assert.equal(writer.snapshot().records[0].fields.planned_at,'before');
 affected=true;fail=true;await assert.rejects(()=>writer.upsert(args),/offline/);assert.equal(writer.snapshot().records[0].fields.planned_at,'before');
 fail=false;await writer.upsert(args);assert.ok(queries.some(([key,value])=>key==='updated_at'&&value==='revision'));assert.equal(updatePayload.fields.notes,'keep');
 const composer=read('app/journey/journey-day-composer.js');
 assert.ok(composer.includes("surface.addEventListener('touchmove'"));assert.ok(composer.includes('if(delta>10)cleanup()'));assert.ok(composer.includes("surface.addEventListener('touchcancel',()=>end(true))"));
 assert.ok(composer.includes('api.commands.editEntry(entry.id,command)'));assert.ok(composer.includes('api.commands.undo({...command'));
 console.log('P09 schedule preview, nested conflicts, confirmation, stale version, idempotency, booked-entry gate, durable recovery and conditional owner writes: PASS');
})().catch(error=>{console.error(error);process.exitCode=1});
