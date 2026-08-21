# PCR - M5.3 Active Trip Context

Date: 2026-08-21

Runtime App/Core: 13.82.12 / 4.82.12

Runtime Release Commit: 1dc39b0b034e09aebfab3737598c2f2ac393cacd

## Problem

Active Trip reads were still exposed primarily through browser-oriented runtime surfaces and global bindings.

The existing luvia-trip-context.js projection was tied to the Web runtime and therefore was not an acceptable final boundary for the Native First Ready architecture.

The migration had to avoid introducing a second Trip Truth source and had to preserve existing Web compatibility while making Active Trip access reusable outside the browser.

## Decision

Create a runtime-neutral Active Trip Context core under the Trip domain and move browser compatibility into an explicit Web Runtime Compatibility Binding.

TripStore remains the sole canonical Trip Truth provider.

Active Trip Context owns a derived read/subscription projection only.

No private Trip mutation and no Trip database mutation is introduced by the new context.

## Runtime-neutral core

Path: core/trips/active-trip-context.mjs

Core version: 1.0.0

Public runtime-neutral behavior includes:

- getSnapshot
- getActiveTrip
- getDestination
- getDestinationName
- getTripName
- getAccent
- getDates
- subscribe

The core does not depend on window, document, navigator, localStorage, sessionStorage, DOM events or Service Worker APIs.

## Web compatibility

Path: luvia-trip-context.js

The Web binding imports the runtime-neutral Active Trip Context and preserves window.LuviaTripContext for compatibility.

Binding diagnostics accepted in live runtime:

- binding: web-runtime-compatibility
- coreVersion: 1.0.0
- provider: LuviaTripStore
- ready: true

The broad legacy luvia-event subscription was removed from this binding.

## Truth ownership

TripStore remains Trip Truth.

LuviaTripContext is a projection, not a second truth.

LuviaTripContractV1 continues to expose the public Trip boundary for current Web consumers.

LuviaTravelContext remains derived travel context and does not become Trip Truth.

Authenticated Integration and Production tests proved the active Trip identity remained equal across TripStore, TripContext, TripContract and TravelContext.

## Native First Ready assessment

M5.3 materially improves Native First readiness because the Active Trip projection can now execute without browser globals.

The browser globals window.LuviaTripStore, window.LuviaTripContext, window.LuviaTripContractV1 and window.LuviaTravelContext remain compatibility debt.

These globals are intentionally not removed by M5.3.

Their classification and reduction belongs to later M5 work, primarily M5.4.

The correct current Travel Context path is core/context/travel-context-service.js.

A historical NFR-era reference to core/services/travel-context-service.js is stale. M5.3 records the correction without rewriting the historical NFR evidence.

## ES module / boot-order risk

Changing luvia-trip-context.js to a type=module script introduced a real scheduling question because module scripts execute deferred relative to classic parser-time scripts.

Static source order alone was therefore not accepted as proof.

The risk was gated with authenticated Integration Preview and Production browser tests before and after F5.

Observed result: no Active Trip Context boot race.

## Release acceptance

- M5.3 Regression: 2 / 2 PASS
- NFR Foundation: 3 / 3 PASS
- Safe Regression: 34 / 34 PASS
- M5.2 Targeted: 7 / 7 PASS
- Integration Preview byte provenance: PASS
- Production byte provenance: PASS
- Integration ES Module MIME: PASS
- Production ES Module MIME: PASS
- Integration Static Asset Privacy: 5 / 5 PASS
- Production Static Asset Privacy: 5 / 5 PASS
- Integration authenticated F5 proof: PASS
- Production authenticated F5 proof: PASS
- Booking Center continuity: PASS

## Retained harness evidence

M5.3.3 Safe-registration preflight failure is retained as a harness-only failure before mutation.

M5.3.3B Release Consistency failure is retained as a real local incomplete-release state after mutation but before commit or push.

M5.3.3C generic matrix extraction limitation is retained; direct Release Consistency source was authoritative.

M5.3.3D established the exact repair target read-only.

M5.3.3E completed the controlled in-place repair and Integration release path.

No failed gate is retroactively rewritten.

## Remaining debt

M5.3 does not complete physical Trip Core isolation.

M5.3 does not eliminate all Web runtime globals.

M5.3 does not move all boot/runtime mutation commands behind a final runtime-neutral command boundary.

M5.3 does not finish Travel Context storage, location or lifecycle port separation.

M5.3 does not eliminate Legacy Bridges or remaining Bootstrap compatibility bindings.

## Next milestone

M5.4 should classify and reduce remaining direct dependencies on window.LuviaTripStore, window.LuviaTripContext and window.LuviaTripContractV1 and continue separating Web bootstrap/runtime compatibility from Trip domain logic.

M5 remains IN PROGRESS after M5.3.

## Closeout condition

This PCR belongs to the M5.3 Docs Marker.

M5.3 is COMPLETE / CLOSED only after the exact Docs Marker is synchronized across all eight active streams with Local = Tracking = Live, divergence 0 / 0 and clean worktrees.
