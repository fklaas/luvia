'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

const TARGETS = Object.freeze([
  'core/diagnostics/cloud-only-place-verification.js',
  'core/diagnostics/media-readiness.js'
]);

const CLOUD =
  'core/diagnostics/cloud-only-place-verification.js';

const MEDIA =
  'core/diagnostics/media-readiness.js';

const ADAPTER =
  'core/platform/trip-contract-adapter.js';

const TIMELINE =
  'core/places/timeline-core.js';

function read(relative) {
  return fs.readFileSync(
    path.join(ROOT, relative),
    'utf8'
  );
}

function count(text, pattern) {
  return (text.match(pattern) || []).length;
}

function legacyRefs(text) {
  return {
    store: count(
      text,
      /\bLuviaTripStore\b/g
    ),
    context: count(
      text,
      /\bLuviaTripContext\b/g
    )
  };
}

test(
  'M5.1i scope contains exactly two Diagnostics targets',
  () => {
    assert.deepEqual(
      [...TARGETS].sort(),
      [
        CLOUD,
        MEDIA
      ].sort()
    );

    for (const target of TARGETS) {
      assert.ok(
        target.startsWith('core/diagnostics/'),
        `${target} escaped Diagnostics scope`
      );

      assert.ok(
        fs.existsSync(path.join(ROOT, target)),
        `${target} is missing`
      );
    }

    assert.ok(
      !TARGETS.includes(ADAPTER),
      'Trip Contract adapter must remain outside M5.1i'
    );

    assert.ok(
      !TARGETS.includes(TIMELINE),
      'Timeline must remain outside M5.1i'
    );
  }
);

test(
  'M5.1i Diagnostics contain no direct legacy Trip truth access',
  () => {
    let store = 0;
    let context = 0;

    for (const target of TARGETS) {
      const refs = legacyRefs(read(target));
      store += refs.store;
      context += refs.context;
    }

    assert.equal(
      store,
      0,
      `direct LuviaTripStore refs must be 0; actual=${store}`
    );

    assert.equal(
      context,
      0,
      `direct LuviaTripContext refs must be 0; actual=${context}`
    );
  }
);

test(
  'both Diagnostics use lazy trip.v1 access without load-time dereference',
  () => {
    for (const target of TARGETS) {
      const source = read(target);

      assert.match(
        source,
        /(?:const|function)\s+tripContract\b/,
        `${target} must define a lazy tripContract resolver`
      );

      assert.match(
        source,
        /LuviaTripContractV1/,
        `${target} must resolve LuviaTripContractV1 lazily`
      );

      assert.match(
        source,
        /LuviaTripContract/,
        `${target} must preserve the canonical contract alias fallback`
      );

      assert.ok(
        source.includes('getActiveTrip') ||
          source.includes('getContext'),
        `${target} must read Trip state through trip.v1`
      );

      assert.doesNotMatch(
        source,
        /(?:const|let|var)\s+\w+\s*=\s*tripContract\(\)\s*;/,
        `${target} must not capture the contract during script evaluation`
      );
    }
  }
);

test(
  'cloud verification preserves explicit tripId priority and empty-string fallback',
  () => {
    const source = read(CLOUD);

    const helper = source.match(
      /function\s+activeTripId\s*\([^)]*\)\s*\{[\s\S]*?\}/
    );

    assert.ok(
      helper,
      'cloud verification activeTripId helper is required'
    );

    const body = helper[0];

    const explicitPosition =
      body.indexOf('explicit');

    const contractPosition =
      body.indexOf('tripContract');

    assert.ok(
      explicitPosition >= 0,
      'explicit Trip ID source is missing'
    );

    assert.ok(
      contractPosition >= 0,
      'trip.v1 Trip ID source is missing'
    );

    assert.ok(
      explicitPosition < contractPosition,
      'explicit Trip ID must remain higher priority than trip.v1'
    );

    assert.ok(
      body.includes("||''") ||
        body.includes("|| ''"),
      'cloud verification no-ID fallback must remain empty string'
    );

    assert.match(
      body,
      /String\s*\(/,
      'cloud verification Trip ID must retain String normalization'
    );
  }
);

test(
  'media readiness preserves options.tripId priority and null fallback',
  () => {
    const source = read(MEDIA);

    const assignment = source.match(
      /const\s+tripId\s*=[^;]+;/
    );

    assert.ok(
      assignment,
      'media-readiness tripId assignment is required'
    );

    const body = assignment[0];

    const explicitPosition =
      body.indexOf('options.tripId');

    const contractPosition =
      body.indexOf('tripContract');

    assert.ok(
      explicitPosition >= 0,
      'options.tripId source is missing'
    );

    assert.ok(
      contractPosition >= 0,
      'trip.v1 Trip ID source is missing'
    );

    assert.ok(
      explicitPosition < contractPosition,
      'options.tripId must remain higher priority than trip.v1'
    );

    assert.match(
      body,
      /\|\|\s*null/,
      'media-readiness no-ID fallback must remain null'
    );
  }
);

test(
  'M5.1i introduces no Trip mutation or cross-core ownership move',
  () => {
    const forbiddenMutationPatterns = [
      /LuviaTripStore\s*\.\s*setActive/,
      /LuviaTripStore\s*\.\s*upsert/,
      /LuviaTripStore\s*\.\s*loadRemote/,
      /LuviaTripStore\s*\.\s*clearActive/,
      /LuviaTripContext\s*\.\s*refresh/,
      /selectActiveTrip\s*\(/,
      /createTrip\s*\(/,
      /updateTrip\s*\(/,
      /joinTrip\s*\(/
    ];

    for (const target of TARGETS) {
      const source = read(target);

      for (const pattern of forbiddenMutationPatterns) {
        assert.doesNotMatch(
          source,
          pattern,
          `${target} contains forbidden Trip mutation`
        );
      }
    }

    assert.ok(
      fs.existsSync(path.join(ROOT, ADAPTER)),
      'Trip Contract adapter must remain present'
    );

    assert.ok(
      fs.existsSync(path.join(ROOT, TIMELINE)),
      'Timeline must remain present and separately owned'
    );
  }
);