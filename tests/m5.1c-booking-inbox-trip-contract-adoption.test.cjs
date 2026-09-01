'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const INBOX_PATH = path.join(
  ROOT,
  'app',
  'control-center',
  'booking-inbox.js'
);
const SOURCE = fs.readFileSync(INBOX_PATH, 'utf8');

function instrumentInbox() {
  const closingIife = /\r?\n\}\)\(\);\s*$/;

  assert.match(
    SOURCE,
    closingIife,
    'Booking Inbox source must keep its closing IIFE boundary'
  );

  return SOURCE.replace(
    closingIife,
    `
window.__LuviaM51cBookingInboxTripTest = Object.freeze({
  tripList,
  tripId,
  tripTitle,
  activeTripId,
  change
});
})();`
  );
}

function createHost() {
  const handlers = new Map();
  let markup = '';

  return {
    handlers,
    get innerHTML() {
      return markup;
    },
    set innerHTML(value) {
      markup = String(value);
    },
    addEventListener(type, handler) {
      handlers.set(type, handler);
    },
    removeEventListener(type, handler) {
      if (handlers.get(type) === handler) {
        handlers.delete(type);
      }
    },
    contains(node) {
      return Boolean(node);
    },
    querySelector() {
      return null;
    }
  };
}

function evaluateInbox() {
  const bookingReads = [];
  const forbiddenBookingMutations = [];

  const bookingApi = {
    async init() {
      bookingReads.push({ method: 'init' });
    },
    async listForTrip(tripId) {
      bookingReads.push({ method: 'listForTrip', tripId });
      return [];
    },
    async conversation(bookingId) {
      bookingReads.push({ method: 'conversation', bookingId });
      return {
        booking: { id: bookingId },
        messages: [],
        intelligence: [],
        thread: null
      };
    },
    async conversationPreferences(bookingIds) {
      bookingReads.push({ method: 'conversationPreferences', bookingIds });
      return [];
    },
    async setConversationPreference() {
      forbiddenBookingMutations.push('setConversationPreference');
      throw new Error('Unexpected Booking preference mutation');
    },
    async performIntelligenceAction() {
      forbiddenBookingMutations.push('performIntelligenceAction');
      throw new Error('Unexpected Booking intelligence mutation');
    },
    async reply() {
      forbiddenBookingMutations.push('reply');
      throw new Error('Unexpected Booking reply mutation');
    }
  };

  const sandbox = {
    window: {
      LuviaBookingContractV1: {
        init: bookingApi.init,
        reads: {
          listForTrip: bookingApi.listForTrip,
          conversation: bookingApi.conversation,
          conversationPreferences: bookingApi.conversationPreferences
        },
        commands: {
          setConversationPreference: bookingApi.setConversationPreference,
          performIntelligenceAction: bookingApi.performIntelligenceAction,
          reply: bookingApi.reply
        }
      },
      LuviaProductModuleRegistry: {
        mount: () => {},
        unmount: () => {}
      },
      matchMedia: () => ({ matches: true }),
      confirm: () => false
    },
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
    },
    console: {
      info: () => {},
      warn: () => {},
      error: () => {},
      log: () => {}
    },
    setTimeout,
    clearTimeout
  };

  for (const legacyGlobal of [
    'LuviaTripStore',
    'LuviaTripContext',
    'LuviaAppState',
    'LuviaControlCenterTravelIdentity'
  ]) {
    Object.defineProperty(
      sandbox.window,
      legacyGlobal,
      {
        configurable: true,
        get() {
          throw new Error(
            `Booking Inbox attempted forbidden legacy access: ${legacyGlobal}`
          );
        }
      }
    );
  }

  vm.createContext(sandbox);
  vm.runInContext(
    instrumentInbox(),
    sandbox,
    { filename: 'app/control-center/booking-inbox.js' }
  );

  return {
    sandbox,
    bookingReads,
    forbiddenBookingMutations
  };
}

function readOnlyTripContract(
  label,
  readTrips,
  readActiveTrip,
  contractReads
) {
  const surface = {
    listTrips: () => {
      contractReads.push({ label, method: 'listTrips' });
      return readTrips();
    },
    getActiveTrip: () => {
      contractReads.push({ label, method: 'getActiveTrip' });
      return readActiveTrip();
    }
  };

  return new Proxy(
    surface,
    {
      get(target, property, receiver) {
        if (typeof property === 'symbol') {
          return Reflect.get(target, property, receiver);
        }

        if (property === 'listTrips' || property === 'getActiveTrip') {
          return Reflect.get(target, property, receiver);
        }

        throw new Error(
          `${label} received non-approved Trip contract access: ${String(property)}`
        );
      }
    }
  );
}

function tripSelectorEvent(value) {
  const selector = {
    value,
    closest(query) {
      return query === '[data-bi-trip]' ? selector : null;
    }
  };

  return { target: selector };
}

async function waitFor(predicate, description) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (predicate()) {
      return;
    }

    await new Promise(resolve => setImmediate(resolve));
  }

  assert.fail(`Timed out while waiting for ${description}`);
}

test('Booking Inbox has no direct Trip truth, DB or legacy-event access', () => {
  const forbiddenReferences = [
    { label: 'LuviaTripStore', pattern: /\bLuviaTripStore\b/ },
    { label: 'LuviaTripContext', pattern: /\bLuviaTripContext\b/ },
    { label: 'LuviaAppState', pattern: /\bLuviaAppState\b/ },
    {
      label: 'LuviaControlCenterTravelIdentity',
      pattern: /\bLuviaControlCenterTravelIdentity\b/
    },
    { label: 'tripSnapshot helper', pattern: /\btripSnapshot\b/ },
    { label: 'luvia:trips-changed', pattern: /luvia:trips-changed/ },
    { label: 'luvia:trip-changed', pattern: /luvia:trip-changed/ },
    {
      label: 'luvia:trip-context-changed',
      pattern: /luvia:trip-context-changed/
    },
    { label: 'direct DB .from()', pattern: /\.from\s*\(/ },
    { label: 'direct DB .rpc()', pattern: /\.rpc\s*\(/ }
  ];

  const presentForbiddenReferences = forbiddenReferences
    .filter(reference => reference.pattern.test(SOURCE))
    .map(reference => reference.label);

  assert.deepEqual(
    presentForbiddenReferences,
    [],
    `Forbidden Booking Inbox boundaries remain: ${presentForbiddenReferences.join(', ')}`
  );
  assert.equal(
    /\.(?:selectActiveTrip|setActiveTrip|createTrip|updateTrip|deleteTrip|joinTrip|leaveTrip|subscribe)\s*\(/.test(SOURCE),
    false,
    'The Booking Inbox projection must not issue Trip commands or subscriptions'
  );

  const bookingOwnerSeams = [
    /\bbookingContract\(\)\.reads\.conversation\s*\(/,
    /\bapi\.reads\.conversationPreferences\b/,
    /\bapi\.commands\.setConversationPreference\b/,
    /\bapi\.performIntelligenceAction\s*\(/,
    /\bapi\.reply\s*\(/
  ];

  for (const seam of bookingOwnerSeams) {
    assert.match(
      SOURCE,
      seam,
      `Booking owner seam must remain behind booking.v1: ${seam}`
    );
  }
});

test('Booking Inbox centralizes list and active-Trip reads on lazy trip.v1 access', () => {
  assert.ok(
    /\bwindow\.LuviaTripContractV1\b/.test(SOURCE),
    'Booking Inbox must prefer the versioned trip.v1 runtime surface'
  );
  assert.ok(
    /\bwindow\.LuviaTripContract\b/.test(SOURCE),
    'Booking Inbox may use only the supported latest-major contract alias'
  );
  assert.match(
    SOURCE,
    /\bwindow\.LuviaTripContractV1\s*\|\|\s*window\.LuviaTripContract\b/,
    'The lazy resolver must prefer the versioned surface before its alias'
  );

  const contractHelperReferences = SOURCE.match(/\btripContract\b/g) || [];
  const listReads = SOURCE.match(/\blistTrips(?:\?\.)?\s*\(/g) || [];
  const activeReads = SOURCE.match(/\bgetActiveTrip(?:\?\.)?\s*\(/g) || [];
  const versionedContracts = SOURCE.match(
    /\bwindow\.LuviaTripContractV1\b/g
  ) || [];
  const contractAliases = SOURCE.match(
    /\bwindow\.LuviaTripContract\b/g
  ) || [];
  const tripListReferences = SOURCE.match(/\btripList\b/g) || [];
  const tripListCalls = SOURCE.match(/\btripList\s*\(\s*\)/g) || [];
  const activeTripIdReferences = SOURCE.match(/\bactiveTripId\b/g) || [];

  assert.equal(
    contractHelperReferences.length,
    3,
    'One lazy contract helper must serve exactly the list and active-Trip readers'
  );
  assert.equal(listReads.length, 1, 'Trip list reads must be centralized');
  assert.equal(activeReads.length, 1, 'Active Trip reads must be centralized');
  assert.equal(versionedContracts.length, 1);
  assert.equal(contractAliases.length, 1);
  assert.equal(
    tripListReferences.length,
    3,
    'The Trip-list helper must have one definition and two UI call sites'
  );
  assert.equal(
    tripListCalls.length,
    2,
    'Only conversation context and render may consume the Trip-list helper'
  );
  assert.equal(
    activeTripIdReferences.length,
    3,
    'The active-Trip-ID helper must have one definition and two load/mount call sites'
  );
  assert.ok(
    /function\s+conversationView\s*\(\s*\)\s*\{[^\n]*tripTitle\(tripList\(\)\.find/.test(SOURCE),
    'Conversation context must keep resolving its Trip title through tripList()'
  );
  assert.ok(
    /function\s+render\s*\(\s*\)\s*\{[^\n]*const\s+trips=tripList\(\)/.test(SOURCE),
    'The Inbox selector must keep rendering the public Trip-list projection'
  );
});

test('lazy contract lookup preserves Inbox selection and Booking boundaries', async () => {
  const {
    sandbox,
    bookingReads,
    forbiddenBookingMutations
  } = evaluateInbox();
  const inbox = sandbox.window.LuviaBookingInbox;
  const hooks = sandbox.window.__LuviaM51cBookingInboxTripTest;
  const tripContractReads = [];

  assert.ok(hooks, 'M5.1c Booking Inbox Trip test hooks must be available');
  assert.equal(
    Object.isFrozen(inbox),
    true,
    'The public Booking Inbox API must remain frozen'
  );
  assert.deepEqual(
    Array.from(Object.keys(inbox)).sort(),
    [
      'diagnostics',
      'load',
      'mount',
      'render',
      'unmount',
      'version'
    ].sort(),
    'M5.1c must not change the public Booking Inbox API'
  );

  const aliasTrip = {
    id: 'trip-alias',
    title: 'Alias Journey'
  };

  const aliasSurface = readOnlyTripContract(
    'trip.v1 alias',
    () => [aliasTrip],
    () => aliasTrip,
    tripContractReads
  );
  let aliasPropertyReads = 0;

  Object.defineProperty(
    sandbox.window,
    'LuviaTripContract',
    {
      configurable: true,
      get() {
        aliasPropertyReads += 1;
        return aliasSurface;
      }
    }
  );

  assert.equal(
    hooks.tripList()[0].id,
    'trip-alias',
    'The latest-major alias must work when it appears after script evaluation'
  );
  assert.equal(hooks.activeTripId(), 'trip-alias');

  const aliasReadsBeforeVersioned = tripContractReads.filter(
    read => read.label === 'trip.v1 alias'
  ).length;
  const aliasPropertyReadsBeforeVersioned = aliasPropertyReads;

  const initialTrips = [
    { id: 'trip-paris', title: 'Paris Escape' },
    { id: 'trip-berlin', title: 'Berlin Weekend' }
  ];

  sandbox.window.LuviaTripContractV1 = readOnlyTripContract(
    'trip.v1 initial surface',
    () => initialTrips,
    () => initialTrips[0],
    tripContractReads
  );

  assert.deepEqual(
    Array.from(hooks.tripList(), trip => trip.id),
    ['trip-paris', 'trip-berlin'],
    'The versioned contract must take precedence over its alias'
  );
  assert.equal(hooks.activeTripId(), 'trip-paris');

  const firstHost = createHost();
  await inbox.mount(firstHost);

  const firstDiagnostics = inbox.diagnostics();

  assert.equal(firstDiagnostics.selectedTripId, 'trip-paris');
  assert.deepEqual(
    Array.from(Object.keys(firstDiagnostics)).sort(),
    [
      'actionBusy',
      'actionRequiredCount',
      'archivedCount',
      'composerStatus',
      'composerTransport',
      'conversationArchiveDelete',
      'conversationCount',
      'deletedCount',
      'error',
      'hardDeletesMessageTruth',
      'intelligenceActions',
      'loading',
      'mobileBackNavigation',
      'mobileInboxFirst',
      'mounted',
      'ownsBookingTruth',
      'ownsMessageTruth',
      'providerIndependent',
      'selectedBookingId',
      'selectedTripId',
      'source',
      'unreadCount',
      'version'
    ].sort(),
    'M5.1c must not change the public Booking Inbox diagnostics shape'
  );
  assert.equal(firstDiagnostics.ownsMessageTruth, false);
  assert.equal(firstDiagnostics.ownsBookingTruth, false);
  assert.equal(firstDiagnostics.source, 'booking-core');
  assert.equal(firstDiagnostics.providerIndependent, true);
  assert.equal(firstDiagnostics.hardDeletesMessageTruth, false);
  assert.equal(firstDiagnostics.composerTransport, 'booking-email-reply-v1');
  assert.equal(firstDiagnostics.intelligenceActions, true);
  assert.equal(firstDiagnostics.conversationArchiveDelete, true);
  assert.ok(firstHost.innerHTML.includes('Paris Escape'));
  assert.ok(firstHost.innerHTML.includes('Berlin Weekend'));
  assert.ok(
    bookingReads.some(
      read => read.method === 'listForTrip' && read.tripId === 'trip-paris'
    ),
    'The selected Trip ID must continue to flow into Booking.listForTrip'
  );

  inbox.unmount();
  const initialSurfaceReadsBeforeReplacement = tripContractReads.filter(
    read => read.label === 'trip.v1 initial surface'
  ).length;
  const replacementTrips = [
    { id: 'trip-paris', title: 'Paris Escape' },
    { id: 'trip-berlin', title: 'Berlin Updated' }
  ];
  sandbox.window.LuviaTripContractV1 = readOnlyTripContract(
    'trip.v1 replacement surface',
    () => replacementTrips,
    () => replacementTrips[1],
    tripContractReads
  );

  const changedHost = createHost();
  await inbox.mount(changedHost);

  assert.equal(
    inbox.diagnostics().selectedTripId,
    'trip-berlin',
    'A later mount must observe the current active Trip without cached state'
  );
  assert.ok(
    changedHost.innerHTML.includes('Berlin Updated'),
    'Rendering must observe the current contract Trip list'
  );
  assert.equal(
    tripContractReads.filter(
      read => read.label === 'trip.v1 initial surface'
    ).length,
    initialSurfaceReadsBeforeReplacement,
    'The replaced V1 contract object must not receive later reads'
  );

  inbox.unmount();
  const optionHost = createHost();
  const activeReadsBeforeOptionMount = tripContractReads.filter(
    read =>
      read.label === 'trip.v1 replacement surface' &&
      read.method === 'getActiveTrip'
  ).length;
  await inbox.mount(optionHost, { tripId: 'trip-paris' });

  assert.equal(
    inbox.diagnostics().selectedTripId,
    'trip-paris',
    'An explicit mount option must retain precedence over the active Trip'
  );
  assert.equal(
    tripContractReads.filter(
      read =>
        read.label === 'trip.v1 replacement surface' &&
        read.method === 'getActiveTrip'
    ).length,
    activeReadsBeforeOptionMount,
    'An explicit mount option must not trigger an unnecessary active-Trip read'
  );

  const changeHandler = optionHost.handlers.get('change');
  assert.equal(typeof changeHandler, 'function');
  const berlinReadsBeforeManualSelection = bookingReads.filter(
    read => read.method === 'listForTrip' && read.tripId === 'trip-berlin'
  ).length;
  const activeReadsBeforeManualSelection = tripContractReads.filter(
    read =>
      read.label === 'trip.v1 replacement surface' &&
      read.method === 'getActiveTrip'
  ).length;
  changeHandler(tripSelectorEvent('trip-berlin'));
  await waitFor(
    () => bookingReads.filter(
      read => read.method === 'listForTrip' && read.tripId === 'trip-berlin'
    ).length > berlinReadsBeforeManualSelection,
    'the manual Trip selection Booking read'
  );
  await waitFor(
    () => inbox.diagnostics().loading === false,
    'the manual Trip selection reload to finish'
  );

  assert.equal(
    inbox.diagnostics().selectedTripId,
    'trip-berlin',
    'Manual Inbox Trip selection must remain local UI state'
  );
  assert.ok(
    bookingReads.some(
      read => read.method === 'listForTrip' && read.tripId === 'trip-berlin'
    ),
    'Manual Trip selection must continue to reload the Booking projection'
  );
  assert.equal(
    tripContractReads.filter(
      read =>
        read.label === 'trip.v1 replacement surface' &&
        read.method === 'getActiveTrip'
    ).length,
    activeReadsBeforeManualSelection,
    'Manual selection must not mutate or reread the global active Trip'
  );
  assert.match(
    optionHost.innerHTML,
    /<option value="trip-berlin" selected>Berlin Updated<\/option>/,
    'The locally selected Trip must remain selected in the Inbox UI'
  );

  await inbox.load();

  assert.equal(
    inbox.diagnostics().selectedTripId,
    'trip-berlin',
    'A public reload must preserve the local Inbox Trip selection'
  );
  assert.equal(
    tripContractReads.filter(
      read =>
        read.label === 'trip.v1 replacement surface' &&
        read.method === 'getActiveTrip'
    ).length,
    activeReadsBeforeManualSelection,
    'A reload with local selection must not reread the global active Trip'
  );
  assert.equal(
    tripContractReads.filter(read => read.label === 'trip.v1 alias').length,
    aliasReadsBeforeVersioned,
    'The alias must not be read while the versioned contract is available'
  );
  assert.equal(
    aliasPropertyReads,
    aliasPropertyReadsBeforeVersioned,
    'The alias property must not be resolved while V1 is available'
  );

  inbox.unmount();
  delete sandbox.window.LuviaTripContractV1;
  delete sandbox.window.LuviaTripContract;

  const emptyHost = createHost();
  const bookingTripReadsBeforeMissingContract = bookingReads.filter(
    read => read.method === 'listForTrip'
  ).length;
  await inbox.mount(emptyHost);

  assert.equal(
    inbox.diagnostics().selectedTripId,
    null,
    'A missing Trip contract must degrade to an empty Inbox projection'
  );
  assert.equal(inbox.diagnostics().error, null);
  assert.ok(
    emptyHost.innerHTML.includes('<select data-bi-trip></select>'),
    'A missing Trip contract must render an empty Trip selector'
  );
  assert.equal(
    bookingReads.filter(read => read.method === 'listForTrip').length,
    bookingTripReadsBeforeMissingContract,
    'A missing Trip ID must not call Booking.listForTrip(null)'
  );
  assert.equal(forbiddenBookingMutations.length, 0);

  inbox.unmount();
});
