# PCR – M11 Premium Today and Attention Composition

Status: COMPLETE / CLOSED / PRODUCTION VERIFIED

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
- Feature, Integration and Main promotion: fast-forward only; each branch reached runtime commit `e1e642409b65576f92f9f2521d43d1766754ec92` with clean worktree and `0/0` divergence at its release gate.
- Integration Preview stable alias: all ten changed deployable runtime assets are exact Git blobs; five internal/private paths return the exact `index.html` SPA fallback; authenticated App/Core, Paris Trip, Attention, AI open/Escape/focus restoration, Plan navigation, Journey reservation and 390 x 844 responsive acceptance are PASS.
- Integration authenticated reload acceptance: **25/25 PASS**, **3.980-8.077 seconds**, average **4.401 seconds**.
- Main: controlled Safe Regression **68/68 PASS**; NFR-0 **3/3 PASS**; Cross-Core DB guardrail unchanged.
- Production active version: `57d3bb86-0d50-457f-b405-edf8c0b01c60` at **100%**, created `2026-08-23T23:11:46.736Z`; Cloudflare reports source `Unknown (version_upload/deployment)`. It appeared after Main promotion; no manual upload or deploy was performed and causation is not asserted beyond the measured chronology.
- Production version URL and `myluvia.app`: each **10/10 exact Git blobs** and **5/5 private-path SPA fallback**. The proof compares HTTP bytes to canonical Git object IDs, avoiding Windows checkout/archive CRLF effects.
- Production authenticated UX: App/Core **13.82.42 / 4.82.42**, active Paris Trip, `consumer.today-composition.v1`, `Alles ruhig`, exactly one `reserved-read-only` Journey projection, three 48 px actions, AI dialog focus/Escape restoration, safe Plan navigation and 390 x 844 responsive layout with no horizontal overflow: **PASS**.
- Production final clean reload series: **25/25 PASS**, **3.629-4.163 seconds**, average **3.853 seconds**, with version, Trip, Today, Attention and Journey boundary present in every sample.
- A prior deliberately rejected stress series reached only **6/8** within a 10-second locator gate; one diagnostic reload settled correctly at **14.727 seconds**. After load pacing and cooldown, the independent final 25-sample series above supplied the accepted gate. No failed observation was rewritten as PASS.
- Browser evidence exposed no visible runtime error. The final browser-control surface did not expose a separate retrospective console-buffer API, so no unsupported `console 0/0` claim is made for this closeout.

M11 is **COMPLETE / CLOSED / PRODUCTION VERIFIED**.
