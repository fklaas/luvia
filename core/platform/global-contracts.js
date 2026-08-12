(()=>{
'use strict';
const VERSION='1.0.0';
const contracts=new Map();
const freeze=v=>Object.freeze({...v});
function register(def){if(!def?.id)throw new Error('LuviaGlobalContracts: id required');const row=freeze({version:'1',required:false,...def});contracts.set(row.id,row);return row;}
function get(id){return contracts.get(id)||null;}
function list(){return [...contracts.values()];}
function probe(id){const c=get(id);if(!c)return {id,state:'unknown',available:false};let available=false,detail=null;try{const result=typeof c.probe==='function'?c.probe():true;available=typeof result==='object'?Boolean(result.available):Boolean(result);detail=typeof result==='object'?result.detail??null:null;}catch(error){detail=error?.message||String(error);}return {id:c.id,contractVersion:c.version,required:Boolean(c.required),available,state:available?'ready':(c.required?'missing':'optional'),detail};}
function diagnostics(){const rows=list().map(c=>probe(c.id));return {version:VERSION,count:rows.length,ready:rows.filter(x=>x.available).length,missingRequired:rows.filter(x=>x.required&&!x.available).map(x=>x.id),rows,healthy:rows.every(x=>!x.required||x.available)};}
register({id:'app.runtime',version:'1',required:true,probe:()=>({available:Boolean(window.LuviaRuntime||window.LuviaKernel),detail:'Luvia runtime/kernel'})});
register({id:'design.system',version:'1',required:true,probe:()=>({available:Boolean(window.LuviaDesignSystemContract),detail:'global semantic token contract'})});
register({id:'auth.session',version:'1',required:true,probe:()=>({available:Boolean(window.LuviaAuthSession||window.LuviaAuth||window.LuviaSession),detail:'shared auth/session'})});
register({id:'profile.context',version:'1',required:false,probe:()=>({available:Boolean(window.LuviaProfileService||window.LuviaProfiles),detail:'shared profile context'})});
register({id:'trip.context',version:'1',required:false,probe:()=>({available:Boolean(window.LuviaTripContext||window.LuviaTravelContext),detail:'shared active trip context'})});
register({id:'navigation',version:'1',required:false,probe:()=>({available:Boolean(window.LuviaNavigationRegistry),detail:'shared navigation registry'})});
register({id:'events',version:'1',required:false,probe:()=>({available:Boolean(window.LuviaKernelEvents||window.LuviaEvents),detail:'shared event channel'})});
register({id:'realtime',version:'1',required:false,probe:()=>({available:Boolean(window.LuviaCollaboration||window.LuviaRealtime),detail:'shared realtime/collaboration'})});
window.LuviaGlobalContracts=Object.freeze({version:VERSION,register,get,list,probe,diagnostics});
})();
