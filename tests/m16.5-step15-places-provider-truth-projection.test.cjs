'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const json=value=>value===undefined?undefined:JSON.parse(JSON.stringify(value));

const placesServiceSource=read('intelligence/places-service.js');
const placeEntitySource=read('intelligence/place-entity-service.js');
const placesDomainSource=read('core/places/places-domain-contract-core.js');
const placesAdapterSource=read('core/platform/places-contract-adapter.js');
const intelligenceActionSource=read('core/intelligence/intelligence-action-contract-core.js');

const providerPlace={
  id:'fsq:venue-42',
  providerPlaceId:'fsq:venue-42',
  resourceName:'foursquare/venue-42',
  provider:'foursquare',
  source:'foursquare_places',
  name:'Kompass Küche',
  displayName:'Kompass Küche',
  formattedAddress:'Am Markt 7, Scharbeutz Zentrum',
  location:{latitude:54.0251,longitude:10.7502},
  primaryType:'13065',
  primaryTypeLabel:'Restaurant',
  types:['13065','Restaurant','Vegetarian Restaurant'],
  rating:4.7,
  userRatingCount:312,
  openNow:true,
  providerRefs:{foursquare:'venue-42'},
  evidence:[{provider:'foursquare',kind:'place-search',rawProviderPayload:'must-not-cross'}],
  providerObservedAt:'2026-09-01T08:30:00.000Z',
  providerFactsCached:false,
  distanceMeters:640,
  distanceSource:'destination-center',
  photos:[{
    name:'foursquare/venue-42/photos',
    uri:'https://images.example.test/foursquare/venue-42.jpg',
    provider:'foursquare',
    attribution:'Foursquare Places',
    sourceUrl:'https://foursquare.com/v/venue-42',
    license:'Foursquare Places Terms',
    entityReference:'fsq:venue-42',
    linkedEntityReference:'foursquare:venue-42',
    verified:true
  }],
  raw:{secret:'must-not-cross'}
};

function serviceHarness(){
  let mode='partial-success',clock=0;
  const calls=[];
  const sandbox={Object,Array,Map,Set,Date,Math,Number,String,Boolean,RegExp,JSON,Promise,Error,TypeError,console};
  sandbox.window=sandbox;
  sandbox.globalThis=sandbox;
  sandbox.document={documentElement:{lang:'de'}};
  sandbox.performance={now:()=>++clock};
  sandbox.LuviaDestination={
    getActive:()=>({id:'destination-scharbeutz',name:'Scharbeutz',country:'Deutschland',countryCode:'DE',center:{latitude:54.025,longitude:10.75},isResolved:true})
  };
  sandbox.LuviaBackend={request:async(action,payload,requestOptions)=>{
    calls.push({action,payload,requestOptions});
    if(mode==='partial-success')return{
      ok:true,
      data:{
        places:[json(providerPlace)],
        providers:{
          requested:['google','foursquare'],
          used:['foursquare'],
          errors:[{provider:'google',code:'GOOGLE_PROVIDER_ERROR',message:'Google quota exhausted'}]
        }
      },
      meta:{cache:{hit:false}}
    };
    if(mode==='all-failed')return{
      ok:true,
      data:{
        places:[],
        providers:{
          requested:['google','foursquare'],
          used:[],
          errors:[
            {provider:'google',code:'GOOGLE_PROVIDER_ERROR',message:'Google unavailable'},
            {provider:'foursquare',code:'FOURSQUARE_PROVIDER_ERROR',message:'Foursquare unavailable'}
          ]
        }
      },
      meta:{cache:{hit:false}}
    };
    if(mode==='answered-empty-with-partial-errors')return{
      ok:true,
      data:{
        places:[],
        providers:{
          requested:['auto'],
          attempted:['geoapify','tomtom','here'],
          answered:['here'],
          used:[],
          errors:[
            {provider:'geoapify',code:'PROVIDER_BUDGET_DENIED',message:'Geoapify budget reserved'},
            {provider:'tomtom',code:'PROVIDER_BUDGET_DENIED',message:'TomTom budget reserved'}
          ]
        }
      },
      meta:{cache:{hit:false}}
    };
    return{
      ok:true,
      data:{places:[],providers:{requested:['google','foursquare'],used:[],errors:[]}},
      meta:{cache:{hit:false}}
    };
  }};
  vm.createContext(sandbox);
  vm.runInContext(placesServiceSource,sandbox,{filename:'intelligence/places-service.js'});
  vm.runInContext(placeEntitySource,sandbox,{filename:'intelligence/place-entity-service.js'});
  return{sandbox,calls,setMode:value=>{mode=value}};
}

function projectionHarness(sourcePlace){
  const registrations=[];
  let photoCalls=0;
  const sandbox={Object,Array,Map,Set,WeakSet,Date,Math,Number,String,Boolean,RegExp,JSON,Promise,Error,TypeError,console};
  sandbox.window=sandbox;
  sandbox.globalThis=sandbox;
  sandbox.addEventListener=()=>{};
  sandbox.dispatchEvent=()=>true;
  sandbox.CustomEvent=function CustomEvent(type,init={}){this.type=type;this.detail=init.detail};
  sandbox.LuviaPlaceCore={search:async()=>({places:[]}),getPlace:()=>null,getPlaces:()=>[]};
  sandbox.LuviaPlaces={
    details:async()=>({data:{place:json(sourcePlace)}}),
    photo:async()=>{photoCalls++;throw new Error('A direct Foursquare photo URI must not be sent to the Google photo endpoint.')}
  };
  sandbox.LuviaPlaceCommands={};
  sandbox.LuviaPlacesDiscoveryService={listSaved:async()=>[],recommend:async()=>({places:[]})};
  sandbox.LuviaPresenceVisitCore={confirmVisit(){}};
  sandbox.LuviaPlatformPorts={get(){return{open(){}}},has(){return true}};
  sandbox.LuviaGlobalContracts={register:definition=>registrations.push(definition)};
  vm.createContext(sandbox);
  vm.runInContext(placesDomainSource,sandbox,{filename:'core/places/places-domain-contract-core.js'});
  vm.runInContext(intelligenceActionSource,sandbox,{filename:'core/intelligence/intelligence-action-contract-core.js'});
  vm.runInContext(placesAdapterSource,sandbox,{filename:'core/platform/places-contract-adapter.js'});
  return{sandbox,registrations,photoCalls:()=>photoCalls};
}

(async()=>{
  const service=serviceHarness();
  const spatialConstraints={explicit:true,prefer:['center'],avoid:['waterfront'],source:'user-text'};
  const positionContext={purpose:'places-ranking',precision:'coarse',coordinates:{latitude:54.025,longitude:10.75},providerShareApproved:true};

  const partial=await service.sandbox.LuviaPlaceEntities.searchPlaces({
    type:'restaurant',
    query:'Restaurant im Zentrum, nicht am Strand',
    maxResultCount:3,
    providers:['google','foursquare'],
    spatialConstraints,
    positionContext
  });
  assert.equal(partial.data.places.length,1,'a valid Foursquare result must survive a simultaneous Google provider failure');
  assert.equal(partial.data.places[0].provider,'foursquare');
  assert.equal(partial.data.providers.used.includes('foursquare'),true);
  assert.equal(partial.data.providers.errors.some(error=>error.provider==='google'),true,'the partial provider failure must remain inspectable without hiding the valid fallback');

  const normalized=partial.data.places[0];
  assert.equal(normalized.types.includes('restaurant'),true,'Foursquare category labels must be normalized to the shared lowercase Places taxonomy');
  assert.equal(normalized.types.includes('vegetarian_restaurant'),true,'multi-word Foursquare labels must be normalized to snake_case taxonomy tokens');
  assert.deepEqual(Array.from(normalized.providerNativeTypes),['13065','Restaurant','Vegetarian Restaurant'],'provider-native category evidence must remain separately attributable');

  const firstPayload=service.calls[0].payload;
  assert.deepEqual(Array.from(firstPayload.options.spatialConstraints.prefer),['center'],'structured positive spatial constraints must survive Places Entity and Places Service normalization');
  assert.deepEqual(Array.from(firstPayload.options.spatialConstraints.avoid),['waterfront'],'structured negative spatial constraints must survive Places Entity and Places Service normalization');
  assert.equal(firstPayload.options.spatialConstraints.source,'user-text');
  assert.deepEqual(json(firstPayload.options.positionContext.coordinates),positionContext.coordinates,'approved position coordinates must survive into the backend request payload');
  assert.equal(firstPayload.options.positionContext.providerShareApproved,true);
  assert.equal(firstPayload.options.positionContext.precision,'coarse');

  service.setMode('all-failed');
  await assert.rejects(
    ()=>service.sandbox.LuviaPlaces.textSearch('Restaurant Zentrum',{spatialConstraints,positionContext}),
    error=>{
      assert.equal(error.code,'PLACES_PROVIDER_READ_UNAVAILABLE');
      assert.match(error.message,/Provider/i);
      assert.equal(Array.isArray(error.providerDiagnostics?.errors),true,'the semantic failure must expose bounded safe provider diagnostics');
      assert.equal(error.providerDiagnostics.errors.length,2);
      assert.equal(error.providerDiagnostics.errors.every(item=>item.provider&&item.code),true);
      assert.equal(error.providerDiagnostics.status,'unavailable');
      return true;
    },
    'an HTTP-200 empty response with provider errors must become a visible semantic failure'
  );

  service.setMode('honest-empty');
  const empty=await service.sandbox.LuviaPlaces.textSearch('Ein wirklich nicht vorhandener Ort',{spatialConstraints,positionContext});
  assert.deepEqual(Array.from(empty.data.places),[],'a provider-confirmed empty result is a truthful successful empty state');
  assert.deepEqual(Array.from(empty.data.providers.errors),[]);

  service.setMode('answered-empty-with-partial-errors');
  const answeredEmpty=await service.sandbox.LuviaPlaces.textSearch('Chinesisch Restaurant',{spatialConstraints,positionContext});
  assert.deepEqual(Array.from(answeredEmpty.data.places),[],'a successful HERE answer remains a truthful empty result when earlier providers were budget denied');
  assert.deepEqual(Array.from(answeredEmpty.data.providers.answered),['here']);
  assert.equal(answeredEmpty.data.providers.status,'empty');
  assert.equal(answeredEmpty.data.providers.errors.length,2,'budget diagnostics remain inspectable without becoming a false outage');

  const projection=projectionHarness(normalized);
  const domainProjection=projection.sandbox.LuviaPlacesDomainContractCoreV1.projectDetails(normalized);
  assert.equal(domainProjection.provider,'foursquare');
  assert.deepEqual(json(domainProjection.providerRefs),{foursquare:'venue-42'});
  assert.deepEqual(json(domainProjection.providerEvidence),[{provider:'foursquare',kind:'place-search'}],'public Places evidence must be bounded and must not leak raw provider payload');
  assert.equal(domainProjection.providerObservedAt,'2026-09-01T08:30:00.000Z');
  assert.equal(domainProjection.providerFactsCached,false);
  assert.equal(domainProjection.distanceMeters,640);
  assert.equal(domainProjection.distanceSource,'destination-center');
  assert.equal(domainProjection.photos[0].license,'Foursquare Places Terms');
  assert.equal(domainProjection.photos[0].entityReference,'fsq:venue-42');
  assert.equal(domainProjection.photos[0].linkedEntityReference,'foursquare:venue-42');
  assert.equal(domainProjection.photos[0].verified,true,'exact media provenance must survive the Places owner projection');
  assert.equal(domainProjection.raw,undefined);

  const card=await projection.sandbox.LuviaPlacesContractV1.reads.getCard(normalized.providerPlaceId);
  assert.equal(card.place.provider,'foursquare');
  assert.equal(card.place.providerObservedAt,'2026-09-01T08:30:00.000Z');
  assert.equal(card.place.distanceMeters,640);
  assert.equal(card.image.url,'https://images.example.test/foursquare/venue-42.jpg');
  assert.equal(card.image.provider,'Foursquare','photo origin must reflect the provider that supplied the media');
  assert.equal(card.image.sourceUrl,'https://foursquare.com/v/venue-42');
  assert.equal(card.image.providerPlaceId,'fsq:venue-42');
  assert.equal(card.image.license,'Foursquare Places Terms');
  assert.equal(card.image.entityReference,'fsq:venue-42');
  assert.equal(card.image.linkedEntityReference,'foursquare:venue-42');
  assert.equal(card.image.verified,true);
  assert.equal(card.image.transient,true);
  assert.equal(projection.photoCalls(),0,'a direct Foursquare image must not be resolved through the Google photo endpoint');

  const actionPlace=projection.sandbox.LuviaIntelligenceActionContractCoreV1.normalizePlace({...card.place,image:card.image});
  assert.equal(actionPlace.provider,'foursquare');
  assert.deepEqual(json(actionPlace.providerRefs),{foursquare:'venue-42'});
  assert.deepEqual(json(actionPlace.providerEvidence),[{provider:'foursquare',kind:'place-search'}]);
  assert.equal(actionPlace.providerObservedAt,'2026-09-01T08:30:00.000Z');
  assert.equal(actionPlace.providerFactsCached,false);
  assert.equal(actionPlace.distanceMeters,640);
  assert.equal(actionPlace.distanceSource,'destination-center');
  assert.equal(actionPlace.image.provider,'Foursquare');
  assert.equal(actionPlace.image.sourceUrl,'https://foursquare.com/v/venue-42');
  assert.equal(actionPlace.image.transient,true);
  assert.equal(Object.isFrozen(actionPlace),true);

  console.log('M16.5 P02/P03 Places provider truth and public projection: PASS');
})().catch(error=>{console.error(error);process.exitCode=1});
