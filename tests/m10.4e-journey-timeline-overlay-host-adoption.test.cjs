'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const count=(value,token)=>value.split(token).length-1;
const timeline=read('core/places/timeline-core.js');
const appShell=read('app/app-shell.js');
const registry=JSON.parse(read('config/luvia-cores.json'));
const safeRunner=read('tests/run-m4.3-safe-regression.cjs');

for(const owner of ['journey.timeline-day','journey.timeline-photo-memory','journey.timeline-planning-editor'])assert(timeline.includes(`name:'${owner}'`),`Missing separately classified Journey owner: ${owner}`);
assert.equal(count(timeline,'ui.adopt('),3,'All three measured Timeline/Journey roots must use the canonical host');
assert.match(timeline,/surfaceHandles=new WeakMap\(\)/,'Returned legacy DOM roots need a safe handle bridge during compatibility adoption');
assert.match(timeline,/closeSurface\(node,'open-photo-memory'\)/,'Day -> photo-memory transition must close through the owning host handle');
assert.match(timeline,/closeSurface\(node,'open-place'\)/,'Day -> Place transition must close through the owning host handle');
assert.match(timeline,/planningEditorHandle\?\.close\('replace'\)/,'Planning editor must enforce one active owner surface');
assert.doesNotMatch(timeline,/document\.body\.appendChild|document\.body\.classList\.add\('luvia-place-overlay-open'\)|node\.addEventListener\('keydown'/,'Timeline/Journey must not retain private mount, scroll-lock or Escape ownership');
assert.doesNotMatch(timeline,/modal\.remove\(\)|node\.remove\(\)/,'Active Timeline/Journey roots must not bypass the host lifecycle');
assert.doesNotMatch(appShell,/querySelectorAll\('\.lv-timeline-modal[^']*'\)\.forEach\(node=>node\.remove\(\)\)/,'App Shell must not orphan Timeline host state through direct DOM cleanup');

for(const table of ['trip_schedule_events','timeline_events','place_visits','trip_place_data','trip_places','places','trip_members'])assert(timeline.includes(`'${table}'`),`Journey aggregation source changed unexpectedly: ${table}`);
assert.equal(count(timeline,'LuviaMediaCore'),2,'Timeline/Journey Media reservation must remain measured');
assert(!timeline.includes('LuviaTripStore'),'Timeline/Journey must not regain private Trip truth access');
assert(!timeline.includes("name:'places.timeline"),'Journey presentation owner must not be mislabeled as Places ownership');
assert.equal(registry.cores?.journeyTimeline?.status,'reserved','Core registry must preserve Journey/Timeline reservation');
assert.equal(registry.cores?.journeyTimeline?.truthOwnership,'reserved-pending-architecture-audit','Journey/Timeline truth must remain explicitly unresolved until its physical extraction');
assert(safeRunner.includes('tests/m10.4e-journey-timeline-overlay-host-adoption.test.cjs'),'M10.4E guard missing from Safe Regression');

console.log('M10.4E Journey / Timeline Overlay Host Adoption: PASS');
console.log('Day + photo memory + planning editor: 3 / 3 host-owned');
console.log('Cross-domain Journey ownership: preserved / not absorbed into Places');
console.log('App Shell direct Timeline DOM cleanup: removed');
