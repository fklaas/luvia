# Luvia M9.5 — Owner Flow Navigation Convergence

Date: 2026-08-23

Status: **COMPLETE / CLOSED / PRODUCTION VERIFIED; REAL LOGOUT → LOGIN ACCEPTED BY M9.6**

Runtime: **App 13.82.35 / Core 4.82.35**

## What changed

- Added browserless `owner-flow-navigation.v1` effects for Auth, Join and Booking.
- Added one Web adapter that keeps History writes in `LuviaNavigationHistoryV1` and uses formal Platform Ports for storage, sharing, deep links and external navigation.
- Removed the password-login document reload and the Auth logout direct History write.
- Moved Join pending state from direct Web storage to `StoragePort`; Join URL open/clear/complete is now same-document.
- Moved Trip Invite and Booking external handoffs behind Sharing and ExternalNavigation Ports.
- Preserved Booking provider validation, attribution, status and reconciliation ownership.
- Deleted exactly two proven unreachable byte-identical legacy Shell JavaScript files; the separately classified v11 archive remains.

## Evidence

- Platform / Consumer / Booking commits: `cefc35e21e7cebd14ac2215d0e32beca16dc6e80` / `9f47e953adde516d17c697a4daa7278487919e77` / `e84a794ff92fcb10379d8718e558bb735c966bd3`;
- Integration / Production releases: `2cfa11a75cab0cf28d77d578006c0fc025f0f996` / `7773087ede7c72d39bdd235269cd0fc7c2a9d90e`;
- Safe Regression **56/56**, NFR-0 **3/3**, focused M9.5 **3/3**;
- Preview version `563a84f3-c30b-483d-9d87-1bc9f0cb4ff4`: **23/23 exact**, **5/5 privacy**, **2/2 removed SPA fallback**, **25/25 authenticated F5**, same-document Join cleanup, active Trip/View retained, console **0/0**;
- Production version `56d56a8b-5b1d-46af-bcd2-3cf0fb3e4479`: same gates and **25/25 authenticated F5**, console **0/0**.

## M9.6 closure of the original remaining gate

At the original M9.5 release, the authenticated sessions were not destroyed without an authorized credential source for restoration, so no real credential cycle was claimed. M9.6 later received explicit authorization, found and repaired the Profile-overlay cleanup defect plus the session-exit Booking projection race, and passed the real same-document logout/login cycle on Preview and Production. See `RELEASE-NOTES-M9.6.md` for the final M9 evidence.

## Boundaries

No database migration, schema/RPC/RLS/bucket change, Edge Function change, secret change, manual Cloudflare configuration change, foreign Domain Truth move or Timeline/Journey reclassification occurred.

Rollback is code-only to M9.4 synchronized marker `1a21b4a3c01fa103c0c380272a84fe3d4c9a6b74` / Production version `93f9bc43-e25e-45c5-b727-15d31e41a33d`.
