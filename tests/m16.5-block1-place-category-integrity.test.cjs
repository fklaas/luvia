'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const sandbox={Object,Array,Map,Set,Date,Math,Number,String,Boolean,RegExp,JSON,Promise,console};
sandbox.window=sandbox;sandbox.globalThis=sandbox;
vm.createContext(sandbox);
vm.runInContext(read('core/places/places-domain-contract-core.js'),sandbox,{filename:'places-domain-contract-core.js'});
vm.runInContext(read('core/places/global-place-contracts.js'),sandbox,{filename:'global-place-contracts.js'});

const contracts=sandbox.LuviaGlobalPlaceContracts;
const strictHotelNameContract=Object.freeze({strict:true,expandedTerms:Object.freeze(['hotel']),rawTerms:Object.freeze(['hotel'])});
const auraBeach={id:'aura-beach',providerPlaceId:'aura-beach',name:'Strandabschnitt Strandkörbe des Aura-Hotels',primaryType:'beach',types:['beach','tourist_attraction'],providerNativeTypes:['Beach']};
const googleHotel={id:'google-hotel',providerPlaceId:'google-hotel',name:'ATLANTIC Grand Hotel Travemünde',primaryType:'hotel',primaryTypeLabel:'Hotel',types:['hotel','lodging','point_of_interest'],providerNativeTypes:['hotel']};
const foursquareHotel={id:'fsq-hotel',providerPlaceId:'fsq-hotel',name:'Grand SPA Resort A-ROSA Travemünde',primaryType:'lodging',primaryTypeLabel:'Travel and Transportation > Lodging > Hotel',types:['lodging','19014','Travel and Transportation > Lodging > Hotel'],providerNativeTypes:['19014','Travel and Transportation > Lodging > Hotel']};
const ownerHotel={id:'owner-hotel',providerPlaceId:'owner-hotel',name:'Radisson Blu Senator Hotel Lübeck',primaryType:'accommodation',types:['point_of_interest'],providerNativeTypes:[]};

assert.equal(contracts.accepts(auraBeach,'accommodation','Hotels in Travemünde',{}, {evidenceContract:strictHotelNameContract}),false,'a hotel word in the name must not turn a beach into accommodation');
assert.equal(contracts.hasProviderCategoryEvidence(auraBeach,'accommodation'),false);
assert.equal(contracts.accepts(googleHotel,'accommodation','Hotels in Travemünde',{}),true,'a Google hotel taxonomy remains eligible');
assert.equal(contracts.accepts(foursquareHotel,'accommodation','Hotels in Travemünde',{}),true,'a Foursquare lodging taxonomy remains eligible');
assert.equal(contracts.accepts(ownerHotel,'accommodation','Hotels in Lübeck',{}),true,'an owner-normalized accommodation primary type remains eligible');
assert.equal(contracts.accepts({id:'restaurant',providerPlaceId:'restaurant',name:'Hotel Restaurant Seeblick',types:['restaurant']},'accommodation','Hotels in Travemünde',{}, {evidenceContract:strictHotelNameContract}),false,'a restaurant name cannot override its contradictory provider category');

for(const [category,primaryType] of [['food','restaurant'],['accommodation','accommodation'],['activities','activity'],['sights','attraction'],['photo','photo_spot'],['culture','attraction'],['nature','nature'],['shopping','shopping']]){
  const place={id:`owner-${category}`,providerPlaceId:`owner-${category}`,name:`Owner ${category}`,primaryType,types:[]};
  assert.equal(contracts.accepts(place,category,'',{}),true,`${primaryType} must remain valid canonical owner evidence for ${category}`);
}
assert.equal(contracts.accepts({id:'custom-nightlife',providerPlaceId:'custom-nightlife',name:'Unbestimmter Ort',primaryType:'custom',types:[]},'nightlife','',{}),false,'generic custom must not bypass the nightlife provider taxonomy');
assert.equal(contracts.accepts({id:'activity-nightlife',providerPlaceId:'activity-nightlife',name:'Unbestimmte Abendaktivität',primaryType:'activity',types:[]},'nightlife','',{}),false,'a generic activity owner type alone must not prove nightlife');
assert.equal(contracts.accepts({id:'custom-practical',providerPlaceId:'custom-practical',name:'Unbestimmter Ort',primaryType:'custom',types:[]},'practical','',{}),false,'generic custom must not bypass the practical provider taxonomy');

const nightClub={id:'club',providerPlaceId:'club',name:'Tonfink',primaryType:'night_club',types:['night_club']};
const danceClub={id:'dance',providerPlaceId:'dance',name:'Tanzwerk',primaryType:'10032',types:['10032'],providerNativeTypes:['Arts and Entertainment > Nightlife Spot > Dance Club']};
const cocktailBar={id:'bar',providerPlaceId:'bar',name:'Beach Lounge',primaryType:'bar',types:['bar','cocktail_bar']};
const concertHall={id:'music',providerPlaceId:'music',name:'Musik- und Kongresshalle',types:['concert_hall']};
const clubNameOnly={id:'shop',providerPlaceId:'shop',name:'Tonfink Night Club Fan Shop',types:['store'],providerNativeTypes:['Retail > Souvenir Store']};

for(const place of [nightClub,danceClub,cocktailBar,concertHall])assert.equal(contracts.accepts(place,'nightlife','Nachtleben in Lübeck',{}, {destination:'Lübeck'}),true,`${place.name} must remain valid nightlife provider evidence`);
assert.equal(contracts.accepts(clubNameOnly,'nightlife','Nachtleben in Lübeck',{}, {destination:'Lübeck'}),false,'nightlife wording in a name must not make a store a nightlife venue');
assert.equal(contracts.accepts({...googleHotel,name:'Night Club Package Hotel'},'nightlife','Nachtleben in Lübeck',{}, {destination:'Lübeck'}),false,'a hotel promotion must not enter nightlife results');
assert.equal(contracts.accepts({id:'la-vie',providerPlaceId:'la-vie',name:'La Vie',primaryType:'restaurant',types:['restaurant','catering','catering.restaurant']},'activities','',{}),false,'a catering restaurant must never survive an activities category gate');
assert.equal(contracts.accepts({id:'spa',providerPlaceId:'spa',name:'Ostsee Therme',primaryType:'spa',types:['spa','leisure']},'activities','',{}),true,'provider leisure/spa evidence must remain valid for activities');

// Category default queries are browse/taxonomy routes — never open-vocabulary subjects.
// Regression: Erlebnisse→erlebniss previously made strict=true and wiped every activity pin.
const activitiesBrowseGoal='Aktivitäten Erlebnisse Freizeit';
const activitiesBrowseContract=contracts.evidenceContract(activitiesBrowseGoal,'activities',{},'Scharbeutz');
assert.equal(activitiesBrowseContract.strict,false,'activities category default query must not activate a strict subject gate');
assert.deepEqual([...(activitiesBrowseContract.rawTerms||[])],[],'activities category default query must not invent subject terms like erlebniss');
assert.equal(activitiesBrowseContract.categoryBrowse,true,'activities category default query is classified as category browse');
const rodelberg={id:'rodelberg',providerPlaceId:'rodelberg',name:'Rodelberg',primaryType:'sport',types:['sport','activity']};
assert.equal(contracts.accepts(rodelberg,'activities',activitiesBrowseGoal,{},{evidenceContract:activitiesBrowseContract}),true,'valid sport evidence must survive the activities category default query');
assert.equal(contracts.accepts({id:'la-vie-browse',providerPlaceId:'la-vie-browse',name:'La Vie',primaryType:'catering',types:['catering','restaurant','catering.restaurant']},'activities',activitiesBrowseGoal,{},{evidenceContract:activitiesBrowseContract}),false,'catering.restaurant must still be rejected under activities browse');
const minigolfContract=contracts.evidenceContract('Minigolf','activities',{},'Scharbeutz');
assert.equal(minigolfContract.strict,true,'explicit user subjects like Minigolf must keep the strict evidence gate');
assert.equal(minigolfContract.categoryBrowse,false,'explicit user subjects are not category browse');

(async()=>{
  const calls=[];
  let dataset=[auraBeach,googleHotel,foursquareHotel,ownerHotel];
  sandbox.LuviaAI=null;
  sandbox.LuviaIntelligenceContractV1=null;
  sandbox.LuviaPlaceEntities={searchPlaces:async options=>{
    calls.push(options);
    return{data:{places:dataset,providers:{requested:['google','foursquare'],used:['google','foursquare'],errors:[]}}};
  }};
  vm.runInContext(read('app/adapters/places-discovery-adapter.js'),sandbox,{filename:'places-discovery-adapter.js'});

  const hotels=await sandbox.LuviaPlacesDiscoveryService.recommend({text:'Hotels in Travemünde',category:'accommodation',destination:'Travemünde',limit:6,fastPath:true,fastQueryLimit:1});
  assert.deepEqual(Array.from(hotels.places,place=>place.providerPlaceId).sort(),['fsq-hotel','google-hotel','owner-hotel']);
  assert.equal(hotels.places.some(place=>place.providerPlaceId==='aura-beach'),false,'the public discovery adapter must discard the Aura hotel-name false positive');
  assert.equal(calls.at(-1).includedType,'lodging','accommodation discovery keeps the provider lodging hint');

  dataset=[nightClub,danceClub,cocktailBar,concertHall,clubNameOnly,googleHotel];
  const nightlife=await sandbox.LuviaPlacesDiscoveryService.recommend({text:'Nachtleben in Lübeck',category:'nightlife',destination:'Lübeck',limit:8,fastPath:true,fastQueryLimit:1});
  assert.deepEqual(Array.from(nightlife.places,place=>place.providerPlaceId).sort(),['bar','club','dance','music']);
  assert.equal(calls.at(-1).includedType,'','nightlife stays broad at provider retrieval because it legitimately spans several provider types');
  assert.equal(calls.at(-1).strictTypeFiltering,false,'nightlife correctness is enforced by the multi-type post-filter rather than one narrow provider type');

  dataset=[
    {id:'rodelberg',providerPlaceId:'rodelberg',name:'Rodelberg',primaryType:'sport',types:['sport','activity']},
    {id:'la-vie',providerPlaceId:'la-vie',name:'La Vie',primaryType:'catering',types:['catering','restaurant','catering.restaurant']}
  ];
  const activitiesBrowse=await sandbox.LuviaPlacesDiscoveryService.recommend({
    text:'Aktivitäten Erlebnisse Freizeit',
    query:'Aktivitäten Erlebnisse Freizeit',
    subjectText:'',
    category:'activities',
    destination:'Scharbeutz',
    limit:8,
    fastPath:true,
    fastQueryLimit:1
  });
  assert.deepEqual(Array.from(activitiesBrowse.places,place=>place.providerPlaceId),['rodelberg'],'category browse must keep valid activity evidence and drop catering.restaurant');
  assert.equal(activitiesBrowse.evidenceContract?.strict,false,'category browse subjectText must keep evidenceContract non-strict');
  assert.equal(activitiesBrowse.evidenceContract?.categoryBrowse,true,'category browse is marked on the evidence contract');

  const ownerDiagnostics=contracts.diagnostics();
  const adapterDiagnostics=sandbox.LuviaPlacesDiscoveryService.diagnostics();
  assert.equal(ownerDiagnostics.categoryEvidenceBeforeSubjectEvidence,true);
  assert.equal(ownerDiagnostics.accommodationNameFallback,false);
  assert.equal(ownerDiagnostics.nightlifeProviderTaxonomyGate,true);
  assert.equal(adapterDiagnostics.canonicalCategoryEvidenceGate,true);
  assert.equal(adapterDiagnostics.nightlifeMultiTypePostFilter,true);
  console.log('M16.5 Block 1 Places category integrity: PASS');
})().catch(error=>{console.error(error);process.exitCode=1});
