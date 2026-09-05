'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const read=file=>fs.readFileSync(file,'utf8');
const FIT_REASON='Vegetarische Auswahl ist in den Ortsdaten ausdrücklich belegt.';
const basePlaces=Array.from({length:4},(_,index)=>({
  id:`places/geoapify:veg-${index+1}`,
  providerPlaceId:`geoapify:veg-${index+1}`,
  provider:'geoapify',
  name:`Vegetarischer Ort ${index+1}`,
  address:`Strandallee ${index+1}, 23683 Scharbeutz`,
  primaryType:'restaurant',
  types:['restaurant'],
  features:{servesVegetarianFood:true},
  coordinates:{latitude:54.02+index/1000,longitude:10.75+index/1000},
  preferenceDiscoveryMatch:true,
  preferenceConstraintState:'satisfied',
  preferenceScore:88-index,
  preferenceCoverage:72,
  preferenceReasons:['Vegetarisches Angebot belegt.'],
  profileFit:{owner:'places',contractId:'places.v1',providerPlaceId:`geoapify:veg-${index+1}`,state:'matched',focus:'vegetarisch',score:88-index,coverage:72,reason:FIT_REASON,providerEvidence:true}
}));
const blockedPlace={...basePlaces[0],id:'places/geoapify:blocked-1',providerPlaceId:'geoapify:blocked-1',name:'Widersprüchlicher Altbestand',preferenceDiscoveryMatch:true,preferenceConstraintState:'blocked',profileFit:{...basePlaces[0].profileFit,providerPlaceId:'geoapify:blocked-1',state:'matched'}};

function testOwnerProjection(){
  const context={console,Object,Array,Map,Set,String,Number,Boolean,Math,JSON,Date,RegExp,addEventListener(){},dispatchEvent(){}};
  context.globalThis=context;context.window=context;vm.createContext(context);
  vm.runInContext(read('core/places/places-domain-contract-core.js'),context,{filename:'places-domain-contract-core.js'});
  const owner=context.LuviaPlacesDomainContractCoreV1;
  const fit=owner.profileFitProjection(basePlaces[0],{focus:'Vegetarisch',category:'food'});
  assert.equal(fit.state,'matched');
  assert.equal(fit.reason,FIT_REASON);
  assert.equal(fit.providerPlaceId,basePlaces[0].providerPlaceId);
  const steak=owner.profileFitProjection({...basePlaces[0],name:'Erdmann’s Kleines Steakhaus',types:['restaurant']},{focus:'Vegetarisch',category:'food'});
  assert.equal(steak.state,'blocked','a meat-led venue without a dedicated vegetarian type must stay blocked');
  const stay=owner.profileFitProjection({...basePlaces[0],providerPlaceId:'here:stay-1',primaryType:'hotel',types:['hotel']},{focus:'Vegetarisch',category:'accommodation'});
  assert.notEqual(stay.state,'matched','food fit must never leak into the Stay cohort');
  const source={id:'places:trip-1:places:food:1',surface:'places',tripId:'trip-1',destination:'Scharbeutz',category:'food',query:'Restaurant',searchRadiusMeters:3000,profileFocus:'Vegetarisch',places:[...basePlaces,blockedPlace],observedAt:'2026-09-05T18:00:00.000Z',recordedAt:'2026-09-05T18:00:01.000Z'};
  context.LuviaPlacesSpatialExperience={getSharedDiscoverySnapshot:()=>source};
  vm.runInContext(read('core/platform/places-contract-adapter.js'),context,{filename:'places-contract-adapter.js'});
  const publicRead=context.LuviaPlacesContractV1.reads.getActiveDiscovery({tripId:'trip-1',fitOnly:true});
  assert.equal(publicRead.owner,'places');
  assert.equal(publicRead.contractId,'places.v1');
  assert.equal(publicRead.consumerProviderReads,0);
  assert.equal(publicRead.count,basePlaces.length,'fitOnly must apply the owner projection after adapting a shared snapshot');
  assert.equal(publicRead.places.some(place=>place.providerPlaceId===blockedPlace.providerPlaceId),false,'a stale positive ranking flag must not revive an owner-blocked Place');
  assert.equal(publicRead.places[0].providerPlaceId,basePlaces[0].providerPlaceId);
  assert.equal(publicRead.places[0].profileFit.reason,FIT_REASON);
}

async function testTimelineReuse(){
  let providerReads=0;
  const shared={id:'places:trip-1:places:food:7',owner:'places',contractId:'places.v1',surface:'places',tripId:'trip-1',destination:'Scharbeutz',category:'food',places:[...basePlaces,blockedPlace],count:basePlaces.length+1,fitCount:basePlaces.length,observedAt:'2026-09-05T18:00:00.000Z',consumerProviderReads:0};
  const context={console,setTimeout,clearTimeout,Date,Promise,Map,Set,WeakMap,AbortController,addEventListener(){},dispatchEvent(){return true},matchMedia:()=>({matches:true}),
    LuviaPlacesContractV1:{reads:{getActiveDiscovery:options=>options.tripId==='trip-1'&&options.fitOnly===true?shared:null,recommend:async()=>{providerReads++;throw new Error('provider search must not run')},getCard:async(_id,options)=>({place:options.source,image:null})}},
    LuviaJourneyContractV1:{reads:{getGraph:()=>({days:[]}),getDay:()=>({entries:[]})}},
    LuviaTripPreferenceContextV1:{snapshot:()=>({profilePreferences:{dietary:['Vegetarisch']},tripComposition:{}}),sharedGroup:async()=>({travelers:[],coveredTravelers:0,totalTravelers:0})},
    LuviaProfileService:{snapshot:()=>({profile:{id:'traveler-1',displayName:'Fabian'}})}};
  context.globalThis=context;vm.createContext(context);vm.runInContext(read('app/journey/journey-suggestion-sheet.js'),context,{filename:'journey-suggestion-sheet.js'});
  const result=await context.LuviaJourneySuggestions.load({trip:{id:'trip-1',destination:{name:'Scharbeutz',location:{latitude:54.02,longitude:10.75}}},targetDate:'2027-06-12',query:'Ein passender freier Moment',requestedCount:3},{fast:true,force:true});
  assert.equal(providerReads,0);
  assert.equal(result.sourceCohort,'places-active-discovery');
  assert.equal(result.sharedDiscovery.id,shared.id);
  assert.equal(result.sharedDiscovery.providerReadCount,0);
  assert.equal(result.choices.length,3);
  assert.equal(result.choices.every(place=>place.profileFit?.reason===FIT_REASON),true);
  assert.equal(result.choices.some(place=>place.providerPlaceId===blockedPlace.providerPlaceId),false,'Timeline must reject a non-matched row even if an invalid fitOnly implementation returns it');
  assert.equal(new Set(result.choices.map(place=>place.providerPlaceId)).size,3);
}

async function testAiReuse(){
  let providerReads=0;
  const shared={id:'places:trip-p03:places:food:8',owner:'places',contractId:'places.v1',surface:'places',tripId:'trip-p03',destination:'Scharbeutz',category:'food',places:basePlaces,count:basePlaces.length,fitCount:basePlaces.length,observedAt:'2026-09-05T18:00:00.000Z',consumerProviderReads:0};
  const context={console,Object,Array,Map,Set,WeakSet,Error,TypeError,String,Boolean,Number,Math,JSON,Date,RegExp,Promise,CustomEvent:function(name,options){this.type=name;this.detail=options?.detail},dispatchEvent(){},
    LuviaTripContractV1:{getActiveTrip(){return{id:'trip-p03',destination:{name:'Scharbeutz'}}}},LuviaIdentityContractV1:{getPreferences(){return{dietary:['Vegetarisch']}}},
    LuviaPlacesDomainContractCoreV1:{categories(){return{food:{key:'food',label:'Essen & Trinken',query:'Restaurant',synonyms:[],keywords:[],includedTypes:['restaurant'],domainTypes:['restaurant'],excludedTypes:[],primaryType:'restaurant'}}}},
    LuviaPlacesContractV1:{reads:{getActiveDiscovery:options=>options.category==='food'&&options.fitOnly===true?shared:null,recommend:async()=>{providerReads++;throw new Error('provider search must not run')},getCard:async(_id,options)=>({place:options.source,image:null})},commands:{}}};
  context.globalThis=context;context.window=context;vm.createContext(context);
  for(const file of ['core/places/global-place-contracts.js','core/intelligence/intelligence-action-contract-core.js','core/intelligence/intelligence-action-ledger-core.js','core/intelligence/travel-orchestration-core.js','core/ai/ai-action-runtime.js'])vm.runInContext(read(file),context,{filename:file});
  const message='Zeig mir passende vegetarische Restaurants in Scharbeutz.';
  const compiledIntent=context.LuviaTravelOrchestrationCoreV1.compileIntent(message,{online:true,locale:'de-DE',trip:context.LuviaTripContractV1.getActiveTrip()});
  assert.equal(compiledIntent.status,'compiled','the local compiler must preserve a safe Place read when live AI is unavailable');
  const placeIntent=compiledIntent.intents.find(intent=>intent.domain==='places');
  assert.ok(placeIntent,'German inflected restaurant requests must resolve to the Places owner');
  assert.deepEqual([...placeIntent.categoryHints],['food']);
  assert.deepEqual([...placeIntent.entityHints.preferencePatch.dietaryPreferences],['vegetarian']);
  assert.equal(placeIntent.entityHints.destinationName,'Scharbeutz');
  const response=await context.LuviaAIActionRuntime.runMessage(message,{surface:'global-chat',compiledIntent});
  const result=response.results.find(item=>item.kind==='place_collection');
  assert.ok(result);
  assert.equal(providerReads,0);
  assert.equal(result.evidence.sharedDiscovery.reused,true);
  assert.equal(result.evidence.sharedDiscovery.id,shared.id);
  assert.equal(result.evidence.sharedDiscovery.providerReadCount,0);
  assert.equal(result.items[0].providerPlaceId,basePlaces[0].providerPlaceId);
  assert.equal(result.items[0].reasons[0],FIT_REASON);
}

(async()=>{
  testOwnerProjection();
  await testTimelineReuse();
  await testAiReuse();
  console.log('P03 cross-surface Places owner parity: PASS');
})().catch(error=>{console.error(error);process.exit(1)});
