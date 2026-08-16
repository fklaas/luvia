# Release Notes — M5.1b Gallery View Trip Contract Adoption

**Status:** PRODUCTION VERIFIED / SIX STREAMS SYNCHRONIZED
**Masterplan:** M5 — Trip Core Isolation, Durchführung Punkt 1
**App:** 13.82.1
**Core:** 4.82.1
**Contract:** existing `trip.v1`, unchanged at major version 1
**Date:** 2026-08-16

## Outcome

The productive Gallery View now consumes the versioned Trip owner contract for both of its active-Trip reads.

`app/gallery-view.js` obtains:

- destination name and normalized coordinates from `trip.v1.getActiveTrip()` for the existing photo/place context;
- the current Trip title from `trip.v1.getActiveTrip()` for the Gallery ZIP label.

The two direct `LuviaTripStore` reads were removed. Gallery does not use `LuviaTripContext`, `LuviaAppState`, a local Trip cache, a Trip subscription or another fallback truth.

## Runtime design

- `LuviaTripContractV1` is the primary runtime surface.
- `LuviaTripContract` remains the supported latest-major alias.
- Contract lookup is lazy because the Gallery script is loaded before the adapter but invoked after App Shell startup.
- Each existing action reads the current active Trip, so a Trip switch does not require Gallery-owned state or a subscription.
- The neutral no-Trip download label remains `Luvia Galerie`.

## Compatibility

- The public `window.LuviaGalleryView` surface remains unchanged.
- Gallery mount, unmount, refresh, viewing, editing, upload, deletion, Realtime and Media behavior remain outside the change.
- The existing photo/place context retains destination name, latitude and longitude.
- The Gallery ZIP label retains the current Trip title.
- `trip.v1` remains at major version 1; its specification and adapter are unchanged.
- No App Shell, navigation, CSS, UI or event change was required.
- No feature flag was introduced.

## Release integration

- all 214 active `index.html` cache-busting references use App 13.82.1;
- Service Worker cache is `luvia-shell-v13.82.1`;
- force-update targets App 13.82.1;
- kernel release identity is App 13.82.1 / Core 4.82.1;
- kernel aliases remain intact;
- Media Readiness changed only its three required release labels;
- the `index.html` semantic shape is unchanged apart from the version token;
- `CURRENT-BUILD.md` identifies App 13.82.1 / Core 4.82.1 and release commit `68e7ff5433e4581eb3c19ef98934302736be84ec` as the current production runtime.

## Data and backend impact

- Database migration: **NO**
- SQL deployment: **NO**
- Supabase RPC change: **NO**
- Supabase Edge Function change/deployment: **NO**
- Supabase or Cloudflare secret change: **NO**
- Storage/schema change: **NO**
- destructive or corrective data operation: **NO**
- legacy removal: **NO**

## Validation evidence

- focused test-first RED proof: **PASS AS EXPECTED** — the new gate failed before implementation only on the missing M5.1b boundary;
- JavaScript syntax: **PASS**;
- targeted Gallery Trip Contract regression: **3 / 3 PASS**;
- release consistency: **PASS** — App 13.82.1 / Core 4.82.1;
- controlled safe regression: **18 / 18 PASS**;
- cross-core DB ownership debt growth: **NONE**;
- direct Gallery Store/Context/AppState, legacy Trip-event, DB and RPC references: **0**;
- `git diff --check`: **PASS**;
- approved working-tree scope prepared: **12 / 12 files**.

See `TEST-RESULTS-M5.1B.md` for the recorded validation and rollout evidence.

## Promotion status

- Staging inspection: **PASS** — exact 12 / 12 approved files, zero unstaged and zero untracked files
- Commit: **PASS** — `68e7ff5433e4581eb3c19ef98934302736be84ec`
- Parent baseline: `0a2aa60564a75f4723ca11807905f669702e2437`
- Commit subject: `feat(m5): adopt trip contract in gallery view`
- Push to `origin/feature/platform-core`: **PASS**, post-push divergence `0 / 0`
- Fast-forward to `integration`: **PASS**, no merge commit
- Integration controlled regression: **18 / 18 PASS**
- Integration Preview static and authenticated smoke: **PASS**
- Integration Cloudflare version: **184**, ID `5272ac11-6b95-4866-86fa-82b8dd610200`
- Fast-forward to `main`: **PASS**, no merge commit
- Main controlled regression: **18 / 18 PASS**
- Production static and authenticated smoke: **PASS**
- Production Cloudflare version: **185**, ID `14a8e2eb-385b-4e2a-80bb-e8056952a991`
- Production deployment: `749d237e-47ce-4e71-a1e9-349e4fb9cbc4`, **100 % traffic**
- Active-stream synchronization: **6 / 6 PASS** at `68e7ff54`, local/tracking/live divergence `0 / 0`, clean worktrees
- Force pushes: **NONE**

The 6 / 6 clean-tree statement records the runtime-release snapshot at `68e7ff54` before this four-file documentation closeout. The later closeout commit is not pre-claimed and must be inspected, promoted and synchronized separately.

## Runtime verification

Integration Preview and Production both confirmed:

- App 13.82.1 / Core 4.82.1;
- Service Worker `luvia-shell-v13.82.1`;
- active Trip `Paris Hochzeitstag` and destination Paris;
- Gallery with 51 photos, 10 photo moments and Realtime active;
- four day counts of 20 / 27 / 4 / 0;
- active Trip, Gallery state and release identity remain correct after reload;
- browser console reports zero errors and zero warnings;
- internal repository paths return the protected SPA fallback rather than repository contents;
- deployed `index.html`, kernel, Service Worker and Gallery source match the released Git artifact after line-ending normalization.

## Behavior-evidence boundary

The authenticated browser smokes prove the deployed current-Trip Gallery load and reload path. The focused deterministic 3 / 3 runtime test separately proves the state variants that should not be manufactured in the cloud-synchronized user account:

- the primary `LuviaTripContractV1` path and supported latest-major alias;
- contract availability after Gallery script evaluation;
- a changed active Trip is observed without a Gallery cache;
- destination name and normalized coordinates reach the existing photo/place context;
- the current Trip title reaches the logical Gallery collection label;
- no active Trip produces the logical label `Luvia Galerie` and null destination values;
- forbidden legacy globals are not touched and the public Gallery API remains unchanged.

No live Trip was switched, archived or cleared merely to manufacture evidence. No actual Gallery ZIP was downloaded during the closeout follow-up. This combined evidence method preserves the cloud-synchronized user truth and records exactly which behaviors were proven by each gate.

## Runtime observations

- Preview Gallery temporarily showed its loading/zero state and settled after roughly 9–15 seconds.
- Production Gallery temporarily showed the same existing loading state and settled after roughly 20 seconds.
- After one production reload, an exact text locator timed out although the final DOM already contained the full correct Gallery state; the result was confirmed from the main view and all four day buttons.
- M5.1b changes neither Gallery loading, Media, Storage nor Realtime behavior, and the observations did not reproduce as Trip or Gallery data loss.

M5.1b is complete for implementation, validation, controlled promotion, Preview, Production and runtime-release synchronization. M5 and its exit gate remain in progress.
