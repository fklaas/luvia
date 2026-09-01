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
const orchestrationSource=read('core/intelligence/travel-orchestration-core.js');
const actionSource=read('core/ai/ai-action-runtime.js');

const sandbox={Object,Array,Map,Set,Date,Math,Number,String,Boolean,RegExp,JSON,Promise,console};
sandbox.window=sandbox;sandbox.globalThis=sandbox;
vm.createContext(sandbox);
vm.runInContext(domainSource,sandbox,{filename:'places-domain-contract-core.js'});
vm.runInContext(globalSource,sandbox,{filename:'global-place-contracts.js'});
vm.runInContext(orchestrationSource,sandbox,{filename:'travel-orchestration-core.js'});

const contracts=sandbox.LuviaGlobalPlaceContracts;
const petersens={id:'hotel-pool',providerPlaceId:'hotel-pool',name:"Petersen's Landhaus Scharbeutz",types:['Hotel','Lodging Business','Swimming Pool'],providerNativeTypes:['Hotel','Hotel Pool and Swimming Pool']};
const miniatureGolf={id:'mini-golf',providerPlaceId:'mini-golf',name:'Küsten Adventure Golf',types:['tourist_attraction','Miniature Golf Course'],providerNativeTypes:['Miniature Golf Course']};
const hotelWithRealCourse={id:'resort-golf',providerPlaceId:'resort-golf',name:'Resort Adventure Golf',types:['hotel','tourist_attraction','Miniature Golf Course'],providerNativeTypes:['Hotel','Miniature Golf Course']};
const restaurantNameOnly={id:'restaurant-name-only',providerPlaceId:'restaurant-name-only',name:'Imbiss da Gino Pizzeria Minigolf',types:['restaurant','Dining and Drinking'],providerNativeTypes:['Dining and Drinking']};

assert.equal(contracts.intentFor('Minigolf in Scharbeutz finden · Optionen ansehen','activities').key,'mini_golf');
assert.equal(contracts.accepts(petersens,'activities','Minigolf in Scharbeutz finden · Optionen ansehen',{}),false,'a hotel pool must never satisfy a concrete mini-golf wish');
assert.equal(contracts.accepts(miniatureGolf,'activities','Minigolf in Scharbeutz finden · Optionen ansehen',{}),true,'provider-native miniature-golf evidence must satisfy the concrete wish');
assert.equal(contracts.accepts(hotelWithRealCourse,'activities','Minigolf in Scharbeutz finden',{}),true,'a mixed-use property remains eligible when the concrete requested amenity is actually evidenced');
assert.equal(contracts.accepts(restaurantNameOnly,'activities','Minigolf in Scharbeutz finden',{}),false,'a name-only mention must not override a contradictory provider category');

const openVocabularyPlan={searchPlans:[{query:'Climbing park high ropes course',includedTypes:['amusement_park'],weight:1}]};
const climbingContract=contracts.evidenceContract('Kletterpark für Kinder finden','activities',openVocabularyPlan,'Scharbeutz');
assert.equal(climbingContract.strict,true);
assert.equal(climbingContract.intentKey,'generic','the open-vocabulary gate must work without adding a bespoke intent');
assert.equal(contracts.accepts(petersens,'activities','Kletterpark für Kinder finden',{}, {evidenceContract:climbingContract,destination:'Scharbeutz'}),false);
assert.equal(contracts.accepts({id:'climb',providerPlaceId:'climb',name:'Baltic High Ropes Climbing Park',types:['tourist_attraction']},'activities','Kletterpark für Kinder finden',{}, {evidenceContract:climbingContract,destination:'Scharbeutz'}),true);

const retailContract=contracts.evidenceContract('Luftmatratzen für Kinder in Scharbeutz finden','activities',{},'Scharbeutz');
assert.equal(retailContract.category,'shopping');
assert.equal(retailContract.fulfillmentMode,'retail');
assert.equal(retailContract.requiresInventoryVerification,true);
assert.equal(contracts.accepts({id:'fashion',providerPlaceId:'fashion',name:'Mode am Meer',types:['store','clothing_store']},'shopping','Luftmatratzen für Kinder finden',{}, {evidenceContract:retailContract}),false,'an arbitrary store must not satisfy a product-source request');
assert.equal(contracts.accepts({id:'surf',providerPlaceId:'surf',name:'Scharbeutz Surf Shop',types:['store','Sporting Goods Retail']},'shopping','Luftmatratzen für Kinder finden',{}, {evidenceContract:retailContract}),true,'a provider-evidenced relevant retail class may be shown as a possible source');

const dialogue={goals:[
  {type:'activity',label:'Minigolf in Scharbeutz finden',hardConstraints:[],softPreferences:[],timeWindow:null,source:'user'},
  {type:'shopping',label:'Luftmatratzen für Kinder in Scharbeutz finden',hardConstraints:[],softPreferences:[],timeWindow:null,source:'user'}
],hardConstraints:[],softPreferences:[],followUpQuestion:null,summary:{headline:'Zwei Wünsche',intro:'',goalLabels:[],hardLabels:[],softLabels:[]},unknowns:[],confidence:.92};
const compiled=sandbox.LuviaTravelOrchestrationCoreV1.compileDialogue('Super, und wenn ich noch Minigolf spielen will oder die Kinder Luftmatratzen wollen?',dialogue,{locale:'de-DE',online:true});
assert.equal(compiled.intents.length,2,'the exact compound request must remain two independently gated owner reads');
assert.deepEqual(Array.from(compiled.intents,intent=>intent.sequence),[1,2]);
assert.deepEqual(Array.from(compiled.intents,intent=>intent.categoryHints[0]),['activity','shopping']);
const deterministic=sandbox.LuviaTravelOrchestrationCoreV1.compileIntent('Super, und wenn ich noch Minigolf spielen will oder die Kinder Luftmatratzen wollen?',{locale:'de-DE',online:false});
assert.equal(deterministic.intents.length,2,'the deterministic safety compiler must not collapse the compound wish when OpenAI is offline');
assert.deepEqual(Array.from(deterministic.intents,intent=>intent.categoryHints[0]),['activity','shopping']);

(async()=>{
  const calls=[];
  sandbox.LuviaAI={
    interpretDiscovery:async input=>({data:{searchPlans:[{query:/minigolf/i.test(input.freeText)?'Miniature Golf Adventure Golf':'Beach supplies surf shop',includedTypes:/minigolf/i.test(input.freeText)?['tourist_attraction']:['store'],weight:1}],preferredSignals:[],mustHave:['specific_subject_evidence'],excludedSignals:[],reasoningSummary:'Konkreter Gegenstand bleibt verbindlich.'},meta:{fallback:false}}),
    rankCandidates:async input=>input.candidates
  };
  sandbox.LuviaIntelligenceContractV1=null;
  sandbox.LuviaPlaceEntities={searchPlaces:async options=>{
    calls.push(options);
    const places=/luftmatrat|beach supplies|surf shop|strandbedarf|badespielzeug/i.test(options.query)?[
      {id:'fashion',providerPlaceId:'fashion',name:'Mode am Meer',types:['store','clothing_store']},
      {id:'surf',providerPlaceId:'surf',name:'Scharbeutz Surf Shop',types:['store','Sporting Goods Retail']}
    ]:[petersens,miniatureGolf];
    return{data:{places,providers:{requested:['foursquare'],used:['foursquare'],errors:[]}}};
  }};
  vm.runInContext(discoverySource,sandbox,{filename:'places-discovery-adapter.js'});

  const golf=await sandbox.LuviaPlacesDiscoveryService.recommend({text:'Minigolf in Scharbeutz finden · Optionen ansehen',category:'activities',destination:'Scharbeutz',limit:3,queryVariantLimit:3});
  assert.deepEqual(Array.from(golf.places,place=>place.providerPlaceId),['mini-golf']);
  assert.equal(golf.evidenceContract.strict,true);

  const retail=await sandbox.LuviaPlacesDiscoveryService.recommend({text:'Luftmatratzen für Kinder in Scharbeutz finden',category:'activities',destination:'Scharbeutz',limit:3,queryVariantLimit:3});
  assert.deepEqual(Array.from(retail.places,place=>place.providerPlaceId),['surf']);
  assert.equal(retail.plan.route.category,'shopping','the fulfillment route must change from generic activity to relevant retail discovery');
  assert.equal(retail.evidenceContract.requiresInventoryVerification,true);
  assert.equal(calls.some(call=>call.type==='shopping'),true,'the public owner adapter must route product-source discovery to the shopping provider route');

  sandbox.LuviaPlaceEntities={searchPlaces:async options=>({data:{places:[
    {...miniatureGolf,id:'near',providerPlaceId:'near',name:'Mini Golf',distanceMeters:280},
    {...miniatureGolf,id:'far',providerPlaceId:'far',name:'Minigolf Timmendorfer Strand',distanceMeters:3900}
  ],providers:{requested:['foursquare'],used:['foursquare'],errors:[]}}})};
  const distanceRanked=await sandbox.LuviaPlacesDiscoveryService.recommend({text:'Minigolf direkt in Scharbeutz',category:'activities',destination:'Scharbeutz',limit:2,queryVariantLimit:1,fastPath:true});
  assert.deepEqual(Array.from(distanceRanked.places,place=>place.providerPlaceId),['near','far'],'owner distance must outrank a farther otherwise-equivalent candidate');

  assert.match(actionSource,/Die Quelle belegt den passenden Geschäftstyp, aber keinen aktuellen Warenbestand/);
  assert.match(actionSource,/inventoryVerificationRequired:requiresInventoryVerification/);
  assert.doesNotMatch(actionSource,/Luftmatratzen oder der gewünschte Artikel/,'consumer truth copy must be generic rather than another item-specific patch');
  assert.equal(contracts.diagnostics().openVocabularyEvidenceGate,true);
  assert.equal(sandbox.LuviaPlacesDiscoveryService.diagnostics().openVocabularyEvidenceGate,true);
  console.log('M16.5 Block 1 specific-subject evidence gate: PASS');
})().catch(error=>{console.error(error);process.exitCode=1});
