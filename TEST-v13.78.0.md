# Tests – Luvia v13.78.0 / Core 4.78.0

## 1. Primary release gate

```bash
node tests/v13.78.0-booking-control-center-foundation.test.cjs
```

Expected marker:

```text
LUVIA_V13_78_0_BOOKING_CONTROL_CENTER_FOUNDATION_OK
```

Covers:
- Booking Control Center route is available in the Control Center manifest.
- App shell exposes the dedicated `control-center-bookings` surface.
- Control Center Home routes Booking into the new surface.
- Booking Control Center declares `ownsBookingTruth: false`.
- Booking Control Center declares `providerIndependent: true`.
- Booking Control Center declares Booking Core as its data source.
- The Control Center does **not** query the `bookings` table directly.
- `review_required` is grouped as Attention.
- `awaiting_reply` is grouped as active/in progress.
- `confirmed` is grouped as confirmed.

## 2. Product Module regression gate

```bash
node tests/v13.78.0-product-module-regression.test.cjs
```

Expected marker:

```text
LUVIA_V13_78_0_PRODUCT_MODULE_REGRESSION_OK
```

Covers the v13.76 invariants:
- Control Center remains independently enableable.
- Consumer survives Control Center disable.
- Control Center owns no domain truth.
- Global design scope remains inherited.

## 3. Previous Control Center regression

```bash
node tests/v13.77.0-control-center-home-travel-identity.test.cjs
```

Expected marker:

```text
LUVIA_V13_77_0_CONTROL_CENTER_HOME_TRAVEL_IDENTITY_OK
```

This ensures v13.78 did not break travel identity or Attention foundation.

## 4. Booking provider regressions

```bash
node tests/booking-thefork-adapter-v13.41.0.test.cjs
node tests/booking-quandoo-adapter-v13.42.0.test.cjs
node tests/booking-opentable-adapter-v13.44.0.test.cjs
node tests/booking-sevenrooms-adapter-v13.45.0.test.cjs
node tests/booking-resy-adapter-v13.46.0.test.cjs
node tests/booking-tock-adapter-v13.47.0.test.cjs
```

These verify the new UI foundation did not regress the established provider adapter layer.

## 5. Syntax gates

```bash
node --check app/control-center/booking-control-center.js
node --check app/control-center/control-center-attention-service.js
node --check app/control-center/control-center-home.js
node --check app/control-center/control-center-manifest.js
node --check app/app-shell.js
node --check core/diagnostics/product-module-diagnostics.js
node --check intelligence/kernel/version.js
node --check sw.js
```

## 6. Historical test note

`tests/v13.76.0-control-center-global-product-module-foundation.test.cjs` contains a historical hard-coded assertion for Core `4.76.0`. It therefore fails on any newer valid build solely because the current Core is now `4.78.0`. The historical test was not rewritten. Its architecture invariants are covered by the new v13.78 Product Module regression gate above.

## 7. Production/browser tests

The authenticated Supabase runtime, real booking data, trip switching and Service Worker update must be tested after deployment. Follow `DEPLOYMENT-v13.78.0.md` exactly.
