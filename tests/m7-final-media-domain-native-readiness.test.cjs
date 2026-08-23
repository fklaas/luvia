'use strict';

const assert=require('node:assert');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const domainSource=read('core/media/media-domain-contract-core.js');

for(const token of ['window.','globalThis','document.','navigator.','localStorage','sessionStorage','indexedDB','Supabase','client.from','storage.from']){
  assert(!domainSource.includes(token),`browserless Media Domain Core contains forbidden token: ${token}`);
}

const context={Object,Array,String,Number,Boolean,Date,Math,Set,Map,Promise,Error,TypeError};
vm.runInNewContext(domainSource,context,{filename:'media-domain-contract-core.js'});
const core=context.LuviaMediaDomainContractCoreV1;
assert(core,'browserless Media Domain Contract Core must install without a browser');
assert.strictEqual(core.version,'1');
assert.strictEqual(core.runtimeVersion,'1.0.0');

const raw={
  id:'m1',trip_id:'t1',user_id:'u1',participant_id:'p1',type:'image',purpose:'memory',source:'user_upload',
  original_name:'photo.jpg',display_name:'Paris',mime_type:'image/jpeg',storage_bucket:'private',storage_path:'t1/private.jpg',
  preview_path:'t1/preview.jpg',thumbnail_path:'t1/thumb.jpg',status:'ready',captured_at:'2026-08-01T10:00:00Z',
  latitude:48.85,longitude:2.35,file_size:123,content_hash:'secret',favorite:true,edit_settings:{brightness:105},
  metadata:{captureEvidence:{source:'exif'},resolvedLocation:{name:'Paris',providerPlaceId:'place-1'},secret:'hidden'},
  created_at:'2026-08-01T10:00:00Z',updated_at:'2026-08-01T10:01:00Z'
};
const owner=core.projectOwnerMedia(raw);
assert.strictEqual(owner.storagePath,'t1/private.jpg');
assert.strictEqual(owner.contentHash,'secret');
const publicMedia=core.projectPublicMedia(owner);
assert.strictEqual(publicMedia.id,'m1');
assert.strictEqual(publicMedia.participantId,'p1');
assert.strictEqual(publicMedia.captureEvidenceAvailable,true);
assert.strictEqual(publicMedia.resolvedLocation.name,'Paris');
for(const key of ['userId','storageBucket','storagePath','previewPath','thumbnailPath','contentHash','metadata']){
  assert.strictEqual(publicMedia[key],undefined,`public Media projection leaks ${key}`);
}
const realtime=core.projectRealtime({table:'media',event:'UPDATE',new:raw});
assert.strictEqual(realtime.scope,'media');
assert.strictEqual(realtime.media.id,'m1');

const initial=core.createUploadTask({id:'q1',mediaId:'m1',tripId:'t1',userId:'u1',body:{opaque:true},now:'2026-08-23T10:00:00Z'});
assert.strictEqual(initial.state,'queued');
assert.throws(()=>core.transitionUploadTask(initial,'completed'),/Invalid media upload transition/);
const uploading=core.transitionUploadTask(initial,'uploading',{updatedAt:'2026-08-23T10:00:01Z'});
assert.strictEqual(core.transitionUploadTask(uploading,'completed',{updatedAt:'2026-08-23T10:00:02Z'}).state,'completed');

const files={
  mediaCore:read('core/media/media-core.js'),
  contract:read('core/platform/media-contract-adapter.js'),
  ports:read('app/adapters/platform-port-adapters.mjs'),
  storage:read('app/adapters/media-storage-web-adapter.mjs'),
  legacyGallery:read('sync/gallery.js'),
  gallery:read('app/gallery-view.js'),
  diagnostics:read('core/diagnostics/media-readiness.js'),
  timeline:read('core/places/timeline-core.js'),
  clustering:read('core/media/media-clustering.js'),
  albums:read('core/media/memory-albums.js'),
  cards:read('core/media/memory-cards.js'),
  journeys:read('core/media/memory-journeys.js'),
  index:read('index.html'),
  paris:read('paris-official.html'),
  intelligence:read('intelligence/test.html'),
  sw:read('sw.js')
};

assert.strictEqual((files.mediaCore.match(/client\.storage\.from/g)||[]).length,0,'Media owner bypasses MediaStoragePort');
for(const method of ['upload','remove','download','createSignedUrl'])assert(files.mediaCore.includes(`mediaStorage().${method}`),`Media owner missing MediaStoragePort.${method}`);
assert(files.mediaCore.includes("platformPort('NetworkPort')"));
assert(files.mediaCore.includes("platformPort('LifecyclePort')"));
assert(files.mediaCore.includes('createUploadCoordinator'));
assert(files.mediaCore.includes("realtimeOwner:'media-core'"));
assert(files.mediaCore.includes("hydrationBoundary:'media.v1'"));

assert(!files.ports.includes('LuviaSupabase'),'device Platform adapter must not own Media remote storage');
assert(files.ports.includes('LifecyclePort:lifecyclePort'));
assert(files.ports.includes('subscribe(listener)'));
assert(files.storage.includes("registry.register('MediaStoragePort'"));
assert(files.storage.includes("indexedDB.open('luvia-media-upload-queue-v1'"));
for(const method of ['stageUpload','listStagedUploads','removeStagedUpload'])assert(files.storage.includes(method),`MediaStoragePort missing ${method}`);

assert.strictEqual((files.legacyGallery.match(/\bLuviaMediaCore\b/g)||[]).length,0,'legacy Gallery compatibility path retains private Media owner access');
for(const token of ['mediaReads().listMedia','mediaReads().getMedia','mediaReads().download','mediaReads().subscribe','mediaCommands().upload','mediaCommands().updateLegacyGallery','mediaCommands().remove']){
  assert(files.legacyGallery.includes(token),`legacy Gallery path missing public boundary: ${token}`);
}
assert(files.legacyGallery.includes("client.from('gallery_photos')"),'legacy Gallery fallback must remain separately readable');

assert(files.contract.includes("const RUNTIME_VERSION='1.2.0'"));
assert(files.contract.includes('LuviaMediaDomainContractCoreV1'));
assert(files.contract.includes('async function download(mediaId'));
assert(files.gallery.includes('if(result?.queued)queued++'));
for(const token of ['browserlessMediaDomainCore','mediaStoragePort','networkTransitions','lifecyclePort','backgroundUploadAdapterCapable','offlineQueueAdapterCapable']){
  assert(files.diagnostics.includes(token),`Media readiness missing ${token}`);
}

for(const surface of ['index','paris','intelligence']){
  assert(files[surface].includes('core/media/media-domain-contract-core.js')||files[surface].includes('../core/media/media-domain-contract-core.js'),`${surface} missing Media Domain Core`);
  assert(files[surface].includes('media-storage-web-adapter.mjs'),`${surface} missing Web MediaStoragePort adapter`);
}
for(const asset of ['core/media/media-domain-contract-core.js','app/adapters/media-storage-web-adapter.mjs'])assert(files.sw.includes(asset),`Service Worker missing ${asset}`);
assert(files.index.indexOf('media-domain-contract-core.js')<files.index.indexOf('media-core.js'));
assert(files.paris.indexOf('media-domain-contract-core.js')<files.paris.indexOf('media-core.js'));

assert.strictEqual((files.timeline.match(/\bLuviaMediaCore\b/g)||[]).length,2,'Timeline/Journey reservation changed');
assert.strictEqual((files.clustering.match(/\bLuviaMediaCore\b/g)||[]).length,2,'Media Clustering owner scope changed');
assert.strictEqual([files.albums,files.cards,files.journeys].reduce((sum,source)=>sum+(source.match(/\bLuviaMediaCore\b/g)||[]).length,0),4,'Memory owner-service scope changed');

(async()=>{
  const queue=new Map();
  let online=false;
  const executed=[];
  const coordinator=core.createUploadCoordinator({
    queue:{put:async task=>queue.set(task.id,task),list:async()=>[...queue.values()],remove:async id=>queue.delete(id)},
    network:{isOnline:()=>online,subscribe:()=>()=>{}},
    lifecycle:{subscribe:()=>()=>{}},
    execute:async task=>executed.push(task.mediaId),
    now:()=> '2026-08-23T10:00:00Z'
  });
  coordinator.start();
  await coordinator.enqueue({id:'q2',mediaId:'m2',tripId:'t1',userId:'u1',body:{opaque:true}});
  assert.strictEqual((await coordinator.snapshot()).total,1);
  assert.strictEqual((await coordinator.drain()).offline,true);
  online=true;
  const result=await coordinator.drain({force:true});
  assert.strictEqual(result.completed,1);
  assert.deepStrictEqual(executed,['m2']);
  assert.strictEqual((await coordinator.snapshot()).total,0);
  coordinator.stop();

  console.log('M7 FINAL Media Domain / Native Readiness: PASS');
  console.log('Browserless Media Domain Core: PASS');
  console.log('Media owner direct storage client refs: 7 -> 0');
  console.log('Legacy Gallery private Media Core refs: 10 -> 0');
  console.log('Timeline/Journey reservation: PRESERVED');
})().catch(error=>{
  console.error(error);
  process.exitCode=1;
});
