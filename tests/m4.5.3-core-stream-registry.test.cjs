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
  migration.includes('M5.1h is therefore not yet formally scope-locked.'),
  'M5.1h state must remain pending'
);

assert(
  migration.includes('core/places/timeline-core.js'),
  'Timeline reservation missing'
);

console.log('M4.5.3 Core / Stream Registry + Architecture Foundation: PASS');
console.log('Streams: 8');
console.log('Experience Core boundary: PASS');
console.log('Intelligence Core boundary: PASS');
console.log('Timeline reservation: PASS');
console.log('M5.1h pending state preserved: PASS');
