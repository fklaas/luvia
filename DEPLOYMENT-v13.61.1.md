# Deployment v13.61.1

1. Deploy the complete web build.
2. Run `supabase/migrations/20260809091500_core_v4_61_1_provider_availability_runtime_release_fix.sql`.
3. Deploy `booking-provider-availability` with JWT verification ON.
4. Deploy `luvia-gateway --no-verify-jwt`.

No new secrets.
