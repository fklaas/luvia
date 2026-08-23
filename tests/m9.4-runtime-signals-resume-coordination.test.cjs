'use strict';

const assert=require('node:assert');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const coreSource=read('core/runtime/runtime-signal-policy-core.js');
const adapterSource=read('app/adapters/runtime-signal-web-adapter.js');
const indexSource=read('index.html');

const context={console,setTimeout,clearTimeout};
vm.createContext(context);
vm.runInContext(coreSource,context);
const core=context.LuviaRuntimeSignalPolicyCoreV1;
assert(core?.createPolicy,'runtime signal policy core missing');
assert.strictEqual(core.diagnostics().contractId,'app-runtime-signals.v1');
assert.strictEqual(core.diagnostics().browserless,true);
assert.strictEqual(core.diagnostics().domainTruth,false);
for(const token of ['window','document','navigator','localStorage','sessionStorage','location.href','location.assign','location.replace','history.pushState','history.replaceState','history.back','history.forward','supabase'])assert(!coreSource.includes(token),`browserless policy contains ${token}`);

let clock=1000;
const policy=core.createPolicy({now:()=>`t-${clock}`,nowMs:()=>clock,resumeAfterMs:15000,initial:{auth:{authenticated:true,user:{id:'user-a'},lastEvent:'INITIAL_SESSION'},lifecycle:'active',network:{online:true}}});
assert.strictEqual(policy.snapshot().auth.userId,'user-a');
assert.strictEqual(policy.accept('auth',{authenticated:true,user:{id:'user-a'},lastEvent:'TOKEN_REFRESHED'}).action,null,'token refresh must not rerender');
assert.strictEqual(policy.accept('lifecycle',{state:'background'}).action,null);
clock+=5000;
assert.strictEqual(policy.accept('lifecycle',{state:'active'}).action,null,'short background must not remount');
policy.accept('lifecycle',{state:'background'});clock+=20000;
let effect=policy.accept('lifecycle',{state:'active'});
assert.strictEqual(effect.action.type,'runtime.resume');
assert.strictEqual(effect.action.payload.durationMs,20000);
effect=policy.accept('network',{online:false});assert.strictEqual(effect.action.type,'runtime.offline');
effect=policy.accept('network',{online:true});assert.strictEqual(effect.action.type,'runtime.reconnect');
effect=policy.accept('auth',{authenticated:true,user:{id:'user-b'},lastEvent:'SIGNED_IN'});assert.strictEqual(effect.action.type,'session.switch');
effect=policy.accept('auth',{authenticated:false,lastEvent:'SIGNED_OUT'});assert.strictEqual(effect.action.type,'session.deactivate');
effect=policy.accept('auth',{authenticated:true,user:{id:'user-b'},lastEvent:'SIGNED_IN'});assert.strictEqual(effect.action.type,'session.activate');
assert.throws(()=>policy.accept('device',{}),error=>error.code==='APP_RUNTIME_SIGNAL_UNKNOWN');

for(const id of ['AuthSessionPort','LifecyclePort','NetworkPort'])assert(adapterSource.includes(`require('${id}')`),`Web adapter missing ${id}`);
for(const token of ['navigator.','document.visibilityState','addEventListener(\'online\'','addEventListener(\'offline\''])assert(!adapterSource.includes(token),`Web adapter bypasses Platform Port with ${token}`);
assert(adapterSource.includes("luvia:runtime-action"));
assert(adapterSource.includes('authTruthOwner:\'AuthSessionPort\''));

const coreIndex=indexSource.indexOf('core/runtime/runtime-signal-policy-core.js');
const adapterIndex=indexSource.indexOf('app/adapters/runtime-signal-web-adapter.js');
const shellIndex=indexSource.indexOf('app/app-shell.js');
assert(coreIndex>0&&adapterIndex>coreIndex&&shellIndex>adapterIndex,'M9.4 runtime signal load order invalid');

console.log('M9.4 Runtime Signals / Resume Coordination Foundation: PASS');
