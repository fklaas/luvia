((root)=>{
'use strict';

const VERSION='1.23.4-deduplicated-visit-aliases';
const CONFIRMATION_TTL_MS=5*60*1000;
const listeners=new Set();
const pending=new Map();
const receipts=new Map();
const completedInputs=new Map();
const compensationOrigins=new Map();
let sequence=0;
const actionCore=()=>root.LuviaIntelligenceActionContractCoreV1||missing('LuviaIntelligenceActionContractCoreV1');
const ledgerCore=()=>root.LuviaIntelligenceActionLedgerCoreV1||missing('LuviaIntelligenceActionLedgerCoreV1');
const tripContract=()=>root.LuviaTripContractV1||root.LuviaTripContract||missing('trip.v1');
const placesContract=()=>root.LuviaPlacesContractV1||missing('places.v1');
const bookingContract=()=>root.LuviaBookingContractV1||missing('booking.v1');
const bookingAdmission=place=>{try{return bookingContract().reads?.resolveAdmission?.(place)||root.LuviaBookingAdmissionCore?.resolve?.(place)||null}catch{return null}};
const journeyContract=()=>root.LuviaJourneyContractV1||missing('journey.v1');
const memoryContract=()=>root.LuviaMemoryContractV1||root.LuviaMemoryContract||missing('memory.v1');
const identityContract=()=>root.LuviaIdentityContractV1||root.LuviaIdentityContract||missing('identity.v1');
const intelligenceContract=()=>root.LuviaIntelligenceContractV1||root.LuviaIntelligenceContract||missing('intelligence.v1');
const verifiedEventContract=()=>root.LuviaVerifiedEventIntelligenceContractV1||missing('intelligence.verified-events.v1');
const navigationContract=()=>root.LuviaNavigationContractV1||root.LuviaNavigationContractCoreV1||missing('navigation.v1');
const ledger=ledgerCore().createActionLedger({idFactory:value=>`ledger-${value}-${newId('entry')}`,maxEntries:240});

function missing(provider){const error=new Error(`Luvia Action Runtime: ${provider} ist nicht verfügbar.`);error.code='AI_ACTION_OWNER_CONTRACT_UNAVAILABLE';error.provider=provider;throw error}
function runtimeError(code,message,extra={}){const error=new Error(message);error.code=code;Object.assign(error,extra);return error}
const clean=value=>String(value??'').trim();
const displayDate=value=>{const match=clean(value).match(/^(\d{4})-(\d{2})-(\d{2})/);return match?`${match[3]}.${match[2]}.${match[1]}`:clean(value)};
const tripId=trip=>clean(trip?.tripId||trip?.id)||null;
const destination=trip=>clean(trip?.destination?.name||trip?.destination?.formattedAddress||trip?.destinationName||trip?.city);
const providerId=place=>clean(place?.providerPlaceId||place?.id).replace(/^places\//,'');
function runtimeTimeZone(explicit){
  const active=tripContract().getActiveTrip?.()||tripContract().reads?.getActiveTrip?.()||{},profile=root.LuviaProfileService?.snapshot?.()||{};
  return clean(explicit||active.timezone||active.timeZone||active.destination?.timezone||active.destination?.timeZone||profile.timezone||profile.timeZone||Intl.DateTimeFormat().resolvedOptions().timeZone);
}
function newId(prefix){return`${prefix}-${root.crypto?.randomUUID?.()||`${Date.now()}-${++sequence}`}`}
function emit(reason,detail={}){const event=actionCore().immutable({reason,...detail});for(const listener of listeners){try{listener(event)}catch{}}root.dispatchEvent?.(new CustomEvent('luvia:ai-action-changed',{detail:event}));return event}
function ownerContract(owner){return owner==='trip'?tripContract():owner==='places'?placesContract():owner==='booking'?bookingContract():owner==='journey'?journeyContract():owner==='memory'?memoryContract():owner==='identity'?identityContract():owner==='intelligence'?verifiedEventContract():owner==='navigation'?navigationContract():missing(owner)}
function operation(contract,path){return clean(path).split('.').reduce((value,key)=>value?.[key],contract)}
function operationAvailable(definition){try{return typeof operation(ownerContract(definition.owner),definition.ownerMethod)==='function'}catch{return false}}
function receiptReference(payload={},result={}){return{tripId:payload.tripId||null,previousTripId:payload.previousTripId||null,entryId:payload.entryId||result?.entryId||null,visitId:payload.visitId||result?.visitId||result?.id||null,recoveryId:payload.recoveryId||result?.recoveryId||null,providerPlaceId:payload.providerPlaceId||payload.place?.providerPlaceId||null,tripPlaceId:result?.tripPlaceId||null,bookingId:payload.bookingId||result?.bookingId||result?.id||null,storyId:payload.storyId||result?.storyId||result?.id||null,channel:result?.channel||result?.transport||null,provider:result?.provider||null,opened:typeof result?.opened==='boolean'?result.opened:null,submissionState:result?.submissionState||result?.mutationLifecycleState||null,providerOutcomeKnown:typeof result?.providerOutcomeKnown==='boolean'?result.providerOutcomeKnown:null,awaitingProviderReply:typeof result?.awaitingProviderReply==='boolean'?result.awaitingProviderReply:null,readbackVerified:typeof result?.readbackVerified==='boolean'?result.readbackVerified:null,readbackState:result?.readbackState||null,readbackOwner:result?.readbackOwner||null,readbackObservedAt:result?.readbackObservedAt||null}}
function previewPayload(payload={}){const allowed=['tripId','entryId','visitId','recoveryId','bookingId','providerPlaceId','placeId','placeType','name','title','date','time','startAt','durationMinutes','partySize','reason','status','category'];return Object.fromEntries(allowed.filter(key=>payload[key]!=null&&payload[key]!=='').map(key=>[key,payload[key]]))}
function ledgerPayload(definition,payload={}){
  if(definition.id==='navigation.route.open')return{route:payload.route||null,source:payload.source||'global-chat',rawPromptOmitted:true};
  if(definition.id==='booking.stay.offer.open'){const offer=payload.offer||{};return{tripId:payload.tripId||payload.query?.tripId||null,selectedStayOffer:{providerId:offer.providerId||null,providerHotelId:offer.providerHotelId||null,offerId:offer.offerId||null,providerOfferId:offer.providerOfferId||null,providerRateKey:offer.providerRateKey||null,propertyKey:offer.propertyKey||null,checkIn:offer.checkIn||null,checkOut:offer.checkOut||null,currency:offer.price?.currency||offer.currency||null,totalPrice:offer.price?.total??offer.totalPrice??null,bookingUrlOmitted:true},rawPromptOmitted:true};}
  if(definition.id==='memory.story.save')return{tripId:payload.tripId||null,storyId:payload.storyId||payload.story?.id||null,story:{id:payload.story?.id||null,status:payload.story?.status||null,mediaIds:Array.isArray(payload.story?.mediaIds)?payload.story.mediaIds:[],contentOmitted:true},changedFields:Object.keys(payload.story||{}),contentOmitted:true};
  if(definition.id==='identity.preferences.update')return{source:payload.source||null,evidenceId:payload.evidenceId||null,preferenceFields:Object.keys(payload.patch||{}),valuesOmitted:true};
  return payload;
}
function confirmationPreview(definition,payload={}){
  const base=previewPayload(payload);
  if(definition.id==='memory.story.save')return{...base,story:{id:payload.storyId||payload.story?.id||null,title:clean(payload.story?.title)||null,status:clean(payload.story?.status)||'draft',descriptionPreview:clean(payload.story?.description).slice(0,280)||null,mediaCount:Array.isArray(payload.story?.mediaIds)?payload.story.mediaIds.length:0}};
  if(definition.id==='identity.preferences.update')return{...base,changes:actionCore().sanitize(payload.patch||{})};
  if(['trip.update.details','booking.reservation.modify'].includes(definition.id))return{...base,changes:actionCore().sanitize(payload.patch||{})};
  return base;
}
function connectionSnapshot(){
  const owners=['trip','places','booking','journey','memory','identity','intelligence','navigation'];
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

function plannedAt(hint={},timeZone=runtimeTimeZone()){return actionCore().zonedDateTimeToIso?.(hint.date,hint.time,timeZone)||null}
function localDateTimeHint(iso,timeZone=runtimeTimeZone()){
  const instant=new Date(iso);if(!clean(iso)||Number.isNaN(instant.getTime())||!clean(timeZone))return{date:null,time:null};
  try{const parts=Object.fromEntries(new Intl.DateTimeFormat('de-DE',{timeZone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(instant).filter(part=>part.type!=='literal').map(part=>[part.type,part.value]));return{date:`${parts.year}-${parts.month}-${parts.day}`,time:`${parts.hour}:${parts.minute}`}}catch{return{date:null,time:null}}
}
function sameOwnerIdentity(entity={},payload={}){
  const entityTripPlaceId=clean(entity.tripPlaceId||entity.trip_place_id||entity.place?.tripPlaceId),entityProviderPlaceId=providerId(entity)||providerId(entity.place||{}),entityPlaceId=clean(entity.placeId||entity.place_id||entity.place?.id);
  return Boolean(payload.tripPlaceId&&entityTripPlaceId===clean(payload.tripPlaceId)||payload.providerPlaceId&&entityProviderPlaceId===clean(payload.providerPlaceId).replace(/^places\//,'')||payload.placeId&&entityPlaceId===clean(payload.placeId));
}
function exactInstant(left,right){const leftMs=Date.parse(clean(left)),rightMs=Date.parse(clean(right));return Number.isFinite(leftMs)&&Number.isFinite(rightMs)?leftMs===rightMs:clean(left)===clean(right)}
function journeyEntries(projection={}){const values=[...(projection.entries||[]),...(projection.days||[]).flatMap(day=>day.entries||[])],seen=new Set();return values.filter(entry=>{const key=clean(entry.id||entry.tripPlaceId)||`${clean(entry.title)}|${clean(entry.startAt)}`;if(seen.has(key))return false;seen.add(key);return true})}
async function placeMutationReadback(actionId,payload={}){
  const expectedFavorite=actionId==='places.place.favorite',expectedPlannedAt=clean(payload.fields?.planned_at),maxAttempts=3;
  for(let attempt=1;attempt<=maxAttempts;attempt+=1){
    if(attempt>1&&typeof root.setTimeout==='function')await new Promise(resolve=>root.setTimeout(resolve,attempt===2?80:180));
    try{
      if(['places.place.favorite','places.place.unfavorite'].includes(actionId)){
        const response=await placesContract().reads.listSaved({tripId:payload.tripId}),entities=Array.isArray(response)?response:response?.places||[],entity=entities.find(item=>sameOwnerIdentity(item,payload)),actual=entity?Boolean(entity.isFavorite??entity.is_favorite):false,verified=expectedFavorite?Boolean(entity&&actual):!entity||actual===false;
        if(verified)return{verified:true,state:expectedFavorite?'favorite':'not_favorite',owner:'places.v1',observedAt:new Date().toISOString(),attempts:attempt};
      }else{
        const trip=tripContract().getActiveTrip?.()||tripContract().reads?.getActiveTrip?.()||{id:payload.tripId},projection=await Promise.resolve(journeyContract().reads.snapshot({trip})),entry=journeyEntries(projection).find(item=>sameOwnerIdentity(item,payload)),verified=actionId==='places.place.unplan'?!entry:Boolean(entry&&(!expectedPlannedAt||exactInstant(entry.startAt||entry.plannedAt||entry.planned_at,expectedPlannedAt)));
        if(verified)return{verified:true,state:actionId==='places.place.plan'?'planned':'not_planned',owner:'journey.v1',observedAt:new Date().toISOString(),attempts:attempt};
      }
    }catch(error){if(attempt===maxAttempts)return{verified:false,state:'read_unavailable',owner:['places.place.favorite','places.place.unfavorite'].includes(actionId)?'places.v1':'journey.v1',observedAt:new Date().toISOString(),attempts:attempt,code:error?.code||'OWNER_READBACK_UNAVAILABLE'}}
  }
  return{verified:false,state:'not_reconciled',owner:['places.place.favorite','places.place.unfavorite'].includes(actionId)?'places.v1':'journey.v1',observedAt:new Date().toISOString(),attempts:maxAttempts,code:'OWNER_READBACK_MISMATCH'};
}
async function reconcilePlaceMutation(actionId,payload,result,message,status='completed'){
  const readback=await placeMutationReadback(actionId,payload),enriched={...(result||{}),tripPlaceId:result?.tripPlaceId||payload.tripPlaceId||null,readbackVerified:readback.verified,readbackState:readback.state,readbackOwner:readback.owner,readbackObservedAt:readback.observedAt,readbackAttempts:readback.attempts};
  if(payload.readbackRequired===true&&!readback.verified)return{result:enriched,message:'Die Änderung wurde gesendet, aber der gespeicherte Zustand konnte noch nicht eindeutig bestätigt werden. Ich wiederhole sie nicht automatisch.',status:'outcome_unknown',resolvedPayload:payload};
  return{result:enriched,message,status,resolvedPayload:payload};
}
function mutationHints(compiled){
  const intents=compiled?.intents||[],writes=intents.filter(intent=>intent.mode==='propose-write'),plan=writes.find(intent=>intent.domain==='journey'&&/\b(?:plane|planen|einplan\w*|eintrag\w*|trage|trag|hinzufueg\w*|hinzufüg\w*|timeline|reiseplan|tagesplan|plan|schedule|add)\b/i.test(intent.clause))||writes.find(intent=>intent.domain==='places'&&/\b(?:plane|planen|einplan\w*|eintrag\w*|trage|trag|hinzufueg\w*|hinzufüg\w*|timeline|plan|schedule|add)\b/i.test(intent.clause)),favorite=writes.find(intent=>intent.domain==='places'&&/\b(?:merk|speicher|favorit)\w*\b/i.test(intent.clause)),booking=writes.find(intent=>intent.domain==='booking'),timeZone=runtimeTimeZone();
  return actionCore().immutable({plan:plan?{clause:plan.clause,date:plan.temporalHint?.date||null,time:plan.temporalHint?.time||null,timeZone,plannedAt:plannedAt(plan.temporalHint,timeZone)}:null,favorite:Boolean(favorite),booking:booking?{clause:booking.clause,date:booking.temporalHint?.date||null,time:booking.temporalHint?.time||null,partySize:booking.entityHints?.partySize||null}:null});
}
const referenceKey=value=>clean(value).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('de-DE').replace(/[^\p{L}\p{N}]+/gu,'');
const referenceWords=value=>clean(value).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('de-DE').split(/[^\p{L}\p{N}]+/u).filter(Boolean);
function exactRequirementSubjects(places=[],targetName='',category='places'){
  const targetKey=referenceKey(targetName),targetWords=referenceWords(targetName);if(!targetKey)return[];
  const expected={nightlife:new Set(['nightlife']),food:new Set(['dining']),culture:new Set(['culture','attraction','event']),activity:new Set(['activity','attraction','event'])}[clean(category).toLowerCase()]||null;
  const ranked=[];
  for(const place of places){const name=clean(place?.name||place?.displayName),key=referenceKey(name);if(!key)continue;const admission=bookingAdmission(place),kind=clean(admission?.kind).toLowerCase(),words=new Set(referenceWords(name)),exact=key===targetKey,strong=targetWords.length>0&&targetWords.every(word=>words.has(word))&&(!expected||expected.has(kind));if(exact||strong)ranked.push({place,score:exact?10000:5000-Math.abs(key.length-targetKey.length),key})}
  ranked.sort((left,right)=>right.score-left.score);if(!ranked.length||ranked.length>1&&ranked[0].score===ranked[1].score&&ranked[0].key!==ranked[1].key)return[];return[ranked[0].place];
}
function requirementReadResult(card,input,trip,providerDiagnostics){
  const target=clean(input.targetName)||clean(card?.name)||'diesem Ort',requestedDestination=clean(input.destinationName||input.destination)||destination(trip),admission=card?.admission||null;
  if(!card)return actionCore().normalizeResult({kind:'message',owner:'booking',contractId:'booking.admission.v1',title:`${target} nicht eindeutig gefunden`,message:`Für ${target}${requestedDestination?` in ${requestedDestination}`:''} wurde kein eindeutig passender Ort belegt. Deshalb prüfe ich weder einen fremden Reservierungsweg noch einen ähnlichen Namen.`,actions:[],evidence:{exactSubjectResolved:false,targetName:target,destination:requestedDestination,providerDiagnostics,automaticMutation:false},meta:{actionId:'places.discovery.recommend',requirementRead:true}});
  const requirement=clean(admission?.requirement)||'unknown',titles={free:`Kein Eintritt bei ${card.name} nötig`,not_required:`Keine Reservierung bei ${card.name} nötig`,reservation_supported:`Reservierung bei ${card.name} möglich`,reservation_recommended:`Reservierung bei ${card.name} empfohlen`,reservation_required:`Reservierung bei ${card.name} erforderlich`,ticket_available:`Tickets für ${card.name} verfügbar`,ticket_required:`Ticket für ${card.name} erforderlich`,timed_entry_required:`Zeitfenster für ${card.name} erforderlich`,unknown:`Reservierung bei ${card.name} noch ungeklärt`},bookingAction=(card.actions||[]).find(action=>action.actionId==='booking.place.open');
  const message=admission?.notice?.detail||'Der Anbieterstatus ist noch nicht eindeutig belegt.';
  return actionCore().normalizeResult({kind:'message',owner:'booking',contractId:'booking.admission.v1',title:titles[requirement]||titles.unknown,message,actions:bookingAction?[bookingAction]:[],evidence:{exactSubjectResolved:true,targetName:target,resolvedName:card.name,providerPlaceId:card.providerPlaceId,destination:requestedDestination,requirement,certainty:admission?.certainty||'unknown',routeKind:admission?.route?.kind||null,providerDiagnostics,automaticMutation:false},meta:{actionId:'places.discovery.recommend',requirementRead:true}});
}
function placeMutationAction(intent){
  if(!intent||intent.mode!=='propose-write'||!['places','journey'].includes(intent.domain))return null;
  const operation=clean(intent.semanticOperation).toLowerCase().replace(/[\s-]+/g,'_'),source=`${intent.semanticGoalType||''} ${intent.clause||''}`.toLocaleLowerCase('de-DE'),favoriteScope=/favorit|lieblingsort/.test(source),timelineScope=intent.domain==='journey'||/timeline|tagesplan|reiseplan|einplan|entplan|schedule/.test(source);
  if(['remove','delete','unplan','unsave'].includes(operation)||/\b(?:entfern|entplan|lösch|loesch|remove|unplan)\w*/i.test(source))return favoriteScope?'places.place.unfavorite':timelineScope?'places.place.unplan':null;
  if(['favorite','favourite','save','bookmark','mark'].includes(operation)||favoriteScope&&/\b(?:merk|speicher|favoris|favorite|bookmark)\w*/i.test(source))return'places.place.favorite';
  if(['add','plan','schedule'].includes(operation)||timelineScope&&/\b(?:plane|planen|einplan|eintrag|trage|trag|hinzufueg|hinzufüg|schedule|add)\w*/i.test(source))return'places.place.plan';
  return null;
}
function mutationCandidate(value={},fallback={}){
  const place=value.place||{},nested=value.entity?.place||{},link=value.tripPlace||value.entity?.tripPlace||{},providerPlaceId=providerId(value)||providerId(place)||providerId(nested)||clean(value.provider_place_id||place.provider_place_id||nested.provider_place_id),tripPlaceId=clean(value.tripPlaceId||value.trip_place_id||place.tripPlaceId||link.id||fallback.tripPlaceId),name=clean(value.name||value.title||place.name||nested.name||fallback.name),placeId=clean(value.placeId||value.place_id||place.id||nested.id||fallback.placeId),placeType=clean(value.placeType||value.primaryType||value.primary_type||place.primaryType||place.primary_type||fallback.placeType)||'place';
  if(!name)return null;return{tripId:clean(value.tripId||value.trip_id||link.trip_id||fallback.tripId),providerPlaceId,tripPlaceId,placeId,placeType,name,plannedAt:clean(value.plannedAt||value.planned_at||value.startAt||fallback.plannedAt)||null};
}
function bookingPlaceSubject(booking={}){
  const request=booking.request||{},contact=booking.contact||{},verified=booking.metadata?.verifiedContact||{},name=clean(booking.title||booking.venueName||booking.venue_name||booking.restaurantName||booking.restaurant_name||booking.accommodationName||booking.accommodation_name);
  if(!name)return null;
  return{
    tripId:clean(booking.tripId||booking.trip_id),
    tripPlaceId:clean(booking.tripPlaceId||booking.trip_place_id),
    placeId:clean(booking.placeId||booking.place_id),
    providerPlaceId:clean(booking.providerPlaceId||booking.provider_place_id||request.providerPlaceId||request.provider_place_id),
    name,
    primaryType:clean(booking.type||request.sourcePlaceType)||'place',
    website:clean(request.website||contact.website)||undefined,
    reservationUrl:clean(request.reservationUrl||request.reservation_url||contact.bookingUrl)||undefined,
    bookingProvider:clean(booking.provider)||undefined,
    providerVenueReference:clean(request.providerReference||request.provider_reference)||undefined,
    bookingEmail:verified.email===true?clean(contact.email)||undefined:undefined,
    bookingEmailVerified:verified.email===true,
    bookingEmailPublic:verified.email===true,
    bookingEmailSourceUrl:verified.email===true?clean(verified.source)||undefined:undefined,
    ownerEvidence:{contractId:'booking.v1',bookingId:clean(booking.id||booking.bookingId||booking.booking_id),status:clean(booking.status)||null}
  };
}
function uniqueMutationCandidates(items=[]){const seen=new Map();for(const item of items){const candidate=mutationCandidate(item);if(!candidate)continue;const key=[candidate.tripPlaceId,candidate.providerPlaceId,referenceKey(candidate.name)].join('|');if(!seen.has(key))seen.set(key,candidate)}return[...seen.values()]}
const GENERIC_MUTATION_NAME_TOKENS=new Set(['der','die','das','ein','eine','einer','einem','einen','im','in','am','an','auf','von','zu','zum','zur','fuer','für','bestatigt','bestatigte','bestatigter','bestatigten','besuch','aufenthalt','gps','moment','ort','place','restaurant','hotel','unterkunft']);
const mutationNameTokens=value=>clean(value).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('de-DE').split(/[^\p{L}\p{N}]+/u).filter(token=>token.length>=3&&!GENERIC_MUTATION_NAME_TOKENS.has(token));
function namedMutationCandidate(candidates,intent,message){
  const explicit=referenceKey(intent?.entityHints?.targetName),source=referenceKey(message||intent?.clause),sourceTokens=new Set(mutationNameTokens(message||intent?.clause)),ranked=candidates.map(candidate=>{const key=referenceKey(candidate.name),exact=Boolean(explicit&&key===explicit),contained=Boolean(key.length>=4&&(explicit?key.includes(explicit)||explicit.includes(key):source.includes(key))),tokens=mutationNameTokens(candidate.name),matched=tokens.filter(token=>sourceTokens.has(token)),tokenScore=matched.some(token=>token.length>=4)?matched.reduce((sum,token)=>sum+token.length,0)+(matched.length===tokens.length?200:0):0;return{candidate,key,score:exact?10000+key.length:contained?5000+key.length:tokenScore}}).filter(item=>item.score>0).sort((left,right)=>right.score-left.score);
  if(!ranked.length||ranked.length>1&&ranked[0].score===ranked[1].score&&ranked[0].key!==ranked[1].key)return null;return ranked[0].candidate;
}
async function semanticPlaceMutationPreview(message,compiled,options={}){
  const mutationIntents=(compiled?.intents||[]).map(intent=>({intent,actionId:placeMutationAction(intent)})).filter(item=>item.actionId);if(mutationIntents.length!==1)return null;
  const {intent,actionId}=mutationIntents[0],trip=tripContract().getActiveTrip?.()||tripContract().reads?.getActiveTrip?.()||{},activeTripId=tripId(trip);if(!activeTripId)return null;
  let candidates=[];
  if(actionId==='places.place.unplan'){
    const projection=await Promise.resolve(journeyContract().reads?.snapshot?.({trip})||{}),entries=[...(projection.entries||[]),...(projection.days||[]).flatMap(day=>day.entries||[])];candidates=uniqueMutationCandidates(entries.map(entry=>({...entry,tripId:entry.tripId||activeTripId})));
  }else{
    const known=(options.knownPlaceSubjects||[]).map(place=>({...place,tripId:place.tripId||activeTripId}));let saved=[];try{saved=await Promise.resolve(placesContract().reads?.listSaved?.({tripId:activeTripId})||[])}catch{}candidates=uniqueMutationCandidates([...known,...saved]);
  }
  const target=namedMutationCandidate(candidates,intent,options.sourceMessage||message);if(!target)return null;
  const payload={...target,tripId:target.tripId||activeTripId,readbackRequired:true};
  if(['places.place.favorite','places.place.unfavorite'].includes(actionId)&&!payload.providerPlaceId)return null;
  if(actionId==='places.place.unplan'){if(!payload.tripPlaceId)return null;const previous=localDateTimeHint(payload.plannedAt);payload.date=previous.date;payload.time=previous.time;payload.fields=payload.plannedAt?{planned_at:payload.plannedAt}:['planned_at'];}
  if(actionId==='places.place.plan'){
    const date=intent.temporalHint?.date||null,time=intent.temporalHint?.time||null,planned=plannedAt({date,time},runtimeTimeZone());if(!date||!time||!planned||!payload.providerPlaceId&&!payload.tripPlaceId)return null;payload.date=date;payload.time=time;payload.fields={planned_at:planned,place_name:payload.name,notes:intent.clause};payload.requestedBy='intelligence.travel-orchestration.v1';
  }
  return prepare(actionId,payload,{userGesture:true,surface:options.surface||'global-chat'}).result;
}
function visitMutationAction(intent,message=''){
  if(!intent||intent.mode!=='propose-write'||!['places','journey'].includes(intent.domain))return null;
  const source=`${intent.semanticGoalType||''} ${intent.semanticOperation||''} ${intent.clause||''} ${message}`.toLocaleLowerCase('de-DE');
  if(!/\b(?:besuch|aufenthalt|gps[- ]?moment)\w*/i.test(source))return null;
  if(/(?:^|[^\p{L}\p{N}_])(?:wiederherstell|restore|zurückhol|zurueckhol)\w*|\bwieder\s+her\b/iu.test(source))return'journey.visit.restore';
  if(/(?:^|[^\p{L}\p{N}_])(?:entfern|lösch|loesch|delete|remove)\w*/iu.test(source))return'journey.visit.remove';
  if(/(?:^|[^\p{L}\p{N}_])(?:korrig|änder|aender|verschieb|update|change)\w*/iu.test(source))return'journey.visit.update';
  return null;
}
function visitRevision(visit={}){return clean(visit.revision||visit.updatedAt||visit.updated_at||visit.correction?._ownerRevision||visit.createdAt||visit.created_at||visit.arrivedAt||visit.arrived_at)||null}
function visitConfirmed(visit={}){return Boolean(visit.confirmed??visit.isConfirmed??visit.is_confirmed)}
function visitEntryCandidate(entry,activeTripId){
  if(!entry||entry.source!=='gps'&&!['visited','left'].includes(clean(entry.kind)))return null;
  const visitId=clean(entry.visitId||entry.sourceId||entry.sourceKey||entry.rowId||entry.id).replace(/^visit:/,'');if(!visitId)return null;
  const visit=placesContract().reads?.getVisit?.(visitId)||{},revision=visitRevision(visit)||clean(entry.sourceRevision);
  if(!revision)return null;
  const aliases=[visit.title,visit.name,visit.placeName,entry.title,entry.name,entry.placeName,entry.place?.name,entry.metadata?.placeName].map(clean).filter(Boolean);
  return{tripId:clean(entry.tripId)||activeTripId,visitId,placeId:clean(visit.placeId||entry.placeId)||null,name:aliases[0]||'Bestätigter Besuch',aliases:[...new Set(aliases)],startAt:clean(visit.arrivedAt||entry.startAt),durationMinutes:Math.max(5,Math.round(Number(visit.durationSeconds||Number(entry.durationMinutes||5)*60)/60)),expectedRevision:revision};
}
function uniqueVisitCandidates(items=[]){const byOwnerId=new Map();for(const item of items.filter(Boolean)){const key=clean(item.visitId||item.recoveryId);if(!key)continue;const existing=byOwnerId.get(key);if(!existing){byOwnerId.set(key,{...item,aliases:[...new Set([item.name,...(item.aliases||[])].map(clean).filter(Boolean))]});continue}const aliases=[...new Set([...(existing.aliases||[]),existing.name,item.name,...(item.aliases||[])].map(clean).filter(Boolean))],name=aliases.find(alias=>referenceKey(alias)!=='bestatigterbesuch')||aliases[0]||'Bestätigter Besuch';byOwnerId.set(key,{...existing,...item,name,aliases})}return[...byOwnerId.values()]}
function namedVisitCandidate(candidates,intent,message){
  const unique=uniqueVisitCandidates(candidates);if(unique.length===1)return unique[0];
  const aliases=unique.flatMap(candidate=>(candidate.aliases?.length?candidate.aliases:[candidate.name]).map(name=>({...candidate,name}))),selected=namedMutationCandidate(aliases,intent,message);return selected?unique.find(item=>item.visitId===selected.visitId||item.recoveryId===selected.recoveryId)||null:null;
}
function visitDurationHint(message,fallback){const match=clean(message).match(/\b(\d{1,4})\s*(?:min(?:ute)?n?|minutes?)\b/i),value=Number(match?.[1]);return Number.isInteger(value)&&value>=5&&value<=1440?value:fallback}
async function semanticVisitMutationPreview(message,compiled,options={}){
  const mutations=(compiled?.intents||[]).map(intent=>({intent,actionId:visitMutationAction(intent,message)})).filter(item=>item.actionId);if(!mutations.length)return null;if(mutations.length!==1)throw runtimeError('AI_VISIT_INTENT_AMBIGUOUS','Der Besuchsbefehl enthält mehrere mögliche Änderungen. Bitte nenne genau eine Korrektur, Entfernung oder Wiederherstellung.',{actionIds:[...new Set(mutations.map(item=>item.actionId))]});
  const {intent,actionId}=mutations[0],trip=tripContract().getActiveTrip?.()||tripContract().reads?.getActiveTrip?.()||{},activeTripId=tripId(trip);if(!activeTripId)throw runtimeError('AI_VISIT_TRIP_REQUIRED','Wähle zuerst die Reise des bestätigten Besuchs aus. Es wurde nichts verändert.',{actionId});
  if(actionId==='journey.visit.restore'){
    const recoveries=placesContract().reads?.visitRecoveries?.()||[],candidates=uniqueVisitCandidates(recoveries.filter(item=>!item.tripId||clean(item.tripId)===activeTripId).map(item=>({tripId:item.tripId||activeTripId,recoveryId:clean(item.recoveryId),visitId:clean(item.visitId)||null,placeId:clean(item.placeId)||null,name:clean(item.title)||'Bestätigter Besuch',aliases:[clean(item.title)].filter(Boolean),expectedRevision:clean(item.expectedRevision)})).filter(item=>item.recoveryId&&item.expectedRevision));if(!candidates.length)throw runtimeError('AI_VISIT_RECOVERY_NOT_FOUND','Für diese Reise ist kein wiederherstellbarer bestätigter Besuch belegt. Es wurde nichts verändert.',{actionId,tripId:activeTripId});const target=namedVisitCandidate(candidates,intent,options.sourceMessage||message);if(!target)throw runtimeError('AI_VISIT_TARGET_AMBIGUOUS','Mehrere entfernte Besuche kommen infrage. Bitte nenne den Ort des Besuchs.',{actionId,tripId:activeTripId,candidateCount:candidates.length});
    return prepare(actionId,{...target,readbackRequired:true},{userGesture:true,surface:options.surface||'global-chat'}).result;
  }
  const projection=await Promise.resolve(journeyContract().reads?.snapshot?.({trip})||{}),entries=journeyEntries(projection),candidates=uniqueVisitCandidates(entries.map(entry=>visitEntryCandidate(entry,activeTripId)).filter(Boolean));if(!candidates.length)throw runtimeError('AI_VISIT_NOT_FOUND','Für diese Reise ist aktuell kein bestätigter Besuch belegt. Geplante Orte sind davon getrennt; es wurde nichts verändert.',{actionId,tripId:activeTripId});const target=namedVisitCandidate(candidates,intent,options.sourceMessage||message);if(!target)throw runtimeError('AI_VISIT_TARGET_AMBIGUOUS','Mehrere bestätigte Besuche kommen infrage. Bitte nenne den Ort des Besuchs.',{actionId,tripId:activeTripId,candidateCount:candidates.length});
  if(actionId==='journey.visit.update'){
    const date=intent.temporalHint?.date,time=intent.temporalHint?.time,startAt=plannedAt({date,time},runtimeTimeZone());if(!date||!time||!startAt)throw runtimeError('AI_VISIT_TIME_REQUIRED','Für die Besuchskorrektur brauche ich ein eindeutiges Datum und eine Uhrzeit innerhalb der aktiven Reise. Es wurde nichts verändert.',{actionId,tripId:activeTripId});
    return prepare(actionId,{...target,date,time,startAt,durationMinutes:visitDurationHint(options.sourceMessage||message,target.durationMinutes),readbackRequired:true},{userGesture:true,surface:options.surface||'global-chat'}).result;
  }
  return prepare(actionId,{...target,readbackRequired:true},{userGesture:true,surface:options.surface||'global-chat'}).result;
}
function bookingMutationAction(intent){
  if(!intent||intent.domain!=='booking'||intent.mode!=='propose-write')return null;
  const operation=clean(intent.semanticOperation).toLowerCase().replace(/[\s-]+/g,'_'),source=`${intent.semanticGoalType||''} ${intent.clause||''}`;
  if(['cancel','storno','stornieren'].includes(operation)||/\bstornier\w*|\bcancel\w*/i.test(source))return'booking.reservation.cancel';
  if(['change','modify','update','rebook','umbuchen'].includes(operation)||/\b(?:änder|aender|umbuch|verschieb)\w*/i.test(source))return'booking.reservation.modify';
  if(['book','reserve','create'].includes(operation)||/\b(?:reservier|buche|buchen|book|reserve)\w*/i.test(source))return'booking.reservation.create';
  return null;
}
function bookingPatch(intent={}){
  const patch={},hint=intent.temporalHint||{},entities=intent.entityHints||{};
  if(hint.date)patch.date=hint.date;
  if(hint.time)patch.time=hint.time;
  if(Number(entities.partySize)>0)patch.partySize=Number(entities.partySize);
  return patch;
}
async function semanticBookingPreview(message,compiled,options={}){
  const mutations=(compiled?.intents||[]).map(intent=>({intent,actionId:bookingMutationAction(intent)})).filter(item=>item.actionId);if(mutations.length!==1)return null;
  const {intent,actionId}=mutations[0],trip=tripContract().getActiveTrip?.()||tripContract().reads?.getActiveTrip?.()||{},activeTripId=tripId(trip);if(!activeTripId)return null;
  if(actionId==='booking.reservation.create'){
    const known=(options.knownPlaceSubjects||[]).map(place=>({...place,tripId:place.tripId||activeTripId}));let ownerSubjects=[];
    try{const rows=await bookingContract().reads.listForTrip?.(activeTripId);ownerSubjects=(Array.isArray(rows)?rows:rows?.items||rows?.bookings||[]).map(bookingPlaceSubject).filter(Boolean).map(place=>({...place,tripId:place.tripId||activeTripId}))}catch{}
    const candidates=uniqueMutationCandidates([...known,...ownerSubjects]),target=namedMutationCandidate(candidates,intent,options.sourceMessage||message);if(!target)return null;
    const original=[...known,...ownerSubjects].find(place=>target.providerPlaceId&&providerId(place)===target.providerPlaceId||referenceKey(place.name||place.title)===referenceKey(target.name))||target,date=intent.temporalHint?.date,time=intent.temporalHint?.time,partySize=Number(intent.entityHints?.partySize),startAt=plannedAt({date,time},runtimeTimeZone());if(!date||!time||!startAt||!Number.isInteger(partySize)||partySize<1)return null;
    const place={...original,providerPlaceId:target.providerPlaceId,placeId:target.placeId,name:target.name,primaryType:original.primaryType||original.primary_type||target.placeType||'place'};
    return prepare(actionId,{tripId:activeTripId,place,providerPlaceId:target.providerPlaceId,placeType:place.primaryType,name:target.name,date,time,startAt,partySize,timezone:runtimeTimeZone(),email:place.bookingEmailVerified===true&&place.bookingEmailPublic===true?place.bookingEmail:undefined,emailVerified:place.bookingEmailVerified===true&&place.bookingEmailPublic===true,emailVerificationSource:place.bookingEmailSourceUrl||undefined,provider:place.bookingProvider||undefined,venueReference:place.providerVenueReference||place.venueReference||undefined,note:intent.clause},{userGesture:true,surface:options.surface||'global-chat'}).result;
  }
  const operation=actionId==='booking.reservation.cancel'?'cancel':'modify',resolution=await bookingContract().reads.resolveCommand?.({tripId:activeTripId,operation,query:options.sourceMessage||message,targetName:intent.entityHints?.targetName||null});if(!resolution||resolution.status!=='resolved')return null;
  if(resolution.available===false)throw runtimeError('BOOKING_LIFECYCLE_ACTION_UNAVAILABLE',operation==='cancel'?'Diese Buchung kann über den belegten Anbieterweg aktuell nicht storniert werden.':'Diese Buchung kann über den belegten Anbieterweg aktuell nicht geändert werden.',{bookingId:resolution.bookingId,reason:resolution.reason});
  const name=resolution.booking?.title||resolution.booking?.venueName||resolution.booking?.restaurantName||'Buchung';
  if(actionId==='booking.reservation.cancel')return prepare(actionId,{bookingId:resolution.bookingId,tripId:activeTripId,name,reason:null},{userGesture:true,surface:options.surface||'global-chat'}).result;
  const patch=bookingPatch(intent);if(!Object.keys(patch).length)return null;
  return prepare(actionId,{bookingId:resolution.bookingId,tripId:activeTripId,name,patch},{userGesture:true,surface:options.surface||'global-chat'}).result;
}
function placeActions(place,trip,hints={}){
  const id=providerId(place),primary=clean(place.primaryType||place.primary_type||'place').toLowerCase(),resolvedAdmission=place.admission||bookingAdmission({...place,providerPlaceId:id}),admission=resolvedAdmission||(/restaurant|cafe|bakery|bar|food|meal/.test(primary)?{relevant:true,action:{available:true,label:'Reservierung prüfen'}}:null),bookable=Boolean(admission?.relevant&&admission?.action?.available),payload={tripId:tripId(trip),providerPlaceId:id,placeId:place.id||id,placeType:primary||'place',type:primary||'place',primaryType:primary||'place',types:Array.isArray(place.types)?place.types:[],name:place.name,address:place.address||place.formattedAddress,website:place.website||place.websiteUri,reservationUrl:place.reservationUrl||place.bookingUrl||place.ticketUrl,ticketUrl:place.ticketUrl,admissionRequirement:place.admissionRequirement,ticketRequired:place.ticketRequired,reservationRequired:place.reservationRequired,reservationRecommended:place.reservationRecommended,reservable:place.reservable,readbackRequired:true};
  const planPayload=hints.plan?.plannedAt?{tripId:payload.tripId,providerPlaceId:payload.providerPlaceId,placeId:payload.placeId,placeType:payload.placeType,name:payload.name,date:hints.plan.date,time:hints.plan.time,fields:{planned_at:hints.plan.plannedAt,place_name:place.name,notes:hints.plan.clause},requestedBy:'intelligence.travel-orchestration.v1'}:payload;
  return[
    {actionId:place.isFavorite?'places.place.unfavorite':'places.place.favorite',label:place.isFavorite?'Favorit entfernen':'Als Favorit merken',payload},
    ...(bookable?[{actionId:'booking.place.open',label:[admission.notice?.label,admission.action.label].filter(Boolean).join(' · ')||'Buchungsweg prüfen',payload}]:[]),
    {actionId:'places.place.plan',label:hints.plan?.plannedAt?`${displayDate(hints.plan.date)} · ${hints.plan.time} Uhr einplanen`:'Zur Timeline hinzufügen',payload:planPayload}
  ];
}
async function resolveCard(place,trip,hints={}){
  const contract=placesContract();const id=providerId(place);let card={place,image:null};
  if(id&&typeof contract.reads?.getCard==='function'){try{card=await contract.reads.getCard(id,{maxWidthPx:960,maxHeightPx:720,source:place})||card}catch{}}
  const ownerReason=place?.profileFit?.state==='matched'?clean(place.profileFit.reason):'';
  const item={...place,...(card.place||{}),providerPlaceId:id||providerId(card.place),image:card.image||place.image||null,reasons:ownerReason?[ownerReason]:place.aiReasons||place.reasons||[],unknowns:place.aiUnknowns||place.unknowns||[]};
  item.admission=bookingAdmission(item);
  item.actions=placeActions(item,trip,hints);return item;
}
function boundedProviderDiagnostics(responses=[],categories=[]){
  const categoryRows=[],observations=[];let failedReads=0,successfulReads=0;
  responses.forEach((response,index)=>{
    const category=clean(response.status==='fulfilled'?response.value?.route?.category:categories[index]||'places').toLowerCase()||'places';
    if(response.status==='rejected'){failedReads++;categoryRows.push({category,status:'failed',providers:[],errors:[{code:clean(response.reason?.code||'PLACES_OWNER_READ_FAILED').slice(0,80)}]});return}
    successfulReads++;const value=response.value||{},diagnostics=value.providerDiagnostics||{},rawProviders=Array.isArray(diagnostics.providers)?diagnostics.providers:[],providers=rawProviders.slice(0,6).map(item=>({provider:clean(item?.provider).toLowerCase().slice(0,40)||'unknown',status:clean(item?.status).toLowerCase().slice(0,40)||'unknown',code:clean(item?.code).slice(0,80)||null,observedAt:clean(item?.observedAt).slice(0,40)||null}));
    if(!providers.length){for(const provider of diagnostics.requested||[])providers.push({provider:clean(provider).toLowerCase().slice(0,40),status:(diagnostics.used||[]).includes(provider)?'fulfilled':'requested',code:null,observedAt:null});for(const error of diagnostics.errors||[])providers.push({provider:clean(error?.provider).toLowerCase().slice(0,40)||'unknown',status:'failed',code:clean(error?.code||'PROVIDER_ERROR').slice(0,80),observedAt:null})}
    const observedAt=clean(value.observedAt||value.freshness?.observedAt);if(observedAt)observations.push(observedAt);for(const place of value.places||[])if(place.providerObservedAt)observations.push(clean(place.providerObservedAt));
    categoryRows.push({category,status:clean(diagnostics.status)||(providers.some(item=>item.status==='failed')?'partial':'fulfilled'),providers:providers.slice(0,8),errors:(diagnostics.errors||[]).slice(0,6).map(error=>({provider:clean(error?.provider).toLowerCase().slice(0,40)||'unknown',code:clean(error?.code||'PROVIDER_ERROR').slice(0,80)})),observedAt:observedAt||null});
  });
  const parsed=observations.filter(value=>Number.isFinite(Date.parse(value))).sort((left,right)=>Date.parse(left)-Date.parse(right)),hasProviderFailure=categoryRows.some(row=>row.status==='failed'||row.status==='partial'||row.providers.some(provider=>provider.status==='failed'));
  return{status:failedReads===responses.length?'unavailable':hasProviderFailure?'partial':successfulReads?'ready':'unknown',degraded:hasProviderFailure,successfulReads,failedReads,categories:categoryRows,observedAt:parsed[0]||null};
}
function fairCategorySelection(places=[],categories=[],perCategoryLimit=3){
  const order=[...new Set(categories.map(category=>clean(category).toLowerCase()).filter(Boolean))],buckets=new Map(order.map(category=>[category,[]])),fallback=[];
  for(const place of places){const category=clean(place.requestCategory).toLowerCase();if(buckets.has(category))buckets.get(category).push(place);else fallback.push(place)}
  const selected=[];for(let round=0;round<perCategoryLimit;round++)for(const category of order){const place=buckets.get(category)?.[round];if(place)selected.push(place)}
  return selected.concat(fallback).slice(0,Math.min(12,Math.max(perCategoryLimit,order.length*perCategoryLimit)));
}
async function placeDiscoveryResult(request,options={}){
  const trip=tripContract().getActiveTrip?.()||{};const input=request.input||{};validatePreparedInput(actionCore().getAction(request.actionId),input,{...request.context,tripId:tripId(trip)});const hints=input.mutationHints||{},strictPlaceType=request.actionId==='places.restaurant.recommend'?'restaurant':clean(input.strictPlaceType).toLowerCase()||null,confirmedPreferences=await Promise.resolve(identityContract().getPreferences?.('self')??identityContract().reads?.getPreferences?.('self')??{}),requestPreferences=input.explicitPreferencePatch||{},profileFallbackUsed=!Object.keys(requestPreferences).length,effectivePreferences={...confirmedPreferences,...requestPreferences},profileContext=options.profileContext||effectivePreferences,excluded=new Set((options.excludedProviderPlaceIds||[]).map(value=>clean(typeof value==='string'?value:providerId(value)).replace(/^places\//,'')).filter(Boolean)),inputSpatial=input.spatialConstraints||root.LuviaGlobalPlaceContracts?.spatialIntent?.(input.query)||null,sourceSpatial=root.LuviaGlobalPlaceContracts?.spatialIntent?.(options.sourceMessage)||null,spatialConstraints=inputSpatial?.explicit?inputSpatial:sourceSpatial?.explicit?sourceSpatial:inputSpatial,requestedDestination=clean(input.destinationName||input.destination),searchDestination=requestedDestination||destination(trip),activeDestination=referenceKey(destination(trip)),sameDestination=!requestedDestination||referenceKey(requestedDestination)===activeDestination,tripDestinationContext=sameDestination&&trip?.destination&&typeof trip.destination==='object'?trip.destination:{name:searchDestination,destinationName:searchDestination};
  const destinationContext=options.viewport?{name:searchDestination,location:options.viewport.center,viewport:options.viewport.bounds,searchRadiusMeters:options.viewport.radiusMeters}:tripDestinationContext;
  const categories=Array.isArray(input.categories)&&input.categories.length?input.categories:[input.category||'places'];
  const ownerFilterIntents=Object.fromEntries(categories.map(category=>[category,root.LuviaGlobalPlaceContracts?.filterIntent?.(input.query,category)||{}]));
  const activeCategory=categories.length===1?clean(categories[0]).toLowerCase():'',activeFilter=ownerFilterIntents[categories[0]]||{},specificTypes=[activeFilter.includedType,...(activeFilter.includedTypes||[])].map(value=>clean(value).toLowerCase()).filter(value=>value&&!['restaurant','vegetarian_restaurant','vegan_restaurant'].includes(value)),canReuseActiveDiscovery=!options.viewport&&!spatialConstraints?.explicit&&activeCategory&&specificTypes.length===0;
  const sharedDiscovery=canReuseActiveDiscovery&&typeof placesContract().reads?.getActiveDiscovery==='function'?placesContract().reads.getActiveDiscovery({tripId:tripId(trip),destination:searchDestination,category:activeCategory,surface:'places',fitOnly:true,maxAgeMs:10*60*1000}):null;
  const ownerReads=rejectedProviderPlaceIds=>Promise.allSettled(categories.map(category=>{const filter=ownerFilterIntents[category]||{};return placesContract().reads.recommend({tripId:tripId(trip),trip,text:input.query,query:input.query,category,destination:searchDestination,destinationContext,limit:Math.min(3,Math.max(1,Number(input.limit||3))),candidateLimit:50,queryVariantLimit:3,requirePreferenceEvidence:true,fastPath:Boolean(options.viewport),fastQueryLimit:1,includedType:filter.includedType||'',includedTypes:filter.includedTypes||[],vegetarianOnly:filter.vegetarianOnly===true,accessibleOnly:filter.accessibleOnly===true,reservableOnly:filter.reservableOnly===true,openNow:filter.openNow===true,minRating:filter.minRating??null,priceLevels:filter.priceLevels||[],maxDistanceMeters:options.viewport?.radiusMeters??filter.maxDistanceMeters,sortBy:filter.sortBy||'relevance',preferences:effectivePreferences,profileContext,preferenceMode:profileFallbackUsed?'confirmed-profile-fallback':'explicit-request-over-confirmed-profile',strictPlaceType:filter.includedType||strictPlaceType,rejectedProviderPlaceIds,spatialConstraints,diversity:{minimumQueryVariants:1,targetCandidates:3,rotateAcrossQueries:true}})}));
  let responses=sharedDiscovery?.places?.length?[{status:'fulfilled',value:{places:sharedDiscovery.places,route:{category:sharedDiscovery.category},observedAt:sharedDiscovery.observedAt,providerDiagnostics:{status:'ready',requested:[],used:[],errors:[]},sharedDiscovery}}]:await ownerReads([...excluded]),successful=responses.filter(response=>response.status==='fulfilled');if(!successful.length){const diagnostics=boundedProviderDiagnostics(responses,categories);throw Object.assign(new Error('Alle angeforderten Places-Owner-Reads sind fehlgeschlagen; Luvia zeigt keine erfundenen Treffer.'),{code:'PLACES_ALL_PROVIDERS_FAILED',providerDiagnostics:diagnostics})}
  const collect=(source,respectExclusions=true)=>{const seen=new Set(),places=[],repeats=[];source.forEach((response,index)=>{if(response.status!=='fulfilled')return;const ownerCategory=clean(response.value?.route?.category||categories[index]||categories[0]||'place').toLowerCase();for(const place of response.value?.places||[]){const id=providerId(place);if(!id||seen.has(id))continue;seen.add(id);const normalized={...place,requestCategory:ownerCategory,primaryType:place.primaryType||place.primary_type||ownerCategory};if(respectExclusions&&excluded.has(id))repeats.push(normalized);else places.push(normalized)}});return{places,repeats}};
  let collected=collect(responses,true),raw=collected.places,repeatFallbackUsed=false;if(!raw.length&&excluded.size){if(collected.repeats.length){raw=collected.repeats;repeatFallbackUsed=true}else{responses=await ownerReads([]);successful=responses.filter(response=>response.status==='fulfilled');if(!successful.length){const diagnostics=boundedProviderDiagnostics(responses,categories);throw Object.assign(new Error('Alle angeforderten Places-Owner-Reads sind fehlgeschlagen; Luvia zeigt keine erfundenen Treffer.'),{code:'PLACES_ALL_PROVIDERS_FAILED',providerDiagnostics:diagnostics})}raw=collect(responses,false).places;repeatFallbackUsed=raw.length>0}}
  if(!raw.length&&responses.some(response=>response.status==='rejected'))throw Object.assign(new Error('Mindestens ein angeforderter Places-Read ist fehlgeschlagen; ein vollständiger belastbarer Nulltreffer ist deshalb nicht belegt.'),{code:'PLACES_PROVIDER_READ_INCOMPLETE',providerDiagnostics:boundedProviderDiagnostics(responses,categories)});
  const requirementRead=input.bookingRequirementRead===true,targetName=clean(input.targetName);if(requirementRead&&targetName)raw=exactRequirementSubjects(raw,targetName,categories[0]);
  const perCategoryLimit=Math.min(3,Math.max(1,Number(input.limit||3))),selected=fairCategorySelection(raw,categories,perCategoryLimit),cards=await Promise.all(selected.map(place=>resolveCard(place,trip,hints))),evidenceContracts=successful.map(response=>response.value?.evidenceContract).filter(Boolean),requiresInventoryVerification=evidenceContracts.some(contract=>contract.requiresInventoryVerification===true),noun=requiresInventoryVerification?'mögliche Einkaufsorte':categories.length>1?'Orte':'Möglichkeiten',planCopy=hints.plan?.plannedAt?` Gewünschte Zeit: ${displayDate(hints.plan.date)} · ${hints.plan.time} Uhr.`:'',profileFields=Object.entries(confirmedPreferences||{}).filter(([key,value])=>!/(?:updated|completed|schema|version)/i.test(key)&&(Array.isArray(value)?value.length:Boolean(value))).length,profileCopy=profileFallbackUsed&&profileFields?' Gespeicherte Vorlieben sind berücksichtigt.':!profileFallbackUsed?' Deine genannten Vorlieben haben Vorrang.':'',diversityCopy=excluded.size?(repeatFallbackUsed?' Einige bereits gezeigte Treffer sind wieder dabei.':' Bereits gezeigte Orte wurden ausgelassen.'):'',diversityMeta=successful.map(response=>response.value?.diversityMeta).find(Boolean)||null,providerDiagnostics=boundedProviderDiagnostics(responses,categories),categoryDistribution=Object.fromEntries(categories.map(category=>[category,cards.filter(card=>card.requestCategory===category).length])),providerCopy=providerDiagnostics.degraded?' Eine Quelle ist eingeschränkt.':'',inventoryCopy=requiresInventoryVerification?' Bestand bitte direkt beim Anbieter prüfen.':'';
  if(requirementRead)return requirementReadResult(cards[0]||null,input,trip,providerDiagnostics);
  return actionCore().normalizeResult({kind:cards.length?'place_collection':'message',owner:'places',contractId:'places.v1',title:cards.length?`${cards.length} ${noun} für deine Suche`:'Noch kein verlässlicher Ort gefunden',message:cards.length?`Belegte Treffer aus den genannten Quellen.${profileCopy}${diversityCopy}${providerCopy}${inventoryCopy}${planCopy}`:requiresInventoryVerification?'Kein belegter passender Geschäftstyp gefunden. Einen aktuellen Warenbestand darf ich aus Place-Daten nicht ableiten.':'Für diese Auswahl konnte ich noch keinen ausreichend belegten Treffer finden. Das bedeutet nicht, dass es dort keinen gibt. Du kannst den Wunsch oder den Suchradius anpassen.',items:cards,evidence:{providerFactsAuthoritative:true,aiReasonsNonAuthoritative:true,discoveryRequest:{query:input.query,categories,strictPlaceType,explicitPreferencePatch:requestPreferences,destinationName:searchDestination,spatialConstraints,limit:input.limit||3},resultStatus:cards.length?'ready':'empty',selection:successful.map(response=>response.value?.selectionMeta).filter(Boolean),searchScope:successful.map(response=>response.value?.searchScope).find(Boolean)||null,specificSubjectEvidenceRequired:evidenceContracts.some(contract=>contract.strict===true),evidenceContracts,compiledFilters:ownerFilterIntents,inventoryVerified:false,inventoryVerificationRequired:requiresInventoryVerification,preferenceOwner:'identity.v1',confirmedProfileFields:profileFields,profileFallbackUsed,explicitRequestPreferenceFields:Object.keys(requestPreferences),query:input.query,categories,categoryDistribution,destination:searchDestination,tripId:tripId(trip),count:cards.length,excludedProviderPlaceIds:excluded.size,repeatFallbackUsed,diversityMeta,providerDiagnostics,observedAt:providerDiagnostics.observedAt,spatialConstraints,mutationHints:hints,sharedDiscovery:sharedDiscovery?{reused:true,id:sharedDiscovery.id,owner:'places.v1',providerReadCount:0,sourceObservedAt:sharedDiscovery.observedAt,placeIds:sharedDiscovery.places.map(providerId)}:{reused:false}},meta:{actionId:request.actionId}});
}
async function readPlaceViewport(result,viewport){
  const request=result?.evidence?.discoveryRequest,trip=tripContract().getActiveTrip?.()||{};
  if(!request||tripId(trip)!==result.evidence.tripId)throw runtimeError('PLACES_SEARCH_CONTEXT_EXPIRED','Bitte starte die Suche für die aktive Reise erneut.');
  if(!viewport?.bounds||!viewport?.center||!Number.isFinite(Number(viewport.radiusMeters)))throw runtimeError('PLACES_VIEWPORT_REQUIRED','Der Kartenausschnitt fehlt.');
  return placeDiscoveryResult({actionId:'places.discovery.recommend',input:request},{viewport});
}
const restaurantResult=(request,options={})=>placeDiscoveryResult({...request,input:{...(request.input||{}),category:'food',categories:['food']}},options);
async function dayResult(request){
  const trip=tripContract().getActiveTrip?.()||{},activeTripId=tripId(trip);validatePreparedInput(actionCore().getAction(request.actionId),request.input,{...request.context,tripId:activeTripId});const projection=await journeyContract().reads.snapshot({trip});const today=new Date().toISOString().slice(0,10),requestedDate=clean(request.input?.date),includePlanningDetails=request.input?.includePlanningDetails===true;
  const orderedDays=[...(projection?.days||[])].sort((left,right)=>left.date===today?-1:right.date===today?1:String(left.date).localeCompare(String(right.date)));
  const populatedDays=orderedDays.filter(day=>(day.entries||[]).length>0);
  const selected=requestedDate?[orderedDays.find(day=>String(day.date)===requestedDate)||{date:requestedDate,label:'',entries:[],conflicts:[]}]:[(populatedDays[0]||orderedDays[0])].filter(Boolean);
  const days=selected.map(day=>({...day,entries:(day.entries||[]).map(entry=>{const tripPlaceId=clean(entry.tripPlaceId||entry.place?.tripPlaceId),providerPlaceId=clean(entry.providerPlaceId||entry.place?.providerPlaceId),actions=[...(entry.actions||[])],previous=localDateTimeHint(entry.startAt);if(tripPlaceId&&!actions.some(action=>action?.actionId==='places.place.unplan'))actions.push({actionId:'places.place.unplan',label:'Aus Timeline entfernen',payload:{tripId:entry.tripId||activeTripId,tripPlaceId,providerPlaceId:providerPlaceId||undefined,placeId:entry.placeId||entry.place?.placeId||undefined,placeType:entry.entityType||'place',name:entry.title,date:previous.date,time:previous.time,fields:entry.startAt?{planned_at:entry.startAt}:['planned_at'],readbackRequired:true}});return{...entry,actions}}),conflictCount:Number(day.conflictCount??day.conflicts?.length??0)}));
  const entries=days.reduce((count,day)=>count+(day.entries?.length||0),0);
  const reads=journeyContract().reads||{},routeEnabled=root.LuviaFeatureFlagRegistry?.isEnabled?.('intelligence.s16-03-route-uncertainty')!==false,rehearsalEnabled=root.LuviaFeatureFlagRegistry?.isEnabled?.('intelligence.s16-04-day-rehearsal')!==false,recoveryEnabled=root.LuviaFeatureFlagRegistry?.isEnabled?.('intelligence.s16-05-live-disruption-recovery')!==false,twinEnabled=root.LuviaFeatureFlagRegistry?.isEnabled?.('intelligence.s16-08-destination-digital-twin')!==false;
  const routeUncertainty=includePlanningDetails&&routeEnabled&&typeof reads.routeUncertainty==='function'?days.flatMap(day=>(day.entries||[]).slice(1).map((entry,index)=>{const previous=day.entries[index],projection=reads.routeUncertainty({baseMinutes:entry.transferMinutes||previous?.transferMinutes||20,travelSpeed:'balanced',providerConfidence:entry.routeConfidence,evidence:entry.routeEvidence||[]});return{date:day.date,from:previous?.title||'Vorheriger Reisemoment',to:entry.title||'Nächster Reisemoment',...projection}})):[];
  const rehearsals=includePlanningDetails&&rehearsalEnabled&&typeof reads.rehearseDay==='function'?days.map(day=>({date:day.date,...reads.rehearseDay({entries:day.entries||[],travelSpeed:'balanced'})})):[];
  const allEntries=days.flatMap(day=>day.entries||[]);
  const scopedDisruptions=(projection?.disruptions||[]).filter(disruption=>!disruption?.date||days.some(day=>day.date===disruption.date)||(disruption?.entryIds||[]).some(id=>allEntries.some(entry=>String(entry.id)===String(id))));
  const disruptionRecovery=includePlanningDetails&&recoveryEnabled&&typeof reads.disruptionRecovery==='function'?reads.disruptionRecovery({entries:allEntries,disruptions:scopedDisruptions}):null;
  let savedPlaces=[];if(includePlanningDetails&&twinEnabled&&typeof placesContract().reads?.listSaved==='function')try{const saved=await placesContract().reads.listSaved({tripId:tripId(trip)});savedPlaces=Array.isArray(saved)?saved:saved?.places||[]}catch{}
  const destinationTwin=includePlanningDetails&&twinEnabled&&typeof reads.destinationTwin==='function'?reads.destinationTwin({places:savedPlaces,entries:allEntries,generatedAt:new Date().toISOString()}):null;
  const dateLabel=displayDate(days[0]?.date||requestedDate),momentLabel=entries===1?'1 Reisemoment':`${entries} Reisemomente`;
  return actionCore().normalizeResult({kind:'day_plan',owner:'journey',contractId:'journey.v1',title:days.length?`Dein Tagesplan${dateLabel?` am ${dateLabel}`:''}`:'Dein Reisetag ist noch offen',message:days.length?entries?`${momentLabel} ${entries===1?'ist':'sind'} an diesem Tag geplant.`:'Für diesen Tag ist noch nichts geplant.':'Luvia kann gemeinsam mit euch erste Reisemomente strukturieren.',items:days,actions:[{actionId:'journey.day.open',label:days.length?'Tag bearbeiten':'Tag planen',payload:{tripId:tripId(trip),date:days[0]?.date||today,mode:'schedule'}}],evidence:{journeyOwner:true,tripId:tripId(trip),summary:{...(projection?.summary||{}),visibleEntryCount:entries,visibleDate:days[0]?.date||null},routeUncertainty,rehearsals,disruptionRecovery,destinationTwin,offlineCrdt:{enabled:root.LuviaFeatureFlagRegistry?.isEnabled?.('intelligence.s16-07-offline-crdt-plan')===true,reserved:true,owner:'journey',ownerSyncRequired:true},planningDetailsIncluded:includePlanningDetails,probabilityClaim:false,automaticMutation:false},meta:{actionId:request.actionId,query:request.input?.query||'',compact:true,requestedDate:requestedDate||null,planningDetailsIncluded:includePlanningDetails,slices:['S16.03','S16.04','S16.05','S16.08']}});
}
async function tripResult(request){
  validatePreparedInput(actionCore().getAction(request.actionId),request.input,request.context||{});const contract=tripContract(),active=contract.getActiveTrip?.()||contract.reads?.getActiveTrip?.()||null;const trips=contract.listTrips?.()||contract.reads?.listTrips?.()||[];
  const items=trips.map(trip=>({...trip,active:String(trip.id)===String(active?.id),actions:String(trip.id)===String(active?.id)?[]:[{actionId:'trip.active.select',label:'Diese Reise öffnen',payload:{tripId:trip.id,name:trip.title}}]}));
  return actionCore().normalizeResult({kind:'trip_collection',owner:'trip',contractId:'trip.v1',title:items.length?'Deine Reisen':'Noch keine Reise verfügbar',message:items.length?'Wähle die Reise aus, mit der du weiterarbeiten möchtest. Luvia verwendet danach deren Ziel, Zeitraum und bestätigte Vorlieben.':'Erstelle zuerst eine Reise in Luvia.',items,evidence:{activeTripId:active?.id||null,count:items.length},meta:{actionId:request.actionId}});
}
async function bookingResult(request){
  const trip=tripContract().getActiveTrip?.()||{},activeTripId=tripId(trip);validatePreparedInput(actionCore().getAction(request.actionId),request.input,{...request.context,tripId:activeTripId});const rows=await bookingContract().reads.listForTrip(activeTripId);
  const items=await Promise.all((Array.isArray(rows)?rows:rows?.bookings||[]).map(async booking=>{
    const id=booking.id||booking.bookingId||booking.booking_id,actions=[];let lifecycle=null;
    if(id&&typeof bookingContract().reads.lifecycleCapabilities==='function')try{lifecycle=await bookingContract().reads.lifecycleCapabilities({booking})}catch{}
    if(id&&(lifecycle?.actions?.modify?.available||lifecycle?.actions?.message?.available||lifecycle?.actions?.manageExternal?.available))actions.push({actionId:'navigation.route.open',label:'Buchung verwalten',payload:{route:'bookings',source:'ai-booking-card',bookingId:id}});
    if(id&&lifecycle?.actions?.cancel?.available)actions.push({actionId:'booking.reservation.cancel',label:'Stornierung prüfen',payload:{bookingId:id,tripId:tripId(trip),name:booking.venueName||booking.restaurantName||booking.title}});
    return{...booking,actions,lifecycle};
  }));
  return actionCore().normalizeResult({kind:'booking_collection',owner:'booking',contractId:'booking.v1',title:items.length?'Buchungen dieser Reise':'Noch keine Buchung vorhanden',message:items.length?'Hier siehst du den aktuellen Stand deiner Buchungen. Änderungen und Stornierungen werden immer noch einmal einzeln bestätigt.':'Neue Reservierungen startest du bei einem konkreten Ort.',items,evidence:{tripId:tripId(trip),count:items.length,requestedIntent:request.input?.intent||'list'},meta:{actionId:request.actionId}});
}
async function memoryResult(request){
  validatePreparedInput(actionCore().getAction(request.actionId),request.input,request.context||{});const activeTrip=tripContract().getActiveTrip?.()||tripContract().reads?.getActiveTrip?.()||{};const rows=await memoryContract().reads.listStories({query:request.input?.query||'',tripId:tripId(activeTrip)});const items=(Array.isArray(rows)?rows:[]).map(story=>({...story,actions:[]}));
  return actionCore().normalizeResult({kind:'memory_collection',owner:'memory',contractId:'memory.v1',title:items.length?'Eure Reisegeschichten':'Noch keine kuratierte Geschichte',message:items.length?'Diese Geschichten wurden bereits für eure Reise gespeichert.':'Luvia kann aus ausgewählten Erinnerungen einen Entwurf vorbereiten, den du vor dem Speichern prüfst.',items,evidence:{count:items.length,memoryTruth:true,mediaTruth:false},meta:{actionId:request.actionId}});
}
async function preferenceResult(request){
  validatePreparedInput(actionCore().getAction(request.actionId),request.input,request.context||{});const contract=identityContract();const direct=contract.getPreferences?.('self');const preferences=await Promise.resolve(direct??contract.reads?.getPreferences?.('self')??{});
  return actionCore().normalizeResult({kind:'preference_summary',owner:'identity',contractId:'identity.v1',title:'Deine bestätigten Vorlieben',message:'Ich berücksichtige nur Vorlieben, die du selbst bestätigt hast. Vermutungen werden nicht als deine Präferenzen gespeichert.',summary:preferences,actions:[],evidence:{scope:'self',explicitPreferences:true,inferredSignals:false},meta:{actionId:request.actionId}});
}
async function staySearchResult(request){
  const trip=tripContract().getActiveTrip?.()||tripContract().reads?.getActiveTrip?.()||{},destinationValue=trip?.destination&&typeof trip.destination==='object'?trip.destination:{},participants=Array.isArray(trip?.participants)?trip.participants:[];
  const input={...request.input,tripId:request.input?.tripId||tripId(trip),destination:request.input?.destination||destination(trip),checkIn:request.input?.checkIn||trip?.startDate||trip?.start_date||null,checkOut:request.input?.checkOut||trip?.endDate||trip?.end_date||null,adults:request.input?.adults||Math.max(1,participants.length||1),children:request.input?.children||0,childAges:request.input?.childAges||[],rooms:request.input?.rooms||1,currency:request.input?.currency||'EUR',latitude:request.input?.latitude??destinationValue.latitude??destinationValue.lat??null,longitude:request.input?.longitude??destinationValue.longitude??destinationValue.lng??null,cityCode:request.input?.cityCode||destinationValue.cityCode||destinationValue.iataCode||null,providerDestinationIds:request.input?.providerDestinationIds||destinationValue.providerDestinationIds||{},providerHotelIds:request.input?.providerHotelIds||{}};
  validatePreparedInput(actionCore().getAction(request.actionId),input,{...request.context,tripId:tripId(trip)});
  const decision=await bookingContract().reads.searchStayOffers(input),hotels=decision?.hotels||[];
  const items=hotels.map(hotel=>{const offer=hotel.bestAvailableTotal||null,canOpen=Boolean(offer?.available===true&&offer?.comparable===true&&offer?.isLive===true&&offer?.source==='provider_api'&&offer?.providerId&&offer?.providerHotelId&&offer?.offerId&&(offer?.providerRateKey||offer?.providerOfferId)&&offer?.bookingUrlVerified===true&&offer?.bookingUrlPropertyId===offer?.providerHotelId&&offer?.deepLink);return{id:hotel.propertyKey,title:hotel.propertyName,status:'available',propertyKey:hotel.propertyKey,offerCount:hotel.offerCount,totalPrice:offer?.price?.total,currency:offer?.price?.currency,refundable:hotel.bestFlexibleOffer?.cancellation?.refundable===true,provider:offer?.providerId,priceSource:offer?.source,actions:canOpen?[{actionId:'booking.stay.offer.open',label:'Dieses Angebot öffnen',payload:{tripId:input.tripId,offer,query:input}}]:[]}});
  const mode=decision?.productMode||'fit_only',live=decision?.claims?.priceRankingAvailable===true,providerCount=Number(decision?.claims?.liveProviderCount)||0;
  return actionCore().normalizeResult({kind:'booking_collection',owner:'booking',contractId:'booking.v1',title:live?`${items.length} Hotels mit belegten Livepreisen`:'Noch kein freigeschalteter Livepreis',message:live?providerCount>1?'Die vollständigen Gesamtpreise stammen aus mehreren verbundenen Quellen. „Am günstigsten“ gilt nur für diese aktuell abgefragten Quellen.':'Der Preis stammt aus einer verbundenen Quelle. Ein Marktvergleich ist damit noch nicht möglich.':'Die Hotelsuche bleibt im Passungsmodus, bis mindestens ein Preis-Provider verbunden ist. Affiliate-Links werden nicht als Preise ausgegeben.',items,evidence:{actionId:request.actionId,productMode:mode,priceRankingAvailable:live,crossSourcePriceComparisonAvailable:decision?.claims?.crossSourcePriceComparisonAvailable===true,bestMarketPrice:false,coverage:decision?.coverage||{},search:decision?.search||{},automaticMutation:false,affiliateLinkAloneCannotRankPrice:true,commissionExcludedFromRanking:true},meta:{actionId:request.actionId,compact:true,bookingType:'hotel'}});
}
async function verifiedEventResult(request,options={}){
  const trip=tripContract().getActiveTrip?.()||tripContract().reads?.getActiveTrip?.()||{};validatePreparedInput(actionCore().getAction(request.actionId),request.input,{...request.context,tripId:tripId(trip)});const contract=verifiedEventContract(),collection=await contract.reads.listVerified({query:request.input?.query||'',from:request.input?.from||null,to:request.input?.to||null,destination:destination(trip),tripId:tripId(trip),limit:request.input?.limit||12,now:options.now});
  if(collection?.status==='provider-unavailable')throw runtimeError('VERIFIED_EVENT_PROVIDER_UNAVAILABLE','Es ist gerade keine verifizierte Event-Quelle erreichbar. Luvia zeigt deshalb keine erfundenen Events.');
  const items=(collection?.visible||[]).map(event=>({...event,actions:[]})),graph=contract.reads.buildGraph({claims:items,tripId:tripId(trip),generatedAt:options.now||new Date().toISOString()}),brush=contract.reads.brushGraph(graph,{from:request.input?.from,to:request.input?.to,bounds:request.input?.bounds}),culturalContext=items.map(event=>contract.reads.culturalContext({event,documents:options.culturalDocuments||[],locale:options.locale||'de-DE'})),serendipity=contract.reads.serendipityWindow({events:items,openWindow:options.serendipityWindow||{},routeUncertainty:options.eventRouteUncertainty||[]}),groupTaste=contract.reads.groupTasteDivergence(options.groupEventContext||{}),weatherSafe=contract.reads.weatherSafeSubstitution({weather:options.weatherEvidence||{},originalEvent:items[0],alternatives:items.slice(1),now:options.now}),scheduleReconciliation=contract.reads.reconcileSchedule({claims:items,entries:options.eventJourneyEntries||[],bookings:options.eventBookings||[]});
  return actionCore().normalizeResult({kind:'event_collection',owner:'intelligence',contractId:'intelligence.verified-events.v1',title:items.length?`${items.length} bestätigte Veranstaltungen`:'Keine aktuell bestätigte Veranstaltung',message:items.length?'Zeit, Status, Ort und Quelle wurden geprüft. Hinzufügen, reservieren oder als Erinnerung speichern startet erst nach deiner Auswahl.':'Für diesen Wunsch habe ich gerade keine Veranstaltung mit vollständig bestätigter Quelle, Zeit und aktuellem Status gefunden.',items,evidence:{actionId:request.actionId,counts:collection?.counts||{},sourceFailures:collection?.sourceFailures||[],sourceGateway:collection?.sourceGateway||false,graph,brush,culturalContext,serendipity,groupTaste,weatherSafe,scheduleReconciliation,syntheticEventCount:0,automaticMutation:false,slices:['S16.09','S16.10','S16.11','S16.12']},meta:{actionId:request.actionId,uspKind:'verified-events'}});
}
const readHandlers=Object.freeze({'places.restaurant.recommend':restaurantResult,'places.discovery.recommend':placeDiscoveryResult,'events.verified.read':verifiedEventResult,'journey.day.read':dayResult,'trip.active.list':tripResult,'booking.trip.read':bookingResult,'booking.stay.search':staySearchResult,'memory.library.read':memoryResult,'identity.preferences.read':preferenceResult});

async function navigationResult(request,options={}){
  const prepared=prepare(request.actionId,request.input,{userGesture:true,surface:options.surface||'global-chat'});
  return execute(request.actionId,request.input,{ledgerId:prepared.ledgerId,userGesture:true,surface:options.surface||'global-chat'});
}
const runtimeHandlers=Object.freeze({...readHandlers,'navigation.route.open':navigationResult});

function compiledRoutes(message,compiled){
  if(compiled?.contractId!=='intelligence.travel-orchestration.v1'||!Array.isArray(compiled.intents))return null;
  // A structured Trip select/switch intent is a chat-native read first.  Do not
  // let the older navigation recognizer turn it into a module jump and hide the
  // selectable trips. Explicit module-opening requests still navigate normally.
  const tripSelectionRead=compiled.intents.some(intent=>intent.domain==='trip'&&intent.mode==='read'&&(['switch','select'].includes(clean(intent.semanticOperation).toLowerCase())||/\b(?:wechsel|auswähl|auswaehl|select|switch)\w*/i.test(intent.clause||message)));
  const directNavigation=tripSelectionRead?null:actionCore().routeIntents?.(message)?.find(route=>route.actionId==='navigation.route.open');if(directNavigation)return[directNavigation];
  const routes=[],hints=mutationHints(compiled),push=(actionId,input={},query=message)=>{if(actionId&&!routes.some(route=>route.actionId===actionId)){const routed={query:query||message,...input};if(actionId.startsWith('places.'))routed.mutationHints=hints;routes.push({actionId,input:routed})}};
  for(const intent of compiled.intents){
    const query=intent.clause||message;
    if(intent.domain==='places')push(intent.categoryHints?.length===1&&intent.categoryHints[0]==='food'?'places.restaurant.recommend':'places.discovery.recommend',{category:intent.categoryHints?.[0]||'places',categories:intent.categoryHints?.length?intent.categoryHints:['places'],limit:3,destinationName:intent.entityHints?.destinationName||null,explicitPreferencePatch:intent.entityHints?.preferencePatch||{},spatialConstraints:root.LuviaGlobalPlaceContracts?.spatialIntent?.(query)||null},query);
    else if(intent.domain==='events')push('events.verified.read',{limit:12,from:intent.temporalHint?.date?`${intent.temporalHint.date}T00:00:00Z`:null,to:intent.temporalHint?.date?`${intent.temporalHint.date}T23:59:59Z`:null},query);
    else if(intent.domain==='booking'){
      const semanticTarget=clean(intent.entityHints?.bookingType||intent.entityHints?.targetType||intent.entityHints?.placeType||intent.entityHints?.category).toLowerCase(),hotelIntent=['hotel','lodging','accommodation','unterkunft'].includes(semanticTarget)||/\b(?:hotel|hotels|unterkunft|unterkünfte|unterkuenfte|hostel|pension|resort|übernachten|uebernachten)\b/i.test(query);
      const requirementRead=intent.mode==='read'&&(intent.entityHints?.bookingRequirementRead===true||intent.semanticOperation==='check_requirement'),requirementCategory=/\b(?:nachtclubs?|nachtleben|clubs?|bars?)\b/i.test(query)?'nightlife':/\b(?:restaurant|café|cafe|essen)\b/i.test(query)?'food':/\b(?:museum|kultur|galerie|theater)\b/i.test(query)?'culture':/\b(?:aktivität|aktivitaet|attraktion|tour|minigolf)\b/i.test(query)?'activity':'places';
      if(requirementRead){const targetName=clean(intent.entityHints?.targetName);push('places.discovery.recommend',{query:targetName||query,category:requirementCategory,categories:[requirementCategory],limit:3,strictPlaceType:requirementCategory==='food'?'restaurant':null,bookingRequirementRead:true,targetName:targetName||null,destinationName:intent.entityHints?.destinationName||null,explicitPreferencePatch:{},spatialConstraints:root.LuviaGlobalPlaceContracts?.spatialIntent?.(query)||null},query)}
      else if(hotelIntent&&intent.mode!=='propose-write')push('booking.stay.search',{destination:intent.entityHints?.destination||intent.entityHints?.destinationName||null,checkIn:intent.entityHints?.checkIn||intent.temporalHint?.from||null,checkOut:intent.entityHints?.checkOut||intent.temporalHint?.to||null,adults:intent.entityHints?.adults||intent.entityHints?.partySize||intent.partyHint?.adults||intent.partyHint?.partySize||null,children:intent.entityHints?.children??intent.partyHint?.children??0,childAges:intent.entityHints?.childAges||intent.partyHint?.childAges||[],rooms:intent.entityHints?.rooms||intent.partyHint?.rooms||1,currency:intent.entityHints?.currency||'EUR',cityCode:intent.entityHints?.cityCode||null,latitude:intent.entityHints?.latitude??intent.spatialHint?.latitude??null,longitude:intent.entityHints?.longitude??intent.spatialHint?.longitude??null,providerDestinationIds:intent.entityHints?.providerDestinationIds||{},providerHotelIds:intent.entityHints?.providerHotelIds||{}},query);
      else push('booking.trip.read',{intent:intent.mode==='propose-write'?'prerequisite-read':'list'},query);
    }
    else if(intent.domain==='journey')push('journey.day.read',{date:intent.temporalHint?.date||null,includePlanningDetails:/\b(?:warum|route|weg|wege|transfer|unsicherheit|st[oö]rung|rehearsal|tagesprobe|probe|realistisch|disruption|digital\s+twin)\b/i.test(query)},query);
    else if(intent.domain==='trip')push('trip.active.list',{},query);
    else if(intent.domain==='memory')push('memory.library.read',{},query);
    else if(intent.domain==='identity'||intent.domain==='privacy')push('identity.preferences.read',{},query);
  }
  return routes;
}
function planningTraceResult(compiled,requests,results){
  if(root.LuviaFeatureFlagRegistry?.isEnabled?.('intelligence.s16-01-explainable-planning-trace')===false)return null;
  const contract=root.LuviaIntelligenceContractV1||root.LuviaIntelligenceContract;if(typeof contract?.reads?.planningTrace!=='function')return null;
  const now=new Date().toISOString(),evidence=[],decisions=[];
  for(const request of requests){
    const result=results.find(item=>(item.evidence?.actionId||item.meta?.actionId)===request.actionId),failed=result?.kind==='error',evidenceId=`owner:${request.actionId}`;
    const observedAt=result?.evidence?.observedAt||null,providerStatus=result?.evidence?.providerDiagnostics?.status||null,verified=Boolean(result?.evidence?.verificationStatus==='verified'||result?.evidence?.journeyOwner===true||result?.evidence?.providerFactsAuthoritative===true&&result.items?.length&&['ready','partial'].includes(providerStatus));
    if(result&&!failed)evidence.push({id:evidenceId,source:request.ownerContract,kind:result.kind,observedAt,supports:[request.actionId],verified});
    decisions.push({id:`decision:${request.actionId}`,owner:request.owner,action:request.actionId,reasonCodes:failed?['owner-read-failed',result.evidence?.code||'unknown-owner-read-failure']:verified?['owner-read-projection','owner-evidence-present']:['owner-read-projection','freshness-or-verification-unknown'],evidenceIds:[evidenceId],requiresConfirmation:false,status:failed?'failed':'completed'});
  }
  const trace=contract.reads.planningTrace({compiled,evidence,decisions,now});
  const consumerReasons=results.filter(result=>result?.kind==='place_collection').flatMap(result=>(result.items||[]).slice(0,4).map(item=>{const source=clean(item.provider)||Object.keys(item.providerRefs||{}).join(' + ')||'Places',facts=[],distance=Number(item.distanceMeters),reviews=Number(item.userRatingCount),type=clean(item.primaryTypeLabel||item.primary_type_label||item.requestCategory||item.primaryType);if(type)facts.push(`Als ${type.replace(/[_-]+/g,' ')} geführt.`);if(Number.isFinite(distance)&&distance>=0)facts.push(distance<1000?`${Math.round(distance)} m vom Reiseziel-Zentrum entfernt.`:`${(distance/1000).toFixed(1).replace('.',',')} km vom Reiseziel-Zentrum entfernt.`);if(Number(item.rating)>0)facts.push(`${Number(item.rating).toFixed(1).replace('.',',')} von 5${reviews>0?` bei ${reviews.toLocaleString('de-DE')} Bewertungen`:''}.`);if(item.openNow===true)facts.push('Laut Quelle aktuell geöffnet.');else if(item.openNow===false)facts.push('Laut Quelle aktuell geschlossen.');if(item.spatialConstraint?.state==='confirmed')facts.push('Die gewünschte Lage ist mit den Owner-Koordinaten bestätigt.');return{label:clean(item.name)||'Ort',source,facts:[...new Set(facts)].slice(0,4)}}));
  return actionCore().normalizeResult({kind:'message',owner:'intelligence',contractId:'intelligence.v1',title:'Auswahl erklärt',message:'Die sichtbaren Gründe stammen aus den belegten Owner-Fakten.',evidence:{planningTrace:trace,consumerReasons},meta:{traceOnly:true,slice:'S16.01'}});
}
function contextGateResult(compiled,options={}){
  const intents=compiled?.intents||[];if(!intents.some(intent=>['privacy','device-position'].includes(intent.domain))||root.LuviaFeatureFlagRegistry?.isEnabled?.('intelligence.s16-02-on-device-context-gate')===false)return null;
  const purpose=clean(options.contextPurpose)||(/\broute|weg|transfer|ankunft\b/i.test(intents.map(intent=>intent.clause).join(' '))?'route-planning':'places-ranking'),contract=root.LuviaIntelligenceContractV1||root.LuviaIntelligenceContract;if(typeof contract?.reads?.gateContext!=='function')return null;
  const gate=contract.reads.gateContext({purpose,grant:options.contextGrant||{},context:options.positionContext||{},background:options.background===true,now:options.now||new Date().toISOString()});
  return actionCore().normalizeResult({kind:'message',owner:'intelligence',contractId:'intelligence.context-gate.v1',title:gate.allowed?'Kontext für diesen Wunsch freigegeben':'Standort bleibt gesperrt',message:gate.allowed?`Luvia darf für ${purpose} einmalig ${gate.precision==='precise'?'präzisen':'groben'} Gerätekontext verwenden.`:'Ohne gültige, zweckgebundene Freigabe verwendet Luvia keine Geräteposition. Du kannst den Ort immer manuell nennen.',evidence:{contextGate:{allowed:gate.allowed,purpose:gate.purpose,precision:gate.precision||gate.decisionReceipt?.precision||'coarse',expiresAt:gate.expiresAt||gate.decisionReceipt?.expiresAt||null,reason:gate.reason||null,persist:false,coordinatesIncluded:false}},meta:{uspKind:'context-gate',slice:'S16.02'}});
}
async function causalFeedbackResults(message,compiled,options={}){
  if(!(compiled?.intents||[]).some(intent=>intent.domain==='feedback')||root.LuviaFeatureFlagRegistry?.isEnabled?.('intelligence.s16-06-causal-feedback-learning')===false)return[];
  const contract=root.LuviaIntelligenceContractV1||root.LuviaIntelligenceContract;if(typeof contract?.reads?.causalFeedback!=='function')return[];
  const negative=/nicht\s+gefallen|schlecht|enttäuschend|enttaeuschend/i.test(message),feedback=options.feedbackContext||{},value=clean(feedback.value),projection=contract.reads.causalFeedback({explicit:true,confirmedOutcome:feedback.confirmedOutcome===true,outcome:negative?'disliked':'liked',signals:value&&feedback.evidenceId?[{feature:'travelInterests',value,effect:negative?-.05:.05,basis:'explicit-chat-feedback',evidenceId:feedback.evidenceId}]:[]});
  const results=[actionCore().normalizeResult({kind:'message',owner:'intelligence',contractId:'intelligence.causal-feedback.v1',title:projection.accepted?'Dein Feedback wurde verstanden':'Dein Profil bleibt unverändert',message:projection.accepted?'Ich habe daraus eine kleine Profilanpassung vorbereitet. Erst wenn du die Vorschau bestätigst, ändern sich deine Vorlieben.':'Zum Lernen brauche ich dein ausdrückliches Feedback zu einem Erlebnis, das wirklich stattgefunden hat.',evidence:{causalFeedback:projection},meta:{uspKind:'causal-feedback',slice:'S16.06'}})];
  if(!projection.accepted)return results;
  const current=await Promise.resolve(identityContract().getPreferences?.('self')??identityContract().reads?.getPreferences?.('self')??{}),existing=Array.isArray(current.travelInterests)?current.travelInterests:[],next=negative?existing.filter(item=>clean(item)!==value):[...new Set([...existing,value])];if(JSON.stringify(existing)===JSON.stringify(next))return results;
  results.push(prepare('identity.preferences.update',{patch:{travelInterests:next},source:'explicit-confirmed-outcome-feedback',evidenceId:feedback.evidenceId},{userGesture:true,surface:options.surface||'global-chat'}).result);return results;
}
async function runMessage(message,options={}){
  const compiled=options.compiledIntent||null;
  // A direct user gesture that names a registered Luvia area is deterministic
  // Navigation truth. Resolve it before an optional model/compiler result so a
  // blocked or conflicted AI interpretation cannot swallow "Öffne Places/Stays".
  const deterministicNavigation=actionCore().routeIntents?.(message)?.find(route=>route.actionId==='navigation.route.open')||null;
  if(compiled&&['blocked','conflicted'].includes(compiled.status)&&!deterministicNavigation)return actionCore().immutable({handled:false,results:[],routes:[],compiledStatus:compiled.status,clarificationRequired:true});
  if(compiled?.status==='compiled'){
    try{const preview=await semanticVisitMutationPreview(message,compiled,options);if(preview)return actionCore().immutable({handled:true,results:[preview],routes:[],error:false,multiIntent:false,compiledStatus:compiled.status,clarificationRequired:false})}catch(cause){return actionCore().immutable({handled:true,results:[actionCore().normalizeResult({kind:'error',owner:'places',title:'Besuchsänderung konnte nicht vorbereitet werden',message:cause?.message||'Der bestätigte Besuch konnte nicht eindeutig mit dem Places Visit Owner abgeglichen werden.',evidence:{actionId:(compiled.intents||[]).map(intent=>visitMutationAction(intent,message)).find(Boolean)||null,code:cause?.code||'AI_ACTION_PREPARE_FAILED',automaticMutation:false},meta:{retryable:true,consumerSafeCopy:true,readRecovery:{canRetry:true,query:options.sourceMessage||message}}})],routes:[],error:true,multiIntent:false,compiledStatus:compiled.status,clarificationRequired:false})}
    try{const preview=await semanticPlaceMutationPreview(message,compiled,options);if(preview)return actionCore().immutable({handled:true,results:[preview],routes:[],error:false,multiIntent:false,compiledStatus:compiled.status,clarificationRequired:false})}catch(cause){return actionCore().immutable({handled:true,results:[actionCore().normalizeResult({kind:'error',owner:'places',title:'Änderung konnte nicht vorbereitet werden',message:cause?.message||'Der genannte Ort konnte nicht eindeutig mit dem zuständigen Owner abgeglichen werden.',evidence:{actionId:(compiled.intents||[]).map(placeMutationAction).find(Boolean)||null,code:cause?.code||'AI_ACTION_PREPARE_FAILED',automaticMutation:false},meta:{retryable:true}})],routes:[],error:true,multiIntent:false,compiledStatus:compiled.status,clarificationRequired:false})}
    try{const preview=await semanticBookingPreview(message,compiled,options);if(preview)return actionCore().immutable({handled:true,results:[preview],routes:[],error:false,multiIntent:false,compiledStatus:compiled.status,clarificationRequired:false})}catch(cause){return actionCore().immutable({handled:true,results:[actionCore().normalizeResult({kind:'error',owner:'booking',title:'Buchung konnte nicht vorbereitet werden',message:cause?.message||'Die Buchung konnte nicht eindeutig und sicher mit dem Booking Owner abgeglichen werden.',evidence:{actionId:(compiled.intents||[]).map(bookingMutationAction).find(Boolean)||null,code:cause?.code||'AI_ACTION_PREPARE_FAILED',automaticMutation:false},meta:{retryable:true}})],routes:[],error:true,multiIntent:false,compiledStatus:compiled.status,clarificationRequired:false})}
  }
  const routes=deterministicNavigation?[deterministicNavigation]:compiledRoutes(message,compiled)||(actionCore().routeIntents?.(message)||[actionCore().routeIntent(message)].filter(Boolean)),contextResult=contextGateResult(compiled,options),feedbackResults=await causalFeedbackResults(message,compiled,options),preResults=[...(contextResult?[contextResult]:[]),...feedbackResults];if(!routes.length)return actionCore().immutable({handled:Boolean(preResults.length),results:preResults,routes:[],compiledStatus:compiled?.status||null,clarificationRequired:compiled?.status==='needs-clarification'});
  const requests=routes.map(route=>actionCore().createActionRequest(route.actionId,route.input,{surface:options.surface||'global-chat'})).filter(request=>actionCore().canAutoRun(request.actionId));if(!requests.length)return actionCore().immutable({handled:Boolean(preResults.length),results:preResults,routes});
  const results=[...preResults];let error=false;
  for(const request of requests){emit('read-started',{actionId:request.actionId});try{const handler=runtimeHandlers[request.actionId],result=handler?await handler(request,options):null;if(result){results.push(result);emit('read-completed',{actionId:request.actionId,resultKind:result.kind})}}catch(cause){error=true;results.push(actionCore().normalizeResult({kind:'error',owner:request.owner,title:`${request.owner} ist gerade nicht erreichbar`,message:cause?.message||'Der zuständige Luvia Core konnte diesen Teil der Anfrage nicht ausführen.',evidence:{actionId:request.actionId,code:cause?.code||'AI_ACTION_FAILED',ownerContract:request.ownerContract,automaticMutation:false},meta:{retryable:false,readRecovery:{kind:'owner-read',actionId:request.actionId,owner:request.owner,ownerContract:request.ownerContract,query:request.input?.query||message,canRetry:true,canRefine:true,noMutation:true}}}));emit('read-failed',{actionId:request.actionId,code:cause?.code||'AI_ACTION_FAILED'})}}
  const preferenceIntents=compiled?.status==='compiled'?(compiled.intents||[]).filter(intent=>intent.domain==='identity'&&intent.mode==='propose-write'&&!intent.missingInputs?.length&&Object.keys(intent.entityHints?.preferencePatch||{}).length):[];if(preferenceIntents.length){try{const current=await Promise.resolve(identityContract().getPreferences?.('self')??identityContract().reads?.getPreferences?.('self')??{}),patch={};for(const intent of preferenceIntents)for(const [field,value] of Object.entries(intent.entityHints.preferencePatch)){patch[field]=Array.isArray(value)?[...new Set([...(Array.isArray(current?.[field])?current[field]:[]),...(Array.isArray(patch[field])?patch[field]:[]),...value])]:value}const prepared=prepare('identity.preferences.update',{patch,source:'explicit-chat-request'},{userGesture:true,surface:options.surface||'global-chat'});results.push(prepared.result)}catch(cause){error=true;results.push(actionCore().normalizeResult({kind:'error',owner:'identity',title:'Vorlieben konnten nicht vorbereitet werden',message:cause?.message||'Identity konnte die bestätigbare Änderung nicht vorbereiten.',evidence:{actionId:'identity.preferences.update',code:cause?.code||'AI_ACTION_PREPARE_FAILED'},meta:{retryable:true}}))}}
  const traceResult=planningTraceResult(compiled,requests,results);if(traceResult)results.push(traceResult);
  return actionCore().immutable({handled:Boolean(results.length),results,routes:requests,error,multiIntent:requests.length>1,compiledStatus:compiled?.status||null,clarificationRequired:compiled?.status==='needs-clarification'});
}

function validatePreparedInput(definition,payload={},context={}){
  if(definition.id==='places.place.plan'&&!payload.fields?.planned_at)throw runtimeError('AI_ACTION_INPUT_REQUIRED','Für die Timeline fehlen ein eindeutiges Datum und eine Uhrzeit. Bitte nenne beides im Chat oder öffne den Journey-Planungsdialog.',{actionId:definition.id,missingInputs:['date','time']});
  if(definition.id==='places.place.plan'&&!payload.providerPlaceId&&!payload.tripPlaceId)throw runtimeError('AI_ACTION_INPUT_REQUIRED','Der zu planende Place besitzt keine verifizierte Owner-ID.',{actionId:definition.id,missingInputs:['providerPlaceId']});
  const validation=actionCore().validateActionInput?.(definition.id,payload,context);if(validation?.enforced&&!validation.valid){const missingInputs=validation.issues.filter(issue=>issue.code==='required').map(issue=>issue.path),messages={
    'navigation.route.open':'Der gewünschte App-Bereich ist nicht eindeutig oder nicht freigegeben. Es wurde keine fremde Seite geöffnet.',
    'places.place.plan':'Datum, Uhrzeit und Reise-Zeitzone passen nicht eindeutig zusammen. Bitte prüfe die Vorschau; es wurde nichts verändert.',
    'booking.place.open':'Der Ort ist nicht eindeutig mit einem verifizierten Anbieter verknüpft. Bitte lade ihn neu; es wurde nichts geöffnet.',
    'booking.restaurant.open':'Das Restaurant ist nicht eindeutig mit einem verifizierten Anbieter verknüpft. Bitte lade den Ort neu; es wurde nichts geöffnet.',
    'booking.stay.search':'Für belegte Hotelpreise fehlen noch Reisedaten, Belegung oder eine Provider-Zielkennung. Es wurde kein Preis erfunden.',
    'booking.trip.read':'Wähle zuerst eine Reise aus, damit ich ihre Buchungen sicher laden kann.',
    'booking.reservation.create':'Für die Buchungsanfrage fehlen noch ein eindeutiger Ort, Zeitpunkt oder die Personenzahl. Es wurde nichts gesendet.',
    'booking.reservation.modify':'Nenne die konkrete Buchung und die gewünschte Änderung. Es wurde nichts geändert.',
    'booking.reservation.cancel':'Die zu stornierende Buchung ist nicht eindeutig. Es wurde nichts storniert.',
    'journey.day.read':'Wähle zuerst eine Reise und nenne bei Bedarf ein gültiges Datum. Der Tagesplan wurde nicht geladen.',
    'journey.day.open':'Der zu bearbeitende Reisetag ist nicht eindeutig. Es wurde kein Planungsdialog geöffnet.',
    'journey.entry.schedule':'Der Timeline-Moment, sein neuer Zeitpunkt oder der geprüfte Owner-Stand fehlt. Es wurde nichts geändert.',
    'journey.entry.remove':'Der Timeline-Moment oder sein geprüfter Owner-Stand fehlt. Es wurde nichts entfernt.',
    'journey.entry.restore':'Der Wiederherstellungsbeleg oder sein geprüfter Owner-Stand fehlt. Es wurde nichts wiederhergestellt.',
    'journey.visit.update':'Der bestätigte Besuch, sein neuer Beginn oder der geprüfte Places-Owner-Stand fehlt. Es wurde nichts geändert.',
    'journey.visit.remove':'Der bestätigte Besuch oder sein geprüfter Places-Owner-Stand fehlt. Es wurde nichts entfernt.',
    'journey.visit.restore':'Der Recovery-Beleg des bestätigten Besuchs oder sein geprüfter Places-Owner-Stand fehlt. Es wurde nichts wiederhergestellt.',
    'trip.active.list':'Die Reise-Anfrage ist ungültig. Es wurden keine Reisedaten geladen.',
    'trip.active.select':'Die Zielreise ist nicht eindeutig. Die aktive Reise blieb unverändert.',
    'trip.update.details':'Nenne die konkrete Reise und mindestens eine gültige Änderung. Es wurde nichts geändert.',
    'places.restaurant.recommend':'Der Restaurantwunsch ist nicht eindeutig oder enthält ungültige Filter. Es wurden keine Places-Daten geladen.',
    'places.discovery.recommend':'Der Ortswunsch ist nicht eindeutig oder enthält ungültige Filter. Es wurden keine Places-Daten geladen.',
    'events.verified.read':'Der Veranstaltungswunsch oder Zeitraum ist nicht eindeutig. Es wurden keine Eventdaten geladen.',
    'memory.library.read':'Die Erinnerungssuche ist ungültig. Es wurden keine Geschichten geladen.',
    'memory.story.save':'Die Geschichte ist leer oder enthält ungültige Angaben. Es wurde nichts gespeichert.',
    'identity.preferences.read':'Die Anfrage an dein Profil ist ungültig. Es wurden keine Vorlieben geladen.',
    'identity.preferences.update':'Nenne mindestens eine konkrete gültige Profiländerung. Es wurde nichts gespeichert.'
  },message=messages[definition.id]||'Der ausgewählte Ort ist für diese Änderung nicht eindeutig mit der aktiven Reise verknüpft. Bitte lade den Ort neu; es wurde nichts verändert.';throw runtimeError(missingInputs.length?'AI_ACTION_INPUT_REQUIRED':'AI_ACTION_INPUT_CONFLICT',message,{actionId:definition.id,schemaId:validation.schemaId,missingInputs,inputIssues:validation.issues})}
  return payload;
}

function prepare(actionId,payload={},options={}){
  const definition=actionCore().getAction(actionId);if(!definition)missing(actionId);
  actionId=definition.id;
  if(definition.effect!=='READ'&&options.userGesture!==true)throw runtimeError('INTELLIGENCE_USER_GESTURE_REQUIRED','Die Aktion muss durch eine direkte Nutzerauswahl vorbereitet werden.',{actionId});
  if(!operationAvailable(definition))throw runtimeError('AI_ACTION_BINDING_UNAVAILABLE',`Für ${actionId} ist kein erreichbares Owner Binding registriert.`,{actionId,owner:definition.owner});
  const preparedPayload=definition.id==='trip.active.select'&&!payload.previousTripId?{...payload,previousTripId:tripId(tripContract().getActiveTrip?.()||tripContract().reads?.getActiveTrip?.()||{})}:payload;
  if(['trip.active.select','trip.update.details'].includes(definition.id)){const contract=tripContract(),trips=contract.listTrips?.()||contract.reads?.listTrips?.()||[];if(preparedPayload.tripId&&trips.length&&!trips.some(trip=>String(trip.id||trip.tripId)===String(preparedPayload.tripId)))throw runtimeError('AI_ACTION_INPUT_CONFLICT','Die angegebene Reise ist nicht in deinen verfügbaren Reisen enthalten. Es wurde nichts verändert.',{actionId:definition.id,tripId:preparedPayload.tripId,inputIssues:[{code:'owner-reference',path:'tripId',message:'Die Zielreise ist für diesen Owner nicht belegt.'}]})}
  const timeZone=runtimeTimeZone(options.timeZone);validatePreparedInput(definition,preparedPayload,{surface:options.surface||'global-chat',tripId:preparedPayload.tripId||null,locale:options.locale||null,timeZone});
  const correlationId=clean(options.correlationId)||newId('corr');const idempotencyKey=clean(options.idempotencyKey)||newId(`idem-${actionId.replace(/[^a-z0-9]+/gi,'-')}`);const requestedAt=new Date().toISOString();
  const envelope=actionCore().createExecutionEnvelope(actionId,ledgerPayload(definition,preparedPayload),{surface:options.surface||'global-chat',tripId:preparedPayload.tripId||null,locale:options.locale||null,timeZone},{idempotencyKey,correlationId,requestedAt,source:options.surface||'global-chat'});
  const entry=ledger.create({actionId,owner:definition.owner,ownerContract:definition.ownerContract,effect:definition.effect,risk:definition.risk,confirmation:definition.confirmation,reversible:definition.reversible,idempotencyKey,correlationId,payload:envelope.input,reference:previewPayload(envelope.input)});
  const expiresAt=new Date(Date.now()+CONFIRMATION_TTL_MS).toISOString();pending.set(entry.id,{definition,envelope,ownerInput:actionCore().immutable(preparedPayload),expiresAt});
  if(definition.confirmation==='EXPLICIT'){
    ledger.requireConfirmation(entry.id);
    const result=actionCore().createConfirmation({actionId,ledgerId:entry.id,correlationId,idempotencyKey,expiresAt,preview:confirmationPreview(definition,preparedPayload)});
    emit('confirmation-required',{actionId,owner:definition.owner,risk:definition.risk,ledgerId:entry.id});return actionCore().immutable({requiresConfirmation:true,ledgerId:entry.id,correlationId,idempotencyKey,expiresAt,result});
  }
  return actionCore().immutable({requiresConfirmation:false,ledgerId:entry.id,correlationId,idempotencyKey,expiresAt:null,result:null});
}

async function invokeOwner(definition,payload,idempotencyKey){
  let result=null,message='Aktion wurde ausgeführt.',status='completed';
  if(definition.id==='navigation.route.open'){const intent=navigationContract().createIntent(payload.route,{source:payload.source||'global-chat'});root.dispatchEvent?.(new CustomEvent('luvia:navigate-request',{detail:{view:intent.route,intent}}));result={opened:true,route:intent.route};message=`${intent.label||'Der gewünschte Bereich'} ist geöffnet.`;status='opened'}
  else if(definition.id==='places.place.favorite'){result=await placesContract().commands.favorite({...payload,placeType:payload.placeType||'restaurant'});return reconcilePlaceMutation(definition.id,payload,result,'Der Ort wurde als Favorit gespeichert.')}
  else if(definition.id==='places.place.unfavorite'){result=await placesContract().commands.unfavorite({...payload,placeType:payload.placeType||'restaurant'});return reconcilePlaceMutation(definition.id,payload,result,'Der Ort wurde aus deinen Favoriten entfernt.')}
  else if(definition.id==='places.place.plan'){
    const linked=payload.tripPlaceId?payload:await placesContract().commands.importPlace(payload.providerPlaceId,{tripId:payload.tripId,type:payload.placeType,tripPlace:{status:'planned',isFavorite:false}}),resolved={...payload,placeId:linked.placeId||linked.id||payload.placeId,tripPlaceId:linked.tripPlaceId||payload.tripPlaceId};
    result=await placesContract().commands.plan(resolved);await placesContract().commands.updateLifecycle?.(resolved.tripPlaceId,'planned',{}, {tripId:resolved.tripId});result={...(result||{}),placeId:resolved.placeId,tripPlaceId:resolved.tripPlaceId,providerPlaceId:resolved.providerPlaceId};return reconcilePlaceMutation(definition.id,resolved,result,'Der Ort wurde zur bestätigten Zeit in deinen Tagesplan aufgenommen.');
  }
  else if(definition.id==='places.place.unplan'){
    const resolved={...payload,fields:Array.isArray(payload.fields)?payload.fields:Object.keys(payload.fields||{}).length?Object.keys(payload.fields):['planned_at']};result=await placesContract().commands.unplan(resolved);await placesContract().commands.updateLifecycle?.(resolved.tripPlaceId,'saved',{}, {tripId:resolved.tripId});const reconciled=await reconcilePlaceMutation(definition.id,resolved,result,'Der Ort wurde aus deinem Tagesplan entfernt.');return{...reconciled,resolvedPayload:{...payload,tripPlaceId:resolved.tripPlaceId,placeId:resolved.placeId}};
  }
  else if(['booking.place.open','booking.restaurant.open'].includes(definition.id)){result=await bookingContract().commands.openPlaceBooking(payload,{reserveExternalWindow:true});message=result?.opened?'Der passende Buchungsweg ist geöffnet.':'Der Buchungsweg konnte nicht geöffnet werden.';status=result?.opened?'opened':'failed'}
  else if(definition.id==='booking.stay.offer.open'){result=await bookingContract().commands.openStayOffer(payload,{userGesture:true});message=result?.opened?'Das ausgewählte Hotelangebot ist beim richtigen Anbieter geöffnet.':'Das ausgewählte Hotelangebot konnte nicht sicher geöffnet werden.';status=result?.opened?'opened':'failed'}
  else if(definition.id==='booking.reservation.create'){
    result=await bookingContract().commands.submitReservation({...payload,idempotencyKey});
    if(result?.submissionState==='confirmed')message='Die Buchung ist durch den verbundenen Provider bestätigt.';
    else if(result?.submissionState==='provider_requested')message='Die Anfrage wurde direkt an den verbundenen Provider übermittelt. Der endgültige Status folgt aus dessen Bestätigung.';
    else if(result?.submissionState==='email_sent')message='Die Anfrage wurde an die verifizierte Anbieteradresse gesendet. Sie bleibt offen, bis der Anbieter antwortet.';
    else if(result?.submissionState==='external_action_required'){message='Noch nichts gebucht: Der belegte externe Buchungsweg muss von dir geöffnet und dort abgeschlossen werden.';status='failed'}
    else{message='Es wurde nichts extern versendet. Aktuell ist kein belegter direkter Buchungs- oder Anfrageweg verfügbar.';status='failed'}
  }
  else if(definition.id==='booking.reservation.modify'){result=await bookingContract().commands.modifyBooking(payload.bookingId,{...(payload.patch||payload.input||payload),idempotencyKey});message=result?.transport==='provider_api'?'Die Änderung wurde beim verbundenen Provider angefragt. Der endgültige Status wird erst nach dessen Bestätigung übernommen.':'Die Änderungsanfrage wurde im verifizierten Anbieter-Thread gesendet. Die Buchung bleibt bis zur Antwort unverändert.'}
  else if(definition.id==='booking.reservation.cancel'){result=await bookingContract().commands.cancelBooking(payload.bookingId,{...(payload.input||payload),idempotencyKey});message=result?.transport==='provider_api'?'Die Stornierung wurde beim verbundenen Provider angefragt. Als storniert gilt sie erst nach bestätigtem Status.':'Die Stornierungsanfrage wurde im verifizierten Anbieter-Thread gesendet. Als storniert gilt sie erst nach der Antwort.'}
  else if(definition.id==='journey.day.open'){result=await journeyContract().commands.openPlanningEditor(payload);message='Dein Tagesplan ist geöffnet.';status='opened'}
  else if(definition.id==='journey.entry.schedule'){result=await journeyContract().commands.editEntry(payload.entryId,{startAt:payload.startAt,durationMinutes:payload.durationMinutes,expectedRevision:payload.expectedRevision,...(payload.expectedConflictSignature!=null?{expectedConflictSignature:payload.expectedConflictSignature}:{}),conflictsAccepted:payload.conflictsAccepted===true,confirmed:true,operationId:idempotencyKey});message='Der Timeline-Moment wurde beim zuständigen Owner geändert und erneut gelesen.'}
  else if(definition.id==='journey.entry.remove'){result=await journeyContract().commands.removeEntry(payload.entryId,{expectedRevision:payload.expectedRevision,confirmed:true,operationId:idempotencyKey});message='Der Timeline-Moment wurde beim zuständigen Owner entfernt; der Recovery-Beleg bleibt erhalten.'}
  else if(definition.id==='journey.entry.restore'){result=await journeyContract().commands.restoreRemovedEntry(payload.recoveryId,{tripId:payload.tripId,expectedRevision:payload.expectedRevision,...(payload.expectedConflictSignature!=null?{expectedConflictSignature:payload.expectedConflictSignature}:{}),conflictsAccepted:payload.conflictsAccepted===true,confirmed:true,operationId:idempotencyKey});message='Der Timeline-Moment wurde aus dem geprüften Owner-Beleg wiederhergestellt.'}
  else if(definition.id==='journey.visit.update'){
    result=await placesContract().commands.updateVisit(payload.visitId,{arrivedAt:payload.startAt,leftAt:null,durationSeconds:Number(payload.durationMinutes)*60,expectedRevision:payload.expectedRevision,confirmed:true,operationId:idempotencyKey});
    const verified=clean(result?.id)===clean(payload.visitId)&&exactInstant(result?.arrivedAt,payload.startAt)&&Math.round(Number(result?.durationSeconds)/60)===Number(payload.durationMinutes),readback={...(result||{}),visitId:payload.visitId,readbackVerified:verified,readbackState:verified?'visited-updated':'not-reconciled',readbackOwner:'places.v1',readbackObservedAt:new Date().toISOString()};
    return{result:readback,message:verified?'Der bestätigte Besuch wurde beim Places Visit Owner korrigiert und erneut gelesen.':'Die Besuchskorrektur wurde gesendet, der gespeicherte Owner-Stand ist aber noch nicht eindeutig bestätigt.',status:payload.readbackRequired&&!verified?'outcome_unknown':'completed',resolvedPayload:payload};
  }
  else if(definition.id==='journey.visit.remove'){
    result=await placesContract().commands.removeVisit(payload.visitId,{expectedRevision:payload.expectedRevision,title:payload.name,confirmed:true,operationId:idempotencyKey});const current=placesContract().reads?.getVisit?.(payload.visitId)||{},recoveryId=clean(result?.recoveryId),verified=Boolean(recoveryId&&current?.state==='removed'&&!visitConfirmed(current)),readback={...(result||{}),visitId:payload.visitId,readbackVerified:verified,readbackState:verified?'removed':'not-reconciled',readbackOwner:'places.v1',readbackObservedAt:new Date().toISOString()};
    return{result:readback,message:verified?'Der bestätigte Besuch wurde beim Places Visit Owner entfernt; der Recovery-Beleg bleibt erhalten.':'Die Entfernung wurde gesendet, der gespeicherte Owner-Stand ist aber noch nicht eindeutig bestätigt.',status:payload.readbackRequired&&!verified?'outcome_unknown':'completed',resolvedPayload:{...payload,recoveryId:recoveryId||null,expectedRevision:visitRevision(current)||payload.expectedRevision}};
  }
  else if(definition.id==='journey.visit.restore'){
    result=await placesContract().commands.restoreVisit(payload.recoveryId,{expectedRevision:payload.expectedRevision,confirmed:true,operationId:idempotencyKey});const visitId=clean(payload.visitId||result?.visitId),current=visitId?placesContract().reads?.getVisit?.(visitId)||{}:{},verified=Boolean(visitId&&visitConfirmed(current)&&['visited','left'].includes(clean(current.state))),readback={...(result||{}),visitId,readbackVerified:verified,readbackState:verified?'restored':'not-reconciled',readbackOwner:'places.v1',readbackObservedAt:new Date().toISOString()};
    return{result:readback,message:verified?'Der bestätigte Besuch wurde aus dem geprüften Places-Owner-Beleg wiederhergestellt.':'Die Wiederherstellung wurde gesendet, der gespeicherte Owner-Stand ist aber noch nicht eindeutig bestätigt.',status:payload.readbackRequired&&!verified?'outcome_unknown':'completed',resolvedPayload:payload};
  }
  else if(definition.id==='trip.active.select'){result=tripContract().commands.selectActiveTrip(payload.tripId,{source:'intelligence.actions.v1'});message='Die aktive Reise wurde gewechselt.'}
  else if(definition.id==='trip.update.details'){result=await tripContract().commands.updateTrip(payload.tripId,payload.patch||{});message='Die bestätigten Reisedetails wurden aktualisiert.'}
  else if(definition.id==='memory.story.save'){result=await memoryContract().commands.stories.save(payload.story||payload);message='Die bestätigte Reisegeschichte wurde gespeichert.'}
  else if(definition.id==='identity.preferences.update'){result=await identityContract().commands.updatePreferences(payload.patch||payload.preferences||{});message='Deine bestätigten Vorlieben wurden aktualisiert.'}
  else throw runtimeError('AI_ACTION_BINDING_UNAVAILABLE',`Für ${definition.id} ist noch kein Web Owner Binding registriert.`,{actionId:definition.id});
  return{result,message,status};
}

async function execute(actionId,payload={},options={}){
  const definition=actionCore().getAction(actionId);if(!definition)missing(actionId);
  actionId=definition.id;
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
    ownerInvoked=true;const outcome=await invokeOwner(definition,staged.ownerInput||staged.envelope.input,staged.envelope.idempotencyKey);
    const compensationOrigin=compensationOrigins.get(ledgerId)||null,receipt=actionCore().createReceipt({actionId,status:compensationOrigin?'compensated':outcome.status,message:compensationOrigin?'Die vorherige Änderung wurde rückgängig gemacht.':outcome.message,ownerCommand:true,occurredAt:new Date().toISOString(),ledgerId,correlationId:staged.envelope.correlationId,idempotencyKey:staged.envelope.idempotencyKey,compensationStatus:compensationOrigin?'completed':null,reference:receiptReference(staged.ownerInput||staged.envelope.input,outcome.result),meta:compensationOrigin?{compensatesLedgerId:compensationOrigin}: {}});
    if(outcome.status==='failed')ledger.fail(ledgerId,{code:'AI_ACTION_OWNER_DECLINED',retryable:true,receipt});else if(outcome.status==='outcome_unknown')ledger.fail(ledgerId,{code:'AI_ACTION_OWNER_READBACK_UNCONFIRMED',retryable:false,outcomeUnknown:true,receipt});else ledger.succeed(ledgerId,receipt);
    receipts.set(ledgerId,receipt);if(outcome.status!=='outcome_unknown')completedInputs.set(ledgerId,{definition,payload:outcome.resolvedPayload||staged.ownerInput||staged.envelope.input});pending.delete(ledgerId);
    if(compensationOrigin&&outcome.status!=='failed'){ledger.startCompensation(compensationOrigin);ledger.finishCompensation(compensationOrigin,receipt);compensationOrigins.delete(ledgerId);emit('command-compensated',{actionId,owner:definition.owner,ledgerId,compensatesLedgerId:compensationOrigin})}
    emit(['failed','outcome_unknown'].includes(outcome.status)?'command-failed':'command-completed',{actionId,owner:definition.owner,status:compensationOrigin?'compensated':outcome.status,ledgerId});return receipt;
  }catch(error){
    const outcomeUnknown=ownerInvoked&&definition.risk==='R3';const retryable=!outcomeUnknown&&definition.risk!=='R4';ledger.fail(ledgerId,{code:error?.code||'AI_ACTION_FAILED',retryable,outcomeUnknown});
    const receipt=actionCore().createReceipt({actionId,status:outcomeUnknown?'outcome_unknown':'failed',message:outcomeUnknown?'Ich kann noch nicht sicher bestätigen, ob die externe Änderung abgeschlossen wurde. Deshalb wiederhole ich sie nicht automatisch.':'Die Änderung konnte nicht abgeschlossen werden. Bitte versuche es erneut.',ownerCommand:true,occurredAt:new Date().toISOString(),ledgerId,correlationId:staged.envelope.correlationId,idempotencyKey:staged.envelope.idempotencyKey,retryable,outcomeUnknown,reference:{...receiptReference(staged.envelope.input),code:error?.code||'AI_ACTION_FAILED'}});
    receipts.set(ledgerId,receipt);if(outcomeUnknown)pending.delete(ledgerId);emit('command-failed',{actionId,owner:definition.owner,code:error?.code||'AI_ACTION_FAILED',outcomeUnknown,ledgerId});return receipt;
  }
}

function cancel(ledgerId){
  const state=ledger.get(ledgerId);if(!state)throw runtimeError('INTELLIGENCE_ACTION_LEDGER_NOT_FOUND','Die vorbereitete Aktion wurde nicht gefunden.',{ledgerId});
  const receipt=actionCore().createReceipt({actionId:state.actionId,status:'cancelled',message:'Die vorbereitete Änderung wurde verworfen. Es wurde nichts verändert.',ownerCommand:false,occurredAt:new Date().toISOString(),ledgerId,correlationId:state.correlationId,idempotencyKey:state.idempotencyKey});
  ledger.cancel(ledgerId);pending.delete(ledgerId);receipts.set(ledgerId,receipt);emit('command-cancelled',{actionId:state.actionId,owner:state.owner,ledgerId});return receipt;
}
async function retry(ledgerId,options={}){
  const state=ledger.get(ledgerId);if(!state)throw runtimeError('INTELLIGENCE_ACTION_LEDGER_NOT_FOUND','Die fehlgeschlagene Aktion wurde nicht gefunden.',{ledgerId});
  if(state.status==='outcome_unknown')throw runtimeError('INTELLIGENCE_ACTION_OUTCOME_RECONCILIATION_REQUIRED','Ein unklarer externer Ausgang darf nicht blind wiederholt werden.',{ledgerId,actionId:state.actionId});
  if(state.status!=='failed')throw runtimeError('INTELLIGENCE_ACTION_RETRY_NOT_AVAILABLE','Nur eindeutig fehlgeschlagene Aktionen können wiederholt werden.',{ledgerId,status:state.status});
  receipts.delete(ledgerId);
  return execute(state.actionId,{}, {...options,ledgerId,userGesture:true,confirmed:true});
}
function compensationPayload(definition,payload={}){
  if(definition.id==='places.place.unplan'){const previous=localDateTimeHint(payload.fields?.planned_at);return{...payload,date:payload.date||previous.date,time:payload.time||previous.time}}
  if(['places.place.favorite','places.place.unfavorite','places.place.plan'].includes(definition.id))return{...payload};
  if(definition.id==='journey.visit.remove'&&payload.recoveryId)return{tripId:payload.tripId,visitId:payload.visitId,placeId:payload.placeId,name:payload.name,recoveryId:payload.recoveryId,expectedRevision:payload.expectedRevision,readbackRequired:true};
  if(definition.id==='trip.active.select'&&payload.previousTripId)return{tripId:payload.previousTripId,previousTripId:payload.tripId};
  return null;
}
function recoveryPlan(ledgerId){
  const state=ledger.get(ledgerId),completed=completedInputs.get(ledgerId),definition=completed?.definition||actionCore().getAction(state?.actionId);
  if(!state||!definition)return actionCore().immutable({kind:'unavailable',available:false,reason:'ledger-not-found'});
  if(state.status==='failed')return actionCore().immutable({kind:'retry',available:true,blindRetry:false,owner:definition.owner,ownerContract:definition.ownerContract});
  if(state.status==='outcome_unknown')return actionCore().immutable({kind:'owner-reconciliation',available:true,blindRetry:false,owner:definition.owner,ownerContract:definition.ownerContract});
  const compensation=actionCore().getAction(definition.compensation),payload=compensationPayload(definition,completed?.payload||{});
  if(state.status==='succeeded'&&definition.reversible&&compensation&&payload)return actionCore().immutable({kind:'undo',available:true,actionId:compensation.id,owner:compensation.owner,ownerContract:compensation.ownerContract,requiresConfirmation:true});
  if(state.status==='succeeded'&&definition.reversible)return actionCore().immutable({kind:'owner-recovery',available:true,automatic:false,owner:definition.owner,ownerContract:definition.ownerContract,reason:'registered-owner-recovery-required'});
  return actionCore().immutable({kind:'none',available:false,reason:'not-reversible'});
}
function prepareUndo(ledgerId,options={}){
  const state=ledger.get(ledgerId),completed=completedInputs.get(ledgerId);if(!state||!completed)throw runtimeError('INTELLIGENCE_ACTION_UNDO_NOT_AVAILABLE','Für dieses Receipt ist kein rückgängig machbarer Owner-Vorgang verfügbar.',{ledgerId});
  if(state.status!=='succeeded')throw runtimeError('INTELLIGENCE_ACTION_UNDO_NOT_AVAILABLE','Nur erfolgreich abgeschlossene, noch nicht rückgängig gemachte Aktionen können zurückgenommen werden.',{ledgerId,status:state.status});
  const compensation=actionCore().getAction(completed.definition.compensation),payload=compensationPayload(completed.definition,completed.payload);if(!compensation||!payload)throw runtimeError('INTELLIGENCE_ACTION_OWNER_RECOVERY_REQUIRED','Diese Aktion benötigt einen eigenen Recovery-Flow des zuständigen Owners.',{ledgerId,actionId:state.actionId,owner:state.owner});
  const prepared=prepare(compensation.id,payload,{...options,userGesture:true,surface:options.surface||'global-chat-undo',correlationId:state.correlationId});compensationOrigins.set(prepared.ledgerId,ledgerId);emit('compensation-confirmation-required',{actionId:compensation.id,owner:compensation.owner,ledgerId:prepared.ledgerId,compensatesLedgerId:ledgerId});return actionCore().immutable({...prepared,compensatesLedgerId:ledgerId});
}
function getActionState(ledgerId){return ledger.get(ledgerId)}
function subscribe(listener){if(typeof listener!=='function')throw new TypeError('Action Runtime subscriber must be a function.');listeners.add(listener);return()=>listeners.delete(listener)}
function diagnostics(){
  const capabilities=capabilitySnapshot(),connections=connectionSnapshot();
  const owners=Object.fromEntries(connections.map(connection=>[connection.owner,connection.registered]));
  return actionCore().immutable({version:VERSION,contractId:actionCore().contractId,ledgerContractId:ledger.contractId,actions:actionCore().listActions().length,availableActions:capabilities.available,owners,connections,capabilities,ledger:ledger.diagnostics(),policy:actionCore().policySnapshot()});
}

root.LuviaAIActionRuntime=Object.freeze({version:VERSION,runMessage,readPlaceViewport,prepare,execute,cancel,retry,prepareUndo,recoveryPlan,getActionState,capabilitySnapshot,connectionSnapshot,subscribe,diagnostics});
})(this);
