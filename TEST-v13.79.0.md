# Tests – v13.79.0

## Automated release gates
Run from project root:

```bash
node tests/v13.79.0-booking-inbox-conversations.test.cjs
node tests/v13.79.0-booking-core-conversation-seam.test.cjs
node tests/v13.78.0-product-module-regression.test.cjs
node tests/v13.78.0-booking-control-center-foundation.test.cjs
node tests/v13.77.0-control-center-home-travel-identity.test.cjs
```

## Provider regressions
```bash
node tests/booking-thefork-adapter-v13.41.0.test.cjs
node tests/booking-quandoo-adapter-v13.42.0.test.cjs
node tests/booking-opentable-adapter-v13.44.0.test.cjs
node tests/booking-sevenrooms-adapter-v13.45.0.test.cjs
node tests/booking-resy-adapter-v13.46.0.test.cjs
node tests/booking-tock-adapter-v13.47.0.test.cjs
```

## Syntax gates
```bash
node --check app/control-center/booking-inbox.js
node --check app/control-center/booking-control-center.js
node --check app/control-center/control-center-home.js
node --check app/control-center/control-center-manifest.js
node --check core/booking/booking-integration.js
node --check core/diagnostics/product-module-diagnostics.js
node --check app/app-shell.js
node --check intelligence/kernel/version.js
node --check sw.js
```

## Manual production tests
Use the detailed checklist in `DEPLOYMENT-v13.79.0.md`.

## Historic test note
`tests/v13.76.0-control-center-global-product-module-foundation.test.cjs` contains a hard-coded Core 4.76.0 assertion and therefore intentionally fails on later valid builds. Its architectural guarantees are covered by the v13.78 product-module regression gate and the v13.79 release gates. Do not rewrite historical release evidence just to make it green.
