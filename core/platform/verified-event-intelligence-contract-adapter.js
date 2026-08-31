(()=>{
'use strict';

const CONTRACT_ID='intelligence.verified-events.v1';
const VERSION='1';
const RUNTIME_VERSION='1.0.0';
const root=globalThis;

function unavailable(provider){const error=new Error(`Verified Event Intelligence: ${provider} ist nicht verfügbar.`);error.code='VERIFIED_EVENT_PROVIDER_UNAVAILABLE';error.provider=provider;throw error}
function core(){return root.LuviaVerifiedEventIntelligenceCoreV1||unavailable('LuviaVerifiedEventIntelligenceCoreV1')}
function gateway(){return root.LuviaVerifiedEventSourceGatewayV1||null}
async function listVerified(input={}){
  let observations=Array.isArray(input.observations)?input.observations:null,source='owner-projections';
  if(!observations){const provider=gateway();if(typeof provider?.reads?.listObservations!=='function')return Object.freeze({contractId:CONTRACT_ID,kind:'verified-event-collection',status:'provider-unavailable',visible:Object.freeze([]),hidden:Object.freeze([]),counts:Object.freeze({observed:0,visible:0,hidden:0,mapVisible:0}),sourceFailures:Object.freeze(['provider-unavailable']),sourceGateway:false,automaticMutation:false,syntheticEventCount:0});observations=await provider.reads.listObservations(input);source=provider.contractId||'verified-event-source-gateway'}
  const result=core().verifyClaims(observations,{now:input.now});return Object.freeze({...result,sourceGateway:source});
}
function projectObservations(observations=[],options={}){return core().verifyClaims(observations,options)}
function detectDrift(previous,current,options={}){return core().detectDrift(previous,current,options)}
function buildGraph(input={}){return core().buildGraph(input)}
function brushGraph(graph,input={}){return core().brushGraph(graph,input)}
function culturalContext(input={}){return core().culturalContext(input)}
function serendipityWindow(input={}){return core().serendipityWindow(input)}
function eventToMemory(input={}){return core().eventToMemory(input)}
function groupTasteDivergence(input={}){return core().groupTasteDivergence(input)}
function weatherSafeSubstitution(input={}){return core().weatherSafeSubstitution(input)}
function reconcileSchedule(input={}){return core().reconcileSchedule(input)}
function diagnostics(){return Object.freeze({...core().diagnostics(),adapterVersion:RUNTIME_VERSION,sourceGateway:Boolean(gateway()?.reads?.listObservations),publicReadsOnly:true,directOwnerMutation:false})}

const reads=Object.freeze({listVerified,projectObservations,detectDrift,buildGraph,brushGraph,culturalContext,serendipityWindow,eventToMemory,groupTasteDivergence,weatherSafeSubstitution,reconcileSchedule});
const api=Object.freeze({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,reads,commands:Object.freeze({}),events:Object.freeze([]),listVerified,projectObservations,detectDrift,buildGraph,brushGraph,culturalContext,serendipityWindow,eventToMemory,groupTasteDivergence,weatherSafeSubstitution,reconcileSchedule,diagnostics});
root.LuviaVerifiedEventIntelligenceContractV1=api;
for(const definition of [
  {id:'intelligence.s16-09-verified-events',description:'Evidence-gated event claims with zero synthetic events.'},
  {id:'intelligence.s16-10-event-map-time-brush',description:'Synchronized event time-range and map-extent projection.'},
  {id:'intelligence.s16-11-event-memory-serendipity',description:'Verified event-to-Memory and Journey serendipity proposals.'},
  {id:'intelligence.s16-12-event-recovery',description:'Group, weather, drift and schedule-reconciliation projections with separate owner receipts.'}
])root.LuviaFeatureFlagRegistry?.register?.({...definition,owner:'intelligence',defaultEnabled:true,temporary:true});
root.LuviaGlobalContracts?.register?.({id:CONTRACT_ID,version:VERSION,required:false,probe:()=>({available:Boolean(root.LuviaVerifiedEventIntelligenceContractV1),detail:'Verified Event Intelligence read projection; no provider or foreign Domain Truth'})});
})();
