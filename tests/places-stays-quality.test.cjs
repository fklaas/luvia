'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const ctx=vm.createContext({console,Date,Map,Set,Promise,setTimeout,clearTimeout,addEventListener(){}});ctx.window=ctx;
for(const file of ['core/intelligence/trip-preference-resolution-core.js','core/places/places-domain-contract-core.js','core/platform/places-contract-adapter.js'])vm.runInContext(read(file),ctx);
const core=ctx.LuviaTripPreferenceResolutionCoreV1;
const profile={dietaryPreferences:['vegetarian'],travelInterests:['culinary','nature'],familyPreferences:{needs:['stroller']}};
const food={id:'geoapify:food',name:'COAST',types:['restaurant'],features:{servesVegetarianFood:true},location:{latitude:54.02,longitude:10.75}};
const ranked=p=>core.rankPlaces({profilePreferences:profile,candidates:[p]}).places[0];
assert.equal(ranked(food).preferenceDiscoveryMatch,true,'verified vegetarian offer can be discovered despite unknown stroller access');
assert.equal(ranked(food).preferenceConstraintState,'verify','unknown stroller access is never approved');
assert.ok(ranked(food).preferenceWarnings.some(x=>x.includes('stroller')));
assert.equal(ranked({...food,features:{}}).preferenceDiscoveryMatch,false,'unknown dietary offer cannot match');
for(const name of ['Kleines Steakhouse','Steakhaus','Grillhaus','Kebab Grill']){
 const result=ranked({...food,name,types:['restaurant','catering','vegetarian','vegan','wheelchair_limited'],features:{servesVegetarianFood:true,servesVeganFood:true}});
 assert.equal(result.preferenceDiscoveryMatch,false,`${name}: generic provider diet options cannot override a meat-led main offer`);
}
assert.equal(ranked({...food,features:{servesVegetarianFood:false}}),undefined,'explicit conflicts remain blocked');
const access=core.rankPlaces({profilePreferences:{accessibilityNeeds:['wheelchair'],travelInterests:['culinary']},candidates:[{...food,types:['restaurant','wheelchair_limited']}]}).places[0];
assert.equal(access.preferenceDiscoveryMatch,false,'limited wheelchair metadata is not verified accessibility');
let calls=0,full=false,empty=false;
ctx.LuviaPlaces={details(){},async textSearch(){calls++;await Promise.resolve();return{places:empty?[]:full?Array.from({length:50},(_,i)=>({...food,id:`geoapify:${i}`})):[food]}}};
const request={bounds:{south:54,west:10.7,north:54.1,east:10.8},center:{latitude:54.05,longitude:10.75},category:'food',providers:['geoapify']};
(async()=>{
 const api=ctx.LuviaPlacesContractV1.reads;
 await Promise.all([api.searchViewport(request),api.searchViewport(request)]);assert.equal(calls,1,'simultaneous identical reads coalesce');
 const repeat=await api.searchViewport(request);assert.equal(calls,1);assert.equal(repeat.tiles.requested,0);
 const inner={...request,bounds:{south:54.01,west:10.72,north:54.03,east:10.78}};
 assert.equal((await api.searchViewport(inner)).count,1);assert.equal(calls,1,'complete larger region covers zoom-in');
 await api.searchViewport({...request,category:'accommodation'});assert.equal(calls,2,'categories never contaminate each other');
 empty=true;const emptyRequest={...request,category:'nature',query:'empty'};await api.searchViewport(emptyRequest);await api.searchViewport(emptyRequest);assert.equal(calls,4,'empty viewport reads are not cached');
 empty=false;await api.searchViewport({...request,forceRefresh:true});assert.equal(calls,5,'forced refresh bypasses a successful local cache');
 full=true;await api.searchViewport({...request,query:'full'});await api.searchViewport({...inner,query:'full'});assert.equal(calls,7,'truncated page cannot establish coverage');
 vm.runInContext(read('app/journey/journey-suggestion-sheet.js').replace('globalThis.LuviaJourneySuggestions=','globalThis.quality={displayDate,cuisineLabels};globalThis.LuviaJourneySuggestions='),ctx);
 assert.equal(ctx.quality.displayDate('2026-09-04'),'04.09.2026');
 assert.equal(ctx.quality.cuisineLabels({types:['catering','wheelchair_limited','italian_restaurant','vegan']}),'Italienisch · Vegan');
 console.log('Places/Stays: profile evidence, viewport cache/coalescing, taxonomy and German date: PASS');
})().catch(error=>{console.error(error);process.exitCode=1});
