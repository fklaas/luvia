'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const indexPath = path.join(root, 'index.html');
const manifestPath = path.join(root, 'app', 'luvia-runtime.bundle.manifest.json');
const legacyBundleRelativePath = 'app/luvia-runtime-13.82.156.bundle.js';
const preContextBundleRelativePath = 'app/luvia-runtime-precontext-13.82.156.bundle.js';
const postContextBundleRelativePath = 'app/luvia-runtime-postcontext-13.82.156.bundle.js';
const bundleMarker = 'data-luvia-runtime-bundle="13.82.156"';

const withoutQuery = value => String(value || '').replace(/\?.*$/, '');
const isBundledSource = source => {
  const clean = withoutQuery(source);
  return Boolean(
    clean &&
    !/^https?:\/\//i.test(clean) &&
    !clean.endsWith('.mjs') &&
    !clean.startsWith('vendor/') &&
    clean !== 'intelligence/pwa-service.js' &&
    clean !== legacyBundleRelativePath &&
    clean !== preContextBundleRelativePath &&
    clean !== postContextBundleRelativePath
  );
};

let indexSource = fs.readFileSync(indexPath, 'utf8');
let manifest;
if (fs.existsSync(manifestPath)) {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    .filter(item => !/\btype=["']module["']/.test(item.tag || '') && item.source !== 'app/adapters/identity-platform-web-adapter.js');
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
} else {
  const expression = /<script\b(?<attributes>[^>]*)\bsrc=["'](?<source>[^"']+)["'](?<tail>[^>]*)><\/script>/g;
  manifest = [...indexSource.matchAll(expression)]
    .filter(match => isBundledSource(match.groups.source) && !/\btype=["']module["']/.test(match[0]) && withoutQuery(match.groups.source) !== 'app/adapters/identity-platform-web-adapter.js')
    .map(match => ({ source: withoutQuery(match.groups.source), tag: match[0] }));
  if (!manifest.length) throw new Error('No Luvia runtime sources found in index.html.');
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
}

const sections = manifest.map(item => {
  const absolute = path.resolve(root, item.source);
  const relative = path.relative(root, absolute);
  if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error(`Runtime source escapes root: ${item.source}`);
  if (!fs.existsSync(absolute)) throw new Error(`Runtime source missing: ${item.source}`);
  return `\n/* ===== ${item.source} ===== */\n${fs.readFileSync(absolute, 'utf8')}\n;`;
});
const tripStoreIndex = manifest.findIndex(item => item.source === 'core/trips/trip-store.js');
if (tripStoreIndex < 0) throw new Error('Trip Store boundary missing from runtime manifest.');

const renderBundle = (label, sourceSections) =>
  `/* Generated ${label} by scripts/build-runtime-bundle.cjs. Domain ownership remains in the original source files. */\n${sourceSections.join('\n')}\n`;
const preContextBundle = renderBundle('before LuviaTripContext', sections.slice(0, tripStoreIndex + 1));
const postContextBundle = renderBundle('after LuviaTripContext', sections.slice(tripStoreIndex + 1));
new vm.Script(preContextBundle, { filename: preContextBundleRelativePath });
new vm.Script(postContextBundle, { filename: postContextBundleRelativePath });
fs.writeFileSync(path.join(root, preContextBundleRelativePath), preContextBundle, 'utf8');
fs.writeFileSync(path.join(root, postContextBundleRelativePath), postContextBundle, 'utf8');

if (!indexSource.includes(bundleMarker)) {
  const sourceSet = new Set(manifest.map(item => item.source));
  indexSource = indexSource.replace(/<script\b(?<attributes>[^>]*)\bsrc=["'](?<source>[^"']+)["'](?<tail>[^>]*)><\/script>/g, match => {
    const sourceMatch = match.match(/\bsrc=["']([^"']+)["']/);
    return sourceMatch && sourceSet.has(withoutQuery(sourceMatch[1])) ? '' : match;
  });
  const inertManifest = manifest.map(item => `    ${item.tag}`).join('\n');
  const insertion = `  <template id="luviaRuntimeSourceManifest" hidden aria-hidden="true">\n${inertManifest}\n  </template>\n  <script type="module" src="app/luvia-runtime-loader.mjs?v=13.82.156-split9" ${bundleMarker}></script>\n`;
  indexSource = indexSource.replace('</body>', `${insertion}</body>`);
  fs.writeFileSync(indexPath, indexSource, 'utf8');
}

process.stdout.write(
  `Luvia runtime bundles: ${manifest.length} sources; ` +
  `pre-context=${tripStoreIndex + 1}/${Buffer.byteLength(preContextBundle)} bytes; ` +
  `post-context=${manifest.length - tripStoreIndex - 1}/${Buffer.byteLength(postContextBundle)} bytes\n`
);
