const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const dashboard=fs.readFileSync('core/ai/ai-dashboard-service.js','utf8');
const orchestration=fs.readFileSync('core/intelligence/travel-orchestration-core.js','utf8');

assert.match(dashboard,/version:4,goalTypes:/,'semantic compiler contract must be explicitly versioned');
assert.match(dashboard,/Interpret the meaning of the complete sentence in context/,'the model must classify complete meaning instead of isolated words');
assert.match(dashboard,/never guess a fallback domain/,'ambiguous meaning must become a question');
assert.match(dashboard,/semanticUsable/,'structured semantic output must be the primary online route');
assert.doesNotMatch(dashboard,/preservesDeterministicOwners/,'keyword owners must not overrule a confident semantic result');
assert.match(dashboard,/Kurze Rückfrage statt einer geratenen Aktion/,'the user must see a clarification instead of a guessed action');
assert.doesNotMatch(orchestration,/openPlaceWish\?\[/,'generic desire verbs must not silently route to Places');
assert.match(orchestration,/semanticLowConfidence/,'low-confidence semantic output must fail into clarification');
assert.match(orchestration,/andere\|nächste\|naechste/,'offline/safety fallback must still recognize trip selection without opening Places');

const context={};
vm.createContext(context);
vm.runInContext(orchestration,context);
const tripSwitch=context.LuviaTravelOrchestrationCoreV1.compileDialogue(
  'Ich will eine andere Reise auswählen.',
  {
    confidence:.97,
    goals:[{
      type:'journey',
      label:'Andere Reise auswählen',
      hardConstraints:[
        {key:'operation',value:'switch',label:'Reise wechseln'},
        {key:'tripRef',value:'another',label:'andere Reise'}
      ]
    }],
    followUpQuestion:{text:'Bitte ergänze Datum und Uhrzeit.',reason:'incorrect generic journey requirement'}
  },
  {online:true,locale:'de-DE'}
);
assert.equal(tripSwitch.status,'compiled','explicit trip switching must not inherit Journey date/time requirements');
assert.deepEqual([...tripSwitch.ownerRoutes],['trip.v1'],'the semantic owner invariant must keep trip switching at the Trip owner');
assert.equal(tripSwitch.intents.length,1);
assert.equal(tripSwitch.intents[0].domain,'trip');
assert.equal(tripSwitch.intents[0].semanticOperation,'switch','the semantic operation must remain available to downstream action routing');
assert.equal(tripSwitch.intents[0].mode,'read','an unnamed target must first return the available trips');
assert.equal(tripSwitch.intents[0].requiresConfirmation,false,'listing trips must not pretend to mutate the active trip');
assert.deepEqual([...tripSwitch.intents[0].missingInputs],[],'trip listing needs neither date nor time');

const reservationRequirementMessage='Zeig mir Nachtclubs in Lübeck und prüfe bei Tonfink, ob ich reservieren muss.';
const reservationRequirementFallback=context.LuviaTravelOrchestrationCoreV1.compileIntent(reservationRequirementMessage,{online:false,locale:'de-DE'});
assert.equal(reservationRequirementFallback.status,'compiled','the bounded fallback must understand the complete reservation-requirement question');
assert.equal(reservationRequirementFallback.requiresConfirmation,false,'asking whether a reservation is needed must never become a booking write');
assert.equal(reservationRequirementFallback.missingInputs.length,0,'a read question must not ask for date, time or party size');
assert.equal(reservationRequirementFallback.intents.every(intent=>intent.mode==='read'),true,'every owner slice of the compound question must stay read-only');

const reservationRequirementSemantic=context.LuviaTravelOrchestrationCoreV1.compileDialogue(
  reservationRequirementMessage,
  {
    confidence:.98,
    goals:[{
      type:'booking',
      label:'Bei Tonfink prüfen, ob eine Reservierung nötig ist',
      hardConstraints:[
        {key:'operation',value:'reserve',label:'Reservierung prüfen'},
        {key:'target',value:'Tonfink',label:'Tonfink'}
      ]
    }]
  },
  {online:true,locale:'de-DE'}
);
assert.equal(reservationRequirementSemantic.status,'compiled','even a coarse model operation must retain the sentence-level read meaning');
assert.equal(reservationRequirementSemantic.requiresConfirmation,false);
assert.equal(reservationRequirementSemantic.intents[0].mode,'read');
assert.equal(reservationRequirementSemantic.intents[0].semanticOperation,'check_requirement');
assert.equal(reservationRequirementSemantic.intents[0].entityHints.targetName,'tonfink');
assert.equal(reservationRequirementSemantic.intents[0].entityHints.bookingRequirementRead,true);
assert.deepEqual([...reservationRequirementSemantic.missingInputs],[]);
assert.match(dashboard,/check_requirement/,'the online model contract must distinguish a requirement check from a booking command');
assert.match(fs.readFileSync('core/ai/ai-action-runtime.js','utf8'),/requirementRead.*places\.discovery\.recommend/s,'a requirement read must resolve the Place and its Booking admission evidence instead of listing existing bookings');

console.log('M16.5 Block 1 semantic-first AI routing: PASS');
