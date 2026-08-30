'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const dashboard=read('core/ai/ai-dashboard-service.js');
const runtimeSource=read('core/ai/ai-action-runtime.js');
const actionCoreSource=read('core/intelligence/intelligence-action-contract-core.js');
const css=read('core/ai/ai-brain.css');

assert.match(dashboard,/kind:'sheet'/,'Luvia Compass must use the universal bottom-up Living Sheet');
assert.match(dashboard,/Wohin darf Luvia dich führen\?/);
assert.match(dashboard,/Ein Satz darf mehrere Wünsche enthalten/);
assert.match(dashboard,/actionResponse\.results\.forEach\(appendRichResult\)/,'every routed owner result must be rendered');
assert.match(dashboard,/LuviaJourneySuggestions\.openResults/,'AI Places must enter the shared Journey/Places result sheet');
assert.match(dashboard,/selectedId:subject\.providerPlaceId/,'the directly selected AI Place remains selected');
assert.match(dashboard,/reads\?\.getActiveTrip/,'modern trip.v1 reads binding must work');
assert.match(runtimeSource,/multiIntent:requests\.length>1/);
assert.match(runtimeSource,/Zur Timeline hinzufügen/);
assert.match(css,/\.luv-ai-proposal-overlay\.luvia-living-sheet-overlay/);
assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
assert.match(css,/scrollbar-width:none/);

const sandbox={window:{},globalThis:null,Object,Array,String,Number,Boolean,Date,Math,RegExp,JSON,Set,Map,console};
sandbox.globalThis=sandbox.window;
vm.runInNewContext(actionCoreSource,sandbox,{filename:'intelligence-action-contract-core.js'});
const core=sandbox.LuviaIntelligenceActionContractCoreV1;
assert.ok(core,'intelligence action contract missing');
const routes=core.routeIntents('Am Dienstag gegen 13 Uhr vegetarisch essen, danach ins Museum und später unsere Buchungen prüfen.');
assert.equal(routes.length,3,'one natural-language sentence must route to Places, Journey and Booking');
assert.deepEqual(Array.from(routes,r=>r.actionId),['booking.trip.read','places.discovery.recommend','journey.day.read']);
assert.deepEqual(Array.from(routes.find(r=>r.actionId==='places.discovery.recommend').input.categories),['food','culture']);

console.log('M16.5AB Living Compass AI owner orchestration OK');
