(()=>{
'use strict';

const VERSION='1.0.0';
const clean=value=>String(value??'').trim();
const tripId=trip=>clean(trip?.id||trip?.tripId);
const port=()=>globalThis.LuviaPlatformPorts?.get?.('OfflineCachePort')||null;
const key=(trip,date)=>`journey.day-pack.v1.${tripId(trip)}.${clean(date).slice(0,10)}`;
const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));

function normalizeEntry(entry={}){
  const metadata=entry.metadata||{},links=metadata.links||{};
  return{
    id:clean(entry.id),title:clean(entry.title),startAt:entry.startAt||null,endAt:entry.endAt||null,durationMinutes:Number(entry.durationMinutes)||null,
    entityType:clean(entry.entityType),status:clean(entry.status||entry.lifecycle),owner:clean(entry.provenance?.owner),description:clean(entry.description||metadata.travelerFit),
    providerFacts:metadata.providerFacts||null,imageUrl:clean(metadata.imageUrl)||null,
    links:{mapsUrl:clean(links.mapsUrl)||null,website:clean(links.website)||null,menuUrl:clean(links.menuUrl)||null}
  };
}
function save(trip,day){
  const cache=port();if(!cache?.write)throw new Error('Der Offline-Speicher ist auf diesem Gerät nicht verfügbar.');
  if(!tripId(trip)||!day?.date)throw new Error('Reise und Tag müssen eindeutig sein.');
  const pack={version:VERSION,tripId:tripId(trip),date:day.date,savedAt:new Date().toISOString(),destination:trip?.destination||trip?.destinationName||null,summary:day.summary||{},conflicts:day.conflicts||[],entries:(day.entries||[]).map(normalizeEntry)};
  cache.write(key(trip,day.date),pack);globalThis.dispatchEvent(new CustomEvent('luvia:journey-offline-pack-changed',{detail:{tripId:pack.tripId,date:pack.date,status:'saved',savedAt:pack.savedAt}}));return clone(pack);
}
function get(trip,date){return clone(port()?.read?.(key(trip,date),null)||null)}
function remove(trip,date){port()?.remove?.(key(trip,date));globalThis.dispatchEvent(new CustomEvent('luvia:journey-offline-pack-changed',{detail:{tripId:tripId(trip),date:clean(date).slice(0,10),status:'removed'}}));return true}
function status(trip,date){const pack=get(trip,date);return{available:Boolean(port()),saved:Boolean(pack),savedAt:pack?.savedAt||null,entryCount:pack?.entries?.length||0,mapTilesOffline:false,liveProviderDataOffline:false}}
function diagnostics(){return{version:VERSION,owner:'journey.consumer-cache',domainTruth:false,port:Boolean(port()),scope:'day-projection-and-route-references',mapTiles:false,liveProviders:false}}

globalThis.LuviaJourneyOfflinePack=Object.freeze({version:VERSION,save,get,remove,status,diagnostics});
})();
