'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const actionSource=fs.readFileSync('core/intelligence/intelligence-action-contract-core.js','utf8');
const matrix=fs.readFileSync('docs/modularization/M16.5-AI-MUTATION-COVERAGE-MATRIX.md','utf8');
const productSurfaces=fs.readFileSync('docs/modularization/M16.5-PRODUCT-SURFACE-MATRIX.csv','utf8');
const context={Object,Array,String,Number,Boolean,Date,Math,RegExp,JSON,Set,Map,Error,TypeError};
vm.createContext(context);vm.runInContext(actionSource,context);

const actions=Array.from(context.LuviaIntelligenceActionContractCoreV1.listActions());
assert.equal(actions.length,30,'registered action count changed; the coverage matrix must be deliberately revised');
const inventory=matrix.slice(matrix.indexOf('## Registered action inventory'),matrix.indexOf('## Product-surface gaps'));
const documented=[...inventory.matchAll(/^\| `([^`]+)` \|/gm)].map(match=>match[1]);
assert.equal(documented.length,30,'the registry table must contain exactly the 30 registered actions');
assert.equal(new Set(documented).size,documented.length,'the registry table contains duplicate actions');
assert.deepEqual([...documented].sort(),actions.map(action=>action.id).sort(),'coverage matrix and executable action registry diverged');

for(const action of actions){
  const row=inventory.split('\n').find(line=>line.startsWith(`| \`${action.id}\` |`));
  assert.ok(row,`missing coverage row ${action.id}`);
  assert.ok(row.includes(action.ownerContract),`${action.id} must name public owner contract ${action.ownerContract}`);
  assert.ok(row.includes(`${action.effect} / ${action.risk}`),`${action.id} must record effect/risk`);
  if(action.effect!=='READ')assert.match(row,/preview|user gesture|compensation path/i,'mutation/draft/external row must state its visible entry gate');
}

for(const requiredGap of [
  'arbitrary non-Place timeline entry','Grant, narrow, revoke or share GPS','Offline CRDT plan sync/write','Verified event provider-positive public discovery','Map-time brushing','Event-to-Memory thread','Group taste divergence'
])assert.ok(matrix.includes(requiredGap),`open owner-first coverage gap missing: ${requiredGap}`);

assert.match(matrix,/Google Places quota failure, no invented cards/);
assert.match(matrix,/Main, Production and secret creation remain outside/);
assert.match(matrix,/additive Hotel provider schema\/RLS and Integration Edge gateway/);
assert.match(matrix,/Human ↔ AI action parity has no product exception/);
assert.match(matrix,/Adding a public UI command without adding its AI route/);
const intelligenceRow=productSurfaces.split('\n').find(row=>row.startsWith('luvia-intelligence,'));
assert.ok(intelligenceRow,'Luvia Intelligence product-surface row missing');
assert.match(intelligenceRow,/,SHELL-WIRED,/,'the product surface must remain at the controlled incomplete status while human-only actions remain open');
assert.doesNotMatch(intelligenceRow,/,FUNCTIONAL PARITY,/);
assert.match(matrix,/\.126.*→.*\.124/);

console.log('M16.5 Step16 complete AI mutation coverage matrix: PASS');
