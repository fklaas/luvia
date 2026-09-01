'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const adapterPath = 'core/platform/intelligence-contract-adapter.js';
const source = fs.readFileSync(adapterPath, 'utf8');

for (const forbidden of [
  'LuviaSupabaseService',
  '.from(',
  '.rpc(',
  'localStorage',
  'sessionStorage',
  'LuviaTripContext',
  'LuviaPlaceCore',
  'LuviaUserPreferences.update',
  'LuviaScheduleIntelligence',
  'execute('
]) {
  assert.equal(
    source.includes(forbidden),
    false,
    `public Intelligence adapter must not use private provider/mutation: ${forbidden}`
  );
}

const registrations = [];

const context = {
  LuviaGlobalContracts: {
    register(definition) {
      registrations.push(definition);
    }
  }
};

Object.assign(context, {
  Object,
  Array,
  Set,
  Map,
  Error,
  TypeError,
  String,
  Boolean,
  Date,
  console
});

vm.runInNewContext(source, context, { filename: adapterPath });

const api = context.LuviaIntelligenceContractV1;

assert.ok(api, 'LuviaIntelligenceContractV1 missing');
assert.equal(context.LuviaIntelligenceContract, api);
assert.equal(api.contractId, 'intelligence.v1');
assert.equal(api.version, '1');
assert.equal(api.runtimeVersion, '1.10.0');
assert.equal(Object.isFrozen(api), true);
assert.deepEqual([...api.events], [
  'ai.changed',
  'ai.proposal.changed',
  'ai.memory.changed'
]);
assert.deepEqual(Object.keys(api.commands), ['createProposal', 'confirmLearningSignal', 'dismissLearningSignal']);

for (const method of [
  'getCapabilities',
  'getDomains',
  'getTools',
  'getModelTiers',
  'getPolicy',
  'getMemorySnapshot',
  'getSystemSnapshot',
  'planningTrace',
  'gateContext',
  'causalFeedback',
  'compileHumanActions',
  'getHumanActionLanguageCoverage',
  'run',
  'ask',
  'rank',
  'recommend',
  'explain',
  'summarize',
  'createProposal',
  'subscribe',
  'diagnostics'
]) {
  assert.equal(typeof api[method], 'function', `${method} missing`);
}

assert.equal(api.diagnostics().ready, false);
assert.equal(api.diagnostics().ownership.intelligenceStateOnly, true);
assert.equal(api.diagnostics().ownership.foreignDomainMutation, false);
assert.equal(api.diagnostics().ownership.journeyTimelineOwner, false);
assert.equal(registrations.length, 1);
assert.equal(registrations[0].id, 'intelligence.v1');
assert.equal(registrations[0].probe().available, false);

assert.throws(
  () => api.getCapabilities(),
  error =>
    error?.code === 'INTELLIGENCE_CONTRACT_PROVIDER_UNAVAILABLE' &&
    error?.provider === 'LuviaIntelligenceDomainContractCoreV1'
);

console.log('M8.5.0 Intelligence Contract Platform Foundation: PASS');
