const fs=require('fs'),vm=require('vm'),assert=require('assert');
const base=process.cwd();
const listeners={};
const windowObj={
  addEventListener:(n,f)=>{(listeners[n]??=[]).push(f)},
  dispatchEvent:()=>{},
  LuviaTripStore:{snapshot:()=>({
    trips:[
      {id:'a',title:'Paris',destination:{name:'Paris'},startDate:'2026-08-12',endDate:'2026-08-14'},
      {id:'b',title:'Ostsee',destination:{name:'Dahme'},startDate:'2027-07-01'}
    ],
    activeTripId:'a',
    activeTrip:{id:'a',title:'Paris',destination:{name:'Paris'},startDate:'2026-08-12',endDate:'2026-08-14'}
  })},
  LuviaTripContext:{getSnapshot:()=>({trip:{id:'a',title:'Paris',destination:{name:'Paris'},startDate:'2026-08-12',endDate:'2026-08-14'}})},
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
assert.equal(id.activeTrip.title,'Paris');
assert.equal(id.phase,'during');
assert.equal(id.tripDay,1);
assert.equal(id.upcomingTrip.title,'Ostsee');
assert.equal(id.ownsTripTruth,false);
(async()=>{
  const a=await ctx.window.LuviaControlCenterAttention.refresh();
  assert.equal(a.actionRequired,1);
  assert.equal(a.items[0].source,'booking');
  assert.equal(a.ownsDomainTruth,false);
  console.log('LUVIA_V13_77_0_CONTROL_CENTER_HOME_TRAVEL_IDENTITY_OK');
})().catch(e=>{console.error(e);process.exit(1)});
