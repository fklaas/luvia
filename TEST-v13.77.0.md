# Tests – Luvia v13.77.0 / Core 4.77.0

## Release gate

```bash
node tests/v13.77.0-control-center-home-travel-identity.test.cjs
```

Covers:
- active trip identity comes from global context;
- upcoming trip derives from global TripStore;
- travel phase/day is inherited from global TravelContext;
- Control Center does not own trip truth;
- booking `review_required` becomes an Attention action;
- Attention service does not own Booking truth.

## Syntax gates

```bash
node --check app/control-center/travel-identity-service.js
node --check app/control-center/control-center-attention-service.js
node --check app/control-center/control-center-home.js
node --check app/control-center/control-center-manifest.js
node --check app/app-shell.js
```

## Booking regressions

```bash
node tests/booking-thefork-adapter-v13.41.0.test.cjs
node tests/booking-quandoo-adapter-v13.42.0.test.cjs
node tests/booking-opentable-adapter-v13.44.0.test.cjs
node tests/booking-sevenrooms-adapter-v13.45.0.test.cjs
node tests/booking-resy-adapter-v13.46.0.test.cjs
node tests/booking-tock-adapter-v13.47.0.test.cjs
```

## Required production browser tests

See `DEPLOYMENT-v13.77.0.md`, sections 6–8. These require the real authenticated browser/runtime and therefore are explicitly separate from local static tests.
