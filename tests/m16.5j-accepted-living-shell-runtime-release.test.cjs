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
const parity=JSON.parse(read('config/luvia-m16.5-visual-parity-contract.json'));
const runner=read('tests/run-m4.3-safe-regression.cjs');
const ownership=read('docs/modularization/FILE-OWNERSHIP.csv');
const pcr=read('docs/modularization/PCR-M16.5J-ACCEPTED-LIVING-SHELL-RUNTIME-RELEASE.md');

assert.match(version,/core:'4\.82\.178'/);
assert.match(version,/build:'13\.82\.168\.56'/);
assert.match(version,/name:'M16\.5 Places and Stays Quality'/);
assert.match(version,/channel:'integration-preview'/);
assert.ok(worker.includes("const CACHE='luvia-shell-v13.82.168.56-local-recovery'"));
assert.equal(/\?v=13\.82\.50/.test(index),false,'active entry retains the prior cache key');
for(const asset of [
  'app/app-shell.css','app/app-shell.js','app/today/today-experience.js',
  'core/experience/experience-contract-core.js','intelligence/kernel/version.js'
])assert.ok(index.includes(`${asset}?v=13.82.168.56`),`active entry release key missing for ${asset}`);

assert.match(shell,/version:'13\.82\.168\.56'/);
for(const primitive of ['lv-living-shell','lv-living-sidebar','lv-living-topbar','lv-living-stage'])assert.ok(shell.includes(primitive),`accepted shell primitive missing: ${primitive}`);
assert.equal(parity.binding,true);
assert.equal(parity.releaseGate.mainAllowed,false);
assert.equal(parity.releaseGate.productionAllowed,false);
assert.match(runner,/tests\/m16\.5h-accepted-living-shell-adoption\.test\.cjs/);
assert.match(runner,/tests\/m16\.5i-visual-parity-no-substitution-gate\.test\.cjs/);
assert.match(runner,/tests\/m16\.5j-accepted-living-shell-runtime-release\.test\.cjs/);

for(const file of [
  'docs/modularization/PCR-M16.5J-ACCEPTED-LIVING-SHELL-RUNTIME-RELEASE.md',
  'tests/m16.5j-accepted-living-shell-runtime-release.test.cjs'
])assert.ok(ownership.includes(file),`ownership registry missing ${file}`);
assert.match(pcr,/Main and Production remain locked/);
assert.match(pcr,/No database\/schema\/RPC\/RLS\/bucket migration/);
assert.match(pcr,/13\.82\.51 \/ 4\.82\.51/,'historical M16.5J provenance must remain recorded');

console.log('M16.5J Accepted Living Shell Runtime Release: PASS');
console.log('Historical App / Core: 13.82.51 / 4.82.51; active candidate advanced safely');
console.log('Main / Production visual parity lock: ACTIVE');
