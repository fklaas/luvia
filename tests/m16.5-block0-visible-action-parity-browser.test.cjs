'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

const fixture=fs.readFileSync('tests/fixtures/m16.5-block0-human-ai-action-parity-browser.html','utf8');
const registry=JSON.parse(fs.readFileSync('config/luvia-human-ai-action-registry.v1.json','utf8'));

assert.equal(registry.actions.length,333,'the visible Block 0 gate requires the complete 333-action registry');
assert.match(fixture,/Nur Prüfung · verändert nichts/,'the visible gate must be explicitly read-only');
assert.match(fixture,/fetch\('\.\.\/\.\.\/config\/luvia-human-ai-action-registry\.v1\.json'/,'the fixture must render the versioned registry instead of a copied list');
assert.match(fixture,/data-load-state="loading"/);
assert.match(fixture,/data\?\.contractId!=='luvia\.human-ai-action-registry\.v1'/,'the visible gate must require the versioned registry contract');
assert.match(fixture,/data\?\.summary\?\.semanticActions!==333/,'the visible gate must fail closed on an incomplete registry');
assert.match(fixture,/id="search" type="search"/);
assert.match(fixture,/buchen:'buch'/,'the suggested booking search term must match booking word forms');
assert.match(fixture,/id="category"/);
assert.match(fixture,/id="coverage-filter"/);
assert.match(fixture,/B0\.02 · \$\{boundOwners\} Owner-Wege belegt/);
assert.match(fixture,/Alle inventarisierten Owner-Methoden sind lokal belegt/);
assert.match(fixture,/14 Uhr bleibt 14 Uhr/);
assert.match(fixture,/B0\.03 · 24 von 24 Eingabeverträgen aktiv/);
assert.match(fixture,/validateActionInput\('places\.place\.plan'/);
assert.match(fixture,/4 Places-Aktionen geprüft/);
assert.match(fixture,/Kein Klick bucht doppelt/);
assert.match(fixture,/validateActionInput\('booking\.reservation\.create'/);
assert.match(fixture,/5 Booking-Aktionen geprüft/);
assert.match(fixture,/24 von 24 sind aktiv/);
assert.match(fixture,/runtimeEnforced\?\.length!==24/);
assert.match(fixture,/0 Eingabeverträge offen/);
assert.match(fixture,/Öffentlich geprüft/);
assert.match(fixture,/Noch nicht im Chat/);
assert.match(fixture,/Bestätigung erforderlich/);
assert.match(fixture,/Sie behauptet ausdrücklich nicht, dass alle 333 Aktionen bereits im Chat ausführbar sind/);
assert.match(fixture,/@media\(max-width:520px\)/);
assert.match(fixture,/@media\(prefers-reduced-motion:reduce\)/);

console.log('M16.5 Block 0 visible Human-AI action parity browser: PASS');
