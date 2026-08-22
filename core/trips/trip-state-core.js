var LuviaTripStateCoreV1=(()=>{'use strict';
const VERSION='1';

function create({now=()=>new Date().toISOString(),beforeChange=()=>{},afterChange=()=>{},onSubscriberError=()=>{}}={}){
  const listeners=new Set();
  let state={trips:[],activeTripId:null,loaded:false};

  const sortTrips=items=>[...items].sort(
    (a,b)=>
      (Date.parse(b.lastOpenedAt||b.updatedAt||b.createdAt||0)||0)-
      (Date.parse(a.lastOpenedAt||a.updatedAt||a.createdAt||0)||0)
  );

  function mergeDestination(previous={},incoming={}){
    const merged={...previous,...incoming};

    for(const [key,value] of Object.entries(merged)){
      if(value===''||value==null){
        const old=previous?.[key];

        if(old!==''&&old!=null){
          merged[key]=old;
        }
      }
    }

    return merged;
  }

  function mergeTrip(previous={},incoming={}){
    const destination=mergeDestination(
      previous.destination||{},
      incoming.destination||{}
    );

    const merged={
      ...previous,
      ...incoming,
      destination,
      destinationName:
        destination.name||
        incoming.destinationName||
        previous.destinationName
    };

    for(const [key,value] of Object.entries(merged)){
      if(
        (value===''||value==null)&&
        previous?.[key]!==''&&
        previous?.[key]!=null
      ){
        merged[key]=previous[key];
      }
    }

    return merged;
  }

  function snapshot(){
    const activeTrip=
      state.trips.find(
        t=>t.id===state.activeTripId
      )||null;

    return Object.freeze({
      trips:[...state.trips],
      activeTripId:state.activeTripId,
      activeTrip,
      hasTrips:state.trips.length>0,
      hasActiveTrip:Boolean(activeTrip),
      loaded:state.loaded
    });
  }

  function publish(reason='changed',detail={}){
    const value=snapshot();
    const meta=Object.freeze({
      reason,
      ...detail
    });

    beforeChange(
      value,
      meta
    );

    for(const fn of listeners){
      try{
        fn(value);
      }
      catch(error){
        onSubscriberError(error);
      }
    }

    afterChange(
      value,
      meta
    );

    return value;
  }

  function initialize(
    {
      trips=[],
      activeTripId=null
    }={},
    {
      silent=false
    }={}
  ){
    const map=new Map();

    for(const trip of trips){
      if(trip?.id){
        map.set(
          trip.id,
          {
            ...(map.get(trip.id)||{}),
            ...trip
          }
        );
      }
    }

    state={
      trips:sortTrips(
        [...map.values()]
      ),
      activeTripId:
        activeTripId||null,
      loaded:true
    };

    if(
      state.activeTripId&&
      !state.trips.some(
        t=>t.id===state.activeTripId
      )
    ){
      state.activeTripId=null;
    }

    return silent
      ?snapshot()
      :publish('initialized');
  }

  function reconcileLegacy({
    trips=[],
    activeTripId=null
  }={}){
    if(
      !trips.length&&
      !activeTripId
    ){
      return snapshot();
    }

    const map=new Map(
      state.trips.map(
        t=>[
          t.id,
          t
        ]
      )
    );

    for(const trip of trips){
      if(trip?.id){
        map.set(
          trip.id,
          {
            ...(map.get(trip.id)||{}),
            ...trip
          }
        );
      }
    }

    state.trips=sortTrips(
      [...map.values()]
    );

    if(activeTripId){
      state.activeTripId=
        activeTripId;
    }

    return publish(
      'legacy-reconciled'
    );
  }

  function upsert(
    trip,
    {
      activate=false,
      notify=true,
      reason='trip-upserted'
    }={}
  ){
    if(!trip?.id){
      throw new Error(
        'Reise-ID fehlt.'
      );
    }

    const i=
      state.trips.findIndex(
        t=>t.id===trip.id
      );

    if(i>=0){
      state.trips[i]=mergeTrip(
        state.trips[i],
        trip
      );
    }
    else{
      state.trips.push(
        trip
      );
    }

    state.trips=sortTrips(
      state.trips
    );

    if(activate){
      state.activeTripId=
        trip.id;
    }

    return notify
      ?publish(reason)
      :snapshot();
  }

  function setActive(
    id,
    {
      touch=true,
      source='user',
      notify=true
    }={}
  ){
    if(!id){
      state.activeTripId=null;

      return notify
        ?publish('trip-cleared')
        :snapshot();
    }

    const trip=
      state.trips.find(
        t=>t.id===id
      );

    if(!trip){
      throw new Error(
        'Die ausgewählte Reise ist nicht verfügbar.'
      );
    }

    if(touch){
      trip.lastOpenedAt=
        now();
    }

    state.activeTripId=id;

    state.trips=sortTrips(
      state.trips
    );

    const reason=
      source==='boot-cloud'
        ?'trip-selected-cloud'
        :'trip-selected';

    return notify
      ?publish(
          reason,
          {
            selectedTrip:trip
          }
        )
      :snapshot();
  }

  function clearActive(options={}){
    return setActive(
      null,
      options
    );
  }

  function replaceRemote(
    remote,
    {
      ignoreLocalActive=false
    }={}
  ){
    const previousActive=
      ignoreLocalActive
        ?null
        :state.activeTripId;

    const cachedById=
      new Map(
        state.trips.map(
          t=>[
            t.id,
            t
          ]
        )
      );

    const incoming=
      sortTrips(
        (remote||[])
          .filter(
            t=>t?.id
          )
      );

    state.trips=
      incoming.map(
        t=>mergeTrip(
          cachedById.get(t.id)||{},
          t
        )
      );

    state.activeTripId=
      state.trips.some(
        t=>t.id===previousActive
      )
        ?previousActive
        :(state.trips[0]?.id||null);

    state.loaded=true;

    return publish(
      'remote-hydrated'
    );
  }

  function mergeRemote(remote){
    for(const trip of remote||[]){
      if(trip?.id){
        upsert(trip);
      }
    }

    if(
      !state.activeTripId&&
      state.trips.length
    ){
      state.activeTripId=
        state.trips[0].id;
    }

    return publish(
      'remote-merged'
    );
  }

  function subscribe(fn){
    listeners.add(fn);

    fn(
      snapshot()
    );

    return()=>listeners.delete(fn);
  }

  return Object.freeze({
    version:VERSION,
    snapshot,
    initialize,
    reconcileLegacy,
    upsert,
    setActive,
    clearActive,
    replaceRemote,
    mergeRemote,
    mergeTrip,
    sortTrips,
    subscribe
  });
}

return Object.freeze({
  version:VERSION,
  create
});
})();
