# Deployment v13.81.2

## Deployment matrix
- Database migration: NO new migration
- SQL Editor: NO new SQL for this patch
- Supabase Edge Functions: NO new/redeploy required by v13.81.2
- Secrets: NO changes
- Static app: YES
- Service Worker: `luvia-shell-v13.81.2`

## Prerequisites
v13.81.0 database migration must already be applied. The working `booking-email-reply` function from v13.80.3 must already be deployed.

## Deploy
Replace the repository with the complete v13.81.2 build and deploy through the existing pipeline. For direct Wrangler deployment:

`npx wrangler deploy`

Do not run `npx supabase db push` for this patch.

## Post-deploy checks
1. Close all Luvia tabs and reopen.
2. Verify `LuviaKernelVersion` returns build `13.81.2`, core `4.81.2`.
3. Open Control → Buchungen → a non-terminal booking.
4. Modify/Cancel: a direct state refusal must either fall back to the existing thread or show a human-readable blocker such as missing thread/contact verification.
5. On mobile, open Modify/Cancel and scroll to the bottom. The primary CTA must remain above all global navigation and stay reachable.
6. `LuviaBookingControlCenter.diagnostics()` should report `mutationStateFallback: true` and `mobileActionSafeArea: true`.
