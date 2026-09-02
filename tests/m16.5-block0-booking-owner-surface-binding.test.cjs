'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const read=file=>fs.readFileSync(file,'utf8');
const registry=JSON.parse(read('config/luvia-human-ai-action-registry.v1.json'));
const calls=[];
const runtime={
  async init(){return{}},async listForTrip(id){calls.push(['listForTrip',id]);return[{id:'booking-1',trip_id:id}]},
  async get(id){calls.push(['get',id]);return{id}},async conversation(id){calls.push(['conversation',id]);return{booking:{id},messages:[]}},
  async messages(){return[]},async bookingTimeline(id){calls.push(['bookingTimeline',id]);return{items:[]}},async providerCapabilities(){return[]},
  async conversationPreferences(ids){calls.push(['conversationPreferences',ids]);return[]},async createForPlace(input){return input},async submitReservation(input){calls.push(['submitReservation',input]);return input},
  async reply(id,input){calls.push(['reply',id,input]);return{id,...input}},async performIntelligenceAction(id,input){calls.push(['performIntelligenceAction',id,input]);return{id,...input}},
  async modifyBooking(id,input){return{id,...input}},async cancelBooking(id,input){return{id,...input}},async setConversationPreference(id,action,value){return{id,action,value}},
  async updateContact(id,email){calls.push(['updateContact',id,email]);return{id,email}},async reconcileTripReturns(id){calls.push(['reconcileTripReturns',id]);return{tripId:id}}
};
const context={Object,Array,String,Number,Boolean,Date,Math,RegExp,JSON,Set,Map,Error,TypeError,Promise,LuviaBooking:runtime,LuviaBookingUI:{async openForPlace(){return{opened:true}}},LuviaGlobalContracts:{register(){}}};
context.window=context;context.globalThis=context;vm.createContext(context);vm.runInContext(read('core/platform/booking-contract-adapter.js'),context,{filename:'core/platform/booking-contract-adapter.js'});

(async()=>{
  const contract=context.LuviaBookingContractV1;
  const bindings=new Map([
    [216,['reads.listForTrip','tripId']],[217,['reads.listForTrip','status']],[218,['reads.listForTrip','refresh']],
    [219,['reads.get','bookingId']],[220,['reads.bookingTimeline','bookingId']],[223,['commands.updateContact','bookingId|email']],
    [233,['reads.listForTrip','inbox']],[234,['reads.conversation','bookingId']],[235,['reads.listForTrip','filter']],
    [236,['reads.listForTrip','refresh']],[238,['commands.reply','bookingId|bodyText']],[239,['commands.reply','bookingId|bodyText']],
    [241,['commands.performIntelligenceAction','bookingId|action']]
  ]);
  for(const [sequence,[method,key]] of bindings){const action=registry.actions.find(item=>item.sequence===sequence),[namespace,name]=method.split('.');assert.ok(action);assert.equal(action.owner.contract,'booking.v1');assert.equal(action.owner.method,method);assert.equal(action.owner.operationKey,key);assert.equal(action.owner.bindingStatus,'PUBLIC_CONTRACT_BOUND');assert.equal(typeof contract[namespace][name],'function')}
  await contract.reads.listForTrip('trip-1');await contract.reads.get('booking-1');await contract.reads.bookingTimeline('booking-1');await contract.reads.conversation('booking-1');await contract.reads.conversationPreferences(['booking-1']);
  await contract.commands.updateContact('booking-1','owner@example.test');await contract.commands.reply('booking-1',{bodyText:'Bitte bestätigen'});await contract.commands.performIntelligenceAction('booking-1',{action:'mark_reviewed'});await contract.commands.reconcileTripReturns('trip-1');
  for(const name of ['listForTrip','get','bookingTimeline','conversation','conversationPreferences','updateContact','reply','performIntelligenceAction','reconcileTripReturns'])assert.ok(calls.some(call=>call[0]===name),`${name} did not reach Booking owner`);
  const control=read('app/control-center/booking-control-center.js'),inbox=read('app/control-center/booking-inbox.js'),bookings=read('app/bookings-view.js');
  assert.equal(control.includes('LuviaBookingIntegration||window.LuviaBooking'),false,'Booking Control Center bypasses booking.v1');
  assert.equal(inbox.includes('LuviaBookingIntegration||window.LuviaBooking'),false,'Booking Inbox bypasses booking.v1');
  for(const token of ['bookingContract().reads.listForTrip','bookingContract().reads.bookingTimeline','bookingContract().commands'])assert.ok(`${control}\n${inbox}`.includes(token),`missing public consumer route ${token}`);
  assert.match(bookings,/bookingContract\(\)\.commands\.updateContact/);
  assert.match(bookings,/bookingContract\(\)\.reads\.listForTrip/);
  assert.ok(registry.summary.ownerBinding.PUBLIC_CONTRACT_BOUND>=59);
  assert.ok((registry.summary.ownerBinding.OWNER_METHOD_AUDIT_OPEN||0)<=184);
  console.log('M16.5 Block 0 Booking public Owner surface: PASS');
  console.log('13 Booking actions -> booking.v1 reads/commands: PASS');
  console.log('Booking Control Center + Inbox public contract adoption: PASS');
  console.log('Owner methods open: 197 -> 184');
})().catch(error=>{console.error(error);process.exitCode=1});
