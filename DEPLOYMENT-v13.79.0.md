# Deployment – Luvia v13.79.0 / Core 4.79.0

## 1. Pre-deploy
Confirm the currently deployed baseline is v13.78.0 / Core 4.78.0 and keep the previous full ZIP available for rollback.

## 2. Database
**No migration for this release.**
Do not run a new SQL file and do not run `npx supabase db push` for v13.79.

Existing production objects consumed by the build already exist from earlier Booking Core releases:
- `booking_messages`
- `booking_message_intelligence`
- `booking_email_threads`
- `booking_integration_summary`

## 3. Supabase Edge Functions
**No Edge Function deployment required.**
Do not redeploy booking email/runtime functions solely for this version.

## 4. Secrets / environment
**No new or changed secrets.**
No Resend, Cloudflare or Supabase secret changes are required.

## 5. Static application deployment
Replace the repository/app contents with the complete v13.79 project, then commit and deploy through the existing path.

Recommended commit:
`feat(luvia): add Booking Inbox and Conversations v13.79.0`

If deploying directly with the existing Wrangler configuration, run from the Luvia project root:

```bash
npx wrangler deploy
```

If GitHub -> Cloudflare is automatic, commit and push the complete project and wait for the deployment to finish.

## 6. Service Worker refresh
The cache name is now `luvia-shell-v13.79.0`.
After deploy:
1. Open Luvia.
2. Reload once.
3. If v13.78 remains visible, close every Luvia tab and reopen.
4. Verify `LuviaKernelVersion` before functional testing.

Expected:
- core `4.79.0`
- build `13.79.0`
- name `Booking Inbox & Conversations`

## 7. Functional smoke test
1. Login normally.
2. Open Today, Plan, Trip, Memories and Places once to verify Consumer regression.
3. Open `Control` in the header.
4. Open `Inbox`.
5. Verify the active trip is selected.
6. Verify conversations are listed for bookings of that trip.
7. Select a conversation.
8. Verify inbound/outbound/system messages render in chronological order.
9. For a classified inbound message, verify a Luvia Intelligence card appears.
10. Switch `Alle`, `Ungelesen`, `Aktion nötig`.
11. Switch trip if multiple trips exist.
12. Open Booking Control Center and use `Nachrichten öffnen`.

## 8. Composer test
Type text into the composer and press Send.
Expected in v13.79: Luvia informs you that free replies are activated in v13.80. No fake message may appear in the timeline and no database write should be presented as successful.

## 9. Console checks
Run:
- `LuviaKernelVersion`
- `LuviaBooking.diagnostics()`
- `LuviaBookingInbox.diagnostics()`
- `LuviaProductModuleRegistry.diagnostics()`
- `LuviaProductModuleDiagnostics.run()`

Expected Booking Inbox diagnostics include:
- `mounted: true` while open
- `ownsMessageTruth: false`
- `ownsBookingTruth: false`
- `source: 'booking-core'`
- `providerIndependent: true`
- `composerTransport: 'planned-v13.80'`

## 10. Rollback
If a production-only issue appears:
1. Redeploy the full v13.78.0 ZIP/project.
2. Reload/close tabs to allow the old service worker cache to become active.
3. No DB rollback is needed because v13.79 has no migration.
4. No Function or secret rollback is needed.
