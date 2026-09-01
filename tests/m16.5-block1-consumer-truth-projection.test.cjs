'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const travelSource=fs.readFileSync('core/context/travel-context-service.js','utf8');
const detailSource=fs.readFileSync('core/places/place-detail-service.js','utf8');
const actionSource=fs.readFileSync('core/ai/ai-action-runtime.js','utf8');
const dashboardSource=fs.readFileSync('core/ai/ai-dashboard-service.js','utf8');
const restaurantSource=fs.readFileSync('modules/restaurants-v2/restaurant-module.js','utf8');

assert.match(actionSource,/Du hast in dieser Nachricht keine zusätzlichen Vorlieben genannt\. Deshalb habe ich deine gespeicherten Profilvorlieben berücksichtigt\./,'the chat must distinguish missing message-specific preferences from a populated Profile Compass');
assert.doesNotMatch(actionSource,/keine konkreten Vorlieben genannt\. Deshalb habe ich \$\{profileFields\}/,'the consumer copy must not make a reachable Profile Compass sound empty');
assert.match(dashboardSource,/value!==null&&value!==undefined&&value!==''.*Number\(value\)>0/,'missing provider ratings must not render as 0,0');
assert.match(dashboardSource,/count===1\?'Bewertung':'Bewertungen'/,'review count grammar must remain consumer-ready');

class CustomEventStub{constructor(type,options={}){this.type=type;this.detail=options.detail}}

async function travelContextRequiresCurrentGesture(){
  const values=new Map([
    ['luvia.travel-context.location-enabled.v1','1'],
    ['luvia.travel-context.location.v1',JSON.stringify({latitude:1,longitude:2,updatedAt:Date.now()})]
  ]);
  let currentCalls=0,watchCalls=0;
  const context={
    console,CustomEvent:CustomEventStub,Intl,Date,JSON,Math,
    setInterval:()=>1,
    localStorage:{getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key)},
    navigator:{
      permissions:{query:async()=>({state:'granted'})},
      geolocation:{
        getCurrentPosition:resolve=>{currentCalls++;resolve({coords:{latitude:54.026,longitude:10.756,accuracy:12}})},
        watchPosition:()=>{watchCalls++;return 7},
        clearWatch:()=>{}
      }
    },
    document:{visibilityState:'visible',addEventListener:()=>{}},
    addEventListener:()=>{},dispatchEvent:()=>{},isSecureContext:true,
    LuviaTripContext:{getActiveTrip:()=>null}
  };
  context.window=context;context.globalThis=context;
  vm.createContext(context);vm.runInContext(travelSource,context);
  assert.equal(context.LuviaTravelContext.snapshot().location,null,'stale exact coordinates must not hydrate after reload');
  assert.equal(values.has('luvia.travel-context.location.v1'),false,'legacy exact coordinate cache must be removed');
  await assert.rejects(()=>context.LuviaTravelContext.requestLocation(),/ausdrücklichen Aktion/);
  assert.equal(currentCalls,0,'request without a current gesture must not touch the device');
  const position=await context.LuviaTravelContext.requestLocation({userGesture:true});
  assert.equal(currentCalls,1);
  assert.equal(watchCalls,1);
  assert.equal(position.source,'explicit-user-gesture');
  assert.equal(values.has('luvia.travel-context.location.v1'),false,'exact coordinates must remain session-only');
}

function placeDetailRequiresGpsEvidence(){
  const overlayNode={isConnected:true,classList:{remove(){}},innerHTML:'',querySelectorAll:()=>[]};
  const context={console,CustomEvent:CustomEventStub,document:{createElement:()=>({})},window:{
    addEventListener:()=>{},
    LuviaPlaceExperience:{esc:value=>String(value??''),openOverlay:()=>({node:{querySelector:()=>overlayNode},close(){}})},
    LuviaPlaceUI:{typeMeta:()=>['📍','Ort'],assessment:()=>''},
    LuviaPlaceProviderFields:{render:()=>''},
    LuviaPlaceUIStates:{empty:()=>'<p>leer</p>'},
    LuviaPlaceUIContract:{forType:()=>({card:{factSlots:['rating','distance']}})}
  }};
  vm.createContext(context);vm.runInContext(detailSource,context);
  const place={name:'Provider-Ort',primaryType:'restaurant',rating:3.85,userRatingCount:12};
  context.window.LuviaPlaceDetail.update({node:overlayNode},{place,intelligence:{distanceLabel:'0 m'},lifecycle:{}});
  assert.doesNotMatch(overlayNode.innerHTML,/von deinem Standort/,'a distance label without GPS evidence must stay hidden');
  context.window.LuviaPlaceDetail.update({node:overlayNode},{place,intelligence:{distanceLabel:'430 m',distanceSource:'explicit-user-gesture'},lifecycle:{}});
  assert.match(overlayNode.innerHTML,/430 m von deinem Standort/,'a current gesture-backed distance may be shown');
}

function chatProjectionStaysConsumerFacing(){
  assert.match(actionSource,/const populatedDays=orderedDays\.filter/);
  assert.match(actionSource,/from:previous\?\.title\|\|'Vorheriger Reisemoment'/);
  assert.doesNotMatch(actionSource,/from:previous\?\.id\|\|null/);
  assert.match(dashboardSource,/'time-or-open-period':'eine ungefähre Uhrzeit oder einen offenen Zeitraum'/);
  assert.match(dashboardSource,/const intentDisplay=/);
  assert.match(dashboardSource,/const safeWebUrl=value=>\{const raw=String\(value\|\|''\)\.trim\(\);if\(!raw\)return''/,'missing provider websites must not resolve to the current app URL');
  assert.doesNotMatch(dashboardSource,/globalThis\.location/,'provider links must not derive a missing URL from the current app route');
  assert.match(dashboardSource,/const gpsDistanceAllowed=item=>/,'chat-native Place details must require explicit GPS provenance');
  assert.doesNotMatch(dashboardSource,/LuviaApp\?\.openPlace/,'AI map pins must not open the legacy Place detail consumer');
  const sequence=dashboardSource.match(/runActiveSequence=async[\s\S]*?const submit=async/)?.[0]||'';
  assert.ok(sequence.indexOf("scoped?.status==='needs-clarification'")<sequence.indexOf('actionRuntime().runMessage'),'missing required input must be requested before loading unrelated owner results');
  assert.match(restaurantSource,/requestLocation\?\.\(\{userGesture:true\}\)/);
  assert.match(restaurantSource,/distanceSource:distance\?\(origin\.source\|\|'gps'\):'unavailable'/);
}

Promise.resolve()
  .then(travelContextRequiresCurrentGesture)
  .then(placeDetailRequiresGpsEvidence)
  .then(chatProjectionStaysConsumerFacing)
  .then(()=>console.log('M16.5 Block 1 consumer truth projection: PASS'))
  .catch(error=>{console.error(error);process.exitCode=1});
