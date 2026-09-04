'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'app/adapters/places-discovery-adapter.js'),'utf8');

(async()=>{
  const calls=[],aiPlans=[],aiRanks=[];
  const sandbox={Object,Array,Map,Set,Date,Math,Number,String,Boolean,RegExp,JSON,Promise,console};
  sandbox.window=sandbox;
  sandbox.LuviaPlacesDomainContractCoreV1={version:'test',routeDiscovery:()=>({query:'ruhiger Ort',category:'food',primaryType:'restaurant',includedType:'restaurant',label:'Essen'})};
  sandbox.LuviaGlobalPlaceContracts={
    queryCascade:()=>['erste Suche','zweite Suche'],
    intentFor:()=>({niche:false}),
    accepts:()=>true,
    relevance:()=>({score:0,reasons:[]})
  };
  sandbox.LuviaPlaceEntities={searchPlaces:async options=>{
    calls.push(options);
    if(calls.length===1)throw Object.assign(new Error('vorübergehender Providerfehler'),{code:'BACKEND_TIMEOUT'});
    return{data:{places:[{id:'place-1',name:'Küstenort',rating:4.7,userRatingCount:120,location:{latitude:54.02,longitude:10.75}}]}};
  }};
  const resolution={kind:'derived-trip-preference-resolution',hardConstraints:[{key:'vegetarian',label:'Vegetarisch',kind:'dietary'}],profileSignals:[{key:'culture',label:'Kultur',weight:8}],tripSignals:[{key:'quiet',label:'Ruhig',weight:12}],activeWeights:[{key:'quiet',label:'Ruhig',weight:12}],summary:{tripFeelings:['Viel Luft']}};
  sandbox.LuviaIntelligenceContractV1={reads:{resolveTripPreferences:()=>resolution,rankPlaceCandidates:({candidates})=>({places:candidates.map(place=>Object.freeze({...place})),meta:{candidateCount:candidates.length,eligibleCount:candidates.length,blockedCount:0}})}};
  sandbox.LuviaAI={
    interpretDiscovery:async input=>{aiPlans.push(input.contract);return{data:{searchPlans:[],reasoningSummary:'Kontext verstanden'},meta:{fallback:false}}},
    rankCandidates:async input=>{aiRanks.push(input.contract);return input.candidates.map(place=>({...place,aiMatchScore:92,aiReasons:['Passt zum ruhigen Reisemoment.'],aiRankingFallback:false}))}
  };
  vm.createContext(sandbox);
  vm.runInContext(source,sandbox);
  const destinationContext={destinationName:'Scharbeutz',countryCode:'DE'};
  const result=await sandbox.LuviaPlacesDiscoveryService.recommend({text:'ruhiger Ort',category:'food',destination:'Scharbeutz',destinationContext,candidateLimit:20,limit:1,profilePreferences:{travelInterests:['culture']},tripComposition:{feelings:['quiet']},momentContext:{query:'Ruhiger Ort',targetDate:'2026-08-29'}});
  assert.equal(calls.length,2,'the cascade must continue after one failed provider query');
  assert.equal(calls[0].destination,destinationContext,'the canonical trip destination must reach every provider query');
  assert.equal(calls[1].destination,destinationContext);
  assert.equal(result.places.length,1);
  assert.equal(result.plan.attempts[0].code,'BACKEND_TIMEOUT');
  assert.equal(result.plan.attempts[1].ok,true);
  assert.equal(aiPlans[0].profileContext.globalProfileSignals[0].key,'culture','AI search planning must receive the resolved global profile context');
  assert.equal(aiRanks[0].profileContext.tripSignals[0].key,'quiet','AI ranking must receive trip-specific weighting');
  assert.equal(aiRanks[0].profileContext.currentMoment.query,'Ruhiger Ort','AI ranking must receive the current Today/Journey moment');
  assert.equal(result.aiMeta.ranking.used,true);
  assert.equal(result.aiMeta.ranking.fallback,false);
  assert.match(result.places[0].aiReasons[0],/ruhigen Reisemoment/);
  assert.equal(Object.isFrozen(result.places[0]),false,'the consumer adapter must project a new display object instead of mutating the frozen owner projection');
  let pendingCalls=0,finish;
  sandbox.LuviaPlaceEntities.searchPlaces=()=>{pendingCalls++;return new Promise(resolve=>{finish=resolve})};
  const warmRequest={text:'same destination',category:'food',destinationContext:{name:'Fresh scope',center:{lat:54,lng:11}},fastPath:true,fastQueryLimit:1,limit:20};
  const sharedReads=Promise.all([sandbox.LuviaPlacesDiscoveryService.recommend(warmRequest),sandbox.LuviaPlacesDiscoveryService.recommend(warmRequest)]);
  await Promise.resolve();await Promise.resolve();assert.equal(pendingCalls,1,'concurrent remounts must share one provider read');
  finish({data:{places:[{id:'shared-place',name:'Shared',location:{latitude:54,longitude:11}}]}});
  const sharedResults=await sharedReads;assert.equal(sharedResults[0].places[0].id,'shared-place');assert.equal(sharedResults[1].places[0].id,'shared-place');
  console.log('M16.5AB Places discovery destination, coalescing and partial-failure resilience: PASS');
})().catch(error=>{console.error(error);process.exitCode=1});
