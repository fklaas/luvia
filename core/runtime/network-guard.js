(function(){
'use strict';
const VERSION='1.1.0-read-recovery-probe';
const listeners=new Set();
const probes=new Map();
const browserOnline=()=>navigator.onLine!==false;
const state={offline:!browserOnline(),lastFailureAt:0,lastSuccessAt:0,cooldownUntil:0,lastReason:null};
const now=()=>Date.now();
const snapshot=()=>Object.freeze({...state,online:!state.offline&&now()>=state.cooldownUntil});
function emit(reason){const snap=snapshot();listeners.forEach(fn=>{try{fn(snap,reason)}catch{}});window.dispatchEvent(new CustomEvent('luvia:network-guard-changed',{detail:{...snap,reason}}));return snap;}
function markOffline(reason='browser-offline'){state.offline=true;state.lastFailureAt=now();state.lastReason=reason;state.cooldownUntil=Math.max(state.cooldownUntil,now()+5000);return emit(reason);}
function markOnline(reason='browser-online'){state.offline=false;state.lastReason=reason;state.cooldownUntil=0;return emit(reason);}
function markFailure(error,{cooldownMs=5000}={}){const text=String(error?.message||error||'').toLowerCase();const transient=/failed to fetch|network|internet_disconnected|name_not_resolved|quic|load failed|networkerror|timeout|aborted/.test(text)||error?.name==='TypeError';state.lastFailureAt=now();state.lastReason=transient?'transient-network':'request-failed';if(transient)state.cooldownUntil=Math.max(state.cooldownUntil,now()+Math.max(1000,Number(cooldownMs)||5000));if(!browserOnline())state.offline=true;emit(state.lastReason);return transient;}
function markSuccess(){state.offline=false;state.lastSuccessAt=now();state.cooldownUntil=0;state.lastReason='success';return emit('success');}
function canRequest(){return browserOnline()&&!state.offline&&now()>=state.cooldownUntil;}
function canProbe(key,{intervalMs=2500}={}){if(!browserOnline()||state.offline)return false;const previous=probes.get(key);if(previous!=null&&now()-previous<intervalMs)return false;probes.set(key,now());return true;}
function expected(error){const text=String(error?.message||error||'').toLowerCase();return !browserOnline()||/failed to fetch|network|internet_disconnected|name_not_resolved|quic|load failed|networkerror|timeout|aborted/.test(text);}
function waitUntilReady({timeoutMs=8000}={}){if(canRequest())return Promise.resolve(true);return new Promise(resolve=>{let done=false;const finish=value=>{if(done)return;done=true;clearTimeout(timer);off();resolve(value)};const off=subscribe(()=>{if(canRequest())finish(true)});const timer=setTimeout(()=>finish(canRequest()),Math.max(0,Number(timeoutMs)||0));});}
function subscribe(fn){if(typeof fn!=='function')return()=>{};listeners.add(fn);return()=>listeners.delete(fn);}
window.addEventListener('offline',()=>markOffline('browser-offline'));
window.addEventListener('online',()=>markOnline('browser-online'));
window.LuviaNetworkGuard=Object.freeze({version:VERSION,snapshot,canRequest,canProbe,expected,markFailure,markSuccess,waitUntilReady,subscribe});
})();
