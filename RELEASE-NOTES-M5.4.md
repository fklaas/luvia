# RELEASE NOTES — M5.4 FINAL

## Release

- App: **13.82.13**
- Core: **4.82.13**
- Runtime Commit: `4c1827aa122ae5ba91b4ada845ad919fd273edf4`
- Feature Commit: `2ab95fa27f67912f170124295f5662b82608531c`
- Milestone: **M5.4 FINAL — Trip Web Compatibility Boundary**
- Status: **COMPLETE / CLOSED**

## What changed

M5.4 completed the active Web Trip compatibility boundary without introducing a second Trip Truth.

The final architecture introduces `LuviaTripStateReaderV1` as a read-only Web state boundary exposing only `snapshot` and `subscribe`.

`luvia-trip-context.js` no longer binds directly to private `LuviaTripStore`.

The Trip owner adapter keeps exactly one direct private Store access for owner-side mutation behavior. Readiness, diagnostics and active-state observation use the read-only reader instead.

Travel Context no longer uses the secondary `LuviaAppState` Trip fallback.

Active Trip Context remains browserless.

## Architecture result

- Web Trip Context private Store refs: **0**
- Owner adapter direct private Store accesses: **1**
- State Reader: **READ-ONLY**
- TripStore sole Trip Truth: **PRESERVED**
- Active Trip Context browserless: **YES**
- Unreachable legacy Store debt: **DEFERRED / NOT REACTIVATED**

## Regression

- M3.1 Contract Adapter: PASS
- M5.3 Active Trip Context: 2/2 PASS
- M5.4.1 Retention: PASS
- M5.4.2 Retention: PASS
- M5.4.3 Retention: PASS
- M5.4 FINAL Focused: PASS
- NFR-0 Foundation: 3/3 PASS
- Safe Regression Platform: 38/38 PASS
- Safe Regression Integration: 38/38 PASS
- Safe Regression Main: 38/38 PASS

## Integration acceptance

- FF-only promotion: PASS
- Static byte provenance: PASS
- Architecture acceptance: PASS
- Deployment-private asset protection: PASS
- Authenticated F5 smoke: 25/25 PASS

## Production acceptance

- Main FF-only promotion: PASS
- Static byte provenance: PASS
- Release acceptance: PASS
- Architecture acceptance: PASS
- Static privacy: PASS
- Authenticated F5 smoke: 25/25 PASS

## Static registry classification

The following canonical registries are intentionally deployment-public:

- `config/luvia-streams.json`
- `config/luvia-cores.json`

The following NFR architecture artifacts remain deployment-private:

- `config/luvia-native-readiness-debt.json`
- `config/luvia-platform-ports.json`

## Infrastructure changes

- Database migration: NONE
- Edge Function change: NONE
- Secret change: NONE
- Manual Cloudflare change: NONE

## Retained debt

Tracking Prevention warnings and the geolocation user-gesture warning remain existing Browser / Platform debt.

## Next

M5.4 is closed.

M5 remains open until physical Trip Core isolation is completed and the M5 Exit Gate is satisfied.
