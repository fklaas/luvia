# Deployment — M3.1 / Luvia v13.81.5 / Core 4.81.5

## Change class
Static application/runtime contract only.

## Supabase
- `npx supabase db push`: **DO NOT RUN**
- migrations: **NONE**
- Edge Function deploys: **NONE**
- secrets: **NONE**
- SQL Editor steps: **NONE**

## Cloudflare
After the Git commit/push and local verification, the static Worker can be deployed through the normal repository deployment path. If a manual Worker deployment is required from the repository root, use:

`npx wrangler deploy`

Do not run that command before local Git/staging checks and browser smoke are complete.

## Browser smoke after static deployment
1. Hard refresh / reopen Luvia and confirm build `13.81.5 · Core 4.81.5`.
2. Login still reaches the normal app shell.
3. Existing active trip opens unchanged.
4. Trip selection still changes the active trip.
5. Open browser console and verify:
   - `LuviaTripContractV1?.contractId` → `trip.v1`
   - `LuviaTripContractV1?.version` → `1`
   - `LuviaTripContractV1?.diagnostics?.().ready` → `true`
   - `LuviaGlobalContracts?.probe?.('trip.v1')?.available` → `true`
6. Read-only contract checks:
   - `LuviaTripContractV1.listTrips()` returns the trip list.
   - `LuviaTripContractV1.getContext()` matches the currently active trip.
7. Do **not** create/join/edit a production trip solely for smoke testing. Existing UI behavior is sufficient for mutation-path smoke unless a real product task requires a mutation.
8. Confirm no new console exception appears during login, trip switch and navigation.

## Rollback
Revert the M3.1 commit. The adapter is additive; existing Trip APIs were not replaced. Redeploy the preceding static build if production rollback is required.

## Commit title
`M3.1: add Trip v1 contract adapter foundation`
