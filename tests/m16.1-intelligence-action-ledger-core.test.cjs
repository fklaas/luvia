'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const path='core/intelligence/intelligence-action-ledger-core.js';
const source=fs.readFileSync(path,'utf8');

for(const [label,pattern] of [
  ['browser global',/\bwindow\b|\bglobalThis\b/],
  ['DOM',/\bdocument\b|\bCustomEvent\b|\bdispatchEvent\b/],
  ['device API',/\bnavigator\b/],
  ['browser storage',/\blocalStorage\b|\bsessionStorage\b|\bindexedDB\b/],
  ['network',/\bfetch\s*\(|\bXMLHttpRequest\b/],
  ['provider SDK',/\bSupabase\b/i],
  ['direct DB',/\.from\s*\(|\.rpc\s*\(/]
])assert.equal((source.match(pattern)||[]).length,0,`Action Ledger Core must be browserless: ${label}`);

const context={Object,Array,Map,Set,Error,String,Boolean,Number,Math,JSON,Date};
vm.createContext(context);
vm.runInContext(source,context,{filename:path});
const core=context.LuviaIntelligenceActionLedgerCoreV1;

assert.ok(core,'Action Ledger Core missing');
assert.equal(core.contractId,'intelligence.action-ledger.v1');
let tick=0;
const ledger=core.createActionLedger({clock:()=>`2026-08-24T12:00:0${tick++}.000Z`,idFactory:value=>`ledger-${value}`,maxEntries:20});
const proposed=ledger.create({
  actionId:'booking.reservation.cancel',owner:'booking',ownerContract:'booking.v1',effect:'EXTERNAL',risk:'R3',confirmation:'EXPLICIT',reversible:false,
  idempotencyKey:'idem-1',correlationId:'corr-1',payload:{bookingId:'booking-1',secret:'must-not-be-stored'},reference:{bookingId:'booking-1'}
});
assert.equal(proposed.id,'ledger-1');
assert.equal(proposed.status,'proposed');
assert.equal('payload' in proposed,false);
assert.equal('reference' in proposed,false);
assert.match(proposed.payloadDigest,/^fnv1a-/);
assert.equal(Object.isFrozen(proposed),true);

const duplicate=ledger.create({actionId:'booking.reservation.cancel',idempotencyKey:'idem-1',payload:{bookingId:'different'}});
assert.equal(duplicate.id,proposed.id,'idempotency key must deduplicate');
assert.equal(ledger.requireConfirmation(proposed.id).status,'confirmation_required');
assert.throws(()=>ledger.begin(proposed.id),error=>error?.code==='INTELLIGENCE_ACTION_LEDGER_CONFIRMATION_REQUIRED');
assert.equal(ledger.confirm(proposed.id).status,'confirmed');
assert.equal(ledger.begin(proposed.id).status,'running');
assert.equal(ledger.fail(proposed.id,{code:'PROVIDER_TIMEOUT',outcomeUnknown:true}).status,'outcome_unknown');
assert.throws(()=>ledger.begin(proposed.id),error=>error?.code==='INTELLIGENCE_ACTION_LEDGER_OUTCOME_UNKNOWN');
assert.equal(ledger.startCompensation(proposed.id).status,'compensating');
assert.equal(ledger.finishCompensation(proposed.id,{status:'verified-not-applied'}).status,'compensated');

const safe=ledger.create({actionId:'places.place.favorite',owner:'places',ownerContract:'places.v1',effect:'WRITE',risk:'R1',confirmation:'USER_GESTURE',reversible:true,idempotencyKey:'idem-2'});
assert.equal(ledger.begin(safe.id).status,'running');
assert.equal(ledger.succeed(safe.id,{status:'completed'}).status,'succeeded');
assert.equal(ledger.begin(safe.id).status,'succeeded','terminal duplicate must not rerun');

const cancelled=ledger.create({actionId:'trip.update.details',idempotencyKey:'idem-3'});
assert.equal(ledger.cancel(cancelled.id).status,'cancelled');
assert.equal(ledger.diagnostics().storesRawPayload,false);
assert.equal(ledger.diagnostics().storesForeignDomainTruth,false);
assert.equal(core.policySnapshot().unknownOutcomeRetry,'blocked-until-owner-reconciliation');

console.log('M16.1 Intelligence Action Ledger Core: PASS');
console.log('Idempotency / confirmation / recovery transitions: PASS');
console.log('Unknown external outcome blind retry: BLOCKED');
console.log('Raw payload / foreign Domain Truth storage: NONE');
