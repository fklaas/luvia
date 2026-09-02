'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {
  pathToFileURL,
} = require('url');

const root =
  path.resolve(
    __dirname,
    '..'
  );

const bindingPath =
  path.join(
    root,
    'luvia-trip-context.js'
  );

const indexPath =
  path.join(
    root,
    'index.html'
  );

const swPath =
  path.join(
    root,
    'sw.js'
  );

const corePath =
  path.join(
    root,
    'core/trips/active-trip-context.mjs'
  );

const loaderPath =
  path.join(
    root,
    'app/luvia-runtime-loader.mjs'
  );

const runtimeManifestPath =
  path.join(
    root,
    'app/luvia-runtime.bundle.manifest.json'
  );

function count(text, needle) {
  return (
    text.split(
      needle
    ).length - 1
  );
}

async function main() {
  const binding =
    fs.readFileSync(
      bindingPath,
      'utf8'
    );

  const index =
    fs.readFileSync(
      indexPath,
      'utf8'
    );

  const sw =
    fs.readFileSync(
      swPath,
      'utf8'
    );

  const loader =
    fs.readFileSync(
      loaderPath,
      'utf8'
    );

  const runtimeManifest =
    JSON.parse(
      fs.readFileSync(
        runtimeManifestPath,
        'utf8'
      )
    );

  assert.ok(
    binding.includes(
      'createActiveTripContext'
    ),
    'M5.3 Web Binding must consume createActiveTripContext'
  );

  assert.ok(
    binding.includes(
      "./core/trips/active-trip-context.mjs?v=13.82.144"
    ),
    'M5.3 Web Binding must import runtime-neutral Active Trip Context'
  );

  assert.ok(
    binding.includes(
      'globalThis.window'
    ),
    'M5.3 Web Binding must explicitly remain a Web Runtime Compatibility Binding'
  );

  assert.ok(
    binding.includes(
      'LuviaTripStateReaderV1'
    ),
    'M5.3 Web Binding must inject the existing Trip Truth provider'
  );

  assert.ok(
    binding.includes(
      'LuviaTripContext'
    ),
    'M5.3 Web Binding must preserve the current compatibility global'
  );

  for (
    const forbidden
    of [
      'document.',
      'navigator.',
      'localStorage',
      'sessionStorage',
      'CustomEvent',
      "addEventListener('luvia'",
      'addEventListener("luvia"',
    ]
  ) {
    assert.ok(
      !binding.includes(
        forbidden
      ),
      'M5.3 Web Binding should not retain unrelated browser/event dependency: ' +
        forbidden
    );
  }

  assert.strictEqual(
    count(
      index,
      '<script type="module" src="luvia-trip-context.js?v=13.82.144"></script>'
    ),
    1,
    'luvia-trip-context.js must be loaded as an ES module exactly once'
  );

  assert.strictEqual(
    count(
      index,
      '<script src="luvia-trip-context.js?v=13.82.144"></script>'
    ),
    0,
    'legacy classic luvia-trip-context.js tag must be removed'
  );

  const sourceOrder = runtimeManifest.map(item => item.source);
  const tripStoreIndex = sourceOrder.indexOf('core/trips/trip-store.js');
  const travelContextIndex = sourceOrder.indexOf('core/context/travel-context-service.js');
  const contractIndex = sourceOrder.indexOf('core/platform/trip-contract-adapter.js');
  const bootIndex = sourceOrder.indexOf('core/runtime/boot-coordinator.js');
  const preIndex = loader.indexOf('luvia-runtime-precontext-13.82.144.bundle.js');
  const tripContextIndex = loader.indexOf('../luvia-trip-context.js');
  const postIndex = loader.indexOf('luvia-runtime-postcontext-13.82.144.bundle.js');

  assert.ok(
    tripStoreIndex >= 0 &&
    preIndex >= 0 &&
    tripContextIndex > preIndex &&
    postIndex > tripContextIndex &&
    travelContextIndex > tripStoreIndex &&
    contractIndex > travelContextIndex &&
    bootIndex > contractIndex,
    'M5.3 Web load boundary order must remain TripStore -> TripContext -> TravelContext -> TripContract -> BootCoordinator'
  );

  assert.strictEqual(
    count(
      sw,
      "'core/trips/active-trip-context.mjs'"
    ),
    1,
    'Service Worker shell must cache Active Trip Context module exactly once'
  );

  assert.strictEqual(
    count(
      sw,
      "'luvia-trip-context.js'"
    ),
    1,
    'Service Worker shell must cache Web Trip Context binding exactly once'
  );

  const absoluteCoreUrl =
    pathToFileURL(
      corePath
    ).href +
    '?m53web=' +
    Date.now();

  const importLiteral =
    "'./core/trips/active-trip-context.mjs?v=13.82.144'";

  assert.strictEqual(
    count(
      binding,
      importLiteral
    ),
    1,
    'Expected Active Trip Context import literal exactly once'
  );

  const executable =
    binding.replace(
      importLiteral,
      JSON.stringify(
        absoluteCoreUrl
      )
    );

  let state = {
    trips: [
      {
        id: 'trip-a',
        title: 'Paris',
        destination: {
          name: 'Paris',
        },
        startDate:
          '2026-08-01',
        endDate:
          '2026-08-05',
        role:
          'owner',
      },
    ],

    activeTripId:
      'trip-a',

    activeTrip: {
      id: 'trip-a',
      title: 'Paris',
      destination: {
        name: 'Paris',
      },
      startDate:
        '2026-08-01',
      endDate:
        '2026-08-05',
      role:
        'owner',
    },

    loaded:
      true,
  };

  const sourceListeners =
    new Set();

  let reconcileCalls = 0;

  const tripStore = {
    snapshot() {
      return state;
    },

    subscribe(listener) {
      sourceListeners.add(
        listener
      );

      listener(
        state
      );

      return () => {
        sourceListeners.delete(
          listener
        );
      };
    },

    reconcileLegacy() {
      reconcileCalls += 1;

      return state;
    },
  };

  globalThis.window = {
    LuviaTripStateReaderV1:
      tripStore,
  };

  try {
    const dataUrl =
      'data:text/javascript;base64,' +
      Buffer.from(
        executable,
        'utf8'
      ).toString(
        'base64'
      );

    await import(
      dataUrl +
      '#m53=' +
      Date.now()
    );

    const context =
      globalThis.window
        .LuviaTripContext;

    assert.ok(
      context,
      'Web Compatibility Binding must expose window.LuviaTripContext'
    );

    for (
      const method
      of [
        'getActiveTrip',
        'getDestination',
        'getDestinationName',
        'getTripName',
        'getAccent',
        'getDates',
        'getSnapshot',
        'refresh',
        'subscribe',
      ]
    ) {
      assert.strictEqual(
        typeof context[method],
        'function',
        'Compatibility API missing method: ' +
          method
      );
    }

    assert.strictEqual(
      context.getActiveTrip()
        .id,
      'trip-a'
    );

    assert.strictEqual(
      context.getTripName(),
      'Paris'
    );

    assert.strictEqual(
      context.getDestinationName(),
      'Paris'
    );

    assert.deepStrictEqual(
      {
        ...context.getDates(),
      },
      {
        startDate:
          '2026-08-01',

        endDate:
          '2026-08-05',
      }
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
      observed.length,
      1,
      'Compatibility subscription must emit initial projection exactly once'
    );

    state = {
      trips: [
        {
          id: 'trip-b',
          title: 'Rom',
          destination: {
            name: 'Rom',
          },
          role:
            'member',
        },
      ],

      activeTripId:
        'trip-b',

      activeTrip: {
        id: 'trip-b',
        title: 'Rom',
        destination: {
          name: 'Rom',
        },
        role:
          'member',
      },

      loaded:
        true,
    };

    for (
      const listener
      of [...sourceListeners]
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
      context.getActiveTrip()
        .id,
      'trip-b'
    );

    unsubscribe();

    assert.strictEqual(
      sourceListeners.size,
      0
    );

    context.refresh();

    assert.strictEqual(
      reconcileCalls,
      1,
      'Legacy refresh compatibility must remain Web-bound'
    );

    assert.strictEqual(
      context.getSnapshot()
        .tripId,
      'trip-b'
    );
  } finally {
    delete globalThis.window;
  }

  console.log(
    'PASS M5.3 Web Compatibility Binding consumes runtime-neutral Active Trip Context'
  );

  console.log(
    'PASS M5.3 Web Compatibility Binding preserves window.LuviaTripContext API'
  );

  console.log(
    'PASS M5.3 Web Compatibility Binding preserves TripStore as sole Trip Truth provider'
  );

  console.log(
    'PASS M5.3 Web Compatibility Binding subscription uses TripStore source directly'
  );

  console.log(
    'PASS M5.3 module load order'
  );

  console.log(
    'PASS M5.3 Service Worker shell includes new runtime assets'
  );

  console.log(
    'M5.3 ACTIVE TRIP WEB COMPATIBILITY BINDING: PASS'
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
