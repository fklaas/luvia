'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.resolve(__dirname,'..');
const read=relative=>fs.readFileSync(path.join(ROOT,relative),'utf8').replace(/\r\n?/g,'\n');
const index=read('index.html');
const version=read('intelligence/kernel/version.js');
const worker=read('sw.js');
const pwa=read('intelligence/pwa-service.js');
const shell=read('app/app-shell.js');
const hubs=read('app/module-hubs.js');
const hubCss=read('app/module-hubs.css');
const places=read('app/places/places-spatial-experience.js');
const placesCss=read('app/places/places-spatial-experience.css');
const runner=read('tests/run-m4.3-safe-regression.cjs');
const ownership=read('docs/modularization/FILE-OWNERSHIP.csv');
const pcr=read('docs/modularization/PCR-M16.5Q-LIVING-COMPASS-INTEGRATION-RECOVERY.md');

assert.match(version,/core:'4\.82\.57'/);
assert.match(version,/build:'13\.82\.57'/);
assert.match(version,/name:'M16\.5 Living Compass Recovery'/);
assert.match(version,/channel:'integration-preview'/);
assert.match(worker,/const CACHE='luvia-shell-v13\.82\.57'/);
assert.equal(index.includes('?v=13.82.54'),false,'active entry retains the revoked candidate cache key');
for(const asset of ['intelligence/kernel/version.js','intelligence/pwa-service.js','app/app-shell.js','app/module-hubs.js','app/module-hubs.css','app/places/places-spatial-experience.js','app/places/places-spatial-experience.css'])assert.ok(index.includes(`${asset}?v=13.82.57`),`M16.5Q cache key missing for ${asset}`);

assert.match(pwa,/const EXPECTED_CACHE=`luvia-shell-v\$\{RELEASE_BUILD\}`/,'PWA cache identity must derive from the active release');
assert.doesNotMatch(pwa,/luvia-shell-v13\.17\.0/,'stale fixed cache identity must be removed');
assert.match(pwa,/registration=await navigator\.serviceWorker\.register[\s\S]*await registration\.update\(\);if\(registration\.waiting\)activateWaiting\(registration\);[\s\S]*await clearOldCaches\(\)/,'registration must update/activate before pruning old shell caches');
assert.match(pwa,/beforeinstallprompt',event=>\{event\.preventDefault\(\);deferredPrompt=event/,'install prompt must be retained');
assert.match(pwa,/controlledAtLoad&&!controllerReloadGuard[\s\S]*location\.reload\(\)/,'new active workers must reload an already controlled page exactly once');
assert.match(worker,/\(\?:js\|css\|json\|webmanifest\|svg\|png\|ico\|html\)/,'versioned static and brand assets must use network-first recovery');
assert.match(worker,/activeCache\.match\(request,\{ignoreSearch:true\}\)/,'runtime fetches must read only the current shell cache');

for(const context of ['today','plan','trip','memories','profile'])assert.match(hubs,new RegExp(`${context}:Object\\.freeze`),`Compass context missing: ${context}`);
assert.match(shell,/openLivingCompassContext\(context\)/,'top-level navigation must switch embedded Compass context');
assert.match(shell,/flightHost=root\?\.querySelector\('\.lv-living-shell'\)\|\|root[\s\S]*flightHost\.appendChild\(flight\)/,'shared-element flight must survive stage replacement inside the persistent shell');
assert.doesNotMatch(shell,/document\.body\.appendChild\(flight\)/,'shared-element flight must not create a private body overlay');
assert.match(shell,/pendingCompassContext/,'rapid context input must be queued');
assert.match(shell,/pendingCompassExit/,'rapid close or selection input must be queued');
assert.match(shell,/if\(planCompassTransition\)\{pendingCompassExit=\{destination:action,selected:button\}/,'touch selection during a context transition must be replayed instead of dropped');
assert.match(shell,/function cancelCompassFlights\(\)[\s\S]*animation\.cancel\(\)/,'in-flight Compass animations must be cancellable');
assert.match(shell,/Promise\.race\(\[animation\.finished\.catch\(\(\)=>null\),compassWait\(duration\+180\)\]\)/,'decorative Compass flights must have a bounded lifetime');
assert.doesNotMatch(shell,/await returnPlanCompassHome\(stage\)/,'decorative return flight must never gate destination routing');
assert.match(shell,/directAngle=\(\(angle\+180\)%360\+360\)%360-180/,'the needle must take the direct signed angle to the selected direction');
assert.doesNotMatch(shell,/1080\+angle/,'direction selection must not force three decorative needle rotations');
assert.match(shell,/function excludeRouteHost\(host,excluded=true\)[\s\S]*document\.activeElement\?\.blur\?\.\(\)[\s\S]*host\.inert=excluded/,'an outgoing route must release focus before it becomes inert and aria-hidden');
assert.match(shell,/excludeRouteHost\(previousHost,false\)/,'a superseded route transition must restore the previous host accessibility state');
assert.match(shell,/function settleRouteTransition\(stage\)[\s\S]*hosts\.forEach\(host=>host\.remove\(\)\)/,'rapid Back or route input must remove stale transition hosts');
assert.match(shell,/if\(e\.key==='Escape'\)/,'Escape must close to Today');
assert.match(shell,/ArrowLeft.*ArrowRight.*ArrowUp.*ArrowDown/,'Compass must expose arrow-key navigation');
assert.match(shell,/openCompass:\(context='plan'\)=>openLivingCompassContext\(context\)/,'Places and other destinations must be able to restore the embedded Compass');
assert.doesNotMatch(hubCss,/lv-plan-direction-float/,'Compass direction hit geometry must not float or collapse');
assert.match(hubCss,/not\(\.is-compass-arriving\):not\(\.is-ready\) \.lv-plan-compass-core\{opacity:0/,'the target Compass carrier must remain invisible before the shared element arrives');
assert.doesNotMatch(hubCss,/@keyframes lv-plan-context-seek/,'context changes must not spin the needle through decorative revolutions');
assert.match(read('tests/m16.5q-living-compass-recovery-e2e.cjs'),/stalled decorative Compass flight must never gate destination routing/,'real browser coverage must include a deliberately stalled flight');
assert.match(read('tests/m16.5q-living-compass-recovery-e2e.cjs'),/outgoing route host must never retain focused descendants while aria-hidden/,'real browser coverage must lock the focus/aria-hidden transition contract');

assert.match(places,/renderToken===state\.renderToken&&container\.isConnected&&state\.map===map/,'late map callbacks must not mutate a replacement surface');
assert.match(places,/state\.map\.easeTo\(\{center:coordinates\.lngLat/,'result selection must move the map using the public coordinate tuple');
assert.match(places,/select\(marker\.providerPlaceId,true,false\)/,'marker selection must move the result list without redundant map motion');
assert.match(places,/LuviaApp\?\.openCompass\?\.\('plan'\)/,'Places back action must restore Plan Compass');
assert.match(places,/data-places-map-fallback/,'honest map fallback markup is required');
assert.match(placesCss,/\.lv-places-spatial__map-fallback/,'honest bright map fallback styling is required');

for(const file of ['tests/fixtures/m16.5q-living-compass-recovery-browser.html','tests/m16.5q-living-compass-recovery-e2e.cjs','tests/m16.5q-pwa-cache-recovery-e2e.cjs','tests/m16.5q-living-compass-recovery-release.test.cjs','docs/modularization/PCR-M16.5Q-LIVING-COMPASS-INTEGRATION-RECOVERY.md'])assert.ok(ownership.includes(file),`ownership registry missing ${file}`);
assert.match(runner,/tests\/m16\.5q-living-compass-recovery-release\.test\.cjs/);
assert.match(pcr,/earlier claim that the public M16\.5P Integration build had received\s+functional acceptance is revoked/i);
assert.match(pcr,/Main remained exactly at\s+`c4b6d1740ad04c291d5e27d8d18b3a32e5ed87ba`/);
assert.match(pcr,/Production remained exactly on deployment\s+`578f13fc-8193-4988-88cf-93c94362fcc3`/);

console.log('M16.5Q Living Compass Integration Recovery Release: PASS');
console.log('App / Core / shell cache: 13.82.57 / 4.82.57 / luvia-shell-v13.82.57');
console.log('Compass contexts, exact routing, cleanup, Places map and PWA cache recovery: LOCKED');
console.log('Main / Production release lock: ACTIVE');
