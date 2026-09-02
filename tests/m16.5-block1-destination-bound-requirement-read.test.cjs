'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const read=file=>fs.readFileSync(file,'utf8');

const ownerCalls=[];
let mode='target';
const activeTrip={id:'trip-scharbeutz',destination:{name:'Scharbeutz'}};
const tonfink={id:'places/tonfink',providerPlaceId:'tonfink',name:'Tonfink',primaryType:'night_club',types:['night_club','bar'],formattedAddress:'Große Burgstr. 46, 23552 Lübeck',reservationRequired:true};
const wrong={id:'places/beach-lounge',providerPlaceId:'beach-lounge',name:'Beach Lounge',primaryType:'night_club',types:['night_club','bar'],formattedAddress:'Strandallee 130, Scharbeutz'};
const context={
  console,Object,Array,Map,Set,WeakSet,Error,TypeError,String,Boolean,Number,Math,JSON,Date,Intl,RegExp,Promise,
  crypto:{randomUUID:()=>`destination-bound-${ownerCalls.length+1}`},
  CustomEvent:function(name,options){this.type=name;this.detail=options?.detail},dispatchEvent(){},
  LuviaTripContractV1:{getActiveTrip:()=>activeTrip,listTrips:()=>[activeTrip]},
  LuviaIdentityContractV1:{getPreferences:()=>({})},
  LuviaPlacesContractV1:{
    reads:{
      async recommend(input){ownerCalls.push(input);return{places:mode==='target'?[tonfink]:[wrong],route:{category:input.category},providerDiagnostics:{providers:[{provider:'foursquare',status:'fulfilled'}]}}},
      async getCard(id,{source}={}){return{place:source||({tonfink,wrong}[id]||null),image:null}}
    },commands:{}
  }
};
context.LuviaBookingContractV1={reads:{resolveAdmission:place=>context.LuviaBookingAdmissionCore.resolve(place),listForTrip:async()=>[]},commands:{openPlaceBooking(){throw new Error('read test must not execute booking')}}};
context.window=context;context.globalThis=context;
vm.createContext(context);
for(const file of ['core/intelligence/travel-orchestration-core.js','core/intelligence/intelligence-action-contract-core.js','core/intelligence/intelligence-action-ledger-core.js','core/booking/booking-admission-core.js','core/ai/ai-action-runtime.js'])vm.runInContext(read(file),context,{filename:file});

(async()=>{
  const compiler=context.LuviaTravelOrchestrationCoreV1,runtime=context.LuviaAIActionRuntime,message='Prüfe bitte beim Tonfink in Lübeck, ob ich reservieren muss.';
  const compiled=compiler.compileDialogue(message,{confidence:.98,goals:[{type:'booking',label:'Reservierungspflicht im Tonfink prüfen',hardConstraints:[{key:'operation',value:'check_requirement',label:'Nur Reservierungserfordernis prüfen'},{key:'target',value:'Tonfink',label:'Tonfink'},{key:'destination',value:'Lübeck',label:'In Lübeck'}]}]},{trip:activeTrip,online:true,locale:'de-DE'});
  assert.equal(compiled.intents[0].entityHints.destinationName,'lübeck');
  assert.equal(compiled.intents[0].entityHints.targetName,'tonfink');
  assert.equal(compiled.intents[0].mode,'read');

  const response=await runtime.runMessage(message,{compiledIntent:compiled,sourceMessage:message,surface:'global-chat'});
  assert.equal(response.error,false);
  assert.equal(ownerCalls.length,1);
  assert.equal(ownerCalls[0].destination,'lübeck','the explicit sentence destination must override the active Scharbeutz trip destination');
  assert.equal(ownerCalls[0].query,'tonfink','a requirement read must search the exact subject, not a verbose dialogue summary');
  assert.equal(ownerCalls[0].destinationContext.name,'lübeck');
  assert.equal(response.results[0].kind,'message');
  assert.equal(response.results[0].owner,'booking');
  assert.match(response.results[0].title,/Reservierung bei Tonfink erforderlich/);
  assert.equal(response.results[0].evidence.exactSubjectResolved,true);
  assert.equal(response.results[0].evidence.automaticMutation,false);

  const multiMessage='Finde mir in Lübeck einen Nachtclub und prüfe, ob ich im Tonfink reservieren muss.';
  const multiCompiled=compiler.compileDialogue(multiMessage,{confidence:.98,goals:[
    {type:'places',label:'Nachtclub in Lübeck finden',hardConstraints:[{key:'destination',value:'Lübeck',label:'In Lübeck'},{key:'category',value:'nightlife',label:'Nachtclub suchen'}]},
    {type:'booking',label:'Reservierungspflicht im Tonfink prüfen',hardConstraints:[{key:'operation',value:'check_requirement',label:'Reservierungserfordernis prüfen'},{key:'target',value:'Tonfink',label:'Tonfink'}]}
  ]},{trip:activeTrip,online:true,locale:'de-DE'});
  const secondIntent=multiCompiled.intents.find(intent=>intent.sequence===2&&intent.domain==='booking');
  assert.equal(secondIntent.entityHints.destinationName,'Lübeck','a sentence-level destination must remain bound to every dependent dialogue goal');
  ownerCalls.length=0;mode='target';
  const secondResponse=await runtime.runMessage(multiMessage,{compiledIntent:compiler.sliceIntentGraph(multiCompiled,2),sourceMessage:multiMessage,surface:'global-chat'});
  assert.equal(ownerCalls[0].destination,'Lübeck','the sequential requirement step must not fall back to the active Scharbeutz trip');
  assert.equal(secondResponse.results[0].evidence.destination,'Lübeck');
  assert.equal(secondResponse.results[0].evidence.exactSubjectResolved,true);

  mode='wrong';ownerCalls.length=0;
  const mismatch=await runtime.runMessage(message,{compiledIntent:compiled,sourceMessage:message,surface:'global-chat'});
  assert.equal(mismatch.results[0].kind,'message');
  assert.match(mismatch.results[0].title,/Tonfink nicht eindeutig gefunden/i);
  assert.equal(mismatch.results[0].evidence.exactSubjectResolved,false);
  assert.doesNotMatch(mismatch.results[0].title,/Beach Lounge|A-ROSA/i,'a different venue may never satisfy an exact requirement read');

  const fallback=compiler.compileIntent('Zeig mir Nachtclubs in Lübeck.',{trip:activeTrip,online:false});
  assert.equal(fallback.intents[0].entityHints.destinationName,'Lübeck');
  console.log('M16.5 Block 1 destination-bound exact requirement read: PASS');
})().catch(error=>{console.error(error);process.exitCode=1});
