'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const count=(value,pattern)=>(value.match(pattern)||[]).length;
const profile=read('core/profiles/profile-foundation.js');
const guided=read('core/preferences/guided-discovery-sequence.js');
const creator=read('core/trips/trip-creator.js');
const modules=read('modules/module-manager.js');
const timeline=read('core/places/timeline-core.js');
const safeRunner=read('tests/run-m4.3-safe-regression.cjs');

assert(profile.includes("name:'identity.profile-foundation'"),'Profile Foundation owner name missing');
assert.match(profile,/ui\.adopt\(root,/,'Profile Foundation must adopt its stable root');
assert.match(profile,/content:root,label:'Profil und Einstellungen'/,'Profile rerenders require stable root-level host semantics');
assert.match(profile,/mounted\.requestClose\('backdrop'\)/,'Profile background close must use host policy');
assert.doesNotMatch(profile,/document\.body\.appendChild\(overlay\)|overlay\?\.remove\(\)/,'Profile must not retain a private overlay lifecycle');

assert.match(guided,/identity\.guided-discovery\.\$\{options\.domain \|\| 'profile'\}/,'Guided Discovery requires a domain-classified owner name');
assert.match(guided,/ui\.adopt\(overlay,/,'Guided Discovery must use the canonical host');
assert.match(guided,/closeOnBackdrop: false/,'Full-screen Guided Discovery must preserve deliberate no-backdrop-close behavior');
assert.doesNotMatch(guided,/suspendedSurface|suspendUnderlyingSurface|restoreUnderlyingSurface|document\.querySelector\('\.pf-overlay'\)/,'Canonical stack must replace manual nested-profile inert ownership');
assert.doesNotMatch(guided,/document\.body\.appendChild\(overlay\)|activeOverlay\.remove\(\)/,'Guided Discovery must not retain a private overlay root lifecycle');

assert(creator.includes("name:'trip.creator'"),'Trip Creator owner name missing');
assert.match(creator,/ui\.adopt\(layer,/,'Trip Creator must use the canonical host');
assert.match(creator,/closeSelector:'\.ltc-close',initialFocus:'#ltcTitle'/,'Trip Creator needs deterministic close and focus semantics');
assert.doesNotMatch(creator,/document\.body\.appendChild\(layer\)|layer\?*\.remove\(\)|document\.addEventListener\('keydown'/,'Trip Creator must not retain private root or Escape ownership');
assert.match(creator,/tripCommands\(\)\.commitTripSnapshot/,'Trip creation must preserve the Trip owner command');

assert(modules.includes("name:'trip.module-manager'"),'Module Manager owner name missing');
assert.match(modules,/ui\.adopt\(modal,/,'Module Editor must use the canonical host');
assert.match(modules,/editorHandle\?\.close\('replace'\)/,'Module Editor must enforce a single owner surface');
assert.doesNotMatch(modules,/document\.body\.appendChild\(modal\)|modal\.remove\(\)/,'Module Editor must not retain a private overlay root lifecycle');
assert.equal(count(modules,/localStorage/g),8,'Existing Module Manager browser-storage debt must remain unchanged, not disguised as M10 work');

assert.doesNotMatch(`${profile}\n${creator}`,/history\.(?:pushState|replaceState|back)|localStorage|sessionStorage/,'Profile and Trip Creator host adoption must not gain History or browser-storage ownership');
assert.doesNotMatch(guided,/history\.(?:pushState|replaceState|back)|localStorage/,'Guided Discovery host adoption must not gain History or local-storage ownership');
assert.equal(count(guided,/sessionStorage/g),3,'Existing Guided Discovery draft storage debt must remain measured at 3 -> 3');
assert.equal(count(creator,/document\.addEventListener/g),0,'Trip Creator local Escape listener must be deleted after host adoption');
assert.match(timeline,/function openEditor|function editEntry|openEditor\(/,'Timeline/Journey must remain separately present');
assert(!timeline.includes('identity.profile-foundation'),'Timeline/Journey must not be absorbed into Identity overlay ownership');
assert(safeRunner.includes('tests/m10.4c-identity-trip-overlay-host-adoption.test.cjs'),'M10.4C guard missing from Safe Regression');

console.log('M10.4C Identity / Trip Overlay Host Adoption: PASS');
console.log('Profile + Guided Discovery + Trip Creator + Module Editor: host-owned');
console.log('Manual Trip Creator Escape listener: 1 -> 0');
console.log('Guided Discovery manual nested-surface inert owner: removed');
