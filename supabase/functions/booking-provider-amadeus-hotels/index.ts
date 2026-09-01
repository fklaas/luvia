import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const VERSION='1.0.0-live-hotel-offers';
const PROVIDER='amadeus_hotels';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json'};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:cors});
const expected=(error:string,details:string,extra:Record<string,unknown>={})=>json({ok:false,expected:true,providerId:PROVIDER,error,details,offers:[],...extra});
const clean=(value:unknown)=>String(value??'').trim();
const finite=(value:unknown)=>Number.isFinite(Number(value))?Number(value):null;
const list=(value:unknown)=>Array.isArray(value)?value:[];
const validDate=(value:string)=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(`${value}T00:00:00Z`));
const baseUrl=()=>clean(Deno.env.get('AMADEUS_ENVIRONMENT')).toLowerCase()==='production'?'https://api.amadeus.com':'https://test.api.amadeus.com';

async function accessToken(clientId:string,clientSecret:string){
  const body=new URLSearchParams({grant_type:'client_credentials',client_id:clientId,client_secret:clientSecret});
  const response=await fetch(`${baseUrl()}/v1/security/oauth2/token`,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body,signal:AbortSignal.timeout(7000)});
  const payload=await response.json().catch(()=>({}));
  if(!response.ok||!clean(payload?.access_token))throw Object.assign(new Error('AMADEUS_AUTH_FAILED'),{status:response.status,providerPayloadCode:payload?.errorCode||payload?.code||null});
  return clean(payload.access_token);
}

async function resolveHotelIds(token:string,body:any){
  const supplied=list(body?.providerHotelIds?.amadeus_hotels||body?.amadeusHotelIds||body?.hotelIds).map(clean).filter(Boolean).slice(0,20);
  if(supplied.length)return supplied;
  const params=new URLSearchParams({radius:String(Math.min(50,Math.max(1,Number(body?.radiusKm)||20))),radiusUnit:'KM',hotelSource:'ALL'});
  let path='';
  const cityCode=clean(body?.providerDestinationIds?.amadeus_hotels||body?.cityCode).toUpperCase();
  const latitude=finite(body?.latitude),longitude=finite(body?.longitude);
  if(cityCode){params.set('cityCode',cityCode);path='/v1/reference-data/locations/hotels/by-city';}
  else if(latitude!=null&&longitude!=null){params.set('latitude',String(latitude));params.set('longitude',String(longitude));path='/v1/reference-data/locations/hotels/by-geocode';}
  else return [];
  const response=await fetch(`${baseUrl()}${path}?${params}`,{headers:{Authorization:`Bearer ${token}`},signal:AbortSignal.timeout(7000)});
  const payload=await response.json().catch(()=>({}));
  if(!response.ok)throw Object.assign(new Error('AMADEUS_HOTEL_LOOKUP_FAILED'),{status:response.status,providerPayloadCode:payload?.errors?.[0]?.code||null});
  return list(payload?.data).map(item=>clean(item?.hotelId)).filter(Boolean).slice(0,20);
}

function mandatoryTotal(price:any){
  const stated=finite(price?.total),currency=clean(price?.currency).toUpperCase();
  if(stated==null||stated<0||!/^[A-Z]{3}$/.test(currency))return{complete:false,total:null,currency};
  let excluded=0,complete=true;
  for(const tax of list(price?.taxes)){
    const included=tax?.included===true||clean(tax?.included).toLowerCase()==='true';
    if(included)continue;
    const amount=finite(tax?.amount);
    if(amount==null){complete=false;break;}
    excluded+=amount;
  }
  return{complete,total:complete?Number((stated+excluded).toFixed(2)):null,currency,base:finite(price?.base),excludedMandatoryCharges:excluded};
}

function cancellation(policies:any){
  const rows=list(policies?.cancellations),deadlines=rows.map(item=>clean(item?.deadline)).filter(value=>!Number.isNaN(Date.parse(value))).sort();
  return{refundable:deadlines.length>0,freeCancellationUntil:deadlines[0]?.slice(0,10)||null,description:clean(rows[0]?.description?.text||rows[0]?.description)||null,prepaymentRequired:clean(policies?.paymentType).toUpperCase()==='ADVANCE'};
}

function normalize(payload:any,body:any,observedAt:string){
  const offers=[] as any[];
  for(const property of list(payload?.data)){
    const hotel=property?.hotel||{},propertyId=clean(hotel?.hotelId),propertyName=clean(hotel?.name)||'Unterkunft';
    for(const raw of list(property?.offers)){
      const price=mandatoryTotal(raw?.price),start=clean(raw?.checkInDate||body?.checkIn),end=clean(raw?.checkOutDate||body?.checkOut);
      offers.push({
        offerId:clean(raw?.id)||`${PROVIDER}:${propertyId}:${offers.length+1}`,providerId:PROVIDER,providerHotelId:propertyId,canonicalPropertyId:null,propertyName,
        latitude:finite(hotel?.latitude),longitude:finite(hotel?.longitude),cityCode:clean(hotel?.cityCode)||null,
        roomCode:clean(raw?.room?.type||raw?.room?.typeEstimated?.category)||null,roomName:clean(raw?.room?.description?.text)||null,board:clean(raw?.boardType)||null,
        checkIn:start,checkOut:end,adults:Number(body?.adults)||1,children:Number(body?.children)||0,childAges:list(body?.childAges).map(Number),rooms:Number(body?.rooms)||1,
        totalPrice:price.total,currency:price.currency,totalIncludesMandatoryCharges:price.complete,basePrice:price.base,excludedMandatoryCharges:price.excludedMandatoryCharges,
        available:property?.available!==false,isLive:true,source:'provider_api',quotedAt:observedAt,freshnessMinutes:0,
        cancellation:cancellation(raw?.policies),paymentType:clean(raw?.policies?.paymentType)||null,providerRateKey:clean(raw?.id)||null,
        providerReliability:.8,bookingAuthority:'provider_api',bookingUrl:null,
      });
    }
  }
  return offers;
}

Deno.serve(async req=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
  if(req.method!=='POST')return json({error:'METHOD_NOT_ALLOWED'},405);
  try{
    const supabaseUrl=Deno.env.get('SUPABASE_URL')!,anon=Deno.env.get('SUPABASE_ANON_KEY')!,service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,auth=req.headers.get('Authorization')||'';
    const userClient=createClient(supabaseUrl,anon,{global:{headers:{Authorization:auth}}});
    const {data:{user},error:userError}=await userClient.auth.getUser();if(userError||!user)return json({error:'AUTH_REQUIRED'},401);
    const admin=createClient(supabaseUrl,service,{auth:{persistSession:false}});
    const [{data:cap,error:capError},{data:connection,error:connectionError}]=await Promise.all([
      admin.from('booking_provider_capabilities').select('provider_id,luvia_access_state,supports_search,supports_quote,supports_availability').eq('provider_id',PROVIDER).maybeSingle(),
      admin.from('booking_provider_connections').select('connection_state,activation_state,probe_state').eq('provider_id',PROVIDER).maybeSingle(),
    ]);
    if(capError||connectionError)throw capError||connectionError;
    const body=await req.json().catch(()=>({})),action=clean(body?.action||'search').toLowerCase();
    const clientId=clean(Deno.env.get('AMADEUS_CLIENT_ID')),clientSecret=clean(Deno.env.get('AMADEUS_CLIENT_SECRET'));
    const connected=cap?.luvia_access_state==='connected'&&connection?.connection_state==='connected'&&connection?.activation_state==='active';
    if(action==='diagnostics')return json({ok:true,version:VERSION,providerId:PROVIDER,connected,credentialsConfigured:Boolean(clientId&&clientSecret),environment:baseUrl().includes('test.')?'test':'production',liveTransportEnabled:true,failClosed:true});
    if(action!=='search')return json({error:'UNSUPPORTED_ACTION'},400);
    if(!connected)return expected('PARTNER_REQUIRED','Amadeus Hotels ist vorbereitet, aber noch nicht als verbundener Provider freigeschaltet.',{accessState:cap?.luvia_access_state||'missing',connectionState:connection?.connection_state||'missing'});
    if(cap?.supports_search!==true||cap?.supports_quote!==true)return expected('PROVIDER_CAPABILITY_DISABLED','Search und Quote sind für Amadeus Hotels nicht freigegeben.');
    if(!clientId||!clientSecret)return expected('AMADEUS_CREDENTIALS_MISSING','Amadeus Client-ID oder Client-Secret fehlt.');
    const checkIn=clean(body?.checkIn),checkOut=clean(body?.checkOut),adults=Number(body?.adults),children=Number(body?.children||0),rooms=Number(body?.rooms||1);
    if(!validDate(checkIn)||!validDate(checkOut)||checkOut<=checkIn||!Number.isInteger(adults)||adults<1||!Number.isInteger(rooms)||rooms<1)return json({error:'INVALID_STAY_QUERY'},400);
    if(children>0)return expected('AMADEUS_CHILD_OCCUPANCY_UNSUPPORTED','Dieser Amadeus-Self-Service-Pfad liefert für Kinderbelegung keine ausreichend eindeutige Preisidentität; Hotelbeds kann weiterhin antworten.');
    const started=Date.now(),token=await accessToken(clientId,clientSecret),hotelIds=await resolveHotelIds(token,body);
    if(!hotelIds.length)return expected('AMADEUS_DESTINATION_NOT_RESOLVED','Für das Reiseziel wurden keine Amadeus-Hotelkennungen gefunden.');
    const params=new URLSearchParams({hotelIds:hotelIds.join(','),adults:String(adults),checkInDate:checkIn,checkOutDate:checkOut,roomQuantity:String(rooms),currency:clean(body?.currency).toUpperCase()||'EUR',bestRateOnly:'false'});
    const response=await fetch(`${baseUrl()}/v3/shopping/hotel-offers?${params}`,{headers:{Authorization:`Bearer ${token}`},signal:AbortSignal.timeout(9000)});
    const payload=await response.json().catch(()=>({}));
    if(!response.ok){const code=payload?.errors?.[0]?.code||response.status;return expected('AMADEUS_SEARCH_FAILED','Amadeus hat die Livepreissuche nicht bestätigt.',{providerStatus:code,latencyMs:Date.now()-started});}
    const observedAt=new Date().toISOString(),offers=normalize(payload,body,observedAt);
    return json({ok:true,version:VERSION,providerId:PROVIDER,source:'provider_api',live:true,observedAt,latencyMs:Date.now()-started,offers,count:offers.length});
  }catch(error){console.error('[booking-provider-amadeus-hotels]',error);return json({error:'AMADEUS_ADAPTER_FAILED',details:error instanceof Error?error.message:String(error)},502);}
});
