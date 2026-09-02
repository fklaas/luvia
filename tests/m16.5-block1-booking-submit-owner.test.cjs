'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('core/booking/booking-integration.js','utf8');

function runtimeFor({route,reservationResult=null}){
  const rows=new Map(),calls=[];let sequence=0;
  const query=table=>{
    const state={filters:{}};
    const chain={select(){return chain},eq(key,value){state.filters[key]=value;return chain},order(){return chain},in(){return chain},maybeSingle(){const row=[...rows.values()].find(item=>Object.entries(state.filters).every(([key,value])=>item[key]===value));return Promise.resolve({data:row||null,error:null})},then(resolve){let data=[...rows.values()].filter(item=>Object.entries(state.filters).every(([key,value])=>item[key]===value));resolve({data,error:null})}};
    return chain;
  };
  const client={
    from:query,
    rpc:async(name,args)=>{calls.push(['rpc',name,args]);return{data:{linked:false},error:null}},
    functions:{invoke:async(name,args)=>{
      calls.push(['function',name,args]);
      if(name==='booking-route-resolve'){
        const booking=rows.get(args.body.bookingId);if(route.channel==='email'){booking.channel='email';booking.provider=route.provider;booking.contact={...(booking.contact||{}),email:route.value}}else if(['external_link','affiliate'].includes(route.channel)){booking.channel=route.channel;booking.provider=route.provider;booking.contact={...(booking.contact||{}),bookingUrl:route.value}}return{data:{ok:true,resolved:true,...route},error:null};
      }
      return{data:{ok:true},error:null};
    }}
  };
  const context={console,Object,Array,Map,Set,Error,TypeError,String,Boolean,Number,Math,JSON,Date,URL,Promise,CustomEvent:function(name,options){this.type=name;this.detail=options?.detail},dispatchEvent(){},addEventListener(){},
    LuviaTripContractV1:{getActiveTrip:()=>({id:'trip-1',destination:{name:'Scharbeutz'}})},
    LuviaSupabaseService:{start:async()=>client},LuviaBookingRepository:{createSupabaseRepository:()=>({})},
    LuviaBookingCore:{version:'test',configure(){},async create(input){const row={...input,id:`booking-${++sequence}`,trip_id:input.tripId,contact:input.contact||{},request:input.request||{},metadata:input.metadata||{},provider:input.provider||null,channel:input.channel||'manual'};rows.set(row.id,row);return row},async transition(id,status){const row=rows.get(id);row.status=status;return row}},
    LuviaBookingReservationCreate:{async create(input){calls.push(['provider-create',input]);return reservationResult}},
    LuviaBookingEmailV2:{async send(input){calls.push(['email-send',input]);return{ok:true,messageId:'message-1'}}}
  };
  context.window=context;context.globalThis=context;vm.createContext(context);vm.runInContext(source,context,{filename:'booking-integration.js'});
  return{booking:context.LuviaBooking,calls,rows};
}

(async()=>{
  const provider=runtimeFor({route:{channel:'api',provider:'opentable'},reservationResult:{ok:true,bookingId:'ignored',providerId:'opentable',reservationReference:'ot-1',luviaStatus:'requested'}});
  const providerResult=await provider.booking.submitReservation({tripId:'trip-1',place:{providerPlaceId:'place-1',name:'Dünenblick',primaryType:'restaurant'},route:{resolved:true,channel:'api',provider:'opentable'},provider:'opentable',venueReference:'venue-1',date:'2027-06-15',time:'18:30',startAt:'2027-06-15T16:30:00.000Z',partySize:4,idempotencyKey:'provider-once'});
  assert.equal(providerResult.transport,'provider_api');
  assert.equal(providerResult.submissionState,'provider_requested');
  assert.equal(provider.calls.filter(call=>call[0]==='provider-create').length,1);
  assert.equal(provider.calls.some(call=>call[0]==='email-send'),false);

  const email=runtimeFor({route:{channel:'email',provider:'official',value:'booking@duenenblick.example'}});
  const emailResult=await email.booking.submitReservation({tripId:'trip-1',place:{providerPlaceId:'place-2',name:'Dünenblick',primaryType:'restaurant',website:'https://duenenblick.example'},date:'2027-06-15',time:'18:30',startAt:'2027-06-15T16:30:00.000Z',partySize:4,idempotencyKey:'email-once'});
  assert.equal(emailResult.transport,'email');
  assert.equal(emailResult.submissionState,'email_sent');
  assert.equal(email.calls.filter(call=>call[0]==='email-send').length,1);

  const external=runtimeFor({route:{channel:'external_link',provider:'thefork',value:'https://thefork.example/duenenblick'}});
  const externalResult=await external.booking.submitReservation({tripId:'trip-1',place:{providerPlaceId:'place-3',name:'Dünenblick',primaryType:'restaurant',website:'https://duenenblick.example'},date:'2027-06-15',time:'18:30',startAt:'2027-06-15T16:30:00.000Z',partySize:4,idempotencyKey:'external-once'});
  assert.equal(externalResult.ok,false);
  assert.equal(externalResult.submissionState,'external_action_required');
  assert.equal(externalResult.requiresUserAction,true);
  assert.equal(external.calls.some(call=>call[0]==='email-send'||call[0]==='provider-create'),false,'an external handoff must never be reported as a sent reservation');

  const rawEmail=runtimeFor({route:{channel:'manual',provider:null,value:null}});
  const rawResult=await rawEmail.booking.submitReservation({tripId:'trip-1',place:{providerPlaceId:'place-4',name:'Unsicherer Ort',primaryType:'restaurant',email:'private@example.test'},email:'private@example.test',emailVerified:false,date:'2027-06-15',time:'18:30',startAt:'2027-06-15T16:30:00.000Z',partySize:2,idempotencyKey:'raw-email-blocked'});
  assert.equal(rawResult.submissionState,'route_unavailable');
  assert.equal(rawEmail.calls.some(call=>call[0]==='email-send'),false,'an unverified e-mail must never become a transport');
  console.log('M16.5 Block 1 Booking submit Owner: PASS');
  console.log('Provider API / verified e-mail / external handoff are truthfully separated: PASS');
  console.log('Unverified contact transport: BLOCKED');
})().catch(error=>{console.error(error);process.exitCode=1});
