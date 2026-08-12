(()=>{
'use strict';
const VERSION='1.0.0';
const modules=new Map();
const states=new Map();
const listeners=new Set();
const notify=(type,module)=>{const event={type,moduleId:module.id,module,snapshot:snapshot(),at:new Date().toISOString()};listeners.forEach(fn=>{try{fn(event)}catch{}});try{window.dispatchEvent(new CustomEvent('luvia:product-module',{detail:event}))}catch{}};
function normalize(def){if(!def?.id||!def?.type)throw new Error('LuviaProductModuleRegistry: id/type required');return Object.freeze({version:'1.0.0',status:'available',defaultEnabled:true,requires:[],optional:[],capabilities:[],children:[],globalContracts:[],...def,requires:Object.freeze([...(def.requires||[])]),optional:Object.freeze([...(def.optional||[])]),capabilities:Object.freeze([...(def.capabilities||[])]),children:Object.freeze([...(def.children||[])]),globalContracts:Object.freeze([...(def.globalContracts||[])])});}
function register(def){const row=normalize(def);modules.set(row.id,row);if(!states.has(row.id))states.set(row.id,{enabled:row.defaultEnabled!==false,active:false,mounted:false});notify('registered',row);return row;}
const get=id=>modules.get(id)||null;
function list(){return [...modules.values()];}
function state(id){const s=states.get(id);return s?Object.freeze({...s}):null;}
function setEnabled(id,enabled){const row=get(id);if(!row)throw new Error(`Unknown product module: ${id}`);const s=states.get(id);s.enabled=Boolean(enabled);if(!s.enabled){s.active=false;s.mounted=false;}notify(s.enabled?'enabled':'disabled',row);return state(id);}
function validate(id){const row=get(id);if(!row)return {id,valid:false,reason:'unknown-module',missingContracts:[],missingCapabilities:[]};const contracts=window.LuviaGlobalContracts;const caps=window.LuviaCapabilityRegistry;const missingContracts=row.requires.filter(x=>!contracts?.probe?.(x)?.available);const missingCapabilities=row.capabilities.filter(x=>{const p=caps?.probe?.(x);return p&&p.state!=='planned'&&!p.available;});return {id,valid:missingContracts.length===0&&missingCapabilities.length===0,missingContracts,missingCapabilities,optionalUnavailable:row.optional.filter(x=>!contracts?.probe?.(x)?.available)};}
function activate(id,context={}){const row=get(id),s=states.get(id);if(!row||!s)throw new Error(`Unknown product module: ${id}`);if(!s.enabled)throw new Error(`Product module disabled: ${id}`);const validation=validate(id);if(!validation.valid)throw new Error(`Product module dependencies unavailable: ${[...validation.missingContracts,...validation.missingCapabilities].join(', ')}`);row.lifecycle?.activate?.(context);s.active=true;notify('activated',row);return state(id);}
function deactivate(id,context={}){const row=get(id),s=states.get(id);if(!row||!s)return null;row.lifecycle?.deactivate?.(context);s.active=false;notify('deactivated',row);return state(id);}
function mount(id,target,context={}){const row=get(id),s=states.get(id);if(!row||!s)throw new Error(`Unknown product module: ${id}`);if(!s.enabled)throw new Error(`Product module disabled: ${id}`);const validation=validate(id);if(!validation.valid)throw new Error(`Product module dependencies unavailable: ${validation.missingContracts.join(', ')}`);row.lifecycle?.mount?.(target,context);s.mounted=true;s.active=true;notify('mounted',row);return state(id);}
function unmount(id,target,context={}){const row=get(id),s=states.get(id);if(!row||!s)return null;row.lifecycle?.unmount?.(target,context);s.mounted=false;s.active=false;notify('unmounted',row);return state(id);}
function subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);}
function snapshot(){return list().map(row=>({id:row.id,type:row.type,status:row.status,...state(row.id),children:[...row.children],requires:[...row.requires],optional:[...row.optional],capabilities:[...row.capabilities],validation:validate(row.id)}));}
function diagnostics(){const items=snapshot();return {version:VERSION,count:items.length,enabled:items.filter(x=>x.enabled).length,active:items.filter(x=>x.active).length,healthy:items.every(x=>!x.enabled||x.validation.valid),items};}
window.LuviaProductModuleRegistry=Object.freeze({version:VERSION,register,get,list,state,setEnabled,enable:id=>setEnabled(id,true),disable:id=>setEnabled(id,false),validate,activate,deactivate,mount,unmount,subscribe,snapshot,diagnostics});
})();
