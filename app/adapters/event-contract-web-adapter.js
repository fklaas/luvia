(()=>{
'use strict';

const core=window.LuviaEventContractCoreV1;
if(!core)throw new Error('events.v1 domain core unavailable');
const listeners=new Set();

function publish(name,payload={},meta={}){
  const envelope=core.createEnvelope(name,payload,meta);
  for(const listener of listeners){try{listener(envelope)}catch(error){console.warn('[LuviaEvents]',error)}}
  window.dispatchEvent(new CustomEvent('luvia:event',{detail:envelope}));
  window.dispatchEvent(new CustomEvent(`luvia:event:${envelope.name}`,{detail:envelope}));
  window.LuviaKernelEvents?.emit?.(envelope.name,envelope.payload,{eventEnvelope:envelope}).catch?.(()=>{});
  return envelope;
}
function subscribe(nameOrListener,maybeListener){
  const name=typeof nameOrListener==='string'?nameOrListener:null;
  const listener=name?maybeListener:nameOrListener;
  if(typeof listener!=='function')throw new TypeError('Event listener required.');
  const wrapped=name?(event=>{if(event.name===name)listener(event)}):listener;
  listeners.add(wrapped);
  return()=>listeners.delete(wrapped);
}
function createNotificationIntent(envelope,presentation={}){return core.createNotificationIntent(envelope,presentation)}
function diagnostics(){
  return Object.freeze({contractId:core.contractId,version:core.version,runtimeVersion:core.runtimeVersion,envelopeVersion:core.envelopeVersion,listenerCount:listeners.size,deliveryPolicy:core.deliveryPolicy,notificationPortAutomatic:false});
}
const api=Object.freeze({contractId:core.contractId,version:core.version,runtimeVersion:core.runtimeVersion,envelopeVersion:core.envelopeVersion,definitions:core.definitions,publish,subscribe,createNotificationIntent,validateEnvelope:core.validateEnvelope,diagnostics});
window.LuviaEventContractV1=api;
window.LuviaEventContract=api;
window.LuviaGlobalContracts?.register?.({id:core.contractId,version:core.version,required:false,probe:()=>({available:true,detail:'versioned cross-core event envelopes'})});
})();
