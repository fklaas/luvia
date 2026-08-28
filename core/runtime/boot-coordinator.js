(() => {
  'use strict';
  const win=globalThis;
  const appRuntimeCore=win.LuviaAppRuntimeContractCoreV1;
  if(!appRuntimeCore?.createRuntime)throw new Error('LuviaBootCoordinator requires app-runtime.v1.');
  const appRuntime=win.LuviaAppRuntime||appRuntimeCore.createRuntime();
  win.LuviaAppRuntime=appRuntime;
  const dom=globalThis.document;
  const tripContract=()=>win.LuviaTripContractV1||win.LuviaTripContract||null;
  const tripRuntime=()=>{
    const runtime=tripContract()?.runtime;
    if(!runtime?.getState||!runtime?.initialize||!runtime?.loadRemote)throw new Error('LuviaBootCoordinator requires Trip Contract runtime surface.');
    return runtime;
  };
  const tripCommands=()=>{
    const commands=tripContract()?.commands;
    if(!commands?.selectActiveTrip)throw new Error('LuviaBootCoordinator requires Trip Contract commands.');
    return commands;
  };
  const MIN_SPLASH_MS=1650;
  const warmBoot=Boolean(globalThis.__LUVIA_BOOT_DONE__||dom.documentElement.classList.contains('lv-boot-warm'));
  let startedAt=0,phase=win.__LUVIA_BOOT_DONE__?'ready':'idle',bootPromise=null,backgroundSync=null,snapshot=null;
  const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const emit=(next,detail={})=>{phase=next;dom.documentElement.dataset.luviaBoot=next;win.dispatchEvent(new CustomEvent('luvia:boot-phase',{detail:{phase:next,...detail}}));};
  const progress=(next,detail={})=>win.dispatchEvent(new CustomEvent('luvia:boot-progress',{detail:{phase:next,...detail}}));
  const byId=id=>dom.getElementById(id);
  function splash(){return byId('luviaBootSplash')}
  function exposeApp(){
    const app=byId('app');
    app?.setAttribute('aria-busy','false');
    dom.documentElement.classList.remove('lv-booting','lv-boot-revealing');
    dom.documentElement.dataset.luviaBoot='ready';
  }
  function begin(){if(phase!=='idle')return;startedAt=performance.now();dom.documentElement.classList.add('lv-booting');emit(warmBoot?'rehydrating':'splash');}
  async function finish(){
    if(phase==='ready'){exposeApp();return}
    if(phase==='revealing')return;
    if(win.__LUVIA_BOOT_DONE__){exposeApp();emit('ready',{snapshot,rehydrated:true});return}
    const node=splash();
    if(warmBoot){node?.remove();win.__LUVIA_BOOT_DONE__=true;exposeApp();emit('ready',{snapshot,rehydrated:true});return}
    const remaining=Math.max(0,MIN_SPLASH_MS-(performance.now()-startedAt));
    if(remaining)await delay(remaining);
    emit('revealing');
    dom.documentElement.classList.add('lv-boot-revealing');
    node?.setAttribute('aria-hidden','true');
    await delay(620);
    node?.remove();
    win.__LUVIA_BOOT_DONE__=true;
    exposeApp();
    emit('ready',{snapshot});
  }
  function chooseActiveTrip(){
    const trips=tripRuntime().getState().trips;
    const profile=win.LuviaProfileService.snapshot().profile||{};
    const cloudPreferred=profile.activeTripId;
    const chosen=trips.find(t=>String(t.id||t.tripId)===String(cloudPreferred||''))||trips[0]||null;
    if(chosen&&tripRuntime().getState().activeTripId!==chosen.id)tripCommands().selectActiveTrip(chosen.id,{touch:false,source:'boot-cloud'});
    return {trip:chosen,profile,needsProfileRepair:Boolean(chosen&&String(cloudPreferred||'')!==String(chosen.id||chosen.tripId||''))};
  }
  function captureSnapshot(tripId=null,extra={}){
    snapshot=Object.freeze({auth:(win.LuviaAuth||win.ParisAuth).getState(),profile:win.LuviaProfileService.snapshot(),trips:tripRuntime().getState(),tripId,completedAt:new Date().toISOString(),...extra});
    return snapshot;
  }
  async function synchronizeAuthenticated(client){
    win.dispatchEvent(new CustomEvent('luvia:boot-background-sync',{detail:{state:'started'}}));
    await Promise.all([
      tripRuntime().loadRemote(client,{authoritative:true,ignoreLocalActive:true}),
      win.LuviaProfileService.load(client)
    ]);
    const selected=chooseActiveTrip();
    if(selected.needsProfileRepair)await win.LuviaProfileService.setActiveTrip(selected.trip.id||selected.trip.tripId);
    const tripId=selected.trip?.id||selected.trip?.tripId||null;
    // Remote hydration continues after first paint. It must never replace the
    // visible boot phase, otherwise warm-boot CSS hides an already rendered app.
    progress('cloud-snapshot',{tripId});
    if(tripId){
      await Promise.all([
        win.LuviaTripPlaceData?.hydrate?.(tripId),
        win.LuviaJourneyContractV1?.commands?.hydrate?.(tripId)
      ]);
    }
    const fresh=captureSnapshot(tripId,{source:'cloud-synchronized'});
    win.dispatchEvent(new CustomEvent('luvia:boot-background-sync',{detail:{state:'synchronized',tripId,snapshot:fresh}}));
    win.dispatchEvent(new CustomEvent('luvia:boot-background-synced',{detail:{tripId,snapshot:fresh}}));
    return fresh;
  }
  async function runAuthenticated(client){
    emit('local-profile');
    win.LuviaProfileService.hydrateLocal?.();
    const local=chooseActiveTrip(),localTripId=local.trip?.id||local.trip?.tripId||null;
    captureSnapshot(localTripId,{source:'local-first'});
    backgroundSync=synchronizeAuthenticated(client).catch(error=>{
      console.warn('[LuviaBoot] Hintergrund-Synchronisierung wird später erneut versucht.',error);
      win.dispatchEvent(new CustomEvent('luvia:boot-background-sync',{detail:{state:'deferred',error:error?.message||String(error),snapshot}}));
      return snapshot;
    });
    if(localTripId)return snapshot;
    await Promise.race([backgroundSync,delay(2800)]);
    const recovered=chooseActiveTrip(),recoveredTripId=recovered.trip?.id||recovered.trip?.tripId||null;
    return captureSnapshot(recoveredTripId,{source:recoveredTripId?'cloud-first-session':'local-empty-timebox'});
  }
  async function boot(client){
    if(bootPromise)return bootPromise;
    begin();
    bootPromise=appRuntime.run('domain-context-ready',async()=>{
      tripRuntime().initialize({silent:true});
      const auth=(win.LuviaAuth||win.ParisAuth).getState();
      if(auth.authenticated)await runAuthenticated(client);
      else snapshot=Object.freeze({auth,profile:null,trips:tripRuntime().getState(),tripId:null,completedAt:new Date().toISOString()});
      emit('prepared',{snapshot});
      return snapshot;
    },{timeoutMs:30000,detail:{source:'boot-coordinator',authenticated:Boolean((win.LuviaAuth||win.ParisAuth).getState()?.authenticated)}}).catch(error=>{emit('failed',{error});document.documentElement.classList.remove('lv-booting','lv-boot-revealing');throw error});
    return bootPromise;
  }
  function reset(){bootPromise=null;backgroundSync=null;snapshot=null;phase='idle';}
  win.LuviaBootCoordinator=Object.freeze({version:'1.5.0',boot,reveal:finish,reset,appRuntime,get phase(){return phase},get snapshot(){return snapshot},get backgroundSync(){return backgroundSync},get booting(){return !['ready','failed','idle'].includes(phase)}});
})();
