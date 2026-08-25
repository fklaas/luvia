'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.resolve(__dirname,'..');
const read=relative=>fs.readFileSync(path.join(ROOT,relative),'utf8');
const shell=read('app/app-shell.js');
const hubs=read('app/module-hubs.js');
const css=read('app/module-hubs.css');
const ownership=read('docs/modularization/FILE-OWNERSHIP.csv');
const pcr=read('docs/modularization/PCR-M16.5J-PLAN-COMPASS-PRODUCTIVE-ADOPTION.md');

const shellScope=shell.slice(shell.indexOf('function planCompassBrandSource'),shell.indexOf('function navigationItems'));
const actionScope=shell.slice(shell.indexOf('const planCompassRoutes'),shell.indexOf("window.addEventListener('luvia:dashboard-widget-refresh'"));
const hubScope=hubs.slice(hubs.indexOf('const PLAN_FEATURES'),hubs.indexOf('function trip'));
const cssScope=css.slice(css.indexOf('M16.5J'));

for(const layer of ['face.svg','two-ended-needle.svg','hub.svg']){
  assert.ok(hubs.includes(layer),`official Living Compass layer missing: ${layer}`);
}
assert.match(hubs,/window\.LuviaPlacesContractV1\?\.listPlaces/,'Plan projection must use the public Places contract');
assert.doesNotMatch(hubs,/LuviaPlaceCore/,'Plan projection may not read private Places owner truth');

for(const direction of ['Places','Meine Orte','Timeline','Booking','Checklisten','Budget','Routen','Wetter']){
  assert.ok(hubScope.includes(`title:'${direction}'`),`Plan direction missing: ${direction}`);
}
assert.equal((hubScope.match(/title:'/g)||[]).length,8,'the accepted Plan constellation must keep exactly eight directions');
assert.match(hubs,/data-plan-compass-stage/);
assert.match(hubs,/data-plan-compass-close/);
assert.match(hubs,/data-plan-angle/);

assert.match(shellScope,/\.lv-living-brand-compass/,'desktop Compass flight must originate at the top-left Luvia brand');
assert.match(shellScope,/\.lv-living-mobile-compass/,'mobile Compass flight must originate at the mobile Luvia brand');
assert.match(shellScope,/is-plan-compass-detached/,'the source mark must be detached while the shared element is in flight');
assert.match(shellScope,/returnPlanCompassHome/,'the Compass must return to its brand source');
assert.doesNotMatch(shellScope,/lv-nav-compass-mark/,'the navigation AI entry may not become the feature-flight source');

assert.match(actionScope,/leavePlanCompass\('today'\)/,'X must return to Today');
assert.match(actionScope,/--lv-plan-selection-angle/,'feature choice must aim the native two-ended needle');
assert.match(actionScope,/button\.classList\.add\('is-selected'\)/,'the chosen direction must remain visible during exit');
for(const route of ['places','places-lifecycle','timeline','bookings','routes']){
  assert.ok(actionScope.includes(`'${route}'`),`real feature route missing: ${route}`);
}

assert.match(cssScope,/height:calc\(100dvh - 81px\)/,'desktop Plan stage must occupy the signed-in product viewport');
assert.match(cssScope,/@media\(max-width:800px\)/,'mobile Plan stage adaptation is missing');
assert.match(cssScope,/@media\(max-width:390px\)/,'compact Plan stage adaptation is missing');
assert.match(cssScope,/\.lv-living-shell:has\(\.lv-view-host\[data-view="plan"\]\)\{padding-bottom:0\}/,'mobile Plan stage must not create document scrolling behind the fixed dock');
assert.match(cssScope,/@media\(prefers-reduced-motion:reduce\)/,'reduced-motion fallback is missing');
assert.match(cssScope,/\.lv-plan-compass-needle\{[^}]*transform:rotate\(var\(--lv-plan-selection-angle/,'only the official native needle must receive the selection angle');
assert.doesNotMatch(cssScope,/\.lv-plan-compass-mark\{[^}]*animation:[^}]*rotate/,'the complete Compass mark may not rotate');
assert.doesNotMatch(cssScope,/\.lv-plan-compass-core::before/,'a synthetic external needle may not be introduced');
assert.equal(/!important/i.test(cssScope),false,'M16.5J may not add new !important debt');

assert.match(pcr,/390 × 844/);
assert.match(pcr,/320 × 673/);
assert.match(pcr,/Main and Production remain unchanged/);
for(const file of [
  'docs/modularization/PCR-M16.5J-PLAN-COMPASS-PRODUCTIVE-ADOPTION.md',
  'tests/m16.5j-plan-compass-productive-adoption.test.cjs'
])assert.ok(ownership.includes(file),`ownership registry missing ${file}`);

console.log('M16.5J Plan Compass productive adoption: PASS');
console.log('Official brand-source shared element / native needle / eight directions: PASS');
console.log('390×844 and 320×673 document-scroll guard: ACTIVE');
