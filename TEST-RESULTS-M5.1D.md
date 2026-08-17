# TEST RESULTS – M5.1d

## Release candidate

- App: **13.82.3**
- Core: **4.82.3**
- Slice: **M5.1d – Booking Control Center Trip Contract Adoption**
- Branch: eature/platform-core
- Base HEAD before implementation: $expectedHead

## Implementation gates

- Booking Control Center syntax check: **PASS**
- Forbidden direct Trip access check: **PASS**
- M5.1d focused test: **PASS**
- Booking Control Center foundation regression: **PASS**
- M5.1c Booking Inbox regression: **PASS**
- UTF-8 BOM byte verification: **PASS**
- Exact implementation scope gate: **PASS**
- git diff --check: **PASS**

## Evergreen regression

Expected suite after M5.1d registration:

- Total: **20**
- Passed: **20**
- Failed: **0**

M5.1d must appear explicitly as:

	ests/m5.1d-booking-control-center-trip-contract-adoption.test.cjs

## Repository guardrail baseline

Observed before release-envelope creation:

- mapped cross-core debt: **26 / baseline 26**
- unmapped DB-object debt: **39 / baseline 39**
- dynamic DB calls: **27 / baseline 27**

No debt-growth claim beyond these measured results is made until the final release regression below completes.

## Final promotion and runtime evidence

- feature push: **PASS**
- integration promotion: **PASS**
- integration controlled regression: **20 / 20 PASS**
- integration preview static verification: **PASS**
- authenticated integration Booking Control Center runtime smoke: **PASS**
- main promotion: **PASS**
- main controlled regression: **20 / 20 PASS**
- production deployment: **PASS**
- Production Version ID: 40889bd1-7225-44cf-9475-f73371dfd0d7
- production static verification: **PASS**
- authenticated production Booking Control Center runtime smoke: **PASS**
- production console: **0 visible errors / 0 visible warnings**
- six-stream synchronization: **6 / 6 PASS**

Behavior evidence:

- active global Trip remained Paris Hochzeitstag
- Booking Control Center initially selected the active Paris Trip
- Paris Booking Control Center loaded **24 bookings**
- local Booking Control Center selection changed to Munich without mutating global active Trip
- Munich loaded **0 bookings**
- local selection differed from global active Trip as expected
- returning to Paris restored **24 bookings**
- loading = false
- error = null
- ownsBookingTruth = false
- source = booking-core
- no Booking mutation was executed

Final Production Main commit:

cfb69e673854bc46cc7c5507cdb0c3946dce0fe

M5.1d is **COMPLETE**.

M5 remains **IN PROGRESS**.