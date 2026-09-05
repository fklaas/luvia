'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const categoryKeys=['accommodation','food','activities','themeparks','wellness','water','sights','photo','culture','nature','shopping','malls','nightlife','practical'];
const categories=Object.fromEntries(categoryKeys.map(key=>[key,{key,label:key,query:key,synonyms:[],keywords:[],includedTypes:[],domainTypes:[],excludedTypes:[],primaryType:'custom'}]));
const sandbox={console,Object,Array,Map,Set,WeakMap,Date,Math,Number,String,Boolean,RegExp,JSON,Promise,setTimeout,clearTimeout,queueMicrotask};
sandbox.window=sandbox;sandbox.globalThis=sandbox;
sandbox.document={documentElement:{classList:{contains:()=>false}}};
sandbox.LuviaPlacesDomainContractCoreV1={categories:()=>categories};
sandbox.LuviaPlacesSpatialCompositionCoreV1={normalizeCoordinates(value){const latitude=Number(value?.latitude??value?.lat),longitude=Number(value?.longitude??value?.lng);return Number.isFinite(latitude)&&Number.isFinite(longitude)?{latitude,longitude}:null}};
vm.createContext(sandbox);
vm.runInContext(read('core/places/global-place-contracts.js'),sandbox,{filename:'global-place-contracts.js'});

const contract=sandbox.LuviaGlobalPlaceContracts;
assert.equal(contract.diagnostics().sharedFilterIntent,true);
assert.equal(contract.diagnostics().filterCategories,14);

const cuisines=contract.filterDefinitions.food.cuisines;
assert.equal(cuisines.length,19,'the complete visible national-cuisine matrix must have one owner definition');
for(const [type,label] of cuisines){
  const intent=contract.filterIntent(`${label} Restaurant`,'food');
  assert.ok(intent.includedTypes.includes(type),`${label} must compile to ${type}`);
}

for(const [category,definition] of Object.entries(contract.filterDefinitions)){
  for(const [type,label] of [...(definition.types||[]),...(definition.subtypes||[])].filter(([value])=>Boolean(value))){
    const intent=contract.filterIntent(label,category);
    assert.ok(intent.includedTypes.includes(type),`${category}/${label} must compile to ${type}`);
  }
}

const facts=contract.filterIntent('Jetzt geöffnet, reservierbar, barrierefrei, mindestens 4,5 Sterne und höchstens 2,5 km entfernt','food');
assert.equal(facts.openNow,true);
assert.equal(facts.reservableOnly,true);
assert.equal(facts.accessibleOnly,true);
assert.equal(facts.minRating,4.5);
assert.equal(facts.maxDistanceMeters,2500);
const budget=contract.filterIntent('Günstiges italienisches Restaurant','food');
assert.deepEqual([...budget.includedTypes],['italian_restaurant']);
assert.deepEqual([...budget.priceLevels],['PRICE_LEVEL_INEXPENSIVE']);
const vegan=contract.filterIntent('Veganes Restaurant','food');
assert.equal(vegan.includedType,'vegan_restaurant');
assert.equal(vegan.vegetarianOnly,false,'vegan evidence must use the exact provider type instead of weakening to vegetarian-only');

vm.runInContext(read('app/places/places-spatial-experience.js'),sandbox,{filename:'places-spatial-experience.js'});
const spatialSource=read('app/places/places-spatial-experience.js');
assert.match(spatialSource,/providers:\['auto','google','foursquare'\]/,'explicit profile evidence may use the bounded exact-evidence fallbacks');
assert.equal(sandbox.LuviaPlacesSpatialExperience.transientDestinationFailure({status:503}),true);
assert.equal(sandbox.LuviaPlacesSpatialExperience.transientDestinationFailure({code:'PLACES_ALL_PROVIDERS_FAILED'}),true);
assert.equal(sandbox.LuviaPlacesSpatialExperience.transientDestinationFailure({status:400,code:'VALIDATION_FAILED'}),false);
const base=[{id:'here:steak',providerPlaceId:'here:steak',name:'Scharbeutzer Steakhaus',types:['restaurant'],features:{servesVegetarianFood:true},coordinates:{latitude:54.02,longitude:10.75}}];
const evidence=[{id:'geo:veg',providerPlaceId:'geo:veg',name:'Grüne Kombüse',types:['vegetarian_restaurant'],features:{servesVegetarianFood:true},coordinates:{latitude:54.021,longitude:10.751}}];
const joined=sandbox.LuviaPlacesSpatialExperience.mergeProfileEvidenceCohort(base,evidence,'Vegetarisch');
assert.equal(joined.length,2,'a separately discovered, provider-evidenced vegetarian venue must enter the visible owner cohort');
assert.equal(joined.some(place=>place.name==='Grüne Kombüse'),true);
const rejected=sandbox.LuviaPlacesSpatialExperience.mergeProfileEvidenceCohort(base,[{id:'geo:meat',providerPlaceId:'geo:meat',name:'Steakhouse Plus',types:['restaurant'],features:{servesVegetarianFood:true},coordinates:{latitude:54.022,longitude:10.752}}],'Vegetarisch');
assert.equal(rejected.length,1,'a meat-led venue must not enter Passend from a generic vegetarian-option flag');

console.log('P02/P03 shared Place filter intent and positive profile evidence union: PASS');
