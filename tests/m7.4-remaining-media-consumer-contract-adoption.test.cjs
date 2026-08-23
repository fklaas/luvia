const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const smartPhoto = read('smart-photo-moments.js');
const aiMemory = read('core/media/ai-memory-bridge.js');
const appEntry = read('index.html');
const parisEntry = read('paris-official.html');

assert.doesNotMatch(
  smartPhoto,
  /\bLuviaMediaCore\b/,
  'Smart Photo Moments must not bypass media.v1'
);
assert.doesNotMatch(
  appEntry,
  /smart-photo-moments\.js/,
  'Smart Photo Moments must remain outside the current App entry classification'
);
assert.match(
  parisEntry,
  /smart-photo-moments\.js\?v=13\.82\.25/,
  'The reachable Paris Legacy path must cache-bust the adopted Smart Photo runtime'
);
assert.match(
  smartPhoto,
  /LuviaMediaContractV1\|\|window\.LuviaMediaContract/,
  'Smart Photo Moments must resolve the lazy media.v1 Web binding'
);
assert.match(
  smartPhoto,
  /reads\.listMedia\(\{type:'image'\}\)/,
  'Smart Photo Moments must read images through media.v1'
);
assert.match(
  smartPhoto,
  /reads\?\.signedUrl\?\.\(item\.id,900\)/,
  'Smart Photo Moments must request assets by public Media ID'
);
assert.doesNotMatch(
  smartPhoto,
  /storagePath|storageBucket|previewPath|thumbnailPath|metadata/,
  'Smart Photo Moments must not depend on private Media storage or metadata'
);

assert.doesNotMatch(
  aiMemory,
  /\bLuviaMediaCore\b/,
  'AI Memory must not bypass media.v1'
);
assert.match(
  aiMemory,
  /reads\.listMedia\(\{type:'image'\}\)/,
  'AI Memory context must use the public Media read projection'
);
assert.match(
  aiMemory,
  /commands\.media\.linkPlace\(/,
  'AI Memory place linking must use the public Media command'
);
assert.doesNotMatch(
  aiMemory,
  /\.metadata\??\.resolvedLocation|\.metadata\??\.captureEvidence/,
  'AI Memory must consume sanitized Media evidence fields only'
);

const media = Object.freeze([
  Object.freeze({
    id: 'media-1',
    tripId: 'trip-1',
    participantId: 'user-1',
    type: 'image',
    status: 'ready',
    capturedAt: '2026-08-01T10:00:00.000Z',
    dayKey: '2026-08-01',
    latitude: 48.8584,
    longitude: 2.2945,
    placeId: null,
    captureEvidenceAvailable: true,
    resolvedLocation: Object.freeze({
      name: 'Eiffelturm',
      address: 'Champ de Mars',
      confidence: 0.98
    })
  }),
  Object.freeze({
    id: 'media-2',
    tripId: 'trip-1',
    participantId: 'user-2',
    type: 'image',
    status: 'ready',
    capturedAt: '2026-08-01T10:05:00.000Z',
    dayKey: '2026-08-01',
    latitude: 48.8585,
    longitude: 2.2946,
    placeId: null,
    captureEvidenceAvailable: true,
    resolvedLocation: Object.freeze({
      name: 'Eiffelturm',
      address: 'Champ de Mars',
      confidence: 0.97
    })
  })
]);

const linked = [];
const persisted = [];
const query = () => ({
  upsert(row) {
    persisted.push(row);
    return this;
  },
  select() {
    return this;
  },
  async single() {
    return { data: { id: 'proposal-1' }, error: null };
  }
});

const sandbox = {
  console,
  Date,
  Math,
  crypto: require('node:crypto').webcrypto,
  CustomEvent: class CustomEvent {
    constructor(type, init = {}) {
      this.type = type;
      this.detail = init.detail;
    }
  },
  window: {
    dispatchEvent() {},
    LuviaMediaContractV1: {
      reads: {
        async listMedia() {
          return media;
        }
      },
      commands: {
        media: {
          async linkPlace(...args) {
            linked.push(args);
            return { mediaId: args[0], placeId: args[1] };
          }
        }
      }
    },
    LuviaMediaClustering: {
      async listPersisted() {
        return [{
          id: 'cluster-1',
          title: 'Paris am Morgen',
          kind: 'moment',
          start_at: '2026-08-01T10:00:00.000Z',
          end_at: '2026-08-01T10:05:00.000Z',
          mediaIds: ['media-1', 'media-2']
        }];
      }
    },
    LuviaPlaceCore: {
      getPlaces() {
        return [{
          id: 'place-1',
          name: 'Eiffelturm',
          coordinates: { latitude: 48.8584, longitude: 2.2945 }
        }];
      }
    },
    LuviaTripContractV1: {
      getActiveTrip() {
        return { id: 'trip-1', destination: { name: 'Paris' } };
      },
      getContext() {
        return { activeTripId: 'trip-1' };
      }
    },
    LuviaSupabaseService: {
      getClient() {
        return { from: () => query() };
      }
    },
    ParisAuth: {
      getState() {
        return { user: { id: 'user-1' } };
      }
    },
    LuviaAIEvidence: { put() {} },
    LuviaPlaceLifecycleService: { list: () => [] }
  }
};

Object.assign(sandbox, sandbox.window);
vm.createContext(sandbox);
vm.runInContext(aiMemory, sandbox);

(async () => {
  const bridge = sandbox.window.LuviaAIMemoryBridge;
  assert.ok(bridge, 'AI Memory bridge must register');

  const context = await bridge.buildContext('cluster-1');
  assert.strictEqual(context.media.length, 2);
  assert.strictEqual(context.summary.participantCount, 2);
  assert.strictEqual(context.summary.gpsCount, 2);
  assert.strictEqual(context.media[0].resolvedLocation.name, 'Eiffelturm');
  assert.strictEqual(context.evidenceRefs.length, 5);

  const proposal = {
    id: 'proposal-1',
    clusterId: 'cluster-1',
    tripId: 'trip-1',
    title: 'Paris am Morgen',
    explanation: 'Zwei belegte Fotos.',
    actions: [{
      type: 'link_place',
      placeId: 'place-1',
      confidence: 0.9
    }],
    evidenceRefs: context.evidenceRefs,
    evidenceSummary: context.summary,
    status: 'draft',
    context
  };

  await bridge.apply(proposal, { confirmed: true });

  assert.strictEqual(linked.length, 2);
  assert.deepStrictEqual(
    linked.map(args => args.slice(0, 2)),
    [
      ['media-1', 'place-1'],
      ['media-2', 'place-1']
    ]
  );
  assert.strictEqual(linked[0][2].source, 'ai_memory_bridge');
  assert.strictEqual(persisted.length, 1);
  assert.strictEqual(proposal.status, 'executed');
  assert.strictEqual(bridge.diagnostics().ok, true);

  console.log('M7.4 Remaining Media Consumer Contract Adoption: PASS');
  console.log('Smart Photo / AI Memory direct LuviaMediaCore refs: 8 -> 0');
  console.log('Media reads and place-link commands: media.v1 public boundary');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
