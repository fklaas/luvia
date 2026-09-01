(()=>{
'use strict';

const CONTRACT_ID='booking.v1';
const VERSION='1';
const RUNTIME_VERSION='1.2.0-owner-action-bundle';

function unavailable(provider){const error=new Error(`Booking Contract v1: ${provider} ist nicht verfügbar.`);error.code='BOOKING_CONTRACT_PROVIDER_UNAVAILABLE';error.provider=provider;throw error}
function runtime(){const api=globalThis.LuviaBooking;if(!api)unavailable('LuviaBooking');return api}
function ui(){const api=globalThis.LuviaBookingUI;if(typeof api?.openForPlace!=='function')unavailable('LuviaBookingUI.openForPlace');return api}
function draftCore(){const api=globalThis.LuviaBookingDraftCoreV1;if(!api)unavailable('LuviaBookingDraftCoreV1');return api}
function availability(){const api=globalThis.LuviaBookingAvailability;if(typeof api?.check!=='function')unavailable('LuviaBookingAvailability');return api}
function recovery(){const api=globalThis.LuviaBookingReservationRecovery;if(typeof api?.reconcile!=='function')unavailable('LuviaBookingReservationRecovery');return api}
function externalNavigation(){const api=globalThis.LuviaPlatformPorts?.get?.('ExternalNavigationPort');if(typeof api?.open!=='function')unavailable('ExternalNavigationPort');return api}
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
async function conversationPreferences(bookingIds=[]){return immutable(await runtime().conversationPreferences((bookingIds||[]).map(clean).filter(Boolean)))}
async function checkAvailability(input={}){return immutable(await availability().check(input))}
async function resolveChannel(input={}){
  const bookingId=clean(input.bookingId||input.id);
  return immutable(bookingId?await runtime().resolveRoute(bookingId):await runtime().resolvePlaceRoute(input.place||input));
}
async function reconcileUnknownOutcome(input={}){return immutable(await recovery().reconcile(input))}

async function createForPlace(input={}){return immutable(await runtime().createForPlace(input))}
async function reply(bookingId,input={}){return immutable(await runtime().reply(clean(bookingId),input))}
async function performIntelligenceAction(bookingId,input={}){return immutable(await runtime().performIntelligenceAction(clean(bookingId),input))}
async function modifyBooking(bookingId,input={}){return immutable(await runtime().modifyBooking(clean(bookingId),input))}
async function cancelBooking(bookingId,input={}){return immutable(await runtime().cancelBooking(clean(bookingId),input))}
async function setConversationPreference(bookingId,action,value){return immutable(await runtime().setConversationPreference(clean(bookingId),clean(action),value))}
async function updateContact(bookingId,email){return immutable(await runtime().updateContact(clean(bookingId),clean(email)))}
async function reconcileTripReturns(tripId){return immutable(await runtime().reconcileTripReturns(clean(tripId)))}
async function openPlaceBooking(place={},options={}){
  const result=await ui().openForPlace(placeProjection(place),{...options,reserveExternalWindow:options.reserveExternalWindow!==false});
  return immutable({opened:result?.opened===true,channel:clean(result?.channel)||'owner_dialog',provider:clean(result?.provider)||null,owner:'booking',contractId:CONTRACT_ID});
}
function createDraft(input={}){return draftCore().createDraft(input)}
function updateDraft(current={},patch={}){return draftCore().updateDraft(current,patch)}
function validateDraft(input={},required){return draftCore().validateDraft(input,required)}
function selectRoute(current={},route){return draftCore().selectRoute(current,route)}
function composeMessageDraft(input={}){return draftCore().composeMessageDraft(input)}
async function openRoute(input={}){
  const bookingId=clean(input.bookingId||input.id),route=input.route||await resolveChannel(input),url=clean(route?.url||route?.value||input.url);
  if(!url)throw Object.assign(new Error('Booking Contract v1: kein verifizierter Buchungsweg verfügbar.'),{code:'BOOKING_ROUTE_UNAVAILABLE'});
  const opened=await externalNavigation().open(url);
  if(bookingId&&typeof runtime().recordHandoff==='function')await runtime().recordHandoff(bookingId,{provider:route?.provider||route?.channel||'official',url,providerReference:route?.providerReference||null,metadata:{source:'booking.v1.openRoute'}});
  return immutable({opened:opened!==false,url,bookingId:bookingId||null,provider:clean(route?.provider||route?.channel)||null,owner:'booking',contractId:CONTRACT_ID});
}
async function openExternalHandoff(input={}){
  const place=placeProjection(input.place||input),route=input.route||await runtime().resolvePlaceRoute(place),result=await openRoute({route,place});
  if(typeof runtime().recordPlaceHandoff==='function')await runtime().recordPlaceHandoff(place,route);
  return immutable({...result,providerPlaceId:place.providerPlaceId});
}
async function retryRecovery(input={}){
  const action=clean(input.action).toLowerCase(),bookingId=clean(input.bookingId||input.booking_id),idempotencyKey=clean(input.idempotencyKey||input.idempotency_key);
  if(!bookingId||!idempotencyKey||!['modify','cancel'].includes(action))throw Object.assign(new Error('Booking Contract v1: Booking-ID, Aktion und Idempotency-Key fehlen.'),{code:'BOOKING_RETRY_INPUT_INVALID'});
  const payload={...input,idempotencyKey};
  return immutable(action==='cancel'?await runtime().cancelBooking(bookingId,payload):await runtime().modifyBooking(bookingId,payload));
}
async function resolveThread(input={}){
  const bookingId=clean(input.bookingId||input.id);if(!bookingId)throw Object.assign(new Error('Booking Contract v1: Booking-ID fehlt.'),{code:'BOOKING_ID_REQUIRED'});
  return immutable(await runtime().setConversationPreference(bookingId,'resolved',input.resolved===false?null:(input.at||new Date().toISOString())));
}

const reads=Object.freeze({listForTrip,get,conversation,messages,bookingTimeline,providerCapabilities,conversationPreferences,checkAvailability,resolveChannel,reconcileUnknownOutcome});
const composition=Object.freeze({createDraft,updateDraft,validateDraft,selectRoute,composeMessageDraft});
const commands=Object.freeze({createForPlace,reply,performIntelligenceAction,modifyBooking,cancelBooking,setConversationPreference,updateContact,reconcileTripReturns,openPlaceBooking,openRoute,openExternalHandoff,retryRecovery,resolveThread});
const api=Object.freeze({
  contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,reads,composition,commands,
  events:Object.freeze(['booking.changed','booking.created','booking.status.changed','booking.message.changed','booking.provider.selected']),
  init,listForTrip,get,conversation,messages,bookingTimeline,providerCapabilities,conversationPreferences,createForPlace,reply,performIntelligenceAction,modifyBooking,cancelBooking,setConversationPreference,updateContact,reconcileTripReturns,openPlaceBooking,placeProjection,
  diagnostics:()=>Object.freeze({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,ready:Boolean(globalThis.LuviaBooking&&globalThis.LuviaBookingUI?.openForPlace&&globalThis.LuviaBookingDraftCoreV1),providers:Object.freeze({runtime:Boolean(globalThis.LuviaBooking),ownerFlow:Boolean(globalThis.LuviaBookingUI?.openForPlace),draftCore:Boolean(globalThis.LuviaBookingDraftCoreV1),availability:Boolean(globalThis.LuviaBookingAvailability),recovery:Boolean(globalThis.LuviaBookingReservationRecovery)}),ownership:Object.freeze({bookingTruth:true,intelligenceTruth:false,foreignDomainMutation:false})})
});

globalThis.LuviaBookingContractV1=api;
globalThis.LuviaBookingPublicContract=api;
globalThis.LuviaGlobalContracts?.register?.({id:CONTRACT_ID,version:VERSION,required:false,probe:()=>({available:api.diagnostics().ready,detail:'Booking v1 owner adapter'})});
})();
