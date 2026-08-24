'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const read=path=>fs.readFileSync(path,'utf8');
const runtimePath='core/ai/ai-action-runtime.js';
const source=read(runtimePath);
const calls=[];
const events=[];

for(const forbidden of ['LuviaTripStore','LuviaPlaceCore','LuviaPlaceRuntime','LuviaBookingUI','LuviaTimelineCore','LuviaSupabaseService','.from(','.rpc(','functions.invoke(','localStorage','sessionStorage']){
  assert.equal(source.includes(forbidden),false,`M16 Action Runtime bypasses a public owner contract: ${forbidden}`);
}

const context={
  console,Object,Array,Map,Set,WeakSet,Error,TypeError,String,Boolean,Number,Math,JSON,Date,RegExp,Promise,
  crypto:{randomUUID:()=>`uuid-${calls.length+1}`},
  CustomEvent:function(name,options){this.type=name;this.detail=options?.detail},
  dispatchEvent(event){events.push(event)},
  LuviaTripContractV1:{
    getActiveTrip(){return{id:'trip-1',title:'Ostseeurlaub',destination:{name:'Scharbeutz'}}},
    listTrips(){return[{id:'trip-1',title:'Ostseeurlaub',destination:{name:'Scharbeutz'}},{id:'trip-2',title:'Paris',destination:{name:'Paris'}}]},
    reads:{listTrips(){return this.listTrips?.()||[]}},
    commands:{
      selectActiveTrip(id,options){calls.push(['trip-select',id,options]);return{ok:true,id}},
      async updateTrip(id,patch){calls.push(['trip-update',id,patch]);return{ok:true,id}}
    }
  },
  LuviaPlacesContractV1:{
    reads:{
      async recommend(input){calls.push(['recommend',input]);return{places:[{id:'places/place-1',name:'Dünenküche',address:'Strandallee 1',rating:4.7,userRatingCount:440}],route:{category:'food'}}},
      async getCard(id){return{place:{id,providerPlaceId:id,name:'Dünenküche',address:'Strandallee 1',rating:4.7,userRatingCount:440},image:{url:'https://images.example/dunes.jpg'}}}
    },
    commands:{
      async favorite(payload){calls.push(['favorite',payload]);return{ok:true,tripPlaceId:'tp-1'}},
      async unfavorite(payload){calls.push(['unfavorite',payload]);return{ok:true,tripPlaceId:'tp-1'}},
      async plan(payload){calls.push(['plan',payload]);return{ok:true,tripPlaceId:'tp-1'}},
      async unplan(payload){calls.push(['unplan',payload]);return{ok:true,tripPlaceId:'tp-1'}}
    }
  },
  LuviaBookingContractV1:{
    reads:{async listForTrip(id){calls.push(['booking-list',id]);return[{id:'booking-1',tripId:id,title:'Dünenküche',status:'confirmed',date:'2026-08-26',time:'19:00',partySize:2}]}},
    commands:{
      async openPlaceBooking(payload,options){calls.push(['booking-open',payload,options]);return{opened:true,channel:'owner_dialog'}},
      async createForPlace(payload){calls.push(['booking-create',payload]);return{bookingId:'booking-2',status:'requested'}},
      async modifyBooking(id,payload){calls.push(['booking-modify',id,payload]);return{bookingId:id,status:'change_requested'}},
      async cancelBooking(id,payload){calls.push(['booking-cancel',id,payload]);const error=new Error('Provider timeout');error.code='BOOKING_PROVIDER_TIMEOUT';throw error}
    }
  },
  LuviaJourneyContractV1:{
    reads:{snapshot(){return{days:[{date:'2026-08-25',label:'Dienstag',entries:[]}],summary:{entryCount:0}}}},
    commands:{async openPlanningEditor(payload){calls.push(['journey-open',payload]);return{opened:true}}}
  },
  LuviaMemoryContractV1:{
    reads:{async listStories(){return[{id:'story-1',title:'Ein Tag am Meer',status:'published'}]}},
    commands:{stories:{async save(payload){calls.push(['memory-save',payload]);return{storyId:'story-1'}}}}
  },
  LuviaIdentityContractV1:{
    getPreferences(){return{food:['vegetarisch'],pace:'entspannt'}},
    commands:{async updatePreferences(patch){calls.push(['preferences-update',patch]);return{ok:true}}}
  }
};
context.globalThis=context;
vm.createContext(context);
for(const file of ['core/intelligence/intelligence-action-contract-core.js','core/intelligence/intelligence-action-ledger-core.js',runtimePath]){
  vm.runInContext(read(file),context,{filename:file});
}

(async()=>{
  const runtime=context.LuviaAIActionRuntime;
  const diagnostics=runtime.diagnostics();
  assert.equal(diagnostics.actions,19);
  assert.equal(diagnostics.availableActions,19);
  assert.equal(diagnostics.connections.length,6);
  assert.equal(diagnostics.connections.every(connection=>connection.registered&&connection.operations===connection.totalOperations),true);

  const trips=await runtime.runMessage('Zeige mir meine Reisen');
  assert.equal(trips.results[0].kind,'trip_collection');
  assert.equal(trips.results[0].items.length,2);
  assert.equal(trips.results[0].items[1].actions[0].actionId,'trip.active.select');

  const bookings=await runtime.runMessage('Welche Buchungen habe ich?');
  assert.equal(bookings.results[0].kind,'booking_collection');
  assert.equal(bookings.results[0].items[0].actions[1].actionId,'booking.reservation.cancel');

  const memories=await runtime.runMessage('Zeige meine Reisegeschichten');
  assert.equal(memories.results[0].kind,'memory_collection');
  assert.equal(memories.results[0].items[0].title,'Ein Tag am Meer');

  const preferences=await runtime.runMessage('Welche Vorlieben sind gespeichert?');
  assert.equal(preferences.results[0].kind,'preference_summary');
  assert.equal(preferences.results[0].summary.scope,'self');
  assert.ok(preferences.results[0].summary.configuredCount>=1);

  const cancelled=runtime.prepare('places.place.unplan',{tripId:'trip-1',providerPlaceId:'place-1'},{userGesture:true});
  assert.equal(cancelled.requiresConfirmation,true);
  assert.equal(runtime.getActionState(cancelled.ledgerId).status,'confirmation_required');
  const cancelReceipt=runtime.cancel(cancelled.ledgerId);
  assert.equal(cancelReceipt.evidence.status,'cancelled');
  assert.equal(calls.filter(call=>call[0]==='unplan').length,0);

  const prepared=runtime.prepare('places.place.plan',{tripId:'trip-1',providerPlaceId:'place-1'},{userGesture:true,idempotencyKey:'plan-once'});
  assert.equal(prepared.result.kind,'confirmation');
  const first=await runtime.execute('places.place.plan',{}, {ledgerId:prepared.ledgerId,userGesture:true,confirmed:true});
  const repeated=await runtime.execute('places.place.plan',{}, {ledgerId:prepared.ledgerId,userGesture:true,confirmed:true});
  assert.equal(first.evidence.status,'completed');
  assert.equal(repeated.evidence.idempotencyKey,'plan-once');
  assert.equal(calls.filter(call=>call[0]==='plan').length,1);
  assert.equal(runtime.getActionState(prepared.ledgerId).attempts,1);

  const create=runtime.prepare('booking.reservation.create',{tripId:'trip-1',providerPlaceId:'place-1',date:'2026-08-26',time:'19:00',partySize:2},{userGesture:true,idempotencyKey:'booking-create-once'});
  const created=await runtime.execute('booking.reservation.create',{}, {ledgerId:create.ledgerId,userGesture:true,confirmed:true});
  assert.equal(created.evidence.status,'completed');
  assert.equal(calls.find(call=>call[0]==='booking-create')[1].idempotencyKey,'booking-create-once');

  const cancellation=runtime.prepare('booking.reservation.cancel',{tripId:'trip-1',bookingId:'booking-1',reason:'Plan geändert'},{userGesture:true,idempotencyKey:'booking-cancel-unclear'});
  const unclear=await runtime.execute('booking.reservation.cancel',{}, {ledgerId:cancellation.ledgerId,userGesture:true,confirmed:true});
  assert.equal(unclear.evidence.status,'outcome_unknown');
  assert.equal(unclear.evidence.retryable,false);
  assert.equal(runtime.getActionState(cancellation.ledgerId).status,'outcome_unknown');
  await assert.rejects(()=>runtime.retry(cancellation.ledgerId),error=>error.code==='INTELLIGENCE_ACTION_OUTCOME_RECONCILIATION_REQUIRED');
  assert.equal(calls.filter(call=>call[0]==='booking-cancel').length,1);

  assert.equal(events.some(event=>event.detail?.reason==='confirmation-required'),true);
  assert.equal(events.some(event=>event.detail?.reason==='command-completed'),true);
  assert.equal(diagnostics.ledger.storesRawPayload,false);
  assert.equal(diagnostics.ledger.storesForeignDomainTruth,false);

  console.log('M16.3 Confirmed Owner Action Runtime: PASS');
  console.log('19 actions / 6 public owner contracts: AVAILABLE');
  console.log('R2 confirmation + idempotent replay: PASS');
  console.log('R3 unknown external outcome blind retry: BLOCKED');
  console.log('Raw payload / foreign Domain Truth in ledger: NONE');
})().catch(error=>{console.error(error);process.exit(1)});
