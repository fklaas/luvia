(()=>{
'use strict';

const CONTRACT_ID='booking.v1';
const VERSION='1';
const RUNTIME_VERSION='1.6.0-live-stay-search-owner';

function unavailable(provider){const error=new Error(`Booking Contract v1: ${provider} ist nicht verfügbar.`);error.code='BOOKING_CONTRACT_PROVIDER_UNAVAILABLE';error.provider=provider;throw error}
function runtime(){const api=globalThis.LuviaBooking;if(!api)unavailable('LuviaBooking');return api}
function ui(){const api=globalThis.LuviaBookingUI;if(typeof api?.openForPlace!=='function')unavailable('LuviaBookingUI.openForPlace');return api}
function draftCore(){const api=globalThis.LuviaBookingDraftCoreV1;if(!api)unavailable('LuviaBookingDraftCoreV1');return api}
function availability(){const api=globalThis.LuviaBookingAvailability;if(typeof api?.check!=='function')unavailable('LuviaBookingAvailability');return api}
function admission(){const api=globalThis.LuviaBookingAdmissionCore;if(typeof api?.resolve!=='function')unavailable('LuviaBookingAdmissionCore');return api}
function accommodation(){const api=globalThis.LuviaBookingAccommodationCore;if(typeof api?.resolve!=='function')unavailable('LuviaBookingAccommodationCore');return api}
function stayDecision(){const api=globalThis.LuviaBookingStayDecisionCore;if(typeof api?.buildDecision!=='function')unavailable('LuviaBookingStayDecisionCore');return api}
function staySearch(){const api=globalThis.LuviaBookingStaySearchWebAdapter;if(typeof api?.search!=='function')unavailable('LuviaBookingStaySearchWebAdapter');return api}
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
  const bookingEmailVerified=input.bookingEmailVerified===true||input.booking_email_verified===true;
  const bookingEmailPublic=input.bookingEmailPublic===true||input.booking_email_public===true;
  const ticketUrl=clean(input.ticketUrl||input.ticket_url||input.officialTicketUrl||input.official_ticket_url);
  return immutable({
    id:providerPlaceId,
    providerPlaceId,
    type:clean(input.type||input.primaryType||input.primary_type)||'other',
    primaryType:clean(input.primaryType||input.primary_type||input.type)||'other',
    canonicalType:clean(input.canonicalType||input.canonical_type),
    types:Array.isArray(input.types)?input.types.map(clean).filter(Boolean):[],
    name:clean(input.name)||'Ausgewählter Ort',
    address:clean(input.address||input.formattedAddress),
    website:clean(input.website||input.websiteUri),
    reservationUrl:clean(input.reservationUrl||input.reservation_url||input.bookingUrl||input.booking_url||ticketUrl),
    ticketUrl,
    admissionRequirement:clean(input.admissionRequirement||input.admission_requirement||input.ticketRequirement||input.ticket_requirement),
    admissionFree:input.admissionFree===true||input.admission_free===true,
    reservable:input.reservable===true||input.isReservable===true||input.is_reservable===true,
    reservationRequired:input.reservationRequired===true||input.reservation_required===true,
    reservationRecommended:input.reservationRecommended===true||input.reservation_recommended===true,
    ticketRequired:input.ticketRequired===true||input.ticket_required===true,
    timedEntryRequired:input.timedEntryRequired===true||input.timed_entry_required===true,
    bookingProvider:clean(input.bookingProvider||input.booking_provider||input.ticketProvider||input.ticket_provider),
    providerBookingUrl:clean(input.providerBookingUrl||input.provider_booking_url||input.providerTicketUrl||input.provider_ticket_url),
    bookingEmail:bookingEmailVerified&&bookingEmailPublic?clean(input.bookingEmail||input.booking_email):'',
    bookingEmailVerified:Boolean(bookingEmailVerified&&bookingEmailPublic),
    bookingEmailPublic:Boolean(bookingEmailVerified&&bookingEmailPublic),
    bookingEmailSourceUrl:bookingEmailVerified&&bookingEmailPublic?clean(input.bookingEmailSourceUrl||input.booking_email_source_url):''
  });
}

async function init(){return immutable(await runtime().init?.())}
async function listForTrip(tripId){return immutable(await runtime().listForTrip(clean(tripId)))}
async function get(bookingId){return immutable(await runtime().get(clean(bookingId)))}
async function conversation(bookingId){return immutable(await runtime().conversation(clean(bookingId)))}
async function messages(bookingId){return immutable(await runtime().messages(clean(bookingId)))}
async function bookingTimeline(bookingId){return immutable(await runtime().bookingTimeline(clean(bookingId)))}
async function providerCapabilities(){return immutable(await runtime().providerCapabilities())}
async function lifecycleCapabilities(input={}){
  const booking=input.booking||await runtime().get(clean(input.bookingId||input.id));
  if(!booking)throw Object.assign(new Error('Booking Contract v1: Buchung wurde nicht gefunden.'),{code:'BOOKING_NOT_FOUND'});
  const capabilities=await runtime().providerCapabilities();
  const providerId=clean(booking.provider||input.provider).toLowerCase();
  const capability=(capabilities||[]).find(item=>clean(item?.id||item?.providerId||item?.provider_id).toLowerCase()===providerId)||globalThis.LuviaBookingProviderCapabilities?.get?.(providerId)||{};
  let thread=null;
  try{thread=await runtime().emailThread?.(booking.id)}catch{}
  const contact=booking.contact||{};
  const verifiedContact=Boolean(thread||booking?.metadata?.verifiedContact?.email===true);
  const canResolveVerifiedContact=Boolean(!thread&&(booking?.request?.website||contact.website));
  const policy=globalThis.LuviaBookingLifecyclePolicyCore;
  if(!policy?.assess)unavailable('LuviaBookingLifecyclePolicyCore');
  return immutable(policy.assess({booking,capability,thread,verifiedContact,canResolveVerifiedContact,route:input.route}));
}
async function conversationPreferences(bookingIds=[]){return immutable(await runtime().conversationPreferences((bookingIds||[]).map(clean).filter(Boolean)))}
async function checkAvailability(input={}){return immutable(await availability().check(input))}
async function resolveChannel(input={}){
  const bookingId=clean(input.bookingId||input.id);
  return immutable(bookingId?await runtime().resolveRoute(bookingId):await runtime().resolvePlaceRoute(input.place||input));
}
function resolveAdmission(input={}){return immutable(admission().resolve(placeProjection(input.place||input)))}
function admissionProviderCatalog(){return immutable(admission().providerCatalog())}
function resolveAccommodation(input={}){return immutable(accommodation().resolve(input))}
function accommodationProviderCatalog(){return immutable(accommodation().providerCatalog())}
function compareStayOffers(input={}){return immutable(stayDecision().buildDecision(input.offers||[],input.query||input.profile||{},input.providerRun||input.coverage||{}))}
async function searchStayOffers(input={}){return immutable(await staySearch().search(input))}
async function reconcileUnknownOutcome(input={}){return immutable(await recovery().reconcile(input))}

async function createForPlace(input={}){return immutable(await runtime().createForPlace(input))}
async function trackExternalHandoff(input={}){return immutable(await runtime().trackExternalHandoffForPlace(input))}
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
  if(input.recordHandoff!==false&&bookingId&&typeof runtime().recordHandoff==='function')await runtime().recordHandoff(bookingId,{provider:route?.provider||route?.channel||'official',url,providerReference:route?.providerReference||null,metadata:{source:'booking.v1.openRoute'}});
  return immutable({opened:opened!==false,url,bookingId:bookingId||null,provider:clean(route?.provider||route?.channel)||null,owner:'booking',contractId:CONTRACT_ID});
}
async function openExternalHandoff(input={}){
  const place=placeProjection(input.place||input),route=input.route||await runtime().resolvePlaceRoute(place);
  const tracking=await runtime().trackExternalHandoffForPlace({place,route,startAt:input.startAt,endAt:input.endAt,partySize:input.partySize});
  const result=await openRoute({route,place,bookingId:tracking.bookingId,recordHandoff:false});
  return immutable({...result,tracking,providerPlaceId:place.providerPlaceId});
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

const reads=Object.freeze({listForTrip,get,conversation,messages,bookingTimeline,providerCapabilities,lifecycleCapabilities,conversationPreferences,checkAvailability,resolveChannel,resolveAdmission,admissionProviderCatalog,resolveAccommodation,accommodationProviderCatalog,compareStayOffers,searchStayOffers,reconcileUnknownOutcome});
const composition=Object.freeze({createDraft,updateDraft,validateDraft,selectRoute,composeMessageDraft});
const commands=Object.freeze({createForPlace,trackExternalHandoff,reply,performIntelligenceAction,modifyBooking,cancelBooking,setConversationPreference,updateContact,reconcileTripReturns,openPlaceBooking,openRoute,openExternalHandoff,retryRecovery,resolveThread});
const api=Object.freeze({
  contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,reads,composition,commands,
  events:Object.freeze(['booking.changed','booking.created','booking.status.changed','booking.message.changed','booking.provider.selected']),
  init,listForTrip,get,conversation,messages,bookingTimeline,providerCapabilities,conversationPreferences,createForPlace,reply,performIntelligenceAction,modifyBooking,cancelBooking,setConversationPreference,updateContact,reconcileTripReturns,openPlaceBooking,placeProjection,
  diagnostics:()=>Object.freeze({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,ready:Boolean(globalThis.LuviaBooking&&globalThis.LuviaBookingUI?.openForPlace&&globalThis.LuviaBookingDraftCoreV1&&globalThis.LuviaBookingAdmissionCore&&globalThis.LuviaBookingAccommodationCore&&globalThis.LuviaBookingStayDecisionCore),providers:Object.freeze({runtime:Boolean(globalThis.LuviaBooking),ownerFlow:Boolean(globalThis.LuviaBookingUI?.openForPlace),draftCore:Boolean(globalThis.LuviaBookingDraftCoreV1),availability:Boolean(globalThis.LuviaBookingAvailability),admission:Boolean(globalThis.LuviaBookingAdmissionCore),accommodation:Boolean(globalThis.LuviaBookingAccommodationCore),stayDecision:Boolean(globalThis.LuviaBookingStayDecisionCore),staySearch:Boolean(globalThis.LuviaBookingStaySearchWebAdapter),recovery:Boolean(globalThis.LuviaBookingReservationRecovery)}),ownership:Object.freeze({bookingTruth:true,admissionTruth:true,accommodationTruth:true,hotelDecisionTruth:true,hotelLivePriceGatewayTruth:true,intelligenceTruth:false,foreignDomainMutation:false})})
});

globalThis.LuviaBookingContractV1=api;
globalThis.LuviaBookingPublicContract=api;
globalThis.LuviaGlobalContracts?.register?.({id:CONTRACT_ID,version:VERSION,required:false,probe:()=>({available:api.diagnostics().ready,detail:'Booking v1 owner adapter'})});
})();
