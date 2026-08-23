# PCR M10.1 — Overlay Host Foundation and First Owner Adoption

Date: 2026-08-23

Status: FEATURE VERIFIED / INTEGRATION RELEASE GATES PENDING

## Change

M10.1 introduces browserless `overlay-host.v1` and hardens the existing `LuviaUI` runtime as the single Web DOM compatibility host. The host now owns stack order, top-only dismissal, one keyboard dispatcher, focus containment, ARIA dialog semantics, background inertness, scroll lock, safe-area padding, reduced-motion behavior and session/navigation cleanup.

Trip Experience, Trip Join Code Entry and Places Experience delegate overlay mounting and dismissal to the shared host. Their Domain Truth, owner commands and persistence paths remain unchanged. Places preserves `luvia:place-overlay-closed` for existing consumers.

## Boundary

- Platform owns the browserless contract and current Web compatibility host.
- Domain/product owners continue to own their content and actions.
- The host owns no Trip, Places, Booking, Media, Identity, Intelligence or Journey truth.
- The host performs no Web History write and exposes a Back command for platform adapters.
- Timeline/Journey is unchanged and remains reserved.
- M10.5 Experience visual primitives are not pulled into this slice.

## Files

- `core/runtime/overlay-host-contract-core.js`
- `core/ui/ui-manager.js`
- `core/trips/trip-experience.js`
- `core/trips/join-flow.js`
- `core/places/place-experience-shell.js`
- `index.html`
- `sw.js`
- architecture, ownership, baseline and regression documentation

## Verification plan

- Syntax check for every changed runtime JavaScript file: PASS.
- Focused `tests/m10.1-overlay-host-foundation.test.cjs`: PASS.
- NFR-0 regression: 3/3 PASS. The first run correctly rejected one additional `WINDOW` token in the Places Domain file; the targeted compatibility-binding repair restored the frozen baseline without changing it.
- Controlled Safe Regression: 58/58 PASS.
- Headless Chromium DOM acceptance: PASS for ARIA dialog semantics, background `inert`, initial focus, forward/reverse focus trap, deterministic stack layering, Escape close, `handleBack`, session cleanup, scroll-lock cleanup and previous-focus restoration; console warnings/errors: 0.
- Integration Preview static/runtime acceptance before Main.
- No COMPLETE, synchronized or Production claim before measured release evidence.
