'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

const source=fs.readFileSync('core/booking/booking-ui.js','utf8');

for(const needle of [
  'async function openForPlace(input={},options={})',
  'resolveRouteCached(place)',
  'reserveBookingHandoff()',
  'recordPlaceHandoff?.(',
  "channel:'external_link'",
  "channel:route?.channel||'owner_dialog'",
  "channel:'owner_dialog_fallback'",
  'await openForPlace(place,{reserveExternalWindow:true})',
  'Object.freeze({version:VERSION,actionButton,open,openForPlace})'
])assert.ok(source.includes(needle),`Booking owner chat entry missing ${needle}`);

assert.equal((source.match(/await resolveRouteCached\(place\)/g)||[]).length,1,'provider route resolution must have one reusable execution owner');
assert.equal((source.match(/recordPlaceHandoff\?\.\(/g)||[]).length,1,'handoff attribution must not be duplicated');
assert.equal((source.match(/openBooking\(target\.toString\(\)/g)||[]).length,1,'external Booking navigation must not be duplicated');
assert.doesNotMatch(source,/LuviaAI|LuviaIntelligence/,'Booking owner entry must not depend on Intelligence');

console.log('M15.2 Booking Owner Chat Entry: PASS');
console.log('Existing provider/handoff/email policy reused: PASS');
console.log('Intelligence dependency in Booking: NONE');
