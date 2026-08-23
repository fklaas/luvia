# PCR M10.2 — Intelligence Overlay Host Adoption

Date: 2026-08-23

Status: FEATURE VERIFIED / INTEGRATION RELEASE GATES PENDING

## Change

The visible Luvia Intelligence command proposal, Ask-Luvia dialog and Intelligence Transparency surface now mount through `overlay-host.v1` instead of constructing independent global overlay roots.

Confirmation remains explicit: closing a proposal through Escape, backdrop, Back, navigation or session exit resolves as rejected/not confirmed. Only the explicit confirmation button can continue to the existing owner-command execution path. Ask-Luvia starts focus in its command input; Transparency starts focus on its close action.

## Boundary

- Intelligence continues to own reasoning, proposals and Intelligence-specific state.
- The Overlay Host owns presentation stack, focus, dismissal, layering and Web DOM modality only.
- No Trip, Places, Booking, Identity or Journey/Timeline truth moved.
- No direct History, browser storage, database, RPC, Edge Function, secret or deployment-configuration change occurred.
- Journey/Timeline remains a separately reserved Cross-Domain Aggregator.

## Verification plan

- Runtime JavaScript syntax: PASS.
- Focused Intelligence overlay regression: PASS.
- M8.5 Intelligence isolation preservation: PASS.
- NFR-0: 3/3 PASS.
- Controlled Safe Regression: 59/59 PASS.
- Headless Chromium DOM acceptance: Ask-Luvia focus/ARIA/close PASS; Transparency Escape PASS; command-proposal explicit rejection PASS; final stack/scroll-lock cleanup PASS; console warnings/errors 0.
- Integration Preview and Production acceptance only after remaining M10 owner blocks converge.
