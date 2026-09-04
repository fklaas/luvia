(()=>{
'use strict';

const CONTRACT_ID='journey.v1';
const VERSION='1';
const RUNTIME_VERSION='1.3.0-owner-action-bundle';
const listeners=new Set();
let projection=null,sourceUnsubscribe=null,lastReason='initial';

function unavailable(name){const error=new Error(`Journey Contract v1: ${name} ist nicht verfügbar.`);error.code='JOURNEY_CONTRACT_PROVIDER_UNAVAILABLE';throw error}
function domain(){const api=globalThis.LuviaJourneyDomainContractCoreV1;if(!api)unavailable('LuviaJourneyDomainContractCoreV1');return api}
function provider(){const api=globalThis.LuviaTimelineCore;if(!api)unavailable('Journey Web Compatibility Provider');return api}
function resilience(){const api=globalThis.LuviaJourneyResilienceCoreV1;if(!api)unavailable('LuviaJourneyResilienceCoreV1');return api}
function tripContract(){return globalThis.LuviaTripContractV1||globalThis.LuviaTripContract||null}
function activeTrip(){const api=tripContract();return api?.getActiveTrip?.()||null}
function tripProjection(input){
  const trip=input||activeTrip()||{};
  return Object.freeze({
    id:String(trip.id||trip.tripId||''),
    title:String(trip.title||trip.tripName||'Unsere Reise'),
    destination:trip.destination?.name||trip.destination?.formattedAddress||trip.destinationName||'',
    startDate:trip.startDate||trip.start_date||null,
    endDate:trip.endDate||trip.end_date||null
  });
}
function composeProjection(source=provider().snapshot?.()||{},options={}){
  return domain().compose({
    trip:tripProjection(options.trip),
    entries:Array.isArray(source?.entries)?source.entries.map(entry=>({...entry,calendarDate:entry.startAt&&!Number.isNaN(Date.parse(entry.startAt))?new Date(entry.startAt).toLocaleDateString('sv-SE'):null})):[],
    now:options.now||new Date().toISOString(),
    policy:options.policy||{},
    sourceContract:'journey.web-projection'
  });
}
function emit(reason='changed',source){
  lastReason=reason;
  projection=composeProjection(source||provider().snapshot?.()||{});
  for(const listener of listeners){try{listener(projection)}catch{}}
  globalThis.dispatchEvent?.(new CustomEvent('luvia:journey.changed',{detail:Object.freeze({contractId:CONTRACT_ID,reason,tripId:projection.trip.id,summary:projection.summary})}));
  return projection;
}
function ensureBridge(){
  if(sourceUnsubscribe)return;
  const subscribe=provider().subscribe;
  if(typeof subscribe==='function')sourceUnsubscribe=subscribe(source=>emit('compatibility-provider',source));
}
function snapshot(options={}){
  ensureBridge();
  if(options.trip||options.now||!projection)return composeProjection(provider().snapshot?.()||{},options);
  return projection;
}
function listDays(options={}){return snapshot(options).days}
function list(filters={}){return snapshot(filters).entries.filter(entry=>(!filters.tripId||entry.tripId===String(filters.tripId))&&(!filters.entityType||entry.entityType===filters.entityType))}
function getEntry(identity,options={}){const id=typeof identity==='string'?identity:identity?.id;return list(options).find(entry=>String(entry.id)===String(id))||null}
function getDay(date,options={}){return listDays(options).find(day=>day.date===String(date||'').slice(0,10))||null}
function entriesForDate(date,options={}){return getDay(date,options)?.entries||Object.freeze([])}
function listConflicts(options={}){return snapshot(options).conflicts}
function planTrust(identity,options={}){
  const entry=typeof identity==='object'&&identity?.id?identity:getEntry(identity,options);
  if(!entry)return null;
  const metadata=entry.metadata||{},bookingStatus=String(metadata.bookingStatus||'').toLowerCase(),raw=String(bookingStatus||metadata.planTrust||entry.status||entry.lifecycle||'').toLowerCase();
  let label='bestätigt',kind='confirmed';
  if(/draft|ready|forwarded|wait|pending|requested|angefragt|change_requested|cancellation_requested/.test(raw)){label=bookingStatus?'Buchung noch unbestätigt':'wartet auf Antwort';kind='waiting'}
  else if(/cancelled|canceled|storniert/.test(raw)){label='Buchung storniert';kind='cancelled'}
  else if(/declined|abgelehnt|failed/.test(raw)){label='Buchung nicht bestätigt';kind='attention'}
  else if(/vote|proposal|abstimmung/.test(raw)){label='Abstimmung läuft';kind='vote'}
  else if(/suggest|draft|vorschlag/.test(raw)){label='nur vorgeschlagen';kind='suggested'}
  return Object.freeze({entryId:String(entry.id||''),label,kind,planningTrace:metadata.planningTrace||null,providerObservedAt:metadata.providerFacts?.observedAt||null});
}
function routeUncertainty(input={}){return resilience().routeUncertainty(input)}
function rehearseDay(input={}){return resilience().rehearseDay(input)}
function disruptionRecovery(input={}){return resilience().disruptionRecovery(input)}
function destinationTwin(input={}){return resilience().destinationTwin(input)}
function subscribe(listener){if(typeof listener!=='function')throw new TypeError('Journey subscriber must be a function.');ensureBridge();listeners.add(listener);return()=>listeners.delete(listener)}
function resolveSourceEntry(identity){
  const id=typeof identity==='string'?identity:identity?.id;
  const entries=provider().snapshot?.()?.entries||[];
  return entries.find(entry=>String(entry.id)===String(id))||identity||null;
}
async function hydrate(tripId){const result=await provider().hydrate?.(tripId);return emit('hydrate',result)}
async function init(){ensureBridge();await provider().init?.();return emit('init')}
async function recordEvent(input={}){const result=await provider().record?.(input);emit('record-event',result);return result}
async function removeEntry(identity,options={}){const result=await provider().removeEntry?.(resolveSourceEntry(identity),options);emit('remove-entry');return result}
async function clearEntries(options={}){const result=await provider().clearEntries?.(options);emit('clear-entries',result);return result}
async function removePhotoMemoryByCluster(clusterId,options={}){const result=await provider().removePhotoMemoryByCluster?.(clusterId,options);emit('remove-photo-memory');return result}
function openPhotoMemory(identity,node){return provider().openPhotoMemory?.(resolveSourceEntry(identity),node)}
function editEntry(identity,onDone){
  if(onDone&&typeof onDone==='object')return applySchedule(identity,onDone);
  return provider().editEntry?.(resolveSourceEntry(identity),updates=>{emit('edit-entry');onDone?.(updates)});
}
function scheduleEditable(identity){return domain().scheduleEditable(typeof identity==='object'?identity:getEntry(identity))}
function previewSchedule(identity,input={}){
  const entry=getEntry(identity),trip=activeTrip();
  if(!entry)throw new Error('Der Timeline-Eintrag ist nicht mehr verfügbar.');
  const start=new Date(input.startAt),localDate=Number.isNaN(start.getTime())?'':start.toLocaleDateString('sv-SE'),end=new Date(start.getTime()+Number(input.durationMinutes)*60000),localEndDate=Number.isNaN(end.getTime())?'':end.toLocaleDateString('sv-SE');
  return domain().previewSchedule({...input,localDate,localEndDate,entry,trip,entries:snapshot({trip}).entries});
}
function scheduleRecovery(identity){
  const entry=typeof identity==='object'?identity:getEntry(identity),receipt=entry?.metadata?.scheduleRecovery;
  if(!receipt||receipt.entryId!==entry.id||!receipt.before?.startAt||receipt.after?.startAt!==entry.startAt||Number(receipt.after?.durationMinutes)!==entry.durationMinutes)return null;
  return Object.freeze({...receipt,entryId:entry.id,title:entry.title,expectedRevision:entry.sourceRevision});
}
const schedulePending=new Map();
async function applySchedule(identity,input={}){
  const id=typeof identity==='string'?identity:identity?.id,operationId=String(input.operationId||'');
  if(input.confirmed!==true||!operationId)throw new Error('Bitte die Zeitänderung zuerst prüfen und bestätigen.');
  if(schedulePending.has(id)){
    const pending=schedulePending.get(id);
    if(pending.operationId===operationId)return pending.promise;
    throw new Error('Für diesen Eintrag wird gerade eine Änderung gespeichert.');
  }
  const promise=(async()=>{
    const original=getEntry(id),trip=activeTrip();
    if(!original||original.tripId!==String(trip?.id||trip?.tripId||''))throw new Error('Bitte den Eintrag in der aktiven Reise erneut öffnen.');
    await hydrate(original.tripId);
    const entry=getEntry(id);
    if(entry?.metadata?.scheduleRecovery?.operationId===operationId)return entry.metadata.scheduleRecovery;
    if(!entry||!input.expectedRevision||entry.sourceRevision!==input.expectedRevision)throw new Error('Der Eintrag wurde inzwischen geändert. Bitte erneut prüfen.');
    const bookings=globalThis.LuviaBookingContractV1?.reads?.listForTrip;
    if(!bookings)throw new Error('Der Buchungsstatus kann gerade nicht geprüft werden. Bitte erneut versuchen.');
    const rows=await bookings(entry.tripId);
    if((rows||[]).some(row=>(entry.tripPlaceId&&String(row.trip_place_id||row.tripPlaceId||'')===entry.tripPlaceId)||(entry.placeId&&String(row.place_id||row.placeId||'')===entry.placeId)))throw new Error('Dieser Ort hat eine Buchung. Bitte „Buchung verwalten“ verwenden.');
    const preview=previewSchedule(id,input);
    if(input.expectedConflictSignature!==undefined&&input.expectedConflictSignature!==JSON.stringify(preview.conflicts))throw new Error('Der Tagesplan hat sich seit der Vorschau geändert. Bitte die Konflikte erneut prüfen.');
    if(preview.conflicts.length&&input.conflictsAccepted!==true)throw new Error('Bitte die angezeigten Zeitkonflikte prüfen und ausdrücklich bestätigen.');
    if(!preview.changed)return Object.freeze({unchanged:true,entryId:id});
    let metadata={...entry.metadata,durationMinutes:preview.after.durationMinutes},receipt;
    if(input.recoveryOperationId){
      const recovery=scheduleRecovery(entry);
      if(!recovery||recovery.operationId!==input.recoveryOperationId||recovery.before.startAt!==preview.after.startAt||Number(recovery.before.durationMinutes)!==preview.after.durationMinutes)throw new Error('Diese Änderung kann nicht mehr unverändert zurückgenommen werden.');
      metadata.scheduleRecovery=null;
      if(recovery.before.hadDuration)metadata.durationMinutes=recovery.before.durationValue;else delete metadata.durationMinutes;
      receipt={operation:'restore-schedule',entryId:id,operationId};
    }else{
      receipt={operation:'restore-schedule',operationId,entryId:id,createdAt:new Date().toISOString(),before:{...preview.before,hadDuration:Object.hasOwn(entry.metadata,'durationMinutes'),durationValue:entry.metadata.durationMinutes??null},after:preview.after};
      metadata.scheduleRecovery=receipt;
    }
    if(String(activeTrip()?.id||activeTrip()?.tripId||'')!==entry.tripId)throw new Error('Die aktive Reise hat gewechselt. Bitte erneut prüfen.');
    const writer=globalThis.LuviaPlacesContractV1?.commands?.plan;if(!writer)unavailable('places.v1 plan');
    await writer({tripId:entry.tripId,tripPlaceId:entry.tripPlaceId,placeId:entry.placeId,providerPlaceId:entry.providerPlaceId,placeType:entry.entityType,expectedUpdatedAt:entry.sourceRevision,fields:{planned_at:preview.after.startAt,metadata}});
    await hydrate(entry.tripId);
    const saved=getEntry(id);
    if(saved?.startAt!==preview.after.startAt||saved?.durationMinutes!==preview.after.durationMinutes)throw new Error('Die Änderung wurde noch nicht bestätigt. Bitte die Timeline neu laden und den Zeitpunkt prüfen.');
    return Object.freeze(receipt);
  })().finally(()=>schedulePending.delete(id));
  schedulePending.set(id,{operationId,promise});return promise;
}
function openPlanningEditor(options,onDone){return provider().openPlanningEditor?.(options,onDone)}
function offlineProvider(){const api=globalThis.LuviaJourneyOfflinePack;if(!api?.save||!api?.remove)unavailable('LuviaJourneyOfflinePack');return api}
function externalNavigation(){const api=globalThis.LuviaPlatformPorts?.get?.('ExternalNavigationPort');if(!api?.open)unavailable('ExternalNavigationPort');return api}
function resolveDayInput(input={}){
  const trip=input.trip||activeTrip();if(!trip?.id&&!trip?.tripId)throw new Error('JOURNEY_TRIP_REQUIRED');
  const date=String(input.date||input.day?.date||'').slice(0,10),day=input.day||getDay(date,{trip});
  if(!date||!day)throw new Error('JOURNEY_DAY_REQUIRED');
  return{trip,day,date};
}
function openExternalLink(input={}){
  if(input.userGesture!==true)throw new Error('JOURNEY_USER_GESTURE_REQUIRED');
  const url=String(input.url||'').trim();if(!/^https?:\/\//i.test(url))throw new Error('JOURNEY_EXTERNAL_URL_INVALID');
  return Object.freeze({opened:Boolean(externalNavigation().open(url)),url,entryId:String(input.entryId||'')||null});
}
function saveOfflinePack(input={}){const value=resolveDayInput(input);return offlineProvider().save(value.trip,value.day)}
function removeOfflinePack(input={}){const value=resolveDayInput(input);return Object.freeze({removed:Boolean(offlineProvider().remove(value.trip,value.date)),tripId:String(value.trip.id||value.trip.tripId),date:value.date})}
async function undo(input={}){
  const operation=String(input.operation||input.receipt?.operation||'');
  if(operation==='restore-schedule'){
    const recovery=scheduleRecovery(input.entryId||input.receipt?.entryId);
    if(!recovery)throw new Error('Für diesen Eintrag gibt es keine unveränderte Zeitänderung zum Zurücknehmen.');
    return applySchedule(recovery.entryId,{...input,startAt:recovery.before.startAt,durationMinutes:recovery.before.durationMinutes,recoveryOperationId:recovery.operationId});
  }
  if(operation==='restore-entry'){
    const entry=input.entry||input.receipt?.before;if(!entry?.id)throw new Error('JOURNEY_UNDO_ENTRY_REQUIRED');
    return Object.freeze({operation,restored:true,result:await recordEvent(entry)});
  }
  if(operation==='remove-entry'){
    const entryId=input.entryId||input.receipt?.entryId;if(!entryId)throw new Error('JOURNEY_UNDO_ENTRY_ID_REQUIRED');
    return Object.freeze({operation,removed:Boolean(await removeEntry(entryId,{reason:'undo'}))});
  }
  throw new Error('JOURNEY_UNDO_OPERATION_UNSUPPORTED');
}

const reads=Object.freeze({snapshot,list,listDays,getEntry,getDay,entriesForDate,listConflicts,planTrust,routeUncertainty,rehearseDay,disruptionRecovery,destinationTwin,subscribe,composeProjection,previewSchedule,scheduleEditable,scheduleRecovery});
const commands=Object.freeze({init,hydrate,recordEvent,removeEntry,clearEntries,removePhotoMemoryByCluster,openPhotoMemory,editEntry,openPlanningEditor,openExternalLink,saveOfflinePack,removeOfflinePack,undo});
const api=Object.freeze({
  contractId:CONTRACT_ID,
  version:VERSION,
  runtimeVersion:RUNTIME_VERSION,
  reads,
  commands,
  events:Object.freeze(['journey.changed']),
  snapshot,list,listDays,getEntry,getDay,entriesForDate,listConflicts,planTrust,routeUncertainty,rehearseDay,disruptionRecovery,destinationTwin,subscribe,composeProjection,
  init,hydrate,record:recordEvent,recordEvent,removeEntry,clearEntries,removePhotoMemoryByCluster,openPhotoMemory,editEntry,openPlanningEditor,openExternalLink,saveOfflinePack,removeOfflinePack,undo,
  diagnostics:()=>{const compatibility=provider().diagnostics?.()||{};return Object.freeze({
    contractId:CONTRACT_ID,
    version:VERSION,
    runtimeVersion:RUNTIME_VERSION,
    ready:Boolean(domain()&&provider()),
    browserlessDomainCore:true,
    resilienceCore:Boolean(globalThis.LuviaJourneyResilienceCoreV1),
    legacyCompatibility:true,
    lastReason,
    subscribers:listeners.size,
    truth:'derived-day-graph-and-conflict-policy',
    foreignDomainTruth:false,
    persistenceOwner:'compatibility-provider',
    cloudAuthoritative:compatibility.cloudAuthoritative===true,
    eventCount:snapshot().summary.entryCount,
    realtime:Boolean(compatibility.realtime),
    metrics:Object.freeze({...compatibility.metrics})
  })}
});

globalThis.LuviaJourneyContractV1=api;
globalThis.LuviaJourneyContract=api;
globalThis.LuviaFeatureFlagRegistry?.register?.({id:'intelligence.s16-03-route-uncertainty',owner:'intelligence',description:'Evidence-bounded route uncertainty without probability claims.',defaultEnabled:true,temporary:true});
globalThis.LuviaFeatureFlagRegistry?.register?.({id:'intelligence.s16-04-day-rehearsal',owner:'intelligence',description:'Read-only day rehearsal derived from the Journey Day Graph.',defaultEnabled:true,temporary:true});
globalThis.LuviaFeatureFlagRegistry?.register?.({id:'intelligence.s16-05-live-disruption-recovery',owner:'intelligence',description:'Owner-originated disruption recovery proposals without automatic Journey or Booking mutation.',defaultEnabled:true,temporary:true});
globalThis.LuviaFeatureFlagRegistry?.register?.({id:'intelligence.s16-07-offline-crdt-plan',owner:'intelligence',description:'Reserved Journey-owned CRDT sync adapter; disabled until owner authorization and migrations are accepted.',defaultEnabled:false,temporary:true});
globalThis.LuviaFeatureFlagRegistry?.register?.({id:'intelligence.s16-08-destination-digital-twin',owner:'intelligence',description:'Expiring derived destination graph built only from owner projections.',defaultEnabled:true,temporary:true});
globalThis.LuviaGlobalContracts?.register?.({
  id:CONTRACT_ID,
  version:VERSION,
  required:false,
  probe:()=>({available:Boolean(globalThis.LuviaJourneyContractV1),detail:'Journey v1 Day Graph owner contract'})
});
})();
