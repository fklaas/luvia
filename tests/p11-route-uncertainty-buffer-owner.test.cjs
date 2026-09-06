'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=file=>fs.readFileSync(file,'utf8');

const resilienceContext={Date,Math,Object,Array,Map,Set,JSON,Number,String,TypeError};resilienceContext.globalThis=resilienceContext;vm.createContext(resilienceContext);vm.runInContext(read('core/journey/journey-resilience-core.js'),resilienceContext);
const resilience=resilienceContext.LuviaJourneyResilienceCoreV1,now='2026-09-06T10:00:00.000Z';
const unverified=resilience.routeUncertainty({now,baseMinutes:20,routeMode:'walking',weatherRisk:1,disruptionRisk:1,evidence:[{source:'Places-Koordinaten',kind:'air-distance'}]});
assert.equal(unverified.liveStatus,'unknown');assert.equal(unverified.dataAgeLabel,'Alter unbekannt');assert.deepEqual(Array.from(unverified.ignoredUnverifiedFactors),['Wetter','Verkehr oder Störung']);
const evidenced=resilience.routeUncertainty({now,baseMinutes:20,routeMode:'cycling',weatherRisk:.5,evidence:[{source:'HERE Routing',kind:'duration',observedAt:'2026-09-06T09:56:00Z',live:true},{source:'DWD',kind:'weather',supports:['weather'],observedAt:'2026-09-06T09:50:00Z',live:true}]});
assert.equal(evidenced.routeModeLabel,'mit dem Fahrrad');assert.equal(evidenced.liveStatus,'live');assert.equal(evidenced.dataAgeLabel,'vor 4 Min. beobachtet');assert.equal(evidenced.ignoredUnverifiedFactors.length,0);assert.ok(evidenced.range.highMinutes>evidenced.range.expectedMinutes);assert.match(evidenced.evidenceSignature,/^fnv1a-/);
for(const [routeMode,label] of [['walking','zu Fuß'],['cycling','mit dem Fahrrad'],['driving','mit dem Auto'],['transit','mit Bus und Bahn']]){
 const projection=resilience.routeUncertainty({now,baseMinutes:20,routeMode,evidence:[{source:'HERE Routing',kind:'duration',observedAt:'2026-09-06T09:56:00Z'}]});assert.equal(projection.routeMode,routeMode);assert.equal(projection.routeModeLabel,label);assert.ok(projection.range.highMinutes>=projection.range.expectedMinutes);
}

const trip={id:'trip-1',startDate:'2027-06-12',endDate:'2027-06-19'};let writes=0;
let entries=[{id:'tpd:route:planned_at',tripId:trip.id,source:'place-data',dataKey:'planned_at',sourceRevision:'rev-1',tripPlaceId:'tp-route',placeId:'place-route',entityType:'attraction',title:'Seebrücke',startAt:'2027-06-12T12:00:00.000Z',durationMinutes:60,transferMinutes:20,routeConfidence:.7,routeEvidence:[{source:'HERE Routing',kind:'duration',observedAt:'2026-09-06T09:56:00Z',live:true}],metadata:{durationMinutes:60,notes:'keep',transferMinutes:20,routeConfidence:.7,routeEvidence:[{source:'HERE Routing',kind:'duration',observedAt:'2026-09-06T09:56:00Z',live:true}]}}];
function load(){
 const context={console,Date,Intl,Map,Set,Promise,CustomEvent:function(){},dispatchEvent(){},LuviaJourneyResilienceCoreV1:resilience,LuviaTripContractV1:{getActiveTrip:()=>trip},LuviaTimelineCore:{snapshot:()=>({entries}),subscribe:()=>()=>{},hydrate:async()=>({entries})},LuviaBookingContractV1:{reads:{listForTrip:async()=>[]}},LuviaPlacesContractV1:{commands:{plan:async options=>{writes+=1;entries[0]={...entries[0],sourceRevision:`rev-${writes+1}`,startAt:options.fields.planned_at,metadata:options.fields.metadata};return{ok:true}}}}};
 context.globalThis=context;vm.createContext(context);for(const file of ['core/journey/journey-domain-contract-core.js','core/platform/journey-contract-adapter.js'])vm.runInContext(read(file),context,{filename:file});return context.LuviaJourneyContractV1;
}
(async()=>{
 let api=load(),before=JSON.stringify(entries),preview=api.reads.previewRouteBuffer(entries[0].id,{now,routeBufferMinutes:14});
 assert.equal(preview.before.routeBufferMinutes,null);assert.equal(preview.after.routeBufferMinutes,14);assert.equal(preview.changed,true);assert.equal(JSON.stringify(entries),before,'preview and cancel path must not write');assert.equal(writes,0);
 await assert.rejects(()=>api.commands.applyRouteBuffer(entries[0].id,{routeBufferMinutes:14}),/bestätigen/);
 await assert.rejects(()=>api.commands.applyRouteBuffer(entries[0].id,{now,routeBufferMinutes:14,confirmed:true,operationId:'stale',expectedRevision:'old',expectedRouteEvidenceSignature:preview.expectedRouteEvidenceSignature}),/inzwischen/);
 await assert.rejects(()=>api.commands.applyRouteBuffer(entries[0].id,{now,routeBufferMinutes:14,confirmed:true,operationId:'changed-route',expectedRevision:'rev-1',expectedRouteEvidenceSignature:'fnv1a-old'}),/Routenbasis/);
 assert.equal(writes,0);
 const command={now,routeBufferMinutes:14,confirmed:true,operationId:'route-buffer-1',expectedRevision:'rev-1',expectedRouteEvidenceSignature:preview.expectedRouteEvidenceSignature};
 await Promise.all([api.commands.applyRouteBuffer(entries[0].id,command),api.commands.applyRouteBuffer(entries[0].id,command)]);assert.equal(writes,1);assert.equal(entries[0].metadata.routeBufferMinutes,14);assert.equal(entries[0].metadata.notes,'keep');assert.equal(entries[0].metadata.routeUncertainty.liveStatus,'live');
 api=load();const replay=await api.commands.applyRouteBuffer(entries[0].id,command);assert.equal(replay.replayed,true);assert.equal(writes,1,'idempotent replay must not write twice');
 const composer=read('app/journey/journey-day-composer.js'),suggestions=read('app/journey/journey-suggestion-sheet.js'),dashboard=read('core/ai/ai-dashboard-service.js');
 assert.match(composer,/data-journey-route-buffer/);assert.match(composer,/previewRouteBuffer/);assert.match(composer,/applyRouteBuffer/);assert.match(composer,/Live-Lage unbekannt/);
 assert.match(suggestions,/routeMode:'walking'/);assert.match(suggestions,/liveStatusLabel/);assert.match(dashboard,/route\.dataAgeLabel/);assert.match(dashboard,/route\.liveStatusLabel/);
 console.log('P11 route evidence, freshness, unknown live state, preview, stale guard and idempotent buffer owner write: PASS');
})().catch(error=>{console.error(error);process.exitCode=1});
