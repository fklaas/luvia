# Deployment – Luvia v13.59.0 / Core 4.59.0

1. Deploy the complete web app.
2. Run in Supabase SQL Editor:
   `supabase/migrations/20260809080500_core_v4_59_0_provider_activation_orchestrator_expected_state_cleanup.sql`
3. Deploy with JWT Verification ON:
   `supabase functions deploy booking-provider-connection-health`
4. Deploy gateway:
   `supabase functions deploy luvia-gateway --no-verify-jwt`

No new secrets are required for the release smoke test.
