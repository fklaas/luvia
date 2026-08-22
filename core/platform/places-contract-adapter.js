(() => {
  'use strict';

  const CONTRACT_ID='places.v1';
  const VERSION='1';
  const RUNTIME_VERSION='1.0.0';
  const EVENT_PREFIX='luvia:';

  function unavailable(provider){
    const error=new Error(`Places Contract v1: ${provider} ist nicht verfügbar.`);
    error.code='PLACES_CONTRACT_PROVIDER_UNAVAILABLE';
    error.provider=provider;
    throw error;
  }
  function core(){const api=window.LuviaPlaceCore;if(!api)unavailable('LuviaPlaceCore');return api}
  function gateway(){const api=window.LuviaPlaces;if(!api?.details)unavailable('LuviaPlaces.details');return api}
  function commands(){const api=window.LuviaPlaceCommands;if(!api)unavailable('LuviaPlaceCommands');return api}
  function discovery(){const api=globalThis.LuviaPlacesDiscoveryService;if(!api)unavailable('LuviaPlacesDiscoveryService');return api}
  function domain(){const api=globalThis.LuviaPlacesDomainContractCoreV1;if(!api)unavailable('LuviaPlacesDomainContractCoreV1');return api}
  function platformPort(id){const api=globalThis.LuviaPlatformPorts?.get?.(id);if(!api)unavailable(id);return api}
  function coreCommand(name){const api=core(),fn=api?.[name];if(typeof fn!=='function')unavailable(`LuviaPlaceCore.${name}`);return fn.bind(api)}
  function command(name){const api=commands(),fn=api?.[name];if(typeof fn!=='function')unavailable(`LuviaPlaceCommands.${name}`);return fn.bind(api)}
  function visit(){const api=window.LuviaPresenceVisitCore;if(typeof api?.confirmVisit!=='function')unavailable('LuviaPresenceVisitCore.confirmVisit');return api}
  const clean=value=>value==null?null:String(value);
  const freezeArray=items=>Object.freeze(items);
  const number=value=>value==null||value===''?null:(Number.isFinite(Number(value))?Number(value):null);
  const placeProjection=input=>domain().projectPlace(input);
  const detailsProjection=input=>domain().projectDetails(input);

  function rowsFromSearch(response){
    if(Array.isArray(response))return response;
    if(Array.isArray(response?.places))return response.places;
    if(Array.isArray(response?.data?.places))return response.data.places;
    if(Array.isArray(response?.data))return response.data;
    return [];
  }
  async function search(options={}){
    const response=await core().search(options||{});
    const places=freezeArray(rowsFromSearch(response).map(placeProjection).filter(Boolean));
    return Object.freeze({places,count:places.length});
  }
  function getPlace(placeId){return placeProjection(core().getPlace?.(placeId)||null)}
  function listPlaces(filters={}){return freezeArray((core().getPlaces?.(filters||{})||[]).map(placeProjection).filter(Boolean))}
  async function getDetails(placeId,options={}){
    const response=await gateway().details(placeId,options||{});
    return detailsProjection(response?.data?.place||response?.data||response);
  }
  function getLifecycle(query){
    if(query&&typeof query==='object'){
      const record=globalThis.LuviaPlaceRuntime?.find?.(query);
      if(record)return clean(record.status||record.entity?.tripPlace?.lifecycle_status||record.entity?.tripPlace?.status)||null;
      return getPlace(query.placeId)?.lifecycle||null;
    }
    return getPlace(query)?.lifecycle||null;
  }
  async function listSaved(filters={}){return freezeArray((await discovery().listSaved(filters||{})).map(domain().projectSaved).filter(Boolean))}
  async function recommend(options={}){
    const response=await discovery().recommend(options||{});
    const places=freezeArray((response?.places||[]).map(detailsProjection).filter(Boolean));
    return Object.freeze({places,count:places.length,route:domain().routeDiscovery(options),plan:Object.freeze(response?.plan||{})});
  }
  function categories(){return domain().categories()}
  function routeDiscovery(options={}){return domain().routeDiscovery(options)}
  function createDeepLink(options={}){return domain().createDeepLink(options)}
  function openDiscovery(options={}){return platformPort('DeepLinkPort').open(createDeepLink(options))}

  async function importPlace(providerPlaceId,options={}){
    const response=await coreCommand('importProviderPlace')(providerPlaceId,options||{});
    const entity=response?.data?.entity||response?.data||response;
    const projected=placeProjection(entity?.place||entity);
    if(!projected)return null;
    const importedProviderPlaceId=clean(providerPlaceId)?.replace(/^places\//,'')||projected.providerPlaceId;
    const tripPlace=entity?.tripPlace||entity?.trip_place||{};
    return Object.freeze({...projected,providerPlaceId:importedProviderPlaceId,tripPlaceId:clean(tripPlace.id)||null,isFavorite:typeof tripPlace.is_favorite==='boolean'?tripPlace.is_favorite:null,lifecycle:clean(tripPlace.lifecycle_status||tripPlace.status||projected.lifecycle)});
  }
  function commandProjection(action,result,hints={}){
    const payload=result?.data?.entity||result?.data||result||{};
    const entity=payload?.entity&&typeof payload.entity==='object'?payload.entity:payload;
    const place=entity?.place||payload?.place||{};
    const tripPlace=entity?.tripPlace||entity?.trip_place||payload?.tripPlace||payload?.trip_place||{};
    const projectedPlace=placeProjection(place);
    const providerPlaceId=clean(hints.providerPlaceId||projectedPlace?.providerPlaceId||place.providerPlaceId||place.provider_place_id||place.sourceId||place.source_id)?.replace(/^places\//,'')||null;
    return Object.freeze({
      ok:result?.ok!==false,
      action,
      tripId:clean(hints.tripId||tripPlace.trip_id||projectedPlace?.tripId),
      placeId:clean(hints.placeId||projectedPlace?.id||tripPlace.place_id),
      tripPlaceId:clean(hints.tripPlaceId||tripPlace.id||payload?.tripPlaceId),
      providerPlaceId,
      primaryType:clean(hints.primaryType||hints.placeType||projectedPlace?.primaryType),
      lifecycle:clean(hints.lifecycle||tripPlace.lifecycle_status||tripPlace.status||projectedPlace?.lifecycle),
      isFavorite:typeof hints.isFavorite==='boolean'?hints.isFavorite:(typeof tripPlace.is_favorite==='boolean'?tripPlace.is_favorite:(typeof tripPlace.isFavorite==='boolean'?tripPlace.isFavorite:null))
    });
  }
  function visitProjection(input){
    if(!input||typeof input!=='object')return null;
    return Object.freeze({
      id:clean(input.id),
      tripId:clean(input.tripId||input.trip_id),
      placeId:clean(input.placeId||input.place_id),
      state:clean(input.state)||'visited',
      arrivedAt:clean(input.arrivedAt||input.arrived_at),
      leftAt:clean(input.leftAt||input.left_at),
      durationSeconds:number(input.durationSeconds??input.duration_seconds),
      detectionSource:clean(input.detectionSource||input.detection_source)||'manual',
      automatic:Boolean(input.isAutomatic??input.is_automatic),
      confirmed:Boolean(input.isConfirmed??input.is_confirmed)
    });
  }
  async function favorite(options={}){const result=await command('favorite')(options||{});return commandProjection('favorite',result,{...options,isFavorite:true})}
  async function unfavorite(options={}){const result=await command('unfavorite')(options||{});return commandProjection('unfavorite',result,{...options,isFavorite:false})}
  async function toggleFavorite(options={}){const result=await command('toggleFavorite')(options||{});return commandProjection('toggleFavorite',result,options||{})}
  async function clearFavorites(placeType,options={}){const result=await command('clearFavorites')(placeType,options||{});return commandProjection('clearFavorites',result,{...options,primaryType:placeType,isFavorite:false})}
  async function plan(options={}){const result=await command('plan')(options||{});return commandProjection('plan',result,options||{})}
  async function unplan(options={}){const result=await command('unplan')(options||{});return commandProjection('unplan',result,options||{})}
  async function updateLifecycle(tripPlaceId,value,patch={},options={}){const result=await coreCommand('updateLifecycleCloud')(tripPlaceId,value,patch||{},options||{});return commandProjection('updateLifecycle',result,{...options,tripPlaceId,lifecycle:value,isFavorite:typeof patch?.isFavorite==='boolean'?patch.isFavorite:undefined})}
  async function confirmVisit(placeId,patch={}){visit();return visitProjection(await coreCommand('recordVisit')(placeId,patch||{}))}

  function snapshot(){
    const places=listPlaces();
    return Object.freeze({contractId:CONTRACT_ID,version:VERSION,places,count:places.length});
  }
  function envelope(name,payload={},options={}){
    return Object.freeze({
      name,
      version:VERSION,
      source:'places',
      occurredAt:new Date().toISOString(),
      tripId:clean(options.tripId||payload.tripId),
      entityId:clean(options.entityId||payload.placeId||payload.tripPlaceId||payload.providerPlaceId),
      payload:Object.freeze({...payload}),
      meta:Object.freeze({correlationId:options.correlationId||null})
    });
  }
  function publish(name,payload={},options={}){
    const detail=envelope(name,payload,options);
    window.dispatchEvent(new CustomEvent(EVENT_PREFIX+name,{detail}));
    return detail;
  }
  function eventContext(event){
    const payload=event?.detail&&typeof event.detail==='object'?event.detail:{};
    const entity=payload.entity&&typeof payload.entity==='object'?payload.entity:{};
    const place=payload.place||entity.place||{};
    const tripPlace=payload.tripPlace||entity.tripPlace||entity.trip_place||{};
    const providerPlaceId=clean(payload.providerPlaceId||place.providerPlaceId||place.provider_place_id||place.sourceId||place.source_id)?.replace(/^places\//,'')||null;
    return Object.freeze({
      reason:event?.type||'changed',
      tripId:clean(payload.tripId||tripPlace.trip_id||place.tripId||place.trip_id),
      placeId:clean(payload.placeId||place.id||tripPlace.place_id),
      tripPlaceId:clean(payload.tripPlaceId||tripPlace.id),
      providerPlaceId,
      primaryType:clean(payload.placeType||payload.type||place.primaryType||place.primary_type),
      action:clean(payload.action),
      lifecycle:clean(payload.lifecycle||payload.state||place.lifecycle),
      isFavorite:typeof payload.isFavorite==='boolean'?payload.isFavorite:null,
      removed:payload.removed===true,
      automatic:typeof payload.automatic==='boolean'?payload.automatic:null,
      count:number(payload.count)
    });
  }
  function eventOptions(payload){return{tripId:payload.tripId,entityId:payload.placeId||payload.tripPlaceId||payload.providerPlaceId}}
  function bridgePlacesChanged(event){const payload=eventContext(event);publish('places.changed',payload,eventOptions(payload))}
  function bridgeLifecycleChanged(event){const payload=eventContext(event);publish('place.lifecycle.changed',payload,eventOptions(payload))}
  function bridgePlanChanged(event){const payload=eventContext(event);publish('place.plan.changed',payload,eventOptions(payload))}
  function bridgeFavoriteChanged(event){const payload=eventContext(event);publish('place.favorite.changed',payload,eventOptions(payload))}

  window.addEventListener('luvia:place-runtime-changed',bridgePlacesChanged);
  window.addEventListener('luvia:place-imported',bridgePlacesChanged);
  window.addEventListener('luvia:places-lifecycle-changed',bridgeLifecycleChanged);
  window.addEventListener('luvia:place-visit-changed',bridgeLifecycleChanged);
  window.addEventListener('luvia:place-plan-changed',bridgePlanChanged);
  window.addEventListener('luvia:place-favorite-changed',bridgeFavoriteChanged);

  const api=Object.freeze({
    contractId:CONTRACT_ID,
    version:VERSION,
    runtimeVersion:RUNTIME_VERSION,
    reads:Object.freeze({search,getPlace,listPlaces,getDetails,listSaved,recommend,getLifecycle,categories,routeDiscovery,createDeepLink}),
    commands:Object.freeze({importPlace,favorite,unfavorite,toggleFavorite,clearFavorites,plan,unplan,updateLifecycle,confirmVisit,openDiscovery}),
    events:Object.freeze(['places.changed','place.lifecycle.changed','place.plan.changed','place.favorite.changed']),
    search,getPlace,listPlaces,getDetails,listSaved,recommend,getLifecycle,categories,routeDiscovery,createDeepLink,
    importPlace,favorite,unfavorite,toggleFavorite,clearFavorites,plan,unplan,updateLifecycle,confirmVisit,openDiscovery,
    snapshot,
    diagnostics:()=>Object.freeze({
      contractId:CONTRACT_ID,
      version:VERSION,
      runtimeVersion:RUNTIME_VERSION,
      ready:Boolean(window.LuviaPlaceCore&&window.LuviaPlaces&&window.LuviaPlaceCommands&&globalThis.LuviaPlacesDiscoveryService&&window.LuviaPresenceVisitCore?.confirmVisit),
      providers:Object.freeze({
        core:Boolean(window.LuviaPlaceCore),
        gateway:Boolean(window.LuviaPlaces?.details),
        commands:Boolean(window.LuviaPlaceCommands),
        visit:Boolean(window.LuviaPresenceVisitCore?.confirmVisit),
        discovery:Boolean(globalThis.LuviaPlacesDiscoveryService),
        domainContractCore:Boolean(globalThis.LuviaPlacesDomainContractCoreV1),
        deepLinkPort:Boolean(globalThis.LuviaPlatformPorts?.has?.('DeepLinkPort'))
      }),
      nativeReady:Object.freeze({browserlessDomainSurface:true,deviceLocation:'injected-context',offlineCache:'platform-port',externalNavigation:'platform-port'})
    })
  });

  window.LuviaPlacesContractV1=api;
  window.LuviaPlacesContract=api;
  window.LuviaGlobalContracts?.register?.({
    id:CONTRACT_ID,
    version:VERSION,
    required:false,
    probe:()=>({available:Boolean(window.LuviaPlacesContractV1&&window.LuviaPlaceCore&&window.LuviaPlaces&&window.LuviaPlaceCommands&&globalThis.LuviaPlacesDiscoveryService&&window.LuviaPresenceVisitCore?.confirmVisit),detail:'Places v1 owner adapter'})
  });
})();
