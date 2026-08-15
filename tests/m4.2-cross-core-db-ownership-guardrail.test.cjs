'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const MOD = path.join(ROOT, 'docs', 'modularization');

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];

    if (ch === '"') {
      if (quoted && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (ch === ',' && !quoted) {
      row.push(field);
      field = '';
      continue;
    }

    if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && text[i + 1] === '\n') i += 1;
      row.push(field);
      field = '';

      if (row.some(value => value !== '')) rows.push(row);
      row = [];
      continue;
    }

    field += ch;
  }

  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }

  assert(rows.length > 0, 'CSV is empty');

  const [headers, ...body] = rows;
  return body.map(values =>
    Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']))
  );
}

function loadCsv(file) {
  return parseCsv(fs.readFileSync(file, 'utf8'));
}

function normalizeOwner(owner) {
  const value = String(owner || '').trim();

  if (value === 'Media/Memory') return value;
  if (value === 'Identity/Preferences') return value;
  if (value === 'Trip/Places') return value;

  // Legacy must win before Consumer because paths such as
  // Consumer/Root Legacy are historical compatibility code.
  if (/Legacy/.test(value)) return 'Legacy';

  if (/^Platform(?:\/|$)/.test(value)) return 'Platform';
  if (/^Consumer(?:\/|$)/.test(value)) return 'Consumer';
  if (/^Intelligence(?:\/|$)/.test(value)) return 'Intelligence';
  if (/^Booking(?:\/|$)/.test(value)) return 'Booking';
  if (/^Places(?:\/|$)/.test(value)) return 'Places';
  if (/^Trip(?:\/|$)/.test(value)) return 'Trip';

  return value;
}

function ownersCompatible(fileOwner, dbOwner) {
  const fileDomain = normalizeOwner(fileOwner);
  const dbDomain = normalizeOwner(dbOwner);

  if (fileDomain === dbDomain) return true;

  // destinations is intentionally a transitional shared Trip/Places reference.
  if (
    dbDomain === 'Trip/Places' &&
    ['Trip', 'Places', 'Trip/Places'].includes(fileDomain)
  ) {
    return true;
  }

  return false;
}

function compositeKey(file, target) {
  return `${file}\u0000${target}`;
}

function displayKey(value) {
  const [file, target] = value.split('\u0000');
  return `${file} -> ${target}`;
}

function increment(map, key, amount = 1) {
  map.set(key, (map.get(key) || 0) + amount);
}

function total(map) {
  return [...map.values()].reduce((sum, value) => sum + value, 0);
}

const fileOwnership = loadCsv(path.join(MOD, 'FILE-OWNERSHIP.csv'));
const databaseMap = loadCsv(path.join(MOD, 'DATABASE-DOMAIN-MAP.csv'));
const globalInventory = loadCsv(path.join(MOD, 'GLOBAL-ACCESS-INVENTORY.csv'));

const fileOwnerByPath = new Map(fileOwnership.map(row => [row.path, row.owner]));
const dbOwnerByTarget = new Map(databaseMap.map(row => [row.table, row.owner]));

const baselineAccess = globalInventory.filter(row => row.kind === 'supabase_table');

// M1 baseline integrity. This inventory is the historical diff source,
// not a live generated allow-list.
assert.equal(
  baselineAccess.length,
  300,
  'GLOBAL-ACCESS-INVENTORY.csv DB baseline changed unexpectedly'
);

const baselineCross = new Map();
const baselineUnmapped = new Map();

for (const row of baselineAccess) {
  assert(
    fileOwnerByPath.has(row.path),
    `Baseline path has no FILE-OWNERSHIP entry: ${row.path}`
  );

  const key = compositeKey(row.path, row.target);

  if (!dbOwnerByTarget.has(row.target)) {
    increment(baselineUnmapped, key);
    continue;
  }

  if (!ownersCompatible(fileOwnerByPath.get(row.path), dbOwnerByTarget.get(row.target))) {
    increment(baselineCross, key);
  }
}

assert.equal(
  total(baselineCross),
  26,
  'Historical mapped cross-core DB debt changed unexpectedly'
);

assert.equal(
  total(baselineUnmapped),
  39,
  'Historical unmapped DB-object debt changed unexpectedly'
);

// Existing dynamic .from(variable/expression) debt.
//
// Dynamic DB targets cannot be ownership-verified statically. Therefore the
// current patterns are frozen. Their count may decrease, but no pattern may
// appear newly and no existing pattern may grow without an explicit
// architecture change.
const dynamicBaseline = new Map([
  [compositeKey('core/booking/booking-reservation-mutation.js', 'view'), 1],
  [compositeKey('core/context/journey-knowledge-graph.js', 'table'), 1],
  [compositeKey('core/diagnostics/media-readiness.js', 'table'), 1],
  [compositeKey('intelligence/data-layer.js', 'table'), 5],
  [compositeKey('profile-center.js', 't'), 1],
  [compositeKey('supabase/functions/booking-provider-reservation-mutation/index.ts', 'table'), 13],
  [compositeKey('supabase/functions/booking-provider-reservation-mutation/index.ts', 'VIEWS[action]'), 1],
  [compositeKey('supabase/functions/booking-provider-reservation-mutation-status/index.ts', 'TABLES[action]'), 1],
  [compositeKey('supabase/functions/booking-provider-reservation-reconcile/index.ts', 'table'), 3]
]);

assert.equal(total(dynamicBaseline), 27, 'Dynamic DB debt baseline must contain 27 calls');

const trackedOutput = execFileSync(
  'git',
  ['ls-files', '--', '*.js', '*.ts'],
  { cwd: ROOT, encoding: 'utf8' }
).trim();

const trackedFiles = trackedOutput
  ? trackedOutput.split(/\r?\n/).filter(Boolean)
  : [];

const staticCalls = [];
const dynamicCalls = [];

const FROM_RE = /(?<!\.storage)\.from\s*\(/g;
const LITERAL_RE = /^\s*(['"`])([^'"`]+)\1/;
const DYNAMIC_EXPRESSION_RE =
  /^\s*([A-Za-z_$][A-Za-z0-9_$]*(?:\[[^\]]+\])?)/;

for (const relativePath of trackedFiles) {
  const absolutePath = path.join(ROOT, ...relativePath.split('/'));
  if (!fs.existsSync(absolutePath)) continue;

  const source = fs.readFileSync(absolutePath, 'utf8');
  let match;

  while ((match = FROM_RE.exec(source)) !== null) {
    // Array.from(...) is not a Supabase DB call.
    if (source.slice(Math.max(0, match.index - 5), match.index) === 'Array') {
      continue;
    }

    const after = source.slice(match.index + match[0].length);
    const literal = after.match(LITERAL_RE);

    const line =
      source.slice(0, match.index).split('\n').length;

    if (
      literal &&
      !(literal[1] === '`' && literal[2].includes('${'))
    ) {
      staticCalls.push({
        path: relativePath,
        target: literal[2],
        line
      });
      continue;
    }

    const expressionMatch = after.match(DYNAMIC_EXPRESSION_RE);

    dynamicCalls.push({
      path: relativePath,
      expression: expressionMatch ? expressionMatch[1] : '<complex>',
      line
    });
  }
}

const violations = [];
const currentCross = new Map();
const currentUnmapped = new Map();
const currentDynamic = new Map();

for (const call of staticCalls) {
  if (!fileOwnerByPath.has(call.path)) {
    violations.push(
      `${call.path}:${call.line} has DB access but no FILE-OWNERSHIP entry`
    );
    continue;
  }

  const key = compositeKey(call.path, call.target);

  if (!dbOwnerByTarget.has(call.target)) {
    increment(currentUnmapped, key);
    continue;
  }

  const fileOwner = fileOwnerByPath.get(call.path);
  const dbOwner = dbOwnerByTarget.get(call.target);

  if (!ownersCompatible(fileOwner, dbOwner)) {
    increment(currentCross, key);
  }
}

for (const call of dynamicCalls) {
  if (!fileOwnerByPath.has(call.path)) {
    violations.push(
      `${call.path}:${call.line} has dynamic DB access but no FILE-OWNERSHIP entry`
    );
  }

  increment(currentDynamic, compositeKey(call.path, call.expression));
}

function rejectGrowth(current, allowed, label) {
  for (const [key, count] of current.entries()) {
    const allowedCount = allowed.get(key) || 0;

    if (count > allowedCount) {
      violations.push(
        `${label}: ${displayKey(key)} = ${count}, allowed baseline = ${allowedCount}`
      );
    }
  }
}

rejectGrowth(
  currentCross,
  baselineCross,
  'New/increased cross-core direct DB access'
);

rejectGrowth(
  currentUnmapped,
  baselineUnmapped,
  'New/increased unmapped DB-object access'
);

rejectGrowth(
  currentDynamic,
  dynamicBaseline,
  'New/increased dynamic .from(...) access'
);

if (violations.length) {
  assert.fail(
    [
      'M4.2 cross-core DB ownership guardrail failed.',
      '',
      ...violations.map(item => `- ${item}`)
    ].join('\n')
  );
}

console.log(
  [
    'M4.2 cross-core DB ownership guardrail: OK',
    `tracked JS/TS files: ${trackedFiles.length}`,
    `static DB calls: ${staticCalls.length}`,
    `mapped cross-core debt: ${total(currentCross)} / baseline ${total(baselineCross)}`,
    `unmapped DB-object debt: ${total(currentUnmapped)} / baseline ${total(baselineUnmapped)}`,
    `dynamic DB calls: ${dynamicCalls.length} / baseline ${total(dynamicBaseline)}`
  ].join('\n')
);