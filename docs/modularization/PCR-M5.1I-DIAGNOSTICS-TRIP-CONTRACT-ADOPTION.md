# PCR - M5.1i Diagnostics Trip Contract Adoption

## Objective

M5.1i removes the approved direct legacy Trip-read dependency from the active Diagnostics slice and routes those reads through the canonical public Trip Contract boundary.

The objective is architectural isolation, not a functional redesign of diagnostics behavior.

## Scope

Runtime targets:

- core/diagnostics/cloud-only-place-verification.js
- core/diagnostics/media-readiness.js

Supporting test/release surfaces:

- tests/m5.1i-diagnostics-trip-contract-adoption.test.cjs
- tests/run-m4.3-safe-regression.cjs
- CURRENT-BUILD.md
- intelligence/kernel/version.js
- index.html
- sw.js
- force-update.html

Release evidence documents:

- RELEASE-NOTES-M5.1I.md
- TEST-RESULTS-M5.1I.md
- docs/modularization/PCR-M5.1I-DIAGNOSTICS-TRIP-CONTRACT-ADOPTION.md

Not part of this runtime-release scope:

- docs/architecture/MIGRATION-STATE.md
- tests/m4.5.3-core-stream-registry.test.cjs

Those are closeout surfaces and remain unchanged until later lifecycle evidence exists.

## Corrected legacy inventory

Locked baseline across the two Diagnostics targets:

- LuviaTripStore: **1**
- LuviaTripContext: **4**
- total legacy Trip tokens: **5**
- physical source lines containing the legacy reads: **2**

Post-migration:

- LuviaTripStore: **0**
- LuviaTripContext: **0**

## Ownership classification

The strongest applicable ownership rule places this Diagnostics migration on:

**feature/platform-core**

media-readiness.js remains a Diagnostics consumer for this change. M5.1i changes only Trip-read sourcing and does not transfer Media Core ownership.

## Canonical boundary

The existing public trip.v1 contract is sufficient.

Both targets use a lazy resolver compatible with:

- LuviaTripContractV1
- LuviaTripContract

The read path uses:

- getActiveTrip
- getContext

No new public Trip capability is introduced.

## Call-time contract resolution

index.html loads the two Diagnostics scripts before the Trip Contract Adapter.

This does not require reordering because the relevant Trip reads execute at call time. The implementation therefore resolves the public contract lazily rather than capturing it while the diagnostics script is evaluated.

Decisions:

- index reorder: **NO**
- load-time Trip Contract capture: **NO**
- contract extension: **NO**

## Existing semantics preserved

cloud-only-place-verification.js:

- explicit tripId remains highest priority
- result remains String-normalized
- absent Trip value retains empty-string fallback

media-readiness.js:

- options.tripId remains highest priority
- absent Trip value retains null fallback

No unrelated media or diagnostics behavior is intentionally changed.

## Timeline

core/places/timeline-core.js is reserved for the later Journey / Timeline aggregation architecture work.

Canonical Git blob:

bc0b790ca87aaab69a05f4ae5f04eca9a59375ff

M5.1i Timeline mutation: **NONE**

The previous raw Windows-file SHA discrepancy was classified as a worktree EOL difference. Canonical Git content and local/staged diff are the preservation authority across worktrees.

## Trip Contract Adapter

core/platform/trip-contract-adapter.js is unchanged.

The existing trip.v1 API already provides the read capability required by M5.1i.

## Test-first protection

Focused test:

tests/m5.1i-diagnostics-trip-contract-adoption.test.cjs

Locked SHA256:

D88FB8BDDE37DF3ADC467525F156B736386F32DE1E4894030F516EC38C37CC9B

The test protects:

- exact two-target Diagnostics scope
- zero direct LuviaTripStore / LuviaTripContext references
- lazy V1 / compatibility-alias resolution
- getActiveTrip and getContext usage
- no load-time Trip Contract capture
- Cloud explicit tripId priority
- Cloud String normalization and empty-string fallback
- Media options.tripId priority and null fallback
- no Trip mutation
- Timeline and adapter exclusion

Current result: **PASS**

## Evergreen regression

Before M5.1i registration:

- allowlist: **28**
- result: **28 / 28 PASS**

After exact M5.1i registration:

- allowlist: **29**
- registration count: **1**
- category: **Runtime foundation**
- Runner mutation: **4 insertions / 0 deletions**
- result: **29 / 29 PASS**

## Cross-Core DB guardrail

M5.1i changes no database access.

Pre-staging verification:

- DB/cross-core guardrail candidates: **2**
- repository/ownership guardrail candidates: **5**
- unique direct guardrail runs: **5**
- all direct runs: **PASS**

No known Cross-Core DB ownership debt growth is introduced by this slice.

## Release identity

Local release candidate:

- App: **13.82.8**
- Core: **4.82.8**
- Name: **M5.1i Diagnostics Trip Contract Adoption**
- owner stream: **feature/platform-core**
- base: **8a48a56128029da4a7f3ac4c95696b17cd82a67d**

Active cache/release surfaces are aligned to App 13.82.8 / Core 4.82.8.

Historical M5.1h 13.82.7 / 4.82.7 evidence is preserved and is not mass-rewritten.

## Infrastructure impact

- DB migration: **NO**
- SQL deployment: **NO**
- Supabase Edge Function change: **NO**
- Supabase Secret change: **NO**
- Cloudflare Secret change: **NO**
- Storage schema change: **NO**
- Provider configuration change: **NO**
- Trip Contract extension: **NO**
- Timeline ownership move: **NO**

## Exact local runtime-release scope

The complete local M5.1i runtime-release candidate contains exactly these 12 paths:

1. CURRENT-BUILD.md
2. RELEASE-NOTES-M5.1I.md
3. TEST-RESULTS-M5.1I.md
4. core/diagnostics/cloud-only-place-verification.js
5. core/diagnostics/media-readiness.js
6. docs/modularization/PCR-M5.1I-DIAGNOSTICS-TRIP-CONTRACT-ADOPTION.md
7. force-update.html
8. index.html
9. intelligence/kernel/version.js
10. sw.js
11. tests/m5.1i-diagnostics-trip-contract-adoption.test.cjs
12. tests/run-m4.3-safe-regression.cjs

No other file belongs to the M5.1i runtime-release commit unless a later explicit gate proves otherwise.

## Local exit state

Current state:

**LOCAL RELEASE PREPARED**

Proven locally:

- Runtime migration: **PASS**
- focused M5.1i regression: **PASS**
- Safe Regression: **29 / 29 PASS**
- release consistency: **PASS**
- repository / ownership / DB guardrails: **PASS**
- Timeline preservation: **PASS**
- staged paths: **0**

Not yet proven:

- implementation commit
- push
- integration promotion
- Integration Preview
- main promotion
- Production state / deployment
- Production artifact equivalence
- browser runtime / reload
- browser console
- final eight-stream synchronization
- M5.1i authoritative closeout

Therefore:

- M5.1i COMPLETE: **NOT YET CLAIMED**
- M5 Trip Core Isolation: **IN PROGRESS**

### Evidence limitation retained

The existing historical protocol-evidence limitation remains part of the record.

Later verification cannot retroactively create live-remote or divergence evidence that was not captured immediately before every earlier mutation point referenced by the retained evidence.

Branch, HEAD, tracking and preservation evidence remains valid, but full historical protocol compliance for those earlier mutation moments is not claimed.

No destructive reset, clean, amend or force operation is performed merely to reconstruct missing retrospective proof.
