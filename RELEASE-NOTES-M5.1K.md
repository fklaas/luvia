# Luvia Release Notes – M5.1k

Date: 2026-08-19

App: 13.82.10

Core: 4.82.10

Release: M5.1k Recommendations Trip Contract Adoption

Implementation commit: 792d049d27b896a838e0ce6e8b34329c87ca20f6

Owner stream: feature/intelligence-core

## Status

M5.1k runtime implementation is COMPLETE.

M5.1k release registration is COMPLETE.

M5.1k Integration promotion is COMPLETE.

M5.1k pre-Main Integration Preview acceptance is COMPLETE.

M5.1k Main promotion is COMPLETE.

M5.1k Production acceptance is COMPLETE.

The closeout-marker commit and final eight-stream synchronization are intentionally not pre-claimed by this document.

M5 Trip Core Isolation remains IN PROGRESS.

## Purpose

M5.1k removes the approved Recommendations dependency on private Trip Store and direct LuviaTripContext reads.

The goal is logical Trip-domain isolation:

Domain Core -> public Contract / Adapter -> Intelligence.

Recommendations may understand Trip context but must consume that truth through the public Trip Contract rather than through private Trip storage.

## Architecture review

The read-only Architecture Review classified exactly six Recommendations runtime files as one coherent Intelligence-owned slice.

Before migration:

- private LuviaTripStore reads: 6
- direct LuviaTripContext dependencies: 6
- public Trip Contract adoption: 0 / 6
- private Trip Store mutations: 0

The existing Trip Contract already supplied the required read capabilities:

- getActiveTrip()
- getContext()

No list, activation or mutation capability was required for this slice.

No Trip Contract extension was authorized or implemented.

## Runtime migration

Migrated files:

- core/recommendations/cross-module-recommendation-service.js
- core/recommendations/live-day-companion-service.js
- core/recommendations/recommendation-service.js
- core/recommendations/restaurant-intelligence-service.js
- core/recommendations/schedule-intelligence-service.js
- core/recommendations/today-intelligence-service.js

After migration:

- private LuviaTripStore reads: 0 / 6
- direct LuviaTripContext dependencies: 0 / 6
- public Trip Contract adoption: 6 / 6
- private Trip Store mutations introduced: 0
- Trip Contract read extension: NONE
- Trip Contract command extension: NONE

## RED to GREEN proof

The initial targeted RED-test creation exposed an over-escaped PowerShell-to-JavaScript regular expression in the test harness.

No runtime mutation had occurred at that failure point.

A read-only diagnosis proved the existing Trip Contract capabilities were present and classified the failure as RED_TEST_REGEX_OVER_ESCAPED.

The targeted test was then repaired in exactly four regex lines.

Accepted RED state:

- private Trip Store violations: 6 / 6
- public Trip Contract missing: 6 / 6
- mutation violations: 0

After the six-file runtime migration the targeted test became GREEN.

## Release registration

Release identity:

- App 13.82.10
- Core 4.82.10
- M5.1k Recommendations Trip Contract Adoption
- builtAt 2026-08-19T12:20:00+02:00

Release registration changed exactly seven existing release / regression surfaces:

- CURRENT-BUILD.md
- core/diagnostics/media-readiness.js
- force-update.html
- index.html
- intelligence/kernel/version.js
- sw.js
- tests/run-m4.3-safe-regression.cjs

The six runtime implementation files and targeted test were preserved unchanged during release registration.

## Implementation commit

Implementation commit:

792d049d27b896a838e0ce6e8b34329c87ca20f6

Parent:

b55d7c665c86fed8aade4cd592065eda5973c6e5

Subject:

feat(m5): adopt Trip Contract in Recommendations

Changed paths: exactly 14.

- CURRENT-BUILD.md
- core/diagnostics/media-readiness.js
- core/recommendations/cross-module-recommendation-service.js
- core/recommendations/live-day-companion-service.js
- core/recommendations/recommendation-service.js
- core/recommendations/restaurant-intelligence-service.js
- core/recommendations/schedule-intelligence-service.js
- core/recommendations/today-intelligence-service.js
- force-update.html
- index.html
- intelligence/kernel/version.js
- sw.js
- tests/m5.1k-recommendations-trip-contract-adoption.test.cjs
- tests/run-m4.3-safe-regression.cjs

No merge commit was created.

## Promotion

Owner stream:

feature/intelligence-core

Owner implementation push:

PASS.

Integration promotion:

PASS by git merge --ff-only.

Pre-Main Integration Preview gate:

PASS before any Main mutation.

Main promotion:

PASS by git merge --ff-only.

All Git pushes were normal non-force pushes.

No force push was used.

## Regression

M5.1k targeted regression:

PASS.

M5.1j regression:

PASS.

M3.1 Trip Contract regression:

PASS.

release-version-consistency:

PASS.

Four ownership / boundary / registry guardrails:

PASS.

Controlled Safe Regression:

31 / 31 PASS.

## Pre-Main Integration Preview acceptance

Stable Integration Preview:

https://integration-luvia.njwnrvwbv5.workers.dev

The automatic Integration Preview was accepted before Main mutation.

Exact Git provenance:

11 / 11 public changed/runtime assets PASS.

- index.html -> 069d2da9d47363a4e0bce3ea6d33a8cf20f56d66
- intelligence/kernel/version.js -> bc794464904e69c7278c05d1cfc93b0e432ea435
- sw.js -> ab12236c867fc5fa495b92ce3d9241fd1aa961ef
- force-update.html -> cb9def86e9c2253ce92f4157b3ba91f0c70d9b05
- core/diagnostics/media-readiness.js -> 1a96e52eba87e9dd023d9acdefc96a3e92b7a78c
- core/recommendations/cross-module-recommendation-service.js -> 0bd9d8e510d8b0ae15876021ebe97afaf140038c
- core/recommendations/live-day-companion-service.js -> 6009c47622798af00ec3b062848302a6e5092f4f
- core/recommendations/recommendation-service.js -> f1256fea36c48ca85022f8ccc847bb2b4dfc0fb1
- core/recommendations/restaurant-intelligence-service.js -> 5a27d8dab33036f7721d6b7ad27438be19ec9a84
- core/recommendations/schedule-intelligence-service.js -> ee17d1039316b29d4c43c746f9261d339e26a1a3
- core/recommendations/today-intelligence-service.js -> f34b14149b0f56fc47314198567c1c9e573477ef

Static Asset Hardening:

PASS.

CURRENT-BUILD.md, the targeted M5.1k test and the Safe Regression runner were not exposed as direct repository source assets.

The initial curl-based Preview harness attempts failed in the harness itself and were not accepted as Preview evidence.

The accepted gate used .NET HttpClient with System.Uri validation.

pre-Main Preview gate retroactively claimed = NO.

## Production acceptance

Production:

https://myluvia.app

Automatic Production exact Git provenance:

11 / 11 PASS.

The same eleven Git blobs listed above were served from Production.

Production identity:

- App 13.82.10
- Core 4.82.10
- index App tokens 214 / 214
- stale App 13.82.9 tokens 0
- Service Worker luvia-shell-v13.82.10
- force-update appv 13.82.10
- kernel builtAt 2026-08-19T12:20:00+02:00

Static Asset Hardening:

PASS.

No manual Production deployment was required.

## Deployment classification

Deployment path:

feature/intelligence-core -> integration -> automatic Integration Preview -> main -> automatic Production.

Manual Cloudflare / Wrangler deployment:

NONE.

Second deployment truth:

NONE.

Supabase deployment:

NONE.

Database migration:

NONE.

Edge Function deployment:

NONE.

Supabase Secret mutation:

NONE.

Cloudflare Secret mutation:

NONE.

Provider configuration mutation:

NONE.

## Explicit exclusions

M5.1k did not modify:

- Booking runtime
- Media runtime
- Preferences runtime
- Theme Service
- Runtime lifecycle Trip Store ownership
- Trip Context bridge
- legacy destination-service
- Timeline / Journey
- database schema
- Supabase Edge Functions
- secrets

Timeline / Journey remains reserved.

## Physical repository isolation boundary

M5.1k completes logical Recommendations Trip Contract isolation.

It does not claim final physical repository isolation.

The larger M5 exit path still requires domain implementation to be moved into the final clear core-oriented repository topology, obsolete active paths to be removed, loaders and asset references to be updated, and the resulting repository to pass full regression and Production verification.

## Historical M5.1j metadata correction

The Closeout Structure Audit detected that the historical M5.1j section inside CURRENT-BUILD.md contained M5.1k version strings 13.82.10 / 4.82.10.

Authoritative M5.1j Release Notes and Migration State prove M5.1j as App 13.82.9 / Core 4.82.9.

This closeout restores only that historical subsection to the already-proven M5.1j values.

No runtime state, Git history, deployment history or acceptance evidence is rewritten.

## Historical protocol evidence

The existing historical protocol-evidence limitation is retained rather than rewritten by later checks.

Before earlier mutation moments referenced by retained project evidence, live-remote SHA and divergence were not captured immediately before every mutation point.

Later checks cannot retroactively prove those missing moments.

Branch, HEAD, tracking and preservation evidence exists, but complete historical protocol compliance for those earlier mutation moments is not claimed.

No reset, clean, amend, force operation or history rewrite is performed merely to manufacture retrospective evidence.

## Result

M5.1k Recommendations Trip Contract Adoption is functionally complete and Production accepted.

M5.1k closeout documentation is prepared.

The closeout-marker commit and eight-stream synchronization remain separate gates.

M5 remains IN PROGRESS.

Next grouped milestone after M5.1k repository closeout:

M5.2 Remaining Trip Consumer Isolation.
