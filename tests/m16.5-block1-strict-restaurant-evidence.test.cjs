'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const domainSource=read('core/places/places-domain-contract-core.js');
const globalSource=read('core/places/global-place-contracts.js');
const discoverySource=read('app/adapters/places-discovery-adapter.js');
const actionSource=read('core/ai/ai-action-runtime.js');
const browserFixtureSource=read('tests/fixtures/m16.5ab-living-compass-ai-browser.html');

const sandbox={Object,Array,Map,Set,Date,Math,Number,String,Boolean,RegExp,JSON,Promise,console};
sandbox.window=sandbox;sandbox.globalThis=sandbox;
vm.createContext(sandbox);
vm.runInContext(domainSource,sandbox,{filename:'places-domain-contract-core.js'});
vm.runInContext(globalSource,sandbox,{filename:'global-place-contracts.js'});

const strictQueries=sandbox.LuviaGlobalPlaceContracts.queryCascade(
  {text:'Finde uns ein ruhiges Restaurant am Wasser',category:'food'},
  'Scharbeutz',
  {},
  {strictPlaceType:'restaurant'}
);
assert.ok(strictQueries.some(query=>/Restaurant am Wasser/i.test(query)),'the spatial preference must stay attached to the restaurant type');
assert.equal(strictQueries.some(query=>/Café|Cafe|Bistro|Bäckerei|Bakery/i.test(query)),false,'strict restaurant query variants must not broaden into adjacent food types');
assert.match(actionSource,/request\.actionId==='places\.restaurant\.recommend'\?'restaurant'/,'the Intelligence route must ask Places for strict restaurant evidence');
assert.match(browserFixtureSource,/strictRestaurant=input\?\.strictPlaceType==='restaurant'/,'the visible browser acceptance owner must honor the strict restaurant request');
assert.match(browserFixtureSource,/\.filter\(item=>!strictRestaurant\|\|isRestaurant\(item\)\)/,'the visible browser acceptance must filter adjacent food categories before projection');
assert.match(browserFixtureSource,/providerPlaceId:'fixture-bakery'.*providerNativeTypes:\['bakery'\]/,'the visible acceptance set must contain a bakery counterexample that cannot pass as a restaurant');

(async()=>{
  const calls=[];
  sandbox.LuviaPlaceEntities={searchPlaces:async options=>{
    calls.push(options);
    return{data:{places:[
      {id:'restaurant-1',providerPlaceId:'restaurant-1',name:'Hafenküche',types:['restaurant','german_restaurant'],rating:4.4,userRatingCount:180,location:{latitude:54.02,longitude:10.75}},
      {id:'bakery-1',providerPlaceId:'bakery-1',name:'Küstenbäckerei',types:['bakery','food_store'],rating:4.7,userRatingCount:340,location:{latitude:54.021,longitude:10.751}},
      {id:'cafe-1',providerPlaceId:'cafe-1',name:'Strandcafé',types:['cafe','coffee_shop'],rating:4.8,userRatingCount:290,location:{latitude:54.022,longitude:10.752}},
      {id:'restaurant-2',providerPlaceId:'restaurant-2',name:'Fischers Tisch',types:['13064','Seafood Restaurant'],provider:'foursquare',rating:4.2,userRatingCount:90,location:{latitude:54.023,longitude:10.753}}
    ],providers:{requested:['google','foursquare'],used:['google','foursquare'],errors:[]}}};
  }};
  sandbox.LuviaAI=null;
  sandbox.LuviaIntelligenceContractV1=null;
  vm.runInContext(discoverySource,sandbox,{filename:'places-discovery-adapter.js'});

  const strict=await sandbox.LuviaPlacesDiscoveryService.recommend({
    text:'Finde uns ein ruhiges Restaurant am Wasser',
    category:'food',
    destination:'Scharbeutz',
    strictPlaceType:'restaurant',
    limit:3,
    queryVariantLimit:3,
    diversity:{minimumQueryVariants:3,rotateAcrossQueries:true}
  });
  assert.equal(calls.length>=3,true,'strict restaurant discovery must retain the diversified provider search');
  assert.equal(calls.every(call=>call.includedType==='restaurant'&&call.strictTypeFiltering===true),true,'Google must receive strict restaurant type filtering on every variant');
  assert.deepEqual(Array.from(strict.places,place=>place.providerPlaceId).sort(),['restaurant-1','restaurant-2']);
  assert.equal(strict.places.some(place=>/bakery|cafe/.test((place.types||[]).join(' ').toLowerCase())),false,'adjacent food categories must never backfill an explicit restaurant result');
  assert.equal(sandbox.LuviaPlacesDiscoveryService.diagnostics().strictRestaurantEvidence,true);

  console.log('M16.5 Block 1 strict restaurant evidence: PASS');
})().catch(error=>{console.error(error);process.exitCode=1});
