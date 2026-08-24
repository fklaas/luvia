var LuviaIntelligenceActionContractCoreV1=(()=>{
'use strict';

const CONTRACT_ID='intelligence.actions.v1';
const VERSION='1';
const RUNTIME_VERSION='1.0.0';
const EFFECTS=Object.freeze({READ:'READ',DRAFT:'DRAFT',WRITE:'WRITE',EXTERNAL:'EXTERNAL'});
const CONFIRMATION=Object.freeze({NEVER:'NEVER',USER_GESTURE:'USER_GESTURE',EXPLICIT:'EXPLICIT'});
const RESULT_KINDS=Object.freeze({MESSAGE:'message',PLACE_COLLECTION:'place_collection',DAY_PLAN:'day_plan',RECEIPT:'receipt',CLARIFICATION:'clarification',ERROR:'error'});
const RECEIPT_STATUSES=Object.freeze(['completed','opened','cancelled','failed']);
const BLOCKED_KEYS=/^(email|phone|telephone|password|token|access_token|refresh_token|authorization|apikey|api_key|booking_number|reservation_number|payment|card|iban|address_exact)$/i;
const LIMITS=Object.freeze({maxDepth:7,maxArray:40,maxString:1000,maxItems:8,maxActions:5});

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
  {id:'places.restaurant.recommend',owner:'places',ownerContract:'places.v1',ownerMethod:'reads.recommend',effect:'READ',confirmation:'NEVER',resultKind:'place_collection',autoRun:true,label:'Restaurants finden',description:'Findet und ordnet echte Restaurantkandidaten im aktiven Reisekontext.'},
  {id:'places.place.favorite',owner:'places',ownerContract:'places.v1',ownerMethod:'commands.favorite',effect:'WRITE',confirmation:'USER_GESTURE',resultKind:'receipt',autoRun:false,label:'Als Favorit merken',description:'Delegiert das Merken eines Orts an den Places Owner.'},
  {id:'places.place.plan',owner:'places',ownerContract:'places.v1',ownerMethod:'commands.plan',effect:'WRITE',confirmation:'USER_GESTURE',resultKind:'receipt',autoRun:false,label:'Zur Reise planen',description:'Delegiert die Place-Planung an den Places Owner.'},
  {id:'booking.restaurant.open',owner:'booking',ownerContract:'booking.v1',ownerMethod:'commands.openPlaceBooking',effect:'EXTERNAL',confirmation:'USER_GESTURE',resultKind:'receipt',autoRun:false,label:'Reservieren',description:'Öffnet den bestehenden Booking-Owner-Flow für das Restaurant.'},
  {id:'journey.day.read',owner:'journey',ownerContract:'journey.v1',ownerMethod:'reads.snapshot',effect:'READ',confirmation:'NEVER',resultKind:'day_plan',autoRun:true,label:'Tagesplan zeigen',description:'Liest den abgeleiteten Day Graph ausschließlich über Journey v1.'},
  {id:'journey.day.open',owner:'journey',ownerContract:'journey.v1',ownerMethod:'commands.openPlanningEditor',effect:'EXTERNAL',confirmation:'USER_GESTURE',resultKind:'receipt',autoRun:false,label:'Tag bearbeiten',description:'Öffnet den Journey-eigenen Planungseditor ohne Intelligence-Mutationsownership.'}
].map(definition=>immutable(definition)));

function normalizeAction(definition={}){
  const id=text(definition.id);
  if(!id)throw contractError('INTELLIGENCE_ACTION_ID_REQUIRED','Action id is required.');
  const effect=Object.values(EFFECTS).includes(definition.effect)?definition.effect:EFFECTS.READ;
  const confirmation=Object.values(CONFIRMATION).includes(definition.confirmation)?definition.confirmation:(effect===EFFECTS.READ?CONFIRMATION.NEVER:CONFIRMATION.EXPLICIT);
  const resultKind=Object.values(RESULT_KINDS).includes(definition.resultKind)?definition.resultKind:RESULT_KINDS.MESSAGE;
  return immutable({id,owner:text(definition.owner),ownerContract:text(definition.ownerContract),ownerMethod:text(definition.ownerMethod),effect,confirmation,resultKind,autoRun:definition.autoRun===true&&effect===EFFECTS.READ&&confirmation===CONFIRMATION.NEVER,label:text(definition.label,id),description:text(definition.description)});
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
  return immutable({actionId:action.id,label:text(value.label,action.label),owner:action.owner,effect:action.effect,confirmation:action.confirmation,payload:sanitize(value.payload||{}),disabled:value.disabled===true,disabledReason:text(value.disabledReason)||null});
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
function normalizeResult(value={}){
  const kind=Object.values(RESULT_KINDS).includes(value.kind)?value.kind:RESULT_KINDS.MESSAGE;
  const items=kind===RESULT_KINDS.PLACE_COLLECTION?(Array.isArray(value.items)?value.items:[]).slice(0,LIMITS.maxItems).map(normalizePlace).filter(Boolean):kind===RESULT_KINDS.DAY_PLAN?(Array.isArray(value.items)?value.items:[]).slice(0,LIMITS.maxItems).map(normalizeDay):[];
  const actions=(Array.isArray(value.actions)?value.actions:[]).slice(0,LIMITS.maxActions).map(normalizeActionOffer).filter(Boolean);
  return immutable({id:text(value.id)||null,kind,owner:text(value.owner,'intelligence'),contractId:text(value.contractId,CONTRACT_ID),title:text(value.title),message:text(value.message),items,actions,evidence:sanitize(value.evidence||{}),meta:sanitize(value.meta||{})});
}
function createActionRequest(actionId,input={},context={}){
  const action=getAction(actionId);
  if(!action)throw contractError('INTELLIGENCE_ACTION_UNKNOWN','Action is not registered.',{actionId});
  return immutable({contractId:CONTRACT_ID,version:VERSION,actionId:action.id,owner:action.owner,ownerContract:action.ownerContract,ownerMethod:action.ownerMethod,effect:action.effect,confirmation:action.confirmation,input:sanitize(input||{}),context:sanitize(context||{})});
}
function createReceipt(input={}){
  const action=getAction(input.actionId);
  if(!action)throw contractError('INTELLIGENCE_ACTION_UNKNOWN','Receipt action is not registered.',{actionId:input.actionId});
  const status=RECEIPT_STATUSES.includes(input.status)?input.status:'completed';
  return normalizeResult({id:text(input.id)||null,kind:RESULT_KINDS.RECEIPT,owner:action.owner,contractId:action.ownerContract,title:text(input.title,action.label),message:text(input.message),actions:input.actions||[],evidence:{status,actionId:action.id,ownerCommand:input.ownerCommand===true,occurredAt:text(input.occurredAt)||null,reference:sanitize(input.reference||{})},meta:input.meta||{}});
}
function routeIntent(message=''){
  const request=text(message);if(!request)return null;
  if(/\b(restaurant|restaurants|essen|abendessen|mittagessen|frühstück|café|cafe|bistro|pizzeria|pizza|sushi|tisch|reservier\w*)\b/i.test(request))return immutable({actionId:'places.restaurant.recommend',input:{query:request,category:'food',limit:4}});
  if(/\b(tagesplan|tag\s+planen|plane\w*\s+(?:mir|uns)?\s*(?:einen|den)?\s*(?:schönen|ganzen|freien)?\s*tag|heute\s+(?:machen|unternehmen)|vorschl\w*\s+(?:für\s+)?(?:den\s+)?tag)\b/i.test(request))return immutable({actionId:'journey.day.read',input:{query:request}});
  return null;
}
function policySnapshot(){return immutable({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,effects:EFFECTS,confirmation:CONFIRMATION,autoRun:'registered-read-only',writeExecution:'direct-user-gesture-or-explicit-confirmation-plus-owner-command',foreignDomainMutation:false,journeyTimelineOwner:false,limits:LIMITS})}

return Object.freeze({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,effects:EFFECTS,confirmation:CONFIRMATION,resultKinds:RESULT_KINDS,immutable,sanitize,normalizeAction,createActionRegistry,getAction,listActions,canAutoRun,assertExecution,normalizeActionOffer,normalizePlace,normalizeDay,normalizeResult,createActionRequest,createReceipt,routeIntent,policySnapshot});
})();
