'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const BASELINE_MARKER = '7a3c9349bd725ca0010b901b1006b4926b2be3e4';
const LOCAL_ONLY_ARTIFACTS = new Set([
  'app/luvia-runtime-13.82.120.bundle.js',
  'app/luvia-runtime-postcontext-13.82.120.bundle.js',
  'app/luvia-runtime-precontext-13.82.120.bundle.js',
  'assets/public-landing/reel-cafe-moment.mp4',
  'assets/public-landing/reel-city-tram.mp4',
  'assets/public-landing/reel-coast-cycle.mp4'
]);

const STYLE_EXTENSIONS = new Set(['.css']);
const DOCUMENT_EXTENSIONS = new Set(['.html', '.htm']);
const VECTOR_EXTENSIONS = new Set(['.svg']);
const RASTER_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif', '.ico'
]);
const FONT_EXTENSIONS = new Set(['.woff', '.woff2', '.ttf', '.otf', '.eot']);
const SOURCE_EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx']);
const TEXT_EXTENSIONS = new Set([
  '.css', '.html', '.htm', '.svg', '.js', '.mjs', '.cjs', '.ts', '.tsx',
  '.jsx', '.json', '.webmanifest', '.xml', '.txt', '.md'
]);

const UI_SOURCE_SIGNALS = [
  /\b(?:document|window)\b/,
  /\b(?:innerHTML|outerHTML|insertAdjacentHTML|createElement|classList)\b/,
  /\b(?:render|mount|screen|view|component|template|markup)\b/i,
  /\b(?:overlay|modal|dialog|sheet|popover|toast|tooltip|menu)\b/i,
  /\b(?:hover|focus|blur|pointer|touch|drag|scroll|keypress|keydown|keyup)\b/i,
  /\b(?:animation|transition|motion|easing|keyframes|requestAnimationFrame)\b/i,
  /\b(?:aria-|role=|tabindex|button|input|select|textarea)\b/i,
  /Luvia(?:Experience|Overlay|Navigation|AppShell|UI|Design)/
];

function normalize(relative) {
  return String(relative || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function trackedFiles() {
  const output = execFileSync(
    'git',
    ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
    { cwd: ROOT, encoding: 'utf8' }
  );

  return output
    .split('\0')
    .filter(Boolean)
    .map(normalize)
    .filter(relative => !LOCAL_ONLY_ARTIFACTS.has(relative) && !relative.startsWith('.wrangler/'))
    .sort((a, b) => a.localeCompare(b));
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function canonicalBuffer(relative, buffer) {
  const extension = path.extname(relative).toLowerCase();
  if (!TEXT_EXTENSIONS.has(extension)) return buffer;
  return Buffer.from(
    buffer.toString('utf8').replace(/\r\n?/g, '\n'),
    'utf8'
  );
}

function count(text, pattern) {
  return (String(text).match(pattern) || []).length;
}

function sourceClassifications(relative, text) {
  const classes = [];
  const lower = relative.toLowerCase();

  if (
    lower.startsWith('core/experience/') ||
    lower.startsWith('core/design/') ||
    lower.startsWith('core/ui/') ||
    lower.startsWith('app/adapters/experience-')
  ) {
    classes.push('experience-infrastructure');
  }

  if (
    /\b(?:innerHTML|outerHTML|insertAdjacentHTML|createElement)\b/.test(text) ||
    /<[a-z][\s\S]*?>/i.test(text)
  ) {
    classes.push('dom-rendering-source');
  }

  if (
    /\b(?:click|pointer|touch|drag|scroll|focus|blur|keydown|keyup|keypress)\b/i.test(text)
  ) {
    classes.push('interaction-source');
  }

  if (
    /\b(?:animation|transition|motion|easing|keyframes|requestAnimationFrame)\b/i.test(text)
  ) {
    classes.push('motion-source');
  }

  if (/\b(?:aria-|role=|tabindex|focus-visible|reduced-motion)\b/i.test(text)) {
    classes.push('accessibility-source');
  }

  if (/\b(?:route|screen|navigation|deepLink|navigate)\b/i.test(text)) {
    classes.push('navigation-source');
  }

  if (/\b(?:overlay|modal|dialog|sheet|popover|toast|tooltip|menu)\b/i.test(text)) {
    classes.push('overlay-source');
  }

  return classes;
}

function classify(relative, buffer) {
  const extension = path.extname(relative).toLowerCase();
  const classes = [];
  let text = '';

  if (STYLE_EXTENSIONS.has(extension)) classes.push('stylesheet');
  if (DOCUMENT_EXTENSIONS.has(extension)) classes.push('document-entry');
  if (VECTOR_EXTENSIONS.has(extension)) classes.push('vector-asset');
  if (RASTER_EXTENSIONS.has(extension)) classes.push('raster-asset');
  if (FONT_EXTENSIONS.has(extension)) classes.push('font-asset');

  if (SOURCE_EXTENSIONS.has(extension)) {
    text = buffer.toString('utf8');
    if (UI_SOURCE_SIGNALS.some(pattern => pattern.test(text))) {
      classes.push(...sourceClassifications(relative, text));
      if (!classes.length) classes.push('visual-source-candidate');
    }
  }

  if (STYLE_EXTENSIONS.has(extension) || DOCUMENT_EXTENSIONS.has(extension)) {
    text = buffer.toString('utf8');
  }

  return {
    classes: [...new Set(classes)].sort(),
    text
  };
}

function extractEntryReferences(html) {
  const references = new Set();
  const pattern = /\b(?:src|href)\s*=\s*["']([^"']+)["']/gi;
  let match;

  while ((match = pattern.exec(html))) {
    const raw = match[1];
    if (/^(?:https?:|data:|mailto:|tel:|#)/i.test(raw)) continue;
    const clean = normalize(raw.split(/[?#]/)[0]).replace(/^\//, '');
    if (clean) references.add(clean);
  }

  return [...references].sort((a, b) => a.localeCompare(b));
}

function extractRoutes() {
  const relative = 'core/runtime/navigation-contract-core.js';
  const text = fs.readFileSync(path.join(ROOT, relative), 'utf8');
  const ids = [...text.matchAll(/\{id:'([^']+)'/g)].map(match => match[1]);
  const topLevel = [...text.matchAll(/\{id:'([^']+)'[^\n]*topLevel:true/g)]
    .map(match => match[1]);

  return {
    source: relative,
    ids,
    topLevel
  };
}

function buildInventory() {
  const files = trackedFiles();
  const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const entryReferences = extractEntryReferences(indexHtml);
  const entryReferenceSet = new Set(entryReferences);
  const candidates = [];
  const css = {
    files: 0,
    bytes: 0,
    lines: 0,
    important: 0,
    literalHexColours: 0,
    zIndexDeclarations: 0,
    reducedMotionQueries: 0,
    focusVisibleSelectors: 0
  };

  for (const relative of files) {
    const absolute = path.join(ROOT, ...relative.split('/'));
    const buffer = canonicalBuffer(relative, fs.readFileSync(absolute));
    const { classes, text } = classify(relative, buffer);

    if (entryReferenceSet.has(relative)) {
      classes.push('active-entry-reference');
    }

    if (path.extname(relative).toLowerCase() === '.css') {
      css.files += 1;
      css.bytes += buffer.length;
      css.lines += text ? text.split(/\r?\n/).length : 0;
      css.important += count(text, /!important/g);
      css.literalHexColours += count(text, /#[0-9A-Fa-f]{3,8}\b/g);
      css.zIndexDeclarations += count(text, /z-index\s*:/gi);
      css.reducedMotionQueries += count(text, /prefers-reduced-motion/gi);
      css.focusVisibleSelectors += count(text, /:focus-visible/g);
    }

    if (!classes.length) continue;

    candidates.push({
      path: relative,
      classes,
      bytes: buffer.length,
      sha256: sha256(buffer)
    });
  }

  const candidatePaths = new Set(candidates.map(candidate => candidate.path));
  const unclassifiedEntryReferences = entryReferences.filter(reference => {
    const absolute = path.join(ROOT, ...reference.split('/'));
    return fs.existsSync(absolute) && !candidatePaths.has(reference);
  });

  return {
    schemaVersion: 1,
    milestone: 'M16.5',
    purpose: 'Exhaustive visual, state, interaction and asset inventory input; not an approved design',
    sourceBaselineMarker: BASELINE_MARKER,
    summary: {
      trackedFiles: files.length,
      visualCandidates: candidates.length,
      activeEntryReferences: entryReferences.length,
      unclassifiedEntryReferences: unclassifiedEntryReferences.length,
      css
    },
    routes: extractRoutes(),
    activeEntryReferences: entryReferences,
    unclassifiedEntryReferences,
    candidates
  };
}

function serialize(inventory) {
  return `${JSON.stringify(inventory, null, 2)}\n`;
}

function main() {
  const inventory = buildInventory();
  const writeIndex = process.argv.indexOf('--write');
  const checkIndex = process.argv.indexOf('--check');

  if (writeIndex >= 0) {
    const target = process.argv[writeIndex + 1];
    if (!target) throw new Error('--write requires a repository-relative path');
    fs.writeFileSync(path.resolve(ROOT, target), serialize(inventory), 'utf8');
    console.log(`WROTE ${target}`);
    return;
  }

  if (checkIndex >= 0) {
    const target = process.argv[checkIndex + 1];
    if (!target) throw new Error('--check requires a repository-relative path');
    const expected = serialize(inventory);
    const actual = fs
      .readFileSync(path.resolve(ROOT, target), 'utf8')
      .replace(/\r\n?/g, '\n');
    if (actual !== expected) {
      throw new Error(`Visual inventory is stale: ${target}`);
    }
    console.log(`PASS visual inventory freshness: ${target}`);
    return;
  }

  process.stdout.write(serialize(inventory));
}

if (require.main === module) main();

module.exports = {
  buildInventory,
  serialize
};
