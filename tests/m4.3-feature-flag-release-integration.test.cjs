'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function occurrences(text, needle) {
  return text.split(needle).length - 1;
}

const versionSource = read('intelligence/kernel/version.js');

const buildMatch = versionSource.match(/build:'([^']+)'/);
const coreMatch = versionSource.match(/core:'([^']+)'/);

assert.ok(buildMatch, 'kernel version must expose build');
assert.ok(coreMatch, 'kernel version must expose core');

const build = buildMatch[1];
const core = coreMatch[1];

const registryPath = path.join(
  ROOT,
  'core/platform/feature-flag-registry.js'
);

assert.ok(
  fs.existsSync(registryPath),
  'feature flag registry runtime file must exist'
);

const registrySource = read('core/platform/feature-flag-registry.js');
const index = read('index.html');
const sw = read('sw.js');

assert.ok(
  registrySource.includes('window.LuviaFeatureFlagRegistry'),
  'feature flag registry must expose LuviaFeatureFlagRegistry'
);

const capabilityScript =
  `core/platform/capability-registry.js?v=${build}`;

const featureFlagScript =
  `core/platform/feature-flag-registry.js?v=${build}`;

const attentionScript =
  `core/platform/attention-contract.js?v=${build}`;

const productModuleScript =
  `core/platform/product-module-registry.js?v=${build}`;

for (const script of [
  capabilityScript,
  featureFlagScript,
  attentionScript,
  productModuleScript
]) {
  assert.ok(
    index.includes(script),
    `index.html must load ${script}`
  );
}

assert.strictEqual(
  occurrences(index, featureFlagScript),
  1,
  'index.html must load feature flag registry exactly once'
);

const capabilityIndex = index.indexOf(capabilityScript);
const featureFlagIndex = index.indexOf(featureFlagScript);
const attentionIndex = index.indexOf(attentionScript);
const productModuleIndex = index.indexOf(productModuleScript);

assert.ok(
  capabilityIndex < featureFlagIndex,
  'feature flag registry must load after capability registry'
);

assert.ok(
  featureFlagIndex < attentionIndex,
  'feature flag registry must load before attention contract'
);

assert.ok(
  attentionIndex < productModuleIndex,
  'attention contract must remain before product module registry'
);

assert.ok(
  sw.includes(`luvia-shell-v${build}`),
  'service worker cache id must match current build'
);

assert.ok(
  sw.includes('core/platform/feature-flag-registry.js'),
  'service worker app shell must cache feature flag registry'
);

assert.strictEqual(
  occurrences(sw, 'core/platform/feature-flag-registry.js'),
  1,
  'service worker must cache feature flag registry exactly once'
);

const forbiddenRuntimeEntries = [
  'intelligence/platform.js',
  'intelligence/runtime-config.json'
];

for (const legacyEntry of forbiddenRuntimeEntries) {
  assert.ok(
    !index.includes(legacyEntry),
    `index.html must not reactivate legacy runtime entry ${legacyEntry}`
  );

  assert.ok(
    !sw.includes(legacyEntry),
    `service worker must not reactivate legacy runtime entry ${legacyEntry}`
  );
}

console.log(
  `M4.3 feature flag release integration: OK (${build} / Core ${core})`
);