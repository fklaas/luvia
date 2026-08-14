# Deployment - M3.3 / Luvia v13.81.7 / Core 4.81.7

## Change class

Static application / architecture foundation release.

M3.3 adds the `media.v1` runtime contract adapter and completes missing service-worker shell coverage for existing Memory runtime providers.

It does not change database schema, Supabase Edge Functions, storage buckets or secrets.

## Supabase

Database migration: **NO**

SQL deployment: **NO**

Edge Functions: **NO**

New or changed secrets: **NO**

Storage migration: **NO**

Do NOT run:

`npx supabase db push`

Do NOT run migration repair.

Do NOT deploy or redeploy Supabase Functions for M3.3.

Do NOT change Supabase secrets for M3.3.

## Before commit

Run the final regression matrix documented in `TEST-RESULTS-M3.3.md`.

Confirm:

`CURRENT-BUILD.md`

reports:

- App `13.81.7`
- Core `4.81.7`
- Name `M3.3 Media Contract Adapter Foundation`

Confirm:

`intelligence/kernel/version.js`

reports the same release.

Confirm:

`sw.js`

uses:

`luvia-shell-v13.81.7`

Confirm `index.html` loads:

`core/platform/media-contract-adapter.js?v=13.81.7`

after the existing Trip/Places contract adapters and after all Media/Memory owner providers, but before `app/app-shell.js`.

Confirm the changed-file allowlist matches `CHANGED-FILES-M3.3.txt`.

## Commit

Expected commit title:

`M3.3: media contract adapter foundation`

After committing:

`git status --short`

must be empty.

Confirm:

`git --no-pager log -1 --oneline`

shows the intended M3.3 commit.

Push:

`git push origin main`

Then confirm local `HEAD` and `origin/main` are identical.

## Cloudflare deployment

M3.3 is a static Worker deployment.

From the Luvia repository root:

`npx wrangler deploy`

Record the returned Cloudflare deployment/version identifier.

Confirm the new deployment receives production traffic before browser smoke testing.

Do not deploy Supabase Functions as part of this release.

## Production asset verification

After Cloudflare deployment, fetch the production version file without relying on browser cache.

Expected:

- Build `13.81.7`
- Core `4.81.7`
- Name `M3.3 Media Contract Adapter Foundation`

Confirm production `index.html` references:

`core/platform/media-contract-adapter.js?v=13.81.7`

Confirm the production adapter contains:

`const CONTRACT_ID='media.v1'`

If production still serves 13.81.6, do not continue with functional smoke until deployment propagation is confirmed.

## Browser smoke after static deployment

Use a normal production session first.

If the old service worker/cache remains active, open `force-update.html` once and allow it to clear the previous cache before retesting.

Check in this order:

1. Open the app and confirm normal login/auth boot.
2. Open DevTools Console and run `LuviaKernelVersion`.
3. Expected: Core `4.81.7`, Build `13.81.7`, name `M3.3 Media Contract Adapter Foundation`.
4. Run `LuviaMediaContractV1`.
5. Expected: object exists, `contractId === "media.v1"`, `version === "1"`, `runtimeVersion === "1.0.0"`.
6. Run `LuviaMediaContractV1.diagnostics()`.
7. Expected: `ready === true`; Media, Albums, Cards and Journeys providers are all available.
8. Run `LuviaMediaContractV1.listMedia().then(console.log)`.
9. Confirm returned items are safe projections and do not expose `storageBucket`, `storagePath`, `previewPath`, `thumbnailPath`, `contentHash`, raw `metadata` or `userId`.
10. If at least one Media item exists, request a signed preview through the Media ID only. Do not manually construct or inspect a storage path.
11. Run `LuviaMediaContractV1.listAlbums().then(console.log)`.
12. Run `LuviaMediaContractV1.listCards().then(console.log)`.
13. Run `LuviaMediaContractV1.listJourneys().then(console.log)`.
14. Open Gallery and confirm existing photos/media still render.
15. Open Albums and confirm normal loading/navigation.
16. Open Memory views and confirm no boot/navigation regression.
17. Do not clear the whole trip gallery for smoke testing.
18. Do not perform destructive Media mutations merely to test M3.3.
19. Open Places and confirm normal read/navigation behavior still works.
20. Open Booking Control Center and confirm existing Booking read paths still load.
21. Check Console for Luvia-origin errors.
22. Browser-extension errors are not M3.3 regressions.
23. Confirm the service worker is active with the `13.81.7` shell.
24. Hard refresh once and confirm there are no missing-asset errors for `memory-journeys.js`, `memory-cards.js` or `media-contract-adapter.js`.

## Rollback

M3.3 is static/additive and has no database migration.

Rollback by redeploying the previous known-good application build:

`13.81.6 / Core 4.81.6`

or by using the normal Git revert/redeployment procedure.

No database rollback is required.

No migration repair is required.

No Supabase Function rollback is required.

No storage rollback is required.

No secret rollback is required.
