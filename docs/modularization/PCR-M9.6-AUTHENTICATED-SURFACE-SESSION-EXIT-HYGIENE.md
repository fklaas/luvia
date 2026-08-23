# PCR M9.6 — Authenticated Surface Session Exit Hygiene

Status: **COMPLETE / CLOSED / PRODUCTION VERIFIED; M9 EXIT GATE CLOSED**
Date: 2026-08-23
Milestone: M9 — App Shell I: Runtime & Navigation

Implementation: Consumer cleanup `f65b68a0ff194b410d773287ea54b47b9229c971`; session-exit read guard `5494d8aed0f416603f1c71b90a58690895392493`.

Runtime releases: Integration `c81face994744f38b7389e20d29e173bea6509d9`; Production `3bca0bab3467c38c9207e01d75ad07926d977b51`.

## Measured baseline

The real Preview logout removed the authenticated App Shell, published `SIGNED_OUT` and rendered Public Entry without reloading the document. The open Profile Foundation overlay nevertheless remained mounted and exposed the previous profile and trip projection above the signed-out surface. Console errors remained at zero, so this was a lifecycle cleanup defect rather than an Auth or rendering failure.

The first repaired Preview candidate proved the overlay cleanup and same-document Login restoration, but the isolated Console gate then exposed one unauthenticated `booking_integration_summary` read during the session transition. Candidate App/Core 13.82.36 / 4.82.36 therefore stopped before Main and is retained as a failed Console acceptance sample.

## Ownership and scope lock

- Auth session truth remains owned by Supabase Auth through `AuthSessionPort`.
- `runtime-signal-web-adapter.js` remains the only Web adapter translating Auth, lifecycle and network port state into `app-runtime-signals.v1` effects.
- Profile Foundation continues to own its public `close()` cleanup command.
- The Consumer App Shell already owns ordered handling of `session.deactivate`; it now invokes that owner command before module unmount and signed-out hydration.
- The Consumer Control Center Attention aggregator consumes `AuthSessionPort`, suppresses projection refresh as soon as the public logout lifecycle starts, invalidates stale refresh completions and re-enables reads only after canonical session activation plus a hydrated Travel Identity signal.
- The fix creates no Auth listener, session cache or second identity truth.
- No Trip, Places, Media, Booking, Intelligence or Timeline/Journey ownership changes.

## Mutation

`app/app-shell.js` now closes the authenticated Profile Foundation surface when the canonical Runtime Action reports `session.deactivate`. Stale deactivation effects are still ignored while `AuthSessionPort` reports an authenticated session. `app/control-center/control-center-attention-service.js` now clears and pauses its read-only attention projection during session exit and rejects stale refresh completion. A focused browserless regression locks cleanup ordering, proves unauthenticated Booking reads are suppressed, proves post-activation Travel Identity may refresh again and forbids private Auth or browser-storage reads.

## Native First Ready

The behavioral decision remains in the browserless Runtime Signal Policy and is derived from `AuthSessionPort`. The App Shell performs Web Experience orchestration only. It adds no direct Supabase access, browser storage access, navigation or domain mutation, and the NFR-0 historical browser-debt baseline remains unchanged.

## Release boundaries

- Database migration: none.
- Edge Function change: none.
- Secret change: none.
- Manual Cloudflare configuration: none.
- Preview and Production real Logout/Login acceptance both prove: signed-out surface, zero authenticated overlay, same document time origin, successful password login, restored shell/trip/view and zero console errors.

## Measured release evidence

- Focused M9.6 regression: **PASS**.
- NFR-0: **3/3 PASS**.
- Safe Regression: **57/57 PASS** on Consumer, Integration and Main candidates.
- Integration Preview: App/Core **13.82.37 / 4.82.37**, version `9a51ec22-84f5-469b-993c-63caf7b618fe`, **24/24 Git-blob exact**, **5/5 private-path SPA fallback**, **2/2 removed-shell SPA fallback**.
- Preview real cycle: authenticated Today/Paris -> Profile/Security -> logout -> signed-out Public Entry -> credentialed login -> Today/Paris restored; document time origin unchanged, History delta **0**, profile overlay/email/trip leakage **0**, CDP warning/error/exception count **0**.
- Production: App/Core **13.82.38 / 4.82.38**, final version `1905015c-cf29-46b8-8f9a-402e8fdb3a75` at **100%** in deployment `27b46a4c-4e43-4835-9d9e-ed83029e6f16`.
- Production static acceptance: **24/24 Git-blob exact**, **5/5 private-path SPA fallback**, **2/2 removed-shell SPA fallback**.
- Production real cycle: identical privacy, same-document, History, credential restoration, Today/Paris and isolated CDP **0** gates all PASS.

Candidate App/Core **13.82.36 / 4.82.36** remains rejected because the repaired overlay cycle exposed one deterministic unauthenticated `booking_integration_summary` request. It never moved Main. The first 13.82.38 manual deployment version `863de1cb-f2a2-43a4-b017-61e7159eaa7b` served 24/24 Windows working-copy bytes and normalized 24/24 to the Git blobs, but only 1/24 was raw Git-byte exact because of CRLF checkout conversion. It is retained as a non-pass provenance sample. The final deployment came from an isolated `core.autocrlf=false` checkout that passed 24/24 local blob provenance before Cloudflare mutation.

No database/schema/RPC/RLS/bucket migration, Edge Function change, secret change, manual Cloudflare configuration change or Domain Truth reassignment occurred. Timeline/Journey remains separately reserved. Rollback is code-only to M9.5 Production runtime `7773087ede7c72d39bdd235269cd0fc7c2a9d90e` / Production version `56d56a8b-5b1d-46af-bcd2-3cf0fb3e4479`.

M9 is **COMPLETE / CLOSED / PRODUCTION VERIFIED**. M10 must begin from the final synchronized documentation marker with a new read-only baseline and scope lock.
