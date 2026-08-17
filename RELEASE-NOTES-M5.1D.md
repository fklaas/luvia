# RELEASE NOTES – M5.1d

## Release

- App: **13.82.3**
- Core: **4.82.3**
- Milestone: **M5 – Trip Core Isolation**
- Slice: **M5.1d – Booking Control Center Trip Contract Adoption**
- Status at this commit candidate: **IMPLEMENTATION CANDIDATE**
- Production: **NOT YET CLAIMED**

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

This release note does not pre-claim integration, main, preview or production success.

M5 remains **IN PROGRESS** after this slice.