(()=>{
'use strict';

const CONTRACT_ID='booking.v1';
const VERSION='1';
const RUNTIME_VERSION='1.0.0';

function unavailable(provider){const error=new Error(`Booking Contract v1: ${provider} ist nicht verfügbar.`);error.code='BOOKING_CONTRACT_PROVIDER_UNAVAILABLE';error.provider=provider;throw error}
function runtime(){const api=globalThis.LuviaBooking;if(!api)unavailable('LuviaBooking');return api}
function ui(){const api=globalThis.LuviaBookingUI;if(typeof api?.openForPlace!=='function')unavailable('LuviaBookingUI.openForPlace');return api}
function immutable(value){
  if(value==null||typeof value!=='object')return value;
  if(Array.isArray(value))return Object.freeze(value.map(immutable));
  return Object.freeze(Object.fromEntries(Object.entries(value).map(([key,item])=>[key,immutable(item)])));
}
const clean=value=>String(value??'').trim();
function placeProjection(input={}){
  const providerPlaceId=clean(input.providerPlaceId||input.provider_place_id||input.id).replace(/^places\//,'');
  if(!providerPlaceId)throw Object.assign(new Error('Booking Contract v1: providerPlaceId fehlt.'),{code:'BOOKING_PLACE_ID_REQUIRED'});
  return immutable({
    id:providerPlaceId,
    providerPlaceId,
    type:clean(input.type||input.primaryType||input.primary_type)||'restaurant',
    name:clean(input.name)||'Ausgewählter Ort',
    address:clean(input.address||input.formattedAddress),
    website:clean(input.website||input.websiteUri),
    reservationUrl:clean(input.reservationUrl||input.bookingUrl)
  });
}

async function init(){return immutable(await runtime().init?.())}
async function listForTrip(tripId){return immutable(await runtime().listForTrip(clean(tripId)))}
async function get(bookingId){return immutable(await runtime().get(clean(bookingId)))}
async function conversation(bookingId){return immutable(await runtime().conversation(clean(bookingId)))}
async function messages(bookingId){return immutable(await runtime().messages(clean(bookingId)))}
async function bookingTimeline(bookingId){return immutable(await runtime().bookingTimeline(clean(bookingId)))}
async function providerCapabilities(){return immutable(await runtime().providerCapabilities())}

async function createForPlace(input={}){return immutable(await runtime().createForPlace(input))}
async function reply(bookingId,input={}){return immutable(await runtime().reply(clean(bookingId),input))}
async function performIntelligenceAction(bookingId,input={}){return immutable(await runtime().performIntelligenceAction(clean(bookingId),input))}
async function modifyBooking(bookingId,input={}){return immutable(await runtime().modifyBooking(clean(bookingId),input))}
async function cancelBooking(bookingId,input={}){return immutable(await runtime().cancelBooking(clean(bookingId),input))}
async function setConversationPreference(bookingId,action,value){return immutable(await runtime().setConversationPreference(clean(bookingId),clean(action),value))}
async function openPlaceBooking(place={},options={}){
  const result=await ui().openForPlace(placeProjection(place),{...options,reserveExternalWindow:options.reserveExternalWindow!==false});
  return immutable({opened:result?.opened===true,channel:clean(result?.channel)||'owner_dialog',provider:clean(result?.provider)||null,owner:'booking',contractId:CONTRACT_ID});
}

const reads=Object.freeze({listForTrip,get,conversation,messages,bookingTimeline,providerCapabilities});
const commands=Object.freeze({createForPlace,reply,performIntelligenceAction,modifyBooking,cancelBooking,setConversationPreference,openPlaceBooking});
const api=Object.freeze({
  contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,reads,commands,
  events:Object.freeze(['booking.changed','booking.created','booking.status.changed','booking.message.changed','booking.provider.selected']),
  init,listForTrip,get,conversation,messages,bookingTimeline,providerCapabilities,createForPlace,reply,performIntelligenceAction,modifyBooking,cancelBooking,setConversationPreference,openPlaceBooking,placeProjection,
  diagnostics:()=>Object.freeze({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,ready:Boolean(globalThis.LuviaBooking&&globalThis.LuviaBookingUI?.openForPlace),providers:Object.freeze({runtime:Boolean(globalThis.LuviaBooking),ownerFlow:Boolean(globalThis.LuviaBookingUI?.openForPlace)}),ownership:Object.freeze({bookingTruth:true,intelligenceTruth:false,foreignDomainMutation:false})})
});

globalThis.LuviaBookingContractV1=api;
globalThis.LuviaBookingPublicContract=api;
globalThis.LuviaGlobalContracts?.register?.({id:CONTRACT_ID,version:VERSION,required:false,probe:()=>({available:api.diagnostics().ready,detail:'Booking v1 owner adapter'})});
})();
