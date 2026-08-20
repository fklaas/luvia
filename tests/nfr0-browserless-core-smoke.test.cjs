'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

(async () => {
  assert.strictEqual(
    typeof global.window,
    'undefined'
  );

  assert.strictEqual(
    typeof global.document,
    'undefined'
  );

  // Modern Node runtimes may expose a standards-compatible navigator global.
  // Browserless means this runtime-neutral module must not depend on it.

  const modulePath = path.resolve(
    __dirname,
    '../core/platform/native/platform-port-registry.mjs'
  );

  const source =
    fs.readFileSync(
      modulePath,
      'utf8'
    );

  assert.doesNotMatch(
    source,
    /\bwindow\b|\bdocument\b|\bnavigator\b|\blocalStorage\b|\bsessionStorage\b/
  );

  const mod = await import(
    pathToFileURL(modulePath).href +
      '?nfr0=' +
      Date.now()
  );

  assert.strictEqual(
    mod.PLATFORM_PORT_IDS.length,
    16
  );

  const registry =
    mod.createPlatformPortRegistry();

  registry.register(
    'NetworkPort',
    {
      isOnline() {
        return true;
      },
    }
  );

  assert.strictEqual(
    registry.has('NetworkPort'),
    true
  );

  assert.strictEqual(
    registry.require('NetworkPort').isOnline(),
    true
  );

  assert.throws(
    () =>
      registry.require('StoragePort'),
    /Platform port not registered/
  );

  const debt = JSON.parse(
    fs.readFileSync(
      path.resolve(
        __dirname,
        '../config/luvia-native-readiness-debt.json'
      ),
      'utf8'
    )
  );

  assert.strictEqual(
    debt.criticalClassifications[
      'core/trips/trip-store.js'
    ].classification,
    'DOMAIN_VIOLATION'
  );

  console.log(
    'PASS Browserless Platform Port Registry'
  );

  console.log(
    'PASS Browserless Core Smoke Foundation'
  );

  console.log(
    'PASS Trip Core browser debt remains explicitly registered for M5.3/M5.4'
  );
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
