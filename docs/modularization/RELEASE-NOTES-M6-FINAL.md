# Luvia M6 Final Release Notes — Places Core Isolation

Date: 2026-08-22

Status: **COMPLETE / CLOSED / PRODUCTION VERIFIED**

## Release identity

- Feature: `be839773659039692d5d4b69586490f2584593de`
- Runtime release: `2917bc055409b05fb57199031cb91db7d7f66f73`
- App: **13.82.17**
- Core: **4.82.17**
- Integration Preview version: `c996a818-5b79-47ac-9f7a-3897596b2d1f`
- Production version: `9962d8e5-8c3e-4eb1-bf42-de9df9917c50` at 100% traffic

## Delivered architecture

- Added a browserless Places domain contract core for stable projections and discovery rules.
- Established one declarative Registry for all ten Place categories.
- Expanded the public `places.v1` adapter across search, get, saved, recommend, lifecycle, routing, deep links, imports, planning, and lifecycle commands.
- Registered Web implementations of Location, Permission, Network, DeepLink, ExternalNavigation, and OfflineCache ports outside the domain core.
- Encapsulated Places provider lookup and Intelligence planning/ranking behind a Web composition adapter.
- Removed direct browser geolocation and online-state access from the locked Places/location/lifecycle paths.
- Removed private Trip Context coupling from the active Places/Intelligence entity path.
- Preserved Places truth ownership, Consumer/Experience UI ownership, and separate Timeline/Journey classification.

## Acceptance

- Focused M6 browserless/native-readiness guard: **PASS**
- Safe Regression on Platform, Integration, and Main: **42/42 PASS**
- Integration Preview runtime assets: **18/18 EXACT**
- Integration static privacy: **5/5 SPA-FALLBACK PASS**
- Integration authenticated F5 + release + Places + ten categories: **PASS**
- Integration console warnings/errors: **0/0**
- Main promotion: **FF-only PASS**
- Production GitHub/Cloudflare build: **SUCCESS**
- Production runtime assets: **18/18 EXACT**
- Production static privacy: **5/5 SPA-FALLBACK PASS**
- Production authenticated F5 + release + Places + ten categories: **PASS**
- Production console warnings/errors: **0/0**

## Infrastructure and rollback

- Database migration: **NONE**
- RPC/schema change: **NONE**
- Edge Function change: **NONE**
- Secret change: **NONE**
- Manual Cloudflare configuration change: **NONE**
- Historical NFR-0 baseline mutation: **NONE**
- Rollback: commit-only runtime rollback; no data rollback required

M6 is **COMPLETE / CLOSED**. The next milestone is M7, beginning with read-only inventory and scope lock.
