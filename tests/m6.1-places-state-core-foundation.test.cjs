'use strict';

const assert=require('node:assert');
const fs=require('node:fs');
const vm=require('node:vm');

const read=path=>fs.readFileSync(path,'utf8');

const physicalCore=read('core/places/place-state-core.js');
const webAdapter=read('core/places/place-core.js');
const placesContract=read('core/platform/places-contract-adapter.js');
const index=read('index.html');
const serviceWorker=read('sw.js');
const consoleHtml=read('intelligence/console.html');
const testHtml=read('intelligence/test.html');

for(const [label,pattern] of [
  ['window',/\bwindow\b/],
  ['document',/\bdocument\b/],
  ['navigator',/\bnavigator\b/],
  ['localStorage',/\blocalStorage\b/],
  ['sessionStorage',/\bsessionStorage\b/],
  ['CustomEvent',/\bCustomEvent\b/],
  ['dispatchEvent',/\bdispatchEvent\b/],
  ['fetch',/\bfetch\s*\(/],
  ['supabase',/\bsupabase\b/i]
]){
  assert.strictEqual(
    (physicalCore.match(pattern)||[]).length,
    0,
    `Physical Places State Core must be browserless: ${label}`
  );
}

assert(physicalCore.includes('const records=new Map()'));
assert(physicalCore.includes('function register(place)'));
assert(physicalCore.includes('function update(id,patch={})'));
assert(physicalCore.includes('function list(filters={})'));

assert(webAdapter.includes('LuviaPlaceStateCoreV1.create'));
assert(!webAdapter.includes('const records=new Map()'));
assert(!webAdapter.includes('new Map('));

assert(placesContract.includes("const CONTRACT_ID='places.v1'"));
assert(placesContract.includes('async function search(options={})'));
assert(placesContract.includes('async function confirmVisit(placeId,patch={})'));

for(const source of [index,serviceWorker,consoleHtml,testHtml]){
  assert(source.includes('core/places/place-state-core.js'));
}

assert(
  index.indexOf('core/places/place-state-core.js')<
  index.indexOf('core/places/place-core.js')
);
assert(
  consoleHtml.indexOf('core/places/place-state-core.js')<
  consoleHtml.indexOf('core/places/place-core.js')
);
assert(
  testHtml.indexOf('core/places/place-state-core.js')<
  testHtml.indexOf('core/places/place-core.js')
);

const pureContext={console};
vm.createContext(pureContext);
vm.runInContext(physicalCore,pureContext);

const state=pureContext.LuviaPlaceStateCoreV1.create({
  now:()=> '2026-08-22T12:00:00.000Z',
  validate:place=>({
    valid:Boolean(place?.id&&place?.name),
    errors:place?.id&&place?.name?[]:['id oder name fehlt']
  }),
  normalize:(place,options)=>({
    ...place,
    primaryType:options.primaryType,
    roles:Array.isArray(place.roles)?place.roles:[],
    lifecycle:place.lifecycle||'discovered'
  })
});

state.register({
  id:'place-a',
  tripId:'trip-a',
  name:'Museum',
  primaryType:'attraction',
  roles:['photo_spot'],
  capabilities:['details'],
  lifecycle:'saved',
  createdAt:'2026-08-22T10:00:00.000Z'
});

state.register({
  id:'place-b',
  tripId:'trip-b',
  name:'Park',
  primaryType:'nature',
  roles:[],
  capabilities:[],
  lifecycle:'discovered',
  createdAt:'2026-08-22T10:30:00.000Z'
});

assert.strictEqual(state.size(),2);
assert.strictEqual(state.get('place-a').name,'Museum');
assert.strictEqual(state.list({tripId:'trip-a'}).length,1);
assert.strictEqual(state.list({role:'photo_spot'}).length,1);
assert.strictEqual(state.list({lifecycle:'saved'}).length,1);

const updated=state.update('place-a',{
  name:'Neues Museum',
  lifecycle:'visited'
});

assert.strictEqual(updated.name,'Neues Museum');
assert.strictEqual(updated.lifecycle,'visited');
assert.strictEqual(updated.createdAt,'2026-08-22T10:00:00.000Z');
assert.strictEqual(updated.updatedAt,'2026-08-22T12:00:00.000Z');
assert.strictEqual(state.update('missing',{}),null);
assert.strictEqual(state.remove('place-b'),true);
assert.strictEqual(state.size(),1);

assert.throws(
  ()=>state.register({id:'invalid'}),
  error=>error.code==='INVALID_PLACE'
);

const web={
  LuviaPlaceDomain:{
    TYPES:['restaurant','nature'],
    validate:place=>({
      valid:Boolean(place?.id&&place?.name),
      errors:place?.id&&place?.name?[]:['id oder name fehlt']
    }),
    normalize:(place,options)=>({
      ...place,
      primaryType:options.primaryType,
      roles:Array.isArray(place.roles)?place.roles:[],
      capabilities:Array.isArray(place.capabilities)?place.capabilities:[],
      lifecycle:place.lifecycle||'discovered'
    })
  },
  LuviaPlaceRegistry:{
    getAdapter:()=>null,
    getTypes:()=>['restaurant','nature'],
    diagnostics:()=>({registeredTypes:2})
  },
  LuviaPlaceEntities:{}
};

const adapterContext={console,window:web};
vm.createContext(adapterContext);
vm.runInContext(physicalCore,adapterContext);
vm.runInContext(webAdapter,adapterContext);

const api=web.LuviaPlaceCore;

assert.strictEqual(api,web.LuviaPlacesCore);
assert.deepStrictEqual(
  Object.keys(api).sort(),
  [
    'diagnostics',
    'getCapabilities',
    'getPlace',
    'getPlaceRoles',
    'getPlaceTypes',
    'getPlaces',
    'hasRole',
    'hydrateAll',
    'hydrateType',
    'importProviderPlace',
    'init',
    'normalizePlace',
    'recordVisit',
    'registerPlace',
    'removePlace',
    'search',
    'updateLifecycle',
    'updateLifecycleCloud',
    'updatePlace',
    'version'
  ]
);

api.registerPlace({
  id:'adapter-place',
  tripId:'adapter-trip',
  name:'Adapter Place',
  primaryType:'restaurant',
  roles:['food'],
  capabilities:['details'],
  lifecycle:'saved',
  createdAt:'2026-08-22T11:00:00.000Z'
},{normalized:true});

assert.strictEqual(api.getPlace('adapter-place').name,'Adapter Place');
assert.strictEqual(api.getPlaces({tripId:'adapter-trip'}).length,1);
assert.strictEqual(api.hasRole('adapter-place','food'),true);
assert.deepStrictEqual(api.getCapabilities('adapter-place'),['details']);
assert.strictEqual(api.updateLifecycle('adapter-place','visited').lifecycle,'visited');
assert.strictEqual(api.diagnostics().placeCount,1);
assert.strictEqual(api.removePlace('adapter-place'),true);
assert.strictEqual(api.diagnostics().placeCount,0);

console.log('M6.1 Places State Core Foundation: PASS');
