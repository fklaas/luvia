'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const read=file=>fs.readFileSync(file,'utf8');
const registry=JSON.parse(read('config/luvia-human-ai-action-registry.v1.json'));
const languageContracts=JSON.parse(read('config/luvia-human-ai-language-contracts.v1.json'));
const context={console};vm.createContext(context);vm.runInContext(read('core/intelligence/human-ai-language-compiler-core.js'),context,{filename:'human-ai-language-compiler-core.js'});
const compiler=context.LuviaHumanAILanguageCompilerCoreV1;
const compile=utterance=>compiler.compile({utterance,catalog:registry.actions,referenceDate:'2027-06-13',timeZone:'Europe/Berlin'});

assert.equal(compiler.contractId,'intelligence.human-ai-language-compiler.v1');
assert.equal(languageContracts.actions.length,330);
assert.equal(languageContracts.summary.canonicalGermanActions,330);
assert.ok(languageContracts.summary.curatedActionIds>=140);
assert.ok(languageContracts.summary.curatedRules>=140);
assert.deepEqual([...languageContracts.summary.supportedLocales],['de','en','mixed']);

for(const action of registry.actions){
  const contract=languageContracts.actions.find(item=>item.actionId===action.id);
  assert.ok(contract,`language contract must exist for ${action.id}`);
  assert.equal(contract.canonical.de[0],action.label);
}
for(const category of Object.keys(registry.summary.categories)){
  const action=registry.actions.find(item=>item.category===category),result=compile(action.label);
  assert.ok(result.candidates.some(candidate=>candidate.actionId===action.id),`canonical category sample must compile to ${action.id}: ${action.label}`);
  assert.equal(result.executed,false);assert.equal(result.mutated,false);
}

const typo=compile('Trage Minigolf am 14.06.2027 gegen 14 ur in meine timline ein');
assert.equal(typo.language,'de');
assert.equal(typo.normalized,'trage minigolf am 14.06.2027 gegen 14 uhr in meine timeline ein');
assert.equal(typo.candidates[0].actionId,'journey.entry.create');
assert.equal(typo.entities.dates[0].iso,'2027-06-14');
assert.equal(typo.entities.dates[0].display,'14.06.2027');
assert.equal(typo.entities.times[0].value,'14:00');

const sequence=compile('Buche uns morgen um 19 Uhr einen Tisch für vier in Scharbeutz und trage danach Minigolf um 21 Uhr in die Timeline ein.');
assert.equal(sequence.summary.multiIntent,true);
assert.equal(sequence.entities.dates[0].iso,'2027-06-14');
assert.equal(sequence.entities.partySize,4);
assert.equal(sequence.entities.location.toLowerCase(),'scharbeutz');
assert.deepEqual(Array.from(sequence.candidates,candidate=>candidate.actionId),['booking.reservation.create','journey.entry.create']);
assert.deepEqual(Array.from(sequence.candidates,candidate=>candidate.order),[1,2]);

const english=compile('Find a quiet restaurant near the water and save it as favourite');
assert.equal(english.language,'en');
assert.deepEqual(Array.from(english.candidates,candidate=>candidate.actionId),['places.restaurant.search','places.favorite']);
assert.ok(english.entities.spatialConstraints.some(item=>item.kind==='waterfront'&&!item.negated));

const spatial=compile('Finde ein ruhiges Restaurant im Zentrum, aber nicht am Strand');
assert.equal(spatial.candidates[0].actionId,'places.restaurant.search');
assert.ok(spatial.entities.spatialConstraints.some(item=>item.kind==='center'&&!item.negated));
assert.ok(spatial.entities.spatialConstraints.some(item=>item.kind==='beach'&&item.negated));

const negated=compile('Bitte nicht einen Tisch für vier buchen');
const booking=negated.candidates.find(candidate=>candidate.actionId==='booking.reservation.create');
assert.ok(booking);
assert.equal(booking.negated,true);
assert.equal(booking.status,'BLOCKED_BY_NEGATION');
assert.equal(negated.guard.naturalLanguageConfirmsMutation,false);
assert.equal(negated.guard.ownerExecutionAllowed,false);

const mixed=compile('Bitte find a quiet restaurant im Zentrum und save it as favourite');
assert.equal(mixed.language,'mixed');
assert.equal(mixed.summary.multiIntent,true);

const source=read('core/intelligence/human-ai-language-compiler-core.js');
assert.doesNotMatch(source,/\b(?:window|document|localStorage|sessionStorage|LuviaTripStore|LuviaJourneyContractV1|LuviaBookingContractV1)\b/);
console.log(`M16.5 Block 0 Human-AI language compiler: PASS (${registry.actions.length} canonical; ${languageContracts.summary.curatedActionIds} curated actions; ${languageContracts.summary.curatedRules} rules)`);
