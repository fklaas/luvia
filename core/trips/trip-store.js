(()=>{
  'use strict';

  const web=window;
  const stateCoreModule=
    LuviaTripStateCoreV1;

  if(
    !stateCoreModule||
    typeof stateCoreModule.create!=='function'
  ){
    throw new Error(
      'LuviaTripStore requires LuviaTripStateCoreV1 before initialization.'
    );
  }

  const storage=
    ()=>web.LuviaStorage;

  const migrator=
    ()=>web.LuviaLegacyParisMigrator;

  const normalize=
    input=>migrator().normalize(input);

  function persist(
    value,
    {
      mirror=true
    }={}
  ){
    const s=storage();

    s.set(
      s.keys.trips,
      value.trips
    );

    if(value.activeTripId){
      s.setText(
        s.keys.activeTripId,
        value.activeTripId
      );
    }
    else{
      s.remove(
        s.keys.activeTripId
      );
    }

    if(mirror){
      migrator().mirror({
        trips:value.trips,
        activeTripId:value.activeTripId,
        loaded:value.loaded
      });
    }
  }

  function migrationMarker(){
    const s=storage();

    s.set(
      s.keys.migration,
      {
        completedAt:
          new Date().toISOString(),
        source:
          'legacy/paris'
      }
    );
  }

  function events(
    value,
    meta
  ){
    web.dispatchEvent(
      new CustomEvent(
        'luvia:trips-changed',
        {
          detail:{
            ...value,
            reason:meta.reason
          }
        }
      )
    );

    document.dispatchEvent(
      new CustomEvent(
        'luvia:trip-context-changed',
        {
          detail:value
        }
      )
    );
  }

  const stateCore=
    stateCoreModule.create({
      beforeChange(
        value,
        meta
      ){
        persist(value);

        if(
          meta.reason===
          'initialized'
        ){
          migrationMarker();
        }

        if(meta.selectedTrip){
          document.dispatchEvent(
            new CustomEvent(
              'reisezeit:trip-selected',
              {
                detail:
                  migrator().toLegacy(
                    meta.selectedTrip
                  )
              }
            )
          );
        }
      },

      afterChange:
        events,

      onSubscriberError:
        error=>console.warn(
          '[LuviaTripStore]',
          error
        )
    });

  function snapshot(){
    return stateCore.snapshot();
  }

  function initialize({
    silent=false
  }={}){
    const s=storage();

    const legacy=
      migrator().readLegacy();

    const canonical=
      s.get(
        s.keys.trips,
        []
      )||[];

    const map=
      new Map();

    for(const row of [
      ...canonical,
      ...(legacy.trips||[])
    ]){
      const trip=
        normalize(row);

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

    const value=
      stateCore.initialize(
        {
          trips:[
            ...map.values()
          ],
          activeTripId:
            s.getText(
              s.keys.activeTripId,
              ''
            )||
            legacy.activeTripId||
            null
        },
        {
          silent
        }
      );

    if(silent){
      persist(value);
      migrationMarker();
    }

    return value;
  }

  function reconcileLegacy(){
    const legacy=
      migrator().readLegacy();

    return stateCore.reconcileLegacy({
      trips:
        legacy.trips||[],
      activeTripId:
        legacy.activeTripId||null
    });
  }

  function upsert(
    input,
    options={}
  ){
    return stateCore.upsert(
      normalize(input),
      options
    );
  }

  function setActive(
    id,
    options={}
  ){
    return stateCore.setActive(
      id,
      options
    );
  }

  function clearActive(){
    return stateCore.clearActive();
  }

  async function loadRemote(
    client,
    {
      authoritative=true,
      ignoreLocalActive=false
    }={}
  ){
    let rows=[];

    try{
      rows=
        await web
          .LuviaLegacyParisCloud
          .listTrips(
            client
          );
    }
    catch(error){
      if(
        !stateCore
          .snapshot()
          .trips
          .length
      ){
        throw error;
      }

      console.warn(
        '[LuviaTripStore] Remote-Liste nicht verfügbar, lokaler Cache bleibt als Offline-Fallback aktiv.',
        error
      );

      return snapshot();
    }

    let remote=
      stateCore.sortTrips(
        (rows||[])
          .map(normalize)
          .filter(
            t=>t?.id
          )
      );

    if(authoritative){
      const cached=
        new Map(
          snapshot()
            .trips
            .map(
              t=>[
                t.id,
                t
              ]
            )
        );

      for(
        let i=0;
        i<remote.length;
        i++
      ){
        const cloudTrip=
          remote[i];

        const local=
          cached.get(
            cloudTrip.id
          );

        const cloudIncomplete=
          !cloudTrip.destination?.name||
          !cloudTrip.destination?.country||
          !cloudTrip.startDate||
          !cloudTrip.endDate;

        const cacheComplete=
          Boolean(
            local?.destination?.name&&
            (
              local.destination.country||
              local.destination.placeId
            )&&
            local.startDate&&
            local.endDate
          );

        if(
          cloudIncomplete&&
          cacheComplete
        ){
          try{
            await web
              .LuviaLegacyParisCloud
              .saveProfile(
                client,
                local
              );

            remote[i]=
              stateCore.mergeTrip(
                cloudTrip,
                local
              );

            console.info(
              '[LuviaTripStore] Vollständiges lokales Reiseprofil einmalig nach Supabase repariert.',
              cloudTrip.id
            );
          }
          catch(error){
            console.warn(
              '[LuviaTripStore] Cloud-Profil konnte nicht repariert werden.',
              error
            );
          }
        }
      }

      return stateCore.replaceRemote(
        remote,
        {
          ignoreLocalActive
        }
      );
    }

    return stateCore.mergeRemote(
      remote.map(normalize)
    );
  }

  window.LuviaTripStore=Object.freeze({
    initialize,
    reconcileLegacy,
    snapshot,
    upsert,
    setActive,
    clearActive,
    loadRemote,
    normalize,

    subscribe:
      fn=>stateCore.subscribe(fn)
  });

  web.LuviaTripStateReaderV1=Object.freeze({
    snapshot,

    subscribe:
      fn=>stateCore.subscribe(fn)
  });
})();
