# Deployment v13.60.0 / Core 4.60.0

1. Deploy the complete web package.
2. Run migration:
   `supabase/migrations/20260809082800_core_v4_60_0_provider_connection_secrets_readiness_admin_activation_control.sql`
3. Deploy Edge Function with JWT verification ON:
   `supabase functions deploy booking-provider-connection-health`
4. Deploy gateway:
   `supabase functions deploy luvia-gateway --no-verify-jwt`

No new secrets are required for the migration/runtime smoke test. Existing provider credentials remain optional until a real provider connection is activated.
