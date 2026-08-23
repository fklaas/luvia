'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const gallery=read('app/gallery-view.js');
const albums=read('app/albums-view.js');
const memoryWorlds=read('app/memory-worlds-v3.js');
const timeline=read('core/places/timeline-core.js');
const safeRunner=read('tests/run-m4.3-safe-regression.cjs');

assert.match(gallery,/function mountOverlay\(overlay,/,'Gallery must use its Overlay Host compatibility helper');
for(const name of [
  'consumer.gallery.cluster-title',
  'consumer.gallery.cluster',
  'consumer.gallery.lightbox',
  'consumer.gallery.editor',
  'consumer.gallery.memory-bridge',
  'consumer.gallery.clear'
])assert(gallery.includes(`name:'${name}'`),`Gallery owner name missing: ${name}`);
assert.doesNotMatch(gallery,/document\.body\.appendChild\(overlay\)|modalScrollY|lockPageScroll|unlockPageScroll|lv-photo-modal-open/,'Gallery must not retain a private dialog host or page-scroll owner');
assert.match(gallery,/onClose:\(\)=>\{if\(!settled\)\{settled=true;resolve\(false\)\}\}/,'Gallery destructive confirmation must settle false on Escape, Back, navigation or session close');

assert.match(albums,/function mountMemoryOverlay\(root,/,'Albums must use its Overlay Host compatibility helper');
for(const name of [
  'consumer.memories.cluster-picker',
  'consumer.memories.moment-journey',
  'consumer.memories.experience-picker',
  'consumer.memories.full-journey'
])assert(albums.includes(`name:'${name}'`),`Albums owner name missing: ${name}`);
assert.doesNotMatch(albums,/document\.body\.appendChild\(o\)|o\.remove\(\)|lv-photo-modal-open/,'Albums must not retain a private dialog host or page-scroll owner');

assert.match(memoryWorlds,/ui\.adopt\(root,/,'Memory Worlds must adopt legacy roots through the canonical host');
for(const name of [
  'consumer.memory-worlds.curation',
  'consumer.memory-worlds.deck',
  'consumer.memory-worlds.flow'
])assert(memoryWorlds.includes(`'${name}'`),`Memory Worlds owner name missing: ${name}`);
assert.doesNotMatch(memoryWorlds,/document\.body\.append\(root\)|root\.remove\(\)/,'Memory Worlds must not retain a private overlay root lifecycle');
assert.match(memoryWorlds,/onClose:reason=>\{if\(timer\)clearTimeout\(timer\);document\.body\.classList\.remove\('mc-open'\);onClose\?\.\(reason\)\}/,'Memory Worlds owner cleanup must run for every host close path');
assert.match(memoryWorlds,/closeOnBackdrop:false,closeSelector:''/,'Full-screen Memory flows must preserve their deliberate no-backdrop-close behavior');

assert.doesNotMatch(`${gallery}\n${albums}\n${memoryWorlds}`,/history\.(?:pushState|replaceState|back)|localStorage|sessionStorage/,'Consumer overlay adoption must not gain History or browser-storage ownership');
assert.match(timeline,/function openEditor|function editEntry|openEditor\(/,'Timeline/Journey must remain separately present');
assert(!timeline.includes('consumer.memory-worlds'),'Timeline/Journey must not be absorbed into Memory World overlay ownership');
assert(safeRunner.includes('tests/m10.4-consumer-overlay-host-adoption.test.cjs'),'M10.4 guard missing from Safe Regression');

console.log('M10.4 Consumer Overlay Host Adoption: PASS');
console.log('Gallery dialogs: 6 host-owned');
console.log('Albums / Memory Journeys dialogs: 4 host-owned');
console.log('Memory Worlds flows: curation, discovery and deck host-owned');
