'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const read=path=>fs.readFileSync(path,'utf8');
const placesPath='core/platform/places-contract-adapter.js';
const bookingPath='core/platform/booking-contract-adapter.js';
const placesSource=read(placesPath);
const bookingSource=read(bookingPath);
const index=read('index.html');
const serviceWorker=read('sw.js');

for(const forbidden of ['LuviaBookingRepository','.from(','.rpc(','functions.invoke(','localStorage','sessionStorage']){
  assert.equal(bookingSource.includes(forbidden),false,`booking.v1 adapter leaks private runtime: ${forbidden}`);
}
assert.ok(placesSource.includes('async function getCard(placeId,options={})'));
assert.ok(placesSource.includes("cardMedia:'owner-adapter-projection'"));
const order=[
  'core/intelligence/intelligence-action-contract-core.js?v=13.82.168.60',
  'core/platform/booking-contract-adapter.js?v=13.82.168.60',
  'core/platform/journey-contract-adapter.js?v=13.82.168.60',
  'core/platform/trip-contract-adapter.js?v=13.82.168.60',
  'core/platform/places-contract-adapter.js?v=13.82.168.60',
  'core/ai/ai-action-runtime.js?v=13.82.168.60',
  'core/ai/ai-dashboard-service.js?v=13.82.168.60'
];
for(const asset of order)assert.ok(index.includes(asset),`M15 runtime asset missing: ${asset}`);
const actionCoreIndex=index.indexOf(order[0]);
const actionRuntimeIndex=index.indexOf(order[5]);
assert.ok(actionCoreIndex<actionRuntimeIndex,'browserless action policy must load before the Web action runtime');
for(const ownerAsset of order.slice(1,5))assert.ok(index.indexOf(ownerAsset)<actionRuntimeIndex,`${ownerAsset} must load before the Web action runtime`);
assert.ok(actionRuntimeIndex<index.indexOf(order[6]),'the chat must load only after its action runtime');
for(const asset of ['core/intelligence/intelligence-action-contract-core.js','core/ai/ai-action-runtime.js'])assert.ok(serviceWorker.includes(`'${asset}'`),`Service Worker misses ${asset}`);
assert.ok(serviceWorker.includes("const CACHE='luvia-shell-v13.82.168.60-local-recovery'"));

const registrations=[];
let detailCalls=0;
const window={
  addEventListener(){},
  dispatchEvent(){},
  LuviaPlaceCore:{search:async()=>({places:[]}),getPlace:()=>null,getPlaces:()=>[]},
  LuviaPlaces:{
    async details(){detailCalls+=1;return{data:{place:{id:'places/place-1',displayName:{text:'Luvia Table'},formattedAddress:'Am Wasser 1',rating:4.8,userRatingCount:312,photos:[{name:'photos/hero',authorAttributions:[{displayName:'Provider'}]}]}}}},
    async photo(){return{data:{photoUri:'https://images.example/hero.jpg'}}}
  },
  LuviaPlaceCommands:{},
  LuviaPlacesDiscoveryService:{listSaved:async()=>[],recommend:async()=>({places:[]})},
  LuviaPresenceVisitCore:{confirmVisit(){}},
  LuviaPlatformPorts:{get(){return{open(){}}},has(){return true}},
  LuviaGlobalContracts:{register(definition){registrations.push(definition)}}
};
const context={window,globalThis:null,console,Object,Array,Map,Set,WeakSet,Error,TypeError,String,Boolean,Number,Math,JSON,Date,CustomEvent:function(){}};
context.globalThis=context;
Object.assign(context,window);
vm.createContext(context);
vm.runInContext(read('core/places/places-domain-contract-core.js'),context,{filename:'core/places/places-domain-contract-core.js'});
window.LuviaPlacesDomainContractCoreV1=context.LuviaPlacesDomainContractCoreV1;
context.LuviaPlacesDomainContractCoreV1=context.LuviaPlacesDomainContractCoreV1;
vm.runInContext(placesSource,context,{filename:placesPath});

const bookingCalls=[];
context.LuviaBooking={
  async init(){return{ok:true}},async listForTrip(){return[]},async get(){return null},async conversation(){return{}},async messages(){return[]},async bookingTimeline(){return[]},async providerCapabilities(){return[]},
  async createForPlace(input){bookingCalls.push(['create',input]);return{id:'booking-1'}},async reply(){return{}},async performIntelligenceAction(){return{}},async modifyBooking(){return{}},async cancelBooking(){return{}},async setConversationPreference(){return{}}
};
context.LuviaBookingUI={async openForPlace(place,options){bookingCalls.push(['open',place,options]);return{opened:true,channel:'owner_dialog',provider:'official'}}};
window.LuviaBooking=context.LuviaBooking;
window.LuviaBookingUI=context.LuviaBookingUI;
vm.runInContext(bookingSource,context,{filename:bookingPath});

(async()=>{
  const card=await window.LuviaPlacesContractV1.reads.getCard('place-1');
  assert.equal(card.place.providerPlaceId,'place-1');
  assert.equal(card.place.name,'Luvia Table');
  assert.equal(card.image.url,'https://images.example/hero.jpg');
  assert.equal(card.image.attribution,'Provider');
  assert.equal(Object.isFrozen(card),true);

  const hydrated=await window.LuviaPlacesContractV1.reads.getCard('place-1',{source:{id:'places/place-1',providerPlaceId:'place-1',name:'Luvia Table',photos:[]}});
  assert.equal(hydrated.image.url,'https://images.example/hero.jpg','a search result without media must hydrate the provider detail before rendering a placeholder');
  assert.equal(detailCalls,2,'provider detail media hydration must run exactly once for an unpictured seeded card');

  const booking=context.LuviaBookingContractV1;
  assert.ok(booking,'booking.v1 adapter missing');
  const result=await booking.commands.openPlaceBooking({id:'places/place-1',name:'Luvia Table',email:'must-not-cross@example.test'});
  assert.equal(result.opened,true);
  assert.equal(result.owner,'booking');
  assert.equal(bookingCalls[0][0],'open');
  assert.equal(bookingCalls[0][1].providerPlaceId,'place-1');
  assert.equal('email' in bookingCalls[0][1],false);
  assert.equal(bookingCalls[0][2].reserveExternalWindow,true);
  assert.equal(booking.diagnostics().ownership.foreignDomainMutation,false);
  assert.equal(registrations.length,2);

  console.log('M15.3 Owner Contract Rich Card Adapters: PASS');
  console.log('Places image projection: PASS');
  console.log('Booking owner flow adapter: PASS');
})().catch(error=>{console.error(error);process.exit(1)});
