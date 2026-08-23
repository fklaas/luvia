# PCR M10.4D — Places Overlay Host Adoption

Date: 2026-08-23

Status: FEATURE COMPLETE / INTEGRATION RELEASE GATES PENDING

## Change

The remaining active Places-owned planning, photo-detail and restaurant-workspace surfaces now delegate their browser-modal lifecycles to the canonical Web Overlay Host. Their existing product DOM, owner CSS, Places commands and Timeline handoff remain intact while stack order, focus, Escape/Back, backdrop policy, inert background, scroll lock, navigation/session cleanup and safe-area handling are centralized.

## Scope

- `places.final-planning`: the final Places recommendation-to-Timeline sheet.
- `places.detail-photo`: the canonical Place Detail photo viewer used across Place categories.
- `places.restaurant-workspace`: the Restaurant planning, reservation, notes and lifecycle sheet.
- The obsolete Restaurant-only gallery binder is classified as unreachable because the active canonical detail renderer emits `data-place-gallery`, never `data-rv2-gallery`. Its deletion is kept separate from the active-lifecycle migration.

## Boundary

- Places truth, import, lifecycle and planning commands remain behind `places.v1` and existing Places owner services.
- Timeline/Journey is not reclassified as a normal Places consumer. Its three measured raw overlay mounts remain reserved for the dedicated M10 Journey/Timeline audit.
- The Overlay Host owns presentation lifecycle only and receives no Place or Timeline truth.
- No History writes, browser storage, database migration, RPC, Edge Function, secret or deployment-configuration change.
- Shared visual primitives remain M10.5 Experience Core work.

## Verification

- JavaScript syntax and M10.4D architecture guard: PASS.
- M4.3 Places architecture evergreen regression: PASS.
- M6.1 Places State Core: PASS.
- M6.2 Places Runtime Projection Core: PASS.
- M6 FINAL Places Domain / Native Readiness: PASS.
- Place Detail capability routing: PASS.
- NFR-0 Native First, browserless and browser-global guardrails: PASS; browser debt did not grow.
- Controlled Safe Regression: `64 / 64 PASS`.
- Real Microsoft Edge headless lifecycle proof: PASS.
  - Final Places planning opens host-owned with dialog semantics, date focus and Escape cleanup.
  - Canonical Place Detail photo opens above its detail sheet, makes the detail an inert underlay, then restores it after Escape.
  - Restaurant workspace opens host-owned, preserves planning-time focus and emits its return-view signal after host dismissal.
  - Final overlay depth after cleanup: `0`.
  - Browser console warnings/errors: `0`.
- Preview/Production acceptance: pending the combined M10 release candidate.
