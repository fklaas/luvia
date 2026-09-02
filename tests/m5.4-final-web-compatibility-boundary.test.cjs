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

const stateCore =
  load('core/trips/trip-state-core.js');

const store =
  load('core/trips/trip-store.js');

const context =
  load('luvia-trip-context.js');

const adapter =
  load('core/platform/trip-contract-adapter.js');

const travel =
  load('core/context/travel-context-service.js');

const activeCore =
  load('core/trips/active-trip-context.mjs');

const index =
  load('index.html');

const runtimeLoader =
  load('app/luvia-runtime-loader.mjs');

const runtimeManifest =
  JSON.parse(load('app/luvia-runtime.bundle.manifest.json'));


assert(
  store.includes(
    'LuviaTripStateReaderV1'
  ),
  'Trip Store owner must publish the early read-only state reader'
);

const readerStart =
  store.indexOf(
    'web.LuviaTripStateReaderV1=Object.freeze({'
  );

assert(
  readerStart >= 0,
  'Trip State Reader declaration missing'
);

const readerEnd =
  store.indexOf(
    '});',
    readerStart
  );

assert(
  readerEnd > readerStart,
  'Trip State Reader declaration end missing'
);

const readerBlock =
  store.slice(
    readerStart,
    readerEnd + 3
  );

assert(
  readerBlock.includes('snapshot') &&
  readerBlock.includes('subscribe'),
  'Trip State Reader must expose snapshot and subscribe'
);

for (const forbidden of [
  'upsert',
  'setActive',
  'clearActive',
  'loadRemote'
]) {
  assert(
    !readerBlock.includes(forbidden),
    'Trip State Reader must remain read-only: ' +
    forbidden
  );
}


assert.strictEqual(
  count(
    context,
    'LuviaTripStore'
  ),
  0,
  'Web Trip Context must not depend directly on private TripStore'
);

assert(
  context.includes(
    'web.LuviaTripStateReaderV1'
  ),
  'Web Trip Context must bind through TripStateReaderV1'
);

assert(
  context.includes(
    "'LuviaTripStateReaderV1'"
  ) ||
  context.includes(
    '"LuviaTripStateReaderV1"'
  ),
  'Trip Context diagnostics must identify the read-only provider'
);


assert.strictEqual(
  count(
    adapter,
    'LuviaTripStore'
  ),
  2,
  'Owner adapter may retain only the private Store owner helper reference and provider label'
);

assert.strictEqual(
  count(
    adapter,
    'window.LuviaTripStore'
  ),
  1,
  'Owner adapter must have exactly one direct private Web Store access'
);

assert(
  count(
    adapter,
    'window.LuviaTripStateReaderV1'
  ) >= 4,
  'Owner adapter readiness/diagnostics must use the read-only State Reader'
);


assert(
  travel.includes(
    'const trip=()=>window.LuviaTripContext?.getActiveTrip?.()||{};'
  ),
  'Travel Context must derive Trip state from public Trip Context only'
);

assert(
  !travel.includes(
    'window.LuviaAppState?.getSnapshot?.()?.trip?.trip'
  ),
  'Travel Context must not retain secondary AppState Trip fallback'
);

assert.strictEqual(
  count(
    travel,
    'LuviaTripStore'
  ),
  0,
  'Travel Context must not access private TripStore'
);


for (const token of [
  'window',
  'document',
  'localStorage',
  'sessionStorage',
  'navigator'
]) {
  assert(
    !activeCore.includes(token),
    'Runtime-neutral Active Trip Context core must remain browserless: ' +
    token
  );
}


const runtimeSources =
  runtimeManifest.map(entry => entry.source);

const storeIndex =
  runtimeSources.indexOf('core/trips/trip-store.js');

const adapterIndex =
  runtimeSources.indexOf('core/platform/trip-contract-adapter.js');

const precontextIndex =
  runtimeLoader.indexOf('luvia-runtime-precontext-13.82.139.bundle.js');

const contextIndex =
  runtimeLoader.indexOf('../luvia-trip-context.js');

const postcontextIndex =
  runtimeLoader.indexOf('luvia-runtime-postcontext-13.82.139.bundle.js');

assert(
  storeIndex >= 0 &&
  adapterIndex > storeIndex &&
  precontextIndex >= 0 &&
  contextIndex > precontextIndex &&
  postcontextIndex > contextIndex,
  'Physical web load order must remain TripStore (pre-context) -> TripContext -> Trip owner adapter (post-context)'
);


for (const legacy of [
  'app/memory-worlds-v2.js',
  'app/memory-worlds-v3.ts',
  'core/app/app-shell-v11.js',
  'intelligence/services/base-services.js',
  'luvia-entry.js'
]) {
  assert(
    !index.includes(legacy),
    'Deferred legacy debt must remain outside active index graph: ' +
    legacy
  );
}


assert(
  adapter.includes(
    'function commitTripSnapshot(trip,options={})'
  ),
  'M5.4.3 owner commit command must remain preserved'
);

console.log(
  'M5.4 FINAL Web Compatibility Boundary: PASS'
);

console.log(
  'Web Trip Context private LuviaTripStore refs: 0'
);

console.log(
  'Owner adapter direct private Store access: exactly 1'
);

console.log(
  'TripStateReaderV1: READ-ONLY snapshot / subscribe'
);

console.log(
  'Travel Context secondary AppState Trip fallback: REMOVED'
);

console.log(
  'Active Trip Context core: BROWSERLESS'
);

console.log(
  'Unreachable legacy TripStore debt: DEFERRED / NOT REACTIVATED'
);

console.log(
  'TripStore sole Trip Truth: PRESERVED'
);
