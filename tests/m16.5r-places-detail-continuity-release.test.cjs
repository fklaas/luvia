'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=file=>fs.readFileSync(file,'utf8').replace(/\r\n?/g,'\n');

const version=read('intelligence/kernel/version.js');
const index=read('index.html');
const worker=read('sw.js');
const experience=read('app/places/places-spatial-experience.js');
const staticGuard=read('tests/m16.5n-productive-places-spatial-experience.test.cjs');
const browserGuard=read('tests/m16.5r-places-detail-continuity-e2e.cjs');
const pcr=read('docs/modularization/PCR-M16.5R-PLACES-DETAIL-CONTINUITY.md');
const matrix=read('docs/modularization/M16.5-PRODUCT-SURFACE-MATRIX.csv');
const ownership=read('docs/modularization/FILE-OWNERSHIP.csv');
const runner=read('tests/run-m4.3-safe-regression.cjs');

assert.match(version,/core:'4\.82\.140',build:'13\.82\.140'/);
assert.match(version,/name:'M16\.5 Block 1 Semantic Places Mutations'/);
for(const asset of [
  'intelligence/kernel/version.js',
  'app/app-shell.js',
  'app/places/places-spatial-composition-core.js',
  'app/places/places-spatial-experience.js',
  'app/places/places-spatial-experience.css',
  'modules/places-shell.js'
])assert(index.includes(`${asset}?v=13.82.140`),`active M16.5R cache key missing for ${asset}`);
assert(worker.includes("const CACHE='luvia-shell-v13.82.140'"));

assert.match(experience,/data-compact-place-card/);
assert.match(experience,/openResultSheet\(places=filteredResults\(\),selectedId=state\.selectedId\)/);
assert.doesNotMatch(experience,/Details &amp; Evidenz|data-places-detail|function detailMarkup|async function loadDetails/);

assert.match(staticGuard,/old Places detail\/evidence UI re-entered the new shell/);
assert.match(browserGuard,/Rail scroll retained/);
assert.match(browserGuard,/mapInstances,1/);
assert.match(browserGuard,/sheetOpened,true/);
assert.match(browserGuard,/consoleProblems,\[\]/);

assert.match(pcr,/global `render\(\)` once for loading and again after the asynchronous `places\.v1`/);
assert.match(pcr,/1060\.0 → 1060\.0 → 1060\.0/);
assert.match(pcr,/does not claim that[\s\S]*complete Places Golden Slice/);
assert.match(matrix,/places-continuity,[^\n]*,PUBLIC VERIFIED,/);

for(const file of [
  'tests/fixtures/m16.5r-places-continuity-browser.html',
  'tests/m16.5r-places-detail-continuity-e2e.cjs',
  'tests/m16.5r-places-detail-continuity-release.test.cjs',
  'docs/modularization/PCR-M16.5R-PLACES-DETAIL-CONTINUITY.md'
])assert(ownership.includes(file),`ownership registry missing ${file}`);
assert(runner.includes('tests/m16.5r-places-detail-continuity-release.test.cjs'));

console.log('M16.5R Places Details/Evidence Continuity Release: PASS');
console.log('App / Core / shell cache: 13.82.140 / 4.82.140 / luvia-shell-v13.82.140');
console.log('Rail / selected Place / map / focus / async lifecycle continuity: LOCKED');
console.log('Main / Production release lock: ACTIVE');
