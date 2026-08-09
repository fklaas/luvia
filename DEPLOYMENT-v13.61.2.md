# Deployment – Luvia v13.61.2 / Core 4.61.2

1. Deploy the complete web application from this package. This step is mandatory because the fix is browser-shell/service-worker code.
2. Run `supabase/migrations/20260809093000_core_v4_61_2_availability_client_shell_integration_fix.sql` in the Supabase SQL editor.
3. Deploy gateway: `supabase functions deploy luvia-gateway --no-verify-jwt`.
4. No redeploy of `booking-provider-availability` is required; its runtime is unchanged from v13.61.1.
5. No new secrets are required.
6. After deploy, reload Luvia. If an installed PWA still shows the old shell, open `force-update.html` once.
