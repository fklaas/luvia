# RELEASE NOTES – M5.1d

## Release

- App: **13.82.3**
- Core: **4.82.3**
- Milestone: **M5 – Trip Core Isolation**
- Slice: **M5.1d – Booking Control Center Trip Contract Adoption**
- Status: **COMPLETE**
- Production: **PASS / VERIFIED**

## Purpose

M5.1d moves Booking Control Center Trip consumption from legacy Trip truth paths onto the canonical Trip Contract.

Trip Core remains the owner of Trip truth.

Booking Core remains the owner of Booking truth.

## Runtime change

pp/control-center/booking-control-center.js now consumes:

- LuviaTripContractV1
- compatibility alias LuviaTripContract
- listTrips()
- getActiveTrip()
- subscribe()

Removed from the Booking Control Center:

- direct LuviaTripStore reads
- direct LuviaTripStore subscription
- LuviaControlCenterTravelIdentity as Trip truth fallback
- private 	ripSnapshot Trip truth helper

## Preserved boundaries

No ownership change was made to:

- Booking lifecycle
- Booking timeline
- Modify
- Cancel
- provider routing
- reservation truth
- Booking messages

These remain Booking Core concerns.

## Regression coverage

A dedicated evergreen test was added:

	ests/m5.1d-booking-control-center-trip-contract-adoption.test.cjs

The test was added to:

	ests/run-m4.3-safe-regression.cjs

Controlled Safe Regression target for this release:

- Total: **20**
- Passed: **20**
- Failed: **0**

## Infrastructure

No database migration.

No Supabase Edge Function change.

No secret change.

No provider configuration change.

## Promotion

Required flow remains:

eature/platform-core -> integration -> controlled regression -> integration preview -> main -> production

## Final promotion evidence

- Feature implementation commit: e03edaa79b26bfb2fa366d3578e7e205956cd92b
- Integration merge commit: 41fc679ccc2ed6ee1db6710e68fa2f96fb2e34d7
- Main merge / Production Main commit: cfb69e673854bc46cc7c5507cdb0c3946dce0fe
- Integration controlled regression: **20 / 20 PASS**
- Main controlled regression: **20 / 20 PASS**
- Integration Preview static verification: **PASS**
- Integration Preview authenticated Booking Control Center runtime smoke: **PASS**
- Production deployment: **PASS**
- Cloudflare Production Version ID: 40889bd1-7225-44cf-9475-f73371dfd0d7
- Production static verification: **PASS**
- Production authenticated Booking Control Center runtime smoke: **PASS**
- Production console: **0 visible errors / 0 visible warnings**
- Final active-stream synchronization: **6 / 6 PASS**
- Final synchronized commit across all active streams: cfb69e673854bc46cc7c5507cdb0c3946dce0fe

No Booking mutation was executed during Preview or Production runtime verification.

M5.1d is **COMPLETE**.

M5 remains **IN PROGRESS**.

M5 remains **IN PROGRESS** after this slice.