var LuviaPlaceRuntimeProjectionCoreV1=(()=>{
'use strict';

const VERSION='1';
const CANONICAL=new Set(['idea','discovered','saved','favorite','planned','reserved','selected','booked','checked_in','checked_out','visited','rated','rejected','archived']);
const STATUS_ALIASES=Object.freeze({favorited:'favorite',dismissed:'rejected',memory:'visited',travel_book:'visited'});
const clean=value=>String(value??'').trim();
const normalizeProvider=value=>clean(value).replace(/^places\//,'');
const normalizeStatus=value=>{
  const candidate=STATUS_ALIASES[clean(value)]||clean(value)||'idea';
  return CANONICAL.has(candidate)?candidate:'idea';
};
const entityLink=entity=>entity?.tripPlace||entity?.trip_place||entity?.rawEntity?.tripPlace||entity?.rawEntity?.trip_place||{};
const entityPlace=entity=>entity?.place||entity?.rawEntity?.place||entity||{};

function create({
  now=()=>Date.now(),
  onChange=()=>{},
  onSubscriberError=()=>{}
}={}){
  const listeners=new Set();
  const trips=new Map();
  let activeTripId='';

  function tripBucket(id){
    const key=clean(id);
    if(!trips.has(key)){
      trips.set(key,{revision:0,types:new Map(),updatedAt:0});
    }
    return trips.get(key);
  }

  function typeBucket(id,type){
    const trip=tripBucket(id);
    const key=clean(type);
    if(!trip.types.has(key)){
      trip.types.set(key,{
        byTripPlaceId:new Map(),
        byProviderId:new Map(),
        dataByTripPlaceId:new Map()
      });
    }
    return trip.types.get(key);
  }

  function normalizeEntity(entity,projection={}){
    const {
      tripId=activeTripId,
      placeType='',
      tripPlaceId:projectedTripPlaceId,
      providerPlaceId:projectedProviderPlaceId,
      placeId:projectedPlaceId,
      isFavorite:projectedFavorite,
      status:projectedStatus
    }=projection;
    const link=entityLink(entity);
    const place=entityPlace(entity);
    const providerPlaceId=normalizeProvider(
      projectedProviderPlaceId||
      place.providerPlaceId||
      place.provider_place_id||
      entity?.providerPlaceId||
      entity?.provider_place_id||
      entity?.sourceId||
      place.id
    );
    const tripPlaceId=clean(projectedTripPlaceId||link.id||entity?.tripPlaceId);

    return {
      tripId:clean(tripId),
      placeType:clean(placeType||link.type||entity?.type),
      tripPlaceId,
      providerPlaceId,
      placeId:clean(projectedPlaceId||place.id||entity?.placeId||link.place_id),
      isFavorite:typeof projectedFavorite==='boolean'
        ?projectedFavorite
        :(
          link.is_favorite===true||
          link.isFavorite===true||
          entity?.is_favorite===true||
          entity?.isFavorite===true
        ),
      status:normalizeStatus(
        projectedStatus||
        link.status||
        link.lifecycle_status||
        entity?.lifecycleStatus||
        'idea'
      ),
      entity
    };
  }

  function emit(detail){
    const id=clean(detail.tripId||activeTripId);
    const bucket=tripBucket(id);
    bucket.revision++;
    bucket.updatedAt=now();
    const payload={version:VERSION,tripId:id,revision:bucket.revision,...detail};

    listeners.forEach(listener=>{
      try{
        listener(payload);
      }catch(error){
        onSubscriberError(error);
      }
    });

    onChange(payload);
    return payload;
  }

  function setActiveTrip(id,{resetForeign=false}={}){
    const nextId=clean(id);
    if(!nextId)return snapshot();
    const previous=activeTripId;
    activeTripId=nextId;
    tripBucket(nextId);
    if(resetForeign&&previous&&previous!==nextId)trips.delete(previous);
    emit({action:'active-trip',previousTripId:previous});
    return snapshot();
  }

  function ingest(placeType,items=[],tripId=activeTripId){
    const bucket=typeBucket(tripId,placeType);
    for(const raw of items||[]){
      const record=normalizeEntity(raw,{tripId,placeType});
      if(!record.tripPlaceId&&!record.providerPlaceId)continue;
      if(record.tripPlaceId)bucket.byTripPlaceId.set(record.tripPlaceId,record);
      if(record.providerPlaceId)bucket.byProviderId.set(record.providerPlaceId,record);
    }
    emit({tripId,placeType,action:'ingest',count:(items||[]).length});
    return records(placeType,tripId);
  }

  function upsert(input){
    const record=normalizeEntity(input.entity||input,input);
    const tripId=record.tripId||activeTripId;
    const bucket=typeBucket(tripId,record.placeType);
    if(record.tripPlaceId)bucket.byTripPlaceId.set(record.tripPlaceId,record);
    if(record.providerPlaceId)bucket.byProviderId.set(record.providerPlaceId,record);
    emit({
      tripId,
      placeType:record.placeType,
      action:'upsert',
      tripPlaceId:record.tripPlaceId,
      providerPlaceId:record.providerPlaceId,
      isFavorite:record.isFavorite
    });
    return record;
  }

  function find({tripId=activeTripId,placeType,tripPlaceId,providerPlaceId}={}){
    const bucket=typeBucket(tripId,placeType);
    return (
      (tripPlaceId&&bucket.byTripPlaceId.get(clean(tripPlaceId)))||
      (providerPlaceId&&bucket.byProviderId.get(normalizeProvider(providerPlaceId)))||
      null
    );
  }

  function patch(query,changes={}){
    const record=find(query);
    if(!record)return null;
    const next={...record,...changes,entity:changes.entity||record.entity};
    const link=entityLink(next.entity);
    if(next.entity&&link){
      if(typeof changes.isFavorite==='boolean'){
        link.is_favorite=changes.isFavorite;
        link.isFavorite=changes.isFavorite;
      }
      if(changes.status){
        link.status=changes.status;
        link.lifecycle_status=changes.status;
      }
    }
    return upsert(next);
  }

  function records(placeType,tripId=activeTripId){
    const bucket=typeBucket(tripId,placeType);
    const seen=new Set();
    const output=[];
    for(const record of bucket.byTripPlaceId.values()){
      output.push(record);
      if(record.providerPlaceId)seen.add(record.providerPlaceId);
    }
    for(const record of bucket.byProviderId.values()){
      if(!seen.has(record.providerPlaceId))output.push(record);
    }
    return output;
  }

  function favorites(placeType,tripId=activeTripId){
    return records(placeType,tripId).filter(record=>record.isFavorite);
  }

  function setData({tripId=activeTripId,placeType,tripPlaceId,data}){
    if(!tripPlaceId)return;
    typeBucket(tripId,placeType).dataByTripPlaceId.set(clean(tripPlaceId),data);
    emit({tripId,placeType,tripPlaceId,action:'data'});
  }

  function getData({tripId=activeTripId,placeType,tripPlaceId}){
    return typeBucket(tripId,placeType).dataByTripPlaceId.get(clean(tripPlaceId))||null;
  }

  function clearTrip(id){
    const tripId=clean(id);
    trips.delete(tripId);
    if(activeTripId===tripId)activeTripId='';
    emit({tripId,action:'clear-trip'});
  }

  function snapshot(id=activeTripId){
    const trip=tripBucket(id);
    const types={};
    for(const [type,bucket] of trip.types){
      types[type]={
        records:records(type,id),
        favorites:favorites(type,id),
        data:[...bucket.dataByTripPlaceId.entries()]
      };
    }
    return {
      version:VERSION,
      activeTripId:id,
      revision:trip.revision,
      updatedAt:trip.updatedAt,
      types
    };
  }

  function subscribe(listener){
    listeners.add(listener);
    return ()=>listeners.delete(listener);
  }

  function diagnostics(){
    let recordCount=0;
    for(const [tripId,trip] of trips){
      for(const type of trip.types.keys()){
        recordCount+=records(type,tripId).length;
      }
    }
    return {
      version:VERSION,
      status:'ready',
      activeTripId,
      trips:trips.size,
      records:recordCount,
      subscribers:listeners.size
    };
  }

  return Object.freeze({
    version:VERSION,
    setActiveTrip,
    ingest,
    upsert,
    patch,
    find,
    records,
    favorites,
    setData,
    getData,
    clearTrip,
    snapshot,
    subscribe,
    normalizeEntity,
    normalizeStatus,
    diagnostics
  });
}

return Object.freeze({version:VERSION,create,normalizeStatus});
})();
