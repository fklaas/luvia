(() => {
  'use strict';

  const CONTRACT_ID='places.v1';
  const VERSION='1';
  const RUNTIME_VERSION='1.5.0-live-viewport';
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
  function presenceCommand(name){const api=visit(),fn=api?.[name];if(typeof fn!=='function')unavailable(`LuviaPresenceVisitCore.${name}`);return fn.bind(api)}
  const clean=value=>value==null?null:String(value);
  const httpsUrl=value=>{const url=clean(value)?.trim()||'';return /^https:\/\//i.test(url)?url:null};

  // Session-scoped Google Premium details cost guard.
  // At most 1 Google Premium details request per providerPlaceId per session.
  // Returns true on the FIRST call for a given id; false on all subsequent calls.
  const _premiumDetailsUsed=new Set();
  function consumePremiumDetailsQuota(id){
    if(!id||_premiumDetailsUsed.has(id))return false;
    _premiumDetailsUsed.add(id);
    return true;
  }
  const usablePhoto=photo=>Boolean(photo&&(httpsUrl(photo.uri||photo.url||photo.photoUri)||clean(photo.name)));
  function photoProvider(source={},photo={}){
    const signature=`${photo?.name||''} ${photo?.uri||photo?.url||''} ${source?.provider||''} ${source?.source||''}`.toLowerCase();
    if(/foursquare|4sqi|fsq:/.test(signature))return'Foursquare';
    if(/wikimedia/.test(signature))return'Wikimedia Commons';
    if(/geoapify/.test(signature))return'Geoapify';
    if(/google|places\/.+\/photos\//.test(signature))return'Google Maps';
    if(String(source?.provider||'').toLowerCase()==='multi')return'Mehrere Places-Provider';
    return'Places Provider';
  }
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
  const walkingRoutes=new Map();
  async function getRoute(origin,destination){
    const coordinate=p=>{const lat=p?.latitude??p?.lat,lng=p?.longitude??p?.lng;if(lat==null||lng==null||!Number.isFinite(Number(lat))||!Number.isFinite(Number(lng))||Math.abs(Number(lat))>90||Math.abs(Number(lng))>180)throw new TypeError('Ungültige Routenkoordinaten.');return{latitude:Number(lat),longitude:Number(lng)}};
    const a=coordinate(origin),b=coordinate(destination),id=JSON.stringify([a,b]),cached=walkingRoutes.get(id);
    if(cached&&cached.expires>Date.now())return cached.promise;
    const promise=Promise.resolve().then(()=>gateway().route(a,b,{provider:'geoapify',modes:['WALK']})).then(response=>{
      const route=(response?.data?.routes||response?.routes)?.walk?.[0];
      if(route?.verified!==true||route?.provider!=='geoapify'||!route.geometry||!Number.isFinite(route.durationMinutes))throw new Error('Fußweg derzeit nicht verfügbar.');
      return Object.freeze({...route,observedAt:response?.data?.generatedAt||new Date().toISOString()});
    }).catch(error=>{walkingRoutes.delete(id);throw error});
    if(walkingRoutes.size>=128)walkingRoutes.delete(walkingRoutes.keys().next().value);
    walkingRoutes.set(id,{expires:Date.now()+30*60*1000,promise});return promise;
  }
  async function search(options={}){
    const response=await core().search(options||{});
    const places=freezeArray(rowsFromSearch(response).map(placeProjection).filter(Boolean));
    return Object.freeze({places,count:places.length});
  }
  function getPlace(placeId){return placeProjection(core().getPlace?.(placeId)||null)}
  function listPlaces(filters={}){return freezeArray((core().getPlaces?.(filters||{})||[]).map(placeProjection).filter(Boolean))}
  async function getDetails(placeId,options={}){
    // Validate gateway availability first so unavailability errors are never swallowed.
    const gw=gateway();
    const id=clean(placeId)?.replace(/^places\//,'');
    // Google Premium details are on-demand only. Gate to 1 request per id per session.
    const isPremiumId=id&&!id.startsWith('fsq:')&&!id.startsWith('geoapify:');
    if(isPremiumId&&!consumePremiumDetailsQuota(id)){
      // Quota exhausted for this id this session; skip the Premium call.
      return null;
    }
    const response=await gw.details(placeId,options||{});
    return detailsProjection(response?.data?.place||response?.data||response);
  }
  const viewportCache=new Map(),viewportPending=new Map(),VIEWPORT_TTL=15*60*1000;
  const containsBounds=(outer,inner)=>outer.south<=inner.south&&outer.west<=inner.west&&outer.north>=inner.north&&outer.east>=inner.east;
  async function searchViewport(options={}){
    const providers=options.providers||['geoapify'];
    if(!providers.every(value=>String(value).toLowerCase()==='geoapify'))return requestViewport(options);
    const {bounds,center,radiusMeters,requestOptions,...filters}=options;
    if(!bounds||!center)return requestViewport(options);
    const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])])):value;
    const signature=JSON.stringify(stable(filters)),key=signature+JSON.stringify(bounds),now=Date.now();
    for(const [id,entry] of viewportCache){
      if(now-entry.at>VIEWPORT_TTL){viewportCache.delete(id);continue}
      if(entry.signature!==signature||!(id===key||(entry.complete&&containsBounds(entry.result.viewport.bounds,bounds))))continue;
      const places=freezeArray(entry.result.places.filter(place=>{const c=place.coordinates||place.location||{},lat=Number(c.latitude??c.lat),lng=Number(c.longitude??c.lng);return lat>=bounds.south&&lat<=bounds.north&&lng>=bounds.west&&lng<=bounds.east}));
      return Object.freeze({...entry.result,places,count:places.length,viewport:Object.freeze({bounds:Object.freeze({...bounds}),center:Object.freeze({...center})}),tiles:Object.freeze({...entry.result.tiles,requested:0,fulfilled:0}),cache:Object.freeze({hit:true,ageMs:now-entry.at})});
    }
    if(viewportPending.has(key))return viewportPending.get(key);
    const pending=requestViewport(options).then(result=>{
      // A full page is potentially truncated; it cannot prove coverage of a
      // different rectangle. Exact repeated reads may still reuse that page.
      const complete=result.tiles.complete===true;
      viewportCache.set(key,{signature,result,complete,at:Date.now()});
      while(viewportCache.size>32)viewportCache.delete(viewportCache.keys().next().value);
      return result;
    }).finally(()=>viewportPending.delete(key));
    viewportPending.set(key,pending);return pending;
  }
  async function requestViewport(options={}){
    const bounds=options.bounds||{},center=options.center||{};
    if(![bounds.south,bounds.west,bounds.north,bounds.east,center.latitude,center.longitude].every(value=>Number.isFinite(Number(value))))throw new Error('PLACES_VIEWPORT_REQUIRED');
    const viewport={south:Number(bounds.south),west:Number(bounds.west),north:Number(bounds.north),east:Number(bounds.east)},midLatitude=(viewport.south+viewport.north)/2,midLongitude=(viewport.west+viewport.east)/2;
    const requestedProviders=(Array.isArray(options.providers)?options.providers:['geoapify']).map(value=>String(value||'').toLowerCase()).filter(Boolean);
    const geoapifyOnly=!requestedProviders.length||requestedProviders.every(name=>name==='geoapify'||name.startsWith('geoapify'));
    // Geoapify accepts one rectangle filter efficiently. Google/Foursquare keep the
    // established four-tile fan-out for viewport coverage.
    const tiles=geoapifyOnly?[viewport]:[
      {south:midLatitude,west:viewport.west,north:viewport.north,east:midLongitude},
      {south:midLatitude,west:midLongitude,north:viewport.north,east:viewport.east},
      {south:viewport.south,west:viewport.west,north:midLatitude,east:midLongitude},
      {south:viewport.south,west:midLongitude,north:midLatitude,east:viewport.east}
    ],providerPageSize=Math.min(geoapifyOnly?50:20,Math.max(1,Number(options.maxResultCount)||(geoapifyOnly?50:20))),viewportLimit=Math.min(80,Math.max(providerPageSize,Number(options.maxViewportResults)||80));
    const requestTile=async tile=>{const tileCenter={latitude:(tile.south+tile.north)/2,longitude:(tile.west+tile.east)/2},destination={name:'Sichtbarer Kartenausschnitt',location:tileCenter,viewport:tile,searchRadiusMeters:Math.max(250,Math.min(50000,Number(options.radiusMeters)||5000))/2,canonicalCity:{name:'Sichtbarer Kartenausschnitt',center:{lat:tileCenter.latitude,lng:tileCenter.longitude},viewport:tile}},response=await gateway().textSearch(String(options.query||'Orte'),{...options,providers:requestedProviders.length?requestedProviders:['geoapify'],destination,locationRestriction:{rectangle:{low:{latitude:tile.south,longitude:tile.west},high:{latitude:tile.north,longitude:tile.east}}},strictDestination:true,maxResultCount:providerPageSize});return{response,places:rowsFromSearch(response).map(detailsProjection).filter(Boolean)}};
    const settled=await Promise.allSettled(tiles.map(requestTile)),successful=settled.filter(result=>result.status==='fulfilled');
    if(!successful.length)throw settled.find(result=>result.status==='rejected')?.reason||new Error('PLACES_VIEWPORT_UNAVAILABLE');
    const byId=new Map();for(const result of successful)for(const place of result.value.places){const id=clean(place?.providerPlaceId||place?.id)?.replace(/^places\//,'');const point=place?.coordinates||place?.location||{};if(!id||!Number.isFinite(Number(point.latitude??point.lat))||!Number.isFinite(Number(point.longitude??point.lng))||Number(point.latitude??point.lat)<viewport.south||Number(point.latitude??point.lat)>viewport.north||Number(point.longitude??point.lng)<viewport.west||Number(point.longitude??point.lng)>viewport.east)continue;if(!byId.has(id))byId.set(id,place)}
    const places=freezeArray([...byId.values()].slice(0,viewportLimit)),providerDiagnostics=freezeArray(successful.map(result=>Object.freeze(result.value.response?.data?.providers||{})));
    return Object.freeze({places,count:places.length,viewport:Object.freeze({bounds:Object.freeze(viewport),center:Object.freeze({latitude:Number(center.latitude),longitude:Number(center.longitude)})}),tiles:Object.freeze({requested:tiles.length,fulfilled:successful.length,providerPageSize,maximumUniqueResults:viewportLimit,complete:successful.length===tiles.length&&successful.every(result=>result.value.places.length<providerPageSize),strategy:geoapifyOnly?'single-rectangle-geoapify':'four-tile-legacy'}),providerDiagnostics});
  }
  async function suggestDestinations(query,options={}){
    const api=gateway();
    if(typeof api.autocomplete!=='function')unavailable('LuviaPlaces.autocomplete');
    const response=await api.autocomplete(String(query||'').trim(),{...options,includedType:'(cities)'});
    const rows=response?.data?.suggestions||response?.suggestions||[];
    const suggestions=freezeArray(rows.map(item=>Object.freeze({
      placeId:clean(item?.placeId||item?.providerPlaceId||item?.id),
      text:clean(item?.text||item?.formattedAddress||item?.description||item?.name)
    })).filter(item=>item.placeId&&item.text));
    return Object.freeze({owner:'places',contractId:CONTRACT_ID,sessionToken:clean(response?.data?.sessionToken||response?.sessionToken),suggestions});
  }
  async function getDestination(placeId,options={}){
    const response=await gateway().details(placeId,options||{}),source=response?.data?.place||response?.data||response||{},projected=detailsProjection(source)||{};
    const components=source.addressComponents||source.raw?.addressComponents||[];
    const country=components.find(item=>(item?.types||[]).includes('country'));
    const locality=components.find(item=>(item?.types||[]).some(type=>['locality','postal_town','administrative_area_level_1'].includes(type)));
    const address=clean(projected.address||source.formattedAddress||source.formatted_address)||'';
    const coordinates=projected.coordinates||source.location||source.coordinates||{};
    return Object.freeze({
      owner:'places',contractId:CONTRACT_ID,placeId:clean(projected.providerPlaceId||placeId),
      name:clean(locality?.longText||projected.name||String(address).split(',')[0])||'Reiseziel',formattedAddress:address,
      country:clean(source.country||country?.longText||String(address).split(',').at(-1)?.trim())||'',
      countryCode:String(source.countryCode||country?.shortText||'').toUpperCase(),
      latitude:number(coordinates.latitude),longitude:number(coordinates.longitude)
    });
  }
  const cardReads=new Map();
  async function getCard(placeId,options={}){
    const id=clean(placeId)?.replace(/^places\//,'');
    const seed=options.source||options.place;
    if(!id?.startsWith('geoapify:')||clean(seed?.providerPlaceId||seed?.id)?.replace(/^places\//,'')!==id)return readCard(placeId,options);
    const existing=cardReads.get(id);if(existing&&Date.now()-existing.at<existing.ttl)return existing.promise;
    const entry={at:Date.now(),ttl:30*60_000,promise:null};
    const promise=readCard(placeId,options).then(result=>{if(!result?.image?.url)entry.ttl=2*60_000;return result}).catch(error=>{cardReads.delete(id);throw error});
    entry.promise=promise;cardReads.set(id,entry);while(cardReads.size>64)cardReads.delete(cardReads.keys().next().value);
    return promise;
  }
  async function readCard(placeId,options={}){
    const seeded=options?.source||options?.place||null,seedId=clean(seeded?.providerPlaceId||seeded?.id)?.replace(/^places\//,''),requestedId=clean(placeId)?.replace(/^places\//,'');
    const {source:_source,place:_place,...detailOptions}=options||{},seedMatches=Boolean(seeded&&seedId===requestedId),seedHasPhoto=Array.isArray(seeded?.photos)&&seeded.photos.some(usablePhoto);
    if(requestedId.startsWith('geoapify:')&&!seedMatches)return Object.freeze({place:null,image:null});
    let response=null;
    // Apply Google Premium cost guard: block repeat enrichment when we already have full data.
    // Exception: if the seed has no photos, always allow the gateway call for media hydration.
    const isPremiumId=requestedId&&!requestedId.startsWith('fsq:')&&!requestedId.startsWith('geoapify:');
    const premiumAllowed=!isPremiumId||!seedHasPhoto||consumePremiumDetailsQuota(requestedId);
    if((!seedMatches||!seedHasPhoto)&&premiumAllowed){
      try{response=await gateway().details(placeId,{...detailOptions,enrichMedia:true})}catch(error){if(!seedMatches)throw error}
      // Mark premium id as consumed after a successful gateway call.
      if(isPremiumId&&response)consumePremiumDetailsQuota(requestedId);
    }
    const detailed=response?.data?.place||null;
    const source=detailed&&typeof detailed==='object'
      ?{...(seeded||{}),...detailed,name:detailed.name||seeded?.name,displayName:detailed.displayName||seeded?.displayName,formattedAddress:detailed.formattedAddress||seeded?.formattedAddress,photos:Array.isArray(detailed.photos)&&detailed.photos.length?detailed.photos:(seeded?.photos||[])}
      :seeded;
    const place=detailsProjection(source);
    if(!place)return Object.freeze({place:null,image:null});
    const photo=Array.isArray(source?.photos)?source.photos[0]:null;
    const author=photo?.authorAttributions?.[0]||{};
    const provider=photoProvider(source,photo),providerSource=httpsUrl(photo?.sourceUrl||photo?.googleMapsUri||source?.mapsUrl||source?.googleMapsUri);
    let url=httpsUrl(photo?.uri||photo?.url||photo?.photoUri),attribution=clean(photo?.attribution||author.displayName);
    if(!url&&photo?.name&&typeof gateway().photo==='function'){
      try{
        const resolved=await gateway().photo(photo.name,{maxWidthPx:Number(options.maxWidthPx||960),maxHeightPx:Number(options.maxHeightPx||720)});
        url=httpsUrl(resolved?.data?.photoUri||resolved?.photoUri);
      }catch{}
    }
    const image=url?Object.freeze({
      url,
      attribution:attribution||provider,
      attributionUrl:httpsUrl(photo?.attributionUrl||author.uri),
      sourceUrl:providerSource,
      provider,
      transient:true,
      alt:place.name
    }):null;
    return Object.freeze({place,image});
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
  function recommendationProjection(input={}){
    const reasons=[...(input.preferenceReasons||[])].map(String).filter(Boolean),warnings=[...(input.preferenceWarnings||[])].map(String).filter(Boolean);
    if(!reasons.length&&!warnings.length&&!input.preferenceResolutionVersion)return null;
    return Object.freeze({owner:'intelligence',kind:'trip-preference-ranking',version:clean(input.preferenceResolutionVersion)||null,scoreDelta:Number(input.preferenceScoreDelta||0),score:Number(input.preferenceScore||0),constraintState:clean(input.preferenceConstraintState)||'verify',matchedSignals:freezeArray([...(input.preferenceMatchedSignals||[])].map(String)),reasons:freezeArray(reasons),warnings:freezeArray(warnings)});
  }
  async function recommend(options={}){
    const response=await discovery().recommend(options||{});
    const places=freezeArray((response?.places||[]).map(source=>{const projected=detailsProjection(source);return projected?Object.freeze({...projected,recommendation:recommendationProjection(source)}):null}).filter(Boolean));
    return Object.freeze({places,count:places.length,route:domain().routeDiscovery(options),plan:Object.freeze(response?.plan||{}),aiMeta:response?.aiMeta?Object.freeze(response.aiMeta):null,preferenceResolution:response?.preferenceResolution?Object.freeze(response.preferenceResolution):null,preferenceMeta:response?.preferenceMeta?Object.freeze(response.preferenceMeta):null,diversityMeta:response?.diversityMeta?Object.freeze(response.diversityMeta):null,providerDiagnostics:response?.providerDiagnostics?Object.freeze(response.providerDiagnostics):null});
  }
  function categories(){return domain().categories()}
  function routeDiscovery(options={}){return domain().routeDiscovery(options)}
  function createDeepLink(options={}){return domain().createDeepLink(options)}
  function openDiscovery(options={}){return platformPort('DeepLinkPort').open(createDeepLink(options))}
  function selectView(input={}){
    const view=String(typeof input==='string'?input:input.view||'').toLowerCase();
    if(!['map','list'].includes(view))throw new Error('PLACES_VIEW_INVALID');
    return Object.freeze({view,stateChanging:false});
  }
  function openWebsite(input={}){
    if(input.userGesture!==true)throw new Error('PLACES_USER_GESTURE_REQUIRED');
    const url=httpsUrl(input.url||input.website||input.place?.website||input.place?.websiteUri);
    if(!url)throw new Error('PLACES_WEBSITE_REQUIRED');
    return Object.freeze({opened:Boolean(platformPort('ExternalNavigationPort').open(url)),url,providerPlaceId:clean(input.providerPlaceId||input.place?.providerPlaceId)});
  }
  function openPhone(input={}){
    const api=globalThis.LuviaPlatformActionContractV1;if(!api?.commands?.openTelephone)unavailable('LuviaPlatformActionContractV1.commands.openTelephone');
    return api.commands.openTelephone({phone:input.phone||input.place?.phone||input.place?.internationalPhoneNumber,userGesture:input.userGesture});
  }
  function openMaps(input={}){
    if(input.userGesture!==true)throw new Error('PLACES_USER_GESTURE_REQUIRED');
    const place=input.place||{},coordinates=input.coordinates||place.coordinates||place.location||{};
    const opened=platformPort('ExternalNavigationPort').openMaps({latitude:number(input.latitude??coordinates.latitude),longitude:number(input.longitude??coordinates.longitude),label:clean(input.label||place.name||place.address),providerPlaceId:clean(input.providerPlaceId||place.providerPlaceId)});
    return Object.freeze({opened:Boolean(opened),providerPlaceId:clean(input.providerPlaceId||place.providerPlaceId)});
  }

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
  async function rejectVisit(visitId,reason){return visitProjection(await presenceCommand('rejectVisit')(clean(visitId),clean(reason)||'Nicht als Besuch übernehmen'))}
  async function setLocationEnabled(value){return Object.freeze({enabled:Boolean(value),diagnostics:Object.freeze(await presenceCommand('setGlobalEnabled')(Boolean(value)))})}
  async function refreshLocation(){return Object.freeze(await presenceCommand('refreshLocation')())}
  function pendingVisits(){return freezeArray((visit().pendingVisits?.()||[]).map(visitProjection).filter(Boolean))}

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
    reads:Object.freeze({search,searchViewport,getRoute,getPlace,listPlaces,getDetails,getCard,suggestDestinations,getDestination,listSaved,recommend,getLifecycle,categories,routeDiscovery,createDeepLink,pendingVisits}),
    composition:Object.freeze({selectView}),
    commands:Object.freeze({importPlace,favorite,unfavorite,toggleFavorite,clearFavorites,plan,unplan,updateLifecycle,confirmVisit,rejectVisit,setLocationEnabled,refreshLocation,openDiscovery,openWebsite,openPhone,openMaps}),
    events:Object.freeze(['places.changed','place.lifecycle.changed','place.plan.changed','place.favorite.changed']),
    search,searchViewport,getRoute,getPlace,listPlaces,getDetails,getCard,suggestDestinations,getDestination,listSaved,recommend,getLifecycle,categories,routeDiscovery,createDeepLink,pendingVisits,
    selectView,importPlace,favorite,unfavorite,toggleFavorite,clearFavorites,plan,unplan,updateLifecycle,confirmVisit,rejectVisit,setLocationEnabled,refreshLocation,openDiscovery,openWebsite,openPhone,openMaps,
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
      nativeReady:Object.freeze({browserlessDomainSurface:true,deviceLocation:'injected-context',offlineCache:'platform-port',externalNavigation:'platform-port',cardMedia:'owner-adapter-projection'})
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
