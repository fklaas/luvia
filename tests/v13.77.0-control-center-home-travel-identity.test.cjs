const fs=require('fs'),vm=require('vm'),assert=require('assert');
const base=process.cwd();
const travelIdentitySource=fs.readFileSync(`${base}/app/control-center/travel-identity-service.js`,'utf8');
for(const forbidden of ['LuviaTripStore','LuviaTripContext','luvia:trips-changed'])assert(!travelIdentitySource.includes(forbidden),`Travel Identity must not use legacy Trip access: ${forbidden}`);
assert(travelIdentitySource.includes('LuviaTripContractV1'),'Travel Identity must consume trip.v1');
assert(travelIdentitySource.includes('luvia:trip.changed'),'Travel Identity must listen to the versioned Trip event');
const listeners={};
const trips=[
  {id:'a',title:'Paris',destination:{name:'Paris'},startDate:'2026-08-12',endDate:'2026-08-14'},
  {id:'b',title:'Ostsee',destination:{name:'Dahme'},startDate:'2027-07-01'}
];
const tripCalls={listTrips:0,getActiveTrip:0};
const windowObj={
  addEventListener:(n,f)=>{(listeners[n]??=[]).push(f)},
  dispatchEvent:()=>{},
  LuviaTripContractV1:{
    contractId:'trip.v1',
    listTrips:()=>{tripCalls.listTrips++;return trips},
    getActiveTrip:()=>{tripCalls.getActiveTrip++;return trips[0]}
  },
  LuviaTravelContext:{snapshot:()=>({phase:'during',tripDay:1})},
  LuviaAttentionContract:{normalize:x=>Object.freeze({...x,resolved:false})},
  LuviaBookingIntegration:{listForTrip:async()=>[{id:'bk1',title:'Café',status:'review_required'}]}
};
const ctx={console,setTimeout,clearTimeout,Date,Intl,Map,Set,Object,Array,String,Number,Boolean,JSON,Math,Promise,CustomEvent:function(type,o){this.type=type;this.detail=o?.detail},window:windowObj};
ctx.window.window=ctx.window;
vm.createContext(ctx);
for(const f of ['app/control-center/travel-identity-service.js','app/control-center/control-center-attention-service.js']){
  vm.runInContext(fs.readFileSync(`${base}/${f}`,'utf8'),ctx,{filename:f});
}
const id=ctx.window.LuviaControlCenterTravelIdentity.snapshot();
assert.equal(id.version,'1.1.0');
assert.equal(id.activeTrip.title,'Paris');
assert.equal(id.phase,'during');
assert.equal(id.tripDay,1);
assert.equal(id.upcomingTrip.title,'Ostsee');
assert.equal(id.ownsTripTruth,false);
assert.deepEqual(tripCalls,{listTrips:1,getActiveTrip:1});
assert.equal(Array.isArray(listeners['luvia:trip.changed']),true);
assert.equal(listeners['luvia:trips-changed'],undefined);
(async()=>{
  const a=await ctx.window.LuviaControlCenterAttention.refresh();
  assert.equal(a.actionRequired,1);
  assert.equal(a.items[0].source,'booking');
  assert.equal(a.ownsDomainTruth,false);
  console.log('LUVIA_V13_77_0_CONTROL_CENTER_HOME_TRAVEL_IDENTITY_OK');
})().catch(e=>{console.error(e);process.exit(1)});
