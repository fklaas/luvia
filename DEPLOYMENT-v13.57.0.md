# Deployment — Luvia v13.57.0 / Core 4.57.0

1. Deploy the complete web application.
2. Run migration:
   supabase/migrations/20260809073000_core_v4_57_0_provider_activation_runtime_email_ownership_guard.sql
3. Deploy Edge Functions (JWT verification ON):
   supabase functions deploy booking-provider-connection-health
   supabase functions deploy booking-contact-resolve
4. Deploy gateway for release consistency:
   supabase functions deploy luvia-gateway --no-verify-jwt

No new secrets are required.
