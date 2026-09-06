(()=>{
'use strict';

const CONTRACT_ID='journey.v1';
const VERSION='1';
const RUNTIME_VERSION='1.8.0-route-buffer-owner';
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
  const composed=domain().compose({
    trip:tripProjection(options.trip),
    entries:Array.isArray(source?.entries)?source.entries.map(entry=>({...entry,calendarDate:entry.startAt&&!Number.isNaN(Date.parse(entry.startAt))?new Date(entry.startAt).toLocaleDateString('sv-SE'):null})):[],
    now:options.now||new Date().toISOString(),
    policy:options.policy||{},
    sourceContract:'journey.web-projection'
  });
  return Object.freeze({...composed,readiness:Object.freeze({hydrated:source?.hydrated===true,loading:source?.loading===true,lastError:source?.lastError||null,lastUpdatedAt:source?.lastUpdatedAt||null})});
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
function entryCapabilities(identity,options={}){const entry=typeof identity==='object'&&identity?.id?identity:getEntry(identity,options);return entry?domain().entryCapabilities(entry):null}
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
function sourceRemovalRecoveries(options={}){return provider().removalRecoveries?.(options)||[]}
function publicRemovalRecovery(value){
  if(!value)return null;const {ownerMetadata,...recovery}=value;
  return Object.freeze({...recovery,before:Object.freeze({...recovery.before})});
}
function recoveryMatches(value,identity){
  const id=typeof identity==='object'?identity?.recoveryId||identity?.entryId||identity?.tripPlaceId:identity;
  return Boolean(id)&&[value?.recoveryId,value?.entryId,value?.tripPlaceId].some(candidate=>String(candidate||'')===String(id));
}
function sourceRemovalRecovery(identity,options={}){return sourceRemovalRecoveries(options).find(value=>recoveryMatches(value,identity))||null}
function removalRecoveries(options={}){return Object.freeze(sourceRemovalRecoveries(options).map(publicRemovalRecovery))}
function removalRecovery(identity,options={}){return publicRemovalRecovery(sourceRemovalRecovery(identity,options))}
function sourceRemovalRestoreReceipt(identity,options={}){return(provider().removalRestoreReceipts?.(options)||[]).find(value=>recoveryMatches(value,identity))||null}
function previewRemoval(identity){
  const entry=typeof identity==='object'?identity:getEntry(identity),trip=activeTrip();
  if(!entry)throw new Error('Der Timeline-Eintrag ist nicht mehr verfügbar.');
  return domain().previewRemoval({entry,trip});
}
function previewRestore(identity){
  const recovery=removalRecovery(identity),trip=activeTrip();
  if(!recovery)throw new Error('Diese Wiederherstellung ist nicht mehr verfügbar.');
  const event=recovery.source==='event',entry={id:recovery.entryId,sourceId:recovery.rowId,tripId:recovery.tripId,tripPlaceId:recovery.tripPlaceId,placeId:recovery.placeId,providerPlaceId:recovery.providerPlaceId,entityType:recovery.entityType,kind:event?'photo_memory':'planned',source:event?'event':'place-data',dataKey:event?null:'planned_at',sourceRevision:recovery.expectedRevision,title:recovery.before.title,startAt:recovery.before.startAt,durationMinutes:recovery.before.durationMinutes,metadata:event?{mediaIds:recovery.mediaIds||[]}:{}};
  const start=new Date(recovery.before.startAt),localDate=Number.isNaN(start.getTime())?'':start.toLocaleDateString('sv-SE'),end=new Date(start.getTime()+Number(recovery.before.durationMinutes)*60000),localEndDate=Number.isNaN(end.getTime())?'':end.toLocaleDateString('sv-SE');
  const preview=domain().previewSchedule({entry,trip,entries:snapshot({trip}).entries,startAt:recovery.before.startAt,durationMinutes:recovery.before.durationMinutes,localDate,localEndDate});
  return Object.freeze({...preview,recoveryId:recovery.recoveryId,expectedRevision:recovery.expectedRevision});
}
function selectedEntries(ids=[]){return ids.map(id=>getEntry(id)).filter(Boolean)}
function previewConnectionReorder(input={}){
  const orderIds=(input.orderIds||input.entryIds||[]).map(String),entries=selectedEntries(orderIds),trip=activeTrip();
  return domain().previewConnectionPlan({trip,entries,allEntries:snapshot({trip}).entries,orderIds,operation:'connect-and-reorder'});
}
function connectionRecoveries(options={}){
  const groups=new Map();
  for(const entry of list(options)){
    const recovery=entry.metadata?.timelineConnectionRecovery,connection=entry.metadata?.timelineConnection;
    if(!recovery?.operationId||connection?.operationId!==recovery.operationId)continue;
    const key=String(recovery.connectionId||connection.connectionId||recovery.operationId);
    if(!groups.has(key))groups.set(key,{recoveryId:key,connectionId:key,operationId:recovery.operationId,tripId:entry.tripId,memberIds:[...(recovery.memberIds||connection.memberIds||[])],createdAt:recovery.createdAt,members:[],expectedRevisions:{}});
    const group=groups.get(key);group.members.push({entryId:entry.id,title:entry.title,currentStartAt:entry.startAt,currentDurationMinutes:entry.durationMinutes,before:{...(recovery.before||{})}});group.expectedRevisions[entry.id]=entry.sourceRevision;
  }
  return Object.freeze([...groups.values()].filter(group=>group.memberIds.length>=2&&group.memberIds.every(id=>group.members.some(member=>member.entryId===id))).map(group=>Object.freeze({...group,memberIds:Object.freeze([...group.memberIds]),members:Object.freeze(group.members.map(member=>Object.freeze({...member,before:Object.freeze({...member.before})}))),expectedRevisions:Object.freeze({...group.expectedRevisions})})));
}
function connectionRecovery(identity,options={}){const id=typeof identity==='object'?identity.recoveryId||identity.connectionId||identity.operationId:identity;return connectionRecoveries(options).find(item=>[item.recoveryId,item.connectionId,item.operationId].some(value=>String(value)===String(id)))||null}
function connectionRestoreReceipt(identity,operationId){
  const id=String(identity||'');
  for(const entry of list()){
    const receipt=entry.metadata?.timelineConnectionLastRestore;
    if(receipt&&[receipt.connectionId,receipt.recoveryId,receipt.groupOperationId].some(value=>String(value||'')===id)&&(!operationId||receipt.operationId===operationId))return Object.freeze({...receipt,replayed:true});
  }
  return null;
}
function previewConnectionRestore(identity){
  const recovery=connectionRecovery(identity),trip=activeTrip();if(!recovery)throw new Error('Diese Gruppenänderung kann nicht mehr unverändert zurückgenommen werden.');
  const entries=selectedEntries(recovery.memberIds),targets=recovery.members.map(member=>({entryId:member.entryId,startAt:member.before.startAt,durationMinutes:member.before.durationMinutes})),orderIds=[...recovery.members].sort((left,right)=>Date.parse(left.before.startAt)-Date.parse(right.before.startAt)).map(member=>member.entryId);
  return Object.freeze({...domain().previewConnectionPlan({trip,entries,allEntries:snapshot({trip}).entries,orderIds,targets,operation:'restore-connection-reorder'}),recoveryId:recovery.recoveryId,groupOperationId:recovery.operationId,expectedRevisions:recovery.expectedRevisions});
}
async function hydrate(tripId){const result=await provider().hydrate?.(tripId);return emit('hydrate',result)}
async function init(){ensureBridge();await provider().init?.();return emit('init')}
async function recordEvent(input={}){const result=await provider().record?.(input);emit('record-event',result);return result}
const removalPending=new Map(),restorePending=new Map();
async function assertNoLinkedBooking(entry){
  if(entry?.source==='event'||!entry?.tripPlaceId&&!entry?.placeId)return;
  const reader=globalThis.LuviaBookingContractV1?.reads?.listForTrip;if(!reader)throw new Error('Der Buchungsstatus kann gerade nicht geprüft werden. Bitte erneut versuchen.');
  const rows=await reader(entry.tripId);
  if((rows||[]).some(row=>(entry.tripPlaceId&&String(row.trip_place_id||row.tripPlaceId||'')===String(entry.tripPlaceId))||(entry.placeId&&String(row.place_id||row.placeId||'')===String(entry.placeId))))throw new Error('Dieser Ort hat eine Buchung. Bitte „Buchung verwalten“ verwenden.');
}
async function writeOwnerEntry(entry,{startAt,metadata,expectedRevision}){
  if(entry.source==='event'){
    const writer=provider().updateJourneyEvent;if(!writer)unavailable('journey event writer');
    return writer(entry,{tripId:entry.tripId,expectedRevision,occurredAt:startAt,metadata});
  }
  const writer=globalThis.LuviaPlacesContractV1?.commands?.plan;if(!writer)unavailable('places.v1 plan');
  return writer({tripId:entry.tripId,tripPlaceId:entry.tripPlaceId,placeId:entry.placeId,providerPlaceId:entry.providerPlaceId,placeType:entry.entityType,expectedUpdatedAt:expectedRevision,fields:{planned_at:startAt,metadata}});
}
async function assertNoLinkedBookings(entries=[]){
  const reader=globalThis.LuviaBookingContractV1?.reads?.listForTrip;if(!reader)throw new Error('Der Buchungsstatus kann gerade nicht geprüft werden. Bitte erneut versuchen.');
  const rows=await reader(entries[0]?.tripId);
  for(const entry of entries)if((rows||[]).some(row=>(entry.tripPlaceId&&String(row.trip_place_id||row.tripPlaceId||'')===String(entry.tripPlaceId))||(entry.placeId&&String(row.place_id||row.placeId||'')===String(entry.placeId))))throw new Error(`„${String(entry.title||'Dieser Ort').replace(/^.*?·\s*/,'')}“ hat eine Buchung. Bitte zuerst „Buchung verwalten“ verwenden.`);
}
async function removePlannedPlace(identity,input={}){
  const id=typeof identity==='string'?identity:identity?.id,operationId=String(input.operationId||'');
  if(input.confirmed!==true||!operationId)throw new Error('Bitte das Entfernen zuerst prüfen und bestätigen.');
  if(removalPending.has(id)){const pending=removalPending.get(id);if(pending.operationId===operationId)return pending.promise;throw new Error('Für diesen Eintrag wird gerade eine Änderung gespeichert.');}
  const promise=(async()=>{
    let original=getEntry(id),existing=sourceRemovalRecovery(id);
    if(!original&&existing?.operationId===operationId)return publicRemovalRecovery(existing);
    if(!original)throw new Error('Der Timeline-Eintrag ist nicht mehr verfügbar.');
    await hydrate(original.tripId);const sourceOriginal=resolveSourceEntry(id);original=getEntry(id);existing=sourceRemovalRecovery(id);
    if(!original&&existing?.operationId===operationId)return publicRemovalRecovery(existing);
    if(!original||!input.expectedRevision||original.sourceRevision!==input.expectedRevision)throw new Error('Der Eintrag wurde inzwischen geändert. Bitte erneut prüfen.');
    const preview=previewRemoval(original);await assertNoLinkedBooking(original);
    if(String(activeTrip()?.id||activeTrip()?.tripId||'')!==String(original.tripId))throw new Error('Die aktive Reise hat gewechselt. Bitte erneut prüfen.');
    const event=original.source==='event',recoveryId=`timeline-remove:${event?original.sourceId:original.tripPlaceId}:${operationId}`,receipt={operation:event?'restore-photo-memory-moment':'restore-planned-place',recoveryId,operationId,entryId:original.id,rowId:event?original.sourceId:null,source:original.source,tripId:original.tripId,tripPlaceId:original.tripPlaceId,placeId:original.placeId,providerPlaceId:original.providerPlaceId,entityType:original.entityType,dataKey:event?null:'planned_at',mediaIds:event?[...(original.metadata?.mediaIds||[])]:[],removedAt:new Date().toISOString(),before:{...preview.before}};
    const ownerMetadata=sourceOriginal?.fields?.metadata&&typeof sourceOriginal.fields.metadata==='object'?sourceOriginal.fields.metadata:original.metadata;
    await writeOwnerEntry(original,{startAt:event?original.startAt:null,expectedRevision:original.sourceRevision,metadata:{...ownerMetadata,timelineRemovalRecovery:receipt,timelineRemovalLastRestore:null}});
    await hydrate(original.tripId);const saved=sourceRemovalRecovery(recoveryId);
    if(!saved||getEntry(id))throw new Error('Das Entfernen wurde noch nicht bestätigt. Bitte die Timeline neu laden und den Eintrag prüfen.');
    return publicRemovalRecovery(saved);
  })().finally(()=>removalPending.delete(id));
  removalPending.set(id,{operationId,promise});return promise;
}
async function restoreRemovedEntry(identity,input={}){
  const operationId=String(input.operationId||''),initial=sourceRemovalRecovery(identity),past=sourceRemovalRestoreReceipt(identity,{tripId:input.tripId});
  if(input.confirmed!==true||!operationId)throw new Error('Bitte die Wiederherstellung zuerst prüfen und bestätigen.');
  if(!initial&&past?.operationId===operationId)return Object.freeze({...past,replayed:true});
  if(!initial)throw new Error('Diese Wiederherstellung ist nicht mehr verfügbar.');
  const key=initial.recoveryId;if(restorePending.has(key)){const pending=restorePending.get(key);if(pending.operationId===operationId)return pending.promise;throw new Error('Diese Wiederherstellung wird gerade gespeichert.');}
  const promise=(async()=>{
    await hydrate(initial.tripId);let recovery=sourceRemovalRecovery(key),last=sourceRemovalRestoreReceipt(key,{tripId:initial.tripId});
    if(!recovery&&last?.operationId===operationId)return Object.freeze({...last,replayed:true});
    if(!recovery||!input.expectedRevision||recovery.expectedRevision!==input.expectedRevision)throw new Error('Der entfernte Eintrag wurde inzwischen geändert. Bitte die Timeline neu laden.');
    const preview=previewRestore(key);
    if(input.expectedConflictSignature!==undefined&&input.expectedConflictSignature!==JSON.stringify(preview.conflicts))throw new Error('Der Tagesplan hat sich seit der Vorschau geändert. Bitte die Konflikte erneut prüfen.');
    if(preview.conflicts.length&&input.conflictsAccepted!==true)throw new Error('Bitte die angezeigten Zeitkonflikte prüfen und ausdrücklich bestätigen.');
    await assertNoLinkedBooking(recovery);
    if(String(activeTrip()?.id||activeTrip()?.tripId||'')!==String(recovery.tripId))throw new Error('Die aktive Reise hat gewechselt. Bitte erneut prüfen.');
    const restoreReceipt={operation:recovery.source==='event'?'restore-photo-memory-moment':'restore-planned-place',recoveryId:key,operationId,removalOperationId:recovery.operationId,entryId:recovery.entryId,tripId:recovery.tripId,tripPlaceId:recovery.tripPlaceId,restoredAt:new Date().toISOString(),restoredStartAt:recovery.before.startAt,mediaIdsPreserved:recovery.source==='event'};
    const recoveryEntry={...recovery,id:recovery.entryId,sourceId:recovery.rowId,source:recovery.source||'place-data',startAt:recovery.before.startAt,metadata:recovery.ownerMetadata||{}};
    await writeOwnerEntry(recoveryEntry,{startAt:recovery.before.startAt,expectedRevision:recovery.expectedRevision,metadata:{...(recovery.ownerMetadata||{}),timelineRemovalRecovery:null,timelineRemovalLastRestore:restoreReceipt}});
    await hydrate(recovery.tripId);const restored=getEntry(recovery.entryId);
    if(!restored||restored.startAt!==recovery.before.startAt||sourceRemovalRecovery(key))throw new Error('Die Wiederherstellung wurde noch nicht bestätigt. Bitte die Timeline neu laden.');
    return Object.freeze(restoreReceipt);
  })().finally(()=>restorePending.delete(key));
  restorePending.set(key,{operationId,promise});return promise;
}
const connectionPending=new Map(),connectionRestorePending=new Map();
async function connectAndReorderEntries(input={}){
  const operationId=String(input.operationId||''),orderIds=(input.orderIds||input.entryIds||[]).map(String),key=orderIds.slice().sort().join('|');
  if(input.confirmed!==true||!operationId)throw new Error('Bitte Verbindung und Reihenfolge zuerst prüfen und bestätigen.');
  if(connectionPending.has(key)){const pending=connectionPending.get(key);if(pending.operationId===operationId)return pending.promise;throw new Error('Diese Timeline-Momente werden gerade gespeichert.');}
  const promise=(async()=>{
    const initial=selectedEntries(orderIds);if(initial.length!==orderIds.length)throw new Error('Mindestens ein ausgewählter Timeline-Moment ist nicht mehr verfügbar.');
    const tripId=initial[0].tripId;await hydrate(tripId);let entries=selectedEntries(orderIds);
    if(entries.length!==orderIds.length)throw new Error('Mindestens ein ausgewählter Timeline-Moment wurde inzwischen entfernt.');
    if(entries.every(entry=>entry.metadata?.timelineConnection?.operationId===operationId))return Object.freeze({operation:'connect-and-reorder',operationId,connectionId:entries[0].metadata.timelineConnection.connectionId,entryIds:Object.freeze([...orderIds]),replayed:true});
    const preview=previewConnectionReorder({orderIds}),expected=input.expectedRevisions||{};
    for(const entry of entries)if(!expected[entry.id]||expected[entry.id]!==entry.sourceRevision)throw new Error(`„${String(entry.title||'Ein Eintrag').replace(/^.*?·\s*/,'')}“ wurde inzwischen geändert. Bitte die Vorschau neu öffnen.`);
    if(input.expectedConflictSignature!==undefined&&input.expectedConflictSignature!==JSON.stringify(preview.conflicts))throw new Error('Der Tagesplan hat sich seit der Vorschau geändert. Bitte die Konflikte erneut prüfen.');
    if(preview.conflicts.length&&input.conflictsAccepted!==true)throw new Error('Bitte die angezeigten Zeitkonflikte prüfen und ausdrücklich bestätigen.');
    await assertNoLinkedBookings(entries);if(String(activeTrip()?.id||activeTrip()?.tripId||'')!==String(tripId))throw new Error('Die aktive Reise hat gewechselt. Bitte erneut prüfen.');
    const connectionId=String(input.connectionId||`timeline-connection:${operationId}`),createdAt=new Date().toISOString(),writer=globalThis.LuviaPlacesContractV1?.commands?.plan;if(!writer)unavailable('places.v1 plan');const applied=[];
    try{
      for(const target of preview.after){
        const entry=entries.find(item=>item.id===target.entryId),source=resolveSourceEntry(entry.id),ownerMetadata=source?.fields?.metadata&&typeof source.fields.metadata==='object'?source.fields.metadata:entry.metadata||{},before=preview.before.find(item=>item.entryId===entry.id),connection={connectionId,operationId,memberIds:[...orderIds],order:target.order,memberCount:orderIds.length,updatedAt:createdAt},recovery={operation:'restore-connection-reorder',connectionId,operationId,memberIds:[...orderIds],createdAt,before:{startAt:before.startAt,durationMinutes:before.durationMinutes,hadDuration:Object.hasOwn(ownerMetadata,'durationMinutes'),durationValue:ownerMetadata.durationMinutes??null,connection:ownerMetadata.timelineConnection||null},after:{startAt:target.startAt,durationMinutes:target.durationMinutes,order:target.order}};
        await writer({tripId:entry.tripId,tripPlaceId:entry.tripPlaceId,placeId:entry.placeId,providerPlaceId:entry.providerPlaceId,placeType:entry.entityType,expectedUpdatedAt:entry.sourceRevision,fields:{planned_at:target.startAt,metadata:{...ownerMetadata,durationMinutes:target.durationMinutes,timelineConnection:connection,timelineConnectionRecovery:recovery,timelineConnectionLastRestore:null}}});applied.push(entry.id);
      }
    }catch(cause){await hydrate(tripId).catch(()=>{});const error=new Error(`${applied.length} von ${orderIds.length} Timeline-Momenten wurden gespeichert. Bitte neu laden; Luvia zeigt den tatsächlichen Stand und überschreibt nichts still.`);error.code='JOURNEY_PARTIAL_GROUP_WRITE';error.appliedEntryIds=applied;error.cause=cause;throw error}
    await hydrate(tripId);entries=selectedEntries(orderIds);if(entries.some(entry=>entry.metadata?.timelineConnection?.operationId!==operationId)||preview.after.some(target=>entries.find(entry=>entry.id===target.entryId)?.startAt!==target.startAt))throw new Error('Die gemeinsame Reihenfolge wurde noch nicht vollständig bestätigt. Bitte die Timeline neu laden.');
    return Object.freeze({operation:'connect-and-reorder',operationId,connectionId,entryIds:Object.freeze([...orderIds]),appliedEntryIds:Object.freeze([...applied]),createdAt});
  })().finally(()=>connectionPending.delete(key));connectionPending.set(key,{operationId,promise});return promise;
}
async function restoreConnectionReorder(identity,input={}){
  const operationId=String(input.operationId||''),initial=connectionRecovery(identity),past=connectionRestoreReceipt(identity,operationId);
  if(input.confirmed!==true||!operationId)throw new Error('Bitte die Rücknahme zuerst prüfen und bestätigen.');if(!initial&&past)return past;if(!initial)throw new Error('Diese Gruppenänderung kann nicht mehr unverändert zurückgenommen werden.');
  const key=initial.connectionId;if(connectionRestorePending.has(key)){const pending=connectionRestorePending.get(key);if(pending.operationId===operationId)return pending.promise;throw new Error('Diese Rücknahme wird gerade gespeichert.');}
  const promise=(async()=>{
    await hydrate(initial.tripId);const recovery=connectionRecovery(key),replayed=connectionRestoreReceipt(key,operationId);if(!recovery&&replayed)return replayed;if(!recovery)throw new Error('Die Gruppenänderung wurde inzwischen geändert. Bitte neu laden.');
    const preview=previewConnectionRestore(key),entries=selectedEntries(recovery.memberIds),expected=input.expectedRevisions||{};for(const entry of entries)if(!expected[entry.id]||expected[entry.id]!==entry.sourceRevision)throw new Error('Mindestens ein verbundener Moment wurde inzwischen geändert. Bitte neu laden.');
    if(input.expectedConflictSignature!==undefined&&input.expectedConflictSignature!==JSON.stringify(preview.conflicts))throw new Error('Der Tagesplan hat sich seit der Vorschau geändert. Bitte die Konflikte erneut prüfen.');if(preview.conflicts.length&&input.conflictsAccepted!==true)throw new Error('Bitte die angezeigten Zeitkonflikte prüfen und ausdrücklich bestätigen.');
    await assertNoLinkedBookings(entries);if(String(activeTrip()?.id||activeTrip()?.tripId||'')!==String(recovery.tripId))throw new Error('Die aktive Reise hat gewechselt. Bitte erneut prüfen.');
    const restoredAt=new Date().toISOString(),restoreReceipt={operation:'restore-connection-reorder',operationId,connectionId:key,recoveryId:key,groupOperationId:recovery.operationId,memberIds:[...recovery.memberIds],restoredAt},writer=globalThis.LuviaPlacesContractV1?.commands?.plan;if(!writer)unavailable('places.v1 plan');const applied=[];
    try{
      for(const member of recovery.members){
        const entry=entries.find(item=>item.id===member.entryId),source=resolveSourceEntry(entry.id),metadata=source?.fields?.metadata&&typeof source.fields.metadata==='object'?{...source.fields.metadata}:{...entry.metadata},before=member.before;if(before.hadDuration)metadata.durationMinutes=before.durationValue;else delete metadata.durationMinutes;metadata.timelineConnection=before.connection||null;metadata.timelineConnectionRecovery=null;metadata.timelineConnectionLastRestore=restoreReceipt;
        await writer({tripId:entry.tripId,tripPlaceId:entry.tripPlaceId,placeId:entry.placeId,providerPlaceId:entry.providerPlaceId,placeType:entry.entityType,expectedUpdatedAt:entry.sourceRevision,fields:{planned_at:before.startAt,metadata}});applied.push(entry.id);
      }
    }catch(cause){await hydrate(recovery.tripId).catch(()=>{});const error=new Error(`${applied.length} von ${recovery.memberIds.length} Rücknahmen wurden gespeichert. Bitte neu laden und den tatsächlichen Stand prüfen.`);error.code='JOURNEY_PARTIAL_GROUP_RESTORE';error.appliedEntryIds=applied;error.cause=cause;throw error}
    await hydrate(recovery.tripId);const restored=selectedEntries(recovery.memberIds);if(recovery.members.some(member=>restored.find(entry=>entry.id===member.entryId)?.startAt!==member.before.startAt)||connectionRecovery(key))throw new Error('Die frühere Reihenfolge wurde noch nicht vollständig bestätigt. Bitte neu laden.');return Object.freeze(restoreReceipt);
  })().finally(()=>connectionRestorePending.delete(key));connectionRestorePending.set(key,{operationId,promise});return promise;
}
async function removeEntry(identity,options={}){const source=resolveSourceEntry(identity);if(domain().removalEditable(source)||sourceRemovalRecovery(identity))return removePlannedPlace(source,options);const result=await provider().removeEntry?.(source,options);emit('remove-entry');return result}
async function clearEntries(options={}){const result=await provider().clearEntries?.(options);emit('clear-entries',result);return result}
async function removePhotoMemoryByCluster(clusterId,options={}){const result=await provider().removePhotoMemoryByCluster?.(clusterId,options);emit('remove-photo-memory');return result}
function openPhotoMemory(identity,node){return provider().openPhotoMemory?.(resolveSourceEntry(identity),node)}
function editEntry(identity,onDone){
  if(onDone&&typeof onDone==='object')return(onDone.changeKind==='route-buffer'||onDone.routeBufferMinutes!=null)?applyRouteBuffer(identity,onDone):applySchedule(identity,onDone);
  return provider().editEntry?.(resolveSourceEntry(identity),updates=>{emit('edit-entry');onDone?.(updates)});
}
function scheduleEditable(identity){return domain().scheduleEditable(typeof identity==='object'?identity:getEntry(identity))}
function previewSchedule(identity,input={}){
  const entry=getEntry(identity),trip=activeTrip();
  if(!entry)throw new Error('Der Timeline-Eintrag ist nicht mehr verfügbar.');
  const start=new Date(input.startAt),localDate=Number.isNaN(start.getTime())?'':start.toLocaleDateString('sv-SE'),end=new Date(start.getTime()+Number(input.durationMinutes)*60000),localEndDate=Number.isNaN(end.getTime())?'':end.toLocaleDateString('sv-SE');
  return domain().previewSchedule({...input,localDate,localEndDate,entry,trip,entries:snapshot({trip}).entries});
}
function routeProjection(entry,input={}){
  const metadata=entry?.metadata||{},evidence=input.routeEvidence||entry?.routeEvidence||metadata.routeEvidence||metadata.routeUncertainty?.evidence||[];
  return routeUncertainty({baseMinutes:Number(input.baseMinutes??entry?.transferMinutes??metadata.transferMinutes)||20,routeMode:input.routeMode||entry?.routeMode||metadata.routeMode||metadata.routeUncertainty?.routeMode||'walking',travelSpeed:input.travelSpeed||metadata.travelSpeed||'balanced',orientationMinutes:Number(input.orientationMinutes??metadata.orientationMinutes)||8,providerConfidence:Number(input.providerConfidence??entry?.routeConfidence??metadata.routeConfidence),weatherRisk:Number(input.weatherRisk??metadata.weatherRisk)||0,disruptionRisk:Number(input.disruptionRisk??metadata.disruptionRisk)||0,seasonRisk:Number(input.seasonRisk??metadata.seasonRisk)||0,timeOfDayRisk:Number(input.timeOfDayRisk??metadata.timeOfDayRisk)||0,evidence,now:input.now});
}
function previewRouteBuffer(identity,input={}){
  const entry=typeof identity==='object'&&identity?.id?getEntry(identity.id)||identity:getEntry(identity);if(!entry)throw new Error('Der Timeline-Eintrag ist nicht mehr verfügbar.');
  const projection=routeProjection(entry,input),requested=Number(input.routeBufferMinutes??projection.recommendedBufferMinutes),routeBufferMinutes=Math.max(5,Math.min(90,Math.round(requested)));
  if(!Number.isFinite(requested))throw new Error('Der neue Zeitpuffer ist ungültig.');
  const present=Object.hasOwn(entry.metadata||{},'routeBufferMinutes'),current=present?Number(entry.metadata.routeBufferMinutes):null;
  return Object.freeze({entryId:entry.id,title:entry.title,expectedRevision:entry.sourceRevision,expectedRouteEvidenceSignature:projection.evidenceSignature,before:Object.freeze({routeBufferMinutes:Number.isFinite(current)?current:null}),after:Object.freeze({routeBufferMinutes}),changed:current!==routeBufferMinutes,routeUncertainty:projection,automaticMutation:false});
}
function scheduleRecovery(identity){
  const entry=typeof identity==='object'?identity:getEntry(identity),receipt=entry?.metadata?.scheduleRecovery;
  if(!receipt||receipt.entryId!==entry.id||!receipt.before?.startAt||receipt.after?.startAt!==entry.startAt||Number(receipt.after?.durationMinutes)!==entry.durationMinutes)return null;
  return Object.freeze({...receipt,entryId:entry.id,title:entry.title,expectedRevision:entry.sourceRevision});
}
const routeBufferPending=new Map();
async function applyRouteBuffer(identity,input={}){
  const id=typeof identity==='string'?identity:identity?.id,operationId=String(input.operationId||'');
  if(input.confirmed!==true||!operationId)throw new Error('Bitte den Zeitpuffer zuerst prüfen und bestätigen.');
  if(routeBufferPending.has(id)){const pending=routeBufferPending.get(id);if(pending.operationId===operationId)return pending.promise;throw new Error('Für diesen Eintrag wird gerade ein Zeitpuffer gespeichert.');}
  const promise=(async()=>{
    const original=getEntry(id),trip=activeTrip();if(!original||original.tripId!==String(trip?.id||trip?.tripId||''))throw new Error('Bitte den Eintrag in der aktiven Reise erneut öffnen.');
    await hydrate(original.tripId);const entry=getEntry(id),replayed=entry?.metadata?.routeBufferRecovery;if(replayed?.operationId===operationId)return Object.freeze({...replayed,replayed:true});
    if(!entry||!input.expectedRevision||entry.sourceRevision!==input.expectedRevision)throw new Error('Der Eintrag wurde inzwischen geändert. Bitte den Zeitpuffer erneut prüfen.');
    const preview=previewRouteBuffer(id,input);if(!input.expectedRouteEvidenceSignature||preview.expectedRouteEvidenceSignature!==input.expectedRouteEvidenceSignature)throw new Error('Die Routenbasis hat sich seit der Vorschau geändert. Bitte Quelle und Zeitpuffer erneut prüfen.');
    if(!preview.changed)return Object.freeze({unchanged:true,entryId:id,operation:'route-buffer'});
    const receipt=Object.freeze({operation:'restore-route-buffer',operationId,entryId:id,createdAt:new Date().toISOString(),before:preview.before,after:preview.after,evidenceSignature:preview.expectedRouteEvidenceSignature});
    const metadata={...(entry.metadata||{}),routeBufferMinutes:preview.after.routeBufferMinutes,routeMode:preview.routeUncertainty.routeMode,routeUncertainty:preview.routeUncertainty,routeBufferRecovery:receipt};
    if(String(activeTrip()?.id||activeTrip()?.tripId||'')!==entry.tripId)throw new Error('Die aktive Reise hat gewechselt. Bitte erneut prüfen.');
    await writeOwnerEntry(entry,{startAt:entry.startAt,expectedRevision:entry.sourceRevision,metadata});await hydrate(entry.tripId);const saved=getEntry(id);
    if(Number(saved?.metadata?.routeBufferMinutes)!==preview.after.routeBufferMinutes||saved?.metadata?.routeBufferRecovery?.operationId!==operationId)throw new Error('Der Zeitpuffer wurde noch nicht bestätigt. Bitte die Timeline neu laden und prüfen.');
    return receipt;
  })().finally(()=>routeBufferPending.delete(id));routeBufferPending.set(id,{operationId,promise});return promise;
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
    await assertNoLinkedBooking(entry);
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
    await writeOwnerEntry(entry,{startAt:preview.after.startAt,expectedRevision:entry.sourceRevision,metadata});
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
  if(['restore-planned-place','restore-photo-memory-moment'].includes(operation))return restoreRemovedEntry(input.recoveryId||input.receipt?.recoveryId,input);
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

const reads=Object.freeze({snapshot,list,listDays,getEntry,getDay,entriesForDate,listConflicts,entryCapabilities,planTrust,routeUncertainty,rehearseDay,disruptionRecovery,destinationTwin,subscribe,composeProjection,previewSchedule,previewRouteBuffer,scheduleEditable,scheduleRecovery,previewRemoval,previewRestore,removalRecoveries,removalRecovery,previewConnectionReorder,connectionRecoveries,connectionRecovery,previewConnectionRestore});
const commands=Object.freeze({init,hydrate,recordEvent,removeEntry,restoreRemovedEntry,connectAndReorderEntries,restoreConnectionReorder,clearEntries,removePhotoMemoryByCluster,openPhotoMemory,editEntry,applyRouteBuffer,openPlanningEditor,openExternalLink,saveOfflinePack,removeOfflinePack,undo});
const api=Object.freeze({
  contractId:CONTRACT_ID,
  version:VERSION,
  runtimeVersion:RUNTIME_VERSION,
  reads,
  commands,
  events:Object.freeze(['journey.changed']),
  snapshot,list,listDays,getEntry,getDay,entriesForDate,listConflicts,entryCapabilities,planTrust,routeUncertainty,rehearseDay,disruptionRecovery,destinationTwin,subscribe,composeProjection,previewRouteBuffer,previewRemoval,previewRestore,removalRecoveries,removalRecovery,previewConnectionReorder,connectionRecoveries,connectionRecovery,previewConnectionRestore,
  init,hydrate,record:recordEvent,recordEvent,removeEntry,restoreRemovedEntry,connectAndReorderEntries,restoreConnectionReorder,clearEntries,removePhotoMemoryByCluster,openPhotoMemory,editEntry,applyRouteBuffer,openPlanningEditor,openExternalLink,saveOfflinePack,removeOfflinePack,undo,
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
