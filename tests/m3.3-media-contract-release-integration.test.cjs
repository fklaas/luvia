const fs=require('fs');
const path=require('path');
const assert=require('assert');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(
  path.join(root,file),
  'utf8'
);

const version=read(
  'intelligence/kernel/version.js'
);

const index=read(
  'index.html'
);

const sw=read(
  'sw.js'
);

const force=read(
  'force-update.html'
);

const contract=JSON.parse(
  read(
    'docs/modularization/contracts/media.v1.json'
  )
);

const adapter=
  'core/platform/media-contract-adapter.js?v=13.81.7';

assert(
  version.includes("core:'4.81.7'"),
  'core version must be 4.81.7'
);

assert(
  version.includes("build:'13.81.7'"),
  'app build must be 13.81.7'
);

assert(
  index.includes(adapter),
  'index must load M3.3 Media adapter'
);

for(const provider of [
  'core/media/media-core.js?v=13.81.7',
  'core/media/memory-albums.js?v=13.81.7',
  'core/media/memory-journeys.js?v=13.81.7',
  'core/media/memory-cards.js?v=13.81.7'
]){
  assert(
    index.indexOf(provider)<
    index.indexOf(adapter),
    `adapter must load after ${provider}`
  );
}

assert(
  index.indexOf(
    'core/platform/places-contract-adapter.js?v=13.81.7'
  )<
  index.indexOf(adapter),
  'Media adapter must follow Trip/Places contract adapters'
);

assert(
  index.indexOf(adapter)<
  index.indexOf(
    'app/app-shell.js?v=13.81.7'
  ),
  'adapter must be ready before AppShell'
);

assert(
  sw.includes(
    "const CACHE='luvia-shell-v13.81.7'"
  ),
  'service worker cache must target 13.81.7'
);

for(const asset of [
  "'core/media/memory-journeys.js'",
  "'core/media/memory-cards.js'",
  "'core/platform/media-contract-adapter.js'"
]){
  assert(
    sw.includes(asset),
    `service worker must cache ${asset}`
  );
}

assert(
  force.includes('appv=13.81.7'),
  'force-update must target current build'
);

assert.strictEqual(
  contract.contractId,
  'media.v1'
);

assert.strictEqual(
  contract.version,
  '1'
);

assert.strictEqual(
  contract.runtimeImplementationStage,
  'M3.3'
);

assert.strictEqual(
  contract.status,
  'implemented-m3.3'
);

for(const impl of [
  'LuviaMediaCore',
  'LuviaMemoryAlbums',
  'LuviaMemoryCards',
  'LuviaMemoryJourneys',
  'LuviaMediaContractV1'
]){
  assert(
    contract.currentImplementation.includes(impl),
    `contract currentImplementation missing ${impl}`
  );
}

assert(
  contract.runtimeGlobals.includes(
    'LuviaMediaContractV1'
  )
);

assert(
  contract.runtimeGlobals.includes(
    'LuviaMediaContract'
  )
);

assert.strictEqual(
  contract.eventTransport,
  'DOM CustomEvent via luvia:<event-name>; existing compatibility events retained'
);

assert(
  contract.internal.includes(
    'direct OpenAI provider'
  )
);

assert(
  !contract.commands.includes(
    'clearTripGallery'
  ),
  'destructive clearTripGallery must not be public media.v1 command'
);

console.log(
  'M3.3 Media Contract Release Integration: OK'
);