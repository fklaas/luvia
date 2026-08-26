# PCR M16.5R — Places Details/Evidence Continuity

## 1. Decision and boundary

Date: 2026-08-26

Runtime target: App 13.82.65 / Core 4.82.65

Channel: Integration Preview only

M16.5R is the first bounded correction under the binding M16.5 Design
Integration and Feature Productization Plan. It fixes one reproduced continuity
failure in the productive Places spatial composition. It does not claim that
the complete Places Golden Slice, complete M16.5 parity or Design Freeze is
finished, and it does not authorize Main or Production promotion.

## 2. Reproduced failure and root cause

The user reported that opening `Details & Evidenz` for a later horizontally
scrolled Place displayed that Place's data but returned the rail to its
beginning, visually separating the detail from its source result.

The productive implementation confirmed the cause. `loadDetails(id)` called the
global `render()` once for loading and again after the asynchronous `places.v1`
detail response. `render()` destroys the active MapLibre instance and replaces
the entire Places root with `innerHTML`. The replacement necessarily creates a
new result rail at `scrollLeft = 0`, removes the focused detail button and
rebuilds the map from its initial bounds. Selection, scroll, focus and map state
therefore ceased to be one coherent interaction.

This was presentation-state loss in Consumer composition. Places Domain Truth,
coordinates and the public `places.v1` owner boundary were not defective and
were not moved.

## 3. Correction

- Every result now owns a stable, polite live detail region.
- Opening evidence selects that exact Place and synchronizes the existing map
  through the established coordinate-only selection path.
- Loading, success, error and close patch only the owning card's detail region;
  they do not rebuild the result rail or map.
- The original real pointer focus remains on the same detail control and its
  `aria-expanded` state changes in place.
- An identity-checked pending record prevents a late response from reopening a
  detail that the user already closed or superseded.
- Lifecycle/root checks prevent a late detail response from mutating an
  unmounted Places surface.
- External website links created by a detail response are rebound only inside
  that local region and still use `ExternalNavigationPort`.

No CSS, accepted visual geometry, Places contract, database, schema, RLS,
bucket, Edge Function, secret or Cloudflare configuration is changed.

## 4. Evidence

Consumer source commit: `b02956f`

Integration assembly commit: `9b45905`

Focused static guard:

- local detail rendering exists and `loadDetails` contains no global
  `render()`;
- exact Place/map selection, stale-detail fencing, lifecycle fencing,
  fixture/E2E ownership and public contract boundaries: PASS.

Real Edge mobile E2E at 390 × 844:

- the rail was moved to result 4 using the real browser layout;
- a real coordinate pointer click opened result 4 `Details & Evidenz`;
- horizontal rail position remained `1060.0 → 1060.0 → 1060.0` across open,
  asynchronous completion and close;
- result 4 became and remained the selected Place;
- the existing map moved to `[10.78, 54.04]` for result 4;
- map instances/removals remained `1 / 0` during the detail operation;
- the real clicked button retained focus and `aria-expanded` changed in place;
- delayed `places.v1` completion rendered result 4 evidence exactly once;
- console warning/error/page error count: `0`.

Retained screenshot:
`test-results/m16.5r/places-result-4-detail-continuity.png` (local evidence,
not a repository runtime asset).

Consumer Safe Regression: 99 / 99 PASS after synchronizing two already-valid
Q-era guard baselines with the current feature branch. Integration Safe
Regression: 108 / 108 PASS, including NFR-0 3 / 3, Active Trip Context 2 / 2
and the cross-core DB no-growth guard. Public asset parity and authenticated
stable-origin E2E remain release gates for App 13.82.65 and must be recorded
before public acceptance.

## 5. Explicitly still open

- public stable/immutable Integration deployment and exact asset provenance for
  App 13.82.65;
- real visible authenticated stable-origin execution against productive Places
  data;
- explicit user acceptance of this Places continuity correction;
- exhaustive Places discovery/filter/map/detail/favorite/planning/offline
  Golden Slice acceptance;
- all later M16.5 Product Surface Matrix rows and complete Design Freeze;
- any Main or Production promotion.

## 6. Rollback

Before public release, rollback is code-only to Integration commit `8aea1aa`.
After release, the immediately previous accepted Integration runtime remains App
13.82.64, Cloudflare version `20ad47c4-0a93-4d1b-ad91-9ff9f8c372ef`, deployment
`c6878f00-0c18-457f-bd58-7c8b293e3736`. No data compensation is required.
