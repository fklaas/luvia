'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

const read=path=>fs.readFileSync(path,'utf8');
const index=read('index.html');
const worker=read('sw.js');
const registry=JSON.parse(read('config/luvia-cores.json'));
const runner=read('tests/run-m4.3-safe-regression.cjs');
const version=read('intelligence/kernel/version.js');

const actionCore='core/intelligence/intelligence-action-contract-core.js';
const ledgerCore='core/intelligence/intelligence-action-ledger-core.js';
const actionRuntime='core/ai/ai-action-runtime.js';
const dashboard='core/ai/ai-dashboard-service.js';

for(const asset of [actionCore,ledgerCore,actionRuntime,dashboard]){
  assert.ok(index.includes(`${asset}?v=13.82.126`),`index misses M16 runtime asset ${asset}`);
  assert.ok(worker.includes(`'${asset}'`),`service worker misses M16 runtime asset ${asset}`);
}
assert.ok(index.indexOf(actionCore)<index.indexOf(ledgerCore),'action contract must load before ledger');
assert.ok(index.indexOf(ledgerCore)<index.indexOf(actionRuntime),'ledger must load before Web action runtime');
assert.ok(index.indexOf(actionRuntime)<index.indexOf(dashboard),'runtime must load before chat consumer');

const intelligence=registry.cores.intelligence;
assert.equal(intelligence.actionLedgerContract,'intelligence.action-ledger.v1');
assert.equal(intelligence.browserlessActionLedger,ledgerCore);
assert.equal(intelligence.webActionRuntime,actionRuntime);

for(const test of [
  'tests/m16.1-intelligence-action-ledger-core.test.cjs',
  'tests/m16.2-intelligence-action-capability-policy.test.cjs',
  'tests/m16.3-intelligence-confirmed-owner-action-runtime.test.cjs',
  'tests/m16.4-intelligence-confirmation-recovery-chat.test.cjs',
  'tests/m16.5-intelligence-action-runtime-registration.test.cjs'
])assert.ok(runner.includes(test),`safe regression misses ${test}`);

assert.ok(worker.includes("const CACHE='luvia-shell-v13.82.126'"));
assert.match(version,/core:'4\.82\.126',build:'13\.82\.126',name:'M16\.5 Owner-first Intelligence USP Slices'/);

console.log('M16.5 Intelligence Action Runtime Registration: PASS');
console.log('Action Contract -> Ledger -> Runtime -> Chat order: PASS');
console.log('Service Worker / Core Registry / Safe Regression: PASS');
