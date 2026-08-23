var LuviaRuntimeSignalPolicyCoreV1=(()=>{
'use strict';

const CONTRACT_ID='app-runtime-signals.v1';
const VERSION='1';
const RUNTIME_VERSION='1.0.0';
const DEFAULT_RESUME_AFTER_MS=15000;
const MAX_HISTORY=24;

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
function normalizeAuth(value={}){
  const authenticated=Boolean(value.authenticated&&!value.loading);
  return immutable({
    loading:Boolean(value.loading),
    authenticated,
    userId:authenticated?String(value.user?.id||value.userId||'')||null:null,
    lastEvent:value.lastEvent?String(value.lastEvent):null
  });
}
function normalizeLifecycle(value){
  const candidate=String(value?.state||value||'active').toLowerCase();
  return candidate==='background'||candidate==='inactive'?'background':'active';
}
function normalizeNetwork(value){return value?.online!==false&&value!==false}

function createPolicy(options={}){
  const now=typeof options.now==='function'?options.now:()=>new Date().toISOString();
  const nowMs=typeof options.nowMs==='function'?options.nowMs:()=>Date.now();
  const resumeAfterMs=Math.max(0,Number(options.resumeAfterMs??DEFAULT_RESUME_AFTER_MS)||0);
  const initial=options.initial||{};
  const listeners=new Set();
  let sequence=0;
  let backgroundAtMs=normalizeLifecycle(initial.lifecycle)==='background'?nowMs():null;
  let history=[];
  let state=immutable({
    contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,sequence,
    auth:normalizeAuth(initial.auth),lifecycle:normalizeLifecycle(initial.lifecycle),online:normalizeNetwork(initial.network),
    lastSignal:null,lastAction:null,updatedAt:now(),history:[]
  });

  function action(type,payload,source){
    return immutable({id:`runtime-action-${sequence}`,type,source:String(source||'runtime-signal-policy'),at:now(),payload:clone(payload||{})});
  }
  function sameAuth(left,right){return left.loading===right.loading&&left.authenticated===right.authenticated&&left.userId===right.userId&&left.lastEvent===right.lastEvent}
  function publish(kind,next,createdAction,source){
    const entry=immutable({sequence,kind,source:String(source||kind),action:createdAction?.type||null,at:now()});
    history=history.concat(entry).slice(-MAX_HISTORY);
    state=immutable({...next,sequence,lastSignal:kind,lastAction:createdAction||state.lastAction,updatedAt:entry.at,history:clone(history)});
    listeners.forEach(listener=>{try{listener(state,createdAction)}catch{}});
    return immutable({accepted:true,signal:kind,action:createdAction,state});
  }
  function unchanged(kind){return immutable({accepted:false,signal:kind,action:null,state})}

  function accept(kind,payload={},meta={}){
    kind=String(kind||'');
    const source=meta.source||payload?.source||kind;
    if(kind==='auth'){
      const previous=state.auth;
      const auth=normalizeAuth(payload);
      if(sameAuth(previous,auth))return unchanged(kind);
      sequence+=1;
      let createdAction=null;
      if(!auth.loading){
        if(previous.authenticated&&auth.authenticated&&previous.userId!==auth.userId)createdAction=action('session.switch',{fromUserId:previous.userId,userId:auth.userId},source);
        else if(!previous.authenticated&&auth.authenticated)createdAction=action('session.activate',{userId:auth.userId},source);
        else if(previous.authenticated&&!auth.authenticated)createdAction=action('session.deactivate',{userId:previous.userId},source);
      }
      return publish(kind,{...state,auth},createdAction,source);
    }
    if(kind==='lifecycle'){
      const lifecycle=normalizeLifecycle(payload);
      if(lifecycle===state.lifecycle)return unchanged(kind);
      const previous=state.lifecycle;
      const transitionAt=nowMs();
      sequence+=1;
      let createdAction=null;
      if(lifecycle==='background')backgroundAtMs=transitionAt;
      else{
        const durationMs=backgroundAtMs==null?0:Math.max(0,transitionAt-backgroundAtMs);
        backgroundAtMs=null;
        if(previous==='background'&&durationMs>=resumeAfterMs&&state.auth.authenticated){
          createdAction=action('runtime.resume',{userId:state.auth.userId,durationMs,online:state.online},source);
        }
      }
      return publish(kind,{...state,lifecycle},createdAction,source);
    }
    if(kind==='network'){
      const online=normalizeNetwork(payload);
      if(online===state.online)return unchanged(kind);
      const previous=state.online;
      sequence+=1;
      let createdAction=null;
      if(previous&&!online)createdAction=action('runtime.offline',{userId:state.auth.userId},source);
      else if(!previous&&online&&state.lifecycle==='active'&&state.auth.authenticated)createdAction=action('runtime.reconnect',{userId:state.auth.userId},source);
      return publish(kind,{...state,online},createdAction,source);
    }
    const error=new Error(`Unknown App Runtime signal: ${kind}`);error.code='APP_RUNTIME_SIGNAL_UNKNOWN';throw error;
  }
  function snapshot(){return state}
  function subscribe(listener,subscribeOptions={}){
    if(typeof listener!=='function')return()=>{};
    listeners.add(listener);
    if(subscribeOptions.emitCurrent===true)listener(state,null);
    return()=>listeners.delete(listener);
  }
  function diagnostics(){return immutable({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,resumeAfterMs,browserless:true,domainTruth:false,state:clone(state)});}

  return Object.freeze({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,accept,snapshot,subscribe,diagnostics});
}

function diagnostics(){return immutable({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,defaultResumeAfterMs:DEFAULT_RESUME_AFTER_MS,browserless:true,domainTruth:false});}

return Object.freeze({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,createPolicy,diagnostics});
})();
