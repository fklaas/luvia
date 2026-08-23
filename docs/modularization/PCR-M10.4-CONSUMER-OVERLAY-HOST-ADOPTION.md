# PCR M10.4 — Consumer Overlay Host Adoption

Date: 2026-08-23

Status: FEATURE VERIFIED / INTEGRATION RELEASE GATES PENDING

## Change

Gallery, Memory Albums, Memory Journeys and Memory Worlds now delegate their active dialog and full-screen overlay lifecycles to the canonical Web Overlay Host. Thirteen owner-classified surfaces retain their existing product DOM and visual CSS while receiving one shared stack, deterministic layering, focus handling, Escape/Back/session/navigation dismissal, inert background, scroll lock and safe-area behavior.

The Gallery destructive-clear promise now settles safely as `false` when the host closes it through Escape, Back, navigation or session exit. Memory Worlds retains its intentional transition timing and `mc-open` visual compatibility class, but cleanup is now attached to the host lifecycle and therefore runs for every close path.

## Scope

- Gallery: cluster title, cluster detail, lightbox, editor, AI Memory Bridge and destructive clear.
- Memories: cluster picker, Moment Journey, experience picker and full Journey.
- Memory Worlds: curation dialog, discovery flow and deck flow.
- Existing owner CSS and DOM roots remain intact through the M10.3 `adopt()` migration surface.
- Timeline/Journey remains a separately classified cross-domain aggregator and was not moved into Places, Media or Consumer domain ownership.

## Boundary

- Consumer Experience owns presentation and interaction, not Trip, Media, Places or Identity truth.
- `overlay-host.v1` owns browser-modal lifecycle; Consumer code no longer appends/removes these roots or owns page scroll locking.
- Memory Worlds `mc-open` remains a temporary visual compatibility hook only; it is not the scroll-lock authority.
- No new History, `localStorage`, `sessionStorage`, database, RPC, Edge Function, secret or deployment configuration path.
- Component/token reconstruction remains M10.5 Experience Core work.

## Verification plan

- JavaScript syntax and M10.4 architecture guard: PASS.
- Existing Gallery/Media, Memory/Media and Trip-contract guards: PASS.
- NFR-0: PASS.
- Controlled Safe Regression: 61/61 PASS.
- Chromium interaction proof: Gallery lightbox, Albums picker and Memory Worlds discovery flow use the canonical owner name/role/kind, inert background and shared scroll lock; Escape closes and restores all compatibility state; console warnings/errors 0.
- Preview/Production acceptance: pending the combined M10 release candidate.
