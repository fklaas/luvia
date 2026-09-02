'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const fixture=fs.readFileSync('tests/fixtures/m16.5-block1-semantic-booking-lifecycle-browser.html','utf8');

for(const source of [
  '../../core/booking/booking-lifecycle-policy-core.js',
  '../../core/intelligence/travel-orchestration-core.js',
  '../../core/intelligence/intelligence-action-contract-core.js',
  '../../core/intelligence/intelligence-action-ledger-core.js',
  '../../core/intelligence/human-ai-consumer-projection-core.js',
  '../../core/ai/ai-action-runtime.js'
])assert.ok(fixture.includes(source),`visible Booking lifecycle fixture misses real runtime source ${source}`);
for(const actionId of ['booking.place.open','booking.reservation.create','booking.reservation.modify','booking.reservation.cancel'])assert.ok(fixture.includes(actionId),`visible Booking lifecycle fixture misses ${actionId}`);
for(const label of ['Ansehen','Buchungsweg','Neu anfragen','Ändern','Stornieren'])assert.ok(fixture.includes(label),`visible Booking lifecycle fixture misses user action ${label}`);
assert.match(fixture,/\['Neues Datum','15\.06\.2027'\]/);
assert.match(fixture,/\['Neue Uhrzeit','19:30 Uhr'\]/);
assert.match(fixture,/projected\.details\.map/);
assert.match(fixture,/Ohne deine Bestätigung wird nichts versendet oder geändert/);
assert.match(fixture,/kein Netzwerkversand/);
assert.doesNotMatch(fixture.split('<script')[0],/2027-06-1[45]/,'the visible consumer must use TT.MM.JJJJ rather than ISO dates');

console.log('M16.5 Block 1 visible semantic Booking lifecycle fixture: PASS');
console.log('Five compact user actions + TT.MM.JJJJ + explicit confirmation: PASS');
