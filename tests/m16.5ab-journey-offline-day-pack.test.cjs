'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync('app/journey/journey-offline-pack.js','utf8');
const resilienceSource=fs.readFileSync('core/journey/journey-resilience-core.js','utf8');
const storage=new Map();
class CustomEventStub{constructor(type,options={}){this.type=type;this.detail=options.detail}}
function runtime(){
  const events=[];
  const context={
    console,CustomEvent:CustomEventStub,
    dispatchEvent:event=>events.push(event),
    LuviaPlatformPorts:{get:id=>id==='OfflineCachePort'?{
      write:(key,value)=>storage.set(key,JSON.parse(JSON.stringify(value))),
      read:(key,fallback)=>storage.has(key)?JSON.parse(JSON.stringify(storage.get(key))):fallback,
      remove:key=>storage.delete(key)
    }:null}
  };
  context.window=context;context.globalThis=context;
  vm.createContext(context);vm.runInContext(resilienceSource,context);vm.runInContext(source,context);
  return{api:context.LuviaJourneyOfflinePack,events};
}

const trip={id:'trip-offline',title:'Ostseeurlaub',destination:{name:'Scharbeutz'}};
const day={
  date:'2027-06-12',summary:{entryCount:2},conflicts:[],entries:[
    {id:'entry-cafe',title:'Frühstück am Meer',startAt:'2027-06-12T08:30:00.000Z',endAt:'2027-06-12T09:30:00.000Z',durationMinutes:60,entityType:'restaurant',status:'confirmed',provenance:{owner:'places'},metadata:{address:'Strandallee 1, Scharbeutz',coordinates:{latitude:54.02,longitude:10.75},providerFacts:{typeLabel:'Café',rating:4.7,observedAt:'2026-08-30T06:00:00.000Z'},routeBufferMinutes:10,transferMinutes:14,links:{mapsUrl:'https://maps.example/route',website:'https://cafe.example'},booking:{id:'booking-1',status:'confirmed',confirmationCode:'ABC-123'}}},
    {id:'entry-beach',title:'Seebrücke',startAt:'2027-06-12T10:00:00.000Z',endAt:'2027-06-12T11:00:00.000Z',durationMinutes:60,entityType:'attraction',status:'confirmed',provenance:{owner:'journey'},metadata:{address:'Seebrückenvorplatz, Scharbeutz',coordinates:{latitude:54.03,longitude:10.76},links:{mapsUrl:'https://maps.example/pier'}}}
  ]
};

const first=runtime();
const saved=first.api.save(trip,day);
assert.equal(saved.entries.length,2);
assert.equal(saved.addresses.length,2);
assert.equal(saved.coreRoute.length,2);
assert.equal(saved.coreRoute[0].arrivalBufferMinutes,10);
assert.equal(saved.bookingReceipts.length,1);
assert.equal(saved.bookingReceipts[0].confirmationCode,'ABC-123');
assert.ok(first.events.some(event=>event.type==='luvia:journey-offline-pack-changed'));

const afterReload=runtime();
const restored=afterReload.api.get(trip,day.date);
assert.equal(restored.tripId,'trip-offline');
assert.equal(restored.entries[0].links.website,'https://cafe.example');
assert.equal(afterReload.api.status(trip,day.date).saved,true);
assert.equal(afterReload.api.status(trip,day.date).routeStopCount,2);
assert.equal(afterReload.api.status(trip,day.date).bookingReceiptCount,1);
const draft=afterReload.api.openDraft(trip,day.date,{replicaId:'device-fabian'});
draft.set('entry-cafe',{...restored.entries[0],startAt:'2027-06-12T09:00:00.000Z'});
assert.equal(draft.snapshot().find(entry=>entry.id==='entry-cafe').startAt,'2027-06-12T09:00:00.000Z');
assert.equal(draft.pending(),1);
assert.equal(draft.ownerSyncRequired,true);
const secondDevice=runtime().api.openDraft(trip,day.date,{replicaId:'device-lea'});
secondDevice.merge(draft.operations());
assert.equal(secondDevice.snapshot().find(entry=>entry.id==='entry-cafe').startAt,'2027-06-12T09:00:00.000Z');
afterReload.api.remove(trip,day.date);
assert.equal(afterReload.api.status(trip,day.date).saved,false);

console.log('M16.5AB Journey offline day pack -> reload -> remove: PASS');
