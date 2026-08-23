# PCR M9.6 — Authenticated Surface Session Exit Hygiene

Status: IMPLEMENTED / RELEASE ACCEPTANCE PENDING
Date: 2026-08-23
Milestone: M9 — App Shell I: Runtime & Navigation

## Measured baseline

The real Preview logout removed the authenticated App Shell, published `SIGNED_OUT` and rendered Public Entry without reloading the document. The open Profile Foundation overlay nevertheless remained mounted and exposed the previous profile and trip projection above the signed-out surface. Console errors remained at zero, so this was a lifecycle cleanup defect rather than an Auth or rendering failure.

## Ownership and scope lock

- Auth session truth remains owned by Supabase Auth through `AuthSessionPort`.
- `runtime-signal-web-adapter.js` remains the only Web adapter translating Auth, lifecycle and network port state into `app-runtime-signals.v1` effects.
- Profile Foundation continues to own its public `close()` cleanup command.
- The Consumer App Shell already owns ordered handling of `session.deactivate`; it now invokes that owner command before module unmount and signed-out hydration.
- The fix creates no Auth listener, session cache or second identity truth.
- No Trip, Places, Media, Booking, Intelligence or Timeline/Journey ownership changes.

## Mutation

`app/app-shell.js` now closes the authenticated Profile Foundation surface when the canonical Runtime Action reports `session.deactivate`. Stale deactivation effects are still ignored while `AuthSessionPort` reports an authenticated session. A focused regression locks cleanup-before-unmount-before-signed-out-hydration ordering and forbids private Auth or browser-storage reads in that branch.

## Native First Ready

The behavioral decision remains in the browserless Runtime Signal Policy and is derived from `AuthSessionPort`. The App Shell performs Web Experience orchestration only. It adds no direct Supabase access, browser storage access, navigation or domain mutation, and the NFR-0 historical browser-debt baseline remains unchanged.

## Release boundaries

- Database migration: none.
- Edge Function change: none.
- Secret change: none.
- Manual Cloudflare configuration: none.
- Preview and Production real Logout/Login acceptance must both prove: signed-out surface, zero authenticated overlay, same document time origin, successful password login, restored shell/trip/view and zero console errors.
