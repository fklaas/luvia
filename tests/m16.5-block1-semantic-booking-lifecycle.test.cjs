'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const read=file=>fs.readFileSync(file,'utf8');
const calls=[];
const bookings=[
  {id:'booking-cafe',tripId:'trip-scharbeutz',title:'Grande Beach Café',status:'confirmed',provider:'official',request:{website:'https://cafe.example',providerPlaceId:'fsq-grande-beach-cafe'}},
  {id:'booking-leo',tripId:'trip-scharbeutz',title:'DAS LEO',status:'confirmed',provider:'official',request:{website:'https://das-leo.example',providerPlaceId:'fsq-das-leo'}},
  {id:'booking-museum',tripId:'trip-scharbeutz',title:'Museum für Regionalgeschichte',status:'cancelled',provider:'official'}
];
let uuid=0;
const context={
  console,Object,Array,Map,Set,WeakSet,Error,TypeError,String,Boolean,Number,Math,JSON,Date,Intl,RegExp,Promise,URL,
  crypto:{randomUUID:()=>`semantic-booking-${++uuid}`},
  CustomEvent:function(name,options){this.type=name;this.detail=options?.detail},dispatchEvent(){},
  LuviaTripContractV1:{getActiveTrip:()=>({id:'trip-scharbeutz',timeZone:'Europe/Berlin',destination:{name:'Scharbeutz'}})},
  LuviaNavigationContractV1:{createIntent:route=>({route,label:'Buchungen'}),diagnostics:()=>({ready:true})}
};
context.window=context;context.globalThis=context;vm.createContext(context);
for(const file of ['core/booking/booking-lifecycle-policy-core.js','core/intelligence/travel-orchestration-core.js','core/intelligence/intelligence-action-contract-core.js','core/intelligence/intelligence-action-ledger-core.js'])vm.runInContext(read(file),context,{filename:file});
const lifecycleFor=booking=>context.LuviaBookingLifecyclePolicyCore.assess({booking,thread:booking.id==='booking-museum'?null:{id:`thread-${booking.id}`}});
context.LuviaBookingContractV1={
  reads:{
    async listForTrip(){return bookings},
    async lifecycleCapabilities({booking}){return lifecycleFor(booking)},
    async resolveCommand(input){
      const resolution=context.LuviaBookingLifecyclePolicyCore.resolveTarget({...input,bookings});
      if(resolution.status!=='resolved')return resolution;
      const lifecycle=lifecycleFor(resolution.booking),action=input.operation==='cancel'?lifecycle.actions.cancel:lifecycle.actions.modify;
      return{...resolution,lifecycle,available:action.available,transport:action.transport,reason:action.reason};
    }
  },
  commands:{
    async submitReservation(payload){calls.push(['create',payload]);return{ok:true,bookingId:'booking-new',transport:'email',submissionState:'email_sent',providerOutcomeKnown:true,awaitingProviderReply:true}},
    async modifyBooking(id,payload){calls.push(['modify',id,payload]);return{ok:true,bookingId:id,transport:'email_thread',mutationLifecycleState:'pending',providerOutcomeKnown:true,awaitingProviderReply:true}},
    async cancelBooking(id,payload){calls.push(['cancel',id,payload]);return{ok:true,bookingId:id,transport:'email_thread',mutationLifecycleState:'pending',providerOutcomeKnown:true,awaitingProviderReply:true}},
    async openPlaceBooking(){return{opened:true}}
  },
  diagnostics:()=>({ready:true})
};
vm.runInContext(read('core/ai/ai-action-runtime.js'),context,{filename:'core/ai/ai-action-runtime.js'});
const compiler=context.LuviaTravelOrchestrationCoreV1,runtime=context.LuviaAIActionRuntime;
const dialogue=(label,operation,target,timeWindow=null,partySize=null)=>({confidence:.99,goals:[{type:'booking',label,timeWindow:timeWindow||{},hardConstraints:[{key:'operation',value:operation,label:operation},{key:'target',value:target,label:target},...(partySize?[{key:'party_size',value:String(partySize),label:`${partySize} Personen`}]:[])]}]});

(async()=>{
  const publicModifyMessage='Verschiebe bitte unsere Buchung im DAS LEO auf den 15.06.2027 um 19:30 Uhr.';
  const publicConstraintDialogue={confidence:.99,goals:[{type:'booking',label:'Buchung im DAS LEO ändern',hardConstraints:[
    {key:'operation',value:'modify',label:'Bestehende Buchung ändern'},
    {key:'target',value:'DAS LEO',label:'DAS LEO'},
    {key:'date',value:'2027-06-15',label:'15.06.2027'},
    {key:'time',value:'19:30',label:'19:30 Uhr'}
  ]}]};
  const publicModifyCompiled=compiler.compileDialogue(publicModifyMessage,publicConstraintDialogue,{trip:{startDate:'2027-06-12',endDate:'2027-06-19'},now:'2027-06-12T08:00:00Z'});
  assert.equal(publicModifyCompiled.status,'compiled','structured date/time constraints must not become the internal missing input booking-change');
  assert.deepEqual(JSON.parse(JSON.stringify(publicModifyCompiled.intents[0].temporalHint)),{day:null,date:'2027-06-15',time:'19:30',explicit:true});
  const publicModifyPreview=await runtime.runMessage(publicModifyMessage,{compiledIntent:publicModifyCompiled,sourceMessage:publicModifyMessage});
  assert.equal(publicModifyPreview.results[0].kind,'confirmation');
  assert.equal(publicModifyPreview.results[0].evidence.preview.name,'DAS LEO');
  assert.deepEqual(JSON.parse(JSON.stringify(publicModifyPreview.results[0].evidence.preview.changes)),{date:'2027-06-15',time:'19:30'});

  const modifyMessage='Kannst du bitte unser Abendessen im Grande Beach Café auf den 14.06.2027 um 19:30 Uhr verschieben?';
  const modifyCompiled=compiler.compileDialogue(modifyMessage,dialogue('Grande Beach Café auf 14.06.2027 um 19:30 Uhr verschieben','modify','Grande Beach Café',{start:'2027-06-14T19:30:00+02:00'}),{trip:{startDate:'2027-06-12',endDate:'2027-06-19'},now:'2027-06-12T08:00:00Z'});
  assert.equal(modifyCompiled.status,'compiled');
  const modifyPreview=await runtime.runMessage(modifyMessage,{compiledIntent:modifyCompiled,sourceMessage:modifyMessage});
  assert.equal(modifyPreview.results[0].kind,'confirmation');
  assert.equal(modifyPreview.results[0].evidence.actionId,'booking.reservation.modify');
  const modifyReceipt=await runtime.execute('booking.reservation.modify',{}, {ledgerId:modifyPreview.results[0].evidence.ledgerId,userGesture:true,confirmed:true});
  assert.equal(modifyReceipt.evidence.status,'completed');
  const modified=calls.find(call=>call[0]==='modify');
  assert.equal(modified[1],'booking-cafe');
  assert.equal(modified[2].date,'2027-06-14');
  assert.equal(modified[2].time,'19:30');
  assert.equal(modified[2].idempotencyKey,modifyReceipt.evidence.idempotencyKey);

  const cancelMessage='Bitte storniere die Reservierung im Grande Beach Café.';
  const cancelCompiled=compiler.compileDialogue(cancelMessage,dialogue('Reservierung im Grande Beach Café stornieren','cancel','Grande Beach Café'),{});
  assert.equal(cancelCompiled.status,'compiled');
  const cancelPreview=await runtime.runMessage(cancelMessage,{compiledIntent:cancelCompiled,sourceMessage:cancelMessage});
  assert.equal(cancelPreview.results[0].evidence.actionId,'booking.reservation.cancel');
  await runtime.execute('booking.reservation.cancel',{}, {ledgerId:cancelPreview.results[0].evidence.ledgerId,userGesture:true,confirmed:true});
  assert.equal(calls.find(call=>call[0]==='cancel')[1],'booking-cafe');

  const createMessage='Reserviere bitte für vier Personen am 15.06.2027 um 18:30 Uhr einen Tisch im Dünenblick.';
  const createCompiled=compiler.compileDialogue(createMessage,dialogue('Tisch im Dünenblick am 15.06.2027 um 18:30 Uhr reservieren','reserve','Dünenblick',{start:'2027-06-15T18:30:00+02:00'},4),{trip:{startDate:'2027-06-12',endDate:'2027-06-19'}});
  assert.equal(createCompiled.status,'compiled');
  const createPreview=await runtime.runMessage(createMessage,{compiledIntent:createCompiled,sourceMessage:createMessage,knownPlaceSubjects:[{providerPlaceId:'fsq-duenenblick',name:'Dünenblick',primaryType:'restaurant',website:'https://duenenblick.example'}]});
  assert.equal(createPreview.results[0].evidence.actionId,'booking.reservation.create');
  const createReceipt=await runtime.execute('booking.reservation.create',{}, {ledgerId:createPreview.results[0].evidence.ledgerId,userGesture:true,confirmed:true});
  assert.equal(createReceipt.evidence.status,'completed');
  assert.equal(createReceipt.message,'Die Anfrage wurde an die verifizierte Anbieteradresse gesendet. Sie bleibt offen, bis der Anbieter antwortet.');
  const created=calls.find(call=>call[0]==='create')[1];
  assert.equal(created.place.providerPlaceId,'fsq-duenenblick');
  assert.equal(created.partySize,4);
  assert.equal(created.startAt,'2027-06-15T16:30:00.000Z');

  const ownerCreateMessage='Reserviere mir am 14.06.2027 um 18:30 Uhr für 2 Personen einen Tisch im Grande Beach Café.';
  const ownerCreateCompiled=compiler.compileDialogue(ownerCreateMessage,dialogue('Tisch im Grande Beach Café am 14.06.2027 um 18:30 Uhr reservieren','reserve','Grande Beach Café',{start:'2027-06-14T18:30:00+02:00'},2),{trip:{startDate:'2027-06-12',endDate:'2027-06-19'}});
  const ownerCreatePreview=await runtime.runMessage(ownerCreateMessage,{compiledIntent:ownerCreateCompiled,sourceMessage:ownerCreateMessage,knownPlaceSubjects:[]});
  assert.equal(ownerCreatePreview.results[0].kind,'confirmation','a Booking-owned venue must resolve without a preceding Places search');
  assert.equal(ownerCreatePreview.results[0].evidence.actionId,'booking.reservation.create');
  assert.equal(ownerCreatePreview.results[0].evidence.preview.name,'Grande Beach Café');
  assert.equal(ownerCreatePreview.results[0].evidence.preview.date,'2027-06-14');
  assert.equal(ownerCreatePreview.results[0].evidence.preview.time,'18:30');
  assert.equal(ownerCreatePreview.results[0].evidence.preview.partySize,2);

  const read=await runtime.runMessage('Zeige meine Buchungen');
  const cafe=read.results[0].items.find(item=>item.id==='booking-cafe'),museum=read.results[0].items.find(item=>item.id==='booking-museum');
  assert.deepEqual(Array.from(cafe.actions,action=>action.actionId),['navigation.route.open','booking.reservation.cancel']);
  assert.equal(museum.actions.length,0,'a terminal booking must expose no mutation');
  console.log('M16.5 Block 1 semantic Booking lifecycle: PASS');
  console.log('Whole-sentence Create / Modify / Cancel -> exact Booking Owner: PASS');
  console.log('Lifecycle-filtered Booking cards: PASS');
})().catch(error=>{console.error(error);process.exitCode=1});
