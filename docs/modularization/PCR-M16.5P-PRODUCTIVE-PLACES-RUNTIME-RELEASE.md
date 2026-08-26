# PCR M16.5P — Productive Places Runtime Release

Date: 2026-08-26

Status: **INTEGRATION CANDIDATE / MAIN AND PRODUCTION LOCKED**

Runtime target: **App 13.82.54 / Core 4.82.54**

## Decision

M16.5P packages the hardened Places owner projection and the accepted light
spatial Places composition as the next immutable Integration candidate. A real
Plan Compass selection now opens the productive Places stage instead of the
legacy guided search. The accepted design remains binding; this is a measured
feature adoption slice, not a reinterpretation of the product.

## Included product behavior

- exact Plan → Places transition through the existing navigation contract;
- non-selected Compass directions fade at their orbital positions instead of
  shrinking toward a shared visual point;
- selected direction pulses, the native two-ended needle aligns, and the
  official Compass returns to the top-left Luvia brand before the route opens;
- open light Places editorial stage with active-Trip accent;
- real Places search, explicit filters and ten canonical categories;
- connected Corporate-light map and result canvas;
- six initial results with explicit expansion up to eighteen;
- marker/result selection, details, favourites, planning, Booking entry and
  external navigation through public owner contracts and Platform ports;
- readable loading, empty, offline, map-unavailable and error behavior.

Checklists and Budget remain visibly reserved. Weather remains a foundation
direction. Booking is real and reachable, but its complete accepted visual
migration is the next product slice and is not claimed by this release.

## Coordinate and owner integrity

Places projects coordinates only from complete finite WGS84 pairs, including
the supported provider `location` shape. Latitude is restricted to `[-90, 90]`
and longitude to `[-180, 180]`. Invalid, half, boolean, blank, non-finite and
out-of-range pairs project to `null`.

The map creates markers only from the public `places.v1` projection. A result
without valid coordinates remains list-visible with an explicit omission
reason; Consumer does not invent, move or infer a marker. Places retains Domain
Truth. Booking and external navigation stay behind their public owner and
Platform boundaries.

## Runtime and dependency scope

The active entry and Service Worker advance together to App 13.82.54 / Core
4.82.54. MapLibre GL JS is pinned to 5.12.0. The remote map style and library
remain a network dependency; if they are unavailable, the product exposes the
map-unavailable state while keeping real result cards usable.

No database/schema/RPC/RLS/bucket migration, Supabase Edge Function, secret or
manual Cloudflare configuration change belongs to this release.

## Acceptance gates

- Places coordinate, composition, public-owner, lifecycle and accessibility
  tests;
- Productive Plan Compass transition regression;
- complete safe-regression allowlist;
- regenerated visual inventory freshness;
- NFR-0 and cross-Core ownership guard;
- authenticated desktop and mobile Browser verification;
- immutable public Integration provenance and cache-key verification.

Main and Production remain locked. Joint acceptance of the entire M16.5
desktop/mobile surface matrix and an explicit Design Freeze are still required
before promotion.

## Rollback

Rollback redeploys the immutable M16.5M Integration candidate or restores the
parent of this runtime release commit. No persisted data requires rollback or
compensation.
