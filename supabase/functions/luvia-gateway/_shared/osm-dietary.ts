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

export function normalizeOsmDietaryElement(element:any,destination:any={}){
  const tags=element?.tags&&typeof element.tags==='object'?element.tags:{};
  const name=clean(tags.name||tags['name:de']||tags.brand);
  const location=coordinate(element)||coordinate(element?.center);
  const kind=clean(element?.type),nativeId=clean(element?.id);
  if(!name||!location||!['node','way','relation'].includes(kind)||!nativeId)return null;
  const amenity=token(tags.amenity),vegetarian=dietYes(tags['diet:vegetarian'])||dietYes(tags['diet:vegan']),vegan=dietYes(tags['diet:vegan']);
  if(!vegetarian&&!vegan)return null;
  const cuisines=clean(tags.cuisine).split(/[;,]/).map(token).filter(Boolean),types=[primaryType(amenity),amenity,...cuisines.map(value=>CUISINE_TYPES[value]).filter(Boolean)];
  if(clean(tags['diet:vegetarian']).toLowerCase()==='only')types.push('vegetarian_restaurant');
  if(clean(tags['diet:vegan']).toLowerCase()==='only')types.push('vegan_restaurant');
  const sourceId=`${kind}/${nativeId}`,id=`openstreetmap:${sourceId}`;
  return{
    id,providerPlaceId:id,resourceName:`openstreetmap/${sourceId}`,name,displayName:name,languageCode:'de',
    formattedAddress:address(tags),shortAddress:clean(tags['addr:street']||tags['addr:city']),addressComponents:[],country:'',countryCode:clean(tags['addr:country']||destination?.countryCode).toUpperCase(),
    location,viewport:null,primaryType:primaryType(amenity),primaryTypeLabel:amenity==='cafe'?'Café':amenity==='fast_food'?'Imbiss':amenity==='bar'?'Bar':amenity==='pub'?'Pub':amenity==='biergarten'?'Biergarten':'Restaurant',types:[...new Set(types.filter(Boolean))],
    rating:null,userRatingCount:null,priceLevel:null,businessStatus:null,openNow:null,openingHours:clean(tags.opening_hours)||null,
    website:clean(tags.website||tags['contact:website'])||null,mapsUri:`https://www.openstreetmap.org/${sourceId}`,phone:clean(tags.phone||tags['contact:phone'])||null,photos:[],editorialSummary:null,reviews:[],
    accessibility:null,accessibilityOptions:clean(tags.wheelchair).toLowerCase()==='yes'?{wheelchairAccessibleEntrance:true}:clean(tags.wheelchair).toLowerCase()==='no'?{wheelchairAccessibleEntrance:false}:null,
    parkingOptions:null,evChargeOptions:null,fuelOptions:null,subDestinations:[],
    features:{reservable:['yes','required','recommended'].includes(clean(tags.reservation).toLowerCase())?true:clean(tags.reservation).toLowerCase()==='no'?false:null,servesVegetarianFood:vegetarian,servesVeganFood:vegan,goodForChildren:null},
    provider:'openstreetmap',source:'openstreetmap_overpass',providerRefs:{openstreetmap:sourceId},evidence:[{provider:'openstreetmap',kind:'explicit-diet-tag',observedAt:new Date().toISOString()}],
    attribution:'© OpenStreetMap contributors',attributionUrl:'https://www.openstreetmap.org/copyright',ownerObservedAt:new Date().toISOString(),raw:{osmType:kind,osmId:nativeId,amenity:clean(tags.amenity),cuisine:clean(tags.cuisine),'diet:vegetarian':clean(tags['diet:vegetarian']),'diet:vegan':clean(tags['diet:vegan'])}
  };
}

export function osmDietaryConfiguration(){
  return Object.freeze({configured:true,priority:'free_dietary_evidence_fallback',scope:'explicit_diet_tags_only',automaticCascade:true,transport:Deno.env.get('OSM_DIETARY_PROXY_URL')&&Deno.env.get('OSM_DIETARY_PROXY_TOKEN')?'authenticated_edge_proxy':'direct_instance_failover',endpointFailover:'hedged_independent_instances',endpointCount:OVERPASS_ENDPOINTS.length,cacheTtlHours:CACHE_TTL_MS/3_600_000,attribution:'© OpenStreetMap contributors'});
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
  const response=await providerFetch('openstreetmap','search',1,endpoint,{method:'POST',headers:{'Content-Type':'application/json','X-Luvia-Provider-Token':tokenValue},body:JSON.stringify({latitude:center.latitude,longitude:center.longitude,radius,veganOnly}),signal:AbortSignal.timeout(10000)});
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
