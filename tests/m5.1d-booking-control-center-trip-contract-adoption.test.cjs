const assert = require('node:assert/strict');
const fs = require('node:fs');

const source = fs.readFileSync(
  'app/control-center/booking-control-center.js',
  'utf8'
);

const forbidden = [
  ['LuviaTripStore', /\bLuviaTripStore\b/],
  ['LuviaControlCenterTravelIdentity', /\bLuviaControlCenterTravelIdentity\b/],
  ['tripSnapshot helper', /\btripSnapshot\b/],
  ['luvia:trips-changed', /luvia:trips-changed/],
  ['luvia:trip-changed', /luvia:trip-changed/],
  ['luvia:trip-context-changed', /luvia:trip-context-changed/]
];

for (const [label, pattern] of forbidden) {
  assert.equal(
    pattern.test(source),
    false,
    `Booking Control Center must not use legacy Trip access: ${label}`
  );
}

assert.match(
  source,
  /window\.LuviaTripContractV1\|\|window\.LuviaTripContract/,
  'Trip Contract resolver missing.'
);

assert.match(
  source,
  /tripContract\(\)\?\.listTrips\?\.\(\)/,
  'Trip list must come from Trip Contract.'
);

assert.match(
  source,
  /tripContract\(\)\?\.getActiveTrip\?\.\(\)/,
  'Active Trip must come from Trip Contract.'
);

assert.match(
  source,
  /tripContract\(\)\?\.subscribe\?\.\(/,
  'Trip subscription must use Trip Contract.'
);

assert.match(
  source,
  /tripId\(snap\?\.activeTrip\)\|\|snap\?\.context\?\.tripId/,
  'Contract snapshot semantics missing.'
);

assert.match(
  source,
  /ownsBookingTruth:false/,
  'Booking Core ownership must remain unchanged.'
);

assert.match(
  source,
  /source:'booking-core'/,
  'Booking truth source must remain Booking Core.'
);

console.log('M5.1d Booking Control Center Trip Contract Adoption: PASS');
console.log('Checks:');
console.log('- Trip list via Trip Contract');
console.log('- active Trip via Trip Contract');
console.log('- Trip subscription via Trip Contract');
console.log('- no direct LuviaTripStore access');
console.log('- no Travel Identity Trip truth fallback');
console.log('- no private tripSnapshot helper');
console.log('- no legacy Trip events');
console.log('- Booking Core truth ownership preserved');
