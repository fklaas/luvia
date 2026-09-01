import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const VERSION='1.0.0-live-hotel-offers';
const PROVIDER='hotelbeds';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json'};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:cors});
const expected=(error:string,details:string,extra:Record<string,unknown>={})=>json({ok:false,expected:true,providerId:PROVIDER,error,details,offers:[],...extra});
const clean=(value:unknown)=>String(value??'').trim();
const finite=(value:unknown)=>Number.isFinite(Number(value))?Number(value):null;
const list=(value:unknown)=>Array.isArray(value)?value:[];
const validDate=(value:string)=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(`${value}T00:00:00Z`));
const baseUrl=()=>clean(Deno.env.get('HOTELBEDS_ENVIRONMENT')).toLowerCase()==='production'?'https://api.hotelbeds.com':'https://api.test.hotelbeds.com';
async function signature(apiKey:string,secret:string,timestamp:string){const bytes=new TextEncoder().encode(`${apiKey}${secret}${timestamp}`);const digest=await crypto.subtle.digest('SHA-256',bytes);return Array.from(new Uint8Array(digest)).map(byte=>byte.toString(16).padStart(2,'0')).join('');}

function mandatoryTotal(rate:any){
  const stated=finite(rate?.net),taxRows=list(rate?.taxes?.taxes),currency=clean(rate?.currency).toUpperCase();
  if(stated==null||stated<0)return{complete:false,total:null};
  let excluded=0,complete=true;
  for(const tax of taxRows){const included=tax?.included===true||clean(tax?.included).toLowerCase()==='true';if(included)continue;const amount=finite(tax?.amount);if(amount==null){complete=false;break;}excluded+=amount;}
  return{complete,total:complete?Number((stated+excluded).toFixed(2)):null,excludedMandatoryCharges:excluded,currency};
}
function cancellation(rate:any){const rows=list(rate?.cancellationPolicies),dates=rows.map(item=>clean(item?.from)).filter(value=>!Number.isNaN(Date.parse(value))).sort();return{refundable:dates.length>0,freeCancellationUntil:dates[0]?.slice(0,10)||null,description:clean(rate?.rateComments)||null,prepaymentRequired:clean(rate?.paymentType).toUpperCase()==='AT_WEB'};}
function normalize(payload:any,body:any,observedAt:string){
  const offers=[] as any[],currency=clean(payload?.hotels?.currency||body?.currency).toUpperCase();
  for(const hotel of list(payload?.hotels?.hotels))for(const room of list(hotel?.rooms))for(const rate of list(room?.rates)){
    const price=mandatoryTotal({...rate,currency}),providerHotelId=clean(hotel?.code);
    offers.push({offerId:clean(rate?.rateKey)||`${PROVIDER}:${providerHotelId}:${offers.length+1}`,providerId:PROVIDER,providerHotelId,canonicalPropertyId:null,propertyName:clean(hotel?.name)||'Unterkunft',latitude:finite(hotel?.latitude),longitude:finite(hotel?.longitude),destinationCode:clean(hotel?.destinationCode)||clean(body?.providerDestinationIds?.hotelbeds)||null,roomCode:clean(room?.code)||null,roomName:clean(room?.name)||null,board:clean(rate?.boardName||rate?.boardCode)||null,checkIn:clean(payload?.hotels?.checkIn||body?.checkIn),checkOut:clean(payload?.hotels?.checkOut||body?.checkOut),adults:Number(rate?.adults??body?.adults)||1,children:Number(rate?.children??body?.children)||0,childAges:list(body?.childAges).map(Number),rooms:Number(rate?.rooms??body?.rooms)||1,totalPrice:price.total,currency,totalIncludesMandatoryCharges:price.complete,basePrice:finite(rate?.net),excludedMandatoryCharges:price.excludedMandatoryCharges,available:Number(rate?.allotment??1)>0,isLive:true,source:'provider_api',quotedAt:observedAt,freshnessMinutes:0,cancellation:cancellation(rate),paymentType:clean(rate?.paymentType)||null,providerRateKey:clean(rate?.rateKey)||null,providerReliability:.85,bookingAuthority:'provider_api',bookingUrl:null});
  }
  return offers;
}

Deno.serve(async req=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
  if(req.method!=='POST')return json({error:'METHOD_NOT_ALLOWED'},405);
  try{
    const supabaseUrl=Deno.env.get('SUPABASE_URL')!,anon=Deno.env.get('SUPABASE_ANON_KEY')!,service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,auth=req.headers.get('Authorization')||'';
    const userClient=createClient(supabaseUrl,anon,{global:{headers:{Authorization:auth}}});const {data:{user},error:userError}=await userClient.auth.getUser();if(userError||!user)return json({error:'AUTH_REQUIRED'},401);
    const admin=createClient(supabaseUrl,service,{auth:{persistSession:false}});
    const [{data:cap,error:capError},{data:connection,error:connectionError}]=await Promise.all([
      admin.from('booking_provider_capabilities').select('provider_id,luvia_access_state,supports_search,supports_quote,supports_availability').eq('provider_id',PROVIDER).maybeSingle(),
      admin.from('booking_provider_connections').select('connection_state,activation_state,probe_state').eq('provider_id',PROVIDER).maybeSingle(),
    ]);
    if(capError||connectionError)throw capError||connectionError;
    const body=await req.json().catch(()=>({})),action=clean(body?.action||'search').toLowerCase(),apiKey=clean(Deno.env.get('HOTELBEDS_API_KEY')),secret=clean(Deno.env.get('HOTELBEDS_API_SECRET'));
    const connected=cap?.luvia_access_state==='connected'&&connection?.connection_state==='connected'&&connection?.activation_state==='active';
    if(action==='diagnostics')return json({ok:true,version:VERSION,providerId:PROVIDER,connected,credentialsConfigured:Boolean(apiKey&&secret),environment:baseUrl().includes('test.')?'test':'production',liveTransportEnabled:true,failClosed:true});
    if(action!=='search')return json({error:'UNSUPPORTED_ACTION'},400);
    if(!connected)return expected('PARTNER_REQUIRED','Hotelbeds ist vorbereitet, aber noch nicht als verbundener Provider freigeschaltet.',{accessState:cap?.luvia_access_state||'missing',connectionState:connection?.connection_state||'missing'});
    if(cap?.supports_search!==true||cap?.supports_quote!==true)return expected('PROVIDER_CAPABILITY_DISABLED','Search und Quote sind für Hotelbeds nicht freigegeben.');
    if(!apiKey||!secret)return expected('HOTELBEDS_CREDENTIALS_MISSING','Hotelbeds API-Key oder API-Secret fehlt.');
    const checkIn=clean(body?.checkIn),checkOut=clean(body?.checkOut),adults=Number(body?.adults),children=Number(body?.children||0),rooms=Number(body?.rooms||1),childAges=list(body?.childAges).map(Number);
    if(!validDate(checkIn)||!validDate(checkOut)||checkOut<=checkIn||!Number.isInteger(adults)||adults<1||!Number.isInteger(children)||children<0||childAges.length!==children||!Number.isInteger(rooms)||rooms<1)return json({error:'INVALID_STAY_QUERY'},400);
    const destinationCode=clean(body?.providerDestinationIds?.hotelbeds||body?.hotelbedsDestinationCode),hotelCodes=list(body?.providerHotelIds?.hotelbeds||body?.hotelbedsHotelCodes).map(Number).filter(Number.isInteger).slice(0,100);
    if(!destinationCode&&!hotelCodes.length)return expected('HOTELBEDS_DESTINATION_ID_REQUIRED','Für Hotelbeds fehlt eine verifizierte Destination- oder Hotelkennung.');
    const paxes=[...Array.from({length:adults},()=>({type:'AD',age:30})),...childAges.map(age=>({type:'CH',age}))];
    const requestBody:any={stay:{checkIn,checkOut},occupancies:[{rooms,adults,children,paxes}]};
    if(hotelCodes.length)requestBody.hotels={hotel:hotelCodes};else requestBody.destination={code:destinationCode};
    const timestamp=Math.floor(Date.now()/1000).toString(),xSignature=await signature(apiKey,secret,timestamp),started=Date.now();
    const response=await fetch(`${baseUrl()}/hotel-api/1.0/hotels`,{method:'POST',headers:{'Api-key':apiKey,'X-Signature':xSignature,Accept:'application/json','Accept-Encoding':'gzip','Content-Type':'application/json'},body:JSON.stringify(requestBody),signal:AbortSignal.timeout(9000)});
    const payload=await response.json().catch(()=>({}));
    if(!response.ok){const code=payload?.error?.code||payload?.error?.message||response.status;return expected('HOTELBEDS_SEARCH_FAILED','Hotelbeds hat die Livepreissuche nicht bestätigt.',{providerStatus:code,latencyMs:Date.now()-started});}
    const observedAt=new Date().toISOString(),offers=normalize(payload,body,observedAt);
    return json({ok:true,version:VERSION,providerId:PROVIDER,source:'provider_api',live:true,observedAt,latencyMs:Date.now()-started,offers,count:offers.length});
  }catch(error){console.error('[booking-provider-hotelbeds]',error);return json({error:'HOTELBEDS_ADAPTER_FAILED',details:error instanceof Error?error.message:String(error)},502);}
});
