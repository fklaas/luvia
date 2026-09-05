const OVERPASS_ENDPOINTS=Object.freeze([
  Object.freeze({url:'https://maps.mail.ru/osm/tools/overpass/api/interpreter',method:'POST'}),
  Object.freeze({url:'https://overpass-api.de/api/interpreter',method:'GET'}),
  Object.freeze({url:'https://overpass.private.coffee/api/interpreter',method:'GET'})
]);
const HEDGE_DELAY_MS=900;
const REQUEST_TIMEOUT_MS=6500;
const CACHE_SECONDS=6*60*60;

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

export default{
  async fetch(request,env,ctx){
    const url=new URL(request.url);
    if(url.pathname==='/api/providers/osm-dietary')return dietaryProxy(request,env,ctx);
    return env.ASSETS.fetch(request);
  }
};
