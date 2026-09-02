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
  {id:'vegetarian-inn',name:'Altes Gasthaus',primaryType:'restaurant',types:['restaurant'],features:{servesVegetarianFood:true,wheelchairAccessible:true},accessibilityOptions:{wheelchairAccessibleEntrance:true}},
  {id:'generic-doner',name:'City Döner Grill',primaryType:'restaurant',types:['kebab_shop','restaurant'],features:{servesVegetarianFood:true,wheelchairAccessible:true},accessibilityOptions:{wheelchairAccessibleEntrance:true}},
  {id:'vegan-doner',name:'Veganer Döner Garten',primaryType:'vegetarian_restaurant',types:['vegetarian_restaurant','kebab_shop','restaurant'],features:{servesVegetarianFood:true,wheelchairAccessible:true},accessibilityOptions:{wheelchairAccessibleEntrance:true}},
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
assert.equal(cultureResolution.summary.planningPace,'ruhig','the profile pace must become an explicit planning policy, not decorative copy');
assert.equal(cultureRanked.places[0].id,'culture-cafe','trip culture feeling should lift the cultural candidate');
assert.equal(cultureRanked.meta.blockedCount,1,'explicit hard-constraint conflict must be removed');
assert.ok(Array.from(cultureRanked.meta.blockedProviderPlaceIds).includes('meat-only'));
assert.equal(cultureRanked.places.find(place=>place.id==='vegetarian-inn').preferenceConstraintState,'satisfied','a normal restaurant with positive provider evidence may satisfy the vegetarian gate even when it also serves meat');
assert.equal(cultureRanked.places.find(place=>place.id==='generic-doner').preferenceConstraintState,'verify','a meat-led primary offer must not satisfy a vegetarian hard requirement from one generic provider boolean');
assert.match(Array.from(cultureRanked.places.find(place=>place.id==='generic-doner').preferenceWarnings).join(' '),/fleischzentriert/);
assert.equal(cultureRanked.places.find(place=>place.id==='vegan-doner').preferenceConstraintState,'satisfied','an explicit vegetarian or vegan offer profile may satisfy the gate regardless of cuisine format');
const unknown=cultureRanked.places.find(place=>place.id==='unknown-park');
assert.equal(unknown.preferenceConstraintState,'verify','unknown evidence must remain visible but marked for verification');
assert.ok(Array.from(unknown.preferenceWarnings).some(item=>/nicht eindeutig bestätigt/.test(item)));
const fit=cultureRanked.places[0].preferenceFit;
assert.equal(fit.deterministic,true);
assert.equal(fit.aiScoreUsed,false,'OpenAI may explain evidence but must never invent the match percentage');
assert.equal(fit.formula,'Profil 30 · Anforderungen 25 · Reisegefühl 15 · Tagesbalance 12 · belegte Entfernung 10 · Zeit/Öffnung/Wetter 8');
assert.ok(fit.coverage>=25&&fit.coverage<=100,'the shown score must expose how much of the weighted formula has actual evidence');
assert.ok(fit.personalCoverage>=25,'a visible personal percentage must include a real Profile or hard-requirement basis');
assert.equal(fit.minimumCoverage,45,'thin evidence must suppress a percentage instead of manufacturing confidence');
const guidance=resolver.composeDayGuidance({resolution:cultureResolution,dayGraph:{days:[{date:'2027-06-12',status:'planned',openGaps:[{startAt:'2027-06-12T10:00:00',endAt:'2027-06-12T14:00:00',durationMinutes:240}]}]}});
assert.equal(guidance.policy.pace,'ruhig');
assert.equal(guidance.policy.routeBufferMinutes,15);
assert.equal(guidance.policy.maximumSuggestions,3);

const familyResolution=resolver.resolve({profilePreferences:{dietaryPreferences:['vegetarian'],familyPreferences:{needs:['traveling_with_children','baby']}},tripComposition:{}});
assert.equal(familyResolution.hardConstraints.length,1,'travelling with children is ranking context and must not make every Place without a Google family flag unverifiable');
assert.ok(Array.from(familyResolution.profileSignals).some(item=>item.label==='Familienzeit'),'baby and child context must still influence the personal order');
const strollerResolution=resolver.resolve({profilePreferences:{familyPreferences:{needs:['stroller']}},tripComposition:{}});
assert.equal(strollerResolution.hardConstraints.length,1,'an explicit stroller requirement remains a hard functional gate');

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
