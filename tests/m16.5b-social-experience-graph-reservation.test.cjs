'use strict';

const assert = require('assert');
const fs = require('fs');

const read = file => fs.readFileSync(file, 'utf8');
const streams = JSON.parse(read('config/luvia-streams.json'));
const cores = JSON.parse(read('config/luvia-cores.json'));
const contract = JSON.parse(read('docs/modularization/contracts/social.v1.json'));
const roadmap = read('ROADMAP-LUVIA-CURRENT.md');
const dependencies = read('docs/architecture/DEPENDENCY-RULES.md');
const ownership = read('docs/modularization/MODULE-OWNERSHIP.md');
const codeowners = read('.github/CODEOWNERS');
const blueprint = read('docs/product/LUVIA-SOCIAL-EXPERIENCE-GRAPH-BLUEPRINT.md');

assert.strictEqual(streams.topologyVersion, '20-stream-core-aligned-v1');
assert.strictEqual(streams.streamCount, 20);
assert.strictEqual(streams.streams.length, 20);

const social = streams.streams.find(stream => stream.id === 'social');
assert.deepStrictEqual(
  { branch: social?.branch, worktree: social?.worktree, kind: social?.kind },
  {
    branch: 'feature/social-experience-graph',
    worktree: '../luvia-social',
    kind: 'core'
  }
);
assert.strictEqual(
  cores.cores.socialExperienceGraph.ownerStream,
  'feature/social-experience-graph'
);
assert.strictEqual(cores.cores.socialExperienceGraph.root, 'core/social/');
assert.strictEqual(
  cores.cores.collaborationMembership.ownerStream,
  'feature/collaboration-core'
);

assert.strictEqual(contract.canonicalDirection, 'social.experience-graph.v1');
assert.strictEqual(contract.ownerStream, 'feature/social-experience-graph');
for (const required of [
  'getTravelTwinEvidence',
  'listEchoes',
  'listExperienceDrops',
  'getTripForkProvenance',
  'getInspirationReceipt'
]) {
  assert(contract.reads.includes(required), `Social contract missing ${required}`);
}

const forbiddenText = contract.forbidden.join('\n');
for (const invariant of [
  'public follower or like counters',
  'endless engagement feed',
  'reinterpret trip_members',
  'Travel DNA',
  'direct Booking provider/table access',
  'precise live-presence',
  'hidden global popularity'
]) {
  assert(forbiddenText.includes(invariant), `Social invariant missing ${invariant}`);
}

for (const token of [
  'M18.6 Social / Experience Graph Core',
  'Social Travel Intelligence Network',
  'Travel Twins',
  'Luvia Echoes',
  'Experience Drops',
  'Fork my Trip',
  'Social Booking',
  'twenty-stream synchronization'
]) {
  assert(roadmap.includes(token), `Roadmap missing ${token}`);
}

assert(dependencies.includes('Social and Collaboration are separate owners'));
assert(ownership.includes('Social / Experience Graph (reserved strategic)'));
assert(codeowners.includes('/core/social/ @fklaas'));
assert(blueprint.includes('no endless engagement feed as the primary product'));
assert(blueprint.includes('Intelligence owns the private inferred Travel DNA'));
assert(blueprint.includes('This blueprint reserves ownership and product direction only'));

console.log('M16.5B Social Experience Graph reservation: PASS');
console.log('Active streams: 20');
console.log('Social / Collaboration ownership: DISTINCT');
console.log('Runtime / persistence mutation: NONE');
