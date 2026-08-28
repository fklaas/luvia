'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8').replace(/\r\n?/g,'\n');

const onboarding=read('app/profile-onboarding.js');
const css=read('app/profile-onboarding.css');
const adapter=read('core/platform/identity-contract-adapter.js');
const navigation=read('core/runtime/navigation-contract-core.js');
const shell=read('app/app-shell.js');
const index=read('index.html');
const serviceWorker=read('sw.js');
const fixture=read('tests/fixtures/m16.5y-profile-onboarding-browser.html');
const matrix=read('docs/modularization/M16.5-PRODUCT-SURFACE-MATRIX.csv');
const version=read('intelligence/kernel/version.js');

assert.match(version,/core:'4\.82\.106',build:'13\.82\.106',name:'M16\.5AB Today Places Recovery'/);

assert.match(onboarding,/const STEPS = Object\.freeze\(\['welcome','account','heart','rhythm','care','control','ready'\]\)/);
for(const group of ['interests','travelStyles','mobilityPreferences','activityPreferences','entertainmentPreferences','dietary','familyPreferences','accessibilityNeeds'])assert.ok(onboarding.includes(`${group}:`),`missing Profile vocabulary: ${group}`);
assert.match(onboarding,/owner\.commands\.completeOnboarding/);
assert.match(onboarding,/Konto, globaler Reisekompass und konkrete Reisen bleiben getrennte Datenbereiche/);
assert.match(onboarding,/Eine konkrete Reise mit Ort, Zeitraum und Mitreisenden entsteht erst im eigenständigen nächsten Schritt/);
for(const forbidden of ['LuviaTripCreator','LuviaTripContract','LuviaProfileService','LuviaUserPreferences','LuviaSupabaseService','localStorage','sessionStorage'])assert.equal(onboarding.includes(forbidden),false,`Profile onboarding bypasses its owner with ${forbidden}`);

assert.match(adapter,/async function completeOnboarding\(input = \{\}\)/);
assert.match(adapter,/const saved = await provider\.save\(\{/);
assert.match(adapter,/command: 'completeOnboarding'/);
assert.match(adapter,/owner: 'identity'/);
assert.match(navigation,/id:'profile-onboarding'.*mode:'fullscreen'.*owner:'identity'/);
assert.match(shell,/explicitOnboarding\|\|window\.LuviaProfileOnboarding\?\.shouldStart/);
assert.ok(shell.indexOf('explicitOnboarding||window.LuviaProfileOnboarding?.shouldStart')<shell.indexOf("if(!s.hasTrips||!s.hasActiveTrip)return noTrips()"),'Profile onboarding must gate before first Trip creation');
assert.match(shell,/onComplete:\(\)=>leaveProfileOnboarding/);
assert.match(shell,/onCancel:\(\)=>leaveProfileOnboarding/);
assert.match(shell,/data-pf-edit-preferences/);
assert.match(index,/app\/profile-onboarding\.css\?v=/);
assert.match(index,/app\/profile-onboarding\.js\?v=/);
assert.match(serviceWorker,/'app\/profile-onboarding\.css'/);
assert.match(serviceWorker,/'app\/profile-onboarding\.js'/);
assert.match(css,/\.lpo-host/);
assert.match(css,/@media\(max-width:560px\)/);
assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
assert.match(css,/scrollbar-width:\s*none/);
assert.match(css,/@media\(min-width:981px\) and \(max-height:760px\)/);
assert.match(css,/@media\(min-width:760px\) and \(max-width:980px\) and \(max-height:760px\)/);
assert.match(fixture,/LuviaProfileOnboarding\.mount/);
assert.match(fixture,/completeOnboarding:async input/);

assert.match(matrix,/public-landing,[^\n]*,PUBLIC VERIFIED,/);
assert.match(matrix,/authentication,[^\n]*,PUBLIC VERIFIED,/);

console.log('M16.5Y Identity Compass profile onboarding architecture: PASS');
