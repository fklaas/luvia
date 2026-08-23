# PCR M10.4C — Identity / Trip Overlay Host Adoption

Date: 2026-08-23

Status: FEATURE COMPLETE / INTEGRATION RELEASE GATES PENDING

## Change

Profile Foundation, Guided Discovery, Trip Creator and the Trip Module Editor now delegate their browser-modal lifecycles to the canonical Web Overlay Host. These four active owner surfaces retain their product content, visual CSS and domain commands while sharing stack, focus, Escape/Back, inert background, scroll lock, safe-area and navigation/session cleanup.

Guided Discovery no longer queries and manually marks Profile DOM as inert/hidden. When it opens above Profile, `overlay-host.v1` represents both owner surfaces in one stack and the Web adapter applies top/underlay semantics. Trip Creator's one-off document Escape listener is deleted.

## Scope

- `identity.profile-foundation`.
- `identity.guided-discovery.<domain>`.
- `trip.creator`.
- `trip.module-manager`.
- Existing owner CSS roots are preserved through M10.3 `adopt()`.

## Boundary

- Profile and preference truth remain Identity-owned.
- Trip creation still commits through the Trip owner command; Trip Module configuration ownership is unchanged.
- Existing Module Manager `localStorage` debt remains measured at eight lexical references, and Guided Discovery draft `sessionStorage` debt remains measured at three; neither is disguised as part of this UI-lifecycle migration.
- Timeline/Journey remains a separately reserved cross-domain aggregator and is untouched.
- No new History, browser storage, database, RPC, Edge Function, secret or deployment configuration path.
- Visual token/component reconstruction remains M10.5 Experience Core work.

## Verification

- JavaScript syntax: PASS for all four changed runtime files.
- M10.4C architecture guard: PASS.
- Profile / AI-memory integration: PASS.
- M5.1j Profile Trip Contract adoption: PASS.
- M5.2 and M5.4 Trip isolation regressions: PASS.
- M8 Identity / Event / Native Readiness: PASS.
- M9.6 authenticated-session exit hygiene: PASS.
- Release consistency: PASS at App `13.82.38` / Core `4.82.38`.
- NFR-0 Native First, browserless and browser-global guardrails: PASS.
- Controlled Safe Regression: `63 / 63 PASS`.
- Real Microsoft Edge headless lifecycle proof: PASS.
  - Profile opens as the host-owned top layer and receives initial focus.
  - Guided Discovery opens above Profile; Profile becomes inert and hidden as an underlay.
  - Escape closes only Guided Discovery and restores Profile as an interactive top layer.
  - A second Escape closes Profile and restores the application background.
  - Trip Creator and Trip Module Editor both use host-owned dialog semantics and Escape cleanup.
  - Browser console warnings/errors: `0`.
- Preview/Production acceptance: pending the combined M10 release candidate.
