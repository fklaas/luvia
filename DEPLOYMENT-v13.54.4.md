# Deployment v13.54.4 / Core 4.54.4

1. Deploy the complete v13.54.4 web app.
2. Run `supabase/migrations/20260808215500_core_v4_54_4_atomic_status_signal_retry_fix.sql` in the production Supabase SQL editor.
3. Redeploy the gateway:
   `supabase functions deploy luvia-gateway --no-verify-jwt`

No new secrets are required. Provider Edge Functions do not need redeployment for this database-only retry patch.
