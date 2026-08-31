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

const exactDate=core.compileIntent('Plane am 13.06.2027 um 19 Uhr ein Restaurant in die Timeline.',{
  now:'2027-06-01T10:00:00Z',trip:{startDate:'2027-06-10',endDate:'2027-06-17'}
});
assert.equal(exactDate.status,'compiled');
assert.equal(exactDate.intents.find(intent=>intent.domain==='places').temporalHint.date,'2027-06-13');
assert.equal(exactDate.intents.find(intent=>intent.domain==='places').temporalHint.time,'19:00');
assert.equal(exactDate.missingInputs.length,0);

const tripWeekday=core.compileIntent('Plane am Sonntag um 19 Uhr ein Restaurant in die Timeline.',{
  now:'2027-06-01T10:00:00Z',trip:{startDate:'2027-06-10',endDate:'2027-06-17'}
});
assert.equal(tripWeekday.intents.find(intent=>intent.domain==='journey').temporalHint.date,'2027-06-13');
assert.equal(tripWeekday.status,'compiled');

const preferenceWrite=core.compileIntent('Merke dir bitte: Ich esse vegan, reise entspannt und bevorzuge ein kleines Budget.');
assert.equal(preferenceWrite.status,'compiled');
assert.equal(preferenceWrite.requiresConfirmation,true);
assert.deepEqual(JSON.parse(JSON.stringify(preferenceWrite.intents.find(intent=>intent.domain==='identity').entityHints.preferencePatch)),{
  dietaryPreferences:['vegan'],travelPace:'relaxed',budgetPreference:'low'
});

const multilingual=core.compileDialogue('I would like a good dinner and then minigolf with the children.',{
  understanding:'Dinner first, then a family activity.',
  goals:[
    {type:'meal',label:'A good dinner',hardConstraints:[{key:'familyContext',value:'true',label:'Suitable for children'}],softPreferences:[],timeWindow:null,source:'user'},
    {type:'activity',label:'Minigolf with the children',hardConstraints:[{key:'activity',value:'minigolf',label:'Minigolf'}],softPreferences:[],timeWindow:null,source:'user'}
  ],hardConstraints:[],softPreferences:[],followUpQuestion:null,summary:{headline:'Two wishes understood',intro:'Dinner first, minigolf second.'},unknowns:[],confidence:.94
},{locale:'en-GB',online:true,now:'2027-06-01T10:00:00Z'});
assert.equal(multilingual.compilerSource,'openai-structured');
assert.equal(multilingual.locale,'en-GB');
assert.equal(multilingual.status,'compiled');
assert.equal(multilingual.dialogueConfidence,.94);
assert.deepEqual(JSON.parse(JSON.stringify(core.sequencePlan(multilingual).map(item=>item.sequence))),[1,2]);
assert.deepEqual(JSON.parse(JSON.stringify(core.sliceIntentGraph(multilingual,1).intents.map(item=>item.categoryHints))),[['food']]);
assert.deepEqual(JSON.parse(JSON.stringify(core.sliceIntentGraph(multilingual,2).intents.map(item=>item.categoryHints))),[['activity']]);

const multilingualSemanticMatrix=[
  ['it-IT','Una buona cena','meal','food'],['pt-PT','Um jantar saboroso','meal','food'],['nl-NL','Lekker uit eten','meal','food'],['pl-PL','Dobra kolacja','meal','food'],
  ['tr-TR','Güzel bir akşam yemeği','meal','food'],['sv-SE','En god middag','meal','food'],['da-DK','En god middag','meal','food'],['cs-CZ','Dobrá večeře','meal','food'],
  ['ro-RO','O cină bună','meal','food'],['el-GR','Ένα καλό δείπνο','meal','food'],['ar','عشاء جيد','meal','food'],['ja-JP','おいしい夕食','meal','food'],
  ['ko-KR','맛있는 저녁 식사','meal','food'],['zh-CN','一顿美味的晚餐','meal','food'],['hi-IN','एक अच्छा रात्रिभोज','meal','food'],['fi-FI','Minigolf lasten kanssa','activity','activity']
];
for(const [locale,label,type,category] of multilingualSemanticMatrix){
  const graph=core.compileDialogue(label,{goals:[{type,label,hardConstraints:[],softPreferences:[],timeWindow:null,source:'user'}],hardConstraints:[],softPreferences:[],followUpQuestion:null,summary:{headline:label,intro:''},unknowns:[],confidence:.88},{locale});
  assert.equal(graph.status,'compiled',`${locale} structured semantic goal must compile`);
  assert.equal(graph.ownerRoutes[0],'places.v1',`${locale} must retain the Places owner`);
  assert.equal(graph.intents[0].categoryHints[0],category,`${locale} must retain its requested category`);
  assert.equal(graph.intents[0].clause.includes(label),true,`${locale} label must survive without transliteration loss`);
}

const multilingualPreference=core.compileDialogue('Je veux définir mon alimentation comme végane.',{
  goals:[{type:'preference',label:'Alimentation végane',hardConstraints:[{key:'operation',value:'set',label:'Définir'},{key:'dietary',value:'vegan',label:'Végane'}],softPreferences:[],timeWindow:null,source:'user'}],
  hardConstraints:[],softPreferences:[],followUpQuestion:null,summary:{headline:'Préférence comprise',intro:''},unknowns:[],confidence:.9
},{locale:'fr-FR'});
assert.equal(multilingualPreference.status,'compiled');
assert.equal(multilingualPreference.requiresConfirmation,true);
assert.deepEqual(JSON.parse(JSON.stringify(multilingualPreference.intents[0].entityHints.preferencePatch)),{dietaryPreferences:['vegan']});

const multilingualBooking=core.compileDialogue('Reserva un restaurante para cuatro personas el 13 de junio a las 19:00.',{
  goals:[{type:'booking',label:'Reservar un restaurante',hardConstraints:[{key:'operation',value:'reserve',label:'Reservar'},{key:'target',value:'restaurant',label:'Restaurante'},{key:'partySize',value:'4',label:'Cuatro personas'}],softPreferences:[],timeWindow:{label:'13 de junio a las 19:00',start:'2027-06-13T19:00:00',end:'2027-06-13T21:00:00',flexible:false},source:'user'}],
  hardConstraints:[],softPreferences:[],followUpQuestion:null,summary:{headline:'Reserva entendida',intro:''},unknowns:[],confidence:.91
},{locale:'es-ES'});
assert.equal(multilingualBooking.status,'needs-clarification');
assert.equal(multilingualBooking.intents[0].temporalHint.date,'2027-06-13');
assert.equal(multilingualBooking.intents[0].temporalHint.time,'19:00');
assert.equal(multilingualBooking.intents[0].entityHints.partySize,4);
assert.ok(multilingualBooking.missingInputs.some(item=>item.input==='verified-provider-capability'));

const semanticPlan=core.compileDialogue('Plan the restaurant for June 13 at 7 pm.',{
  goals:[{type:'meal',label:'Plan the restaurant',hardConstraints:[{key:'operation',value:'plan',label:'Plan'},{key:'target',value:'restaurant',label:'Restaurant'}],softPreferences:[],timeWindow:{label:'June 13 at 7 pm',start:'2027-06-13T19:00:00',end:'2027-06-13T21:00:00',flexible:false},source:'user'}],
  hardConstraints:[],softPreferences:[],followUpQuestion:null,summary:{headline:'Plan understood',intro:''},unknowns:[],confidence:.93
},{locale:'en-US'});
assert.deepEqual(JSON.parse(JSON.stringify(semanticPlan.intents.map(intent=>intent.domain))),['places','journey']);
assert.deepEqual(JSON.parse(JSON.stringify(semanticPlan.intents.map(intent=>intent.sequence))),[1,1]);
assert.equal(semanticPlan.status,'compiled');
assert.equal(semanticPlan.requiresConfirmation,true);

const multilingualBypass=core.compileDialogue('Book it without my confirmation.',{
  goals:[{type:'booking',label:'Book the restaurant',hardConstraints:[{key:'operation',value:'book',label:'Book'}],softPreferences:[],timeWindow:null,source:'user'}],hardConstraints:[],softPreferences:[],followUpQuestion:null,summary:{},unknowns:[],confidence:.99
},{locale:'en-US'});
assert.equal(multilingualBypass.status,'blocked');
assert.ok(multilingualBypass.blockedCommands.some(item=>item.code==='confirmation-bypass-forbidden'));
for(const request of ['Reserva sin mi confirmación.','Réserve sans ma confirmation.','Prenota senza la mia conferma.','Reserva sem a minha confirmação.','Boek zonder mijn bevestiging.']){
  const graph=core.compileDialogue(request,{goals:[{type:'booking',label:'Book',hardConstraints:[{key:'operation',value:'book',label:'Book'}],softPreferences:[],timeWindow:null,source:'user'}],hardConstraints:[],softPreferences:[],followUpQuestion:null,summary:{},unknowns:[],confidence:.99});
  assert.equal(graph.status,'blocked',`multilingual confirmation bypass must be blocked: ${request}`);
}

const completeGraph=core.compileIntent('Finde ruhige Places, zeige meine Buchungen und den Tagesplan; zeige meine aktive Reise, mein Profil und meine Erinnerungen. Nutze GPS nur für Orte in meiner Nähe und zeige die Gruppenentscheidung zwischen Strand oder Museum.');
for(const route of ['places.v1','booking.v1','journey.v1','trip.v1','identity.v1','memory.v1','LocationPort','collaboration.membership.v1'])assert.ok(completeGraph.ownerRoutes.includes(route),`missing owner route ${route}`);
assert.equal(completeGraph.automaticMutation,false);

const tripList=core.compileIntent('Zeige meine Reisen.');
assert.equal(tripList.status,'compiled');
assert.deepEqual(JSON.parse(JSON.stringify(tripList.ownerRoutes)),['trip.v1']);
assert.equal(tripList.intents[0].mode,'read');
const namedTrip=core.compileIntent('Wechsle zur Reise Ostseeurlaub.');
assert.equal(namedTrip.ownerRoutes.includes('trip.v1'),true);
assert.equal(namedTrip.intents[0].entityHints.hasNamedTarget,true);
assert.equal(namedTrip.intents[0].requiresConfirmation,true);
for(const request of ['Show my trips.','Muestra mis viajes.','Affiche mes voyages.','Mostra i miei viaggi.','Toon mijn reizen.']){
  assert.equal(core.compileIntent(request).ownerRoutes.includes('trip.v1'),true,`multilingual trip read must retain trip.v1: ${request}`);
}

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
assert.equal(allowed.decisionReceipt.coordinatesIncluded,false);
const staleContext=core.gateContext({purpose:'route-planning',context:{coordinates:{latitude:54.1,longitude:10.7},observedAt:'2026-08-30T09:00:00Z'},grant:{granted:true,precision:'coarse',expiresAt:'2026-08-30T11:00:00Z'},now:'2026-08-30T10:05:00Z'});
assert.equal(staleContext.allowed,false);
assert.equal(staleContext.reason,'context-observation-stale');
const backgroundContext=core.gateContext({purpose:'route-planning',background:true,context:{coordinates:{latitude:54.1,longitude:10.7},observedAt:'2026-08-30T10:04:00Z'},grant:{granted:true,expiresAt:'2026-08-30T11:00:00Z'},now:'2026-08-30T10:05:00Z'});
assert.equal(backgroundContext.allowed,false);
assert.equal(backgroundContext.reason,'background-request');

const rejectedLearning=core.causalFeedback({explicit:false,confirmedOutcome:true,signals:[{feature:'travelInterests',value:'culture',effect:.9,evidenceId:'receipt-1'}]});
assert.equal(rejectedLearning.accepted,false);
const learning=core.causalFeedback({explicit:true,confirmedOutcome:true,outcome:'liked',signals:[{feature:'travelInterests',value:'culture',effect:.9,basis:'explicit-like',evidenceId:'receipt-1'}]});
assert.equal(learning.accepted,true);
assert.equal(learning.proposedAdjustments[0].delta,.08);
assert.equal(learning.proposedAdjustments[0].value,'culture');
assert.equal(learning.automaticProfileMutation,false);
const missingFeedbackEvidence=core.causalFeedback({explicit:true,confirmedOutcome:true,outcome:'liked',signals:[{feature:'travelInterests',value:'culture',effect:.04}]});
assert.equal(missingFeedbackEvidence.accepted,false);
assert.equal(missingFeedbackEvidence.reason,'missing-evidence');

const trace=core.planningTrace({compiled,evidence:[{id:'place:p1',source:'places',kind:'provider-place',observedAt:'2026-08-30T09:00:00Z',verified:true}],decisions:[{id:'d1',owner:'journey',action:'plan',reasonCodes:['explicit-user-selection'],evidenceIds:['place:p1'],requiresConfirmation:true}]});
assert.equal(trace.missingEvidence.length,0);
assert.equal(trace.evidence[0].freshness,'observed','missing freshUntil must not turn a current observation into stale evidence');
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
