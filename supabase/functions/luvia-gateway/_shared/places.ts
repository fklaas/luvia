import {FOURSQUARE_API_VERSION,FOURSQUARE_MAPPING_VERSION,FOURSQUARE_PRO_FIELDS,FOURSQUARE_SEARCH_FIELDS,FOURSQUARE_DETAILS_FIELDS,normalizeFoursquarePlace,boundedFoursquareError} from './foursquare-place-mapping.ts';

const BASE='https://places.googleapis.com/v1';
const FOURSQUARE_BASE='https://places-api.foursquare.com';
const TIMEZONE_BASE='https://maps.googleapis.com/maps/api/timezone/json';
const cache=new Map<string,{expires:number,value:unknown}>();
const metrics={requests:0,successes:0,failures:0,cacheHits:0,resolutions:0,timezoneRequests:0,timezoneFailures:0,lastRequestAt:null as string|null,lastSuccessAt:null as string|null,lastError:null as unknown,providers:{google:{requests:0,successes:0,failures:0},foursquare:{requests:0,successes:0,failures:0,fieldFallbacks:0},geoapify:{requests:0,successes:0,failures:0}}};
const HEALTH_PROBES=Object.freeze({
  'minigolf-scharbeutz':Object.freeze({query:'Minigolf',destination:Object.freeze({name:'Scharbeutz',countryCode:'DE',location:Object.freeze({latitude:54.0214,longitude:10.7536}),canonicalCity:Object.freeze({name:'Scharbeutz'}),searchRadiusMeters:15000})}),
  'minigolf-chat-scharbeutz':Object.freeze({query:'Minigolf in Scharbeutz Scharbeutz',destination:Object.freeze({name:'Scharbeutz',countryCode:'DE',location:Object.freeze({latitude:54.0214,longitude:10.7536}),canonicalCity:Object.freeze({name:'Scharbeutz'}),searchRadiusMeters:15000})}),
  'hotels-scharbeutz':Object.freeze({query:'Unterkünfte Scharbeutz',destination:Object.freeze({name:'Scharbeutz',countryCode:'DE',location:Object.freeze({latitude:54.0214,longitude:10.7536}),canonicalCity:Object.freeze({name:'Scharbeutz'}),searchRadiusMeters:15000}),options:Object.freeze({includedType:'lodging'})}),
  'beach-supplies-scharbeutz':Object.freeze({query:'Strandbedarf Surf Shop',destination:Object.freeze({name:'Scharbeutz',countryCode:'DE',location:Object.freeze({latitude:54.0214,longitude:10.7536}),canonicalCity:Object.freeze({name:'Scharbeutz'}),searchRadiusMeters:15000})})
});
const SEARCH_FIELDS='places.id,places.displayName,places.formattedAddress,places.shortFormattedAddress,places.addressComponents,places.location,places.viewport,places.primaryType,places.primaryTypeDisplayName,places.types,places.rating,places.userRatingCount,places.priceLevel,places.currentOpeningHours,places.regularOpeningHours,places.websiteUri,places.googleMapsUri,places.nationalPhoneNumber,places.internationalPhoneNumber,places.editorialSummary,places.photos,places.accessibilityOptions,places.businessStatus,places.servesVegetarianFood,places.goodForChildren,places.goodForGroups,places.servesBreakfast,places.servesLunch,places.servesDinner,places.takeout,places.delivery,places.dineIn,places.reservable';
const VIEWPORT_SEARCH_FIELDS='places.id,places.displayName,places.formattedAddress,places.shortFormattedAddress,places.location,places.viewport,places.primaryType,places.primaryTypeDisplayName,places.types,places.photos,places.accessibilityOptions,places.businessStatus,places.googleMapsUri';
const VIEWPORT_ENTERPRISE_FIELDS='places.rating,places.userRatingCount,places.priceLevel,places.currentOpeningHours';
const VIEWPORT_ATMOSPHERE_FIELDS='places.servesVegetarianFood';
const isQuotaError=(error:any)=>{const status=Number(error?.status)||0;const text=`${error?.code||''} ${error?.message||''}`.toLowerCase();return status===429||/quota|rate.?limit|credits remaining|resource.?exhausted/.test(text)};
const searchFields=(options:any={})=>{if(options?.richEvidence===true)return SEARCH_FIELDS;const fields=[VIEWPORT_SEARCH_FIELDS];if(options?.openNow||Number(options?.minRating)>0||(Array.isArray(options?.priceLevels)&&options.priceLevels.length))fields.push(VIEWPORT_ENTERPRISE_FIELDS);if(options?.vegetarianOnly)fields.push(VIEWPORT_ATMOSPHERE_FIELDS);return fields.join(',');};
const DETAIL_FIELDS='id,displayName,formattedAddress,shortFormattedAddress,addressComponents,location,viewport,primaryType,primaryTypeDisplayName,types,rating,userRatingCount,priceLevel,currentOpeningHours,regularOpeningHours,websiteUri,googleMapsUri,nationalPhoneNumber,internationalPhoneNumber,editorialSummary,photos,reviews,accessibilityOptions,businessStatus,parkingOptions,evChargeOptions,fuelOptions,subDestinations,paymentOptions,servesVegetarianFood,goodForChildren,goodForGroups,menuForChildren,servesBreakfast,servesLunch,servesDinner,servesBeer,servesWine,takeout,delivery,dineIn,reservable';

const COUNTRY_META:Record<string,{languages:string[];currency:string}>={DE:{languages:['de'],currency:'EUR'},FR:{languages:['fr'],currency:'EUR'},BE:{languages:['nl','fr','de'],currency:'EUR'},NL:{languages:['nl'],currency:'EUR'},LU:{languages:['lb','fr','de'],currency:'EUR'},AT:{languages:['de'],currency:'EUR'},CH:{languages:['de','fr','it'],currency:'CHF'},ES:{languages:['es'],currency:'EUR'},PT:{languages:['pt'],currency:'EUR'},IT:{languages:['it'],currency:'EUR'},IE:{languages:['en','ga'],currency:'EUR'},GB:{languages:['en'],currency:'GBP'},DK:{languages:['da'],currency:'DKK'},SE:{languages:['sv'],currency:'SEK'},NO:{languages:['no'],currency:'NOK'},FI:{languages:['fi','sv'],currency:'EUR'},PL:{languages:['pl'],currency:'PLN'},CZ:{languages:['cs'],currency:'CZK'},HU:{languages:['hu'],currency:'HUF'},HR:{languages:['hr'],currency:'EUR'},GR:{languages:['el'],currency:'EUR'},US:{languages:['en'],currency:'USD'},CA:{languages:['en','fr'],currency:'CAD'},JP:{languages:['ja'],currency:'JPY'},AU:{languages:['en'],currency:'AUD'}};
const flagEmoji=(code:string)=>/^[A-Z]{2}$/.test(code)?String.fromCodePoint(...[...code].map(char=>127397+char.charCodeAt(0))):'';
function viewportRadius(viewport:any,center:{lat:number;lng:number}){if(!viewport)return 20000;const toRad=(value:number)=>value*Math.PI/180;const distance=(point:{lat:number;lng:number})=>{const dLat=toRad(point.lat-center.lat),dLng=toRad(point.lng-center.lng),lat1=toRad(center.lat),lat2=toRad(point.lat);const h=Math.sin(dLat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;return 6371000*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));};const corners=[{lat:viewport.south,lng:viewport.west},{lat:viewport.south,lng:viewport.east},{lat:viewport.north,lng:viewport.west},{lat:viewport.north,lng:viewport.east}];return Math.max(5000,Math.min(50000,Math.round(Math.max(...corners.map(distance))*1.35/1000)*1000));}

const DESTINATION_FIELDS='places.id,places.displayName,places.formattedAddress,places.addressComponents,places.location,places.viewport,places.primaryType,places.types';
const hash=(value:unknown)=>{const text=JSON.stringify(value);let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619);}return(h>>>0).toString(36)};
const getKey=()=>Deno.env.get('GOOGLE_PLACES_API_KEY')||'';
const getFoursquareKey=()=>Deno.env.get('FOURSQUARE_API_KEY')||'';
const GEOAPIFY_BASE='https://api.geoapify.com/v2';
const getGeoapifyKey=()=>Deno.env.get('GEOAPIFY_API_KEY')||Deno.env.get('GEOAPIFY_KEY')||'';

function geoapifyRectFilter(rect:any){
  const low=rect?.low,high=rect?.high;
  if(!low||!high)return null;
  const lon1=Number(low.longitude??low.lng),lat1=Number(low.latitude??low.lat);
  const lon2=Number(high.longitude??high.lng),lat2=Number(high.latitude??high.lat);
  if(![lon1,lat1,lon2,lat2].every(Number.isFinite))return null;
  return `rect:${lon1},${lat1},${lon2},${lat2}`;
}
function geoapifyBiasFromRestriction(restriction:any){
  // Geoapify's `bias` prefers results within the viewport but doesn't hard-filter.
  const rect=restriction?.rectangle;
  const filter=geoapifyRectFilter(rect);
  if(!filter)return null;
  return filter;
}

const GEOAPIFY_CATEGORIES_FALLBACK=Object.freeze(['tourism.sights']);
const GEOAPIFY_CATEGORIES_BY_LUVIA_TYPE=Object.freeze({
  restaurant:'catering.restaurant',
  cafe:'catering.cafe',
  bakery:'catering.bakery',
  bar:'catering.bar',
  meal_takeaway:'catering.meal_takeaway',
  fine_dining_restaurant:'catering.restaurant',
  vegetarian_restaurant:'catering.restaurant',
  vegan_restaurant:'catering.restaurant',
  accommodation:'accommodation.hotel',
  hotel:'accommodation.hotel',
  lodging:'accommodation.hotel',
  park:'leisure.park',
  garden:'leisure.park',
  beach:'tourism.beach',
  swimming_pool:'leisure.swimming_pool',
  amusement_center:'leisure.amusement_center',
  amusement_park:'leisure.amusement_park',
  zoo:'leisure.zoo',
  spa:'leisure.spas',
  museum:'tourism.museum',
  tourist_attraction:'tourism.sights',
  historical_landmark:'tourism.sights',
  monument:'tourism.sights',
  observation_deck:'tourism.sights',
  shopping:'shopping.shopping_mall',
  shopping_mall:'shopping.shopping_mall',
  market:'shopping.market',
  store:'shopping.store',
  pharmacy:'health.pharmacy',
  supermarket:'commercial.supermarket',
  parking:'amenity.parking',
  electric_vehicle_charging_station:'public_service.ev_charging_station',
  atm:'amenity.atm',
  laundry:'services.laundry'
});

function geoapifyCategoriesFromOptions(options:any){
  const tokens=[...(Array.isArray(options?.includedTypes)?options.includedTypes:[]),options?.includedType, ...(Array.isArray(options?.includedPrimaryTypes)?options.includedPrimaryTypes:[])].filter(Boolean);
  const categories=new Set<string>();
  for(const token of tokens){
    const key=String(token).trim();
    const mapped=(GEOAPIFY_CATEGORIES_BY_LUVIA_TYPE as any)[key];
    if(mapped)categories.add(mapped);
  }
  return categories.size?[...categories].slice(0,6):GEOAPIFY_CATEGORIES_FALLBACK;
}

function base64Url(bytes:Uint8Array){let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function createPlacesSessionToken(){const bytes=new Uint8Array(24);crypto.getRandomValues(bytes);return base64Url(bytes);}
function normalizePlacesSessionToken(value:unknown){const token=String(value||'').trim();if(/^[A-Za-z0-9_-]{16,256}$/.test(token))return token;return createPlacesSessionToken();}

const cleanObject=(value:any):any=>{if(Array.isArray(value))return value.map(cleanObject);if(value&&typeof value==='object'){const out:any={};for(const[k,v]of Object.entries(value)){if(v!==undefined&&v!==null&&v!==''&&!(Array.isArray(v)&&!v.length))out[k]=cleanObject(v);}return out;}return value;};
function cached(key:string){const item=cache.get(key);if(!item)return null;if(item.expires<Date.now()){cache.delete(key);return null;}metrics.cacheHits++;return item.value;}
function store(key:string,value:unknown,ttlMs:number){cache.set(key,{expires:Date.now()+ttlMs,value});if(cache.size>250){const first=cache.keys().next().value;if(first)cache.delete(first);}}
async function google(path:string,init:RequestInit,fieldMask?:string){const key=getKey();if(!key)throw Object.assign(new Error('Google Places API Key ist nicht konfiguriert.'),{code:'PLACES_NOT_CONFIGURED',status:503});metrics.requests++;metrics.providers.google.requests++;metrics.lastRequestAt=new Date().toISOString();const headers=new Headers(init.headers);headers.set('Content-Type','application/json');headers.set('X-Goog-Api-Key',key);if(fieldMask)headers.set('X-Goog-FieldMask',fieldMask);const response=await fetch(`${BASE}${path}`,{...init,headers});const body=await response.json().catch(()=>({}));if(!response.ok){metrics.failures++;metrics.providers.google.failures++;metrics.lastError=body;const message=body?.error?.message||`Google Places Anfrage fehlgeschlagen (${response.status}).`;throw Object.assign(new Error(message),{code:'PLACES_PROVIDER_ERROR',status:response.status,provider:body});}metrics.successes++;metrics.providers.google.successes++;metrics.lastSuccessAt=new Date().toISOString();return body;}

async function foursquare(path:string,params:Record<string,unknown>={}){
  const key=getFoursquareKey();
  if(!key)throw Object.assign(new Error('Foursquare Service API Key ist nicht konfiguriert.'),{code:'FOURSQUARE_NOT_CONFIGURED',status:503});
  const qs=new URLSearchParams();
  for(const [name,value] of Object.entries(params)){
    if(value===undefined||value===null||value===''||(Array.isArray(value)&&!value.length))continue;
    qs.set(name,Array.isArray(value)?value.join(','):String(value));
  }
  metrics.requests++;metrics.providers.foursquare.requests++;metrics.lastRequestAt=new Date().toISOString();
  const response=await fetch(`${FOURSQUARE_BASE}${path}${qs.size?`?${qs}`:''}`,{headers:{Accept:'application/json',Authorization:`Bearer ${key}`,'X-Places-Api-Version':FOURSQUARE_API_VERSION}});
  const body=await response.json().catch(()=>({}));
  if(!response.ok){const diagnostic=boundedFoursquareError(body);metrics.failures++;metrics.providers.foursquare.failures++;metrics.lastError={provider:'foursquare',status:response.status,...diagnostic};throw Object.assign(new Error(diagnostic.message||`Foursquare Anfrage fehlgeschlagen (${response.status}).`),{code:'FOURSQUARE_PROVIDER_ERROR',status:response.status,provider:diagnostic});}
  metrics.successes++;metrics.providers.foursquare.successes++;metrics.lastSuccessAt=new Date().toISOString();return body;
}
async function foursquareWithFieldFallback(path:string,params:Record<string,unknown>,fallbackFields:string[]){
  try{return await foursquare(path,params)}catch(error:any){
    if(![400,403].includes(Number(error?.status))||!params.fields)throw error;
    metrics.providers.foursquare.fieldFallbacks++;
    try{return await foursquare(path,{...params,fields:fallbackFields.join(',')})}catch(fallbackError:any){
      if(![400,403].includes(Number(fallbackError?.status)))throw fallbackError;
      metrics.providers.foursquare.fieldFallbacks++;
      const {fields:_retiredFields,...providerDefaults}=params;
      return foursquare(path,providerDefaults);
    }
  }
}
function canonicalKey(place:any){const name=String(place?.name||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();const lat=Number(place?.location?.latitude),lng=Number(place?.location?.longitude);return `${name}|${Number.isFinite(lat)?lat.toFixed(3):''}|${Number.isFinite(lng)?lng.toFixed(3):''}`;}
function mergeProviderPlaces(items:any[]){const out:any[]=[];const index=new Map<string,number>();for(const place of items){if(!place?.name)continue;const key=canonicalKey(place);const existingIndex=index.get(key);if(existingIndex===undefined){place.providerRefs=place.providerRefs||{[place.provider||'google-places']:String(place.id||'')};place.evidence=place.evidence||[{provider:place.provider||'google-places',kind:'place-search'}];index.set(key,out.length);out.push(place);continue;}const current=out[existingIndex];const preferGoogle=String(current.provider||'').includes('google')||String(place.provider||'').includes('google');const primary=String(current.provider||'').includes('google')?current:String(place.provider||'').includes('google')?place:current;const currentCount=current.userRatingCount,otherCount=place.userRatingCount;const userRatingCount=(currentCount==null&&otherCount==null)?null:Math.max(...[currentCount,otherCount].filter(v=>v!=null).map(v=>Number(v)).filter(v=>Number.isFinite(v)));out[existingIndex]={...current,...primary,provider:'multi',providerRefs:{...(current.providerRefs||{}),...(place.providerRefs||{}),[String(current.provider||'google')]:String(current.id||''),[String(place.provider||'foursquare')]:String(place.id||'')},evidence:[...(current.evidence||[]),...(place.evidence||[])],rating:current.rating??place.rating,userRatingCount,photos:(current.photos?.length?current.photos:place.photos)||[],_multiProvider:preferGoogle};}return out;}
function profileContextText(options:any){const p=options?.profileContext||{};const parts=[];if(p.vegetarian||p.diet==='vegetarian')parts.push('vegetarian food required');if(p.vegan||p.diet==='vegan')parts.push('vegan food required');if(p.withChild||p.familyFriendly)parts.push('traveling with a child; family friendly');if(p.stroller)parts.push('stroller friendly');for(const x of (p.preferences||[]).slice(0,8))parts.push(String(x));return parts.join(', ');}
// A Foursquare category filter is applied only when an owner caller supplies an
// explicit, reviewed taxonomy set. The broad five-digit "Restaurant" node does
// not reliably include every local descendant category in all datasets. Luvia
// therefore validates restaurant evidence after retrieval instead of silently
// excluding legitimate restaurants before ranking them.
function foursquareCategoryFilter(options:any){const explicit=Array.isArray(options?.foursquareCategoryIds)?options.foursquareCategoryIds.join(','):String(options?.foursquareCategoryIds||'');const safe=explicit.split(',').map((value:string)=>value.trim()).filter((value:string)=>/^\d+$/.test(value)).slice(0,12);return safe.length?safe.join(','):undefined;}
function foursquareRadius(destination:any,options:any,anchor:any){if(!anchor)return undefined;const explicit=Number(options?.maxDistanceMeters);if(Number.isFinite(explicit)&&explicit>0)return Math.min(100000,Math.max(1000,Math.round(explicit)));const destinationRadius=Number(destination?.searchRadiusMeters||destination?.canonicalCity?.searchRadiusMeters);return Number.isFinite(destinationRadius)&&destinationRadius>0?Math.min(25000,Math.max(5000,Math.round(destinationRadius))):12000;}
const escapeRegExp=(value:string)=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
export function foursquareQuery(query:string,destination:any){
  let normalized=String(query||'').replace(/\s+/g,' ').trim();
  const names=[destination?.canonicalCity?.name,destination?.name,destination?.displayName]
    .map((value:any)=>String(value||'').trim()).filter((value:string,index:number,items:string[])=>value.length>1&&items.findIndex(item=>item.toLocaleLowerCase('de-DE')===value.toLocaleLowerCase('de-DE'))===index)
    .sort((left:string,right:string)=>right.length-left.length);
  for(const name of names){
    const escaped=escapeRegExp(name);
    normalized=normalized.replace(new RegExp(`(?:\\b(?:in|bei|nahe|near)\\s+)?${escaped}(?=\\s|$)`,`gi`),' ');
  }
  normalized=normalized.replace(/\s+/g,' ').trim().replace(/\b(?:in|bei|nahe|near)\s*$/i,'').trim();
  return normalized.length>=2?normalized:String(query||'').trim();
}
async function foursquareSearch(query:string,destination:any,options:any){const anchor=searchAnchor(destination,options);const near=destination?.canonicalCity?.name||destination?.name||'';const params:any={query:foursquareQuery(query,destination),limit:Math.min(50,Math.max(1,Number(options?.maxResultCount||10))),sort:'RELEVANCE',fields:FOURSQUARE_SEARCH_FIELDS.join(',')};if(anchor)params.ll=`${anchor.latitude},${anchor.longitude}`;else if(near)params.near=near;const radius=foursquareRadius(destination,options,anchor),categoryFilter=foursquareCategoryFilter(options);if(radius)params.radius=radius;if(categoryFilter)params.fsq_category_ids=categoryFilter;if(options?.openNow)params.open_now=true;const raw=await foursquareWithFieldFallback('/places/search',params,[...FOURSQUARE_PRO_FIELDS,'distance']);const rows=raw.results||raw.places||[];return rows.map((place:any)=>normalizeFoursquarePlace(place,{evidenceKind:'place-search'}));}

async function resolveTimezone(latitude:number,longitude:number){
  const key=getKey();
  if(!key)return{ok:false,status:'KEY_MISSING',message:'GOOGLE_PLACES_API_KEY fehlt.'};
  metrics.timezoneRequests++;
  try{
    const params=new URLSearchParams({location:`${latitude},${longitude}`,timestamp:String(Math.floor(Date.now()/1000)),key,language:'de'});
    const response=await fetch(`${TIMEZONE_BASE}?${params.toString()}`,{headers:{Accept:'application/json'}});
    const body=await response.json().catch(()=>({status:'INVALID_RESPONSE'}));
    console.log('[luvia-gateway][timezone] response',{
      httpStatus:response.status,
      ok:response.ok,
      googleStatus:body?.status||null,
      errorMessage:body?.errorMessage||body?.error_message||null,
      timeZoneId:body?.timeZoneId||null,
      timeZoneName:body?.timeZoneName||null,
      location:{latitude,longitude}
    });
    if(!response.ok||body?.status!=='OK'){
      metrics.timezoneFailures++;
      metrics.lastError={provider:'google-timezone',httpStatus:response.status,status:body?.status||'UNKNOWN_ERROR',message:body?.errorMessage||body?.error_message||'Time Zone API lieferte kein Ergebnis.'};
      return{ok:false,status:String(body?.status||`HTTP_${response.status}`),message:String(body?.errorMessage||body?.error_message||'Time Zone API lieferte kein Ergebnis.')};
    }
    return{ok:true,status:'OK',timezone:String(body.timeZoneId||''),timezoneName:String(body.timeZoneName||''),rawOffsetSeconds:Number(body.rawOffset||0),dstOffsetSeconds:Number(body.dstOffset||0)};
  }catch(error){
    metrics.timezoneFailures++;
    const message=error instanceof Error?error.message:String(error);
    metrics.lastError={provider:'google-timezone',status:'NETWORK_ERROR',message};
    return{ok:false,status:'NETWORK_ERROR',message};
  }
}
function normalizedViewport(v:any){if(!v)return null;const low=v.low||v.southwest||{};const high=v.high||v.northeast||{};const south=Number(low.latitude),west=Number(low.longitude),north=Number(high.latitude),east=Number(high.longitude);return [south,west,north,east].every(Number.isFinite)?{south,west,north,east}:null;}
function addressPart(components:any[],type:string){return components?.find(c=>Array.isArray(c.types)&&c.types.includes(type))||null;}
function normalizedPlace(p:any){const components=p.addressComponents||[];const country=addressPart(components,'country');return{id:p.id||String(p.name||'').replace(/^places\//,''),resourceName:p.name||p.id?`places/${p.id||String(p.name).replace(/^places\//,'')}`:null,name:p.displayName?.text||'',displayName:p.displayName?.text||'',languageCode:p.displayName?.languageCode||'',formattedAddress:p.formattedAddress||'',shortAddress:p.shortFormattedAddress||'',addressComponents:components,country:country?.longText||'',countryCode:String(country?.shortText||'').toUpperCase(),location:p.location||null,viewport:normalizedViewport(p.viewport),primaryType:p.primaryType||'',primaryTypeLabel:p.primaryTypeDisplayName?.text||'',types:p.types||[],rating:p.rating??null,userRatingCount:p.userRatingCount??null,priceLevel:p.priceLevel||null,businessStatus:p.businessStatus||null,openNow:p.currentOpeningHours?.openNow??null,openingHours:p.currentOpeningHours||p.regularOpeningHours||null,website:p.websiteUri||null,mapsUri:p.googleMapsUri||null,phone:p.internationalPhoneNumber||p.nationalPhoneNumber||null,photos:(p.photos||[]).map((x:any)=>({name:x.name,widthPx:x.widthPx,heightPx:x.heightPx,authorAttributions:x.authorAttributions||[]})),editorialSummary:p.editorialSummary?.text||null,reviews:p.reviews||[],accessibility:p.accessibilityOptions||null,accessibilityOptions:p.accessibilityOptions||null,parkingOptions:p.parkingOptions||null,evChargeOptions:p.evChargeOptions||null,fuelOptions:p.fuelOptions||null,subDestinations:p.subDestinations||[],features:{servesVegetarianFood:p.servesVegetarianFood??null,goodForChildren:p.goodForChildren??null,goodForGroups:p.goodForGroups??null,menuForChildren:p.menuForChildren??null,breakfast:p.servesBreakfast??null,lunch:p.servesLunch??null,dinner:p.servesDinner??null,beer:p.servesBeer??null,wine:p.servesWine??null,takeout:p.takeout??null,delivery:p.delivery??null,dineIn:p.dineIn??null,reservable:p.reservable??null},raw:p};}
function normalizedGeoapifyPlace(feature:any,options:any={}){
  const f=feature&&typeof feature==='object'?feature:{};
  const props=f.properties&&typeof f.properties==='object'?f.properties:{};
  const placeId=String(props.place_id||props.placeId||props.placeID||props.id||f.id||'');
  const id=placeId?`geoapify:${placeId}`:'';
  const latitude=Number(props.lat??props.latitude??props.location?.latitude??props.location?.lat??props.coordinates?.latitude);
  const longitude=Number(props.lon??props.longitude??props.location?.longitude??props.location?.lng??props.coordinates?.longitude);
  const categories=Array.isArray(props.categories)?props.categories:(typeof props.categories==='string'?props.categories.split(',').map(String):[]);
  const tags=Array.isArray(props.tags)?props.tags:(typeof props.tags==='string'?props.tags.split(',').map(String):[]);
  const nativeEvidence=[...categories,...tags].filter(Boolean).slice(0,30);
  const textEvidence=String(nativeEvidence.join(' ')).toLowerCase();
  const servesVegetarianFood=/vegetarian|vegan/.test(textEvidence)?true:null;
  const servesVeganFood=/vegan/.test(textEvidence)?true:null;
  const wheelchairAccessibleEntrance=/wheelchair|accessible/.test(textEvidence)?true:null;
  const openNowRaw=props.open_now??props.openNow??props.opening_hours?.open_now??props.openingHours?.open_now;
  const openNow=typeof openNowRaw==='boolean'?openNowRaw:null;
  const primaryType=String(options?.includedType||options?.includedPrimaryTypes?.[0]||'');
  const primaryTypeLabel='';
  return{
    id:id||null,
    providerPlaceId:id||null,
    name:String(props.name||props.address?.street||props.address_line1||''),
    displayName:String(props.name||props.address?.street||props.address_line1||''),
    resourceName:placeId?`geoapify/${placeId}`:null,
    languageCode:String(props.lang||options?.languageCode||'').slice(0,5),
    formattedAddress:String(props.formatted?.address||props.formatted_address||props.address?.full||props.address_line2||props.address?.street||''),
    shortAddress:String(props.address_line1||props.address?.street||props.address?.suburb||''),
    addressComponents:[],
    country:String((props.country??props.address?.country)||''),
    countryCode:String((props.country_code??props.countryCode)||'').toUpperCase(),
    location:(Number.isFinite(latitude)&&Number.isFinite(longitude))?{latitude,longitude}:null,
    viewport:null,
    primaryType:primaryType||'',
    primaryTypeLabel:primaryTypeLabel||'',
    types:nativeEvidence,
    rating:null,
    userRatingCount:null,
    priceLevel:null,
    businessStatus:null,
    openNow,
    openingHours:props.opening_hours||props.openingHours||null,
    website:props.website||null,
    mapsUri:null,
    phone:props.phone||null,
    photos:[],
    editorialSummary:null,
    reviews:[],
    accessibility:null,
    accessibilityOptions:wheelchairAccessibleEntrance!=null?{wheelchairAccessibleEntrance}:null,
    parkingOptions:null,
    evChargeOptions:null,
    fuelOptions:null,
    subDestinations:[],
    features:{
      reservable:null,
      servesVegetarianFood,
      servesVeganFood,
      goodForChildren:null
    },
    raw:props
  };
}

async function geoapifyPlacesSearch(textQuery:string,destination:any,options:any,restriction:any,bias:any){
  const key=getGeoapifyKey();
  if(!key)throw Object.assign(new Error('Geoapify API key ist nicht konfiguriert.'),{code:'GEOAPIFY_NOT_CONFIGURED',status:503});
  metrics.requests++;metrics.providers.geoapify.requests++;metrics.lastRequestAt=new Date().toISOString();
  const limit=Math.min(20,Math.max(1,Number(options?.maxResultCount||10)));
  const categories=geoapifyCategoriesFromOptions(options);
  const filter=geoapifyRectFilter(restriction?.rectangle||restriction||null);
  const biasParam=(bias||geoapifyBiasFromRestriction(restriction))||null;
  const params=new URLSearchParams();
  params.set('apiKey',key);
  params.set('categories',categories.join(','));
  if(textQuery)params.set('name',textQuery);
  if(filter)params.set('filter',filter);
  if(biasParam){
    // `bias` can be passed as-is if we already built the rect/circle string.
    if(typeof biasParam==='string')params.set('bias',biasParam);
    else if(biasParam?.circle?.center){
      const c=biasParam.circle.center;
      const r=Math.round(Number(biasParam.circle.radius||2000));
      params.set('bias',`circle:${c.longitude},${c.latitude},${Math.max(100,Math.min(50000,r))}`);
    }
  }
  params.set('limit',String(limit));
  if(options?.languageCode)params.set('lang',String(options.languageCode).slice(0,5));
  const response=await fetch(`${GEOAPIFY_BASE}/places?${params}`,{headers:{Accept:'application/json'}});
  const body=await response.json().catch(()=>({}));
  if(!response.ok){
    metrics.failures++;metrics.providers.geoapify.failures++;
    const status=Number(body?.status||response.status||0);
    const message=body?.error?.message||body?.message||`Geoapify Anfrage fehlgeschlagen (${response.status}).`;
    metrics.lastError={provider:'geoapify',status,code:body?.error?.code||body?.code||'GEOAPIFY_PROVIDER_ERROR',message};
    throw Object.assign(new Error(message),{code:'GEOAPIFY_PROVIDER_ERROR',status,provider:'geoapify'});
  }
  const features=Array.isArray(body?.features)?body.features:[];
  metrics.successes++;metrics.providers.geoapify.successes++;metrics.lastSuccessAt=new Date().toISOString();
  return features.map((feature:any)=>normalizedGeoapifyPlace(feature,options));
}
function destinationBias(destination:any,explicit:any){if(explicit)return explicit;const l=destination?.location;if(!l)return undefined;const latitude=Number(l.latitude??l.lat),longitude=Number(l.longitude??l.lng);if(!Number.isFinite(latitude)||!Number.isFinite(longitude))return undefined;return{circle:{center:{latitude,longitude},radius:Math.max(1000,Math.min(50000,Number(destination?.searchRadiusMeters)||20000))}};}
function destinationRestriction(destination:any,explicit:any){if(explicit)return explicit;const v=destination?.viewport;if(v&&[v.south,v.west,v.north,v.east].every((x:any)=>Number.isFinite(Number(x))))return{rectangle:{low:{latitude:Number(v.south),longitude:Number(v.west)},high:{latitude:Number(v.north),longitude:Number(v.east)}}};return undefined;}
function coordinate(value:any){const latitude=Number(value?.latitude??value?.lat),longitude=Number(value?.longitude??value?.lng);return Number.isFinite(latitude)&&Number.isFinite(longitude)?{latitude,longitude}:null;}
function distanceMeters(a:any,b:any){const x=coordinate(a),y=coordinate(b);if(!x||!y)return null;const rad=(v:number)=>v*Math.PI/180,dLat=rad(y.latitude-x.latitude),dLng=rad(y.longitude-x.longitude),lat1=rad(x.latitude),lat2=rad(y.latitude);const h=Math.sin(dLat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;return Math.round(6371000*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h)));}
function cityCandidate(candidates:any[]){const priorities=['locality','administrative_area_level_2','administrative_area_level_1','postal_town','country'];for(const type of priorities){const hit=candidates.find((x:any)=>x.primaryType===type||x.types?.includes(type));if(hit)return hit;}return candidates.find((x:any)=>x.location)||null;}
function landmarkCandidate(candidates:any[],city:any){return candidates.find((x:any)=>x.id!==city?.id&&['tourist_attraction','point_of_interest','establishment','premise'].includes(x.primaryType))||null;}
function searchAnchor(destination:any,options:any){const landmark=options?.landmarkContext||destination?.landmarkContext;if(landmark?.center||landmark?.location)return coordinate(landmark.center||landmark.location);return coordinate(destination?.canonicalCity?.center||destination?.location||destination?.center);}
function postProcessPlaces(places:any[],destination:any,options:any){const anchor=searchAnchor(destination,options);let list=places.map(p=>({...p,distanceMeters:anchor?distanceMeters(anchor,p.location):null,distanceSource:options?.landmarkContext||destination?.landmarkContext?'landmark':'canonical-city'}));if(options?.vegetarianOnly){list=list.filter(p=>p.features?.servesVegetarianFood!==false);list.sort((a,b)=>Number(b.features?.servesVegetarianFood===true)-Number(a.features?.servesVegetarianFood===true));}if(Number(options?.minUserRatingCount)>0){const min=Number(options.minUserRatingCount);list=list.filter(p=>p.userRatingCount!=null&&Number(p.userRatingCount)>=min);}if(Number(options?.maxDistanceMeters)>0)list=list.filter(p=>p.distanceMeters!=null&&p.distanceMeters<=Number(options.maxDistanceMeters));const sort=String(options?.sortBy||'relevance');if(sort==='distance')list.sort((a,b)=>(a.distanceMeters??Infinity)-(b.distanceMeters??Infinity));else if(sort==='rating')list.sort((a,b)=>{const ar=a.rating!=null?Number(a.rating):null,br=b.rating!=null?Number(b.rating):null;if(ar!=null&&br!=null){const diff=br-ar;if(diff!==0)return diff;}else if(ar!=null)return-1;else if(br!=null)return 1;const auc=a.userRatingCount!=null?Number(a.userRatingCount):null,buc=b.userRatingCount!=null?Number(b.userRatingCount):null;if(auc!=null&&buc!=null){const diff=buc-auc;if(diff!==0)return diff;}else if(auc!=null)return-1;else if(buc!=null)return 1;return 0;});else if(sort==='reviews')list.sort((a,b)=>{const auc=a.userRatingCount!=null?Number(a.userRatingCount):null,buc=b.userRatingCount!=null?Number(b.userRatingCount):null;if(auc==null&&buc==null)return 0;if(auc==null)return 1;if(buc==null)return-1;return buc-auc;});return list;}
async function resolveDestination(payload:any){
  const query=String(payload?.query||'').trim();
  if(query.length<2)throw Object.assign(new Error('Reiseziel muss mindestens zwei Zeichen enthalten.'),{code:'DESTINATION_QUERY_INVALID',status:400});
  const languageCode=String(payload?.languageCode||'de');
  const regionCode=payload?.regionCode?String(payload.regionCode).toUpperCase():undefined;
  const forceRefresh=payload?.forceRefresh===true||payload?.refresh===true;
  const key=`destination.resolve:v2.12.3.1:${hash({query,languageCode,regionCode})}`;
  const hit=forceRefresh?null:cached(key);
  if(hit)return{data:hit,cache:{hit:true,key,ttlMs:7*24*60*60_000}};
  const body=cleanObject({textQuery:query,languageCode,regionCode,maxResultCount:5});
  const raw=await google('/places:searchText',{method:'POST',body:JSON.stringify(body)},DESTINATION_FIELDS);
  const candidates=raw.places||[];
  const p=cityCandidate(candidates);
  const landmark=landmarkCandidate(candidates,p);
  if(!p?.location)throw Object.assign(new Error('Reiseziel wurde nicht gefunden.'),{code:'DESTINATION_NOT_FOUND',status:404});
  const country=addressPart(p.addressComponents||[],'country');
  const locality=addressPart(p.addressComponents||[],'locality')||addressPart(p.addressComponents||[],'administrative_area_level_2');
  const name=p.displayName?.text||locality?.longText||query;
  const latitude=Number(p.location.latitude),longitude=Number(p.location.longitude);
  const timezone=await resolveTimezone(latitude,longitude);
  const countryCode=String(country?.shortText||'').toUpperCase();
  const viewport=normalizedViewport(p.viewport);
  const regional=COUNTRY_META[countryCode]||{languages:[],currency:''};
  const result={destination:{
    schemaVersion:5,id:String(p.id||'').replace(/^places\//,''),name,displayName:p.formattedAddress||name,
    country:country?.longText||'',countryCode,placeId:String(p.id||'').replace(/^places\//,''),
    center:{lat:latitude,lng:longitude},location:{latitude,longitude},viewport,
    searchRadiusMeters:viewportRadius(viewport,{lat:latitude,lng:longitude}),radiusSource:viewport?'viewport':'default',
    timezone:timezone.ok?timezone.timezone:'',timezoneName:timezone.ok?timezone.timezoneName:'',
    timezoneStatus:timezone.status,timezoneError:timezone.ok?'':timezone.message,
    languageCodes:regional.languages,currency:regional.currency,
    locale:regional.languages[0]&&countryCode?`${regional.languages[0]}-${countryCode}`:'de-DE',
    flagEmoji:flagEmoji(countryCode),provider:'google-places',source:'automatic-geocoding',
    primaryType:p.primaryType||null,canonicalCity:{name,placeId:String(p.id||'').replace(/^places\//,''),center:{lat:latitude,lng:longitude},viewport,country:country?.longText||'',countryCode},
    landmarkContext:landmark?.location?{name:landmark.displayName?.text||'',placeId:String(landmark.id||'').replace(/^places\//,''),primaryType:landmark.primaryType||'',center:{lat:Number(landmark.location.latitude),lng:Number(landmark.location.longitude)},viewport:normalizedViewport(landmark.viewport),source:'destination-resolve'}:null,
    resolvedAt:new Date().toISOString(),rawType:p.primaryType||null
  }};
  metrics.resolutions++;
  store(key,result,7*24*60*60_000);
  return{data:result,cache:{hit:false,key,ttlMs:7*24*60*60_000,forced:forceRefresh}};
}

export async function placesAction(action:string,payload:any){
if(action==='destination.resolve')return resolveDestination(payload);
const options=payload?.options||{};const languageCode=options.languageCode||payload?.languageCode||'de';const regionCode=options.regionCode||payload?.regionCode||payload?.destination?.countryCode||'DE';const ttl=['places.details','places.photo','places.autocomplete'].includes(action)?0:5*60_000;const key=`${action}:${hash(payload)}`;const hit=ttl>0?cached(key):null;if(hit)return{data:hit,cache:{hit:true,key,ttlMs:ttl}};let result:any;
if(action==='places.health'){
  const requestedProbe=String(payload?.diagnosticProbe||'').trim().toLowerCase();
  const probe=HEALTH_PROBES[requestedProbe as keyof typeof HEALTH_PROBES]||null;
  let diagnosticProbe:any=null;
  if(probe){
    try{
      const response=await placesAction('places.text-search',{query:probe.query,destination:probe.destination,options:{providers:['geoapify'],maxResultCount:20,strictDestination:true,languageCode:'de',regionCode:'DE',...(probe.options||{})}});
      diagnosticProbe={key:requestedProbe,status:'ok',query:probe.query,destination:probe.destination.name,providers:response.data?.providers||null,places:(response.data?.places||[]).slice(0,12).map((place:any)=>({providerPlaceId:String(place?.providerPlaceId||place?.id||'').slice(0,160),name:String(place?.name||place?.displayName||'').slice(0,160),primaryType:String(place?.primaryType||'').slice(0,120),primaryTypeLabel:String(place?.primaryTypeLabel||'').slice(0,160),provider:String(place?.provider||'').slice(0,80),providerNativeTypes:(place?.providerNativeTypes||[]).slice(0,12).map((value:any)=>String(value).slice(0,120)),types:(place?.types||[]).slice(0,12).map((value:any)=>String(value).slice(0,120)),photoCount:Array.isArray(place?.photos)?place.photos.length:0,location:coordinate(place?.location)}))};
    }catch(error:any){
      diagnosticProbe={key:requestedProbe,status:'failed',query:probe.query,destination:probe.destination.name,error:{code:String(error?.code||'PROBE_FAILED').slice(0,80),message:String(error?.message||'Diagnose fehlgeschlagen.').slice(0,240)},providerErrors:(error?.providerErrors||[]).slice(0,4).map((item:any)=>({provider:String(item?.provider||'unknown').slice(0,40),code:String(item?.code||'PROVIDER_ERROR').slice(0,80),message:String(item?.message||'Provider fehlgeschlagen.').slice(0,240)})),places:[]};
    }
  }
  result={status:'ok',service:'multi-provider-places-gateway',version:'4.31.0-geoapify-slice',configured:Boolean(getGeoapifyKey()||getKey()||getFoursquareKey()),providerOrder:'geoapify_primary_no_fallback',providers:{geoapify:{configured:Boolean(getGeoapifyKey()),priority:'primary',coordinateSchema:'top-level-latitude-longitude'},google:{configured:Boolean(getKey()),priority:'legacy'},foursquare:{configured:Boolean(getFoursquareKey()),priority:'legacy_fallback',apiVersion:FOURSQUARE_API_VERSION,mappingVersion:FOURSQUARE_MAPPING_VERSION,coordinateSchema:'top-level-latitude-longitude',premiumFieldsOptional:true,categoryFilteredSearch:'explicit-reviewed-taxonomy-only',postRetrievalCategoryEvidence:true,adaptiveDestinationRadius:true}},diagnosticProbe,availableDiagnosticProbes:Object.keys(HEALTH_PROBES),metrics:{...metrics},cache:{entries:cache.size}};return{data:result,cache:{hit:false,key:null,ttlMs:0}};
}
if(action==='places.text-search'){
  const destination=payload?.destination||null;const landmark=options.landmarkContext||destination?.landmarkContext||null;const effectiveDestination=landmark?.center?{...destination,location:{latitude:Number(landmark.center.lat??landmark.center.latitude),longitude:Number(landmark.center.lng??landmark.center.longitude)},viewport:landmark.viewport||null,searchRadiusMeters:options.maxDistanceMeters||destination?.searchRadiusMeters}:destination;const restriction=options.strictDestination===false?undefined:destinationRestriction(effectiveDestination,options.locationRestriction);const bias=restriction?undefined:destinationBias(effectiveDestination,options.locationBias);let textQuery=String(payload?.query||'');const cityName=destination?.canonicalCity?.name||destination?.name;if(options.vegetarianOnly&&!/vegetar/i.test(textQuery))textQuery=`vegetarisch ${textQuery}`;if(cityName&&!restriction&&!bias)textQuery=`${textQuery} in ${cityName}`;if(landmark?.name&&!textQuery.toLowerCase().includes(String(landmark.name).toLowerCase()))textQuery=`${textQuery} nahe ${landmark.name}`;
  const providers=Array.isArray(options.providers)&&options.providers.length?options.providers:['geoapify'],providerErrors:any[]=[],attempted:string[]=[];
  let geoapifyPlaces:any[]=[],googlePlaces:any[]=[],foursquarePlaces:any[]=[],fallbackReason:string|null=null;
  let processed:any[]=[],fallbackUsed=false,mode='geoapify_primary_no_fallback';
  if(providers.includes('geoapify')){
    attempted.push('geoapify');
    if(getGeoapifyKey()){
      try{
        geoapifyPlaces=await geoapifyPlacesSearch(String(payload?.query||textQuery),effectiveDestination,{...options,languageCode,regionCode},restriction,bias);
        geoapifyPlaces=geoapifyPlaces.map((p:any)=>({
          ...p,
          provider:'geoapify',
          source:'geoapify_places',
          providerRefs:{geoapify:String(String(p?.providerPlaceId||p?.id||'').replace(/^geoapify:/,''))},
          evidence:[{provider:'geoapify',kind:'place-search'}]
        }));
      }catch(error:any){
        fallbackReason=isQuotaError(error)?'geoapify_quota':'geoapify_failed';
        providerErrors.push({provider:'geoapify',message:error?.message||String(error),code:error?.code||'PROVIDER_ERROR'});
      }
    }else{
      fallbackReason='geoapify_not_configured';
      providerErrors.push({provider:'geoapify',message:'Geoapify API key ist nicht konfiguriert.',code:'GEOAPIFY_NOT_CONFIGURED'});
    }
    processed=postProcessPlaces(geoapifyPlaces,destination,options);
  }else{
    // Legacy discovery: Google primary with Foursquare fallback.
    if(providers.includes('google')&&getKey()){
      attempted.push('google');
      const body=cleanObject({textQuery,languageCode,regionCode,maxResultCount:Math.min(20,options.maxResultCount||10),includedType:options.includedType||undefined,strictTypeFiltering:Boolean(options.strictTypeFiltering&&options.includedType),openNow:options.openNow||undefined,minRating:options.minRating||undefined,priceLevels:options.priceLevels||undefined,locationRestriction:restriction,locationBias:bias,rankPreference:options.rankPreference||undefined});
      try{const raw=await google('/places:searchText',{method:'POST',body:JSON.stringify(body)},searchFields(options));googlePlaces=(raw.places||[]).map((x:any)=>({...normalizedPlace(x),provider:'google-places',source:'google_places',providerRefs:{google:String(x.id||'').replace(/^places\//,'')},evidence:[{provider:'google',kind:'place-search'}]}))}
      catch(error:any){fallbackReason=isQuotaError(error)?'google_quota':'google_failed';providerErrors.push({provider:'google',message:error?.message||String(error),code:error?.code||'PROVIDER_ERROR'})}
    }else if(providers.includes('google'))fallbackReason='google_not_configured';
    const googleEligible=postProcessPlaces(googlePlaces,destination,options);if(providers.includes('google')&&!fallbackReason&&!googleEligible.length)fallbackReason='google_no_eligible_result';
    const useFoursquare=providers.includes('foursquare')&&getFoursquareKey()&&fallbackReason!=='google_quota'&&(!providers.includes('google')||Boolean(fallbackReason));
    if(useFoursquare){attempted.push('foursquare');try{foursquarePlaces=await foursquareSearch(String(payload?.query||textQuery),effectiveDestination,options)}catch(error:any){providerErrors.push({provider:'foursquare',message:error?.message||String(error),code:error?.code||'PROVIDER_ERROR'})}}
    const foursquareIsFallback=providers.includes('google')&&attempted.includes('foursquare'),all=googleEligible.length&&!fallbackReason?googlePlaces:foursquarePlaces,merged=mergeProviderPlaces(all),legacyProcessed=postProcessPlaces(merged,destination,options);
    processed=legacyProcessed;
    fallbackUsed=foursquareIsFallback;
    mode='google_primary_foursquare_fallback';
  }
  if(attempted.length&&providerErrors.length===attempted.length&&!processed.length)throw Object.assign(new Error('Keine verbundene Ortsquelle konnte die Suche beantworten.'),{code:'PLACES_ALL_PROVIDERS_FAILED',status:503,providerErrors});
  result={places:processed,providers:{mode,requested:providers,attempted,used:[...new Set(processed.flatMap((p:any)=>Object.keys(p.providerRefs||{})))],fallbackUsed,fallbackReason:fallbackUsed?fallbackReason:null,errors:providerErrors},searchContext:{destination,canonicalCity:destination?.canonicalCity||null,landmarkContext:landmark,restriction:restriction||null,bias:bias||null,anchor:searchAnchor(destination,options),profileContext:options.profileContext||null,intentContext:options.intentContext||null,filters:{openNow:Boolean(options.openNow),minRating:options.minRating||null,priceLevels:options.priceLevels||[],vegetarianOnly:Boolean(options.vegetarianOnly),minUserRatingCount:options.minUserRatingCount||0,maxDistanceMeters:Number(options.maxDistanceMeters)||0},sortBy:options.sortBy||'relevance'}};
}
else if(action==='places.nearby-search'){const body=cleanObject({languageCode,regionCode,maxResultCount:options.maxResultCount||10,includedTypes:options.includedTypes?.length?options.includedTypes:(options.includedType?[options.includedType]:undefined),excludedTypes:options.excludedTypes?.length?options.excludedTypes:undefined,includedPrimaryTypes:options.includedPrimaryTypes?.length?options.includedPrimaryTypes:undefined,excludedPrimaryTypes:options.excludedPrimaryTypes?.length?options.excludedPrimaryTypes:undefined,rankPreference:options.rankPreference||'POPULARITY',locationRestriction:{circle:{center:payload.location,radius:payload.radius||3000}}});const raw=await google('/places:searchNearby',{method:'POST',body:JSON.stringify(body)},searchFields(options));const normalized=(raw.places||[]).map(normalizedPlace);result={places:postProcessPlaces(normalized,payload?.destination||{location:payload.location},options)};}
else if(action==='places.autocomplete'){const sessionToken=normalizePlacesSessionToken(options.sessionToken);const body=cleanObject({input:String(payload?.input||''),languageCode,regionCode,sessionToken,locationBias:destinationBias(payload?.destination,options.locationBias),includedPrimaryTypes:options.includedType?[options.includedType]:undefined});const raw=await google('/places:autocomplete',{method:'POST',body:JSON.stringify(body)});result={sessionToken,suggestions:(raw.suggestions||[]).map((s:any)=>({placeId:s.placePrediction?.placeId||null,text:s.placePrediction?.text?.text||s.queryPrediction?.text?.text||'',types:s.placePrediction?.types||[],distanceMeters:s.placePrediction?.distanceMeters??null,raw:s}))};}
else if(action==='places.details'){const rawId=String(payload?.placeId||'').replace(/^places\//,'');if(rawId.startsWith('fsq:')){const fsqId=rawId.slice(4);const raw=await foursquareWithFieldFallback(`/places/${encodeURIComponent(fsqId)}`,{fields:FOURSQUARE_DETAILS_FIELDS.join(',')},FOURSQUARE_PRO_FIELDS);result={place:normalizeFoursquarePlace(raw,{evidenceKind:'place-details'})}}else{const id=encodeURIComponent(rawId);const raw=await google(`/places/${id}?languageCode=${encodeURIComponent(languageCode)}&regionCode=${encodeURIComponent(regionCode)}`,{method:'GET'},DETAIL_FIELDS);result={place:normalizedPlace(raw)}};}
else if(action==='places.photo'){const name=String(payload?.photoName||'');const qs=new URLSearchParams({skipHttpRedirect:'true',maxWidthPx:String(payload?.maxWidthPx||800)});if(payload?.maxHeightPx)qs.set('maxHeightPx',String(payload.maxHeightPx));const raw=await google(`/${name}/media?${qs}`,{method:'GET'});result={photoUri:raw.photoUri||null,name:raw.name||name};}
else throw Object.assign(new Error('Places-Aktion unbekannt.'),{code:'ACTION_NOT_FOUND',status:404});
if(ttl>0)store(key,result,ttl);return{data:result,cache:{hit:false,key,ttlMs:ttl}};}
export function placesDiagnostics(){return{configured:Boolean(getGeoapifyKey()||getKey()||getFoursquareKey()),providerOrder:'geoapify_primary_no_fallback',providers:{geoapify:Boolean(getGeoapifyKey()),google:Boolean(getKey()),foursquare:Boolean(getFoursquareKey()),foursquareApiVersion:FOURSQUARE_API_VERSION,foursquareMappingVersion:FOURSQUARE_MAPPING_VERSION},metrics:{...metrics},cache:{entries:cache.size}};}
