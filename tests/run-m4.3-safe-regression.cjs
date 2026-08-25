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
    category: 'Media architecture',
    test: 'tests/m7.1-media-acquisition-native-ports.test.cjs'
  },
  {
    category: 'Media architecture',
    test: 'tests/m7.2-gallery-media-contract-adoption.test.cjs'
  },
  {
    category: 'Media architecture',
    test: 'tests/m7.3-memory-asset-contract-adoption.test.cjs'
  },
  {
    category: 'Media architecture',
    test: 'tests/m7.4-remaining-media-consumer-contract-adoption.test.cjs'
  },
  {
    category: 'Media architecture',
    test: 'tests/m7-final-media-domain-native-readiness.test.cjs'
  },
  {
    category: 'Identity / Events architecture',
    test: 'tests/m8-final-identity-event-native-readiness.test.cjs'
  },
  {
    category: 'Intelligence architecture',
    test: 'tests/m8.5-final-intelligence-core-isolation.test.cjs'
  },
  {
    category: 'App Shell / Navigation',
    test: 'tests/m9.1-navigation-contract-foundation.test.cjs'
  },
  {
    category: 'App Shell / Runtime',
    test: 'tests/m9.2-staged-runtime-module-mounting.test.cjs'
  },
  {
    category: 'App Shell / History',
    test: 'tests/m9.3-navigation-history-policy-foundation.test.cjs'
  },
  {
    category: 'App Shell / Lifecycle',
    test: 'tests/m9.4-runtime-signals-resume-coordination.test.cjs'
  },
  {
    category: 'App Shell / Owner Flows',
    test: 'tests/m9.5-owner-flow-navigation-foundation.test.cjs'
  },
  {
    category: 'Product / Owner Flows',
    test: 'tests/m9.5-consumer-owner-flow-adoption.test.cjs'
  },
  {
    category: 'Booking / Owner Flows',
    test: 'tests/m9.5-booking-owner-flow-adoption.test.cjs'
  },
  {
    category: 'App Shell / Session Exit',
    test: 'tests/m9.6-authenticated-surface-session-exit-hygiene.test.cjs'
  },
  {
    category: 'App Shell / Overlay Host',
    test: 'tests/m10.1-overlay-host-foundation.test.cjs'
  },
  {
    category: 'Intelligence / Overlay Host',
    test: 'tests/m10.2-intelligence-overlay-host-adoption.test.cjs'
  },
  {
    category: 'App Shell / Overlay Compatibility',
    test: 'tests/m10.3-overlay-host-legacy-root-adoption.test.cjs'
  },
  {
    category: 'Product / Overlay Host',
    test: 'tests/m10.4-consumer-overlay-host-adoption.test.cjs'
  },
  {
    category: 'Booking / Overlay Host',
    test: 'tests/m10.4b-booking-overlay-host-adoption.test.cjs'
  },
  {
    category: 'Identity / Trip Overlay Host',
    test: 'tests/m10.4c-identity-trip-overlay-host-adoption.test.cjs'
  },
  {
    category: 'Places / Overlay Host',
    test: 'tests/m10.4d-places-overlay-host-adoption.test.cjs'
  },
  {
    category: 'Journey / Timeline Overlay Host',
    test: 'tests/m10.4e-journey-timeline-overlay-host-adoption.test.cjs'
  },
  {
    category: 'App Shell / Overlay Closeout',
    test: 'tests/m10-final-overlay-global-handler-closeout.test.cjs'
  },
  {
    category: 'Experience / Design System',
    test: 'tests/m10.5-experience-contract-premium-pilot.test.cjs'
  },
  {
    category: 'Product / Consumer',
    test: 'tests/m11-premium-today-attention-composition.test.cjs'
  },
  {
    category: 'Journey architecture',
    test: 'tests/m12-journey-core-day-composer.test.cjs'
  },
  {
    category: 'Memory architecture',
    test: 'tests/m13.1-memory-core-contract-foundation.test.cjs'
  },
  {
    category: 'Product / Consumer',
    test: 'tests/m13.2-premium-memories-experience.test.cjs'
  },
  {
    category: 'App Shell / Legacy Runtime',
    test: 'tests/m14.1-app-shell-legacy-runtime-hardening.test.cjs'
  },
  {
    category: 'Intelligence / AI Composer',
    test: 'tests/m14.2-ai-composer-keyboard-submit.test.cjs'
  },
  {
    category: 'Experience / AI Composer',
    test: 'tests/m14.3-ai-composer-viewport-reachability.test.cjs'
  },
  {
    category: 'Places / Discovery Reliability',
    test: 'tests/m15.0-places-verified-dietary-filter-regression.test.cjs'
  },
  {
    category: 'Places / Discovery Breadth',
    test: 'tests/m15.0b-places-progressive-breadth-runtime.test.cjs'
  },
  {
    category: 'Intelligence / Action Contract',
    test: 'tests/m15.1-intelligence-action-contract-core.test.cjs'
  },
  {
    category: 'Booking / AI Owner Entry',
    test: 'tests/m15.2-booking-owner-chat-entry.test.cjs'
  },
  {
    category: 'Platform / Rich Owner Adapters',
    test: 'tests/m15.3-owner-contract-rich-card-adapters.test.cjs'
  },
  {
    category: 'Intelligence / Action Runtime',
    test: 'tests/m15.4-intelligence-action-runtime.test.cjs'
  },
  {
    category: 'Intelligence / Rich Conversation',
    test: 'tests/m15.5-actionable-ai-chat-rich-results.test.cjs'
  },
  {
    category: 'Experience / Rich Results',
    test: 'tests/m15.6-actionable-ai-rich-result-experience.test.cjs'
  },
  {
    category: 'Booking / Preview CORS',
    test: 'tests/m15.7-booking-route-cors-acceptance.test.cjs'
  },
  {
    category: 'Intelligence / Natural Day Intent',
    test: 'tests/m15.8-intelligence-day-intent-rich-result.test.cjs'
  },
  {
    category: 'Intelligence / Action Ledger',
    test: 'tests/m16.1-intelligence-action-ledger-core.test.cjs'
  },
  {
    category: 'Intelligence / Capability Policy',
    test: 'tests/m16.2-intelligence-action-capability-policy.test.cjs'
  },
  {
    category: 'Intelligence / Confirmed Owner Runtime',
    test: 'tests/m16.3-intelligence-confirmed-owner-action-runtime.test.cjs'
  },
  {
    category: 'Intelligence / Confirmation Chat',
    test: 'tests/m16.4-intelligence-confirmation-recovery-chat.test.cjs'
  },
  {
    category: 'Platform / M16 Runtime Registration',
    test: 'tests/m16.5-intelligence-action-runtime-registration.test.cjs'
  },
  {
    category: 'Experience / Confirmed Owner Actions',
    test: 'tests/m16.6-confirmed-owner-action-experience.test.cjs'
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
    category: 'M16.5 / Visual inventory',
    test: 'tests/m16.5-visual-surface-inventory.test.cjs'
  },
  {
    category: 'M16.5 / Social Experience Graph',
    test: 'tests/m16.5b-social-experience-graph-reservation.test.cjs'
  },
  {
    category: 'M16.5 / Navigation continuity',
    test: 'tests/m16.5c-single-cycle-navigation-transition.test.cjs'
  },
  {
    category: 'M16.5 / Living Design and Compass',
    test: 'tests/m16.5e-living-design-compass-foundation.test.cjs'
  },
  {
    category: 'M16.5 / Signed-in Living Product',
    test: 'tests/m16.5f-signed-in-living-product-vertical-slice.test.cjs'
  },
  {
    category: 'M16.5 / Global Living Compass Release',
    test: 'tests/m16.5g-global-living-compass-release.test.cjs'
  },
  {
    category: 'M16.5 / Accepted Living Shell',
    test: 'tests/m16.5h-accepted-living-shell-adoption.test.cjs'
  },
  {
    category: 'M16.5 / Visual Parity Gate',
    test: 'tests/m16.5i-visual-parity-no-substitution-gate.test.cjs'
  },
  {
    category: 'M16.5 / Accepted Living Shell Release',
    test: 'tests/m16.5j-accepted-living-shell-runtime-release.test.cjs'
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
