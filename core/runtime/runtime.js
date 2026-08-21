(() => {
  'use strict';
  const tripRuntime=()=>(window.LuviaTripContractV1||window.LuviaTripContract)?.runtime||null;
  const requireTripRuntime=()=>{
    const runtime=tripRuntime();
    if(!runtime?.getState||!runtime?.initialize||!runtime?.loadRemote)throw new Error('LuviaRuntime requires Trip Contract runtime surface.');
    return runtime;
  };
  const listeners=new Set();let current=Object.freeze({phase:'booting',ready:false,auth:null,trips:null,error:null});
  const auth=()=>(window.LuviaAuth||window.ParisAuth)?.getState?.()||{loading:true,authenticated:false};
  function calculate(error=null){const a=auth();const trips=tripRuntime()?.getState?.()||{loaded:false,hasTrips:false,hasActiveTrip:false};let phase='booting';if(error)phase='failed';else if(!a.loading&&!a.authenticated)phase='signed-out';else if(!a.loading&&a.authenticated&&trips.loaded&&!trips.hasTrips)phase='no-trips';else if(!a.loading&&a.authenticated&&trips.loaded&&!trips.hasActiveTrip)phase='trip-selection';else if(!a.loading&&a.authenticated&&trips.hasActiveTrip)phase='ready';current=Object.freeze({phase,ready:!['booting','failed'].includes(phase),auth:a,trips,error:error?String(error.message||error):null,updatedAt:new Date().toISOString()});listeners.forEach(fn=>{try{fn(current)}catch(e){console.warn('[LuviaRuntime]',e)}});window.dispatchEvent(new CustomEvent('luvia:runtime-changed',{detail:current}));return current}
  async function boot({client=null,refreshRemote=true}={}){try{requireTripRuntime().initialize();if(auth().authenticated&&refreshRemote)await requireTripRuntime().loadRemote(client);return calculate()}catch(error){console.error('[LuviaRuntime] Boot fehlgeschlagen',error);return calculate(error)}}
  function refresh(){return calculate()}
  document.addEventListener('luvia:auth-changed',refresh);window.addEventListener('luvia:trips-changed',refresh);
  window.LuviaRuntime=Object.freeze({version:'3.0.0',boot,refresh,getSnapshot:()=>current,subscribe(fn){listeners.add(fn);fn(current);return()=>listeners.delete(fn)}});
})();
