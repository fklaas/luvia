import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const VERSION='1.0.0-requested-fail-closed-stays-v2';
const PROVIDER='duffel_stays';
const API_BASE='https://api.duffel.com';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json'};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:cors});
const expected=(error:string,details:string,extra:Record<string,unknown>={})=>json({ok:false,expected:true,providerId:PROVIDER,error,details,offers:[],...extra});
const clean=(value:unknown)=>String(value??'').trim();
const finite=(value:unknown)=>Number.isFinite(Number(value))?Number(value):null;
const list=(value:unknown)=>Array.isArray(value)?value:[];
const validDate=(value:string)=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(`${value}T00:00:00Z`));
const boundedId=(value:unknown,prefix:string)=>{const id=clean(value);return id.startsWith(prefix)&&id.length<=120?id:null};
const iso=(value:unknown)=>{const text=clean(value);return text&&!Number.isNaN(Date.parse(text))?new Date(text).toISOString():null};

function addressOf(accommodation:any){
  const address=accommodation?.location?.address||{};
  return [clean(address?.line_one),clean(address?.line_two),[clean(address?.postal_code),clean(address?.city_name)].filter(Boolean).join(' '),clean(address?.region),clean(address?.country_code)].filter(Boolean).join(', ')||null;
}
function coordinatesOf(accommodation:any){
  const coordinates=accommodation?.location?.geographic_coordinates||{};
  return{latitude:finite(coordinates?.latitude),longitude:finite(coordinates?.longitude)};
}
function photoUrls(accommodation:any){return list(accommodation?.photos).map(photo=>clean(photo?.url)).filter(url=>/^https:\/\//i.test(url)).slice(0,8)}
function cancellationOf(rate:any){
  const total=finite(rate?.total_amount),rows=list(rate?.cancellation_timeline).map(item=>({before:iso(item?.before),refundAmount:finite(item?.refund_amount),currency:clean(item?.currency).toUpperCase()||null})).filter(item=>item.before&&item.refundAmount!=null).sort((a,b)=>String(a.before).localeCompare(String(b.before)));
  const full=total==null?[]:rows.filter(item=>Math.abs(Number(item.refundAmount)-total)<0.01);
  return{refundable:rows.some(item=>Number(item.refundAmount)>0),freeCancellationUntil:full[0]?.before||null,timeline:rows,prepaymentRequired:clean(rate?.payment_type)==='pay_now'};
}
function commissionOf(raw:any){
  const amount=finite(raw?.estimated_commission_amount),currency=clean(raw?.estimated_commission_currency).toUpperCase();
  return amount==null||!/^[A-Z]{3}$/.test(currency)?null:{amount,currency,status:'estimated'};
}
function baseOffer(searchResult:any,body:any,observedAt:string){
  const accommodation=searchResult?.accommodation||{},coordinates=coordinatesOf(accommodation),total=finite(searchResult?.cheapest_rate_total_amount),currency=clean(searchResult?.cheapest_rate_currency).toUpperCase();
  const providerHotelId=clean(accommodation?.id),searchResultId=clean(searchResult?.id);
  return{
    offerId:searchResultId||`${PROVIDER}:${providerHotelId}`,
    providerId:PROVIDER,providerHotelId,providerOfferId:searchResultId||null,providerRateKey:null,canonicalPropertyId:null,
    propertyName:clean(accommodation?.name)||'Unterkunft',address:addressOf(accommodation),...coordinates,photoUrls:photoUrls(accommodation),
    checkIn:clean(searchResult?.check_in_date||body?.checkIn),checkOut:clean(searchResult?.check_out_date||body?.checkOut),
    adults:Number(body?.adults)||1,children:Number(body?.children)||0,childAges:list(body?.childAges).map(Number),rooms:Number(searchResult?.rooms??body?.rooms)||1,
    totalPrice:total,currency,totalIncludesMandatoryCharges:total!=null&&total>=0&&/^[A-Z]{3}$/.test(currency),basePrice:finite(searchResult?.cheapest_rate_base_amount),
    dueAtAccommodation:finite(searchResult?.cheapest_rate_due_at_accommodation_amount),available:Boolean(providerHotelId&&searchResultId&&total!=null),
    isLive:true,source:'provider_api',quotedAt:observedAt,quoteExpiresAt:iso(searchResult?.expires_at),freshnessMinutes:0,
    cancellation:{refundable:null,freeCancellationUntil:null,timeline:[],prepaymentRequired:null},paymentType:null,
    providerReliability:.85,bookingAuthority:'provider_api_quote_required',bookingUrl:null,bookingUrlVerified:false,
    commission:commissionOf(searchResult),evidence:{priceStage:'search_result',rateFetchRequired:true,finalQuoteRequired:true,marketScope:'duffel_stays_only'}
  };
}
function rateOffers(searchResult:any,body:any,observedAt:string){
  const accommodation=searchResult?.accommodation||{},coordinates=coordinatesOf(accommodation),providerHotelId=clean(accommodation?.id),searchResultId=clean(searchResult?.id),offers:any[]=[];
  for(const room of list(accommodation?.rooms))for(const rate of list(room?.rates)){
    const total=finite(rate?.total_amount),currency=clean(rate?.total_currency).toUpperCase(),rateId=clean(rate?.id),available=Number(rate?.quantity_available??1)>0;
    offers.push({
      offerId:rateId||`${PROVIDER}:${providerHotelId}:${offers.length+1}`,providerId:PROVIDER,providerHotelId,providerOfferId:searchResultId||null,providerRateKey:rateId||null,canonicalPropertyId:null,
      propertyName:clean(accommodation?.name)||'Unterkunft',address:addressOf(accommodation),...coordinates,photoUrls:photoUrls(accommodation),
      roomCode:clean(room?.id||room?.code)||null,roomName:clean(room?.name)||null,board:clean(rate?.board_type)||null,rateName:clean(rate?.name)||null,
      checkIn:clean(searchResult?.check_in_date||body?.checkIn),checkOut:clean(searchResult?.check_out_date||body?.checkOut),
      adults:Number(body?.adults)||list(searchResult?.guests).filter(guest=>clean(guest?.type)==='adult').length||1,
      children:Number(body?.children)||list(searchResult?.guests).filter(guest=>clean(guest?.type)==='child').length,
      childAges:list(body?.childAges).map(Number),rooms:Number(searchResult?.rooms??body?.rooms)||1,
      totalPrice:total,currency,totalIncludesMandatoryCharges:total!=null&&total>=0&&/^[A-Z]{3}$/.test(currency),basePrice:finite(rate?.base_amount),taxes:finite(rate?.tax_amount),mandatoryFees:finite(rate?.fee_amount),dueAtAccommodation:finite(rate?.due_at_accommodation_amount),
      available:Boolean(providerHotelId&&rateId&&available&&total!=null),isLive:true,source:'provider_api',quotedAt:observedAt,quoteExpiresAt:iso(rate?.expires_at||searchResult?.expires_at),freshnessMinutes:0,
      cancellation:cancellationOf(rate),paymentType:clean(rate?.payment_type)||null,providerReliability:.88,bookingAuthority:'provider_api_quote_required',bookingUrl:null,bookingUrlVerified:false,
      commission:commissionOf(rate),benefits:list(rate?.benefits).map(item=>({type:clean(item?.type)||null,title:clean(item?.title)||null,description:clean(item?.description)||null})).slice(0,12),
      evidence:{priceStage:'rate',searchResultId,finalQuoteRequired:true,marketScope:'duffel_stays_only'}
    });
  }
  return offers;
}
function quoteSummary(quote:any){
  const total=finite(quote?.total_amount),currency=clean(quote?.total_currency).toUpperCase();
  const quotedRate=list(quote?.accommodation?.rooms).flatMap(room=>list(room?.rates))[0]||null;
  return{id:clean(quote?.id)||null,totalPrice:total,currency,totalIncludesMandatoryCharges:total!=null&&total>=0&&/^[A-Z]{3}$/.test(currency),basePrice:finite(quote?.base_amount),taxes:finite(quote?.tax_amount),mandatoryFees:finite(quote?.fee_amount),checkIn:clean(quote?.check_in_date)||null,checkOut:clean(quote?.check_out_date)||null,rooms:Number(quote?.rooms)||null,expiresAt:iso(quotedRate?.expires_at),cancellation:cancellationOf(quotedRate),commission:commissionOf(quotedRate),bookingReady:Boolean(clean(quote?.id)&&total!=null),source:'provider_api',priceStage:'final_quote'};
}
async function duffel(token:string,path:string,{method='GET',data,correlationId,timeoutMs=12000}:{method?:string;data?:unknown;correlationId?:string|null;timeoutMs?:number}={}){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs),headers:Record<string,string>={Authorization:`Bearer ${token}`,'Duffel-Version':'v2',Accept:'application/json','Accept-Encoding':'gzip'};
  if(data!==undefined)headers['Content-Type']='application/json';
  if(correlationId)headers['x-client-correlation-id']=correlationId;
  try{
    const response=await fetch(`${API_BASE}${path}`,{method,headers,body:data===undefined?undefined:JSON.stringify({data}),signal:controller.signal});
    const payload=await response.json().catch(()=>({})),requestId=clean(response.headers.get('x-request-id'))||null;
    if(!response.ok){const providerCode=clean(payload?.errors?.[0]?.code)||String(response.status);throw Object.assign(new Error('DUFFEL_REQUEST_FAILED'),{status:response.status,providerCode,requestId});}
    return{payload,requestId,status:response.status};
  }finally{clearTimeout(timer)}
}
function providerFailure(error:any,stage:string,latencyMs:number){
  const status=Number(error?.status)||null,providerCode=clean(error?.providerCode)||null,requestId=clean(error?.requestId)||null;
  if(status===401)return expected('DUFFEL_AUTH_REJECTED','Duffel hat den Access Token abgelehnt.',{stage,providerStatus:status,providerCode,requestId,latencyMs});
  if(status===403)return expected('DUFFEL_STAYS_ACCESS_NOT_GRANTED','Das Duffel-Konto besitzt noch keinen freigeschalteten Stays-Zugang.',{stage,providerStatus:status,providerCode,requestId,latencyMs});
  if(status===429)return expected('DUFFEL_RATE_LIMITED','Duffel hat die Anfrage vorübergehend begrenzt.',{stage,providerStatus:status,providerCode,requestId,latencyMs});
  if(providerCode==='result_no_longer_available'||providerCode==='rate_unavailable')return expected('DUFFEL_PRICE_EXPIRED','Die gewählte Rate ist abgelaufen oder nicht mehr verfügbar. Eine neue Suche ist erforderlich.',{stage,providerStatus:status,providerCode,requestId,latencyMs});
  return expected('DUFFEL_REQUEST_FAILED','Duffel hat diesen Schritt nicht bestätigt.',{stage,providerStatus:status,providerCode,requestId,latencyMs});
}

Deno.serve(async req=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
  if(req.method!=='POST')return json({error:'METHOD_NOT_ALLOWED'},405);
  const started=Date.now();
  try{
    const supabaseUrl=Deno.env.get('SUPABASE_URL')!,anon=Deno.env.get('SUPABASE_ANON_KEY')!,service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,auth=req.headers.get('Authorization')||'';
    const bearer=auth.replace(/^Bearer\s+/i,'').trim(),isService=Boolean(service&&bearer===service);
    if(!isService){const userClient=createClient(supabaseUrl,anon,{global:{headers:{Authorization:auth}}});const {data:{user},error:userError}=await userClient.auth.getUser();if(userError||!user)return json({error:'AUTH_REQUIRED'},401);}
    const admin=createClient(supabaseUrl,service,{auth:{persistSession:false}}),body=await req.json().catch(()=>({})),action=clean(body?.action||'search').toLowerCase(),token=clean(Deno.env.get('DUFFEL_ACCESS_TOKEN'));
    const [{data:cap,error:capError},{data:connection,error:connectionError}]=await Promise.all([
      admin.from('booking_provider_capabilities').select('provider_id,luvia_access_state,supports_search,supports_details,supports_quote,supports_availability,supports_create_reservation,supports_cancel_reservation').eq('provider_id',PROVIDER).maybeSingle(),
      admin.from('booking_provider_connections').select('connection_state,activation_state,probe_state').eq('provider_id',PROVIDER).maybeSingle(),
    ]);
    if(capError||connectionError)throw capError||connectionError;
    const connected=cap?.luvia_access_state==='connected'&&connection?.connection_state==='connected'&&connection?.activation_state==='active'&&connection?.probe_state==='healthy';
    if(action==='diagnostics')return json({ok:true,version:VERSION,providerId:PROVIDER,applicationStatus:'submitted',applicationSubmittedOn:'2026-09-02',connected,credentialsConfigured:Boolean(token),staysAccessVerified:connected&&connection?.probe_state==='healthy',liveTransportEnabled:true,failClosed:true,operations:{search:'prepared',rates:'prepared',quote:'prepared',create:'ledger_required',status:'ledger_required',cancel:'ledger_required'}});
    if(!['search','rates','quote','create','status','cancel'].includes(action))return json({error:'UNSUPPORTED_ACTION'},400);
    if(!connected)return expected('APPLICATION_PENDING','Duffel Stays wurde am 02.09.2026 beantragt, aber noch nicht für dieses Konto freigeschaltet.',{accessState:cap?.luvia_access_state||'missing',connectionState:connection?.connection_state||'missing',applicationStatus:'submitted'});
    if(!token)return expected('DUFFEL_ACCESS_TOKEN_MISSING','Der Duffel Access Token fehlt im geschützten Secret Store.');
    if(['create','status','cancel'].includes(action)){
      if(!isService)return expected('SERVICE_ROLE_REQUIRED','Buchungs- und Stornierungsaktionen dürfen nur über den serverseitigen Booking Owner ausgeführt werden.');
      return expected('BOOKING_OWNER_LEDGER_REQUIRED','Diese Duffel-Operation bleibt gesperrt, bis Idempotenz, Nutzerbestätigung, Buchungsledger und Reconciliation gemeinsam angebunden sind.',{operation:action});
    }
    const correlationId=clean(body?.correlationId).slice(0,120)||crypto.randomUUID();
    if(action==='search'){
      if(cap?.supports_search!==true||cap?.supports_availability!==true)return expected('PROVIDER_CAPABILITY_DISABLED','Duffel Search und Availability sind nicht freigegeben.');
      const checkIn=clean(body?.checkIn),checkOut=clean(body?.checkOut),adults=Number(body?.adults),children=Number(body?.children||0),rooms=Number(body?.rooms||1),childAges=list(body?.childAges).map(Number),latitude=finite(body?.latitude),longitude=finite(body?.longitude);
      if(!validDate(checkIn)||!validDate(checkOut)||checkOut<=checkIn||!Number.isInteger(adults)||adults<1||!Number.isInteger(children)||children<0||childAges.length!==children||!Number.isInteger(rooms)||rooms<1)return json({error:'INVALID_STAY_QUERY'},400);
      const nights=Math.round((Date.parse(`${checkOut}T00:00:00Z`)-Date.parse(`${checkIn}T00:00:00Z`))/86400000);if(nights<1||nights>99)return json({error:'INVALID_STAY_LENGTH'},400);
      const accommodationIds=list(body?.providerHotelIds?.duffel_stays||body?.duffelAccommodationIds).map(value=>boundedId(value,'acc_')).filter(Boolean).slice(0,20);
      if(!accommodationIds.length&&(latitude==null||longitude==null||latitude < -90||latitude > 90||longitude < -180||longitude > 180))return expected('DUFFEL_LOCATION_REQUIRED','Duffel benötigt belegte Koordinaten oder Duffel-Unterkunftskennungen.');
      const guests=[...Array.from({length:adults},()=>({type:'adult'})),...childAges.map(age=>({type:'child',age}))],data:any={rooms,guests,check_in_date:checkIn,check_out_date:checkOut,mobile:body?.mobile===true};
      if(body?.cancellationPreference==='free'||body?.freeCancellationOnly===true)data.free_cancellation_only=true;
      if(accommodationIds.length)data.accommodation={ids:accommodationIds,fetch_rates:false};else data.location={radius:Math.min(100,Math.max(1,Math.round(Number(body?.radiusKm)||10))),geographic_coordinates:{latitude,longitude}};
      const result=await duffel(token,'/stays/search',{method:'POST',data,correlationId}),observedAt=new Date().toISOString(),offers=list(result.payload?.data?.results).map(item=>baseOffer(item,body,observedAt)).filter(offer=>offer.available);
      return json({ok:true,version:VERSION,providerId:PROVIDER,source:'provider_api',live:true,priceStage:'search_result',finalQuoteRequired:true,observedAt,latencyMs:Date.now()-started,requestId:result.requestId,offers,count:offers.length});
    }
    if(action==='rates'){
      if(cap?.supports_details!==true)return expected('PROVIDER_CAPABILITY_DISABLED','Duffel Rate Details sind nicht freigegeben.');
      const searchResultId=boundedId(body?.searchResultId||body?.providerOfferId,'srr_');if(!searchResultId)return json({error:'DUFFEL_SEARCH_RESULT_ID_REQUIRED'},400);
      const result=await duffel(token,`/stays/search_results/${encodeURIComponent(searchResultId)}/actions/fetch_all_rates`,{method:'POST',correlationId}),observedAt=new Date().toISOString(),offers=rateOffers(result.payload?.data,body,observedAt);
      return json({ok:true,version:VERSION,providerId:PROVIDER,source:'provider_api',live:true,priceStage:'rate',finalQuoteRequired:true,observedAt,latencyMs:Date.now()-started,requestId:result.requestId,searchResultId,offers,count:offers.length});
    }
    if(cap?.supports_quote!==true)return expected('PROVIDER_CAPABILITY_DISABLED','Duffel Quotes sind nicht freigegeben.');
    const rateId=boundedId(body?.rateId||body?.providerRateKey,'rat_');if(!rateId)return json({error:'DUFFEL_RATE_ID_REQUIRED'},400);
    const result=await duffel(token,'/stays/quotes',{method:'POST',data:{rate_id:rateId},correlationId}),quote=quoteSummary(result.payload?.data);
    return json({ok:true,version:VERSION,providerId:PROVIDER,source:'provider_api',live:true,observedAt:new Date().toISOString(),latencyMs:Date.now()-started,requestId:result.requestId,quote});
  }catch(error){console.error('[booking-provider-duffel-stays]',{message:error instanceof Error?error.message:String(error),status:(error as any)?.status||null,providerCode:(error as any)?.providerCode||null});return providerFailure(error,'provider_request',Date.now()-started);}
});
