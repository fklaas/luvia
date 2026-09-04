'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {
  buildInventory,
  serialize
} = require('../scripts/m16.5-visual-surface-inventory.cjs');

const ROOT = path.resolve(__dirname, '..');
const TARGET = path.join(ROOT, 'config', 'luvia-visual-surface-inventory.json');
const expected = buildInventory();
const actualText = fs.readFileSync(TARGET, 'utf8').replace(/\r\n?/g, '\n');
const actual = JSON.parse(actualText);

assert.strictEqual(actualText, serialize(expected), 'M16.5 visual inventory is stale');
assert.strictEqual(actual.schemaVersion, 1);
assert.strictEqual(actual.milestone, 'M16.5');
assert(actual.summary.trackedFiles > 1000, 'Tracked-file inventory is unexpectedly small');
assert(actual.summary.visualCandidates > 100, 'Visual candidate inventory is unexpectedly small');
assert.strictEqual(actual.summary.css.files, 65, 'M16.5 CSS baseline file count changed unexpectedly');
assert.strictEqual(actual.summary.css.bytes, 1633939, 'M16.5 canonical LF CSS baseline byte count changed unexpectedly');
assert.strictEqual(actual.summary.css.important, 3873, 'M16.5 !important baseline changed unexpectedly');
assert.strictEqual(actual.summary.css.literalHexColours, 4277, 'M16.5 literal colour baseline changed unexpectedly');
assert.strictEqual(actual.summary.css.zIndexDeclarations, 519, 'M16.5 z-index baseline changed unexpectedly');
assert.strictEqual(actual.summary.unclassifiedEntryReferences, 0, 'Active index asset escaped visual classification');
assert.deepStrictEqual(actual.routes.topLevel, ['today', 'plan', 'trip', 'memories', 'more']);

for (const requiredPath of [
  'index.html',
  'app/app-shell.js',
  'app/public-landing.css',
  'app/public-landing-experience-motion.css',
  'app/first-trip-composer.css',
  'app/places/places-spatial-experience.js',
  'app/places/places-spatial-experience.css',
  'core/experience/experience-contract-core.js',
  'core/ui/ui-manager.js',
  'ambient.css'
]) {
  assert(
    actual.candidates.some(candidate => candidate.path === requiredPath),
    `Visual inventory missing ${requiredPath}`
  );
}

console.log('M16.5 exhaustive visual surface inventory: PASS');
console.log(`Tracked files: ${actual.summary.trackedFiles}`);
console.log(`Visual candidates: ${actual.summary.visualCandidates}`);
console.log(`CSS files: ${actual.summary.css.files}`);
