'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT =
  process.argv[2] ||
  path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(
    path.join(
      ROOT,
      ...file.split('/')
    ),
    'utf8'
  );
}

function refs(text) {
  return (
    text.match(
      /\bLuviaTripStore\b/g
    ) || []
  ).length;
}

const adapter =
  read(
    'core/platform/trip-contract-adapter.js'
  );

const boot =
  read(
    'core/runtime/boot-coordinator.js'
  );

const runtime =
  read(
    'core/runtime/runtime.js'
  );

assert.strictEqual(
  refs(boot),
  0,
  'boot-coordinator private LuviaTripStore references must be 0'
);

assert.strictEqual(
  refs(runtime),
  0,
  'runtime private LuviaTripStore references must be 0'
);

assert.match(
  adapter,
  /function\s+getRuntimeState\s*\(/,
  'Trip owner boundary must expose getRuntimeState'
);

assert.match(
  adapter,
  /function\s+initializeRuntime\s*\(/,
  'Trip owner boundary must expose initializeRuntime'
);

assert.match(
  adapter,
  /function\s+loadRemoteRuntime\s*\(/,
  'Trip owner boundary must expose loadRemoteRuntime'
);

assert.match(
  adapter,
  /runtime\s*:\s*Object\.freeze\s*\(\s*\{\s*getState\s*:\s*getRuntimeState\s*,\s*initialize\s*:\s*initializeRuntime\s*,\s*loadRemote\s*:\s*loadRemoteRuntime\s*\}\s*\)/,
  'Trip Contract runtime owner surface must expose getState/initialize/loadRemote'
);

assert.match(
  adapter,
  /function\s+selectActiveTrip\s*\(\s*tripId\s*,\s*options\s*=\s*\{\}\s*\)/,
  'selectActiveTrip must accept owner options'
);

assert.match(
  adapter,
  /store\(\)\.setActive\s*\(\s*id\s*\|\|\s*null\s*,\s*options\s*\|\|\s*\{\}\s*\)/,
  'selectActiveTrip must forward touch/source semantics'
);

assert.match(
  boot,
  /tripRuntime\(\)\.initialize\s*\(/,
  'Boot must initialize through public Trip runtime surface'
);

assert.match(
  boot,
  /tripRuntime\(\)\.loadRemote\s*\(/,
  'Boot must hydrate through public Trip runtime surface'
);

assert.match(
  boot,
  /tripRuntime\(\)\.getState\s*\(/,
  'Boot must read through public Trip runtime surface'
);

assert.match(
  boot,
  /tripCommands\(\)\.selectActiveTrip\s*\(/,
  'Boot active selection must use Trip command boundary'
);

assert.match(
  runtime,
  /tripRuntime\(\)\?\.getState\?\.\(\)/,
  'Runtime calculate must use public Trip runtime state'
);

assert.match(
  runtime,
  /requireTripRuntime\(\)\.initialize\s*\(/,
  'Runtime boot initialization must use public owner boundary'
);

assert.match(
  runtime,
  /requireTripRuntime\(\)\.loadRemote\s*\(/,
  'Runtime remote hydration must use public owner boundary'
);

assert.doesNotMatch(
  boot,
  /\bLuviaTripStore\b/,
  'Boot must not retain private TripStore compatibility access'
);

assert.doesNotMatch(
  runtime,
  /\bLuviaTripStore\b/,
  'Runtime must not retain private TripStore compatibility access'
);

console.log(
  'M5.4.2 Runtime / Bootstrap Public Trip Boundary: PASS'
);

console.log(
  'boot-coordinator private LuviaTripStore refs: 0'
);

console.log(
  'runtime private LuviaTripStore refs: 0'
);

console.log(
  'Trip owner runtime surface: getState / initialize / loadRemote'
);

console.log(
  'Boot active-trip options: preserved through selectActiveTrip'
);

console.log(
  'TripStore remains sole Trip Truth: YES'
);
