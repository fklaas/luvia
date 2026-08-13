# Test Results — M2 Ownership & Contract Specification

**Baseline:** aff59be / Luvia v13.81.4 / Core 4.81.4  
**Test runtime:** Node.js v22.16.0  
**Build type:** documentation/contract specification only

## 1. Source integrity — PASS

The source ZIP was hashed before M2 artifacts were created.

- baseline files hashed: **2387**
- pre-existing files changed: **0**
- pre-existing files missing: **0**

Result: **PASS. All 2,387 original files are byte-for-byte unchanged.** Only new M1/M2 architecture/documentation artifacts were added.

## 2. Current v13.81.4 regressions — PASS 3/3

- `tests/v13.81.4-google-reserve-discovery-matrix.test.cjs` → PASS
- `tests/v13.81.4-green-farmers-mutation-bootstrap-regression.test.cjs` → PASS
- `tests/v13.81.4-mutation-thread-bootstrap-mobile-surface-fetch-hardening.test.cjs` → PASS

## 3. Selected version-independent/current architecture regressions — PASS 3/3

- `tests/v13.78.0-product-module-regression.test.cjs` → PASS
- `tests/v13.77.0-control-center-home-travel-identity.test.cjs` → PASS
- `tests/v13.80.0-booking-actions-intelligence.test.cjs` → PASS

These tests were selected because their assertions still describe live architecture behavior and they pass on the v13.81.4 baseline.

## 4. Historical-suite exploratory run — IMPORTANT CLASSIFICATION

A broader exploratory run intentionally included historical version-pinned tests. Result: **6 PASS / 7 FAIL**. The failures are not caused by M2 because source integrity proves all original files are unchanged.

Observed reasons:

- `v13.76.0-control-center-global-product-module-foundation` expects exact old Core `4.76.0`.
- `v13.79.0-booking-inbox-conversations` expects the then-planned composer transport rather than the later live `booking-email-reply-v1` value.
- `v13.81.0`, `v13.81.1`, `v13.81.2`, `v13.81.3` tests pin implementation/build versions that were legitimately advanced by later releases.
- `release-version-consistency.test.cjs` fails on the **pre-existing baseline** because `force-update.html` still redirects to `appv=13.71.0` instead of current 13.81.4.

### M1/M2 conclusion

Historical `tests/vX...` files are release evidence/regressions, **not a blindly cumulative all-green suite**. M4 must build an explicit CI allowlist/suite taxonomy instead of executing all 142 `.test.cjs` files indiscriminately.

The stale `force-update.html` version is recorded as **M2-BASELINE-TEST-001** and must be handled in a separate runtime/maintenance build; M2 does not silently fix it because M2 is docs-only.

## 5. Architecture artifact validation — PASS

- `FILE-OWNERSHIP.csv`: **2387** rows
- `GLOBAL-ACCESS-INVENTORY.csv`: **4360** rows
- `DATABASE-DOMAIN-MAP.csv`: **131** rows
- `CONTRACT-MATRIX.csv`: **7** rows
- contract JSON skeletons parsed successfully: **7/7**

Validated contract skeletons: `booking.v1.json`, `identity.v1.json`, `intelligence.v1.json`, `media.v1.json`, `places.v1.json`, `social.v1.json`, `trip.v1.json`.

## 6. Remote systems

Not touched and not tested by mutation in M2:

- Supabase DB: no migration, no push, no repair
- Supabase Edge Functions: no deploy
- Supabase secrets: no change
- Cloudflare Worker: no deploy
- Storage: no write/delete
- External Booking/email providers: no request sent

## Final M2 test judgement

**PASS for M2 scope.** Current v13.81.4 regression tests used for this docs-only build are green, original runtime source is unchanged, and architecture artifacts validate. This result does **not** claim that every historical version-pinned test is supposed to pass on the latest release.
