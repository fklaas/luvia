'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function requireIndexAsset(index, asset, build) {
  const versioned = `${asset}?v=${build}`;
  const position = index.indexOf(versioned);

  assert.notEqual(
    position,
    -1,
    `${versioned} missing from index.html`
  );

  return position;
}

function requireSwAsset(sw, asset) {
  assert(
    sw.includes(`'${asset}'`) ||
    sw.includes(`"${asset}"`),
    `${asset} missing from service worker cache`
  );
}

const version = read('intelligence/kernel/version.js');
const index = read('index.html');
const sw = read('sw.js');
const forceUpdate = read('force-update.html');

const buildMatch = version.match(/build:'([^']+)'/);
const coreMatch = version.match(/core:'([^']+)'/);

assert(buildMatch, 'Current App build missing from version.js');
assert(coreMatch, 'Current Core version missing from version.js');

const build = buildMatch[1];
const core = coreMatch[1];

assert(
  index.includes(`?v=${build}`),
  'index.html must use the current App build for cache-busted runtime assets'
);

assert(
  sw.includes(`luvia-shell-v${build}`),
  'service worker cache identity must match the current App build'
);

assert(
  forceUpdate.includes(`appv=${build}`),
  'force-update.html must target the current App build'
);

/* -------------------------------------------------------------------------- */
/* Trip contract integration                                                   */
/* -------------------------------------------------------------------------- */

const tripContract = readJson(
  'docs/modularization/contracts/trip.v1.json'
);

const tripProviderIndex = requireIndexAsset(
  index,
  'core/trips/join-flow.js',
  build
);

const tripAdapterIndex = requireIndexAsset(
  index,
  'core/platform/trip-contract-adapter.js',
  build
);

const tripDraftCoreIndex = requireIndexAsset(
  index,
  'core/trips/trip-draft-core.js',
  build
);

assert(
  tripProviderIndex < tripAdapterIndex && tripDraftCoreIndex < tripAdapterIndex,
  'Trip adapter must load after Trip-owned use-case providers'
);

assert.equal(tripContract.contractId, 'trip.v1');
assert.equal(tripContract.version, '1');
assert.equal(tripContract.status, 'implemented-m3.1');

assert(
  tripContract.runtimeGlobals.includes('LuviaTripContractV1'),
  'Trip contract must expose LuviaTripContractV1'
);

requireSwAsset(
  sw,
  'core/platform/trip-contract-adapter.js'
);
requireSwAsset(sw, 'core/trips/trip-draft-core.js');

/* -------------------------------------------------------------------------- */
/* Places contract integration                                                 */
/* -------------------------------------------------------------------------- */

const placesContract = readJson(
  'docs/modularization/contracts/places.v1.json'
);

const placesCommandIndex = requireIndexAsset(
  index,
  'core/places/place-command-service.js',
  build
);

const placesGatewayIndex = requireIndexAsset(
  index,
  'intelligence/places-service.js',
  build
);

const placesAdapterIndex = requireIndexAsset(
  index,
  'core/platform/places-contract-adapter.js',
  build
);

assert(
  placesCommandIndex < placesAdapterIndex,
  'Places adapter must load after Places-owned command provider'
);

assert(
  placesGatewayIndex < placesAdapterIndex,
  'Places adapter must load after Places gateway'
);

assert(
  tripAdapterIndex < placesAdapterIndex,
  'Trip adapter must remain before Places adapter'
);

assert.equal(placesContract.contractId, 'places.v1');
assert.equal(placesContract.version, '1');
assert.equal(placesContract.runtimeImplementationStage, 'M3.2');
assert.equal(placesContract.status, 'implemented-m3.2');

for (const implementation of [
  'LuviaPlaceCore',
  'LuviaPlaces',
  'LuviaPlaceCommands',
  'LuviaPlacesContractV1'
]) {
  assert(
    placesContract.currentImplementation.includes(implementation),
    `Places contract missing implementation ${implementation}`
  );
}

for (const runtimeGlobal of [
  'LuviaPlacesContractV1',
  'LuviaPlacesContract'
]) {
  assert(
    placesContract.runtimeGlobals.includes(runtimeGlobal),
    `Places contract missing runtime global ${runtimeGlobal}`
  );
}

assert.equal(
  placesContract.eventTransport,
  'DOM CustomEvent via luvia:<event-name>; existing compatibility events retained'
);

requireSwAsset(
  sw,
  'core/platform/places-contract-adapter.js'
);

/* -------------------------------------------------------------------------- */
/* Media contract integration                                                  */
/* -------------------------------------------------------------------------- */

const mediaContract = readJson(
  'docs/modularization/contracts/media.v1.json'
);

const mediaProviderIndexes = [
  'core/media/media-core.js',
  'core/media/memory-albums.js',
  'core/media/memory-journeys.js',
  'core/media/memory-cards.js'
].map(asset => ({
  asset,
  position: requireIndexAsset(index, asset, build)
}));

const mediaAdapterIndex = requireIndexAsset(
  index,
  'core/platform/media-contract-adapter.js',
  build
);

for (const provider of mediaProviderIndexes) {
  assert(
    provider.position < mediaAdapterIndex,
    `Media adapter must load after ${provider.asset}`
  );
}

assert(
  placesAdapterIndex < mediaAdapterIndex,
  'Media adapter must remain after Places adapter'
);

assert.equal(mediaContract.contractId, 'media.v1');
assert.equal(mediaContract.version, '1');
assert.equal(mediaContract.runtimeImplementationStage, 'M3.3');
assert.equal(mediaContract.status, 'implemented-m3.3');

for (const implementation of [
  'LuviaMediaCore',
  'LuviaMemoryAlbums',
  'LuviaMemoryCards',
  'LuviaMemoryJourneys',
  'LuviaMediaContractV1'
]) {
  assert(
    mediaContract.currentImplementation.includes(implementation),
    `Media contract missing implementation ${implementation}`
  );
}

for (const runtimeGlobal of [
  'LuviaMediaContractV1',
  'LuviaMediaContract'
]) {
  assert(
    mediaContract.runtimeGlobals.includes(runtimeGlobal),
    `Media contract missing runtime global ${runtimeGlobal}`
  );
}

assert.equal(
  mediaContract.eventTransport,
  'DOM CustomEvent via luvia:<event-name>; existing compatibility events retained'
);

assert(
  mediaContract.internal.includes('direct OpenAI provider'),
  'Direct OpenAI provider must remain internal to Media'
);

assert(
  !mediaContract.commands.includes('clearTripGallery'),
  'Destructive clearTripGallery must not become public media.v1 command'
);

for (const asset of [
  'core/media/memory-journeys.js',
  'core/media/memory-cards.js',
  'core/platform/media-contract-adapter.js'
]) {
  requireSwAsset(sw, asset);
}

/* -------------------------------------------------------------------------- */
/* Identity / Preferences contract integration                                 */
/* -------------------------------------------------------------------------- */

const identityContract = readJson(
  'docs/modularization/contracts/identity.v1.json'
);

const profileServiceIndex = requireIndexAsset(
  index,
  'core/profiles/profile-service.js',
  build
);

const userPreferencesIndex = requireIndexAsset(
  index,
  'core/preferences/user-preferences-service.js',
  build
);

const travelPreferencesIndex = requireIndexAsset(
  index,
  'core/preferences/travel-preferences-service.js',
  build
);

const identityAdapterIndex = requireIndexAsset(
  index,
  'core/platform/identity-contract-adapter.js',
  build
);

const profileFoundationIndex = requireIndexAsset(
  index,
  'core/profiles/profile-foundation.js',
  build
);

const appShellIndex = requireIndexAsset(
  index,
  'app/app-shell.js',
  build
);

assert(
  profileServiceIndex < identityAdapterIndex,
  'ProfileService must load before Identity adapter'
);

assert(
  userPreferencesIndex < identityAdapterIndex,
  'UserPreferences must load before Identity adapter'
);

assert(
  travelPreferencesIndex < identityAdapterIndex,
  'TravelPreferences must load before Identity adapter'
);

assert(
  mediaAdapterIndex < identityAdapterIndex,
  'Media adapter must remain before Identity adapter'
);

assert(
  identityAdapterIndex < profileFoundationIndex,
  'Identity adapter must load before Profile Foundation'
);

assert(
  identityAdapterIndex < appShellIndex,
  'Identity adapter must load before App Shell'
);

assert(
  tripAdapterIndex < appShellIndex &&
  placesAdapterIndex < appShellIndex &&
  mediaAdapterIndex < appShellIndex,
  'All M3 domain contract adapters must be ready before App Shell'
);

assert.equal(identityContract.contractId, 'identity.v1');
assert.equal(identityContract.version, '1');
assert.equal(identityContract.runtimeImplementationStage, 'M3.4');
assert.equal(identityContract.status, 'implemented-m3.4');

assert.deepEqual(
  identityContract.currentImplementation,
  [
    'LuviaProfileService',
    'LuviaUserPreferences',
    'LuviaTravelPreferences',
    'LuviaIdentityContractV1'
  ]
);

assert.deepEqual(
  identityContract.runtimeGlobals,
  [
    'LuviaIdentityContractV1',
    'LuviaIdentityContract'
  ]
);

assert.equal(
  identityContract.publicIdentityMode,
  'self-only-until-provider'
);

assert.equal(
  identityContract.eventTransport,
  'DOM CustomEvent via luvia:<event-name>; existing compatibility events retained'
);

assert.deepEqual(
  identityContract.reads,
  [
    'getViewerIdentity',
    'getPublicIdentity',
    'getPreferences(self)',
    'exportData(self)',
    'subscribe'
  ]
);

assert.deepEqual(
  identityContract.commands,
  [
    'updateProfile',
    'updatePreferences',
    'completeOnboarding',
    'updateDashboardLayout',
    'setTripArchived',
    'requestNotificationPermission(explicit platform gesture)'
  ]
);

assert.deepEqual(
  identityContract.events,
  [
    'identity.changed',
    'preferences.changed'
  ]
);

for (const internal of [
  'full user_profiles row',
  'private preferences/settings',
  'auth metadata migration',
  'profile cache',
  'persistence RPC payloads'
]) {
  assert(
    identityContract.internal.includes(internal),
    `Identity contract must keep ${internal} internal`
  );
}

requireSwAsset(
  sw,
  'core/platform/identity-contract-adapter.js'
);

console.log(
  `M4.3 contract release integration evergreen: OK (${build} / Core ${core})`
);
