# Deployment — M3.2 / Luvia v13.81.6 / Core 4.81.6

## Change class
Static application / architecture foundation release. M3.2 adds the `places.v1` runtime contract adapter and one local PlaceCore compatibility method. It does not change database schema, Supabase Edge Functions or secrets.

## Supabase
Database migration: **NO**

SQL deployment: **NO**

Edge Functions: **NO**

New or changed secrets: **NO**

Do not run `npx supabase db push`, migration repair, schema restore or function deployment for M3.2.

Before deployment, only confirm that the repository is on the intended M3.2 commit and that the working tree is clean after the commit.

## Cloudflare
1. From the Luvia repository root, run all release tests documented in `TEST-RESULTS-M3.2.md`.
2. Confirm `CURRENT-BUILD.md` reports App `13.81.6`, Core `4.81.6`, name `M3.2 Places Contract Adapter Foundation`.
3. Confirm `sw.js` uses `luvia-shell-v13.81.6`.
4. Confirm `index.html` loads `core/platform/places-contract-adapter.js?v=13.81.6` after the existing Places providers and before `app/app-shell.js`.
5. Deploy the static Worker:
   `npx wrangler deploy`
6. Record the returned Cloudflare Version ID / deployment identifier.
7. Confirm the new deployment receives 100% production traffic before browser smoke testing.
8. Do not redeploy Supabase Functions for this build.

## Browser smoke after static deployment
Use a normal production session and then, if cache behavior is suspicious, use `force-update.html` once to clear the old service worker/cache.

Check in this order:

1. Open the app and confirm login/auth boot works normally.
2. Open DevTools Console and run:
   `LuviaKernelVersion`
   Expected: Core `4.81.6`, Build `13.81.6`, name `M3.2 Places Contract Adapter Foundation`.
3. Run:
   `LuviaPlacesContractV1`
   Expected: object exists, `contractId === "places.v1"`, `version === "1"`.
4. Run:
   `LuviaPlacesContractV1.diagnostics()`
   Expected: `ready === true` and the existing Places core/gateway/command providers are available.
5. Run:
   `LuviaPlacesContractV1.snapshot()`
   Expected: immutable public Places snapshot; no backend/RPC/provider-private fields.
6. Open Places and verify normal category navigation still works.
7. Run a normal read-only Places search such as food/restaurant discovery. Confirm results render. Search latency is a known separate product issue and is not an M3.2 release failure unless search no longer works.
8. Open an existing Place detail. Confirm details render and no raw provider payload becomes visible in UI/console contract output.
9. Verify a normal existing favorite/planning interaction only if it is safe in the current test trip. Confirm existing UX remains intact.
10. Do not create a real restaurant reservation merely for M3.2 smoke testing.
11. Open Booking Control Center and confirm existing Booking read paths still load.
12. Open gallery/memory areas and confirm no boot or navigation regression.
13. Check Console for Luvia-origin errors. Browser-extension errors are not M3.2 regressions.
14. Confirm the service worker is active with the `13.81.6` shell and that a hard refresh does not produce missing-asset errors.

## Rollback
M3.2 is static/additive and has no database migration. Roll back by redeploying the previous known-good application commit/build (`13.81.5 / Core 4.81.5`) or by using the normal Git revert/redeployment procedure.

No database rollback, migration repair, Supabase Function rollback or secret rollback is required.

## Commit title
`M3.2: places contract adapter foundation`
