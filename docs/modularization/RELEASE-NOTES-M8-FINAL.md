# Release Notes — M8 FINAL Identity / Event Contracts / Native Readiness

Date: 2026-08-23

Status: **COMPLETE / CLOSED / PRODUCTION VERIFIED**

Runtime: **App 13.82.23 / Core 4.82.23**

## Commits

- source-lock marker: `7dd23bffe497f5cd780c816f0bb9400d40b78af8`;
- feature: `2894f6f36f6905e7dd6314492e7624019478810d`;
- runtime release: `34808b0f35352e16d36040ae2090e976a08cb0b8`.

## Architecture result

M8 closes with one browserless Identity state and rule owner plus one browserless, delivery-neutral Event Envelope foundation. Identity owns the global viewer profile and explicitly confirmed preferences. Trip context remains Trip-owned; observed learning signals remain Intelligence-owned until the user confirms them. The public `identity.v1` projection excludes private authentication fields and legacy Trip compatibility metadata.

`events.v1` standardizes event name, owner, source, subject, correlation and causation metadata without moving the underlying business truth. `booking.confirmed`, `place.saved`, `trip.completed`, `memory.created`, `identity.changed`, `preferences.changed` and `notification.intent.created` share the envelope. Events never deliver browser notifications automatically.

Profile and Auth no longer access browser storage directly (**27 -> 0**). Web implementations of StoragePort, SecureStoragePort, AuthSessionPort and NotificationPort are registered (**4/4**). Supabase remains the Web session/token owner; the Web SecureStorage adapter accurately reports origin-scoped, non-hardware-backed protection and does not create a second token store.

## Visible product result

The new Control Center route **Identity & Privacy** makes the boundary useful and visible. It shows profile clarity, explicit versus observed preference provenance, session ownership, Web protection level, all four native Platform Ports, notification policy and the versioned Event Envelope. The surface is responsive, reduced-motion aware and owns no Identity, Trip, Intelligence or Event truth.

## Verification

- browserless Identity State/Contract Core: **PASS**;
- browserless `events.v1` Envelope Core: **PASS**;
- focused M8 guard: **PASS**;
- M3.4 Identity regression and profile preference payload/rollback: **PASS**;
- NFR-0 Foundation Regression: **3/3 PASS**;
- Safe Regression on Platform, Integration and Main: **48/48 PASS**;
- DB ownership guard: static calls **316**, mapped debt **26/26**, unmapped debt **39/39**, dynamic debt **27/27**, no growth;
- Integration Preview: **21/21 byte-exact runtime assets**, **5/5 private-path SPA fallback**, authenticated Identity Center acceptance, App/Core 13.82.23/4.82.23, active Trip, **25/25 authenticated F5**, console **0 warnings/errors**;
- Production: **21/21 byte-exact runtime assets**, **5/5 private-path SPA fallback**, App/Core release assets, **25/25 public F5**, console **0 warnings/errors**.

The available Production browser profile had no authenticated Production-origin session. Therefore no authenticated-Production claim is made. Product behavior was authenticated in Integration; exact Git-blob equality proves that the same 21 release assets are active in Production. This is an explicit provenance inference, not a fabricated authenticated smoke result.

## Deployment provenance

- Integration Preview version: `d36c6bb8-541d-4a77-b6b6-13ccb6ac2cb4`, number 532, alias `integration`, `has_preview=true`;
- Integration build/check: `d28bf78e-6bd8-48b1-90e6-3e36cb0c0a23` / `97178357197`, **SUCCESS**;
- Production version: `1472c0d6-d390-4a4d-b613-301399a5b620`, number 533, **100% traffic**;
- Production deployment: `18b1524e-1f8b-40c7-8821-bc09940f13b9`;
- Production build/check: `330ed0ca-9962-40b8-9638-ea2af03df70b` / `97179308782`, **SUCCESS**.

## Infrastructure and rollback

No database migration, schema/RPC/RLS/bucket change, Edge Function, secret, manual Production deployment or manual Cloudflare configuration mutation occurred. The historical `config/luvia-native-readiness-debt.json` remains an unchanged NFR-0 evidence snapshot.

Rollback is code-only: remove the two browserless cores, four Web port bindings and Identity Center, restore the former Web profile/auth metadata paths, and restore the former `identity.v1` rule implementation. No canonical DB data or cloud configuration rollback is required.

M8 is **COMPLETE / CLOSED**. M8.5 starts from a fresh read-only Intelligence classification, dependency and runtime-reachability baseline; no bulk move is pre-authorized.
