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

const listeners = new Map();
const registrations = [];

const window = {
  addEventListener(name, handler) {
    if (!listeners.has(name)) listeners.set(name, new Set());
    listeners.get(name).add(handler);
  },
  removeEventListener(name, handler) {
    listeners.get(name)?.delete(handler);
  },
  LuviaGlobalContracts: {
    register(definition) {
      registrations.push(definition);
    }
  }
};

vm.runInNewContext(source, {
  window,
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
}, { filename: adapterPath });

const api = window.LuviaIntelligenceContractV1;

assert.ok(api, 'LuviaIntelligenceContractV1 missing');
assert.equal(window.LuviaIntelligenceContract, api);
assert.equal(api.contractId, 'intelligence.v1');
assert.equal(api.version, '1');
assert.equal(api.runtimeVersion, '1.0.0');
assert.equal(Object.isFrozen(api), true);
assert.deepEqual([...api.events], [
  'ai.changed',
  'ai.proposal.changed',
  'ai.memory.changed'
]);
assert.deepEqual(Object.keys(api.commands), ['createProposal']);

for (const method of [
  'getCapabilities',
  'getDomains',
  'getTools',
  'getModelTiers',
  'getPolicy',
  'getMemorySnapshot',
  'getSystemSnapshot',
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
