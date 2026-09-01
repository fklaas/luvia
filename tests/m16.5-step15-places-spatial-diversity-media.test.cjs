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
const spatialSource=read('app/places/places-spatial-experience.js');
const spatialCss=read('app/places/places-spatial-experience.css');
const platformAdapter=read('core/platform/places-contract-adapter.js');
const dashboard=read('core/ai/ai-dashboard-service.js');
const actionContractSource=read('core/intelligence/intelligence-action-contract-core.js');
const fixture=read('tests/fixtures/m16.5ab-living-compass-ai-browser.html');

const sandbox={Object,Array,Map,Set,Date,Math,Number,String,Boolean,RegExp,JSON,Promise,console};
sandbox.window=sandbox;sandbox.globalThis=sandbox;
vm.createContext(sandbox);
vm.runInContext(domainSource,sandbox,{filename:'places-domain-contract-core.js'});
vm.runInContext(globalSource,sandbox,{filename:'global-place-contracts.js'});
vm.runInContext(actionContractSource,sandbox,{filename:'intelligence-action-contract-core.js'});
const contracts=sandbox.LuviaGlobalPlaceContracts;
const actionContract=sandbox.LuviaIntelligenceActionContractCoreV1;

const german=contracts.spatialIntent('Restaurant in Scharbeutz, aber eher im Zentrum statt am Strand.');
assert.deepEqual(Array.from(german.prefer),['center']);
assert.deepEqual(Array.from(german.avoid),['waterfront']);
for(const request of [
  'A restaurant downtown, not on the beach',
  'Un restaurante en el centro, no en la playa',
  'Un restaurant au centre-ville, pas sur la plage',
  'Un ristorante in centro, non sulla spiaggia',
  'Um restaurante no centro, não na praia',
  'Een restaurant in het centrum, niet aan het strand'
]){
  const parsed=contracts.spatialIntent(request);
  assert.equal(parsed.prefer.includes('center'),true,`centre preference missing: ${request}`);
  assert.equal(parsed.avoid.includes('waterfront'),true,`waterfront exclusion missing: ${request}`);
}

const central={id:'central',providerPlaceId:'central',name:'Marktküche',formattedAddress:'Am Markt 7, Scharbeutz Zentrum',types:['restaurant']};
const beach={id:'beach',providerPlaceId:'beach',name:'Strandküche',formattedAddress:'Strandallee 1, Scharbeutz',types:['restaurant']};
const unknown={id:'unknown',providerPlaceId:'unknown',name:'Kleine Küche',formattedAddress:'Dorfstraße 3, Scharbeutz',types:['restaurant']};
assert.equal(contracts.spatialAssessment(central,german).state,'confirmed');
assert.equal(contracts.spatialAssessment(beach,german).state,'contradicted');
assert.equal(contracts.spatialAssessment(unknown,german).state,'unknown');
assert.equal(contracts.accepts(beach,'food','Restaurant im Zentrum statt am Strand',{}),false,'a provider-confirmed beach result must not survive a centre-not-beach constraint');
assert.equal(contracts.accepts(unknown,'food','Restaurant im Zentrum statt am Strand',{}),true,'unknown spatial evidence must remain visible rather than be invented or silently discarded');
assert.ok(contracts.queryCascade({text:'Restaurant im Zentrum statt am Strand',category:'food'},'Scharbeutz',{}).some(query=>/Stadtzentrum/.test(query)));
const projectedPlace=actionContract.normalizePlace({...central,spatialConstraint:contracts.spatialAssessment(central,german)});
assert.equal(projectedPlace.spatialConstraint.state,'confirmed','the bounded Places spatial evidence must survive the Intelligence owner projection');
assert.equal(projectedPlace.spatialConstraint.requested.prefer.includes('center'),true);
assert.equal(projectedPlace.spatialConstraint.requested.avoid.includes('waterfront'),true);

(async()=>{
  const calls=[];
  sandbox.LuviaPlaceEntities={searchPlaces:async options=>{
    calls.push(options);const index=calls.length;
    return{data:{places:[
      {id:'shared',providerPlaceId:'shared',name:'Kompass Küche',formattedAddress:'Am Markt 1, Scharbeutz Zentrum',types:['restaurant'],rating:4.9,userRatingCount:600,location:{latitude:54.025,longitude:10.75}},
      {id:`variant-${index}`,providerPlaceId:`variant-${index}`,name:`Zentrum Alternative ${index}`,formattedAddress:`Lindenstraße ${index}, Scharbeutz Zentrum`,types:['restaurant'],rating:4.5-index/100,userRatingCount:100+index,location:{latitude:54.024+index/10000,longitude:10.749+index/10000}}
    ]}};
  }};
  sandbox.LuviaAI=null;
  sandbox.LuviaIntelligenceContractV1=null;
  vm.runInContext(discoverySource,sandbox,{filename:'places-discovery-adapter.js'});
  const result=await sandbox.LuviaPlacesDiscoveryService.recommend({text:'Restaurant in Scharbeutz, eher im Zentrum statt am Strand',category:'food',destination:'Scharbeutz',candidateLimit:32,limit:3,spatialConstraints:german,diversity:{minimumQueryVariants:3,rotateAcrossQueries:true}});
  assert.ok(calls.length>=3,'deep Places discovery must query at least three semantic variants before accepting a three-card result');
  assert.equal(calls.every(call=>call.spatialConstraints?.avoid?.includes('waterfront')),true,'structured spatial constraints must reach every provider request');
  assert.equal(result.places.length,3);
  assert.equal(new Set(result.places.flatMap(place=>place.discoveryQueries||[])).size>=3,true,'the visible result must rotate across genuinely different query variants');
  assert.equal(result.places.every(place=>place.spatialConstraint?.state==='confirmed'),true);
  assert.ok(result.diversityMeta.queriedVariants>=3);
  assert.equal(result.diversityMeta.rotationAcrossQueries,true);

  const withoutShared=await sandbox.LuviaPlacesDiscoveryService.recommend({text:'Restaurant in Scharbeutz, eher im Zentrum statt am Strand',category:'food',destination:'Scharbeutz',candidateLimit:32,limit:3,rejectedProviderPlaceIds:['shared'],spatialConstraints:german,diversity:{minimumQueryVariants:3,rotateAcrossQueries:true}});
  assert.equal(withoutShared.places.some(place=>place.providerPlaceId==='shared'),false,'session-exposed provider ids must be excluded by the Places owner read');
  assert.equal(withoutShared.diversityMeta.rejectedProviderPlaceIds,1);

  assert.match(spatialSource,/function markerAnchor\(/);
  assert.match(spatialSource,/new globalThis\.maplibregl\.Marker\(\{element:projectionMarkerButton/);
  assert.match(spatialCss,/@keyframes lv-places-spatial-marker-float[\s\S]*translate:\s*0 -3px/);
  assert.match(spatialCss,/\.lv-places-spatial__marker:hover,[\s\S]*animation-play-state:\s*paused/);
  assert.match(spatialCss,/@media \(prefers-reduced-motion: reduce\)[\s\S]*\.lv-places-spatial__marker \{ animation: none; translate: none; \}/);
  const markerBlock=spatialCss.slice(spatialCss.indexOf('.lv-places-spatial__marker {'),spatialCss.indexOf('/* Exact cardinal colours'));
  assert.doesNotMatch(markerBlock,/(?:^|;)\s*transform\s*:/m,'the animated child marker may not overwrite MapLibre positioning');

  assert.match(platformAdapter,/Array\.isArray\(source\?\.photos\)\?source\.photos\[0\]/,'Places cards must resolve the exact first provider photo only through places.v1');
  assert.match(platformAdapter,/function photoProvider\(/);
  assert.match(platformAdapter,/return'Foursquare'/,'Foursquare media must retain its real provider attribution');
  assert.match(platformAdapter,/return'Google Maps'/,'Google media must retain its real provider attribution');
  assert.doesNotMatch(platformAdapter,/provider:'Google Maps'/,'media attribution may not be hard-coded to Google for every provider');
  assert.match(platformAdapter,/transient:true/);
  assert.doesNotMatch(dashboard,/Für diesen Ort ist noch kein verlässliches Foto verfügbar/,'missing media must not consume the card with a decorative pseudo-photo');
  assert.match(dashboard,/data-ai-place-media=/,'a provider result without trustworthy media must use the compact card and map treatment');
  assert.doesNotMatch(fixture,/Kontrollierte E2E-Bildreferenz|prototype-coast-bike|book-family-beach/,'the product fixture must not substitute approximate Landing imagery for an exact Place photo');
  assert.match(fixture,/window\.__fixtureImages=\{\}/,'the deterministic fixture must exercise the compact no-photo treatment when no exact provider image exists');
  assert.match(fixture,/rejectedProviderPlaceIds/,'visible fixture must exercise session diversity input');

  console.log('M16.5 Step 15 Places spatial intent, diversity, provider media and stable markers: PASS');
})().catch(error=>{console.error(error);process.exitCode=1});
