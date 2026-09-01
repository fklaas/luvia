'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.resolve(__dirname,'..');
const read=relative=>fs.readFileSync(path.join(ROOT,relative),'utf8').replace(/\r\n?/g,'\n');
const index=read('index.html');
const worker=read('sw.js');
const version=read('intelligence/kernel/version.js');
const shell=read('app/app-shell.js');
const hubs=read('app/module-hubs.js');
const parity=JSON.parse(read('config/luvia-m16.5-visual-parity-contract.json'));
const runner=read('tests/run-m4.3-safe-regression.cjs');
const ownership=read('docs/modularization/FILE-OWNERSHIP.csv');
const pcr=read('docs/modularization/PCR-M16.5L-PRODUCTIVE-PLAN-COMPASS-RUNTIME-RELEASE.md');

assert.match(version,/core:'4\.82\.133'/);
assert.match(version,/build:'13\.82\.133'/);
assert.match(version,/name:'M16\.5 Specific Subject Evidence Gate'/);
assert.match(version,/channel:'integration-preview'/);
assert.match(worker,/const CACHE='luvia-shell-v13\.82\.133(?:-runtime\d+)?'/);
assert.equal(/\?v=13\.82\.51/.test(index),false,'active entry retains the previous cache key');
for(const asset of ['app/app-shell.css','app/app-shell.js','app/module-hubs.css','app/module-hubs.js','intelligence/kernel/version.js']){
  assert.ok(index.includes(`${asset}?v=13.82.133`),`active entry release key missing for ${asset}`);
}

assert.match(shell,/version:'13\.82\.133'/);
assert.match(shell,/function planCompassBrandSource/);
assert.match(hubs,/data-plan-compass-stage/);
assert.equal(parity.binding,true);
assert.equal(parity.releaseGate.mainAllowed,false);
assert.equal(parity.releaseGate.productionAllowed,false);
assert.match(runner,/tests\/m16\.5k-plan-compass-productive-adoption\.test\.cjs/);
assert.match(runner,/tests\/m16\.5l-productive-plan-compass-runtime-release\.test\.cjs/);

for(const file of [
  'docs/modularization/PCR-M16.5L-PRODUCTIVE-PLAN-COMPASS-RUNTIME-RELEASE.md',
  'tests/m16.5l-productive-plan-compass-runtime-release.test.cjs'
])assert.ok(ownership.includes(file),`ownership registry missing ${file}`);
assert.match(pcr,/Main and Production remain locked/);
assert.match(pcr,/No database\/schema\/RPC\/RLS\/bucket migration/);
assert.match(pcr,/13\.82\.52 \/ 4\.82\.52/,'historical M16.5L provenance must remain recorded');

console.log('M16.5L Productive Plan Compass Runtime Release: PASS');
console.log('Historical App / Core: 13.82.52 / 4.82.52; active candidate advanced safely');
console.log('Main / Production visual parity lock: ACTIVE');
