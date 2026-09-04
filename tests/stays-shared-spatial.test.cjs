'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=p=>fs.readFileSync(p,'utf8');
const requests=[],cacheKeys=[],categories=[{key:'food',label:'Essen & Trinken',primaryType:'restaurant',query:'Restaurant',includedTypes:['restaurant']},{key:'accommodation',label:'Unterkünfte',primaryType:'accommodation',query:'Unterkünfte',includedTypes:['lodging']}];
const root=()=>({isConnected:true,className:'',innerHTML:'',style:{setProperty(){}},querySelector(){return null},querySelectorAll(){return[]},addEventListener(){},removeEventListener(){}});
const ctx=vm.createContext({console,Date,Map,Set,Promise,setTimeout,clearTimeout,requestAnimationFrame(){},addEventListener(){},removeEventListener(){},document:{documentElement:{classList:{contains(){return false}}}}});ctx.window=ctx;
ctx.LuviaPlatformPorts={get:id=>id==='OfflineCachePort'?{read:key=>{cacheKeys.push(key);return{category:'food',query:'Restaurant',results:[{id:'bad-cache',name:'Steakhouse',types:['restaurant']}]};},write(){}}:null};
ctx.LuviaPlacesContractV1={reads:{categories:()=>categories,listSaved:async()=>[],recommend:async request=>{requests.push(request);return{places:[]}}}};
for(const file of ['core/places/places-domain-contract-core.js','core/places/global-place-contracts.js','app/places/places-spatial-composition-core.js','app/places/places-spatial-experience.js','modules/accommodations/accommodation-module.js'])vm.runInContext(read(file),ctx);
const trip={id:'trip-a',destinationName:'Scharbeutz',destinationLat:54.0224961,destinationLng:10.7544158};
// A scrolled map must never push the expanded sheet's close control above the viewport.
const sheetSource=read('app/journey/journey-suggestion-sheet.js');
const interactiveSource=sheetSource.slice(sheetSource.indexOf('function openResultsInteractive('),sheetSource.indexOf('function diagnostics()',sheetSource.indexOf('function openResultsInteractive(')));
for(const map of [{left:10,bottom:407,width:370,height:610},{left:10,bottom:900,width:370,height:610},{left:10,bottom:500,width:370,height:1000}]){
 const styles=new Map(),overlay={isConnected:true,dataset:{},style:{setProperty:(k,v)=>styles.set(k,v)}};
 const scope=vm.createContext({openResults:()=>overlay,activeHandle:{close(){}},innerHeight:720,setTimeout(){}});
 vm.runInContext(interactiveSource,scope);scope.openResultsInteractive({interactiveOrigin:{source:{left:10,bottom:390,width:370,height:70},map,viewport:{height:720}}}).settle(true);
 const height=parseFloat(styles.get('--lvjs-sheet-height')),bottom=parseFloat(styles.get('--lvjs-sheet-bottom'));
 assert.ok(height>0&&bottom>=0&&720-bottom-height>=0,'expanded sheet including header must fit in the visible screen');
}
// Both entry points show the same subtype state, including reset to all.
const spatialSource=read('app/places/places-spatial-experience.js'),selectionSource=spatialSource.slice(spatialSource.indexOf('  function syncFilterSelections('),spatialSource.indexOf('  function applyFilterChange('));
const all={setAttribute:(k,v)=>{all[k]=v}},typeButtons=[1,2].map(()=>({dataset:{placesSubtypeGroup:'types',placesSubtype:'apartment'},setAttribute(k,v){this[k]=v}}));
const selectionState={surface:'accommodation',filters:{types:['apartment']},root:{querySelectorAll:s=>s==='[data-places-subtype]'?typeButtons:[all]}};
const selectionScope=vm.createContext({state:selectionState});vm.runInContext(selectionSource,selectionScope);selectionScope.syncFilterSelections();
assert.equal(all['aria-pressed'],'false');assert.ok(typeButtons.every(b=>b['aria-pressed']==='true'));
selectionState.filters.types=[];selectionScope.syncFilterSelections();assert.equal(all['aria-pressed'],'true');assert.ok(typeButtons.every(b=>b['aria-pressed']==='false'));
(async()=>{
 const stays=root();await ctx.LuviaAccommodations.mount({roots:[stays]},{trip});await Promise.resolve();
 assert.equal(ctx.LuviaPlacesSpatialExperience.diagnostics().surface,'accommodation');
 assert.equal(requests.length,1,'one shared initial discovery; no competing Hotel or live-offer search');
 assert.equal(requests[0].category,'accommodation');assert.equal(requests[0].maxDistanceMeters,3000);assert.equal(requests[0].destination.location.latitude,trip.destinationLat);
 assert.equal(requests[0].userQuery,'');assert.deepEqual(Array.from(requests[0].providers),['geoapify']);
 assert.match(stays.innerHTML,/Wo möchtet ihr übernachten/);assert.match(stays.innerHTML,/data-places-map/);assert.match(stays.innerHTML,/data-places-history-region/);
 assert.doesNotMatch(stays.innerHTML,/hotel-hero|hotel-stay|Wann und für wen|Geplante Aufenthalte|Steakhouse/);
 const normal=root();await ctx.LuviaPlacesSpatialExperience.mount(normal,trip);await Promise.resolve();
 assert.equal(requests.at(-1).category,'food');assert.equal(ctx.LuviaPlacesSpatialExperience.diagnostics().surface,'places');
 ctx.LuviaAccommodations.unmount();assert.equal(ctx.LuviaPlacesSpatialExperience.diagnostics().status,'mounted','late Hotel cleanup cannot unmount a newer Places root');
 assert.notEqual(cacheKeys[0],cacheKeys.at(-1),'Places and Stays cannot reuse each other’s cached cohort');
 ctx.LuviaPlacesSpatialExperience.unmount();
 const css=read('app/places/places-spatial-experience.css');assert.match(css,/@media\(max-width:800px\)\{\.lv-places-spatial__map-preview\{position:absolute/);assert.doesNotMatch(css,/\.lv-places-spatial__map-preview\{position:fixed/);
 const fresh={scope:JSON.stringify({trip:'trip-a',surface:'places',destination:'Scharbeutz',latitude:trip.destinationLat,longitude:trip.destinationLng}),category:'food',query:'Restaurant',savedAt:new Date().toISOString(),results:[{id:'geoapify:warm',name:'Warm place',types:['restaurant'],coordinates:{latitude:trip.destinationLat,longitude:trip.destinationLng}}]};
 ctx.LuviaPlatformPorts={get:id=>id==='OfflineCachePort'?{read:()=>fresh,write(){}}:null};
 const beforeWarm=requests.length;await ctx.LuviaPlacesSpatialExperience.mount(root(),trip);await Promise.resolve();assert.equal(requests.length,beforeWarm,'fresh cached destination must paint without a redundant provider request');assert.equal(ctx.LuviaPlacesSpatialExperience.diagnostics().resultCount,1);
 ctx.LuviaPlacesSpatialExperience.unmount();
 console.log('Shared Stays/Places mount, fresh cache, destination query, lifecycle and mobile map containment: PASS');
})().catch(e=>{console.error(e);process.exitCode=1});
