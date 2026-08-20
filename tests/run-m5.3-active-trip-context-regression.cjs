'use strict';

const path = require('path');
const cp = require('child_process');

const root = path.resolve(
  __dirname,
  '..'
);

const tests = [
  'tests/m5.3-active-trip-context-foundation.test.cjs',
  'tests/m5.3-active-trip-context-web-binding.test.cjs',
];

let passed = 0;
let failed = 0;

console.log(
  'M5.3 Active Trip Context Regression'
);

console.log(
  'Tests: ' +
  tests.length
);

for (
  const relative
  of tests
) {
  const result = cp.spawnSync(
    process.execPath,
    [
      path.join(
        root,
        relative
      ),
    ],
    {
      cwd: root,
      encoding: 'utf8',
      windowsHide: true,
    }
  );

  if (
    result.status === 0
  ) {
    passed += 1;

    console.log(
      'PASS ' +
      relative
    );
  } else {
    failed += 1;

    console.log(
      'FAIL ' +
      relative
    );

    if (
      String(
        result.stdout || ''
      ).trim()
    ) {
      console.log(
        String(
          result.stdout
        ).trim()
      );
    }

    if (
      String(
        result.stderr || ''
      ).trim()
    ) {
      console.log(
        String(
          result.stderr
        ).trim()
      );
    }
  }
}

console.log(
  'Total: ' +
  tests.length
);

console.log(
  'Passed: ' +
  passed
);

console.log(
  'Failed: ' +
  failed
);

console.log(
  'Suite: ' +
  (
    failed === 0
      ? 'PASS'
      : 'FAIL'
  )
);

if (failed > 0) {
  process.exitCode = 1;
}
