'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const count=(value,token)=>value.split(token).length-1;
const finalPlaces=read('core/places/places-final-foundation.js');
const placeDetail=read('core/places/place-detail-service.js');
const restaurants=read('modules/restaurants-v2/restaurant-module.js');
const timeline=read('core/places/timeline-core.js');
const safeRunner=read('tests/run-m4.3-safe-regression.cjs');

assert(finalPlaces.includes("name:'places.final-planning'"),'Final Places planning owner name missing');
assert.match(finalPlaces,/ui\.adopt\(modal,\{name:'places\.final-planning',kind:'sheet'/,'Final Places planning must adopt its stable sheet root');
assert.match(finalPlaces,/content:modal\.querySelector\('\.places-final-modal-card'\)/,'Final Places form must receive host dialog semantics');
assert.match(finalPlaces,/planningHandle\?\.close\('replace'\)/,'Final Places planning must enforce one active owner surface');
assert.match(finalPlaces,/mounted\.close\('saved'\)/,'Successful planning must close through the host');
assert.doesNotMatch(finalPlaces,/document\.body\.appendChild\(modal\)|modal\.remove\(\)/,'Final Places planning must not retain a private modal lifecycle');

assert(placeDetail.includes("name:'places.detail-photo'"),'Canonical Place photo owner name missing');
assert.match(placeDetail,/ui\.adopt\(light,\{name:'places\.detail-photo',kind:'dialog'/,'Place photo viewer must use the canonical host');
assert.match(placeDetail,/initialFocus:'button'/,'Place photo viewer must provide deterministic close focus');
assert.doesNotMatch(placeDetail,/document\.body\.appendChild\(l\)|document\.body\.appendChild\(light\)|light\.remove\(\)|l\.remove\(\)/,'Place photo viewer must not retain a private lightbox lifecycle');

assert(restaurants.includes("name:'places.restaurant-workspace'"),'Restaurant workspace owner name missing');
assert.match(restaurants,/ui\.adopt\(back,\{name:'places\.restaurant-workspace',kind:'sheet'/,'Restaurant workspace must adopt its existing sheet root');
assert.match(restaurants,/initialFocus:options\.focusPlanning\?'\[name=plannedTime\]':'\[data-close\]'/,'Restaurant workspace must preserve planning focus intent');
assert.match(restaurants,/onClose:\(\)=>\{if\(options\.returnView\)window\.dispatchEvent/,'Return-view compatibility must follow every host close path');
assert.doesNotMatch(restaurants,/document\.body\.appendChild\(back\)|back\.remove\(\)|document\.body\.classList\.add\('luvia-place-overlay-open'\)/,'Restaurant workspace must not retain private mount or scroll-lock ownership');

assert.equal(count(restaurants,'data-rv2-gallery='),0,'Restaurant detail must not emit the obsolete duplicate gallery contract');
assert.equal(count(restaurants,"querySelectorAll('[data-rv2-gallery]')"),1,'The measured unreachable duplicate gallery binder must remain explicit until dead-code cleanup');
assert.equal(count(finalPlaces,'localStorage')+count(finalPlaces,'sessionStorage'),0,'Final Places host adoption must not add browser-storage ownership');
assert.equal(count(placeDetail,'localStorage')+count(placeDetail,'sessionStorage'),0,'Place Detail host adoption must not add browser-storage ownership');
assert.equal(count(timeline,'ui.adopt('),0,'Timeline/Journey must remain reserved for its dedicated host audit');
assert.equal(count(timeline,'document.body.appendChild'),3,'Timeline/Journey legacy surface inventory must remain measured and untouched in M10.4D');
assert(safeRunner.includes('tests/m10.4d-places-overlay-host-adoption.test.cjs'),'M10.4D guard missing from Safe Regression');

console.log('M10.4D Places Overlay Host Adoption: PASS');
console.log('Final planning + canonical Place photos + Restaurant workspace: host-owned');
console.log('Restaurant duplicate photo binder: unreachable / explicitly classified');
console.log('Timeline/Journey legacy roots: 3 / reserved');
