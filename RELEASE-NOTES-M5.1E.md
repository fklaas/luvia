# RELEASE NOTES – M5.1e

## Release

- App: **13.82.4**
- Core: **4.82.4**
- Milestone: **M5 – Trip Core Isolation**
- Slice: **M5.1e – Active App Shell Trip Contract Adoption**
- Status: **COMPLETE**
- Production: **VERIFIED**

## Purpose

M5.1e moves the confirmed active production App Shell away from direct Trip Store / Trip Context truth consumption and onto the canonical Trip Contract.

Trip Core remains the owner of Trip truth. The App Shell remains a consumer and does not create a second Trip truth layer.

## Runtime scope

Changed runtime file:

`app/app-shell.js`

The active App Shell consumes:

- `LuviaTripContractV1`
- compatibility alias `LuviaTripContract`
- `listTrips()`
- `getActiveTrip()`
- `getContext()`
- `subscribe()`

Removed from the active App Shell:

- direct `LuviaTripStore` reads
- direct `LuviaTripStore` subscription
- direct `LuviaTripContext` access

Production verification measured:

- direct `LuviaTripStore` references: **0**
- direct `LuviaTripContext` references: **0**

## Runtime reachability

`app/app-shell.js` is the confirmed active runtime shell. It is loaded by `index.html` and belongs to the Service Worker application shell.

`core/app/app-shell-v11.js` was not proven to be part of the active runtime path and remained unchanged.

## Implementation

Implementation release commit:

`9a148a45af93c8ea2cf4ef5ddd3d3d4f244d155a`

Implementation parent:

`93f94b0276450aa841fccae9e29b0b9b8094f561`

Release:

- App **13.82.4**
- Core **4.82.4**

## Regression

Final Controlled Safe Regression:

- Total: **21**
- Passed: **21**
- Failed: **0**
- Suite: **PASS**

M5.1e evergreen regression:

`tests/m5.1e-active-app-shell-trip-contract-adoption.test.cjs`

Repository guardrail:

- tracked JS/TS files: **327**
- static DB calls: **316**
- mapped cross-core debt: **26 / baseline 26**
- unmapped DB-object debt: **39 / baseline 39**
- dynamic DB calls: **27 / baseline 27**

No known Cross-Core DB debt growth was introduced.

## Integration Preview

- static release verification: **PASS**
- App **13.82.4 / Core 4.82.4**
- live M5.1e App Shell boundary: **PASS**
- authenticated Trip Contract runtime: **PASS**
- active Trip preserved across reload: **PASS**
- Trip count preserved across reload: **7 / 7**
- App Shell present after reload: **PASS**
- browser console after reload: **0 visible warnings / 0 visible errors**

## Main

- fast-forward promotion: **PASS**
- main push: **PASS**
- Local = Tracking = Live Remote: **PASS**
- divergence: **0 / 0**
- working tree: **clean**
- release consistency: **PASS**
- Controlled Safe Regression: **21 / 21 PASS**

## Production

Production:

`https://myluvia.app`

Production identity:

- App: **13.82.4**
- Core: **4.82.4**
- runtime commit: `9a148a45af93c8ea2cf4ef5ddd3d3d4f244d155a`
- Cloudflare Worker Version ID: `854e33a3-9c9f-4426-9173-aee3b63c93f5`

Measured Production gates:

- `npx wrangler deploy`: **PASS**
- release identity: **PASS**
- Service Worker `luvia-shell-v13.82.4`: **PASS**
- Force Update `appv=13.82.4`: **PASS**
- kernel App/Core identity: **PASS**
- Media Readiness identity: **PASS**
- live App Shell M5.1e semantics: **PASS**
- direct TripStore/TripContext truth: **0 / 0**
- local App Shell bytes: **58987**
- Production App Shell bytes: **58987**
- strict UTF-8 decode: **PASS**
- line-normalized exact App Shell match: **PASS**
- authenticated runtime + reload smoke: **PASS**
- active Trip ID preserved: **PASS**
- Trip count: **7 -> 7**
- browser console after reload: **0 visible warnings / 0 visible errors**

## Six-stream synchronization

Runtime acceptance snapshot:

`9a148a45af93c8ea2cf4ef5ddd3d3d4f244d155a`

All six active streams:

- `main`
- `integration`
- `feature/platform-core`
- `feature/booking-core`
- `feature/consumer-experience`
- `feature/social-experience-graph`

were measured with:

- Local = Tracking = Live Remote
- divergence = **0 / 0**
- working tree = **clean**

Result: **6 / 6 PASS**

Post-sync Release Consistency: **PASS**

Post-sync Controlled Safe Regression: **21 / 21 PASS**

## Infrastructure impact

- Database migration: **NONE**
- Supabase Edge Function: **NONE**
- Supabase Secrets: **NONE**
- Cloudflare Secrets: **NONE**
- Provider configuration: **NONE**

## Completion boundary

Implementation, controlled validation, Integration, Preview, Main, Production and runtime-release synchronization are fully evidenced for M5.1e.

This document intentionally does not invent or pre-claim the SHA of the future documentation marker.

M5.1e is **COMPLETE** at this documentation marker. The marker SHA is established by Git and verified after commit; it is not pre-claimed inside the document.

M5 remains **IN PROGRESS**.

M5 Exit Gate remains **NOT YET CLAIMED**.