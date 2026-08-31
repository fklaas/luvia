'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync('core/places/place-intelligence-service.js','utf8');
const window={};
vm.runInNewContext(source,{window,console});
const api=window.LuviaPlaceIntelligence;

const unknown=api.generic({name:'Ort',rating:4.8,userRatingCount:2000,aiMatchScore:96,distanceMeters:500});
assert.equal(unknown.score,null,'AI or provider popularity must never manufacture a personal percentage');
assert.equal(unknown.distanceMeters,null,'an unlabeled distance must never be presented as device GPS distance');
assert.equal(unknown.distanceOrigin,null);

const device=api.generic({rating:4.6,distanceMeters:720,distanceReference:'device',preferenceFit:{score:63,coverage:70,aiScoreUsed:false,method:'deterministic-evidence-weighted'}});
assert.equal(device.score,63);
assert.equal(device.scoreCoverage,70);
assert.equal(device.distanceMeters,720);
assert.equal(device.distanceOrigin,'current-device-location');

const insufficient=api.generic({preferenceFit:{score:88,coverage:20,aiScoreUsed:false}});
assert.equal(insufficient.score,null,'insufficient evidence coverage must suppress the percentage');

const stillThin=api.generic({preferenceFit:{score:88,coverage:44,aiScoreUsed:false}});
assert.equal(stillThin.score,null,'the visible evidence threshold is 45 percent of the fixed formula');

const aiOwned=api.generic({preferenceFit:{score:91,coverage:80,aiScoreUsed:true}});
assert.equal(aiOwned.score,null,'AI-owned percentages are forbidden');

assert.equal(api.diagnostics().rankingSource,'deterministic-evidence-weighted-only');
console.log('M16.5AB Place Intelligence evidence boundary: PASS');
