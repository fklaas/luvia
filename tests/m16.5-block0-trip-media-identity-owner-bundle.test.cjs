'use strict';

const assert=require('node:assert/strict');
const {
  OWNER_BINDING_DECISIONS_BUNDLE_2,
  loadIdentityOwnerContract,
  loadIntelligenceOwnerContract,
  loadMediaOwnerContract,
  loadTripOwnerContract,
  methodAt,
  validateRegistry,
}=require('../scripts/m16.5-human-ai-action-registry.cjs');

(async()=>{
  const validated=validateRegistry(),registry=validated.registry;
  const decisions=Object.entries(OWNER_BINDING_DECISIONS_BUNDLE_2);
  assert.equal(decisions.length,39);
  assert.deepEqual(decisions.reduce((counts,[,decision])=>({...counts,[decision.contract]:(counts[decision.contract]||0)+1}),{}),{
    'trip.v1':15,
    'places.v1':2,
    'media.v1':15,
    'intelligence.v1':2,
    'identity.v1':5,
  });
  for(const [id,decision] of decisions){
    const action=registry.actions.find(item=>item.id===id);
    assert.ok(action,`${id} is missing from the action registry`);
    assert.equal(action.owner.bindingStatus,'PUBLIC_CONTRACT_BOUND');
    assert.equal(action.owner.contract,decision.contract);
    assert.equal(action.owner.method,decision.method);
    assert.equal(action.owner.operationKey,decision.operationKey);
  }

  const trip=loadTripOwnerContract();
  let draft=trip.composition.createDraft();
  draft=trip.composition.updateDraft(draft,{title:'Sommer am Meer',feelings:['slow','together','slow'],destination:{name:'Scharbeutz',placeId:'place-scharbeutz'},modules:['places','journey'],startDate:'2026-09-02',endDate:'2026-09-05'});
  assert.equal(draft.title,'Sommer am Meer');
  assert.deepEqual(Array.from(draft.feelings),['slow','together']);
  assert.equal(trip.composition.validateDraft(draft).valid,true);
  assert.equal(trip.composition.deferDraft(draft).deferred,true);
  assert.throws(()=>trip.composition.updateDraft(draft,{secret:'forbidden'}),error=>error.code==='TRIP_DRAFT_FIELD_NOT_ALLOWED');

  const media=loadMediaOwnerContract();
  for(const method of ['reads.listMedia','reads.getMedia','reads.download','commands.media.upload','commands.media.update','commands.media.toggleFavorite','commands.media.setPolaroid','commands.media.remove'])assert.equal(typeof methodAt(media,method),'function',`missing ${method}`);
  assert.equal((await media.reads.getMedia('media-1')).id,'media-1');
  assert.equal((await media.commands.media.toggleFavorite('media-1')).favorite,true);

  const identity=loadIdentityOwnerContract();
  assert.equal(identity.core.profileWriteFields.includes('dashboardWidgets'),false,'private dashboard metadata must not leak through the viewer profile');
  assert.equal((await identity.contract.commands.updateDashboardLayout([{id:'today',enabled:true,position:3},{id:'weather',enabled:false,position:0}])).count,2);
  assert.equal((await identity.contract.commands.setTripArchived('trip-1',true)).archived,true);
  assert.equal((await identity.contract.commands.requestNotificationPermission()).permission,'granted');

  const intelligence=loadIntelligenceOwnerContract();
  assert.equal((await intelligence.commands.confirmLearningSignal({id:'signal-1'})).status,'confirmed');
  assert.equal((await intelligence.commands.dismissLearningSignal({id:'signal-1'})).status,'dismissed');

  assert.equal(registry.summary.ownerBinding.PUBLIC_CONTRACT_BOUND,246);
  assert.equal(registry.summary.ownerBinding.OWNER_METHOD_AUDIT_OPEN||0,0);
  assert.equal(registry.summary.aiCoverage.MISSING,223,'Owner binding must not be mislabeled as AI parity');
  console.log('M16.5 Block 0 Trip/Media/Identity public Owner bundle: PASS');
  console.log('39 additional actions -> 15 Trip + 2 Places + 15 Media + 2 Intelligence + 5 Identity methods: PASS');
  console.log('Owner methods open after subsequent bundles: 34; AI coverage remains honest');
})().catch(error=>{console.error(error);process.exitCode=1});
