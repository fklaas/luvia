'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');

/*
 * M4.3 controlled local regression allowlist.
 *
 * This is intentionally NOT a glob over every historical *.test.cjs file.
 * Historical release evidence may contain release-specific version/cache/path
 * assertions and therefore must not silently become an evergreen merge gate.
 *
 * Every entry below has been reviewed as local/non-destructive and has already
 * been executed successfully against the M4.3 working baseline.
 */
const SUITE = Object.freeze([
  {
    category: 'Release',
    test: 'tests/release-version-consistency.test.cjs'
  },

  {
    category: 'Runtime foundation',
    test: 'tests/m4.3-evergreen-foundation-regression.test.cjs'
  },

  {
    category: 'Feature flags',
    test: 'tests/m4.3-feature-flag-registry.test.cjs'
  },
  {
    category: 'Feature flags',
    test: 'tests/m4.3-feature-flag-release-integration.test.cjs'
  },

  {
    category: 'M3 contracts',
    test: 'tests/m3.1-trip-contract-adapter.test.cjs'
  },
  {
    category: 'M3 contracts',
    test: 'tests/m3.2-places-contract-adapter.test.cjs'
  },
  {
    category: 'M3 contracts',
    test: 'tests/m3.3-media-contract-adapter.test.cjs'
  },
  {
    category: 'M3 contracts',
    test: 'tests/m3.4-identity-contract-adapter.test.cjs'
  },
  {
    category: 'M3 contracts',
    test: 'tests/m4.3-contract-release-integration-evergreen.test.cjs'
  },

  {
    category: 'Places architecture',
    test: 'tests/m4.3-places-architecture-evergreen.test.cjs'
  },
  {
    category: 'Places architecture',
    test: 'tests/m6.1-places-state-core-foundation.test.cjs'
  },
  {
    category: 'Places architecture',
    test: 'tests/m6.2-places-runtime-projection-core.test.cjs'
  },
  {
    category: 'Places architecture',
    test: 'tests/m6-final-places-domain-native-readiness.test.cjs'
  },

  {
    category: 'Product / Consumer',
    test: 'tests/m5.1b-gallery-view-trip-contract-adoption.test.cjs'
  },

  {
    category: 'Product / Control Center',
    test: 'tests/m5.1c-booking-inbox-trip-contract-adoption.test.cjs'
  },
  {
    category: 'Product / Control Center',
    test: 'tests/m5.1d-booking-control-center-trip-contract-adoption.test.cjs'
  },
  {
    category: 'Product / App Shell',
    test: 'tests/m5.1e-active-app-shell-trip-contract-adoption.test.cjs'
  },
  {
    category: 'Product / Consumer',
    test: 'tests/m5.1f-memory-worlds-v3-trip-contract-adoption.test.cjs'
  },
  {
    category: 'Places architecture',
    test: 'tests/m5.1g-places-domain-trip-contract-adoption.test.cjs'
  },
  {
    category: 'Product / Consumer',
    test: 'tests/m5.1h-discovery-modules-trip-contract-adoption.test.cjs'
  },
  {
    category: 'Runtime foundation',
    test: 'tests/m5.1i-diagnostics-trip-contract-adoption.test.cjs'
  },
  {
    category: 'Product / Consumer',
    test: 'tests/m5.1j-profile-foundation-trip-contract-adoption.test.cjs'
  },
  {
    category: 'Intelligence',
    test: 'tests/m5.1k-recommendations-trip-contract-adoption.test.cjs'
  },
  {
    category: 'Intelligence',
    test: 'tests/m5.4.1b-destination-service-trip-boundary-adoption.test.cjs'
  },
  {
    category: 'Intelligence',
    test: 'tests/m5.4.2-runtime-bootstrap-trip-boundary.test.cjs'
  },
  {
    category: 'Trip architecture',
    test: 'tests/m5.4.3-active-tripstore-consumer-isolation.test.cjs'
  },
  {
    category: 'Native readiness',
    test: 'tests/m5.4-final-web-compatibility-boundary.test.cjs'
  },
  {
    category: 'Trip architecture',
    test: 'tests/m5-final-physical-trip-core-isolation.test.cjs'
  },
  {
    category: 'Runtime foundation',
    test: 'tests/m5.2-remaining-trip-consumer-isolation.test.cjs'
  },
  {
    category: 'M3 contracts',
    test: 'tests/m5.1f-trip-contract-accent-compatibility.test.cjs'
  },
  {
    category: 'Product / Control Center',
    test: 'tests/v13.77.0-control-center-home-travel-identity.test.cjs'
  },
  {
    category: 'Product / Control Center',
    test: 'tests/v13.78.0-booking-control-center-foundation.test.cjs'
  },
  {
    category: 'Product / Control Center',
    test: 'tests/v13.78.0-product-module-regression.test.cjs'
  },

  {
    category: 'Booking',
    test: 'tests/v13.81.3-contact-resolver-green-farmers-regression.test.cjs'
  },
  {
    category: 'Booking',
    test: 'tests/v13.81.4-google-reserve-discovery-matrix.test.cjs'
  },
  {
    category: 'Booking',
    test: 'tests/v13.81.4-green-farmers-mutation-bootstrap-regression.test.cjs'
  },

  {
    category: 'Architecture / Registry',
    test: 'tests/m4.5.3-core-stream-registry.test.cjs'
  },
  {
    category: 'Architecture / Topology',
    test: 'tests/m4.5.4-eight-stream-topology-guardrail.test.cjs'
  },
  {
    category: 'Architecture / Core boundaries',
    test: 'tests/m4.5.4-core-boundary-guardrails.test.cjs'
  },
  {
    category: 'Native readiness',
    test: 'tests/run-nfr0-foundation-regression.cjs'
  },
  {
    category: 'M5.3 / Active Trip Context',
    test: 'tests/run-m5.3-active-trip-context-regression.cjs'
  },
  {
    category: 'Repository guardrail',
    test: 'tests/m4.2-cross-core-db-ownership-guardrail.test.cjs'
  }
]);

function resolveTest(relativePath) {
  const absolute = path.resolve(ROOT, relativePath);

  if (
    absolute !== ROOT &&
    !absolute.startsWith(`${ROOT}${path.sep}`)
  ) {
    throw new Error(
      `Regression path escapes repository root: ${relativePath}`
    );
  }

  if (!fs.existsSync(absolute)) {
    throw new Error(
      `Regression allowlist entry does not exist: ${relativePath}`
    );
  }

  return absolute;
}

function listSuite() {
  console.log('M4.3 Safe Regression Allowlist');
  console.log(`Tests: ${SUITE.length}`);

  SUITE.forEach((entry, index) => {
    console.log(
      `${String(index + 1).padStart(2, '0')}. ` +
      `[${entry.category}] ${entry.test}`
    );
  });
}

if (process.argv.includes('--list')) {
  listSuite();
  process.exit(0);
}

const results = [];

console.log('=== M4.3 SAFE REGRESSION HARNESS ===');
console.log(`Repository: ${ROOT}`);
console.log(`Allowlisted tests: ${SUITE.length}`);

for (const entry of SUITE) {
  console.log(
    `\n=== [${entry.category}] ${entry.test} ===`
  );

  let absolute;

  try {
    absolute = resolveTest(entry.test);
  } catch (error) {
    console.error(error.message);

    results.push({
      ...entry,
      exitCode: 1,
      result: 'FAIL'
    });

    continue;
  }

  const run = spawnSync(
    process.execPath,
    [absolute],
    {
      cwd: ROOT,
      stdio: 'inherit'
    }
  );

  const exitCode =
    typeof run.status === 'number'
      ? run.status
      : 1;

  if (run.error) {
    console.error(
      `Runner error: ${run.error.message}`
    );
  }

  results.push({
    ...entry,
    exitCode,
    result: exitCode === 0 ? 'PASS' : 'FAIL'
  });
}

const passed =
  results.filter(item => item.result === 'PASS').length;

const failed =
  results.filter(item => item.result === 'FAIL');

console.log('\n=== M4.3 SAFE REGRESSION RESULT ===');

for (const item of results) {
  console.log(
    `${item.result.padEnd(4)}  ` +
    `[${item.category}] ${item.test}`
  );
}

console.log('');
console.log(`Total:  ${results.length}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed.length}`);
console.log(
  `Suite:  ${failed.length === 0 ? 'PASS' : 'FAIL'}`
);

if (failed.length > 0) {
  process.exitCode = 1;
}
