'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const path='core/intelligence/intelligence-action-contract-core.js';
const source=fs.readFileSync(path,'utf8');
for(const [label,pattern] of [
  ['browser global',/\bwindow\b|\bglobalThis\b/],['DOM',/\bdocument\b|\bCustomEvent\b|\bdispatchEvent\b/],['device API',/\bnavigator\b/],
  ['browser storage',/\blocalStorage\b|\bsessionStorage\b|\bindexedDB\b/],['network',/\bfetch\s*\(|\bXMLHttpRequest\b/],['provider SDK',/\bSupabase\b/i],['direct DB',/\.from\s*\(|\.rpc\s*\(/]
])assert.equal((source.match(pattern)||[]).length,0,`Action Contract Core must remain browserless: ${label}`);

const context={Object,Array,Map,Set,WeakSet,Error,String,Boolean,Number,Math,JSON,RegExp};
vm.createContext(context);vm.runInContext(source,context,{filename:path});
const core=context.LuviaIntelligenceActionContractCoreV1;
const actions=core.listActions();

assert.equal(actions.length,30);
assert.deepEqual([...new Set(actions.map(action=>action.owner))].sort(),['booking','identity','intelligence','journey','memory','navigation','places','trip']);
for(const action of actions){
  assert.ok(/^R[0-3]$/.test(action.risk),`${action.id} risk must be R0-R3`);
  assert.ok(action.ownerContract.endsWith('.v1'));
  assert.ok(action.ownerMethod.length>0);
  assert.ok(action.permissions.length>0);
  if(action.autoRun){
    if(action.effect==='NAVIGATION')assert.deepEqual([action.effect,action.risk,action.confirmation],['NAVIGATION','R0','USER_GESTURE']);
    else assert.deepEqual([action.effect,action.risk,action.confirmation],['READ','R0','NEVER']);
  }
  if(['R2','R3'].includes(action.risk))assert.equal(action.idempotency,'REQUIRED');
  if(action.risk==='R3')assert.equal(action.confirmation,'EXPLICIT');
}
assert.equal(actions.some(action=>action.risk==='R4'),false,'M16 must not silently add R4 authority');
assert.equal(core.getAction('booking.reservation.cancel').ownerMethod,'commands.cancelBooking');
assert.equal(core.getAction('booking.reservation.cancel').risk,'R3');
assert.equal(core.getAction('trip.update.details').confirmation,'EXPLICIT');
assert.equal(core.getAction('memory.story.save').ownerContract,'memory.v1');
assert.equal(core.getAction('identity.preferences.update').ownerContract,'identity.v1');
assert.equal(core.getAction('events.verified.read').ownerContract,'intelligence.verified-events.v1');
assert.equal(core.getAction('events.verified.read').effect,'READ');
for(const actionId of ['journey.entry.schedule','journey.entry.remove','journey.entry.restore']){
  const action=core.getAction(actionId);assert.equal(action.ownerContract,'journey.v1');assert.equal(action.confirmation,'EXPLICIT');assert.equal(action.risk,'R2');
}
for(const actionId of ['journey.visit.update','journey.visit.remove','journey.visit.restore']){
  const action=core.getAction(actionId);assert.equal(action.ownerContract,'places.v1');assert.equal(action.confirmation,'EXPLICIT');assert.equal(action.risk,'R2');
}
assert.equal(core.validateActionInput('journey.entry.schedule',{tripId:'trip-1',entryId:'event:1',startAt:'2027-06-12T10:00:00+02:00',durationMinutes:45,expectedRevision:'rev-1'}).valid,true);
assert.equal(core.validateActionInput('journey.entry.remove',{tripId:'trip-1',entryId:'event:1',expectedRevision:'rev-1'}).valid,true);
assert.equal(core.validateActionInput('journey.entry.restore',{tripId:'trip-1',recoveryId:'recovery-1',expectedRevision:'rev-2'}).valid,true);
assert.equal(core.validateActionInput('journey.visit.update',{tripId:'trip-1',visitId:'visit-1',startAt:'2027-06-12T18:15:00+02:00',durationMinutes:60,expectedRevision:'visit-rev-1'}).valid,true);
assert.equal(core.validateActionInput('journey.visit.remove',{tripId:'trip-1',visitId:'visit-1',expectedRevision:'visit-rev-2'}).valid,true);
assert.equal(core.validateActionInput('journey.visit.restore',{tripId:'trip-1',recoveryId:'visit-recovery-1',visitId:'visit-1',expectedRevision:'visit-rev-3'}).valid,true);
assert.equal(core.validateActionInput('journey.visit.update',{visitId:'visit-1',startAt:'2027-06-12T18:15:00',durationMinutes:4,expectedRevision:'visit-rev-1'}).valid,false,'a visit update without UTC offset and bounded duration must fail closed');

assert.throws(()=>core.createExecutionEnvelope('trip.update.details',{tripId:'trip-1'},{surface:'chat'},{correlationId:'corr-1'}),error=>error?.code==='INTELLIGENCE_ACTION_IDEMPOTENCY_REQUIRED');
const envelope=core.createExecutionEnvelope('booking.reservation.cancel',{bookingId:'booking-1',token:'hidden'},{surface:'chat',authorization:'hidden'},{idempotencyKey:'idem-1',correlationId:'corr-1',requestedAt:'2026-08-24T12:00:00.000Z'});
assert.equal(envelope.risk,'R3');
assert.equal(envelope.idempotencyKey,'idem-1');
assert.equal('token' in envelope.input,false);
assert.equal('authorization' in envelope.context,false);

const confirmation=core.createConfirmation({actionId:'booking.reservation.cancel',ledgerId:'ledger-1',correlationId:'corr-1',idempotencyKey:'idem-1',preview:{bookingId:'booking-1',token:'hidden'}});
assert.equal(confirmation.kind,'confirmation');
assert.equal(confirmation.evidence.risk,'R3');
assert.equal(confirmation.meta.requiresConfirmation,true);
assert.equal('token' in confirmation.evidence.preview,false);

const capability=core.createCapabilitySnapshot({'trip.v1':true,'places.v1':true,'booking.v1':{available:false,reason:'provider-offline'},'journey.v1':true,'memory.v1':true,'identity.v1':true});
assert.equal(capability.count,30);
assert.equal(capability.actions.find(action=>action.actionId==='booking.trip.read').available,false);
assert.equal(capability.actions.find(action=>action.actionId==='booking.trip.read').reason,'provider-offline');
assert.equal(capability.actions.find(action=>action.actionId==='trip.active.list').available,true);

const trips=core.normalizeResult({kind:'trip_collection',owner:'trip',items:[{id:'trip-1',title:'Ostsee',active:true,actions:[{actionId:'trip.active.select',payload:{tripId:'trip-1'}}]}]});
assert.equal(trips.items[0].active,true);assert.equal(trips.items[0].actions[0].risk,'R1');
const bookings=core.normalizeResult({kind:'booking_collection',owner:'booking',items:[{id:'booking-1',venueName:'Dünenküche',status:'confirmed',actions:[{actionId:'booking.reservation.cancel',payload:{bookingId:'booking-1'}}]}]});
assert.equal(bookings.items[0].title,'Dünenküche');assert.equal(bookings.items[0].actions[0].confirmation,'EXPLICIT');
const memories=core.normalizeResult({kind:'memory_collection',owner:'memory',items:[{id:'story-1',title:'Unser Tag',status:'draft'}]});
assert.equal(memories.items[0].title,'Unser Tag');
const preferences=core.normalizeResult({kind:'preference_summary',owner:'identity',summary:{dietaryPreferences:['vegetarian'],travelPace:'relaxed'}});
assert.equal(preferences.summary.scope,'self');assert.equal(preferences.summary.configuredCount,2);

assert.equal(core.routeIntent('Zeige mir meine Buchungen').actionId,'booking.trip.read');
assert.equal(core.routeIntent('Ich möchte meine Reise wechseln').actionId,'trip.active.list');
assert.equal(core.routeIntent('Öffne den Reisebereich').actionId,'navigation.route.open');
assert.equal(core.routeIntent('Öffne den Reisebereich').input.route,'trip');
assert.equal(core.routeIntent('Zeige mir unsere Reisegeschichten').actionId,'memory.library.read');
assert.equal(core.routeIntent('Welche Vorlieben habe ich gespeichert?').actionId,'identity.preferences.read');
assert.equal(core.policySnapshot().explicitConfirmation,'natural-language-alone-is-never-confirmation');
assert.equal(core.policySnapshot().foreignDomainMutation,false);

console.log('M16.2 Intelligence Action Capability Policy: PASS');
console.log('Registered actions / owners: 30 / 8');
console.log('R0-R3 confirmation and idempotency matrix: PASS');
console.log('R4 authority / foreign Domain mutation: NONE');
