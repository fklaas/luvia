(()=>{
'use strict';

const core=window.LuviaRuntimeSignalPolicyCoreV1;
if(!core?.createPolicy)throw new Error('Luvia Runtime Signal Web Adapter requires app-runtime-signals.v1.');

const actionListeners=new Set();
let policy=null,ports=null,authPort=null,startPromise=null,started=false,lastAction=null;
let unsubscribeAuth=null,unsubscribeLifecycle=null,unsubscribeNetwork=null;

function publish(kind,payload,source){
  if(!policy)return null;
  const effect=policy.accept(kind,payload,{source});
  if(!effect.accepted)return effect;
  window.dispatchEvent(new CustomEvent('luvia:runtime-signal-changed',{detail:{kind,state:effect.state,action:effect.action}}));
  if(effect.action){
    lastAction=effect.action;
    actionListeners.forEach(listener=>{try{listener(effect.action,effect.state)}catch(error){console.warn('[LuviaRuntimeSignals]',error)}});
    window.dispatchEvent(new CustomEvent('luvia:runtime-action',{detail:effect.action}));
  }
  return effect;
}
async function start(){
  if(started)return policy.snapshot();
  if(startPromise)return startPromise;
  startPromise=(async()=>{
    ports=await window.LuviaPlatformPortsReady;
    if(!ports?.require)throw new Error('Luvia Platform Ports are not ready.');
    authPort=ports.require('AuthSessionPort');
    const lifecyclePort=ports.require('LifecyclePort');
    const networkPort=ports.require('NetworkPort');
    policy=core.createPolicy({initial:{auth:authPort.snapshot(),lifecycle:lifecyclePort.state(),network:{online:networkPort.isOnline()}}});
    unsubscribeAuth=authPort.subscribe(state=>publish('auth',state,'AuthSessionPort'));
    unsubscribeLifecycle=lifecyclePort.subscribe(state=>publish('lifecycle',state,'LifecyclePort'));
    unsubscribeNetwork=networkPort.subscribe(state=>publish('network',state,'NetworkPort'));
    started=true;
    window.dispatchEvent(new CustomEvent('luvia:runtime-signals-ready',{detail:diagnostics()}));
    return policy.snapshot();
  })().catch(error=>{startPromise=null;throw error});
  return startPromise;
}
function stop(){
  unsubscribeAuth?.();unsubscribeLifecycle?.();unsubscribeNetwork?.();
  unsubscribeAuth=unsubscribeLifecycle=unsubscribeNetwork=null;
  started=false;startPromise=null;
  return true;
}
function subscribe(listener,options={}){
  if(typeof listener!=='function')return()=>{};
  actionListeners.add(listener);
  if(options.emitLast===true&&lastAction)listener(lastAction,policy?.snapshot?.()||null);
  return()=>actionListeners.delete(listener);
}
function snapshot(){return policy?.snapshot?.()||null}
function authSnapshot(){return authPort?.snapshot?.()||null}
function diagnostics(){return Object.freeze({contractId:core.contractId,version:core.version,adapter:'web-platform-ports',started,portBound:Boolean(ports),authTruthOwner:'AuthSessionPort',browserlessPolicy:Boolean(policy?.diagnostics?.().browserless),domainTruth:false,state:snapshot()});}

window.LuviaAppRuntimeSignalsV1=Object.freeze({contractId:core.contractId,version:core.version,start,stop,subscribe,snapshot,authSnapshot,diagnostics});
})();
