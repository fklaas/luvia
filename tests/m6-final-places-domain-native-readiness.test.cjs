'use strict';

const assert=require('node:assert');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const domainSource=read('core/places/places-domain-contract-core.js');

for(const token of ['window.','document.','navigator.','localStorage','sessionStorage','Supabase','LuviaPlaceEntities','LuviaAI']){
  assert.ok(!domainSource.includes(token),`browserless Places Domain Contract Core contains forbidden token: ${token}`);
}

const context={Object,Array,String,Number,Boolean,Date,Math,Set,Map,Error,TypeError};
vm.runInNewContext(domainSource,context,{filename:'places-domain-contract-core.js'});
const core=context.LuviaPlacesDomainContractCoreV1;
assert.ok(core,'browserless Places Domain Contract Core must install without a browser');
assert.strictEqual(core.version,'1');

const categories=core.categories();
assert.strictEqual(Object.keys(categories).length,14);
assert.ok(Object.isFrozen(categories));
assert.strictEqual(categories.food.label,'Essen & Trinken');
assert.strictEqual(categories.practical.label,'Praktisch unterwegs');
assert.strictEqual(core.categoryFor('Wir suchen ein ruhiges Hotel'),'accommodation');
assert.deepStrictEqual(JSON.parse(JSON.stringify(core.routeDiscovery({category:'nature'}))),{
  category:'nature',label:'Natur & Erholung',primaryType:'nature',domainTypes:['nature','activity'],includedType:'park',includedTypes:['park','garden','beach','hiking_area','natural_feature','spa'],excludedTypes:['store','hospital'],query:'Parks Gärten Natur Erholung'
});
assert.deepStrictEqual(JSON.parse(JSON.stringify(core.createDeepLink({category:'food',query:'Pasta'}))),{screen:'places',params:{category:'food',query:'Pasta'}});

const raw={id:'p1',providerPlaceId:'places/google-1',primaryType:'restaurant',name:'Test',rating:4.7,storageSecret:'hidden'};
const surface=core.create({
  search:async()=>({data:{places:[raw]}}),
  getPlace:()=>raw,
  listPlaces:()=>[raw],
  getDetails:async()=>raw,
  listSaved:async()=>[{place:raw,tripPlace:{id:'tp1',trip_id:'t1',status:'favorite',is_favorite:true}}],
  recommend:async()=>({places:[raw],plan:{ai:{fallback:false}}}),
  getLifecycle:()=> 'favorite'
});

const files={
  adapter:read('core/platform/places-contract-adapter.js'),
  discovery:read('app/adapters/places-discovery-adapter.js'),
  globalContracts:read('core/places/global-place-contracts.js'),
  finalUi:read('core/places/places-final-foundation.js'),
  presence:read('core/places/presence-visit-core.js'),
  locationBootstrap:read('core/location/global-location-bootstrap.js'),
  lifecycleResolver:read('core/places/place-lifecycle-resolver.js'),
  lifecycleService:read('core/places/place-lifecycle-service.js'),
  entityService:read('intelligence/place-entity-service.js'),
  ports:read('app/adapters/platform-port-adapters.mjs'),
  loader:read('app/luvia-runtime-loader.mjs'),
  index:read('index.html'),
  sw:read('sw.js'),
  intelligenceHarness:read('intelligence/test.html')
};

assert.ok(files.globalContracts.includes('LuviaPlacesDomainContractCoreV1.categories()'));
assert.ok(files.finalUi.includes('LuviaPlacesDomainContractCoreV1.categories()'));
assert.strictEqual((files.globalContracts.match(/food:\{key:/g)||[]).length,0,'Global contracts must not own a second category registry');
assert.strictEqual((files.finalUi.match(/food:\{icon:/g)||[]).length,0,'Places UI must not own a second category registry');

for(const token of ['sessionStorage','localStorage','window.open','LuviaPlaceEntities','LuviaAI','LuviaPlaceCollections','LuviaTripPlaceData']){
  assert.ok(!files.finalUi.includes(token),`Places category UI bypasses the M6 boundary: ${token}`);
}
assert.ok(files.finalUi.includes("placesContract().recommend"));
assert.ok(files.finalUi.includes("platformPort('OfflineCachePort')"));
assert.ok(files.finalUi.includes("platformPort('ExternalNavigationPort')"));

assert.ok(files.discovery.includes('LuviaPlaceEntities.searchPlaces'));
assert.ok(files.discovery.includes('LuviaAI.interpretDiscovery'));
assert.ok(files.discovery.includes('LuviaAI.rankCandidates'));
for(const token of ['navigator.','geolocation','LuviaTripContext','localStorage','sessionStorage']){
  assert.ok(!files.discovery.includes(token),`Places discovery owner service contains forbidden device/private Trip coupling: ${token}`);
}

for(const [name,source] of Object.entries({presence:files.presence,locationBootstrap:files.locationBootstrap,lifecycleResolver:files.lifecycleResolver,lifecycleService:files.lifecycleService})){
  assert.ok(!source.includes('navigator.'),`${name} still reads navigator directly`);
}
assert.ok(files.presence.includes("platformPort('LocationPort')"));
assert.ok(files.presence.includes("platformPort('PermissionPort')"));
assert.ok(files.presence.includes("platformPort('NetworkPort')"));
assert.ok(files.locationBootstrap.includes("registry?.get?.('LocationPort')"));

for(const port of ['LocationPort','PermissionPort','NetworkPort','DeepLinkPort','ExternalNavigationPort','OfflineCachePort']){
  assert.ok(files.ports.includes(`${port}:`),`Web platform adapter does not register ${port}`);
}
assert.ok(files.ports.includes('createPlatformPortRegistry'));

assert.ok(!files.entityService.includes('LuviaTripContext'));
assert.ok(files.entityService.includes('LuviaTripContractV1'));
for(const name of ['listSaved','recommend','categories','routeDiscovery','createDeepLink','openDiscovery']){
  assert.ok(files.adapter.includes(name),`places.v1 surface missing ${name}`);
}

for(const asset of ['app/adapters/platform-port-adapters.mjs','core/places/places-domain-contract-core.js','app/adapters/places-discovery-adapter.js']){
  assert.ok(files.index.includes(asset)||files.loader.includes(asset.replace(/^app\//,'')),`active runtime entry missing ${asset}`);
  assert.ok(files.sw.includes(asset),`sw.js missing ${asset}`);
}
assert.ok(files.intelligenceHarness.includes('../core/places/places-domain-contract-core.js'));
assert.ok(files.intelligenceHarness.includes('../app/adapters/places-discovery-adapter.js'));
assert.ok(files.index.indexOf('places-domain-contract-core.js')<files.index.indexOf('global-place-contracts.js'));
assert.ok(files.index.indexOf('global-place-contracts.js')<files.index.indexOf('places-discovery-adapter.js'));

(async()=>{
  const searched=await surface.search({query:'Test'});
  assert.strictEqual(searched.count,1);
  assert.strictEqual(searched.places[0].storageSecret,undefined);
  const saved=await surface.listSaved({tripId:'t1'});
  assert.strictEqual(saved[0].tripPlaceId,'tp1');
  assert.strictEqual(saved[0].isFavorite,true);
  const recommended=await surface.recommend({category:'food'});
  assert.strictEqual(recommended.count,1);
  assert.strictEqual(recommended.places[0].rating,4.7);
  assert.strictEqual(surface.getLifecycle({placeId:'p1'}),'favorite');
  console.log('M6 FINAL Places Domain Contract / Native Readiness: PASS');
  console.log('Canonical categories: 14 / 14');
  console.log('Direct navigator in locked Places device paths: 0');
  console.log('Places category UI private owner/device bypasses: 0');
})().catch(error=>{console.error(error);process.exitCode=1});
