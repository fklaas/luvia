((root)=>{
'use strict';

const VERSION='1.7.0';
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
const journeyContract=()=>root.LuviaJourneyContractV1||missing('journey.v1');
const memoryContract=()=>root.LuviaMemoryContractV1||root.LuviaMemoryContract||missing('memory.v1');
const identityContract=()=>root.LuviaIdentityContractV1||root.LuviaIdentityContract||missing('identity.v1');
const intelligenceContract=()=>root.LuviaIntelligenceContractV1||root.LuviaIntelligenceContract||missing('intelligence.v1');
const verifiedEventContract=()=>root.LuviaVerifiedEventIntelligenceContractV1||missing('intelligence.verified-events.v1');
const ledger=ledgerCore().createActionLedger({idFactory:value=>`ledger-${value}-${newId('entry')}`,maxEntries:240});

function missing(provider){const error=new Error(`Luvia Action Runtime: ${provider} ist nicht verfügbar.`);error.code='AI_ACTION_OWNER_CONTRACT_UNAVAILABLE';error.provider=provider;throw error}
function runtimeError(code,message,extra={}){const error=new Error(message);error.code=code;Object.assign(error,extra);return error}
const clean=value=>String(value??'').trim();
const tripId=trip=>clean(trip?.tripId||trip?.id)||null;
const destination=trip=>clean(trip?.destination?.name||trip?.destination?.formattedAddress||trip?.destinationName||trip?.city);
const providerId=place=>clean(place?.providerPlaceId||place?.id).replace(/^places\//,'');
function newId(prefix){return`${prefix}-${root.crypto?.randomUUID?.()||`${Date.now()}-${++sequence}`}`}
function emit(reason,detail={}){const event=actionCore().immutable({reason,...detail});for(const listener of listeners){try{listener(event)}catch{}}root.dispatchEvent?.(new CustomEvent('luvia:ai-action-changed',{detail:event}));return event}
function ownerContract(owner){return owner==='trip'?tripContract():owner==='places'?placesContract():owner==='booking'?bookingContract():owner==='journey'?journeyContract():owner==='memory'?memoryContract():owner==='identity'?identityContract():owner==='intelligence'?verifiedEventContract():missing(owner)}
function operation(contract,path){return clean(path).split('.').reduce((value,key)=>value?.[key],contract)}
function operationAvailable(definition){try{return typeof operation(ownerContract(definition.owner),definition.ownerMethod)==='function'}catch{return false}}
function receiptReference(payload={},result={}){return{tripId:payload.tripId||null,previousTripId:payload.previousTripId||null,providerPlaceId:payload.providerPlaceId||null,tripPlaceId:result?.tripPlaceId||null,bookingId:payload.bookingId||result?.bookingId||result?.id||null,storyId:payload.storyId||result?.storyId||result?.id||null,channel:result?.channel||null,provider:result?.provider||null,opened:typeof result?.opened==='boolean'?result.opened:null}}
function previewPayload(payload={}){const allowed=['tripId','bookingId','providerPlaceId','placeId','placeType','name','title','date','time','partySize','reason','status','category'];return Object.fromEntries(allowed.filter(key=>payload[key]!=null&&payload[key]!=='').map(key=>[key,payload[key]]))}
function connectionSnapshot(){
  const owners=['trip','places','booking','journey','memory','identity','intelligence'];
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

function plannedAt(hint={}){if(!hint.date||!hint.time)return null;const parsed=new Date(`${hint.date}T${hint.time}:00`);return Number.isNaN(parsed.getTime())?null:parsed.toISOString()}
function mutationHints(compiled){
  const intents=compiled?.intents||[],writes=intents.filter(intent=>intent.mode==='propose-write'),plan=writes.find(intent=>intent.domain==='journey'&&/\b(?:plane|planen|einplan\w*|hinzufueg\w*|hinzufüg\w*|timeline|reiseplan|tagesplan|plan|schedule|add)\b/i.test(intent.clause))||writes.find(intent=>intent.domain==='places'&&/\b(?:plane|planen|einplan\w*|hinzufueg\w*|hinzufüg\w*|timeline|plan|schedule|add)\b/i.test(intent.clause)),favorite=writes.find(intent=>intent.domain==='places'&&/\b(?:merk|speicher|favorit)\w*\b/i.test(intent.clause)),booking=writes.find(intent=>intent.domain==='booking');
  return actionCore().immutable({plan:plan?{clause:plan.clause,date:plan.temporalHint?.date||null,time:plan.temporalHint?.time||null,plannedAt:plannedAt(plan.temporalHint)}:null,favorite:Boolean(favorite),booking:booking?{clause:booking.clause,date:booking.temporalHint?.date||null,time:booking.temporalHint?.time||null,partySize:booking.entityHints?.partySize||null}:null});
}
function placeActions(place,trip,hints={}){
  const id=providerId(place),primary=clean(place.primaryType||place.primary_type||'place').toLowerCase(),bookable=/restaurant|cafe|bakery|bar|food|meal/.test(primary),payload={tripId:tripId(trip),providerPlaceId:id,placeId:place.id||id,placeType:primary||'place',name:place.name,address:place.address,website:place.website,reservationUrl:place.reservationUrl};
  const planPayload=hints.plan?.plannedAt?{...payload,date:hints.plan.date,time:hints.plan.time,fields:{planned_at:hints.plan.plannedAt,place_name:place.name,notes:hints.plan.clause},requestedBy:'intelligence.travel-orchestration.v1'}:payload;
  return[
    {actionId:place.isFavorite?'places.place.unfavorite':'places.place.favorite',label:place.isFavorite?'Favorit entfernen':'Als Favorit merken',payload},
    ...(bookable?[{actionId:'booking.restaurant.open',label:'Jetzt reservieren',payload:{...payload,type:'restaurant'}}]:[]),
    {actionId:'places.place.plan',label:hints.plan?.plannedAt?`${hints.plan.date} · ${hints.plan.time} einplanen`:'Zur Timeline hinzufügen',payload:planPayload}
  ];
}
async function resolveCard(place,trip,hints={}){
  const contract=placesContract();const id=providerId(place);let card={place,image:null};
  if(id&&typeof contract.reads?.getCard==='function'){try{card=await contract.reads.getCard(id,{maxWidthPx:960,maxHeightPx:720,source:place})||card}catch{}}
  const item={...place,...(card.place||{}),providerPlaceId:id||providerId(card.place),image:card.image||place.image||null,reasons:place.aiReasons||place.reasons||[],unknowns:place.aiUnknowns||place.unknowns||[]};
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
  const trip=tripContract().getActiveTrip?.()||{};const input=request.input||{},hints=input.mutationHints||{},confirmedPreferences=await Promise.resolve(identityContract().getPreferences?.('self')??identityContract().reads?.getPreferences?.('self')??{}),requestPreferences=input.explicitPreferencePatch||{},profileFallbackUsed=!Object.keys(requestPreferences).length,effectivePreferences={...confirmedPreferences,...requestPreferences},profileContext=options.profileContext||effectivePreferences,excluded=new Set((options.excludedProviderPlaceIds||[]).map(value=>clean(typeof value==='string'?value:providerId(value)).replace(/^places\//,'')).filter(Boolean)),inputSpatial=input.spatialConstraints||root.LuviaGlobalPlaceContracts?.spatialIntent?.(input.query)||null,sourceSpatial=root.LuviaGlobalPlaceContracts?.spatialIntent?.(options.sourceMessage)||null,spatialConstraints=inputSpatial?.explicit?inputSpatial:sourceSpatial?.explicit?sourceSpatial:inputSpatial;
  const categories=Array.isArray(input.categories)&&input.categories.length?input.categories:[input.category||'places'];
  const ownerReads=rejectedProviderPlaceIds=>Promise.allSettled(categories.map(category=>placesContract().reads.recommend({tripId:tripId(trip),text:input.query,query:input.query,category,destination:destination(trip),limit:Math.min(3,Math.max(1,Number(input.limit||3))),candidateLimit:32,queryVariantLimit:3,preferences:effectivePreferences,profileContext,preferenceMode:profileFallbackUsed?'confirmed-profile-fallback':'explicit-request-over-confirmed-profile',rejectedProviderPlaceIds,spatialConstraints,diversity:{minimumQueryVariants:3,rotateAcrossQueries:true}})));
  let responses=await ownerReads([...excluded]),successful=responses.filter(response=>response.status==='fulfilled');if(!successful.length){const diagnostics=boundedProviderDiagnostics(responses,categories);throw Object.assign(new Error('Alle angeforderten Places-Owner-Reads sind fehlgeschlagen; Luvia zeigt keine erfundenen Treffer.'),{code:'PLACES_ALL_PROVIDERS_FAILED',providerDiagnostics:diagnostics})}
  const collect=(source,respectExclusions=true)=>{const seen=new Set(),places=[],repeats=[];source.forEach((response,index)=>{if(response.status!=='fulfilled')return;const ownerCategory=clean(response.value?.route?.category||categories[index]||categories[0]||'place').toLowerCase();for(const place of response.value?.places||[]){const id=providerId(place);if(!id||seen.has(id))continue;seen.add(id);const normalized={...place,requestCategory:ownerCategory,primaryType:place.primaryType||place.primary_type||ownerCategory};if(respectExclusions&&excluded.has(id))repeats.push(normalized);else places.push(normalized)}});return{places,repeats}};
  let collected=collect(responses,true),raw=collected.places,repeatFallbackUsed=false;if(!raw.length&&excluded.size){if(collected.repeats.length){raw=collected.repeats;repeatFallbackUsed=true}else{responses=await ownerReads([]);successful=responses.filter(response=>response.status==='fulfilled');if(!successful.length){const diagnostics=boundedProviderDiagnostics(responses,categories);throw Object.assign(new Error('Alle angeforderten Places-Owner-Reads sind fehlgeschlagen; Luvia zeigt keine erfundenen Treffer.'),{code:'PLACES_ALL_PROVIDERS_FAILED',providerDiagnostics:diagnostics})}raw=collect(responses,false).places;repeatFallbackUsed=raw.length>0}}
  if(!raw.length&&responses.some(response=>response.status==='rejected'))throw Object.assign(new Error('Mindestens ein angeforderter Places-Read ist fehlgeschlagen; ein vollständiger belastbarer Nulltreffer ist deshalb nicht belegt.'),{code:'PLACES_PROVIDER_READ_INCOMPLETE',providerDiagnostics:boundedProviderDiagnostics(responses,categories)});
  const perCategoryLimit=Math.min(3,Math.max(1,Number(input.limit||3))),selected=fairCategorySelection(raw,categories,perCategoryLimit),cards=await Promise.all(selected.map(place=>resolveCard(place,trip,hints))),noun=categories.length>1?'Orte':'Möglichkeiten',planCopy=hints.plan?.plannedAt?` Die angeforderte Zeit ${hints.plan.date} · ${hints.plan.time} ist an jeder Timeline-Aktion sichtbar und wird erst nach deiner Bestätigung geschrieben.`:'',profileFields=Object.entries(confirmedPreferences||{}).filter(([key,value])=>!/(?:updated|completed|schema|version)/i.test(key)&&(Array.isArray(value)?value.length:Boolean(value))).length,profileCopy=profileFallbackUsed?(profileFields?` Im Satz fehlten konkrete Vorlieben; deshalb wurden ${profileFields} bestätigte Profilbereiche aus Identity v1 berücksichtigt.`:' Es sind noch keine bestätigten Profilvorlieben für diese Auswahl hinterlegt.'):` Explizite Vorlieben aus diesem Wunsch haben Vorrang; nicht angesprochene Profilbereiche bleiben Identity-owned.`,diversityCopy=excluded.size?(repeatFallbackUsed?' Der neue Provider-Pool war erschöpft; deshalb sind Wiederholungen ausdrücklich als Fallback zugelassen.':' Bereits in dieser Chat-Sitzung gezeigte Orte wurden aus der Auswahl ausgeschlossen.'):'',diversityMeta=successful.map(response=>response.value?.diversityMeta).find(Boolean)||null,providerDiagnostics=boundedProviderDiagnostics(responses,categories),categoryDistribution=Object.fromEntries(categories.map(category=>[category,cards.filter(card=>card.requestCategory===category).length])),providerCopy=providerDiagnostics.degraded?' Ein Providerpfad ist eingeschränkt; die sichtbaren Karten bleiben ausschließlich durch erfolgreiche Providerprojektionen belegt.':'';
  return actionCore().normalizeResult({kind:cards.length?'place_collection':'message',owner:'places',contractId:'places.v1',title:cards.length?`${cards.length} passende ${noun}`:'Noch kein belastbarer Places-Treffer',message:cards.length?`Places belegt die Orte; Luvia ordnet sie im freigegebenen Reise- und Profilkontext.${profileCopy}${diversityCopy}${providerCopy} Speichern, Timeline und Booking bleiben Owner-Aktionen.${planCopy}`:'Passe Wunsch, Entfernung oder Zeitpunkt an.',items:cards,evidence:{providerFactsAuthoritative:true,aiReasonsNonAuthoritative:true,preferenceOwner:'identity.v1',confirmedProfileFields:profileFields,profileFallbackUsed,explicitRequestPreferenceFields:Object.keys(requestPreferences),query:input.query,categories,categoryDistribution,destination:destination(trip),tripId:tripId(trip),count:cards.length,excludedProviderPlaceIds:excluded.size,repeatFallbackUsed,diversityMeta,providerDiagnostics,observedAt:providerDiagnostics.observedAt,spatialConstraints,mutationHints:hints},meta:{actionId:request.actionId}});
}
const restaurantResult=(request,options={})=>placeDiscoveryResult({...request,input:{...(request.input||{}),category:'food',categories:['food']}},options);
async function dayResult(request){
  const trip=tripContract().getActiveTrip?.()||{};const projection=await journeyContract().reads.snapshot({trip});const today=new Date().toISOString().slice(0,10);
  const days=[...(projection?.days||[])].sort((left,right)=>left.date===today?-1:right.date===today?1:String(left.date).localeCompare(String(right.date))).slice(0,4);
  const entries=days.reduce((count,day)=>count+(day.entries?.length||0),0);
  const reads=journeyContract().reads||{},routeEnabled=root.LuviaFeatureFlagRegistry?.isEnabled?.('intelligence.s16-03-route-uncertainty')!==false,rehearsalEnabled=root.LuviaFeatureFlagRegistry?.isEnabled?.('intelligence.s16-04-day-rehearsal')!==false,recoveryEnabled=root.LuviaFeatureFlagRegistry?.isEnabled?.('intelligence.s16-05-live-disruption-recovery')!==false,twinEnabled=root.LuviaFeatureFlagRegistry?.isEnabled?.('intelligence.s16-08-destination-digital-twin')!==false;
  const routeUncertainty=routeEnabled&&typeof reads.routeUncertainty==='function'?days.flatMap(day=>(day.entries||[]).slice(1).map((entry,index)=>{const previous=day.entries[index],projection=reads.routeUncertainty({baseMinutes:entry.transferMinutes||previous?.transferMinutes||20,travelSpeed:'balanced',providerConfidence:entry.routeConfidence,evidence:entry.routeEvidence||[]});return{date:day.date,from:previous?.id||null,to:entry.id||null,...projection}})):[];
  const rehearsals=rehearsalEnabled&&typeof reads.rehearseDay==='function'?days.map(day=>({date:day.date,...reads.rehearseDay({entries:day.entries||[],travelSpeed:'balanced'})})):[];
  const allEntries=days.flatMap(day=>day.entries||[]),disruptionRecovery=recoveryEnabled&&typeof reads.disruptionRecovery==='function'?reads.disruptionRecovery({entries:allEntries,disruptions:projection?.disruptions||[]}):null;
  let savedPlaces=[];if(twinEnabled&&typeof placesContract().reads?.listSaved==='function')try{const saved=await placesContract().reads.listSaved({tripId:tripId(trip)});savedPlaces=Array.isArray(saved)?saved:saved?.places||[]}catch{}
  const destinationTwin=twinEnabled&&typeof reads.destinationTwin==='function'?reads.destinationTwin({places:savedPlaces,entries:allEntries,generatedAt:new Date().toISOString()}):null;
  return actionCore().normalizeResult({kind:'day_plan',owner:'journey',contractId:'journey.v1',title:days.length?'Euer aktueller Reiseplan':'Euer Reisetag ist noch offen',message:days.length?`${entries} Reisemomente aus dem Journey Day Graph. Konflikte und Reihenfolge bleiben Journey-owned.`:'Luvia kann gemeinsam mit euch erste Reisemomente strukturieren.',items:days,actions:[{actionId:'journey.day.open',label:days.length?'Tag bearbeiten':'Tag planen',payload:{tripId:tripId(trip),date:days[0]?.date||today,mode:'schedule'}}],evidence:{journeyOwner:true,tripId:tripId(trip),summary:projection?.summary||{},routeUncertainty,rehearsals,disruptionRecovery,destinationTwin,offlineCrdt:{enabled:root.LuviaFeatureFlagRegistry?.isEnabled?.('intelligence.s16-07-offline-crdt-plan')===true,reserved:true,owner:'journey',ownerSyncRequired:true},probabilityClaim:false,automaticMutation:false},meta:{actionId:request.actionId,query:request.input?.query||'',slices:['S16.03','S16.04','S16.05','S16.08']}});
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
async function verifiedEventResult(request,options={}){
  const trip=tripContract().getActiveTrip?.()||tripContract().reads?.getActiveTrip?.()||{},contract=verifiedEventContract(),collection=await contract.reads.listVerified({query:request.input?.query||'',destination:destination(trip),tripId:tripId(trip),limit:request.input?.limit||12,now:options.now});
  if(collection?.status==='provider-unavailable')throw runtimeError('VERIFIED_EVENT_PROVIDER_UNAVAILABLE','Es ist gerade keine verifizierte Event-Quelle erreichbar. Luvia zeigt deshalb keine erfundenen Events.');
  const items=(collection?.visible||[]).map(event=>({...event,actions:[]})),graph=contract.reads.buildGraph({claims:items,tripId:tripId(trip),generatedAt:options.now||new Date().toISOString()}),brush=contract.reads.brushGraph(graph,{from:request.input?.from,to:request.input?.to,bounds:request.input?.bounds}),culturalContext=items.map(event=>contract.reads.culturalContext({event,documents:options.culturalDocuments||[],locale:options.locale||'de-DE'})),serendipity=contract.reads.serendipityWindow({events:items,openWindow:options.serendipityWindow||{},routeUncertainty:options.eventRouteUncertainty||[]}),groupTaste=contract.reads.groupTasteDivergence(options.groupEventContext||{}),weatherSafe=contract.reads.weatherSafeSubstitution({weather:options.weatherEvidence||{},originalEvent:items[0],alternatives:items.slice(1),now:options.now}),scheduleReconciliation=contract.reads.reconcileSchedule({claims:items,entries:options.eventJourneyEntries||[],bookings:options.eventBookings||[]});
  return actionCore().normalizeResult({kind:'event_collection',owner:'intelligence',contractId:'intelligence.verified-events.v1',title:items.length?`${items.length} verifizierte Events`:'Keine aktuell verifizierten Events',message:items.length?'Zeit, Status und Quelle sind frisch belegt. Venue-Koordinaten stammen ausschließlich aus Places- oder Source-Provenienz. Übernahme in Journey, Booking oder Memory bleibt ein getrennter Owner-Flow.':'Die Event-Quelle lieferte keine Claims, die den vollständigen Verifikations- und Freshness-Gate bestehen.',items,evidence:{actionId:request.actionId,counts:collection?.counts||{},sourceFailures:collection?.sourceFailures||[],sourceGateway:collection?.sourceGateway||false,graph,brush,culturalContext,serendipity,groupTaste,weatherSafe,scheduleReconciliation,syntheticEventCount:0,automaticMutation:false,slices:['S16.09','S16.10','S16.11','S16.12']},meta:{actionId:request.actionId,uspKind:'verified-events'}});
}
const readHandlers=Object.freeze({'places.restaurant.recommend':restaurantResult,'places.discovery.recommend':placeDiscoveryResult,'events.verified.read':verifiedEventResult,'journey.day.read':dayResult,'trip.active.list':tripResult,'booking.trip.read':bookingResult,'memory.library.read':memoryResult,'identity.preferences.read':preferenceResult});

function compiledRoutes(message,compiled){
  if(compiled?.contractId!=='intelligence.travel-orchestration.v1'||!Array.isArray(compiled.intents))return null;
  const routes=[],hints=mutationHints(compiled),push=(actionId,input={},query=message)=>{if(actionId&&!routes.some(route=>route.actionId===actionId))routes.push({actionId,input:{query:query||message,mutationHints:hints,...input}})};
  for(const intent of compiled.intents){
    const query=intent.clause||message;
    if(intent.domain==='places')push(intent.categoryHints?.length===1&&intent.categoryHints[0]==='food'?'places.restaurant.recommend':'places.discovery.recommend',{category:intent.categoryHints?.[0]||'places',categories:intent.categoryHints?.length?intent.categoryHints:['places'],limit:3,explicitPreferencePatch:intent.entityHints?.preferencePatch||{},spatialConstraints:root.LuviaGlobalPlaceContracts?.spatialIntent?.(query)||null},query);
    else if(intent.domain==='events')push('events.verified.read',{limit:12,from:intent.temporalHint?.date?`${intent.temporalHint.date}T00:00:00Z`:null,to:intent.temporalHint?.date?`${intent.temporalHint.date}T23:59:59Z`:null},query);
    else if(intent.domain==='booking')push('booking.trip.read',{intent:intent.mode==='propose-write'?'prerequisite-read':'list'},query);
    else if(intent.domain==='journey')push('journey.day.read',{},query);
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
  return actionCore().normalizeResult({kind:'message',owner:'intelligence',contractId:'intelligence.v1',title:'Warum Luvia so plant',message:'Owner-Routen, verwendete Evidenz und offene Belege sind nachvollziehbar. Die Erklärung selbst verändert nichts.',evidence:{planningTrace:trace},meta:{traceOnly:true,slice:'S16.01'}});
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
  const results=[actionCore().normalizeResult({kind:'message',owner:'intelligence',contractId:'intelligence.causal-feedback.v1',title:projection.accepted?'Explizites Feedback verstanden':'Feedback noch nicht lernfähig',message:projection.accepted?'Luvia hat einen kleinen, belegten Profilhinweis vorbereitet. Erst eine separate Identity-Bestätigung darf deine bestätigten Vorlieben ändern.':'Es fehlt ein bestätigtes Owner-Ergebnis mit Evidenz. Aus einer bloßen Äußerung entsteht keine Profiländerung.',evidence:{causalFeedback:projection},meta:{uspKind:'causal-feedback',slice:'S16.06'}})];
  if(!projection.accepted)return results;
  const current=await Promise.resolve(identityContract().getPreferences?.('self')??identityContract().reads?.getPreferences?.('self')??{}),existing=Array.isArray(current.travelInterests)?current.travelInterests:[],next=negative?existing.filter(item=>clean(item)!==value):[...new Set([...existing,value])];if(JSON.stringify(existing)===JSON.stringify(next))return results;
  results.push(prepare('identity.preferences.update',{patch:{travelInterests:next},source:'explicit-confirmed-outcome-feedback',evidenceId:feedback.evidenceId},{userGesture:true,surface:options.surface||'global-chat'}).result);return results;
}
async function runMessage(message,options={}){
  const compiled=options.compiledIntent||null;
  if(compiled&&['blocked','conflicted'].includes(compiled.status))return actionCore().immutable({handled:false,results:[],routes:[],compiledStatus:compiled.status,clarificationRequired:true});
  const routes=compiledRoutes(message,compiled)||(actionCore().routeIntents?.(message)||[actionCore().routeIntent(message)].filter(Boolean)),contextResult=contextGateResult(compiled,options),feedbackResults=await causalFeedbackResults(message,compiled,options),preResults=[...(contextResult?[contextResult]:[]),...feedbackResults];if(!routes.length)return actionCore().immutable({handled:Boolean(preResults.length),results:preResults,routes:[],compiledStatus:compiled?.status||null,clarificationRequired:compiled?.status==='needs-clarification'});
  const requests=routes.map(route=>actionCore().createActionRequest(route.actionId,route.input,{surface:options.surface||'global-chat'})).filter(request=>actionCore().canAutoRun(request.actionId));if(!requests.length)return actionCore().immutable({handled:Boolean(preResults.length),results:preResults,routes});
  const results=[...preResults];let error=false;
  for(const request of requests){emit('read-started',{actionId:request.actionId});try{const handler=readHandlers[request.actionId],result=handler?await handler(request,options):null;if(result){results.push(result);emit('read-completed',{actionId:request.actionId,resultKind:result.kind})}}catch(cause){error=true;results.push(actionCore().normalizeResult({kind:'error',owner:request.owner,title:`${request.owner} ist gerade nicht erreichbar`,message:cause?.message||'Der zuständige Luvia Core konnte diesen Teil der Anfrage nicht ausführen.',evidence:{actionId:request.actionId,code:cause?.code||'AI_ACTION_FAILED',ownerContract:request.ownerContract,automaticMutation:false},meta:{retryable:false,readRecovery:{kind:'owner-read',actionId:request.actionId,owner:request.owner,ownerContract:request.ownerContract,query:request.input?.query||message,canRetry:true,canRefine:true,noMutation:true}}}));emit('read-failed',{actionId:request.actionId,code:cause?.code||'AI_ACTION_FAILED'})}}
  const preferenceIntents=compiled?.status==='compiled'?(compiled.intents||[]).filter(intent=>intent.domain==='identity'&&intent.mode==='propose-write'&&!intent.missingInputs?.length&&Object.keys(intent.entityHints?.preferencePatch||{}).length):[];if(preferenceIntents.length){try{const current=await Promise.resolve(identityContract().getPreferences?.('self')??identityContract().reads?.getPreferences?.('self')??{}),patch={};for(const intent of preferenceIntents)for(const [field,value] of Object.entries(intent.entityHints.preferencePatch)){patch[field]=Array.isArray(value)?[...new Set([...(Array.isArray(current?.[field])?current[field]:[]),...(Array.isArray(patch[field])?patch[field]:[]),...value])]:value}const prepared=prepare('identity.preferences.update',{patch,source:'explicit-chat-request'},{userGesture:true,surface:options.surface||'global-chat'});results.push(prepared.result)}catch(cause){error=true;results.push(actionCore().normalizeResult({kind:'error',owner:'identity',title:'Vorlieben konnten nicht vorbereitet werden',message:cause?.message||'Identity konnte die bestätigbare Änderung nicht vorbereiten.',evidence:{actionId:'identity.preferences.update',code:cause?.code||'AI_ACTION_PREPARE_FAILED'},meta:{retryable:true}}))}}
  const traceResult=planningTraceResult(compiled,requests,results);if(traceResult)results.push(traceResult);
  return actionCore().immutable({handled:Boolean(results.length),results,routes:requests,error,multiIntent:requests.length>1,compiledStatus:compiled?.status||null,clarificationRequired:compiled?.status==='needs-clarification'});
}

function validatePreparedInput(definition,payload={}){
  if(definition.id==='places.place.plan'&&!payload.fields?.planned_at)throw runtimeError('AI_ACTION_INPUT_REQUIRED','Für die Timeline fehlen ein eindeutiges Datum und eine Uhrzeit. Bitte nenne beides im Chat oder öffne den Journey-Planungsdialog.',{actionId:definition.id,missingInputs:['date','time']});
  if(definition.id==='places.place.plan'&&!payload.providerPlaceId&&!payload.tripPlaceId)throw runtimeError('AI_ACTION_INPUT_REQUIRED','Der zu planende Place besitzt keine verifizierte Owner-ID.',{actionId:definition.id,missingInputs:['providerPlaceId']});
  return payload;
}

function prepare(actionId,payload={},options={}){
  const definition=actionCore().getAction(actionId);if(!definition)missing(actionId);
  if(definition.effect!=='READ'&&options.userGesture!==true)throw runtimeError('INTELLIGENCE_USER_GESTURE_REQUIRED','Die Aktion muss durch eine direkte Nutzerauswahl vorbereitet werden.',{actionId});
  if(!operationAvailable(definition))throw runtimeError('AI_ACTION_BINDING_UNAVAILABLE',`Für ${actionId} ist kein erreichbares Owner Binding registriert.`,{actionId,owner:definition.owner});
  validatePreparedInput(definition,payload);
  const preparedPayload=definition.id==='trip.active.select'&&!payload.previousTripId?{...payload,previousTripId:tripId(tripContract().getActiveTrip?.()||tripContract().reads?.getActiveTrip?.()||{})}:payload;
  const correlationId=clean(options.correlationId)||newId('corr');const idempotencyKey=clean(options.idempotencyKey)||newId(`idem-${actionId.replace(/[^a-z0-9]+/gi,'-')}`);const requestedAt=new Date().toISOString();
  const envelope=actionCore().createExecutionEnvelope(actionId,preparedPayload,{surface:options.surface||'global-chat'},{idempotencyKey,correlationId,requestedAt,source:options.surface||'global-chat'});
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
  else if(definition.id==='places.place.plan'){
    const linked=payload.tripPlaceId?payload:await placesContract().commands.importPlace(payload.providerPlaceId,{tripId:payload.tripId,type:payload.placeType,tripPlace:{status:'planned',isFavorite:false}}),resolved={...payload,placeId:linked.placeId||linked.id||payload.placeId,tripPlaceId:linked.tripPlaceId||payload.tripPlaceId};
    result=await placesContract().commands.plan(resolved);await placesContract().commands.updateLifecycle?.(resolved.tripPlaceId,'planned',{}, {tripId:resolved.tripId});result={...(result||{}),placeId:resolved.placeId,tripPlaceId:resolved.tripPlaceId,providerPlaceId:resolved.providerPlaceId};message='Der Ort wurde über Places v1 zur bestätigten Zeit in die Reiseplanung aufgenommen.';return{result,message,status,resolvedPayload:resolved};
  }
  else if(definition.id==='places.place.unplan'){
    const resolved={...payload,fields:Array.isArray(payload.fields)?payload.fields:Object.keys(payload.fields||{}).length?Object.keys(payload.fields):['planned_at']};result=await placesContract().commands.unplan(resolved);await placesContract().commands.updateLifecycle?.(resolved.tripPlaceId,'saved',{}, {tripId:resolved.tripId});message='Der Ort wurde über Places v1 aus der Reiseplanung entfernt.';return{result,message,status,resolvedPayload:{...payload,tripPlaceId:resolved.tripPlaceId,placeId:resolved.placeId}};
  }
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
    const compensationOrigin=compensationOrigins.get(ledgerId)||null,receipt=actionCore().createReceipt({actionId,status:compensationOrigin?'compensated':outcome.status,message:compensationOrigin?`Die vorherige Aktion wurde über ${definition.ownerContract} nachvollziehbar rückgängig gemacht.`:outcome.message,ownerCommand:true,occurredAt:new Date().toISOString(),ledgerId,correlationId:staged.envelope.correlationId,idempotencyKey:staged.envelope.idempotencyKey,compensationStatus:compensationOrigin?'completed':null,reference:receiptReference(staged.envelope.input,outcome.result),meta:compensationOrigin?{compensatesLedgerId:compensationOrigin}: {}});
    if(outcome.status==='failed')ledger.fail(ledgerId,{code:'AI_ACTION_OWNER_DECLINED',retryable:true,receipt});else ledger.succeed(ledgerId,receipt);
    receipts.set(ledgerId,receipt);completedInputs.set(ledgerId,{definition,payload:outcome.resolvedPayload||staged.envelope.input});pending.delete(ledgerId);
    if(compensationOrigin&&outcome.status!=='failed'){ledger.startCompensation(compensationOrigin);ledger.finishCompensation(compensationOrigin,receipt);compensationOrigins.delete(ledgerId);emit('command-compensated',{actionId,owner:definition.owner,ledgerId,compensatesLedgerId:compensationOrigin})}
    emit(outcome.status==='failed'?'command-failed':'command-completed',{actionId,owner:definition.owner,status:compensationOrigin?'compensated':outcome.status,ledgerId});return receipt;
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
function compensationPayload(definition,payload={}){
  if(['places.place.favorite','places.place.unfavorite','places.place.plan','places.place.unplan'].includes(definition.id))return{...payload};
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

root.LuviaAIActionRuntime=Object.freeze({version:VERSION,runMessage,prepare,execute,cancel,retry,prepareUndo,recoveryPlan,getActionState,capabilitySnapshot,connectionSnapshot,subscribe,diagnostics});
})(this);
