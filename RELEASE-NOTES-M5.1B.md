# Release Notes — M5.1b Gallery View Trip Contract Adoption

**Status:** LOCAL VERIFIED / STAGED / NOT COMMITTED / NOT RELEASED
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
- `CURRENT-BUILD.md` distinguishes the 13.82.1 feature candidate from the still-current 13.82.0 production runtime.

## Data and backend impact

- Database migration: **NO**
- SQL deployment: **NO**
- Supabase RPC change: **NO**
- Supabase Edge Function change/deployment: **NO**
- Supabase or Cloudflare secret change: **NO**
- Storage/schema change: **NO**
- destructive or corrective data operation: **NO**
- legacy removal: **NO**

## Local validation evidence

- focused test-first RED proof: **PASS AS EXPECTED** — the new gate failed before implementation only on the missing M5.1b boundary;
- JavaScript syntax: **PASS**;
- targeted Gallery Trip Contract regression: **3 / 3 PASS**;
- release consistency: **PASS** — App 13.82.1 / Core 4.82.1;
- controlled safe regression: **18 / 18 PASS**;
- cross-core DB ownership debt growth: **NONE**;
- direct Gallery Store/Context/AppState, legacy Trip-event, DB and RPC references: **0**;
- `git diff --check`: **PASS**;
- approved working-tree scope prepared: **12 / 12 files**.

See `TEST-RESULTS-M5.1B.md` for the recorded local evidence.

## Promotion status

- Staging inspection: **PASS** — exact 12 / 12 approved files, zero unstaged and zero untracked files
- Commit: **NOT YET PERFORMED**
- Push to `origin/feature/platform-core`: **NOT YET PERFORMED**
- Integration merge/regression: **NOT YET PERFORMED**
- Integration preview static or authenticated smoke: **NOT YET PERFORMED**
- Main promotion/regression: **NOT YET PERFORMED**
- Production deployment or runtime smoke: **NOT YET PERFORMED**
- Active-stream synchronization: **NOT YET PERFORMED**

No commit SHA, remote SHA, Cloudflare version ID, preview state, production state or stream-synchronization result is claimed in this local evidence document.

The currently verified production runtime remains M5.1a at App 13.82.0 / Core 4.82.0 until the controlled M5.1b promotion path is completed.

M5.1b is locally implemented and verified, but it is not committed or released. M5 and its exit gate remain in progress.
