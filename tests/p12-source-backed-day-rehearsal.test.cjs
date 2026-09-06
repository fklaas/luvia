'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('core/journey/journey-resilience-core.js','utf8'),context={Date,Math,Object,Array,Map,Set,JSON,Number,String,TypeError};context.globalThis=context;vm.createContext(context);vm.runInContext(source,context);
const core=context.LuviaJourneyResilienceCoreV1,now='2026-09-06T10:00:00.000Z',entries=[
 {id:'breakfast',title:'Frühstück',startAt:'2027-06-12T10:00:00.000Z',endAt:'2027-06-12T11:00:00.000Z',durationMinutes:60},
 {id:'museum',title:'Museum',startAt:'2027-06-12T11:25:00.000Z',endAt:'2027-06-12T12:25:00.000Z',durationMinutes:60,transferMinutes:20,routeMode:'walking',routeConfidence:.7,routeEvidence:[{source:'HERE Routing',kind:'duration',observedAt:'2026-09-06T09:56:00.000Z',live:true}]}
];
const input={now,travelSpeed:'balanced',entries,contextEvidence:[{source:'DWD',kind:'weather',supports:['weather'],observedAt:'2026-09-06T09:50:00.000Z',live:true}]},rehearsal=core.rehearseDay(input);
assert.deepEqual(Array.from(rehearsal.scenarios,item=>item.id),['favorable','expected','adverse']);
assert.equal(rehearsal.scenarios.every(item=>item.probability===null&&item.probabilityClaim===false&&item.automaticMutation===false),true);
assert.ok(rehearsal.scenarios[0].routeMinutes<=rehearsal.scenarios[1].routeMinutes);assert.ok(rehearsal.scenarios[1].routeMinutes<=rehearsal.scenarios[2].routeMinutes);
assert.ok(rehearsal.scenarios[0].totalDelayMinutes<=rehearsal.scenarios[1].totalDelayMinutes);assert.ok(rehearsal.scenarios[1].totalDelayMinutes<=rehearsal.scenarios[2].totalDelayMinutes);
assert.equal(rehearsal.routes[0].sourceSummary,'HERE Routing');assert.equal(rehearsal.routes[0].liveStatus,'live');assert.equal(rehearsal.routes[0].dataAgeLabel,'vor 4 Min. beobachtet');
assert.equal(rehearsal.context.find(item=>item.id==='weather').status,'evidenced');assert.equal(rehearsal.context.find(item=>item.id==='weather').sourceSummary,'DWD');
assert.deepEqual(Array.from(rehearsal.unknownFactors),['Verkehr und Störungen','Öffnungszeiten','Auslastung']);
assert.ok(rehearsal.recommendations.length>0);assert.equal(rehearsal.recommendations.every(item=>item.requiresConfirmation===true&&item.automaticMutation===false&&item.ownerContract==='journey.v1'),true);
assert.match(rehearsal.scenarioSignature,/^fnv1a-/);assert.equal(rehearsal.scenarioSignature,core.rehearseDay(input).scenarioSignature);assert.equal(rehearsal.automaticMutation,false);assert.equal(rehearsal.successProbability,null);

const unknown=core.rehearseDay({now,entries:[entries[0],{...entries[1],routeEvidence:[]} ]});
assert.equal(unknown.routes[0].evidenceCoverage,0);assert.equal(unknown.routes[0].liveStatus,'unknown');assert.equal(unknown.scenarios.every(item=>item.evidenceStatus==='unknown'),true);

const composer=fs.readFileSync('app/journey/journey-day-composer.js','utf8'),dashboard=fs.readFileSync('core/ai/ai-dashboard-service.js','utf8');
assert.match(composer,/Günstiger Verlauf/);assert.match(composer,/Erwarteter Verlauf/);assert.match(composer,/Ungünstiger Verlauf/);assert.match(composer,/Unbekannte Einflüsse/);
assert.match(dashboard,/Günstiger Verlauf/);assert.match(dashboard,/Ungünstiger Verlauf/);assert.match(dashboard,/keine Erfolgswahrscheinlichkeit/);
console.log('P12 source-backed favorable/expected/adverse day rehearsal, unknown factors and confirmed owner recommendations: PASS');
