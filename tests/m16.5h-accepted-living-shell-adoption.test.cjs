'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.resolve(__dirname,'..');
const read=relative=>fs.readFileSync(path.join(ROOT,relative),'utf8');
const shell=read('app/app-shell.js');
const css=read('app/app-shell.css');
const ownership=read('docs/modularization/FILE-OWNERSHIP.csv');
const pcr=read('docs/modularization/PCR-M16.5H-ACCEPTED-LIVING-SHELL-ADOPTION.md');

const shellScope=shell.slice(shell.indexOf('const compassAssetBase'),shell.indexOf('const moduleForPlaceType'));
const cssScope=css.slice(css.indexOf('M16.5H'));

for(const required of [
  'lv-shell lv-living-shell',
  'lv-living-sidebar',
  'lv-living-workspace',
  'lv-header lv-living-topbar',
  'lv-stage lv-living-stage',
  'lv-living-primary-nav',
  'lv-dock-wrap'
])assert.ok(`${shell}\n${cssScope}`.includes(required),`accepted Living Shell primitive missing: ${required}`);

assert.match(shellScope,/luvia-living-compass\/layers/,'official Living Compass layer base is missing');
for(const layer of ['face.svg','two-ended-needle.svg','hub.svg']){
  assert.ok(shellScope.includes(layer),`official Living Compass layer missing: ${layer}`);
}

assert.match(shellScope,/lv-living-compass__needle/,'two-ended needle animation mount is missing');
assert.doesNotMatch(cssScope,/\.lv-living-compass\s*\{[^}]*animation/,'the complete Compass must remain fixed');
assert.match(cssScope,/\.lv-living-brand \.lv-living-compass__needle[^}]*animation/,'only the official needle should carry the idle cue');

for(const route of ["routeItem('today')","routeItem('plan')","routeItem('trip')","routeItem('memories')"]){
  assert.ok(shellScope.includes(route),`real navigation route missing: ${route}`);
}
assert.match(shellScope,/data-ai-ask-open[^>]*data-luvia-experience-component="commandSurface"[^>]*data-luvia-experience-role="livingCompass"/,'Compass entry must preserve the real Intelligence command surface and declare its Living Compass role');
assert.doesNotMatch(shellScope,/data-view="compass"/,'Compass may not invent a Domain route');
assert.match(shell,/activeTripMarkup\(t\)/,'active Trip projection is not wired into the new shell');
assert.match(shellScope,/LuviaCollaboration\?\.snapshot/,'member projection must come from the public Collaboration runtime');

for(const forbidden of ['LuviaTripStore','LuviaPlaceStore','LuviaBookingStore','LuviaMemoryStore','supabase','.from(','localStorage','sessionStorage']){
  assert.equal(shellScope.includes(forbidden),false,`new Living Shell introduced a private owner shortcut: ${forbidden}`);
}

for(const token of [
  '--luvia-color-action-primary',
  '--luvia-color-action-primary-soft',
  '--luvia-color-surface-canvas',
  '--luvia-color-surface-elevated',
  '--luvia-color-text-primary',
  '--luvia-color-border-subtle'
])assert.ok(cssScope.includes(token),`semantic Experience token missing: ${token}`);

assert.match(cssScope,/@media\(max-width:800px\)/,'mobile-first shell switch is missing');
assert.match(cssScope,/@media\(max-width:390px\)/,'compact native viewport adaptation is missing');
assert.match(cssScope,/grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/,'mobile navigation must fit all five destinations without horizontal scrolling');
assert.match(cssScope,/@media\(prefers-reduced-motion:reduce\)/,'reduced-motion fallback is missing');
assert.match(cssScope,/:focus-visible/,'visible keyboard focus is missing');
assert.equal(/!important/i.test(cssScope),false,'M16.5H must not add !important debt');

const literalColours=[...cssScope.matchAll(/#[0-9a-f]{3,8}\b/gi)].map(match=>match[0].toLowerCase());
assert.ok(literalColours.length<=10,'M16.5H may define only one compact light Corporate palette');
assert.ok(literalColours.every(colour=>cssScope.slice(0,900).includes(colour)),'literal colours must remain confined to the local light-palette token declaration');

assert.match(pcr,/visually rejected/);
assert.match(pcr,/Main and Production remain\s+unchanged/);
for(const file of [
  'docs/modularization/PCR-M16.5H-ACCEPTED-LIVING-SHELL-ADOPTION.md',
  'tests/m16.5h-accepted-living-shell-adoption.test.cjs'
])assert.ok(ownership.includes(file),`ownership registry missing ${file}`);

console.log('M16.5H Accepted Living Shell adoption: PASS');
console.log('Real Trip / Collaboration / Navigation / Intelligence projections: PASS');
console.log('Private Domain Truth / DB / browser storage shortcuts: NONE');
