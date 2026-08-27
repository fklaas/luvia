'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n?/g, '\n');
const index = read('index.html');
const boot = read('core/runtime/boot-coordinator.js');
const shell = read('app/app-shell.js');
const shellCss = read('app/app-shell.css');
const hubsCss = read('app/module-hubs.css');

assert.match(index, /luvia:boot-intro-seen-at/);
assert.match(index, /navigation\?\.type==='reload'\|\|navigation\?\.type==='back_forward'/);
assert.match(index, /if\(warm\)root\.classList\.add\('lv-boot-warm'\)/);
assert.match(index, /window\.addEventListener\('pageshow',event=>\{if\(!event\.persisted\)return;root\.classList\.add\('lv-boot-warm'\);document\.getElementById\('luviaBootSplash'\)\?\.remove\(\)\}\)/);
assert.match(boot, /const warmBoot=Boolean/);
assert.doesNotMatch(boot, /localStorage|sessionStorage/, 'Domain boot coordinator must not own browser persistence');
assert.match(boot, /if\(warmBoot\)\{node\?\.remove\(\);/);
assert.match(shellCss, /\.lv-boot-warm \.lv-start-splash\{display:none\}/);
assert.match(shellCss, /\.lv-boot-warm:not\(\[data-luvia-boot="ready"\]\) #app\{visibility:hidden/);
assert.match(shellCss, /\.lv-boot-warm\[data-luvia-boot="ready"\] #app\{visibility:visible;animation:none\}/);
assert.doesNotMatch(shellCss, /\.lv-primary,\.lv-nav\.on\{background:var\(--trip-accent\)!important/, 'legacy important nav fill must not override the accepted mobile dock');
assert.match(shellCss, /\.lv-living-shell \.lv-dock \.lv-nav\.on\{background:transparent\}/);

assert.equal(shell.includes('lv-living-trip-switcher'), false, 'top-right active-trip duplicate must stay removed');
assert.match(shell, /data-living-companions/);
assert.match(shell, /selectedView=activeCompassContext==='profile'\?null/);
assert.match(shell, /is-compass-context-active/);
assert.match(shellCss, /\.lv-living-nav-item\.is-compass-context-active/);
assert.match(shellCss, /\.lv-living-ai-button\{[^}]*background:linear-gradient\(135deg,var\(--luvia-color-brand-coral\),var\(--luvia-color-brand-coral-deep\)\)/);
assert.match(hubsCss, /\.lv-plan-compass-stage\[data-compass-context="profile"\] \.lv-plan-direction:nth-child\(odd\)\{--lv-plan-item-radius:calc\(var\(--lv-plan-direction-radius\) \* \.88\)\}/);
assert.match(hubsCss, /\.lv-plan-compass-stage\[data-compass-context="profile"\] \.lv-plan-direction:nth-child\(even\)\{--lv-plan-item-radius:calc\(var\(--lv-plan-direction-radius\) \* 1\.16\)\}/);

console.log('M16.5V warm start, profile routing and accepted header release: PASS');
