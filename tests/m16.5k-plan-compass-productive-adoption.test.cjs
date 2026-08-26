'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.resolve(__dirname,'..');
const read=relative=>fs.readFileSync(path.join(ROOT,relative),'utf8');
const shell=read('app/app-shell.js');
const hubs=read('app/module-hubs.js');
const css=read('app/module-hubs.css');
const pwa=read('intelligence/pwa-service.js');
const worker=read('sw.js');
const ownership=read('docs/modularization/FILE-OWNERSHIP.csv');
const pcr=read('docs/modularization/PCR-M16.5K-PLAN-COMPASS-PRODUCTIVE-ADOPTION.md');

const shellScope=shell.slice(shell.indexOf('function planCompassBrandSource'),shell.indexOf('function navigationItems'));
const actionScope=shell.slice(shell.indexOf('const compassContextForView'),shell.indexOf("window.addEventListener('luvia:dashboard-widget-refresh'"));
const hubScope=hubs.slice(hubs.indexOf('const COMPASS_CONTEXTS'),hubs.indexOf('function tripHub'));
const planScope=hubScope.slice(hubScope.indexOf("plan:Object.freeze"),hubScope.indexOf("trip:Object.freeze"));
const cssScope=css.slice(css.indexOf('M16.5K'));
const contextScope=shell.slice(shell.indexOf('async function openLivingCompassContext'),shell.indexOf('async function leavePlanCompass'));

for(const layer of ['face.svg','two-ended-needle.svg','hub.svg']){
  assert.ok(hubs.includes(layer),`official Living Compass layer missing: ${layer}`);
}
assert.match(hubs,/window\.LuviaPlacesContractV1\?\.listPlaces/,'Plan projection must use the public Places contract');
assert.doesNotMatch(hubs,/LuviaPlaceCore/,'Plan projection may not read private Places owner truth');

for(const direction of ['Places','Meine Orte','Timeline','Booking','Checklisten','Budget','Routen','Wetter']){
  assert.ok(planScope.includes(`feature('${direction}'`),`Plan direction missing: ${direction}`);
}
assert.equal((planScope.match(/feature\('/g)||[]).length,10,'the accepted Plan constellation must keep eight directions and two visible horizons');
for(const context of ['today','plan','trip','memories','profile'])assert.match(hubScope,new RegExp(`${context}:Object\\.freeze`),`Living Compass context missing: ${context}`);
assert.match(hubs,/data-plan-compass-stage/);
assert.match(hubs,/data-plan-compass-close/);
assert.match(hubs,/data-plan-angle/);
assert.match(hubs,/--direction-exit-index/,'context exits require a reverse radial order');
assert.match(hubs,/lv-plan-direction-motion/,'direction motion must live inside the immutable button hit geometry');

assert.match(shellScope,/\.lv-living-brand-compass/,'desktop Compass flight must originate at the top-left Luvia brand');
assert.match(shellScope,/\.lv-living-mobile-compass/,'mobile Compass flight must originate at the mobile Luvia brand');
assert.match(shellScope,/is-plan-compass-detached/,'the source mark must be detached while the shared element is in flight');
assert.match(shellScope,/returnPlanCompassHome/,'the Compass must return to its brand source');
assert.doesNotMatch(shellScope,/lv-nav-compass-mark/,'the navigation AI entry may not become the feature-flight source');

assert.match(actionScope,/leavePlanCompass\('today'\)/,'X must return to Today');
assert.match(actionScope,/--lv-plan-selection-angle/,'feature choice must aim the native two-ended needle');
assert.match(actionScope,/selected\.classList\.add\('is-selected'\)/,'the chosen direction must remain visible during exit');
assert.match(actionScope,/openLivingCompassContext\(context,\{intentSequence:compassIntentSequence\}\)/,'top-level navigation must switch the embedded Compass context instead of exiting it and preserve the current user-intent ordering');
assert.match(actionScope,/if\(e\.key==='Escape'\)/,'Escape must close the Compass to Today');
assert.match(actionScope,/ArrowLeft.*ArrowRight.*ArrowUp.*ArrowDown/,'direction keyboard navigation must support all arrow keys');
assert.match(shell,/lv-living-top-profile[^`]*data-compass-context="profile"/,'the header profile avatar must enter the Profile Compass');
assert.match(shell,/lv-living-profile[^`]*data-compass-context="profile"/,'the lower profile card must enter the Profile Compass');
assert.match(contextScope,/playCompassContextNeedle/,'context switches require the bounded irregular needle search');
assert.match(contextScope,/compassContextExitDuration/,'old context points must complete their exit before replacement');
assert.match(contextScope,/compassContextEntryDuration/,'new context points must complete the shared entry sequence');
assert.doesNotMatch(contextScope,/classList\.remove\('is-plan-compass-detached'\)/,'the top-left source Compass may not reappear during an open context switch');
for(const route of ['places','places-lifecycle','timeline','bookings','routes']){
  assert.ok(actionScope.includes(`'${route}'`),`real feature route missing: ${route}`);
}

assert.match(cssScope,/height:calc\(100dvh - 81px\)/,'desktop Plan stage must occupy the signed-in product viewport');
assert.match(cssScope,/@media\(max-width:800px\)/,'mobile Plan stage adaptation is missing');
assert.match(cssScope,/@media\(max-width:390px\)/,'compact Plan stage adaptation is missing');
assert.match(cssScope,/@media\(max-width:800px\) and \(max-height:560px\) and \(orientation:landscape\)/,'short mobile landscape must retain a compact, non-clipped radial Compass stage');
assert.match(cssScope,/\.lv-living-shell:has\(\.lv-view-host\[data-view="plan"\]\)\{padding-bottom:0\}/,'mobile Plan stage must not create document scrolling behind the fixed dock');
assert.match(cssScope,/\.lv-plan-compass-close\{top:5px;right:6px;width:44px;height:44px/,'mobile Compass close must remain a 44 px touch target');
assert.match(cssScope,/\.lv-plan-direction\{width:clamp\(76px,23vw,94px\);min-height:44px/,'mobile Compass directions must remain 44 px touch targets');
assert.match(cssScope,/\.lv-plan-compass-footer button\{min-height:44px;display:inline-flex/,'mobile Compass horizon controls must remain 44 px touch targets');
assert.match(cssScope,/--lv-plan-direction-radius:clamp\(44px,min\(12vw,12vh\),58px\);grid-template-rows:32px minmax\(0,1fr\) 44px/,'landscape must compact the same radial composition into the available height');
assert.match(cssScope,/\.lv-plan-compass-heading>div>span,\.lv-plan-compass-heading p\{display:none\}/,'landscape may remove supporting copy instead of clipping interactive directions');
assert.match(cssScope,/\.lv-plan-compass-footer p\{display:none\}/,'landscape may remove the passive legend instead of clipping touch controls');
assert.match(cssScope,/@media\(prefers-reduced-motion:reduce\)/,'reduced-motion fallback is missing');
assert.match(cssScope,/\.lv-plan-compass-needle\{[^}]*transform:rotate\(var\(--lv-plan-selection-angle/,'only the official native needle must receive the selection angle');
assert.doesNotMatch(cssScope,/\.is-navigating \.lv-plan-direction\{[^}]*scale:/,'unselected directions must fade in place instead of collapsing toward a shared point');
assert.doesNotMatch(cssScope,/lv-plan-direction-float/,'direction buttons must keep immutable hit geometry instead of receiving a second independent transform animation');
assert.match(cssScope,/@keyframes lv-plan-direction-pop-in/,'the accepted playful upward direction pop is missing');
assert.match(cssScope,/@keyframes lv-plan-direction-pop-out/,'context changes require the matching reverse direction exit');
assert.match(cssScope,/\.lv-plan-direction:hover \.lv-plan-direction-surface[^\n]*\{transform:/,'hover motion must move only the visual surface inside the stable hit target');
assert.match(cssScope,/\.is-returning \.lv-plan-compass-core\{opacity:0/,'the white carrier must leave with the returning Compass instead of lingering');
assert.doesNotMatch(cssScope,/\.lv-plan-compass-mark\{[^}]*animation:[^}]*rotate/,'the complete Compass mark may not rotate');
assert.doesNotMatch(cssScope,/\.lv-plan-compass-core::before/,'a synthetic external needle may not be introduced');
assert.equal(/!important/i.test(cssScope),false,'M16.5K may not add new !important debt');

assert.match(pwa,/const BUILD=SCRIPT_URL\.searchParams\.get\('v'\)\|\|String\(globalThis\.LuviaKernelVersion\?\.build\|\|''\)\.trim\(\)\|\|null/,'PWA cache identity must follow the active release script version');
const registerScope=pwa.slice(pwa.indexOf('async function register'),pwa.indexOf('function activateWaiting'));
assert.doesNotMatch(registerScope,/clearOldCaches/,'PWA registration may not delete the cache of the worker currently controlling the page');
const installScope=worker.slice(worker.indexOf("self.addEventListener('install'"),worker.indexOf("self.addEventListener('activate'"));
assert.doesNotMatch(installScope,/skipWaiting/,'a newly deployed worker may not take over a live page without an explicit update action');
assert.match(worker,/event\.data\?\.type==='SKIP_WAITING'/,'explicit controlled service-worker activation must remain available');

assert.match(pcr,/390 × 844/);
assert.match(pcr,/320 × 673/);
assert.match(pcr,/Main and Production remain unchanged/);
for(const file of [
  'docs/modularization/PCR-M16.5K-PLAN-COMPASS-PRODUCTIVE-ADOPTION.md',
  'tests/m16.5k-plan-compass-productive-adoption.test.cjs'
])assert.ok(ownership.includes(file),`ownership registry missing ${file}`);

console.log('M16.5K Plan Compass productive adoption: PASS');
console.log('Official brand-source shared element / native needle / eight directions: PASS');
console.log('390×844 and 320×673 document-scroll guard: ACTIVE');
