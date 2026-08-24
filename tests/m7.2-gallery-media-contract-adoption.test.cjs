'use strict';

const assert=require('node:assert');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const gallery=read('app/gallery-view.js');
const adapter=read('core/platform/media-contract-adapter.js');
const domain=read('core/media/media-domain-contract-core.js');
const clustering=read('core/media/media-clustering.js');

assert.strictEqual(
  (gallery.match(/window\.LuviaMediaCore/g)||[]).length,
  0,
  'Gallery retains direct private Media Core access'
);

for(const forbidden of [
  /\bLuviaSupabase\b/,
  /\bParisSupabase\b/,
  /\.from\s*\(/,
  /\.rpc\s*\(/,
  /\bmetadata\?\./,
  /\.metadata\b/,
  /\bstoragePath\b/,
  /\bpreviewPath\b/,
  /\bthumbnailPath\b/
]){
  assert(!forbidden.test(gallery),`Gallery retains private Media detail: ${forbidden}`);
}

for(const token of [
  'window.LuviaMediaContractV1',
  'window.LuviaMediaContract',
  'mediaReads().listMedia',
  'mediaReads().getMedia',
  'mediaReads().signedUrl',
  'mediaReads().signedOriginalUrl',
  'mediaReads().listPolaroids',
  'mediaReads().subscribe',
  'mediaCommands().upload',
  'mediaCommands().reanalyze',
  'mediaCommands().toggleFavorite',
  'mediaCommands().setPolaroid',
  'mediaCommands().remove',
  'mediaCommands().saveRenderedPreview',
  'mediaCommands().clearGallery'
]){
  assert(gallery.includes(token),`Gallery missing Media Contract path: ${token}`);
}

assert.strictEqual(
  (gallery.match(/window\.LuviaMediaClustering/g)||[]).length,
  8,
  'M7.2 must not silently migrate Clustering ownership'
);
assert.strictEqual(
  (gallery.match(/window\.LuviaAIMemoryBridge/g)||[]).length,
  3,
  'M7.2 must not silently migrate AI Memory ownership'
);
assert.strictEqual(
  (gallery.match(/window\.LuviaTimelineCore/g)||[]).length,
  0,
  'Gallery must not regain private Timeline/Journey provider access'
);
assert.strictEqual(
  (gallery.match(/window\.LuviaJourneyContractV1/g)||[]).length,
  1,
  'Gallery must remove photo memories through the public journey.v1 boundary'
);

for(const token of [
  "const RUNTIME_VERSION='1.2.0'",
  'async function listPolaroids',
  'async function subscribe(listener)',
  'async saveRenderedPreview',
  'async clearGallery'
]){
  assert(adapter.includes(token),`media.v1 missing additive M7.2 surface: ${token}`);
}

for(const token of [
  'renderedPreviewAvailable',
  'captureEvidenceAvailable',
  'metadataAutoChecked',
  'resolvedLocation:projectResolvedLocation'
]){
  assert(domain.includes(token),`browserless Media projection missing M7.2 field: ${token}`);
}

for(const leak of [
  'storageBucket:text',
  'storagePath:text',
  'previewPath:text',
  'thumbnailPath:text',
  'contentHash:text',
  'metadata:Object.freeze'
]){
  assert(!adapter.includes(leak),`media.v1 exposes private Media detail: ${leak}`);
}

assert(
  clustering.includes('x.resolvedLocation?.name'),
  'Clustering must preserve location naming for sanitized Media projections'
);
assert(
  clustering.includes('if(m.mediaKind)return m.mediaKind'),
  'Clustering must preserve explicit Media kind for sanitized projections'
);

console.log('M7.2 Gallery Media Contract Adoption: PASS');
console.log('Gallery direct LuviaMediaCore refs: 19 -> 0');
console.log('Clustering / AI Memory scope: preserved; Journey uses journey.v1');
console.log('media.v1 runtime surface: 1.2.0');
