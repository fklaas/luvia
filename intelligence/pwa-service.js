(function(){
'use strict';
const VERSION='4.28.9-controlled-upgrade-recovery';
const SCRIPT_URL=new URL(document.currentScript?.src||'intelligence/pwa-service.js',document.baseURI);
const APP_ROOT_URL=new URL('../',SCRIPT_URL);
const BUILD=SCRIPT_URL.searchParams.get('v')||String(globalThis.LuviaKernelVersion?.build||'').trim()||null;
const SW_SCRIPT_URL=new URL('sw.js',APP_ROOT_URL);
if(BUILD)SW_SCRIPT_URL.searchParams.set('v',BUILD);
const SW_URL=SW_SCRIPT_URL.toString();
const SW_SCOPE=APP_ROOT_URL.pathname;
const EXPECTED_CACHE=BUILD?`luvia-shell-v${BUILD}`:null;
const workerContainer=globalThis.navigator?.serviceWorker||null;
const listeners=new Set();
let registration=null,deferredPrompt=null,updateAvailable=false,lastUpdateCheck=null,lastError=null;
let controlledUpgradeRecoveryStarted=false;
let preserveCurrentBuildDocument=false;
const readReloadGuard=()=>{try{return sessionStorage.getItem('luvia-pwa-reloading')==='1'}catch{return false}};
const writeReloadGuard=()=>{try{sessionStorage.setItem('luvia-pwa-reloading','1')}catch{}};
const clearReloadGuard=()=>{try{sessionStorage.removeItem('luvia-pwa-reloading')}catch{}};
let controllerReloadGuard=readReloadGuard();
if(controllerReloadGuard)setTimeout(()=>{controllerReloadGuard=false;clearReloadGuard()},2200);
const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const ios=()=>/iphone|ipad|ipod/i.test(navigator.userAgent);
const emit=()=>{const s=snapshot();listeners.forEach(fn=>{try{fn(s)}catch{}});window.dispatchEvent(new CustomEvent('luvia:pwa-state',{detail:s}))};
function snapshot(){return{version:VERSION,build:BUILD,expectedCache:EXPECTED_CACHE,supported:Boolean(workerContainer),registered:Boolean(registration),controller:Boolean(workerContainer?.controller),scope:registration?.scope||null,installable:Boolean(deferredPrompt),installed:standalone(),standalone:standalone(),ios:ios(),online:navigator.onLine,updateAvailable,waiting:Boolean(registration?.waiting),installing:Boolean(registration?.installing),active:Boolean(registration?.active),lastUpdateCheck,lastError}};
const workerBuild=worker=>{try{return new URL(worker?.scriptURL||'',APP_ROOT_URL).searchParams.get('v')}catch{return null}};
const expectedWorker=worker=>Boolean(BUILD&&worker&&workerBuild(worker)===BUILD);
async function removeWrongRegistrations(){const regs=await workerContainer.getRegistrations();for(const reg of regs){const script=reg.active?.scriptURL||reg.waiting?.scriptURL||reg.installing?.scriptURL||'';let path='';try{path=new URL(script,APP_ROOT_URL).pathname}catch{}if(path.endsWith('/sw.js')&&reg.scope!==APP_ROOT_URL.toString())await reg.unregister()}}
async function clearOldCaches(){if(!('caches'in window)||!EXPECTED_CACHE)return[];const keys=await caches.keys(),removed=[];for(const key of keys){if(key.startsWith('luvia-shell-v')&&key!==EXPECTED_CACHE){await caches.delete(key);removed.push(key)}}return removed}
function scheduleRecoveredCacheCleanup(){const clear=()=>clearOldCaches().catch(error=>{lastError=error.message||String(error);emit()});setTimeout(clear,800);setTimeout(clear,3200)}
async function register(){if(!workerContainer)return snapshot();try{await removeWrongRegistrations();registration=await workerContainer.register(SW_URL,{scope:SW_SCOPE,updateViaCache:'none'});bindRegistration(registration);await registration.update();await workerContainer.ready;lastError=null;emit();return snapshot()}catch(e){lastError=e.message||String(e);emit();throw e}}
function activateWaiting(reg){if(!reg?.waiting)return false;updateAvailable=true;reg.waiting.postMessage({type:'SKIP_WAITING'});emit();return true}
function activateExpectedWaiting(reg,{preserveDocument=false}={}){if(!expectedWorker(reg?.waiting))return false;if(preserveDocument)preserveCurrentBuildDocument=true;return activateWaiting(reg)}
async function activateExpectedWaitingSoon(reg,{preserveDocument=false,timeoutMs=12000}={}){const deadline=Date.now()+timeoutMs;do{if(activateExpectedWaiting(reg,{preserveDocument}))return true;await new Promise(resolve=>setTimeout(resolve,80))}while(Date.now()<deadline);return false}
function bindRegistration(reg){
  if(reg.__luviaBound)return;
  reg.__luviaBound=true;
  const inspect=()=>{updateAvailable=Boolean(reg.waiting);if(controlledUpgradeRecoveryStarted&&activateExpectedWaiting(reg,{preserveDocument:true}))return;emit()};
  const watch=worker=>{
    if(!worker||worker.__luviaBound)return;
    worker.__luviaBound=true;
    const inspectInstalled=()=>{if(worker.state==='installed'){inspect();setTimeout(inspect,0)}};
    worker.addEventListener('statechange',inspectInstalled);
    inspectInstalled();
  };
  reg.addEventListener('updatefound',()=>{watch(reg.installing);inspect()});
  watch(reg.installing);
  inspect();
}
async function recoverControlledUpgrade(){
  if(controlledUpgradeRecoveryStarted||!BUILD||!workerContainer?.controller||expectedWorker(workerContainer.controller))return snapshot();
  controlledUpgradeRecoveryStarted=true;
  try{await register();await activateExpectedWaitingSoon(registration,{preserveDocument:true});return snapshot()}catch{return snapshot()}
}
async function checkForUpdate(){lastUpdateCheck=new Date().toISOString();if(!registration)await register();try{await registration.update();activateExpectedWaiting(registration);lastError=null}catch(e){lastError=e.message||String(e)}emit();return snapshot()}
async function activateUpdate(){return activateExpectedWaiting(registration)}
async function install(){if(!deferredPrompt)return{available:false,reason:ios()?'ios-manual':'prompt-unavailable'};deferredPrompt.prompt();const choice=await deferredPrompt.userChoice;deferredPrompt=null;emit();return{available:true,outcome:choice.outcome}}
async function warmShell(){if(!workerContainer)return false;if(!registration)registration=await workerContainer.getRegistration();const worker=registration?.active||workerContainer.controller;if(!worker)return false;worker.postMessage({type:'WARM_APP_SHELL'});return true}
async function cacheInfo(){if(!('caches'in window))return[];const keys=await caches.keys();return Promise.all(keys.map(async name=>{const cache=await caches.open(name),requests=await cache.keys();return{name,entries:requests.length}}))}
function subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn)}
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredPrompt=event;emit()});window.addEventListener('appinstalled',()=>{deferredPrompt=null;emit()});window.addEventListener('online',emit);window.addEventListener('offline',emit);
if(workerContainer){const controlledAtLoad=Boolean(workerContainer.controller);workerContainer.addEventListener('controllerchange',()=>{if(preserveCurrentBuildDocument){preserveCurrentBuildDocument=false;scheduleRecoveredCacheCleanup();emit();return}if(controlledAtLoad&&!controllerReloadGuard){controllerReloadGuard=true;writeReloadGuard();location.reload();return}emit()})}
window.LuviaPWA=Object.freeze({version:VERSION,register,checkForUpdate,activateUpdate,recoverControlledUpgrade,warmShell,install,snapshot,cacheInfo,clearOldCaches,subscribe});
if(workerContainer?.controller&&!expectedWorker(workerContainer.controller))queueMicrotask(()=>recoverControlledUpgrade());
})();
