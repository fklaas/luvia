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
assert.equal(core.maxResults,80);
assert.deepEqual(plain(core.diagnostics()),{
  contractId:'consumer.places-spatial-composition.v1',
  version:'1',
  runtimeVersion:'1.5.0',
  sourceContract:'places.v1',
  browserless:true,
  deterministic:true,
  domainTruth:false,
  initialVisibleResults:6,
  maxResults:80,
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
  {key:'food',label:'Essen & Trinken',icon:'restaurant',primaryType:'restaurant',includedType:'',includedTypes:['restaurant','cafe'],query:'Restaurants Cafés',order:0},
  {key:'nature',label:'Natur & Erholung',icon:'leaf',primaryType:'nature',includedType:'',includedTypes:['park','beach'],query:'Parks Natur',order:1}
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
assert.equal(paginationModel.counts.total,22,'result model must not truncate the deduplicated multi-tile viewport below its available owner projections');
assert.equal(paginationModel.counts.visible,6,'initial result model must expose six entries');
assert.equal(paginationModel.counts.remaining,16);
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
  {id:'valid-provider-location',providerPlaceId:'places/google-hotel-1',name:'Hotel mit Google-Ort',location:{latitude:54.031,longitude:10.744}},
  {id:'missing',providerPlaceId:'missing-coordinate',name:'Nur in der Liste',coordinates:null},
  {id:'half',providerPlaceId:'half-coordinate',name:'Unvollständig',coordinates:{latitude:54.02}},
  {id:'bad-lat',providerPlaceId:'bad-latitude',name:'Ungültig',coordinates:{latitude:91,longitude:10.7}},
  {id:'bad-lng',providerPlaceId:'bad-longitude',name:'Ungültig',coordinates:{latitude:54.02,longitude:181}},
  {id:'nan',providerPlaceId:'nan-coordinate',name:'Ungültig',coordinates:{latitude:'abc',longitude:10.7}}
];
const coordinatesSnapshot=JSON.stringify(coordinatePlaces);
const coordinateModel=core.compose({contractId:'places.v1',categories,places:coordinatePlaces,visibleLimit:18,runtime:{status:'ready'}});
assert.equal(JSON.stringify(coordinatePlaces),coordinatesSnapshot,'Consumer composition mutated owner projections');
assert.equal(coordinateModel.results.length,8,'places without coordinates must remain available to the owner-safe projection');
assert.equal(coordinateModel.markers.length,3,'coordinates from coordinates, position, and provider location must create markers');
assert.equal(coordinateModel.mapOmissions.length,5);
assert.deepEqual(plain(coordinateModel.markers[0]),{
  providerPlaceId:'google-land-1',
  resultId:'place-result-1',
  name:'Diercksen',
  rank:1,
  preferred:false,
  latitude:54.0279115,
  longitude:10.7563139,
  lngLat:[10.7563139,54.0279115],
  sourceContract:'places.v1'
});
assert.deepEqual(plain(coordinateModel.markers[1].lngLat),[10.7575622,54.026911]);
assert.deepEqual(plain(coordinateModel.markers[2].lngLat),[10.744,54.031],'Google Places location coordinates must reach the map projection');
assert.ok(coordinateModel.markers.every(marker=>coordinateModel.results.some(result=>result.providerPlaceId===marker.providerPlaceId)));
assert.equal(new Set(coordinateModel.markers.map(marker=>marker.providerPlaceId)).size,coordinateModel.markers.length);
assert.ok(coordinateModel.mapOmissions.every(item=>item.reason==='missing-or-invalid-owner-coordinates'));
assert.equal(coordinateModel.policy.syntheticMarkers,false);
assert.equal(coordinateModel.policy.domainTruth,false);
assert.equal(coordinateModel.policy.coordinateOrder,'longitude-latitude');
assert.deepEqual(plain(core.compose({categories,places:coordinatePlaces,visibleLimit:18,runtime:{status:'ready'}})),plain(coordinateModel),'same owner projection must produce the same model');
assert.throws(()=>core.compose({sourceContract:'places.v2',places:[]}),/places\.v1/,'foreign/unversioned owner input must be rejected');

const preferencePlaces=Array.from({length:16},(_,index)=>({
  id:`fit-${index+1}`,
  providerPlaceId:`fit-${index+1}`,
  name:`Passender Ort ${index+1}`,
  coordinates:{latitude:54.02+index/1000,longitude:10.74+index/1000},
  groupFit:{score:index<13?34-index:0,coverage:index<13?0.35:0},
  preferenceReasons:index<13?['Belegtes Reisendenmerkmal']:[],
  preferenceConstraintState:index<12?'satisfied':index===12?'verify':null
}));
const preferenceModel=core.compose({places:preferencePlaces,visibleLimit:16,runtime:{status:'ready'}});
assert.deepEqual(plain(preferenceModel.markers.filter(marker=>marker.preferred).map(marker=>marker.providerPlaceId)),Array.from({length:12},(_,index)=>`fit-${index+1}`),'the map must mark every hard-gate-satisfied evidence match instead of truncating the cohort to five places');
assert.equal(preferenceModel.markers.find(marker=>marker.providerPlaceId==='fit-13').preferred,false,'unknown hard-requirement evidence must remain in Alle but never receive a Passend marker');
assert.equal(preferenceModel.markers.find(marker=>marker.providerPlaceId==='fit-14').preferred,false,'a marker without positive coverage and reasons must never be marked as personally fitting');
assert.equal(preferenceModel.policy.preferredMarkers,'all-positive-evidence-backed-hard-requirements-satisfied');
assert.equal(preferenceModel.policy.unknownEvidence,'visible-in-all-excluded-from-preferred');

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
const filterContracts=read('core/places/global-place-contracts.js');
const css=read('app/places/places-spatial-experience.css');
const shell=read('modules/places-shell.js');
const index=read('index.html');
const worker=read('sw.js');

for(const required of ['LuviaPlacesSpatialCompositionCoreV1','LuviaPlacesContractV1','.categories(','.recommend(','.listSaved(']){
  assert.ok(experience.includes(required),`productive Places Experience is missing public projection ${required}`);
}
assert.match(experience,/normalizeCategories\(contract\.reads\.categories\(\)\)/,'places.v1 category registries must be normalized before array-based Experience selection');
assert.match(experience,/\.getCard\(/,'compact Place media enrichment must use a public places.v1 read');
assert.doesNotMatch(experience,/if\(id\.startsWith\('geoapify:'\)\)return/,'selected Geoapify pins must reach the exact-place media path');
assert.match(experience,/getCard\(id,\{maxWidthPx:960,maxHeightPx:720,source:place\}\)/,'selected-pin media must preserve the search seed across a details read');
assert.match(experience,/consumer:places-spatial:v7-primary-cuisine-evidence/,'offline Places cache must invalidate cohorts that predate projected primary cuisine evidence');
assert.match(css,/\.lv-places-spatial__map-preview\{position:absolute/,'selected-pin preview must be contained by the map on every surface');
assert.match(css,/@media\(max-width:800px\)\{\.lv-places-spatial__map-preview\{position:absolute;bottom:12px/,'selected-pin preview must stay inside the map when the page scrolls');
for(const forbidden of [
  'LuviaPlaceCore','LuviaPlaceEntities','LuviaPlacesDomainContractCoreV1','LuviaPlaceDetails',
  'LuviaBookingUI','LuviaBookingCore','LuviaTripContext','LuviaTripStore','LuviaSupabaseService',
  'localStorage','sessionStorage','navigator.geolocation','navigator.onLine'
])assert.equal(experience.includes(forbidden),false,`productive Consumer Places Experience bypasses an owner/port boundary: ${forbidden}`);
assert.match(experience,/LuviaPlatformPorts/);
assert.match(experience,/NetworkPort/);
assert.match(experience,/ExternalNavigationPort/);
assert.doesNotMatch(experience,/href="\$\{esc\(value\.website\)\}"/,'external Place URLs may not become native navigation targets that bypass ExternalNavigationPort');
assert.match(experience,/navigationPort\.open\(url\)/,'external Place websites must be opened by ExternalNavigationPort');
assert.match(experience,/data-compact-place-card/,'Places results must use the compact new-shell card contract');
assert.match(experience,/function matchLabel\(place\)/,'compact cards must expose the personal ranking when available');
assert.match(experience,/function distanceLabel\(place\)/,'compact cards must expose useful distance facts');
assert.match(experience,/place\?\.distanceReference==='device'/,'distance facts must only be labeled as device distance when a real device-position reference exists');
assert.match(experience,/await openResultSheet\(\[findPlace\(id\)\]\.filter\(Boolean\),id\)/,'a direct result action must open only the exact Place in the shared sheet');
assert.match(experience,/reads\?\.searchViewport/,'viewport discovery must stay behind the public places.v1 owner contract');
assert.match(experience,/map\.on\('moveend',queueViewportSearch\)/,'panning or zooming must trigger a debounced live viewport read');
assert.doesNotMatch(experience,/map\.once\('idle',\(\)=>\{[^}]*map\.on\('moveend',queueViewportSearch\);queueViewportSearch\(\)/,'mounting the map must not spend a provider viewport read before deliberate map interaction');
assert.match(experience,/maxResultCount:PROVIDER_PAGE_SIZE,maxViewportResults:MAX_RESULTS/,'each viewport must combine four complete provider pages instead of a personalized 20-result subset');
assert.match(experience,/function preferredPlaceIds\(source=state\.results\)/,'the Passend mode must share the same evidence-backed cohort as the visible preferred pin markers');
assert.match(experience,/function mergeKnownPreferenceEvidence\(items,knownItems=state\.results\)/,'viewport refreshes must preserve richer preference evidence by immutable provider identity');
assert.match(experience,/features:\{\.\.\.\(known\.features\|\|\{\}\),\.\.\.\(place\.features\|\|\{\}\)\}/,'lean viewport payloads must not erase already verified provider features');
assert.doesNotMatch(experience,/preferredPlaceIds[\s\S]{0,800}\.slice\(0,5\)/,'Passend must not impose an arbitrary five-place ceiling');
assert.match(experience,/function ensureVisibleFitResults\(/,'map and list rendering must reuse evidence-based fit filtering');
assert.match(experience,/},350\)/,'viewport refresh must debounce duplicate user gesture events');
assert.match(experience,/place\?\.preferenceConstraintState==='satisfied'/,'Passend must require every applicable hard profile requirement to be positively satisfied');
assert.match(experience,/const searchProviders=\['auto'\]/,'every visible Places search, including dietary filters, must stay on the active free automatic cascade');
assert.match(experience,/const tripGeography=trip=>/,'Places search must send trip coordinates, not a destination name string');
assert.match(experience,/const geography=tripGeography\(state\.trip\)/,'recommend must build one geographic destination payload');
assert.match(experience,/destination:geography/,'recommend must receive a geographic destination payload');
assert.match(experience,/searchRadiusMeters/,'trip geography must expose a destination search radius');
assert.match(experience,/maxDistanceMeters:Number\(geography\.searchRadiusMeters\)\|\|3000/,'discovery must hard-cap distance to the trip destination');
assert.match(experience,/if\(fallbackCenter\)\{[\s\S]*?easeTo\(\{center:fallbackCenter\.lngLat,zoom:13/,'initial map frame must center the trip destination before fitting outlier pins');
assert.doesNotMatch(experience,/destination:destination\(state\.trip\)/,'a destination name string must not trigger Google destination.resolve');
assert.match(experience,/function applyCategory\(/,'category icons must select immediately without waiting for a full remount');
assert.match(experience,/const restored=restoreCategoryCohort\(def\.key,def\.query\)/,'category switches may reuse only the exact recent cohort for the requested category');
assert.match(experience,/replaceCategory:!restored/,'category switches must replace foreign results while an exact restored cohort stays visible during refresh');
assert.match(experience,/function clearVisibleCategoryResults\(/,'category switches must clear previous pins before the next search settles');
assert.match(experience,/function placeMatchesActiveCategory\(/,'map and viewport must gate pins against the active Places category');
assert.match(experience,/After a category switch, never keep foreign-category pins/,'failed category refresh must not restore restaurant pins under Aktivitäten');
assert.match(experience,/Labels follow the active search category/,'preview labels must follow the active category instead of type-guessing food first');
assert.match(experience,/\.filter\(place=>placeMatchesActiveCategory\(place,state\.category\)\)/,'recommend results must be category-gated before they become map pins');
assert.match(experience,/Do not reuse the category default query as a subject/,'category purity must not invent subject terms from the default category query');
assert.match(experience,/subjectText:state\.userQuery\|\|''/,'spatial recommend must pass empty subjectText for category browse');
assert.match(experience,/First paint always searches the trip destination only/,'initial search stays destination-scoped');
assert.match(experience,/if\(state\.onRootClick\)root\.removeEventListener\?\.\('click',state\.onRootClick\)/,'Places clicks must not stack duplicate category listeners after each render');
assert.match(experience,/candidateLimit:MAX_RESULTS,limit:MAX_RESULTS/,'the map must ask for a full Geoapify page instead of 12 pins');
assert.match(experience,/includedTypes:selectedTypes/,'multi-select type filters must reach recommend');
assert.match(css,/min-height:36px/,'category rows must be large enough to tap on a phone');
assert.match(css,/\.lv-places-spatial__map-preview\{position:absolute;bottom:12px/,'the mobile preview card must remain inside its map container');
assert.match(experience,/Map-first: do not fan out deep multi-query discovery/,'deep multi-query discovery must stay disabled after first useful map pins');
assert.doesNotMatch(experience,/shouldDeepen\?contract\.reads\.recommend\(\{\.\.\.request,fastPath:false/,'fast Places map paint must not automatically start a deep multi-query provider fan-out');
assert.doesNotMatch(experience,/enrichCards\(raw\.slice\(0,INITIAL_VISIBLE_RESULTS\)\),\s*contract\.reads\.recommend\(\{\.\.\.request,fastPath:false/,'a full fast result must not automatically multiply provider searches');
assert.match(experience,/decoratePreferences\(\(response\?\.places\|\|\[\]\)\.slice\(0,MAX_RESULTS\),state\.trip\)/,'initial Places results must receive preference decoration before Alle\/Passend filtering');
assert.match(experience,/!state\.fitOnly\|\|preferred\.has\(providerId\(place\)\)/,'Passend must actually remove non-matching pins instead of only changing the pressed toggle');
assert.match(experience,/classList\.toggle\('is-preferred',marker\.preferred===true\)/,'personal fit must be a pin marker and must not remove other provider results');
assert.match(css,/\.lv-places-spatial__marker\.is-preferred > b/,'a personally fitting pin must have a visible Compass marker');
assert.match(css,/\.lv-places-spatial__map-preview\{[^}]*position:absolute[^}]*max-width:min\(420px,calc\(100% - 24px\)\)/,'desktop preview bar must stay inside the map shell');
assert.match(css,/@media\(max-width:800px\)\{\.lv-places-spatial__map-preview\{position:absolute/,'mobile preview bar must remain inside the map shell');
assert.match(css,/\.lv-places-spatial__map-preview\{[^}]*border:2px solid transparent[^}]*conic-gradient\(from 0deg,#ef6254 0deg,#f4b34c 72deg,#2f8c73 154deg,#2c93a9 222deg,#756fa9 292deg,#a65f8f 328deg,#ef6254 360deg\) border-box/,'the selected-pin preview must carry the complete ordered Compass spectrum around its border');
assert.match(css,/@keyframes lv-places-preview-cue-wave/,'the three preview chevrons need their own motion rather than inheriting only the preview float');
assert.match(css,/nth-child\(3\)\{top:1px;animation-delay:0s\}/,'the upper chevron must lead the staggered rise');
assert.match(css,/nth-child\(2\)\{top:5px;animation-delay:\.12s\}/,'the middle chevron must follow at a fixed delay');
assert.match(css,/nth-child\(1\)\{top:9px;animation-delay:\.24s\}/,'the lower chevron must complete the staggered rise');
assert.doesNotMatch(experience,/projectionState\(container,'loading','Kartenausschnitt/,'a viewport refresh must never return the mounted map to its initial loading state');
assert.match(experience,/function mapProviderStateMarkup\(view\)/,'provider failures must render an explicit map-level unavailable state instead of a fake empty market');
assert.match(experience,/status\?\.kind==='error'/,'map projection must honor current provider error truth instead of reporting zero coordinate hits');
assert.match(experience,/pinBrowserHidden=view\.status\.kind==='error'/,'provider failure must not show a misleading 0/0 pin browser');
assert.match(css,/\.lv-places-spatial__map-provider-state/,'provider failure must expose a dedicated map overlay with retry');
assert.match(css,/\.lv-places-spatial__map-message[\s\S]{0,220}bottom:\s*14px/,'map status copy must stay clear of the top toolbar');
assert.match(experience,/projectionRefreshState\(container,true,'Neue Pins werden im Hintergrund geladen/,'viewport loading must use the non-blocking refresh state');
assert.match(experience,/projectionState\(container,updated\.markers\.length\?'ready':'empty'/,'an empty refreshed viewport must preserve the ready base map instead of hiding it');
assert.match(experience,/mapReady&&!map\.loaded\(\)/,'only an initial renderer failure may replace the not-yet-visible map');
assert.match(experience,/else if\(event\?\.error\)projectionRefreshState\(container,false/,'runtime tile errors must preserve the visible map and pins');
assert.match(experience,/nextMarkerInstances=new Map\(\)/,'new pins must be fully staged before the visible marker set is exchanged');
assert.match(css,/\.lv-places-spatial__map\[data-map-refreshing="true"\] \.lv-places-spatial__map-engine\s*\{\s*opacity:\s*1/,'the Places map engine must remain visible during a viewport refresh');
const hotelCss=read('modules/accommodations/accommodation-module.css');
const experienceCss=read('core/experience/experience-foundation.css');
assert.match(hotelCss,/\.hotel-map\[data-map-refreshing="true"\] \.hotel-map-engine\{opacity:1\}/,'the Hotel map engine must remain visible during the shared viewport refresh');
assert.match(experienceCss,/\.lvx-place-map\[data-map-refreshing="true"\] \.lvx-place-map-engine\{opacity:1\}/,'AI Place and Event maps must remain visible during the shared viewport refresh');
for(const removed of ['Details &amp; Evidenz','data-places-detail=','data-places-detail-region=','function detailMarkup','async function loadDetails'])assert.equal(experience.includes(removed),false,`old Places detail/evidence UI re-entered the new shell: ${removed}`);

assert.match(experience,/maplibregl/,'productive spatial surface must use the accepted geographic map renderer');
assert.match(experience,/\.setLngLat\(marker\.lngLat\)/,'MapLibre must receive the exact owner longitude/latitude tuple');
assert.match(experience,/new globalThis\.maplibregl\.Marker\(\{element:projectionMarkerButton\(marker,\{selectedId,onSelect\}\),anchor:'bottom',offset:\[0,-5\]\}\)/,'MapLibre markers must compensate the five-pixel visual tail without changing owner coordinates');
assert.match(experience,/\.fitBounds\(/,'map viewport must derive from coordinate-qualified result bounds');
assert.match(experience,/if\(renderToken===state\.renderToken\)mountMap\(view,renderToken\)/,'only the latest render may mount a MapLibre instance into the current map host');
assert.match(experience,/const current=\(\)=>alive&&container\.isConnected&&map/,'late MapLibre callbacks must be fenced to the live projection host');
assert.match(experience,/state\.map\.easeTo\(\{center:coordinates\.lngLat/,'selecting a result card must move the map to the same owner coordinate');
assert.doesNotMatch(experience,/button\.addEventListener\('click',[\s\S]{0,240}openResultSheet\(\[findPlace\(marker\.providerPlaceId\)/,'selecting a map marker must stop at the exact compact preview instead of opening a sheet');
assert.match(experience,/data-places-preview-open/,'the selected pin must expose one explicit compact-preview entry into details');
assert.match(experience,/data-places-preview-open value="\$\{esc\(providerId\(place\)\)\}"/,'the visible compact preview must carry the exact provider identity that the traveler sees');
assert.match(experience,/preview\.__luviaSelectedPlace=place\|\|null/,'the rendered compact preview must retain the exact Place snapshot it presents');
assert.match(experience,/gesturePlace=visiblePreviewPlace\(\)/,'the drag gesture must freeze the complete visible Place snapshot before viewport results can refresh');
assert.match(experience,/openSheet\(placesFromSnapshot\(place\),providerId\(place\),\{interactive:true,origin\}\)\?\.settle\?\.\(true\)/,'a preview click must morph the frozen visible Place snapshot rather than a concurrently replaced selection');
assert.match(experience,/function bindMapPreviewGesture\(preview,/,'the shared compact preview must own its click and direct-manipulation gesture');
assert.match(experience,/const beginInteractive=\(\)=>/,'the shared preview gesture must defer modal creation until the user actually drags upward');
assert.match(experience,/controller=openSheet\(placesFromSnapshot\(gesturePlace\),providerId\(gesturePlace\),\{interactive:true,origin:activationOrigin\|\|gestureOrigin\(\)\}\)/,'the real interactive result sheet must grow from the frozen preview geometry on the first upward pixel');
assert.match(experience,/if\(distance<1&&!controller\)return;if\(!controller&&!beginInteractive\(\)\)return/,'a tap must remain a tap while the first upward pixel starts direct manipulation');
assert.match(experience,/progress>=\.16\|\|releaseVelocity>\.34/,'the sheet must settle from a forgiving distance or upward-velocity threshold');
assert.match(experience,/distance\/Math\.min\(440,Math\.max\(220,innerHeight\*\.5\)\)/,'finger distance must map continuously to sheet progress on compact and large viewports');
assert.match(experience,/function warmProfileEvidence\(searchToken=state\.requestToken\)/,'a profile dietary requirement must start one bounded evidence read after the broad Alle cohort is visible');
assert.match(experience,/function mergeProfileEvidenceCohort\(cohort,evidenceRows,focus='Vegetarisch'\)/,'profile evidence must join the shared Alle/Passend cohort through one exact-identity owner helper');
assert.match(experience,/filter\(place=>focus==='Vegan'\?hasVeganProviderEvidence\(place\):hasVegetarianProviderEvidence\(place\)\)/,'only provider-evidenced dietary venues may extend the shared cohort');
assert.match(experience,/decoratePreferences\(mergeProfileEvidenceCohort\(state\.results,evidenceRows,focus\),state\.trip\)/,'a separately found positive dietary venue must enter the same cohort used by both Alle and Passend');
assert.match(experience,/parallelFastQueries:false,fastQueryLimit:1,queryVariantLimit:1/,'the profile evidence read must stay quota-bounded');
assert.match(experience,/strictPlaceType:evidenceType[\s\S]{0,500}providers:\['geoapify','openstreetmap','here','google','foursquare'\]/,'only the explicit profile-evidence read may start free Geoapify\/OSM, then HERE and the bounded exact-evidence providers after the retained cohort could not prove a fit');
assert.match(experience,/function transientDestinationFailure\(error\)/,'destination category reads must classify transient provider failures consistently');
assert.match(experience,/!state\.results\.length&&retryable&&!_retriedTransient/,'a blank category may retry a transient failure exactly once');
assert.match(experience,/state\.root\?\.dataset\)state\.root\.dataset\.state=state\.status;\s*state\.root\?\.setAttribute\?\.\('aria-busy',String\(state\.status==='loading'\)\)/,'a completed warm-start search must clear the visible region busy state without remounting the map');
assert.match(experience,/exact-normalized-name-and-max-25m-profile-evidence/,'cross-provider profile evidence requires an exact normalized name and a strict 25 m coordinate match');
assert.match(css,/\.lv-places-spatial__marker:is\(\.is-selected, \[aria-pressed="true"\]\)[\s\S]{0,180}scale: 1\.28/,'the current pin must be materially larger than its neighbors without taking MapLibre transform ownership');
assert.match(css,/\.lv-places-spatial__map-preview-cue i:nth-child\(3\)\{top:1px;animation-delay:0s\}/,'the upper preview chevron must start the independent rise sequence');
assert.match(css,/\.lv-places-spatial__map-preview-cue i:nth-child\(2\)\{top:5px;animation-delay:\.12s\}/,'the middle preview chevron must follow after the equal stagger');
assert.match(css,/\.lv-places-spatial__map-preview-cue i:nth-child\(1\)\{top:9px;animation-delay:\.24s\}/,'the lower preview chevron must complete the equal stagger');
assert.doesNotMatch(experience,/class="lv-places-spatial__results"/,'the productive Places map must not duplicate pins as a neighboring or following result list');
assert.match(experience,/data-places-map-fallback/,'the map must retain an honest bright fallback surface while tiles are unavailable');
assert.match(experience,/LuviaApp\?\.openCompass\?\.\('plan'\)/,'Places back navigation must restore the embedded Plan Compass');
assert.doesNotMatch(experience,/Math\.random|pin-a|pin-b|pin-c|pin-d|pin-e|map-land|map-sea/,'synthetic prototype pin placement may not enter the productive Experience');
assert.doesNotMatch(experience,/center\s*:\s*\[\s*10\.7554\s*,\s*54\.0267\s*\]/,'hard-coded prototype destination center may not become Product Truth');
assert.doesNotMatch(experience,/setLngLat\(\s*\[\s*\d+(?:\.\d+)?\s*,\s*\d+(?:\.\d+)?\s*\]\s*\)/,'literal demo marker coordinates may not enter the productive Experience');

for(const semantic of ['role="region"','aria-label','aria-live="polite"','aria-busy','ariaRole','aria-controls','aria-pressed']){
  assert.ok(experience.includes(semantic),`productive Places accessibility semantic missing: ${semantic}`);
}
assert.match(experience,/<label[^>]+for="places-map-query"/);
assert.match(experience,/<(?:input|textarea)[^>]+id="places-map-query"/);
assert.match(experience,/<input type="search" enterkeyhint="search"[^>]+id="places-map-query"/,'map search must submit from one minimal search field');
assert.match(experience,/<input type="search"[^>]+aria-label="Orte suchen"/,'the minimal search field must own its accessible name without a second visible label');
assert.doesNotMatch(experience,/<span class="sr-only">Orte suchen<\/span>/,'the map search must not depend on a shell-specific hidden-label utility');
assert.doesNotMatch(experience,/class="lv-places-spatial__map-query"[^>]*>[\s\S]{0,800}<button type="submit">Suchen<\/button>/,'map search must not add a large submit button');
assert.match(experience,/value="\$\{esc\(state\.userQuery\)\}"/,'the map search must display only an explicit free-text query, never the active category query');
assert.match(experience,/placeholder="Ort oder Wunsch suchen"/,'the one-line search must use a neutral category-independent prompt');
assert.match(experience,/data-places-map-panel-close/,'every compact map panel needs an explicit close affordance');
assert.match(experience,/data-place-map-shell\] \[data-places-map\][^\n]+setMapPanel\(null\)/,'tapping the free map surface must dismiss an open map panel');
assert.match(experience,/function mapCategoryMarkup\(categories\)/,'map category overlay must use a text-only projection');
assert.match(experience,/data-places-map-tool="search"/,'search must be a compact map-native control');
assert.match(experience,/data-places-map-tool="categories"/,'categories must be a compact map-native control');
assert.match(experience,/data-places-map-tool="filter"/,'filters must be a compact map-native control');
assert.doesNotMatch(experience,/lv-places-spatial__map-toolbar/,'fit mode, pin navigation and discovery tools must share one map toolbar');
assert.match(css,/\.lv-places-spatial__map-categories>button\{[^}]*border:0[^}]*background:transparent/,'map categories must render as a quiet text list rather than cards');
assert.match(css,/\.lv-places-spatial__map-panel \.lv-places-spatial__filter-panel button\{[^}]*border:0[^}]*background:transparent/,'map filters must render as quiet text choices rather than chips');
assert.match(experience,/data-places-filter-section/,'filters must start with compact hierarchical section names');
assert.match(experience,/data-places-filter-back/,'a filter detail list must replace the section list and provide a quiet return path');
assert.match(experience,/data-places-subtype-group/,'type and cuisine filters must retain their independent group identity');
assert.match(experience,/toggleFilterArray\('priceLevels'/,'price levels must support multi-selection');
assert.match(experience,/toggleFilterArray\(group/,'type and cuisine values must support multi-selection');
assert.match(experience,/LuviaGlobalPlaceContracts\?\.filterDefinitions/,'the visible filter UI must consume the canonical Places filter definition');
for(const cuisine of ['Mediterran','Griechisch','Französisch','Spanisch','Indisch','Chinesisch','Japanisch','Thailändisch','Vietnamesisch','Koreanisch','Mexikanisch','Libanesisch','Türkisch'])assert.ok(filterContracts.includes(cuisine),`expanded cuisine filter missing from the owner contract: ${cuisine}`);
assert.match(experience,/profileDietaryFocus/,'filtered discovery queries must continue to carry the active hard dietary preference');
assert.match(experience,/matchesTypeGroup\(place,state\.filters\.types\).*matchesTypeGroup\(place,state\.filters\.cuisines\)/,'local result projection must combine filter groups while allowing alternatives inside each group');
assert.match(experience,/class="lv-places-spatial__legend-trigger"[^>]+aria-describedby="places-map-legend"/,'the ranking legend must be available from its map icon by hover or keyboard focus');
assert.doesNotMatch(experience,/class="lv-places-spatial__context"/,'the oversized explanatory context card must not remain outside the map');
assert.doesNotMatch(experience,/class="lv-places-spatial__search"/,'the old full-width search bar must not remain outside the map');
assert.match(experience,/createElement\(['"]button['"]\)/,'map markers must be native buttons');
assert.doesNotMatch(experience,/data-places-map[^>]+role="img"/,'the map container may not hide its interactive marker descendants behind role="img"');
assert.match(experience,/data-places-map[^>]+role="group"/,'the interactive map must expose its marker controls as an accessible group');
assert.match(experience,/marker\.setAttribute\('aria-pressed',String\(selected\)\)/,'marker selection changes must update their programmatic pressed state');
assert.match(experience,/card\.setAttribute\('aria-current',String\(selected\)\)/,'result selection changes must update their programmatic current state');
assert.match(experience,/card\.querySelector\('\[data-places-select\]'\)\?\.setAttribute\('aria-pressed',String\(selected\)\)/,'marker selection must expose the corresponding result-card control as pressed');
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
for(const file of ['tests/fixtures/m16.5r-places-continuity-browser.html','tests/m16.5r-places-detail-continuity-e2e.cjs']){
  assert.equal(fs.existsSync(path.join(ROOT,file)),true,`M16.5R real-browser continuity evidence missing: ${file}`);
}
const ownership=read('docs/modularization/FILE-OWNERSHIP.csv');
assert.match(ownership,/tests\/fixtures\/m16\.5r-places-continuity-browser\.html/);
assert.match(ownership,/tests\/m16\.5r-places-detail-continuity-e2e\.cjs/);
assert.match(read('tests/m16.5r-places-detail-continuity-e2e.cjs'),/Rail scroll retained/,'real Edge evidence must measure the exact horizontal result context');
assert.match(read('tests/m16.5r-places-detail-continuity-e2e.cjs'),/mapInstances,1/,'real Edge evidence must prove detail loading does not rebuild the map');
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
    LuviaPlacesDomainContractCoreV1:{categories:()=>categories},
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
    setTimeout,
    clearTimeout,
    requestAnimationFrame(callback){runtimeFrames.push(callback);return runtimeFrames.length},
    matchMedia:()=>({matches:true}),
    document:{documentElement:{classList:{contains:()=>false}}}
  };
  runtimeContext.window=runtimeContext;
  vm.createContext(runtimeContext);
  vm.runInContext(filterContracts,runtimeContext,{filename:'core/places/global-place-contracts.js'});
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
  console.log('Places result model: 6 initial / 80 deduplicated viewport results maximum');
  console.log('Map markers: complete finite WGS84 places.v1 projections only');
  console.log('Places lifecycle: pending initialization cancels on unmount');
  console.log('Consumer Domain Truth ownership: NONE');
})().catch(error=>{
  console.error(error);
  process.exitCode=1;
});
