const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'core/platform/trip-contract-adapter.js'),'utf8');

for(const forbidden of ['ParisCloud','ParisSupabaseClient','Deno.env','localStorage','trip_members','.rpc(']){
  assert(!source.includes(forbidden),`adapter must not expose/use forbidden Trip internals: ${forbidden}`);
}

class CustomEvent{constructor(type,init={}){this.type=type;this.detail=init.detail}}
const listeners=new Map(),published=[];
const window={
  addEventListener(type,fn){if(!listeners.has(type))listeners.set(type,new Set());listeners.get(type).add(fn)},
  dispatchEvent(event){published.push(event);for(const fn of listeners.get(event.type)||[])fn(event);return true}
};
let activeId='t1';
const rawTrips=[
  {id:'t1',title:'Paris',destination:{name:'Paris',country:'France',latitude:48.85,longitude:2.35},symbol:'✈️',accent:'#123456',startDate:'2026-08-01',endDate:'2026-08-03',role:'owner',isOwner:true,storageSecret:'must-not-leak'},
  {id:'t2',title:'Ostsee',destination:{name:'Scharbeutz',latitude:null,longitude:null},symbol:'🌊',role:'member'}
];
const snapshot=()=>({trips:rawTrips,activeTripId:activeId,activeTrip:rawTrips.find(t=>t.id===activeId)||null,loaded:true});
const calls={setActive:[],create:[],update:[],join:[],registered:[]};
window.LuviaTripStore={snapshot,setActive(id){calls.setActive.push(id);activeId=id;return snapshot()},subscribe(fn){fn(snapshot());return()=>{}}};
window.LuviaTripStateReaderV1=Object.freeze({snapshot:window.LuviaTripStore.snapshot,subscribe:window.LuviaTripStore.subscribe});
window.LuviaTripContext={getActiveTrip:()=>snapshot().activeTrip,getSnapshot:()=>({tripId:activeId,hasActiveTrip:Boolean(activeId),tripName:snapshot().activeTrip?.title||'Unsere Reise',destination:snapshot().activeTrip?.destination||null,destinationName:snapshot().activeTrip?.destination?.name||'',symbol:snapshot().activeTrip?.symbol||'❤️',accent:snapshot().activeTrip?.accent||'#ee6f83',startDate:snapshot().activeTrip?.startDate||null,endDate:snapshot().activeTrip?.endDate||null,role:snapshot().activeTrip?.role||null,isOwner:Boolean(snapshot().activeTrip?.isOwner)})};
window.LuviaTripCreator={async save(input){calls.create.push(input);return {...rawTrips[0],id:'t3',title:input.title||'New'}}};
window.LuviaTripExperience={async update(trip,patch){calls.update.push({trip,patch});return {...trip,...patch}}};
window.LuviaJoinFlow={async join(code,name){calls.join.push({code,name});return {trip_id:'t9',joined:true}}};
window.LuviaGlobalContracts={register(def){calls.registered.push(def)}};
vm.runInNewContext(source,{window,CustomEvent,console,Date,Number,Object,Array,String,Boolean,TypeError,Error,Set,Map});
const api=window.LuviaTripContractV1;
assert(api,'Trip contract must be installed');
assert.strictEqual(window.LuviaTripContract,api,'latest alias must reference v1 object');
assert.strictEqual(api.contractId,'trip.v1');
assert.strictEqual(api.version,'1');
assert(Object.isFrozen(api));
assert.deepStrictEqual([...api.events],['trip.created','trip.changed','trip.active.changed','trip.membership.changed','trip.timeline.changed']);

const trips=api.listTrips();
assert.strictEqual(trips.length,2);
assert(Object.isFrozen(trips));
assert(Object.isFrozen(trips[0]));
assert(Object.isFrozen(trips[0].destination));
assert.strictEqual(trips[0].storageSecret,undefined,'internal/raw fields must not leak');
assert.strictEqual(api.getTrip('t2').title,'Ostsee');
assert.strictEqual(api.getTrip('t2').destination.latitude,null,'null coordinates must remain null');
assert.strictEqual(api.getTrip('missing'),null);
assert.strictEqual(api.getActiveTrip().id,'t1');
assert.deepStrictEqual(JSON.parse(JSON.stringify(api.getContext())),{tripId:'t1',hasActiveTrip:true,tripName:'Paris',destination:{name:'Paris',formattedAddress:'',country:'France',countryCode:'',placeId:'',latitude:48.85,longitude:2.35,timezone:''},destinationName:'Paris',symbol:'✈️',accent:'#123456',startDate:'2026-08-01',endDate:'2026-08-03',role:'owner',isOwner:true});

let subscriptions=0;
api.subscribe(value=>{subscriptions++;assert.strictEqual(value.contractId,'trip.v1')});
assert.strictEqual(subscriptions,1,'subscribe must immediately project current state');

const selected=api.selectActiveTrip('t2');
assert.strictEqual(selected.context.tripId,'t2');
assert.deepStrictEqual(calls.setActive,['t2']);
const cleared=api.selectActiveTrip(null);
assert.strictEqual(cleared.context.tripId,null);
api.selectActiveTrip(null);
assert.deepStrictEqual(calls.setActive,['t2',null,null]);
activeId='t1';

(async()=>{
  const created=await api.createTrip({title:'Neue Reise'});
  assert.strictEqual(created.id,'t3');
  assert.strictEqual(calls.create.length,1);
  const updated=await api.updateTrip('t1',{title:'Paris Update'});
  assert.strictEqual(updated.title,'Paris Update');
  assert.strictEqual(calls.update[0].trip.id,'t1');
  assert.strictEqual(calls.update[0].trip.storageSecret,'must-not-leak','owner use-case receives canonical raw owner state internally');
  assert.strictEqual(calls.update[0].patch.title,'Paris Update');
  const joined=await api.joinTrip('ABC123','Fabian');
  assert.deepStrictEqual(JSON.parse(JSON.stringify(joined)),{joined:true,tripId:'t9'});
  assert.deepStrictEqual(calls.join,[{code:'ABC123',name:'Fabian'}]);
  const savedJoinImplementation=window.LuviaJoinFlow.join; window.LuviaJoinFlow.join=async()=>({});
  const unresolvedJoin=await api.joinTrip('NOID','Fabian');
  assert.deepStrictEqual(JSON.parse(JSON.stringify(unresolvedJoin)),{joined:false,tripId:null});
  window.LuviaJoinFlow.join=savedJoinImplementation;
  const savedJoin=window.LuviaJoinFlow;delete window.LuviaJoinFlow;
  await assert.rejects(()=>api.joinTrip('X','Y'),error=>error.code==='TRIP_CONTRACT_PROVIDER_UNAVAILABLE'&&error.provider==='LuviaJoinFlow.join');
  window.LuviaJoinFlow=savedJoin;

  await assert.rejects(()=>api.updateTrip('missing',{}),error=>error.code==='TRIP_CONTRACT_TRIP_NOT_FOUND');
  assert.strictEqual(calls.registered.length,1);
  assert.strictEqual(calls.registered[0].id,'trip.v1');
  assert.strictEqual(calls.registered[0].probe().available,true);

  published.length=0;
  window.dispatchEvent(new CustomEvent('luvia:trips-changed',{detail:{reason:'trip-selected'}}));
  const changed=published.find(e=>e.type==='luvia:trip.changed');
  assert(changed,'compatibility TripStore event must normalize to trip.changed');
  assert.strictEqual(changed.detail.version,'1');
  assert.strictEqual(changed.detail.source,'trip');
  assert.strictEqual(changed.detail.payload.reason,'trip-selected');
  assert(!published.some(e=>e.type==='luvia:trip.active.changed'),'same active trip must not emit active changed');

  activeId='t2';
  window.dispatchEvent(new CustomEvent('luvia:trips-changed',{detail:{reason:'trip-selected'}}));
  const activeChanged=published.find(e=>e.type==='luvia:trip.active.changed');
  assert(activeChanged,'active trip transition must emit trip.active.changed');
  assert.strictEqual(activeChanged.detail.payload.previousTripId,'t1');
  assert.strictEqual(activeChanged.detail.tripId,'t2');

  published.length=0;
  window.dispatchEvent(new CustomEvent('luvia:members-changed',{detail:[{id:1},{id:2}]}));
  const membership=published.find(e=>e.type==='luvia:trip.membership.changed');
  assert.strictEqual(membership.detail.payload.count,2);
  assert.strictEqual(membership.detail.payload.members,undefined,'member rows must not leak before membership read contract exists');

  window.dispatchEvent(new CustomEvent('luvia:timeline-cloud-changed',{detail:{anything:'private'}}));
  const timeline=published.find(e=>e.type==='luvia:trip.timeline.changed');
  assert.strictEqual(timeline.detail.payload.reason,'luvia:timeline-cloud-changed');
  assert.strictEqual(timeline.detail.payload.anything,undefined,'foreign timeline detail must not be forwarded');

  const diag=api.diagnostics();
  assert.strictEqual(diag.ready,true);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(diag.providers)),{draftCore:false,store:true,context:true,create:true,update:true,join:true});
  console.log('M3.1 Trip Contract Adapter: OK');
})().catch(error=>{console.error(error);process.exitCode=1});
