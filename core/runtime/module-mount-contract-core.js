var LuviaModuleMountContractCoreV1=(()=>{
'use strict';

const CONTRACT_ID='module-mount.v1';
const VERSION='1';
const RUNTIME_VERSION='1.0.0';

function clone(value){
  if(value==null||typeof value!=='object')return value;
  if(Array.isArray(value))return value.map(clone);
  return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,clone(item)]));
}
function immutable(value){
  if(value==null||typeof value!=='object')return value;
  if(Array.isArray(value))return Object.freeze(value.map(immutable));
  return Object.freeze(Object.fromEntries(Object.entries(value).map(([key,item])=>[key,immutable(item)])));
}
function contractError(code,message,route){
  const error=new Error(message);
  error.code=code;
  if(route)error.route=route;
  return error;
}

function createRegistry(options={}){
  const navigation=options.navigation;
  if(!navigation?.get||!navigation?.normalize)throw contractError('MODULE_MOUNT_NAVIGATION_REQUIRED','Module Mount requires navigation.v1 get() and normalize().');
  const now=typeof options.now==='function'?options.now:()=>new Date().toISOString();
  const adapters=new Map();
  const listeners=new Set();
  let active=null;
  let sequence=0;
  let queue=Promise.resolve();
  let state=immutable({contractId:CONTRACT_ID,version:VERSION,sequence,status:'idle',route:null,mount:null,error:null,updatedAt:now()});

  function publish(next){
    state=immutable(next);
    listeners.forEach(listener=>{try{listener(state)}catch{}});
    return state;
  }
  function adapterKey(route,descriptor){return String(route||descriptor?.key||'')}
  function adapterFor(route,descriptor){return adapters.get(adapterKey(route,descriptor))||adapters.get(String(descriptor?.key||''))||null}
  function register(route,adapter){
    const normalized=navigation.normalize(route);
    const definition=navigation.get(normalized);
    if(!definition)throw contractError('MODULE_MOUNT_ROUTE_UNKNOWN',`Cannot register unknown route ${route}.`,String(route||''));
    if(definition.mount?.mode!=='module')throw contractError('MODULE_MOUNT_ROUTE_NOT_MODULE',`Route ${normalized} is not a module mount.`,normalized);
    if(!adapter||typeof adapter.mount!=='function')throw contractError('MODULE_MOUNT_ADAPTER_INVALID',`Route ${normalized} requires a mount() adapter.`,normalized);
    adapters.set(normalized,Object.freeze({...adapter}));
    return()=>adapters.delete(normalized);
  }
  async function deactivateCurrent(context={}){
    if(!active){
      sequence+=1;
      return publish({...state,sequence,status:'idle',route:null,mount:null,error:null,updatedAt:now()});
    }
    const current=active;
    const adapter=adapterFor(current.route,current.descriptor);
    sequence+=1;
    publish({...state,sequence,status:'unmounting',route:current.route,mount:clone(current.descriptor),error:null,updatedAt:now()});
    try{
      if(typeof adapter?.unmount==='function')await adapter.unmount({...context,route:current.route,descriptor:current.descriptor,mountResult:current.mountResult});
      active=null;
      sequence+=1;
      return publish({...state,sequence,status:'idle',route:null,mount:null,error:null,updatedAt:now()});
    }catch(error){
      sequence+=1;
      publish({...state,sequence,status:'failed',route:current.route,mount:clone(current.descriptor),error:{code:String(error?.code||'MODULE_UNMOUNT_FAILED'),message:String(error?.message||error)},updatedAt:now()});
      throw error;
    }
  }
  async function activateCurrent(route,context={}){
    const normalized=navigation.normalize(route);
    const definition=navigation.get(normalized);
    if(!definition)throw contractError('MODULE_MOUNT_ROUTE_UNKNOWN',`Cannot activate unknown route ${route}.`,String(route||''));
    const descriptor=definition.mount||{mode:'inline',key:normalized};
    if(active?.route===normalized&&!context.force)return state;
    await deactivateCurrent({...context,reason:context.reason||'route-change'});
    if(descriptor.mode!=='module'){
      active=Object.freeze({route:normalized,descriptor,mountResult:null});
      sequence+=1;
      return publish({...state,sequence,status:'composed',route:normalized,mount:clone(descriptor),error:null,updatedAt:now()});
    }
    const adapter=adapterFor(normalized,descriptor);
    if(!adapter)throw contractError('MODULE_MOUNT_ADAPTER_MISSING',`No module adapter is registered for ${normalized}.`,normalized);
    const target=descriptor.targetId&&typeof context.resolveTarget==='function'?context.resolveTarget(descriptor.targetId,descriptor):context.target||null;
    if(descriptor.targetId&&!target)throw contractError('MODULE_MOUNT_TARGET_MISSING',`Mount target ${descriptor.targetId} is unavailable for ${normalized}.`,normalized);
    sequence+=1;
    publish({...state,sequence,status:'mounting',route:normalized,mount:clone(descriptor),error:null,updatedAt:now()});
    try{
      const mountResult=await adapter.mount({...context,route:normalized,descriptor,target});
      active=Object.freeze({route:normalized,descriptor,mountResult});
      sequence+=1;
      return publish({...state,sequence,status:'mounted',route:normalized,mount:clone(descriptor),error:null,updatedAt:now()});
    }catch(error){
      try{if(typeof adapter.unmount==='function')await adapter.unmount({...context,route:normalized,descriptor,mountResult:null,reason:'mount-failed'})}catch{}
      active=null;
      sequence+=1;
      publish({...state,sequence,status:'failed',route:normalized,mount:clone(descriptor),error:{code:String(error?.code||'MODULE_MOUNT_FAILED'),message:String(error?.message||error)},updatedAt:now()});
      throw error;
    }
  }
  function serialize(task){
    const result=queue.then(task,task);
    queue=result.catch(()=>{});
    return result;
  }
  function activate(route,context={}){return serialize(()=>activateCurrent(route,context))}
  function deactivate(context={}){return serialize(()=>deactivateCurrent(context))}
  function snapshot(){return state}
  function subscribe(listener,options={}){
    if(typeof listener!=='function')return()=>{};
    listeners.add(listener);
    if(options.emitCurrent!==false)listener(state);
    return()=>listeners.delete(listener);
  }
  function diagnostics(){
    return immutable({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,registered:[...adapters.keys()].sort(),state:clone(state),browserless:true,domainTruth:false});
  }

  return Object.freeze({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,register,activate,deactivate,snapshot,subscribe,diagnostics});
}

function diagnostics(){return immutable({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,browserless:true,domainTruth:false});}

return Object.freeze({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,createRegistry,diagnostics});
})();
