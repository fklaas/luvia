(()=>{
'use strict';

const CONTRACT_ID='journey.v1';
const VERSION='1';
const RUNTIME_VERSION='1.1.0';
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
    entries:Array.isArray(source?.entries)?source.entries:[],
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
function getDay(date,options={}){return listDays(options).find(day=>day.date===String(date||'').slice(0,10))||null}
function entriesForDate(date,options={}){return getDay(date,options)?.entries||Object.freeze([])}
function listConflicts(options={}){return snapshot(options).conflicts}
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
function editEntry(identity,onDone){return provider().editEntry?.(resolveSourceEntry(identity),updates=>{emit('edit-entry');onDone?.(updates)})}
function openPlanningEditor(options,onDone){return provider().openPlanningEditor?.(options,onDone)}

const reads=Object.freeze({snapshot,list,listDays,getDay,entriesForDate,listConflicts,routeUncertainty,rehearseDay,disruptionRecovery,destinationTwin,subscribe,composeProjection});
const commands=Object.freeze({init,hydrate,recordEvent,removeEntry,clearEntries,removePhotoMemoryByCluster,openPhotoMemory,editEntry,openPlanningEditor});
const api=Object.freeze({
  contractId:CONTRACT_ID,
  version:VERSION,
  runtimeVersion:RUNTIME_VERSION,
  reads,
  commands,
  events:Object.freeze(['journey.changed']),
  snapshot,list,listDays,getDay,entriesForDate,listConflicts,routeUncertainty,rehearseDay,disruptionRecovery,destinationTwin,subscribe,composeProjection,
  init,hydrate,record:recordEvent,recordEvent,removeEntry,clearEntries,removePhotoMemoryByCluster,openPhotoMemory,editEntry,openPlanningEditor,
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
