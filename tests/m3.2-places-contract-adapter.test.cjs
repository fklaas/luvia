const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'core/platform/places-contract-adapter.js'),'utf8');
const domainCoreSource=fs.readFileSync(path.join(root,'core/places/places-domain-contract-core.js'),'utf8');
const stateCoreSource=fs.readFileSync(path.join(root,'core/places/place-state-core.js'),'utf8');
const coreSource=fs.readFileSync(path.join(root,'core/places/place-core.js'),'utf8');

for(const forbidden of ['LuviaBackend','Supabase','TripPlaceData','trip_places','trip_place_data','localStorage','sessionStorage','ParisCloud','ParisSupabase','LuviaPlaceEntities']){
  assert(!source.includes(forbidden),`adapter must not expose/use forbidden Places internals: ${forbidden}`);
}
assert(coreSource.includes("function updateLifecycle(id,value){return updatePlace(id,{lifecycle:value});}"),'PlaceCore must provide local updateLifecycle compatibility method');
assert(coreSource.includes('getPlaces,registerPlace,updatePlace,updateLifecycle,removePlace'),'PlaceCore must export updateLifecycle');

{
  const localWindow={};
  localWindow.LuviaPlaceDomain={
    validate(){return{valid:true}},
    normalize(input,options={}){return Object.freeze({...input,primaryType:options.primaryType||input.primaryType||'custom'})}
  };
  localWindow.LuviaPlaceRegistry={
    getAdapter(){return{normalize(input){return input}}},
    getTypes(){return[]},
    diagnostics(){return{}}
  };
  vm.runInNewContext(stateCoreSource+'\n'+coreSource,{window:localWindow,console,Date,Object,Array,String,Boolean,Number,Error,Map,Set});
  const localCore=localWindow.LuviaPlaceCore;
  assert(localCore,'PlaceCore must install');
  localCore.registerPlace({id:'local-1',name:'Local',primaryType:'custom',roles:[],capabilities:[],lifecycle:'discovered'},{normalized:true});
  const updated=localCore.updateLifecycle('local-1','visited');
  assert.strictEqual(updated.lifecycle,'visited');
  assert.strictEqual(localCore.getPlace('local-1').lifecycle,'visited');
}

class CustomEvent{constructor(type,init={}){this.type=type;this.detail=init.detail}}
const listeners=new Map(),published=[];
const window={
  addEventListener(type,fn){if(!listeners.has(type))listeners.set(type,new Set());listeners.get(type).add(fn)},
  dispatchEvent(event){published.push(event);for(const fn of listeners.get(event.type)||[])fn(event);return true}
};

const rawPlace={
  id:'p1',tripId:'t1',providerPlaceId:'places/google-1',primaryType:'restaurant',roles:['food'],
  name:'Cafe Test',description:'Beschreibung',coordinates:{latitude:52.1,longitude:7.2},address:'Testweg 1',
  lifecycle:'favorite',capabilities:['reserve'],bookingDomains:['restaurant'],createdAt:'2026-08-01T00:00:00.000Z',
  updatedAt:'2026-08-02T00:00:00.000Z',storageSecret:'must-not-leak'
};
const calls={search:[],viewport:[],autocomplete:[],details:[],importPlace:[],favorite:[],unfavorite:[],toggleFavorite:[],clearFavorites:[],plan:[],unplan:[],lifecycle:[],visit:[],presence:[],registered:[]};

window.LuviaPlaceCore={
  getPlace(id){return id==='p1'?rawPlace:null},
  getPlaces(){return[rawPlace]},
  async search(options){calls.search.push(options);return{data:{places:[{...rawPlace,id:'search-1',providerPlaceId:'places/google-search',rawProviderPayload:{secret:true}}]},debug:{token:'private'}}},
  async importProviderPlace(providerPlaceId,options){calls.importPlace.push({providerPlaceId,options});return{ok:true,data:{entity:{place:{...rawPlace,id:'import-1',provider_place_id:'places/google-import'},trip_place:{id:'tp-import',trip_id:'t1',place_id:'import-1'},private_join:'hidden'}},trace:'private'}},
  async updateLifecycleCloud(tripPlaceId,value,patch,options){calls.lifecycle.push({tripPlaceId,value,patch,options});return{ok:true,data:{entity:{place:{...rawPlace,lifecycle:value},trip_place:{id:tripPlaceId,trip_id:options.tripId||'t1',place_id:'p1',status:value,is_favorite:patch.isFavorite??true},private_join:'hidden'}},rpcDebug:'private'}},
  async recordVisit(placeId,patch){calls.visit.push({placeId,patch});return{id:'v1',tripId:'t1',placeId,state:'visited',arrivedAt:'2026-08-13T12:00:00.000Z',leftAt:null,durationSeconds:120,detectionSource:'manual',isAutomatic:false,isConfirmed:true,correction:{private:'must-not-leak'},participantId:'private-user'}}
};
window.LuviaPlaces={
  async textSearch(query,options){const location=options.destination.location,id=`tile-${location.latitude}-${location.longitude}`;calls.viewport.push({query,options});return{data:{places:[{id:`places/${id}`,providerPlaceId:`places/${id}`,displayName:`Treffer ${id}`,formattedAddress:'Im Kartenausschnitt',location}],providers:{requested:['google'],used:['google']}}}},
  async autocomplete(query,options){calls.autocomplete.push({query,options});return{data:{sessionToken:'places-session-1',suggestions:[{placeId:'places/copenhagen',text:'Kopenhagen, Dänemark'},{description:'ohne id'}]}}},
  async details(placeId,options){
    calls.details.push({placeId,options});
    if(placeId==='places/copenhagen')return{data:{place:{id:'places/copenhagen',providerPlaceId:'places/copenhagen',displayName:'Kopenhagen',name:'Kopenhagen',formattedAddress:'Kopenhagen, Dänemark',location:{latitude:55.6761,longitude:12.5683},addressComponents:[{longText:'Kopenhagen',shortText:'København',types:['locality']},{longText:'Dänemark',shortText:'DK',types:['country']}]}}};
    return{data:{place:{...rawPlace,rating:4.7,userRatingCount:123,priceLevel:'PRICE_LEVEL_MODERATE',websiteUri:'https://example.test',internationalPhoneNumber:'+491234',googleMapsUri:'https://maps.example.test',currentOpeningHours:{openNow:true},types:['restaurant','food'],photos:[{name:'private-photo'}],providerRaw:{secret:true}}},requestId:'private'};
  }
};
const commandResponse=(isFavorite,status='favorite')=>({ok:true,data:{entity:{place:rawPlace,trip_place:{id:'tp1',trip_id:'t1',place_id:'p1',status,is_favorite:isFavorite},private_join:'hidden'}},debug:'private'});
window.LuviaPlaceCommands={
  async favorite(options){calls.favorite.push(options);return commandResponse(true,'favorite')},
  async unfavorite(options){calls.unfavorite.push(options);return commandResponse(false,'discovered')},
  async toggleFavorite(options){calls.toggleFavorite.push(options);return commandResponse(true,'favorite')},
  async clearFavorites(placeType,options){calls.clearFavorites.push({placeType,options});return{ok:true,data:{count:3,rows:[{secret:true}]}}},
  async plan(options){calls.plan.push(options);return{trip_id:options.tripId,trip_place_id:options.tripPlaceId,fields:{private:'raw-rpc'}}},
  async unplan(options){calls.unplan.push(options);return{trip_id:options.tripId,trip_place_id:options.tripPlaceId,fields:{private:'raw-rpc'}}}
};
window.LuviaPresenceVisitCore={
  confirmVisit(){},
  pendingVisits(){return[{id:'pending-1',tripId:'t1',placeId:'p1',state:'pending_confirmation',isConfirmed:false}]},
  async rejectVisit(id,reason){calls.presence.push(['rejectVisit',id,reason]);return{id,tripId:'t1',placeId:'p1',state:'rejected',isConfirmed:false}},
  async setGlobalEnabled(enabled){calls.presence.push(['setGlobalEnabled',enabled]);return{enabled}},
  async refreshLocation(){calls.presence.push(['refreshLocation']);return{permission:'granted'}}
};
window.LuviaPlacesDiscoveryService={
  async listSaved(){return[{place:rawPlace,tripPlace:{id:'tp-saved',trip_id:'t1',status:'favorite',is_favorite:true}}]},
  async recommend(){return{places:[{...rawPlace,id:'recommend-1',providerPlaceId:'places/google-recommend',rating:4.8}],plan:{ai:{fallback:false}}}}
};
window.LuviaPlatformPorts={
  get(id){return id==='DeepLinkPort'?{open(route){return route}}:null},
  has(id){return id==='DeepLinkPort'}
};
window.LuviaGlobalContracts={register(def){calls.registered.push(def)}};

vm.runInNewContext(domainCoreSource+'\n'+source,{window,CustomEvent,console,Date,Number,Object,Array,String,Boolean,TypeError,Error,Set,Map,LuviaPlacesDiscoveryService:window.LuviaPlacesDiscoveryService,LuviaPlatformPorts:window.LuviaPlatformPorts});
const api=window.LuviaPlacesContractV1;
assert(api,'Places contract must be installed');
assert.strictEqual(window.LuviaPlacesContract,api,'latest alias must reference v1 object');
assert.strictEqual(api.contractId,'places.v1');
assert.strictEqual(api.version,'1');
assert.strictEqual(api.runtimeVersion,'1.5.0-live-viewport');
assert(Object.isFrozen(api));
assert.deepStrictEqual([...api.events],['places.changed','place.lifecycle.changed','place.plan.changed','place.favorite.changed']);
assert.deepStrictEqual(Object.keys(api.reads),['search','searchViewport','getRoute','getPlace','listPlaces','getDetails','getCard','suggestDestinations','getDestination','listSaved','recommend','getLifecycle','categories','routeDiscovery','createDeepLink','pendingVisits']);
assert.deepStrictEqual(Object.keys(api.composition),['selectView']);
assert.deepStrictEqual(Object.keys(api.commands),['importPlace','favorite','unfavorite','toggleFavorite','clearFavorites','plan','unplan','updateLifecycle','confirmVisit','rejectVisit','setLocationEnabled','refreshLocation','openDiscovery','openWebsite','openPhone','openMaps']);

const place=api.getPlace('p1');
assert(Object.isFrozen(place));
assert(Object.isFrozen(place.coordinates));
assert(Object.isFrozen(place.roles));
assert.strictEqual(place.providerPlaceId,'google-1');
assert.strictEqual(place.storageSecret,undefined,'raw Place fields must not leak');
assert.strictEqual(api.getPlace('missing'),null);
assert.strictEqual(api.getLifecycle('p1'),'favorite');
const listed=api.listPlaces();
assert(Object.isFrozen(listed));
assert(Object.isFrozen(listed[0]));
assert.strictEqual(listed[0].storageSecret,undefined);

(async()=>{
  const searched=await api.search({type:'restaurant',query:'Cafe'});
  assert(Object.isFrozen(searched));
  assert(Object.isFrozen(searched.places));
  assert.strictEqual(searched.count,1);
  assert.strictEqual(searched.places[0].providerPlaceId,'google-search');
  assert.strictEqual(searched.places[0].rawProviderPayload,undefined,'provider search payload must not leak');
  assert.strictEqual(searched.debug,undefined,'search transport metadata must not leak');

  const viewport=await api.searchViewport({query:'Restaurants',type:'restaurant',providers:['google'],bounds:{south:52,west:7,north:53,east:8},center:{latitude:52.5,longitude:7.5},radiusMeters:5000,maxResultCount:20,maxViewportResults:80});
  assert.strictEqual(calls.viewport.length,4,'one viewport must be split into four provider requests');
  assert.strictEqual(viewport.count,4,'deduplicated tile results must all remain visible');
  assert.deepStrictEqual(JSON.parse(JSON.stringify(viewport.tiles)),{requested:4,fulfilled:4,providerPageSize:20,maximumUniqueResults:80,complete:true,strategy:'four-tile-legacy'});
  assert(viewport.places.every(place=>place.coordinates.latitude>=52&&place.coordinates.latitude<=53&&place.coordinates.longitude>=7&&place.coordinates.longitude<=8));

  const geoViewport=await api.searchViewport({query:'Restaurants',type:'restaurant',bounds:{south:52,west:7,north:53,east:8},center:{latitude:52.5,longitude:7.5}});
  assert.strictEqual(calls.viewport.length,5,'default Geoapify browse adds exactly one rectangle read');
  assert.strictEqual(geoViewport.tiles.strategy,'single-rectangle-geoapify');
  assert.strictEqual(geoViewport.tiles.providerPageSize,50,'single Geoapify rectangle retains a complete provider page');

  const details=await api.getDetails('google-1',{languageCode:'de'});
  assert.strictEqual(details.rating,4.7);
  assert.strictEqual(details.userRatingCount,123);
  assert.strictEqual(details.website,'https://example.test');
  assert.strictEqual(details.openNow,true);
  assert(Object.isFrozen(details.photos),'bounded provider photo projections must be immutable');
  assert.deepStrictEqual(JSON.parse(JSON.stringify(details.photos)),[{name:'private-photo',uri:null,widthPx:null,heightPx:null,attribution:null,attributionUrl:null,sourceUrl:null}]);
  assert.strictEqual(details.providerRaw,undefined,'raw provider detail payload must not leak');
  assert(Object.isFrozen(details.types));

  const destinationSuggestions=await api.suggestDestinations('Kopenhagen',{languageCode:'de'});
  assert(Object.isFrozen(destinationSuggestions));
  assert(Object.isFrozen(destinationSuggestions.suggestions));
  assert.strictEqual(destinationSuggestions.owner,'places');
  assert.strictEqual(destinationSuggestions.contractId,'places.v1');
  assert.strictEqual(destinationSuggestions.sessionToken,'places-session-1');
  assert.deepStrictEqual(JSON.parse(JSON.stringify(destinationSuggestions.suggestions)),[{placeId:'places/copenhagen',text:'Kopenhagen, Dänemark'}]);
  assert.strictEqual(calls.autocomplete[0].options.includedType,'(cities)');

  const destination=await api.getDestination('places/copenhagen',{sessionToken:destinationSuggestions.sessionToken});
  assert(Object.isFrozen(destination));
  assert.deepStrictEqual(JSON.parse(JSON.stringify(destination)),{owner:'places',contractId:'places.v1',placeId:'copenhagen',name:'Kopenhagen',formattedAddress:'Kopenhagen, Dänemark',country:'Dänemark',countryCode:'DK',latitude:55.6761,longitude:12.5683});

  const saved=await api.listSaved({tripId:'t1'});
  assert.strictEqual(saved.length,1);
  assert.strictEqual(saved[0].tripPlaceId,'tp-saved');
  assert.strictEqual(saved[0].isFavorite,true);
  assert.strictEqual(saved[0].storageSecret,undefined);

  const recommended=await api.recommend({text:'Pasta essen',category:'food'});
  assert.strictEqual(recommended.count,1);
  assert.strictEqual(recommended.places[0].providerPlaceId,'google-recommend');
  assert.strictEqual(recommended.places[0].rating,4.8);
  assert.strictEqual(api.categories().food.label,'Essen & Trinken');
  assert.strictEqual(api.routeDiscovery({text:'Hotel in Paris'}).category,'accommodation');
  assert.deepStrictEqual(JSON.parse(JSON.stringify(api.openDiscovery({category:'nature'}))),{screen:'places',params:{category:'nature',query:'Parks Gärten Natur Erholung'}});

  const imported=await api.importPlace('google-import',{type:'restaurant'});
  assert.strictEqual(imported.id,'import-1');
  assert.strictEqual(imported.providerPlaceId,'google-import');
  assert.strictEqual(imported.tripPlaceId,'tp-import');
  assert.strictEqual(imported.private_join,undefined);
  assert.strictEqual(calls.importPlace.length,1);

  const favorite=await api.favorite({tripId:'t1',placeType:'restaurant',providerPlaceId:'google-1',tripPlaceId:'tp1'});
  assert.deepStrictEqual(JSON.parse(JSON.stringify(favorite)),{ok:true,action:'favorite',tripId:'t1',placeId:'p1',tripPlaceId:'tp1',providerPlaceId:'google-1',primaryType:'restaurant',lifecycle:'favorite',isFavorite:true});
  assert.strictEqual(favorite.data,undefined,'favorite raw response must not leak');

  const unfavorite=await api.unfavorite({tripId:'t1',placeType:'restaurant',providerPlaceId:'google-1',tripPlaceId:'tp1'});
  assert.strictEqual(unfavorite.action,'unfavorite');
  assert.strictEqual(unfavorite.isFavorite,false);
  assert.strictEqual(unfavorite.data,undefined);

  const toggled=await api.toggleFavorite({tripId:'t1',placeType:'restaurant',providerPlaceId:'google-1',tripPlaceId:'tp1'});
  assert.strictEqual(toggled.isFavorite,true);

  const cleared=await api.clearFavorites('restaurant',{tripId:'t1'});
  assert.strictEqual(cleared.action,'clearFavorites');
  assert.strictEqual(cleared.primaryType,'restaurant');
  assert.strictEqual(cleared.isFavorite,false);
  assert.strictEqual(cleared.rows,undefined);

  const planned=await api.plan({tripId:'t1',tripPlaceId:'tp1',placeId:'p1',placeType:'restaurant',fields:{day:'2026-08-13'}});
  assert.strictEqual(planned.action,'plan');
  assert.strictEqual(planned.tripId,'t1');
  assert.strictEqual(planned.tripPlaceId,'tp1');
  assert.strictEqual(planned.placeId,'p1');
  assert.strictEqual(planned.fields,undefined,'raw planning fields must not leak');

  const unplanned=await api.unplan({tripId:'t1',tripPlaceId:'tp1',placeId:'p1',placeType:'restaurant'});
  assert.strictEqual(unplanned.action,'unplan');
  assert.strictEqual(unplanned.fields,undefined);

  const lifecycle=await api.updateLifecycle('tp1','visited',{isFavorite:false},{tripId:'t1'});
  assert.strictEqual(lifecycle.action,'updateLifecycle');
  assert.strictEqual(lifecycle.tripPlaceId,'tp1');
  assert.strictEqual(lifecycle.lifecycle,'visited');
  assert.strictEqual(lifecycle.isFavorite,false);
  assert.strictEqual(lifecycle.data,undefined,'lifecycle raw response must not leak');

  const visit=await api.confirmVisit('p1',{durationSeconds:120});
  assert.deepStrictEqual(JSON.parse(JSON.stringify(visit)),{id:'v1',tripId:'t1',placeId:'p1',state:'visited',arrivedAt:'2026-08-13T12:00:00.000Z',leftAt:null,durationSeconds:120,detectionSource:'manual',automatic:false,confirmed:true});
  assert.strictEqual(visit.correction,undefined,'visit correction payload must not leak');
  assert.strictEqual(visit.participantId,undefined,'visit participant internals must not leak');
  assert.strictEqual(api.pendingVisits()[0].state,'pending_confirmation');
  assert.strictEqual((await api.rejectVisit('pending-1','Nicht dort gewesen')).state,'rejected');
  assert.strictEqual((await api.setLocationEnabled(true)).enabled,true);
  assert.strictEqual((await api.refreshLocation()).permission,'granted');
  assert.deepStrictEqual(calls.presence,[['rejectVisit','pending-1','Nicht dort gewesen'],['setGlobalEnabled',true],['refreshLocation']]);

  assert.strictEqual(calls.registered.length,1);
  assert.strictEqual(calls.registered[0].id,'places.v1');
  assert.strictEqual(calls.registered[0].probe().available,true);

  published.length=0;
  window.dispatchEvent(new CustomEvent('luvia:place-runtime-changed',{detail:{tripId:'t1',placeId:'p1',placeType:'restaurant',secret:'private'}}));
  const changed=published.find(e=>e.type==='luvia:places.changed');
  assert(changed,'runtime change must normalize to places.changed');
  assert.strictEqual(changed.detail.source,'places');
  assert.strictEqual(changed.detail.payload.placeId,'p1');
  assert.strictEqual(changed.detail.payload.secret,undefined,'foreign event detail must not leak');

  window.dispatchEvent(new CustomEvent('luvia:place-plan-changed',{detail:{tripId:'t1',tripPlaceId:'tp1',placeId:'p1',action:'saved',fields:{private:true}}}));
  const planChanged=published.find(e=>e.type==='luvia:place.plan.changed');
  assert(planChanged,'planning change must normalize to place.plan.changed');
  assert.strictEqual(planChanged.detail.payload.tripPlaceId,'tp1');
  assert.strictEqual(planChanged.detail.payload.fields,undefined);

  window.dispatchEvent(new CustomEvent('luvia:place-favorite-changed',{detail:{tripId:'t1',placeId:'p1',isFavorite:true,entity:{private:'hidden'}}}));
  const favoriteChanged=published.find(e=>e.type==='luvia:place.favorite.changed');
  assert(favoriteChanged,'favorite change must normalize to place.favorite.changed');
  assert.strictEqual(favoriteChanged.detail.payload.isFavorite,true);
  assert.strictEqual(favoriteChanged.detail.payload.entity,undefined);

  window.dispatchEvent(new CustomEvent('luvia:place-visit-changed',{detail:{tripId:'t1',placeId:'p1',state:'visited',visit:{private:'hidden'}}}));
  const lifecycleChanged=published.find(e=>e.type==='luvia:place.lifecycle.changed');
  assert(lifecycleChanged,'visit change must normalize to place.lifecycle.changed');
  assert.strictEqual(lifecycleChanged.detail.payload.lifecycle,'visited');
  assert.strictEqual(lifecycleChanged.detail.payload.visit,undefined);

  const savedGateway=window.LuviaPlaces;
  delete window.LuviaPlaces;
  await assert.rejects(()=>api.getDetails('google-1'),error=>error.code==='PLACES_CONTRACT_PROVIDER_UNAVAILABLE'&&error.provider==='LuviaPlaces.details');
  window.LuviaPlaces=savedGateway;

  const savedCommands=window.LuviaPlaceCommands;
  delete window.LuviaPlaceCommands;
  await assert.rejects(()=>api.favorite({}),error=>error.code==='PLACES_CONTRACT_PROVIDER_UNAVAILABLE'&&error.provider==='LuviaPlaceCommands');
  window.LuviaPlaceCommands=savedCommands;

  const savedFavoriteMethod=window.LuviaPlaceCommands.favorite;
  delete window.LuviaPlaceCommands.favorite;
  await assert.rejects(()=>api.favorite({}),error=>error.code==='PLACES_CONTRACT_PROVIDER_UNAVAILABLE'&&error.provider==='LuviaPlaceCommands.favorite');
  window.LuviaPlaceCommands.favorite=savedFavoriteMethod;

  const savedLifecycleMethod=window.LuviaPlaceCore.updateLifecycleCloud;
  delete window.LuviaPlaceCore.updateLifecycleCloud;
  await assert.rejects(()=>api.updateLifecycle('tp1','visited',{},{}),error=>error.code==='PLACES_CONTRACT_PROVIDER_UNAVAILABLE'&&error.provider==='LuviaPlaceCore.updateLifecycleCloud');
  window.LuviaPlaceCore.updateLifecycleCloud=savedLifecycleMethod;

  const savedVisitProvider=window.LuviaPresenceVisitCore;
  delete window.LuviaPresenceVisitCore;
  await assert.rejects(()=>api.confirmVisit('p1',{}),error=>error.code==='PLACES_CONTRACT_PROVIDER_UNAVAILABLE'&&error.provider==='LuviaPresenceVisitCore.confirmVisit');
  window.LuviaPresenceVisitCore=savedVisitProvider;

  const diag=api.diagnostics();
  assert.strictEqual(diag.ready,true);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(diag.providers)),{core:true,gateway:true,commands:true,visit:true,discovery:true,domainContractCore:true,deepLinkPort:true});

  console.log('M3.2 Places Contract Adapter: OK');
})().catch(error=>{console.error(error);process.exitCode=1});
