'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return{promise,resolve}};
const trips=[{id:'first',title:'Jfjd',updatedAt:'2026-09-04'},{id:'chosen',title:'Ostseeurlaub',updatedAt:'2026-09-01'},{id:'third',title:'Paris',updatedAt:'2026-08-01'}];
function harness({local=trips,active='chosen',cached='chosen',remote=trips,cloud='chosen'}={}){
  const remoteGate=deferred(),profileGate=deferred(),events=[],published=[];
  const ctx=vm.createContext({console,performance,Date,Promise,setTimeout:(fn,ms)=>{const t=setTimeout(fn,ms);t.unref();return t},clearTimeout,CustomEvent:class{constructor(type,init){this.type=type;this.detail=init?.detail}}});
  ctx.document={documentElement:{dataset:{},classList:{contains:()=>false,add(){},remove(){}}},getElementById:()=>null};
  ctx.dispatchEvent=e=>events.push(e);
  vm.runInContext(read('core/trips/trip-state-core.js'),ctx);
  const core=ctx.LuviaTripStateCoreV1.create({afterChange:s=>published.push(s.activeTripId)});
  let profile={activeTripId:cached};
  ctx.LuviaAuth={getState:()=>({authenticated:true})};
  ctx.LuviaAppRuntimeContractCoreV1={createRuntime:()=>({run:(_name,fn)=>fn()})};
  ctx.LuviaTripContractV1={runtime:{getState:core.snapshot,initialize:()=>core.initialize({trips:local,activeTripId:active},{silent:true}),loadRemote:async(_client,options)=>{await remoteGate.promise;return core.replaceRemote(remote,options)}},commands:{selectActiveTrip:core.setActive}};
  ctx.LuviaProfileService={snapshot:()=>({profile}),hydrateLocal(){},load:async()=>{await profileGate.promise;profile={activeTripId:cloud}},setActiveTrip:async id=>{profile.activeTripId=id}};
  vm.runInContext(read('core/runtime/boot-coordinator.js'),ctx);
  return{boot:ctx.LuviaBootCoordinator,core,remoteGate,profileGate,published,events};
}
async function run(){
  let h=harness();await h.boot.boot({});
  assert.equal(h.core.snapshot().activeTripId,'chosen','local paint retains the selected trip');
  h.remoteGate.resolve();await new Promise(setImmediate);
  assert.equal(h.core.snapshot().activeTripId,'chosen','remote list must never transiently select its first row');
  h.profileGate.resolve();await h.boot.backgroundSync;
  assert.ok(h.published.every(id=>id==='chosen'),'no false active-trip publication may trigger downstream profile writes');

  h=harness({cached:'first',cloud:'first'});await h.boot.boot({});
  assert.equal(h.core.snapshot().activeTripId,'chosen','valid persisted Trip selection wins over a stale profile hint');
  h.remoteGate.resolve();h.profileGate.resolve();await h.boot.backgroundSync;
  assert.equal(h.core.snapshot().activeTripId,'chosen');

  h=harness();await h.boot.boot({});h.core.setActive('third');
  h.profileGate.resolve();h.remoteGate.resolve();await h.boot.backgroundSync;
  assert.equal(h.core.snapshot().activeTripId,'third','user choice made during cloud load must survive late responses');

  h=harness({remote:[trips[0]],cloud:'chosen'});await h.boot.boot({});
  h.remoteGate.resolve();h.profileGate.resolve();await h.boot.backgroundSync;
  assert.equal(h.core.snapshot().activeTripId,'first','removed/inaccessible local trip must not survive authoritative membership hydration');

  h=harness({local:[],active:null,cached:null});const ready=h.boot.boot({});
  h.profileGate.resolve();h.remoteGate.resolve();await ready;await h.boot.backgroundSync;
  assert.equal(h.core.snapshot().activeTripId,'chosen','fresh device must honor a valid cloud preference');
  console.log('Active-trip reload, transient publication, stale profile, in-flight choice, removed membership and fresh-device recovery: PASS');
}
run().catch(error=>{console.error(error);process.exitCode=1});
