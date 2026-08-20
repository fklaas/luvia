# Luvia Test Results — NFR-0 Native First Ready

Date: 2026-08-20

App/Core: 13.82.11 / 4.82.11

Foundation Commit: a64e6c0fd3bd5954fe29571f8c4ea128f265a201

Repair Commit: c57aec1912578e3b4e5ea31e1a8e9f4ed5b75a27

## NFR inventory and architecture gates

NFR-0.1A Browser Dependency Inventory: PASS.

Source files scanned: 546 / 546.

Total findings: 8008.

Domain-relevant files: 186.

Domain-relevant findings: 3149.

NFR-0.1B Architecture Classification and Native Readiness Debt Baseline: PASS.

NFR-0.2 Native First Foundation Build: PASS.

NFR-0.3 Platform and Integration Remote Convergence: PASS.

NFR-0.4 Integration Preview and Static Asset Hardening: PASS after repair.

NFR-0.5 Production Static / Privacy Acceptance: PASS.

NFR-0.6 Authenticated Production Browser Smoke: PASS.

## Regression summary

NFR Foundation Regression: 3 / 3 PASS.

Safe Regression: 33 / 33 PASS.

Safe Regression NFR registration: exactly once.

M5.2 Remaining Trip Consumer Isolation: 7 / 7 PASS.

Preview Static Asset Privacy: 5 / 5 PASS.

Production Static Asset Privacy: 5 / 5 PASS.

## Preview evidence

core/platform/native/platform-port-registry.mjs matched the authoritative Git commit blob byte-exact.

Windows working-copy hash differences were proven to be CRLF checkout transformation caused by core.autocrlf=true; Git blob and deployed Preview bytes were identical.

The old M5.2 marker did not contain the NFR Platform Port Registry module.

## Static Asset Exposure incident

Initial Integration Preview acceptance proved a real Static Asset Exposure:

config/luvia-native-readiness-debt.json was publicly served byte-exact.

The release was stopped before Main.

Repair commit: c57aec1912578e3b4e5ea31e1a8e9f4ed5b75a27.

Test-first hardening assertion: RED before .assetsignore repair, GREEN after repair.

Preview propagation showed exposure until deployment update, then the protected path returned the normal HTML fallback and no internal NFR markers.

Final Preview privacy: 5 / 5 PASS.

Final Production privacy: 5 / 5 PASS.

## Authenticated Production Browser Smoke

Production origin correct: PASS.

Document ready and application DOM populated: PASS.

Version asset HTTP 200: PASS.

App/Core identity 13.82.11 / 4.82.11: PASS.

NFR Platform Port Registry live: PASS.

Service Worker registered: PASS.

Browser Static Asset Privacy: 5 / 5 PASS.

LOGIN SESSION PRESERVED = YES.

ACTIVE TRIP LOADED = YES.

BOOKING CENTER LOADS = YES.

BOOKINGS / CONTENT VISIBLE = YES.

F5 RELOAD PRESERVED SESSION + ACTIVE TRIP = YES.

NO RED RUNTIME EXCEPTION = YES.

NO AUTH/API 401 / 403 / 500 OBSERVED = YES.

## Retained warnings

Tracking Prevention warnings observed.

Geolocation browser violation warning observed from global-location-bootstrap.js?v=13.82.11.

These warnings did not produce an observed red runtime exception and did not invalidate the authenticated smoke.

## Mutation / infrastructure status

App/Core version bump: NONE.

DB migration: NONE.

Supabase Function change: NONE.

Secret change: NONE.

Manual Cloudflare deploy: NONE.

## Closeout condition

This result set becomes the formal NFR-0 exit evidence after the Docs Marker is synchronized to all eight active streams.
