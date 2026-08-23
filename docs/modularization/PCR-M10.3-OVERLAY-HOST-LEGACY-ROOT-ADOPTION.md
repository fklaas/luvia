# PCR M10.3 — Overlay Host Legacy Root Adoption

Date: 2026-08-23

Status: FEATURE VERIFIED / INTEGRATION RELEASE GATES PENDING

## Change

The canonical Web Overlay Host can now adopt an existing active overlay root without adding a layout-changing wrapper. The root keeps its owner CSS classes and DOM tree while `overlay-host.v1` assumes stack, focus, dismissal, inert-background, scroll-lock, safe-area and lifecycle semantics.

Host defaults now use zero-specificity `:where(...)` selectors. Existing owner styles therefore remain visually authoritative during incremental migration, while deterministic inline stack layering remains host-owned.

## Boundary

- `adopt()` is an explicit Web compatibility migration surface, not a second host.
- New surfaces should use `mount()` with semantic content.
- Existing Gallery, Albums, Memory Worlds, Profile and Booking surfaces can migrate without a big-bang DOM/CSS rewrite.
- Shared visual tokens and component reconstruction remain M10.5 Experience work.
- No Domain Truth, History, database, RPC, Edge Function, secret or deployment configuration changes.

## Verification plan

- Runtime syntax and focused adoption guard: PASS.
- Existing M10.1 and M10.2 regression: PASS.
- NFR-0: 3/3 PASS.
- Controlled Safe Regression: 60/60 PASS.
- Chromium DOM proof: adopted root identity preserved; already-defined owner `display`, background and padding win over later host defaults; ARIA/inert/focus trap/Escape/scroll-lock/focus restoration PASS; console warnings/errors 0.
