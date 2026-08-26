'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.resolve(__dirname,'..');
const read=relative=>fs.readFileSync(path.join(ROOT,relative),'utf8');
const shell=read('app/app-shell.js');
const shellCss=read('app/app-shell.css');
const today=read('app/today/today-experience.js');
const todayCss=read('app/today/today-experience.css');
const navigation=read('core/runtime/navigation-contract-core.js');
const ownership=read('docs/modularization/FILE-OWNERSHIP.csv');
const pcr=read('docs/modularization/PCR-M16.5F-SIGNED-IN-LIVING-PRODUCT-VERTICAL-SLICE.md');

const dockBlock=shell.slice(shell.indexOf('const navigationIcons'),shell.indexOf('const moduleForPlaceType'));
const m165fStart=shellCss.indexOf('M16.5F');
const m165fEnd=shellCss.indexOf('M16.5H',m165fStart);
const m165fCss=shellCss.slice(m165fStart,m165fEnd<0?undefined:m165fEnd);

for(const route of ["routeItem('today')","routeItem('plan')","routeItem('trip')","routeItem('memories')"]){
  assert.ok(dockBlock.includes(route),`target navigation route missing: ${route}`);
}
assert.match(dockBlock,/\{id:'compass',label:'Luvia Compass',action:'assistant'\}/,'central Compass action is missing');
assert.match(dockBlock,/data-ai-ask-open[^>]*data-luvia-experience-component="commandSurface"[^>]*data-luvia-experience-role="livingCompass"/,'Compass must preserve the real Intelligence command surface and its Living Compass role');
assert.doesNotMatch(dockBlock,/data-view="compass"/,'Compass must not invent a Domain route');
assert.match(dockBlock,/aria-current="page"/,'active route must remain accessible');
assert.match(dockBlock,/registered=new Map\(\(window\.LuviaNavigationRegistry/,'Consumer navigation must derive route items from navigation.v1');

for(const route of ['today','plan','trip','memories','more'])assert.match(navigation,new RegExp(`id:'${route}'.*topLevel:true`),`navigation.v1 route truth changed unexpectedly: ${route}`);
assert.match(shell,/class="lv-(?:brand|living-brand)"[^>]*data-view="today"/,'official brand must return to Today');
assert.match(shell,/class="lv-logo"/,'App Shell must retain the replaceable official logo mount');
assert.match(shell,/version:'13\.82\.68'/,'Consumer candidate version is missing');

for(const forbidden of ['LuviaTripStore','LuviaPlaceStore','LuviaBookingStore','LuviaMemoryStore','supabase.from','.from(']){
  assert.equal(dockBlock.includes(forbidden),false,`Consumer navigation introduced a private owner shortcut: ${forbidden}`);
}
for(const required of ['LuviaControlCenterTravelIdentity','LuviaControlCenterAttention','LuviaPlatformPorts',"get?.('NetworkPort')",'data-journey-projection="journey.v1-read-only"','data-widget-grid','data-ai-ask-open'])assert.ok(today.includes(required),`real Today projection missing: ${required}`);
for(const forbidden of ['LuviaTripStore','LuviaPlaceCore','LuviaBooking','LuviaMemoryStore','supabase','localStorage','sessionStorage'])assert.equal(today.includes(forbidden),false,`Today introduced private/domain access: ${forbidden}`);
assert.match(today,/class="lvt-phases"/,'Living Itinerary phases are missing');
assert.match(today,/data-luvia-experience-component="livingCompass"/,'Today Living Compass composition is missing');
assert.match(today,/Geplant, erlebt und erinnert bleibt in Bewegung\./,'continuous Journey story is missing');

for(const token of ['--luvia-color-action-primary','--luvia-color-action-primary-soft','--luvia-color-action-on-primary','--luvia-color-trip-complement','--luvia-color-surface-canvas','--luvia-layout-touch-minimum'])assert.ok(`${m165fCss}\n${todayCss}`.includes(token),`Experience/Trip token missing: ${token}`);
assert.ok(m165fCss.includes("url('../luvia-logo.svg')"),'central Compass must use the official replaceable root brand asset');
assert.match(m165fCss,/@media\(max-width:720px\)/,'mobile-first shell adaptation is missing');
assert.match(m165fCss,/@media\(max-width:390px\)/,'compact native viewport adaptation is missing');
assert.match(`${m165fCss}\n${todayCss}`,/@media\(prefers-reduced-motion:reduce\)/,'reduced-motion fallback is missing');
assert.match(`${m165fCss}\n${todayCss}`,/:focus-visible/,'visible keyboard focus is missing');
assert.equal(/#[0-9a-f]{3,8}\b/i.test(m165fCss),false,'M16.5F Shell CSS may not add literal colour debt');
assert.equal(/#[0-9a-f]{3,8}\b/i.test(todayCss),false,'M16.5F Today CSS may not add literal colour debt');
assert.equal(/!important/i.test(m165fCss),false,'M16.5F Shell CSS may not add !important debt');
assert.equal(/!important/i.test(todayCss),false,'M16.5F Today CSS may not add !important debt');

assert.match(pcr,/Trip context is read exclusively through `trip\.v1`/);
assert.match(pcr,/separate Platform adoption gate/);
for(const file of ['docs/modularization/PCR-M16.5F-SIGNED-IN-LIVING-PRODUCT-VERTICAL-SLICE.md','tests/m16.5f-signed-in-living-product-vertical-slice.test.cjs'])assert.ok(ownership.includes(file),`ownership registry missing ${file}`);

console.log('M16.5F Signed-in Living Product vertical slice: PASS');
console.log('Real Today / target navigation / central Intelligence Compass: PASS');
console.log('Private Domain Truth / DB / browser-core shortcuts: NONE');
