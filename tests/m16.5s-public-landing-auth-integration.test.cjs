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
const shellCss = read('app/app-shell.css');
const authUi = read('auth/ui.js');
const landing = read('app/public-landing.html');
const landingCss = read('app/public-landing.css');
const landingMotion = read('app/public-landing-motion.js');
const demo = read('app/demo/living-compass-browser.html');
const sw = read('sw.js');
const brandCompass = read('assets/public-landing/luvia-compass-brand.svg');
const photoSources = JSON.parse(read('assets/public-landing/travel-photo-sources.json'));

assert.match(index, /app\/public-landing\.css\?v=13\.82\.168\.67" data-luvia-public-landing-style disabled/);
assert.match(index, /app\/public-landing-experience-motion\.css\?v=13\.82\.168\.67" data-luvia-public-landing-style disabled/);
assert.ok(index.indexOf('app/public-landing-motion.js?v=13.82.168.67') < index.indexOf('app/public-entry.js?v=13.82.168.67'));
assert.ok(index.indexOf('app/public-landing-experience-motion.js?v=13.82.168.67') < index.indexOf('app/public-entry.js?v=13.82.168.67'));

assert.match(entry, /fetch\(TEMPLATE_URL, \{ cache: 'no-store'/);
assert.match(entry, /AUTH_HASHES = Object\.freeze\(\{ login: '#anmelden', register: '#registrieren' \}\)/);
assert.match(entry, /window\.addEventListener\('popstate', syncAuthToLocation/);
assert.match(entry, /focus: Boolean\(layer\?\.hidden\)/);
assert.match(entry, /captureState\?\.\(\)/);
assert.match(entry, /restoreAfterAuth\?\.\(snapshot\)/);
assert.match(entry, /layer\.classList\.add\('is-closing'\)/);
assert.match(entry, /url\.hash = '#compass-gate'/);
assert.match(entry, /Registrierung schließen/);
assert.match(entry, /renderRecoveryForm/);
assert.match(entry, /Living Compass · Kapitel 1/);
assert.match(entry, /Lass uns losreisen/);
assert.match(entry, /Ernährung/);
assert.doesNotMatch(entry, /publicDockReady|lv-public-dock|lv-public-intro-handoff/);
assert.match(entry, /Mobilität/);
assert.match(entry, /window\.LuviaGuidedJourneyEntry = Object\.freeze/);
assert.match(entryCss, /data-auth-mode="login"[^]*grid-template-columns:minmax\(360px,560px\)/);
assert.match(entryCss, /lv-public-auth-in-left/);
assert.match(entryCss, /lv-public-auth-in-right/);
assert.match(entryCss, /prefers-reduced-motion:reduce/);

assert.match(shell, /await window\.LuviaGuidedJourneyEntry\.render\(mountRoot,\{authMode\}\)/);
assert.match(shell, /if\(recoveryRequested\(\)\)return signedOut\(\{authMode:'recovery'\}\)/);
assert.match(shell, /window\.LuviaGuidedJourneyEntry\?\.deactivate\?\.\(\)/);
assert.match(shell, /function schedulePwaRegistration\(\)/);
assert.match(shell, /window\.addEventListener\('load',afterLoad,\{once:true\}\)/);
assert.doesNotMatch(authUi, /name="firstName"[^]*standardForm/);
assert.match(authUi, /signUp\(\{email,password\}\)/);
assert.match(authUi, /function renderRecoveryRequest/);
assert.match(authUi, /function renderRecoveryForm/);
assert.match(authUi, /await auth\(\)\.updatePassword\(password\)/);
assert.match(authUi, /if\(password\.length<8\)/);

const compassIndex = landing.indexOf('id="compass-gate"');
const firstWorldIndex = landing.indexOf('data-story-world=');
assert.ok(compassIndex > 0 && compassIndex < firstWorldIndex, 'closed Living Compass must be the first public experience');
assert.match(landing, /data-compass-level="closed"/);
assert.match(landing, /data-compass-gate-toggle[^]*aria-expanded="false"/);
assert.match(landing, /Manche Wege zeigen sich erst, wenn du den Kompass weckst/);
assert.doesNotMatch(landing, /compass-gate-hand|☝|Hier klicken/);
assert.match(landing, /data-compass-crown/);
assert.match(landing, /data-compass-latch/);
assert.match(landing, /landing-compass-assembly[^]*data-compass-crown[^]*data-compass-latch/);
assert.equal((landing.match(/compass-puzzle-progress/g) || []).length, 1);
assert.match(landing, /luvia-compass-face\.svg/);
assert.match(landing, /luvia-compass-needle\.svg/);
assert.match(landing, /luvia-compass-hub\.svg/);
assert.equal((landing.match(/data-compass-choice=/g) || []).length, 3);
assert.match(landing, /Luvia kennenlernen/);
assert.match(landing, /Weiterreisen/);
assert.match(landing, /Meine Reise beginnen/);
assert.equal((landing.match(/data-world-target=/g) || []).length, 6);
assert.equal((landing.match(/data-story-world=/g) || []).length, 6);
assert.equal((landing.match(/data-story-world="[^"]+" hidden/g) || []).length, 6);
assert.equal((landing.match(/data-world-back/g) || []).length, 6);
assert.doesNotMatch(landing, /id="live"|Living Day|Euer Tag bleibt in Bewegung/);

assert.match(landingMotion, /async function openCompass/);
assert.match(landingMotion, /async function seekNeedle/);
assert.match(landingMotion, /async function showWorld/);
assert.match(landingMotion, /async function returnToCompass/);
assert.match(landingMotion, /classList\.add\("is-seeking"\)/);
assert.match(landingMotion, /const TONES = Object\.freeze/);
for (const tone of ['Coral','Sea','Sand','Sage','Lavender','Sunset','Fjord','Berry','Lagoon','Ember']) assert.match(landingMotion, new RegExp(`name: "${tone}"`));
const extraToneSource = landingMotion.slice(landingMotion.indexOf('const EXTRA_TONES'), landingMotion.indexOf('const TONES'));
const baseToneSource = landingMotion.slice(landingMotion.indexOf('const TONES'), landingMotion.indexOf('const KIND_ICONS'));
const namedTones = [
  ...[...baseToneSource.matchAll(/name:\s*"([^"]+)"/g)].map(match => match[1]),
  ...[...extraToneSource.matchAll(/\["([^"]+)",\s*"#[\da-f]{6}"\]/gi)].map(match => match[1])
];
assert.equal(new Set(namedTones).size, 50, 'the Landing must expose 50 distinct named journey colors');
assert.match(landingMotion, /TONES\.slice\(0, 10\)/);
assert.match(landingMotion, /weitere Reisefarben/);
assert.match(landingMotion, /journey-tone-dialog/);
assert.match(landingMotion, /dialog\.classList\.add\("is-open"\)/);
assert.match(landingMotion, /closePalette\(\{ restoreFocus: true \}\)/);
assert.match(landingMotion, /const DESTINATIONS = Object\.freeze/);
assert.match(landingMotion, /const PLACES = Object\.freeze/);
assert.match(landingMotion, /PLACES\.length/);
const placesBlock = landingMotion.slice(landingMotion.indexOf('const PLACES = Object.freeze'), landingMotion.indexOf('let activeController'));
assert.equal((placesBlock.match(/kind:/g) || []).length, 36, 'Place Compass sample world must contain 36 diverse places');
assert.match(landingMotion, /flyTo\(\{ center: place\.point/);
assert.match(landingMotion, /interactive: true/);
assert.match(landingMotion, /captureState:\s*\(\)\s*=>/);
assert.match(landingMotion, /restoreAfterAuth:\s*snapshot\s*=>/);
assert.match(landingMotion, /latchInput\?\.addEventListener\("keydown"/);

assert.match(landingCss, /Compass-first public journey/);
assert.match(landingCss, /compass-discovery-glint/);
assert.match(landingCss, /landing-needle-seek/);
assert.match(landingCss, /data-compass-level="opening"/);
assert.match(landingCss, /compass-primary-paths\[aria-hidden="false"\]/);
assert.match(landingCss, /compass-world-paths\[aria-hidden="false"\]/);
assert.match(landingCss, /compass-lid-unfold/);
assert.match(landingCss, /\.landing-compass-assembly \{ --compass-scale:1/);
assert.match(landingCss, /\.journey-tone-dialog\.is-open \.journey-tone-dialog-panel/);
assert.match(landingCss, /journey-tone-dialog-choice-in/);
assert.match(landingCss, /\.story-world-canvas\.is-visible \{ opacity:1;filter:none;transform:none/);
assert.match(landingCss, /\.world-back \{ position:fixed/);
assert.match(landingCss, /rondell-place-card\[data-offset="0"\]/);
assert.match(landingCss, /prefers-reduced-motion:reduce/);
assert.match(shellCss, /lv-public-intro-fade/);
assert.match(shellCss, /lv-public-app-after-intro/);
assert.doesNotMatch(shellCss, /lv-public-logo-dock|--lv-public-dock-/);
assert.match(shellCss, /lv-boot-revealing\.lv-public-entry-active/);
assert.match(landingCss, /compass-hardware-clue/);
assert.match(landingCss, /\.compass-latch>i::before \{ left:var\(--latch-x\)/);
assert.doesNotMatch(landing, /compass-engraving/);

assert.equal((landing.match(/data-memory-mode=/g) || []).length, 5);
assert.equal((landing.match(/data-memory-preview=/g) || []).length, 4);
assert.equal((landing.match(/data-phone-tab=/g) || []).length, 3);
assert.equal((landing.match(/data-phone-panel=/g) || []).length, 3);
assert.doesNotMatch(landing, /<iframe/);
assert.match(landing, /Reel Studio/);
assert.match(landing, /Fotobuch-Vorschau/);
assert.match(landing, /Interaktive Vorschau · keine Buchung · keine Kontodaten/);
assert.match(landing, /Hallo, wir sind Luvia/);
assert.match(landing, /Luvia ist keine Liste zum Abarbeiten, sondern eure Reise, die mit euch lebt\./);
assert.match(landing, /Der Living Compass hört zu, lernt mit und führt euch ruhig/);
assert.doesNotMatch(landing, /tests\/fixtures\/m16\.5q-living-compass-recovery-browser\.html/);
assert.doesNotMatch(brandCompass, /filter="url\(#shadow\)"/);
assert.match(demo, /<base href="\.\.\/\.\.\/">/);
assert.match(demo, /<meta name="robots" content="noindex,nofollow">/);

assert.equal(photoSources.photos.length, 5);
assert.equal(photoSources.license, 'https://unsplash.com/license');
for (const photo of photoSources.photos) {
  assert.ok(fs.existsSync(path.join(root, 'assets/public-landing', photo.asset)), `${photo.asset} missing`);
  assert.match(landing, new RegExp(photo.asset.replace('.', '\\.')));
  assert.match(landing, new RegExp(photo.photographer));
  assert.match(sw, new RegExp(photo.asset.replace('.', '\\.')));
}
assert.equal((landing.match(/Foto ·/g) || []).length, 5);
assert.match(sw, /luvia-shell-v13\.82\.168/);
assert.match(sw, /svg\|png\|webp\|ico/);
assert.match(sw, /travel-photo-sources\.json/);
assert.match(sw, /const PRECACHE_CONCURRENCY=4/);
assert.doesNotMatch(sw, /Promise\.allSettled\(APP_SHELL\.map/);

console.log('M16.5S Compass-first public Landing/Auth integration contract: PASS');
