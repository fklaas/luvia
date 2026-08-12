# Test Results v13.81.4

## New release gates
- `LUVIA_V13_81_4_MUTATION_THREAD_BOOTSTRAP_MOBILE_SURFACE_FETCH_HARDENING_OK` — **PASS**
- `LUVIA_V13_81_4_GREEN_FARMERS_MUTATION_BOOTSTRAP_REGRESSION_OK` — **PASS**
- `LUVIA_V13_81_4_GOOGLE_RESERVE_DISCOVERY_MATRIX_OK` — **PASS**

## Booking evidence regressions
- v13.81 mutation client expected-error bridge — **PASS**
- v13.81 mutation evidence safety — **PASS**
- v13.80 reply safety contract — **PASS**

The v13.81 evidence test was kept compatible with the legacy `email_thread` transport while v13.81.4 adds the explicit `email_thread_bootstrap` transport for newly opened mutation threads. The new release gate also verifies a bootstrap-stable idempotency fingerprint so retrying after a partial send/record failure does not derive a second Resend idempotency key.

## Provider adapter regressions
- TheFork — **PASS**
- Quandoo — **PASS**
- OpenTable — **PASS**
- SevenRooms — **PASS**
- Resy — **PASS**
- Tock — **PASS**

## Syntax / source integrity
- `app/control-center/booking-control-center.js` via `node --check` — **PASS**
- `core/booking/booking-integration.js` via `node --check` — **PASS**
- `booking-contact-resolve/index.ts` local TypeScript parse — **PASS**
- `booking-route-resolve/index.ts` local TypeScript parse — **PASS**
- `booking-email-reply/index.ts` local TypeScript parse — **PASS**
- `index.html` local src/href asset existence check — **PASS** (`216` references, `0` missing)
- local HTTP serving of `index.html` — **PASS**

## Security regression
Redirect identity uses the registrable domain label rather than a loose concatenated host string.

Fixture results:
- `greenfarmers.fr` -> `greenfarmers-vegan.com` — **allowed**
- `greenfarmers.fr` -> `greenfarmers.evil.com` — **rejected**

Generic booking-provider e-mail filtering remains enabled.

## Local browser attempt
A local headless Chromium `--dump-dom` attempt did not reach a stable completed app state before timeout in the container. The static HTTP server itself returned the v13.81.4 index successfully. Because Luvia boot depends on its real browser/auth/runtime environment, this is **not claimed as a passed browser E2E** and is explicitly moved to the Production-Smoke checklist.

## Not claimed as live-tested locally
- production Supabase Edge Runtime crawl of the Green Farmer's website
- real production redirect chain from the Edge runtime
- real Green Farmer's candidate insert/update in Production DB
- real mutation-thread bootstrap against Production DB
- real Resend send/delivery for the new bootstrap path
- real inbound provider response
- real Google Maps Reserve handoff/partner comparison
- physical/mobile browser confirmation that global bottom navigation is absent during the new fullscreen mutation surface
- Cloudflare production cache propagation

These checks are documented step-by-step in `DEPLOYMENT-v13.81.4.md` and `SMOKE-v13.81.4.sql`.
