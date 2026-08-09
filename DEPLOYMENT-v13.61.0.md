# Deployment v13.61.0 / Core 4.61.0

1. Deploy the complete web package.
2. Run migration:
   `supabase/migrations/20260809090200_core_v4_61_0_provider_availability_runtime_v1.sql`
3. Deploy Edge Function with JWT verification ON:
   `supabase functions deploy booking-provider-availability`
4. Deploy gateway:
   `supabase functions deploy luvia-gateway --no-verify-jwt`

No new secrets are required. Existing provider activation/credential gates remain unchanged.
