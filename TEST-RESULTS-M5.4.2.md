# Luvia Test Results — M5.4.2 Runtime / Bootstrap Trip Boundary

Date: 2026-08-21

## Runtime commit

`5b6af89ba061e9638fc12be3268767e6d681c1b9`

Parent:

`2748c02bdb1497b0460c85630c1fd8c8a5bc76d8`

App/Core:

13.82.12 / 4.82.12

## Feature proof

### Boot Coordinator

- private `LuviaTripStore` references before: 7
- private `LuviaTripStore` references after: 0
- public Trip runtime initialize: PASS
- public Trip runtime loadRemote: PASS
- public `selectActiveTrip`: PASS
- owner `touch/source` option preservation: PASS

### Shared Runtime

- private `LuviaTripStore` references before: 3
- private `LuviaTripStore` references after: 0
- public Trip runtime initialize: PASS
- public Trip runtime loadRemote: PASS

### Owner adapter

- Trip Store remains sole Trip Truth: PASS
- runtime owner surface: PASS
- owner options bridge: PASS
- duplicate Trip Truth introduced: NO
- new Trip cloud write introduced: NO

## Focused regressions

- `tests/m5.4.2-runtime-bootstrap-trip-boundary.test.cjs`: PASS
- `tests/m5.1j-profile-foundation-trip-contract-adoption.test.cjs`: PASS
- `tests/m5.4.1-resolved-destination-trip-command.test.cjs`: PASS
- `tests/m5.4.1b-destination-service-trip-boundary-adoption.test.cjs`: PASS

## Safe Regression

Allowlist: 36

Total: 36
Passed: 36
Failed: 0
Suite: PASS

Included retained architecture gates:
- M3 contracts: PASS
- M5.1 migration preservation: PASS
- M5.2 consumer isolation: PASS
- NFR-0: PASS
- M5.3 Active Trip Context: PASS
- Core Stream Registry: PASS
- Eight Stream Topology: PASS
- Core Boundary Guardrails: PASS
- Cross-Core DB Ownership: PASS

## Integration Preview Evidence

Target:

`5b6af89ba061e9638fc12be3268767e6d681c1b9`

Cloudflare:
- Check ID `96750127577`
- Build `8791679f-d968-4580-809d-9a5c0572cbe8`
- Version `a1fb1cf3-34c3-4d68-b9fc-fb159da95f2d`
- conclusion success

Byte provenance:
- version.js PASS
- trip-contract-adapter.js PASS
- boot-coordinator.js PASS
- runtime.js PASS

Static privacy:
- protected test path HTTP 200 because SPA fallback is active
- response Content-Type text/html
- response byte-identical to index.html
- response not equal to private test source
- private test markers absent
- PASS

Authenticated browser:
- runtime ready
- authenticated
- Active Trip present
- Paris Hochzeitstag / Paris
- Booking Center PASS
- F5 PASS

## Production Evidence

Cloudflare:
- Check ID `96753083232`
- Build `3a51d89b-ae7c-4844-befe-09bf22e98052`
- Version `38c83250-b231-46d6-b573-1e111fcd1d97`
- conclusion success

Production byte hashes:
- index.html `6be9d480f7659559550017f3d1bd550644101e3cbf32a766ed414959d583c63e`
- version.js `6bd816ebb3becab04dab7296f0d41df673b66bf26ac21bd85ce503c0493430db`
- trip-contract-adapter.js `dfb3110f2e94d3f6a1325e345d8548566e9f45cbbed3554ffaf6d66eedd8552b`
- boot-coordinator.js `6b5e1164bb81c4a6ca3f56c0807ad4de5488eeb8343f875563175a47ef7a532a`
- runtime.js `da7ef53d2b222c46fea06563c76518652fae8defb1e251fad56a5e3cdae4c6c5`

Architecture:
- Boot private Store refs 0
- Runtime private Store refs 0
- owner runtime surface PASS
- owner options bridge PASS
- App 13.82.12 PASS
- Core 4.82.12 PASS

Static privacy: PASS.

Authenticated Production:
- canonical production origin PASS
- Trip Contract V1 PASS
- Trip Context PASS
- Runtime PASS
- Runtime phase ready
- Runtime ready true
- Authenticated true
- Active Trip Paris Hochzeitstag / Paris
- Booking Center PASS
- F5 PASS

## Retained warnings

Browser Tracking Prevention warnings: RETAINED / NOT FIXED.

Geolocation request without direct user gesture warning from `core/location/global-location-bootstrap.js`: RETAINED / NOT FIXED.

These warnings are not classified as M5.4.2 Boot/Runtime regressions.

## Infrastructure

DB migration: NONE.
Edge Function change: NONE.
Secret change: NONE.
Manual Cloudflare change: NONE.
