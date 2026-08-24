(()=>{
'use strict';

const VERSION='1.0.0';
const listeners=new Set();
const root=globalThis;
const actionCore=()=>root.LuviaIntelligenceActionContractCoreV1||missing('LuviaIntelligenceActionContractCoreV1');
const tripContract=()=>root.LuviaTripContractV1||root.LuviaTripContract||missing('trip.v1');
const placesContract=()=>root.LuviaPlacesContractV1||missing('places.v1');
const bookingContract=()=>root.LuviaBookingContractV1||missing('booking.v1');
const journeyContract=()=>root.LuviaJourneyContractV1||missing('journey.v1');
function missing(provider){const error=new Error(`Luvia Action Runtime: ${provider} ist nicht verfügbar.`);error.code='AI_ACTION_OWNER_CONTRACT_UNAVAILABLE';error.provider=provider;throw error}
const clean=value=>String(value??'').trim();
const tripId=trip=>clean(trip?.tripId||trip?.id)||null;
const destination=trip=>clean(trip?.destination?.name||trip?.destination?.formattedAddress||trip?.destinationName||trip?.city);
const providerId=place=>clean(place?.providerPlaceId||place?.id).replace(/^places\//,'');
function emit(reason,detail={}){const event=actionCore().immutable({reason,...detail});for(const listener of listeners){try{listener(event)}catch{}}root.dispatchEvent?.(new CustomEvent('luvia:ai-action-changed',{detail:event}));return event}
function receiptReference(payload={},result={}){return{tripId:payload.tripId||null,providerPlaceId:payload.providerPlaceId||null,tripPlaceId:result?.tripPlaceId||null,channel:result?.channel||null,provider:result?.provider||null,opened:typeof result?.opened==='boolean'?result.opened:null}}

function placeActions(place,trip){
  const id=providerId(place),payload={tripId:tripId(trip),providerPlaceId:id,placeId:place.id||id,placeType:'restaurant',name:place.name,address:place.address,website:place.website,reservationUrl:place.reservationUrl};
  return[
    {actionId:'places.place.favorite',label:place.isFavorite?'Als Favorit gespeichert':'Als Favorit merken',payload,disabled:place.isFavorite===true,disabledReason:place.isFavorite===true?'Dieser Ort ist bereits als Favorit gespeichert.':''},
    {actionId:'booking.restaurant.open',label:'Reservieren',payload:{...payload,type:'restaurant'}}
  ];
}
async function resolveCard(place,trip){
  const contract=placesContract();const id=providerId(place);let card={place,image:null};
  if(id&&typeof contract.reads?.getCard==='function'){
    try{card=await contract.reads.getCard(id,{maxWidthPx:960,maxHeightPx:720})||card}catch{}
  }
  const item={...place,...(card.place||{}),providerPlaceId:id||providerId(card.place),image:card.image||place.image||null,reasons:place.aiReasons||place.reasons||[],unknowns:place.aiUnknowns||place.unknowns||[]};
  item.actions=placeActions(item,trip);
  return item;
}
async function restaurantResult(request,options={}){
  const trip=tripContract().getActiveTrip?.()||{};
  const input=request.input||{};
  const result=await placesContract().reads.recommend({tripId:tripId(trip),text:input.query,query:input.query,category:'food',destination:destination(trip),limit:Number(input.limit||4),candidateLimit:16,profileContext:options.profileContext||{}});
  const cards=await Promise.all((result?.places||[]).slice(0,4).map(place=>resolveCard(place,trip)));
  const title=cards.length?`${cards.length} Restaurants, die zu eurer Reise passen`:'Noch kein belastbarer Restauranttreffer';
  const message=cards.length?'Luvia hat echte Places-Ergebnisse im aktiven Reisekontext geprüft. Du kannst direkt speichern oder den Booking-Owner-Flow öffnen.':'Passe den Wunsch an, zum Beispiel Küche, Stimmung, Entfernung oder Zeitpunkt.';
  return actionCore().normalizeResult({kind:cards.length?'place_collection':'message',owner:'places',contractId:'places.v1',title,message,items:cards,evidence:{providerFactsAuthoritative:true,query:input.query,destination:destination(trip),tripId:tripId(trip),count:cards.length,route:result?.route||result?.plan?.route||null},meta:{actionId:request.actionId}});
}
async function dayResult(request){
  const trip=tripContract().getActiveTrip?.()||{};
  const projection=await journeyContract().reads.snapshot({trip});
  const today=new Date().toISOString().slice(0,10);
  const days=[...(projection?.days||[])].sort((left,right)=>left.date===today?-1:right.date===today?1:String(left.date).localeCompare(String(right.date))).slice(0,4);
  const entries=days.reduce((count,day)=>count+(day.entries?.length||0),0);
  return actionCore().normalizeResult({kind:'day_plan',owner:'journey',contractId:'journey.v1',title:days.length?'Euer aktueller Reiseplan':'Euer Reisetag ist noch offen',message:days.length?`${entries} Reisemomente aus dem Journey Day Graph. Konflikte und Reihenfolge bleiben Journey-owned.`:'Luvia kann gemeinsam mit euch erste Reisemomente strukturieren.',items:days,actions:[{actionId:'journey.day.open',label:days.length?'Tag bearbeiten':'Tag planen',payload:{tripId:tripId(trip),date:days[0]?.date||today,mode:'schedule'}}],evidence:{journeyOwner:true,tripId:tripId(trip),summary:projection?.summary||{}},meta:{actionId:request.actionId,query:request.input?.query||''}});
}
async function runMessage(message,options={}){
  const route=actionCore().routeIntent(message);
  if(!route)return actionCore().immutable({handled:false,results:[],route:null});
  const request=actionCore().createActionRequest(route.actionId,route.input,{surface:options.surface||'global-chat'});
  if(!actionCore().canAutoRun(request.actionId))return actionCore().immutable({handled:false,results:[],route:request});
  emit('read-started',{actionId:request.actionId});
  try{
    const result=request.actionId==='places.restaurant.recommend'?await restaurantResult(request,options):request.actionId==='journey.day.read'?await dayResult(request):null;
    if(!result)return actionCore().immutable({handled:false,results:[],route:request});
    emit('read-completed',{actionId:request.actionId,resultKind:result.kind});
    return actionCore().immutable({handled:true,results:[result],route:request});
  }catch(error){
    const result=actionCore().normalizeResult({kind:'error',owner:'intelligence',title:'Diese Aktion ist gerade nicht verfügbar',message:error?.message||'Der zuständige Luvia Core konnte die Anfrage nicht ausführen.',evidence:{actionId:request.actionId,code:error?.code||'AI_ACTION_FAILED'},meta:{retryable:true}});
    emit('read-failed',{actionId:request.actionId,code:error?.code||'AI_ACTION_FAILED'});
    return actionCore().immutable({handled:true,results:[result],route:request,error:true});
  }
}

async function execute(actionId,payload={},options={}){
  const definition=actionCore().getAction(actionId);
  if(!definition)missing(actionId);
  actionCore().assertExecution(definition,{userGesture:options.userGesture===true,confirmed:options.confirmed===true,ownerCommand:true});
  emit('command-started',{actionId,owner:definition.owner});
  try{
    let result=null,message='Aktion wurde ausgeführt.',status='completed';
    if(actionId==='places.place.favorite'){
      result=await placesContract().commands.favorite({...payload,placeType:payload.placeType||'restaurant'});
      message='Der Ort wurde über Places v1 als Favorit gespeichert.';
    }else if(actionId==='places.place.plan'){
      result=await placesContract().commands.plan(payload);
      message='Die Planung wurde an Places v1 übergeben.';
    }else if(actionId==='booking.restaurant.open'){
      result=await bookingContract().commands.openPlaceBooking(payload,{reserveExternalWindow:true});
      message=result?.opened?'Der Booking-Owner-Flow ist geöffnet.':'Der Booking-Owner-Flow konnte nicht geöffnet werden.';
      status=result?.opened?'opened':'failed';
    }else if(actionId==='journey.day.open'){
      result=await journeyContract().commands.openPlanningEditor(payload);
      message='Der Journey-Planungseditor ist geöffnet.';status='opened';
    }else{
      const error=new Error(`Für ${actionId} ist noch kein Web Owner Binding registriert.`);error.code='AI_ACTION_BINDING_UNAVAILABLE';throw error;
    }
    const receipt=actionCore().createReceipt({actionId,status,message,ownerCommand:true,occurredAt:new Date().toISOString(),reference:receiptReference(payload,result)});
    emit('command-completed',{actionId,owner:definition.owner,status});
    return receipt;
  }catch(error){
    emit('command-failed',{actionId,owner:definition.owner,code:error?.code||'AI_ACTION_FAILED'});
    return actionCore().createReceipt({actionId,status:'failed',message:error?.message||'Die Owner-Aktion ist fehlgeschlagen.',ownerCommand:true,occurredAt:new Date().toISOString(),reference:{tripId:payload.tripId||null,providerPlaceId:payload.providerPlaceId||null,code:error?.code||'AI_ACTION_FAILED'}});
  }
}
function subscribe(listener){if(typeof listener!=='function')throw new TypeError('Action Runtime subscriber must be a function.');listeners.add(listener);return()=>listeners.delete(listener)}
function diagnostics(){return actionCore().immutable({version:VERSION,contractId:actionCore().contractId,actions:actionCore().listActions().length,owners:{trip:Boolean(root.LuviaTripContractV1),places:Boolean(root.LuviaPlacesContractV1),booking:Boolean(root.LuviaBookingContractV1),journey:Boolean(root.LuviaJourneyContractV1)},policy:actionCore().policySnapshot()})}

root.LuviaAIActionRuntime=Object.freeze({version:VERSION,runMessage,execute,subscribe,diagnostics});
})();
