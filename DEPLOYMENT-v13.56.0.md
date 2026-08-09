# Deployment v13.56.0
1. Deploy the complete web app.
2. Run `supabase/migrations/20260809071500_core_v4_56_0_provider_connection_runtime_places_category_reliability.sql`.
3. Deploy `booking-provider-connection-health` with JWT verification ON.
4. Deploy `luvia-gateway --no-verify-jwt` for release health/version consistency.
No new secrets are required.
