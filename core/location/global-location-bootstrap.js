(() => {
  'use strict';
  const VERSION='4.28.5.3-user-gesture-gate';
  let running=null,watcherStarted=false,lastReason='idle';
  async function ports(){if(globalThis.LuviaPlatformPorts)return globalThis.LuviaPlatformPorts;try{await globalThis.LuviaPlatformPortsReady}catch{}return globalThis.LuviaPlatformPorts||null}
  async function authenticated(){
    const state=window.ParisAuth?.getState?.();
    if(state?.authenticated&&state?.user?.id)return true;
    const client=window.LuviaSupabaseService?.getClient?.()||window.ParisSupabaseClient||window.ParisCloud?.client;
    try{return Boolean((await client?.auth?.getSession?.())?.data?.session?.user?.id)}catch{return false}
  }
  async function start(options={}){
    const registry=await ports(),devicePositionPort=registry?.get?.('LocationPort'),permissions=registry?.get?.('PermissionPort');
    if(!devicePositionPort?.isSupported?.()||!window.LuviaPresenceVisitCore)return{ok:false,reason:'unavailable'};
    if(options.userGesture!==true){lastReason='user-gesture-required';return{ok:false,reason:lastReason,userGestureRequired:true}}
    if(running)return running;
    running=(async()=>{
      if(!(await authenticated())){lastReason='auth';return{ok:false,reason:lastReason}}
      try{
        const permission=await permissions?.query?.('geolocation');
        if(permission==='denied'){lastReason='denied';return{ok:false,reason:lastReason}}
        if(!watcherStarted){await window.LuviaPresenceVisitCore.setGlobalEnabled(true);watcherStarted=true}
        const detail=window.LuviaPresenceVisitCore.diagnostics();
        lastReason='ready';
        window.dispatchEvent(new CustomEvent('luvia:global-location-ready',{detail}));
        return{ok:true,detail};
      }catch(error){
        lastReason=error?.code===1?'denied':'error';
        window.dispatchEvent(new CustomEvent('luvia:global-location-unavailable',{detail:{code:error?.code||null,message:error?.message||String(error)}}));
        return{ok:false,reason:lastReason,error:error?.message||String(error)};
      }
    })();
    try{return await running}finally{running=null}
  }
  window.LuviaGlobalLocationBootstrap=Object.freeze({version:VERSION,start,diagnostics:()=>({version:VERSION,running:Boolean(running),watcherStarted,lastReason,automaticStartup:false,userGestureRequired:!watcherStarted})});
})();
