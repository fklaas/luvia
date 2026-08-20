'use strict';

const fs = require('fs');
const assert = require('assert');

const read = path => fs.readFileSync(path, 'utf8');

const streams = JSON.parse(read('config/luvia-streams.json'));
const cores = JSON.parse(read('config/luvia-cores.json'));

const expectedBranches = [
  'main',
  'integration',
  'feature/platform-core',
  'feature/booking-core',
  'feature/consumer-experience',
  'feature/social-experience-graph',
  'feature/experience-core',
  'feature/intelligence-core'
];

assert.strictEqual(streams.schemaVersion, 1);
assert.strictEqual(streams.topologyVersion, '8-stream-v1');
assert.strictEqual(streams.streamCount, 8);
assert.strictEqual(streams.streams.length, 8);

assert.deepStrictEqual(
  streams.streams.map(stream => stream.branch),
  expectedBranches
);

assert.strictEqual(
  new Set(streams.streams.map(stream => stream.branch)).size,
  8
);

assert.strictEqual(
  new Set(streams.streams.map(stream => stream.worktree)).size,
  8
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
  cores.cores.intelligence.plannedPublicContract,
  'LuviaIntelligenceContractV1'
);

assert.strictEqual(
  cores.cores.journeyTimeline.root,
  'core/places/timeline-core.js'
);

assert.strictEqual(
  cores.cores.journeyTimeline.status,
  'reserved'
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
console.log('Streams: 8');
console.log('Experience Core boundary: PASS');
console.log('Intelligence Core boundary: PASS');
console.log('Timeline reservation: PASS');
console.log('M5.1h completed state preserved: PASS');
