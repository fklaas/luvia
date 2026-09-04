var LuviaPlacesSpatialCompositionCoreV1=(()=>{
'use strict';

const CONTRACT_ID='consumer.places-spatial-composition.v1';
const VERSION='1';
const RUNTIME_VERSION='1.5.0';
const SOURCE_CONTRACT='places.v1';
const INITIAL_VISIBLE_RESULTS=6;
const MAX_RESULTS=80;

const immutable=value=>{
  if(value==null||typeof value!=='object')return value;
  if(Array.isArray(value))return Object.freeze(value.map(immutable));
  return Object.freeze(Object.fromEntries(Object.entries(value).map(([key,item])=>[key,immutable(item)])));
};
const clean=value=>String(value??'').trim();
const providerId=value=>clean(value).replace(/^places\//,'');
const finiteNumber=value=>{
  if(value==null||typeof value==='boolean')return null;
  if(typeof value==='string'&&!value.trim())return null;
  let parsed;
  try{parsed=Number(value)}catch{return null}
  return Number.isFinite(parsed)?parsed:null;
};
const triBool=value=>{
  if(value===true)return true;
  if(value===false)return false;
  return null;
};
const boundedInteger=(value,fallback,min,max)=>{
  const parsed=finiteNumber(value);
  if(parsed==null)return fallback;
  return Math.min(max,Math.max(min,Math.trunc(parsed)));
};

function normalizeCoordinates(input){
  if(!input||typeof input!=='object')return null;
  const latitude=finiteNumber(input.latitude??input.lat);
  const longitude=finiteNumber(input.longitude??input.lng);
  if(latitude==null||longitude==null)return null;
  if(latitude < -90||latitude > 90||longitude < -180||longitude > 180)return null;
  return immutable({latitude,longitude,lngLat:[longitude,latitude]});
}

function categoryEntries(input){
  if(Array.isArray(input))return input.map(item=>[clean(item?.key||item?.id),item]);
  if(!input||typeof input!=='object')return[];
  return Object.entries(input);
}
function normalizeCategories(input){
  const categories=[];
  const seen=new Set();
  for(const [fallbackKey,value] of categoryEntries(input)){
    if(!value||typeof value!=='object')continue;
    const key=clean(value.key||fallbackKey);
    if(!key||seen.has(key))continue;
    seen.add(key);
    categories.push(immutable({
      key,
      label:clean(value.label)||key,
      icon:clean(value.icon)||null,
      primaryType:clean(value.primaryType||value.type)||'custom',
      includedType:clean(value.includedType),
      includedTypes:Array.isArray(value.includedTypes)?value.includedTypes.map(clean).filter(Boolean):[],
      query:clean(value.query),
      order:categories.length
    }));
  }
  return Object.freeze(categories);
}

function stringMap(input){
  if(!input||typeof input!=='object'||Array.isArray(input))return immutable({});
  return immutable(Object.fromEntries(Object.entries(input).map(([key,value])=>[clean(key),clean(value)]).filter(([key,value])=>key&&value)));
}
function stringArray(input){return Object.freeze((Array.isArray(input)?input:[]).map(clean).filter(Boolean))}
function imageProjection(input){
  if(!input||typeof input!=='object')return null;
  const url=clean(input.url||input.uri);
  if(!url)return null;
  return immutable({url,alt:clean(input.alt)||null,attribution:clean(input.attribution)||null});
}
function normalizePlace(input){
  if(!input||typeof input!=='object')return null;
  const id=clean(input.id||input.placeId||input.place_id);
  const externalId=providerId(input.providerPlaceId||input.provider_place_id||input.sourceId||input.source_id||id);
  if(!externalId)return null;
  const coordinates=normalizeCoordinates(input.coordinates||input.position||input.location||{
    latitude:input.latitude,
    longitude:input.longitude
  });
  return immutable({
    id:id||externalId,
    providerPlaceId:externalId,
    tripPlaceId:clean(input.tripPlaceId||input.trip_place_id)||null,
    primaryType:clean(input.primaryType||input.primary_type)||'custom',
    category:clean(input.category)||null,
    types:stringArray(input.types),
    name:clean(input.name||input.displayName?.text||input.displayName||input.shortAddress||input.address||input.formattedAddress||input.formatted_address||input.primaryTypeLabel)||'Unbenannter Ort',
    description:clean(input.description),
    address:clean(input.address||input.formattedAddress||input.formatted_address||input.shortAddress),
    coordinates,
    rating:finiteNumber(input.rating),
    userRatingCount:finiteNumber(input.userRatingCount??input.user_rating_count),
    distanceMeters:finiteNumber(input.distanceMeters??input.distance_meters),
    aiMatchScore:finiteNumber(input.aiMatchScore??input.ai_match_score??input.discoveryScore),
    preferenceScore:finiteNumber(input.preferenceFit?.score??input.groupFit?.score??input.preferenceScore),
    preferenceDiscoveryMatch:typeof input.preferenceDiscoveryMatch==='boolean'?input.preferenceDiscoveryMatch:null,
    preferenceCoverage:finiteNumber(input.preferenceFit?.coverage??input.groupFit?.coverage),
    preferenceReasons:stringArray(input.preferenceReasons||input.aiReasons||input._luviaReasons),
    preferenceConstraintState:clean(input.preferenceConstraintState)||null,
    priceLevel:clean(input.priceLevel||input.price_level)||null,
    openNow:typeof input.openNow==='boolean'?input.openNow:(typeof input.currentOpeningHours?.openNow==='boolean'?input.currentOpeningHours.openNow:null),
    lifecycle:clean(input.lifecycle||input.lifecycleStatus||input.lifecycle_status||input.status)||'discovered',
    isFavorite:typeof input.isFavorite==='boolean'?input.isFavorite:(typeof input.is_favorite==='boolean'?input.is_favorite:null),
    mapsUrl:clean(input.mapsUrl||input.googleMapsUri||input.google_maps_uri)||null,
    website:clean(input.website||input.websiteUri||input.website_uri)||null,
    phone:clean(input.phone||input.internationalPhoneNumber||input.nationalPhoneNumber)||null,
    providerRefs:stringMap(input.providerRefs),
    capabilities:stringArray(input.capabilities),
    bookingDomains:stringArray(input.bookingDomains),
    features:immutable({
      reservable:triBool(input.features?.reservable),
      servesVegetarianFood:triBool(input.features?.servesVegetarianFood),
      servesVeganFood:triBool(input.features?.servesVeganFood),
      goodForChildren:triBool(input.features?.goodForChildren)
    }),
    accessibilityOptions:immutable({wheelchairAccessibleEntrance:triBool(input.accessibilityOptions?.wheelchairAccessibleEntrance)}),
    aiReasons:stringArray(input.aiReasons||input._luviaReasons),
    aiUnknowns:stringArray(input.aiUnknowns),
    businessStatus:clean(input.businessStatus||input.business_status)||null,
    image:imageProjection(input.image),
    sourceContract:SOURCE_CONTRACT
  });
}
function normalizeResults(input){
  const results=[];
  const seen=new Set();
  for(const item of Array.isArray(input)?input:[]){
    const place=normalizePlace(item);
    if(!place||seen.has(place.providerPlaceId))continue;
    seen.add(place.providerPlaceId);
    results.push(immutable({...place,rank:results.length+1}));
    if(results.length===MAX_RESULTS)break;
  }
  return Object.freeze(results);
}

function preferredResultIds(results){
  return new Set((Array.isArray(results)?results:[])
    .filter(result=>result?.coordinates&&(result.preferenceDiscoveryMatch===true||(result.preferenceDiscoveryMatch==null&&result.preferenceScore!=null&&result.preferenceScore>0&&result.preferenceCoverage>0&&result.preferenceReasons.length>0&&result.preferenceConstraintState==='satisfied')))
    .map(result=>result.providerPlaceId));
}

function markerProjection(result,preferred=false){
  if(!result?.coordinates)return null;
  return immutable({
    providerPlaceId:result.providerPlaceId,
    resultId:`place-result-${result.rank}`,
    name:result.name,
    rank:result.rank,
    preferred,
    latitude:result.coordinates.latitude,
    longitude:result.coordinates.longitude,
    lngLat:[result.coordinates.longitude,result.coordinates.latitude],
    sourceContract:SOURCE_CONTRACT
  });
}
function boundsProjection(markers){
  if(!markers.length)return null;
  let west=markers[0].longitude,east=west,south=markers[0].latitude,north=south;
  for(const marker of markers.slice(1)){
    west=Math.min(west,marker.longitude);
    east=Math.max(east,marker.longitude);
    south=Math.min(south,marker.latitude);
    north=Math.max(north,marker.latitude);
  }
  return immutable({
    west,east,south,north,
    southWest:[west,south],
    northEast:[east,north],
    lngLatBounds:[[west,south],[east,north]]
  });
}

function publicErrorMessage(error){
  const supplied=clean(error?.publicMessage||error?.userMessage);
  if(supplied)return supplied;
  const code=clean(error?.code).toUpperCase();
  const status=Number(error?.status)||0;
  if(status===429||/RATE|QUOTA|429/.test(code))return'Das Kontingent der Ortsquelle ist gerade erreicht. Bitte kurz warten oder den Provider-Tarif prüfen.';
  if(status===401||status===403||/AUTH|SESSION|PERMISSION|401|403/.test(code))return'Die Berechtigung für die primäre Ortssuche muss geprüft werden.';
  if(/PLACES_ALL_PROVIDERS_FAILED|PROVIDER_READ_INCOMPLETE/.test(code))return'Keine verbundene Ortsquelle konnte diese Suche vollständig beantworten.';
  return'Die Ortsquellen konnten gerade nicht geladen werden. Deine bisherigen Reiseangaben bleiben erhalten.';
}
function projectStatus(runtime={},resultCount=0){
  const requested=clean(runtime.status).toLowerCase();
  let kind='ready';
  if(runtime.loading===true||requested==='loading')kind='loading';
  else if(runtime.offline===true||requested==='offline')kind='offline';
  else if(runtime.error||requested==='error')kind='error';
  else if(requested==='empty'||runtime.settled===true&&resultCount===0)kind='empty';
  const messages={
    loading:'Luvia prüft echte Orte …',
    ready:resultCount?`${resultCount} passende Orte gefunden.`:'Beschreibt, was ihr entdecken möchtet.',
    empty:'Noch kein Ort passt zuverlässig zu eurer Suche.',
    error:publicErrorMessage(runtime.error),
    offline:resultCount?'Offline – gespeicherte Orte bleiben sichtbar.':'Offline – die Live-Suche ist gerade nicht verfügbar.'
  };
  return immutable({
    kind,
    busy:kind==='loading',
    ariaRole:kind==='error'?'alert':'status',
    ariaLive:kind==='error'?'assertive':'polite',
    message:messages[kind],
    hasResults:resultCount>0,
    stale:kind==='offline'&&resultCount>0,
    canRetry:kind==='empty'||kind==='error'||kind==='offline'
  });
}

function compose(input={}){
  const sourceContract=clean(input.sourceContract||input.contractId)||SOURCE_CONTRACT;
  if(sourceContract!==SOURCE_CONTRACT)throw new TypeError(`Places Spatial Composition benötigt ${SOURCE_CONTRACT}.`);
  const categories=normalizeCategories(input.categories);
  const results=normalizeResults(input.places||input.results);
  const visibleLimit=boundedInteger(input.visibleLimit,INITIAL_VISIBLE_RESULTS,1,MAX_RESULTS);
  const visibleResults=Object.freeze(results.slice(0,visibleLimit));
  const preferredIds=preferredResultIds(visibleResults);
  const markers=Object.freeze(visibleResults.map(result=>markerProjection(result,preferredIds.has(result.providerPlaceId))).filter(Boolean));
  const mapOmissions=Object.freeze(visibleResults.filter(result=>!result.coordinates).map(result=>immutable({
    providerPlaceId:result.providerPlaceId,
    resultId:`place-result-${result.rank}`,
    reason:'missing-or-invalid-owner-coordinates'
  })));
  return immutable({
    contractId:CONTRACT_ID,
    version:VERSION,
    sourceContract:SOURCE_CONTRACT,
    categories,
    results,
    visibleResults,
    markers,
    mapOmissions,
    bounds:boundsProjection(markers),
    status:projectStatus(input.runtime||{},results.length),
    counts:{total:results.length,visible:visibleResults.length,remaining:Math.max(0,results.length-visibleResults.length),markers:markers.length,omittedFromMap:mapOmissions.length},
    policy:{initialVisibleResults:INITIAL_VISIBLE_RESULTS,maxResults:MAX_RESULTS,preferredMarkers:'all-positive-evidence-backed-hard-requirements-satisfied',unknownEvidence:'visible-in-all-excluded-from-preferred',coordinateOrder:'longitude-latitude',coordinateSystem:'WGS84',syntheticMarkers:false,domainTruth:false}
  });
}

function diagnostics(){
  return immutable({
    contractId:CONTRACT_ID,
    version:VERSION,
    runtimeVersion:RUNTIME_VERSION,
    sourceContract:SOURCE_CONTRACT,
    browserless:true,
    deterministic:true,
    domainTruth:false,
    initialVisibleResults:INITIAL_VISIBLE_RESULTS,
    maxResults:MAX_RESULTS,
    coordinatePolicy:'complete-finite-wgs84-owner-projection-only',
    coordinateOrder:'longitude-latitude',
    syntheticMarkers:false,
    states:['loading','ready','empty','error','offline']
  });
}

return Object.freeze({
  contractId:CONTRACT_ID,
  version:VERSION,
  runtimeVersion:RUNTIME_VERSION,
  sourceContract:SOURCE_CONTRACT,
  initialVisibleResults:INITIAL_VISIBLE_RESULTS,
  maxResults:MAX_RESULTS,
  normalizeCoordinates,
  normalizeCategories,
  normalizeResults,
  projectStatus,
  compose,
  diagnostics
});
})();
