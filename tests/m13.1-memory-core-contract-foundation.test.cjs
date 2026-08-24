'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const corePath='core/memory/memory-domain-contract-core.js';
const adapterPath='core/platform/memory-contract-adapter.js';
const runtimeContextPath='core/platform/memory-runtime-context-adapter.js';
const contractPath='docs/modularization/contracts/memory.v1.json';

async function main(){

for(const file of [corePath,adapterPath,runtimeContextPath,contractPath,'core/memory/AGENTS.md']){
  assert.ok(fs.existsSync(path.join(ROOT,file)),`Missing M13.1 file: ${file}`);
}

const coreSource=read(corePath);
for(const token of ['window','document','navigator','localStorage','sessionStorage','indexedDB','Supabase','querySelector','fetch(']){
  assert.equal(coreSource.includes(token),false,`Memory Domain Core must remain browserless: ${token}`);
}

const context={Object,Array,Map,Set,Date,Math,Number,String,Boolean,JSON,Intl};
vm.createContext(context);
vm.runInContext(coreSource,context,{filename:corePath});
const core=context.LuviaMemoryDomainContractCoreV1;
assert.ok(core,'Memory Domain Contract Core did not publish its browserless surface');
assert.deepEqual(JSON.parse(JSON.stringify(core.diagnostics())),{
  contractId:'memory.v1',
  version:'1',
  runtimeVersion:'1.0.0',
  browserless:true,
  truth:'canonical-memory-and-narrative-truth',
  mediaAssetTruth:false,
  persistence:false,
  filters:['all','favorites','unassigned','photos','videos'],
  storyStatuses:['draft','published','archived']
});

const media=[
  {id:'m-1',tripId:'trip-1',type:'image',mimeType:'image/jpeg',displayName:'Eiffelturm Abend',capturedAt:'2026-08-24T20:00:00Z',dayKey:'2026-08-24',favorite:true,resolvedLocation:{name:'Paris'}},
  {id:'m-2',tripId:'trip-1',type:'image',mimeType:'image/jpeg',displayName:'Café am Morgen',capturedAt:'2026-08-25T08:00:00Z',dayKey:'2026-08-25',favorite:false,resolvedLocation:{name:'Montmartre'}},
  {id:'m-3',tripId:'trip-1',type:'video',mimeType:'video/mp4',displayName:'Seine',capturedAt:'2026-08-25T18:00:00Z',dayKey:'2026-08-25',favorite:false}
];
const albums=[{id:'a-1',tripId:'trip-1',title:'Paris bei Nacht',mediaIds:['m-1'],status:'published'}];
const stories=[{id:'s-1',tripId:'trip-1',title:'Unsere Parisreise',status:'draft',chapters:[{position:0,title:'Ankommen',day_key:'2026-08-24'}],items:[{chapter_position:0,position:0,item_type:'media',media_id:'m-1'}]}];

const library=core.buildLibrary({media,albums,stories},{query:'eiffelturm paris',limit:12,selectedIds:['m-1']});
assert.equal(Object.isFrozen(library),true);
assert.equal(Object.isFrozen(library.items),true);
assert.equal(library.contractId,'memory.v1');
assert.equal(library.items.length,1);
assert.equal(library.items[0].id,'m-1');
assert.equal(library.items[0].selected,true);
assert.deepEqual(JSON.parse(JSON.stringify(library.items[0].memoryRefs.albumIds)),['a-1']);
assert.deepEqual(JSON.parse(JSON.stringify(library.items[0].memoryRefs.storyIds)),['s-1']);
assert.equal(library.stats.media,3);
assert.equal(library.stats.favorites,1);
assert.equal(library.stats.days,2);
assert.equal(library.stats.albums,1);
assert.equal(library.stats.stories,1);
assert.equal(core.buildLibrary({media,albums,stories},{filter:'unassigned',limit:12}).items.length,2);
assert.equal(core.buildLibrary({media,albums,stories},{filter:'videos',limit:12}).items[0].id,'m-3');

let selection=core.createSelection(['m-1'],{max:2});
selection=core.toggleSelection(selection,'m-2');
assert.deepEqual(JSON.parse(JSON.stringify(selection.ids)),['m-1','m-2']);
assert.equal(selection.full,true);
assert.throws(()=>core.toggleSelection(selection,'m-3'),/MEMORY_SELECTION_LIMIT/);
selection=core.toggleSelection(selection,'m-1');
assert.deepEqual(JSON.parse(JSON.stringify(selection.ids)),['m-2']);

const draft=core.createStoryDraft({media:media.slice(0,2),trip:{destination:{name:'Paris'}}});
assert.equal(draft.title,'Unsere Reise nach Paris');
assert.equal(draft.status,'draft');
assert.equal(draft.chapters.length,2);
assert.equal(draft.items.length,2);
assert.equal(draft.coverMediaId,'m-1');
assert.equal(Object.isFrozen(draft),true);
assert.throws(()=>core.createStoryDraft({media:[]}),/MEMORY_STORY_REQUIRES_MEDIA/);

const transfer=core.projectTransfer({online:false,total:3,counts:{queued:1,retry:1,failed:1}});
assert.deepEqual(JSON.parse(JSON.stringify(transfer)),{
  online:false,running:false,total:3,pending:3,
  counts:{queued:1,uploading:0,retry:1,completed:0,failed:1},status:'attention'
});

let persistedStory={...draft,id:'s-new',trip_id:'trip-1',chapters:draft.chapters,items:draft.items,contributions:[]};
const registrations=[];
const adapterContext={
  Object,Array,Map,Set,Date,Math,Number,String,Boolean,JSON,Intl,Promise,
  LuviaMediaContractV1:{reads:{
    listMedia:async()=>media,
    signedUrl:async id=>`https://assets.test/${id}`,
    uploadQueueSnapshot:async()=>({online:true,total:0,counts:{}}),
    subscribe:async()=>()=>{}
  }},
  LuviaTripContractV1:{getActiveTrip:()=>({id:'trip-1',destination:{name:'Paris'}})},
  LuviaMemoryAlbums:{list:async()=>albums,listClusters:async()=>[],save:async row=>row,remove:async()=>true,saveContribution:async row=>row,subscribe:async()=>()=>{}},
  LuviaMemoryCards:{list:async()=>[],save:async row=>row,updateStory:async(id,content)=>({id,content}),dismiss:async()=>true,subscribe:async()=>()=>{}},
  LuviaMemoryJourneys:{
    list:async()=>[persistedStory],get:async()=>persistedStory,
    save:async row=>(persistedStory={...row,id:row.id||'s-new',trip_id:'trip-1',contributions:[]}),
    remove:async()=>true,saveContribution:async()=>({id:'c-1',user_id:'u-1',answer_text:'Unser Blick'}),subscribe:async()=>()=>{}
  },
  LuviaGlobalContracts:{register:def=>registrations.push(def)}
};
vm.createContext(adapterContext);
vm.runInContext(coreSource,adapterContext,{filename:corePath});
vm.runInContext(read(adapterPath),adapterContext,{filename:adapterPath});
const api=adapterContext.LuviaMemoryContractV1;
assert.equal(api.contractId,'memory.v1');
assert.equal(api.diagnostics().ready,true);
assert.equal(api.diagnostics().owner,'Memory');
assert.equal((await api.reads.library({filter:'favorites',limit:12})).items[0].id,'m-1');
assert.equal((await api.reads.createDraft(['m-1','m-2'])).items.length,2);
assert.equal(await api.reads.signedAsset('m-1'),'https://assets.test/m-1');
assert.equal((await api.commands.stories.publish(draft)).status,'published');
assert.deepEqual(JSON.parse(JSON.stringify(await api.commands.maintenance.clearForTrip())),{stories:1,albums:1,cleared:true});
assert.equal(registrations[0].owner,'Memory');

const registry=JSON.parse(read('config/luvia-cores.json'));
const contract=JSON.parse(read(contractPath));
assert.equal(registry.cores.memory.status,'active');
assert.equal(registry.cores.memory.root,'core/memory/');
assert.equal(registry.cores.memory.ownerStream,'feature/memory-core');
assert.equal(registry.cores.memory.truthOwnership,'canonical-memory-and-narrative-truth');
assert.equal(registry.cores.memory.browserlessCore,corePath);
assert.equal(registry.cores.memory.contractAdapter,adapterPath);
assert.equal(registry.cores.memory.runtimeContextAdapter,runtimeContextPath);
assert.equal(registry.cores.media.excludedTruth.includes('memory-stories'),true);
assert.equal(contract.contractId,'memory.v1');
assert.equal(contract.runtimeImplementationStage,'M13');
assert.equal(contract.mediaAssetTruth,false);
assert.deepEqual(contract.currentImplementation,[corePath,adapterPath,'LuviaMemoryContractV1']);

const index=read('index.html');
const order=[
  'core/media/media-domain-contract-core.js',corePath,runtimeContextPath,
  'core/media/memory-albums.js','core/platform/media-contract-adapter.js',adapterPath,
  'app/app-shell.js'
].map(file=>index.indexOf(file));
assert.ok(order.every(position=>position>=0),'M13.1 runtime files must all be loaded');
assert.deepEqual(order,[...order].sort((a,b)=>a-b),'Memory Core/provider/contract load order is invalid');

const mediaAdapter=read('core/platform/media-contract-adapter.js');
assert.ok(mediaAdapter.includes('uploadQueueSnapshot'));
assert.ok(mediaAdapter.includes("owner:'Media'"));

const memoryProviders=['core/media/memory-albums.js','core/media/memory-cards.js','core/media/memory-journeys.js'].map(read).join('\n');
assert.equal(memoryProviders.includes('LuviaMediaCore'),false,'Memory providers must not borrow private Media Core context');
assert.doesNotMatch(read('core/media/memory-albums.js'),/\.from\(['"]media['"]\)/,'Memory album asset reads must cross media.v1');
const mediaCore=read('core/media/media-core.js');
assert.ok(mediaCore.includes('LuviaMemoryContractV1'));
assert.doesNotMatch(mediaCore,/\.from\(['"]memory_/,'Media Core must not mutate Memory tables directly');

const databaseMap=read('docs/modularization/DATABASE-DOMAIN-MAP.csv');
assert.match(databaseMap,/^media,Media,canonical/m);
assert.match(databaseMap,/^memory_journeys,Memory,canonical/m);
assert.match(databaseMap,/^media_memory_proposals,Intelligence,canonical\/transitional/m);

const ownership=read('docs/modularization/FILE-OWNERSHIP.csv');
for(const file of [corePath,adapterPath,runtimeContextPath,contractPath,'core/memory/AGENTS.md','tests/m13.1-memory-core-contract-foundation.test.cjs']){
  assert.ok(ownership.includes(file),`Ownership registry missing ${file}`);
}
assert.match(ownership,/core\/media\/memory-journeys\.js,Memory,Adapter\/Web Compatibility/);

const safeRunner=read('tests/run-m4.3-safe-regression.cjs');
assert.ok(safeRunner.includes('tests/m13.1-memory-core-contract-foundation.test.cjs'));

console.log('M13.1 Memory Core / memory.v1 contract foundation: PASS');

}

main().catch(error=>{
  console.error(error);
  process.exitCode=1;
});
