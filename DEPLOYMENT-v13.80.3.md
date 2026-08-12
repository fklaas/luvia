# Deployment v13.80.3

## Required
1. No SQL migration.
2. Redeploy Edge Function: `npx supabase functions deploy booking-email-reply`
3. Deploy complete static app (for example `npx wrangler deploy`).

## Secrets
No new secret is required. The reply function now reuses `BOOKING_EMAIL_FROM`, which is already the canonical sender setting used by `booking-email-send`. Legacy `BOOKING_FROM` remains a fallback.

## Post-deploy
- Confirm `LuviaKernelVersion` = 13.80.3 / 4.80.3.
- Open Control → Inbox → existing conversation.
- Send a harmless reply.
- Expected: `Antwort wird versendet …`, then success; on provider rejection, a readable error containing `RESEND_REPLY_FAILED` and provider details appears.
