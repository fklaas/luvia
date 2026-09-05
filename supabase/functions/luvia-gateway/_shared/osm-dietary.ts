import {providerFetch} from './provider-budget.ts';

// Public Overpass instances can be temporarily saturated independently. Keep
// the read on the same OpenStreetMap dataset, but hedge one bounded request
// across two independently operated, officially listed instances. The first
// successful response wins and the six-hour evidence cache prevents repeated
// reads for the same destination/radius/profile focus.
const OVERPASS_ENDPOINTS=Object.freeze([
  'https://overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter'
]);
const OVERPASS_HEDGE_DELAY_MS=1200;
const OVERPASS_REQUEST_TIMEOUT_MS=6500;
const CACHE_TTL_MS=6*60*60_000;
const cache=new Map<string,{expires:number,promise:Promise<any[]>}>();
let preferredEndpointIndex=0;

const clean=(value:any)=>String(value??'').trim();
const coordinate=(value:any)=>{
  const latitude=Number(value?.latitude??value?.lat),longitude=Number(value?.longitude??value?.lng??value?.lon);
  return Number.isFinite(latitude)&&Number.isFinite(longitude)?{latitude,longitude}:null;
};
const token=(value:any)=>clean(value).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'');
const dietYes=(value:any)=>['yes','only'].includes(clean(value).toLowerCase());
const dietNo=(value:any)=>['no','none'].includes(clean(value).toLowerCase());
const radians=(value:number)=>value*Math.PI/180;
function distanceMeters(left:any,right:any){
  const a=coordinate(left),b=coordinate(right);if(!a||!b)return Infinity;
  const dLat=radians(b.latitude-a.latitude),dLon=radians(b.longitude-a.longitude),lat1=radians(a.latitude),lat2=radians(b.latitude),h=Math.sin(dLat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
  return 6371000*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));
}

function address(tags:any={}){
  const street=[clean(tags['addr:street']),clean(tags['addr:housenumber'])].filter(Boolean).join(' ');
  const city=[clean(tags['addr:postcode']),clean(tags['addr:city'])].filter(Boolean).join(' ');
  return [street,city].filter(Boolean).join(', ');
}

function primaryType(amenity:string){
  return ({restaurant:'restaurant',cafe:'cafe',fast_food:'meal_takeaway',bar:'bar',pub:'bar',biergarten:'bar'} as Record<string,string>)[amenity]||'restaurant';
}

const CUISINE_TYPES:Record<string,string>=Object.freeze({
  italian:'italian_restaurant',german:'german_restaurant',mediterranean:'mediterranean_restaurant',greek:'greek_restaurant',french:'french_restaurant',spanish:'spanish_restaurant',indian:'indian_restaurant',asian:'asian_restaurant',chinese:'chinese_restaurant',japanese:'japanese_restaurant',thai:'thai_restaurant',vietnamese:'vietnamese_restaurant',korean:'korean_restaurant',mexican:'mexican_restaurant',lebanese:'lebanese_restaurant',turkish:'turkish_restaurant',middle_eastern:'middle_eastern_restaurant'
});

const AMENITY_TYPES:Record<string,string>=Object.freeze({restaurant:'restaurant',cafe:'cafe',fast_food:'meal_takeaway',food_court:'food_court',bar:'bar',pub:'pub',biergarten:'biergarten',nightclub:'night_club',casino:'casino',music_venue:'live_music_venue',theatre:'performing_arts_theater',cinema:'movie_theater',arts_centre:'art_gallery',concert_hall:'concert_hall',bowling_alley:'amusement_center',escape_game:'amusement_center',spa:'spa',public_bath:'spa',marketplace:'market',pharmacy:'pharmacy',parking:'parking',charging_station:'electric_vehicle_charging_station',atm:'atm',fuel:'gas_station',toilets:'public_toilet'});
const TOURISM_TYPES:Record<string,string>=Object.freeze({hotel:'hotel',guest_house:'guest_house',apartment:'apartment',hostel:'hostel',motel:'motel',camp_site:'campground',caravan_site:'campground',chalet:'vacation_rental',museum:'museum',gallery:'art_gallery',attraction:'tourist_attraction',viewpoint:'observation_deck',theme_park:'amusement_park',aquarium:'aquarium',zoo:'zoo'});
const LEISURE_TYPES:Record<string,string>=Object.freeze({park:'park',garden:'garden',nature_reserve:'natural_feature',playground:'playground',swimming_pool:'swimming_pool',water_park:'water_park',marina:'marina',fitness_centre:'fitness_center',sports_centre:'sports_activity_location',stadium:'stadium',pitch:'sports_activity_location',track:'sports_activity_location',golf_course:'sports_activity_location',miniature_golf:'amusement_center',horse_riding:'sports_activity_location',ice_rink:'skating_rink',spa:'spa',sauna:'spa'});
const TYPE_LABELS:Record<string,string>=Object.freeze({restaurant:'Restaurant',cafe:'Café',meal_takeaway:'Imbiss',food_court:'Food Court',bar:'Bar',pub:'Pub',biergarten:'Biergarten',night_club:'Club',casino:'Casino',live_music_venue:'Live-Musik',performing_arts_theater:'Theater',movie_theater:'Kino',art_gallery:'Galerie',concert_hall:'Konzertort',hotel:'Hotel',guest_house:'Gästehaus',apartment:'Apartment',hostel:'Hostel',motel:'Motel',campground:'Camping',vacation_rental:'Ferienhaus',museum:'Museum',tourist_attraction:'Sehenswürdigkeit',observation_deck:'Aussichtspunkt',amusement_park:'Freizeitpark',aquarium:'Aquarium',zoo:'Zoo',park:'Park',garden:'Garten',natural_feature:'Naturort',playground:'Spielplatz',swimming_pool:'Schwimmbad',water_park:'Wasserpark',marina:'Hafen',spa:'Wellness',shopping_mall:'Einkaufszentrum',department_store:'Kaufhaus',clothing_store:'Modegeschäft',supermarket:'Supermarkt',store:'Geschäft',market:'Markt',pharmacy:'Apotheke',parking:'Parkplatz',electric_vehicle_charging_station:'Ladestation',atm:'Geldautomat',gas_station:'Tankstelle'});

function osmTypeProjection(tags:any={}){
  const amenity=token(tags.amenity),tourism=token(tags.tourism),leisure=token(tags.leisure),shop=token(tags.shop),natural=token(tags.natural),historic=token(tags.historic),manMade=token(tags.man_made),club=token(tags.club);
  let type=AMENITY_TYPES[amenity]||TOURISM_TYPES[tourism]||LEISURE_TYPES[leisure]||'';
  if(!type&&shop)type=shop==='mall'?'shopping_mall':shop==='department_store'?'department_store':shop==='clothes'?'clothing_store':shop==='supermarket'||shop==='convenience'?'supermarket':shop==='bakery'?'bakery':shop==='laundry'?'laundry':'store';
  if(!type&&natural)type=natural==='beach'?'beach':'natural_feature';
  if(!type&&historic)type=['monument','memorial'].includes(historic)?'monument':'historical_landmark';
  if(!type&&['tower','lighthouse','obelisk'].includes(manMade))type='observation_deck';
  if(!type&&club)type=club==='music'?'live_music_venue':'night_club';
  if(!type&&token(tags.route)==='hiking')type='hiking_area';
  const cuisines=clean(tags.cuisine).split(/[;,]/).map(token).filter(Boolean),types=[type,amenity,tourism,leisure,natural,historic,shop,...cuisines.map(value=>CUISINE_TYPES[value]).filter(Boolean)];
  if(TOURISM_TYPES[tourism]&&['hotel','guest_house','apartment','hostel','motel','camp_site','caravan_site','chalet'].includes(tourism))types.push('accommodation','lodging');
  if(shop||amenity==='marketplace')types.push('shopping');
  if(LEISURE_TYPES[leisure]||['bowling_alley','escape_game'].includes(amenity))types.push('activity');
  if(['attraction','viewpoint','museum','gallery','theme_park','aquarium','zoo'].includes(tourism)||historic||['tower','lighthouse','obelisk'].includes(manMade))types.push('attraction','tourist_attraction');
  if(natural||['park','garden','nature_reserve'].includes(leisure)||token(tags.route)==='hiking')types.push('nature');
  if(['bar','pub','biergarten','nightclub','casino','music_venue'].includes(amenity)||club)types.push('nightlife_spot');
  if(clean(tags['diet:vegetarian']).toLowerCase()==='only')types.push('vegetarian_restaurant');
  if(clean(tags['diet:vegan']).toLowerCase()==='only')types.push('vegan_restaurant');
  return{primaryType:type||'custom',types:[...new Set(types.filter(Boolean))],cuisines,amenity};
}

export function normalizeOsmPlaceElement(element:any,destination:any={}){
  const tags=element?.tags&&typeof element.tags==='object'?element.tags:{},name=clean(tags.name||tags['name:de']||tags.brand),location=coordinate(element)||coordinate(element?.center),kind=clean(element?.type),nativeId=clean(element?.id);
  if(!name||!location||!['node','way','relation'].includes(kind)||!nativeId)return null;
  const projection=osmTypeProjection(tags);if(projection.primaryType==='custom')return null;
  const vegetarian=dietYes(tags['diet:vegetarian'])||dietYes(tags['diet:vegan']),vegan=dietYes(tags['diet:vegan']),sourceId=`${kind}/${nativeId}`,id=`openstreetmap:${sourceId}`;
  const image=clean(tags.image),photos=/^https:\/\//i.test(image)?[{uri:image,attribution:'Bild aus dem verknüpften OpenStreetMap-Ortseintrag',sourceUrl:`https://www.openstreetmap.org/${sourceId}`,provider:'openstreetmap',entityReference:id,verified:true}]:[];
  return{
    id,providerPlaceId:id,resourceName:`openstreetmap/${sourceId}`,name,displayName:name,languageCode:'de',formattedAddress:address(tags),shortAddress:clean(tags['addr:street']||tags['addr:city']),addressComponents:[],country:'',countryCode:clean(tags['addr:country']||destination?.countryCode).toUpperCase(),
    location,viewport:null,primaryType:projection.primaryType,primaryTypeLabel:TYPE_LABELS[projection.primaryType]||name,types:projection.types,providerNativeTypes:[...new Set([projection.amenity,token(tags.tourism),token(tags.leisure),token(tags.shop),token(tags.natural),token(tags.historic),token(tags.man_made),token(tags.club),token(tags.route)].filter(Boolean))],
    rating:null,userRatingCount:null,priceLevel:null,businessStatus:null,openNow:null,openingHours:clean(tags.opening_hours)||null,website:clean(tags.website||tags['contact:website'])||null,mapsUri:`https://www.openstreetmap.org/${sourceId}`,phone:clean(tags.phone||tags['contact:phone'])||null,photos,editorialSummary:clean(tags.description||tags['description:de'])||null,reviews:[],
    accessibility:null,accessibilityOptions:clean(tags.wheelchair).toLowerCase()==='yes'?{wheelchairAccessibleEntrance:true}:clean(tags.wheelchair).toLowerCase()==='no'?{wheelchairAccessibleEntrance:false}:null,parkingOptions:null,evChargeOptions:null,fuelOptions:null,subDestinations:[],
    features:{reservable:['yes','required','recommended'].includes(clean(tags.reservation).toLowerCase())?true:clean(tags.reservation).toLowerCase()==='no'?false:null,servesVegetarianFood:vegetarian?true:dietNo(tags['diet:vegetarian'])?false:null,servesVeganFood:vegan?true:dietNo(tags['diet:vegan'])?false:null,goodForChildren:null},
    provider:'openstreetmap',source:'openstreetmap_overpass',providerRefs:{openstreetmap:sourceId},evidence:[{provider:'openstreetmap',kind:'place-search',observedAt:new Date().toISOString()}],attribution:'© OpenStreetMap contributors',attributionUrl:'https://www.openstreetmap.org/copyright',ownerObservedAt:new Date().toISOString(),
    raw:{osmType:kind,osmId:nativeId,amenity:clean(tags.amenity),tourism:clean(tags.tourism),leisure:clean(tags.leisure),shop:clean(tags.shop),natural:clean(tags.natural),historic:clean(tags.historic),cuisine:clean(tags.cuisine),'diet:vegetarian':clean(tags['diet:vegetarian']),'diet:vegan':clean(tags['diet:vegan']),wikidata:clean(tags.wikidata),wiki_and_media:{wikidata:clean(tags.wikidata),wikimedia_commons:clean(tags.wikimedia_commons)},image}
  };
}

export function normalizeOsmDietaryElement(element:any,destination:any={}){
  const place=normalizeOsmPlaceElement(element,destination);if(!place)return null;
  if(place.features?.servesVegetarianFood!==true&&place.features?.servesVeganFood!==true)return null;
  return{...place,evidence:[{provider:'openstreetmap',kind:'explicit-diet-tag',observedAt:new Date().toISOString()}]};
}

export function osmDietaryConfiguration(){
  return Object.freeze({configured:true,priority:'cached_category_continuity_and_dietary_evidence_fallback',scope:'14_whitelisted_luvia_categories_and_explicit_diet_tags',automaticCascade:true,transport:Deno.env.get('OSM_DIETARY_PROXY_URL')&&Deno.env.get('OSM_DIETARY_PROXY_TOKEN')?'authenticated_edge_proxy':'direct_instance_failover',endpointFailover:'hedged_independent_instances',endpointCount:OVERPASS_ENDPOINTS.length,cacheTtlHours:CACHE_TTL_MS/3_600_000,maximumRadiusMeters:15000,arbitraryQuery:false,attribution:'© OpenStreetMap contributors'});
}

async function overpassElements(query:string){
  const order=[...OVERPASS_ENDPOINTS.keys()].map(offset=>(preferredEndpointIndex+offset)%OVERPASS_ENDPOINTS.length);
  const controllers=order.map(()=>new AbortController());
  let fallbackStarted=false,startFallback:()=>void=()=>{};
  const read=async(index:number,controller:AbortController)=>{
    const endpoint=OVERPASS_ENDPOINTS[index],timeout=setTimeout(()=>controller.abort('overpass-timeout'),OVERPASS_REQUEST_TIMEOUT_MS);
    try{
      const response=await providerFetch('openstreetmap','search',1,endpoint,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8','User-Agent':'Luvia/1.0 dietary-place-evidence'},body:new URLSearchParams({data:query}).toString(),signal:controller.signal});
      const body=await response.json().catch(()=>({}));
      if(!response.ok||!Array.isArray(body?.elements))throw Object.assign(new Error('OpenStreetMap-Ernährungshinweise sind auf dieser Instanz gerade nicht erreichbar.'),{code:'OSM_DIETARY_PROVIDER_ERROR',status:response.status,provider:'openstreetmap',endpoint});
      preferredEndpointIndex=index;
      return body.elements;
    }finally{clearTimeout(timeout)}
  };
  const primary=read(order[0],controllers[0]).catch(error=>{startFallback();throw error});
  const fallback=new Promise<any[]>((resolve,reject)=>{
    startFallback=()=>{
      if(fallbackStarted)return;
      fallbackStarted=true;
      read(order[1],controllers[1]).then(resolve,reject);
    };
  });
  const hedge=setTimeout(startFallback,OVERPASS_HEDGE_DELAY_MS);
  try{
    const elements=await Promise.any([primary,fallback]);
    clearTimeout(hedge);
    controllers.forEach(controller=>controller.abort('overpass-winner-selected'));
    return elements;
  }catch{
    throw Object.assign(new Error('OpenStreetMap-Ernährungshinweise sind gerade nicht erreichbar.'),{code:'OSM_DIETARY_PROVIDER_ERROR',status:503,provider:'openstreetmap'});
  }finally{clearTimeout(hedge)}
}

async function proxyElements(center:{latitude:number;longitude:number},radius:number,veganOnly:boolean){
  const endpoint=clean(Deno.env.get('OSM_DIETARY_PROXY_URL')),tokenValue=clean(Deno.env.get('OSM_DIETARY_PROXY_TOKEN'));
  if(!endpoint||!tokenValue)return null;
  const response=await providerFetch('openstreetmap','search',1,endpoint,{method:'POST',headers:{'Content-Type':'application/json','X-Luvia-Provider-Token':tokenValue},body:JSON.stringify({latitude:center.latitude,longitude:center.longitude,radius,veganOnly}),signal:AbortSignal.timeout(10000)},{provider:'openstreetmap-cache',operation:'lookup'});
  const body=await response.json().catch(()=>({}));
  if(!response.ok||body?.ok!==true||!Array.isArray(body?.elements))throw Object.assign(new Error('Der OSM-Evidenzproxy antwortet gerade nicht.'),{code:'OSM_DIETARY_PROXY_ERROR',status:response.status,provider:'openstreetmap'});
  return body.elements;
}

export async function osmDietarySearch(destination:any={},options:any={}){
  const center=coordinate(destination?.location||destination?.center||destination?.canonicalCity?.center);
  if(!center)throw Object.assign(new Error('Für OSM-Ernährungshinweise fehlen Zielkoordinaten.'),{code:'OSM_DIETARY_LOCATION_REQUIRED',status:400,provider:'openstreetmap'});
  const requested=clean(options?.strictPlaceType||options?.includedType),veganOnly=requested==='vegan_restaurant';
  if(!veganOnly&&requested!=='vegetarian_restaurant'&&options?.vegetarianOnly!==true)return[];
  const radius=Math.max(500,Math.min(15000,Math.round(Number(options?.maxDistanceMeters||destination?.searchRadiusMeters||8000))));
  const key=JSON.stringify([Number(center.latitude).toFixed(4),Number(center.longitude).toFixed(4),radius,veganOnly?'vegan':'vegetarian']);
  const hit=cache.get(key);if(hit&&hit.expires>Date.now())return hit.promise;
  // A small bounding box uses Overpass indexes far more efficiently than two
  // repeated around filters. The exact circular radius is applied again below.
  const latitudeDelta=radius/111320,longitudeDelta=radius/(111320*Math.max(.2,Math.cos(radians(center.latitude))));
  const bounds=[center.latitude-latitudeDelta,center.longitude-longitudeDelta,center.latitude+latitudeDelta,center.longitude+longitudeDelta].map(value=>value.toFixed(6)).join(',');
  const amenity='^(restaurant|cafe|fast_food|bar|pub|biergarten)$',area=`(${bounds})`;
  const statements=veganOnly
    ?`nwr${area}[amenity~"${amenity}"]["diet:vegan"~"^(yes|only)$"];`
    :`nwr${area}[amenity~"${amenity}"]["diet:vegetarian"~"^(yes|only)$"];nwr${area}[amenity~"${amenity}"]["diet:vegan"~"^(yes|only)$"];`;
  const query=`[out:json][timeout:7];(${statements});out center tags;`;
  const promise=(async()=>{
    const elements=await proxyElements(center,radius,veganOnly)||await overpassElements(query);
    const rows=elements.map((element:any)=>normalizeOsmDietaryElement(element,destination)).filter((place:any)=>place&&distanceMeters(center,place.location)<=radius);
    const unique=[...new Map(rows.map((place:any)=>[place.providerPlaceId,place])).values()];
    return unique.slice(0,Math.max(1,Math.min(50,Number(options?.maxResultCount)||40)));
  })().catch(error=>{cache.delete(key);throw error});
  cache.set(key,{expires:Date.now()+CACHE_TTL_MS,promise});
  while(cache.size>128)cache.delete(cache.keys().next().value);
  return promise;
}

const OSM_CATEGORY_KEYS=new Set(['food','accommodation','activities','themeparks','wellness','water','sights','photo','culture','nature','shopping','malls','nightlife','practical']);
const GENERAL_CACHE_TTL_MS=6*60*60_000;
const generalCache=new Map<string,{expires:number,promise:Promise<any[]>}>();

function requestedStrictType(options:any={}){
  const explicit=clean(options.strictPlaceType||'');if(explicit)return token(explicit);
  const selected=Array.isArray(options.includedTypes)?options.includedTypes.map(token).filter(Boolean):[];
  return options.strictTypeFiltering===true&&selected.length===1?selected[0]:'';
}

async function proxyPlaceElements(center:{latitude:number;longitude:number},radius:number,category:string,strictType:string){
  const dietaryEndpoint=clean(Deno.env.get('OSM_DIETARY_PROXY_URL')),configuredEndpoint=clean(Deno.env.get('OSM_PLACES_PROXY_URL'));
  const endpoint=configuredEndpoint||(dietaryEndpoint?dietaryEndpoint.replace(/\/osm-dietary(?:\?.*)?$/,'/osm-places'):'');
  const tokenValue=clean(Deno.env.get('OSM_DIETARY_PROXY_TOKEN'));if(!endpoint||!tokenValue)return null;
  const response=await providerFetch('openstreetmap','search',1,endpoint,{method:'POST',headers:{'Content-Type':'application/json','X-Luvia-Provider-Token':tokenValue},body:JSON.stringify({latitude:center.latitude,longitude:center.longitude,radius,category,strictType}),signal:AbortSignal.timeout(10000)},{provider:'openstreetmap-cache',operation:'lookup'});
  const body=await response.json().catch(()=>({}));
  if(!response.ok||body?.ok!==true||!Array.isArray(body?.elements))throw Object.assign(new Error('Der OSM-Kontinuitätsproxy antwortet gerade nicht.'),{code:'OSM_PLACES_PROXY_ERROR',status:response.status,provider:'openstreetmap'});
  return body.elements;
}

export async function osmPlacesSearch(destination:any={},options:any={}){
  const center=coordinate(destination?.location||destination?.center||destination?.canonicalCity?.center);if(!center)throw Object.assign(new Error('Für die OSM-Kategoriesuche fehlen Zielkoordinaten.'),{code:'OSM_PLACES_LOCATION_REQUIRED',status:400,provider:'openstreetmap'});
  const category=token(options.category||options.type);if(!OSM_CATEGORY_KEYS.has(category))return[];
  const strictType=requestedStrictType(options),radius=Math.max(500,Math.min(15000,Math.round(Number(options?.maxDistanceMeters||destination?.searchRadiusMeters||8000))));
  const key=JSON.stringify([Number(center.latitude).toFixed(4),Number(center.longitude).toFixed(4),radius,category,strictType]),hit=generalCache.get(key);if(hit&&hit.expires>Date.now())return hit.promise;
  const promise=(async()=>{
    const elements=await proxyPlaceElements(center,radius,category,strictType);if(!elements)throw Object.assign(new Error('Der authentifizierte OSM-Kontinuitätsproxy ist nicht konfiguriert.'),{code:'OSM_PLACES_PROXY_NOT_CONFIGURED',status:503,provider:'openstreetmap'});
    const rows=elements.map((element:any)=>normalizeOsmPlaceElement(element,destination)).filter((place:any)=>place&&distanceMeters(center,place.location)<=radius),unique=[...new Map(rows.map((place:any)=>[place.providerPlaceId,place])).values()];
    return unique.slice(0,Math.max(1,Math.min(80,Number(options?.maxResultCount)||50)));
  })().catch(error=>{generalCache.delete(key);throw error});
  generalCache.set(key,{expires:Date.now()+GENERAL_CACHE_TTL_MS,promise});while(generalCache.size>128)generalCache.delete(generalCache.keys().next().value);return promise;
}
