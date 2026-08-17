const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
const runtimePath = path.join(root, 'app', 'memory-worlds-v3.js');

assert.ok(
  fs.existsSync(runtimePath),
  'app/memory-worlds-v3.js must exist'
);

const source = fs.readFileSync(runtimePath, 'utf8');

function count(pattern) {
  return (source.match(pattern) || []).length;
}

const directStore = count(/\bLuviaTripStore\b/g);
const directContext = count(/\bLuviaTripContext\b/g);
const contractV1 = count(/\bLuviaTripContractV1\b/g);
const contractAlias = count(/\bLuviaTripContract\b/g);

assert.strictEqual(
  directStore,
  0,
  `Memory Worlds v3 must not directly access LuviaTripStore; found ${directStore}`
);

assert.strictEqual(
  directContext,
  0,
  `Memory Worlds v3 must not directly access LuviaTripContext; found ${directContext}`
);

assert.ok(
  contractV1 > 0 || contractAlias > 0,
  'Memory Worlds v3 must consume the canonical Trip Contract'
);

assert.ok(
  /subscribe\s*\(/.test(source),
  'Memory Worlds v3 must preserve Trip change observation via contract subscription'
);

assert.ok(
  !/LuviaTripStore\?*\.subscribe/.test(source),
  'Memory Worlds v3 must not subscribe directly to LuviaTripStore'
);

assert.ok(
  /window\.LuviaAlbumsView\s*=\s*Object\.freeze/.test(source),
  'Memory Worlds v3 public runtime registration must remain present'
);

console.log('M5.1f Memory Worlds v3 Trip Contract adoption: PASS');