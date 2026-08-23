(()=>{
'use strict';

const VERSION='1.0.0';
const core=window.LuviaExperienceContractCoreV1;
if(!core?.createTheme)throw new Error('Experience Web Adapter benötigt experience.v1.');

const listeners=new Set();
let current=null;

function freeze(value){
  if(value==null||typeof value!=='object')return value;
  if(Array.isArray(value))return Object.freeze(value.map(freeze));
  return Object.freeze(Object.fromEntries(Object.entries(value).map(([key,item])=>[key,freeze(item)])));
}
function notify(){listeners.forEach(listener=>{try{listener(current)}catch(error){console.error('[LuviaExperience] subscriber',error)}})}
function applyTheme(input={}){
  const mode=input.resolved==='dark'||input.mode==='dark'?'dark':'light';
  const theme=core.createTheme({mode,accent:input.palette?.accent||input.accent,onAccent:input.palette?.contrast||input.onAccent,accentSoft:input.palette?.soft||input.accentSoft});
  const element=document.documentElement;
  for(const token of core.listTokens()){
    const value=theme.values[token.id];
    if(token.cssVariable&&value!=null)element.style.setProperty(token.cssVariable,String(value));
  }
  element.dataset.luviaExperience='v1';
  element.dataset.luviaExperienceTheme=theme.mode;
  current=freeze({contractId:core.contractId,version:core.version,runtimeVersion:VERSION,adapter:'web-css-custom-properties',mode:theme.mode,appliedTokenCount:core.listTokens().length,updatedAt:new Date().toISOString(),domainTruth:false});
  notify();
  window.dispatchEvent(new CustomEvent('luvia:experience-theme-applied',{detail:current}));
  return current;
}
function subscribe(listener){
  if(typeof listener!=='function')throw new TypeError('Experience Subscriber muss eine Funktion sein.');
  listeners.add(listener);
  if(current)listener(current);
  return()=>listeners.delete(listener);
}
function snapshot(){return current}
function getSystemSnapshot(){return freeze({...core.getSystemSnapshot(),adapter:'web-css-custom-properties',runtimeVersion:VERSION,theme:current})}
function diagnostics(){return freeze({...core.diagnostics(),adapter:'web-css-custom-properties',adapterVersion:VERSION,browserless:false,applied:Boolean(current),mode:current?.mode||null,subscribers:listeners.size})}

window.LuviaExperienceContractV1=Object.freeze({contractId:core.contractId,version:core.version,runtimeVersion:VERSION,getToken:core.getToken,listTokens:core.listTokens,getComponent:core.getComponent,listComponents:core.listComponents,getState:core.getState,listStates:core.listStates,getMotion:core.getMotion,resolveMotion:core.resolveMotion,createTheme:core.createTheme,getSystemSnapshot,applyTheme,subscribe,snapshot,diagnostics});
window.addEventListener('luvia:theme-changed',event=>applyTheme(event.detail||{}));
applyTheme({mode:document.documentElement.dataset.theme||'light'});
window.dispatchEvent(new CustomEvent('luvia:experience-ready',{detail:window.LuviaExperienceContractV1}));
})();
