'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const read=path=>fs.readFileSync(path,'utf8');
const projectionPath='core/places/place-runtime-projection-core.js';
const storePath='core/places/place-runtime-store.js';
const collectionPath='core/places/place-collection-service.js';
const projectionSource=read(projectionPath);
const storeSource=read(storePath);
const collectionSource=read(collectionPath);

const forbidden=[
  'window',
  'document',
  'navigator',
  'localStorage',
  'sessionStorage',
  'CustomEvent',
  'addEventListener',
  'dispatchEvent',
  'location',
  'Supabase',
  'LuviaTrip',
  'LuviaPlaceEntities'
];

for(const token of forbidden){
  assert.equal(
    projectionSource.includes(token),
    false,
    `${projectionPath} must remain browserless/runtime-neutral: ${token}`
  );
}

assert.equal(
  (storeSource.match(/new Map\s*\(/g)||[]).length,
  0,
  'Web runtime adapter must not own projection maps'
);
assert.match(storeSource,/LuviaPlaceRuntimeProjectionCoreV1\.create/);
assert.match(storeSource,/luvia:place-runtime-changed/);
assert.match(storeSource,/luvia:trip-changed/);

assert.equal(
  (collectionSource.match(/new Map\s*\(/g)||[]).length,
  1,
  'Collection service may retain only its in-flight command map'
);
assert.match(collectionSource,/const pending=new Map\(\)/);
assert.doesNotMatch(collectionSource,/const records=new Map\(\)/);
assert.doesNotMatch(collectionSource,/records\.(?:set|get|values|size)/);
assert.match(collectionSource,/return runtime\(\)\.ingest\(placeType,items,trip\)/);
assert.match(collectionSource,/return runtime\(\)\.find\(/);
assert.match(collectionSource,/runtime\(\)\.favorites\(placeType,id\)/);
assert.doesNotMatch(projectionSource,/Timeline|Journey/);
assert.doesNotMatch(collectionSource,/LuviaTimeline|Journey/);

function loadProjection(context={}){
  const sandbox=vm.createContext(context);
  vm.runInContext(projectionSource,sandbox,{filename:projectionPath});
  return sandbox;
}

function rawEntity({
  tripId='trip-a',
  tripPlaceId='tp-a',
  placeId='place-a',
  providerPlaceId='provider-a',
  type='restaurant',
  status='favorite',
  favorite=true
}={}){
  return {
    place:{
      id:placeId,
      provider_place_id:`places/${providerPlaceId}`,
      primary_type:type,
      name:providerPlaceId
    },
    tripPlace:{
      id:tripPlaceId,
      trip_id:tripId,
      type,
      status,
      is_favorite:favorite
    }
  };
}

async function main(){
  let clock=100;
  const changes=[];
  const sandbox=loadProjection();
  const core=sandbox.LuviaPlaceRuntimeProjectionCoreV1.create({
    now:()=>++clock,
    onChange:change=>changes.push(change)
  });

  assert.equal(core.version,'1');
  assert.deepEqual(
    Object.keys(core),
    [
      'version','setActiveTrip','ingest','upsert','patch','find','records',
      'favorites','setData','getData','clearTrip','snapshot','subscribe',
      'normalizeEntity','normalizeStatus','diagnostics'
    ]
  );

  core.setActiveTrip('trip-a');
  const first=rawEntity({status:'favorited'});
  const second=rawEntity({
    tripPlaceId:'tp-b',
    placeId:'place-b',
    providerPlaceId:'provider-b',
    status:'saved',
    favorite:false
  });
  core.ingest('restaurant',[first,second],'trip-a');

  const byTripPlace=core.find({
    tripId:'trip-a',
    placeType:'restaurant',
    tripPlaceId:'tp-a'
  });
  const byProvider=core.find({
    tripId:'trip-a',
    placeType:'restaurant',
    providerPlaceId:'places/provider-a'
  });
  assert.equal(byTripPlace,byProvider,'both indexes must reference one record');
  assert.equal(byTripPlace.status,'favorite','status aliases must normalize once');
  assert.equal(core.records('restaurant','trip-a').length,2);
  assert.equal(core.favorites('restaurant','trip-a').length,1);

  const patched=core.patch({
    tripId:'trip-a',
    placeType:'restaurant',
    tripPlaceId:'tp-a'
  },{isFavorite:false,status:'discovered'});
  assert.equal(patched.isFavorite,false);
  assert.equal(patched.status,'discovered');
  assert.equal(first.tripPlace.is_favorite,false);
  assert.equal(core.favorites('restaurant','trip-a').length,0);

  const explicitProjection=core.upsert({
    tripId:'trip-a',
    placeType:'restaurant',
    tripPlaceId:'tp-a',
    providerPlaceId:'provider-a',
    placeId:'place-a',
    isFavorite:true,
    status:'planned',
    entity:{place:first.place,tripPlace:{id:'tp-a'}}
  });
  assert.equal(explicitProjection.isFavorite,true);
  assert.equal(explicitProjection.status,'planned');

  core.setData({
    tripId:'trip-a',
    placeType:'restaurant',
    tripPlaceId:'tp-a',
    data:{planned_at:'2026-08-23T12:00:00Z'}
  });
  assert.equal(
    core.getData({tripId:'trip-a',placeType:'restaurant',tripPlaceId:'tp-a'}).planned_at,
    '2026-08-23T12:00:00Z'
  );
  assert.equal(core.snapshot('trip-a').types.restaurant.records.length,2);
  assert.ok(changes.length>=4);

  core.setActiveTrip('trip-b');
  assert.equal(core.snapshot().activeTripId,'trip-b');
  assert.equal(core.snapshot().types.restaurant,undefined);
  assert.equal(core.snapshot('trip-a').types.restaurant.records.length,2);
  core.clearTrip('trip-a');
  assert.equal(core.snapshot('trip-a').types.restaurant,undefined);

  const browserEvents=[];
  const browserListeners={};
  class CustomEvent{
    constructor(type,options={}){this.type=type;this.detail=options.detail;}
  }
  const browserWindow={
    addEventListener(type,listener){browserListeners[type]=listener;},
    dispatchEvent(event){browserEvents.push(event);return true;}
  };
  const browserSandbox=loadProjection({
    window:browserWindow,
    CustomEvent,
    console
  });
  vm.runInContext(storeSource,browserSandbox,{filename:storePath});
  const runtime=browserWindow.LuviaPlaceRuntime;
  assert.deepEqual(
    Object.keys(runtime),
    [
      'version','setActiveTrip','ingest','upsert','patch','find','records',
      'favorites','setData','getData','clearTrip','snapshot','subscribe',
      'normalizeEntity','diagnostics'
    ],
    'Web compatibility surface must remain unchanged'
  );
  browserListeners['luvia:trip-changed']({detail:{tripId:'trip-web'}});
  runtime.ingest('shopping',[rawEntity({
    tripId:'trip-web',
    tripPlaceId:'tp-web',
    placeId:'place-web',
    providerPlaceId:'provider-web',
    type:'shopping'
  })],'trip-web');
  assert.equal(runtime.records('shopping','trip-web').length,1);
  assert.ok(browserEvents.some(event=>event.type==='luvia:place-runtime-changed'));
  assert.equal(runtime.diagnostics().browserlessState,true);
  assert.equal(runtime.diagnostics().singleSnapshot,true);

  const collectionEvents=[];
  const documentListeners={};
  const collectionWindow={
    addEventListener(){},
    dispatchEvent(event){collectionEvents.push(event);return true;},
    LuviaTripContractV1:{getActiveTrip:()=>({tripId:'trip-collection'})},
    LuviaPlaceEntities:{
      async importPlace(){throw new Error('unexpected import');},
      async updateLifecycle(tripPlaceId,status,patch,{tripId}){
        return {
          ok:true,
          data:{
            entity:rawEntity({
              tripId,
              tripPlaceId,
              placeId:'place-collection',
              providerPlaceId:'provider-collection',
              status,
              favorite:patch.isFavorite
            })
          }
        };
      }
    }
  };
  const collectionDocument={
    querySelectorAll(){return[];},
    addEventListener(type,listener){documentListeners[type]=listener;}
  };
  const collectionSandbox=loadProjection({
    window:collectionWindow,
    document:collectionDocument,
    CustomEvent,
    console
  });
  vm.runInContext(storeSource,collectionSandbox,{filename:storePath});
  vm.runInContext(collectionSource,collectionSandbox,{filename:collectionPath});
  const collections=collectionWindow.LuviaPlaceCollections;
  const collectionEntity=rawEntity({
    tripId:'trip-collection',
    tripPlaceId:'tp-collection',
    placeId:'place-collection',
    providerPlaceId:'provider-collection'
  });
  collections.remember('restaurant',[collectionEntity],'trip-collection');
  assert.equal(collections.diagnostics().registered,1);
  assert.equal(collections.diagnostics().singleRuntimeProjection,true);
  assert.equal(
    collections.findRecord({
      tripId:'trip-collection',
      placeType:'restaurant',
      tripPlaceId:'tp-collection'
    }),
    collectionWindow.LuviaPlaceRuntime.find({
      tripId:'trip-collection',
      placeType:'restaurant',
      tripPlaceId:'tp-collection'
    })
  );

  await collections.setFavorite({
    tripId:'trip-collection',
    placeType:'restaurant',
    tripPlaceId:'tp-collection',
    providerPlaceId:'provider-collection',
    isFavorite:false
  });
  assert.equal(
    collectionWindow.LuviaPlaceRuntime.find({
      tripId:'trip-collection',
      placeType:'restaurant',
      tripPlaceId:'tp-collection'
    }).isFavorite,
    false
  );
  assert.ok(collectionEvents.some(event=>event.type==='luvia:place-collection-changed'));

  const index=read('index.html');
  const sw=read('sw.js');
  const intelligenceTest=read('intelligence/test.html');
  for(const source of [index,sw,intelligenceTest]){
    assert.ok(
      source.indexOf('place-runtime-projection-core.js')<source.indexOf('place-runtime-store.js'),
      'projection core must load before its Web adapter'
    );
  }

  console.log('M6.2 Places Runtime Projection Core: PASS');
  console.log('Collection Place/TripPlace record maps: 0');
  console.log('Web runtime projection maps: 0');
  console.log('Physical runtime projection core browser tokens: 0');
}

main().catch(error=>{
  console.error(error);
  process.exitCode=1;
});
