'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8').replace(/\r\n?/g,'\n');

const resolverSource=read('core/intelligence/trip-preference-resolution-core.js');
const intelligenceAdapter=read('core/platform/intelligence-contract-adapter.js');
const discoveryAdapter=read('app/adapters/places-discovery-adapter.js');
const placesAdapter=read('core/platform/places-contract-adapter.js');
const placesSurface=read('core/places/places-final-foundation.js');
const placesCss=read('core/places/places-final-foundation.css');
const index=read('index.html');
const serviceWorker=read('sw.js');
const fixture=read('tests/fixtures/m16.5aa-preference-places-browser.html');

const sandbox={Object,Array,Map,Set,Date,Math,Number,String,Boolean,RegExp,JSON};
vm.createContext(sandbox);
vm.runInContext(resolverSource,sandbox,{filename:'trip-preference-resolution-core.js'});
const resolver=sandbox.LuviaTripPreferenceResolutionCoreV1;
assert.ok(resolver,'browserless preference resolver must export its public core');

const profile={
  dietaryPreferences:['vegetarian'],
  accessibilityNeeds:['wheelchair'],
  travelInterests:['culture','local'],
  travelPace:'relaxed'
};
const cultureTrip={feelings:['culture','curious']};
const activeTrip={feelings:['active']};
const candidates=[
  {id:'culture-cafe',name:'Local Culture Museum Café',primaryType:'restaurant',features:{servesVegetarianFood:true,wheelchairAccessible:true},accessibilityOptions:{wheelchairAccessibleEntrance:true}},
  {id:'bike-cafe',name:'Outdoor Bike Garden Café',primaryType:'restaurant',features:{servesVegetarianFood:true,wheelchairAccessible:true},accessibilityOptions:{wheelchairAccessibleEntrance:true}},
  {id:'meat-only',name:'Meat Bar Restaurant',primaryType:'restaurant',features:{servesVegetarianFood:false,wheelchairAccessible:true},accessibilityOptions:{wheelchairAccessibleEntrance:true}},
  {id:'unknown-park',name:'Quiet Riverside Park',primaryType:'park',features:{}}
];
const profileBefore=JSON.stringify(profile),tripBefore=JSON.stringify(cultureTrip),candidatesBefore=JSON.stringify(candidates);
const cultureResolution=resolver.resolve({profilePreferences:profile,tripComposition:cultureTrip,trip:{id:'trip-1'}});
const cultureRanked=resolver.rankPlaces({resolution:cultureResolution,candidates});

assert.equal(cultureResolution.owner,'intelligence');
assert.equal(cultureResolution.persisted,false,'derived resolution must never become a new truth store');
assert.equal(cultureResolution.provenance.profile,'identity.v1');
assert.equal(cultureResolution.provenance.trip,'trip.v1');
assert.deepEqual(Array.from(cultureResolution.summary.tripFeelings),['Kultur nah erleben','Neugierig']);
assert.equal(cultureRanked.places[0].id,'culture-cafe','trip culture feeling should lift the cultural candidate');
assert.equal(cultureRanked.meta.blockedCount,1,'explicit hard-constraint conflict must be removed');
assert.ok(Array.from(cultureRanked.meta.blockedProviderPlaceIds).includes('meat-only'));
const unknown=cultureRanked.places.find(place=>place.id==='unknown-park');
assert.equal(unknown.preferenceConstraintState,'verify','unknown evidence must remain visible but marked for verification');
assert.ok(Array.from(unknown.preferenceWarnings).some(item=>/nicht eindeutig bestätigt/.test(item)));

const activeResolution=resolver.resolve({profilePreferences:profile,tripComposition:activeTrip,trip:{id:'trip-2'}});
const activeRanked=resolver.rankPlaces({resolution:activeResolution,candidates});
assert.equal(activeRanked.places[0].id,'bike-cafe','a different trip feeling should change order without changing Profile truth');
assert.equal(JSON.stringify(profile),profileBefore);
assert.equal(JSON.stringify(cultureTrip),tripBefore);
assert.equal(JSON.stringify(candidates),candidatesBefore);
assert.ok(Object.isFrozen(cultureResolution));
assert.ok(Object.isFrozen(cultureRanked.places));

assert.match(intelligenceAdapter,/resolveTripPreferences/);
assert.match(intelligenceAdapter,/rankPlaceCandidates/);
assert.match(discoveryAdapter,/reads\?\.resolveTripPreferences/);
assert.match(discoveryAdapter,/reads\?\.rankPlaceCandidates/);
assert.match(placesAdapter,/owner:'intelligence',kind:'trip-preference-ranking'/);
assert.match(placesSurface,/Profil schützt · Reisegefühl gewichtet/);
assert.match(placesSurface,/Verbindlich aus dem Profil/);
assert.match(placesSurface,/Nur für diese Reise/);
assert.match(placesSurface,/state\.trip\?\.composition/);
assert.match(placesCss,/\.places-final-preference-context/);
assert.match(placesCss,/@media\(max-width:760px\).*places-final-preference-context/s);
assert.match(index,/core\/intelligence\/trip-preference-resolution-core\.js\?v=/);
assert.match(serviceWorker,/'core\/intelligence\/trip-preference-resolution-core\.js'/);
assert.match(fixture,/LuviaPlacesFinal\.mount/);
assert.match(fixture,/trip-preference-resolution-core\.js/);
assert.match(fixture,/recommend:async options/);
for(const forbidden of ['localStorage','sessionStorage','.rpc(','supabase'])assert.equal(resolverSource.includes(forbidden),false,`resolver must stay browserless and owner-safe: ${forbidden}`);

console.log('M16.5AA shared preference resolution, hard constraints, trip weighting and Places projection: PASS');
