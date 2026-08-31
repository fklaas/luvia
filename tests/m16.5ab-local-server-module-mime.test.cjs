const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'scripts', 'luvia-local-server.cjs'), 'utf8');

assert(source.includes("'.mjs': 'application/javascript; charset=utf-8'"), 'Local server must deliver ES modules with a JavaScript MIME type.');
assert(source.includes('path.relative(root, candidate)'), 'Local server must keep requests inside the repository root.');
assert(source.includes("'Cache-Control': 'no-store'"), 'Local QA must not hide current source behind a browser cache.');

console.log('M16.5AB local ES-module server MIME boundary: PASS');
