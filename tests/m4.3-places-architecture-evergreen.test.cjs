'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(
    path.join(ROOT, relativePath),
    'utf8'
  );
}

function assertIndexLoads(index, asset) {
  assert(
    index.includes(asset),
    `index missing active asset ${asset}`
  );
}

function assertIndexDoesNotLoad(index, asset) {
  assert(
    !index.includes(asset),
    `retired/legacy asset must not be loaded: ${asset}`
  );
}

/* -------------------------------------------------------------------------- */
/* Shared Places module architecture                                           */
/* -------------------------------------------------------------------------- */

const domainModules = [
  'modules/restaurants-v2/restaurant-module.js',
  'modules/accommodations/accommodation-module.js',
  'modules/attractions/attraction-module.js',
  'modules/photo-spots/photo-spot-module.js',
  'modules/shopping/shopping-module.js',
  'modules/nature/nature-module.js',
  'modules/mobility/mobility-module.js'
];

for (const file of domainModules) {
  const source = read(file);

  assert(
    source.includes('LuviaPlaceExperience.discovery'),
    `${file}: shared discovery experience missing`
  );

  assert(
    source.includes('LuviaPlaceCollections.favoritePanel'),
    `${file}: shared favorite collection missing`
  );

  assert(
    source.includes('LuviaPlaceUI.card'),
    `${file}: shared place card missing`
  );

  assert(
    !/function\s+(setFavorite|toggleFavorite|clearFavorites)\s*\(/.test(source),
    `${file}: local favorite writer forbidden`
  );

  assert(
    !/LuviaPlaceEntities\.updateLifecycle\([^)]*isFavorite/.test(source),
    `${file}: direct favorite lifecycle write forbidden`
  );
}

/* -------------------------------------------------------------------------- */
/* Current runtime composition                                                 */
/* -------------------------------------------------------------------------- */

const index = read('index.html');
const placeUi = read('core/places/place-ui.js');
const placesShell = read('modules/places-shell.js');
const appShell = read('app/app-shell.js');
const navigationRegistry = read('app/navigation-registry.js');
const navigationContractCore = read('core/runtime/navigation-contract-core.js');

for (const asset of [
  'core/places/place-runtime-store.js',
  'core/places/place-command-service.js',
  'core/places/shopping-intelligence-service.js',
  'modules/shopping/shopping-module.js',
  'core/places/nature-intelligence-service.js',
  'modules/nature/nature-module.js',
  'core/places/transport-intelligence-service.js',
  'modules/mobility/mobility-module.js',
  'modules/places-shell.js'
]) {
  assertIndexLoads(index, asset);
}

/* -------------------------------------------------------------------------- */
/* Places UI stays centralized                                                 */
/* -------------------------------------------------------------------------- */

assert(
  placeUi.includes('function insightGrid'),
  'global Places insight renderer missing'
);

/* -------------------------------------------------------------------------- */
/* Mobility stays outside the Places hub                                       */
/* -------------------------------------------------------------------------- */

assert(
  !/\bmobility\b/i.test(placesShell),
  'Places shell must not directly contain Mobility'
);

assert(
  !/\bmove\b/i.test(placesShell),
  'Places shell must not directly contain Move'
);

assert(
  navigationContractCore.includes("move:'plan'"),
  'Move navigation alias must resolve to Plan'
);

assert(
  navigationContractCore.includes("mobility:'plan'"),
  'Mobility navigation alias must resolve to Plan'
);

assert(
  appShell.includes(
    "payload.type==='mobility'||payload.type==='transit'"
  ),
  'App Shell must explicitly recognize Mobility/Transit place routing'
);

assert(
  appShell.includes("await show('routes',{payload})"),
  'Mobility/Transit places must route through the Routes surface'
);

assert(
  appShell.includes(
    "pendingPlaceOpen&&pendingPlaceOpen.type!=='mobility'"
  ),
  'Places pending-open flow must continue excluding Mobility'
);

/* -------------------------------------------------------------------------- */
/* Legacy Move shell must not return to active runtime                         */
/* -------------------------------------------------------------------------- */

for (const retiredAsset of [
  'modules/move-shell.js',
  'modules/mobility.js'
]) {
  assertIndexDoesNotLoad(index, retiredAsset);
}

/* -------------------------------------------------------------------------- */
/* Retired cycling architecture must stay retired                              */
/* -------------------------------------------------------------------------- */

for (const retiredAsset of [
  'cycling-route-service.js',
  'cycling-route-intelligence-service.js',
  'modules/cycling-routes/cycling-route-module.js'
]) {
  assertIndexDoesNotLoad(index, retiredAsset);
}

console.log(
  'M4.3 Places architecture evergreen regression: OK'
);
