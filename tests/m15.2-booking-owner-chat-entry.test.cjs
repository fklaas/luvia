'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

const source=fs.readFileSync('core/booking/booking-ui.js','utf8');

for(const needle of [
  'async function openForPlace(input={},options={})',
  'resolveRouteCached(place)',
  'reserveBookingHandoff()',
  'recordPlaceHandoff?.(',
  'externalTarget(route)',
  "channel:'external_link'",
  "route.resolved&&route.channel==='email'&&route.value",
  "channel:'email_canvas'",
  "channel:'unavailable'",
  'await openForPlace(place,{reserveExternalWindow:false})',
  'Object.freeze({version:VERSION,actionButton,open,openForPlace})'
])assert.ok(source.includes(needle),`Booking owner chat entry missing ${needle}`);

assert.equal((source.match(/await resolveRouteCached\(place\)/g)||[]).length,1,'provider route resolution must have one reusable execution owner');
assert.equal((source.match(/recordPlaceHandoff\?\.\(/g)||[]).length,1,'handoff attribution must not be duplicated');
assert.equal((source.match(/openBooking\(target,\{reserved\}\)/g)||[]).length,1,'external Booking navigation must not be duplicated');
assert.equal((source.match(/await open\(place,route,options\)/g)||[]).length,1,'verified email canvas must have one execution owner');
assert.doesNotMatch(source,/owner_dialog_fallback|channel:route\?\.channel\|\|'owner_dialog'/,'Booking UI must not bypass provider-first routing through a generic owner dialog');
assert.doesNotMatch(source,/LuviaAI|LuviaIntelligence/,'Booking owner entry must not depend on Intelligence');

console.log('M15.2 Booking Provider-first Owner Entry: PASS');
console.log('Provider handoff / verified-email fallback / unavailable policy: PASS');
console.log('Intelligence dependency in Booking: NONE');
