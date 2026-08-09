# Deployment v13.54.3 / Core 4.54.3

1. Deploy the complete v13.54.3 web app.
2. Run `supabase/migrations/20260808214500_core_v4_54_3_failed_status_signal_recovery_idempotent_retry_fix.sql` in the production Supabase SQL editor.
3. Redeploy the gateway:
   `supabase functions deploy luvia-gateway --no-verify-jwt`

No new secrets are required. Provider Edge Functions do not need redeployment for this database-only recovery patch.
