'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function walkSource(relativeRoot) {
  const absoluteRoot = path.join(ROOT, relativeRoot);

  if (!fs.existsSync(absoluteRoot)) {
    return [];
  }

  const result = [];

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, {
      withFileTypes: true
    })) {
      const absolute = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        walk(absolute);
        continue;
      }

      if (!/\.(?:js|cjs|mjs|ts|tsx|jsx)$/.test(entry.name)) {
        continue;
      }

      result.push(
        path.relative(ROOT, absolute).replace(/\\/g, '/')
      );
    }
  }

  walk(absoluteRoot);

  return result.sort();
}

function read(relativePath) {
  return fs.readFileSync(
    path.join(ROOT, relativePath),
    'utf8'
  );
}

function loadCsv(relativePath) {
  const text = read(relativePath);
  const lines = text
    .split(/\r?\n/)
    .filter(Boolean);

  const parse = line => {
    const values = [];
    let value = '';
    let quoted = false;

    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];

      if (quoted) {
        if (char === '"' && line[i + 1] === '"') {
          value += '"';
          i += 1;
        } else if (char === '"') {
          quoted = false;
        } else {
          value += char;
        }
      } else if (char === '"') {
        quoted = true;
      } else if (char === ',') {
        values.push(value);
        value = '';
      } else {
        value += char;
      }
    }

    values.push(value);
    return values;
  };

  const headers = parse(lines[0]);

  return lines.slice(1).map(line => {
    const values = parse(line);

    return Object.fromEntries(
      headers.map(
        (header, index) => [header, values[index] ?? '']
      )
    );
  });
}

const cores = JSON.parse(
  read('config/luvia-cores.json')
);

assert.strictEqual(
  cores.cores.experience.truthOwnership,
  'no-domain-truth'
);

assert.strictEqual(
  cores.cores.intelligence.truthOwnership,
  'intelligence-specific-state-only'
);

assert.strictEqual(
  cores.cores.journeyTimeline.status,
  'active'
);

assert.strictEqual(
  cores.cores.journeyTimeline.root,
  'core/journey/'
);

assert.strictEqual(
  cores.cores.journeyTimeline.truthOwnership,
  'derived-day-graph-and-conflict-policy'
);

assert.strictEqual(
  cores.cores.journeyTimeline.legacyCompatibility,
  'core/places/timeline-core.js'
);

assert.strictEqual(
  cores.cores.memory.root,
  'core/memory/'
);

assert.strictEqual(
  cores.cores.memory.truthOwnership,
  'canonical-memory-and-narrative-truth'
);

assert.strictEqual(
  cores.cores.memory.contractAdapter,
  'core/platform/memory-contract-adapter.js'
);

const ownershipRows = loadCsv(
  'docs/modularization/FILE-OWNERSHIP.csv'
);

const ownerByPath = new Map(
  ownershipRows.map(row => [row.path, row.owner])
);

const experienceFiles = walkSource('core/experience');
const intelligenceFiles = walkSource('core/intelligence');

const experienceViolations = [];

for (const file of experienceFiles) {
  const source = read(file);

  const forbidden = [
    ['LuviaTripStore', /LuviaTripStore/g],
    ['LuviaTripContext', /LuviaTripContext/g],
    ['direct Supabase token', /\bsupabase\b/gi],
    ['direct .rpc(...)', /\.rpc\s*\(/g],
    ['direct functions.invoke(...)', /functions\.invoke\s*\(/g]
  ];

  const fromSource = source
    .replace(/\bArray\.from\s*\(/g, 'Array_from(')
    .replace(/\bObject\.fromEntries\s*\(/g, 'Object_fromEntries(');

  if (/(?<!\.storage)\.from\s*\(/g.test(fromSource)) {
    experienceViolations.push(
      `${file}: direct .from(...) access`
    );
  }

  for (const [label, pattern] of forbidden) {
    if (pattern.test(source)) {
      experienceViolations.push(
        `${file}: ${label}`
      );
    }
  }
}

assert.deepStrictEqual(
  experienceViolations,
  [],
  `Experience Core boundary violations:\n${experienceViolations.join('\n')}`
);

const intelligenceViolations = [];
const intelligenceDbFiles = [];

for (const file of intelligenceFiles) {
  const source = read(file);

  if (/LuviaTripStore/g.test(source)) {
    intelligenceViolations.push(
      `${file}: direct LuviaTripStore access`
    );
  }

  if (/LuviaTripContext/g.test(source)) {
    intelligenceViolations.push(
      `${file}: direct LuviaTripContext access`
    );
  }

  const normalized = source
    .replace(/\bArray\.from\s*\(/g, 'Array_from(')
    .replace(/\bObject\.fromEntries\s*\(/g, 'Object_fromEntries(');

  const hasDbishAccess =
    /(?<!\.storage)\.from\s*\(/g.test(normalized) ||
    /\.rpc\s*\(/g.test(source) ||
    /functions\.invoke\s*\(/g.test(source);

  if (hasDbishAccess) {
    intelligenceDbFiles.push(file);

    const owner = ownerByPath.get(file);

    if (!owner || !/^Intelligence(?:\/|$)/.test(owner)) {
      intelligenceViolations.push(
        `${file}: DB/API access requires explicit Intelligence FILE-OWNERSHIP`
      );
    }
  }
}

assert.deepStrictEqual(
  intelligenceViolations,
  [],
  `Intelligence Core boundary violations:\n${intelligenceViolations.join('\n')}`
);

/*
 * Foreign-domain static/dynamic database ownership remains enforced by
 * m4.2-cross-core-db-ownership-guardrail.test.cjs.
 *
 * This test intentionally does NOT scan legacy core/ai/, intelligence/,
 * core/recommendations/ or core/context/. Those roots contain documented
 * migration debt and remain classification-first candidates.
 */

console.log(
  'M4.5.4 Experience / Intelligence boundary guardrail: PASS'
);
console.log(
  `Experience runtime source files scanned: ${experienceFiles.length}`
);
console.log(
  `Intelligence runtime source files scanned: ${intelligenceFiles.length}`
);
console.log(
  `Intelligence DB/API candidate files: ${intelligenceDbFiles.length}`
);
console.log('Journey / Timeline independent Core boundary: PASS');
console.log('Legacy AI roots excluded from automatic reassignment: PASS');
