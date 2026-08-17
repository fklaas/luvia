const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
const adapterPath = path.join(
  root,
  'core',
  'platform',
  'trip-contract-adapter.js'
);

assert.ok(
  fs.existsSync(adapterPath),
  'Trip Contract adapter must exist'
);

const source = fs.readFileSync(adapterPath, 'utf8');

function createContract(activeTrip) {
  let current = activeTrip;

  const store = {
    snapshot() {
      return {
        trips: current ? [current] : [],
        activeTrip: current || null,
        activeTripId:
          current?.id ||
          current?.tripId ||
          current?.trip_id ||
          null
      };
    },

    subscribe(listener) {
      listener(this.snapshot());
      return () => {};
    },

    setActive() {},
    initialize() {},
    loadRemote: async () => {}
  };

  const context = {
    getActiveTrip() {
      return current;
    },

    getSnapshot() {
      return {
        trip: current || null,
        tripId:
          current?.id ||
          current?.tripId ||
          current?.trip_id ||
          null,
        hasActiveTrip: Boolean(current),
        accent: current?.accent || null
      };
    }
  };

  class FakeCustomEvent {
    constructor(type, init = {}) {
      this.type = type;
      this.detail = init.detail;
    }
  }

  const window = {
    LuviaTripStore: store,
    LuviaTripContext: context,
    LuviaGlobalContracts: {
      register() {}
    },
    addEventListener() {},
    dispatchEvent() {},
    CustomEvent: FakeCustomEvent
  };

  const sandbox = {
    window,
    CustomEvent: FakeCustomEvent,
    console,
    Object,
    Boolean,
    String,
    Number,
    Array,
    Error,
    TypeError
  };

  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, {
    filename: 'trip-contract-adapter.js'
  });

  assert.ok(
    window.LuviaTripContractV1,
    'Trip Contract v1 must register'
  );

  return window.LuviaTripContractV1;
}

const accentColorContract = createContract({
  id: 'accent-color-trip',
  title: 'Accent Color Legacy Trip',
  accent_color: '#123456'
});

assert.strictEqual(
  accentColorContract.getActiveTrip().accent,
  '#123456',
  'Trip Contract must normalize legacy accent_color into canonical accent'
);

assert.strictEqual(
  accentColorContract.getContext().accent,
  '#123456',
  'Trip Context projection must preserve normalized accent_color'
);

const colorContract = createContract({
  id: 'color-trip',
  title: 'Color Legacy Trip',
  color: '#654321'
});

assert.strictEqual(
  colorContract.getActiveTrip().accent,
  '#654321',
  'Trip Contract must normalize legacy color into canonical accent'
);

assert.strictEqual(
  colorContract.getContext().accent,
  '#654321',
  'Trip Context projection must preserve normalized color alias'
);

const canonicalContract = createContract({
  id: 'canonical-trip',
  title: 'Canonical Accent Trip',
  accent: '#abcdef',
  accent_color: '#111111',
  color: '#222222'
});

assert.strictEqual(
  canonicalContract.getActiveTrip().accent,
  '#abcdef',
  'Canonical accent must keep precedence over legacy aliases'
);

const fallbackContract = createContract({
  id: 'fallback-trip',
  title: 'Fallback Trip'
});

assert.strictEqual(
  fallbackContract.getActiveTrip().accent,
  '#ee6f83',
  'Trip Contract default accent must remain unchanged'
);

console.log(
  'M5.1f Trip Contract accent compatibility: PASS'
);