(()=>{
'use strict';

const VERSION='1.2.0';
const clean=value=>String(value??'').trim();
const tripId=trip=>clean(trip?.id||trip?.tripId);
const port=()=>globalThis.LuviaPlatformPorts?.get?.('OfflineCachePort')||null;
const key=(trip,date)=>`journey.day-pack.v1.${tripId(trip)}.${clean(date).slice(0,10)}`;
const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));

function normalizeEntry(entry={}){
  const metadata=entry.metadata||{},links=metadata.links||{},facts=metadata.providerFacts||{},booking=metadata.booking||metadata.bookingReceipt||{},coordinates=metadata.coordinates||null;
  return{
    id:clean(entry.id),title:clean(entry.title),startAt:entry.startAt||null,endAt:entry.endAt||null,durationMinutes:Number(entry.durationMinutes)||null,
    entityType:clean(entry.entityType),status:clean(entry.status||entry.lifecycle),owner:clean(entry.provenance?.owner),description:clean(entry.description||metadata.travelerFit),
    planTrust:clean(metadata.planTrust)||'confirmed',address:clean(metadata.address||facts.formattedAddress)||null,coordinates,
    providerFacts:facts||null,providerObservedAt:clean(facts.observedAt)||null,imageUrl:clean(metadata.imageUrl)||null,
    route:{mapsUrl:clean(links.mapsUrl)||null,transferMinutes:Number(metadata.transferMinutes)||null,arrivalBufferMinutes:Number(metadata.routeBufferMinutes)||null},
    booking:{id:clean(booking.id||metadata.bookingId)||null,status:clean(booking.status||metadata.bookingStatus)||null,confirmationCode:clean(booking.confirmationCode||metadata.bookingConfirmationCode)||null,receiptRef:clean(booking.receiptRef||metadata.bookingReceiptRef)||null},
    links:{mapsUrl:clean(links.mapsUrl)||null,website:clean(links.website)||null,menuUrl:links.menuEvidence==='verified-public-source'||links.menuVerified===true?clean(links.menuUrl)||null:null}
  };
}
function save(trip,day){
  const cache=port();if(!cache?.write)throw new Error('Der Offline-Speicher ist auf diesem Gerät nicht verfügbar.');
  if(!tripId(trip)||!day?.date)throw new Error('Reise und Tag müssen eindeutig sein.');
  const entries=(day.entries||[]).map(normalizeEntry),prior=get(trip,day.date),ownerOperations=entries.map((entry,index)=>({id:`journey-owner:${index+1}:${entry.id}`,actorId:'journey-owner',counter:index+1,entryId:entry.id,kind:'set',fields:entry,createdAt:new Date().toISOString()})),pack={version:VERSION,tripId:tripId(trip),date:day.date,savedAt:new Date().toISOString(),destination:trip?.destination||trip?.destinationName||null,summary:day.summary||{},conflicts:day.conflicts||[],entries,addresses:entries.map(item=>item.address).filter(Boolean),coreRoute:entries.map(item=>({id:item.id,title:item.title,startAt:item.startAt,address:item.address,coordinates:item.coordinates,mapsUrl:item.route.mapsUrl,transferMinutes:item.route.transferMinutes,arrivalBufferMinutes:item.route.arrivalBufferMinutes})),bookingReceipts:entries.map(item=>item.booking).filter(item=>item.id||item.confirmationCode||item.receiptRef),crdtDraft:{contractId:'journey.plan-crdt.v1',ownerSyncRequired:true,baseOperations:ownerOperations,draftOperations:prior?.crdtDraft?.draftOperations||[]}};
  cache.write(key(trip,day.date),pack);globalThis.dispatchEvent(new CustomEvent('luvia:journey-offline-pack-changed',{detail:{tripId:pack.tripId,date:pack.date,status:'saved',savedAt:pack.savedAt}}));return clone(pack);
}
function get(trip,date){return clone(port()?.read?.(key(trip,date),null)||null)}
function remove(trip,date){port()?.remove?.(key(trip,date));globalThis.dispatchEvent(new CustomEvent('luvia:journey-offline-pack-changed',{detail:{tripId:tripId(trip),date:clean(date).slice(0,10),status:'removed'}}));return true}
function openDraft(trip,date,{replicaId}={}){
  const cache=port(),pack=get(trip,date),core=globalThis.LuviaJourneyResilienceCoreV1,id=clean(replicaId);
  if(!cache?.write||!pack)throw new Error('Dieses Tagespaket ist noch nicht offline vorbereitet.');
  if(!core?.createReplica||!id)throw new Error('Die Offline-Planreplik ist noch nicht bereit.');
  const replica=core.createReplica({replicaId:id,operations:[...(pack.crdtDraft?.baseOperations||[]),...(pack.crdtDraft?.draftOperations||[])]});
  const persist=()=>{const all=replica.operations(),baseIds=new Set((pack.crdtDraft?.baseOperations||[]).map(item=>item.id));pack.crdtDraft={...pack.crdtDraft,draftOperations:all.filter(item=>!baseIds.has(item.id)),ownerSyncRequired:true};cache.write(key(trip,date),pack)};
  return Object.freeze({contractId:'journey.plan-crdt.v1',replicaId:id,set(entryId,fields){const value=replica.set(entryId,fields);persist();return value},remove(entryId){const value=replica.remove(entryId);persist();return value},merge(operations){const value=replica.merge(operations);persist();return value},snapshot:replica.snapshot,operations:replica.operations,pending:()=>pack.crdtDraft.draftOperations.length,ownerSyncRequired:true});
}
function status(trip,date){const pack=get(trip,date);return{available:Boolean(port()),saved:Boolean(pack),savedAt:pack?.savedAt||null,entryCount:pack?.entries?.length||0,addressCount:pack?.addresses?.length||0,routeStopCount:pack?.coreRoute?.length||0,bookingReceiptCount:pack?.bookingReceipts?.length||0,mapTilesOffline:false,liveProviderDataOffline:false}}
function diagnostics(){return{version:VERSION,owner:'journey.consumer-cache',domainTruth:false,port:Boolean(port()),scope:'day-projection-route-references-and-crdt-drafts',crdt:'journey.plan-crdt.v1',ownerSyncRequired:true,mapTiles:false,liveProviders:false}}

globalThis.LuviaJourneyOfflinePack=Object.freeze({version:VERSION,save,get,remove,status,openDraft,diagnostics});
})();
