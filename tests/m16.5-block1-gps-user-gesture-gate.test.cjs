'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const presenceSource=fs.readFileSync('core/places/presence-visit-core.js','utf8');
const bootstrapSource=fs.readFileSync('core/location/global-location-bootstrap.js','utf8');

class CustomEventStub{constructor(type,options={}){this.type=type;this.detail=options.detail}}

async function presenceGate(){
  let watchCalls=0;
  const events=[];
  const context={
    console,crypto:{randomUUID:()=> 'visit-test'},CustomEvent:CustomEventStub,
    dispatchEvent:event=>events.push(event),addEventListener:()=>{},
    LuviaProfileService:{snapshot:()=>({profile:{locationSharing:true}})},
    LuviaTripContractV1:{getActiveTrip:()=>null},
    LuviaPlatformPorts:{get:id=>id==='PermissionPort'?{query:async()=> 'granted'}:id==='LocationPort'?{isSupported:()=>true,watch:()=>{watchCalls++;return 1},clearWatch:()=>{}}:id==='NetworkPort'?{isOnline:()=>true}:null},
    LuviaKernelEvents:{emit:async()=>{}},LuviaPlaceCore:{getPlaces:()=>[]}
  };
  context.window=context;context.globalThis=context;
  vm.createContext(context);vm.runInContext(presenceSource,context);
  const diagnostics=await context.LuviaPresenceVisitCore.init();
  assert.equal(watchCalls,0,'Places init must never start a location watch');
  assert.equal(diagnostics.resumeRequired,true,'a saved preference must project a visible resume requirement');
  assert.equal(events.some(event=>event.type==='luvia:gps-resume-required'),true);
}

async function bootstrapGate(){
  let currentCalls=0,setEnabledCalls=0;
  const handlers=[];
  const context={
    console,CustomEvent:CustomEventStub,
    dispatchEvent:()=>{},addEventListener:(name,handler)=>handlers.push({name,handler}),
    document:{addEventListener:(name,handler)=>handlers.push({name,handler}),visibilityState:'visible'},
    ParisAuth:{getState:()=>({authenticated:true,user:{id:'traveler'}})},
    LuviaPlatformPorts:{get:id=>id==='LocationPort'?{isSupported:()=>true,getCurrent:async()=>{currentCalls++;return{latitude:54,longitude:10}}}:id==='PermissionPort'?{query:async()=> 'granted'}:null},
    LuviaPresenceVisitCore:{setGlobalEnabled:async()=>{setEnabledCalls++},diagnostics:()=>({enabled:true})}
  };
  context.window=context;context.globalThis=context;
  vm.createContext(context);vm.runInContext(bootstrapSource,context);
  assert.equal(handlers.length,0,'bootstrap must not install automatic boot/auth/visibility GPS triggers');
  const denied=await context.LuviaGlobalLocationBootstrap.start();
  assert.equal(denied.reason,'user-gesture-required');
  assert.equal(currentCalls,0);
  assert.equal(setEnabledCalls,0);
  const started=await context.LuviaGlobalLocationBootstrap.start({userGesture:true});
  assert.equal(started.ok,true);
  assert.equal(currentCalls,0,'explicit start must not duplicate getCurrent before the owner watch');
  assert.equal(setEnabledCalls,1);
  assert.equal(context.LuviaGlobalLocationBootstrap.diagnostics().automaticStartup,false);
}

Promise.all([presenceGate(),bootstrapGate()]).then(()=>{
  assert.doesNotMatch(presenceSource,/setTimeout\(\(\)=>start/);
  assert.doesNotMatch(bootstrapSource,/DOMContentLoaded|visibilitychange|luvia:boot-complete/);
  console.log('M16.5 Block 1 GPS user-gesture gate: PASS');
}).catch(error=>{console.error(error);process.exitCode=1});
