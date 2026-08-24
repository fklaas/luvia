(()=>{
'use strict';

const CONTRACT_ID='memory.v1';
const VERSION='1';
const RUNTIME_VERSION='1.0.0';
const core=globalThis.LuviaMemoryDomainContractCoreV1;
if(!core)throw new Error('Luvia Memory Domain Contract Core v1 fehlt.');

const providerError=name=>new Error(`Memory Contract v1 Provider fehlt: ${name}`);
const provider=(name,method)=>{
  const value=globalThis[name];
  if(!value||typeof value[method]!=='function')throw providerError(`${name}.${method}`);
  return value[method].bind(value);
};
const optionalProvider=(name,method)=>{
  const value=globalThis[name];
  return value&&typeof value[method]==='function'?value[method].bind(value):null;
};
const media=()=>{
  const value=globalThis.LuviaMediaContractV1||globalThis.LuviaMediaContract;
  if(!value?.reads?.listMedia)throw providerError('LuviaMediaContractV1.reads.listMedia');
  return value;
};
const trip=()=>globalThis.LuviaTripContractV1?.getActiveTrip?.()||null;
const immutable=value=>{
  if(value==null||typeof value!=='object')return value;
  if(Array.isArray(value))return Object.freeze(value.map(immutable));
  return Object.freeze(Object.fromEntries(Object.entries(value).map(([key,item])=>[key,immutable(item)])));
};

async function listAlbums(){
  const rows=await provider('LuviaMemoryAlbums','list')();
  return Object.freeze((rows||[]).map(core.projectAlbum).filter(Boolean));
}

async function listCards(filters={}){
  const rows=await provider('LuviaMemoryCards','list')(filters);
  return Object.freeze((rows||[]).map(core.projectCard).filter(Boolean));
}

async function listStories(){
  const rows=await provider('LuviaMemoryJourneys','list')();
  return Object.freeze((rows||[]).map(core.projectStory).filter(Boolean));
}

async function getStory(storyId){
  const direct=optionalProvider('LuviaMemoryJourneys','get');
  const row=direct?await direct(storyId):(await provider('LuviaMemoryJourneys','list')()).find(item=>String(item?.id)===String(storyId));
  return core.projectStory(row);
}

async function listClusters(){
  const rows=await provider('LuviaMemoryAlbums','listClusters')();
  return Object.freeze((rows||[]).map(core.projectCluster).filter(Boolean));
}

async function transferSnapshot(){
  const snapshot=await (media().reads.uploadQueueSnapshot?.()||Promise.resolve({online:true,running:false,total:0,counts:{}}));
  return core.projectTransfer(snapshot);
}

async function library(options={}){
  const [mediaItems,albums,stories]=await Promise.all([
    media().reads.listMedia(),
    listAlbums(),
    listStories()
  ]);
  return core.buildLibrary({media:mediaItems,albums,stories},options);
}

async function snapshot(options={}){
  const [albums,cards,stories,clusters,mediaItems,transfers]=await Promise.all([
    listAlbums(),
    listCards(),
    listStories(),
    listClusters(),
    media().reads.listMedia(),
    transferSnapshot()
  ]);
  return immutable({
    contractId:CONTRACT_ID,
    tripId:String(trip()?.id||trip()?.tripId||'' )||null,
    library:core.buildLibrary({media:mediaItems,albums,stories},options),
    albums,cards,stories,clusters,transfers,
    provenance:{memoryTruth:CONTRACT_ID,mediaTruth:'media.v1',legacyCompatibility:true,foreignTruth:false}
  });
}

async function createDraft(mediaIds=[],options={}){
  const ids=new Set((mediaIds||[]).map(String));
  const items=(await media().reads.listMedia()).filter(item=>ids.has(String(item.id)));
  return core.createStoryDraft({...options,media:items,trip:trip()});
}

async function signedAsset(mediaId,options={}){
  const expiresIn=Math.max(60,Math.min(86400,Number(options.expiresIn)||3600));
  return media().reads.signedUrl(mediaId,expiresIn);
}

const storyCommands=Object.freeze({
  async save(input={}){
    const command=core.normalizeStoryCommand(input);
    const saved=await provider('LuviaMemoryJourneys','save')(command);
    const id=saved?.id||command.id;
    return id?await getStory(id):core.projectStory(saved);
  },
  async publish(input={}){
    return storyCommands.save({...input,status:'published'});
  },
  async archive(input={}){
    const current=input.id?await getStory(input.id):null;
    if(!current)throw new Error('MEMORY_STORY_NOT_FOUND');
    return storyCommands.save({...current,...input,status:'archived'});
  },
  async remove(storyId){
    return Boolean(await provider('LuviaMemoryJourneys','remove')(storyId));
  },
  async contribute(storyId,input={}){
    const result=await provider('LuviaMemoryJourneys','saveContribution')(storyId,{
      promptKey:String(input.promptKey||'journey-perspective'),
      promptText:String(input.promptText||''),
      answerText:String(input.answerText||''),
      reaction:String(input.reaction||''),
      metadata:input.metadata&&typeof input.metadata==='object'?input.metadata:{}
    });
    return core.projectContribution(result);
  }
});

const albumCommands=Object.freeze({
  async save(input={}){return core.projectAlbum(await provider('LuviaMemoryAlbums','save')(input))},
  async remove(albumId){return Boolean(await provider('LuviaMemoryAlbums','remove')(albumId))},
  async contribute(albumId,input={}){return core.projectContribution(await provider('LuviaMemoryAlbums','saveContribution')(albumId,input))}
});

const cardCommands=Object.freeze({
  async save(input={}){return core.projectCard(await provider('LuviaMemoryCards','save')(input))},
  async updateStory(cardId,content){return core.projectCard(await provider('LuviaMemoryCards','updateStory')(cardId,content))},
  async dismiss(cardId){return Boolean(await provider('LuviaMemoryCards','dismiss')(cardId))}
});

const maintenanceCommands=Object.freeze({
  async clearForTrip(){
    const [stories,albums]=await Promise.all([listStories(),listAlbums()]);
    for(const story of stories)await provider('LuviaMemoryJourneys','remove')(story.id);
    for(const album of albums)await provider('LuviaMemoryAlbums','remove')(album.id);
    return immutable({stories:stories.length,albums:albums.length,cleared:true});
  }
});

async function subscribe(listener){
  if(typeof listener!=='function')throw new TypeError('memory.v1 subscribe requires a listener.');
  const stops=[];
  const bind=async(name,method,type)=>{
    const subscribeProvider=optionalProvider(name,method);
    if(!subscribeProvider)return;
    const stop=await subscribeProvider(payload=>listener(immutable({type,payload:null,at:new Date().toISOString(),remote:Boolean(payload)})));
    if(typeof stop==='function')stops.push(stop);
  };
  await Promise.all([
    bind('LuviaMemoryAlbums','subscribe','memory.album.changed'),
    bind('LuviaMemoryCards','subscribe','memory.card.changed'),
    bind('LuviaMemoryJourneys','subscribe','memory.story.changed')
  ]);
  const mediaStop=await media().reads.subscribe?.(()=>listener(immutable({type:'memory.media.changed',payload:null,at:new Date().toISOString()})));
  if(typeof mediaStop==='function')stops.push(mediaStop);
  return async()=>{for(const stop of stops.splice(0)){try{await stop()}catch{}}};
}

const reads=Object.freeze({
  snapshot,
  library,
  listAlbums,
  listCards,
  listStories,
  getStory,
  listClusters,
  transferSnapshot,
  createDraft,
  signedAsset,
  subscribe
});

const commands=Object.freeze({stories:storyCommands,albums:albumCommands,cards:cardCommands,maintenance:maintenanceCommands});
const events=Object.freeze(['memory.album.changed','memory.card.changed','memory.story.changed','memory.media.changed','memory.transfer.changed']);

const diagnostics=()=>immutable({
  contractId:CONTRACT_ID,
  version:VERSION,
  runtimeVersion:RUNTIME_VERSION,
  ready:Boolean(core&&globalThis.LuviaMediaContractV1&&globalThis.LuviaMemoryAlbums&&globalThis.LuviaMemoryCards&&globalThis.LuviaMemoryJourneys),
  owner:'Memory',
  truth:'canonical-memory-and-narrative-truth',
  mediaAssetTruth:false,
  legacyCompatibility:true,
  providers:{
    domainCore:Boolean(core),
    mediaContract:Boolean(globalThis.LuviaMediaContractV1),
    albums:Boolean(globalThis.LuviaMemoryAlbums),
    cards:Boolean(globalThis.LuviaMemoryCards),
    stories:Boolean(globalThis.LuviaMemoryJourneys)
  }
});

const api=Object.freeze({
  contractId:CONTRACT_ID,
  version:VERSION,
  runtimeVersion:RUNTIME_VERSION,
  reads,
  commands,
  events,
  composition:Object.freeze({
    createSelection:core.createSelection,
    toggleSelection:core.toggleSelection,
    createStoryDraft:core.createStoryDraft,
    normalizeStoryCommand:core.normalizeStoryCommand
  }),
  diagnostics
});

globalThis.LuviaMemoryContractV1=api;
globalThis.LuviaMemoryContract=api;

globalThis.LuviaGlobalContracts?.register?.({
  id:CONTRACT_ID,
  version:VERSION,
  owner:'Memory',
  api,
  probe:()=>({available:diagnostics().ready,detail:'Luvia Memory Contract v1'})
});
})();
