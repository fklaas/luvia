'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {
  OWNER_BINDING_DECISIONS_BUNDLE_4,
  loadJourneyOwnerContract,
  loadMediaOwnerContract,
  loadMemoryOwnerContract,
  loadPlacesOwnerContract,
  loadPlatformActionOwnerContract,
  methodAt,
  validateRegistry,
}=require('../scripts/m16.5-human-ai-action-registry.cjs');

(async()=>{
  const {registry}=validateRegistry(),decisions=Object.entries(OWNER_BINDING_DECISIONS_BUNDLE_4);
  assert.equal(decisions.length,34);
  for(const [id,decision] of decisions){
    const action=registry.actions.find(item=>item.id===id);
    assert.ok(action,`${id} is missing`);
    assert.equal(action.owner.bindingStatus,'PUBLIC_CONTRACT_BOUND');
    for(const [key,value] of Object.entries(decision))assert.equal(action.owner[key],value,`${id} ${key} drift`);
  }
  assert.equal(registry.summary.ownerBinding.PUBLIC_CONTRACT_BOUND,246);
  assert.equal(registry.summary.ownerBinding.OWNER_METHOD_AUDIT_OPEN||0,0);
  assert.equal(registry.summary.aiCoverage.MISSING,223,'Owner binding must not be mislabeled as chat/E2E parity');

  const platform=loadPlatformActionOwnerContract();
  assert.deepEqual({...platform.composition.retryIntent({target:'places.search'})},{kind:'retry',target:'places.search',reason:null,stateChanging:false});
  assert.equal((await platform.commands.requestLocation({mode:'once',userGesture:true})).position.latitude,54);
  assert.equal((await platform.commands.captureMedia({userGesture:true})),null);
  assert.deepEqual(await platform.commands.pickFiles({userGesture:true}),[]);
  assert.equal(await platform.commands.share({text:'Luvia',userGesture:true}),true);
  assert.equal(await platform.commands.copyText({text:'LUVIA7K2',userGesture:true}),true);
  assert.equal(platform.commands.clearLocation({watchId:1,userGesture:true}).cleared,true);
  await assert.rejects(()=>platform.commands.requestLocation({mode:'once'}),/PLATFORM_USER_GESTURE_REQUIRED/);

  const places=loadPlacesOwnerContract();
  assert.equal(places.composition.selectView('map').view,'map');
  assert.throws(()=>places.composition.selectView('grid'),/PLACES_VIEW_INVALID/);
  for(const method of ['commands.openWebsite','commands.openPhone','commands.openMaps'])assert.equal(typeof methodAt(places,method),'function');

  const journey=loadJourneyOwnerContract();
  for(const method of ['commands.openExternalLink','commands.saveOfflinePack','commands.removeOfflinePack','commands.undo'])assert.equal(typeof methodAt(journey,method),'function');
  await assert.rejects(()=>journey.commands.undo({operation:'anything'}),/JOURNEY_UNDO_OPERATION_UNSUPPORTED/);

  const media=loadMediaOwnerContract();
  assert.equal(typeof media.commands.acquisition.capture,'function');
  assert.equal(typeof media.commands.acquisition.pick,'function');
  const mediaTitles=media.composition.suggestTitles({displayName:'Dünenweg.jpg',locationName:'Scharbeutz',dayKey:'2026-09-01'});
  assert.deepEqual(Array.from(mediaTitles.titles),['Dünenweg','Dünenweg in Scharbeutz','Dünenweg · 2026-09-01']);
  assert.equal(mediaTitles.inventedFacts,false);

  const memory=loadMemoryOwnerContract();
  assert.equal(memory.composition.weaveStoryDraft({contributions:['Der Wind war stark','Wir haben gelacht.']}).evidenceCount,2);
  assert.equal(memory.composition.suggestStoryTitles({title:'Unser Tag',locationName:'Scharbeutz'}).inventedFacts,false);
  assert.equal(memory.composition.nextContributionQuestion({currentQuestionId:'first-thought'}).id,'hidden-detail');
  for(const method of ['reads.getVote','commands.cards.saveAlbumVotes','commands.cards.dissolveStack','commands.exportStory'])assert.equal(typeof methodAt(memory,method),'function');

  const index=fs.readFileSync('index.html','utf8'),sw=fs.readFileSync('sw.js','utf8');
  for(const file of ['core/runtime/platform-action-contract-core.js','app/adapters/platform-action-web-adapter.js']){
    assert.ok(index.includes(file),`${file} missing from index`);
    assert.ok(sw.includes(file),`${file} missing from offline shell`);
  }
  for(const file of ['platform.actions.v1.json','journey.v1.json','places.v1.json','media.v1.json','memory.v1.json'])JSON.parse(fs.readFileSync(`docs/modularization/contracts/${file}`,'utf8'));

  console.log('M16.5 Block 0 final 34-action Owner-method bundle: PASS');
  console.log('246 public Owner paths bound · 0 Owner-method audits open · AI/E2E coverage still reported separately');
})().catch(error=>{console.error(error);process.exitCode=1});
