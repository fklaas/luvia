'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function read(relative) {
  return fs.readFileSync(
    path.join(root, relative),
    'utf8'
  );
}

const architecture = read(
  'docs/architecture/NATIVE-FIRST-READY-ARCHITECTURE.md'
);

const rootArchitecture = read(
  'ARCHITECTURE.md'
);

const ports = JSON.parse(
  read(
    'config/luvia-platform-ports.json'
  )
);

const debt = JSON.parse(
  read(
    'config/luvia-native-readiness-debt.json'
  )
);

const safeRunner = read(
  'tests/run-m4.3-safe-regression.cjs'
);

assert.match(
  architecture,
  /LUVIA NATIVE FIRST READY ARCHITECTURE/
);

assert.match(
  architecture,
  /WEB RUNTIME COMPATIBILITY BINDING/
);

assert.match(
  architecture,
  /M5\.3.*blocked/i
);

assert.match(
  rootArchitecture,
  /NFR-0 NATIVE FIRST READY BEGIN/
);

assert.strictEqual(
  ports.version,
  1
);

const expectedPorts = [
  'StoragePort',
  'SecureStoragePort',
  'AuthSessionPort',
  'LocationPort',
  'MediaPickerPort',
  'MediaCapturePort',
  'MediaStoragePort',
  'NotificationPort',
  'NetworkPort',
  'LifecyclePort',
  'SharingPort',
  'DeepLinkPort',
  'ExternalNavigationPort',
  'DevicePort',
  'PermissionPort',
  'OfflineCachePort',
];

assert.deepStrictEqual(
  ports.ports.map((entry) => entry.id),
  expectedPorts
);

assert.strictEqual(
  debt.baselineMarker,
  '9a5872540168d86610c43baaa9d92d55e5798ba3'
);

assert.deepStrictEqual(
  debt.scan,
  {
    sourceFiles: 546,
    totalBrowserFindings: 8008,
    domainRelevantFiles: 186,
    domainRelevantFindings: 3149,
  }
);

assert.strictEqual(
  debt.criticalClassifications[
    'core/trips/trip-store.js'
  ].classification,
  'DOMAIN_VIOLATION'
);

assert.strictEqual(
  debt.criticalClassifications[
    'core/platform/trip-contract-adapter.js'
  ].classification,
  'BOOTSTRAP_COMPATIBILITY'
);

assert.strictEqual(
  debt.criticalClassifications[
    'core/location/global-location-bootstrap.js'
  ].classification,
  'WEB_ADAPTER'
);

assert.strictEqual(
  debt.criticalClassifications[
    'core/trips/trip-experience.js'
  ].classification,
  'WEB_EXPERIENCE'
);

const registrations =
  safeRunner.match(
    /tests\/run-nfr0-foundation-regression\.cjs/g
  ) || [];

assert.strictEqual(
  registrations.length,
  1
);

console.log(
  'PASS Native First Architecture Contract'
);

console.log(
  'PASS Platform Port Registry'
);

console.log(
  'PASS Native Readiness Debt Baseline'
);

console.log(
  'PASS Critical Architecture Classifications'
);

console.log(
  'PASS Safe Regression NFR-0 registration'
);
