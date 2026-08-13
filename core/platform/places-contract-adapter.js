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
  function coreCommand(name){const api=core(),fn=api?.[name];if(typeof fn!=='function')unavailable(`LuviaPlaceCore.${name}`);return fn.bind(api)}
  function command(name){const api=commands(),fn=api?.[name];if(typeof fn!=='function')unavailable(`LuviaPlaceCommands.${name}`);return fn.bind(api)}
  function visit(){const api=window.LuviaPresenceVisitCore;if(typeof api?.confirmVisit!=='function')unavailable('LuviaPresenceVisitCore.confirmVisit');return api}
  const clean=value=>value==null?null:String(value);
  const number=value=>value==null||value===''?null:(Number.isFinite(Number(value))?Number(value):null);
  const freezeArray=items=>Object.freeze(items);

  function coordinatesProjection(input){
    if(!input||typeof input!=='object')return null;
    const latitude=number(input.latitude??input.lat),longitude=number(input.longitude??input.lng);
    if(latitude==null&&longitude==null)return null;
    return Object.freeze({latitude,longitude});
  }

  function placeProjection(input){
    if(!input||typeof input!=='object')return null;
    const id=clean(input.id||input.placeId||input.place_id||input.providerPlaceId||input.provider_place_id);
    if(!id)return null;
    const coordinates=coordinatesProjection(input.coordinates||input.location||{latitude:input.latitude,longitude:input.longitude});
    return Object.freeze({
      id,
      tripId:clean(input.tripId||input.trip_id),
      providerPlaceId:clean(input.providerPlaceId||input.provider_place_id||input.sourceId||input.source_id||id)?.replace(/^places\//,''),
      primaryType:clean(input.primaryType||input.primary_type)||'custom',
      roles:freezeArray([...(input.roles||[])].map(String)),
      name:clean(input.name||input.displayName?.text||input.displayName)||'Unbenannter Ort',
      description:clean(input.description||input.editorialSummary?.text||input.editorialSummary)||'',
      coordinates,
      address:clean(input.address||input.formattedAddress||input.formatted_address)||'',
      lifecycle:clean(input.lifecycle||input.lifecycleStatus||input.lifecycle_status)||'discovered',
      capabilities:freezeArray([...(input.capabilities||[])].map(String)),
      bookingDomains:freezeArray([...(input.bookingDomains||[])].map(String)),
      createdAt:clean(input.createdAt||input.created_at),
      updatedAt:clean(input.updatedAt||input.updated_at)
    });
  }

  function detailsProjection(input){
    if(!input||typeof input!=='object')return null;
    const source=input.place||input;
    const base=placeProjection(source);
    const providerPlaceId=clean(source.providerPlaceId||source.provider_place_id||source.id||source.name)?.replace(/^places\//,'')||base?.providerPlaceId||null;
    return Object.freeze({
      ...(base||{}),
      providerPlaceId,
      name:base?.name||clean(source.displayName?.text||source.displayName||source.name)||'Unbenannter Ort',
      address:base?.address||clean(source.formattedAddress||source.formatted_address)||'',
      rating:number(source.rating),
      userRatingCount:number(source.userRatingCount||source.user_rating_count),
      priceLevel:clean(source.priceLevel||source.price_level),
      website:clean(source.websiteUri||source.website||source.website_uri),
      phone:clean(source.internationalPhoneNumber||source.nationalPhoneNumber||source.phone),
      mapsUrl:clean(source.googleMapsUri||source.mapsUrl||source.google_maps_uri),
      openNow:source.currentOpeningHours?.openNow??source.openNow??null,
      types:freezeArray([...(source.types||[])].map(String))
    });
  }

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
  function getLifecycle(placeId){return getPlace(placeId)?.lifecycle||null}

  async function importPlace(providerPlaceId,options={}){
    const response=await coreCommand('importProviderPlace')(providerPlaceId,options||{});
    const entity=response?.data?.entity||response?.data||response;
    const projected=placeProjection(entity?.place||entity);
    if(!projected)return null;
    const importedProviderPlaceId=clean(providerPlaceId)?.replace(/^places\//,'')||projected.providerPlaceId;
    return Object.freeze({...projected,providerPlaceId:importedProviderPlaceId});
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
    reads:Object.freeze({search,getPlace,listPlaces,getDetails,getLifecycle}),
    commands:Object.freeze({importPlace,favorite,unfavorite,toggleFavorite,clearFavorites,plan,unplan,updateLifecycle,confirmVisit}),
    events:Object.freeze(['places.changed','place.lifecycle.changed','place.plan.changed','place.favorite.changed']),
    search,getPlace,listPlaces,getDetails,getLifecycle,
    importPlace,favorite,unfavorite,toggleFavorite,clearFavorites,plan,unplan,updateLifecycle,confirmVisit,
    snapshot,
    diagnostics:()=>Object.freeze({
      contractId:CONTRACT_ID,
      version:VERSION,
      runtimeVersion:RUNTIME_VERSION,
      ready:Boolean(window.LuviaPlaceCore&&window.LuviaPlaces&&window.LuviaPlaceCommands&&window.LuviaPresenceVisitCore?.confirmVisit),
      providers:Object.freeze({
        core:Boolean(window.LuviaPlaceCore),
        gateway:Boolean(window.LuviaPlaces?.details),
        commands:Boolean(window.LuviaPlaceCommands),
        visit:Boolean(window.LuviaPresenceVisitCore?.confirmVisit)
      })
    })
  });

  window.LuviaPlacesContractV1=api;
  window.LuviaPlacesContract=api;
  window.LuviaGlobalContracts?.register?.({
    id:CONTRACT_ID,
    version:VERSION,
    required:false,
    probe:()=>({available:Boolean(window.LuviaPlacesContractV1&&window.LuviaPlaceCore&&window.LuviaPlaces&&window.LuviaPlaceCommands&&window.LuviaPresenceVisitCore?.confirmVisit),detail:'Places v1 owner adapter'})
  });
})();
