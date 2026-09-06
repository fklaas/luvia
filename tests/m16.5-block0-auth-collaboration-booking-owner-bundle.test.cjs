'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {
  OWNER_BINDING_DECISIONS_BUNDLE_3,
  loadAuthOwnerContract,
  loadBookingOwnerContract,
  loadCollaborationOwnerContract,
  loadIdentityOwnerContract,
  methodAt,
  validateRegistry,
}=require('../scripts/m16.5-human-ai-action-registry.cjs');

(async()=>{
  const validated=validateRegistry(),registry=validated.registry;
  const decisions=Object.entries(OWNER_BINDING_DECISIONS_BUNDLE_3);
  assert.equal(decisions.length,51);
  assert.deepEqual(decisions.reduce((counts,[,decision])=>({...counts,[decision.contract]:(counts[decision.contract]||0)+1}),{}),{
    'auth.v1':18,
    'identity.v1':1,
    'collaboration.interaction.v1':15,
    'places.v1':2,
    'booking.v1':15,
  });
  for(const [id,decision] of decisions){
    const action=registry.actions.find(item=>item.id===id);
    assert.ok(action,`${id} is missing from the action registry`);
    assert.equal(action.owner.bindingStatus,'PUBLIC_CONTRACT_BOUND');
    for(const [key,value] of Object.entries(decision))assert.equal(action.owner[key],value,`${id} ${key} drift`);
  }

  const auth=loadAuthOwnerContract();
  assert.equal(auth.composition.selectMode('login').mode,'login');
  assert.equal(auth.composition.selectMode('register').stateChanging,false);
  assert.equal(auth.diagnostics().tokenExposure,false);
  assert.equal(auth.diagnostics().passwordExposure,false);
  const publicState=auth.reads.getState();
  assert.equal(publicState.authenticated,true);
  assert.equal('session' in publicState,false);
  assert.equal('access_token' in publicState,false);
  await assert.rejects(()=>auth.commands.signInWithProvider({provider:'unknown'}),error=>error.code==='AUTH_PROVIDER_INVALID');

  const identity=loadIdentityOwnerContract().contract;
  const exported=identity.reads.exportData();
  assert.equal(exported.contractId,'identity.v1');
  assert.equal(exported.viewer.displayName,'Luvia');
  assert.equal(JSON.stringify(exported).includes('auth-tokens'),true);
  assert.equal(JSON.stringify(exported).includes('access_token'),false);

  const collaboration=loadCollaborationOwnerContract();
  const share=collaboration.reads.getInviteSharePayload();
  assert.equal(share.code,'LUVIA7K2');
  assert.match(share.url,/join=LUVIA7K2/);
  assert.equal((await collaboration.commands.voteProposal({proposalId:'proposal-1',choice:'yes'})).choice.providerValue,true);
  assert.equal((await collaboration.commands.voteProposal({proposalId:'proposal-1',choice:'no'})).choice.providerValue,false);
  assert.equal((await collaboration.commands.voteProposal({proposalId:'proposal-1',choice:'abstain'})).choice.providerValue,null);

  const booking=loadBookingOwnerContract();
  for(const method of ['reads.checkAvailability','reads.resolveChannel','reads.reconcileUnknownOutcome','composition.createDraft','composition.updateDraft','composition.selectRoute','composition.composeMessageDraft','commands.openRoute','commands.openExternalHandoff','commands.retryRecovery','commands.resolveThread'])assert.equal(typeof methodAt(booking,method),'function',`missing ${method}`);
  let draft=booking.composition.createDraft();
  draft=booking.composition.updateDraft(draft,{date:'2026-09-14',time:'14:00',partySize:4,occasion:'Geburtstag',note:'Ruhiger Tisch',contact:{email:'gast@example.invalid'}});
  assert.equal(booking.composition.validateDraft(draft).valid,true);
  assert.throws(()=>booking.composition.updateDraft(draft,{date:'14.09.2026'}),error=>error.code==='BOOKING_DRAFT_DATE_INVALID');
  assert.throws(()=>booking.composition.updateDraft(draft,{unknown:'x'}),error=>error.code==='BOOKING_DRAFT_FIELD_INVALID');
  const message=booking.composition.composeMessageDraft({bookingId:'booking-1',bodyText:'Bitte einen Tisch am Fenster.'});
  assert.equal(message.state,'draft');
  assert.equal(message.stateChanging,false);

  const proposalSource=fs.readFileSync('app/collaboration/journey-place-proposals.js','utf8');
  assert.match(proposalSource,/meta\.vote===null\?null/,'abstention must remain distinct from a no vote');
  assert.match(proposalSource,/abstain_votes:abstain/,'proposal projection must expose abstention count');
  const index=fs.readFileSync('index.html','utf8'),sw=fs.readFileSync('sw.js','utf8');
  for(const file of ['core/runtime/auth-command-contract-core.js','core/platform/auth-contract-adapter.js','core/booking/booking-draft-core.js','core/collaboration/collaboration-interaction-contract-core.js','core/platform/collaboration-contract-adapter.js']){
    assert.ok(index.includes(file),`${file} missing from runtime manifest`);
    assert.ok(sw.includes(file),`${file} missing from offline shell`);
  }

  assert.equal(registry.summary.ownerBinding.PUBLIC_CONTRACT_BOUND,249);
  assert.equal(registry.summary.ownerBinding.OWNER_METHOD_AUDIT_OPEN||0,0);
  assert.equal(registry.summary.aiCoverage.MISSING,223,'public Owner binding must not be mislabeled as AI parity');
  console.log('M16.5 Block 0 Auth/Collaboration/Booking public Owner bundle: PASS');
  console.log('51 additional actions -> 18 Auth + 1 Identity + 15 Collaboration + 2 Places + 15 Booking methods: PASS');
  console.log('Owner methods open: 85 -> 34; AI coverage remains honest');
})().catch(error=>{console.error(error);process.exitCode=1});
