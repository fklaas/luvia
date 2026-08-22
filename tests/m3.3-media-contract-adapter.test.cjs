const fs=require('fs');
const path=require('path');
const vm=require('vm');
const assert=require('assert');

const root=path.resolve(__dirname,'..');
const adapterPath=path.join(
  root,
  'core/platform/media-contract-adapter.js'
);

assert(
  fs.existsSync(adapterPath),
  'M3.3 RED: media-contract-adapter.js does not exist yet'
);

const source=fs.readFileSync(adapterPath,'utf8');

for(const forbidden of [
  'LuviaSupabase',
  'ParisSupabase',
  'LuviaOpenAIProvider',
  'LuviaMediaClustering',
  "from('media')",
  'memory_cards',
  '.storage.'
]){
  assert(
    !source.includes(forbidden),
    `forbidden internal leaked into adapter: ${forbidden}`
  );
}

const listeners=new Map();
const dispatched=[];

const window={
  LuviaGlobalContracts:{
    registrations:[],
    register(entry){
      this.registrations.push(entry);
    }
  },

  addEventListener(name,handler){
    const group=listeners.get(name)||[];
    group.push(handler);
    listeners.set(name,group);
  },

  dispatchEvent(event){
    dispatched.push(event);
    return true;
  }
};

class CustomEvent{
  constructor(type,options={}){
    this.type=type;
    this.detail=options.detail;
  }
}

const rawMedia={
  id:'m1',
  tripId:'t1',
  userId:'u1',
  participantId:'p1',
  type:'photo',
  purpose:'gallery',
  source:'upload',
  displayName:'Photo',
  mimeType:'image/jpeg',
  status:'ready',
  storageBucket:'luvia-media',
  storagePath:'t1/a.jpg',
  previewPath:'t1/p.jpg',
  thumbnailPath:'t1/t.jpg',
  contentHash:'secret',
  metadata:{
    secret:true,
    renderedPreviewPath:'t1/rendered.jpg',
    mediaKind:'photo',
    captureEvidence:{source:'exif'},
    metadataAutoCheckedAt:'2026-08-22T00:00:00Z',
    resolvedLocation:{
      name:'Paris',
      address:'Paris, France',
      providerPlaceId:'place-1',
      secret:'hidden'
    },
    captureLocation:{name:'Camera location'}
  },
  favorite:true,
  editSettings:{
    brightness:112,
    frame:'polaroid',
    overlays:[{
      type:'text',
      value:'Paris',
      x:.5,
      y:.4,
      size:.1,
      rotation:0,
      schema:'image-v2',
      secret:'hidden'
    }]
  },
  width:100,
  height:80,
  fileSize:123,
  placeId:'pl1'
};

window.LuviaMediaCore={
  async list(){
    return [rawMedia];
  },

  async get(id){
    return id==='m1'?rawMedia:null;
  },

  async signedUrl(item,ttl){
    assert.strictEqual(item,rawMedia);
    return `preview:${ttl}`;
  },

  async signedOriginalUrl(item,ttl){
    assert.strictEqual(item,rawMedia);
    return `original:${ttl}`;
  },

  async upload(){
    return {
      entity:rawMedia,
      duplicate:false
    };
  },

  async update(){
    return rawMedia;
  },

  async reanalyze(){
    return rawMedia;
  },

  async toggleFavorite(){
    return rawMedia;
  },

  async setPolaroid(mediaId,dayKey){
    return {
      media_id:mediaId,
      day_key:dayKey
    };
  },

  async linkPlace(mediaId,placeId){
    return {
      media_id:mediaId,
      place_id:placeId
    };
  },

  async remove(){
    return true;
  },

  async listPolaroids(){
    return {'2026-08-22':'m1'};
  },

  async subscribe(callback){
    callback({
      table:'media',
      eventType:'UPDATE',
      new:{
        ...rawMedia,
        displayName:undefined,
        display_name:'Updated Photo',
        storage_path:'SECRET'
      }
    });
    return async()=>{};
  },

  async saveRenderedPreview(mediaId,blob,options){
    assert.strictEqual(mediaId,'m1');
    assert(blob instanceof Blob);
    assert.strictEqual(options.displayName,'Edited');
    assert.strictEqual(options.editSettings.frame,'polaroid');
    assert.strictEqual(options.metadataPatch,undefined);
    return rawMedia;
  },

  async clearTripGallery(options={}){
    options.onProgress?.('clearing');
    return {
      tripId:'t1',
      count:1,
      albumCount:2,
      clusterCount:3,
      secret:'hidden'
    };
  }
};

window.LuviaMemoryAlbums={
  async list(){
    return [{
      id:'a1',
      trip_id:'t1',
      source_cluster_id:'c1',
      title:'Album',
      metadata:{secret:true}
    }];
  },

  async save(input){
    return {
      id:'a2',
      trip_id:'t1',
      title:input.title
    };
  },

  async remove(){
    return true;
  },

  async setFavorite(albumId,mediaId){
    return {
      album_id:albumId,
      media_id:mediaId
    };
  },

  async saveContribution(){
    return {id:'co1'};
  }
};

window.LuviaMemoryCards={
  async list(){
    return [{
      id:'c1',
      trip_id:'t1',
      card_type:'story',
      content:'Story',
      metadata:{secret:true}
    }];
  },

  async save(input){
    return {
      id:'c2',
      trip_id:'t1',
      card_type:input.cardType||'story'
    };
  },

  async setWeight(){
    return {
      id:'c1',
      trip_id:'t1',
      card_type:'story',
      weight:2
    };
  },

  async dismiss(){
    return true;
  },

  async setAlbumReview(cardId,decision){
    return {
      card_id:cardId,
      decision
    };
  },

  async saveAlbumVotes(){
    return [];
  },

  async updateStory(){
    return {
      id:'c1',
      trip_id:'t1',
      card_type:'story'
    };
  },

  async syncPhotoCandidates(){
    return true;
  },

  async saveTitleProposal(clusterId,title){
    return {
      cluster_id:clusterId,
      title
    };
  },

  async dissolveStack(){
    return true;
  }
};

window.LuviaMemoryJourneys={
  async list(){
    return [{
      id:'j1',
      trip_id:'t1',
      title:'Journey',
      cover_media_id:'m1',
      metadata:{secret:true}
    }];
  },

  async save(input){
    return {
      id:'j2',
      trip_id:'t1',
      title:input.title
    };
  },

  async saveContribution(){
    return {id:'co2'};
  },

  async remove(){
    return true;
  }
};

const context={
  window,
  CustomEvent,
  Blob:global.Blob,
  console,
  Object,
  Boolean,
  Number,
  String,
  Array,
  Error
};

vm.createContext(context);

vm.runInContext(
  source,
  context,
  {
    filename:'media-contract-adapter.js'
  }
);

const api=window.LuviaMediaContractV1;

assert(api);

assert.strictEqual(
  window.LuviaMediaContract,
  api
);

assert.strictEqual(
  api.contractId,
  'media.v1'
);

assert.strictEqual(
  api.version,
  '1'
);

assert.strictEqual(
  api.runtimeVersion,
  '1.1.0'
);

assert(
  Object.isFrozen(api)
);

assert.deepStrictEqual(
  [...api.events],
  [
    'media.changed',
    'media.deleted',
    'media.polaroid.changed',
    'memory.changed'
  ]
);

assert.deepStrictEqual(
  Object.keys(api.reads),
  [
    'listMedia',
    'getMedia',
    'signedUrl',
    'signedOriginalUrl',
    'listPolaroids',
    'subscribe',
    'listAlbums',
    'listCards',
    'listJourneys'
  ]
);

assert.deepStrictEqual(
  Object.keys(api.commands),
  [
    'media',
    'albums',
    'cards',
    'journeys'
  ]
);

assert.deepStrictEqual(
  Object.keys(api.commands.media),
  [
    'upload',
    'update',
    'reanalyze',
    'toggleFavorite',
    'setPolaroid',
    'linkPlace',
    'remove',
    'saveRenderedPreview',
    'clearGallery'
  ]
);

assert(
  !Object.prototype.hasOwnProperty.call(
    api.commands.media,
    'clearTripGallery'
  )
);

(async()=>{

  const media=await api.listMedia();

  assert(
    Object.isFrozen(media)
  );

  assert(
    Object.isFrozen(media[0])
  );

  assert.strictEqual(
    media[0].id,
    'm1'
  );

  for(const leak of [
    'storageBucket',
    'storagePath',
    'previewPath',
    'thumbnailPath',
    'contentHash',
    'metadata',
    'userId'
  ]){
    assert.strictEqual(
      media[0][leak],
      undefined,
      `media projection leaked ${leak}`
    );
  }

  assert.strictEqual(
    await api.signedUrl('m1',120),
    'preview:120'
  );

  assert.strictEqual(
    await api.signedOriginalUrl('m1',240),
    'original:240'
  );

  assert.strictEqual(
    media[0].renderedPreviewAvailable,
    true
  );

  assert.strictEqual(
    media[0].mediaKind,
    'photo'
  );

  assert.strictEqual(
    media[0].captureEvidenceAvailable,
    true
  );

  assert.strictEqual(
    media[0].metadataAutoChecked,
    true
  );

  assert.deepStrictEqual(
    {...media[0].resolvedLocation},
    {
      name:'Paris',
      address:'Paris, France',
      providerPlaceId:'place-1',
      primaryType:null,
      status:null,
      source:null,
      distanceMeters:null,
      confidence:null
    }
  );

  assert.strictEqual(
    media[0].resolvedLocation.secret,
    undefined
  );

  assert.strictEqual(media[0].editSettings.frame,'polaroid');
  assert.strictEqual(media[0].editSettings.overlays[0].value,'Paris');
  assert.strictEqual(media[0].editSettings.overlays[0].secret,undefined);
  assert(Object.isFrozen(media[0].editSettings.overlays));
  assert(Object.isFrozen(media[0].editSettings.overlays[0]));

  assert.deepStrictEqual(
    {...await api.listPolaroids()},
    {'2026-08-22':'m1'}
  );

  let realtime=null;
  const unsubscribe=await api.subscribe(
    payload=>{realtime=payload;}
  );

  assert.strictEqual(
    realtime.scope,
    'media'
  );

  assert.strictEqual(
    realtime.media.displayName,
    'Updated Photo'
  );

  assert.strictEqual(
    realtime.media.storagePath,
    undefined
  );

  assert.strictEqual(
    typeof unsubscribe,
    'function'
  );

  const saved=await api.commands.media.saveRenderedPreview(
    'm1',
    new Blob(['image']),
    {
      displayName:'Edited',
      editSettings:{frame:'polaroid'},
      metadataPatch:{secret:'forbidden'}
    }
  );

  assert.strictEqual(saved.id,'m1');

  let progress='';
  const cleared=await api.commands.media.clearGallery({
    onProgress:value=>{progress=value;}
  });

  assert.strictEqual(progress,'clearing');
  assert.deepStrictEqual(
    {...cleared},
    {
      tripId:'t1',
      count:1,
      albumCount:2,
      clusterCount:3
    }
  );

  const albums=await api.listAlbums();

  assert.strictEqual(
    albums[0].sourceClusterId,
    'c1'
  );

  assert.strictEqual(
    albums[0].metadata,
    undefined
  );

  const cards=await api.listCards();

  assert.strictEqual(
    cards[0].cardType,
    'story'
  );

  assert.strictEqual(
    cards[0].metadata,
    undefined
  );

  const journeys=await api.listJourneys();

  assert.strictEqual(
    journeys[0].coverMediaId,
    'm1'
  );

  assert.strictEqual(
    journeys[0].metadata,
    undefined
  );

  assert.strictEqual(
    window.LuviaGlobalContracts.registrations.length,
    1
  );

  assert.strictEqual(
    window.LuviaGlobalContracts.registrations[0].id,
    'media.v1'
  );

  assert.strictEqual(
    window.LuviaGlobalContracts
      .registrations[0]
      .probe()
      .available,
    true
  );

  const originalGet=
    window.LuviaMediaCore.get;

  delete window.LuviaMediaCore.get;

  await assert.rejects(
    ()=>api.getMedia('m1'),
    error=>{
      assert.strictEqual(
        error.code,
        'MEDIA_CONTRACT_PROVIDER_UNAVAILABLE'
      );

      assert.strictEqual(
        error.provider,
        'LuviaMediaCore.get'
      );

      return true;
    }
  );

  window.LuviaMediaCore.get=originalGet;

  const diagnostics=
    api.diagnostics();

  assert.strictEqual(
    diagnostics.ready,
    true
  );

  assert.deepStrictEqual(
    {...diagnostics.providers},
    {
      media:true,
      albums:true,
      cards:true,
      journeys:true
    }
  );

  const handlers=
    listeners.get('luvia:media-deleted')||[];

  for(const handler of handlers){
    handler({
      type:'luvia:media-deleted',
      detail:{
        media_id:'m1',
        storagePath:'SECRET'
      }
    });
  }

  const event=dispatched.find(
    item=>item.type==='luvia:media.deleted'
  );

  assert(event);

  assert.strictEqual(
    event.detail.payload.mediaId,
    'm1'
  );

  assert.strictEqual(
    event.detail.payload.storagePath,
    undefined
  );

  console.log(
    'M3.3 Media Contract Adapter: OK'
  );

})().catch(error=>{
  console.error(error);
  process.exitCode=1;
});
