import {providerFetch} from './provider-budget.ts';
import tomtomTaxonomy from './tomtom-taxonomy.json' with {type:'json'};
import hereTaxonomy from './here-taxonomy.json' with {type:'json'};

const memo=new Map<string,{until:number,value:any}>(),pending=new Map<string,Promise<any>>();
const token=(v:any)=>String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const cuisines:Record<string,string[]>=Object.freeze({italian:['italian','italienisch'],german:['german','deutsch'],mediterranean:['mediterranean','mediterran'],greek:['greek','griechisch'],french:['french','franzosisch'],spanish:['spanish','spanisch'],indian:['indian','indisch'],chinese:['chinese','chinesisch'],japanese:['japanese','japanisch'],thai:['thai','thailandisch'],vietnamese:['vietnamese','vietnamesisch'],korean:['korean','koreanisch'],mexican:['mexican','mexikanisch'],middle_eastern:['middle eastern','nahostlich','arabian'],lebanese:['lebanese','libanesisch'],turkish:['turkish','turkisch'],asian:['asian','asiatisch'],vegetarian:['vegetarian','vegetarisch'],vegan:['vegan']});
const typeRules:[string,RegExp][]=[
 ['restaurant',/\brestaurant|\bfood court|\bdining\b/],['cafe',/\bcafe\b|\bcoffee shop\b|\bcoffee tea\b/],['bakery',/\bbakery\b|\bbaker\b/],['bar',/\bbar\b|\bpub\b/],['night_club',/\bnight club\b|\bnightclub\b|\bdisco/],['meal_takeaway',/\btake out\b|\btakeaway\b|\bfast food\b/],
 ['lodging',/\bhotel\b|\bmotel\b|\blodging\b|\baccommodation\b|\bhostel\b|\bguest house\b|\bbed and breakfast\b|\bcampground\b|\bcamping\b|\bholiday rental\b/],['hotel',/\bhotel\b/],['hostel',/\bhostel\b/],['motel',/\bmotel\b/],['guest_house',/\bguest house\b/],['bed_and_breakfast',/\bbed and breakfast\b/],['campground',/\bcampground\b|\bcamping\b/],
 ['spa',/\bspa\b|\bsauna\b|\bwellness\b/],['amusement_park',/\bamusement park\b|\btheme park\b/],['water_park',/\bwater park\b/],['swimming_pool',/\bswimming pool\b/],['beach',/\bbeach\b/],['marina',/\bmarina\b/],['aquarium',/\baquarium\b/],['zoo',/\bzoo\b/],['bowling_alley',/\bbowling\b/],['playground',/\bplayground\b/],['golf_course',/\bgolf course\b/],['miniature_golf_course',/\bminiature golf\b|\bminigolf\b/],['fitness_center',/\bfitness\b|\bgym\b/],['sports_activity_location',/\bsport/],['tourist_attraction',/\btourist attraction\b|\bimportant tourist\b|\blandmark\b|\bmonument\b|\bmemorial\b/],['museum',/\bmuseum\b/],['art_gallery',/\bart gallery\b/],['performing_arts_theater',/\btheater\b|\btheatre\b/],['concert_hall',/\bconcert hall\b|\bmusic center\b/],['movie_theater',/\bcinema\b|\bmovie theater\b/],['park',/\bpark\b/],['hiking_area',/\bhiking\b|\btrailhead\b/],['shopping_mall',/\bshopping cent|\bshopping mall/],['department_store',/\bdepartment store\b/],['clothing_store',/\bclothing\b|\bfashion\b/],['market',/\bmarket\b/],['store',/\bshop\b|\bstore\b|\bretail\b/]
];
export function additionalTypes(evidence:string[]){
  const text=evidence.map(token).join(' | ');
  // HERE names several non-nature families with words such as "Park" or
  // "Hiking". Resolve those exact provider labels before the broad token rules
  // so holiday rentals, parking and retail never enter a nature cohort.
  if(/\bholiday park\b/.test(text))return['lodging','vacation_rental'];
  if(/\brv parks?\b/.test(text))return['lodging','campground'];
  if(/\bpark and ride\b/.test(text))return['parking'];
  if(/\bbike park\b/.test(text))return['sports_activity_location'];
  if(/\bcamping hiking shop\b/.test(text))return['store'];
  const types=typeRules.filter(([,pattern])=>pattern.test(text)).map(([type])=>type);
  for(const [type,aliases] of Object.entries(cuisines))if(aliases.some(alias=>new RegExp(`\\b${alias}\\b`).test(text)))types.push(`${type}_restaurant`,'restaurant');
  if(types.some(type=>/^(chinese|japanese|thai|vietnamese|korean|indian)_restaurant$/.test(type)))types.push('asian_restaurant');
  if(/hotel motel/.test(text)){
    for(const subtype of ['hotel','motel'])if(!evidence.some(e=>token(e)===subtype)){const at=types.indexOf(subtype);if(at>=0)types.splice(at,1)}
  }
  if(types.includes('amusement_park')||types.includes('water_park'))return [...new Set(types.filter(t=>t!=='park'))];
  return [...new Set(types)];
}
export function normalizeAdditional(provider:string,row:any){
  const tt=provider==='tomtom',p=tt?row.poi:row;
  const evidence=tt?[...(p?.classifications||[]).flatMap((c:any)=>[c.code,...(c.names||[]).map((n:any)=>n.name)]),...(p?.categories||[])]:[...(row.categories||[]).map((c:any)=>c.name),...(row.foodTypes||[]).map((c:any)=>c.name)];
  const types=additionalTypes(evidence),location=tt?row.position:row.position;
  const latitude=location?.lat,longitude=location?.lon??location?.lng;
  if(!p||!row.id||!(tt?p.name:row.title)||latitude==null||longitude==null||!Number.isFinite(Number(latitude))||!Number.isFinite(Number(longitude))||Math.abs(latitude)>90||Math.abs(longitude)>180)return null;
  const nativeId=String(row.id),id=tt?`tomtom:${nativeId}`:nativeId.startsWith('here:')?nativeId:`here:${nativeId}`;
  const primary=types.find(t=>t.endsWith('_restaurant'))||types.find(t=>!['lodging','store','park','restaurant'].includes(t))||types[0]||'';
  return{id,providerPlaceId:id,provider,name:tt?p.name:row.title,displayName:tt?p.name:row.title,formattedAddress:tt?row.address?.freeformAddress:row.address?.label,location:{latitude:Number(latitude),longitude:Number(longitude)},primaryType:primary,primaryTypeLabel:evidence[0]||'',types,providerNativeTypes:evidence,providerRefs:{[provider]:nativeId},evidence:[{provider,kind:'place-search',fields:['name','location','types']}],website:tt?p.url:row.contacts?.flatMap((c:any)=>c.www||[])?.[0]?.value,phone:tt?p.phone:row.contacts?.flatMap((c:any)=>c.phone||[])?.[0]?.value,openingHours:p.openingHours||null,photos:[],rating:null,userRatingCount:null,features:{servesVegetarianFood:types.includes('vegetarian_restaurant')||types.includes('vegan_restaurant')?true:null,servesVeganFood:types.includes('vegan_restaurant')?true:null},raw:{categories:tt?p.classifications:row.categories,foodTypes:row.foodTypes||[],references:row.references||[]}};
}
async function json(provider:string,operation:string,url:string,init:RequestInit={},ttl=5*60_000){
  const cleanUrl=new URL(url);for(const key of ['key','apiKey'])cleanUrl.searchParams.delete(key);
  const id=provider+operation+cleanUrl+String(init.body||''),found=memo.get(id);if(found&&found.until>Date.now())return found.value;
  if(pending.has(id))return pending.get(id);
  const request=(async()=>{const response=await providerFetch(provider,operation,1,url,init);if(!response.ok)throw Object.assign(new Error(`${provider}: Anfrage derzeit nicht verfügbar.`),{code:'PROVIDER_REQUEST_FAILED',status:response.status});const data=await response.json();if(memo.size>128)memo.delete(memo.keys().next().value!);memo.set(id,{until:Date.now()+ttl,value:data});return data})();
  pending.set(id,request);try{return await request}finally{pending.delete(id)}
}
const secret=(provider:string)=>{const key=Deno.env.get(provider==='tomtom'?'TOMTOM_API_KEY':'HERE_API_KEY');if(!key)throw Object.assign(new Error('Ortsquelle nicht eingerichtet.'),{code:'PROVIDER_NOT_CONFIGURED'});return key};
export async function providerCatalog(){return{tomtom:tomtomTaxonomy,here:hereTaxonomy}}
export async function additionalSearch(provider:'tomtom'|'here',query:string,destination:any,options:any,restriction:any){
  const anchor=destination?.location||destination?.canonicalCity?.center,lat=Number(anchor?.latitude??anchor?.lat),lng=Number(anchor?.longitude??anchor?.lng);
  if(!anchor||!Number.isFinite(lat)||!Number.isFinite(lng))throw new Error('DESTINATION_REQUIRED');
  const radius=Math.max(100,Math.min(50000,Number(options.maxDistanceMeters||destination.searchRadiusMeters)||3000)),limit=Math.min(50,Math.max(1,Number(options.maxResultCount)||30)),rect=restriction?.rectangle;
  const requested=(options.includedTypes?.length?options.includedTypes:[options.includedType]).filter(Boolean);
  const cuisineTypes=requested.filter((t:string)=>t.endsWith('_restaurant')&&Object.hasOwn(cuisines,t.replace(/_restaurant$/,'')));
  const required=cuisineTypes.length?cuisineTypes:requested;
  const normalizeRows=(rows:any[])=>rows.map(row=>normalizeAdditional(provider,row)).filter(place=>place&&(!required.length||required.some((type:string)=>place.types.includes(type))));
  let data:any;
  if(provider==='tomtom'){
    const key=secret(provider),params=new URLSearchParams({key,limit:String(limit),language:'en-GB'});
    if(rect){params.set('topLeft',`${rect.high.latitude},${rect.low.longitude}`);params.set('btmRight',`${rect.low.latitude},${rect.high.longitude}`)}else{params.set('lat',String(lat));params.set('lon',String(lng));params.set('radius',String(radius))}
    // Resolve all selected cuisine/category IDs from the provider's taxonomy.
    const matches=tomtomTaxonomy.categories.filter((c:any)=>additionalTypes([c.name,...(c.synonyms||[])]).some(t=>required.includes(t)));
    // A provider without the requested cuisine cannot supply evidenced matches.
    // Do not turn an unsupported vegan category into a generic restaurant search.
    if(cuisineTypes.length&&!matches.length)return[];
    // Parent categories already include descendants. Removing redundant children
    // avoids oversized requests when the user selects the restaurant family.
    const ids=matches.map((c:any)=>c.id).filter((id:any)=>!matches.some((parent:any)=>parent.id!==id&&String(id).startsWith(String(parent.id))));
    if(ids.length&&ids.length<150)params.set('categorySet',ids.join(','));
    const q=String(options.userQuery||'').trim()||(ids.length?'':query||'restaurant');
    if(!q){
      params.set('lat',String(lat));params.set('lon',String(lng));
      params.set('radius',String(rect?Math.min(50000,Math.ceil(Math.hypot(Number(rect.high.latitude)-Number(rect.low.latitude),(Number(rect.high.longitude)-Number(rect.low.longitude))*Math.cos(lat*Math.PI/180))*111320/2)):radius));
      params.delete('topLeft');params.delete('btmRight');
    }
    data=await json(provider,'search',`https://api.tomtom.com/search/2/${q?`poiSearch/${encodeURIComponent(q)}`:'nearbySearch/'}.json?${params}`);
    return normalizeRows(data.results||[]);
  }
  const params=new URLSearchParams({apiKey:secret(provider),at:`${lat},${lng}`,limit:String(limit),lang:'en-US',q:String(options.userQuery||query||'restaurant')});
  params.set('in',rect?`bbox:${rect.low.longitude},${rect.low.latitude},${rect.high.longitude},${rect.high.latitude}`:`circle:${lat},${lng};r=${radius}`);
  const foodTypes=hereTaxonomy.foodTypes.filter(c=>additionalTypes([c.name]).some(t=>required.includes(t)&&t.endsWith('_restaurant'))).map(c=>c.id.endsWith('-000')?c.id.split('-')[0]:c.id);
  if(cuisineTypes.length&&!foodTypes.length)return[];
  const categories=hereTaxonomy.categories.filter(c=>additionalTypes([c.name]).some(t=>required.includes(t))).map(c=>c.id);
  const family=foodTypes.length?['100-1000']:categories;
  if(family.length){params.delete('q');params.set('categories',[...new Set(family)].join(','));if(foodTypes.length)params.set('foodTypes',[...new Set(foodTypes)].filter(id=>!foodTypes.some(parent=>parent!==id&&id.startsWith(parent+'-'))).join(','));if(options.userQuery)params.set('name',String(options.userQuery))}
  data=await json(provider,'search',family.length?`https://browse.search.hereapi.com/v1/browse?${params}`:`https://discover.search.hereapi.com/v1/discover?${params}`);
  return normalizeRows((data.items||[]).filter((row:any)=>row.resultType==='place'));
}
export async function additionalDetails(id:string){
  if(id.startsWith('tomtom:')){const data=await json('tomtom','details',`https://api.tomtom.com/search/2/place.json?entityId=${encodeURIComponent(id.slice(7))}&key=${encodeURIComponent(secret('tomtom'))}&language=en-GB`);return normalizeAdditional('tomtom',data.results?.[0])}
  if(id.startsWith('here:')){const data=await json('here','details',`https://lookup.search.hereapi.com/v1/lookup?id=${encodeURIComponent(id)}&apiKey=${encodeURIComponent(secret('here'))}&lang=en-US`);return normalizeAdditional('here',data)}
  return null;
}
