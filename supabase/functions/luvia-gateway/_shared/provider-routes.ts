import {providerFetch} from './provider-budget.ts';
const cache=new Map<string,{until:number,value:any}>(),pending=new Map<string,Promise<any>>();
export function routePoint(p:any){const a=p?.latitude??p?.lat,b=p?.longitude??p?.lng;if(a==null||b==null||a===''||b===''||!Number.isFinite(Number(a))||!Number.isFinite(Number(b))||Math.abs(Number(a))>90||Math.abs(Number(b))>180)throw Object.assign(new Error('Ungültige Routenkoordinaten.'),{code:'INVALID_ROUTE_COORDINATES',status:400});return{lat:Number(a),lng:Number(b)}}
export function flexibleLine(value:string){
  const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';let pos=0;
  const read=()=>{let result=0,shift=0,c;do{c=alphabet.indexOf(value[pos++]);if(c<0||shift>50)throw new Error('INVALID_ROUTE_GEOMETRY');result+=(c&31)*2**shift;shift+=5;}while(c&32);return result};
  if(read()!==1)throw new Error('INVALID_ROUTE_GEOMETRY');const header=read(),factor=10**(header&15),third=(header>>4)&7;let lat=0,lng=0;const points:number[][]=[];
  const signed=()=>{const n=read();return n%2?-(n+1)/2:n/2};
  while(pos<value.length){lat+=signed();lng+=signed();if(third)signed();points.push([lng/factor,lat/factor]);if(points.length>100000)throw new Error('ROUTE_TOO_LARGE')}
  return points;
}
function verifiedRoute(provider:string,mode:string,distance:any,duration:any,coordinates:any,legs:any=[]){
  if(!Number.isFinite(distance)||distance<0||!Number.isFinite(duration)||duration<0||!Array.isArray(coordinates)||coordinates.length<2||coordinates.some((p:any)=>!Array.isArray(p)||!Number.isFinite(p[0])||!Number.isFinite(p[1])||Math.abs(p[0])>180||Math.abs(p[1])>90))throw new Error('INVALID_ROUTE_GEOMETRY');
  return{mode,provider,verified:true,distanceMeters:distance,durationSeconds:duration,durationMinutes:Math.ceil(duration/60),geometry:{type:'LineString',coordinates},legs,attribution:provider==='openrouteservice'?'© openrouteservice.org by HeiGIT | Map data © OpenStreetMap contributors':provider==='tomtom'?'© TomTom':provider==='here'?'© HERE':'© Geoapify | Map data © OpenStreetMap contributors'};
}
async function requestRoute(provider:string,mode:string,a:any,b:any){
  const key=Deno.env.get(({openrouteservice:'OPENROUTESERVICE_API_KEY',tomtom:'TOMTOM_API_KEY',here:'HERE_API_KEY',geoapify:'GEOAPIFY_API_KEY'} as any)[provider]);if(!key)throw Object.assign(new Error('Routenanbieter nicht eingerichtet.'),{code:'PROVIDER_NOT_CONFIGURED'});
  let response:Response;
  if(provider==='openrouteservice'){
    const profile=mode==='WALK'?'foot-walking':mode==='BICYCLE'?'cycling-regular':'driving-car';
    response=await providerFetch(provider,'route',1,`https://api.openrouteservice.org/v2/directions/${profile}/geojson`,{method:'POST',headers:{Authorization:key,'Content-Type':'application/json'},body:JSON.stringify({coordinates:[[a.lng,a.lat],[b.lng,b.lat]],language:'de',instructions:false})});
  }else if(provider==='tomtom'){
    const params=new URLSearchParams({key,travelMode:mode==='WALK'?'pedestrian':mode==='BICYCLE'?'bicycle':'car',traffic:'false',routeRepresentation:'polyline'});
    response=await providerFetch(provider,'route',1,`https://api.tomtom.com/routing/1/calculateRoute/${a.lat},${a.lng}:${b.lat},${b.lng}/json?${params}`);
  }else if(provider==='here'){
    const params=new URLSearchParams({apiKey:key,transportMode:mode==='WALK'?'pedestrian':mode==='BICYCLE'?'bicycle':'car',origin:`${a.lat},${a.lng}`,destination:`${b.lat},${b.lng}`,return:'summary,polyline',departureTime:'any'});
    response=await providerFetch(provider,'route',1,`https://router.hereapi.com/v8/routes?${params}`);
  }else{
    const params=new URLSearchParams({apiKey:key,mode:mode==='WALK'?'walk':mode==='BICYCLE'?'bicycle':'drive',waypoints:`${a.lat},${a.lng}|${b.lat},${b.lng}`,lang:'de'});
    response=await providerFetch('geoapify','route',2,`https://api.geoapify.com/v1/routing?${params}`);
  }
  if(!response.ok)throw Object.assign(new Error('Route beim Anbieter derzeit nicht verfügbar.'),{code:'ROUTE_PROVIDER_ERROR',status:response.status});
  const data=await response.json();
  if(provider==='openrouteservice'){const f=data.features?.[0];return verifiedRoute(provider,mode,f?.properties?.summary?.distance,f?.properties?.summary?.duration,f?.geometry?.coordinates)}
  if(provider==='tomtom'){const r=data.routes?.[0];return verifiedRoute(provider,mode,r?.summary?.lengthInMeters,r?.summary?.travelTimeInSeconds,r?.legs?.flatMap((leg:any)=>(leg.points||[]).map((p:any)=>[p.longitude,p.latitude])))}
  if(provider==='here'){const sections=data.routes?.[0]?.sections||[];return verifiedRoute(provider,mode,sections.reduce((s:number,r:any)=>s+r.summary.length,0),sections.reduce((s:number,r:any)=>s+r.summary.duration,0),sections.flatMap((r:any)=>flexibleLine(r.polyline)))}
  const f=data.features?.[0],coords=f?.geometry?.type==='MultiLineString'?f.geometry.coordinates.flat():f?.geometry?.coordinates;
  return verifiedRoute(provider,mode,f?.properties?.distance,f?.properties?.time,coords);
}
export async function managedRoutes(payload:any){
  const a=routePoint(payload.origin),b=routePoint(payload.destination),modes=[...new Set(payload.modes||['WALK'])] as string[];
  if(!modes.length||modes.some(m=>!['WALK','BICYCLE','DRIVE'].includes(m)))throw Object.assign(new Error('Verkehrsmittel wird von diesen Routenquellen nicht unterstützt.'),{code:'ROUTE_MODE_UNAVAILABLE',status:400});
  const providers=payload.provider&&payload.provider!=='auto'?[payload.provider]:['openrouteservice','tomtom','geoapify','here'];
  if(providers.some(p=>!['openrouteservice','tomtom','geoapify','here'].includes(p)))throw new Error('ROUTE_PROVIDER_UNAVAILABLE');
  const id=JSON.stringify([a,b,modes,providers]),hit=cache.get(id);if(hit&&hit.until>Date.now())return{data:{...hit.value,cached:true}};
  if(pending.has(id))return pending.get(id);
  const request=(async()=>{const routes:any={},errors:any[]=[];
    for(const mode of modes){routes[mode.toLowerCase()]=[];for(const provider of providers){try{routes[mode.toLowerCase()]=[await requestRoute(provider,mode,a,b)];break}catch(error:any){errors.push({provider,mode,code:error.code||'ROUTE_UNAVAILABLE'})}}}
    if(!Object.values(routes).some((r:any)=>r.length))throw Object.assign(new Error('Kein freigegebener Routendienst konnte diesen Weg berechnen.'),{code:'ROUTE_UNAVAILABLE',status:503,providerErrors:errors});
    const used=[...new Set(Object.values(routes).flat().map((r:any)=>r.provider))],value={routes,provider:used.length===1?used[0]:'multi',providers:used,errors,generatedAt:new Date().toISOString()};
    if(cache.size>=128)cache.delete(cache.keys().next().value!);cache.set(id,{until:Date.now()+30*60_000,value});return{data:value};
  })();pending.set(id,request);try{return await request}finally{pending.delete(id)}
}
