'use strict';
const assert=require('node:assert/strict');const fs=require('node:fs');
const fixture=fs.readFileSync('tests/fixtures/m16.5-block0-human-ai-language-browser.html','utf8');
const contracts=JSON.parse(fs.readFileSync('config/luvia-human-ai-language-contracts.v1.json','utf8'));
assert.match(fixture,/Block 0\.04/);assert.match(fixture,/human-ai-language-compiler-core\.js/);assert.match(fixture,/luvia-human-ai-action-registry\.v1\.json/);assert.match(fixture,/luvia-human-ai-language-contracts\.v1\.json/);
assert.match(fixture,/Trage Minigolf am 14\.06\.2027 gegen 14 ur in meine timline ein/);assert.match(fixture,/Find a quiet restaurant near the water and save it as favourite/);
assert.match(fixture,/Nur verstehen · nichts verändern/);assert.match(fixture,/item\.action\?\.stateChanging/);
assert.equal(contracts.summary.semanticActions,333);assert.ok(contracts.summary.curatedActionIds>=140);
console.log('M16.5 Block 0 visible Human-AI language browser: PASS');
