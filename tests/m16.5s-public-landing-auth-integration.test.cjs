'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const index = read('index.html');
const entry = read('app/public-entry.js');
const entryCss = read('app/public-entry.css');
const shell = read('app/app-shell.js');
const authUi = read('auth/ui.js');
const landing = read('app/public-landing.html');
const landingCss = read('app/public-landing.css');
const landingMotion = read('app/public-landing-motion.js');
const demo = read('app/demo/living-compass-browser.html');
const sw = read('sw.js');

assert.match(index, /app\/public-landing\.css\?v=13\.82\.71" data-luvia-public-landing-style disabled/);
assert.match(index, /app\/public-landing-experience-motion\.css\?v=13\.82\.71" data-luvia-public-landing-style disabled/);
assert.ok(index.indexOf('app/public-landing-motion.js?v=13.82.71') < index.indexOf('app/public-entry.js?v=13.82.71'));
assert.ok(index.indexOf('app/public-landing-experience-motion.js?v=13.82.71') < index.indexOf('app/public-entry.js?v=13.82.71'));

assert.match(entry, /fetch\(TEMPLATE_URL, \{ cache: 'no-store'/);
assert.match(entry, /link\[data-luvia-public-landing-style\]/);
assert.match(entry, /AUTH_HASHES = Object\.freeze\(\{ login: '#anmelden', register: '#registrieren' \}\)/);
assert.match(entry, /window\.addEventListener\('popstate', syncAuthToLocation/);
assert.match(entry, /focus: Boolean\(layer\?\.hidden\)/);
assert.match(entry, /setTimeout\(clearAuthHash, 450\)/);
assert.match(entry, /renderRecoveryForm/);
assert.match(entry, /lv-public-auth-compass-guide/);
assert.match(entry, /Living Compass · Kapitel 1/);
assert.match(entry, /Lass uns losreisen/);
assert.match(entry, /Ernährung/);
assert.match(entry, /Mobilität/);
assert.match(entry, /window\.LuviaGuidedJourneyEntry = Object\.freeze/);
assert.match(entryCss, /lv-public-auth-compass-float/);
assert.match(entryCss, /prefers-reduced-motion:reduce/);

assert.match(shell, /await window\.LuviaGuidedJourneyEntry\.render\(mountRoot,\{authMode\}\)/);
assert.match(shell, /if\(recoveryRequested\(\)\)return signedOut\(\{authMode:'recovery'\}\)/);
assert.match(shell, /window\.LuviaGuidedJourneyEntry\?\.deactivate\?\.\(\)/);
assert.match(shell, /active\?\.isConnected&&marker\?\.isConnected/);
assert.doesNotMatch(shell, /const inViewport=/);

assert.doesNotMatch(authUi, /name="firstName"[^]*standardForm/);
assert.match(authUi, /signUp\(\{email,password\}\)/);
assert.match(authUi, /function renderRecoveryRequest/);
assert.match(authUi, /function renderRecoveryForm/);
assert.match(authUi, /await auth\(\)\.updatePassword\(password\)/);
assert.match(authUi, /if\(password\.length<8\)/);
assert.match(authUi, /Living Compass/);
assert.match(authUi, /const api=\{render:trackedRender,renderAuthForm,renderRecoveryRequest,renderRecoveryForm\}/);

assert.match(landing, /app\/demo\/living-compass-browser\.html\?screen=today&amp;surface=landing/);
assert.doesNotMatch(landing, /tests\/fixtures\/m16\.5q-living-compass-recovery-browser\.html/);
assert.match(landing, /data-compass-gate/);
assert.match(landing, /data-compass-gate-toggle/);
assert.match(landing, /Ich bin schon dabei/);
assert.match(landing, /Meine Reise beginnen/);
assert.match(landing, /href="#compass-gate" data-gate-intent="register"/);
assert.match(landingCss, /journey-first public entry/);
assert.match(landingCss, /\.compass-gate\.is-open \.compass-gate-paths/);
assert.match(landingCss, /mask-image:radial-gradient/);
assert.match(landingMotion, /function setCompassGateOpen/);
assert.match(landingMotion, /compassGatePaths\.setAttribute\("aria-hidden"/);
assert.match(demo, /<base href="\.\.\/\.\.\/">/);
assert.match(demo, /<meta name="robots" content="noindex,nofollow">/);
assert.match(demo, /Luvia Living Compass – interaktive Produktdemo/);

for (const asset of [
  'prototype-coast-morning.png',
  'prototype-coast-bike.png',
  'prototype-harbor-lunch.png',
  'prototype-memory-sunset.png',
  'prototype-restaurant.png'
]) {
  assert.match(landing, new RegExp(`assets/public-landing/${asset.replace('.', '\\.').replace('-', '\\-')}`));
  assert.match(sw, new RegExp(`assets/public-landing/${asset.replace('.', '\\.').replace('-', '\\-')}`));
}

assert.match(sw, /luvia-shell-v13\.82\.71/);
assert.match(sw, /app\/public-landing\.html/);
assert.match(sw, /app\/demo\/living-compass-browser\.html/);
assert.match(sw, /app\/public-landing-motion\.js/);

console.log('M16.5S public Landing/Auth integration contract: PASS');
