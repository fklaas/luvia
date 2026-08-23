'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const root = path.resolve(__dirname, '..');

const debt = JSON.parse(
  fs.readFileSync(
    path.join(
      root,
      'config/luvia-native-readiness-debt.json'
    ),
    'utf8'
  )
);

const patterns = [
  ['WINDOW', /(?<![A-Za-z0-9_$])window\b/g],
  ['DOCUMENT', /(?<![A-Za-z0-9_$])document\b/g],
  ['NAVIGATOR', /(?<![A-Za-z0-9_$])navigator\b/g],
  ['LOCAL_STORAGE', /(?<![A-Za-z0-9_$])localStorage\b/g],
  ['SESSION_STORAGE', /(?<![A-Za-z0-9_$])sessionStorage\b/g],
  ['INDEXED_DB', /(?<![A-Za-z0-9_$])indexedDB\b/g],
  ['CACHE_STORAGE', /(?<![A-Za-z0-9_$])caches\b/g],
  ['SERVICE_WORKER', /\bserviceWorker\b/g],
  ['LOCATION', /(?<![A-Za-z0-9_$])(?:window\.)?location\b/g],
  ['HISTORY', /(?<![A-Za-z0-9_$])(?:window\.)?history\b/g],
  ['MATCH_MEDIA', /\bmatchMedia\s*\(/g],
  ['GEOLOCATION', /\bgeolocation\b/g],
  ['MEDIA_DEVICES', /\bmediaDevices\b/g],
  ['CLIPBOARD', /\bclipboard\b/g],
  ['SHARE_API', /\bnavigator\.share\b/g],
  ['NOTIFICATION_API', /(?<![A-Za-z0-9_$])Notification\b/g],
  ['ONLINE_STATE', /\bnavigator\.onLine\b/g],
  ['VISIBILITY', /\bvisibilityState\b|\bvisibilitychange\b/g],
  ['DOM_EVENTS', /\baddEventListener\s*\(/g],
  ['DOM_QUERY', /\bquerySelector(?:All)?\s*\(|\bgetElementById\s*\(/g],
  ['REQUEST_ANIMATION_FRAME', /\brequestAnimationFrame\s*\(/g],
  ['FILE_READER', /(?<![A-Za-z0-9_$])FileReader\b/g],
  ['BROADCAST_CHANNEL', /(?<![A-Za-z0-9_$])BroadcastChannel\b/g],
  ['WEB_SOCKET', /(?<![A-Za-z0-9_$])WebSocket\b/g],
  ['EVENT_SOURCE', /(?<![A-Za-z0-9_$])EventSource\b/g],
  ['WEB_CRYPTO', /\bcrypto\.subtle\b/g],
  ['SUPABASE_AUTH', /\.auth\.(?:getSession|getUser|signIn|signOut|onAuthStateChange|refreshSession|setSession)\b/g],
];

function areaFor(file) {
  if (file.startsWith('core/trips/')) return 'TRIP';
  if (file.startsWith('core/booking/')) return 'BOOKING';
  if (file.startsWith('core/places/')) return 'PLACES';
  if (file.startsWith('core/media/')) return 'MEDIA';
  if (file.startsWith('core/identity/')) return 'IDENTITY';
  if (file.startsWith('core/preferences/')) return 'PREFERENCES';
  if (file.startsWith('core/social/')) return 'SOCIAL';
  if (file.startsWith('core/experience/')) return 'EXPERIENCE';
  if (file.startsWith('core/intelligence/')) return 'INTELLIGENCE';
  if (file.startsWith('core/platform/')) return 'PLATFORM';
  if (file.startsWith('core/runtime/')) return 'RUNTIME';
  if (file.startsWith('core/location/')) return 'LOCATION';
  if (file.startsWith('core/services/')) return 'SERVICES';
  if (file.startsWith('core/diagnostics/')) return 'DIAGNOSTICS';
  if (file.startsWith('core/ui/')) return 'LEGACY-UI';
  if (file.startsWith('core/design/')) return 'LEGACY-DESIGN';
  if (file.startsWith('core/legacy/')) return 'LEGACY-CORE';
  if (file.startsWith('core/')) return 'OTHER-CORE';
  if (file.startsWith('intelligence/')) return 'LEGACY-INTELLIGENCE';

  return null;
}

const domainAreas = new Set([
  'TRIP',
  'BOOKING',
  'PLACES',
  'MEDIA',
  'IDENTITY',
  'PREFERENCES',
  'SOCIAL',
  'INTELLIGENCE',
  'PLATFORM',
  'RUNTIME',
  'LOCATION',
  'SERVICES',
  'OTHER-CORE',
  'LEGACY-CORE',
  'LEGACY-INTELLIGENCE',
]);

const output = cp.execFileSync(
  'git',
  [
    '-C',
    root,
    'ls-files',
    '--cached',
    '--others',
    '--exclude-standard',
  ],
  {
    encoding: 'utf8',
  }
);

const files = [
  ...new Set(
    output
      .split(/\r?\n/)
      .map((x) => x.trim())
      .filter(Boolean)
      .map((x) => x.replace(/\\/g, '/'))
  ),
].sort();

const allowed = new Set([
  '.js',
  '.cjs',
  '.mjs',
  '.ts',
  '.tsx',
  '.jsx',
  '.html',
]);

const currentDebt = {};

for (const file of files) {
  if (
    !allowed.has(
      path.extname(file).toLowerCase()
    )
  ) {
    continue;
  }

  const area = areaFor(file);

  if (
    !area ||
    !domainAreas.has(area)
  ) {
    continue;
  }

  const full = path.join(root, file);

  if (!fs.existsSync(full)) {
    continue;
  }

  const text =
    fs.readFileSync(
      full,
      'utf8'
    );

  let total = 0;
  const tokens = {};

  for (
    const [token, regex]
    of patterns
  ) {
    const matches =
      text.match(regex);

    const count =
      matches
        ? matches.length
        : 0;

    tokens[token] = count;
    total += count;
  }

  if (total > 0) {
    currentDebt[file] = {
      area,
      total,
      tokens,
    };
  }
}

for (
  const [file, current]
  of Object.entries(currentDebt)
) {
  const baseline =
    debt.fileTokenBaseline[file];

  assert.ok(
    baseline,
    'New domain browser dependency file detected: ' +
      file
  );

  for (
    const [token, count]
    of Object.entries(current.tokens)
  ) {
    const allowedCount =
      baseline.tokens[token] || 0;

    assert.ok(
      count <= allowedCount,
      'Browser dependency growth detected: ' +
        file +
        ' token=' +
        token +
        ' baseline=' +
        allowedCount +
        ' current=' +
        count
    );
  }
}

const nativeCleanRoots = [
  'core/identity/',
  'core/events/',
  'core/social/',
  'core/intelligence/',
  'core/experience/',
  'core/platform/native/',
];

for (
  const file
  of Object.keys(currentDebt)
) {
  assert.ok(
    !nativeCleanRoots.some(
      (prefix) =>
        file.startsWith(prefix)
    ),
    'Native-clean root gained browser dependency: ' +
      file
  );
}

console.log(
  'PASS Browser Global Domain Guardrail'
);

console.log(
  'PASS Existing browser debt did not grow'
);

console.log(
  'PASS No new browser-coupled Domain file'
);

console.log(
  'PASS Native-clean roots remain browserless'
);
