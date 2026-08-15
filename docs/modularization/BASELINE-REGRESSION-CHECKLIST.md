# Baseline Regression Checklist

This checklist freezes the M0/M1 baseline before adapters and isolation builds begin.

## A. Repository / release identity

- [ ] expected commit/baseline is explicitly recorded
- [ ] working tree clean before build
- [ ] `intelligence/kernel/version.js` matches intended App/Core version
- [ ] `index.html`, `sw.js`, `force-update.html` release consistency test passes
- [ ] no unintended changes to `wrangler.jsonc`, Auth config, Supabase config or secrets references

## B. Local static regression

The repository currently contains **156 `.test.cjs` regression files** plus SQL smoke files and diagnostics.

Historical release tests remain valuable release evidence, but they are not automatically evergreen merge gates. Tests may contain hard-coded historical versions, retired paths, network access, Supabase access, environment dependencies or other assumptions that make blind execution of every test unsafe or misleading.

M4.3 therefore establishes one controlled local regression entry point:

`node tests/run-m4.3-safe-regression.cjs`

The runner uses an explicit reviewed allowlist. It does **not** glob all `.test.cjs` files.

Current M4.3 controlled suite:

- Release consistency
- Runtime/App boot evergreen foundation
- Feature Flag Registry unit guardrails
- Feature Flag runtime/release integration
- M3.1 Trip Contract Adapter
- M3.2 Places Contract Adapter
- M3.3 Media Contract Adapter
- M3.4 Identity Contract Adapter
- M3 Contract release integration evergreen
- Places architecture evergreen
- ProductModule / Control Center regressions
- Booking contact/reservation discovery regressions
- M4.2 cross-core DB ownership guardrail

Current allowlist size: **17 tests**.

Latest confirmed M4.3 working-tree run:

- Total: **17**
- Passed: **17**
- Failed: **0**
- Suite: **PASS**
- Release: **App 13.81.9 / Core 4.81.9**
- Cross-core mapped debt: **26 / baseline 26**
- Unmapped DB-object debt: **39 / baseline 39**
- Dynamic DB-call debt: **27 / baseline 27**

Operational commands:

- Inspect the reviewed allowlist without executing it:
  `node tests/run-m4.3-safe-regression.cjs --list`
- Execute the complete controlled local suite:
  `node tests/run-m4.3-safe-regression.cjs`

Rules:

- [ ] run the controlled suite before promotion from a feature stream when shared/runtime behavior is affected
- [ ] run affected domain-specific tests in addition to the controlled baseline where required
- [ ] do not convert historical version-specific tests into evergreen gates merely by changing their expected version
- [ ] preserve historical tests as release evidence when their original assertions describe an earlier release
- [ ] add a test to the controlled allowlist only after it has been reviewed as local/non-destructive and successfully executed
- [ ] a failing controlled regression gate blocks promotion
- [ ] Browser, backend, integration/preview and deployment checks below remain separate gates and are not replaced by the Node harness
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
