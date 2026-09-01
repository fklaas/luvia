'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const read=path=>fs.readFileSync(path,'utf8');
const runtimePath='core/ai/ai-action-runtime.js';
const source=read(runtimePath);

for(const forbidden of ['LuviaTripStore','LuviaPlaceCore','LuviaPlaceRuntime','LuviaBookingUI','LuviaTimelineCore','LuviaSupabaseService','.from(','.rpc(','functions.invoke(','localStorage','sessionStorage']){
  assert.equal(source.includes(forbidden),false,`Action Runtime bypasses a public owner contract: ${forbidden}`);
}
for(const required of ['LuviaTripContractV1','LuviaPlacesContractV1','LuviaBookingContractV1','LuviaJourneyContractV1','reads.recommend','reads.getCard','commands.favorite','commands.openPlaceBooking','commands.openPlanningEditor']){
  assert.ok(source.includes(required),`Action Runtime missing public owner route ${required}`);
}

const calls=[];
const events=[];
const context={
  console,Object,Array,Map,Set,WeakSet,Error,TypeError,String,Boolean,Number,Math,JSON,Date,RegExp,Promise,
  CustomEvent:function(name,options){this.type=name;this.detail=options?.detail},
  dispatchEvent(event){events.push(event)},
  LuviaTripContractV1:{getActiveTrip(){return{id:'trip-1',title:'Ostseeurlaub',destination:{name:'Scharbeutz'}}}},
  LuviaIdentityContractV1:{getPreferences(){calls.push(['preferences']);return{}}},
  LuviaPlacesContractV1:{
    reads:{
      async recommend(input){calls.push(['recommend',input]);return{places:[{id:'places/place-1',name:'Dünenküche',address:'Strandallee 1',rating:4.7,userRatingCount:440,website:'https://restaurant.example',aiReasons:['Passt zur Reise']}],route:{category:'food'}}},
      async getCard(id){calls.push(['card',id]);return{place:{id,providerPlaceId:id,name:'Dünenküche',address:'Strandallee 1',rating:4.7,userRatingCount:440,website:'https://restaurant.example'},image:{url:'https://images.example/dunes.jpg',attribution:'Provider'}}}
    },
    commands:{async favorite(payload){calls.push(['favorite',payload]);return{ok:true,tripPlaceId:'tp-1'}},async unfavorite(payload){calls.push(['unfavorite',payload]);return{ok:true,tripPlaceId:'tp-1'}}}
  },
  LuviaBookingContractV1:{commands:{async openPlaceBooking(payload,options){calls.push(['booking',payload,options]);return{opened:true,channel:'owner_dialog',provider:'official'}}}},
  LuviaJourneyContractV1:{
    reads:{snapshot(){calls.push(['journey']);return{days:[{date:'2026-08-25',label:'Dienstag',entries:[{id:'e-1',title:'Strand',startAt:'2026-08-25T09:00:00.000Z',entityType:'place',provenance:{owner:'places'}}],conflicts:[]}],summary:{entryCount:1}}}},
    commands:{async openPlanningEditor(payload){calls.push(['journey-open',payload]);return{opened:true}}}
  }
};
context.globalThis=context;
vm.createContext(context);
vm.runInContext(read('core/intelligence/intelligence-action-contract-core.js'),context,{filename:'core/intelligence/intelligence-action-contract-core.js'});
vm.runInContext(read('core/intelligence/intelligence-action-ledger-core.js'),context,{filename:'core/intelligence/intelligence-action-ledger-core.js'});
vm.runInContext(source,context,{filename:runtimePath});

(async()=>{
  const runtime=context.LuviaAIActionRuntime;
  const restaurants=await runtime.runMessage('Finde uns ein schönes Restaurant am Wasser',{surface:'global-chat'});
  assert.equal(restaurants.handled,true);
  assert.equal(restaurants.results[0].kind,'place_collection');
  assert.equal(restaurants.results[0].items.length,1);
  assert.equal(restaurants.results[0].items[0].image.url,'https://images.example/dunes.jpg');
  assert.equal(restaurants.results[0].items[0].actions[0].actionId,'places.place.favorite');
  assert.equal(restaurants.results[0].items[0].actions[1].actionId,'booking.place.open');
  const recommendation=calls.find(call=>call[0]==='recommend');
  assert.equal(recommendation[1].destination,'Scharbeutz');
  assert.equal(recommendation[1].tripId,'trip-1');

  const day=await runtime.runMessage('Plane uns einen schönen Tag');
  assert.equal(day.handled,true);
  assert.equal(day.results[0].kind,'day_plan');
  assert.equal(day.results[0].owner,'journey');
  assert.equal(day.results[0].items[0].entries[0].owner,'places');
  assert.equal(day.results[0].actions[0].actionId,'journey.day.open');

  const generic=await runtime.runMessage('Erkläre mir die Reise');
  assert.equal(generic.handled,false);

  const favoritePreview=runtime.prepare('places.place.favorite',{tripId:'trip-1',providerPlaceId:'place-1',placeType:'restaurant'},{userGesture:true});
  assert.equal(favoritePreview.requiresConfirmation,true);
  assert.equal(favoritePreview.result.kind,'confirmation');
  const favorite=await runtime.execute('places.place.favorite',{}, {ledgerId:favoritePreview.ledgerId,userGesture:true,confirmed:true});
  assert.equal(favorite.kind,'receipt');
  assert.equal(favorite.owner,'places');
  assert.equal(favorite.evidence.status,'completed');
  assert.equal(runtime.recoveryPlan(favorite.evidence.ledgerId).kind,'undo');
  const undoPreview=runtime.prepareUndo(favorite.evidence.ledgerId,{userGesture:true});
  assert.equal(undoPreview.requiresConfirmation,true);
  const undone=await runtime.execute(undoPreview.result.evidence.actionId,{}, {ledgerId:undoPreview.ledgerId,userGesture:true,confirmed:true});
  assert.equal(undone.evidence.status,'compensated');
  assert.equal(calls.some(call=>call[0]==='unfavorite'),true);

  const booking=await runtime.execute('booking.restaurant.open',{tripId:'trip-1',providerPlaceId:'place-1',name:'Dünenküche'},{userGesture:true});
  assert.equal(booking.evidence.status,'opened');
  assert.equal(calls.find(call=>call[0]==='booking')[2].reserveExternalWindow,true);

  const journey=await runtime.execute('journey.day.open',{tripId:'trip-1',date:'2026-08-25'},{userGesture:true});
  assert.equal(journey.evidence.status,'opened');
  assert.equal(calls.find(call=>call[0]==='journey-open')[1].date,'2026-08-25');

  assert.equal(events.some(event=>event.type==='luvia:ai-action-changed'),true);
  assert.equal(runtime.diagnostics().policy.foreignDomainMutation,false);
  assert.equal(runtime.diagnostics().policy.journeyTimelineOwner,false);

  console.log('M15.4 Intelligence Action Runtime: PASS');
  console.log('Restaurant rich result + Booking owner action: PASS');
  console.log('Journey Day Graph separation: PASS');
  console.log('Private owner bypass: 0');
})().catch(error=>{console.error(error);process.exit(1)});
