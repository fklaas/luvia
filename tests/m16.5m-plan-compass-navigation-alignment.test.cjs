'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.resolve(__dirname,'..');
const read=relative=>fs.readFileSync(path.join(ROOT,relative),'utf8').replace(/\r\n?/g,'\n');
const index=read('index.html');
const worker=read('sw.js');
const version=read('intelligence/kernel/version.js');
const shellCss=read('app/app-shell.css');
const parity=JSON.parse(read('config/luvia-m16.5-visual-parity-contract.json'));
const runner=read('tests/run-m4.3-safe-regression.cjs');
const ownership=read('docs/modularization/FILE-OWNERSHIP.csv');
const pcr=read('docs/modularization/PCR-M16.5M-PLAN-COMPASS-NAVIGATION-ALIGNMENT.md');

assert.match(version,/core:'4\.82\.127'/);
assert.match(version,/build:'13\.82\.127'/);
assert.match(version,/name:'M16\.5 Owner-first Intelligence USP Slices'/);
assert.match(version,/channel:'integration-preview'/);
assert.match(worker,/const CACHE='luvia-shell-v13\.82\.127'/);
assert.equal(/\?v=13\.82\.52/.test(index),false,'active entry retains the prior cache key');
for(const asset of ['app/app-shell.css','app/app-shell.js','app/module-hubs.css','app/module-hubs.js','intelligence/kernel/version.js']){
  assert.ok(index.includes(`${asset}?v=13.82.127`),`active entry release key missing for ${asset}`);
}

const mobileLivingShell=stringBetween(shellCss,'@media(max-width:800px){','@media(max-width:390px)');
assert.match(mobileLivingShell,/grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
assert.match(mobileLivingShell,/\.lv-living-shell \.lv-nav-compass-mark\{position:relative;top:auto;left:auto;width:42px;height:42px;/);
assert.match(mobileLivingShell,/\.lv-living-shell \.lv-nav--compass \.lv-nav-label\{margin-top:0\}/);
assert.doesNotMatch(mobileLivingShell,/\.lv-living-shell \.lv-nav-compass-mark\{[^}]*position:absolute/);
assert.doesNotMatch(mobileLivingShell,/\.lv-living-shell \.lv-nav-compass-mark\{[^}]*(?:top:-|translateX\(-50%\))/);

const narrowLivingShell=stringBetweenLast(shellCss,'@media(max-width:390px){','/* The compass is the control itself;');
assert.match(narrowLivingShell,/\.lv-living-shell \.lv-nav-compass-mark\{width:56px;height:56px\}/);
assert.match(narrowLivingShell,/\.lv-living-shell \.lv-nav-label\{font-size:7\.4px\}/);

assert.equal(parity.binding,true);
assert.equal(parity.releaseGate.mainAllowed,false);
assert.equal(parity.releaseGate.productionAllowed,false);
assert.match(runner,/tests\/m16\.5m-plan-compass-navigation-alignment\.test\.cjs/);

for(const file of [
  'docs/modularization/PCR-M16.5M-PLAN-COMPASS-NAVIGATION-ALIGNMENT.md',
  'tests/m16.5m-plan-compass-navigation-alignment.test.cjs'
])assert.ok(ownership.includes(file),`ownership registry missing ${file}`);
assert.match(pcr,/Main and Production remain locked/);
assert.match(pcr,/No database\/schema\/RPC\/RLS\/bucket migration/);

console.log('M16.5M Plan Compass Navigation Alignment: PASS');
console.log('App / Core: 13.82.127 / 4.82.127');
console.log('Main / Production visual parity lock: ACTIVE');

function stringBetween(source,start,end){
  const startIndex=source.indexOf(start);
  const endIndex=source.indexOf(end,startIndex+start.length);
  assert.notEqual(startIndex,-1,`missing CSS boundary ${start}`);
  assert.notEqual(endIndex,-1,`missing CSS boundary ${end}`);
  return source.slice(startIndex,endIndex);
}

function stringBetweenLast(source,start,end){
  const startIndex=source.lastIndexOf(start);
  const endIndex=source.indexOf(end,startIndex+start.length);
  assert.notEqual(startIndex,-1,`missing CSS boundary ${start}`);
  assert.notEqual(endIndex,-1,`missing CSS boundary ${end}`);
  return source.slice(startIndex,endIndex);
}
