'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const root = path.resolve(
  __dirname,
  '..'
);

const moduleRelative =
  'core/trips/active-trip-context.mjs';

const moduleFile =
  path.join(
    root,
    moduleRelative
  );

async function main() {
  assert.ok(
    fs.existsSync(moduleFile),
    'M5.3 Active Trip Context module missing: ' +
      moduleRelative
  );

  const source =
    fs.readFileSync(
      moduleFile,
      'utf8'
    );

  for (
    const forbidden
    of [
      'window',
      'document',
      'navigator',
      'localStorage',
      'sessionStorage',
      'indexedDB',
      'CustomEvent',
      'LuviaTripStore',
      'LuviaTripContext',
      'LuviaTripContractV1',
    ]
  ) {
    assert.ok(
      !source.includes(forbidden),
      'Runtime-neutral Active Trip Context must not depend on ' +
        forbidden
    );
  }

  const moduleUrl =
    pathToFileURL(
      moduleFile
    ).href +
    '?m53=' +
    Date.now();

  const api =
    await import(
      moduleUrl
    );

  assert.strictEqual(
    api.ACTIVE_TRIP_CONTEXT_VERSION,
    '1.0.0'
  );

  assert.strictEqual(
    typeof api.createActiveTripContext,
    'function'
  );

  assert.strictEqual(
    typeof api.projectActiveTripSnapshot,
    'function'
  );

  let state = {
    trips: [
      {
        id: 'trip-a',
        title: 'Paris',
        destination: {
          name: 'Paris',
          country: 'Frankreich',
        },
        symbol: '🗼',
        accent: '#123456',
        startDate: '2026-08-01',
        endDate: '2026-08-05',
        role: 'owner',
        participants: [
          {
            id: 'p1',
            name: 'A',
          },
        ],
      },
    ],

    activeTripId:
      'trip-a',

    activeTrip: {
      id: 'trip-a',
      title: 'Paris',
      destination: {
        name: 'Paris',
        country: 'Frankreich',
      },
      symbol: '🗼',
      accent: '#123456',
      startDate: '2026-08-01',
      endDate: '2026-08-05',
      role: 'owner',
      participants: [
        {
          id: 'p1',
          name: 'A',
        },
      ],
    },

    loaded: true,
  };

  const listeners =
    new Set();

  let sourceSubscribeCalls = 0;
  let sourceUnsubscribeCalls = 0;

  const context =
    api.createActiveTripContext({
      readTripState() {
        return state;
      },

      subscribeTripState(listener) {
        sourceSubscribeCalls += 1;

        listeners.add(
          listener
        );

        listener(
          state
        );

        return () => {
          sourceUnsubscribeCalls += 1;

          listeners.delete(
            listener
          );
        };
      },
    });

  for (
    const method
    of [
      'getSnapshot',
      'getActiveTrip',
      'getDestination',
      'getDestinationName',
      'getTripName',
      'getAccent',
      'getDates',
      'subscribe',
    ]
  ) {
    assert.strictEqual(
      typeof context[method],
      'function',
      'Expected read API method: ' +
        method
    );
  }

  for (
    const forbiddenMethod
    of [
      'setActive',
      'setActiveTrip',
      'clearActive',
      'upsert',
      'initialize',
      'loadRemote',
      'persist',
      'save',
    ]
  ) {
    assert.strictEqual(
      Object.prototype.hasOwnProperty.call(
        context,
        forbiddenMethod
      ),
      false,
      'Active Trip Context must not expose mutation method: ' +
        forbiddenMethod
    );
  }

  const first =
    context.getSnapshot();

  assert.ok(
    Object.isFrozen(
      first
    )
  );

  assert.strictEqual(
    first.hasActiveTrip,
    true
  );

  assert.strictEqual(
    first.tripId,
    'trip-a'
  );

  assert.strictEqual(
    first.tripName,
    'Paris'
  );

  assert.strictEqual(
    first.destinationName,
    'Paris'
  );

  assert.strictEqual(
    first.symbol,
    '🗼'
  );

  assert.strictEqual(
    first.accent,
    '#123456'
  );

  assert.strictEqual(
    first.startDate,
    '2026-08-01'
  );

  assert.strictEqual(
    first.endDate,
    '2026-08-05'
  );

  assert.strictEqual(
    first.role,
    'owner'
  );

  assert.strictEqual(
    first.isOwner,
    true
  );

  assert.notStrictEqual(
    first.trip,
    state.activeTrip,
    'Projection must not expose the mutable Trip Store object directly'
  );

  assert.notStrictEqual(
    first.destination,
    state.activeTrip.destination,
    'Projection must not expose the mutable destination object directly'
  );

  assert.deepStrictEqual(
    context.getDates(),
    {
      startDate:
        '2026-08-01',

      endDate:
        '2026-08-05',
    }
  );

  assert.strictEqual(
    context.getActiveTrip().id,
    'trip-a'
  );

  assert.strictEqual(
    context.getDestinationName(),
    'Paris'
  );

  assert.strictEqual(
    context.getTripName(),
    'Paris'
  );

  assert.strictEqual(
    context.getAccent(),
    '#123456'
  );

  const observed = [];

  const unsubscribe =
    context.subscribe(
      (snapshot) => {
        observed.push(
          snapshot
        );
      }
    );

  assert.strictEqual(
    sourceSubscribeCalls,
    1
  );

  assert.strictEqual(
    observed.length,
    1,
    'Subscription must emit an initial snapshot exactly once when source subscription is immediate'
  );

  state = {
    trips: [
      {
        id: 'trip-b',
        title: 'Rom',
        destination: {
          name: 'Rom',
          country: 'Italien',
        },
        role: 'member',
      },
    ],

    activeTripId:
      'trip-b',

    activeTrip: {
      id: 'trip-b',
      title: 'Rom',
      destination: {
        name: 'Rom',
        country: 'Italien',
      },
      role: 'member',
    },

    loaded: true,
  };

  for (
    const listener
    of [...listeners]
  ) {
    listener(
      state
    );
  }

  assert.strictEqual(
    observed.length,
    2
  );

  assert.strictEqual(
    observed[1].tripId,
    'trip-b'
  );

  assert.strictEqual(
    observed[1].tripName,
    'Rom'
  );

  assert.strictEqual(
    observed[1].isOwner,
    false
  );

  assert.strictEqual(
    context.getActiveTrip().id,
    'trip-b',
    'Context must read current Trip Truth rather than keeping duplicate truth'
  );

  unsubscribe();

  assert.strictEqual(
    sourceUnsubscribeCalls,
    1
  );

  assert.strictEqual(
    listeners.size,
    0
  );

  state = {
    trips: [],
    activeTripId: null,
    activeTrip: null,
    loaded: true,
  };

  const empty =
    context.getSnapshot();

  assert.strictEqual(
    empty.trip,
    null
  );

  assert.strictEqual(
    empty.tripId,
    null
  );

  assert.strictEqual(
    empty.hasActiveTrip,
    false
  );

  assert.strictEqual(
    empty.destination,
    null
  );

  assert.strictEqual(
    empty.destinationName,
    ''
  );

  assert.strictEqual(
    empty.symbol,
    '❤️'
  );

  assert.strictEqual(
    empty.accent,
    '#ee6f83'
  );

  assert.strictEqual(
    empty.startDate,
    null
  );

  assert.strictEqual(
    empty.endDate,
    null
  );

  assert.strictEqual(
    empty.role,
    null
  );

  assert.strictEqual(
    empty.isOwner,
    false
  );

  assert.throws(
    () =>
      api.createActiveTripContext({}),
    /readTripState/
  );

  assert.throws(
    () =>
      context.subscribe(
        null
      ),
    /listener/
  );

  console.log(
    'PASS M5.3 runtime-neutral Active Trip Context projection'
  );

  console.log(
    'PASS M5.3 Active Trip Context read-only API'
  );

  console.log(
    'PASS M5.3 Active Trip Context subscription lifecycle'
  );

  console.log(
    'PASS M5.3 Active Trip Context browser-global isolation'
  );

  console.log(
    'PASS M5.3 Active Trip Context duplicate-truth guard'
  );

  console.log(
    'M5.3 ACTIVE TRIP CONTEXT FOUNDATION: PASS'
  );
}

main().catch(
  (error) => {
    console.error(
      error &&
      error.stack
        ? error.stack
        : error
    );

    process.exitCode = 1;
  }
);
