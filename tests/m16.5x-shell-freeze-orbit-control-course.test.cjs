'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n?/g, '\n');
const shell = read('app/app-shell.js');
const shellCss = read('app/app-shell.css');
const hubs = read('app/module-hubs.js');
const hubsCss = read('app/module-hubs.css');
const version = read('intelligence/kernel/version.js');

assert.match(version, /core:'4\.82\.168',build:'13\.82\.168\.18',name:'M16\.5 Places Category Query Split'/);

// All signed-in Compass contexts share one real ring; Profile no longer staggers cards.
assert.match(hubsCss, /M16\.5X — one collision-free Compass orbit for every signed-in context/);
assert.match(hubsCss, /\.lv-plan-compass-stage\[data-compass-context\] \.lv-plan-direction:nth-child\(n\)\{--lv-plan-item-radius:var\(--lv-plan-direction-radius\)\}/);
assert.match(hubsCss, /\.lv-plan-compass-stage,\.lv-plan-compass-stage\[data-compass-context="profile"\]\{--lv-plan-direction-radius:clamp\(235px,min\(27vw,31vh\),335px\)/);
assert.match(hubsCss, /@media\(max-width:340px\)/);

// Control Center is a proper Compass context, not the previous dashboard landing page.
for (const token of ["'control-center':Object.freeze", "feature('Identität & Datenschutz'", "feature('Buchungen'", "feature('Reiseunterlagen'", "feature('Inbox'", "feature('Trip Command'", "feature('Wallet'"]) assert.ok(hubs.includes(token), `Control Center Compass misses ${token}`);
assert.match(shell, /data-view="control-center" data-compass-context="control-center"/);
assert.match(shell, /'control-center':'control-center'/);
assert.match(shell, /\['today','plan','trip','memories','profile','control-center'\]/);

// The generic five-phase rail is gone from runtime markup and replaced by one cartographic course cue.
assert.doesNotMatch(shell, /function phaseRail\(\)/);
assert.match(shell, /function journeyCourse\(\)/);
assert.match(shell, /\$\{journeyCourse\(\)\}/);
assert.match(shellCss, /cartographic course cue replaces the generic five-stop phase rail/);
assert.match(shellCss, /\.lv-living-course-compass \.is-needle/);
assert.match(shellCss, /@media\(max-width:800px\)\{\.lv-living-course\{display:none\}\}/);

console.log('M16.5X shell-freeze orbit, Control Center and course cue: PASS');
