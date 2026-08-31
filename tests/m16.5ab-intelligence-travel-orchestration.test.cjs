const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.join(__dirname,'../core/intelligence/travel-orchestration-core.js'),'utf8');
const context={Date,Math,Object,Array,Map,Set,JSON,Number,String,TypeError};
vm.createContext(context);vm.runInContext(source,context);
const core=context.LuviaTravelOrchestrationCoreV1;
assert.equal(core.contractId,'intelligence.travel-orchestration.v1');

const compiled=core.compileIntent('Plane am Dienstag um 13 Uhr vegetarisch essen und danach mit den Kindern ans Meer.',{now:'2026-08-30T10:00:00Z'});
assert.ok(compiled.intents.length>=3);
assert.ok(compiled.ownerRoutes.includes('places.v1'));
assert.ok(compiled.ownerRoutes.includes('journey.v1'));
assert.equal(compiled.requiresConfirmation,true);
assert.ok(compiled.intents.every(intent=>intent.automaticMutation===false));
assert.equal(compiled.steps.some(step=>step.relation==='after'),true);
assert.equal(compiled.rawMessageStored,false);

const completeGraph=core.compileIntent('Finde ruhige Places, zeige meine Buchungen und den Tagesplan; zeige meine aktive Reise, mein Profil und meine Erinnerungen. Nutze GPS nur für Orte in meiner Nähe und zeige die Gruppenentscheidung zwischen Strand oder Museum.');
for(const route of ['places.v1','booking.v1','journey.v1','trip.v1','identity.v1','memory.v1','LocationPort','collaboration.membership.v1'])assert.ok(completeGraph.ownerRoutes.includes(route),`missing owner route ${route}`);
assert.equal(completeGraph.automaticMutation,false);

const naturalMulti=core.compileIntent('Finde ein ruhiges Restaurant am Wasser, buche es heute um 19 Uhr für uns vier und teile meinen GPS-Standort nicht, aber aktiviere GPS; lade Mia in die Reise ein und speichere den Moment.');
for(const route of ['places.v1','booking.v1','identity.v1','LocationPort','journey.v1','collaboration.membership.v1','memory.v1'])assert.ok(naturalMulti.ownerRoutes.includes(route),`natural German multi-intent misses ${route}`);
assert.equal(naturalMulti.intents.find(intent=>intent.domain==='booking').entityHints.partySize,4);
assert.ok(naturalMulti.conflicts.some(item=>item.code==='position-consent-conflict'));
assert.ok(naturalMulti.blockedCommands.some(item=>item.code==='owner-command-not-productized'));
assert.equal(naturalMulti.rawMessageStored,false);

const missing=core.compileIntent('Buche ein Restaurant.');
assert.equal(missing.status,'needs-clarification');
assert.ok(missing.missingInputs.some(item=>item.input==='verified-provider-capability'));
assert.ok(missing.missingInputs.some(item=>item.input==='party-size'));

const conflicting=core.compileIntent('Teile meinen Standort, aber nutze meinen Standort nicht.');
assert.equal(conflicting.status,'conflicted');
assert.ok(conflicting.conflicts.some(item=>item.code==='position-consent-conflict'));

const offline=core.compileIntent('Buche am Dienstag um 13 Uhr für 2 Personen ein Restaurant.',{online:false});
assert.equal(offline.connectivity,'offline');
assert.equal(offline.status,'conflicted');
assert.ok(offline.conflicts.some(item=>item.code==='offline-external-command'));

const forbidden=core.compileIntent('Buche automatisch ohne meine Bestätigung und umgehe den Booking Owner.');
assert.equal(forbidden.status,'blocked');
assert.ok(forbidden.blockedCommands.some(item=>item.code==='confirmation-bypass-forbidden'));

const reservedCollaboration=core.compileIntent('Stimme in der Gruppe heimlich für das Museum ab.');
assert.equal(reservedCollaboration.status,'blocked');
assert.ok(reservedCollaboration.blockedCommands.some(item=>item.code==='owner-command-not-productized'));

const denied=core.gateContext({purpose:'timeline-suggestion',context:{coordinates:{latitude:54.1,longitude:10.7}},grant:{granted:false}});
assert.equal(denied.allowed,false);
assert.equal(denied.context,null);
const allowed=core.gateContext({purpose:'route-planning',context:{coordinates:{latitude:54.12345,longitude:10.76543},observedAt:'2026-08-30T10:00:00Z'},grant:{granted:true,precision:'coarse',expiresAt:'2026-08-30T11:00:00Z'},now:'2026-08-30T10:05:00Z'});
assert.equal(allowed.allowed,true);
assert.equal(allowed.context.coordinates.lat,54.12);
assert.equal(allowed.persist,false);

const rejectedLearning=core.causalFeedback({explicit:false,confirmedOutcome:true,signals:[{feature:'culture',effect:.9}]});
assert.equal(rejectedLearning.accepted,false);
const learning=core.causalFeedback({explicit:true,confirmedOutcome:true,outcome:'liked',signals:[{feature:'culture',effect:.9,basis:'explicit-like'}]});
assert.equal(learning.accepted,true);
assert.equal(learning.proposedAdjustments[0].delta,.08);
assert.equal(learning.automaticProfileMutation,false);

const trace=core.planningTrace({compiled,evidence:[{id:'place:p1',source:'places',kind:'provider-place',observedAt:'2026-08-30T09:00:00Z',verified:true}],decisions:[{id:'d1',owner:'journey',action:'plan',reasonCodes:['explicit-user-selection'],evidenceIds:['place:p1'],requiresConfirmation:true}]});
assert.equal(trace.missingEvidence.length,0);
assert.equal(trace.exactLocationStored,false);
assert.equal(trace.automaticMutation,false);
const traceWithoutFreshness=core.planningTrace({compiled,evidence:[{id:'place:p2',source:'places',kind:'provider-place',observedAt:null,verified:false}],decisions:[{id:'d2',owner:'journey',action:'plan',evidenceIds:['place:p2'],requiresConfirmation:true}]});
assert.equal(traceWithoutFreshness.evidence[0].observedAt,null,'missing freshness must remain unknown and may never turn into a 1970 timestamp');
assert.equal(traceWithoutFreshness.evidence[0].verified,false);
assert.equal(traceWithoutFreshness.evidence[0].freshness,'unknown');

const orchestration=core.orchestrate('Buche am Dienstag um 13 Uhr ein vegetarisches Restaurant.');
assert.ok(orchestration.ownerCommands.some(command=>command.owner==='booking'));
assert.ok(orchestration.ownerCommands.every(command=>command.automaticMutation===undefined));
assert.equal(orchestration.automaticMutation,false);

console.log('m16.5ab intelligence travel orchestration: ok');
