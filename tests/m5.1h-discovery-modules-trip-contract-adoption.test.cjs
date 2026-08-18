'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

const TARGETS = Object.freeze([
  'modules/accommodations/accommodation-module.js',
  'modules/attractions/attraction-module.js',
  'modules/mobility/mobility-module.js',
  'modules/nature/nature-module.js',
  'modules/photo-spots/photo-spot-module.js',
  'modules/restaurants-v2/restaurant-module.js',
  'modules/shopping/shopping-module.js'
]);

const RESTAURANT =
  'modules/restaurants-v2/restaurant-module.js';

const TRIP_ADAPTER =
  'core/platform/trip-contract-adapter.js';

function source(relativePath) {
  const absolutePath = path.join(
    ROOT,
    ...relativePath.split('/')
  );

  assert.equal(
    fs.existsSync(absolutePath),
    true,
    `Missing expected file: ${relativePath}`
  );

  return fs.readFileSync(absolutePath, 'utf8');
}

function occurrences(text, token) {
  return text.split(token).length - 1;
}

function hasLazyTripContract(text) {
  return (
    text.includes(
      'window.LuviaTripContractV1||window.LuviaTripContract'
    ) ||
    text.includes(
      'window.LuviaTripContractV1 || window.LuviaTripContract'
    )
  );
}

function assertNoLegacyTripTruth(relativePath, text) {
  assert.equal(
    occurrences(text, 'LuviaTripStore'),
    0,
    `${relativePath} must not read Trip Truth directly through LuviaTripStore`
  );

  assert.equal(
    occurrences(text, 'LuviaTripContext'),
    0,
    `${relativePath} must not read Trip Truth directly through LuviaTripContext`
  );
}

function assertTripContractConsumer(relativePath, text) {
  assert.equal(
    hasLazyTripContract(text),
    true,
    `${relativePath} must lazily resolve LuviaTripContractV1/LuviaTripContract`
  );

  assert.match(
    text,
    /getActiveTrip\s*\?\.\s*\(/,
    `${relativePath} must consume the active Trip through trip.v1 getActiveTrip()`
  );
}

assert.equal(
  TARGETS.length,
  7,
  'M5.1h scope must remain exactly seven Discovery modules'
);

assert.equal(
  new Set(TARGETS).size,
  7,
  'M5.1h target paths must remain unique'
);

for (const relativePath of TARGETS) {
  const text = source(relativePath);

  assertNoLegacyTripTruth(relativePath, text);
  assertTripContractConsumer(relativePath, text);
}

const restaurant = source(RESTAURANT);

assert.doesNotMatch(
  restaurant,
  /LuviaTripContext\s*\?\.\s*getDestination/,
  'Restaurant must not retain LegacyTripContext.getDestination()'
);

assert.match(
  restaurant,
  /LuviaDestination\s*\?\./,
  'Restaurant must retain its separate Destination-service fallback semantics'
);

assert.match(
  restaurant,
  /LuviaAppState\s*\?\.\s*getSnapshot/,
  'Restaurant must retain its existing AppState compatibility fallback'
);

assert.match(
  restaurant,
  /trip\.destinationName/,
  'Restaurant destination resolution must continue to accept projected trip.destinationName'
);

assert.match(
  restaurant,
  /trip\.destination/,
  'Restaurant destination resolution must continue to accept projected trip.destination'
);

const adapter = source(TRIP_ADAPTER);

assert.match(
  adapter,
  /function\s+destinationProjection\s*\(/,
  'trip.v1 must retain its existing destination projection'
);

assert.match(
  adapter,
  /\bdestinationName\s*:/,
  'trip.v1 projection must expose destinationName'
);

assert.match(
  adapter,
  /\bdestination\s*,/,
  'trip.v1 projection must expose destination'
);

assert.doesNotMatch(
  adapter,
  /function\s+getDestination\s*\(/,
  'M5.1h must not add a public getDestination() merely to mirror LegacyTripContext'
);

console.log('M5.1h Discovery Modules Trip Contract Adoption: PASS');
console.log(`Targets: ${TARGETS.length}/7`);
console.log('Direct LuviaTripStore refs: 0');
console.log('Direct LuviaTripContext refs: 0');
console.log('Trip Contract adoption: 7/7');
console.log('Restaurant destination boundary: PASS');
