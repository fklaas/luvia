var LuviaJourneyDomainContractCoreV1=(()=>{
'use strict';

const CONTRACT_ID='journey.v1';
const VERSION='1';
const RUNTIME_VERSION='1.1.0';
const DAY_MS=86400000;
const MAX_DAYS=62;
const DEFAULT_DURATION_MINUTES=60;
const DEFAULT_TRANSFER_MINUTES=15;
const SOURCE_OWNERS=Object.freeze(['booking','journey','media','places','trip']);
const SOURCE_RULES=Object.freeze({
  schedule:Object.freeze({owner:'journey',sourceContract:'journey.legacy-schedule',mutationRoute:'journey.schedule'}),
  event:Object.freeze({owner:'journey',sourceContract:'journey.events.v1',mutationRoute:'journey.event'}),
  'place-data':Object.freeze({owner:'places',sourceContract:'places.v1',mutationRoute:'places.plan'}),
  gps:Object.freeze({owner:'places',sourceContract:'places.v1',mutationRoute:'places.visit'}),
  booking:Object.freeze({owner:'booking',sourceContract:'booking.v1',mutationRoute:'booking.reservation'}),
  memory:Object.freeze({owner:'media',sourceContract:'media.v1',mutationRoute:'media.memory'}),
  trip:Object.freeze({owner:'trip',sourceContract:'trip.v1',mutationRoute:'trip.context'})
});

function immutable(value){
  if(value==null||typeof value!=='object')return value;
  if(Array.isArray(value))return Object.freeze(value.map(immutable));
  return Object.freeze(Object.fromEntries(Object.entries(value).map(([key,item])=>[key,immutable(item)])));
}
function text(value,fallback=''){return String(value??fallback).trim()}
function finite(value,fallback=null){const number=Number(value);return Number.isFinite(number)?number:fallback}
function validIso(value){if(!value)return null;const date=new Date(value);return Number.isNaN(date.getTime())?null:date.toISOString()}
function dateKey(value){const iso=validIso(value);return iso?iso.slice(0,10):null}
function parseDay(value){
  const key=text(value).slice(0,10);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(key))return null;
  const time=Date.parse(`${key}T00:00:00.000Z`);
  return Number.isNaN(time)?null:time;
}
function range(startValue,endValue){
  const start=parseDay(startValue),end=parseDay(endValue);
  if(start==null&&end==null)return[];
  const first=start??end,last=Math.max(first,end??first),days=[];
  for(let time=first;time<=last&&days.length<MAX_DAYS;time+=DAY_MS)days.push(new Date(time).toISOString().slice(0,10));
  return days;
}
function sourceRule(entry={}){
  if(entry.kind==='photo_memory'||entry.entityType==='photo_memory')return SOURCE_RULES.memory;
  const raw=text(entry.source,'event').toLowerCase();
  return SOURCE_RULES[raw]||SOURCE_RULES.event;
}
function endAt(entry,startAt,durationMinutes){
  const explicit=validIso(entry.endAt||entry.end_at);
  if(explicit)return explicit;
  return new Date(Date.parse(startAt)+durationMinutes*60000).toISOString();
}
function normalizeEntry(entry={},index=0){
  const id=text(entry.id||entry.sourceKey||entry.source_key,`journey-entry-${index+1}`);
  const startAt=validIso(entry.startAt||entry.occurredAt||entry.occurred_at||(entry.date&&entry.time?`${entry.date}T${entry.time}:00`:null));
  const explicitEndAt=validIso(entry.endAt||entry.end_at);
  const rule=sourceRule(entry);
  const declaredDuration=finite(entry.durationMinutes??entry.duration_minutes,null);
  const inferredDuration=startAt&&explicitEndAt?Math.round((Date.parse(explicitEndAt)-Date.parse(startAt))/60000):DEFAULT_DURATION_MINUTES;
  const duration=Math.max(0,declaredDuration??inferredDuration);
  const entityType=text(entry.entityType||entry.entity_type,'place');
  const kind=text(entry.kind,entityType==='photo_memory'?'photo_memory':'planned');
  return immutable({
    id,
    sourceId:text(entry.sourceKey||entry.source_key||entry.rowId||entry.row_id||id),
    tripId:text(entry.tripId||entry.trip_id)||null,
    title:text(entry.title,'Reiseeintrag'),
    description:text(entry.description),
    entityType,
    kind,
    source:text(entry.source,'event'),
    startAt,
    endAt:startAt?endAt(entry,startAt,duration):null,
    durationMinutes:duration,
    automatic:Boolean(entry.automatic??entry.isAutomatic??entry.is_automatic),
    place:Object.freeze({
      placeId:text(entry.placeId||entry.place_id)||null,
      tripPlaceId:text(entry.tripPlaceId||entry.trip_place_id)||null,
      providerPlaceId:text(entry.providerPlaceId||entry.provider_place_id)||null
    }),
    placeId:text(entry.placeId||entry.place_id)||null,
    tripPlaceId:text(entry.tripPlaceId||entry.trip_place_id)||null,
    providerPlaceId:text(entry.providerPlaceId||entry.provider_place_id)||null,
    participant:Object.freeze({
      id:text(entry.participantId||entry.participant_id)||null,
      name:text(entry.participantName||entry.participant_name)||null
    }),
    provenance:Object.freeze({
      owner:rule.owner,
      sourceContract:rule.sourceContract,
      mutationRoute:rule.mutationRoute,
      sourceType:text(entry.source,'event'),
      sourceTruthOwnedByJourney:rule.owner==='journey'
    }),
    metadata:immutable(entry.metadata&&typeof entry.metadata==='object'?entry.metadata:{})
  });
}
function dedupe(entries=[]){
  const byId=new Map();
  for(const entry of entries)byId.set(entry.id,entry);
  return [...byId.values()].sort((left,right)=>{
    if(!left.startAt&&!right.startAt)return left.id.localeCompare(right.id);
    if(!left.startAt)return 1;
    if(!right.startAt)return-1;
    return Date.parse(left.startAt)-Date.parse(right.startAt)||left.id.localeCompare(right.id);
  });
}
function conflict(kind,entries,detail={}){
  return immutable({
    id:`${kind}:${entries.map(entry=>entry.id).join(':')}`,
    kind,
    severity:kind==='overlap'?'blocking':'attention',
    entryIds:entries.map(entry=>entry.id),
    ...detail
  });
}
function conflictsFor(entries=[],options={}){
  const minimumTransferMinutes=Math.max(0,finite(options.minimumTransferMinutes,DEFAULT_TRANSFER_MINUTES));
  const conflicts=[];
  for(let index=0;index<entries.length-1;index+=1){
    const current=entries[index],next=entries[index+1];
    if(!current.startAt||!current.endAt||!next.startAt)continue;
    const gapMinutes=Math.round((Date.parse(next.startAt)-Date.parse(current.endAt))/60000);
    if(gapMinutes<0){
      conflicts.push(conflict('overlap',[current,next],{overlapMinutes:Math.abs(gapMinutes)}));
      continue;
    }
    const samePlace=Boolean(current.place.placeId&&current.place.placeId===next.place.placeId);
    if(!samePlace&&gapMinutes<minimumTransferMinutes){
      conflicts.push(conflict('tight-transition',[current,next],{availableMinutes:gapMinutes,minimumMinutes:minimumTransferMinutes}));
    }
  }
  return conflicts;
}
function tripProjection(trip={}){
  return immutable({
    id:text(trip.id||trip.tripId)||null,
    title:text(trip.title||trip.name||trip.tripName,'Unsere Reise'),
    destination:text(trip.destination?.name||trip.destination?.displayName||trip.destination),
    startDate:text(trip.startDate||trip.start_date).slice(0,10)||null,
    endDate:text(trip.endDate||trip.end_date).slice(0,10)||null
  });
}
function dayStatus(day,nowKey){
  if(day.conflicts.length)return'attention';
  if(!day.entries.length)return'open';
  if(day.date===nowKey)return'live';
  return'planned';
}
function openGapsFor(date,entries=[],options={}){
  const startHour=Math.max(0,Math.min(23,finite(options.dayStartHour,8)));
  const endHour=Math.max(startHour+1,Math.min(24,finite(options.dayEndHour,22)));
  const minimum=Math.max(15,finite(options.minimumOpenGapMinutes,45));
  const boundary=hour=>Date.parse(`${date}T${String(hour).padStart(2,'0')}:00:00.000Z`);
  let cursor=boundary(startHour);const end=boundary(endHour),gaps=[];
  for(const entry of entries){
    if(!entry.startAt||!entry.endAt)continue;
    const entryStart=Math.max(boundary(startHour),Date.parse(entry.startAt));
    const entryEnd=Math.min(end,Date.parse(entry.endAt));
    if(entryStart>cursor&&Math.round((entryStart-cursor)/60000)>=minimum)gaps.push({startAt:new Date(cursor).toISOString(),endAt:new Date(entryStart).toISOString(),durationMinutes:Math.round((entryStart-cursor)/60000)});
    cursor=Math.max(cursor,entryEnd);
  }
  if(end>cursor&&Math.round((end-cursor)/60000)>=minimum)gaps.push({startAt:new Date(cursor).toISOString(),endAt:new Date(end).toISOString(),durationMinutes:Math.round((end-cursor)/60000)});
  return gaps.map((gap,index)=>immutable({id:`open-gap:${date}:${index+1}`,...gap,kind:'derived-open-gap',owner:'journey'}));
}
function createDay(date,entries,nowKey,options){
  const conflicts=conflictsFor(entries,options);
  const openGaps=openGapsFor(date,entries,options);
  const plannedMinutes=entries.reduce((sum,entry)=>sum+entry.durationMinutes,0);
  const owners=[...new Set(entries.map(entry=>entry.provenance.owner))].sort();
  const day={
    id:`journey-day:${date}`,
    date,
    entries,
    openGaps,
    conflicts,
    status:'open',
    summary:Object.freeze({entryCount:entries.length,conflictCount:conflicts.length,plannedMinutes,openGapCount:openGaps.length,openMinutes:openGaps.reduce((sum,item)=>sum+item.durationMinutes,0),owners}),
    actions:Object.freeze([
      Object.freeze({id:'open-day',kind:'open-day',date,label:'Tag ansehen'}),
      Object.freeze({id:'ask-luvia',kind:'assistant',date,label:'Tag mit Luvia planen',requiresConfirmation:false})
    ])
  };
  day.status=dayStatus(day,nowKey);
  return immutable(day);
}
function compose(input={}){
  const trip=tripProjection(input.trip||{}),now=validIso(input.now)||new Date(0).toISOString(),nowKey=now.slice(0,10);
  const entries=dedupe((Array.isArray(input.entries)?input.entries:[]).map(normalizeEntry));
  const scheduled=entries.filter(entry=>entry.startAt),unscheduled=entries.filter(entry=>!entry.startAt);
  const byDate=new Map();
  for(const entry of scheduled){const key=dateKey(entry.startAt);if(!byDate.has(key))byDate.set(key,[]);byDate.get(key).push(entry)}
  const keys=new Set([...range(trip.startDate,trip.endDate),...byDate.keys()]);
  const days=[...keys].sort().slice(0,MAX_DAYS).map(key=>createDay(key,byDate.get(key)||[],nowKey,input.policy||{}));
  const conflicts=days.flatMap(day=>day.conflicts);
  const nextEntry=scheduled.find(entry=>Date.parse(entry.startAt)>=Date.parse(now))||null;
  const currentDay=days.find(day=>day.date===nowKey)||null;
  return immutable({
    contractId:CONTRACT_ID,
    version:VERSION,
    runtimeVersion:RUNTIME_VERSION,
    generatedAt:now,
    trip,
    days,
    entries,
    unscheduled,
    currentDay,
    nextEntry,
    conflicts,
    summary:Object.freeze({
      dayCount:days.length,
      plannedDayCount:days.filter(day=>day.entries.length>0).length,
      openDayCount:days.filter(day=>day.entries.length===0).length,
      entryCount:entries.length,
      unscheduledCount:unscheduled.length,
      conflictCount:conflicts.length,
      attentionRequired:conflicts.length>0||unscheduled.length>0
    }),
    provenance:Object.freeze({
      truth:'derived-day-graph-and-conflict-policy',
      sourceContract:text(input.sourceContract,'journey.web-projection'),
      sourceOwners:SOURCE_OWNERS,
      foreignDomainTruth:false,
      persistence:false
    })
  });
}
function diagnostics(){
  return immutable({
    contractId:CONTRACT_ID,
    version:VERSION,
    runtimeVersion:RUNTIME_VERSION,
    browserless:true,
    truth:'derived-day-graph-and-conflict-policy',
    foreignDomainTruth:false,
    persistence:false,
    sourceOwners:SOURCE_OWNERS
  });
}

return Object.freeze({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,compose,diagnostics});
})();
