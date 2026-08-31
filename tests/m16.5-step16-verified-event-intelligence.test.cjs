'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const read=file=>fs.readFileSync(file,'utf8');
const context={console,Object,Array,Map,Set,WeakSet,Error,TypeError,String,Boolean,Number,Math,JSON,Date,RegExp,Promise,Intl};
context.globalThis=context;
vm.createContext(context);
vm.runInContext(read('core/intelligence/verified-event-intelligence-core.js'),context,{filename:'core/intelligence/verified-event-intelligence-core.js'});
const core=context.LuviaVerifiedEventIntelligenceCoreV1;

const base={
  eventClaimId:'event-1',sourceNativeId:'official-1',sourceClass:'official',sourceUrl:'https://events.example.test/event-1',retrievalReceiptId:'retrieval-1',title:'Verifiziertes Konzert',description:'Belegte Fixture-Beobachtung',category:'music',startAt:'2026-09-01T18:00:00+02:00',endAt:'2026-09-01T20:00:00+02:00',timeZone:'Europe/Berlin',status:'scheduled',venue:{placeId:'venue-1',name:'Kurpark',observationId:'venue-observation-1',coordinates:{latitude:54.02,longitude:10.75,provenance:{owner:'places',ownerEntityId:'venue-1'}}},observedAt:'2026-08-31T10:00:00Z',freshUntil:'2026-09-02T00:00:00Z',verificationStatus:'verified',outdoorEvidence:{verified:true,evidenceId:'venue-outdoor-1'}
};
const now='2026-08-31T12:00:00Z';

;(async()=>{
const verified=core.verifyClaim(base,{now});
assert.equal(verified.productVisibility,'visible');
assert.equal(verified.mapVisibility,'visible');
assert.equal(verified.synthetic,false);
assert.equal(verified.venue.coordinates.provenance.owner,'places');

for(const [field,patch,reason] of [
  ['source', {sourceUrl:''},'source-reference-missing'],
  ['retrieval', {retrievalReceiptId:''},'retrieval-receipt-missing'],
  ['title', {title:''},'source-title-missing'],
  ['timezone', {timeZone:'invalid'},'time-zone-invalid'],
  ['venue', {venue:{}},'venue-unresolved'],
  ['freshness', {freshUntil:'2026-08-30T00:00:00Z'},'freshness-expired']
]){
  const claim=core.verifyClaim({...base,...patch},{now});
  assert.notEqual(claim.productVisibility,'visible',`${field} failure must hide the event`);
  assert.equal(claim.failures.includes(reason),true,`${field} failure reason missing`);
}

const noCoordinateProvenance=core.verifyClaim({...base,eventClaimId:'event-no-pin',venue:{...base.venue,coordinates:{latitude:54.02,longitude:10.75}}},{now});
assert.equal(noCoordinateProvenance.productVisibility,'visible','verified event may remain in the timeline');
assert.equal(noCoordinateProvenance.mapVisibility,'hidden','unproven coordinates must never create a map pin');

const collection=core.verifyClaims([base,{...base,eventClaimId:'stale',sourceNativeId:'stale-source',freshUntil:'2026-08-30T00:00:00Z'}],{now});
assert.equal(collection.visible.length,1);
assert.equal(collection.hidden.length,1);
assert.equal(collection.syntheticEventCount,0);

const graph=core.buildGraph({claims:[verified,noCoordinateProvenance],windows:[{id:'free-evening',startAt:'2026-09-01T16:00:00Z',endAt:'2026-09-01T21:00:00Z',evidenceId:'journey-window-1'}],routeEdges:[{verified:true,evidenceId:'route-1',fromId:'hotel',toEventClaimId:'event-1',minutes:18,freshUntil:'2026-09-01T17:00:00Z'}],tripId:'trip-1',generatedAt:now});
assert.equal(graph.syntheticNodeCount,0);
assert.equal(graph.nodes.length,2);
assert.equal(graph.edges.some(edge=>edge.kind==='fitsWindow'),true);
assert.equal(graph.edges.some(edge=>edge.kind==='reachableWithin'),true);
const brushed=core.brushGraph(graph,{from:'2026-09-01T17:00:00Z',to:'2026-09-01T21:00:00Z'});
assert.equal(brushed.listCount,2);
assert.equal(brushed.pinCount,1);

assert.equal(core.detectDrift(verified,null).state,'unknown','source outage is not a cancellation');
const cancelled=core.verifyClaim({...base,status:'cancelled',observedAt:'2026-08-31T11:00:00Z',retrievalReceiptId:'retrieval-2'},{now});
const drift=core.detectDrift(verified,cancelled,{now});
assert.equal(drift.cancellationVerified,true);
assert.equal(drift.scheduleDrift,true);

assert.equal(core.culturalContext({event:verified,documents:[]}).reason,'citation-unavailable');
const cultural=core.culturalContext({event:verified,documents:[{authorized:true,sourceRef:'https://culture.example.test/context',version:'2026-08-31',retrievedAt:now,summary:'Kurzer, zitierter Kulturkontext.'}]});
assert.equal(cultural.available,true);
assert.equal(cultural.claims[0].citation.version,'2026-08-31');

const serendipity=core.serendipityWindow({events:[verified],openWindow:{startAt:'2026-09-01T15:30:00Z',endAt:'2026-09-01T20:30:00Z'},routeUncertainty:[{eventClaimId:'event-1',recommendedMinutes:20,evidenceId:'route-1'}]});
assert.equal(serendipity.status,'ready');
assert.equal(serendipity.keepFree,true);

assert.equal(core.eventToMemory({event:verified,attendanceEvidence:{confirmedByUser:false},mediaIds:['media-1']}).available,false);
const memory=core.eventToMemory({event:verified,attendanceEvidence:{confirmedByUser:true,evidenceId:'attendance-1'},mediaIds:['media-1']});
assert.equal(memory.available,true);
assert.equal(memory.ownerCommandProposal.actionId,'memory.story.save');
assert.equal(memory.ownerCommandProposal.requiresConfirmation,true);

assert.equal(core.groupTasteDivergence({membership:{authorized:false}}).reason,'owner-foundation-only');
const group=core.groupTasteDivergence({membership:{authorized:true},members:[{id:'m1',preferencesExplicit:true,preferenceTags:['music']},{id:'m2',preferencesExplicit:false}],choices:[{id:'event-1',title:'Konzert',tags:['music']}]});
assert.equal(group.available,true);
assert.equal(group.individualPreferencesDisclosed,false);

assert.equal(core.weatherSafeSubstitution({weather:{verified:false},originalEvent:verified,alternatives:[],now}).reason,'weather-evidence-unknown');
const indoor=core.verifyClaim({...base,eventClaimId:'event-indoor',sourceNativeId:'official-indoor',retrievalReceiptId:'retrieval-indoor',title:'Indoor-Alternative',venue:{...base.venue,placeId:'venue-2'},indoorEvidence:{verified:true,evidenceId:'indoor-1'},switchingCosts:{minutes:12,priceDelta:4,currency:'EUR'}},{now});
const weather=core.weatherSafeSubstitution({weather:{verified:true,evidenceId:'weather-1',risk:.8,freshUntil:'2026-09-01T18:00:00Z'},originalEvent:verified,alternatives:[indoor],now});
assert.equal(weather.status,'attention');
assert.equal(weather.proposals.length,1);
assert.equal(weather.separateReceipts,true);

const schedule=core.reconcileSchedule({claims:[cancelled],entries:[{id:'journey-1',eventClaimId:'event-1',startAt:base.startAt,endAt:base.endAt}],bookings:[]});
assert.equal(schedule.status,'attention');
assert.equal(schedule.journeyCommandProposal.requiresConfirmation,true);
const unknownSchedule=core.reconcileSchedule({claims:[verified],entries:[],bookings:[{outcomeUnknown:true}]});
assert.equal(unknownSchedule.status,'blocked');
assert.equal(unknownSchedule.reason,'provider-outcome-unknown');

const source=read('core/intelligence/verified-event-intelligence-core.js');
for(const forbidden of [/\bdocument\b/,/\blocalStorage\b/,/\bsessionStorage\b/,/\bfetch\s*\(/,/supabase/i])assert.doesNotMatch(source,forbidden,'browserless core contains a forbidden dependency');

const flags=[];context.LuviaFeatureFlagRegistry={register:definition=>flags.push(definition)};context.LuviaGlobalContracts={register(){}};
vm.runInContext(read('core/platform/verified-event-intelligence-contract-adapter.js'),context,{filename:'core/platform/verified-event-intelligence-contract-adapter.js'});
const adapter=context.LuviaVerifiedEventIntelligenceContractV1;
assert.deepEqual(Object.keys(adapter.commands),[]);
assert.equal((await adapter.reads.listVerified({now})).status,'provider-unavailable');
context.LuviaVerifiedEventSourceGatewayV1={contractId:'fixture.events.v1',reads:{async listObservations(){return[base]}}};
assert.equal((await adapter.reads.listVerified({now})).visible.length,1);
assert.equal(flags.length,4);

const actionContext={Object,Array,String,Number,Boolean,Date,Math,RegExp,JSON,Set,Map,WeakSet,Error,TypeError};
vm.createContext(actionContext);vm.runInContext(read('core/intelligence/intelligence-action-contract-core.js'),actionContext);
const eventAction=actionContext.LuviaIntelligenceActionContractCoreV1.getAction('events.verified.read');
assert.equal(eventAction.ownerContract,'intelligence.verified-events.v1');
assert.equal(eventAction.effect,'READ');
assert.equal(eventAction.autoRun,true);

const dashboard=read('core/ai/ai-dashboard-service.js'),runtime=read('core/ai/ai-action-runtime.js'),css=read('core/experience/experience-foundation.css');
assert.match(dashboard,/data-ai-event-brush/);
assert.match(dashboard,/LuviaPlacesSpatialExperience/);
assert.match(runtime,/keine erfundenen Events/i);
assert.match(css,/\.lvx-event-timeline/);
assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);

console.log('M16.5 Step16 S16.09-S16.12 Verified Event Intelligence: PASS');
})().catch(error=>{console.error(error);process.exit(1)});
