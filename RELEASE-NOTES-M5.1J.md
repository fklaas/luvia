# Luvia Release Notes – M5.1j

Date: 2026-08-19

App: 13.82.9

Core: 4.82.9

Release: M5.1j Profile Foundation Trip Contract Adoption

Implementation commit: a76fae471f368f33a5e68c396f9e1778c1004e18

## Status

M5.1j implementation is COMPLETE.

M5.1j Production acceptance is COMPLETE.

The closeout-marker commit and final eight-stream synchronization are intentionally not pre-claimed by this document.

M5 Trip Core Isolation remains IN PROGRESS.

## Purpose

M5.1j removes the remaining approved Profile Foundation dependency on the private Trip Store boundary.

The migrated consumer now reads Trip state through the canonical public Trip Contract and activates a trip through the public Trip Contract command.

No new Trip Contract surface was required.

## Runtime migration

Runtime file:

core/profiles/profile-foundation.js

The previous direct Profile Foundation access to LuviaTripStore was removed.

The adopted public read APIs are:

- listTrips()
- getActiveTrip()
- getContext()

The adopted public command is:

- selectActiveTrip(id)

The owner-internal Trip Contract implementation remains responsible for bridging selectActiveTrip to its private store implementation.

The existing Profile Service active-trip update remains in the consumer flow after public Trip Contract activation.

## Contract scope

Trip Contract read extension: NONE.

Trip Contract command extension: NONE.

Trip Contract Adapter mutation: NONE.

The already-existing public API was sufficient for the Profile Foundation migration.

## Explicit exclusions

M5.1j does not migrate or redesign:

- Timeline / Journey ownership
- Membership
- Schedule reads
- legacy compatibility surfaces outside the approved Profile Foundation slice
- Booking Core
- Media Core
- Experience Core
- Intelligence Core
- database schema
- Supabase Edge Functions
- secrets

## Release registration

Release identity:

- App 13.82.9
- Core 4.82.9
- M5.1j Profile Foundation Trip Contract Adoption

Safe Regression allowlist increased from 29 to 30.

The registered M5.1j regression is:

tests/m5.1j-profile-foundation-trip-contract-adoption.test.cjs

The release registration updated the active release surfaces only.

Historical M5.1i Production provenance in the registry, release notes, test results, PCR, Migration State and CURRENT-BUILD historical sections was preserved.

## Promotion

The implementation commit was created on feature/consumer-experience with exactly nine changed paths and no merge commit.

It was promoted by controlled fast-forward through:

1. feature/consumer-experience
2. integration
3. main

All three live branches reached:

a76fae471f368f33a5e68c396f9e1778c1004e18

No force push was used.

## Regression

M5.1j targeted regression: PASS.

M3.1 Trip Contract regression: PASS.

release-version-consistency: PASS.

Four ownership / boundary / registry guardrails: PASS.

Controlled Safe Regression: 30 / 30 PASS.

## Preview and Production acceptance

Current Integration Preview provenance:

6 / 6 exact Git assets PASS.

Current Production provenance:

6 / 6 exact Git assets PASS.

Verified Git blobs:

- index.html = 606979e01b673881a3f51bf13398f790adaa5bfc
- intelligence/kernel/version.js = 12ce947918d632ebb75471ff9b6e64d326f772ba
- sw.js = e339b106649a468c2a73e706f60aa4c9fa8f44f3
- force-update.html = eb501799dfebe9249fad456a7ae862ca974cab4f
- core/diagnostics/cloud-only-place-verification.js = c33014c24f10bf369c66a6ddf7432046562ec328
- core/diagnostics/media-readiness.js = e9c8ee02dadf67d4c5bcf83470d7574b262ffd81

Production identity verification:

- App 13.82.9
- Core 4.82.9
- release name M5.1j Profile Foundation Trip Contract Adoption
- 214 / 214 index cache tokens on 13.82.9
- zero stale 13.82.8 index cache tokens
- Service Worker luvia-shell-v13.82.9
- force-update appv 13.82.9
- kernel channel production

Static Asset Hardening smoke: PASS.

The internal M5.1j test source and retained historical M5.1i Markdown were not exposed as direct static source assets.

## Deployment classification

The Git-driven Integration Preview currently matches the exact M5.1j Git target.

The Git-driven Production environment currently matches the exact M5.1j Git target.

No additional manual Cloudflare or Wrangler deployment was performed.

No Supabase deployment was performed.

No database migration was performed.

No Edge Function deployment was performed.

No secret mutation was performed.

The Preview and Production provenance audit occurred after Main promotion. It is not represented as a historical pre-Main Preview gate.

## Historical protocol evidence

The existing historical protocol-evidence limitation is retained rather than rewritten by later checks.

Before earlier mutation moments referenced by retained project evidence, live-remote SHA and divergence were not captured immediately before every mutation point. Later checks cannot retroactively prove those missing moments.

Branch, HEAD, tracking and preservation evidence exists, but complete historical protocol compliance for those earlier mutation moments is not claimed.

No reset, clean, amend, force operation or history rewrite was performed merely to manufacture retrospective evidence.

## Result

M5.1j Profile Foundation Trip Contract Adoption is functionally complete and Production accepted.

Repository closeout-marker commit and eight-stream synchronization remain separate follow-up gates.

M5 remains IN PROGRESS.
