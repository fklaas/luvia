'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const targetRel = 'intelligence/destination-service.js';
const target = fs.readFileSync(path.join(root, targetRel), 'utf8');

assert.equal(
  (target.match(/\bLuviaTripStore\b/g) || []).length,
  0,
  'destination-service must not access private LuviaTripStore'
);

assert(
  /\bLuviaTripContractV1\b/.test(target),
  'destination-service must consume the public Trip Contract v1 web binding'
);

assert(
  /applyResolvedDestination/.test(target),
  'destination-service must persist canonical Trip destination through applyResolvedDestination'
);

assert(
  /\.subscribe\b/.test(target),
  'destination-service must subscribe to Trip changes through the public Trip Contract'
);

assert(
  /snapshot\b/.test(target),
  'legacy mirror compatibility must source snapshot data from the public Trip Contract'
);

assert.equal(
  /luvia_save_trip_profile/.test(target),
  false,
  'destination-service must not introduce a trip-profile cloud write'
);

assert.equal(
  /TripExperience/.test(target),
  false,
  'destination-service must not bypass the narrow destination command via TripExperience'
);

assert.match(target, /function usableCenter/);
assert.doesNotMatch(
  target,
  /destination\.center&&destination\.countryCode&&!options\.refresh/,
  'existing coordinates must not wait for countryCode before skipping destination.resolve'
);
assert.doesNotMatch(
  target,
  /queueMicrotask\(\(\)=>ensureActiveResolved/,
  'boot must not call destination.resolve through Google geocoding'
);

assert(
  /LuviaLegacyParisMigrator/.test(target),
  'legacy Paris compatibility mirror must remain present in this slice'
);

assert(
  /LuviaTripContext\?\.refresh/.test(target),
  'existing Trip Context compatibility refresh must remain present in this slice'
);

console.log('M5.4.1B Destination Service Public Trip Boundary Adoption: PASS');
console.log('Private LuviaTripStore references: 0');
console.log('Public Trip Contract v1: ADOPTED');
console.log('Resolved destination owner command: applyResolvedDestination');
console.log('Legacy compatibility mirror: PRESERVED');
console.log('New trip-profile cloud write: NONE');
