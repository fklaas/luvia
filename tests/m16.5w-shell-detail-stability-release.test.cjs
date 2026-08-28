'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n?/g, '\n');
const shell = read('app/app-shell.js');
const shellCss = read('app/app-shell.css');
const aiCss = read('core/ai/ai-brain.css');
const today = read('app/today/today-experience.js');
const todayCss = read('app/today/today-experience.css');

// The accepted header contains companions, release information, overflow and profile only.
const readyMarkup = shell.slice(shell.indexOf('function ready()'), shell.indexOf('async function render()'));
assert.doesNotMatch(readyMarkup, /lv-living-ai-button|>Luvia fragen</, 'the removed top-header assistant action returned');
assert.match(readyMarkup, /data-living-companions/);
assert.match(readyMarkup, /lv-living-more-button/);
assert.match(readyMarkup, /lv-living-top-profile/);

// Active-trip dates are projected in German and parsed without a UTC date shift.
assert.match(shell, /function calendarDate\(value\)/);
assert.match(shell, /new Date\(Number\(match\[1\]\),Number\(match\[2\]\)-1,Number\(match\[3\]\),12\)/);
assert.match(shell, /toLocaleDateString\('de-DE'/);
assert.match(shell, /const dates=germanTripDateRange\(t\)/);
assert.doesNotMatch(shell, /\[t\.startDate,t\.endDate\]\.filter\(Boolean\)\.join\(' – '\)/);

// The Compass navigation entry is never a coloured tile, including hover/focus/active states.
assert.match(shellCss, /\.lv-living-sidebar \.lv-living-primary-nav \.lv-living-nav-item\.lv-living-nav-ai[^\n]+background:transparent;background-image:none;box-shadow:none;color:var\(--lv-text\)/);
assert.match(shellCss, /\.lv-living-sidebar \.lv-living-primary-nav \.lv-living-nav-item\.lv-living-nav-ai::after[^\n]+display:none/);
assert.match(shellCss, /\.lv-living-nav-item\.lv-living-nav-ai\.is-compass-context-active/);
assert.match(aiCss, /\.lv-ai-global-trigger:not\(\.lv-living-nav-ai\):not\(\.lv-nav--compass\)/, 'shared AI surface styling must exclude both desktop and dock navigation Compasses');
assert.match(shellCss, /\.lv-dock \.lv-nav--compass[^\n]+background:transparent;background-image:none;box-shadow:none/);

// Only the separate needle layer receives randomized motion. Face, hub and housing stay still.
assert.match(shell, /function mountNavigationCompassMotion\(\)/);
assert.match(shell, /\.lv-living-nav-ai \.lv-living-compass__needle,\.lv-nav--compass \.lv-living-compass__needle/);
assert.match(shell, /Math\.random\(\)/);
assert.match(shell, /needle\.animate\(frames/);
assert.match(shell, /typeof needle\.animate==='function'/);
assert.match(shell, /needle\.style\.transition=`transform \$\{segment\}ms/);
assert.match(shell, /needle\.style\.transform=frames\[index\]\.transform/);
assert.match(shell, /compassMotionReduced\(\)/);
assert.match(shellCss, /\.lv-living-nav-ai \.lv-living-compass__face[^\n]+animation:none;transform:none/);
assert.doesNotMatch(shellCss, /lv-living-ai-needle-wander/);

// Repeated identical runtime signals must not replace the Today hero or replay its entrance.
assert.match(today, /const premiumSignature=model=>JSON\.stringify\(\{/);
assert.match(today, /if\(signature===binding\.signature\)return false/);
assert.match(today, /next\.classList\.add\('is-live-update'\)/);
const bindBlock = today.slice(today.indexOf('function bind('), today.indexOf('function diagnostics()'));
assert.doesNotMatch(bindBlock, /\n\s*update\(\);/, 'bind must not replace the hero immediately after its first render');
assert.match(todayCss, /\.lvt-premium\.is-live-update \.lvt-copy,\.lvt-premium\.is-live-update \.lvt-context\{animation:none\}/);

// An unchanged Trip projection may refresh small shell projections, but not remount the active view.
assert.match(shell, /requiresViewRender=lastRenderedTripId!==activeTripId\|\|nextSignature!==lastTripRenderSignature/);
assert.match(shell, /if\(requiresViewRender\)await show\(activeView,\{force:true,animate:false\}\)/);

console.log('M16.5W shell detail and Today stability release: PASS');
