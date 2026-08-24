const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
const targets = [
  'app/albums-view.js',
  'app/memory-worlds-v2.js',
  'app/memory-worlds-v3.js',
  'app/memory-worlds-v3.ts',
  'app/memory-export-engine.js',
  'app/memory-export-engine.ts'
];

function source(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function count(value, pattern) {
  return (value.match(pattern) || []).length;
}

let directMediaCore = 0;
for (const file of targets) {
  const value = source(file);
  directMediaCore += count(value, /\bLuviaMediaCore\b/g);

  assert.ok(
    /\bLuviaMediaContractV1\b/.test(value) && /\bLuviaMediaContract\b/.test(value),
    `${file} must resolve the lazy media.v1 runtime contract`
  );
  assert.ok(
    /\.reads\?*\.signedUrl\?*\.\([^,]+\.id\s*,\s*3600\)/.test(value),
    `${file} must request signed assets by public Media ID`
  );
  assert.ok(
    !/signedUrl\?*\.\(\s*(?:item|m)\s*,/.test(value),
    `${file} must not pass a private Media entity across the contract boundary`
  );
}

assert.strictEqual(
  directMediaCore,
  0,
  `M7.3 Memory Experience targets must have zero direct LuviaMediaCore refs; found ${directMediaCore}`
);

const retained = {
  smartPhotoMoments: count(source('smart-photo-moments.js'), /\bLuviaMediaCore\b/g),
  mediaClustering: count(source('core/media/media-clustering.js'), /\bLuviaMediaCore\b/g),
  aiMemory: count(source('core/media/ai-memory-bridge.js'), /\bLuviaMediaCore\b/g),
  memoryOwners: [
    'core/media/memory-albums.js',
    'core/media/memory-cards.js',
    'core/media/memory-journeys.js'
  ].reduce((total, file) => total + count(source(file), /\bLuviaMediaCore\b/g), 0),
  timeline: count(source('core/places/timeline-core.js'), /\bLuviaMediaCore\b/g),
  legacySync: count(source('sync/gallery.js'), /\bLuviaMediaCore\b/g)
};

const memoryProviders = [
  source('core/media/memory-albums.js'),
  source('core/media/memory-cards.js'),
  source('core/media/memory-journeys.js')
];

assert.ok(
  memoryProviders.every((value) => /\bLuviaMemoryRuntimeContextV1\b/.test(value)),
  'M13 Memory providers must use the explicit Memory runtime context boundary'
);
assert.ok(
  /\bLuviaMediaContractV1\b/.test(memoryProviders[0]),
  'M13 Memory Album asset reads must cross the public media.v1 boundary'
);

assert.deepStrictEqual(
  retained,
  {
    smartPhotoMoments: 0,
    mediaClustering: 2,
    aiMemory: 0,
    memoryOwners: 0,
    timeline: 2,
    legacySync: 0
  },
  'Current guards must preserve Media owner and Timeline scopes while enforcing the later M13 Memory boundary'
);

console.log('M7.3 Memory Asset Delivery Contract Adoption: PASS');
console.log('Memory Experience direct LuviaMediaCore refs: 6 -> 0');
console.log('Signed asset boundary: media.v1 ID-only');
console.log('Clustering / Timeline / legacy sync preserved; Memory providers isolated by public contracts');
