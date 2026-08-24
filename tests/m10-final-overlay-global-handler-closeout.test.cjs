'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const count=(value,pattern)=>(value.match(pattern)||[]).length;
const index=read('index.html');
const registry=JSON.parse(read('config/luvia-cores.json'));
const safeRunner=read('tests/run-m4.3-safe-regression.cjs');

const activeScripts=[...index.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi)]
  .map(match=>match[1].split('?')[0].replace(/^\.\//,''))
  .filter(file=>file&&!/^(?:https?:)?\/\//i.test(file)&&/\.m?js$/i.test(file));
const uniqueScripts=[...new Set(activeScripts)];
const missing=uniqueScripts.filter(file=>!fs.existsSync(path.join(root,file)));

assert.deepEqual(missing,[],'Every active local JavaScript asset must exist');
assert.equal(activeScripts.length,uniqueScripts.length,'Active index must not load one local JavaScript asset twice');
assert(uniqueScripts.length>=211,`M10 closeout expected at least 211 active local scripts, received ${uniqueScripts.length}`);

const sources=new Map(uniqueScripts.map(file=>[file,read(file)]));
const joined=[...sources.values()].join('\n');
const bodyAppendInventory=[...sources]
  .map(([file,source])=>({file,count:count(source,/document\.body\.(?:append|appendChild)\s*\(/g)}))
  .filter(item=>item.count)
  .sort((a,b)=>a.file.localeCompare(b.file));

assert.deepEqual(bodyAppendInventory,[
  {file:'app/app-shell.js',count:1},
  {file:'app/gallery-view.js',count:1},
  {file:'app/memory-export-engine.js',count:1},
  {file:'core/places/places-final-foundation.js',count:1},
  {file:'core/ui/ui-manager.js',count:1},
  {file:'modules/restaurants-v2/restaurant-module.js',count:1}
],'M10 must reject a new active private document.body overlay mount');

assert.match(sources.get('app/app-shell.js'),/function toast\(message\).*lv-preview-toast/,'App Shell body append must remain a transient toast fallback');
assert.match(sources.get('app/gallery-view.js'),/function triggerDownload\(source,name\).*a\.download=name/,'Gallery body append must remain a transient download anchor');
assert.match(sources.get('app/memory-export-engine.js'),/function dl\(blob, name\).*a\.download = name/,'Memory Export body append must remain a transient download anchor');
assert.match(sources.get('core/places/places-final-foundation.js'),/function toast\(message,error=false\).*places-final-toast/,'Places body append must remain a transient toast fallback');

const restaurant=sources.get('modules/restaurants-v2/restaurant-module.js');
assert.equal(count(restaurant,/data-rv2-gallery/g),1,'Obsolete Restaurant gallery selector must stay isolated from emitted markup');
assert.doesNotMatch(restaurant,/data-rv2-gallery\s*=/,'Restaurant runtime must not emit the unreachable legacy gallery trigger');

const globalKeydownInventory=[...sources]
  .map(([file,source])=>({file,count:count(source,/(?:window|document)\.addEventListener\s*\(\s*["']keydown["']/g)}))
  .filter(item=>item.count)
  .sort((a,b)=>a.file.localeCompare(b.file));
assert.deepEqual(globalKeydownInventory,[{file:'core/ui/ui-manager.js',count:1}],'Canonical Web Overlay Host must remain the sole active global keyboard owner');

const ownerNames=[
  'intelligence.command-proposal','intelligence.ask','intelligence.transparency',
  'consumer.memories.cluster-picker','consumer.memories.experience-picker','consumer.memories.full-journey','consumer.memories.moment-journey',
  'consumer.gallery.clear','consumer.gallery.cluster-title','consumer.gallery.cluster','consumer.gallery.editor','consumer.gallery.lightbox','consumer.gallery.memory-bridge',
  'consumer.memory-worlds.curation','consumer.memory-worlds.deck','consumer.memory-worlds.flow',
  'booking.control-center.','booking.place-request','identity.profile-foundation',
  'trip.experience','trip.join-code','trip.creator','trip.module-manager',
  'places.experience','places.final-planning','places.detail-photo','places.restaurant-workspace',
  'journey.timeline-day','journey.timeline-photo-memory','journey.timeline-planning-editor'
];
for(const owner of ownerNames)assert(joined.includes(owner),`M10 owner-classified Overlay Host adoption missing ${owner}`);

assert.equal(registry.cores.journeyTimeline.status,'active','Journey must remain a separately owned active Core after extraction');
assert.equal(registry.cores.journeyTimeline.root,'core/journey/','Journey physical Core root must remain explicit');
assert.equal(registry.cores.journeyTimeline.legacyCompatibility,'core/places/timeline-core.js','Journey legacy Web/DB provider must remain explicit');
assert.match(read('core/runtime/overlay-host-contract-core.js'),/browserless:true,domainTruth:false,platformRendering:false/,'Overlay policy must remain browserless and truth-free');
assert.match(read('core/ui/ui-manager.js'),/adapter:'web-dom-compatibility'/,'DOM host must remain an explicit Web adapter');
assert.doesNotMatch(read('core/ui/ui-manager.js'),/history\.(?:pushState|replaceState|back)/,'Overlay Host must not become a second History owner');
assert.match(safeRunner,/tests\/m10-final-overlay-global-handler-closeout\.test\.cjs/,'M10 final guard missing from Safe Regression');

const inventory={
  activeLocalScripts:uniqueScripts.length,
  windowListeners:count(joined,/window\.addEventListener\s*\(/g),
  documentListeners:count(joined,/document\.addEventListener\s*\(/g),
  listenerRemovals:count(joined,/\.removeEventListener\s*\(/g),
  inlineHandlerAssignments:count(joined,/\.(?:on[a-z]+)\s*=/g),
  compatibilityBindings:count(joined,/window\.Luvia[A-Za-z0-9_]*\s*=/g),
  documentQueries:count(joined,/document\.querySelector(?:All)?\s*\(/g),
  createElementCalls:count(joined,/document\.createElement\s*\(/g),
  bodyAppends:bodyAppendInventory.reduce((total,item)=>total+item.count,0),
  globalKeydownOwners:globalKeydownInventory.length
};

console.log(`M10 Final Overlay / Global Handler Closeout: PASS ${JSON.stringify(inventory)}`);
