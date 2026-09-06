(function(){
'use strict';
const VERSION='4.18.7-destination-read';
const listeners=new Set();
const state={initialized:false,requests:0,successes:0,failures:0,cacheHits:0,lastRequestAt:null,lastSuccessAt:null,lastError:null,lastResult:null,recent:[]};
const now=()=>new Date().toISOString();
const clean=v=>String(v??'').trim();
const num=(v,fallback=null)=>Number.isFinite(Number(v))?Number(v):fallback;
function emit(type,detail){const event={type,at:now(),detail};listeners.forEach(fn=>{try{fn(event);}catch{}});window.LuviaKernelEvents?.emit?.(`places.${type}`,detail);}
function remember(entry){state.recent.unshift(entry);state.recent=state.recent.slice(0,20);}
function activeDestination(){return window.LuviaDestination?.getActive?.()||null;}
function finiteGeography(value){
  if(!value||typeof value!=='object')return false;
  const source=value.center||value.location||value.coordinates||{};
  const latitude=Number(source.latitude??source.lat??value.destinationLat??value.latitude);
  const longitude=Number(source.longitude??source.lng??value.destinationLng??value.longitude);
  if(Number.isFinite(latitude)&&Number.isFinite(longitude))return true;
  const viewport=value.viewport;
  return Boolean(viewport&&[viewport.south,viewport.west,viewport.north,viewport.east].every(item=>Number.isFinite(Number(item))));
}
function destinationContext(destination){const d=destination||activeDestination();if(!d)return null;const center=d.center||d.location||d.coordinates||null;const latitude=Number(center?.latitude??center?.lat??d.destinationLat??d.latitude),longitude=Number(center?.longitude??center?.lng??d.destinationLng??d.longitude);const location=Number.isFinite(latitude)&&Number.isFinite(longitude)?{latitude,longitude}:null;const name=clean(d.name||d.displayName||'');const country=clean(d.country||'');const displayName=[name,country&&country.toLowerCase()!==name.toLowerCase()?country:''].filter(Boolean).join(', ');return{id:d.id||null,name,displayName,country,countryCode:d.countryCode||d.country?.code||'',placeId:d.placeId||null,primaryType:d.primaryType||d.rawType||'',canonicalCity:d.canonicalCity||{name,placeId:d.placeId||null,center:location||center||null,viewport:d.viewport||null,country,countryCode:d.countryCode||''},landmarkContext:d.landmarkContext||null,location,viewport:d.viewport||null,searchRadiusMeters:num(d.searchRadiusMeters,20000),radiusSource:d.radiusSource||'default',timezone:d.timezone||'',timezoneName:d.timezoneName||'',timezoneStatus:d.timezoneStatus||'',timezoneError:d.timezoneError||'',languageCodes:Array.isArray(d.languageCodes)?[...d.languageCodes]:[],currency:d.currency||'',locale:d.locale||'',flagEmoji:d.flagEmoji||'',provider:d.provider||d.source||null,isResolved:Boolean(d.isResolved||location)};}
const PROVIDER_NAMES=new Set(['auto','google','google-places','foursquare','multi','geoapify','openstreetmap','tomtom','here']);
const providerName=value=>{const name=clean(value).toLowerCase();return PROVIDER_NAMES.has(name)?name:(name.startsWith('google')?'google-places':name.startsWith('foursquare')?'foursquare':name.startsWith('geoapify')?'geoapify':name.startsWith('openstreetmap')?'openstreetmap':'unknown')};
const typeToken=value=>clean(value).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'');
function providerTypeTokens(values=[]){
  const result=new Set();
  for(const value of values){
    const token=typeToken(value);if(!token)continue;result.add(token);
    for(const [pattern,canonical] of [
      [/restaurant|trattoria|pizzeria|bistro|diner|food/, 'restaurant'],[/cafe|coffee|tea_room/, 'cafe'],[/bakery/, 'bakery'],[/bar|pub/, 'bar'],
      [/mini.*golf/, 'amusement_center'],[/bowling/, 'bowling_alley'],[/escape_room/, 'escape_room'],[/amusement|theme_park/, 'amusement_park'],[/aquarium/, 'aquarium'],[/zoo/, 'zoo'],
      [/museum/, 'museum'],[/gallery/, 'art_gallery'],[/theat|performing_arts/, 'performing_arts_theater'],[/cinema|movie/, 'movie_theater'],[/concert/, 'concert_hall'],
      [/historic|landmark|monument|attraction/, 'tourist_attraction'],[/park|garden/, 'park'],[/beach/, 'beach'],[/trail|hiking/, 'hiking_area'],[/spa/, 'spa'],[/swimming|pool/, 'swimming_pool'],
      [/hotel|hostel|lodging|motel|resort|guest_house|bed_and_breakfast/, 'lodging'],[/shopping.*mall|mall/, 'shopping_mall'],[/market/, 'market'],[/store|shop|boutique/, 'store'],[/night.*club/, 'night_club']
    ])if(pattern.test(token))result.add(canonical);
  }
  return[...result].slice(0,50);
}
function normalizeProviderPlace(place={}){
  const nativeTypes=[...(Array.isArray(place.types)?place.types:[]),place.primaryType,place.primaryTypeLabel].map(clean).filter(Boolean),provider=providerName(place.provider||place.source),types=provider==='geoapify'?[...new Set(nativeTypes.map(typeToken).filter(Boolean))]:providerTypeTokens(nativeTypes);
  return{...place,provider,providerNativeTypes:[...new Set(nativeTypes)].slice(0,50),types,primaryType:typeToken(place.primaryType)||types[0]||'',providerRefs:place.providerRefs&&typeof place.providerRefs==='object'?place.providerRefs:{}};
}
function normalizeSpatialConstraints(value){if(!value||typeof value!=='object')return null;const tokens=list=>[...new Set((Array.isArray(list)?list:[]).map(typeToken).filter(Boolean))].slice(0,8);return{explicit:value.explicit===true,prefer:tokens(value.prefer),avoid:tokens(value.avoid),source:clean(value.source).slice(0,120)||null,verifiedBy:clean(value.verifiedBy).slice(0,80)||null};}
function normalizePositionContext(value){
  if(!value||typeof value!=='object'||(value.providerShareApproved!==true&&value.shareWithProvider!==true))return null;
  const coordinates=value.coordinates||value.location||value,latitude=num(coordinates.latitude??coordinates.lat),longitude=num(coordinates.longitude??coordinates.lng);
  if(!Number.isFinite(latitude)||!Number.isFinite(longitude)||latitude < -90||latitude > 90||longitude < -180||longitude > 180)return null;
  return{purpose:clean(value.purpose).slice(0,80)||'places-ranking',precision:value.precision==='precise'?'precise':'coarse',coordinates:{latitude,longitude},expiresAt:clean(value.expiresAt).slice(0,40)||null,providerShareApproved:true};
}
function normalizeProviderMeta(value={},places=[]){
  const requested=[...new Set((Array.isArray(value.requested)?value.requested:[]).map(providerName).filter(name=>name!=='unknown'))].slice(0,6),attempted=[...new Set((Array.isArray(value.attempted)?value.attempted:[]).map(providerName).filter(name=>name!=='unknown'))].slice(0,6),answered=[...new Set((Array.isArray(value.answered)?value.answered:[]).map(providerName).filter(name=>name!=='unknown'))].slice(0,6),used=[...new Set((Array.isArray(value.used)?value.used:places.flatMap(place=>Object.keys(place.providerRefs||{}))).map(providerName).filter(name=>name!=='unknown'))].slice(0,6),errors=(Array.isArray(value.errors)?value.errors:[]).slice(0,4).map(error=>({provider:providerName(error?.provider),code:clean(error?.code||'PROVIDER_ERROR').slice(0,80)}));
  const status=places.length?(errors.length?'partial':'ready'):(answered.length?'empty':errors.length?'unavailable':'empty');
  return{requested,attempted,answered,used,errors,status,degraded:errors.length>0,authoritative:false};
}
function normalizeGatewayResponse(action,response){
  if(action!=='places.text-search'||!response?.data||!Array.isArray(response.data.places))return response;
  const places=response.data.places.map(normalizeProviderPlace),providers=normalizeProviderMeta(response.data.providers||{},places),normalized={...response,data:{...response.data,places,providers}};
  if(!places.length&&providers.status==='unavailable'){const error=Object.assign(new Error('Mindestens ein Places-Provider ist derzeit nicht erreichbar und es liegt kein belastbarer Treffer vor.'),{code:'PLACES_PROVIDER_READ_UNAVAILABLE',status:503,providerDiagnostics:providers});throw error}
  return normalized;
}
function normalizeOptions(options={}){const providers=[...new Set((Array.isArray(options.providers)?options.providers:['auto']).map(providerName).filter(name=>['auto','google','google-places','foursquare','geoapify','openstreetmap','tomtom','here'].includes(name)).map(name=>name==='google-places'?'google':name))].slice(0,6);return{languageCode:clean(options.languageCode||document.documentElement.lang||'de').slice(0,10)||'de',regionCode:clean(options.regionCode||'DE').toUpperCase().slice(0,2),maxResultCount:Math.max(1,Math.min(50,num(options.maxResultCount,10))),includedType:clean(options.includedType||''),includedTypes:Array.isArray(options.includedTypes)?options.includedTypes.map(clean).filter(Boolean).slice(0,50):[],excludedTypes:Array.isArray(options.excludedTypes)?options.excludedTypes.map(clean).filter(Boolean).slice(0,50):[],includedPrimaryTypes:Array.isArray(options.includedPrimaryTypes)?options.includedPrimaryTypes.map(clean).filter(Boolean).slice(0,50):[],excludedPrimaryTypes:Array.isArray(options.excludedPrimaryTypes)?options.excludedPrimaryTypes.map(clean).filter(Boolean).slice(0,50):[],strictTypeFiltering:options.strictTypeFiltering===true,openNow:options.openNow===true,minRating:num(options.minRating,null),priceLevels:Array.isArray(options.priceLevels)?options.priceLevels.slice(0,5):[],locationBias:options.locationBias||null,locationRestriction:options.locationRestriction||null,rankPreference:clean(options.rankPreference||''),sessionToken:clean(options.sessionToken||''),minUserRatingCount:Math.max(0,num(options.minUserRatingCount,0)),vegetarianOnly:options.vegetarianOnly===true,accessibleOnly:options.accessibleOnly===true,reservableOnly:options.reservableOnly===true,userQuery:options.userQuery===undefined?undefined:clean(options.userQuery).slice(0,200),strictPlaceType:clean(options.strictPlaceType),maxDistanceMeters:Math.max(0,num(options.maxDistanceMeters,0)),sortBy:clean(options.sortBy||'relevance'),landmarkContext:options.landmarkContext||null,strictDestination:options.strictDestination!==false,forceRefresh:options.forceRefresh===true,providers:providers.length?providers:['auto'],category:clean(options.category||options.type||''),type:clean(options.type||options.category||''),profileContext:options.profileContext||null,intentContext:options.intentContext||null,spatialConstraints:normalizeSpatialConstraints(options.spatialConstraints),positionContext:normalizePositionContext(options.positionContext)};}
async function call(action,payload={},requestOptions={}){if(!window.LuviaBackend)throw Object.assign(new Error('LuviaBackend API fehlt.'),{code:'BACKEND_UNAVAILABLE'});const started=performance.now();state.requests++;state.lastRequestAt=now();emit('request.started',{action});try{const response=normalizeGatewayResponse(action,await window.LuviaBackend.request(action,payload,requestOptions));const durationMs=Math.round((performance.now()-started)*100)/100;state.successes++;state.lastSuccessAt=now();state.lastError=null;state.lastResult=response?.data||null;if(response?.meta?.cache?.hit)state.cacheHits++;remember({action,ok:true,durationMs,cacheHit:Boolean(response?.meta?.cache?.hit),at:now(),count:Array.isArray(response?.data?.places)?response.data.places.length:null,providerStatus:response?.data?.providers?.status||null});emit('request.succeeded',{action,durationMs,cacheHit:Boolean(response?.meta?.cache?.hit),providerStatus:response?.data?.providers?.status||null});return response;}catch(error){state.failures++;state.lastError={code:error.code||'PLACES_REQUEST_FAILED',message:error.message,status:error.status||0,at:now()};remember({action,ok:false,error:state.lastError.code,at:now(),providerStatus:error.providerDiagnostics?.status||null});emit('request.failed',{action,...state.lastError});throw error;}}
async function resolvedDestination(input,options={}){
  const named=typeof input==='string'?{name:input,destinationName:input}:null;
  const initial=named||(input&&typeof input==='object'?input:null)||activeDestination();
  if(!initial)return null;
  if(finiteGeography(initial))return destinationContext(initial);
  const active=activeDestination();
  if(finiteGeography(active))return destinationContext({...active,...initial,name:initial.name||active.name,displayName:initial.displayName||active.displayName});
  if(options.refreshDestination===true&&window.LuviaDestination?.ensureResolved){
    const resolved=await window.LuviaDestination.ensureResolved(initial,{refresh:true});
    return destinationContext(resolved);
  }
  return destinationContext(initial);
}
async function textSearch(query,options={}){const text=clean(query);if(text.length<2)throw Object.assign(new Error('Suchbegriff muss mindestens zwei Zeichen enthalten.'),{code:'INVALID_QUERY'});const opts=normalizeOptions(options);const destination=await resolvedDestination(options.destination,options);if(opts.strictDestination&&(!destination?.location&&!destination?.viewport))throw Object.assign(new Error('Das aktive Reiseziel konnte nicht geografisch aufgelöst werden.'),{code:'DESTINATION_LOCATION_REQUIRED'});if(destination?.countryCode&&!options.regionCode)opts.regionCode=destination.countryCode;const requestOptions=options.requestOptions||{...(options.timeoutMs?{timeoutMs:options.timeoutMs}:{})};return call('places.text-search',{query:text,options:opts,destination},requestOptions);}
async function nearbySearch(options={}){const d=await resolvedDestination(options.destination,options);const location=options.location||d?.location;if(!location||!Number.isFinite(Number(location.latitude??location.lat))||!Number.isFinite(Number(location.longitude??location.lng)))throw Object.assign(new Error('Für Nearby Search werden Zielkoordinaten benötigt.'),{code:'LOCATION_REQUIRED'});return call('places.nearby-search',{location:{latitude:Number(location.latitude??location.lat),longitude:Number(location.longitude??location.lng)},radius:Math.max(50,Math.min(50000,num(options.radius,d?.searchRadiusMeters||3000))),options:normalizeOptions(options),destination:d});}
async function autocomplete(input,options={}){const text=clean(input);if(text.length<2)return{ok:true,data:{suggestions:[]},meta:{local:true}};const destination=options.destination?await resolvedDestination(options.destination,options):null,requestOptions=options.requestOptions||{timeoutMs:Math.max(1000,Math.min(10000,num(options.timeoutMs,7000)))};return call('places.autocomplete',{input:text,options:normalizeOptions(options),destination},requestOptions);}
async function details(placeId,options={}){const id=clean(placeId).replace(/^places\//,'');if(!id)throw Object.assign(new Error('Place-ID fehlt.'),{code:'PLACE_ID_REQUIRED'});const o=normalizeOptions(options),seed=options.providerPlaceSeed&&typeof options.providerPlaceSeed==='object'&&clean(options.providerPlaceSeed.providerPlaceId||options.providerPlaceSeed.id).replace(/^places\//,'')===id?options.providerPlaceSeed:null;return call('places.details',{placeId:id,languageCode:o.languageCode,regionCode:o.regionCode,options:{languageCode:o.languageCode,regionCode:o.regionCode,enrichMedia:options.enrichMedia===true,providerPlaceSeed:seed||undefined}});}
async function photo(photoName,options={}){const name=clean(photoName);if(!/^places\/[^/]+\/photos\/[^/]+$/.test(name))throw Object.assign(new Error('Ungültiger Photo-Ressourcenname.'),{code:'INVALID_PHOTO_NAME'});return call('places.photo',{photoName:name,maxWidthPx:Math.max(1,Math.min(1600,num(options.maxWidthPx,800))),maxHeightPx:options.maxHeightPx?Math.max(1,Math.min(1600,num(options.maxHeightPx,800))):null});}
async function route(origin,destination,options={}){return call('routes.compute',{origin,destination,...options});}
async function health(){return call('places.health',{});}
async function lookupDestination(query,options={}){return call('destination.resolve',{query:clean(query),languageCode:options.languageCode||'de'}, {timeoutMs:Number(options.timeoutMs)||7000});}
function diagnostics(){return{version:VERSION,initialized:state.initialized,backendAvailable:Boolean(window.LuviaBackend),destination:destinationContext(),metrics:{requests:state.requests,successes:state.successes,failures:state.failures,cacheHits:state.cacheHits},lastRequestAt:state.lastRequestAt,lastSuccessAt:state.lastSuccessAt,lastError:state.lastError,lastResult:state.lastResult,recent:[...state.recent]};}
async function testContract(options={}){const checks={api:true,backend:Boolean(window.LuviaBackend),destinationApi:Boolean(window.LuviaDestination),destinationResolver:typeof window.LuviaDestination?.ensureResolved==='function',methods:['textSearch','nearbySearch','autocomplete','details','photo','route','health'].every(k=>typeof api[k]==='function'),normalization:normalizeOptions({maxResultCount:99}).maxResultCount===20};let remote={skipped:true};if(options.remote===true){try{remote=await health();checks.remote=remote?.ok!==false;}catch(error){remote={ok:false,code:error.code,message:error.message};checks.remote=false;}}return{ok:Object.values(checks).every(Boolean),message:'Places Gateway, automatische Zielauflösung, geografische Einschränkung und Backend-Vertrag geprüft.',checks,remote,diagnostics:diagnostics()};}
function subscribe(listener){if(typeof listener!=='function')return()=>{};listeners.add(listener);return()=>listeners.delete(listener);}
function init(){state.initialized=true;emit('ready',{version:VERSION});return api;}
const api=Object.freeze({version:VERSION,init,textSearch,nearbySearch,autocomplete,details,photo,route,health,diagnostics,testContract,subscribe,activeDestination,resolvedDestination,lookupDestination});
window.LuviaPlaces=api;window.LuviaPlacesGateway=api;init();
})();
