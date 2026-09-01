(()=>{
'use strict';

const VERSION='1.1.0-lifecycle';
const clean=value=>String(value??'').trim();
const reference=value=>{const result=clean(value);return result&&/^[A-Za-z0-9._:/-]{1,200}$/.test(result)?result:null};
const providerError=(providerId,state)=>Object.assign(new Error(`${providerId}: Partnerzugang ist noch nicht verbunden.`),{code:'BOOKING_PROVIDER_PARTNER_REQUIRED',providerId,state});

function create(config={}){
  const providerId=clean(config.id).toLowerCase(),globalName=clean(config.globalName),functionName=clean(config.functionName);
  if(!providerId||!globalName||!functionName)throw new Error('Admission-Provider-Konfiguration ist unvollständig.');
  const operations=Object.freeze([...(config.operations||[])]),priority=Number(config.priority)||88;
  const capability=()=>globalThis.LuviaBookingProviderCapabilities?.get?.(providerId)||null;
  const access=()=>{const current=capability();return Object.freeze({providerId,state:current?.luviaAccessState||'partner_required',connected:current?.luviaAccessState==='connected',availability:current?.platform?.availability===true,createReservation:current?.platform?.createReservation===true,modifyReservation:current?.platform?.modifyReservation===true,cancelReservation:current?.platform?.cancelReservation===true,statusWebhook:current?.platform?.statusWebhook===true,statusPolling:current?.platform?.statusPolling===true,operations});};
  const assertConnected=()=>{const current=access();if(!current.connected)throw providerError(providerId,current.state);return current};
  async function invoke(action,payload={}){
    assertConnected();
    if(!operations.includes(action))throw Object.assign(new Error(`${providerId}: Aktion ${action} wird vom Adapter nicht angeboten.`),{code:'BOOKING_PROVIDER_OPERATION_UNSUPPORTED',providerId,action});
    await globalThis.LuviaBooking?.init?.();
    const client=await globalThis.LuviaSupabaseService?.start?.();
    if(!client?.functions?.invoke)throw Object.assign(new Error(`${providerId}: Provider-Transport ist nicht bereit.`),{code:'BOOKING_PROVIDER_TRANSPORT_UNAVAILABLE',providerId});
    const {data,error}=await client.functions.invoke(functionName,{body:{action,payload}});
    if(error)throw error;if(data?.error)throw new Error(data.details||data.error);return data;
  }
  const catalog=input=>invoke('catalog',input),availability=input=>invoke('availability',input),createReservation=input=>invoke('create_reservation',input),confirmReservation=input=>invoke('confirm_reservation',input),getReservation=input=>invoke('get_reservation',input),getTickets=input=>invoke('get_tickets',input),modifyReservation=input=>invoke('modify_reservation',input),cancelReservation=input=>invoke('cancel_reservation',input),diagnostics=()=>invoke('diagnostics',{});
  function mapProviderStatus(raw){const key=clean(raw).toLowerCase().replace(/[\s-]+/g,'_');return({confirmed:'confirmed',booked:'confirmed',completed:'confirmed',cancelled:'cancelled',canceled:'cancelled',declined:'declined',rejected:'declined',pending:'awaiting_reply',requested:'requested',created:'requested',action_required:'needs_action',needs_action:'needs_action'})[key]||null}
  function register(){
    const registry=globalThis.LuviaBookingProviderRegistry;if(!registry)return null;
    const definition={id:providerId,version:VERSION,channel:'api',priority,network:true,capability:capability(),supports:(booking,context={})=>{const current=access(),venue=reference(context.venueReference||context.productId||booking?.request?.providerReference||booking?.metadata?.providers?.[providerId]?.reference);return{supported:Boolean(current.connected&&venue),score:current.connected&&venue?priority:0,reason:current.connected&&venue?`${config.name||providerId} API verbunden`:`${config.name||providerId} Partnerzugang noch nicht verbunden`}},dispatch:(booking,context={})=>createReservation({bookingId:booking?.id,providerReference:reference(context.venueReference||context.productId||booking?.request?.providerReference||booking?.metadata?.providers?.[providerId]?.reference)})};
    try{return registry.register(definition,{replace:true})}catch(error){console.warn(`[${globalName}] Registry`,error);return null}
  }
  const api=Object.freeze({version:VERSION,providerId,capability,access,operations,normalizeProviderReference:reference,mapProviderStatus,catalog,availability,createReservation,confirmReservation,getReservation,getTickets,modifyReservation,cancelReservation,diagnostics,register});
  globalThis[globalName]=api;if(globalThis.LuviaBookingProviderRegistry)register();return api;
}

globalThis.LuviaAdmissionPartnerAdapterFactory=Object.freeze({version:VERSION,create});
})();
