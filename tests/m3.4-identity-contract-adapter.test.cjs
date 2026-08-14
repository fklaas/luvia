const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const adapterPath = 'core/platform/identity-contract-adapter.js';

assert.ok(
  fs.existsSync(adapterPath),
  'M3.4 RED: identity contract adapter missing'
);

const source = fs.readFileSync(adapterPath, 'utf8');

for (const forbidden of [
  'LuviaSupabaseService',
  'ParisAuth',
  'localStorage',
  'sessionStorage',
  'user_profiles',
  '.rpc(',
  'LuviaPreferenceSchema',
  'activeTripId',
  'archivedTripIds',
  'dashboardWidgets'
]) {
  assert.equal(
    source.includes(forbidden),
    false,
    `identity adapter must not depend on forbidden internal: ${forbidden}`
  );
}

const listeners = new Map();

function addEventListener(name, fn) {
  if (!listeners.has(name)) listeners.set(name, new Set());
  listeners.get(name).add(fn);
}

function removeEventListener(name, fn) {
  listeners.get(name)?.delete(fn);
}

function dispatchEvent(event) {
  for (const fn of listeners.get(event.type) || []) fn(event);
  return true;
}

class CustomEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.detail = options.detail;
  }
}

const profile = {
  userId: 'viewer-1',
  email: 'private@example.test',
  displayName: 'Viewer',
  firstName: 'View',
  lastName: 'Er',
  avatarUrl: 'https://example.test/avatar.jpg',
  avatarColor: '#123456',
  language: 'de',
  timezone: 'Europe/Berlin',
  homeLocation: 'Meppen',
  themeMode: 'system',
  density: 'comfortable',
  reducedMotion: false,
  useTripAccent: true,
  defaultView: 'dashboard',
  showArchivedTrips: false,
  personalizedRecommendations: true,
  activityData: true,
  locationSharing: false,
  notifications: true,

  activeTripId: 'trip-private',
  archivedTripIds: ['trip-old'],
  dashboardWidgets: [{ id: 'secret-widget' }],
  createdAt: '2026-01-01',
  updatedAt: '2026-08-14'
};

const preferences = {
  dietaryPreferences: ['vegetarian'],
  travelInterests: ['culture'],
  travelStyles: ['relaxed'],
  activityPreferences: ['walking'],
  entertainmentPreferences: ['music'],
  diningPreferences: ['terrace'],
  mobilityPreferences: ['train'],
  atmospherePreferences: ['warm'],
  travelPace: 'balanced',
  budgetPreference: 'medium',
  familyPreferences: { needs: ['child-friendly'] },
  accessibilityPreferences: { needs: [] },
  accessibilityNeeds: [],
  preferenceSchemaVersion: 3,
  preferencesCompletedAt: '2026-08-01T00:00:00.000Z',
  preferencesUpdatedAt: '2026-08-14T00:00:00.000Z',

  source: 'must-not-leak',
  userId: 'must-not-leak',
  privateValue: 'must-not-leak'
};

let savedProfilePatch = null;
let updatedPreferencesPatch = null;
let replacedCategory = null;
const registrations = [];

const window = {
  addEventListener,
  removeEventListener,
  dispatchEvent,

  LuviaProfileService: {
    snapshot() {
      return {
        profile: structuredClone(profile),
        loaded: true,
        syncing: false,
        error: null,
        lastSyncedAt: '2026-08-14T08:00:00.000Z'
      };
    },

    async save(patch) {
      savedProfilePatch = structuredClone(patch);
      return { ...structuredClone(profile), ...structuredClone(patch) };
    }
  },

  LuviaUserPreferences: {
    get() {
      return structuredClone(preferences);
    },

    snapshot() {
      return {
        value: structuredClone(preferences),
        revision: 7,
        loaded: true,
        syncing: false,
        error: null
      };
    },

    async update(patch) {
      updatedPreferencesPatch = structuredClone(patch);
      return { ...structuredClone(preferences), ...structuredClone(patch) };
    },

    async replaceCategory(category, value) {
      replacedCategory = { category, value: structuredClone(value) };
      return { ...structuredClone(preferences), [category]: structuredClone(value) };
    }
  },

  LuviaTravelPreferences: {
    version: '3.0.0'
  },

  LuviaGlobalContracts: {
    register(definition) {
      registrations.push(definition);
      return definition;
    }
  }
};

const context = {
  window,
  CustomEvent,
  structuredClone,
  Object,
  Array,
  Set,
  Map,
  Error,
  TypeError,
  String,
  Boolean,
  Number,
  console,
  queueMicrotask
};

vm.runInNewContext(source, context, {
  filename: adapterPath
});

const api = window.LuviaIdentityContractV1;

assert.ok(api, 'LuviaIdentityContractV1 missing');
assert.equal(window.LuviaIdentityContract, api, 'identity alias mismatch');
assert.equal(api.contractId, 'identity.v1');
assert.equal(api.version, '1');
assert.equal(api.runtimeVersion, '1.0.0');
assert.equal(Object.isFrozen(api), true);

assert.deepEqual(
  [...api.events],
  ['identity.changed', 'preferences.changed']
);

assert.deepEqual(
  Object.keys(api.commands).sort(),
  ['updatePreferences', 'updateProfile']
);

for (const method of [
  'getViewerIdentity',
  'getPublicIdentity',
  'getPreferences',
  'subscribe',
  'diagnostics'
]) {
  assert.equal(typeof api[method], 'function', `${method} missing`);
}

const viewer = api.getViewerIdentity();

assert.equal(Object.isFrozen(viewer), true);
assert.deepEqual(
  Object.keys(viewer).sort(),
  [
    'activityData',
    'avatarColor',
    'avatarUrl',
    'defaultView',
    'density',
    'displayName',
    'firstName',
    'homeLocation',
    'language',
    'lastName',
    'locationSharing',
    'notifications',
    'personalizedRecommendations',
    'reducedMotion',
    'showArchivedTrips',
    'themeMode',
    'timezone',
    'useTripAccent',
    'userId'
  ].sort()
);

assert.equal('email' in viewer, false);
assert.equal('activeTripId' in viewer, false);
assert.equal('archivedTripIds' in viewer, false);
assert.equal('dashboardWidgets' in viewer, false);
assert.equal('createdAt' in viewer, false);
assert.equal('updatedAt' in viewer, false);

const publicSelf = api.getPublicIdentity();

assert.deepEqual(
  Object.keys(publicSelf).sort(),
  ['avatarColor', 'avatarUrl', 'displayName', 'userId'].sort()
);
assert.equal(publicSelf.userId, 'viewer-1');
assert.equal(Object.isFrozen(publicSelf), true);

const publicSelfById = api.getPublicIdentity('viewer-1');
assert.deepEqual(publicSelfById, publicSelf);

assert.throws(
  () => api.getPublicIdentity('other-user'),
  error =>
    error &&
    error.code === 'IDENTITY_CONTRACT_PROVIDER_UNAVAILABLE' &&
    error.provider === 'publicIdentityLookup'
);

const prefs = api.getPreferences('self');

assert.equal(Object.isFrozen(prefs), true);
assert.equal(Object.isFrozen(prefs.dietaryPreferences), true);
assert.equal(Object.isFrozen(prefs.familyPreferences), true);

assert.deepEqual(
  Object.keys(prefs).sort(),
  [
    'accessibilityNeeds',
    'accessibilityPreferences',
    'activityPreferences',
    'atmospherePreferences',
    'budgetPreference',
    'dietaryPreferences',
    'diningPreferences',
    'entertainmentPreferences',
    'familyPreferences',
    'mobilityPreferences',
    'preferenceSchemaVersion',
    'preferencesCompletedAt',
    'preferencesUpdatedAt',
    'travelInterests',
    'travelPace',
    'travelStyles'
  ].sort()
);

assert.equal('source' in prefs, false);
assert.equal('userId' in prefs, false);
assert.equal('privateValue' in prefs, false);

assert.throws(
  () => api.getPreferences('public'),
  error => error && error.code === 'IDENTITY_CONTRACT_SELF_ONLY'
);

(async () => {
  const updatedViewer = await api.commands.updateProfile({
    displayName: 'Updated Viewer',
    avatarColor: '#654321'
  });

  assert.deepEqual(savedProfilePatch, {
    displayName: 'Updated Viewer',
    avatarColor: '#654321'
  });
  assert.equal(updatedViewer.displayName, 'Updated Viewer');

  await assert.rejects(
    () => api.commands.updateProfile({ activeTripId: 'forbidden-trip' }),
    error =>
      error &&
      error.code === 'IDENTITY_CONTRACT_PROFILE_FIELD_NOT_ALLOWED' &&
      error.field === 'activeTripId'
  );

  await api.commands.updatePreferences({
    travelPace: 'relaxed'
  });

  assert.deepEqual(updatedPreferencesPatch, {
    travelPace: 'relaxed'
  });

  await api.commands.updatePreferences(
    'dietary',
    ['vegetarian', 'vegan']
  );

  assert.deepEqual(replacedCategory, {
    category: 'dietary',
    value: ['vegetarian', 'vegan']
  });

  let identityEvent = null;

  window.addEventListener(
    'luvia:identity.changed',
    event => {
      identityEvent = event.detail;
    },
    { once: true }
  );

  window.dispatchEvent(
    new CustomEvent('luvia:profile-changed', {
      detail: {
        reason: 'test-profile',
        profile: {
          ...profile,
          email: 'must-not-leak@example.test'
        }
      }
    })
  );

  assert.ok(identityEvent);
  assert.equal(identityEvent.contractId, 'identity.v1');
  assert.equal(identityEvent.version, '1');
  assert.equal(identityEvent.sourceEvent, 'luvia:profile-changed');

  assert.deepEqual(
    Object.keys(identityEvent.payload.identity).sort(),
    ['avatarColor', 'avatarUrl', 'displayName', 'userId'].sort()
  );

  assert.equal(
    'email' in identityEvent.payload.identity,
    false
  );

  let preferenceEvent = null;

  window.addEventListener(
    'luvia:preferences.changed',
    event => {
      preferenceEvent = event.detail;
    },
    { once: true }
  );

  window.dispatchEvent(
    new CustomEvent('luvia:user-preferences-changed', {
      detail: {
        reason: 'test-preferences',
        snapshot: {
          value: {
            ...preferences,
            privateValue: 'MUST-NOT-LEAK'
          },
          revision: 9,
          loaded: true,
          syncing: false
        }
      }
    })
  );

  assert.ok(preferenceEvent);
  assert.equal(preferenceEvent.contractId, 'identity.v1');
  assert.equal(preferenceEvent.version, '1');
  assert.equal(
    preferenceEvent.sourceEvent,
    'luvia:user-preferences-changed'
  );

  assert.equal(
    'preferences' in preferenceEvent.payload,
    false,
    'preferences event must not leak private preference payload'
  );

  let travelBridgeCount = 0;

  window.addEventListener(
    'luvia:preferences.changed',
    () => {
      travelBridgeCount += 1;
    }
  );

  window.dispatchEvent(
    new CustomEvent('luvia:travel-preferences-changed', {
      detail: { reason: 'derived' }
    })
  );

  assert.equal(
    travelBridgeCount,
    0,
    'derived travel preferences event must not create a second contract event'
  );

  let subscribed = null;

  const unsubscribe = api.subscribe(event => {
    subscribed = event;
  });

  window.dispatchEvent(
    new CustomEvent('luvia:profile-changed', {
      detail: { reason: 'subscribe-test' }
    })
  );

  assert.ok(subscribed);
  assert.equal(subscribed.contractId, 'identity.v1');

  unsubscribe();

  assert.equal(registrations.length, 1);
  assert.equal(registrations[0].id, 'identity.v1');
  assert.equal(registrations[0].version, '1');
  assert.equal(registrations[0].probe().available, true);

  const diagnostics = api.diagnostics();

  assert.equal(diagnostics.contractId, 'identity.v1');
  assert.equal(diagnostics.version, '1');
  assert.equal(diagnostics.runtimeVersion, '1.0.0');
  assert.equal(diagnostics.ready, true);
  assert.equal(diagnostics.providers.profile, true);
  assert.equal(diagnostics.providers.preferences, true);
  assert.equal(diagnostics.providers.travelPreferences, true);
  assert.equal(
    diagnostics.providers.publicIdentityLookup,
    false
  );
  assert.equal(
    diagnostics.publicIdentityMode,
    'self-only'
  );

  const savedProfileService = window.LuviaProfileService;
  delete window.LuviaProfileService;

  assert.throws(
    () => api.getViewerIdentity(),
    error =>
      error &&
      error.code === 'IDENTITY_CONTRACT_PROVIDER_UNAVAILABLE' &&
      error.provider === 'LuviaProfileService.snapshot'
  );

  window.LuviaProfileService = savedProfileService;

  const savedPreferences = window.LuviaUserPreferences;
  delete window.LuviaUserPreferences;

  assert.throws(
    () => api.getPreferences('self'),
    error =>
      error &&
      error.code === 'IDENTITY_CONTRACT_PROVIDER_UNAVAILABLE' &&
      error.provider === 'LuviaUserPreferences.get'
  );

  window.LuviaUserPreferences = savedPreferences;

  console.log('M3.4 Identity Contract Adapter: OK');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});