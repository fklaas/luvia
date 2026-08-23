'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const ROOT=path.resolve(__dirname,'..');
const read=relative=>fs.readFileSync(path.join(ROOT,relative),'utf8');
const runtimeSource=read('core/runtime/app-runtime-contract-core.js');
const navigationSource=read('core/runtime/navigation-contract-core.js');
const mountSource=read('core/runtime/module-mount-contract-core.js');
const bootSource=read('core/runtime/boot-coordinator.js');
const indexSource=read('index.html');

for(const [name,source] of [['app-runtime.v1',runtimeSource],['module-mount.v1',mountSource]]){
  assert.doesNotMatch(source,/\b(?:window|document|navigator|localStorage|sessionStorage)\b/,`${name} must stay browserless`);
  assert.doesNotMatch(source,/Luvia(?:Trip|Places|Media|Identity|Booking)(?:Store|State)/,`${name} must not own or consume private domain truth`);
}

const context=vm.createContext({setTimeout,clearTimeout,Date,Promise,Error,Object,Array,Map,Set,String,Number,Boolean,Math,decodeURIComponent,encodeURIComponent});
vm.runInContext(`${runtimeSource}\n${navigationSource}\n${mountSource}\nthis.runtimeCore=LuviaAppRuntimeContractCoreV1;this.navigation=LuviaNavigationContractCoreV1;this.mountCore=LuviaModuleMountContractCoreV1;`,context);

assert.equal(context.runtimeCore.contractId,'app-runtime.v1');
assert.equal(context.mountCore.contractId,'module-mount.v1');
assert.deepEqual(Array.from(context.runtimeCore.stages),['idle','platform-ready','auth-ready','domain-context-ready','shell-ready','modules-ready']);
assert.equal(context.runtimeCore.diagnostics().browserless,true);
assert.equal(context.runtimeCore.diagnostics().domainTruth,false);
assert.equal(context.mountCore.diagnostics().browserless,true);
assert.equal(context.mountCore.diagnostics().domainTruth,false);

async function main(){
  let tick=0;
  const runtime=context.runtimeCore.createRuntime({now:()=>`t-${++tick}`});
  const observed=[];
  const unsubscribe=runtime.subscribe(snapshot=>observed.push(`${snapshot.status}:${snapshot.lastStableStage}`));
  assert.throws(()=>runtime.complete('auth-ready'),error=>error.code==='APP_RUNTIME_STAGE_GAP');
  assert.equal(await runtime.run('platform-ready',async()=>42,{timeoutMs:100}),42);
  await runtime.run('auth-ready',()=>({authenticated:true}),{timeoutMs:100});
  assert.equal(runtime.snapshot().lastStableStage,'auth-ready');
  await assert.rejects(runtime.run('domain-context-ready',()=>new Promise(()=>{}),{timeoutMs:5}),error=>error.code==='APP_RUNTIME_STAGE_TIMEOUT');
  assert.equal(runtime.snapshot().status,'failed');
  assert.equal(runtime.snapshot().error.code,'APP_RUNTIME_STAGE_TIMEOUT');
  assert.equal(runtime.snapshot().lastStableStage,'auth-ready');
  runtime.recover({to:'auth-ready',detail:{reason:'retry'}});
  assert.equal(runtime.snapshot().status,'progress');
  await runtime.run('domain-context-ready',()=>Promise.resolve('context'));
  runtime.complete('shell-ready',{surface:'app-shell'});
  runtime.complete('modules-ready',{route:'today'});
  assert.equal(runtime.snapshot().ready,true);
  assert.equal(runtime.isAtLeast('domain-context-ready'),true);
  assert.ok(observed.some(value=>value==='failed:auth-ready'));
  unsubscribe();

  const log=[];
  const registry=context.mountCore.createRegistry({navigation:context.navigation,now:()=>`m-${++tick}`});
  registry.register('places',{
    mount:async({route,target,descriptor})=>{log.push(`mount:${route}:${descriptor.targetId}`);assert.equal(target.id,'places-module');return{mounted:true}},
    unmount:async({route})=>log.push(`unmount:${route}`)
  });
  registry.register('gallery',{
    mount:async({route,target})=>{log.push(`mount:${route}`);assert.equal(target.id,'gallery-module')},
    unmount:async({route})=>log.push(`unmount:${route}`)
  });
  await registry.activate('today');
  assert.equal(registry.snapshot().status,'composed');
  await Promise.all([
    registry.activate('places',{resolveTarget:id=>({id})}),
    registry.activate('gallery',{resolveTarget:id=>({id})})
  ]);
  assert.deepEqual(log,['mount:places:places-module','unmount:places','mount:gallery']);
  assert.equal(registry.snapshot().route,'gallery');
  assert.equal(registry.snapshot().status,'mounted');
  await registry.deactivate({reason:'test'});
  assert.equal(registry.snapshot().status,'idle');
  assert.deepEqual(Array.from(registry.diagnostics().registered),['gallery','places']);

  assert.match(bootSource,/appRuntime\.run\('domain-context-ready'/);
  assert.match(bootSource,/timeoutMs:30000/);
  const runtimeIndex=indexSource.indexOf('core/runtime/app-runtime-contract-core.js');
  const navigationIndex=indexSource.indexOf('core/runtime/navigation-contract-core.js');
  const mountIndex=indexSource.indexOf('core/runtime/module-mount-contract-core.js');
  const bootIndex=indexSource.indexOf('core/runtime/boot-coordinator.js');
  const shellIndex=indexSource.indexOf('app/app-shell.js');
  assert.ok(runtimeIndex>=0&&runtimeIndex<navigationIndex&&navigationIndex<mountIndex&&mountIndex<bootIndex&&bootIndex<shellIndex,'runtime contracts must load before Boot Coordinator and App Shell');

  console.log('M9.2 staged App Runtime and Module Mounting foundation: PASS');
}

main().catch(error=>{console.error(error);process.exitCode=1});
