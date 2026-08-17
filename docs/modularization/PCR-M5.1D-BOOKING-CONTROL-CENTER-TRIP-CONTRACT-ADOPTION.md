# PCR – M5.1d Booking Control Center Trip Contract Adoption

## Status

COMPLETE.

## Purpose

M5.1d moves Booking Control Center Trip consumption onto the canonical Trip Contract.

Trip Core remains the owner of Trip truth.

Booking Core remains the owner of Booking truth.

## Runtime scope

- `app/control-center/booking-control-center.js`

## Regression scope

- `tests/v13.78.0-booking-control-center-foundation.test.cjs`
- `tests/m5.1d-booking-control-center-trip-contract-adoption.test.cjs`

## Allowed Trip access

- `LuviaTripContractV1`
- compatibility alias `LuviaTripContract`
- `listTrips()`
- `getActiveTrip()`
- `subscribe()`

## Forbidden Trip truth access

- direct `LuviaTripStore`
- `LuviaControlCenterTravelIdentity` as Trip truth
- private `tripSnapshot` truth layer
- legacy Trip events

## Preserved behavior

- Booking Control Center keeps its local selected Trip state.
- Initial selected Trip follows the global active Trip.
- Booking loading continues through Booking Core.
- Timeline / Modify / Cancel ownership does not move.
- Provider-independent Booking behavior remains unchanged.

## Out of scope

- Trip Store owner internals
- Trip Contract adapter internals
- App Shell
- Boot Coordinator
- Trip creation/join/update
- DB migrations
- Supabase Functions
- secrets
- deployment
- Consumer redesign

## Final acceptance evidence

- focused M5.1d regression: **PASS**
- existing Booking Control Center foundation regression: **PASS**
- M5.1c regression: **PASS**
- controlled Safe Regression: **20 / 20 PASS on feature, integration and main release paths**
- forbidden Trip access absent: **PASS**
- syntax check: **PASS**
- `git diff --check`: **PASS**
- exact scope: **PASS**
- normal feature → integration → main promotion: **PASS**
- Integration Preview static verification: **PASS**
- Integration Preview authenticated runtime smoke: **PASS**
- Production deployment/static verification: **PASS**
- Production authenticated runtime smoke: **PASS**
- Production Version ID: 40889bd1-7225-44cf-9475-f73371dfd0d7
- six active streams synchronized to fcfb69e673854bc46cc7c5507cdb0c3946dce0fe: **6 / 6 PASS**

M5 remains IN PROGRESS after M5.1d.
