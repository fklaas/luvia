import {providerFetch} from './provider-budget.ts';

const APPLE_MAPS_BASE='https://maps-api.apple.com/v1';
const encoder=new TextEncoder();
let accessTokenCache:{value:string;expiresAt:number}|null=null;

const APPLE_CATEGORY_TO_LUVIA:Record<string,string[]>=Object.freeze({
  Airport:['airport'],AmusementPark:['amusement_park'],Aquarium:['aquarium'],ATM:['atm'],Bakery:['bakery'],Beach:['beach'],
  Bowling:['bowling_alley'],Brewery:['bar'],Cafe:['cafe'],Campground:['lodging','campground'],Castle:['tourist_attraction','historical_landmark'],
  EVCharger:['electric_vehicle_charging_station'],Fairground:['amusement_park'],FitnessCenter:['fitness_center'],FoodMarket:['market','store'],
  Golf:['golf_course'],Hiking:['hiking_area'],Hotel:['lodging','hotel'],Kayaking:['sports_activity_location'],Landmark:['tourist_attraction'],
  Laundry:['laundry'],Marina:['marina'],MiniGolf:['miniature_golf_course'],MovieTheater:['movie_theater'],Museum:['museum'],
  MusicVenue:['live_music_venue'],NationalMonument:['monument','tourist_attraction'],NationalPark:['park'],Nightlife:['nightlife_spot','bar'],
  Park:['park'],Parking:['parking'],Pharmacy:['pharmacy'],Planetarium:['tourist_attraction'],Playground:['playground'],
  PublicTransport:['transit_station'],Restaurant:['restaurant'],RVPark:['lodging','campground'],Spa:['spa'],Stadium:['stadium'],Store:['store'],
  Surfing:['sports_activity_location','beach'],Swimming:['swimming_pool'],Theater:['performing_arts_theater'],Winery:['bar'],Zoo:['zoo']
});

const LUVIA_CATEGORY_TO_APPLE:Record<string,string[]>=Object.freeze({
  food:['Restaurant','Cafe','Bakery','FoodMarket','Brewery','Distillery','Winery'],
  restaurant:['Restaurant','Cafe','Bakery'],
  accommodation:['Hotel','Campground','RVPark'],lodging:['Hotel','Campground','RVPark'],
  activities:['Bowling','Fairground','FitnessCenter','GoKart','Golf','Kayaking','MiniGolf','Playground','RockClimbing','SkatePark','Skating','Skiing','Soccer','Surfing','Swimming','Tennis','Volleyball'],
  activity:['Bowling','Fairground','FitnessCenter','GoKart','Golf','Kayaking','MiniGolf','Playground','RockClimbing','SkatePark','Skating','Skiing','Soccer','Surfing','Swimming','Tennis','Volleyball'],
  themeparks:['AmusementPark','Fairground'],wellness:['Spa','Beauty'],water:['Aquarium','Beach','Kayaking','Marina','Surfing','Swimming'],
  sights:['Castle','Fortress','Landmark','NationalMonument','Planetarium'],photo:['Castle','Landmark','NationalMonument','NationalPark','Park'],
  culture:['Castle','Fortress','Library','MovieTheater','Museum','MusicVenue','Planetarium','Theater'],nature:['Beach','Hiking','NationalPark','Park'],
  shopping:['FoodMarket','Store'],malls:['Store'],nightlife:['Brewery','Distillery','MusicVenue','Nightlife','Winery'],
  practical:['ATM','Bank','EVCharger','GasStation','Laundry','Parking','Pharmacy','PostOffice','PublicTransport','Restroom']
});

const LUVIA_TYPE_TO_APPLE:Record<string,string[]>=Object.freeze({
  restaurant:['Restaurant'],cafe:['Cafe'],bakery:['Bakery'],bar:['Nightlife','Brewery','Winery'],lodging:['Hotel','Campground','RVPark'],hotel:['Hotel'],
  campground:['Campground','RVPark'],amusement_park:['AmusementPark','Fairground'],aquarium:['Aquarium'],beach:['Beach'],bowling_alley:['Bowling'],
  fitness_center:['FitnessCenter'],golf_course:['Golf'],hiking_area:['Hiking'],marina:['Marina'],miniature_golf_course:['MiniGolf'],
  movie_theater:['MovieTheater'],museum:['Museum'],live_music_venue:['MusicVenue'],tourist_attraction:['Landmark','NationalMonument','Castle','Fortress'],
  park:['Park','NationalPark'],playground:['Playground'],spa:['Spa'],store:['Store'],market:['FoodMarket'],nightlife_spot:['Nightlife'],
  night_club:['Nightlife'],swimming_pool:['Swimming'],performing_arts_theater:['Theater'],zoo:['Zoo'],pharmacy:['Pharmacy'],parking:['Parking'],
  electric_vehicle_charging_station:['EVCharger'],atm:['ATM'],laundry:['Laundry']
});

function configuredValue(name:string){return String(Deno.env.get(name)||'').trim()}
export function appleMapsConfiguration(){
  const teamId=configuredValue('APPLE_MAPS_TEAM_ID'),keyId=configuredValue('APPLE_MAPS_KEY_ID'),privateKey=configuredValue('APPLE_MAPS_PRIVATE_KEY');
  return Object.freeze({configured:Boolean(teamId&&keyId&&privateKey),teamIdConfigured:Boolean(teamId),keyIdConfigured:Boolean(keyId),privateKeyConfigured:Boolean(privateKey),automaticCascade:false,displayContract:'apple-mapkit-only',storageContract:'transient-only',dailyTeamServiceQuota:25000});
}

export function assertAppleMapsDisplayContract(options:any={}){
  const context=options?.appleDisplayContext||options?.displayContext||{};
  const renderer=String(context.renderer||options?.mapRenderer||'').toLowerCase();
  const storage=String(context.storage||options?.storageContract||'').toLowerCase();
  if(renderer!=='apple-mapkit')throw Object.assign(new Error('Apple-Kartendaten dürfen nur auf einer Apple-MapKit-Karte dargestellt werden.'),{code:'APPLE_MAP_DISPLAY_REQUIRED',status:409});
  if(storage!=='transient')throw Object.assign(new Error('Apple-Kartendaten dürfen in Luvia nur vorübergehend für die Apple-Kartenansicht gehalten werden.'),{code:'APPLE_MAP_TRANSIENT_STORAGE_REQUIRED',status:409});
  return Object.freeze({renderer:'apple-mapkit',storage:'transient'});
}

export function appleCategoriesFor(options:any={}){
  const selected=(Array.isArray(options?.includedTypes)?options.includedTypes:[options?.includedType]).filter(Boolean).map(String);
  const strictCuisine=options?.strictTypeFiltering===true&&selected.some(type=>type.endsWith('_restaurant')&&type!=='restaurant');
  if(strictCuisine)return Object.freeze({supported:false,reason:'apple_has_no_cuisine_or_dietary_evidence',categories:[] as string[]});
  const categories=new Set<string>();
  for(const type of selected)for(const category of LUVIA_TYPE_TO_APPLE[type]||[])categories.add(category);
  if(!categories.size)for(const category of LUVIA_CATEGORY_TO_APPLE[String(options?.category||'').toLowerCase()]||[])categories.add(category);
  return Object.freeze({supported:true,reason:null,categories:[...categories].slice(0,20)});
}

export function normalizeApplePlace(row:any){
  const nativeId=String(row?.id||'').trim(),name=String(row?.name||'').trim();
  const latitude=Number(row?.coordinate?.latitude??row?.center?.latitude),longitude=Number(row?.coordinate?.longitude??row?.center?.longitude);
  if(!nativeId||!name||!Number.isFinite(latitude)||!Number.isFinite(longitude)||Math.abs(latitude)>90||Math.abs(longitude)>180)return null;
  const providerType=String(row?.poiCategory||'').trim(),types=[...new Set(APPLE_CATEGORY_TO_LUVIA[providerType]||[])];
  const id=`apple:${nativeId}`;
  return{id,providerPlaceId:id,provider:'apple',source:'apple_maps',name,displayName:name,formattedAddress:(row.formattedAddressLines||[]).filter(Boolean).join(', '),location:{latitude,longitude},primaryType:types[0]||'',primaryTypeLabel:providerType,types,providerNativeTypes:providerType?[providerType]:[],providerPrimaryFoodTypes:[],providerRefs:{apple:nativeId},evidence:[{provider:'apple',kind:'apple-mapkit-transient-place-search',fields:['name','location','types']}],website:Array.isArray(row.urls)?row.urls[0]||null:null,phone:row.telephone||null,photos:[],rating:null,userRatingCount:null,openingHours:null,features:{servesVegetarianFood:null,servesVeganFood:null},mapsUri:`https://maps.apple.com/?q=${encodeURIComponent(name)}&ll=${latitude},${longitude}`,displayContract:'apple-mapkit-only',storageContract:'transient-only',persistenceAllowed:false,attribution:'Apple Maps'};
}

function base64Url(value:Uint8Array|string){
  const bytes=typeof value==='string'?encoder.encode(value):value;let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);
  return btoa(binary).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
}
function privateKeyBytes(pem:string){
  const normalized=pem.replace(/\\n/g,'\n').replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g,'');
  if(!normalized)throw Object.assign(new Error('Apple-Maps-Private-Key ist ungültig.'),{code:'APPLE_MAPS_PRIVATE_KEY_INVALID',status:503});
  const binary=atob(normalized),bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);return bytes;
}
async function mapsAuthToken(){
  const teamId=configuredValue('APPLE_MAPS_TEAM_ID'),keyId=configuredValue('APPLE_MAPS_KEY_ID'),privateKey=configuredValue('APPLE_MAPS_PRIVATE_KEY');
  if(!teamId||!keyId||!privateKey)throw Object.assign(new Error('Apple Maps Server API ist noch nicht eingerichtet.'),{code:'APPLE_MAPS_NOT_CONFIGURED',status:503});
  const now=Math.floor(Date.now()/1000),header=base64Url(JSON.stringify({alg:'ES256',kid:keyId,typ:'JWT'})),payload=base64Url(JSON.stringify({iss:teamId,iat:now,exp:now+900,scope:'server_api'}));
  const key=await crypto.subtle.importKey('pkcs8',privateKeyBytes(privateKey),{name:'ECDSA',namedCurve:'P-256'},false,['sign']);
  const signature=new Uint8Array(await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},key,encoder.encode(`${header}.${payload}`)));
  return `${header}.${payload}.${base64Url(signature)}`;
}
async function mapsAccessToken(){
  if(accessTokenCache&&accessTokenCache.expiresAt>Date.now()+60_000)return accessTokenCache.value;
  const authToken=await mapsAuthToken();
  const response=await providerFetch('apple','token',1,`${APPLE_MAPS_BASE}/token`,{headers:{Authorization:`Bearer ${authToken}`}});
  const body=await response.json().catch(()=>({}));
  if(!response.ok||!body?.accessToken)throw Object.assign(new Error('Apple Maps konnte keinen Zugriffstoken ausstellen.'),{code:'APPLE_MAPS_TOKEN_ERROR',status:response.status||502});
  accessTokenCache={value:String(body.accessToken),expiresAt:Date.now()+Math.max(60,Number(body.expiresInSeconds)||1800)*1000};return accessTokenCache.value;
}
async function appleFetch(path:string,operation:string){
  const accessToken=await mapsAccessToken();
  const response=await providerFetch('apple',operation,1,`${APPLE_MAPS_BASE}${path}`,{headers:{Authorization:`Bearer ${accessToken}`}});
  const body=await response.json().catch(()=>({}));
  if(!response.ok)throw Object.assign(new Error('Apple Maps ist derzeit nicht verfügbar.'),{code:'APPLE_MAPS_PROVIDER_ERROR',status:response.status,reason:Array.isArray(body?.details)?String(body.details[0]||'unknown'):'unknown'});
  return body;
}
function searchRegion(destination:any,restriction:any,radius:number){
  const rectangle=restriction?.rectangle;
  if(rectangle)return `${rectangle.high.latitude},${rectangle.high.longitude},${rectangle.low.latitude},${rectangle.low.longitude}`;
  const anchor=destination?.location||destination?.canonicalCity?.center,lat=Number(anchor?.latitude??anchor?.lat),lng=Number(anchor?.longitude??anchor?.lng);
  const latDelta=radius/111320,lngDelta=radius/(111320*Math.max(.2,Math.cos(lat*Math.PI/180)));
  return `${lat+latDelta},${lng+lngDelta},${lat-latDelta},${lng-lngDelta}`;
}

export async function appleMapsSearch(query:string,destination:any,options:any={},restriction:any=null){
  assertAppleMapsDisplayContract(options);const categorySelection=appleCategoriesFor(options);if(!categorySelection.supported)return{places:[],unsupportedReason:categorySelection.reason};
  const anchor=destination?.location||destination?.canonicalCity?.center,lat=Number(anchor?.latitude??anchor?.lat),lng=Number(anchor?.longitude??anchor?.lng);
  if(!Number.isFinite(lat)||!Number.isFinite(lng))throw Object.assign(new Error('Reiseziel für Apple Maps fehlt.'),{code:'DESTINATION_REQUIRED',status:400});
  const radius=Math.max(100,Math.min(50000,Number(options?.maxDistanceMeters||destination?.searchRadiusMeters)||3000));
  const params=new URLSearchParams({q:String(options?.userQuery||query||'').trim(),lang:String(options?.languageCode||'de-DE'),resultTypeFilter:'Poi',searchLocation:`${lat},${lng}`,searchRegion:searchRegion(destination,restriction,radius),searchRegionPriority:'required',enablePagination:'false'});
  if(destination?.countryCode)params.set('limitToCountries',String(destination.countryCode).toUpperCase());
  if(categorySelection.categories.length)params.set('includePoiCategories',categorySelection.categories.join(','));
  const body=await appleFetch(`/search?${params}`,'search');
  return{places:(body?.results||[]).map(normalizeApplePlace).filter(Boolean).slice(0,Math.max(1,Math.min(50,Number(options?.maxResultCount)||30))),unsupportedReason:null};
}

export async function appleMapsDetails(id:string,options:any={}){
  assertAppleMapsDisplayContract(options);const nativeId=String(id||'').replace(/^apple:/,'');if(!nativeId)throw Object.assign(new Error('Apple-Place-ID fehlt.'),{code:'PLACE_ID_REQUIRED',status:400});
  return normalizeApplePlace(await appleFetch(`/place/${encodeURIComponent(nativeId)}?lang=${encodeURIComponent(String(options?.languageCode||'de-DE'))}`,'details'));
}

export function normalizeAppleDirections(body:any,mode:string){
  const routes=[];for(const route of body?.routes||[]){
    const coordinates:number[][]=[];for(const stepIndex of route.stepIndexes||[]){const step=body?.steps?.[stepIndex],path=body?.stepPaths?.[step?.stepPathIndex]||[];for(const point of path){const coordinate=[Number(point?.longitude),Number(point?.latitude)];if(coordinate.every(Number.isFinite)&&(!coordinates.length||coordinates.at(-1)?.[0]!==coordinate[0]||coordinates.at(-1)?.[1]!==coordinate[1]))coordinates.push(coordinate)}}
    if(coordinates.length<2)continue;routes.push({mode,provider:'apple',verified:true,distanceMeters:Number(route.distanceMeters),durationSeconds:Number(route.durationSeconds),durationMinutes:Math.ceil(Number(route.durationSeconds)/60),geometry:{type:'LineString',coordinates},legs:[],attribution:'Apple Maps',displayContract:'apple-mapkit-only',storageContract:'transient-only',persistenceAllowed:false});
  }return routes;
}

export async function appleMapsDirections(payload:any){
  assertAppleMapsDisplayContract(payload);const origin=payload?.origin,destination=payload?.destination;
  const a={lat:Number(origin?.latitude??origin?.lat),lng:Number(origin?.longitude??origin?.lng)},b={lat:Number(destination?.latitude??destination?.lat),lng:Number(destination?.longitude??destination?.lng)};
  if(![a.lat,a.lng,b.lat,b.lng].every(Number.isFinite))throw Object.assign(new Error('Ungültige Apple-Routenkoordinaten.'),{code:'INVALID_ROUTE_COORDINATES',status:400});
  const mode=String(payload?.mode||(payload?.modes||['WALK'])[0]||'WALK').toUpperCase();const transport=mode==='BICYCLE'?'Cycling':mode==='DRIVE'?'Automobile':'Walking';
  const params=new URLSearchParams({origin:`${a.lat},${a.lng}`,destination:`${b.lat},${b.lng}`,transportType:transport,lang:String(payload?.languageCode||'de-DE'),requestsAlternateRoutes:'false'});
  const routes=normalizeAppleDirections(await appleFetch(`/directions?${params}`,'route'),mode);if(!routes.length)throw Object.assign(new Error('Apple Maps lieferte keine darstellbare Route.'),{code:'APPLE_ROUTE_UNAVAILABLE',status:502});return{data:{routes:{[mode.toLowerCase()]:routes},provider:'apple',displayContract:'apple-mapkit-only',storageContract:'transient-only'}};
}
