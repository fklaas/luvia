'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const read=file=>fs.readFileSync(file,'utf8');
const ownerCalls=[];
let activeTrip={id:'trip-scharbeutz',timeZone:'Europe/Berlin',destination:{name:'Scharbeutz'}},uuidSequence=0;
const booking={
  reads:{async listForTrip(tripId){ownerCalls.push(['listForTrip',tripId]);return[{id:'booking-1',tripId,title:'Abendessen am Wasser',status:'confirmed',partySize:4}]}},
  commands:{
    async openPlaceBooking(payload){ownerCalls.push(['openPlaceBooking',payload]);return{opened:true,providerPlaceId:payload.providerPlaceId}},
    async createForPlace(payload){ownerCalls.push(['createForPlace',payload]);return{ok:true,id:'booking-created'}},
    async modifyBooking(bookingId,payload){ownerCalls.push(['modifyBooking',bookingId,payload]);return{ok:true,bookingId}},
    async cancelBooking(bookingId,payload){ownerCalls.push(['cancelBooking',bookingId,payload]);if(bookingId==='booking-uncertain'){const error=new Error('Provider timeout');error.code='ETIMEDOUT';throw error}return{ok:true,bookingId}}
  }
};
const context={
  console,Object,Array,Map,Set,WeakSet,Error,TypeError,String,Boolean,Number,Math,JSON,Date,Intl,RegExp,Promise,
  crypto:{randomUUID:()=>`block0-booking-${++uuidSequence}`},
  CustomEvent:function(name,options){this.type=name;this.detail=options?.detail},dispatchEvent(){},
  LuviaTripContractV1:{getActiveTrip:()=>activeTrip},
  LuviaBookingContractV1:booking
};
context.globalThis=context;
vm.createContext(context);
for(const file of ['core/intelligence/intelligence-action-contract-core.js','core/intelligence/intelligence-action-ledger-core.js','core/ai/ai-action-runtime.js'])vm.runInContext(read(file),context,{filename:file});

const core=context.LuviaIntelligenceActionContractCoreV1,runtime=context.LuviaAIActionRuntime;
const ownerCount=()=>ownerCalls.length;
assert.equal(core.validateActionInput('booking.restaurant.open',{providerPlaceId:'fsq-restaurant-1'},{tripId:'trip-scharbeutz'}).valid,true);
assert.equal(core.validateActionInput('booking.trip.read',{query:'Zeige meine Buchungen',intent:'list'},{tripId:'trip-scharbeutz'}).valid,true);
assert.equal(core.validateActionInput('booking.reservation.create',{tripId:'trip-scharbeutz',place:{providerPlaceId:'fsq-restaurant-1'},startAt:'2026-06-14T12:00:00Z',endAt:'2026-06-14T13:30:00Z',partySize:4},{}).valid,true);
assert.equal(core.validateActionInput('booking.reservation.modify',{bookingId:'booking-1',patch:{time:'19:30'}},{}).valid,true);
assert.equal(core.validateActionInput('booking.reservation.cancel',{bookingId:'booking-1'},{}).valid,true);

assert.throws(()=>runtime.prepare('booking.restaurant.open',{}, {userGesture:true}),error=>error.code==='AI_ACTION_INPUT_REQUIRED'&&error.missingInputs.includes('providerPlaceId'));
assert.throws(()=>runtime.prepare('booking.reservation.create',{tripId:'trip-scharbeutz'}, {userGesture:true}),error=>error.code==='AI_ACTION_INPUT_REQUIRED'&&error.missingInputs.includes('place'));
assert.throws(()=>runtime.prepare('booking.reservation.create',{tripId:'trip-scharbeutz',place:{providerPlaceId:'fsq-restaurant-1'},startAt:'2026-06-14T18:00:00Z',endAt:'2026-06-14T17:00:00Z',partySize:0}, {userGesture:true}),error=>error.code==='AI_ACTION_INPUT_CONFLICT'&&error.inputIssues.some(issue=>issue.path==='endAt')&&error.inputIssues.some(issue=>issue.path==='partySize'));
assert.throws(()=>runtime.prepare('booking.reservation.modify',{bookingId:'booking-1',patch:{}}, {userGesture:true}),error=>error.code==='AI_ACTION_INPUT_REQUIRED'&&error.missingInputs.includes('patch'));
assert.throws(()=>runtime.prepare('booking.reservation.cancel',{}, {userGesture:true}),error=>error.code==='AI_ACTION_INPUT_REQUIRED'&&error.missingInputs.includes('bookingId'));
assert.equal(runtime.diagnostics().ledger.count,0,'invalid booking input must fail before ledger creation');
assert.equal(ownerCount(),0,'invalid booking input must fail before owner invocation');

(async()=>{
  const readResult=await runtime.runMessage('Zeige mir meine Buchungen');
  assert.equal(readResult.error,false);
  assert.equal(readResult.results[0].kind,'booking_collection');
  assert.equal(ownerCalls.filter(call=>call[0]==='listForTrip').length,1);
  activeTrip=null;
  const missingTrip=await runtime.runMessage('Zeige mir meine Buchungen');
  assert.equal(missingTrip.error,true);
  assert.equal(missingTrip.results[0].evidence.code,'AI_ACTION_INPUT_REQUIRED');
  assert.equal(ownerCalls.filter(call=>call[0]==='listForTrip').length,1,'read validation must run before the booking owner');
  activeTrip={id:'trip-scharbeutz',timeZone:'Europe/Berlin',destination:{name:'Scharbeutz'}};

  const opened=runtime.prepare('booking.restaurant.open',{tripId:'trip-scharbeutz',providerPlaceId:'fsq-restaurant-1',name:'Restaurant am Wasser'},{userGesture:true});
  assert.equal(opened.requiresConfirmation,false,'opening the booking sheet is a direct gesture, not a reservation');
  const openReceipt=await runtime.execute('booking.restaurant.open',{}, {ledgerId:opened.ledgerId,userGesture:true});
  assert.equal(openReceipt.evidence.status,'opened');

  const createPayload={tripId:'trip-scharbeutz',place:{providerPlaceId:'fsq-restaurant-1',name:'Restaurant am Wasser'},startAt:'2026-06-14T17:00:00Z',endAt:'2026-06-14T19:00:00Z',partySize:4,requesterName:'Fabian',email:'fabian@example.test'};
  const created=runtime.prepare('booking.reservation.create',createPayload,{userGesture:true,idempotencyKey:'booking-create-once'});
  assert.equal(created.requiresConfirmation,true);
  assert.equal(JSON.stringify(created.result).includes('fabian@example.test'),false,'sensitive contact data must not enter confirmation or ledger projections');
  const createReceipt=await runtime.execute('booking.reservation.create',{}, {ledgerId:created.ledgerId,userGesture:true,confirmed:true});
  assert.equal(createReceipt.evidence.status,'completed');
  assert.equal(ownerCalls.find(call=>call[0]==='createForPlace')[1].email,'fabian@example.test','confirmed contact data must reach only the booking owner execution');
  const replay=await runtime.execute('booking.reservation.create',{}, {ledgerId:created.ledgerId,userGesture:true,confirmed:true});
  assert.equal(replay,createReceipt);
  assert.equal(ownerCalls.filter(call=>call[0]==='createForPlace').length,1,'the same ledger action must not book twice');

  const modified=runtime.prepare('booking.reservation.modify',{bookingId:'booking-1',tripId:'trip-scharbeutz',patch:{time:'19:30',partySize:5}},{userGesture:true,idempotencyKey:'booking-modify-once'});
  const modifyReceipt=await runtime.execute('booking.reservation.modify',{}, {ledgerId:modified.ledgerId,userGesture:true,confirmed:true});
  assert.equal(modifyReceipt.evidence.status,'completed');
  assert.equal(ownerCalls.filter(call=>call[0]==='modifyBooking').length,1);

  const cancelled=runtime.prepare('booking.reservation.cancel',{bookingId:'booking-1',tripId:'trip-scharbeutz',reason:'Plan geändert'},{userGesture:true,idempotencyKey:'booking-cancel-once'});
  const cancelReceipt=await runtime.execute('booking.reservation.cancel',{}, {ledgerId:cancelled.ledgerId,userGesture:true,confirmed:true});
  assert.equal(cancelReceipt.evidence.status,'completed');

  const uncertain=runtime.prepare('booking.reservation.cancel',{bookingId:'booking-uncertain',tripId:'trip-scharbeutz'},{userGesture:true,idempotencyKey:'booking-cancel-uncertain'});
  const uncertainReceipt=await runtime.execute('booking.reservation.cancel',{}, {ledgerId:uncertain.ledgerId,userGesture:true,confirmed:true});
  assert.equal(uncertainReceipt.evidence.status,'outcome_unknown');
  assert.equal(uncertainReceipt.evidence.retryable,false);
  assert.equal(runtime.recoveryPlan(uncertain.ledgerId).kind,'owner-reconciliation');
  await assert.rejects(()=>runtime.retry(uncertain.ledgerId),error=>error.code==='INTELLIGENCE_ACTION_OUTCOME_RECONCILIATION_REQUIRED');
  assert.equal(ownerCalls.filter(call=>call[0]==='cancelBooking'&&call[1]==='booking-uncertain').length,1,'unknown provider outcomes must never be repeated blindly');

  console.log('M16.5 Block 0 Booking input enforcement: PASS');
  console.log('Open / Read / Create / Modify / Cancel: VALIDATED');
  console.log('Explicit confirmation + idempotent receipt + private owner handoff: PASS');
  console.log('Unknown provider outcome -> reconciliation, no blind retry: PASS');
})().catch(error=>{console.error(error);process.exitCode=1});
