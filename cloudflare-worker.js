const OVERPASS_ENDPOINTS=Object.freeze([
  Object.freeze({url:'https://maps.mail.ru/osm/tools/overpass/api/interpreter',method:'POST'}),
  Object.freeze({url:'https://overpass-api.de/api/interpreter',method:'GET'}),
  Object.freeze({url:'https://overpass.private.coffee/api/interpreter',method:'GET'})
]);
// Cold category reads are hedged early because a single overloaded public
// Overpass instance must never hold the visible map for several seconds. The
// result is cached for six hours, so the extra hedges only happen on a genuine
// cold miss and the losing requests are aborted as soon as one source answers.
const HEDGE_DELAY_MS=250;
const REQUEST_TIMEOUT_MS=2200;
const CACHE_SECONDS=6*60*60;
const CATEGORY_KEYS=new Set(['food','accommodation','activities','themeparks','wellness','water','sights','photo','culture','nature','shopping','malls','nightlife','practical']);
const CUISINE_BY_TYPE=Object.freeze({
  italian_restaurant:'italian',german_restaurant:'german',mediterranean_restaurant:'mediterranean',greek_restaurant:'greek',french_restaurant:'french',spanish_restaurant:'spanish',indian_restaurant:'indian',
  asian_restaurant:'asian|chinese|japanese|thai|vietnamese|korean|indian|sushi|malaysian|indonesian',chinese_restaurant:'chinese',japanese_restaurant:'japanese|sushi',thai_restaurant:'thai',
  vietnamese_restaurant:'vietnamese',korean_restaurant:'korean',mexican_restaurant:'mexican',middle_eastern_restaurant:'middle_eastern|arab|arabic|oriental|levantine',lebanese_restaurant:'lebanese',turkish_restaurant:'turkish'
});
const CATEGORY_SELECTORS=Object.freeze({
  food:['[amenity~"^(restaurant|cafe|fast_food|bar|pub|biergarten|food_court)$"]','[shop="bakery"]'],
  accommodation:['[tourism~"^(hotel|guest_house|apartment|hostel|motel|camp_site|chalet|caravan_site)$"]'],
  activities:['[leisure~"^(playground|sports_centre|fitness_centre|swimming_pool|water_park|stadium|pitch|track|golf_course|miniature_golf|horse_riding|ice_rink)$"]','[tourism~"^(theme_park|aquarium|zoo|attraction)$"]','[amenity~"^(bowling_alley|escape_game)$"]'],
  themeparks:['[tourism="theme_park"]','[leisure="water_park"]','[tourism="attraction"][attraction~"^(amusement_ride|roller_coaster|summer_toboggan)$"]'],
  wellness:['[leisure~"^(spa|sauna|fitness_centre)$"]','[amenity~"^(spa|public_bath)$"]'],
  water:['[natural="beach"]','[leisure~"^(swimming_pool|water_park|marina)$"]','[sport~"^(swimming|surfing|sailing|water_ski)$"]','[tourism="aquarium"]'],
  sights:['[tourism~"^(attraction|viewpoint|museum|gallery)$"]','[historic]','[man_made~"^(tower|lighthouse|obelisk)$"]'],
  photo:['[tourism~"^(attraction|viewpoint)$"]','[historic]','[natural~"^(peak|cliff|beach|water|wood|wetland)$"]','[leisure~"^(park|garden|nature_reserve)$"]','[man_made~"^(tower|lighthouse)$"]'],
  culture:['[tourism~"^(museum|gallery)$"]','[amenity~"^(cinema|theatre|arts_centre|concert_hall)$"]'],
  nature:['[leisure~"^(park|garden|nature_reserve)$"]','[natural~"^(beach|peak|cliff|water|wood|wetland|heath|grassland)$"]','[route="hiking"]'],
  shopping:['[shop]','[amenity="marketplace"]'],
  malls:['[shop~"^(mall|department_store)$"]'],
  nightlife:['[amenity~"^(bar|pub|biergarten|nightclub|casino|music_venue|theatre)$"]','[club~"^(nightlife|music)$"]'],
  practical:['[amenity~"^(pharmacy|parking|charging_station|atm|fuel|toilets)$"]','[shop~"^(supermarket|convenience|laundry)$"]']
});

const json=(status,body)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const finite=(value,min,max)=>{const number=Number(value);return Number.isFinite(number)&&number>=min&&number<=max?number:null};
const radians=value=>value*Math.PI/180;
const distanceMeters=(a,b)=>{const dLat=radians(b.lat-a.lat),dLon=radians(b.lon-a.lon),lat1=radians(a.lat),lat2=radians(b.lat),h=Math.sin(dLat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;return 6371000*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h))};
const elementPoint=element=>{const lat=Number(element?.lat??element?.center?.lat),lon=Number(element?.lon??element?.center?.lon);return Number.isFinite(lat)&&Number.isFinite(lon)?{lat,lon}:null};

function overpassQuery({lat,lon,radius,veganOnly}){
  const latitudeDelta=radius/111320,longitudeDelta=radius/(111320*Math.max(.2,Math.cos(radians(lat))));
  const bounds=[lat-latitudeDelta,lon-longitudeDelta,lat+latitudeDelta,lon+longitudeDelta].map(value=>value.toFixed(6)).join(',');
  const area=`(${bounds})`,amenity='^(restaurant|cafe|fast_food|bar|pub|biergarten)$';
  const statements=veganOnly
    ?`nwr${area}[amenity~"${amenity}"]["diet:vegan"~"^(yes|only)$"];`
    :`nwr${area}[amenity~"${amenity}"]["diet:vegetarian"~"^(yes|only)$"];nwr${area}[amenity~"${amenity}"]["diet:vegan"~"^(yes|only)$"];`;
  return`[out:json][timeout:7];(${statements});out center tags;`;
}

async function readEndpoint(endpoint,query,controller){
  const timeout=setTimeout(()=>controller.abort('overpass-timeout'),REQUEST_TIMEOUT_MS);
  try{
    const isPost=endpoint.method==='POST',url=isPost?endpoint.url:`${endpoint.url}?data=${encodeURIComponent(query)}`;
    const response=await fetch(url,{method:endpoint.method,headers:isPost?{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8','User-Agent':'Luvia/1.0 dietary-place-evidence'}:{'User-Agent':'Luvia/1.0 dietary-place-evidence'},body:isPost?new URLSearchParams({data:query}).toString():undefined,signal:controller.signal,redirect:'follow'});
    const body=await response.json().catch(()=>({}));
    if(!response.ok||!Array.isArray(body?.elements))throw new Error(`OVERPASS_${response.status}`);
    return body.elements;
  }finally{clearTimeout(timeout)}
}

async function hedgedElements(query){
  const controllers=OVERPASS_ENDPOINTS.map(()=>new AbortController());
  const reads=OVERPASS_ENDPOINTS.map((endpoint,index)=>new Promise((resolve,reject)=>{
    const start=()=>readEndpoint(endpoint,query,controllers[index]).then(resolve,reject);
    if(index===0)start();else setTimeout(start,HEDGE_DELAY_MS*index);
  }));
  const result=await Promise.any(reads);
  controllers.forEach(controller=>controller.abort('overpass-winner-selected'));
  return result;
}

async function dietaryProxy(request,env,ctx){
  if(request.method!=='POST')return json(405,{ok:false,error:{code:'METHOD_NOT_ALLOWED'}});
  const expected=String(env.OSM_DIETARY_PROXY_TOKEN||''),supplied=String(request.headers.get('x-luvia-provider-token')||'');
  if(!expected||!supplied||supplied!==expected)return json(401,{ok:false,error:{code:'AUTH_REQUIRED'}});
  let body;try{body=await request.json()}catch{return json(400,{ok:false,error:{code:'INVALID_JSON'}})}
  const lat=finite(body?.latitude,-90,90),lon=finite(body?.longitude,-180,180),radius=finite(body?.radius,500,15000),veganOnly=body?.veganOnly===true;
  if(lat==null||lon==null||radius==null)return json(400,{ok:false,error:{code:'INVALID_SCOPE'}});
  const cacheKey=new Request(`https://luvia.internal/osm-dietary?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}&radius=${Math.round(radius)}&focus=${veganOnly?'vegan':'vegetarian'}`);
  const cache=caches.default,hit=await cache.match(cacheKey);
  if(hit){const cached=await hit.json();return json(200,{...cached,cache:{hit:true,ttlSeconds:CACHE_SECONDS}})}
  try{
    const center={lat,lon},elements=(await hedgedElements(overpassQuery({lat,lon,radius,veganOnly}))).filter(element=>{const point=elementPoint(element);return point&&distanceMeters(center,point)<=radius});
    const payload={ok:true,elements,provider:'openstreetmap',scope:{latitude:lat,longitude:lon,radius,veganOnly},cache:{hit:false,ttlSeconds:CACHE_SECONDS}};
    const stored=new Response(JSON.stringify(payload),{headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':`public, max-age=${CACHE_SECONDS}`}});
    ctx.waitUntil(cache.put(cacheKey,stored));
    return json(200,payload);
  }catch{return json(502,{ok:false,error:{code:'OVERPASS_INSTANCES_UNAVAILABLE'}})}
}

function categoryQuery({lat,lon,radius,category,strictType}){
  const latitudeDelta=radius/111320,longitudeDelta=radius/(111320*Math.max(.2,Math.cos(radians(lat))));
  const bounds=[lat-latitudeDelta,lon-longitudeDelta,lat+latitudeDelta,lon+longitudeDelta].map(value=>value.toFixed(6)).join(','),area=`(${bounds})`;
  let selectors=CATEGORY_SELECTORS[category]||[];
  const cuisine=CUISINE_BY_TYPE[strictType];
  if(category==='food'&&cuisine)selectors=[`[amenity~"^(restaurant|cafe|fast_food)$"][cuisine~"(^|[;,])\\s*(${cuisine})\\s*([;,]|$)",i]`];
  else if(category==='food'&&strictType==='vegetarian_restaurant')selectors=['[amenity~"^(restaurant|cafe|fast_food)$"]["diet:vegetarian"~"^(yes|only)$"]','[amenity~"^(restaurant|cafe|fast_food)$"]["diet:vegan"~"^(yes|only)$"]'];
  else if(category==='food'&&strictType==='vegan_restaurant')selectors=['[amenity~"^(restaurant|cafe|fast_food)$"]["diet:vegan"~"^(yes|only)$"]'];
  const statements=selectors.map(selector=>`nwr${area}${selector};`).join('');
  return`[out:json][timeout:7][maxsize:8388608];(${statements});out center tags 250;`;
}

async function placesProxy(request,env,ctx){
  if(request.method!=='POST')return json(405,{ok:false,error:{code:'METHOD_NOT_ALLOWED'}});
  const expected=String(env.OSM_DIETARY_PROXY_TOKEN||''),supplied=String(request.headers.get('x-luvia-provider-token')||'');
  if(!expected||!supplied||supplied!==expected)return json(401,{ok:false,error:{code:'AUTH_REQUIRED'}});
  let body;try{body=await request.json()}catch{return json(400,{ok:false,error:{code:'INVALID_JSON'}})}
  const lat=finite(body?.latitude,-90,90),lon=finite(body?.longitude,-180,180),radius=finite(body?.radius,500,15000),category=String(body?.category||'').toLowerCase(),strictType=String(body?.strictType||'').toLowerCase();
  if(lat==null||lon==null||radius==null||!CATEGORY_KEYS.has(category)||!/^[a-z0-9_]{0,64}$/.test(strictType))return json(400,{ok:false,error:{code:'INVALID_SCOPE'}});
  const cacheKey=new Request(`https://luvia.internal/osm-places?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}&radius=${Math.round(radius)}&category=${category}&type=${strictType}`),cache=caches.default,hit=await cache.match(cacheKey);
  if(hit){const cached=await hit.json();return json(200,{...cached,cache:{hit:true,ttlSeconds:CACHE_SECONDS}})}
  try{
    const center={lat,lon},elements=(await hedgedElements(categoryQuery({lat,lon,radius,category,strictType}))).filter(element=>{const point=elementPoint(element);return point&&distanceMeters(center,point)<=radius});
    const payload={ok:true,elements,provider:'openstreetmap',scope:{latitude:lat,longitude:lon,radius,category,strictType},cache:{hit:false,ttlSeconds:CACHE_SECONDS}};
    const stored=new Response(JSON.stringify(payload),{headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':`public, max-age=${CACHE_SECONDS}`}});ctx.waitUntil(cache.put(cacheKey,stored));return json(200,payload);
  }catch{return json(502,{ok:false,error:{code:'OVERPASS_INSTANCES_UNAVAILABLE'}})}
}

export default{
  async fetch(request,env,ctx){
    const url=new URL(request.url);
    if(url.pathname==='/api/providers/osm-dietary')return dietaryProxy(request,env,ctx);
    if(url.pathname==='/api/providers/osm-places')return placesProxy(request,env,ctx);
    return env.ASSETS.fetch(request);
  }
};
