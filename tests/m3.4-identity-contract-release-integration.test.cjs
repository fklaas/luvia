const assert = require('node:assert/strict');
const fs = require('node:fs');

const read = path => fs.readFileSync(path, 'utf8');

const version = read('intelligence/kernel/version.js');
const index = read('index.html');
const sw = read('sw.js');
const forceUpdate = read('force-update.html');
const contract = JSON.parse(
  read('docs/modularization/contracts/identity.v1.json')
);

assert.match(
  version,
  /core:'4\.81\.8'/,
  'core version must be 4.81.8'
);

assert.match(
  version,
  /build:'13\.81\.8'/,
  'build version must be 13.81.8'
);

assert.match(
  version,
  /M3\.4 Identity Contract Adapter Foundation/,
  'release name must identify M3.4'
);

assert.match(
  index,
  /core\/platform\/identity-contract-adapter\.js\?v=13\.81\.8/,
  'identity adapter must be loaded by index.html'
);

const profileServiceIndex =
  index.indexOf('core/profiles/profile-service.js?v=13.81.8');

const userPreferencesIndex =
  index.indexOf(
    'core/preferences/user-preferences-service.js?v=13.81.8'
  );

const travelPreferencesIndex =
  index.indexOf(
    'core/preferences/travel-preferences-service.js?v=13.81.8'
  );

const tripAdapterIndex =
  index.indexOf(
    'core/platform/trip-contract-adapter.js?v=13.81.8'
  );

const placesAdapterIndex =
  index.indexOf(
    'core/platform/places-contract-adapter.js?v=13.81.8'
  );

const mediaAdapterIndex =
  index.indexOf(
    'core/platform/media-contract-adapter.js?v=13.81.8'
  );

const identityAdapterIndex =
  index.indexOf(
    'core/platform/identity-contract-adapter.js?v=13.81.8'
  );

const profileFoundationIndex =
  index.indexOf(
    'core/profiles/profile-foundation.js?v=13.81.8'
  );

const appShellIndex =
  index.indexOf('app/app-shell.js?v=13.81.8');

for (const [name, value] of Object.entries({
  profileServiceIndex,
  userPreferencesIndex,
  travelPreferencesIndex,
  tripAdapterIndex,
  placesAdapterIndex,
  mediaAdapterIndex,
  identityAdapterIndex,
  profileFoundationIndex,
  appShellIndex
})) {
  assert.notEqual(value, -1, `${name} missing from index.html`);
}

assert.ok(
  profileServiceIndex < identityAdapterIndex,
  'ProfileService must load before identity adapter'
);

assert.ok(
  userPreferencesIndex < identityAdapterIndex,
  'UserPreferences must load before identity adapter'
);

assert.ok(
  travelPreferencesIndex < identityAdapterIndex,
  'TravelPreferences must load before identity adapter'
);

assert.ok(
  tripAdapterIndex < placesAdapterIndex,
  'Trip adapter must remain before Places adapter'
);

assert.ok(
  placesAdapterIndex < mediaAdapterIndex,
  'Places adapter must remain before Media adapter'
);

assert.ok(
  mediaAdapterIndex < identityAdapterIndex,
  'Media adapter must remain before Identity adapter'
);

assert.ok(
  identityAdapterIndex < profileFoundationIndex,
  'Identity adapter must load before Profile Foundation'
);

assert.ok(
  identityAdapterIndex < appShellIndex,
  'Identity adapter must load before App Shell'
);

assert.match(
  sw,
  /luvia-shell-v13\.81\.8/,
  'service worker cache must be 13.81.8'
);

assert.match(
  sw,
  /core\/platform\/identity-contract-adapter\.js/,
  'service worker must cache identity adapter'
);

assert.match(
  forceUpdate,
  /appv=13\.81\.8/,
  'force update must target 13.81.8'
);

assert.equal(contract.contractId, 'identity.v1');
assert.equal(contract.version, '1');

assert.equal(
  contract.runtimeImplementationStage,
  'M3.4'
);

assert.equal(
  contract.status,
  'implemented-m3.4'
);

assert.deepEqual(
  contract.currentImplementation,
  [
    'LuviaProfileService',
    'LuviaUserPreferences',
    'LuviaTravelPreferences',
    'LuviaIdentityContractV1'
  ]
);

assert.deepEqual(
  contract.runtimeGlobals,
  [
    'LuviaIdentityContractV1',
    'LuviaIdentityContract'
  ]
);

assert.equal(
  contract.publicIdentityMode,
  'self-only-until-provider'
);

assert.equal(
  contract.eventTransport,
  'DOM CustomEvent via luvia:<event-name>; existing compatibility events retained'
);

assert.deepEqual(
  contract.reads,
  [
    'getViewerIdentity',
    'getPublicIdentity',
    'getPreferences(self)',
    'subscribe'
  ]
);

assert.deepEqual(
  contract.commands,
  [
    'updateProfile',
    'updatePreferences'
  ]
);

assert.deepEqual(
  contract.events,
  [
    'identity.changed',
    'preferences.changed'
  ]
);

assert.ok(
  contract.internal.includes('full user_profiles row')
);

assert.ok(
  contract.internal.includes('private preferences/settings')
);

assert.ok(
  contract.internal.includes('auth metadata migration')
);

assert.ok(
  contract.internal.includes('profile cache')
);

assert.ok(
  contract.internal.includes('persistence RPC payloads')
);

console.log(
  'M3.4 Identity Contract Release Integration: OK'
);