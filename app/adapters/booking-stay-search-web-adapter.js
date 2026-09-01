(()=>{
'use strict';

const VERSION='1.0.0-booking-stay-search-web-port';
async function invoke(query){
  await globalThis.LuviaBooking?.init?.();
  const client=await globalThis.LuviaSupabaseService?.start?.();
  if(!client?.functions?.invoke)throw Object.assign(new Error('Das Hotelpreis-Gateway ist nicht erreichbar.'),{code:'BOOKING_STAY_SEARCH_TRANSPORT_UNAVAILABLE'});
  const {data,error}=await client.functions.invoke('booking-hotel-offer-search',{body:query});
  if(error)throw Object.assign(new Error(error.message||'Hotelpreis-Gateway fehlgeschlagen.'),{code:'BOOKING_STAY_SEARCH_GATEWAY_FAILED',cause:error});
  if(data?.error&&!data?.expected)throw Object.assign(new Error(data.details||data.error),{code:data.error});
  return data||{providerResults:[]};
}
async function search(input={}){
  const core=globalThis.LuviaBookingLiveStaySearchCore;
  if(typeof core?.search!=='function')throw Object.assign(new Error('Der Hotelpreis-Entscheidungs-Core ist nicht verfügbar.'),{code:'BOOKING_STAY_SEARCH_CORE_UNAVAILABLE'});
  return core.search(input,invoke);
}
globalThis.LuviaBookingStaySearchWebAdapter=Object.freeze({version:VERSION,search,diagnostics:()=>Object.freeze({version:VERSION,ready:Boolean(globalThis.LuviaBookingLiveStaySearchCore&&globalThis.LuviaSupabaseService),functionName:'booking-hotel-offer-search',network:true})});
})();
