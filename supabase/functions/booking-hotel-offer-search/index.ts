import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const VERSION='1.1.0-duffel-requested-live-price-gateway';
const PROVIDER_FUNCTIONS:Record<string,string>={duffel_stays:'booking-provider-duffel-stays',hotelbeds:'booking-provider-hotelbeds',amadeus_hotels:'booking-provider-amadeus-hotels'};
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json'};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:cors});
const clean=(value:unknown)=>String(value??'').trim();
const list=(value:unknown)=>Array.isArray(value)?value:[];
const validDate=(value:string)=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(`${value}T00:00:00Z`));
const validUuid=(value:string|null)=>!value||/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
async function sha256(input:string){const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(input));return Array.from(new Uint8Array(digest)).map(byte=>byte.toString(16).padStart(2,'0')).join('');}
function normalizedProviders(value:unknown){const requested=list(value).map(item=>clean(item).toLowerCase()).filter(item=>item in PROVIDER_FUNCTIONS);return [...new Set(requested.length?requested:Object.keys(PROVIDER_FUNCTIONS))];}
function safeOfferSummary(offer:any){return{providerId:clean(offer?.providerId),providerHotelId:clean(offer?.providerHotelId)||null,offerId:clean(offer?.offerId)||null,checkIn:clean(offer?.checkIn)||null,checkOut:clean(offer?.checkOut)||null,rooms:Number(offer?.rooms)||null,adults:Number(offer?.adults)||null,children:Number(offer?.children)||0,currency:clean(offer?.currency)||null,totalPrice:Number.isFinite(Number(offer?.totalPrice))?Number(offer.totalPrice):null,totalIncludesMandatoryCharges:offer?.totalIncludesMandatoryCharges===true,available:offer?.available===true,quotedAt:clean(offer?.quotedAt)||null};}

Deno.serve(async req=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
  if(req.method!=='POST')return json({error:'METHOD_NOT_ALLOWED'},405);
  let searchId:string|null=null;
  try{
    const supabaseUrl=Deno.env.get('SUPABASE_URL')!,anon=Deno.env.get('SUPABASE_ANON_KEY')!,service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,auth=req.headers.get('Authorization')||'';
    const userClient=createClient(supabaseUrl,anon,{global:{headers:{Authorization:auth}}});const {data:{user},error:userError}=await userClient.auth.getUser();if(userError||!user)return json({error:'AUTH_REQUIRED'},401);
    const admin=createClient(supabaseUrl,service,{auth:{persistSession:false}}),body=await req.json().catch(()=>({}));
    const checkIn=clean(body?.checkIn),checkOut=clean(body?.checkOut),tripId=clean(body?.tripId)||null,adults=Number(body?.adults),children=Number(body?.children||0),rooms=Number(body?.rooms||1),childAges=list(body?.childAges).map(Number),currency=clean(body?.currency).toUpperCase()||'EUR',providers=normalizedProviders(body?.providers);
    if(!validDate(checkIn)||!validDate(checkOut)||checkOut<=checkIn)return json({error:'INVALID_STAY_RANGE'},400);
    if(!Number.isInteger(adults)||adults<1||adults>100||!Number.isInteger(children)||children<0||children>30||childAges.length!==children||!Number.isInteger(rooms)||rooms<1||rooms>30)return json({error:'INVALID_OCCUPANCY'},400);
    if(!validUuid(tripId))return json({error:'INVALID_TRIP_ID'},400);
    if(!/^[A-Z]{3}$/.test(currency))return json({error:'INVALID_CURRENCY'},400);
    const fingerprint=await sha256(JSON.stringify({checkIn,checkOut,adults,children,childAges,rooms,currency,providers,destination:clean(body?.destination),cityCode:clean(body?.cityCode),providerDestinationIds:body?.providerDestinationIds||{},providerHotelIds:body?.providerHotelIds||{}}));
    const {data:created,error:createError}=await admin.from('booking_stay_offer_searches').insert({requested_by:user.id,trip_id:tripId,query_fingerprint:fingerprint,provider_ids:providers,state:'running',evidence:{version:VERSION,rawPromptStored:false,exactCoordinatesStored:false}}).select('id').single();
    if(createError)return json({ok:false,expected:true,error:'STAY_SEARCH_LEDGER_UNAVAILABLE',details:'Die Hotelpreis-Suche ist noch nicht vollständig migriert.',providerResults:[],offers:[]});
    searchId=created.id;
    const {data:readiness,error:readinessError}=await admin.from('booking_stay_offer_readiness_v1').select('*').in('provider_id',providers);
    if(readinessError)throw readinessError;
    const readinessById=new Map((readiness||[]).map((item:any)=>[item.provider_id,item]));
    const providerResults:any[]=[];
    const ready=providers.filter(provider=>{
      const item:any=readinessById.get(provider);
      if(item?.runtime_state==='ready')return true;
      providerResults.push({providerId:provider,ok:false,expected:true,error:clean(item?.runtime_reason)||'PARTNER_REQUIRED',offers:[],state:'blocked'});return false;
    });
    const invoked=await Promise.all(ready.map(async provider=>{
      const started=Date.now(),controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
      try{
        const response=await fetch(`${supabaseUrl}/functions/v1/${PROVIDER_FUNCTIONS[provider]}`,{method:'POST',headers:{Authorization:auth,apikey:anon,'Content-Type':'application/json'},body:JSON.stringify({...body,action:'search',providers:undefined}),signal:controller.signal});
        const data=await response.json().catch(()=>({ok:false,error:'INVALID_PROVIDER_RESPONSE'}));
        if(!response.ok&&!data?.expected)return{providerId:provider,ok:false,expected:false,error:clean(data?.error)||'PROVIDER_HTTP_ERROR',offers:[],state:'failed',latencyMs:Date.now()-started};
        return{...data,providerId:provider,latencyMs:Number(data?.latencyMs)||Date.now()-started};
      }catch(error){return{providerId:provider,ok:false,expected:false,error:error instanceof DOMException&&error.name==='AbortError'?'PROVIDER_TIMEOUT':'PROVIDER_NETWORK_ERROR',offers:[],state:'failed',latencyMs:Date.now()-started};}
      finally{clearTimeout(timer);}
    }));
    providerResults.push(...invoked);
    const succeeded=providerResults.filter(result=>result?.ok===true&&result?.source==='provider_api'&&result?.live===true),offers=succeeded.flatMap(result=>list(result?.offers)),failed=providerResults.filter(result=>!succeeded.includes(result)).map(result=>clean(result?.providerId)).filter(Boolean),observedAt=new Date().toISOString();
    const productMode=offers.length?(succeeded.length>1?'cross_source_live_prices':'single_source_live_prices'):'fit_only';
    for(const result of succeeded){const summaries=list(result?.offers).map(safeOfferSummary);if(summaries.length)await admin.from('booking_stay_offer_snapshots').insert({search_id:searchId,provider_id:result.providerId,observed_at:result.observedAt||observedAt,offer_count:summaries.length,offer_summaries:summaries,evidence:{source:'provider_api',live:true,latencyMs:result.latencyMs||null}});}
    await admin.from('booking_stay_offer_searches').update({state:'completed',product_mode:productMode,result_count:offers.length,succeeded_provider_ids:succeeded.map(result=>result.providerId),failed_provider_ids:failed,finished_at:observedAt,evidence:{version:VERSION,rawPromptStored:false,exactCoordinatesStored:false,attemptedProviders:providers,liveProviders:succeeded.map(result=>result.providerId)}}).eq('id',searchId);
    return json({ok:true,version:VERSION,searchId,productMode,source:'booking_owner_gateway',liveProviderCount:succeeded.length,providerResults,offers,observedAt,invariants:{onlyConnectedProvidersInvoked:true,affiliateLinksNeverBecomeOffers:true,noBestMarketClaim:true,rawPromptStored:false,exactCoordinatesStored:false}});
  }catch(error){console.error('[booking-hotel-offer-search]',error);if(searchId)try{const admin=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});await admin.from('booking_stay_offer_searches').update({state:'failed',finished_at:new Date().toISOString(),evidence:{version:VERSION,error:'STAY_SEARCH_GATEWAY_FAILED'}}).eq('id',searchId);}catch{}return json({error:'STAY_SEARCH_GATEWAY_FAILED',details:error instanceof Error?error.message:String(error)},500);}
});
