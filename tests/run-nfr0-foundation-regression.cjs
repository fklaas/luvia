'use strict';

const path = require('path');
const cp = require('child_process');

const tests = [
  'nfr0-native-first-foundation.test.cjs',
  'nfr0-browser-global-domain-guardrail.test.cjs',
  'nfr0-browserless-core-smoke.test.cjs',
];

let passed = 0;
let failed = 0;

for (const test of tests) {
  const result = cp.spawnSync(
    process.execPath,
    [
      path.join(
        __dirname,
        test
      ),
    ],
    {
      cwd: path.resolve(__dirname, '..'),
      encoding: 'utf8',
      windowsHide: true,
    }
  );

  if (result.status === 0) {
    passed += 1;
    console.log(
      'PASS ' + test
    );
  } else {
    failed += 1;

    console.error(
      'FAIL ' +
      test +
      '\n' +
      String(result.stdout || '') +
      String(result.stderr || '')
    );
  }
}

console.log(
  'NFR-0 Foundation Regression'
);

console.log(
  'Total: ' + tests.length
);

console.log(
  'Passed: ' + passed
);

console.log(
  'Failed: ' + failed
);

console.log(
  'Suite: ' +
    (
      failed === 0
        ? 'PASS'
        : 'FAIL'
    )
);

process.exit(
  failed === 0
    ? 0
    : 1
);
