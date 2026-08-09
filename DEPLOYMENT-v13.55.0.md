# Deployment — Luvia v13.56.0 / Core 4.56.0

1. Deploy the complete web app.
2. Run migration `supabase/migrations/20260809044500_core_v4_55_0_provider_return_matrix_booking_discovery_reliability.sql`.
3. Deploy Edge Functions:
   - `supabase functions deploy booking-route-resolve`
   - `supabase functions deploy booking-contact-resolve`
   - `supabase functions deploy luvia-gateway --no-verify-jwt`
4. JWT verification stays ON for `booking-route-resolve` and `booking-contact-resolve`.
5. No new secrets are required.
