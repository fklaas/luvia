'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const read=file=>fs.readFileSync(file,'utf8');
const context={
  console,Object,Array,Map,Set,WeakSet,Error,TypeError,String,Boolean,Number,Math,JSON,Date,RegExp,Promise,
  CustomEvent:function(name,options){this.type=name;this.detail=options?.detail},
  dispatchEvent(){},
  LuviaFeatureFlagRegistry:{isEnabled(id){return id!=='intelligence.s16-07-offline-crdt-plan'}},
  LuviaTripContractV1:{getActiveTrip(){return{id:'trip-1',title:'Ostseeurlaub',destination:{name:'Scharbeutz'}}}},
  LuviaIdentityContractV1:{getPreferences(){return{travelPace:'balanced'}},commands:{async updatePreferences(){return{ok:true}}}},
  LuviaBookingContractV1:{reads:{async listForTrip(){return[]}},commands:{}},
  LuviaMemoryContractV1:{reads:{async listStories(){return[]}},commands:{stories:{}}}
};
context.globalThis=context;
vm.createContext(context);
for(const file of [
  'core/intelligence/travel-orchestration-core.js',
  'core/journey/journey-resilience-core.js',
  'core/intelligence/intelligence-action-contract-core.js',
  'core/intelligence/intelligence-action-ledger-core.js'
])vm.runInContext(read(file),context,{filename:file});

const orchestration=context.LuviaTravelOrchestrationCoreV1;
const resilience=context.LuviaJourneyResilienceCoreV1;
context.LuviaIntelligenceContractV1={reads:{planningTrace:input=>orchestration.planningTrace(input),gateContext:input=>orchestration.gateContext(input),causalFeedback:input=>orchestration.causalFeedback(input)}};
context.LuviaJourneyContractV1={
  reads:{
    snapshot(){return{days:[{date:'2027-06-13',label:'Sonntag',entries:[
      {id:'breakfast',title:'Frühstück',startAt:'2027-06-13T09:00:00Z',endAt:'2027-06-13T10:00:00Z',provenance:{owner:'booking'}},
      {id:'museum',title:'Museum',startAt:'2027-06-13T10:12:00Z',endAt:'2027-06-13T12:00:00Z',transferMinutes:24,routeConfidence:.55,routeEvidence:[]}
    ],conflicts:[]}],disruptions:[{verified:true,entryIds:['museum'],reason:'Venue meldet einen späteren Einlass',observedAt:'2027-06-13T08:55:00Z'}],summary:{entryCount:2}}},
    routeUncertainty:input=>resilience.routeUncertainty(input),
    rehearseDay:input=>resilience.rehearseDay(input),
    disruptionRecovery:input=>resilience.disruptionRecovery(input),
    destinationTwin:input=>resilience.destinationTwin(input)
  },
  commands:{openPlanningEditor(){return{opened:true}}}
};
context.LuviaPlacesContractV1={
  reads:{
    async recommend(){const error=new Error('Der Places-Provider hat sein Tageskontingent erreicht.');error.code='PLACES_PROVIDER_QUOTA_EXCEEDED';throw error},
    async getCard(){return null}
  },
  commands:{}
};

vm.runInContext(read('core/ai/ai-action-runtime.js'),context,{filename:'core/ai/ai-action-runtime.js'});

(async()=>{
  const runtime=context.LuviaAIActionRuntime;
  const tripGraph=orchestration.compileIntent('Zeige meine Reisen.');
  assert.deepEqual(Array.from(tripGraph.ownerRoutes),['trip.v1']);

  const placesGraph=orchestration.compileIntent('Finde ein Restaurant für unseren freien Abend.');
  const failed=await runtime.runMessage('Finde ein Restaurant für unseren freien Abend.',{surface:'global-chat',compiledIntent:placesGraph});
  assert.equal(failed.error,true);
  assert.equal(failed.results[0].kind,'error');
  assert.equal(failed.results[0].owner,'places');
  assert.equal(failed.results[0].meta.readRecovery.kind,'owner-read');
  assert.equal(failed.results[0].meta.readRecovery.noMutation,true);
  assert.equal(failed.results[0].meta.retryable,false,'owner-read retry must not reuse mutation retry semantics');
  const failedTrace=failed.results.find(result=>result.meta.traceOnly);
  assert.ok(failedTrace,'S16.01 trace result missing after a failed owner read');
  assert.equal(failedTrace.evidence.planningTrace.automaticMutation,false);
  assert.equal(failedTrace.evidence.planningTrace.missingEvidence.includes('owner:places.discovery.recommend'),true);

  const gpsGraph=orchestration.compileIntent('Nutze meinen GPS-Standort für Orte in meiner Nähe.');
  const deniedContext=await runtime.runMessage('Nutze meinen GPS-Standort für Orte in meiner Nähe.',{surface:'global-chat',compiledIntent:gpsGraph});
  const deniedGate=deniedContext.results.find(result=>result.meta.uspKind==='context-gate');
  assert.ok(deniedGate,'S16.02 deny-by-default projection missing');
  assert.equal(deniedGate.evidence.contextGate.allowed,false);
  assert.equal(deniedGate.evidence.contextGate.reason,'no-explicit-grant');
  assert.equal(deniedGate.evidence.contextGate.coordinatesIncluded,false);
  const allowedContext=await runtime.runMessage('Nutze meinen GPS-Standort für Orte in meiner Nähe.',{surface:'global-chat',compiledIntent:gpsGraph,contextGrant:{granted:true,precision:'coarse',expiresAt:'2027-06-13T11:00:00Z'},positionContext:{coordinates:{latitude:54.12345,longitude:10.76543},observedAt:'2027-06-13T10:00:00Z'},now:'2027-06-13T10:01:00Z'});
  const allowedGate=allowedContext.results.find(result=>result.meta.uspKind==='context-gate');
  assert.equal(allowedGate.evidence.contextGate.allowed,true);
  assert.equal(allowedGate.evidence.contextGate.precision,'coarse');
  assert.equal(JSON.stringify(allowedGate).includes('54.12'),false,'context receipt/result must never expose coordinates');

  const feedbackGraph=orchestration.compileIntent('Das hat mir sehr gut gefallen.');
  assert.equal(feedbackGraph.ownerRoutes.includes('intelligence.v1'),true);
  const rejectedFeedback=await runtime.runMessage('Das hat mir sehr gut gefallen.',{surface:'global-chat',compiledIntent:feedbackGraph});
  assert.equal(rejectedFeedback.results[0].evidence.causalFeedback.accepted,false);
  assert.equal(rejectedFeedback.results[0].evidence.causalFeedback.reason,'outcome-not-confirmed');
  const acceptedFeedback=await runtime.runMessage('Das hat mir sehr gut gefallen.',{surface:'global-chat',compiledIntent:feedbackGraph,feedbackContext:{confirmedOutcome:true,evidenceId:'ledger-place-1',value:'food'}});
  assert.equal(acceptedFeedback.results[0].evidence.causalFeedback.accepted,true);
  assert.equal(acceptedFeedback.results[0].evidence.causalFeedback.automaticProfileMutation,false);
  assert.equal(acceptedFeedback.results[1].kind,'confirmation');
  assert.equal(acceptedFeedback.results[1].evidence.actionId,'identity.preferences.update');

  const dayGraph=orchestration.compileIntent('Zeige den Tagesplan.');
  const day=await runtime.runMessage('Zeige den Tagesplan.',{surface:'global-chat',compiledIntent:dayGraph});
  const dayResult=day.results.find(result=>result.kind==='day_plan');
  assert.ok(dayResult,'Journey owner day projection missing');
  assert.equal(dayResult.evidence.routeUncertainty.length,1);
  assert.equal(dayResult.evidence.routeUncertainty[0].probabilityClaim,false);
  assert.equal(dayResult.evidence.rehearsals.length,1);
  assert.equal(dayResult.evidence.rehearsals[0].status,'blocked');
  assert.equal(dayResult.evidence.disruptionRecovery.proposals.length,1);
  assert.equal(dayResult.evidence.disruptionRecovery.proposals[0].automaticMutation,false);
  assert.equal(dayResult.evidence.destinationTwin.nodes.length,2);
  assert.equal(dayResult.evidence.destinationTwin.provenance.persistence,false);
  assert.equal(dayResult.evidence.offlineCrdt.enabled,false);
  assert.equal(dayResult.evidence.offlineCrdt.reserved,true);
  assert.equal(dayResult.evidence.automaticMutation,false);
  assert.ok(day.results.some(result=>result.meta.traceOnly),'Journey read must also emit S16.01');

  const dashboard=read('core/ai/ai-dashboard-service.js');
  const css=read('core/experience/experience-foundation.css');
  const intelligenceAdapter=read('core/platform/intelligence-contract-adapter.js');
  const journeyAdapter=read('core/platform/journey-contract-adapter.js');
  assert.match(intelligenceAdapter,/intelligence\.s16-01-explainable-planning-trace/);
  assert.match(journeyAdapter,/id:'intelligence\.s16-03-route-uncertainty',owner:'intelligence'/);
  assert.match(journeyAdapter,/id:'intelligence\.s16-04-day-rehearsal',owner:'intelligence'/);
  assert.doesNotMatch(journeyAdapter,/owner:'journey'/,'Journey facts remain Journey-owned, but the derived USP feature flags belong to the existing Intelligence owner');
  assert.match(dashboard,/Erneuter Versuch · nichts wurde verändert/);
  assert.match(css,/\.lvx-planning-trace/);
  assert.match(css,/\.lvx-journey-rehearsal/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);

  console.log('M16.5 Step16 S16.01/S16.03/S16.04 product slices: PASS');
})().catch(error=>{console.error(error);process.exit(1)});
