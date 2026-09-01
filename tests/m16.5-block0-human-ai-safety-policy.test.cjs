'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const read=file=>fs.readFileSync(file,'utf8');
const registry=JSON.parse(read('config/luvia-human-ai-action-registry.v1.json'));
const document=JSON.parse(read('config/luvia-human-ai-safety-policy.v1.json'));
const context={console};vm.createContext(context);vm.runInContext(read('core/intelligence/human-ai-safety-policy-core.js'),context,{filename:'human-ai-safety-policy-core.js'});
const core=context.LuviaHumanAISafetyPolicyCoreV1,action=id=>registry.actions.find(item=>item.id===id);
const member={authenticated:true,tripRole:'MEMBER',online:true,providers:{PLACES_PROVIDER:true,BOOKING_PROVIDER:true,VERIFIED_EVENT_PROVIDER:true,AI_RUNTIME:true},consents:[],userGesture:true,confirmed:false};

assert.equal(core.contractId,'intelligence.human-ai-safety-policy.v1');assert.equal(document.policies.length,329);assert.equal(document.summary.policyActions,329);assert.equal(Object.keys(document.summary.classifications).length,6);
assert.equal(new Set(document.policies.map(item=>item.actionId)).size,329);assert.ok(document.policies.every(item=>item.naturalLanguageConfirmsMutation===false&&item.ownerExecution===false));

assert.equal(core.evaluate({action:action('places.restaurant.search'),actor:member}).decision,'ALLOW');
assert.equal(core.evaluate({action:action('booking.reservation.create'),actor:member}).decision,'CONFIRMATION_REQUIRED');
assert.equal(core.evaluate({action:action('booking.reservation.create'),actor:{...member,online:false,confirmed:true}}).decision,'NETWORK_REQUIRED');
assert.equal(core.evaluate({action:action('device.location.request'),actor:{...member,tripRole:null,providers:{}}}).decision,'CONSENT_REQUIRED');
assert.equal(core.evaluate({action:action('trip.archive'),actor:{...member,confirmed:true}}).decision,'SCOPE_DENIED');
assert.equal(core.evaluate({action:action('trip.archive'),actor:{...member,tripRole:'OWNER',confirmed:true}}).decision,'ALLOW');
assert.equal(core.evaluate({action:action('identity.profile.export'),actor:{...member,tripRole:null,consents:['DATA_EXPORT'],nowEpochSeconds:2000,reauthenticatedAtEpochSeconds:1000}}).decision,'REAUTH_REQUIRED');
assert.equal(core.evaluate({action:action('identity.profile.export'),actor:{...member,tripRole:null,consents:['DATA_EXPORT'],nowEpochSeconds:2000,reauthenticatedAtEpochSeconds:1900}}).decision,'ALLOW');

const source=read('core/intelligence/human-ai-safety-policy-core.js');
assert.doesNotMatch(source,/\b(?:window|document|localStorage|sessionStorage|LuviaTripStore|LuviaJourneyContractV1|LuviaBookingContractV1)\b/);
console.log(`M16.5 Block 0 shared Human-AI safety policy: PASS (${document.summary.policyActions} actions; ${document.summary.consentGated} consent; ${document.summary.providerGated} provider gates)`);
