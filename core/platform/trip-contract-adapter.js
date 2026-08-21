(() => {
  'use strict';

  const CONTRACT_ID='trip.v1';
  const VERSION='1';
  const RUNTIME_VERSION='1.0.0';
  const EVENT_PREFIX='luvia:';

  function unavailable(provider){
    const error=new Error(`Trip Contract v1: ${provider} ist nicht verfügbar.`);
    error.code='TRIP_CONTRACT_PROVIDER_UNAVAILABLE';
    error.provider=provider;
    throw error;
  }
  function store(){return window.LuviaTripStore||unavailable('LuviaTripStore')}
  function context(){return window.LuviaTripContext||unavailable('LuviaTripContext')}
  function creator(){const api=window.LuviaTripCreator;if(!api?.save)unavailable('LuviaTripCreator.save');return api}
  function experience(){const api=window.LuviaTripExperience;if(!api?.update)unavailable('LuviaTripExperience.update');return api}
  function joinFlow(){const api=window.LuviaJoinFlow;if(!api?.join)unavailable('LuviaJoinFlow.join');return api}
  const clean=value=>value==null?null:String(value);
  const coordinate=value=>value==null||value===''?null:(Number.isFinite(Number(value))?Number(value):null);
  const freezeArray=items=>Object.freeze(items);

  function destinationProjection(input){
    if(!input||typeof input!=='object')return null;
    return Object.freeze({
      name:clean(input.name)||'',
      formattedAddress:clean(input.formattedAddress)||'',
      country:clean(input.country)||'',
      countryCode:clean(input.countryCode)||'',
      placeId:clean(input.placeId)||'',
      latitude:coordinate(input.latitude),
      longitude:coordinate(input.longitude),
      timezone:clean(input.timezone)||''
    });
  }

  function tripProjection(input){
    if(!input||typeof input!=='object')return null;
    const id=clean(input.id||input.tripId||input.trip_id);
    if(!id)return null;
    const destination=destinationProjection(typeof input.destination==='object'?input.destination:{name:input.destination||input.destinationName||''});
    return Object.freeze({
      id,
      title:clean(input.title||input.tripName||input.trip_name)||'Unsere Reise',
      destination,
      destinationName:destination?.name||clean(input.destinationName)||'',
      symbol:clean(input.symbol)||'❤️',
      accent:clean(input.accent||input.accent_color||input.color)||'#ee6f83',
      startDate:clean(input.startDate||input.start_date),
      endDate:clean(input.endDate||input.end_date),
      role:clean(input.role),
      isOwner:Boolean(input.isOwner||['owner','admin'].includes(input.role)),
      createdAt:clean(input.createdAt||input.created_at),
      updatedAt:clean(input.updatedAt||input.updated_at),
      lastOpenedAt:clean(input.lastOpenedAt||input.last_opened_at)
    });
  }

  function listTrips(){
    const rows=store().snapshot?.()?.trips||[];
    return freezeArray(rows.map(tripProjection).filter(Boolean));
  }
  function ownedTrip(tripId){
    const id=clean(tripId);
    if(!id)return null;
    return (store().snapshot?.()?.trips||[]).find(trip=>clean(trip?.id||trip?.tripId||trip?.trip_id)===id)||null;
  }
  function getTrip(tripId){
    return tripProjection(ownedTrip(tripId));
  }
  function getActiveTrip(){
    return tripProjection(context().getActiveTrip?.()||store().snapshot?.()?.activeTrip||null);
  }
  function getContext(){
    const source=context().getSnapshot?.()||{};
    const active=getActiveTrip();
    return Object.freeze({
      tripId:active?.id||clean(source.tripId),
      hasActiveTrip:Boolean(active||source.hasActiveTrip),
      tripName:active?.title||clean(source.tripName)||'Unsere Reise',
      destination:active?.destination||destinationProjection(source.destination),
      destinationName:active?.destinationName||clean(source.destinationName)||'',
      symbol:active?.symbol||clean(source.symbol)||'❤️',
      accent:active?.accent||clean(source.accent||source.accent_color||source.color)||'#ee6f83',
      startDate:active?.startDate||clean(source.startDate),
      endDate:active?.endDate||clean(source.endDate),
      role:active?.role||clean(source.role),
      isOwner:active?.isOwner??Boolean(source.isOwner)
    });
  }
  function snapshot(){
    const trips=listTrips(),activeTrip=getActiveTrip(),ctx=getContext();
    return Object.freeze({contractId:CONTRACT_ID,version:VERSION,trips,activeTrip,context:ctx});
  }
  function subscribe(listener){
    if(typeof listener!=='function')throw new TypeError('Trip Contract v1: subscribe(listener) benötigt eine Funktion.');
    return store().subscribe(()=>listener(snapshot()));
  }

  function getRuntimeState(){
    const source=store().snapshot?.()||{};
    const trips=Object.freeze((source.trips||[]).map(tripProjection).filter(Boolean));
    const activeTrip=tripProjection(source.activeTrip||null);
    return Object.freeze({
      trips,
      activeTripId:clean(source.activeTripId),
      activeTrip,
      hasTrips:source.hasTrips==null?trips.length>0:Boolean(source.hasTrips),
      hasActiveTrip:source.hasActiveTrip==null?Boolean(activeTrip):Boolean(source.hasActiveTrip),
      loaded:Boolean(source.loaded)
    });
  }
  function initializeRuntime(options={}){
    store().initialize(options||{});
    return getRuntimeState();
  }
  async function loadRemoteRuntime(client,options={}){
    await store().loadRemote(client,options||{});
    return getRuntimeState();
  }
  function selectActiveTrip(tripId,options={}){
    const id=clean(tripId);
    store().setActive(id||null,options||{});
    return snapshot();
  }
  async function createTrip(input){
    return tripProjection(await creator().save(input||{}));
  }
  async function updateTrip(tripId,patch={}){
    const trip=ownedTrip(tripId);
    if(!trip){const error=new Error('Trip Contract v1: Reise nicht gefunden.');error.code='TRIP_CONTRACT_TRIP_NOT_FOUND';error.tripId=clean(tripId);throw error;}
    return tripProjection(await experience().update(trip,patch||{}));
  }
  function applyResolvedDestination(tripId,destination={}){
    const trip=ownedTrip(tripId);
    if(!trip){const error=new Error('Trip Contract v1: Reise nicht gefunden.');error.code='TRIP_CONTRACT_TRIP_NOT_FOUND';error.tripId=clean(tripId);throw error;}
    const model=destination&&typeof destination==='object'?{...destination}:{name:clean(destination)};
    const destinationName=clean(model.name||model.displayName||trip.destinationName);
    const next={...trip,destination:model,destinationName,updatedAt:new Date().toISOString()};
    store().upsert(next);
    return tripProjection(next);
  }
  async function joinTrip(code,memberName){
    const result=await joinFlow().join(code,memberName);
    const tripId=clean(result?.trip_id||result?.tripId||result?.id); return Object.freeze({joined:Boolean(tripId),tripId});
  }

  function envelope(name,payload={},options={}){
    return Object.freeze({
      name,
      version:VERSION,
      source:'trip',
      occurredAt:new Date().toISOString(),
      tripId:clean(options.tripId),
      entityId:clean(options.entityId),
      payload:Object.freeze({...payload}),
      meta:Object.freeze({correlationId:options.correlationId||null})
    });
  }
  function publish(name,payload={},options={}){
    const detail=envelope(name,payload,options);
    window.dispatchEvent(new CustomEvent(EVENT_PREFIX+name,{detail}));
    return detail;
  }

  let previousActiveId=clean(window.LuviaTripStore?.snapshot?.()?.activeTripId);
  function bridgeTripsChanged(event){
    const state=snapshot();
    const reason=event?.detail?.reason||'changed';
    const currentId=state.context.tripId;
    publish('trip.changed',{reason,trips:state.trips,activeTrip:state.activeTrip,context:state.context},{tripId:currentId,entityId:currentId});
    if(currentId!==previousActiveId){
      publish('trip.active.changed',{reason,previousTripId:previousActiveId,activeTrip:state.activeTrip,context:state.context},{tripId:currentId,entityId:currentId});
      previousActiveId=currentId;
    }
  }
  function bridgeMembershipChanged(event){
    const members=Array.isArray(event?.detail)?event.detail:[];
    const tripId=getContext().tripId;
    publish('trip.membership.changed',{count:members.length},{tripId,entityId:tripId});
  }
  function bridgeTimelineChanged(event){
    const tripId=getContext().tripId;
    publish('trip.timeline.changed',{reason:event?.type||'timeline-changed'},{tripId,entityId:tripId});
  }

  window.addEventListener('luvia:trips-changed',bridgeTripsChanged);
  window.addEventListener('luvia:members-changed',bridgeMembershipChanged);
  window.addEventListener('luvia:timeline-changed',bridgeTimelineChanged);
  window.addEventListener('luvia:timeline-cloud-changed',bridgeTimelineChanged);

  const api=Object.freeze({
    contractId:CONTRACT_ID,
    version:VERSION,
    runtimeVersion:RUNTIME_VERSION,
    reads:Object.freeze({listTrips,getTrip,getActiveTrip,getContext,subscribe}),
    runtime:Object.freeze({getState:getRuntimeState,initialize:initializeRuntime,loadRemote:loadRemoteRuntime}),
    commands:Object.freeze({selectActiveTrip,createTrip,updateTrip,applyResolvedDestination,joinTrip}),
    events:Object.freeze(['trip.changed','trip.active.changed','trip.membership.changed','trip.timeline.changed']),
    listTrips,getTrip,getActiveTrip,getContext,subscribe,
    selectActiveTrip,createTrip,updateTrip,applyResolvedDestination,joinTrip,
    snapshot,
    diagnostics:()=>Object.freeze({
      contractId:CONTRACT_ID,
      version:VERSION,
      runtimeVersion:RUNTIME_VERSION,
      ready:Boolean(window.LuviaTripStore&&window.LuviaTripContext),
      providers:Object.freeze({
        store:Boolean(window.LuviaTripStore),
        context:Boolean(window.LuviaTripContext),
        create:Boolean(window.LuviaTripCreator?.save),
        update:Boolean(window.LuviaTripExperience?.update),
        join:Boolean(window.LuviaJoinFlow?.join)
      })
    })
  });

  window.LuviaTripContractV1=api;
  window.LuviaTripContract=api;
  window.LuviaGlobalContracts?.register?.({
    id:CONTRACT_ID,
    version:VERSION,
    required:false,
    probe:()=>({available:Boolean(window.LuviaTripContractV1&&window.LuviaTripStore&&window.LuviaTripContext),detail:'Trip v1 owner adapter'})
  });
})();
