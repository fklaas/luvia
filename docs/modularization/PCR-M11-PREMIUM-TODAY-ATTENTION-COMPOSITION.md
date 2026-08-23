# PCR – M11 Premium Today and Attention Composition

Status: IMPLEMENTATION COMPLETE / LOCAL GATES PASS / PREVIEW PENDING

Owner: Consumer

Owner stream: `feature/consumer-experience`

## Problem

The canonical Today route is reachable and stable but its top-level composition is a legacy active-Trip hero. Attention, travel phase, premium Experience semantics and the global Luvia assistant are not yet combined into one explicit Consumer-owned view model.

## Impacted contracts

- New additive Consumer presentation contract: `consumer.today-composition.v1`.
- Existing `trip.v1`: consumed read-only through the App Shell projection.
- Existing Consumer travel-identity and attention read models: consumed without taking their source truth.
- Existing `experience.v1`: consumed for visual, state, motion and accessibility semantics.
- Existing `navigation.v1`, `overlay-host.v1` and `NetworkPort`: consumed unchanged.
- Existing Journey/Timeline projection: retained unchanged and explicitly reserved outside the new composition core.

## Backward compatibility

- The `today` route and inline dashboard mount remain unchanged.
- The Dashboard Widget Registry and `[data-widget-grid]` refresh contract remain unchanged.
- The existing Timeline calendar, AI Command Surface, App Shell click delegation and Trip theme remain available.
- No persisted schema or domain command changes.

## Affected files

- Consumer: `app/today/*`, `app/app-shell.js`, `index.html`.
- Offline/release: `sw.js`, `force-update.html`, kernel version metadata.
- Guardrails/documentation: focused M11 test, Safe Regression allowlist, ownership registry and M11 architecture records.

## Test plan

- Browserless VM execution and forbidden-token scan for the pure composition core.
- Deterministic phase, greeting, priority, navigation, provenance and deep-immutability checks.
- Consumer adapter guard against private Stores, DB/Supabase and foreign-domain commands.
- `experience.v1` CSS, 44 px minimum target, focus-visible, responsive and reduced-motion checks.
- App Shell delegate/bind/unbind, asset load order, Service Worker precache and Journey reservation checks.
- Controlled Safe Regression and NFR-0 regression.
- Authenticated browser acceptance for Trip identity, premium Today visibility, AI opening, navigation, attention refresh, Journey calendar, responsive behavior, reload stability and console.

## Infrastructure impact

None. No database, migration, RPC, RLS, bucket, Edge Function, secret, provider or Cloudflare configuration change.

## Rollout and rollback

Ship as one versioned static runtime bundle. Roll back to `5067332492fca8a7df79bb6584c891c973550180` if a gate fails. No data rollback is required.

## Measured local evidence

- App / Core: `13.82.42 / 4.82.42`.
- Focused M11 composition, runtime-render, ownership, load-order, accessibility and Journey-reservation guard: **PASS**.
- NFR-0: **3/3 PASS**.
- Controlled Safe Regression after the version-dependent Trip cache assertions were advanced with the release: **68/68 PASS**.
- Cross-Core DB guardrail: static **316**, mapped debt **26/26**, unmapped object debt **39/39**, dynamic **27/27**; no debt growth.
- Correct Consumer-worktree local server: `.42` Today core, adapter and CSS assets loaded; signed-out public route stable; browser console **0 warnings / 0 errors**.
- Authenticated product acceptance, Integration Preview, Main and Production remain deliberately unclaimed until measured.
