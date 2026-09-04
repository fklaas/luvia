'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.resolve(__dirname,'..');
const read=relative=>fs.readFileSync(path.join(ROOT,relative),'utf8').replace(/\r\n?/g,'\n');
const index=read('index.html');
const worker=read('sw.js');
const version=read('intelligence/kernel/version.js');
const shell=read('modules/places-shell.js');
const experience=read('app/places/places-spatial-experience.js');
const composition=read('app/places/places-spatial-composition-core.js');
const placesCore=read('core/places/places-domain-contract-core.js');
const parity=JSON.parse(read('config/luvia-m16.5-visual-parity-contract.json'));
const runner=read('tests/run-m4.3-safe-regression.cjs');
const ownership=read('docs/modularization/FILE-OWNERSHIP.csv');
const pcr=read('docs/modularization/PCR-M16.5P-PRODUCTIVE-PLACES-RUNTIME-RELEASE.md');

assert.match(version,/core:'4\.82\.168'/);
assert.ok(version.includes("build:'13.82.168.41'"),'kernel build must be the geoapify cache-bust release');
assert.match(version,/name:'M16\.5 Places and Stays Quality'/);
assert.match(version,/channel:'integration-preview'/);
assert.ok(worker.includes("const CACHE='luvia-shell-v13.82.168.41-local-recovery'"));
assert.equal(/\?v=13\.82\.53/.test(index),false,'active entry retains the prior cache key');

for(const asset of [
  'app/places/places-spatial-experience.css',
  'app/places/places-spatial-composition-core.js',
  'app/places/places-spatial-experience.js',
  'modules/places-shell.js',
  'app/app-shell.js'
])assert.ok(index.includes(`${asset}?v=13.82.168.41`),`active entry release key missing for ${asset}`);

assert.match(index,/vendor\/maplibre\/maplibre-gl-5\.12\.0\.css\?v=13\.82\.168(?:\.1)?/);
assert.match(index,/vendor\/maplibre\/maplibre-gl-5\.12\.0\.js\?v=13\.82\.168(?:\.1)?/);
for(const asset of [
  'app/places/places-spatial-composition-core.js',
  'app/places/places-spatial-experience.js',
  'app/places/places-spatial-experience.css'
])assert.ok(worker.includes(`'${asset}'`),`Service Worker misses ${asset}`);

assert.match(shell,/LuviaPlacesSpatialExperience\.mount/);
assert.doesNotMatch(shell,/async function showHub\(\)[^}]*LuviaPlacesFinal\.mount/);
assert.match(experience,/LuviaPlacesContractV1/);
assert.match(experience,/LuviaBookingContractV1/);
assert.match(experience,/LuviaPlatformPorts/);
assert.match(experience,/\.setLngLat\(marker\.lngLat\)/);
assert.doesNotMatch(experience,/LuviaPlaceCore|localStorage|sessionStorage|supabase/i);
assert.match(composition,/missing-or-invalid-owner-coordinates/);
assert.match(composition,/input\.coordinates\|\|input\.position\|\|input\.location/);

const planPlaces=parity.surfaces.find(surface=>surface.id==='plan-places-booking');
assert.equal(planPlaces.status,'productive_places_candidate_booking_pending');
assert.equal(parity.releaseGate.mainAllowed,false);
assert.equal(parity.releaseGate.productionAllowed,false);

for(const test of [
  'tests/m16.5n-places-coordinate-projection-hardening.test.cjs',
  'tests/m16.5n-productive-places-spatial-experience.test.cjs',
  'tests/m16.5p-productive-places-runtime-release.test.cjs'
])assert.ok(runner.includes(test),`safe regression misses ${test}`);

for(const file of [
  'docs/modularization/PCR-M16.5P-PRODUCTIVE-PLACES-RUNTIME-RELEASE.md',
  'tests/m16.5p-productive-places-runtime-release.test.cjs'
])assert.ok(ownership.includes(file),`ownership registry missing ${file}`);

assert.match(pcr,/Main and Production remain locked/);
assert.match(pcr,/No database\/schema\/RPC\/RLS\/bucket migration/);

console.log('M16.5P Productive Places Runtime Release: PASS');
console.log('App / Core: 13.82.168.41 / 4.82.168');
console.log('Places coordinates, spatial composition and owner boundaries: LOCKED');
console.log('Main / Production visual parity lock: ACTIVE');
