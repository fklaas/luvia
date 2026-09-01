'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const read=file=>fs.readFileSync(file,'utf8');
const counters={places:0,events:0,memory:0,identity:0,booking:0,memoryWrites:0,identityWrites:0};
let uuidSequence=0;
const activeTrip={id:'trip-1',title:'Ostsee',city:'Scharbeutz',destination:{name:'Scharbeutz'}};
const placesContract={
  reads:{
    async recommend(input){counters.places++;return{route:{category:input.category},places:[{id:`place-${input.category}`,providerPlaceId:`place-${input.category}`,name:'Belegter Ort',primaryType:input.category,address:'Scharbeutz'}],evidenceContract:{strict:true},providerDiagnostics:{status:'ready',providers:[{provider:'fixture',status:'fulfilled'}]}}},
    async getCard(id,{source}){return{place:{...source,providerPlaceId:id},image:null}}
  }
};
const memoryContract={
  reads:{async listStories(input){counters.memory++;return[{id:'story-existing',title:'Ostsee',query:input.query}]}},
  commands:{stories:{async save(story){counters.memoryWrites++;return{id:story.id||'story-new',storyId:story.id||'story-new'}}}}
};
const identityContract={
  getPreferences(){counters.identity++;return{travelInterests:['Küste'],pace:'ruhig'}},
  commands:{async updatePreferences(patch){counters.identityWrites++;return{updated:Object.keys(patch)}}}
};
const verifiedEventContract={
  reads:{
    async listVerified(input){counters.events++;return{status:'ready',visible:[{eventClaimId:'event-1',title:'Hafenfest',productVisibility:'visible',startAt:input.from||'2026-06-14T18:00:00Z',endAt:input.to||'2026-06-14T20:00:00Z'}],counts:{visible:1},sourceFailures:[],sourceGateway:true}},
    buildGraph(){return{kind:'graph'}},brushGraph(){return{kind:'brush'}},culturalContext(){return{kind:'context'}},serendipityWindow(){return{kind:'window'}},groupTasteDivergence(){return{kind:'group'}},weatherSafeSubstitution(){return{kind:'weather'}},reconcileSchedule(){return{kind:'schedule'}}
  }
};
const bookingContract={reads:{async searchStayOffers(input){counters.booking++;return{productMode:'live_price_compare',hotels:[{propertyKey:'hotel-1',propertyName:'Seehotel Berlin',offerCount:2,bestAvailableTotal:{providerId:'hotelbeds',source:'provider_api',price:{total:295,currency:input.currency}},bestFlexibleOffer:{cancellation:{refundable:true}}}],claims:{priceRankingAvailable:true,crossSourcePriceComparisonAvailable:true,liveProviderCount:2},coverage:{fulfilledProviders:2,expectedProviders:2},search:{checkIn:input.checkIn,checkOut:input.checkOut}}}}};
const context={
  console,Object,Array,Map,Set,WeakSet,Error,TypeError,String,Boolean,Number,Math,JSON,Date,Intl,RegExp,Promise,
  crypto:{randomUUID:()=>`block0-remaining-${++uuidSequence}`},
  CustomEvent:function(name,options){this.type=name;this.detail=options?.detail},dispatchEvent(){},
  LuviaTripContractV1:{getActiveTrip:()=>activeTrip,reads:{getActiveTrip:()=>activeTrip}},
  LuviaPlacesContractV1:placesContract,
  LuviaMemoryContractV1:memoryContract,
  LuviaIdentityContractV1:identityContract,
  LuviaBookingContractV1:bookingContract,
  LuviaVerifiedEventIntelligenceContractV1:verifiedEventContract
};
context.globalThis=context;
vm.createContext(context);
for(const file of ['core/intelligence/intelligence-action-contract-core.js','core/intelligence/intelligence-action-ledger-core.js','core/ai/ai-action-runtime.js'])vm.runInContext(read(file),context,{filename:file});

const core=context.LuviaIntelligenceActionContractCoreV1,runtime=context.LuviaAIActionRuntime;
const validInputs={
  'places.restaurant.recommend':{query:'Ruhiges Restaurant am Wasser',categories:['food'],limit:3,explicitPreferencePatch:{pace:'ruhig'},spatialConstraints:{relation:'waterfront'},strictPlaceType:'restaurant',mutationHints:{favorite:false}},
  'places.discovery.recommend':{query:'Minigolf oder Luftmatratzen',categories:['miniature_golf_course','shopping'],limit:3},
  'booking.stay.search':{destination:'Berlin',cityCode:'BER',checkIn:'2027-06-12',checkOut:'2027-06-14',adults:2,children:0,childAges:[],rooms:1,currency:'EUR'},
  'events.verified.read':{query:'Familienfest',from:'2026-06-14T00:00:00+02:00',to:'2026-06-15T00:00:00+02:00',limit:12},
  'memory.library.read':{query:'Ostsee'},
  'memory.story.save':{storyId:'story-new',story:{id:'story-new',title:'Unser Tag am Meer',description:'Ein privater, nur dem Memory Owner übergebener Storytext.',status:'draft',mediaIds:['media-1']}},
  'identity.preferences.read':{query:'Was mag ich?',scope:'self'},
  'identity.preferences.update':{patch:{pace:'ruhig',travelInterests:['Küste','Minigolf']},source:'explicit-chat-request',evidenceId:'evidence-1'}
};
for(const [actionId,input] of Object.entries(validInputs))assert.equal(core.validateActionInput(actionId,input,{}).valid,true,`${actionId} should accept its declared input`);
assert.equal(core.policySnapshot().inputEnforcement.runtimeEnforced.length,23);
assert.equal(core.policySnapshot().inputEnforcement.remaining,0);

assert.equal(core.validateActionInput('places.discovery.recommend',{query:'x',categories:['food','food']},{}).valid,false);
assert.equal(core.validateActionInput('places.discovery.recommend',{query:'x'.repeat(1001)},{}).valid,false);
assert.equal(core.validateActionInput('events.verified.read',{from:'2026-06-15T00:00:00Z',to:'2026-06-14T00:00:00Z'},{}).valid,false);
assert.equal(core.validateActionInput('memory.story.save',{story:{mediaIds:['same','same']}},{}).valid,false);
assert.equal(core.validateActionInput('identity.preferences.read',{scope:'another-user'},{}).valid,false);
assert.throws(()=>runtime.prepare('memory.story.save',{story:{}},{userGesture:true}),error=>error.code==='AI_ACTION_INPUT_REQUIRED'&&error.missingInputs.includes('story'));
assert.throws(()=>runtime.prepare('identity.preferences.update',{patch:{}},{userGesture:true}),error=>error.code==='AI_ACTION_INPUT_REQUIRED'&&error.missingInputs.includes('patch'));
assert.equal(runtime.diagnostics().ledger.count,0,'invalid writes must fail before ledger creation');
assert.equal(counters.memoryWrites+counters.identityWrites,0,'invalid writes must fail before owner commands');

(async()=>{
  for(const domain of ['places','events','memory','identity']){
    const before={...counters};
    const result=await runtime.runMessage('',{compiledIntent:{contractId:'intelligence.travel-orchestration.v1',status:'compiled',intents:[{domain,clause:'',mode:'read',categoryHints:domain==='places'?['food']:[]}]}});
    assert.equal(result.error,true,`${domain} invalid read should be visible as an error result`);
    assert.equal(counters[domain],before[domain],`${domain} validation must run before its owner read`);
  }

  const places=await runtime.runMessage('Ruhiges Restaurant am Wasser',{compiledIntent:{contractId:'intelligence.travel-orchestration.v1',status:'compiled',intents:[{domain:'places',clause:'Ruhiges Restaurant am Wasser',mode:'read',categoryHints:['food'],entityHints:{preferencePatch:{pace:'ruhig'}}}]}});
  assert.equal(places.error,false);assert.equal(places.results[0].kind,'place_collection');
  const events=await runtime.runMessage('Veranstaltungen',{compiledIntent:{contractId:'intelligence.travel-orchestration.v1',status:'compiled',intents:[{domain:'events',clause:'Veranstaltungen',mode:'read',temporalHint:{date:'2026-06-14'}}]}});
  assert.equal(events.error,false);assert.equal(events.results[0].kind,'event_collection');
  const memories=await runtime.runMessage('Zeige Erinnerungen',{compiledIntent:{contractId:'intelligence.travel-orchestration.v1',status:'compiled',intents:[{domain:'memory',clause:'Zeige Erinnerungen',mode:'read'}]}});
  assert.equal(memories.error,false);assert.equal(memories.results[0].kind,'memory_collection');
  const preferences=await runtime.runMessage('Zeige meine Vorlieben',{compiledIntent:{contractId:'intelligence.travel-orchestration.v1',status:'compiled',intents:[{domain:'identity',clause:'Zeige meine Vorlieben',mode:'read'}]}});
  assert.equal(preferences.error,false);assert.equal(preferences.results[0].kind,'preference_summary');
  const hotels=await runtime.runMessage('Finde eine passende Unterkunft',{compiledIntent:{contractId:'intelligence.travel-orchestration.v1',status:'compiled',intents:[{domain:'booking',clause:'Finde eine passende Unterkunft',mode:'read',entityHints:{bookingType:'hotel',cityCode:'BER'},temporalHint:{from:'2027-06-12',to:'2027-06-14'},partyHint:{adults:2,children:0}}]}});
  assert.equal(hotels.error,false,JSON.stringify(hotels));assert.equal(hotels.results[0].kind,'booking_collection');assert.equal(counters.booking,1,'semantic hotel intent must reach the Booking owner exactly once');

  const storyText='Ein privater, nur dem Memory Owner übergebener Storytext.';
  const storyPrepared=runtime.prepare('memory.story.save',validInputs['memory.story.save'],{userGesture:true,idempotencyKey:'story-save-once'});
  assert.equal(storyPrepared.result.evidence.preview.story.descriptionPreview,storyText,'the user must see what will be saved');
  assert.equal(JSON.stringify(runtime.getActionState(storyPrepared.ledgerId)).includes(storyText),false,'raw story text must not enter the action ledger');
  const storyReceipt=await runtime.execute('memory.story.save',{}, {ledgerId:storyPrepared.ledgerId,userGesture:true,confirmed:true});
  assert.equal(storyReceipt.evidence.status,'completed');assert.equal(counters.memoryWrites,1);

  const profilePrepared=runtime.prepare('identity.preferences.update',validInputs['identity.preferences.update'],{userGesture:true,idempotencyKey:'profile-update-once'});
  assert.deepEqual(Array.from(profilePrepared.result.evidence.preview.changes.travelInterests),['Küste','Minigolf'],'the user must see exact preference changes');
  assert.equal(JSON.stringify(runtime.getActionState(profilePrepared.ledgerId)).includes('Küste'),false,'preference values must not enter the action ledger');
  const profileReceipt=await runtime.execute('identity.preferences.update',{}, {ledgerId:profilePrepared.ledgerId,userGesture:true,confirmed:true});
  assert.equal(profileReceipt.evidence.status,'completed');assert.equal(counters.identityWrites,1);

  console.log('M16.5 Block 0 remaining input enforcement: PASS');
  console.log('Places + Events + Memory + Identity: 7/7 VALIDATED');
  console.log('All registered runtime actions: 23/23 ENFORCED');
  console.log('Raw story/profile values in Action Ledger: 0');
})().catch(error=>{console.error(error);process.exitCode=1});
