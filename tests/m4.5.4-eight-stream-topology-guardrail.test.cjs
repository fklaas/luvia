'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const {
  loadStreamRegistry
} = require('../scripts/luvia-stream-registry.cjs');

const ROOT = path.resolve(__dirname, '..');

const {
  registry,
  streams
} = loadStreamRegistry(ROOT);

assert.strictEqual(
  registry.topologyVersion,
  '19-stream-core-aligned-v1',
  'Unexpected topology version'
);

assert.strictEqual(
  streams.length,
  19,
  'Luvia topology must contain exactly nineteen active streams'
);

const byId = new Map(
  streams.map(stream => [stream.id, stream])
);

for (const requiredId of [
  'main',
  'integration',
  'consumer',
  'platform',
  'trip',
  'places',
  'booking',
  'media',
  'memory',
  'identity',
  'events',
  'journey',
  'experience',
  'intelligence',
  'collaboration',
  'attention',
  'travel-wallet',
  'reviews',
  'admin'
]) {
  assert(
    byId.has(requiredId),
    `Missing active stream: ${requiredId}`
  );
}

assert.strictEqual(
  byId.get('experience').branch,
  'feature/experience-core'
);

assert.strictEqual(
  byId.get('experience').worktree,
  '../luvia-experience'
);

assert.strictEqual(
  byId.get('intelligence').branch,
  'feature/intelligence-core'
);

assert.strictEqual(
  byId.get('intelligence').worktree,
  '../luvia-intelligence'
);

assert.strictEqual(
  byId.get('admin').branch,
  'feature/admin-core'
);

assert.strictEqual(
  byId.get('admin').worktree,
  '../luvia-admin'
);

const parallelRules = fs.readFileSync(
  path.join(
    ROOT,
    'docs',
    'modularization',
    'PARALLEL-DEVELOPMENT-RULES.md'
  ),
  'utf8'
);

assert(
  parallelRules.includes('config/luvia-streams.json'),
  'Parallel rules must identify the stream registry as canonical'
);

for (const stream of streams) {
  assert(
    parallelRules.includes(stream.branch),
    `Parallel rules missing active branch ${stream.branch}`
  );
}

assert(
  !parallelRules.includes('## Planned streams after M4'),
  'Stale planned-stream heading remains'
);

assert(
  !parallelRules.includes(
    'Do not create the worktrees/branches from this document yet'
  ),
  'Stale pre-M4 worktree instruction remains'
);

const codeowners = fs.readFileSync(
  path.join(ROOT, '.github', 'CODEOWNERS'),
  'utf8'
);

for (const rule of [
  '/core/experience/ @fklaas',
  '/core/intelligence/ @fklaas',
  '/core/admin/ @fklaas',
  '/core/travel-wallet/ @fklaas',
  '/config/luvia-streams.json @fklaas',
  '/config/luvia-cores.json @fklaas',
  '/scripts/luvia-stream-registry.cjs @fklaas'
]) {
  assert(
    codeowners.includes(rule),
    `CODEOWNERS missing ${rule}`
  );
}

const moduleOwnership = fs.readFileSync(
  path.join(
    ROOT,
    'docs',
    'modularization',
    'MODULE-OWNERSHIP.md'
  ),
  'utf8'
);

assert(
  moduleOwnership.includes('| Experience Core |'),
  'Module ownership missing Experience Core'
);

assert(
  moduleOwnership.includes(
    'Canonical owner root: `core/intelligence/*`'
  ),
  'Module ownership missing active Intelligence owner root'
);

assert(
  moduleOwnership.includes(
    'classification-first'
  ),
  'Module ownership must preserve classification-first AI migration'
);

assert(
  moduleOwnership.includes('| Admin / Governance (mandatory reserved) |'),
  'Module ownership missing mandatory Admin Core boundary'
);

assert(
  moduleOwnership.includes('protect the last Superadmin'),
  'Module ownership missing last-Superadmin protection'
);

console.log(
  'M16.5 core-aligned nineteen-stream topology guardrail: PASS'
);
console.log(`Streams: ${streams.length}`);
console.log('Registry-driven topology: PASS');
console.log('CODEOWNERS alignment: PASS');
console.log('Parallel development rules: PASS');
