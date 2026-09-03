# PCR M16.5 B1 — Places Cost Containment

## Local immutable release candidate 13.82.168 / 4.82.168

- Feature Commit: 1efe10bf5b9465a6e24d0d87785e1a346d0b1f76
- Local App/Core RC: $appNew / 4.82.168
- Public Integration before deployment: $appOld / 4.82.167
- Focused P02/P03: **10/10 PASS**
- Safe Regression baseline: **201/201 PASS**
- NFR-0: **PASS**
- Remote Edge/Cloudflare release: **NOT YET AUTHORIZED / NOT DEPLOYED**
- Public browser/mobile acceptance: **OPEN**


**Status:** LOCAL IMPLEMENTATION AUTHORIZED · PRODUCTION LOCKED
**Date:** 2026-09-03
**Authorization:** explicit user authorization for local Platform + Edge changes for the Places cost P0

## Problem evidence

- Public Integration counterexample showed repeated `luvia-gateway` HTTP 503 responses.
- One viewport read is intentionally split into four provider tile requests.
- Generic backend transport retries 502/503/504 up to three sends per logical request.
- Therefore one failing four-tile viewport can amplify to as many as twelve gateway POST attempts before additional remount/request multiplication.
- The Google search FieldMask currently includes Enterprise + Atmosphere fields on every Text/Nearby Search.
- Consumer-side fixes already remove automatic viewport search on map mount, Hotel pin `easeTo()` refresh and unconditional background deep discovery after a full fast result.

## Authorized local scope

- `intelligence/backend-service.js`
- `supabase/functions/luvia-gateway/_shared/places.ts`
- one dedicated regression test
- this PCR

## Contract

1. `places.text-search` and `places.nearby-search` do not automatically replay 502/503/504.
2. Authentication recovery remains available because the established bounded request loop itself is retained.
3. Other backend actions retain the previous transient retry policy.
4. Normal rich Places discovery retains the existing evidence FieldMask.
5. Rectangle-qualified live-map viewport searches use a dedicated lean FieldMask by default.
6. Explicit open/rating/price viewport filters may add only the required Enterprise fields.
7. Verified vegetarian viewport filtering may add only `servesVegetarianFood` from Atmosphere.
8. Place Details retains full evidence fields.
9. No DB migration, Secret change, remote Edge deployment, Integration deployment, Main change or Production deployment is authorized by this PCR.

## Rollback

- Restore generic transient retry behavior for Places search actions.
- Restore `SEARCH_FIELDS` for rectangle viewport requests.
- Remove the dedicated cost-containment regression.

## Release gates

- targeted local regression GREEN
- Safe Regression GREEN
- NFR tests GREEN where available
- immutable Integration build and public browser/device acceptance remain separate future gates
- Production remains locked

## Authoritative local closeout

- M16.5 Visual Surface Inventory: PASS
- Places Cost Containment Contract: PASS
- P02/P03 focused regression before Safe gate: 10/10 PASS
- Safe Regression: 201/201 PASS
- NFR-0 Foundation Regression: PASS
- `git diff --cached --check`: PASS
- No DB migration
- No Secret change
- No remote Edge mutation
- No Google or Foursquare live request during local closeout
- No commit, push or deployment
