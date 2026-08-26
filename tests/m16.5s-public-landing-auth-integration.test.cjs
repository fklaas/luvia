'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const index = read('index.html');
const entry = read('app/public-entry.js');
const shell = read('app/app-shell.js');
const authUi = read('auth/ui.js');
const landing = read('app/public-landing.html');
const sw = read('sw.js');

assert.match(index, /app\/public-landing\.css\?v=13\.82\.66" data-luvia-public-landing-style disabled/);
assert.match(index, /app\/public-landing-experience-motion\.css\?v=13\.82\.66" data-luvia-public-landing-style disabled/);
assert.ok(index.indexOf('app/public-landing-motion.js?v=13.82.66') < index.indexOf('app/public-entry.js?v=13.82.66'));
assert.ok(index.indexOf('app/public-landing-experience-motion.js?v=13.82.66') < index.indexOf('app/public-entry.js?v=13.82.66'));

assert.match(entry, /fetch\(TEMPLATE_URL, \{ cache: 'no-store'/);
assert.match(entry, /link\[data-luvia-public-landing-style\]/);
assert.match(entry, /AUTH_HASHES = Object\.freeze\(\{ login: '#anmelden', register: '#registrieren' \}\)/);
assert.match(entry, /window\.addEventListener\('popstate', syncAuthToLocation/);
assert.match(entry, /renderRecoveryForm/);
assert.match(entry, /window\.LuviaGuidedJourneyEntry = Object\.freeze/);

assert.match(shell, /await window\.LuviaGuidedJourneyEntry\.render\(mountRoot,\{authMode\}\)/);
assert.match(shell, /if\(recoveryRequested\(\)\)return signedOut\(\{authMode:'recovery'\}\)/);
assert.match(shell, /window\.LuviaGuidedJourneyEntry\?\.deactivate\?\.\(\)/);

assert.doesNotMatch(authUi, /name="firstName"[^]*standardForm/);
assert.match(authUi, /signUp\(\{email,password\}\)/);
assert.match(authUi, /function renderRecoveryRequest/);
assert.match(authUi, /function renderRecoveryForm/);
assert.match(authUi, /await auth\(\)\.updatePassword\(password\)/);
assert.match(authUi, /if\(password\.length<8\)/);
assert.match(authUi, /const api=\{render:trackedRender,renderAuthForm,renderRecoveryRequest,renderRecoveryForm\}/);

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

assert.match(sw, /luvia-shell-v13\.82\.66/);
assert.match(sw, /app\/public-landing\.html/);
assert.match(sw, /app\/public-landing-motion\.js/);

console.log('M16.5S public Landing/Auth integration contract: PASS');
