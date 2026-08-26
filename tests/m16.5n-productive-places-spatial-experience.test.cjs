'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const ROOT=path.resolve(__dirname,'..');
const read=relative=>fs.readFileSync(path.join(ROOT,relative),'utf8').replace(/\r\n?/g,'\n');
const plain=value=>JSON.parse(JSON.stringify(value));
function cssBlockAfter(source,marker){
  const markerIndex=source.indexOf(marker);
  assert.notEqual(markerIndex,-1,`CSS marker missing: ${marker}`);
  const openIndex=source.indexOf('{',markerIndex);
  assert.notEqual(openIndex,-1,`CSS block missing: ${marker}`);
  let depth=0;
  for(let index=openIndex;index<source.length;index++){
    if(source[index]==='{')depth++;
    if(source[index]==='}'&&--depth===0)return source.slice(openIndex+1,index);
  }
  assert.fail(`CSS block is not balanced: ${marker}`);
}
const corePath='app/places/places-spatial-composition-core.js';
const coreSource=read(corePath);

for(const token of ['window','document','navigator','globalThis','localStorage','sessionStorage','fetch','XMLHttpRequest','indexedDB']){
  assert.equal(new RegExp(`\\b${token}\\b`).test(coreSource),false,`${corePath} must remain browserless: ${token}`);
}
for(const token of ['LuviaPlaceCore','LuviaPlaceEntities','LuviaPlacesDomainContractCoreV1','LuviaTripContext','LuviaTripStore','LuviaSupabaseService','supabase']){
  assert.equal(coreSource.includes(token),false,`${corePath} may not read private Domain Truth: ${token}`);
}
assert.doesNotMatch(coreSource,/Math\.random|new Date|Date\.now|crypto\./,'Places composition must remain deterministic');

const context={Object,Array,String,Number,Boolean,Math,Set,Map,JSON,Error,TypeError,Symbol};
vm.createContext(context);
vm.runInContext(coreSource,context,{filename:corePath});
const core=context.LuviaPlacesSpatialCompositionCoreV1;
assert.ok(core,'Places Spatial Composition Core v1 did not install');
assert.equal(core.contractId,'consumer.places-spatial-composition.v1');
assert.equal(core.sourceContract,'places.v1');
assert.equal(core.initialVisibleResults,6);
assert.equal(core.maxResults,18);
assert.deepEqual(plain(core.diagnostics()),{
  contractId:'consumer.places-spatial-composition.v1',
  version:'1',
  runtimeVersion:'1.0.0',
  sourceContract:'places.v1',
  browserless:true,
  deterministic:true,
  domainTruth:false,
  initialVisibleResults:6,
  maxResults:18,
  coordinatePolicy:'complete-finite-wgs84-owner-projection-only',
  coordinateOrder:'longitude-latitude',
  syntheticMarkers:false,
  states:['loading','ready','empty','error','offline']
});

const categories={
  food:{key:'food',label:'Essen & Trinken',icon:'restaurant',primaryType:'restaurant',includedTypes:['restaurant','cafe'],query:'Restaurants Cafés'},
  nature:{key:'nature',label:'Natur & Erholung',icon:'leaf',primaryType:'nature',includedTypes:['park','beach'],query:'Parks Natur'},
  duplicate:{key:'food',label:'Darf nicht duplizieren'},
  invalid:null
};
assert.deepEqual(plain(core.normalizeCategories(categories)),[
  {key:'food',label:'Essen & Trinken',icon:'restaurant',primaryType:'restaurant',includedTypes:['restaurant','cafe'],query:'Restaurants Cafés',order:0},
  {key:'nature',label:'Natur & Erholung',icon:'leaf',primaryType:'nature',includedTypes:['park','beach'],query:'Parks Natur',order:1}
]);
assert.equal(Object.isFrozen(core.normalizeCategories(categories)),true);

const validCoordinates={latitude:54.0279115,longitude:10.7563139};
assert.deepEqual(plain(core.normalizeCoordinates(validCoordinates)),{
  latitude:54.0279115,
  longitude:10.7563139,
  lngLat:[10.7563139,54.0279115]
});
assert.deepEqual(plain(core.normalizeCoordinates({lat:'54.0269110',lng:'10.7575622'})),{
  latitude:54.026911,
  longitude:10.7575622,
  lngLat:[10.7575622,54.026911]
});
for(const coordinates of [
  null,
  {},
  {latitude:54},
  {longitude:10},
  {latitude:91,longitude:10},
  {latitude:-91,longitude:10},
  {latitude:54,longitude:181},
  {latitude:54,longitude:-181},
  {latitude:NaN,longitude:10},
  {latitude:54,longitude:Infinity},
  {latitude:'',longitude:10},
  {latitude:true,longitude:10},
  {latitude:54,longitude:false},
  {latitude:Symbol('invalid'),longitude:10}
])assert.equal(core.normalizeCoordinates(coordinates),null,`invalid WGS84 pair was accepted: ${String(coordinates)}`);

const eighteenPlus=Array.from({length:22},(_,index)=>({
  id:`place-${index+1}`,
  providerPlaceId:`places/provider-${index+1}`,
  primaryType:index%2?'nature':'restaurant',
  name:`Ort ${index+1}`,
  coordinates:{latitude:54+index/1000,longitude:10+index/1000},
  rawProviderPayload:{secret:'must-not-leak'}
}));
const paginationModel=core.compose({sourceContract:'places.v1',categories,places:eighteenPlus,runtime:{status:'ready'}});
assert.equal(paginationModel.counts.total,18,'result model must cap owner projections at 18');
assert.equal(paginationModel.counts.visible,6,'initial result model must expose six entries');
assert.equal(paginationModel.counts.remaining,12);
assert.equal(paginationModel.markers.length,6);
assert.equal(paginationModel.results[0].providerPlaceId,'provider-1');
assert.equal(paginationModel.results[0].rawProviderPayload,undefined,'private/raw provider fields leaked into Consumer composition');
assert.equal(Object.isFrozen(paginationModel),true);
assert.equal(Object.isFrozen(paginationModel.results),true);
assert.equal(Object.isFrozen(paginationModel.results[0]),true);
assert.equal(Object.isFrozen(paginationModel.markers[0]),true);
assert.deepEqual(plain(paginationModel.bounds.lngLatBounds),[[10,54],[10.005,54.005]]);

const coordinatePlaces=[
  {id:'valid-a',providerPlaceId:'places/google-land-1',name:'Diercksen',coordinates:validCoordinates},
  {id:'valid-b',providerPlaceId:'places/google-land-2',name:'Grande Beach Café',coordinates:{lat:'54.0269110',lng:'10.7575622'}},
  {id:'missing',providerPlaceId:'missing-coordinate',name:'Nur in der Liste',coordinates:null},
  {id:'half',providerPlaceId:'half-coordinate',name:'Unvollständig',coordinates:{latitude:54.02}},
  {id:'bad-lat',providerPlaceId:'bad-latitude',name:'Ungültig',coordinates:{latitude:91,longitude:10.7}},
  {id:'bad-lng',providerPlaceId:'bad-longitude',name:'Ungültig',coordinates:{latitude:54.02,longitude:181}},
  {id:'nan',providerPlaceId:'nan-coordinate',name:'Ungültig',coordinates:{latitude:'abc',longitude:10.7}}
];
const coordinatesSnapshot=JSON.stringify(coordinatePlaces);
const coordinateModel=core.compose({contractId:'places.v1',categories,places:coordinatePlaces,visibleLimit:18,runtime:{status:'ready'}});
assert.equal(JSON.stringify(coordinatePlaces),coordinatesSnapshot,'Consumer composition mutated owner projections');
assert.equal(coordinateModel.results.length,7,'places without coordinates must remain available in the result list');
assert.equal(coordinateModel.markers.length,2,'only complete finite WGS84 owner coordinates may create markers');
assert.equal(coordinateModel.mapOmissions.length,5);
assert.deepEqual(plain(coordinateModel.markers[0]),{
  providerPlaceId:'google-land-1',
  resultId:'place-result-1',
  name:'Diercksen',
  rank:1,
  latitude:54.0279115,
  longitude:10.7563139,
  lngLat:[10.7563139,54.0279115],
  sourceContract:'places.v1'
});
assert.deepEqual(plain(coordinateModel.markers[1].lngLat),[10.7575622,54.026911]);
assert.ok(coordinateModel.markers.every(marker=>coordinateModel.results.some(result=>result.providerPlaceId===marker.providerPlaceId)));
assert.equal(new Set(coordinateModel.markers.map(marker=>marker.providerPlaceId)).size,coordinateModel.markers.length);
assert.ok(coordinateModel.mapOmissions.every(item=>item.reason==='missing-or-invalid-owner-coordinates'));
assert.equal(coordinateModel.policy.syntheticMarkers,false);
assert.equal(coordinateModel.policy.domainTruth,false);
assert.equal(coordinateModel.policy.coordinateOrder,'longitude-latitude');
assert.deepEqual(plain(core.compose({categories,places:coordinatePlaces,visibleLimit:18,runtime:{status:'ready'}})),plain(coordinateModel),'same owner projection must produce the same model');
assert.throws(()=>core.compose({sourceContract:'places.v2',places:[]}),/places\.v1/,'foreign/unversioned owner input must be rejected');

const ready=core.compose({categories,places:[coordinatePlaces[0]],runtime:{status:'ready'}}).status;
const loading=core.compose({categories,places:[],runtime:{loading:true}}).status;
const empty=core.compose({categories,places:[],runtime:{status:'empty',settled:true}}).status;
const offline=core.compose({categories,places:[coordinatePlaces[0]],runtime:{offline:true}}).status;
const rawError=core.compose({categories,places:[],runtime:{error:new Error('provider-key=secret')}}).status;
const publicError=core.compose({categories,places:[],runtime:{error:{userMessage:'Bitte versucht es noch einmal.'}}}).status;
assert.deepEqual(plain(ready),{kind:'ready',busy:false,ariaRole:'status',ariaLive:'polite',message:'1 passende Orte gefunden.',hasResults:true,stale:false,canRetry:false});
assert.equal(loading.kind,'loading');assert.equal(loading.busy,true);assert.equal(loading.ariaLive,'polite');
assert.equal(empty.kind,'empty');assert.equal(empty.hasResults,false);assert.equal(empty.canRetry,true);
assert.equal(offline.kind,'offline');assert.equal(offline.stale,true);assert.equal(offline.hasResults,true);assert.equal(offline.canRetry,true);
assert.equal(rawError.kind,'error');assert.equal(rawError.ariaRole,'alert');assert.equal(rawError.ariaLive,'assertive');assert.doesNotMatch(rawError.message,/provider-key|secret/);
assert.equal(publicError.message,'Bitte versucht es noch einmal.');

/*
 * Productive Experience adoption checks intentionally lead the implementation.
 * They remain red until the Consumer-owned Web Experience and its mount replace
 * the legacy default Places surface.
 */
const expectedExperienceFiles=[
  'app/places/places-spatial-experience.js',
  'app/places/places-spatial-experience.css'
];
for(const file of expectedExperienceFiles){
  assert.equal(fs.existsSync(path.join(ROOT,file)),true,`M16.5N productive Experience file missing: ${file}`);
}

const experience=read('app/places/places-spatial-experience.js');
const css=read('app/places/places-spatial-experience.css');
const shell=read('modules/places-shell.js');
const index=read('index.html');
const worker=read('sw.js');

for(const required of ['LuviaPlacesSpatialCompositionCoreV1','LuviaPlacesContractV1','.categories(','.recommend(','.listSaved(']){
  assert.ok(experience.includes(required),`productive Places Experience is missing public projection ${required}`);
}
assert.match(experience,/normalizeCategories\(contract\.reads\.categories\(\)\)/,'places.v1 category registries must be normalized before array-based Experience selection');
assert.match(experience,/\.(?:getCard|getDetails)\(/,'place media/detail enrichment must use a public places.v1 read');
for(const forbidden of [
  'LuviaPlaceCore','LuviaPlaceEntities','LuviaPlacesDomainContractCoreV1','LuviaPlaceDetails',
  'LuviaBookingUI','LuviaBookingCore','LuviaTripContext','LuviaTripStore','LuviaSupabaseService',
  'localStorage','sessionStorage','navigator.geolocation','navigator.onLine'
])assert.equal(experience.includes(forbidden),false,`productive Consumer Places Experience bypasses an owner/port boundary: ${forbidden}`);
assert.match(experience,/LuviaPlatformPorts/);
assert.match(experience,/NetworkPort/);
assert.match(experience,/ExternalNavigationPort/);
assert.doesNotMatch(experience,/href="\$\{esc\(value\.website\)\}"/,'external Place URLs may not become native navigation targets that bypass ExternalNavigationPort');
assert.match(experience,/data-places-external="\$\{esc\(value\.website\)\}"/,'public Place website projections must remain data-only until the navigation port handles them');
assert.match(experience,/navigationPort\.open\(url\)/,'external Place websites must be opened by ExternalNavigationPort');
assert.match(experience,/link\.addEventListener\('click',event=>\{event\.preventDefault\(\);openExternal\(link\.dataset\.placesExternal\)\}\)/,'external Place links must suppress native navigation before delegating to the platform port');

assert.match(experience,/maplibregl/,'productive spatial surface must use the accepted geographic map renderer');
assert.match(experience,/\.setLngLat\(marker\.lngLat\)/,'MapLibre must receive the exact owner longitude/latitude tuple');
assert.match(experience,/new globalThis\.maplibregl\.Marker\(\{element:markerButton\(marker\),anchor:'bottom',offset:\[0,-5\]\}\)/,'MapLibre markers must compensate the five-pixel visual tail without changing owner coordinates');
assert.match(experience,/\.fitBounds\(/,'map viewport must derive from coordinate-qualified result bounds');
assert.match(experience,/if\(renderToken===state\.renderToken\)mountMap\(view,renderToken\)/,'only the latest render may mount a MapLibre instance into the current map host');
assert.match(experience,/renderToken===state\.renderToken&&container\.isConnected&&state\.map===map/,'late MapLibre callbacks must be fenced to the current render and live map host');
assert.match(experience,/state\.map\.easeTo\(\{center:coordinates\.lngLat/,'selecting a result card must move the map to the same owner coordinate');
assert.match(experience,/select\(marker\.providerPlaceId,true,false\)/,'selecting a map marker must move the corresponding result into view without a redundant map jump');
assert.match(experience,/data-places-map-fallback/,'the map must retain an honest bright fallback surface while tiles are unavailable');
assert.match(experience,/LuviaApp\?\.openCompass\?\.\('plan'\)/,'Places back navigation must restore the embedded Plan Compass');
assert.doesNotMatch(experience,/Math\.random|pin-a|pin-b|pin-c|pin-d|pin-e|map-land|map-sea/,'synthetic prototype pin placement may not enter the productive Experience');
assert.doesNotMatch(experience,/center\s*:\s*\[\s*10\.7554\s*,\s*54\.0267\s*\]/,'hard-coded prototype destination center may not become Product Truth');
assert.doesNotMatch(experience,/setLngLat\(\s*\[\s*\d+(?:\.\d+)?\s*,\s*\d+(?:\.\d+)?\s*\]\s*\)/,'literal demo marker coordinates may not enter the productive Experience');

for(const semantic of ['role="region"','aria-label','aria-live="polite"','aria-busy','ariaRole','aria-controls','aria-pressed']){
  assert.ok(experience.includes(semantic),`productive Places accessibility semantic missing: ${semantic}`);
}
assert.match(experience,/<label[^>]+for="places-query"/);
assert.match(experience,/<(?:input|textarea)[^>]+id="places-query"/);
assert.match(experience,/createElement\(['"]button['"]\)/,'map markers must be native buttons');
assert.doesNotMatch(experience,/data-places-map[^>]+role="img"/,'the map container may not hide its interactive marker descendants behind role="img"');
assert.match(experience,/data-places-map[^>]+role="group"/,'the interactive map must expose its marker controls as an accessible group');
assert.match(experience,/marker\.setAttribute\('aria-pressed',String\(selected\)\)/,'marker selection changes must update their programmatic pressed state');
assert.match(experience,/card\.setAttribute\('aria-current',String\(selected\)\)/,'result selection changes must update their programmatic current state');
assert.doesNotMatch(experience,/<article[^>]+role=["']button["'][^>]*>[\s\S]*?<button/,'result articles may not contain nested interactive button roles');

assert.match(css,/--places-accent\s*:\s*var\(--trip-accent\)/);
assert.match(css,/:focus-visible/);
assert.match(css,/@media\s*\(prefers-reduced-motion\s*:\s*reduce\)/);
assert.match(css,/min-height\s*:\s*(?:44px|var\(--luvia-layout-touch-minimum\))/);
assert.match(css,/@media\s*\(max-width\s*:\s*800px\)/);
assert.match(css,/min-width\s*:\s*0/);
assert.match(css,/max-width\s*:\s*100%/);
assert.doesNotMatch(css,/\.pin-[a-e]\b|\.map-(?:land|sea)\b/);

const rootCss=cssBlockAfter(css,'.lv-places-spatial {');
assert.match(rootCss,/overflow-x\s*:\s*clip/,'Places must contain local horizontal rails instead of widening the document');
assert.doesNotMatch(css,/\b100vw\b/,'Places may not use viewport width inside the already constrained app workspace');

const narrowStageCss=cssBlockAfter(css,'@media (min-width: 801px) and (max-width: 1080px)');
const narrowCanvasCss=cssBlockAfter(narrowStageCss,'.lv-places-spatial__canvas');
const narrowMapCss=cssBlockAfter(narrowStageCss,'.lv-places-spatial__map');
const narrowResultsCss=cssBlockAfter(narrowStageCss,'.lv-places-spatial__results');
const narrowResultListCss=cssBlockAfter(narrowStageCss,'.lv-places-spatial__result-list');
const narrowResultCardCss=cssBlockAfter(narrowStageCss,'.lv-places-spatial__result-card');
assert.match(narrowCanvasCss,/grid-template-columns\s*:\s*minmax\(0,\s*1fr\)/,'801–1080 px must reflow the connected canvas before the map is squeezed by the desktop sidebar');
assert.match(narrowCanvasCss,/min-height\s*:\s*0/);
assert.match(narrowMapCss,/grid-row\s*:\s*1/,'the geographic map must remain first in the narrow connected stage');
assert.match(narrowMapCss,/border-right\s*:\s*0/);
assert.match(narrowResultsCss,/grid-row\s*:\s*2/,'the matching result surface must follow the map');
assert.match(narrowResultsCss,/max-height\s*:\s*none/);
assert.match(narrowResultListCss,/display\s*:\s*flex/);
assert.match(narrowResultListCss,/overflow-x\s*:\s*auto/,'narrow result cards must scroll only inside their own rail');
assert.match(narrowResultListCss,/overflow-y\s*:\s*hidden/);
assert.match(narrowResultListCss,/scroll-snap-type\s*:\s*inline mandatory/);
assert.match(narrowResultCardCss,/scroll-snap-align\s*:\s*start/);

const markerCss=cssBlockAfter(css,'.lv-places-spatial__marker {');
assert.doesNotMatch(markerCss,/(?:^|;)\s*transform\s*:/m,'MapLibre owns marker transforms; CSS may only define transform-origin and scale');

const hubStart=shell.indexOf('async function showHub');
const hubEnd=shell.indexOf('function bind',hubStart);
assert.notEqual(hubStart,-1,'Places Shell showHub mount boundary missing');
assert.notEqual(hubEnd,-1,'Places Shell showHub end boundary missing');
const hubScope=shell.slice(hubStart,hubEnd);
assert.match(hubScope,/LuviaPlacesSpatialExperience\.mount/,'productive Places route must mount the new spatial Experience');
assert.doesNotMatch(hubScope,/LuviaPlacesFinal\.mount/,'legacy Places screen may not remain behind the new composition');
assert.match(shell,/LuviaPlacesSpatialExperience\?\.unmount|LuviaPlacesSpatialExperience\.unmount/);

for(const asset of [corePath,...expectedExperienceFiles]){
  assert.ok(index.includes(asset),`index.html missing M16.5N asset: ${asset}`);
  assert.ok(worker.includes(asset),`sw.js missing M16.5N offline shell asset: ${asset}`);
}
assert.ok(index.indexOf(corePath)<index.indexOf('app/places/places-spatial-experience.js'),'browserless Places composition must load before its Web Experience');
assert.ok(index.indexOf('app/places/places-spatial-experience.js')<index.indexOf('modules/places-shell.js'),'productive Places Experience must load before its shell mount');

(async()=>{
  let resolveSaved;
  let recommendCalls=0;
  let mapQueries=0;
  const runtimeFrames=[];
  const savedGate=new Promise(resolve=>{resolveSaved=resolve});
  const runtimeRoot={
    value:'',
    get innerHTML(){return this.value},
    set innerHTML(value){this.value=String(value)},
    querySelector(selector){if(selector==='[data-places-map]')mapQueries++;return null},
    querySelectorAll(){return[]}
  };
  const runtimeContext={
    LuviaPlacesSpatialCompositionCoreV1:core,
    LuviaPlacesContractV1:{
      reads:{
        categories:()=>categories,
        listSaved:()=>savedGate,
        async recommend(){recommendCalls++;return{places:[]}}
      }
    },
    LuviaPlatformPorts:{
      get(id){
        if(id==='NetworkPort')return{isOnline:()=>true,subscribe:()=>()=>{}};
        return null;
      }
    },
    requestAnimationFrame(callback){runtimeFrames.push(callback);return runtimeFrames.length},
    matchMedia:()=>({matches:true}),
    document:{documentElement:{classList:{contains:()=>false}}}
  };
  vm.createContext(runtimeContext);
  vm.runInContext(experience,runtimeContext,{filename:'app/places/places-spatial-experience.js'});
  const pendingMount=runtimeContext.LuviaPlacesSpatialExperience.mount(runtimeRoot,{id:'trip-a',destination:{name:'Scharbeutz'}});
  runtimeContext.LuviaPlacesSpatialExperience.unmount();
  resolveSaved([]);
  assert.equal(await pendingMount,false,'an unmounted Places Experience must cancel its pending initialization');
  await Promise.resolve();
  assert.equal(recommendCalls,0,'an unmounted Places Experience must not start a late Places owner request');
  assert.equal(runtimeContext.LuviaPlacesSpatialExperience.diagnostics().status,'idle');

  assert.equal(await runtimeContext.LuviaPlacesSpatialExperience.mount(runtimeRoot,{id:'trip-b',destination:{name:'Scharbeutz'}}),true);
  for(let turn=0;turn<8;turn++)await Promise.resolve();
  assert.ok(runtimeFrames.length>=2,'mount plus initial search should exercise overlapping render frames');
  runtimeFrames.splice(0).forEach(callback=>callback());
  assert.equal(mapQueries,1,'superseded animation frames must not mount duplicate map instances into the current host');
  runtimeContext.LuviaPlacesSpatialExperience.unmount();

  console.log('M16.5N Productive Places Spatial Experience: PASS');
  console.log('Places result model: 6 initial / 18 maximum');
  console.log('Map markers: complete finite WGS84 places.v1 projections only');
  console.log('Places lifecycle: pending initialization cancels on unmount');
  console.log('Consumer Domain Truth ownership: NONE');
})().catch(error=>{
  console.error(error);
  process.exitCode=1;
});
