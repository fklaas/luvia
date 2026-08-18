'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '..');

const PLACES_FILES = Object.freeze([
  'core/places/place-core.js',
  'core/places/place-lifecycle-hub.js',
  'core/places/place-collection-service.js',
  'core/places/place-command-service.js',
  'core/places/place-lifecycle-service.js',
  'core/places/places-final-foundation.js',
  'core/places/presence-visit-core.js',
  'core/places/trip-place-data-service.js',
]);

const EXCLUDED_TIMELINE = 'core/places/timeline-core.js';

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function occurrences(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

test('M5.1g scope contains exactly eight active Places consumers and excludes Timeline', () => {
  assert.equal(PLACES_FILES.length, 8);
  assert.equal(
    PLACES_FILES.includes(EXCLUDED_TIMELINE),
    false,
    'timeline-core.js must remain outside M5.1g'
  );

  for (const file of PLACES_FILES) {
    assert.equal(
      fs.existsSync(path.join(ROOT, file)),
      true,
      `expected M5.1g file to exist: ${file}`
    );
  }

  assert.equal(
    fs.existsSync(path.join(ROOT, EXCLUDED_TIMELINE)),
    true,
    'timeline-core.js should still exist for later Journey/Timeline work'
  );
});

test('M5.1g Places consumers have no direct TripStore or TripContext truth access', () => {
  const violations = [];

  for (const file of PLACES_FILES) {
    const source = read(file);

    const storeRefs = occurrences(source, /\bLuviaTripStore\b/g);
    const contextRefs = occurrences(source, /\bLuviaTripContext\b/g);

    if (storeRefs || contextRefs) {
      violations.push(
        `${file}: LuviaTripStore=${storeRefs}, LuviaTripContext=${contextRefs}`
      );
    }
  }

  assert.deepEqual(
    violations,
    [],
    [
      'M5.1g direct Trip truth violations remain:',
      ...violations,
    ].join('\n')
  );
});

test('M5.1g Places consumers read active Trip through lazy Trip Contract v1 access', () => {
  const violations = [];

  for (const file of PLACES_FILES) {
    const source = read(file);

    const hasContract =
      /\bLuviaTripContractV1\b/.test(source) ||
      /\bLuviaTripContract\b/.test(source);

    const hasActiveTripRead =
      /\bgetActiveTrip\s*\?\.\s*\(/.test(source) ||
      /\bgetActiveTrip\s*\(/.test(source);

    if (!hasContract || !hasActiveTripRead) {
      violations.push(
        `${file}: contract=${hasContract}, getActiveTrip=${hasActiveTripRead}`
      );
    }
  }

  assert.deepEqual(
    violations,
    [],
    [
      'M5.1g canonical Trip Contract adoption incomplete:',
      ...violations,
    ].join('\n')
  );
});

test('M5.1g does not move Places persistence or Timeline ownership into Trip Core', () => {
  const forbiddenTripMutations = [
    /\bLuviaTripStore\s*\.\s*setActive\s*\(/,
    /\bLuviaTripStore\s*\.\s*upsert\s*\(/,
    /\bLuviaTripStore\s*\.\s*remove\s*\(/,
    /\bLuviaTripStore\s*\.\s*delete\s*\(/,
    /\bLuviaTripStore\s*\.\s*create\s*\(/,
    /\bLuviaTripStore\s*\.\s*update\s*\(/,
    /\bLuviaTripStore\s*\.\s*loadRemote\s*\(/,
    /\bLuviaTripStore\s*\.\s*initialize\s*\(/,
    /\bLuviaTripStore\s*\.\s*reconcileLegacy\s*\(/,
  ];

  for (const file of PLACES_FILES) {
    const source = read(file);

    for (const pattern of forbiddenTripMutations) {
      assert.equal(
        pattern.test(source),
        false,
        `${file} must remain a Trip consumer and must not own Trip mutations`
      );
    }
  }

  assert.equal(
    PLACES_FILES.includes(EXCLUDED_TIMELINE),
    false,
    'cross-domain Timeline remains explicitly outside the Places adoption slice'
  );
});