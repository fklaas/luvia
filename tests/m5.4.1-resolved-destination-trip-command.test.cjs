'use strict';

const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const adapterPath = path.join(root, 'core/platform/trip-contract-adapter.js');
const adapterSource = fs.readFileSync(adapterPath, 'utf8');

let storedTrip = {
  id: 'trip-1',
  tripId: 'trip-1',
  title: 'Paris',
  tripName: 'Paris',
  destination: {
    name: 'Paris',
    countryCode: 'FR'
  },
  destinationName: 'Paris',
  accent: '#ee6f83',
  role: 'owner',
  isOwner: true,
  customField: 'preserve-me'
};

let activeTripId = 'trip-1';
let experienceUpdateCalls = 0;
const upsertCalls = [];
const storeSubscribers = new Set();

function storeSnapshot() {
  const activeTrip =
    activeTripId === storedTrip.id
      ? { ...storedTrip }
      : null;

  return {
    loaded: true,
    hasTrips: true,
    hasActiveTrip: Boolean(activeTrip),
    activeTripId,
    activeTrip,
    trips: [{ ...storedTrip }]
  };
}

const store = {
  snapshot: storeSnapshot,

  subscribe(listener) {
    storeSubscribers.add(listener);
    listener(storeSnapshot());
    return () => storeSubscribers.delete(listener);
  },

  setActive(id) {
    activeTripId = id || null;
    for (const listener of storeSubscribers) listener(storeSnapshot());
    return storeSnapshot();
  },

  upsert(...args) {
    upsertCalls.push(args);
    storedTrip = { ...args[0] };
    for (const listener of storeSubscribers) listener(storeSnapshot());
    return storeSnapshot();
  }
};

const tripContext = {
  getActiveTrip() {
    return storeSnapshot().activeTrip;
  },

  getSnapshot() {
    const trip = storeSnapshot().activeTrip;
    return {
      tripId: trip?.id || null,
      trip,
      hasActiveTrip: Boolean(trip),
      tripName: trip?.title || '',
      destination: trip?.destination || null,
      destinationName: trip?.destinationName || '',
      symbol: trip?.symbol || '❤️',
      accent: trip?.accent || '#ee6f83',
      startDate: trip?.startDate || null,
      endDate: trip?.endDate || null,
      role: trip?.role || null,
      isOwner: Boolean(trip?.isOwner)
    };
  }
};

class FakeCustomEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.detail = options.detail;
  }
}

const windowListeners = new Map();

const web = {
  LuviaTripStore: store,
  LuviaTripContext: tripContext,

  LuviaTripCreator: {
    async save(input) {
      return input;
    }
  },

  LuviaTripExperience: {
    async update(input, patch) {
      experienceUpdateCalls += 1;
      return { ...input, ...patch };
    }
  },

  LuviaJoinFlow: {
    async join() {
      return { trip_id: 'trip-1' };
    }
  },

  LuviaGlobalContracts: {
    register() {}
  },

  dispatchEvent() {},

  addEventListener(name, listener) {
    if (!windowListeners.has(name)) windowListeners.set(name, new Set());
    windowListeners.get(name).add(listener);
  }
};

vm.runInNewContext(
  adapterSource,
  {
    window: web,
    CustomEvent: FakeCustomEvent,
    console,
    Date,
    Object,
    Array,
    String,
    Boolean,
    Number,
    TypeError,
    Error
  },
  {
    filename: 'core/platform/trip-contract-adapter.js'
  }
);

const api = web.LuviaTripContractV1;

assert.ok(api, 'Trip Contract v1 must be initialized');

assert.equal(
  typeof api.commands?.applyResolvedDestination,
  'function',
  'commands.applyResolvedDestination must exist'
);

assert.equal(
  typeof api.applyResolvedDestination,
  'function',
  'top-level applyResolvedDestination compatibility alias must exist'
);

const destination = {
  name: 'Paris',
  formattedAddress: 'Paris, Frankreich',
  country: 'Frankreich',
  countryCode: 'FR',
  placeId: 'place-paris',
  latitude: 48.8566,
  longitude: 2.3522,
  timezone: 'Europe/Paris',
  provider: 'google-places'
};

const result = api.commands.applyResolvedDestination(
  'trip-1',
  destination
);

assert.equal(
  experienceUpdateCalls,
  0,
  'resolved destination command must not call TripExperience.update'
);

assert.equal(
  upsertCalls.length,
  1,
  'exactly one canonical TripStore upsert expected'
);

assert.equal(
  upsertCalls[0].length,
  1,
  'TripStore.upsert must keep default local/offline-capable call semantics'
);

assert.equal(storedTrip.id, 'trip-1');
assert.equal(storedTrip.tripId, 'trip-1');
assert.equal(storedTrip.title, 'Paris');
assert.equal(storedTrip.tripName, 'Paris');

assert.equal(
  storedTrip.customField,
  'preserve-me',
  'unrelated canonical Trip fields must survive'
);

assert.deepEqual(
  JSON.parse(JSON.stringify(storedTrip.destination)),
  destination,
  'resolved destination model must become canonical Trip destination'
);

assert.equal(
  storedTrip.destinationName,
  'Paris'
);

assert.equal(
  typeof storedTrip.updatedAt,
  'string'
);

assert.ok(
  storedTrip.updatedAt.length > 0,
  'updatedAt must be refreshed'
);

assert.equal(
  result?.tripId || result?.id,
  'trip-1'
);

assert.throws(
  () => api.commands.applyResolvedDestination('missing-trip', destination),
  error =>
    error &&
    error.code === 'TRIP_CONTRACT_TRIP_NOT_FOUND'
);

assert.equal(
  adapterSource.includes('luvia_save_trip_profile'),
  false,
  'Trip Contract adapter must not introduce direct trip-profile cloud RPC'
);

console.log('M5.4.1 Resolved Destination Trip Command Foundation: PASS');
console.log('Canonical TripStore upsert: 1');
console.log('TripExperience.update calls: 0');
console.log('New trip-profile cloud write: NONE');
