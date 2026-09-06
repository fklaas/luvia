'use strict';
const assert=require('node:assert/strict');const fs=require('node:fs');
const fixture=fs.readFileSync('tests/fixtures/m16.5-block0-human-ai-safety-browser.html','utf8');const policy=JSON.parse(fs.readFileSync('config/luvia-human-ai-safety-policy.v1.json','utf8'));
assert.match(fixture,/Block 0\.05/);assert.match(fixture,/human-ai-safety-policy-core\.js/);assert.match(fixture,/luvia-human-ai-safety-policy\.v1\.json/);assert.match(fixture,/Buchung wirklich absenden/);assert.match(fixture,/Ohne Netz buchen/);assert.match(fixture,/Standort freigeben/);assert.match(fixture,/Reise als Mitglied archivieren/);assert.match(fixture,/Nichts wird hier ausgeführt/);
assert.equal(policy.summary.policyActions,333);assert.equal(Object.keys(policy.summary.classifications).length,6);assert.ok(policy.summary.consentGated>0);assert.ok(policy.summary.providerGated>0);
console.log('M16.5 Block 0 visible shared Human-AI safety browser: PASS');
