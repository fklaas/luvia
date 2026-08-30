(()=>{
'use strict';

const VERSION='1.2.0';
const CONFIRMATION_TTL_MS=5*60*1000;
const listeners=new Set();
const pending=new Map();
const receipts=new Map();
const root=globalThis;
let sequence=0;
const actionCore=()=>root.LuviaIntelligenceActionContractCoreV1||missing('LuviaIntelligenceActionContractCoreV1');
const ledgerCore=()=>root.LuviaIntelligenceActionLedgerCoreV1||missing('LuviaIntelligenceActionLedgerCoreV1');
const tripContract=()=>root.LuviaTripContractV1||root.LuviaTripContract||missing('trip.v1');
const placesContract=()=>root.LuviaPlacesContractV1||missing('places.v1');
const bookingContract=()=>root.LuviaBookingContractV1||missing('booking.v1');
const journeyContract=()=>root.LuviaJourneyContractV1||missing('journey.v1');
const memoryContract=()=>root.LuviaMemoryContractV1||root.LuviaMemoryContract||missing('memory.v1');
const identityContract=()=>root.LuviaIdentityContractV1||root.LuviaIdentityContract||missing('identity.v1');
const ledger=ledgerCore().createActionLedger({idFactory:value=>`ledger-${value}-${newId('entry')}`,maxEntries:240});

function missing(provider){const error=new Error(`Luvia Action Runtime: ${provider} ist nicht verfügbar.`);error.code='AI_ACTION_OWNER_CONTRACT_UNAVAILABLE';error.provider=provider;throw error}
function runtimeError(code,message,extra={}){const error=new Error(message);error.code=code;Object.assign(error,extra);return error}
const clean=value=>String(value??'').trim();
const tripId=trip=>clean(trip?.tripId||trip?.id)||null;
const destination=trip=>clean(trip?.destination?.name||trip?.destination?.formattedAddress||trip?.destinationName||trip?.city);
const providerId=place=>clean(place?.providerPlaceId||place?.id).replace(/^places\//,'');
function newId(prefix){return`${prefix}-${root.crypto?.randomUUID?.()||`${Date.now()}-${++sequence}`}`}
function emit(reason,detail={}){const event=actionCore().immutable({reason,...detail});for(const listener of listeners){try{listener(event)}catch{}}root.dispatchEvent?.(new CustomEvent('luvia:ai-action-changed',{detail:event}));return event}
function ownerContract(owner){return owner==='trip'?tripContract():owner==='places'?placesContract():owner==='booking'?bookingContract():owner==='journey'?journeyContract():owner==='memory'?memoryContract():owner==='identity'?identityContract():missing(owner)}
function operation(contract,path){return clean(path).split('.').reduce((value,key)=>value?.[key],contract)}
function operationAvailable(definition){try{return typeof operation(ownerContract(definition.owner),definition.ownerMethod)==='function'}catch{return false}}
function receiptReference(payload={},result={}){return{tripId:payload.tripId||null,providerPlaceId:payload.providerPlaceId||null,tripPlaceId:result?.tripPlaceId||null,bookingId:payload.bookingId||result?.bookingId||result?.id||null,storyId:payload.storyId||result?.storyId||result?.id||null,channel:result?.channel||null,provider:result?.provider||null,opened:typeof result?.opened==='boolean'?result.opened:null}}
function previewPayload(payload={}){const allowed=['tripId','bookingId','providerPlaceId','placeId','placeType','name','title','date','time','partySize','reason','status','category'];return Object.fromEntries(allowed.filter(key=>payload[key]!=null&&payload[key]!=='').map(key=>[key,payload[key]]))}
function connectionSnapshot(){
  const owners=['trip','places','booking','journey','memory','identity'];
  return actionCore().immutable(owners.map(owner=>{
    const definitions=actionCore().listActions().filter(action=>action.owner===owner);let contract=null,diagnostics={};
    try{contract=ownerContract(owner);diagnostics=contract?.diagnostics?.()||{}}catch(error){return{owner,contractId:definitions[0]?.ownerContract||null,registered:false,ready:false,operations:0,totalOperations:definitions.length,reason:error?.code||'unavailable'}}
    return{owner,contractId:definitions[0]?.ownerContract||contract?.contractId||null,registered:Boolean(contract),ready:diagnostics.ready!==false,operations:definitions.filter(operationAvailable).length,totalOperations:definitions.length,providers:diagnostics.providers||null,reason:null};
  }));
}
function capabilitySnapshot(){
  const availability={};
  for(const definition of actionCore().listActions()){const available=operationAvailable(definition);availability[definition.id]={available,reason:available?null:'owner-operation-unavailable'}}
  return actionCore().createCapabilitySnapshot(availability);
}

function placeActions(place,trip){
  const id=providerId(place),primary=clean(place.primaryType||place.primary_type||'place').toLowerCase(),bookable=/restaurant|cafe|bakery|bar|food|meal/.test(primary),payload={tripId:tripId(trip),providerPlaceId:id,placeId:place.id||id,placeType:primary||'place',name:place.name,address:place.address,website:place.website,reservationUrl:place.reservationUrl};
  return[
    {actionId:place.isFavorite?'places.place.unfavorite':'places.place.favorite',label:place.isFavorite?'Favorit entfernen':'Als Favorit merken',payload},
    ...(bookable?[{actionId:'booking.restaurant.open',label:'Jetzt reservieren',payload:{...payload,type:'restaurant'}}]:[]),
    {actionId:'places.place.plan',label:'Zur Timeline hinzufügen',payload}
  ];
}
async function resolveCard(place,trip){
  const contract=placesContract();const id=providerId(place);let card={place,image:null};
  if(id&&typeof contract.reads?.getCard==='function'){try{card=await contract.reads.getCard(id,{maxWidthPx:960,maxHeightPx:720})||card}catch{}}
  const item={...place,...(card.place||{}),providerPlaceId:id||providerId(card.place),image:card.image||place.image||null,reasons:place.aiReasons||place.reasons||[],unknowns:place.aiUnknowns||place.unknowns||[]};
  item.actions=placeActions(item,trip);return item;
}
async function placeDiscoveryResult(request,options={}){
  const trip=tripContract().getActiveTrip?.()||{};const input=request.input||{};
  const categories=Array.isArray(input.categories)&&input.categories.length?input.categories:[input.category||'places'];
  const responses=await Promise.allSettled(categories.map(category=>placesContract().reads.recommend({tripId:tripId(trip),text:input.query,query:input.query,category,destination:destination(trip),limit:Number(input.limit||6),candidateLimit:32,profileContext:options.profileContext||{}})));
  const seen=new Set(),raw=[];for(const response of responses){if(response.status!=='fulfilled')continue;const ownerCategory=clean(response.value?.route?.category||categories[0]||'place').toLowerCase();for(const place of response.value?.places||[]){const id=providerId(place);if(id&&!seen.has(id)){seen.add(id);raw.push({...place,primaryType:place.primaryType||place.primary_type||ownerCategory})}}}
  const cards=await Promise.all(raw.slice(0,Math.min(8,Number(input.limit||6))).map(place=>resolveCard(place,trip))),noun=categories.length>1?'Orte':'Möglichkeiten';
  return actionCore().normalizeResult({kind:cards.length?'place_collection':'message',owner:'places',contractId:'places.v1',title:cards.length?`${cards.length} passende ${noun}`:'Noch kein belastbarer Places-Treffer',message:cards.length?'Places belegt die Orte; Luvia ordnet sie im freigegebenen Reise- und Profilkontext. Speichern, Timeline und Booking bleiben Owner-Aktionen.':'Passe Wunsch, Entfernung oder Zeitpunkt an.',items:cards,evidence:{providerFactsAuthoritative:true,aiReasonsNonAuthoritative:true,query:input.query,categories,destination:destination(trip),tripId:tripId(trip),count:cards.length},meta:{actionId:request.actionId}});
}
const restaurantResult=(request,options={})=>placeDiscoveryResult({...request,input:{...(request.input||{}),category:'food',categories:['food']}},options);
async function dayResult(request){
  const trip=tripContract().getActiveTrip?.()||{};const projection=await journeyContract().reads.snapshot({trip});const today=new Date().toISOString().slice(0,10);
  const days=[...(projection?.days||[])].sort((left,right)=>left.date===today?-1:right.date===today?1:String(left.date).localeCompare(String(right.date))).slice(0,4);
  const entries=days.reduce((count,day)=>count+(day.entries?.length||0),0);
  return actionCore().normalizeResult({kind:'day_plan',owner:'journey',contractId:'journey.v1',title:days.length?'Euer aktueller Reiseplan':'Euer Reisetag ist noch offen',message:days.length?`${entries} Reisemomente aus dem Journey Day Graph. Konflikte und Reihenfolge bleiben Journey-owned.`:'Luvia kann gemeinsam mit euch erste Reisemomente strukturieren.',items:days,actions:[{actionId:'journey.day.open',label:days.length?'Tag bearbeiten':'Tag planen',payload:{tripId:tripId(trip),date:days[0]?.date||today,mode:'schedule'}}],evidence:{journeyOwner:true,tripId:tripId(trip),summary:projection?.summary||{}},meta:{actionId:request.actionId,query:request.input?.query||''}});
}
async function tripResult(request){
  const contract=tripContract(),active=contract.getActiveTrip?.()||contract.reads?.getActiveTrip?.()||null;const trips=contract.listTrips?.()||contract.reads?.listTrips?.()||[];
  const items=trips.map(trip=>({...trip,active:String(trip.id)===String(active?.id),actions:String(trip.id)===String(active?.id)?[]:[{actionId:'trip.active.select',label:'Diese Reise öffnen',payload:{tripId:trip.id,name:trip.title}}]}));
  return actionCore().normalizeResult({kind:'trip_collection',owner:'trip',contractId:'trip.v1',title:items.length?'Deine Reisen':'Noch keine Reise verfügbar',message:items.length?'Wähle eine Reise bewusst aus. Dadurch wechseln App-Kontext und Reiseakzent über den Trip Owner.':'Erstelle zuerst eine Reise in Luvia.',items,evidence:{activeTripId:active?.id||null,count:items.length},meta:{actionId:request.actionId}});
}
async function bookingResult(request){
  const trip=tripContract().getActiveTrip?.()||{};const rows=await bookingContract().reads.listForTrip(tripId(trip));
  const items=(Array.isArray(rows)?rows:rows?.bookings||[]).map(booking=>{
    const id=booking.id||booking.bookingId||booking.booking_id,status=clean(booking.status).toLowerCase();const actions=[];
    if(id&&!['cancelled','canceled','completed','failed'].includes(status)){
      actions.push({actionId:'booking.reservation.modify',label:'Änderung vorbereiten',payload:{bookingId:id,tripId:tripId(trip),name:booking.venueName||booking.restaurantName||booking.title}});
      actions.push({actionId:'booking.reservation.cancel',label:'Stornierung prüfen',payload:{bookingId:id,tripId:tripId(trip),name:booking.venueName||booking.restaurantName||booking.title}});
    }
    return{...booking,actions};
  });
  return actionCore().normalizeResult({kind:'booking_collection',owner:'booking',contractId:'booking.v1',title:items.length?'Buchungen dieser Reise':'Noch keine Buchung vorhanden',message:items.length?'Status und nächste Schritte stammen aus Booking v1. Änderungen und Stornierungen benötigen eine eigene Bestätigung.':'Neue Reservierungen startest du über einen konkreten Place.',items,evidence:{tripId:tripId(trip),count:items.length,requestedIntent:request.input?.intent||'list'},meta:{actionId:request.actionId}});
}
async function memoryResult(request){
  const rows=await memoryContract().reads.listStories();const items=(Array.isArray(rows)?rows:[]).map(story=>({...story,actions:[]}));
  return actionCore().normalizeResult({kind:'memory_collection',owner:'memory',contractId:'memory.v1',title:items.length?'Eure Reisegeschichten':'Noch keine kuratierte Geschichte',message:items.length?'Diese Stories sind Memory Truth; Bilder bleiben Media-owned.':'Luvia kann aus ausgewählten Erinnerungen einen bestätigbaren Story-Entwurf vorbereiten.',items,evidence:{count:items.length,memoryTruth:true,mediaTruth:false},meta:{actionId:request.actionId}});
}
async function preferenceResult(request){
  const contract=identityContract();const direct=contract.getPreferences?.('self');const preferences=await Promise.resolve(direct??contract.reads?.getPreferences?.('self')??{});
  return actionCore().normalizeResult({kind:'preference_summary',owner:'identity',contractId:'identity.v1',title:'Deine bestätigten Vorlieben',message:'Luvia zeigt nur die Self-only-Projektion aus Identity v1. Beobachtete Signale werden nicht als bestätigte Präferenz ausgegeben.',summary:preferences,actions:[],evidence:{scope:'self',explicitPreferences:true,inferredSignals:false},meta:{actionId:request.actionId}});
}
const readHandlers=Object.freeze({'places.restaurant.recommend':restaurantResult,'places.discovery.recommend':placeDiscoveryResult,'journey.day.read':dayResult,'trip.active.list':tripResult,'booking.trip.read':bookingResult,'memory.library.read':memoryResult,'identity.preferences.read':preferenceResult});

async function runMessage(message,options={}){
  const routes=(actionCore().routeIntents?.(message)||[actionCore().routeIntent(message)].filter(Boolean));if(!routes.length)return actionCore().immutable({handled:false,results:[],routes:[]});
  const requests=routes.map(route=>actionCore().createActionRequest(route.actionId,route.input,{surface:options.surface||'global-chat'})).filter(request=>actionCore().canAutoRun(request.actionId));if(!requests.length)return actionCore().immutable({handled:false,results:[],routes});
  const results=[];let error=false;
  for(const request of requests){emit('read-started',{actionId:request.actionId});try{const handler=readHandlers[request.actionId],result=handler?await handler(request,options):null;if(result){results.push(result);emit('read-completed',{actionId:request.actionId,resultKind:result.kind})}}catch(cause){error=true;results.push(actionCore().normalizeResult({kind:'error',owner:'intelligence',title:'Eine Teilaufgabe ist gerade nicht verfügbar',message:cause?.message||'Der zuständige Luvia Core konnte diesen Teil der Anfrage nicht ausführen.',evidence:{actionId:request.actionId,code:cause?.code||'AI_ACTION_FAILED'},meta:{retryable:true}}));emit('read-failed',{actionId:request.actionId,code:cause?.code||'AI_ACTION_FAILED'})}}
  return actionCore().immutable({handled:Boolean(results.length),results,routes:requests,error,multiIntent:requests.length>1});
}

function prepare(actionId,payload={},options={}){
  const definition=actionCore().getAction(actionId);if(!definition)missing(actionId);
  if(definition.effect!=='READ'&&options.userGesture!==true)throw runtimeError('INTELLIGENCE_USER_GESTURE_REQUIRED','Die Aktion muss durch eine direkte Nutzerauswahl vorbereitet werden.',{actionId});
  if(!operationAvailable(definition))throw runtimeError('AI_ACTION_BINDING_UNAVAILABLE',`Für ${actionId} ist kein erreichbares Owner Binding registriert.`,{actionId,owner:definition.owner});
  const correlationId=clean(options.correlationId)||newId('corr');const idempotencyKey=clean(options.idempotencyKey)||newId(`idem-${actionId.replace(/[^a-z0-9]+/gi,'-')}`);const requestedAt=new Date().toISOString();
  const envelope=actionCore().createExecutionEnvelope(actionId,payload,{surface:options.surface||'global-chat'},{idempotencyKey,correlationId,requestedAt,source:options.surface||'global-chat'});
  const entry=ledger.create({actionId,owner:definition.owner,ownerContract:definition.ownerContract,effect:definition.effect,risk:definition.risk,confirmation:definition.confirmation,reversible:definition.reversible,idempotencyKey,correlationId,payload:envelope.input,reference:previewPayload(envelope.input)});
  const expiresAt=new Date(Date.now()+CONFIRMATION_TTL_MS).toISOString();pending.set(entry.id,{definition,envelope,expiresAt});
  if(definition.confirmation==='EXPLICIT'){
    ledger.requireConfirmation(entry.id);
    const result=actionCore().createConfirmation({actionId,ledgerId:entry.id,correlationId,idempotencyKey,expiresAt,preview:previewPayload(envelope.input)});
    emit('confirmation-required',{actionId,owner:definition.owner,risk:definition.risk,ledgerId:entry.id});return actionCore().immutable({requiresConfirmation:true,ledgerId:entry.id,correlationId,idempotencyKey,expiresAt,result});
  }
  return actionCore().immutable({requiresConfirmation:false,ledgerId:entry.id,correlationId,idempotencyKey,expiresAt:null,result:null});
}

async function invokeOwner(definition,payload,idempotencyKey){
  let result=null,message='Aktion wurde ausgeführt.',status='completed';
  if(definition.id==='places.place.favorite'){result=await placesContract().commands.favorite({...payload,placeType:payload.placeType||'restaurant'});message='Der Ort wurde über Places v1 als Favorit gespeichert.'}
  else if(definition.id==='places.place.unfavorite'){result=await placesContract().commands.unfavorite({...payload,placeType:payload.placeType||'restaurant'});message='Der Favorit wurde über Places v1 entfernt.'}
  else if(definition.id==='places.place.plan'){result=await placesContract().commands.plan(payload);message='Der Ort wurde über Places v1 in die Reiseplanung aufgenommen.'}
  else if(definition.id==='places.place.unplan'){result=await placesContract().commands.unplan(payload);message='Der Ort wurde über Places v1 aus der Reiseplanung entfernt.'}
  else if(definition.id==='booking.restaurant.open'){result=await bookingContract().commands.openPlaceBooking(payload,{reserveExternalWindow:true});message=result?.opened?'Der Booking-Owner-Flow ist geöffnet.':'Der Booking-Owner-Flow konnte nicht geöffnet werden.';status=result?.opened?'opened':'failed'}
  else if(definition.id==='booking.reservation.create'){result=await bookingContract().commands.createForPlace({...payload,idempotencyKey});message='Die bestätigte Reservierungsanfrage wurde an Booking v1 übergeben.'}
  else if(definition.id==='booking.reservation.modify'){result=await bookingContract().commands.modifyBooking(payload.bookingId,{...(payload.patch||payload.input||payload),idempotencyKey});message='Die bestätigte Buchungsänderung wurde an Booking v1 übergeben.'}
  else if(definition.id==='booking.reservation.cancel'){result=await bookingContract().commands.cancelBooking(payload.bookingId,{...(payload.input||payload),idempotencyKey});message='Die bestätigte Stornierung wurde an Booking v1 übergeben.'}
  else if(definition.id==='journey.day.open'){result=await journeyContract().commands.openPlanningEditor(payload);message='Der Journey-Planungseditor ist geöffnet.';status='opened'}
  else if(definition.id==='trip.active.select'){result=tripContract().commands.selectActiveTrip(payload.tripId,{source:'intelligence.actions.v1'});message='Die aktive Reise wurde über Trip v1 gewechselt.'}
  else if(definition.id==='trip.update.details'){result=await tripContract().commands.updateTrip(payload.tripId,payload.patch||{});message='Die bestätigten Reisedetails wurden über Trip v1 aktualisiert.'}
  else if(definition.id==='memory.story.save'){result=await memoryContract().commands.stories.save(payload.story||payload);message='Die bestätigte Reisegeschichte wurde über Memory v1 gespeichert.'}
  else if(definition.id==='identity.preferences.update'){result=await identityContract().commands.updatePreferences(payload.patch||payload.preferences||{});message='Die bestätigten Vorlieben wurden über Identity v1 aktualisiert.'}
  else throw runtimeError('AI_ACTION_BINDING_UNAVAILABLE',`Für ${definition.id} ist noch kein Web Owner Binding registriert.`,{actionId:definition.id});
  return{result,message,status};
}

async function execute(actionId,payload={},options={}){
  const definition=actionCore().getAction(actionId);if(!definition)missing(actionId);
  const prepared=options.ledgerId?null:prepare(actionId,payload,options);
  if(prepared?.requiresConfirmation&&options.confirmed!==true)return prepared.result;
  const ledgerId=clean(options.ledgerId||prepared?.ledgerId);const completed=receipts.get(ledgerId);if(completed)return completed;
  const staged=pending.get(ledgerId);
  if(!staged)throw runtimeError('INTELLIGENCE_ACTION_PREPARATION_REQUIRED','Die vorbereitete Aktion ist nicht mehr verfügbar.',{actionId,ledgerId});
  if(Date.parse(staged.expiresAt)<Date.now()){ledger.cancel(ledgerId);pending.delete(ledgerId);throw runtimeError('INTELLIGENCE_ACTION_CONFIRMATION_EXPIRED','Die Bestätigung ist abgelaufen. Bitte prüfe die Aktion erneut.',{actionId,ledgerId})}
  if(staged.definition.id!==actionId)throw runtimeError('INTELLIGENCE_ACTION_LEDGER_MISMATCH','Action und Ledger-Eintrag stimmen nicht überein.',{actionId,ledgerId});
  if(definition.confirmation==='EXPLICIT'){
    if(options.confirmed!==true)throw runtimeError('INTELLIGENCE_CONFIRMATION_REQUIRED','Diese Aktion benötigt eine explizite Bestätigung.',{actionId,ledgerId});
    const state=ledger.get(ledgerId);if(state?.status==='confirmation_required'||state?.status==='proposed')ledger.confirm(ledgerId);
  }
  actionCore().assertExecution(definition,{userGesture:options.userGesture===true,confirmed:options.confirmed===true,ownerCommand:true});
  const state=ledger.begin(ledgerId);if(['succeeded','cancelled','compensated'].includes(state.status)&&receipts.has(ledgerId))return receipts.get(ledgerId);
  emit('command-started',{actionId,owner:definition.owner,risk:definition.risk,ledgerId});let ownerInvoked=false;
  try{
    ownerInvoked=true;const outcome=await invokeOwner(definition,staged.envelope.input,staged.envelope.idempotencyKey);
    const receipt=actionCore().createReceipt({actionId,status:outcome.status,message:outcome.message,ownerCommand:true,occurredAt:new Date().toISOString(),ledgerId,correlationId:staged.envelope.correlationId,idempotencyKey:staged.envelope.idempotencyKey,reference:receiptReference(staged.envelope.input,outcome.result)});
    if(outcome.status==='failed')ledger.fail(ledgerId,{code:'AI_ACTION_OWNER_DECLINED',retryable:true,receipt});else ledger.succeed(ledgerId,receipt);
    receipts.set(ledgerId,receipt);pending.delete(ledgerId);emit(outcome.status==='failed'?'command-failed':'command-completed',{actionId,owner:definition.owner,status:outcome.status,ledgerId});return receipt;
  }catch(error){
    const outcomeUnknown=ownerInvoked&&definition.risk==='R3';const retryable=!outcomeUnknown&&definition.risk!=='R4';ledger.fail(ledgerId,{code:error?.code||'AI_ACTION_FAILED',retryable,outcomeUnknown});
    const receipt=actionCore().createReceipt({actionId,status:outcomeUnknown?'outcome_unknown':'failed',message:outcomeUnknown?'Der externe Ausgang ist unklar. Luvia führt keinen Blind-Retry aus und wartet auf Booking-Reconciliation.':error?.message||'Die Owner-Aktion ist fehlgeschlagen.',ownerCommand:true,occurredAt:new Date().toISOString(),ledgerId,correlationId:staged.envelope.correlationId,idempotencyKey:staged.envelope.idempotencyKey,retryable,outcomeUnknown,reference:{...receiptReference(staged.envelope.input),code:error?.code||'AI_ACTION_FAILED'}});
    receipts.set(ledgerId,receipt);if(outcomeUnknown)pending.delete(ledgerId);emit('command-failed',{actionId,owner:definition.owner,code:error?.code||'AI_ACTION_FAILED',outcomeUnknown,ledgerId});return receipt;
  }
}

function cancel(ledgerId){
  const state=ledger.get(ledgerId);if(!state)throw runtimeError('INTELLIGENCE_ACTION_LEDGER_NOT_FOUND','Die vorbereitete Aktion wurde nicht gefunden.',{ledgerId});
  const receipt=actionCore().createReceipt({actionId:state.actionId,status:'cancelled',message:'Die vorbereitete Aktion wurde verworfen. Es wurde kein Owner Command ausgeführt.',ownerCommand:false,occurredAt:new Date().toISOString(),ledgerId,correlationId:state.correlationId,idempotencyKey:state.idempotencyKey});
  ledger.cancel(ledgerId);pending.delete(ledgerId);receipts.set(ledgerId,receipt);emit('command-cancelled',{actionId:state.actionId,owner:state.owner,ledgerId});return receipt;
}
async function retry(ledgerId,options={}){
  const state=ledger.get(ledgerId);if(!state)throw runtimeError('INTELLIGENCE_ACTION_LEDGER_NOT_FOUND','Die fehlgeschlagene Aktion wurde nicht gefunden.',{ledgerId});
  if(state.status==='outcome_unknown')throw runtimeError('INTELLIGENCE_ACTION_OUTCOME_RECONCILIATION_REQUIRED','Ein unklarer externer Ausgang darf nicht blind wiederholt werden.',{ledgerId,actionId:state.actionId});
  if(state.status!=='failed')throw runtimeError('INTELLIGENCE_ACTION_RETRY_NOT_AVAILABLE','Nur eindeutig fehlgeschlagene Aktionen können wiederholt werden.',{ledgerId,status:state.status});
  receipts.delete(ledgerId);
  return execute(state.actionId,{}, {...options,ledgerId,userGesture:true,confirmed:true});
}
function getActionState(ledgerId){return ledger.get(ledgerId)}
function subscribe(listener){if(typeof listener!=='function')throw new TypeError('Action Runtime subscriber must be a function.');listeners.add(listener);return()=>listeners.delete(listener)}
function diagnostics(){
  const capabilities=capabilitySnapshot(),connections=connectionSnapshot();
  const owners=Object.fromEntries(connections.map(connection=>[connection.owner,connection.registered]));
  return actionCore().immutable({version:VERSION,contractId:actionCore().contractId,ledgerContractId:ledger.contractId,actions:actionCore().listActions().length,availableActions:capabilities.available,owners,connections,capabilities,ledger:ledger.diagnostics(),policy:actionCore().policySnapshot()});
}

root.LuviaAIActionRuntime=Object.freeze({version:VERSION,runMessage,prepare,execute,cancel,retry,getActionState,capabilitySnapshot,connectionSnapshot,subscribe,diagnostics});
})();
