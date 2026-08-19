# PCR – M5.1k Recommendations Trip Contract Adoption

Date: 2026-08-19

App: 13.82.10

Core: 4.82.10

Implementation commit: 792d049d27b896a838e0ce6e8b34329c87ca20f6

Owner stream: feature/intelligence-core

## Change classification

Milestone:

M5.1k – Recommendations Trip Contract Adoption.

Architecture class:

Intelligence-domain Trip truth consumption isolation.

Public boundary:

Trip Contract v1.

Runtime ownership:

Recommendations remains Intelligence-owned.

Trip domain truth remains owned by the Trip Contract owner.

## Problem

Six reachable Recommendations services still consumed current Trip identity through private LuviaTripStore and direct LuviaTripContext references.

This violated the intended boundary:

Domain Core -> public Contract / Adapter -> Intelligence.

The Recommendations services did not own Trip truth and did not require direct private Trip storage access.

## Architecture review result

Exactly six Recommendations runtime files formed the approved slice.

Before migration:

- private LuviaTripStore reads: 6
- direct LuviaTripContext dependencies: 6
- public Trip Contract adoption: 0 / 6
- private Trip Store mutations: 0

Required information:

- active Trip
- active Trip id / context

Existing public capabilities:

- getActiveTrip()
- getContext()

The public Trip Contract already provided the required information.

## Decision

Migrate all six approved Recommendations services to the existing public Trip Contract v1 reads.

Do not add a new public read merely to mirror a private implementation detail.

Do not add a new command.

Do not move Timeline / Journey.

Do not mix Runtime lifecycle ownership into this read-only adoption slice.

Do not migrate Booking, Media, Preferences or Theme Service in this slice.

## Runtime files

- core/recommendations/cross-module-recommendation-service.js
- core/recommendations/live-day-companion-service.js
- core/recommendations/recommendation-service.js
- core/recommendations/restaurant-intelligence-service.js
- core/recommendations/schedule-intelligence-service.js
- core/recommendations/today-intelligence-service.js

## Runtime result

Private LuviaTripStore reads:

6 -> 0.

Direct LuviaTripContext dependencies:

6 -> 0.

Public Trip Contract adoption:

0 / 6 -> 6 / 6.

Private Trip Store mutations introduced:

0.

Trip Contract read extension:

NONE.

Trip Contract command extension:

NONE.

## RED test result

Targeted regression:

tests/m5.1k-recommendations-trip-contract-adoption.test.cjs

The first generated RED harness contained four over-escaped JavaScript regex constructions.

The failure was diagnosed before runtime mutation.

The adapter itself already contained the required capabilities.

Classification:

RED_TEST_REGEX_OVER_ESCAPED.

Exactly four test regex lines were repaired.

Accepted RED state:

- six private Trip Store violations
- six missing public Trip Contract adoptions
- zero private mutation violations

The runtime migration then moved the test to GREEN.

## Release implementation

Release identity:

- App 13.82.10
- Core 4.82.10
- M5.1k Recommendations Trip Contract Adoption

Implementation commit:

792d049d27b896a838e0ce6e8b34329c87ca20f6

Parent:

b55d7c665c86fed8aade4cd592065eda5973c6e5

Exact implementation commit scope:

14 files.

No unauthorized runtime domain was included.

## Regression

M5.1k targeted regression:

PASS.

M5.1j regression:

PASS.

M3.1 Trip Contract regression:

PASS.

release-version-consistency:

PASS.

Ownership / boundary / topology / registry guardrails:

PASS.

Safe Regression:

31 / 31 PASS.

## Promotion

Intelligence owner stream:

PASS.

Integration fast-forward:

PASS.

Integration normal non-force push:

PASS.

Pre-Main Integration Preview:

PASS.

Main fast-forward:

PASS.

Main normal non-force push:

PASS.

Merge commits:

NONE.

Force pushes:

NONE.

## Pre-Main Preview acceptance

The automatic Integration Preview served the exact accepted Git implementation before Main mutation.

Exact public source provenance:

11 / 11 PASS.

Static Asset Hardening:

PASS.

The accepted Preview gate used .NET HttpClient and System.Uri validation.

Earlier failed curl harness attempts remain failed harness attempts and are not converted into successful evidence.

pre-Main Preview gate retroactively claimed = NO.

## Production acceptance

Production served the same exact eleven Git assets.

Exact Production source provenance:

11 / 11 PASS.

Production release identity:

App 13.82.10 / Core 4.82.10 PASS.

Production index:

214 / 214 current App tokens.

Stale App 13.82.9 tokens:

0.

Service Worker:

luvia-shell-v13.82.10.

force-update:

appv=13.82.10.

Static Asset Hardening:

PASS.

## Deployment boundary

Git-driven deployment path:

feature/intelligence-core -> integration -> automatic Integration Preview -> main -> automatic Production.

Manual Wrangler deployment:

NONE.

Second deployment truth:

NONE.

Supabase deployment:

NONE.

Database migration:

NONE.

Edge Function deployment:

NONE.

Secret mutation:

NONE.

## Scope exclusions

The following remain outside M5.1k:

- Booking
- Media
- Preferences
- Theme Service
- Runtime lifecycle Trip Store ownership
- central Trip Context bridge
- legacy destination-service
- Timeline / Journey
- final physical repository relocation
- database schema
- Supabase Edge Functions
- secrets

Timeline / Journey remains reserved.

## Intelligence ownership

The repository ownership evidence classifies core/recommendations/* with current Intelligence-oriented ownership until the later dedicated physical Core Isolation and Unification move.

M5.1k changes the dependency boundary, not the physical repository path.

Intelligence may analyze and recommend using Trip truth but does not own or mutate Trip truth through private storage.

## Physical repository isolation

This PCR does not claim the final physical M5 repository topology.

The larger M5 exit requirement remains:

- domain implementation physically grouped into clear Core roots
- old active duplicate or legacy domain paths removed
- loaders, imports, index and Service Worker references updated
- no domain truth scattered across ambiguous active locations
- full regression after relocation
- Production proof after relocation
- eight-stream synchronization

Only after those later gates may physical M5 isolation be claimed.

## Historical M5.1j documentation correction

The read-only Closeout Structure Audit found that the M5.1j historical subsection in CURRENT-BUILD.md had inherited M5.1k version strings.

The authoritative M5.1j Release Notes and Migration State prove M5.1j as App 13.82.9 / Core 4.82.9.

This closeout restores that subsection to the already-proven release identity.

This correction is documentation integrity repair only.

No historical runtime or Git evidence is rewritten.

## Evidence limitation retained

The existing historical protocol-evidence limitation remains part of the record.

Later verification cannot retroactively create live-remote or divergence evidence that was not captured immediately before every earlier mutation point referenced by retained evidence.

Branch, HEAD, tracking and preservation evidence remains valid, but full historical protocol compliance for those earlier mutation moments is not claimed.

No destructive reset, clean, amend, force operation or history rewrite is performed merely to reconstruct missing retrospective proof.

M5.1k itself used explicit branch, HEAD, tracking, live-remote, divergence, exact-scope and race gates for its controlled implementation, release registration, commit, promotion and acceptance stages.

That does not rewrite or cure earlier historical evidence gaps.

## Final classification

M5.1k architecture review:

COMPLETE.

M5.1k RED proof:

COMPLETE.

M5.1k runtime migration:

COMPLETE.

M5.1k release registration:

COMPLETE.

M5.1k implementation commit and owner push:

COMPLETE.

M5.1k Integration promotion:

COMPLETE.

M5.1k pre-Main Preview acceptance:

COMPLETE.

M5.1k Main promotion:

COMPLETE.

M5.1k Production acceptance:

COMPLETE.

M5.1k closeout documentation:

PREPARED.

M5 overall:

IN PROGRESS.

Next grouped milestone:

M5.2 Remaining Trip Consumer Isolation.
