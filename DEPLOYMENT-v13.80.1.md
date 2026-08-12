# DEPLOYMENT v13.80.1

## If v13.80.0 DB + Function were already deployed
No additional SQL and no additional Edge Function deployment is required. Deploy only the static app.

```bash
npx wrangler deploy
```

## If v13.80.0 backend was NOT deployed yet
First execute `supabase/migrations/20260812104500_core_v4_80_0_booking_actions_intelligence.sql` in the Supabase SQL Editor, then:

```bash
npx supabase functions deploy booking-email-reply
```

Then deploy the static app.

## Post-deploy
Expected kernel: App 13.80.1 / Core 4.80.1.
Service worker cache: `luvia-shell-v13.80.1`.
