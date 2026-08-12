const fs=require('fs'),vm=require('vm'),assert=require('assert');
const read=p=>fs.readFileSync(p,'utf8');
const code=read('app/control-center/booking-control-center.js');
const shell=read('app/app-shell.js');
const manifest=read('app/control-center/control-center-manifest.js');
const home=read('app/control-center/control-center-home.js');
assert(manifest.includes("control-center.bookings',path:'/control-center/bookings',status:'available-v13.78'"));
assert(shell.includes("view==='control-center-bookings'"));
assert(home.includes("'control-center-bookings','◫'"));
assert(code.includes("ownsBookingTruth:false"));
assert(code.includes("providerIndependent:true"));
assert(code.includes("source:'booking-core'"));
assert(!code.includes('.from(\'bookings\')'),'Control Center must not query bookings table directly');
const target={innerHTML:'',contains:()=>true,addEventListener(){},removeEventListener(){}};
const trips=[{id:'trip-a',title:'Paris',destination:{name:'Paris'}},{id:'trip-b',title:'Ostsee',destination:{name:'Dahme'}}];
const bookings={
 'trip-a':[
  {id:'b1',title:'Café Berry',booking_type:'restaurant',status:'review_required',channel:'email',party_size:2,start_at:'2026-08-12T19:00:00Z'},
  {id:'b2',title:'Perruche',booking_type:'restaurant',status:'confirmed',channel:'external_link',party_size:2,start_at:'2026-08-13T19:00:00Z'},
  {id:'b3',title:'Hotel',booking_type:'hotel',status:'awaiting_reply',channel:'email',party_size:2,start_at:'2026-08-14T14:00:00Z'}
 ]
};
const context={console,Intl,Date,setTimeout,clearTimeout,window:{
 LuviaTripStore:{snapshot:()=>({trips,activeTripId:'trip-a',activeTrip:trips[0]}),subscribe:()=>()=>{}},
 LuviaControlCenterTravelIdentity:{snapshot:()=>({activeTrip:{id:'trip-a',title:'Paris'}})},
 LuviaBooking:{init:async()=>{},listForTrip:async id=>bookings[id]||[]},
 LuviaProductModuleRegistry:{mount:()=>{},unmount:()=>{},state:()=>({enabled:true,active:true,mounted:true})}
}};
context.global=context;vm.createContext(context);vm.runInContext(code,context);
(async()=>{
 const result=await context.window.LuviaBookingControlCenter.mount(target);
 assert.strictEqual(result.ownsBookingTruth,false);
 assert.strictEqual(result.providerIndependent,true);
 assert.strictEqual(result.source,'booking-core');
 assert.strictEqual(result.count,3);
 assert.deepStrictEqual(JSON.parse(JSON.stringify(result.summary)),{total:3,attention:1,active:1,confirmed:1,closed:0});
 assert(target.innerHTML.includes('Café Berry'));
 assert(target.innerHTML.includes('Status')||target.innerHTML.includes('Aufmerksamkeit'));
 context.window.LuviaBookingControlCenter.unmount();
 console.log('LUVIA_V13_78_0_BOOKING_CONTROL_CENTER_FOUNDATION_OK');
})().catch(e=>{console.error(e);process.exit(1)});
