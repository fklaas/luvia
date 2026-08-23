# PCR M10.4B — Booking Overlay Host Adoption

Date: 2026-08-23

Status: FEATURE VERIFIED / INTEGRATION RELEASE GATES PENDING

## Change

Booking's active Place request dialog and the Booking Control Center Modify/Cancel surfaces now delegate browser-modal lifecycle to the canonical Web Overlay Host. Existing Booking DOM, provider-routing behavior, responsive sheets, safe-area styling and evidence-driven mutation rules remain owner-controlled.

The Control Center no longer embeds a fixed modal inside its module root or replaces the mobile module DOM with a second navigation-like surface. Desktop and mobile variants are portaled into one owner-classified sheet host. Normal sheets support Escape/Back dismissal; while a provider mutation is in flight, host dismissal is locked and automatically becomes available again after the mutation settles.

## Scope

- Place request dialog: `booking.place-request`.
- Modify sheet: `booking.control-center.modify`.
- Cancel sheet: `booking.control-center.cancel`.
- Desktop and mobile rendering share one state/lifecycle boundary.
- Navigation and session exit still force-close owned overlays through the App Shell host lifecycle.

## Boundary

- Booking Core remains the sole owner of Booking truth, lifecycle, provider mutation and evidence reconciliation.
- The Overlay Host owns focus, stacking, background inertness, scroll lock and platform dismissal semantics only.
- No Trip, Places, Timeline/Journey, database or provider ownership moved into App Shell or Experience.
- No new History, browser storage, RPC, Edge Function, secret or deployment configuration path.
- Shared token/component reconstruction remains reserved for M10.5 Experience Core.

## Verification plan

- JavaScript syntax and M10.4B architecture guard: PASS.
- Existing Booking owner-flow, control-center and provider regressions: PASS through the current evergreen suite; release-pinned historical assertions remain excluded by design.
- NFR-0: PASS.
- Controlled Safe Regression: 62/62 PASS.
- Chromium interaction proof: Place request, desktop Modify and mobile Cancel host semantics/cleanup PASS; Escape blocked during an in-flight provider mutation and restored after settlement; console warnings/errors 0.
- Preview/Production acceptance: pending the combined M10 release candidate.
