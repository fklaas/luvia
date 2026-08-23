# Luvia M9.6 / M9 Final — Authenticated Surface Session Exit Hygiene

Date: 2026-08-23

Status: **COMPLETE / CLOSED / PRODUCTION VERIFIED; M9 COMPLETE**

Runtime: **App 13.82.38 / Core 4.82.38**

## What changed

- The App Shell closes Profile Foundation through its public owner command before authenticated modules unmount and Public Entry hydrates.
- Control Center Attention consumes `AuthSessionPort`, clears and pauses its read-only projection during logout/session deactivation, invalidates stale async refreshes and resumes only after canonical session activation plus hydrated Travel Identity.
- A browserless M9.6 regression locks cleanup ordering, unauthenticated Booking-read suppression, safe reactivation and the absence of private Auth/Supabase/browser-storage access.
- The historical Control Center fixture now supplies the public authenticated port required by the production contract.

## Evidence

- Consumer commits `f65b68a0ff194b410d773287ea54b47b9229c971` / `5494d8aed0f416603f1c71b90a58690895392493`;
- Integration / Production commits `c81face994744f38b7389e20d29e173bea6509d9` / `3bca0bab3467c38c9207e01d75ad07926d977b51`;
- Safe Regression **57/57**, NFR-0 **3/3**, focused M9.6 **PASS**;
- Preview `9a51ec22-84f5-469b-993c-63caf7b618fe`: **24/24 exact**, **5/5 privacy**, **2/2 removed-shell fallback**, same-document logout/login, History delta 0, Today/Paris restored, CDP 0;
- Production `1905015c-cf29-46b8-8f9a-402e8fdb3a75` / `27b46a4c-4e43-4835-9d9e-ed83029e6f16`: 100%, identical gates.

## Rejected samples retained

Preview 13.82.36 fixed the visible overlay leak but exposed one deterministic unauthenticated `booking_integration_summary` request and did not move Main. The first Production 13.82.38 deployment exactly matched the Windows Working Copy and normalized to the Git content, but CRLF conversion prevented raw Git-byte equality. The final deployment used a 24/24 verified blob-clean temporary checkout and is the only accepted Production provenance.

## Boundaries and rollback

No DB/schema/RPC/RLS/bucket migration, Edge Function change, secret change, manual Cloudflare configuration change, foreign Domain Truth move or Timeline/Journey reclassification occurred. Rollback is code-only to M9.5 runtime `7773087ede7c72d39bdd235269cd0fc7c2a9d90e` / Production version `56d56a8b-5b1d-46af-bcd2-3cf0fb3e4479`.
