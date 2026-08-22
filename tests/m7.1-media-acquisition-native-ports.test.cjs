'use strict';

const assert=require('node:assert');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const adapters=read('app/adapters/platform-port-adapters.mjs');
const gallery=read('app/gallery-view.js');
const diagnostics=read('core/diagnostics/media-readiness.js');
const registry=read('core/platform/native/platform-port-registry.mjs');

for(const id of ['MediaPickerPort','MediaCapturePort','LocationPort','DevicePort','SharingPort','OfflineCachePort']){
  assert(registry.includes(`'${id}'`),`Platform Registry missing ${id}`);
  assert(adapters.includes(`${id}:`),`Web Platform adapter missing ${id}`);
  assert(gallery.includes(`platformPort('${id}')`),`Gallery does not consume ${id}`);
}

for(const forbidden of [
  /\bnavigator\b/,
  /\blocalStorage\b/,
  /\bsessionStorage\b/,
  /<input[^>]+type=["']file["']/i,
  /\bnew\s+File\s*\(/
]){
  assert(!forbidden.test(gallery),`Gallery retains device/storage bypass: ${forbidden}`);
}

assert(gallery.includes('data-gallery-add'),'Gallery picker action missing');
assert(gallery.includes('data-gallery-capture'),'Gallery capture action missing');
assert(gallery.includes("pickImages?.()"),'Gallery picker does not use MediaPickerPort');
assert(gallery.includes("captureImage?.({facingMode:'environment'})"),'Gallery capture does not use MediaCapturePort');
assert(gallery.includes("shareFiles?.("),'Gallery sharing does not use SharingPort');
assert(gallery.includes("getCurrent({accuracy:'high'"),'Gallery capture location does not use LocationPort');
assert(gallery.includes("platformPort('DevicePort')?.info?.()"),'Gallery capture metadata does not use DevicePort');

for(const id of ['MediaPickerPort','MediaCapturePort','LocationPort','DevicePort','SharingPort']){
  assert(diagnostics.includes(`platformPort('${id}')`),`Media readiness missing ${id}`);
}
assert(diagnostics.includes('mediaContractReads'),'Media readiness missing Media Contract read boundary');
assert(diagnostics.includes('mediaContractCommands'),'Media readiness missing Media Contract command boundary');

for(const forbidden of ['LuviaSupabase','ParisSupabase','.from(','.rpc(']){
  assert(!adapters.includes(forbidden),`Platform device adapter owns forbidden Media truth/API: ${forbidden}`);
}

console.log('M7.1 Media Acquisition Native Ports: PASS');
console.log('Gallery direct navigator refs: 0');
console.log('Gallery embedded file inputs: 0');
console.log('Web Media device ports: 5 / 5');
