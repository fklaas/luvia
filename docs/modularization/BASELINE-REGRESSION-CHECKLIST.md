# Baseline Regression Checklist

This checklist freezes the M0/M1 baseline before adapters and isolation builds begin.

## A. Repository / release identity

- [ ] expected commit/baseline is explicitly recorded
- [ ] working tree clean before build
- [ ] `intelligence/kernel/version.js` matches intended App/Core version
- [ ] `index.html`, `sw.js`, `force-update.html` release consistency test passes
- [ ] no unintended changes to `wrangler.jsonc`, Auth config, Supabase config or secrets references

## B. Local static regression

The repository contains 142 `.test.cjs` Node/assert regression files plus SQL smoke files and diagnostics. There is no tracked central `package.json` runner or GitHub Actions workflow yet; M4 will create a controlled suite/allowlist rather than blindly execute every test.

Minimum pre-merge local suite for v13.81.4 baseline:

- `node tests/release-version-consistency.test.cjs`
- `node tests/v13.81.4-google-reserve-discovery-matrix.test.cjs`
- `node tests/v13.81.4-green-farmers-mutation-bootstrap-regression.test.cjs`
- `node tests/v13.81.4-mutation-thread-bootstrap-mobile-surface-fetch-hardening.test.cjs`
- current ProductModule/Control Center/App boot regression tests selected by affected scope

Tests that mention network/Supabase/env are **not automatically safe to run as CI** until categorized. M1 inventory marked 78 files for review because they contain broad indicators such as `fetch`, Supabase, URLs, env access or child-process APIs.

## C. Browser smoke — production-critical

- [ ] Login succeeds and reload keeps authenticated state
- [ ] logout/login boot has no blank shell
- [ ] active trip loads correctly
- [ ] trip switch works and dependent Today/Timeline/Destination surfaces refresh
- [ ] top-level navigation works on desktop and mobile
- [ ] Places category clicks open correct search/view
- [ ] Places saved/favorite/planning flow still works
- [ ] Gallery loads real images and quick overview is visible
- [ ] Albums/Memories mount/unmount without console errors
- [ ] Booking list/Control Center/Inbox load from Booking Core
- [ ] Booking timeline opens
- [ ] Modify/Cancel UI starts evidence-driven request and does not falsely finalize status
- [ ] mobile Booking action footer is reachable above safe-area/navigation
- [ ] no actual external booking/email request is sent solely for smoke testing

## D. Supabase / backend safety

- [ ] no destructive migration command is run for an architecture-only build
- [ ] no `npx supabase db push` during M1/M2
- [ ] no migration-history repair
- [ ] no remote-only `luvia-media-delivery` deletion/redeploy
- [ ] no storage bucket deletion
- [ ] no secrets printed to console/log/artifacts

## E. Known baseline issues — do not misclassify as new regression

- `M0-PERF-001`: free-text Places search is functional but observed around 15s+ in baseline smoke.
- `M0-BOOKING-KNOWN-001`: Green Farmer contact/reservation path had a known reliability issue; v13.81.4 includes regression hardening but live external request must not be generated just for smoke.
- `M0-FE-WARN-001`: password-form accessibility/browser warning observed.
- `M0-CANONICAL-001`: apex and `www` both returned 200 identical content without canonical redirect.

## F. M2 docs-only build gate

- [ ] source code hash set identical to baseline for all pre-existing files
- [ ] only documentation/CSV architecture artifacts added
- [ ] no version bump required
- [ ] no DB/function/secret/deploy change
- [ ] M2 contract exit gate signed PASS
