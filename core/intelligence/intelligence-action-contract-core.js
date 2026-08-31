var LuviaIntelligenceActionContractCoreV1=(()=>{
'use strict';

const CONTRACT_ID='intelligence.actions.v1';
const VERSION='1';
const RUNTIME_VERSION='1.3.0';
const EFFECTS=Object.freeze({READ:'READ',DRAFT:'DRAFT',WRITE:'WRITE',EXTERNAL:'EXTERNAL'});
const CONFIRMATION=Object.freeze({NEVER:'NEVER',USER_GESTURE:'USER_GESTURE',EXPLICIT:'EXPLICIT'});
const RISK=Object.freeze({R0:'R0',R1:'R1',R2:'R2',R3:'R3',R4:'R4'});
const RESULT_KINDS=Object.freeze({
  MESSAGE:'message',PLACE_COLLECTION:'place_collection',DAY_PLAN:'day_plan',TRIP_COLLECTION:'trip_collection',BOOKING_COLLECTION:'booking_collection',
  MEMORY_COLLECTION:'memory_collection',PREFERENCE_SUMMARY:'preference_summary',CONFIRMATION:'confirmation',RECEIPT:'receipt',CLARIFICATION:'clarification',ERROR:'error'
});
const RECEIPT_STATUSES=Object.freeze(['prepared','confirmed','completed','opened','cancelled','failed','outcome_unknown','compensated']);
const BLOCKED_KEYS=/^(email|phone|telephone|password|token|access_token|refresh_token|authorization|apikey|api_key|booking_number|reservation_number|payment|card|iban|address_exact)$/i;
const LIMITS=Object.freeze({maxDepth:7,maxArray:40,maxString:1000,maxItems:12,maxActions:6,maxPermissions:8});

function clone(value){
  if(value==null||typeof value!=='object')return value;
  if(Array.isArray(value))return value.map(clone);
  return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,clone(item)]));
}
function immutable(value){
  if(value==null||typeof value!=='object')return value;
  if(Array.isArray(value))return Object.freeze(value.map(immutable));
  return Object.freeze(Object.fromEntries(Object.entries(value).map(([key,item])=>[key,immutable(item)])));
}
function text(value,fallback=''){return String(value??fallback).trim()}
function finite(value,min,max,fallback=null){const parsed=Number(value);return Number.isFinite(parsed)?Math.max(min,Math.min(max,parsed)):fallback}
function unique(value,max=20){return[...new Set((Array.isArray(value)?value:[]).map(item=>text(item)).filter(Boolean))].slice(0,max)}
function sanitize(value,depth=0,seen=new WeakSet()){
  if(value==null||typeof value==='boolean'||typeof value==='number')return value;
  if(typeof value==='string')return value.slice(0,LIMITS.maxString);
  if(depth>=LIMITS.maxDepth)return'[redacted-depth]';
  if(Array.isArray(value))return value.slice(0,LIMITS.maxArray).map(item=>sanitize(item,depth+1,seen));
  if(typeof value==='object'){
    if(seen.has(value))return'[circular]';
    seen.add(value);
    const result={};
    for(const [key,item] of Object.entries(value)){
      if(BLOCKED_KEYS.test(key))continue;
      const safe=sanitize(item,depth+1,seen);
      if(safe!==undefined)result[key]=safe;
    }
    return result;
  }
  return undefined;
}
function contractError(code,message,extra={}){const error=new Error(message);error.code=code;Object.assign(error,extra);return error}

const ACTIONS=Object.freeze([
  {id:'places.restaurant.recommend',owner:'places',ownerContract:'places.v1',ownerMethod:'reads.recommend',effect:'READ',risk:'R0',confirmation:'NEVER',resultKind:'place_collection',autoRun:true,reversible:false,idempotency:'NONE',permissions:['places.read'],label:'Restaurants finden',description:'Findet und ordnet echte Restaurantkandidaten im aktiven Reisekontext.',consequence:'Liest freigegebene Places-Projektionen; verändert keinen Ort.'},
  {id:'places.discovery.recommend',owner:'places',ownerContract:'places.v1',ownerMethod:'reads.recommend',effect:'READ',risk:'R0',confirmation:'NEVER',resultKind:'place_collection',autoRun:true,reversible:false,idempotency:'NONE',permissions:['places.read'],label:'Passende Orte finden',description:'Findet kategorienübergreifend echte Places-Kandidaten und lässt sie im Reisekontext persönlich ordnen.',consequence:'Liest freigegebene Places-Projektionen; verändert keinen Ort und löst keine Buchung aus.'},
  {id:'places.place.favorite',owner:'places',ownerContract:'places.v1',ownerMethod:'commands.favorite',effect:'WRITE',risk:'R1',confirmation:'EXPLICIT',resultKind:'receipt',reversible:true,idempotency:'REQUIRED',compensation:'places.place.unfavorite',permissions:['places.write'],label:'Als Favorit merken',description:'Delegiert das Merken eines Orts an den Places Owner.',consequence:'Der Ort erscheint nach einer sichtbaren Vorschau und deiner ausdrücklichen Bestätigung als Favorit der aktiven Reise.'},
  {id:'places.place.unfavorite',owner:'places',ownerContract:'places.v1',ownerMethod:'commands.unfavorite',effect:'WRITE',risk:'R1',confirmation:'EXPLICIT',resultKind:'receipt',reversible:true,idempotency:'REQUIRED',compensation:'places.place.favorite',permissions:['places.write'],label:'Favorit entfernen',description:'Entfernt einen Favoriten ausschließlich über Places v1.',consequence:'Der Ort bleibt erhalten und wird nach einer sichtbaren Vorschau und deiner ausdrücklichen Bestätigung nicht mehr als Favorit geführt.'},
  {id:'places.place.plan',owner:'places',ownerContract:'places.v1',ownerMethod:'commands.plan',effect:'WRITE',risk:'R2',confirmation:'EXPLICIT',resultKind:'receipt',reversible:true,idempotency:'REQUIRED',compensation:'places.place.unplan',permissions:['places.write','trip.member'],label:'Zur Timeline hinzufügen',description:'Delegiert die Place-Auswahl an den Places Owner und die Zeitplanung anschließend an Journey.',consequence:'Der bestätigte Ort wird als Reisemoment in die Timeline der aktiven Reise aufgenommen.'},
  {id:'places.place.unplan',owner:'places',ownerContract:'places.v1',ownerMethod:'commands.unplan',effect:'WRITE',risk:'R2',confirmation:'EXPLICIT',resultKind:'receipt',reversible:true,idempotency:'REQUIRED',compensation:'places.place.plan',permissions:['places.write','trip.member'],label:'Aus Planung entfernen',description:'Entfernt die Place-Planung ausschließlich über Places v1.',consequence:'Der Ort bleibt gespeichert, wird aber aus der Reiseplanung entfernt.'},
  {id:'booking.restaurant.open',owner:'booking',ownerContract:'booking.v1',ownerMethod:'commands.openPlaceBooking',effect:'EXTERNAL',risk:'R1',confirmation:'USER_GESTURE',resultKind:'receipt',reversible:false,idempotency:'OPTIONAL',permissions:['booking.read'],label:'Reservieren',description:'Öffnet den bestehenden Booking-Owner-Flow für das Restaurant.',consequence:'Öffnet die Booking-Oberfläche; sendet noch keine Reservierung.'},
  {id:'booking.trip.read',owner:'booking',ownerContract:'booking.v1',ownerMethod:'reads.listForTrip',effect:'READ',risk:'R0',confirmation:'NEVER',resultKind:'booking_collection',autoRun:true,reversible:false,idempotency:'NONE',permissions:['booking.read'],label:'Buchungen zeigen',description:'Liest Buchungen der aktiven Reise ausschließlich über Booking v1.',consequence:'Zeigt Booking-Projektionen ohne Provideraktion.'},
  {id:'booking.reservation.create',owner:'booking',ownerContract:'booking.v1',ownerMethod:'commands.createForPlace',effect:'EXTERNAL',risk:'R3',confirmation:'EXPLICIT',resultKind:'receipt',reversible:false,idempotency:'REQUIRED',compensation:'booking.owner-recovery',permissions:['booking.write','trip.member'],label:'Reservierungsanfrage bestätigen',description:'Erstellt eine Booking-eigene Reservierungsanfrage nach expliziter Bestätigung.',consequence:'Kann eine externe Reservierungsanfrage oder Providerkommunikation auslösen.'},
  {id:'booking.reservation.modify',owner:'booking',ownerContract:'booking.v1',ownerMethod:'commands.modifyBooking',effect:'EXTERNAL',risk:'R3',confirmation:'EXPLICIT',resultKind:'receipt',reversible:false,idempotency:'REQUIRED',compensation:'booking.owner-recovery',permissions:['booking.write','trip.member'],label:'Buchungsänderung bestätigen',description:'Delegiert eine bestätigte Änderung an den Booking Owner.',consequence:'Kann eine bestehende Reservierung bei einem externen Provider ändern.'},
  {id:'booking.reservation.cancel',owner:'booking',ownerContract:'booking.v1',ownerMethod:'commands.cancelBooking',effect:'EXTERNAL',risk:'R3',confirmation:'EXPLICIT',resultKind:'receipt',reversible:false,idempotency:'REQUIRED',compensation:'booking.owner-recovery',permissions:['booking.cancel','trip.member'],label:'Stornierung bestätigen',description:'Delegiert eine bestätigte Stornierung an den Booking Owner.',consequence:'Kann eine bestehende Reservierung extern stornieren; Bedingungen und Folgen müssen sichtbar sein.'},
  {id:'journey.day.read',owner:'journey',ownerContract:'journey.v1',ownerMethod:'reads.snapshot',effect:'READ',risk:'R0',confirmation:'NEVER',resultKind:'day_plan',autoRun:true,reversible:false,idempotency:'NONE',permissions:['journey.read'],label:'Tagesplan zeigen',description:'Liest den abgeleiteten Day Graph ausschließlich über Journey v1.',consequence:'Zeigt den Journey Day Graph und verändert keine Reiseplanung.'},
  {id:'journey.day.open',owner:'journey',ownerContract:'journey.v1',ownerMethod:'commands.openPlanningEditor',effect:'DRAFT',risk:'R1',confirmation:'USER_GESTURE',resultKind:'receipt',reversible:false,idempotency:'OPTIONAL',permissions:['journey.read'],label:'Tag bearbeiten',description:'Öffnet den Journey-eigenen Planungseditor ohne Intelligence-Mutationsownership.',consequence:'Öffnet einen Entwurf; Änderungen werden erst durch Journey Owner Commands wirksam.'},
  {id:'trip.active.list',owner:'trip',ownerContract:'trip.v1',ownerMethod:'reads.listTrips',effect:'READ',risk:'R0',confirmation:'NEVER',resultKind:'trip_collection',autoRun:true,reversible:false,idempotency:'NONE',permissions:['trip.read'],label:'Reisen zeigen',description:'Liest die freigegebenen Reisen und den aktiven Reisekontext über Trip v1.',consequence:'Zeigt Reisekontext; verändert die aktive Reise nicht.'},
  {id:'trip.active.select',owner:'trip',ownerContract:'trip.v1',ownerMethod:'commands.selectActiveTrip',effect:'WRITE',risk:'R1',confirmation:'EXPLICIT',resultKind:'receipt',reversible:true,idempotency:'REQUIRED',compensation:'trip.active.select',permissions:['trip.read'],label:'Reise aktivieren',description:'Wechselt den aktiven Reisekontext ausschließlich über Trip v1.',consequence:'Nach einer sichtbaren Vorschau und deiner ausdrücklichen Bestätigung zeigt die App Daten und Akzentfarbe der gewählten Reise.'},
  {id:'trip.update.details',owner:'trip',ownerContract:'trip.v1',ownerMethod:'commands.updateTrip',effect:'WRITE',risk:'R2',confirmation:'EXPLICIT',resultKind:'receipt',reversible:true,idempotency:'REQUIRED',compensation:'trip.owner-recovery',permissions:['trip.write','trip.owner'],label:'Reiseänderung bestätigen',description:'Aktualisiert bestätigte Reisedetails ausschließlich über den Trip Owner.',consequence:'Ändert freigegebene Reisedetails für alle berechtigten Mitglieder.'},
  {id:'memory.library.read',owner:'memory',ownerContract:'memory.v1',ownerMethod:'reads.listStories',effect:'READ',risk:'R0',confirmation:'NEVER',resultKind:'memory_collection',autoRun:true,reversible:false,idempotency:'NONE',permissions:['memory.read'],label:'Erinnerungen zeigen',description:'Liest kuratierte Story-Projektionen ausschließlich über Memory v1.',consequence:'Zeigt Memory-Projektionen; Media Assets bleiben Media-owned.'},
  {id:'memory.story.save',owner:'memory',ownerContract:'memory.v1',ownerMethod:'commands.stories.save',effect:'WRITE',risk:'R2',confirmation:'EXPLICIT',resultKind:'receipt',reversible:true,idempotency:'REQUIRED',compensation:'memory.owner-recovery',permissions:['memory.write','trip.member'],label:'Geschichte speichern',description:'Speichert eine bestätigte Story über den Memory Owner.',consequence:'Erstellt oder ändert eine kuratierte Reisegeschichte.'},
  {id:'identity.preferences.read',owner:'identity',ownerContract:'identity.v1',ownerMethod:'getPreferences',effect:'READ',risk:'R0',confirmation:'NEVER',resultKind:'preference_summary',autoRun:true,reversible:false,idempotency:'NONE',permissions:['identity.self.read'],label:'Vorlieben zeigen',description:'Liest ausschließlich die bestätigten eigenen Präferenzen über Identity v1.',consequence:'Zeigt eine zusammengefasste Self-only-Projektion.'},
  {id:'identity.preferences.update',owner:'identity',ownerContract:'identity.v1',ownerMethod:'commands.updatePreferences',effect:'WRITE',risk:'R2',confirmation:'EXPLICIT',resultKind:'receipt',reversible:true,idempotency:'REQUIRED',compensation:'identity.owner-recovery',permissions:['identity.self.write'],label:'Vorlieben aktualisieren',description:'Aktualisiert explizit bestätigte eigene Präferenzen über Identity v1.',consequence:'Ändert die bestätigten persönlichen Präferenzen des aktuellen Kontos.'}
].map(definition=>immutable(definition)));

function normalizeAction(definition={}){
  const id=text(definition.id);
  if(!id)throw contractError('INTELLIGENCE_ACTION_ID_REQUIRED','Action id is required.');
  const effect=Object.values(EFFECTS).includes(definition.effect)?definition.effect:EFFECTS.READ;
  const confirmation=Object.values(CONFIRMATION).includes(definition.confirmation)?definition.confirmation:(effect===EFFECTS.READ?CONFIRMATION.NEVER:CONFIRMATION.EXPLICIT);
  const resultKind=Object.values(RESULT_KINDS).includes(definition.resultKind)?definition.resultKind:RESULT_KINDS.MESSAGE;
  const risk=Object.values(RISK).includes(definition.risk)?definition.risk:(effect===EFFECTS.READ?RISK.R0:RISK.R2);
  const permissions=unique(definition.permissions,LIMITS.maxPermissions);
  const idempotency=['NONE','OPTIONAL','REQUIRED'].includes(definition.idempotency)?definition.idempotency:(effect===EFFECTS.READ?'NONE':'REQUIRED');
  return immutable({
    id,owner:text(definition.owner),ownerContract:text(definition.ownerContract),ownerMethod:text(definition.ownerMethod),effect,risk,confirmation,resultKind,
    autoRun:definition.autoRun===true&&effect===EFFECTS.READ&&risk===RISK.R0&&confirmation===CONFIRMATION.NEVER,
    reversible:definition.reversible===true,idempotency,compensation:text(definition.compensation)||null,permissions,
    label:text(definition.label,id),description:text(definition.description),consequence:text(definition.consequence)
  });
}
function createActionRegistry(initial=ACTIONS){
  const entries=new Map();
  function register(definition={}){const action=normalizeAction(definition);entries.set(action.id,action);return action}
  initial.forEach(register);
  function get(id){const action=entries.get(text(id));return action?immutable(clone(action)):null}
  function list(){return immutable([...entries.values()].map(clone))}
  function diagnostics(){return immutable({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,count:entries.size,actions:list()})}
  return Object.freeze({register,get,list,diagnostics});
}
const registry=createActionRegistry();
function getAction(id){return registry.get(id)}
function listActions(){return registry.list()}
function canAutoRun(action){const definition=typeof action==='string'?getAction(action):normalizeAction(action);return Boolean(definition?.autoRun&&definition.effect===EFFECTS.READ&&definition.confirmation===CONFIRMATION.NEVER)}
function assertExecution(action,{userGesture=false,confirmed=false,ownerCommand=false}={}){
  const definition=typeof action==='string'?getAction(action):normalizeAction(action);
  if(!definition)throw contractError('INTELLIGENCE_ACTION_UNKNOWN','Action is not registered.',{actionId:text(action)});
  if(definition.effect===EFFECTS.READ)return definition;
  if(definition.confirmation===CONFIRMATION.USER_GESTURE&&!userGesture)throw contractError('INTELLIGENCE_USER_GESTURE_REQUIRED','Action requires a direct user gesture.',{actionId:definition.id});
  if(definition.confirmation===CONFIRMATION.EXPLICIT&&!confirmed)throw contractError('INTELLIGENCE_CONFIRMATION_REQUIRED','Action requires explicit confirmation.',{actionId:definition.id});
  if(!ownerCommand)throw contractError('INTELLIGENCE_OWNER_COMMAND_REQUIRED','Action must execute through its owner contract.',{actionId:definition.id,owner:definition.owner});
  return definition;
}

function normalizeActionOffer(value={}){
  const action=getAction(value.actionId||value.id);
  if(!action)return null;
  return immutable({
    actionId:action.id,label:text(value.label,action.label),owner:action.owner,effect:action.effect,risk:action.risk,confirmation:action.confirmation,
    reversible:action.reversible,permissions:action.permissions,consequence:action.consequence,payload:sanitize(value.payload||{}),
    disabled:value.disabled===true,disabledReason:text(value.disabledReason)||null
  });
}
function normalizeImage(value={}){
  const url=text(value.url||value.uri||value.imageUrl);
  return url?immutable({url,attribution:text(value.attribution)||null,alt:text(value.alt)||null}):null;
}
function normalizePlace(value={}){
  const providerPlaceId=text(value.providerPlaceId||value.provider_place_id||value.id).replace(/^places\//,'');
  if(!providerPlaceId)return null;
  const actions=(Array.isArray(value.actions)?value.actions:[]).slice(0,LIMITS.maxActions).map(normalizeActionOffer).filter(Boolean);
  return immutable({
    id:text(value.id,providerPlaceId),providerPlaceId,name:text(value.name,'Unbenannter Ort'),description:text(value.description),address:text(value.address||value.formattedAddress),
    primaryType:text(value.primaryType||value.primary_type,'restaurant'),rating:finite(value.rating,0,5),userRatingCount:finite(value.userRatingCount||value.user_rating_count,0,Number.MAX_SAFE_INTEGER,0),
    priceLevel:text(value.priceLevel||value.price_level)||null,openNow:typeof value.openNow==='boolean'?value.openNow:null,image:normalizeImage(value.image||{}),
    reasons:unique(value.reasons||value.aiReasons,4),unknowns:unique(value.unknowns||value.aiUnknowns,3),actions
  });
}
function normalizeDay(value={}){
  const entries=(Array.isArray(value.entries)?value.entries:[]).slice(0,20).map(entry=>({id:text(entry.id),title:text(entry.title,'Reisemoment'),startAt:text(entry.startAt)||null,endAt:text(entry.endAt)||null,entityType:text(entry.entityType,'place'),owner:text(entry.provenance?.owner||entry.owner,'journey')}));
  return immutable({date:text(value.date)||null,label:text(value.label||value.date,'Reisetag'),entries,conflictCount:finite(value.conflictCount||value.conflicts?.length,0,100,0)});
}
function normalizeTrip(value={}){
  const id=text(value.id||value.tripId);if(!id)return null;
  return immutable({
    id,title:text(value.title||value.tripName,'Unsere Reise'),destination:text(value.destination?.name||value.destinationName),startDate:text(value.startDate)||null,endDate:text(value.endDate)||null,
    symbol:text(value.symbol,'✦'),accent:text(value.accent,'#ee6f83'),active:value.active===true,isOwner:value.isOwner===true,
    actions:(Array.isArray(value.actions)?value.actions:[]).slice(0,LIMITS.maxActions).map(normalizeActionOffer).filter(Boolean)
  });
}
function normalizeBooking(value={}){
  const id=text(value.id||value.bookingId||value.booking_id);if(!id)return null;
  const place=value.place&&typeof value.place==='object'?value.place:{};
  return immutable({
    id,tripId:text(value.tripId||value.trip_id)||null,title:text(value.title||value.venueName||value.restaurantName||place.name,'Buchung'),status:text(value.status||value.bookingStatus,'unknown'),
    date:text(value.date||value.reservationDate||value.reservation_date)||null,time:text(value.time||value.reservationTime||value.reservation_time)||null,partySize:finite(value.partySize||value.party_size,1,100),
    provider:text(value.provider||value.providerId||value.provider_id)||null,channel:text(value.channel)||null,
    actions:(Array.isArray(value.actions)?value.actions:[]).slice(0,LIMITS.maxActions).map(normalizeActionOffer).filter(Boolean)
  });
}
function normalizeMemory(value={}){
  const id=text(value.id||value.storyId);if(!id)return null;
  return immutable({id,title:text(value.title||value.name,'Reisegeschichte'),status:text(value.status,'draft'),summary:text(value.summary||value.description),coverImage:normalizeImage(value.coverImage||value.image||{}),updatedAt:text(value.updatedAt||value.updated_at)||null,actions:(Array.isArray(value.actions)?value.actions:[]).slice(0,LIMITS.maxActions).map(normalizeActionOffer).filter(Boolean)});
}
function normalizePreferenceSummary(value={}){
  const categories=(Array.isArray(value.categories)?value.categories:Object.entries(value).map(([id,item])=>({id,count:Array.isArray(item)?item.length:(item==null||item===''?0:1)}))).slice(0,20).map(category=>immutable({id:text(category.id||category.key),label:text(category.label||category.id||category.key),count:finite(category.count,0,1000,0),configured:category.configured===true||Number(category.count)>0})).filter(category=>category.id);
  return immutable({categories,configuredCount:categories.filter(category=>category.configured).length,scope:'self',actions:(Array.isArray(value.actions)?value.actions:[]).slice(0,LIMITS.maxActions).map(normalizeActionOffer).filter(Boolean)});
}
function normalizeResult(value={}){
  const kind=Object.values(RESULT_KINDS).includes(value.kind)?value.kind:RESULT_KINDS.MESSAGE;
  const raw=(Array.isArray(value.items)?value.items:[]).slice(0,LIMITS.maxItems);
  const items=kind===RESULT_KINDS.PLACE_COLLECTION?raw.map(normalizePlace).filter(Boolean):kind===RESULT_KINDS.DAY_PLAN?raw.map(normalizeDay):kind===RESULT_KINDS.TRIP_COLLECTION?raw.map(normalizeTrip).filter(Boolean):kind===RESULT_KINDS.BOOKING_COLLECTION?raw.map(normalizeBooking).filter(Boolean):kind===RESULT_KINDS.MEMORY_COLLECTION?raw.map(normalizeMemory).filter(Boolean):[];
  const actions=(Array.isArray(value.actions)?value.actions:[]).slice(0,LIMITS.maxActions).map(normalizeActionOffer).filter(Boolean);
  const summary=kind===RESULT_KINDS.PREFERENCE_SUMMARY?normalizePreferenceSummary(value.summary||value.data||{}):null;
  return immutable({id:text(value.id)||null,kind,owner:text(value.owner,'intelligence'),contractId:text(value.contractId,CONTRACT_ID),title:text(value.title),message:text(value.message),items,summary,actions,evidence:sanitize(value.evidence||{}),meta:sanitize(value.meta||{})});
}
function createActionRequest(actionId,input={},context={}){
  const action=getAction(actionId);
  if(!action)throw contractError('INTELLIGENCE_ACTION_UNKNOWN','Action is not registered.',{actionId});
  return immutable({contractId:CONTRACT_ID,version:VERSION,actionId:action.id,owner:action.owner,ownerContract:action.ownerContract,ownerMethod:action.ownerMethod,effect:action.effect,risk:action.risk,confirmation:action.confirmation,reversible:action.reversible,idempotency:action.idempotency,permissions:action.permissions,input:sanitize(input||{}),context:sanitize(context||{})});
}
function createExecutionEnvelope(actionId,input={},context={},options={}){
  const request=createActionRequest(actionId,input,context),idempotencyKey=text(options.idempotencyKey),correlationId=text(options.correlationId);
  if(request.idempotency==='REQUIRED'&&!idempotencyKey)throw contractError('INTELLIGENCE_ACTION_IDEMPOTENCY_REQUIRED','Action requires an idempotency key.',{actionId:request.actionId});
  if(!correlationId)throw contractError('INTELLIGENCE_ACTION_CORRELATION_REQUIRED','Action requires a correlation id.',{actionId:request.actionId});
  return immutable({...request,idempotencyKey:idempotencyKey||null,correlationId,requestedAt:text(options.requestedAt)||null,source:text(options.source||context.surface,'global-chat')});
}
function createConfirmation(input={}){
  const action=getAction(input.actionId);
  if(!action)throw contractError('INTELLIGENCE_ACTION_UNKNOWN','Confirmation action is not registered.',{actionId:input.actionId});
  if(action.confirmation!==CONFIRMATION.EXPLICIT)throw contractError('INTELLIGENCE_ACTION_CONFIRMATION_NOT_REQUIRED','Action does not require explicit confirmation.',{actionId:action.id});
  return normalizeResult({
    id:text(input.id)||null,kind:RESULT_KINDS.CONFIRMATION,owner:action.owner,contractId:action.ownerContract,
    title:text(input.title,action.label),message:text(input.message,action.consequence),
    evidence:{actionId:action.id,effect:action.effect,risk:action.risk,reversible:action.reversible,permissions:action.permissions,consequence:action.consequence,ledgerId:text(input.ledgerId),correlationId:text(input.correlationId),idempotencyKey:text(input.idempotencyKey),expiresAt:text(input.expiresAt)||null,preview:sanitize(input.preview||{})},
    meta:{requiresConfirmation:true,actionId:action.id,ledgerId:text(input.ledgerId)}
  });
}
function createReceipt(input={}){
  const action=getAction(input.actionId);
  if(!action)throw contractError('INTELLIGENCE_ACTION_UNKNOWN','Receipt action is not registered.',{actionId:input.actionId});
  const status=RECEIPT_STATUSES.includes(input.status)?input.status:'completed';
  return normalizeResult({id:text(input.id)||null,kind:RESULT_KINDS.RECEIPT,owner:action.owner,contractId:action.ownerContract,title:text(input.title,action.label),message:text(input.message),actions:input.actions||[],evidence:{status,actionId:action.id,effect:action.effect,risk:action.risk,reversible:action.reversible,ownerCommand:input.ownerCommand===true,occurredAt:text(input.occurredAt)||null,ledgerId:text(input.ledgerId)||null,correlationId:text(input.correlationId)||null,idempotencyKey:text(input.idempotencyKey)||null,retryable:input.retryable===true,outcomeUnknown:input.outcomeUnknown===true,compensationStatus:text(input.compensationStatus)||null,reference:sanitize(input.reference||{})},meta:input.meta||{}});
}
function createCapabilitySnapshot(availability={}){
  const actions=listActions().map(action=>{
    const state=availability[action.id]??availability[action.ownerContract]??false;
    const available=state===true||state?.available===true;
    return immutable({actionId:action.id,owner:action.owner,ownerContract:action.ownerContract,ownerMethod:action.ownerMethod,effect:action.effect,risk:action.risk,confirmation:action.confirmation,permissions:action.permissions,reversible:action.reversible,idempotency:action.idempotency,available,reason:available?null:text(state?.reason,'owner-binding-unavailable')});
  });
  return immutable({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,count:actions.length,available:actions.filter(action=>action.available).length,actions});
}
function routeIntents(message=''){
  const request=text(message);if(!request)return null;
  const routes=[],push=(actionId,input={})=>{if(!routes.some(route=>route.actionId===actionId))routes.push({actionId,input:{query:request,...input}})};
  const food=/\b(restaurant|restaurants|essen|abendessen|mittagessen|frühstück|café|cafe|bistro|pizzeria|pizza|sushi|tisch|kulinar\w*|genuss)\b/i.test(request);
  const categories=[];
  if(food)categories.push('food');
  if(/\b(strand|meer|natur|park|garten|wandern|erholung|draußen)\b/i.test(request))categories.push('nature');
  if(/\b(museum|kultur|geschichte|galerie|theater|konzert|sehenswürdig\w*|attraktion)\b/i.test(request))categories.push('culture');
  if(/\b(aktivität|aktivitaet|erlebnis|schwimmbad|zoo|aquarium|sport|abenteuer)\b/i.test(request))categories.push('activities');
  if(/\b(shopping|einkaufen|markt|boutique|geschäft)\b/i.test(request))categories.push('shopping');
  if(/\b(nachtleben|club|bar|tanzen|live.?musik)\b/i.test(request))categories.push('nightlife');
  if(/\b(buchung(?:en)?|reservierung(?:en)?|stornier\w*|umbuch\w*|booking)\b/i.test(request))push('booking.trip.read',{intent:/stornier/i.test(request)?'cancel':/umbuch|änder/i.test(request)?'modify':'list'});
  if(/\b(meine\s+reisen|reisen\s+zeigen|reise\s+wechseln|wechs(?:le|eln?)\s+(?:die|zur)\s+reise|aktive\s+reise)\b/i.test(request))push('trip.active.list');
  if(/\b(erinnerung(?:en)?|reisegeschicht(?:e|en)|story|stories|album|alben)\b/i.test(request))push('memory.library.read');
  if(/\b(vorlieb(?:e|en)|präferenz(?:en)?|reisesti(?:l|le)|interessen)\b/i.test(request))push('identity.preferences.read');
  if(categories.length)push(categories.length===1&&categories[0]==='food'?'places.restaurant.recommend':'places.discovery.recommend',{category:categories[0]||'places',categories:[...new Set(categories)],limit:Math.min(8,Math.max(4,categories.length*2))});
  if(/\b(tagesplan|timeline|tag\s+planen|plan(?:e|t|en)?\b.{0,64}\btag|heute\s+(?:machen|unternehmen)|vorschl\w*\s+(?:für\s+)?(?:den\s+)?tag|\b(?:um|gegen)\s+\d{1,2}(?::\d{2})?\s*uhr)\b/i.test(request))push('journey.day.read');
  return immutable(routes);
}
function routeIntent(message=''){
  return routeIntents(message)?.[0]||null;
}
function policySnapshot(){return immutable({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,effects:EFFECTS,risk:RISK,confirmation:CONFIRMATION,actionCount:ACTIONS.length,autoRun:'registered-read-only',autoRunRisk:'R0-only',writeExecution:'every-write-preview-plus-explicit-confirmation-plus-owner-command-plus-receipt',explicitConfirmation:'natural-language-alone-is-never-confirmation',idempotency:'required-for-owner-mutations',unknownExternalOutcome:'owner-reconciliation-before-retry',undo:'registered-owner-compensation-only',foreignDomainMutation:false,journeyTimelineOwner:false,limits:LIMITS})}

return Object.freeze({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,effects:EFFECTS,risk:RISK,confirmation:CONFIRMATION,resultKinds:RESULT_KINDS,immutable,sanitize,normalizeAction,createActionRegistry,getAction,listActions,canAutoRun,assertExecution,normalizeActionOffer,normalizePlace,normalizeDay,normalizeTrip,normalizeBooking,normalizeMemory,normalizePreferenceSummary,normalizeResult,createActionRequest,createExecutionEnvelope,createConfirmation,createReceipt,createCapabilitySnapshot,routeIntent,routeIntents,policySnapshot});
})();
