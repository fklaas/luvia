'use strict';

const fs = require('fs');
const assert = require('assert');

const read = path => fs.readFileSync(path, 'utf8');

const streams = JSON.parse(read('config/luvia-streams.json'));
const cores = JSON.parse(read('config/luvia-cores.json'));

const expectedBranches = [
  'main',
  'integration',
  'feature/consumer-experience',
  'feature/platform-core',
  'feature/trip-core',
  'feature/places-core',
  'feature/booking-core',
  'feature/media-core',
  'feature/memory-core',
  'feature/identity-core',
  'feature/events-core',
  'feature/journey-core',
  'feature/experience-core',
  'feature/intelligence-core',
  'feature/collaboration-core',
  'feature/social-experience-graph',
  'feature/attention-core',
  'feature/travel-wallet-core',
  'feature/reviews-core',
  'feature/admin-core'
];

assert.strictEqual(streams.schemaVersion, 1);
assert.strictEqual(streams.topologyVersion, '20-stream-core-aligned-v1');
assert.strictEqual(streams.streamCount, 20);
assert.strictEqual(streams.streams.length, 20);

assert.deepStrictEqual(
  streams.streams.map(stream => stream.branch),
  expectedBranches
);

assert.strictEqual(
  new Set(streams.streams.map(stream => stream.branch)).size,
  20
);

assert.strictEqual(
  new Set(streams.streams.map(stream => stream.worktree)).size,
  20
);

const experienceStream = streams.streams.find(
  stream => stream.branch === 'feature/experience-core'
);

const intelligenceStream = streams.streams.find(
  stream => stream.branch === 'feature/intelligence-core'
);

assert(experienceStream);
assert(intelligenceStream);
assert.strictEqual(experienceStream.worktree, '../luvia-experience');
assert.strictEqual(intelligenceStream.worktree, '../luvia-intelligence');

assert.strictEqual(
  cores.cores.experience.ownerStream,
  'feature/experience-core'
);

assert.strictEqual(
  cores.cores.experience.truthOwnership,
  'no-domain-truth'
);

assert.strictEqual(
  cores.cores.intelligence.ownerStream,
  'feature/intelligence-core'
);

assert.strictEqual(
  cores.cores.intelligence.truthOwnership,
  'intelligence-specific-state-only'
);

assert.strictEqual(
  cores.cores.intelligence.publicContract,
  'LuviaIntelligenceContractV1'
);

assert.strictEqual(
  cores.cores.intelligence.status,
  'active'
);

assert.strictEqual(
  cores.cores.intelligence.browserlessCore,
  'core/intelligence/intelligence-domain-contract-core.js'
);

assert.strictEqual(
  cores.cores.intelligence.contractAdapter,
  'core/platform/intelligence-contract-adapter.js'
);

assert.strictEqual(
  cores.cores.journeyTimeline.root,
  'core/journey/'
);

assert.strictEqual(
  cores.cores.journeyTimeline.status,
  'active'
);

assert.strictEqual(
  cores.cores.journeyTimeline.publicContract,
  'LuviaJourneyContractV1'
);

assert.strictEqual(
  cores.cores.journeyTimeline.legacyCompatibility,
  'core/places/timeline-core.js'
);

assert.strictEqual(
  cores.cores.memory.ownerStream,
  'feature/memory-core'
);

assert.strictEqual(
  cores.cores.memory.truthOwnership,
  'canonical-memory-and-narrative-truth'
);

assert.strictEqual(
  cores.cores.memory.publicContract,
  'LuviaMemoryContractV1'
);

assert.strictEqual(
  cores.cores.memory.status,
  'active'
);

const rootAgents = read('AGENTS.md');
const architecture = read('ARCHITECTURE.md');
const dependencies = read('docs/architecture/DEPENDENCY-RULES.md');
const migration = read('docs/architecture/MIGRATION-STATE.md');
const experienceAgents = read('core/experience/AGENTS.md');
const intelligenceAgents = read('core/intelligence/AGENTS.md');

for (const token of [
  'config/luvia-streams.json',
  'config/luvia-cores.json',
  'core/places/timeline-core.js'
]) {
  assert(
    rootAgents.includes(token),
    `Root AGENTS missing ${token}`
  );
}

assert(
  architecture.includes('feature/experience-core'),
  'Architecture missing Experience stream'
);

assert(
  architecture.includes('feature/intelligence-core'),
  'Architecture missing Intelligence stream'
);

const intelligenceRule =
  'Intelligence may understand every domain, but it owns no domain truth except Intelligence-specific state.';

assert(
  intelligenceAgents.includes(intelligenceRule),
  'Intelligence AGENTS missing governing rule'
);

assert(
  dependencies.includes(intelligenceRule),
  'Dependency rules missing Intelligence governing rule'
);

assert(
  experienceAgents.includes('Do not create or persist canonical Trip, Places, Booking, Media, Identity, Social or Intelligence truth here.'),
  'Experience ownership boundary missing'
);

assert(
  migration.includes('23 direct legacy token occurrences across 19 physical source lines'),
  'M5.1h measured audit state missing'
);

assert(
  migration.includes('M5.1h is COMPLETE.'),
  'M5.1h completed migration state missing'
);

assert(
  migration.includes('Production Runtime Proof: TARGET_ALREADY_LIVE on App 13.82.7 / Core 4.82.7'),
  'M5.1h Production Runtime Proof missing'
);

assert(
  migration.includes('live remote SHA and divergence were not captured'),
  'M5.1h historical protocol-evidence limitation missing'
);

assert(
  migration.includes('core/places/timeline-core.js'),
  'Timeline reservation missing'
);

console.log('M4.5.3 Core / Stream Registry + Architecture Foundation: PASS');
assert(
  migration.includes('M5.1a through M5.1k: COMPLETE.'),
  'M5.1k aggregate completed migration state missing'
);

assert(
  migration.includes('M5.1i is COMPLETE.'),
  'M5.1i completed migration state missing'
);

assert(
  migration.includes('Production static provenance: 6 / 6 exact assets on App 13.82.8 / Core 4.82.8.'),
  'M5.1i Production static provenance missing'
);

assert(
  migration.includes('Production Browser Runtime CORS Revalidation: 15 / 15 PASS.'),
  'M5.1i Production browser acceptance missing'
);

assert(
  migration.includes('`luvia-gateway v111` – ACTIVE') &&
    migration.includes('`luvia-intelligence v25` – ACTIVE'),
  'M5.1i final Edge Function versions missing'
);

assert(
  migration.includes('Historical protocol-evidence limitation remains retained for M5.1i'),
  'M5.1i historical protocol-evidence limitation missing'
);

console.log('M5.1i completed state preserved: PASS');
assert(
  migration.includes('M5.1j is COMPLETE.'),
  'M5.1j completed migration state missing'
);

assert(
  migration.includes('Profile Foundation was migrated from direct private LuviaTripStore access to the canonical public Trip Contract v1 boundary.'),
  'M5.1j Profile Foundation Trip Contract migration missing'
);

assert(
  migration.includes('Production static provenance: 6 / 6 exact assets on App 13.82.9 / Core 4.82.9.'),
  'M5.1j Production static provenance missing'
);

assert(
  migration.includes('Integration Preview current static provenance: 6 / 6 exact assets on App 13.82.9 / Core 4.82.9.'),
  'M5.1j Integration Preview current provenance missing'
);

assert(
  migration.includes('A pre-Main Preview HTTP gate is not retroactively claimed.'),
  'M5.1j Preview evidence timing limitation missing'
);

assert(
  migration.includes('Historical protocol-evidence limitation remains retained.'),
  'M5.1j retained historical protocol-evidence limitation missing'
);

console.log('M5.1j completed state preserved: PASS');

assert(
  migration.includes('M5.1k is COMPLETE.'),
  'M5.1k completed migration state missing'
);

assert(
  migration.includes('Recommendations Trip Contract Adoption migrated the six approved Recommendations runtime services away from direct private LuviaTripStore and LuviaTripContext reads to the existing public Trip Contract v1 boundary.'),
  'M5.1k Recommendations Trip Contract migration missing'
);

assert(
  migration.includes('Integration Preview pre-Main static provenance: 11 / 11 exact assets on App 13.82.10 / Core 4.82.10.'),
  'M5.1k pre-Main Integration Preview provenance missing'
);

assert(
  migration.includes('Production static provenance: 11 / 11 exact assets on App 13.82.10 / Core 4.82.10.'),
  'M5.1k Production static provenance missing'
);

assert(
  migration.includes('pre-Main Preview gate retroactively claimed = NO.'),
  'M5.1k Preview timing evidence missing'
);

assert(
  migration.includes('M5.1k establishes logical Recommendations isolation only. Physical relocation of domain implementation into the final core-oriented repository topology remains pending'),
  'M5.1k physical-isolation boundary missing'
);

console.log('M5.1k completed state preserved: PASS');
assert(
  migration.includes('M5.2 runtime and Production acceptance is COMPLETE.'),
  'M5.2 runtime / Production acceptance missing'
);

assert(
  migration.includes('Remaining Trip Consumer Isolation migrated the seven approved Platform and Booking runtime consumers to the public Trip Contract v1 boundary.'),
  'M5.2 Trip Contract migration missing'
);

assert(
  migration.includes('Integration Preview pre-Main static provenance: 12 / 12 byte-exact assets on App 13.82.11 / Core 4.82.11.'),
  'M5.2 pre-Main Preview provenance missing'
);

assert(
  migration.includes('Production static provenance: 12 / 12 byte-exact assets on App 13.82.11 / Core 4.82.11.'),
  'M5.2 Production provenance missing'
);

assert(
  migration.includes('Production authenticated runtime navigate and reload: PASS.'),
  'M5.2 Production runtime acceptance missing'
);

assert(
  migration.includes('M5.2 final eight-stream synchronization remains pending.'),
  'M5.2 final stream synchronization boundary missing'
);

console.log('M5.2 runtime and Production acceptance state preserved: PASS');
for (const [coreId, branch] of Object.entries({
  platformRuntime: 'feature/platform-core',
  trip: 'feature/trip-core',
  places: 'feature/places-core',
  booking: 'feature/booking-core',
  media: 'feature/media-core',
  memory: 'feature/memory-core',
  identity: 'feature/identity-core',
  events: 'feature/events-core',
  journeyTimeline: 'feature/journey-core',
  experience: 'feature/experience-core',
  intelligence: 'feature/intelligence-core',
  collaborationMembership: 'feature/collaboration-core',
  socialExperienceGraph: 'feature/social-experience-graph',
  attentionNotificationIntent: 'feature/attention-core',
  travelWalletDocuments: 'feature/travel-wallet-core',
  reviewsReputation: 'feature/reviews-core',
  adminGovernance: 'feature/admin-core'
})) {
  assert.strictEqual(
    cores.cores[coreId].ownerStream,
    branch,
    `Core/stream owner mismatch for ${coreId}`
  );
}
assert.strictEqual(cores.cores.adminGovernance.status, 'reserved-mandatory');
assert.strictEqual(cores.cores.adminGovernance.plannedPublicContract, 'admin.governance.v1');
assert.strictEqual(cores.cores.adminGovernance.plannedAuditContract, 'admin.audit.v1');
console.log('Streams: 20');
console.log('Experience Core boundary: PASS');
console.log('Intelligence Core boundary: PASS');
console.log('Timeline reservation: PASS');
console.log('M5.1h completed state preserved: PASS');

/* NFR-0 CLOSEOUT REGISTRY BEGIN */
(() => {
  const _nfrFs = require('fs');
  const _nfrPath = require('path');
  const _nfrRoot = process.cwd();

  const _nfrRead = (relative) =>
    _nfrFs.readFileSync(
      _nfrPath.join(
        _nfrRoot,
        relative
      ),
      'utf8'
    );

  const _nfrRequired = [
    'CURRENT-BUILD.md',
    'RELEASE-NOTES-NFR-0.md',
    'TEST-RESULTS-NFR-0.md',
    'docs/architecture/MIGRATION-STATE.md',
    'docs/modularization/PCR-NFR-0-NATIVE-FIRST-READY.md'
  ];

  for (const relative of _nfrRequired) {
    if (
      !_nfrFs.existsSync(
        _nfrPath.join(
          _nfrRoot,
          relative
        )
      )
    ) {
      throw new Error(
        'NFR-0 closeout required file missing: ' +
        relative
      );
    }
  }

  const current =
    _nfrRead(
      'CURRENT-BUILD.md'
    );

  const release =
    _nfrRead(
      'RELEASE-NOTES-NFR-0.md'
    );

  const tests =
    _nfrRead(
      'TEST-RESULTS-NFR-0.md'
    );

  const migration =
    _nfrRead(
      'docs/architecture/MIGRATION-STATE.md'
    );

  const pcr =
    _nfrRead(
      'docs/modularization/PCR-NFR-0-NATIVE-FIRST-READY.md'
    );

  const requiredCurrent = [
    'NFR-0 Native First Ready',
    'COMPLETE / CLOSED',
    '13.82.11',
    '4.82.11',
    'c57aec1912578e3b4e5ea31e1a8e9f4ed5b75a27',
    'M5.3'
  ];

  for (const marker of requiredCurrent) {
    if (!current.includes(marker)) {
      throw new Error(
        'NFR-0 CURRENT-BUILD marker missing: ' +
        marker
      );
    }
  }

  for (const marker of [
    'a64e6c0fd3bd5954fe29571f8c4ea128f265a201',
    'c57aec1912578e3b4e5ea31e1a8e9f4ed5b75a27',
    '13.82.11',
    '4.82.11',
    'Static Asset Privacy',
    'Native First'
  ]) {
    if (!release.includes(marker)) {
      throw new Error(
        'NFR-0 Release Notes marker missing: ' +
        marker
      );
    }
  }

  for (const marker of [
    '3 / 3',
    '33 / 33',
    '7 / 7',
    '5 / 5',
    'Authenticated Production Browser Smoke',
    'PASS'
  ]) {
    if (!tests.includes(marker)) {
      throw new Error(
        'NFR-0 Test Results marker missing: ' +
        marker
      );
    }
  }

  for (const marker of [
    'NFR-0',
    'Native First Ready',
    'M5.3',
    'c57aec1912578e3b4e5ea31e1a8e9f4ed5b75a27'
  ]) {
    if (!migration.includes(marker)) {
      throw new Error(
        'NFR-0 Migration State marker missing: ' +
        marker
      );
    }
  }

  for (const marker of [
    '546',
    '8008',
    '186',
    '3149',
    '16',
    'Static Asset Exposure',
    'window.LuviaTripContractV1',
    'M5.3'
  ]) {
    if (!pcr.includes(marker)) {
      throw new Error(
        'NFR-0 PCR marker missing: ' +
        marker
      );
    }
  }

  console.log(
    'PASS NFR-0 closeout registry'
  );
})();
/* NFR-0 CLOSEOUT REGISTRY END */

/* M5.3 CLOSEOUT REGISTRY BEGIN */
(() => {
  const _m53Fs = require('fs');
  const _m53Path = require('path');
  const _m53Root = process.cwd();

  const _m53Read = (relative) =>
    _m53Fs.readFileSync(
      _m53Path.join(
        _m53Root,
        relative
      ),
      'utf8'
    );

  const _m53Required = [
    'CURRENT-BUILD.md',
    'RELEASE-NOTES-M5.3.md',
    'TEST-RESULTS-M5.3.md',
    'docs/architecture/MIGRATION-STATE.md',
    'docs/modularization/PCR-M5.3-ACTIVE-TRIP-CONTEXT.md'
  ];

  for (const relative of _m53Required) {
    if (
      !_m53Fs.existsSync(
        _m53Path.join(
          _m53Root,
          relative
        )
      )
    ) {
      throw new Error(
        'M5.3 closeout required file missing: ' +
        relative
      );
    }
  }

  const current =
    _m53Read('CURRENT-BUILD.md');

  const release =
    _m53Read('RELEASE-NOTES-M5.3.md');

  const tests =
    _m53Read('TEST-RESULTS-M5.3.md');

  const migration =
    _m53Read('docs/architecture/MIGRATION-STATE.md');

  const pcr =
    _m53Read('docs/modularization/PCR-M5.3-ACTIVE-TRIP-CONTEXT.md');

  for (const marker of [
    'M5.3 Active Trip Context Closeout',
    '13.82.12',
    '4.82.12',
    '1dc39b0b034e09aebfab3737598c2f2ac393cacd',
    '34 / 34 PASS',
    'COMPLETE / CLOSED only after final 8 / 8 synchronization'
  ]) {
    if (!current.includes(marker)) {
      throw new Error(
        'M5.3 CURRENT-BUILD marker missing: ' +
        marker
      );
    }
  }

  for (const marker of [
    'M5.3 Active Trip Context',
    '464ec0b48306beb40ec05f8c8c5f966e19d22c90',
    'abbe3334d08cd30ac5cd82c80cb7e2ff953dcc29',
    '1dc39b0b034e09aebfab3737598c2f2ac393cacd',
    'web-runtime-compatibility',
    'Static Asset Privacy',
    'Production F5 module-order / continuity proof',
    'M5.4'
  ]) {
    if (!release.includes(marker)) {
      throw new Error(
        'M5.3 Release Notes marker missing: ' +
        marker
      );
    }
  }

  for (const marker of [
    '2 / 2 PASS',
    '3 / 3 PASS',
    '34 / 34 PASS',
    '7 / 7 PASS',
    '5 / 5 PASS',
    'Authenticated Production Browser Smoke',
    'F5 Module-Order Proof: PASS'
  ]) {
    if (!tests.includes(marker)) {
      throw new Error(
        'M5.3 Test Results marker missing: ' +
        marker
      );
    }
  }

  for (const marker of [
    'M5.3 runtime and Production acceptance is COMPLETE.',
    'core/trips/active-trip-context.mjs',
    'core/context/travel-context-service.js',
    'web-runtime-compatibility',
    'all eight active streams',
    'M5.4'
  ]) {
    if (!migration.includes(marker)) {
      throw new Error(
        'M5.3 Migration State marker missing: ' +
        marker
      );
    }
  }

  for (const marker of [
    'runtime-neutral Active Trip Context',
    'TripStore remains Trip Truth',
    'window.LuviaTripContext',
    'window.LuviaTripContractV1',
    'core/context/travel-context-service.js',
    'boot-order risk',
    'M5.4'
  ]) {
    if (!pcr.includes(marker)) {
      throw new Error(
        'M5.3 PCR marker missing: ' +
        marker
      );
    }
  }

  console.log(
    'PASS M5.3 closeout registry'
  );
})();
/* M5.3 CLOSEOUT REGISTRY END */

/* M5.4.2 closeout registry */
{
  const fsM542 = require('fs');
  const pathM542 = require('path');

  const rootM542 = process.cwd();

  const currentM542 = fsM542.readFileSync(
    pathM542.join(rootM542, 'CURRENT-BUILD.md'),
    'utf8'
  );

  const releaseM542 = fsM542.readFileSync(
    pathM542.join(rootM542, 'RELEASE-NOTES-M5.4.2.md'),
    'utf8'
  );

  const testsM542 = fsM542.readFileSync(
    pathM542.join(rootM542, 'TEST-RESULTS-M5.4.2.md'),
    'utf8'
  );

  const migrationM542 = fsM542.readFileSync(
    pathM542.join(rootM542, 'docs', 'architecture', 'MIGRATION-STATE.md'),
    'utf8'
  );

  const pcrM542 = fsM542.readFileSync(
    pathM542.join(
      rootM542,
      'docs',
      'modularization',
      'PCR-M5.4.2-RUNTIME-BOOTSTRAP-TRIP-BOUNDARY.md'
    ),
    'utf8'
  );

  const runtimeCommitM542 =
    '5b6af89ba061e9638fc12be3268767e6d681c1b9';

  const closeoutTextM542 =
    'M5.4.2 Runtime / Bootstrap Trip Boundary';

  if (
    !currentM542.includes(closeoutTextM542) ||
    !currentM542.includes(runtimeCommitM542)
  ) {
    throw new Error(
      'M5.4.2 CURRENT-BUILD closeout registry mismatch'
    );
  }

  if (
    !releaseM542.includes(runtimeCommitM542) ||
    !releaseM542.includes('Safe Regression: 36 / 36 PASS')
  ) {
    throw new Error(
      'M5.4.2 Release Notes registry mismatch'
    );
  }

  if (
    !testsM542.includes(runtimeCommitM542) ||
    !testsM542.includes('Passed: 36') ||
    !testsM542.includes('Failed: 0')
  ) {
    throw new Error(
      'M5.4.2 Test Results registry mismatch'
    );
  }

  if (
    !migrationM542.includes(closeoutTextM542) ||
    !migrationM542.includes(runtimeCommitM542)
  ) {
    throw new Error(
      'M5.4.2 Migration State registry mismatch'
    );
  }

  if (
    !pcrM542.includes(runtimeCommitM542) ||
    !pcrM542.includes('M5.4 remains IN PROGRESS')
  ) {
    throw new Error(
      'M5.4.2 PCR registry mismatch'
    );
  }

  console.log('PASS M5.4.2 closeout registry');
}

// M5.4.3 Active TripStore Consumer Isolation closeout guardrail
{
  const fsM543 = require('fs');
  const pathM543 = require('path');
  const rootM543 = process.cwd();
  const readM543 = relative => fsM543.readFileSync(pathM543.join(rootM543, ...relative.split('/')), 'utf8');
  const assertM543 = (condition, message) => { if (!condition) throw new Error(message); };

  const currentM543 = readM543('CURRENT-BUILD.md');
  const releaseM543 = readM543('RELEASE-NOTES-M5.4.3.md');
  const resultsM543 = readM543('TEST-RESULTS-M5.4.3.md');
  const migrationM543 = readM543('docs/architecture/MIGRATION-STATE.md');
  const pcrM543 = readM543('docs/modularization/PCR-M5.4.3-ACTIVE-TRIPSTORE-CONSUMER-ISOLATION.md');
  const safeM543 = readM543('tests/run-m4.3-safe-regression.cjs');
  const joinM543 = readM543('core/trips/join-flow.js');
  const creatorM543 = readM543('core/trips/trip-creator.js');
  const experienceM543 = readM543('core/trips/trip-experience.js');
  const timelineM543 = readM543('core/places/timeline-core.js');
  const adapterM543 = readM543('core/platform/trip-contract-adapter.js');

  assertM543(currentM543.includes('M5.4.3 Active TripStore Consumer Isolation — COMPLETE / CLOSED'), 'CURRENT-BUILD missing M5.4.3 closeout');
  assertM543(releaseM543.includes('cf4a6b32c0ef11f4ac798766a38996bd4973e5b3'), 'Release Notes missing M5.4.3 runtime commit');
  assertM543(resultsM543.includes('Safe Regression: 37/37 PASS'), 'Test Results missing 37/37 evidence');
  assertM543(migrationM543.includes('M5.4.3 — Active TripStore Consumer Isolation — CLOSED'), 'Migration State missing M5.4.3 closeout');
  assertM543(pcrM543.includes('Active non-owner direct private Store references: 6 -> 0'), 'PCR missing M5.4.3 isolation result');
  assertM543(safeM543.includes('tests/m5.4.3-active-tripstore-consumer-isolation.test.cjs'), 'Safe harness missing M5.4.3 test');

  assertM543(!joinM543.includes('LuviaTripStore'), 'Join Flow private TripStore debt regressed');
  assertM543(!creatorM543.includes('LuviaTripStore'), 'Trip Creator private TripStore debt regressed');
  assertM543(!experienceM543.includes('LuviaTripStore'), 'Trip Experience private TripStore debt regressed');
  assertM543(!timelineM543.includes('LuviaTripStore'), 'Timeline private TripStore debt regressed');
  assertM543(adapterM543.includes('function commitTripSnapshot(trip,options={})'), 'Trip owner command boundary missing commitTripSnapshot');

  console.log('PASS M5.4.3 closeout registry');
}


// M5.4 FINAL closeout evidence
{
  const fs = require('fs');

  const currentBuild = fs.readFileSync('CURRENT-BUILD.md', 'utf8');
  const release = fs.readFileSync('RELEASE-NOTES-M5.4.md', 'utf8');
  const results = fs.readFileSync('TEST-RESULTS-M5.4.md', 'utf8');
  const migration = fs.readFileSync('docs/architecture/MIGRATION-STATE.md', 'utf8');
  const pcr = fs.readFileSync('docs/modularization/PCR-M5.4-FINAL-TRIP-WEB-COMPATIBILITY-BOUNDARY.md', 'utf8');

  for (const token of [
    'M5.4 FINAL',
    '13.82.13',
    '4.82.13',
    '4c1827aa122ae5ba91b4ada845ad919fd273edf4',
    'TripStateReaderV1',
    'COMPLETE / CLOSED'
  ]) {
    assert(currentBuild.includes(token), `CURRENT-BUILD missing M5.4 FINAL token: ${token}`);
    assert(release.includes(token), `Release Notes missing M5.4 FINAL token: ${token}`);
  }

  for (const token of [
    '38/38 PASS',
    '25/25 PASS',
    'Production',
    'Static privacy'
  ]) {
    assert(results.includes(token), `Test Results missing token: ${token}`);
  }

  assert(
    migration.includes('M5 overall: **IN PROGRESS**'),
    'Migration state must keep M5 open after M5.4 closeout'
  );

  assert(
    pcr.includes('physical Trip Core isolation'),
    'PCR must identify physical Trip Core isolation as next M5 exit work'
  );
}

// M5 FINAL Physical Trip Core Isolation closeout guardrail
{
  const fsM5Final = require('fs');
  const pathM5Final = require('path');

  const rootM5Final =
    process.cwd();

  const readM5Final =
    relative =>
      fsM5Final.readFileSync(
        pathM5Final.join(
          rootM5Final,
          ...relative.split('/')
        ),
        'utf8'
      );

  const assertM5Final =
    (
      condition,
      message
    ) => {
      if (!condition) {
        throw new Error(
          message
        );
      }
    };


  const currentM5Final =
    readM5Final(
      'CURRENT-BUILD.md'
    );

  const releaseM5Final =
    readM5Final(
      'RELEASE-NOTES-M5.md'
    );

  const resultsM5Final =
    readM5Final(
      'TEST-RESULTS-M5.md'
    );

  const migrationM5Final =
    readM5Final(
      'docs/architecture/MIGRATION-STATE.md'
    );

  const pcrM5Final =
    readM5Final(
      'docs/modularization/PCR-M5-FINAL-PHYSICAL-TRIP-CORE-ISOLATION.md'
    );

  const stateCoreM5Final =
    readM5Final(
      'core/trips/trip-state-core.js'
    );

  const storeM5Final =
    readM5Final(
      'core/trips/trip-store.js'
    );

  const indexM5Final =
    readM5Final(
      'index.html'
    );

  const safeM5Final =
    readM5Final(
      'tests/run-m4.3-safe-regression.cjs'
    );


  for (
    const token
    of [
      'M5 COMPLETE / CLOSED',
      '13.82.14',
      '4.82.14',
      '579e72c9419fc4456ce724bc63ba15d8f24233c7',
      'd3a13e829ea1eca4fbbeff38b16ecf52e2eec58e',
      'M5 FINAL — Physical Trip Core Isolation'
    ]
  ) {
    assertM5Final(
      currentM5Final.includes(
        token
      ),
      'CURRENT-BUILD missing M5 FINAL token: ' +
        token
    );
  }


  for (
    const token
    of [
      'COMPLETE / CLOSED',
      '579e72c9419fc4456ce724bc63ba15d8f24233c7',
      'd3a13e829ea1eca4fbbeff38b16ecf52e2eec58e',
      '39/39 PASS',
      '11/11 EXACT',
      '25/25 PASS',
      'UI PASS',
      'historical NFR-0 baseline'
    ]
  ) {
    assertM5Final(
      releaseM5Final.includes(
        token
      ),
      'M5 Release Notes missing token: ' +
        token
    );
  }


  for (
    const token
    of [
      '39/39 PASS',
      '11/11 EXACT',
      '25/25 PASS',
      'UI PASS',
      'a6d219beb1b3fa03e63cac43cbc4e30d3d3a4c572349de39037076d93c357a17',
      '22a1573e12c35dc830cf3fa67d6d88e2369e7e10b3798a7d98569aa32867a74d'
    ]
  ) {
    assertM5Final(
      resultsM5Final.includes(
        token
      ),
      'M5 Test Results missing token: ' +
        token
    );
  }


  assertM5Final(
    migrationM5Final.includes(
      'M5 status: **COMPLETE / CLOSED**'
    ),
    'Migration State must close M5'
  );


  assertM5Final(
    pcrM5Final.includes(
      'runtime-neutral'
    ) &&
      pcrM5Final.includes(
        'core/trips/trip-state-core.js'
      ) &&
      pcrM5Final.includes(
        'M5 is COMPLETE / CLOSED'
      ),
    'M5 FINAL PCR architecture / exit evidence missing'
  );


  const browserTokensM5Final =
    /\bwindow\b|\bdocument\b|\blocalStorage\b|\bsessionStorage\b|\bnavigator\b|\bCustomEvent\b|\bdispatchEvent\b|\bfetch\s*\(|\bsupabase\b/i;


  assertM5Final(
    !browserTokensM5Final.test(
      stateCoreM5Final
    ),
    'Physical Trip State Core regressed browser coupling'
  );


  assertM5Final(
    !/let\s+state\s*=/.test(
      storeM5Final
    ),
    'Web Trip Store regressed a second local Trip state'
  );


  assertM5Final(
    /LuviaTripStateReaderV1=Object\.freeze\(\{[\s\S]*?snapshot[\s\S]*?subscribe/.test(
      storeM5Final
    ),
    'Read-only Trip State Reader missing after M5 final closeout'
  );


  const stateCoreLoadM5Final =
    indexM5Final.indexOf(
      'core/trips/trip-state-core.js?v='
    );


  const storeLoadM5Final =
    indexM5Final.indexOf(
      'core/trips/trip-store.js?v='
    );


  assertM5Final(
    stateCoreLoadM5Final >=
      0 &&
      storeLoadM5Final >
        stateCoreLoadM5Final,
    'Physical Trip State Core must load before Web Trip Store'
  );


  assertM5Final(
    safeM5Final.includes(
      'tests/m5-final-physical-trip-core-isolation.test.cjs'
    ),
    'Safe Regression must retain the M5 final physical isolation guardrail'
  );


  console.log(
    'PASS M5 FINAL closeout registry'
  );
}
