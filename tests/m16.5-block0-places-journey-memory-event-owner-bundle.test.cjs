'use strict';

const assert=require('node:assert/strict');
const {
  OWNER_BINDING_DECISIONS_BUNDLE_1,
  loadMemoryOwnerContract,
  loadPlacesOwnerContract,
  methodAt,
  validateRegistry,
}=require('../scripts/m16.5-human-ai-action-registry.cjs');

(async()=>{
  const validated=validateRegistry(),registry=validated.registry;
  const decisions=Object.entries(OWNER_BINDING_DECISIONS_BUNDLE_1);
  assert.equal(decisions.length,60);
  assert.deepEqual(decisions.reduce((counts,[,decision])=>({...counts,[decision.contract]:(counts[decision.contract]||0)+1}),{}),{
    'places.v1':22,
    'journey.v1':12,
    'memory.v1':26,
  });

  for(const [id,decision] of decisions){
    const action=registry.actions.find(item=>item.id===id);
    assert.ok(action,`${id} is missing from the action registry`);
    assert.equal(action.owner.bindingStatus,'PUBLIC_CONTRACT_BOUND');
    assert.equal(action.owner.contract,decision.contract);
    assert.equal(action.owner.method,decision.method);
    assert.equal(action.owner.operationKey,decision.operationKey);
    if(decision.primaryDomain)assert.equal(action.owner.primaryDomain,decision.primaryDomain);
  }

  const places=loadPlacesOwnerContract();
  for(const method of ['reads.categories','reads.recommend','reads.getCard','reads.getDetails','commands.clearFavorites','commands.updateLifecycle','commands.confirmVisit','commands.rejectVisit','commands.setLocationEnabled','commands.refreshLocation'])assert.equal(typeof methodAt(places,method),'function',`missing ${method}`);
  assert.equal((await places.commands.setLocationEnabled(true)).enabled,true);
  assert.equal((await places.commands.refreshLocation()).permission,'granted');
  assert.equal((await places.commands.rejectVisit('visit-1','Nicht dort gewesen')).state,'rejected');
  assert.equal((await places.commands.confirmVisit('place-1')).state,'visited');

  const memory=loadMemoryOwnerContract();
  for(const method of ['reads.library','reads.signedAsset','reads.getStory','composition.createSelection','composition.toggleSelection','commands.cards.save','commands.stories.save','commands.stories.contribute'])assert.equal(typeof methodAt(memory,method),'function',`missing ${method}`);
  const selected=memory.composition.toggleSelection(memory.composition.createSelection([]),'media-1');
  assert.deepEqual(Array.from(selected.ids),['media-1']);
  assert.equal((await memory.reads.getStory('story-1')).id,'story-1');

  assert.equal(registry.summary.ownerBinding.PUBLIC_CONTRACT_BOUND,243);
  assert.equal(registry.summary.ownerBinding.OWNER_METHOD_AUDIT_OPEN||0,0);
  assert.equal(registry.summary.aiCoverage.MISSING,248,'Owner binding must not be mislabeled as AI parity');
  console.log('M16.5 Block 0 Places/Journey/Memory/Event public Owner bundle: PASS');
  console.log('60 additional actions -> 22 Places + 12 Journey + 26 Memory public methods: PASS');
  console.log('Presence enable/refresh/confirm/reject and Memory selection/read paths execute: PASS');
  console.log('This bundle closed 184 -> 124; cumulative Block 0 state is 85 open methods');
})().catch(error=>{console.error(error);process.exitCode=1});
