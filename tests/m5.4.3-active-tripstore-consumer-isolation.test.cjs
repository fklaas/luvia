'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = process.cwd();

const load = relative =>
  fs.readFileSync(
    path.join(root, ...relative.split('/')),
    'utf8'
  );

const count = (source, token) =>
  source.split(token).length - 1;

const adapter =
  load('core/platform/trip-contract-adapter.js');

const join =
  load('core/trips/join-flow.js');

const creator =
  load('core/trips/trip-creator.js');

const experience =
  load('core/trips/trip-experience.js');

const timeline =
  load('core/places/timeline-core.js');

const store =
  load('core/trips/trip-store.js');

const context =
  load('luvia-trip-context.js');

const consumers = [
  ['join-flow', join],
  ['trip-creator', creator],
  ['trip-experience', experience],
  ['timeline-core', timeline]
];

const privateRefs =
  consumers.reduce(
    (total, [, source]) =>
      total + count(source, 'LuviaTripStateReaderV1'),
    0
  );

assert.strictEqual(
  privateRefs,
  0,
  'active non-owner Trip consumers must have zero private LuviaTripStore references'
);

for (const [name, source] of consumers) {
  assert.strictEqual(
    count(source, 'LuviaTripStateReaderV1'),
    0,
    name + ' must not access private Trip Store'
  );
}

assert(
  adapter.includes(
    'function commitTripSnapshot(trip,options={})'
  ),
  'Trip owner adapter must expose a narrow commitTripSnapshot command implementation'
);

assert(
  adapter.includes(
    'store().upsert(trip,options||{});'
  ),
  'commitTripSnapshot must remain owned by private Trip Store boundary'
);

assert(
  /commands\s*:\s*Object\.freeze\(\{[^}]*\bcommitTripSnapshot\b[^}]*\}\)/.test(adapter),
  'Trip command namespace must expose commitTripSnapshot'
);

assert(
  join.includes(
    'tripRuntime()?.loadRemote?.'
  ),
  'join-flow must refresh Trip state through public runtime boundary'
);

assert(
  join.includes(
    'tripCommands()?.selectActiveTrip?.'
  ),
  'join-flow must select joined Trip through public command boundary'
);

assert(
  creator.includes(
    'tripCommands().commitTripSnapshot'
  ),
  'trip-creator must commit created Trip through owner command boundary'
);

assert(
  experience.includes(
    'tripReads()?.getActiveTrip?.()'
  ),
  'trip-experience must read active Trip through public reads'
);

assert(
  experience.includes(
    'tripCommands()?.commitTripSnapshot?.'
  ),
  'trip-experience must commit update through owner command boundary'
);

assert(
  timeline.includes(
    'LuviaTripContext?.getActiveTrip?.()'
  ),
  'Timeline must keep Active Trip Context boundary'
);

assert(
  !timeline.includes('LuviaTripStateReaderV1'),
  'Timeline must not retain private Trip Store fallback'
);

assert(
  store.includes(
    'window.LuviaTripStore=Object.freeze'
  ),
  'TripStore must remain the sole Web Trip Truth owner'
);

assert(
  context.includes(
    'web.LuviaTripStateReaderV1'
  ),
  'M5.3 Web compatibility TripContext binding must remain explicitly preserved'
);

assert(
  !adapter.includes(
    'luvia_save_trip_profile'
  ),
  'new commit boundary must not introduce Trip profile cloud write into adapter'
);

console.log(
  'M5.4 Active TripStore Consumer Isolation: PASS'
);

console.log(
  'Active non-owner private LuviaTripStore refs: 0'
);

console.log(
  'Join Flow: runtime + selectActiveTrip boundary'
);

console.log(
  'Trip Creator: commitTripSnapshot owner command'
);

console.log(
  'Trip Experience: public reads + commitTripSnapshot'
);

console.log(
  'Timeline: Active Trip Context only'
);

console.log(
  'TripStore remains sole Trip Truth: YES'
);

console.log(
  'Web TripContext compatibility binding: PRESERVED / DEFERRED'
);
