'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const coreSource=read('core/runtime/overlay-host-contract-core.js');
const hostSource=read('core/ui/ui-manager.js');
const tripSource=read('core/trips/trip-experience.js');
const joinSource=read('core/trips/join-flow.js');
const placesSource=read('core/places/place-experience-shell.js');
const timelineSource=read('core/places/timeline-core.js');
const indexSource=read('index.html');
const swSource=read('sw.js');
const safeRunner=read('tests/run-m4.3-safe-regression.cjs');

for(const token of ['window','document','navigator','localStorage','sessionStorage','globalThis','HTMLElement','history.pushState','history.replaceState','location.'])assert(!coreSource.includes(token),`browserless Overlay Host Contract contains ${token}`);
assert.doesNotMatch(coreSource,/Luvia(?:Trip|Places|Media|Identity|Booking|Intelligence)(?:Store|State|Contract)/,'Overlay Host Contract must not consume Domain Truth');

const context=vm.createContext({Object,Array,Set,Map,String,Boolean,Number,Error,Date});
vm.runInContext(`${coreSource}\nthis.core=LuviaOverlayHostContractCoreV1;`,context);
const core=context.core;
assert.equal(core.contractId,'overlay-host.v1');
assert.equal(core.version,'1');
assert.equal(core.diagnostics().browserless,true);
assert.equal(core.diagnostics().domainTruth,false);
assert.equal(core.diagnostics().platformRendering,false);

let tick=0,id=0;
const stack=core.createStack({now:()=>`t-${++tick}`,createId:()=>`overlay-${++id}`});
assert.equal(stack.snapshot().status,'idle');
const first=stack.open({name:'trip.join-code',kind:'dialog'});
assert.equal(first.action,'open');
assert.equal(first.entry.id,'overlay-1');
assert.equal(first.snapshot.count,1);
const second=stack.open({name:'places.experience',kind:'sheet',closeOnEscape:false});
assert.equal(second.snapshot.top.name,'places.experience');
assert.equal(stack.requestClose({id:first.entry.id,reason:'escape'}).detail.code,'NOT_TOP');
assert.equal(stack.requestClose({id:second.entry.id,reason:'escape'}).detail.code,'DISMISS_DISABLED');
assert.equal(stack.requestClose({id:second.entry.id,reason:'back'}).action,'close');
assert.equal(stack.snapshot().top.id,first.entry.id);
assert.equal(stack.requestClose({id:first.entry.id,reason:'backdrop'}).action,'close');
assert.equal(stack.snapshot().status,'idle');
stack.open({name:'a'});stack.open({name:'b'});
assert.equal(stack.closeAll('session').detail.closed.length,2);
assert.equal(stack.snapshot().count,0);
assert.equal(Object.isFrozen(stack.snapshot()),true);

assert.match(hostSource,/LuviaOverlayHostContractCoreV1/);
assert.match(hostSource,/adapter:'web-dom-compatibility'/);
assert.match(hostSource,/document\.addEventListener\('keydown',onKeyDown,true\)/,'Web Host must own exactly one global keyboard listener');
assert.equal((hostSource.match(/document\.addEventListener\('keydown'/g)||[]).length,1,'Web Host must not add one Escape listener per overlay');
for(const token of ['aria-modal','aria-labelledby','inert','FOCUSABLE','event.key!==\'Tab\'','closeOnBack','handleBack','env(safe-area-inset-bottom)','prefers-reduced-motion','session.deactivate','luvia:navigate-request'])assert(hostSource.includes(token),`Web Host hardening missing ${token}`);
assert.doesNotMatch(hostSource,/history\.(?:pushState|replaceState|back)/,'Overlay Web Host must not become a second Web History owner');

assert.match(tripSource,/ui\.mount\(\{name:'trip\.experience'/);
assert.doesNotMatch(tripSource,/document\.addEventListener\('keydown'/,'Trip Experience must delegate Escape ownership to Overlay Host');
assert.match(joinSource,/ui\.mount\(\{name:'trip\.join-code'/);
assert.doesNotMatch(joinSource,/wrap\.className='luvia-ui-overlay'|wrap\.remove\(\)/,'Join dialog must not own a parallel overlay root');
assert.match(placesSource,/ui\.mount\(\{name:'places\.experience'/);
assert.doesNotMatch(placesSource,/document\.body\.style\.overflow/,'Places Experience must delegate scroll lock to Overlay Host');
assert.match(placesSource,/luvia:place-overlay-closed/,'Places close compatibility event must remain available');

assert.match(timelineSource,/function openEditor|function editEntry|openEditor\(/,'Timeline/Journey implementation must remain present and separately classified');
assert(!timelineSource.includes('LuviaOverlayHostContractCoreV1'),'M10.1 must not silently reclassify Timeline/Journey');

const coreIndex=indexSource.indexOf('core/runtime/overlay-host-contract-core.js');
const hostIndex=indexSource.indexOf('core/ui/ui-manager.js');
const tripIndex=indexSource.indexOf('core/trips/trip-experience.js');
const joinIndex=indexSource.indexOf('core/trips/join-flow.js');
assert(coreIndex>0&&hostIndex>coreIndex&&tripIndex>hostIndex&&joinIndex>hostIndex,'Overlay Contract / Web Host / Trip consumer load order invalid');
assert(swSource.includes("'core/runtime/overlay-host-contract-core.js'"),'Service Worker must cache the browserless Overlay Host Contract');
assert(swSource.includes("'core/ui/ui-manager.js'"),'Service Worker must cache the Overlay Web Host');
assert(safeRunner.includes('tests/m10.1-overlay-host-foundation.test.cjs'),'M10.1 guard missing from Safe Regression');

console.log('M10.1 Overlay Host Foundation / First Owner Adoption: PASS');
