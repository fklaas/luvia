'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const path='core/intelligence/intelligence-action-contract-core.js';
const source=fs.readFileSync(path,'utf8');

for(const [label,pattern] of [
  ['browser global',/\bwindow\b|\bglobalThis\b/],
  ['DOM',/\bdocument\b|\bCustomEvent\b|\bdispatchEvent\b/],
  ['device API',/\bnavigator\b/],
  ['browser storage',/\blocalStorage\b|\bsessionStorage\b/],
  ['network',/\bfetch\s*\(|\bXMLHttpRequest\b/],
  ['provider SDK',/\bSupabase\b/i],
  ['direct DB',/\.from\s*\(|\.rpc\s*\(/]
])assert.equal((source.match(pattern)||[]).length,0,`Action Contract Core must be browserless: ${label}`);

const context={Object,Array,Map,Set,WeakSet,Error,String,Boolean,Number,Math,JSON,RegExp};
vm.createContext(context);
vm.runInContext(source,context,{filename:path});
const core=context.LuviaIntelligenceActionContractCoreV1;

assert.ok(core,'Action Contract Core missing');
assert.equal(core.contractId,'intelligence.actions.v1');
assert.equal(core.version,'1');
assert.equal(core.listActions().length,6);
assert.equal(Object.isFrozen(core.listActions()),true);
assert.equal(core.getAction('places.restaurant.recommend').ownerContract,'places.v1');
assert.equal(core.getAction('booking.restaurant.open').ownerContract,'booking.v1');
assert.equal(core.getAction('journey.day.read').ownerContract,'journey.v1');
assert.equal(core.canAutoRun('places.restaurant.recommend'),true);
assert.equal(core.canAutoRun('places.place.favorite'),false);

assert.throws(
  ()=>core.assertExecution('places.place.favorite',{ownerCommand:true}),
  error=>error?.code==='INTELLIGENCE_USER_GESTURE_REQUIRED'
);
assert.throws(
  ()=>core.assertExecution('places.place.favorite',{userGesture:true}),
  error=>error?.code==='INTELLIGENCE_OWNER_COMMAND_REQUIRED'
);
assert.equal(core.assertExecution('places.place.favorite',{userGesture:true,ownerCommand:true}).owner,'places');

const restaurantIntent=core.routeIntent('Finde uns heute ein ruhiges Restaurant am Wasser');
assert.equal(restaurantIntent.actionId,'places.restaurant.recommend');
assert.equal(core.routeIntent('Plane uns einen schönen Tag').actionId,'journey.day.read');
assert.equal(core.routeIntent('Erkläre mir diese Reise'),null);

const result=core.normalizeResult({
  kind:'place_collection',
  owner:'places',
  contractId:'places.v1',
  title:'Restaurants für euch',
  items:[{
    id:'places/provider-1',
    name:'Luvia Table',
    address:'Am Wasser 1',
    rating:6,
    userRatingCount:120,
    image:{url:'https://images.example/place.jpg',attribution:'Provider'},
    actions:[
      {actionId:'places.place.favorite',payload:{providerPlaceId:'provider-1',token:'hidden'}},
      {actionId:'booking.restaurant.open',payload:{providerPlaceId:'provider-1',name:'Luvia Table'}}
    ],
    email:'hidden@example.test'
  }]
});
assert.equal(result.items.length,1);
assert.equal(result.items[0].providerPlaceId,'provider-1');
assert.equal(result.items[0].rating,5);
assert.equal(result.items[0].image.url,'https://images.example/place.jpg');
assert.equal(result.items[0].actions.length,2);
assert.equal('token' in result.items[0].actions[0].payload,false);
assert.equal('email' in result.items[0],false);
assert.equal(Object.isFrozen(result.items[0]),true);

const request=core.createActionRequest('journey.day.read',{token:'hidden'},{surface:'chat',authorization:'hidden'});
assert.equal(request.owner,'journey');
assert.equal('token' in request.input,false);
assert.equal('authorization' in request.context,false);

const receipt=core.createReceipt({
  actionId:'places.place.favorite',
  status:'completed',
  message:'Ort wurde gespeichert.',
  ownerCommand:true,
  reference:{providerPlaceId:'provider-1'}
});
assert.equal(receipt.kind,'receipt');
assert.equal(receipt.owner,'places');
assert.equal(receipt.evidence.ownerCommand,true);
assert.equal(receipt.evidence.actionId,'places.place.favorite');

const policy=core.policySnapshot();
assert.equal(policy.foreignDomainMutation,false);
assert.equal(policy.journeyTimelineOwner,false);
assert.equal(policy.autoRun,'registered-read-only');

console.log('M15.1 Intelligence Action Contract Core: PASS');
console.log('Browserless rich-result/action policy: PASS');
console.log('Automatic execution: READ-only');
console.log('Foreign Domain mutation ownership: NONE');
