'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const ownerCalls=[];
const observations=Object.freeze({
  food:'2026-08-31T10:00:00.000Z',
  culture:'2026-08-31T09:58:00.000Z'
});
let ownerMode='success';

function placesFor(category){
  const primaryType=category==='food'?'restaurant':'museum';
  return Array.from({length:4},(_,index)=>({
    id:`places/${category}-${index+1}`,
    providerPlaceId:`${category}-${index+1}`,
    name:`${category} option ${index+1}`,
    address:`${index+1} Owner Street`,
    primaryType,
    rating:4.8-index/10,
    userRatingCount:120-index
  }));
}

const context={
  console,Object,Array,Map,Set,WeakSet,Error,TypeError,String,Boolean,Number,Math,JSON,Date,RegExp,Promise,
  CustomEvent:function(name,options){this.type=name;this.detail=options?.detail},
  dispatchEvent(){},
  LuviaTripContractV1:{getActiveTrip(){return{id:'trip-p03',destination:{name:'Scharbeutz'}}}},
  LuviaIdentityContractV1:{getPreferences(){return{travelPace:'balanced'}}},
  LuviaPlacesContractV1:{
    reads:{
      async recommend(input){
        ownerCalls.push(input);
        if(ownerMode==='failure'){
          const error=new Error(`Owner read failed for ${input.category}`);
          error.code='PLACES_ALL_PROVIDERS_FAILED';
          throw error;
        }
        const category=input.category;
        const observedAt=observations[category];
        return{
          places:placesFor(category),
          route:{category},
          observedAt,
          freshness:{observedAt,cached:false},
          providerDiagnostics:{
            allProvidersFailed:false,
            providers:[
              {provider:'google',status:category==='food'?'fulfilled':'failed',observedAt,code:category==='culture'?'GOOGLE_QUOTA_EXCEEDED':null},
              {provider:'foursquare',status:'fulfilled',observedAt}
            ],
            token:'must-never-leak-from-owner-diagnostics'
          },
          diversityMeta:{queriedVariants:3,rotationAcrossQueries:true}
        };
      },
      async getCard(id){
        const category=String(id).startsWith('food-')?'food':'culture';
        return{place:{id:`places/${id}`,providerPlaceId:id,name:id,primaryType:category==='food'?'restaurant':'museum'},image:null};
      }
    },
    commands:{}
  }
};
context.globalThis=context;
vm.createContext(context);
for(const file of [
  'core/intelligence/intelligence-action-contract-core.js',
  'core/intelligence/intelligence-action-ledger-core.js',
  'core/ai/ai-action-runtime.js'
])vm.runInContext(read(file),context,{filename:file});

const compiledIntent=Object.freeze({
  contractId:'intelligence.travel-orchestration.v1',
  status:'compiled',
  intents:[Object.freeze({
    domain:'places',mode:'read',clause:'Ein Restaurant und danach ein Museum',
    categoryHints:Object.freeze(['food','culture']),temporalHint:Object.freeze({}),
    entityHints:Object.freeze({}),missingInputs:Object.freeze([])
  })]
});

function distributionCount(distribution,category){
  if(Array.isArray(distribution)){
    const row=distribution.find(item=>String(item?.category||item?.id||item?.key)==category);
    return Number(row?.count??row?.visibleCount??0);
  }
  const value=distribution?.[category];
  return Number(typeof value==='number'?value:value?.count??value?.visibleCount??0);
}

function containsVerifiedTrue(value,seen=new WeakSet()){
  if(!value||typeof value!=='object')return false;
  if(seen.has(value))return false;
  seen.add(value);
  if(value.verified===true)return true;
  return Object.values(value).some(item=>containsVerifiedTrue(item,seen));
}

(async()=>{
  const runtime=context.LuviaAIActionRuntime;
  const successful=await runtime.runMessage('Ein Restaurant und danach ein Museum.',{
    surface:'global-chat',compiledIntent
  });
  const result=successful.results.find(item=>item.kind==='place_collection'&&item.owner==='places');
  assert.ok(result,'the owner-safe AI result must expose a Places collection');

  const requestedCategories=ownerCalls.map(call=>call.category);
  assert.deepEqual(requestedCategories.sort(),['culture','food'],'both requested Place categories must reach the public Places owner read');
  assert.equal(ownerCalls.every(call=>call.limit>=1&&call.limit<=3),true,'each owner category read must be bounded to one through three candidates');

  assert.equal(
    result.items.every(item=>['food','culture'].includes(item.requestCategory)),true,
    'every visible Place must preserve the requested category through the bounded AI projection'
  );
  const categoryCounts=Object.fromEntries(['food','culture'].map(category=>[
    category,result.items.filter(item=>item.requestCategory===category).length
  ]));
  for(const category of ['food','culture']){
    assert.ok(categoryCounts[category]>=1,`${category} must remain visibly represented when its owner read returned candidates`);
    assert.ok(categoryCounts[category]<=3,`${category} must expose at most three visible candidates`);
  }
  assert.ok(result.items.length<=6,'two requested categories must stay within the six-card aggregate ceiling');
  assert.equal(new Set(result.items.map(item=>item.providerPlaceId)).size,result.items.length,'cross-category duplicates must not consume visible slots');

  const distribution=result.evidence?.categoryDistribution;
  assert.ok(distribution,'the result must explain its fair category distribution');
  assert.equal(distributionCount(distribution,'food'),categoryCounts.food);
  assert.equal(distributionCount(distribution,'culture'),categoryCounts.culture);

  const diagnostics=result.evidence?.providerDiagnostics;
  assert.ok(diagnostics,'sanitized provider diagnostics must survive the Places-to-AI projection');
  const diagnosticText=JSON.stringify(diagnostics);
  assert.match(diagnosticText,/google/i);
  assert.match(diagnosticText,/foursquare/i);
  assert.match(diagnosticText,/GOOGLE_QUOTA_EXCEEDED/,'partial provider degradation must remain explainable');
  assert.match(diagnosticText,/food/i);
  assert.match(diagnosticText,/culture/i);
  assert.doesNotMatch(diagnosticText,/must-never-leak/,'blocked diagnostic fields must be sanitized before entering the AI result');
  assert.equal(result.evidence.observedAt,observations.culture,'aggregate freshness must use the oldest real Owner observation, never a synthetic current time');

  ownerMode='failure';
  ownerCalls.length=0;
  const failed=await runtime.runMessage('Ein Restaurant und danach ein Museum.',{
    surface:'global-chat',compiledIntent
  });
  assert.equal(failed.error,true);
  assert.equal(failed.results.some(item=>item.kind==='place_collection'),false,'a complete Owner failure must not project an empty result as successful Places truth');
  const errorResult=failed.results.find(item=>item.kind==='error'&&item.owner==='places');
  assert.ok(errorResult,'a complete Owner failure must remain a visible Places error');
  assert.equal(errorResult.evidence.code,'PLACES_ALL_PROVIDERS_FAILED');
  assert.equal(containsVerifiedTrue(failed),false,'a failed Owner read may never be represented as verified evidence');

  console.log('P03 AI Places multicategory fairness and evidence contract: PASS');
})().catch(error=>{console.error(error);process.exit(1)});
