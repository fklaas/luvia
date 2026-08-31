'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync('core/places/presence-visit-core.js','utf8');
const fixture=fs.readFileSync('tests/fixtures/m12-journey-day-composer-browser.html','utf8');
assert.match(fixture,/pendingVisitStoreKey/,'visible GPS E2E must retain the pending/confirmed boundary across reload');
assert.match(fixture,/pendingVisits=pendingVisits\.filter\(item=>item\.id!==visit\.id\);persistPendingVisits\(\)/,'confirmation must remove and persist the pending GPS proposal before projecting a Timeline moment');
assert.match(fixture,/pendingVisits=pendingVisits\.filter\(item=>item\.id!==visitId\);persistPendingVisits\(\)/,'rejection must remain rejected after reload instead of resurfacing');
const journeyEvents=[];
const cloudRows=[];
const emitted=[];
const places=[
  {id:'place-gps-a',tripId:'trip-gps',name:'Seebrücke',primaryType:'attraction',coordinates:{latitude:54.0,longitude:10.0}},
  {id:'place-gps-b',tripId:'trip-gps',name:'Strandpromenade',primaryType:'nature',coordinates:{latitude:54.001,longitude:10.001}}
];

class CustomEventStub{constructor(type,options={}){this.type=type;this.detail=options.detail}}
function database(){
  return{
    from(table){
      assert.equal(table,'place_visits');
      const query={tripId:null};
      return{
        select(){return this},
        eq(column,value){if(column==='trip_id')query.tripId=value;return this},
        order(){return this},
        async limit(){return{data:cloudRows.filter(row=>!query.tripId||row.trip_id===query.tripId).map(row=>({...row})),error:null}},
        async upsert(row){const index=cloudRows.findIndex(item=>item.id===row.id);if(index>=0)cloudRows.splice(index,1,{...row});else cloudRows.push({...row});return{data:[row],error:null}}
      };
    }
  };
}
function runtime(){
  const lifecycle=[];
  const context={
    console,setTimeout,clearTimeout,
    crypto:{randomUUID:()=>`visit-${Math.random().toString(16).slice(2)}`},
    CustomEvent:CustomEventStub,
    dispatchEvent:event=>{emitted.push(event)},addEventListener:()=>{},
    LuviaProfileService:{snapshot:()=>({profile:{locationSharing:false}})},
    LuviaTripContractV1:{getActiveTrip:()=>({id:'trip-gps',tripId:'trip-gps'})},
    ParisAuth:{getState:()=>({user:{id:'traveler-a'}})},
    LuviaSupabaseService:{getClient:()=>database()},
    LuviaPlatformPorts:{get:id=>id==='NetworkPort'?{isOnline:()=>true}:id==='PermissionPort'?{query:async()=> 'granted'}:null},
    LuviaKernelEvents:{emit:async()=>{}},
    LuviaPlaceCore:{
      getPlaces:()=>places,
      getPlace:id=>places.find(place=>place.id===id)||null,
      updateLifecycle:(id,state)=>lifecycle.push({id,state})
    },
    LuviaJourneyContractV1:{commands:{recordEvent:async event=>{journeyEvents.push(event);return event}}}
  };
  context.window=context;context.globalThis=context;
  vm.createContext(context);vm.runInContext(source,context);
  context.LuviaPresenceVisitCore.config.minSamples=1;
  context.LuviaPresenceVisitCore.config.minStaySeconds=0;
  return{api:context.LuviaPresenceVisitCore,lifecycle};
}

(async()=>{
  const first=runtime();
  await first.api.ingestPosition({latitude:54.0,longitude:10.0,accuracy:8},{test:true});
  const detected=first.api.pendingVisits();
  assert.equal(detected.length,1,'a qualified GPS stay should create one confirmation candidate');
  assert.equal(detected[0].state,'pending_confirmation');
  assert.equal(detected[0].isConfirmed,false);
  assert.equal(journeyEvents.length,0,'GPS detection alone must never write into Journey');
  assert.equal(cloudRows.filter(row=>row.state==='pending_confirmation').length,1,'the pending decision must be persisted before a reload');

  const afterReload=runtime();
  await afterReload.api.init();
  const rehydrated=afterReload.api.pendingVisits();
  assert.equal(rehydrated.length,1,'a pending GPS decision must reappear after reload');
  assert.equal(rehydrated[0].id,detected[0].id);
  const confirmed=await afterReload.api.confirmVisit('place-gps-a',{visitId:rehydrated[0].id});
  assert.equal(confirmed.isConfirmed,true);
  assert.equal(confirmed.isAutomatic,false);
  assert.equal(confirmed.detectionSource,'gps-confirmed');
  assert.equal(journeyEvents.length,1,'only explicit confirmation may create the Timeline event');
  assert.equal(journeyEvents[0].automatic,false);
  assert.equal(journeyEvents[0].source,'gps-confirmed');
  assert.equal(journeyEvents[0].metadata.coordinates.latitude,54,'a confirmed visit may project the public Place latitude for A→B routing');
  assert.equal(journeyEvents[0].metadata.coordinates.longitude,10,'a confirmed visit may project the public Place longitude for A→B routing');
  assert.equal(journeyEvents[0].metadata.coordinateEvidence,'confirmed-place-owner');
  assert.equal(journeyEvents[0].metadata.rawDevicePositionStored,false,'the raw device position must never enter the Timeline event');
  assert.equal('position' in journeyEvents[0].metadata,false,'Timeline metadata must not retain an exact device trace');
  assert.deepEqual(afterReload.lifecycle,[{id:'place-gps-a',state:'visited'}]);

  await afterReload.api.ingestPosition({latitude:54.001,longitude:10.001,accuracy:7},{test:true});
  const second=afterReload.api.pendingVisits().find(item=>item.placeId==='place-gps-b');
  assert.ok(second,'the second qualified stay should remain pending');

  const beforeRejectReload=runtime();
  await beforeRejectReload.api.init();
  assert.ok(beforeRejectReload.api.pendingVisits().some(item=>item.id===second.id),'the second decision must also survive reload');
  await beforeRejectReload.api.rejectVisit(second.id);
  assert.equal(journeyEvents.length,1,'rejecting a GPS candidate must not add a Timeline event');

  const finalReload=runtime();
  await finalReload.api.init();
  assert.equal(finalReload.api.pendingVisits().some(item=>item.id===second.id),false,'a rejected stay must not return after reload');
  assert.ok(emitted.some(event=>event.type==='luvia:place-visit-confirmation-required'));
  assert.ok(emitted.some(event=>event.type==='luvia:place-visit-rejected'));
  console.log('M16.5AB GPS confirmation -> reload -> Timeline boundary: PASS');
})().catch(error=>{console.error(error);process.exitCode=1});
