(() => {
  'use strict';

  const CONTRACT_ID='trip.v1';
  const VERSION='1';
  const RUNTIME_VERSION='1.3.0';
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
  function draftCore(){return globalThis.LuviaTripDraftCoreV1||unavailable('LuviaTripDraftCoreV1')}
  const clean=value=>value==null?null:String(value);
  const coordinate=value=>value==null||value===''?null:(Number.isFinite(Number(value))?Number(value):null);
  const freezeArray=items=>Object.freeze(items);
  const firstTripInFlight=new Map();
  const firstTripReceipts=new Map();

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
      subtitle:clean(input.subtitle)||'',
      joinCode:clean(input.joinCode||input.join_code)||'',
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
      ,modules:freezeArray([...(input.modules||input.selectedModules||[])]),
      composition:Object.freeze({...((input.moduleSettings||input.module_settings||{}).firstTripComposer||{})})
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
  function commitTripSnapshot(trip,options={}){
    const id=clean(trip?.id||trip?.tripId);
    if(!id)throw new Error('Trip command commitTripSnapshot requires a Trip id.');
    store().upsert(trip,options||{});
    return getTrip(id);
  }
  async function createTrip(input){
    return tripProjection(await creator().save(input||{}));
  }
  function firstTripInput(input={},idempotencyKey=''){
    const scopes=draftCore().projectScopes(input),value=scopes.tripInput;
    const destination=destinationProjection(value.destination);
    const title=clean(value.title)?.slice(0,80)||'';
    const modules=[...new Set((Array.isArray(value.modules)?value.modules:[]).map(clean).filter(Boolean))];
    if(!idempotencyKey){const error=new Error('Trip Contract v1: Für die erste Reise ist ein Idempotency-Key erforderlich.');error.code='TRIP_FIRST_IDEMPOTENCY_REQUIRED';throw error;}
    if(!title){const error=new Error('Bitte gib der Reise einen Namen.');error.code='TRIP_FIRST_TITLE_REQUIRED';throw error;}
    if(!destination?.placeId){const error=new Error('Bitte bestätige ein kanonisches Reiseziel.');error.code='TRIP_FIRST_CANONICAL_DESTINATION_REQUIRED';throw error;}
    if(!modules.length){const error=new Error('Bitte aktiviere mindestens einen Reisebaustein.');error.code='TRIP_FIRST_MODULE_REQUIRED';throw error;}
    if(value.scheduleMode!=='flexible'&&value.startDate&&value.endDate&&value.endDate<value.startDate){const error=new Error('Das Rückreisedatum darf nicht vor der Anreise liegen.');error.code='TRIP_FIRST_DATE_RANGE_INVALID';throw error;}
    return {
      title,subtitle:clean(value.subtitle)?.slice(0,120)||'',destination,
      symbol:clean(value.symbol)||'✦',accent:clean(value.accent)||'#ee6f83',
      startDate:value.scheduleMode==='flexible'?null:clean(value.startDate),endDate:value.scheduleMode==='flexible'?null:clean(value.endDate),
      scheduleMode:value.scheduleMode==='flexible'?'flexible':'fixed',flexibility:clean(value.flexibility)||'',
      feelings:[...new Set((Array.isArray(value.feelings)?value.feelings:[]).map(clean).filter(Boolean))].slice(0,3),
      privacy:['private','invite-only'].includes(value.privacy)?value.privacy:'private',participantPlan:value.participantPlan==='invite-after-creation'?'invite-after-creation':'solo-first',
      entryMode:value.entryMode,tripPreferences:value.tripPreferences,
      requestContext:scopes.requestContext,durablePreferenceHandoff:scopes.durablePreferenceHandoff,
      modules,idempotencyKey
    };
  }
  async function createFirstTrip(input={},options={}){
    const idempotencyKey=clean(options.idempotencyKey||input.idempotencyKey)||'';
    if(firstTripReceipts.has(idempotencyKey))return firstTripReceipts.get(idempotencyKey);
    if(firstTripInFlight.has(idempotencyKey))return firstTripInFlight.get(idempotencyKey);
    const task=(async()=>{
      const prepared=firstTripInput(input,idempotencyKey);
      const trip=tripProjection(await creator().save(prepared));
      const active=getActiveTrip();
      if(!trip?.id||active?.id!==trip.id){const error=new Error('Die Reise wurde angelegt, aber nicht als aktive Reise bestätigt.');error.code='TRIP_FIRST_ACTIVATION_UNCONFIRMED';throw error;}
      const receipt=Object.freeze({
        owner:'trip',contractId:CONTRACT_ID,action:'trip.first.create',status:'committed',idempotencyKey,tripId:trip.id,activeTripId:active.id,committedAt:new Date().toISOString(),trip,
        collaborationHandoff:Object.freeze({status:prepared.participantPlan==='invite-after-creation'?'required':'not-requested',owner:'collaboration',contractId:'collaboration.membership.v1',availability:'reserved'}),
        requestContext:prepared.requestContext,
        preferenceHandoff:prepared.durablePreferenceHandoff
      });
      firstTripReceipts.set(idempotencyKey,receipt);
      publish('trip.created',{receipt,trip},{tripId:trip.id,entityId:trip.id,correlationId:idempotencyKey});
      return receipt;
    })();
    firstTripInFlight.set(idempotencyKey,task);
    try{return await task;}finally{firstTripInFlight.delete(idempotencyKey);}
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

  const composition=Object.freeze({
    createDraft(input={}){return draftCore().createDraft(input)},
    updateDraft(draft={},patch={}){return draftCore().updateDraft(draft,patch)},
    deferDraft(draft={}){return draftCore().deferDraft(draft)},
    resumeDraft(draft={}){return draftCore().resumeDraft(draft)},
    validateDraft(draft={}){return draftCore().validateDraft(draft)},
    projectScopes(draft={}){return draftCore().projectScopes(draft)}
  });

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

  let previousActiveId=clean(window.LuviaTripStateReaderV1?.snapshot?.()?.activeTripId);
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
    composition,
    runtime:Object.freeze({getState:getRuntimeState,initialize:initializeRuntime,loadRemote:loadRemoteRuntime}),
    commands:Object.freeze({selectActiveTrip,createTrip,createFirstTrip,updateTrip,applyResolvedDestination,joinTrip,commitTripSnapshot}),
    events:Object.freeze(['trip.created','trip.changed','trip.active.changed','trip.membership.changed','trip.timeline.changed']),
    listTrips,getTrip,getActiveTrip,getContext,subscribe,
    selectActiveTrip,createTrip,createFirstTrip,updateTrip,applyResolvedDestination,joinTrip,
    snapshot,
    diagnostics:()=>Object.freeze({
      contractId:CONTRACT_ID,
      version:VERSION,
      runtimeVersion:RUNTIME_VERSION,
      ready:Boolean(window.LuviaTripStateReaderV1&&window.LuviaTripContext),
      providers:Object.freeze({
        draftCore:Boolean(globalThis.LuviaTripDraftCoreV1),
        store:Boolean(window.LuviaTripStateReaderV1),
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
    probe:()=>({available:Boolean(window.LuviaTripContractV1&&window.LuviaTripStateReaderV1&&window.LuviaTripContext),detail:'Trip v1 owner adapter'})
  });
})();
