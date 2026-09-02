'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const read=file=>fs.readFileSync(file,'utf8');
const registry=JSON.parse(read('config/luvia-human-ai-action-registry.v1.json'));
const document=JSON.parse(read('config/luvia-human-ai-consumer-projections.v1.json'));
const context={console};
vm.createContext(context);
vm.runInContext(read('core/intelligence/human-ai-consumer-projection-core.js'),context,{filename:'human-ai-consumer-projection-core.js'});
const core=context.LuviaHumanAIConsumerProjectionCoreV1;

assert.equal(document.projections.length,330);
assert.equal(new Set(document.projections.map(item=>item.actionId)).size,330);
assert.equal(document.summary.projectedActions,330);
assert.equal(document.summary.capabilityStates,15);
assert.equal(document.summary.dateFormat,'TT.MM.JJJJ');
assert.equal(core.formatDate('2027-06-14'),'14.06.2027');
assert.equal(core.formatTime('2027-06-14T14:05:00Z'),'14:05 Uhr');

const byId=id=>registry.actions.find(action=>action.id===id);
const ready=core.projectCapability({action:byId('places.restaurant.search'),capability:{state:'AVAILABLE_NOW'}});
assert.equal(ready.view,'ACTION');
assert.equal(ready.primaryAction.kind,'PROCEED');
const missing=core.projectCapability({action:byId('booking.reservation.create'),capability:{state:'NEEDS_INPUT',missing:['place','partySize']}});
assert.equal(missing.view,'QUESTION');
assert.match(missing.message,/ausgewählten Ort/);
assert.match(missing.message,/Personenzahl/);
const internalBookingFields=core.projectIntentSummary({status:'needs-clarification',intents:[{clause:'Reservierung prüfen',mode:'read'}],missingInputs:[{input:'bookable-target'},{input:'party-size'},{input:'booking-change'}],conflicts:[],blockedCommands:[]});
assert.match(internalBookingFields.message,/den Ort/);
assert.match(internalBookingFields.message,/die Personenzahl/);
assert.match(internalBookingFields.message,/die gewünschte Änderung/);
assert.doesNotMatch(internalBookingFields.message,/bookable target|party size|booking change/i,'internal schema labels must never reach the user');
const offline=core.projectCapability({action:byId('places.restaurant.search'),capability:{state:'NETWORK_REQUIRED'}});
assert.equal(offline.view,'RETRY');
assert.match(offline.message,/Internetverbindung/);
const handoff=core.projectCapability({action:byId('memory.story.create'),capability:{state:'AI_ROUTE_MISSING',manualFlow:{available:true,label:'Memory Owner selbst öffnen',surface:'Memory Composer'}}});
assert.equal(handoff.view,'HANDOFF');
assert.doesNotMatch(handoff.manualFlow.label,/\bOwner\b/i);

const single=core.projectIntentSummary({status:'compiled',intents:[{clause:'Minigolf finden',mode:'read'}],missingInputs:[],conflicts:[],blockedCommands:[]});
assert.equal(single.visible,false);
const multi=core.projectIntentSummary({status:'compiled',intents:[{clause:'Minigolf finden',mode:'read'},{clause:'Luftmatratzen finden',mode:'read'}],missingInputs:[],conflicts:[],blockedCommands:[]});
assert.equal(multi.visible,true);
assert.equal(multi.items.length,2);
assert.match(multi.title,/2 Dinge/);
const preview=core.projectPreview({result:{title:'Owner Receipt Preview',message:'Mutation im Action Ledger'},preview:{name:'Strandperle',date:'2027-06-14',time:'14:00'}});
assert.equal(preview.view,'PREVIEW');
assert.equal(preview.details.find(item=>item.label==='Datum').value,'14.06.2027');
assert.doesNotMatch(JSON.stringify(preview),/\b(?:Owner|Receipt|Mutation|Action Ledger)\b/i);
const modifyPreview=core.projectPreview({result:{title:'Buchungsänderung bestätigen'},preview:{name:'DAS LEO',changes:{date:'2027-06-15',time:'19:30',partySize:3}}});
assert.deepEqual(JSON.parse(JSON.stringify(modifyPreview.details)),[
  {label:'Was',value:'DAS LEO'},
  {label:'Neues Datum',value:'15.06.2027'},
  {label:'Neue Uhrzeit',value:'19:30 Uhr'},
  {label:'Neue Personenzahl',value:'3'}
]);
const receipt=core.projectReceipt({result:{title:'Owner Receipt',message:'Provider mutation completed',evidence:{status:'completed'}},recoveryKind:'undo'});
assert.equal(receipt.view,'RECEIPT');
assert.equal(receipt.primaryAction.kind,'UNDO');
assert.doesNotMatch(JSON.stringify({eyebrow:receipt.eyebrow,title:receipt.title,message:receipt.message,note:receipt.note}),/\b(?:Owner|Receipt|Mutation|Provider)\b/i);
assert.equal(core.projectReadFailure({area:'Places Owner'}).view,'ERROR');
assert.equal(core.projectSequenceTransition({finished:true}).message.includes('Alle Wünsche'),true);

for(const projection of document.projections){
  assert.ok(projection.title);
  assert.doesNotMatch(JSON.stringify({title:projection.title,message:projection.message,manualFlow:projection.manualFlow}),/\b(?:Owner|Receipt|Mutation|Action Ledger|Lifecycle|Contract)\b/i,projection.actionId);
}
assert.doesNotMatch(read('core/intelligence/human-ai-consumer-projection-core.js'),/\b(?:window|document|localStorage|sessionStorage|LuviaTripStore|LuviaJourneyContractV1)\b/);
console.log('M16.5 Block 0 complete Human-AI consumer projection: PASS (330/330 actions)');
