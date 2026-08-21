# RELEASE NOTES - M5.3 Active Trip Context

Date: 2026-08-21

Runtime App: 13.82.12

Runtime Core: 4.82.12

Runtime Release Commit: 1dc39b0b034e09aebfab3737598c2f2ac393cacd

Foundation Commit: 464ec0b48306beb40ec05f8c8c5f966e19d22c90

Web Compatibility Binding Commit: abbe3334d08cd30ac5cd82c80cb7e2ff953dcc29

## Summary

M5.3 introduces a runtime-neutral Active Trip Context boundary and moves the browser-facing LuviaTripContext projection onto that core without creating a second Trip truth source.

The Active Trip Context core is located at core/trips/active-trip-context.mjs.

The Web client continues to expose window.LuviaTripContext through luvia-trip-context.js as an explicitly temporary Web Runtime Compatibility Binding.

TripStore remains the canonical Trip Truth owner and provider.

## Runtime-neutral Active Trip Context

The new core exposes runtime-neutral reads and subscriptions including snapshot, active Trip, destination, destination name, Trip name, accent and dates.

The core has no DOM, window, document, navigator, localStorage, sessionStorage, Service Worker or other browser-global dependency.

The core performs no Trip mutation and owns no duplicate persisted truth.

## Web Compatibility Binding

luvia-trip-context.js imports the runtime-neutral Active Trip Context core as an ES module.

window.LuviaTripContext remains available for current Web compatibility.

Binding diagnostics accepted in Integration and Production:

- binding = web-runtime-compatibility
- coreVersion = 1.0.0
- provider = LuviaTripStore
- ready = true

The former broad legacy luvia-event subscription was removed from the Trip Context binding.

## Runtime truth proof

Authenticated browser acceptance proved the same Active Trip across:

- LuviaTripStore
- LuviaTripContext
- LuviaTripContractV1
- LuviaTravelContext

The Active Trip Context subscription produced one immediate consistent callback in the accepted browser smoke.

## Integration Preview acceptance

- App/Core 13.82.12 / 4.82.12: PASS
- Web Binding byte-exact to Git release blob: PASS
- Active Trip Context core byte-exact to Git release blob: PASS
- JavaScript ES module MIME: PASS
- Service Worker luvia-shell-v13.82.12: PASS
- force-update appv=13.82.12: PASS
- media-readiness 13.82.12 / 4.82.12: PASS
- Static Asset Privacy: 5 / 5 PASS
- Authenticated browser smoke: PASS
- F5 module-order / continuity proof: PASS
- Booking Control Center after F5: PASS

## Production acceptance

- Main FF-only promotion: PASS
- Main controlled non-force push: PASS
- Production propagation: PASS
- Web Binding byte-exact to Git release blob: PASS
- Active Trip Context core byte-exact to Git release blob: PASS
- JavaScript ES module MIME: PASS
- Production App/Core 13.82.12 / 4.82.12: PASS
- Production Service Worker luvia-shell-v13.82.12: PASS
- Static Asset Privacy: 5 / 5 PASS
- Authenticated production browser smoke: PASS
- Production F5 module-order / continuity proof: PASS
- Auth session preserved: PASS
- Active Trip preserved: PASS
- Trip Context preserved: PASS
- Trip Contract preserved: PASS
- Travel Context preserved: PASS
- Booking Center preserved: PASS

## Regression

- M5.3 focused regression: 2 / 2 PASS
- NFR Foundation: 3 / 3 PASS
- Safe Regression: 34 / 34 PASS
- M5.2 targeted regression retained: 7 / 7 PASS
- NFR-0 closeout registry: PASS

## Retained evidence and warnings

M5.3.3 initially stopped before mutation because the Safe NFR allowlist entry was incorrectly assumed to be cloneable as one complete source line.

Read-only M5.3.3A forensics proved no mutation and identified the actual multi-line Safe structure.

M5.3.3B then performed the intended local version and Safe mutation but stopped at Release Consistency because force-update.html still referenced App 13.82.11.

No commit or push occurred during that failed gate.

M5.3.3C correctly proved repository state but its own generic Release Matrix extractor did not resolve build/core variables and therefore its TOTAL MISSING=0 line is not authoritative.

M5.3.3D used the direct Release Consistency source to establish the exact repair context.

M5.3.3E repaired force-update.html, core/diagnostics/media-readiness.js and the current CURRENT-BUILD header in place and completed the release flow successfully.

Tracking Prevention storage warnings remain retained browser warnings.

DevTools messages reporting completed GET/POST fetches are retained informational messages, not gate failures.

No warning-free Console claim is made.

## Deployment / infrastructure

- Database migration: NONE
- Supabase Edge Function deployment: NONE
- Supabase Secret change: NONE
- Cloudflare Secret change: NONE
- Manual Cloudflare deployment: NONE
- Runtime deployment path: existing automatic GitHub / Cloudflare release path

## Native First Ready status

M5.3 consumes the NFR-0 foundation and introduces a real browserless Active Trip Context core.

The current window-based Trip bindings remain Web compatibility debt and are intentionally deferred to later M5 work.

The correct Travel Context source path is core/context/travel-context-service.js.

## Closeout

This documentation commit is the M5.3 Docs Marker.

M5.3 becomes COMPLETE / CLOSED only when this exact Docs Marker is synchronized across all eight active streams with Local = Tracking = Live, divergence 0 / 0 and clean worktrees.

M5 remains IN PROGRESS after M5.3.

Next: M5.4 Remaining Trip Web Compatibility / Runtime Dependency Reduction.
