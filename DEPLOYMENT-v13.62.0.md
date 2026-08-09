# Deployment v13.62.0

1. Deploy the complete web app.
2. Run `supabase/migrations/20260809094500_core_v4_62_0_reservation_creation_runtime_v1.sql` in the Supabase SQL editor.
3. Deploy `booking-provider-reservation-create` with JWT verification ON.
4. Deploy `luvia-gateway` with JWT verification OFF as currently configured.

No new secrets are required until a provider is actually connected.
