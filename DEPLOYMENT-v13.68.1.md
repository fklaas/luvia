# Deployment v13.68.1 / Core 4.68.1

1. Deploy the complete frontend ZIP.
2. Run migration:
   `supabase/migrations/20260809185500_core_v4_68_1_email_recipient_validation_readiness_guard_fix.sql`
3. Redeploy:
   `supabase functions deploy booking-email-runtime`
   `supabase functions deploy booking-email-send`
4. JWT verification stays ON for both functions.
5. No new secrets are required.
6. `booking-email-inbound` does not need redeployment for this patch.

After deployment, first retest Email V2 readiness for the Sphère smoke booking. Do not call `send()` until readiness reports blocked for the asset-like legacy recipient.
